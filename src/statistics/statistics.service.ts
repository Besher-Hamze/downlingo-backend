import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectModel(Progress.name) private progressModel: Model<ProgressDocument>,
    private usersService: UsersService,
  ) {}

  async recordProgress(createProgressDto: CreateProgressDto): Promise<Progress> {
    const existing = await this.progressModel.findOne({
      studentId: createProgressDto.studentId,
      wordId: createProgressDto.wordId,
    });

    if (existing) {
      // Update existing progress
      const wasCompleted = existing.isCompleted;
      existing.accuracy = createProgressDto.accuracy;
      existing.attempts = (existing.attempts || 0) + 1;
      existing.isCompleted = createProgressDto.isCompleted || existing.isCompleted;
      
      // Only add points if:
      // 1. Word was not completed before and now it is (first completion)
      // 2. Or if pointsEarned is explicitly provided and it's a new attempt
      if (createProgressDto.pointsEarned && createProgressDto.pointsEarned > 0) {
        if (!wasCompleted && existing.isCompleted) {
          // First time completing this word - award full points
          existing.pointsEarned = (existing.pointsEarned || 0) + createProgressDto.pointsEarned;
        } else if (!wasCompleted) {
          // Not completed yet, but earned some points - add them
          existing.pointsEarned = (existing.pointsEarned || 0) + createProgressDto.pointsEarned;
        }
        // If already completed, don't add more points (prevent duplicate points)
      }
      
      return existing.save();
    }

    // New progress record - award points if provided
    const progress = new this.progressModel({
      ...createProgressDto,
      attempts: createProgressDto.attempts || 1,
      pointsEarned: createProgressDto.pointsEarned || 0,
    });
    return progress.save();
  }

  async getStudentStatistics(studentId: string) {
    const progress = await this.progressModel
      .find({ studentId })
      .populate('wordId')
      .populate('levelId')
      .exec();

    // Calculate total points - sum all points earned (each word can only contribute once)
    const totalPoints = progress.reduce((sum, p) => {
      const points = p.pointsEarned || 0;
      return sum + points;
    }, 0);
    
    const totalAttempts = progress.reduce((sum, p) => sum + (p.attempts || 0), 0);
    const completedWords = progress.filter((p) => p.isCompleted).length;
    
    // Calculate average accuracy from all attempts
    const averageAccuracy =
      progress.length > 0
        ? progress.reduce((sum, p) => sum + p.accuracy, 0) / progress.length
        : 0;

    // Group by level
    const byLevel = progress.reduce((acc, p) => {
      const levelId = p.levelId.toString();
      if (!acc[levelId]) {
        acc[levelId] = {
          levelId: p.levelId,
          totalWords: 0,
          completedWords: 0,
          averageAccuracy: 0,
          totalPoints: 0,
        };
      }
      acc[levelId].totalWords += 1;
      if (p.isCompleted) acc[levelId].completedWords += 1;
      acc[levelId].totalPoints += p.pointsEarned || 0;
      return acc;
    }, {} as Record<string, any>);

    // Calculate average accuracy per level
    Object.keys(byLevel).forEach((levelId) => {
      const levelProgress = progress.filter((p) => p.levelId.toString() === levelId);
      byLevel[levelId].averageAccuracy =
        levelProgress.length > 0
          ? levelProgress.reduce((sum, p) => sum + p.accuracy, 0) / levelProgress.length
          : 0;
    });

    return {
      totalPoints,
      totalAttempts,
      completedWords,
      totalWords: progress.length,
      averageAccuracy,
      byLevel: Object.values(byLevel),
      recentProgress: progress.slice(-10).reverse(),
      engagement: await this.usersService.getEngagement(studentId),
    };
  }

  async getStudentProgressByLevel(studentId: string, levelId: string) {
    return this.progressModel
      .find({ studentId, levelId })
      .populate('wordId')
      .exec();
  }

  async getFamilyStatistics(familyId: string, studentId?: string) {
    // If specific student, return their stats
    if (studentId) {
      return this.getStudentStatistics(studentId);
    }

    // Get all students linked to this family
    const students = await this.usersService.getStudentsForFamily(familyId);
    
    if (students.length === 0) {
      return {
        totalPoints: 0,
        totalAttempts: 0,
        completedWords: 0,
        totalWords: 0,
        averageAccuracy: 0,
        students: [],
        byLevel: [],
      };
    }

    // Get statistics for all students
    const studentStats = await Promise.all(
      students.map(async (student: any) => {
        const studentId = (student._id || student.id).toString();
        const stats = await this.getStudentStatistics(studentId);
        return {
          student: {
            id: student._id || student.id,
            name: student.name,
            email: student.email,
          },
          ...stats,
        };
      })
    );

    // Aggregate totals across all students
    const totalPoints = studentStats.reduce((sum, s) => sum + s.totalPoints, 0);
    const totalAttempts = studentStats.reduce((sum, s) => sum + s.totalAttempts, 0);
    const completedWords = studentStats.reduce((sum, s) => sum + s.completedWords, 0);
    const totalWords = studentStats.reduce((sum, s) => sum + s.totalWords, 0);
    const avgAccuracy = studentStats.length > 0
      ? studentStats.reduce((sum, s) => sum + s.averageAccuracy, 0) / studentStats.length
      : 0;

    return {
      totalPoints,
      totalAttempts,
      completedWords,
      totalWords,
      averageAccuracy: avgAccuracy,
      students: studentStats,
      byLevel: [], // Could aggregate by level if needed
    };
  }

  /// Get all word history for a student (for family view)
  async getStudentWordHistory(studentId: string) {
    const progress = await this.progressModel
      .find({ studentId })
      .populate('wordId')
      .populate('levelId')
      .sort({ createdAt: -1 }) // Most recent first
      .exec();

    // Format the history with word details
    return progress.map((p: any) => ({
      id: p._id,
      word: p.wordId,
      level: p.levelId,
      accuracy: p.accuracy,
      pointsEarned: p.pointsEarned || 0,
      attempts: p.attempts || 0,
      isCompleted: p.isCompleted,
      createdAt: p.createdAt || p.updatedAt,
      updatedAt: p.updatedAt || p.createdAt,
    }));
  }

  /// Get word history for all students linked to a family
  async getFamilyWordHistory(familyId: string) {
    // Get all students linked to this family
    const students = await this.usersService.getStudentsForFamily(familyId);
    
    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map((s: any) => (s._id || s.id).toString());

    const progress = await this.progressModel
      .find({ studentId: { $in: studentIds } })
      .populate('wordId')
      .populate('levelId')
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 }) // Most recent first
      .exec();

    // Format the history with student and word details
    return progress.map((p: any) => {
      const student = typeof p.studentId === 'object' && p.studentId !== null
        ? p.studentId
        : { _id: p.studentId, name: 'Unknown', email: '' };
      
      return {
        id: p._id,
        student: {
          id: student._id || student,
          name: student.name || 'Unknown',
          email: student.email || '',
        },
        word: p.wordId,
        level: p.levelId,
        accuracy: p.accuracy,
        pointsEarned: p.pointsEarned || 0,
        attempts: p.attempts || 0,
        isCompleted: p.isCompleted,
        createdAt: p.createdAt || p.updatedAt,
        updatedAt: p.updatedAt || p.createdAt,
      };
    });
  }
}


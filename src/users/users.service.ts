import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({ email: createUserDto.email });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
    });

    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).select('-password').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }

  async getStudentsForFamily(familyId: string): Promise<User[]> {
    // Find all students that have this family as their linkedFamilyId
    return this.userModel.find({ linkedFamilyId: familyId, role: 'student' }).select('-password').exec();
  }

  async updateEngagementOnPractice(
    studentId: string,
    missingPhonemes?: string[],
  ) {
    const user = await this.userModel.findById(studentId);
    if (!user) return null;

    const today = this.startOfDay(new Date());
    const lastPractice = user.lastPracticeDate
      ? this.startOfDay(new Date(user.lastPracticeDate))
      : null;

    let currentStreak = user.currentStreak || 0;
    let todayWords = user.todayWordsPracticed || 0;
    let streakIncreased = false;

    if (!lastPractice) {
      currentStreak = 1;
      todayWords = 1;
      streakIncreased = true;
    } else if (lastPractice.getTime() === today.getTime()) {
      todayWords += 1;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastPractice.getTime() === yesterday.getTime()) {
        currentStreak += 1;
        streakIncreased = true;
      } else {
        currentStreak = 1;
        streakIncreased = true;
      }
      todayWords = 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, currentStreak);

    const weakPhonemesObj: Record<string, number> = {};
    if (user.weakPhonemes) {
      for (const [key, value] of user.weakPhonemes.entries()) {
        weakPhonemesObj[key] = value;
      }
    }

    if (missingPhonemes?.length) {
      for (const phoneme of missingPhonemes) {
        if (phoneme) {
          weakPhonemesObj[phoneme] = (weakPhonemesObj[phoneme] || 0) + 1;
        }
      }
    }

    user.currentStreak = currentStreak;
    user.longestStreak = longestStreak;
    user.lastPracticeDate = new Date();
    user.todayWordsPracticed = todayWords;
    user.weakPhonemes = weakPhonemesObj as any;
    await user.save();

    return this.buildEngagementResponse(user, streakIncreased);
  }

  async getEngagement(studentId: string) {
    const user = await this.userModel.findById(studentId).select('-password').exec();
    if (!user) return null;

    const today = this.startOfDay(new Date());
    const lastPractice = user.lastPracticeDate
      ? this.startOfDay(new Date(user.lastPracticeDate))
      : null;

    let todayWords = user.todayWordsPracticed || 0;
    let currentStreak = user.currentStreak || 0;

    // Reset today's count if last practice was on a previous day
    if (lastPractice && lastPractice.getTime() !== today.getTime()) {
      todayWords = 0;
    }

    // Break streak display if more than 1 day gap
    if (lastPractice) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (
        lastPractice.getTime() !== today.getTime() &&
        lastPractice.getTime() !== yesterday.getTime()
      ) {
        currentStreak = 0;
      }
    }

    return this.buildEngagementResponse(user, false, todayWords, currentStreak);
  }

  private buildEngagementResponse(
    user: UserDocument,
    streakIncreased: boolean,
    todayWordsOverride?: number,
    currentStreakOverride?: number,
  ) {
    const weakPhonemesObj: Record<string, number> = {};
    if (user.weakPhonemes) {
      for (const [key, value] of user.weakPhonemes.entries()) {
        weakPhonemesObj[key] = value;
      }
    }

    const topWeakPhonemes = Object.entries(weakPhonemesObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([phoneme, count]) => ({ phoneme, count }));

    return {
      currentStreak: currentStreakOverride ?? user.currentStreak ?? 0,
      longestStreak: user.longestStreak ?? 0,
      todayWordsPracticed: todayWordsOverride ?? user.todayWordsPracticed ?? 0,
      dailyGoal: user.dailyGoal ?? 5,
      weakPhonemes: topWeakPhonemes,
      streakIncreased,
      dailyGoalReached:
        (todayWordsOverride ?? user.todayWordsPracticed ?? 0) >=
        (user.dailyGoal ?? 5),
    };
  }

  private startOfDay(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  async updateCognitiveWeakness(
    studentId: string,
    category: string,
    accuracy: number,
    wrongAnswers?: string[],
  ) {
    const user = await this.userModel.findById(studentId);
    if (!user || !category) return;

    const weaknessesObj: Record<string, number> = {};
    if (user.cognitiveWeaknesses) {
      for (const [key, value] of user.cognitiveWeaknesses.entries()) {
        weaknessesObj[key] = value;
      }
    }

    // Low accuracy increases weakness score
    if (accuracy < 0.7) {
      const penalty = accuracy < 0.4 ? 2 : 1;
      weaknessesObj[category] = (weaknessesObj[category] || 0) + penalty;
    } else if (accuracy >= 0.85) {
      // Good performance slightly reduces weakness
      if (weaknessesObj[category] > 0) {
        weaknessesObj[category] = Math.max(0, weaknessesObj[category] - 1);
      }
    }

    user.cognitiveWeaknesses = weaknessesObj as any;
    await user.save();
  }

  async getCognitiveProfile(studentId: string) {
    const user = await this.userModel.findById(studentId).select('-password').exec();
    if (!user) return null;

    const weaknessesObj: Record<string, number> = {};
    if (user.cognitiveWeaknesses) {
      for (const [key, value] of user.cognitiveWeaknesses.entries()) {
        weaknessesObj[key] = value;
      }
    }

    const weakPhonemesObj: Record<string, number> = {};
    if (user.weakPhonemes) {
      for (const [key, value] of user.weakPhonemes.entries()) {
        weakPhonemesObj[key] = value;
      }
    }

    const categories = ['memory', 'comprehension', 'visual', 'pronunciation'];
    const profile = categories.map((cat) => ({
      category: cat,
      score: weaknessesObj[cat] || 0,
      level: this.getWeaknessLevel(weaknessesObj[cat] || 0),
    }));

    const sorted = [...profile].sort((a, b) => b.score - a.score);
    const primaryWeakness = sorted.find((p) => p.score > 0)?.category || null;

    return {
      profile,
      primaryWeakness,
      weakPhonemes: Object.entries(weakPhonemesObj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([phoneme, count]) => ({ phoneme, count })),
      recommendations: this.buildRecommendations(sorted, weakPhonemesObj),
    };
  }

  private getWeaknessLevel(score: number): string {
    if (score === 0) return 'strong';
    if (score <= 2) return 'mild';
    if (score <= 5) return 'moderate';
    return 'needs_focus';
  }

  private buildRecommendations(
    profile: { category: string; score: number; level: string }[],
    weakPhonemes: Record<string, number>,
  ): string[] {
    const recs: string[] = [];
    const top = profile.filter((p) => p.score > 0).slice(0, 2);

    for (const item of top) {
      switch (item.category) {
        case 'memory':
          recs.push('Practice short stories and repeat key words');
          break;
        case 'comprehension':
          recs.push('Read stories together and ask simple questions');
          break;
        case 'visual':
          recs.push('Play shapes and colors matching games daily');
          break;
        case 'pronunciation':
          recs.push('Focus on speech exercises with slow repetition');
          break;
      }
    }

    const topPhoneme = Object.entries(weakPhonemes).sort((a, b) => b[1] - a[1])[0];
    if (topPhoneme) {
      recs.push(`Practice sounds: /${topPhoneme[0]}/`);
    }

    if (recs.length === 0) {
      recs.push('Great progress! Keep practicing a little every day');
    }

    return recs.slice(0, 3);
  }
}


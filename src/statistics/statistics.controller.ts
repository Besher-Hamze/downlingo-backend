import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { UsersService } from '../users/users.service';

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(
    private readonly statisticsService: StatisticsService,
    private readonly usersService: UsersService,
  ) {}

  @Post('progress')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  async recordProgress(@Body() createProgressDto: CreateProgressDto, @CurrentUser() user: any) {
    // Ensure student can only record their own progress
    const studentId = user.userId || createProgressDto.studentId;
    
    // Validate that pointsEarned is a positive number if provided
    if (createProgressDto.pointsEarned !== undefined && createProgressDto.pointsEarned < 0) {
      createProgressDto.pointsEarned = 0;
    }
    
    const progress = await this.statisticsService.recordProgress({
      ...createProgressDto,
      studentId,
    });
    
    return {
      ...(progress as any).toObject ? (progress as any).toObject() : progress,
      message: 'Progress recorded successfully',
    };
  }

  @Get('student/:studentId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.FAMILY)
  getStudentStatistics(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    // Students can only see their own stats
    // Family members can see their linked student's stats
    if (user.role === UserRole.STUDENT && user.userId !== studentId) {
      throw new Error('Unauthorized: You can only view your own statistics');
    }
    return this.statisticsService.getStudentStatistics(studentId);
  }

  @Get('student/:studentId/level/:levelId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.FAMILY)
  getStudentProgressByLevel(
    @Param('studentId') studentId: string,
    @Param('levelId') levelId: string,
    @CurrentUser() user: any,
  ) {
    if (user.role === UserRole.STUDENT && user.userId !== studentId) {
      throw new Error('Unauthorized: You can only view your own progress');
    }
    return this.statisticsService.getStudentProgressByLevel(studentId, levelId);
  }

  @Get('family')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  async getFamilyStatistics(@CurrentUser() user: any, @Query('studentId') studentId?: string) {
    return this.statisticsService.getFamilyStatistics(user.userId, studentId);
  }

  @Get('family/word-history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  async getFamilyWordHistory(@CurrentUser() user: any) {
    return this.statisticsService.getFamilyWordHistory(user.userId);
  }

  @Get('student/:studentId/word-history')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT, UserRole.FAMILY)
  async getStudentWordHistory(@Param('studentId') studentId: string, @CurrentUser() user: any) {
    // Students can only see their own history
    // Family members can see their linked student's history
    if (user.role === UserRole.STUDENT && user.userId !== studentId) {
      throw new Error('Unauthorized: You can only view your own word history');
    }
    
    // Verify family can access this student
    if (user.role === UserRole.FAMILY) {
      const students = await this.usersService.getStudentsForFamily(user.userId);
      const hasAccess = students.some((s: any) => (s._id || s.id)?.toString() === studentId);
      if (!hasAccess) {
        throw new Error('Unauthorized: You can only view your linked student\'s word history');
      }
    }
    
    return this.statisticsService.getStudentWordHistory(studentId);
  }

  @Get('my-stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.STUDENT)
  getMyStatistics(@CurrentUser() user: any) {
    return this.statisticsService.getStudentStatistics(user.userId);
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Activity, ActivityDocument } from './schemas/activity.schema';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
  ) {}

  async create(createActivityDto: CreateActivityDto): Promise<Activity> {
    const activity = new this.activityModel(createActivityDto);
    return activity.save();
  }

  async findAll(filters?: {
    type?: string;
    levelId?: string;
    language?: string;
  }): Promise<Activity[]> {
    const query: Record<string, unknown> = { isActive: true };
    if (filters?.type) query.type = filters.type;
    if (filters?.levelId) query.levelId = filters.levelId;
    if (filters?.language) query.language = filters.language;

    return this.activityModel
      .find(query)
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<Activity[]> {
    return this.activityModel.find().sort({ order: 1, createdAt: 1 }).exec();
  }

  async findOne(id: string): Promise<Activity> {
    const activity = await this.activityModel.findById(id).exec();
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.activityModel
      .findByIdAndUpdate(id, updateActivityDto, { new: true })
      .exec();
    if (!activity) throw new NotFoundException('Activity not found');
    return activity;
  }

  async remove(id: string): Promise<void> {
    const result = await this.activityModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Activity not found');
  }
}

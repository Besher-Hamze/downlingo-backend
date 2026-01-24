import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Level, LevelDocument } from './schemas/level.schema';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Injectable()
export class LevelsService {
  constructor(
    @InjectModel(Level.name) private levelModel: Model<LevelDocument>,
  ) {}

  async create(createLevelDto: CreateLevelDto): Promise<Level> {
    const level = new this.levelModel(createLevelDto);
    return level.save();
  }

  async findAll(language?: string): Promise<Level[]> {
    const query = language ? { language, isActive: true } : { isActive: true };
    return this.levelModel.find(query).sort({ levelNumber: 1 }).exec();
  }

  async findOne(id: string): Promise<Level> {
    const level = await this.levelModel.findById(id).exec();
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async findByLanguage(language: string): Promise<Level[]> {
    return this.levelModel.find({ language, isActive: true }).sort({ levelNumber: 1 }).exec();
  }

  async update(id: string, updateLevelDto: UpdateLevelDto): Promise<Level> {
    const level = await this.levelModel.findByIdAndUpdate(id, updateLevelDto, { new: true }).exec();
    if (!level) {
      throw new NotFoundException('Level not found');
    }
    return level;
  }

  async remove(id: string): Promise<void> {
    const result = await this.levelModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Level not found');
    }
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Word, WordDocument } from './schemas/word.schema';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';

@Injectable()
export class WordsService {
  constructor(
    @InjectModel(Word.name) private wordModel: Model<WordDocument>,
  ) {}

  async create(createWordDto: CreateWordDto): Promise<Word> {
    const word = new this.wordModel(createWordDto);
    return word.save();
  }

  async findAll(levelId?: string): Promise<Word[]> {
    const query = levelId ? { levelId, isActive: true } : { isActive: true };
    return this.wordModel.find(query).populate('levelId').exec();
  }

  async findOne(id: string): Promise<Word> {
    const word = await this.wordModel.findById(id).populate('levelId').exec();
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async findByLevel(levelId: string): Promise<Word[]> {
    return this.wordModel.find({ levelId, isActive: true }).exec();
  }

  async update(id: string, updateWordDto: UpdateWordDto): Promise<Word> {
    const word = await this.wordModel.findByIdAndUpdate(id, updateWordDto, { new: true }).exec();
    if (!word) {
      throw new NotFoundException('Word not found');
    }
    return word;
  }

  async remove(id: string): Promise<void> {
    const result = await this.wordModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Word not found');
    }
  }
}


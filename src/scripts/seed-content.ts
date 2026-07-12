import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { LevelsService } from '../levels/levels.service';
import { WordsService } from '../words/words.service';
import { ActivitiesService } from '../activities/activities.service';
import { UsersService } from '../users/users.service';
import { Level, LevelType } from '../levels/schemas/level.schema';
import { Word } from '../words/schemas/word.schema';
import { Activity } from '../activities/schemas/activity.schema';
import {
  ActivityType,
  CognitiveCategory,
} from '../activities/schemas/activity.schema';
import { UserRole } from '../users/schemas/user.schema';

async function seedContent() {
  console.log('🌱 Starting content seeding for Downlingo...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const levelsService = app.get(LevelsService);
  const wordsService = app.get(WordsService);
  const activitiesService = app.get(ActivitiesService);
  const usersService = app.get(UsersService);

  const levelModel = app.get<Model<Level>>(getModelToken(Level.name));
  const wordModel = app.get<Model<Word>>(getModelToken(Word.name));
  const activityModel = app.get<Model<Activity>>(getModelToken(Activity.name));

  const shouldReset = process.env.SEED_RESET !== 'false';
  if (shouldReset) {
    console.log('🗑️  Clearing existing content...');
    await activityModel.deleteMany({});
    await wordModel.deleteMany({});
    await levelModel.deleteMany({});
  }

  try {
    const levels: Record<string, string> = {};

    const levelData = [
      // English levels
      { key: 'en-speech-1', name: 'First Words', description: 'Say simple everyday words', levelNumber: 1, requiredPoints: 0, icon: '🗣️', color: '#9C27B0', language: 'english', levelType: LevelType.SPEECH },
      { key: 'en-story-1', name: 'Fun Stories', description: 'Read stories and answer by speaking', levelNumber: 2, requiredPoints: 25, icon: '📖', color: '#FF4081', language: 'english', levelType: LevelType.STORY },
      { key: 'en-shapes-1', name: 'Shapes World', description: 'Find the right shape', levelNumber: 3, requiredPoints: 50, icon: '🔷', color: '#00BCD4', language: 'english', levelType: LevelType.SHAPES },
      { key: 'en-colors-1', name: 'Colors Fun', description: 'Pick the right color', levelNumber: 4, requiredPoints: 75, icon: '🎨', color: '#FF9800', language: 'english', levelType: LevelType.COLORS },
      { key: 'en-speech-2', name: 'More Words', description: 'Practice more words', levelNumber: 5, requiredPoints: 100, icon: '🗣️', color: '#7B1FA2', language: 'english', levelType: LevelType.SPEECH },
      // Arabic levels
      { key: 'ar-speech-1', name: 'كلمات أولى', description: 'كلمات يومية بسيطة', levelNumber: 1, requiredPoints: 0, icon: '🗣️', color: '#9C27B0', language: 'arabic', levelType: LevelType.SPEECH },
      { key: 'ar-story-1', name: 'قصص جميلة', description: 'اقرأ القصة وأجب بالنطق', levelNumber: 2, requiredPoints: 25, icon: '📖', color: '#FF4081', language: 'arabic', levelType: LevelType.STORY },
      { key: 'ar-shapes-1', name: 'عالم الأشكال', description: 'اختر الشكل الصحيح', levelNumber: 3, requiredPoints: 50, icon: '🔷', color: '#00BCD4', language: 'arabic', levelType: LevelType.SHAPES },
      { key: 'ar-colors-1', name: 'ألوان مرحة', description: 'اختر اللون الصحيح', levelNumber: 4, requiredPoints: 75, icon: '🎨', color: '#FF9800', language: 'arabic', levelType: LevelType.COLORS },
      { key: 'ar-speech-2', name: 'كلمات أكثر', description: 'تمرين كلمات إضافية', levelNumber: 5, requiredPoints: 100, icon: '🗣️', color: '#7B1FA2', language: 'arabic', levelType: LevelType.SPEECH },
    ];

    console.log('📚 Creating levels...');
    for (const lvl of levelData) {
      const created = await levelsService.create(lvl as any);
      levels[lvl.key] = (created as any)._id.toString();
      console.log(`  ✅ ${lvl.name} (${lvl.levelType})`);
    }

    // ─── WORDS ───────────────────────────────────────────────
    console.log('📝 Creating words...');
    const words = [
      { word: 'Mom', arabic: 'ماما', icon: '👩', levelId: levels['en-speech-1'] },
      { word: 'Dad', arabic: 'بابا', icon: '👨', levelId: levels['en-speech-1'] },
      { word: 'Cat', arabic: 'قطة', icon: '🐱', levelId: levels['en-speech-1'] },
      { word: 'Dog', arabic: 'كلب', icon: '🐶', levelId: levels['en-speech-1'] },
      { word: 'Ball', arabic: 'كرة', icon: '⚽', levelId: levels['en-speech-1'] },
      { word: 'Sun', arabic: 'شمس', icon: '☀️', levelId: levels['en-speech-1'] },
      { word: 'Apple', arabic: 'تفاحة', icon: '🍎', levelId: levels['en-speech-2'] },
      { word: 'Water', arabic: 'ماء', icon: '💧', levelId: levels['en-speech-2'] },
      { word: 'Book', arabic: 'كتاب', icon: '📚', levelId: levels['en-speech-2'] },
      { word: 'Happy', arabic: 'سعيد', icon: '😊', levelId: levels['en-speech-2'] },
      { word: 'ماما', arabic: 'ماما', icon: '👩', levelId: levels['ar-speech-1'] },
      { word: 'بابا', arabic: 'بابا', icon: '👨', levelId: levels['ar-speech-1'] },
      { word: 'قطة', arabic: 'قطة', icon: '🐱', levelId: levels['ar-speech-1'] },
      { word: 'كلب', arabic: 'كلب', icon: '🐶', levelId: levels['ar-speech-1'] },
      { word: 'كرة', arabic: 'كرة', icon: '⚽', levelId: levels['ar-speech-1'] },
      { word: 'شمس', arabic: 'شمس', icon: '☀️', levelId: levels['ar-speech-1'] },
      { word: 'تفاحة', arabic: 'تفاحة', icon: '🍎', levelId: levels['ar-speech-2'] },
      { word: 'ماء', arabic: 'ماء', icon: '💧', levelId: levels['ar-speech-2'] },
      { word: 'كتاب', arabic: 'كتاب', icon: '📚', levelId: levels['ar-speech-2'] },
      { word: 'وردة', arabic: 'وردة', icon: '🌹', levelId: levels['ar-speech-2'] },
    ];
    for (const w of words) {
      await wordsService.create(w as any);
    }

    const stories = [
      {
        levelId: levels['en-story-1'], language: 'english', order: 1,
        title: 'The Happy Cat', titleAr: 'القطة السعيدة',
        pages: ['Once there was a happy cat. 🐱', 'The cat loved to play with a red ball. 🔴', 'They had fun every day! 🌟'],
        pagesAr: ['كانت هناك قطة سعيدة. 🐱', 'أحبت اللعب بكرة حمراء. 🔴', 'يمرحان كل يوم! 🌟'],
        questions: [
          { prompt: 'What animal is in the story?', promptAr: 'ما الحيوان؟', options: ['Cat', 'Dog', 'Bird'], optionsAr: ['قطة', 'كلب', 'طائر'], correctIndex: 0 },
          { prompt: 'What did the cat play with?', promptAr: 'ماذا لعبت؟', options: ['Ball', 'Book', 'Hat'], optionsAr: ['كرة', 'كتاب', 'قبعة'], correctIndex: 0 },
          { prompt: 'What color was the ball?', promptAr: 'ما لون الكرة؟', options: ['Red', 'Blue', 'Green'], optionsAr: ['أحمر', 'أزرق', 'أخضر'], correctIndex: 0 },
        ],
      },
      {
        levelId: levels['en-story-1'], language: 'english', order: 2,
        title: 'Sunny Day', titleAr: 'يوم مشمس',
        pages: ['Today is sunny! ☀️', 'A boy goes to the park. 🌳', 'He sees a big yellow sun. 🌞'],
        pagesAr: ['اليوم مشمس! ☀️', 'ذهب ولد إلى الحديقة. 🌳', 'رأى شمساً صفراء. 🌞'],
        questions: [
          { prompt: 'Where did the boy go?', promptAr: 'أين ذهب؟', options: ['Park', 'School', 'Shop'], optionsAr: ['الحديقة', 'المدرسة', 'المتجر'], correctIndex: 0 },
          { prompt: 'How is the weather?', promptAr: 'كيف الطقس؟', options: ['Sunny', 'Rainy', 'Cold'], optionsAr: ['مشمس', 'ممطر', 'بارد'], correctIndex: 0 },
        ],
      },
      {
        levelId: levels['ar-story-1'], language: 'arabic', order: 1,
        title: 'الأرنب الصغير', titleAr: 'الأرنب الصغير',
        pages: ['كان هناك أرنب صغير. 🐰', 'يحب الجزر البرتقالي. 🥕', 'يأكل ويلعب في الحديقة. 🌳'],
        pagesAr: ['كان هناك أرنب صغير. 🐰', 'يحب الجزر البرتقالي. 🥕', 'يأكل ويلعب في الحديقة. 🌳'],
        questions: [
          { prompt: 'ما الحيوان؟', promptAr: 'ما الحيوان؟', options: ['أرنب', 'قطة', 'كلب'], optionsAr: ['أرنب', 'قطة', 'كلب'], correctIndex: 0 },
          { prompt: 'ماذا يأكل؟', promptAr: 'ماذا يأكل؟', options: ['جزر', 'تفاح', 'خبز'], optionsAr: ['جزر', 'تفاح', 'خبز'], correctIndex: 0 },
        ],
      },
      {
        levelId: levels['ar-story-1'], language: 'arabic', order: 2,
        title: 'البنت والزهرة', titleAr: 'البنت والزهرة',
        pages: ['فتاة صغيرة جميلة. 👧', 'وجدت زهرة حمراء. 🌹', 'هي سعيدة جداً! 😊'],
        pagesAr: ['فتاة صغيرة جميلة. 👧', 'وجدت زهرة حمراء. 🌹', 'هي سعيدة جداً! 😊'],
        questions: [
          { prompt: 'ما لون الزهرة؟', promptAr: 'ما لون الزهرة؟', options: ['أحمر', 'أزرق', 'أصفر'], optionsAr: ['أحمر', 'أزرق', 'أصفر'], correctIndex: 0 },
          { prompt: 'كيف تشعر الفتاة؟', promptAr: 'كيف تشعر؟', options: ['سعيدة', 'حزينة', 'غاضبة'], optionsAr: ['سعيدة', 'حزينة', 'غاضبة'], correctIndex: 0 },
        ],
      },
    ];

    console.log('📖 Creating stories...');
    for (const s of stories) {
      await activitiesService.create({
        type: ActivityType.STORY,
        title: s.title,
        titleAr: s.titleAr,
        levelId: s.levelId,
        language: s.language,
        order: s.order,
        points: 15,
        cognitiveCategory: CognitiveCategory.COMPREHENSION,
        content: { pages: s.pages, pagesAr: s.pagesAr, questions: s.questions },
      } as any);
    }

    const shapeActivities = [
      { key: 'en-shapes-1', items: [
        { title: 'Find Circle', titleAr: 'أين الدائرة؟', prompt: 'Tap the circle!', promptAr: 'اضغط الدائرة!', correct: 'circle', options: ['circle', 'square', 'triangle'], icons: ['⭕', '⬜', '🔺'], labels: ['Circle', 'Square', 'Triangle'], labelsAr: ['دائرة', 'مربع', 'مثلث'] },
        { title: 'Find Square', titleAr: 'أين المربع؟', prompt: 'Tap the square!', promptAr: 'اضغط المربع!', correct: 'square', options: ['star', 'square', 'heart'], icons: ['⭐', '⬜', '❤️'], labels: ['Star', 'Square', 'Heart'], labelsAr: ['نجمة', 'مربع', 'قلب'] },
        { title: 'Find Star', titleAr: 'أين النجمة؟', prompt: 'Tap the star!', promptAr: 'اضغط النجمة!', correct: 'star', options: ['triangle', 'circle', 'star'], icons: ['🔺', '⭕', '⭐'], labels: ['Triangle', 'Circle', 'Star'], labelsAr: ['مثلث', 'دائرة', 'نجمة'] },
        { title: 'Find Heart', titleAr: 'أين القلب؟', prompt: 'Tap the heart!', promptAr: 'اضغط القلب!', correct: 'heart', options: ['heart', 'square', 'circle'], icons: ['❤️', '⬜', '⭕'], labels: ['Heart', 'Square', 'Circle'], labelsAr: ['قلب', 'مربع', 'دائرة'] },
      ]},
      { key: 'ar-shapes-1', lang: 'arabic', items: [
        { title: 'الدائرة', titleAr: 'أين الدائرة؟', prompt: 'اختر الدائرة', promptAr: 'اختر الدائرة', correct: 'circle', options: ['circle', 'square', 'triangle'], icons: ['⭕', '⬜', '🔺'], labels: ['دائرة', 'مربع', 'مثلث'], labelsAr: ['دائرة', 'مربع', 'مثلث'] },
        { title: 'المربع', titleAr: 'أين المربع؟', prompt: 'اختر المربع', promptAr: 'اختر المربع', correct: 'square', options: ['star', 'square', 'heart'], icons: ['⭐', '⬜', '❤️'], labels: ['نجمة', 'مربع', 'قلب'], labelsAr: ['نجمة', 'مربع', 'قلب'] },
        { title: 'المثلث', titleAr: 'أين المثلث؟', prompt: 'اختر المثلث', promptAr: 'اختر المثلث', correct: 'triangle', options: ['triangle', 'circle', 'star'], icons: ['🔺', '⭕', '⭐'], labels: ['مثلث', 'دائرة', 'نجمة'], labelsAr: ['مثلث', 'دائرة', 'نجمة'] },
        { title: 'القلب', titleAr: 'أين القلب؟', prompt: 'اختر القلب', promptAr: 'اختر القلب', correct: 'heart', options: ['heart', 'square', 'circle'], icons: ['❤️', '⬜', '⭕'], labels: ['قلب', 'مربع', 'دائرة'], labelsAr: ['قلب', 'مربع', 'دائرة'] },
      ]},
    ];

    const colorActivities = [
      { key: 'en-colors-1', items: [
        { title: 'Find Red', titleAr: 'أين الأحمر؟', prompt: 'Tap RED!', promptAr: 'اضغط الأحمر!', correct: 'red', options: ['red', 'blue', 'yellow'], icons: ['#F44336', '#2196F3', '#FFEB3B'], labels: ['Red', 'Blue', 'Yellow'], labelsAr: ['أحمر', 'أزرق', 'أصفر'] },
        { title: 'Find Blue', titleAr: 'أين الأزرق؟', prompt: 'Tap BLUE!', promptAr: 'اضغط الأزرق!', correct: 'blue', options: ['green', 'blue', 'orange'], icons: ['#4CAF50', '#2196F3', '#FF9800'], labels: ['Green', 'Blue', 'Orange'], labelsAr: ['أخضر', 'أزرق', 'برتقالي'] },
        { title: 'Find Green', titleAr: 'أين الأخضر؟', prompt: 'Tap GREEN!', promptAr: 'اضغط الأخضر!', correct: 'green', options: ['purple', 'green', 'pink'], icons: ['#9C27B0', '#4CAF50', '#E91E63'], labels: ['Purple', 'Green', 'Pink'], labelsAr: ['بنفسجي', 'أخضر', 'وردي'] },
        { title: 'Find Yellow', titleAr: 'أين الأصفر؟', prompt: 'Tap YELLOW!', promptAr: 'اضغط الأصفر!', correct: 'yellow', options: ['yellow', 'red', 'blue'], icons: ['#FFEB3B', '#F44336', '#2196F3'], labels: ['Yellow', 'Red', 'Blue'], labelsAr: ['أصفر', 'أحمر', 'أزرق'] },
      ]},
      { key: 'ar-colors-1', lang: 'arabic', items: [
        { title: 'الأحمر', titleAr: 'اختر الأحمر', prompt: 'اختر اللون الأحمر', promptAr: 'اختر اللون الأحمر', correct: 'red', options: ['red', 'blue', 'yellow'], icons: ['#F44336', '#2196F3', '#FFEB3B'], labels: ['أحمر', 'أزرق', 'أصفر'], labelsAr: ['أحمر', 'أزرق', 'أصفر'] },
        { title: 'الأزرق', titleAr: 'اختر الأزرق', prompt: 'اختر اللون الأزرق', promptAr: 'اختر اللون الأزرق', correct: 'blue', options: ['green', 'blue', 'orange'], icons: ['#4CAF50', '#2196F3', '#FF9800'], labels: ['أخضر', 'أزرق', 'برتقالي'], labelsAr: ['أخضر', 'أزرق', 'برتقالي'] },
        { title: 'الأخضر', titleAr: 'اختر الأخضر', prompt: 'اختر اللون الأخضر', promptAr: 'اختر اللون الأخضر', correct: 'green', options: ['purple', 'green', 'pink'], icons: ['#9C27B0', '#4CAF50', '#E91E63'], labels: ['بنفسجي', 'أخضر', 'وردي'], labelsAr: ['بنفسجي', 'أخضر', 'وردي'] },
        { title: 'الأصفر', titleAr: 'اختر الأصفر', prompt: 'اختر اللون الأصفر', promptAr: 'اختر اللون الأصفر', correct: 'yellow', options: ['yellow', 'red', 'blue'], icons: ['#FFEB3B', '#F44336', '#2196F3'], labels: ['أصفر', 'أحمر', 'أزرق'], labelsAr: ['أصفر', 'أحمر', 'أزرق'] },
      ]},
    ];

    console.log('🔷 Creating shapes...');
    for (const group of shapeActivities) {
      let order = 1;
      for (const item of group.items) {
        await activitiesService.create({
          type: ActivityType.SHAPES,
          title: item.title,
          titleAr: item.titleAr,
          levelId: levels[group.key],
          language: (group as any).lang || 'english',
          order: order++,
          points: 10,
          cognitiveCategory: CognitiveCategory.VISUAL,
          content: {
            prompt: item.prompt,
            promptAr: item.promptAr,
            correctAnswer: item.correct,
            options: item.options,
            optionIcons: item.icons,
            optionLabels: item.labels,
            optionLabelsAr: item.labelsAr,
          },
        } as any);
      }
    }

    console.log('🎨 Creating colors...');
    for (const group of colorActivities) {
      let order = 1;
      for (const item of group.items) {
        await activitiesService.create({
          type: ActivityType.COLORS,
          title: item.title,
          titleAr: item.titleAr,
          levelId: levels[group.key],
          language: (group as any).lang || 'english',
          order: order++,
          points: 10,
          cognitiveCategory: CognitiveCategory.VISUAL,
          content: {
            prompt: item.prompt,
            promptAr: item.promptAr,
            correctAnswer: item.correct,
            options: item.options,
            optionIcons: item.icons,
            optionLabels: item.labels,
            optionLabelsAr: item.labelsAr,
          },
        } as any);
      }
    }

    const demoEmail = 'student@downlingo.com';
    if (!(await usersService.findByEmail(demoEmail))) {
      await usersService.create({
        email: demoEmail,
        password: 'student123',
        name: 'Ahmad',
        role: UserRole.STUDENT,
      });
      console.log('👤 Demo: student@downlingo.com / student123');
    }

    console.log('✅ Seed complete! 10 levels, 20 words, 4 stories, 16 shapes/colors activities');
  } catch (error: any) {
    console.error('❌', error.message);
  } finally {
    await app.close();
  }
}

seedContent().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

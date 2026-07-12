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
      { key: 'en-emotions-1', name: 'Feelings Friends', description: 'Learn happy, sad, and more feelings', levelNumber: 6, requiredPoints: 125, icon: '😊', color: '#E91E63', language: 'english', levelType: LevelType.EMOTIONS },
      { key: 'en-hunt-1', name: 'Find & See', description: 'Use camera to find real objects', levelNumber: 7, requiredPoints: 150, icon: '📷', color: '#4CAF50', language: 'english', levelType: LevelType.HUNT },
      // Arabic levels
      { key: 'ar-speech-1', name: 'كلمات أولى', description: 'كلمات يومية بسيطة', levelNumber: 1, requiredPoints: 0, icon: '🗣️', color: '#9C27B0', language: 'arabic', levelType: LevelType.SPEECH },
      { key: 'ar-story-1', name: 'قصص جميلة', description: 'اقرأ القصة وأجب بالنطق', levelNumber: 2, requiredPoints: 25, icon: '📖', color: '#FF4081', language: 'arabic', levelType: LevelType.STORY },
      { key: 'ar-shapes-1', name: 'عالم الأشكال', description: 'اختر الشكل الصحيح', levelNumber: 3, requiredPoints: 50, icon: '🔷', color: '#00BCD4', language: 'arabic', levelType: LevelType.SHAPES },
      { key: 'ar-colors-1', name: 'ألوان مرحة', description: 'اختر اللون الصحيح', levelNumber: 4, requiredPoints: 75, icon: '🎨', color: '#FF9800', language: 'arabic', levelType: LevelType.COLORS },
      { key: 'ar-speech-2', name: 'كلمات أكثر', description: 'تمرين كلمات إضافية', levelNumber: 5, requiredPoints: 100, icon: '🗣️', color: '#7B1FA2', language: 'arabic', levelType: LevelType.SPEECH },
      { key: 'ar-emotions-1', name: 'تعرف على المشاعر', description: 'تعلّم السعيد والحزين والمزيد', levelNumber: 6, requiredPoints: 125, icon: '😊', color: '#E91E63', language: 'arabic', levelType: LevelType.EMOTIONS },
      { key: 'ar-hunt-1', name: 'دور واشوف', description: 'استخدم الكاميرا لتجد أشياء حقيقية', levelNumber: 7, requiredPoints: 150, icon: '📷', color: '#4CAF50', language: 'arabic', levelType: LevelType.HUNT },
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
      { word: 'Sad', arabic: 'حزين', icon: '😢', levelId: levels['en-speech-2'] },
      { word: 'Bird', arabic: 'طائر', icon: '🐦', levelId: levels['en-speech-2'] },
      { word: 'Tree', arabic: 'شجرة', icon: '🌳', levelId: levels['en-speech-2'] },
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
      { word: 'سعيد', arabic: 'سعيد', icon: '😊', levelId: levels['ar-speech-2'] },
      { word: 'حزين', arabic: 'حزين', icon: '😢', levelId: levels['ar-speech-2'] },
      { word: 'طائر', arabic: 'طائر', icon: '🐦', levelId: levels['ar-speech-2'] },
      { word: 'شجرة', arabic: 'شجرة', icon: '🌳', levelId: levels['ar-speech-2'] },
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
        levelId: levels['en-story-1'], language: 'english', order: 3,
        title: 'The Kind Dog', titleAr: 'الكلب الطيب',
        pages: ['A kind dog lives near a park. 🐶', 'He helps a little girl find her ball. ⚽', 'They become best friends! 🤝'],
        pagesAr: ['كلب طيب يعيش قرب الحديقة. 🐶', 'ساعد فتاة صغيرة تجد كرتها. ⚽', 'أصبحا أصدقاء! 🤝'],
        questions: [
          { prompt: 'Who helped the girl?', promptAr: 'من ساعد الفتاة؟', options: ['Dog', 'Cat', 'Bird'], optionsAr: ['كلب', 'قطة', 'طائر'], correctIndex: 0 },
          { prompt: 'What did they find?', promptAr: 'ماذا وجدوا؟', options: ['Ball', 'Book', 'Hat'], optionsAr: ['كرة', 'كتاب', 'قبعة'], correctIndex: 0 },
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
      {
        levelId: levels['ar-story-1'], language: 'arabic', order: 3,
        title: 'الولد والمطر', titleAr: 'الولد والمطر',
        pages: ['بدأ المطر ينزل. 🌧️', 'الولد حزين لأنه لا يستطيع اللعب. 😢', 'جاءت أمه بمظلة ملونة! ☂️', 'أصبح سعيداً جداً! 😊'],
        pagesAr: ['بدأ المطر ينزل. 🌧️', 'الولد حزين لأنه لا يستطيع اللعب. 😢', 'جاءت أمه بمظلة ملونة! ☂️', 'أصبح سعيداً جداً! 😊'],
        questions: [
          { prompt: 'كيف كان الولد في البداية؟', promptAr: 'كيف كان الولد؟', options: ['حزين', 'سعيد', 'غاضب'], optionsAr: ['حزين', 'سعيد', 'غاضب'], correctIndex: 0 },
          { prompt: 'ماذا أحضرت الأم؟', promptAr: 'ماذا أحضرت الأم؟', options: ['مظلة', 'كرة', 'كتاب'], optionsAr: ['مظلة', 'كرة', 'كتاب'], correctIndex: 0 },
          { prompt: 'كيف أصبح في النهاية؟', promptAr: 'كيف أصبح؟', options: ['سعيد', 'حزين', 'خائف'], optionsAr: ['سعيد', 'حزين', 'خائف'], correctIndex: 0 },
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
        { title: 'Find Triangle', titleAr: 'أين المثلث؟', prompt: 'Tap the triangle!', promptAr: 'اضغط المثلث!', correct: 'triangle', options: ['circle', 'triangle', 'star'], icons: ['⭕', '🔺', '⭐'], labels: ['Circle', 'Triangle', 'Star'], labelsAr: ['دائرة', 'مثلث', 'نجمة'] },
        { title: 'Find Diamond', titleAr: 'أين المعيّن؟', prompt: 'Tap the diamond!', promptAr: 'اضغط المعيّن!', correct: 'diamond', options: ['diamond', 'square', 'heart'], icons: ['💎', '⬜', '❤️'], labels: ['Diamond', 'Square', 'Heart'], labelsAr: ['معيّن', 'مربع', 'قلب'] },
      ]},
      { key: 'ar-shapes-1', lang: 'arabic', items: [
        { title: 'الدائرة', titleAr: 'أين الدائرة؟', prompt: 'اختر الدائرة', promptAr: 'اختر الدائرة', correct: 'circle', options: ['circle', 'square', 'triangle'], icons: ['⭕', '⬜', '🔺'], labels: ['دائرة', 'مربع', 'مثلث'], labelsAr: ['دائرة', 'مربع', 'مثلث'] },
        { title: 'المربع', titleAr: 'أين المربع؟', prompt: 'اختر المربع', promptAr: 'اختر المربع', correct: 'square', options: ['star', 'square', 'heart'], icons: ['⭐', '⬜', '❤️'], labels: ['نجمة', 'مربع', 'قلب'], labelsAr: ['نجمة', 'مربع', 'قلب'] },
        { title: 'المثلث', titleAr: 'أين المثلث؟', prompt: 'اختر المثلث', promptAr: 'اختر المثلث', correct: 'triangle', options: ['triangle', 'circle', 'star'], icons: ['🔺', '⭕', '⭐'], labels: ['مثلث', 'دائرة', 'نجمة'], labelsAr: ['مثلث', 'دائرة', 'نجمة'] },
        { title: 'القلب', titleAr: 'أين القلب؟', prompt: 'اختر القلب', promptAr: 'اختر القلب', correct: 'heart', options: ['heart', 'square', 'circle'], icons: ['❤️', '⬜', '⭕'], labels: ['قلب', 'مربع', 'دائرة'], labelsAr: ['قلب', 'مربع', 'دائرة'] },
        { title: 'النجمة', titleAr: 'أين النجمة؟', prompt: 'اختر النجمة', promptAr: 'اختر النجمة', correct: 'star', options: ['triangle', 'circle', 'star'], icons: ['🔺', '⭕', '⭐'], labels: ['مثلث', 'دائرة', 'نجمة'], labelsAr: ['مثلث', 'دائرة', 'نجمة'] },
        { title: 'المعيّن', titleAr: 'أين المعيّن؟', prompt: 'اختر المعيّن', promptAr: 'اختر المعيّن', correct: 'diamond', options: ['diamond', 'square', 'heart'], icons: ['💎', '⬜', '❤️'], labels: ['معيّن', 'مربع', 'قلب'], labelsAr: ['معيّن', 'مربع', 'قلب'] },
      ]},
    ];

    const colorActivities = [
      { key: 'en-colors-1', items: [
        { title: 'Find Red', titleAr: 'أين الأحمر؟', prompt: 'Tap RED!', promptAr: 'اضغط الأحمر!', correct: 'red', options: ['red', 'blue', 'yellow'], icons: ['#F44336', '#2196F3', '#FFEB3B'], labels: ['Red', 'Blue', 'Yellow'], labelsAr: ['أحمر', 'أزرق', 'أصفر'] },
        { title: 'Find Blue', titleAr: 'أين الأزرق؟', prompt: 'Tap BLUE!', promptAr: 'اضغط الأزرق!', correct: 'blue', options: ['green', 'blue', 'orange'], icons: ['#4CAF50', '#2196F3', '#FF9800'], labels: ['Green', 'Blue', 'Orange'], labelsAr: ['أخضر', 'أزرق', 'برتقالي'] },
        { title: 'Find Green', titleAr: 'أين الأخضر؟', prompt: 'Tap GREEN!', promptAr: 'اضغط الأخضر!', correct: 'green', options: ['purple', 'green', 'pink'], icons: ['#9C27B0', '#4CAF50', '#E91E63'], labels: ['Purple', 'Green', 'Pink'], labelsAr: ['بنفسجي', 'أخضر', 'وردي'] },
        { title: 'Find Yellow', titleAr: 'أين الأصفر؟', prompt: 'Tap YELLOW!', promptAr: 'اضغط الأصفر!', correct: 'yellow', options: ['yellow', 'red', 'blue'], icons: ['#FFEB3B', '#F44336', '#2196F3'], labels: ['Yellow', 'Red', 'Blue'], labelsAr: ['أصفر', 'أحمر', 'أزرق'] },
        { title: 'Find Orange', titleAr: 'أين البرتقالي؟', prompt: 'Tap ORANGE!', promptAr: 'اضغط البرتقالي!', correct: 'orange', options: ['orange', 'purple', 'pink'], icons: ['#FF9800', '#9C27B0', '#E91E63'], labels: ['Orange', 'Purple', 'Pink'], labelsAr: ['برتقالي', 'بنفسجي', 'وردي'] },
        { title: 'Find Pink', titleAr: 'أين الوردي؟', prompt: 'Tap PINK!', promptAr: 'اضغط الوردي!', correct: 'pink', options: ['pink', 'green', 'blue'], icons: ['#E91E63', '#4CAF50', '#2196F3'], labels: ['Pink', 'Green', 'Blue'], labelsAr: ['وردي', 'أخضر', 'أزرق'] },
      ]},
      { key: 'ar-colors-1', lang: 'arabic', items: [
        { title: 'الأحمر', titleAr: 'اختر الأحمر', prompt: 'اختر اللون الأحمر', promptAr: 'اختر اللون الأحمر', correct: 'red', options: ['red', 'blue', 'yellow'], icons: ['#F44336', '#2196F3', '#FFEB3B'], labels: ['أحمر', 'أزرق', 'أصفر'], labelsAr: ['أحمر', 'أزرق', 'أصفر'] },
        { title: 'الأزرق', titleAr: 'اختر الأزرق', prompt: 'اختر اللون الأزرق', promptAr: 'اختر اللون الأزرق', correct: 'blue', options: ['green', 'blue', 'orange'], icons: ['#4CAF50', '#2196F3', '#FF9800'], labels: ['أخضر', 'أزرق', 'برتقالي'], labelsAr: ['أخضر', 'أزرق', 'برتقالي'] },
        { title: 'الأخضر', titleAr: 'اختر الأخضر', prompt: 'اختر اللون الأخضر', promptAr: 'اختر اللون الأخضر', correct: 'green', options: ['purple', 'green', 'pink'], icons: ['#9C27B0', '#4CAF50', '#E91E63'], labels: ['بنفسجي', 'أخضر', 'وردي'], labelsAr: ['بنفسجي', 'أخضر', 'وردي'] },
        { title: 'الأصفر', titleAr: 'اختر الأصفر', prompt: 'اختر اللون الأصفر', promptAr: 'اختر اللون الأصفر', correct: 'yellow', options: ['yellow', 'red', 'blue'], icons: ['#FFEB3B', '#F44336', '#2196F3'], labels: ['أصفر', 'أحمر', 'أزرق'], labelsAr: ['أصفر', 'أحمر', 'أزرق'] },
        { title: 'البرتقالي', titleAr: 'اختر البرتقالي', prompt: 'اختر اللون البرتقالي', promptAr: 'اختر اللون البرتقالي', correct: 'orange', options: ['orange', 'purple', 'pink'], icons: ['#FF9800', '#9C27B0', '#E91E63'], labels: ['برتقالي', 'بنفسجي', 'وردي'], labelsAr: ['برتقالي', 'بنفسجي', 'وردي'] },
        { title: 'الوردي', titleAr: 'اختر الوردي', prompt: 'اختر اللون الوردي', promptAr: 'اختر اللون الوردي', correct: 'pink', options: ['pink', 'green', 'blue'], icons: ['#E91E63', '#4CAF50', '#2196F3'], labels: ['وردي', 'أخضر', 'أزرق'], labelsAr: ['وردي', 'أخضر', 'أزرق'] },
      ]},
    ];

    const emotionActivities = [
      { key: 'en-emotions-1', items: [
        { title: 'Happy Face', titleAr: 'وجه سعيد', prompt: 'Find the HAPPY face!', promptAr: 'أين الوجه السعيد؟', correct: 'happy', options: ['happy', 'sad', 'angry'], icons: ['😊', '😢', '😠'], labels: ['Happy', 'Sad', 'Angry'], labelsAr: ['سعيد', 'حزين', 'غاضب'] },
        { title: 'Sad Face', titleAr: 'وجه حزين', prompt: 'Find the SAD face!', promptAr: 'أين الوجه الحزين؟', correct: 'sad', options: ['surprised', 'sad', 'happy'], icons: ['😲', '😢', '😊'], labels: ['Surprised', 'Sad', 'Happy'], labelsAr: ['متفاجئ', 'حزين', 'سعيد'] },
        { title: 'Angry Face', titleAr: 'وجه غاضب', prompt: 'Find the ANGRY face!', promptAr: 'أين الوجه الغاضب؟', correct: 'angry', options: ['angry', 'scared', 'tired'], icons: ['😠', '😨', '😴'], labels: ['Angry', 'Scared', 'Tired'], labelsAr: ['غاضب', 'خائف', 'نعسان'] },
        { title: 'Surprised Face', titleAr: 'وجه متفاجئ', prompt: 'Find the SURPRISED face!', promptAr: 'أين الوجه المتفاجئ؟', correct: 'surprised', options: ['love', 'surprised', 'sad'], icons: ['🥰', '😲', '😢'], labels: ['Love', 'Surprised', 'Sad'], labelsAr: ['محب', 'متفاجئ', 'حزين'] },
        { title: 'Scared Face', titleAr: 'وجه خائف', prompt: 'Find the SCARED face!', promptAr: 'أين الوجه الخائف؟', correct: 'scared', options: ['scared', 'happy', 'angry'], icons: ['😨', '😊', '😠'], labels: ['Scared', 'Happy', 'Angry'], labelsAr: ['خائف', 'سعيد', 'غاضب'] },
        { title: 'Love Face', titleAr: 'وجه محب', prompt: 'Find the LOVE face!', promptAr: 'أين وجه الحب؟', correct: 'love', options: ['tired', 'love', 'sad'], icons: ['😴', '🥰', '😢'], labels: ['Tired', 'Love', 'Sad'], labelsAr: ['نعسان', 'محب', 'حزين'] },
        { title: 'Tired Face', titleAr: 'وجه نعسان', prompt: 'Find the TIRED face!', promptAr: 'أين الوجه النعسان؟', correct: 'tired', options: ['excited', 'tired', 'happy'], icons: ['🤩', '😴', '😊'], labels: ['Excited', 'Tired', 'Happy'], labelsAr: ['متحمس', 'نعسان', 'سعيد'] },
        { title: 'Excited Face', titleAr: 'وجه متحمس', prompt: 'Find the EXCITED face!', promptAr: 'أين الوجه المتحمس؟', correct: 'excited', options: ['excited', 'sad', 'scared'], icons: ['🤩', '😢', '😨'], labels: ['Excited', 'Sad', 'Scared'], labelsAr: ['متحمس', 'حزين', 'خائف'] },
      ]},
      { key: 'ar-emotions-1', lang: 'arabic', items: [
        { title: 'سعيد', titleAr: 'وجه سعيد', prompt: 'اختر الوجه السعيد 😊', promptAr: 'اختر الوجه السعيد', correct: 'happy', options: ['happy', 'sad', 'angry'], icons: ['😊', '😢', '😠'], labels: ['سعيد', 'حزين', 'غاضب'], labelsAr: ['سعيد', 'حزين', 'غاضب'] },
        { title: 'حزين', titleAr: 'وجه حزين', prompt: 'اختر الوجه الحزين 😢', promptAr: 'اختر الوجه الحزين', correct: 'sad', options: ['surprised', 'sad', 'happy'], icons: ['😲', '😢', '😊'], labels: ['متفاجئ', 'حزين', 'سعيد'], labelsAr: ['متفاجئ', 'حزين', 'سعيد'] },
        { title: 'غاضب', titleAr: 'وجه غاضب', prompt: 'اختر الوجه الغاضب 😠', promptAr: 'اختر الوجه الغاضب', correct: 'angry', options: ['angry', 'scared', 'tired'], icons: ['😠', '😨', '😴'], labels: ['غاضب', 'خائف', 'نعسان'], labelsAr: ['غاضب', 'خائف', 'نعسان'] },
        { title: 'متفاجئ', titleAr: 'وجه متفاجئ', prompt: 'اختر الوجه المتفاجئ 😲', promptAr: 'اختر الوجه المتفاجئ', correct: 'surprised', options: ['love', 'surprised', 'sad'], icons: ['🥰', '😲', '😢'], labels: ['محب', 'متفاجئ', 'حزين'], labelsAr: ['محب', 'متفاجئ', 'حزين'] },
        { title: 'خائف', titleAr: 'وجه خائف', prompt: 'اختر الوجه الخائف 😨', promptAr: 'اختر الوجه الخائف', correct: 'scared', options: ['scared', 'happy', 'angry'], icons: ['😨', '😊', '😠'], labels: ['خائف', 'سعيد', 'غاضب'], labelsAr: ['خائف', 'سعيد', 'غاضب'] },
        { title: 'محب', titleAr: 'وجه محب', prompt: 'اختر وجه الحب 🥰', promptAr: 'اختر وجه الحب', correct: 'love', options: ['tired', 'love', 'sad'], icons: ['😴', '🥰', '😢'], labels: ['نعسان', 'محب', 'حزين'], labelsAr: ['نعسان', 'محب', 'حزين'] },
        { title: 'نعسان', titleAr: 'وجه نعسان', prompt: 'اختر الوجه النعسان 😴', promptAr: 'اختر الوجه النعسان', correct: 'tired', options: ['excited', 'tired', 'happy'], icons: ['🤩', '😴', '😊'], labels: ['متحمس', 'نعسان', 'سعيد'], labelsAr: ['متحمس', 'نعسان', 'سعيد'] },
        { title: 'متحمس', titleAr: 'وجه متحمس', prompt: 'اختر الوجه المتحمس 🤩', promptAr: 'اختر الوجه المتحمس', correct: 'excited', options: ['excited', 'sad', 'scared'], icons: ['🤩', '😢', '😨'], labels: ['متحمس', 'حزين', 'خائف'], labelsAr: ['متحمس', 'حزين', 'خائف'] },
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

    console.log('😊 Creating emotions...');
    for (const group of emotionActivities) {
      let order = 1;
      for (const item of group.items) {
        await activitiesService.create({
          type: ActivityType.EMOTIONS,
          title: item.title,
          titleAr: item.titleAr,
          levelId: levels[group.key],
          language: (group as any).lang || 'english',
          order: order++,
          points: 12,
          cognitiveCategory: CognitiveCategory.COMPREHENSION,
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

    const huntActivities = [
      { key: 'en-hunt-1', items: [
        { title: 'Find Apple', titleAr: 'دور على تفاحة', prompt: 'Point camera at an apple!', promptAr: 'وجّه الكاميرا نحو تفاحة!', correct: 'apple', mlLabels: ['apple', 'fruit', 'food', 'plant'], icon: '🍎', label: 'Apple', labelAr: 'تفاحة' },
        { title: 'Find Orange', titleAr: 'دور على برتقالة', prompt: 'Point camera at an orange!', promptAr: 'وجّه الكاميرا نحو برتقالة!', correct: 'orange', mlLabels: ['orange', 'fruit', 'citrus fruit', 'food'], icon: '🍊', label: 'Orange', labelAr: 'برتقالة' },
        { title: 'Find Banana', titleAr: 'دور على موزة', prompt: 'Point camera at a banana!', promptAr: 'وجّه الكاميرا نحو موزة!', correct: 'banana', mlLabels: ['banana', 'fruit', 'food'], icon: '🍌', label: 'Banana', labelAr: 'موزة' },
        { title: 'Find Cup', titleAr: 'دور على كوب', prompt: 'Point camera at a cup!', promptAr: 'وجّه الكاميرا نحو كوب!', correct: 'cup', mlLabels: ['cup', 'mug', 'coffee cup', 'drinkware'], icon: '☕', label: 'Cup', labelAr: 'كوب' },
        { title: 'Find Book', titleAr: 'دور على كتاب', prompt: 'Point camera at a book!', promptAr: 'وجّه الكاميرا نحو كتاب!', correct: 'book', mlLabels: ['book', 'publication', 'literature'], icon: '📚', label: 'Book', labelAr: 'كتاب' },
        { title: 'Find Bottle', titleAr: 'دور على زجاجة', prompt: 'Point camera at a bottle!', promptAr: 'وجّه الكاميرا نحو زجاجة!', correct: 'bottle', mlLabels: ['bottle', 'water bottle', 'drink'], icon: '🍼', label: 'Bottle', labelAr: 'زجاجة' },
      ]},
      { key: 'ar-hunt-1', lang: 'arabic', items: [
        { title: 'تفاحة', titleAr: 'دور على تفاحة', prompt: 'وجّه الكاميرا نحو تفاحة', promptAr: 'وجّه الكاميرا نحو تفاحة', correct: 'apple', mlLabels: ['apple', 'fruit', 'food', 'plant'], icon: '🍎', label: 'تفاحة', labelAr: 'تفاحة' },
        { title: 'برتقالة', titleAr: 'دور على برتقالة', prompt: 'وجّه الكاميرا نحو برتقالة', promptAr: 'وجّه الكاميرا نحو برتقالة', correct: 'orange', mlLabels: ['orange', 'fruit', 'citrus fruit', 'food'], icon: '🍊', label: 'برتقالة', labelAr: 'برتقالة' },
        { title: 'موزة', titleAr: 'دور على موزة', prompt: 'وجّه الكاميرا نحو موزة', promptAr: 'وجّه الكاميرا نحو موزة', correct: 'banana', mlLabels: ['banana', 'fruit', 'food'], icon: '🍌', label: 'موزة', labelAr: 'موزة' },
        { title: 'كوب', titleAr: 'دور على كوب', prompt: 'وجّه الكاميرا نحو كوب', promptAr: 'وجّه الكاميرا نحو كوب', correct: 'cup', mlLabels: ['cup', 'mug', 'coffee cup', 'drinkware'], icon: '☕', label: 'كوب', labelAr: 'كوب' },
        { title: 'كتاب', titleAr: 'دور على كتاب', prompt: 'وجّه الكاميرا نحو كتاب', promptAr: 'وجّه الكاميرا نحو كتاب', correct: 'book', mlLabels: ['book', 'publication', 'literature'], icon: '📚', label: 'كتاب', labelAr: 'كتاب' },
        { title: 'زجاجة', titleAr: 'دور على زجاجة', prompt: 'وجّه الكاميرا نحو زجاجة', promptAr: 'وجّه الكاميرا نحو زجاجة', correct: 'bottle', mlLabels: ['bottle', 'water bottle', 'drink'], icon: '🍼', label: 'زجاجة', labelAr: 'زجاجة' },
      ]},
    ];

    console.log('📷 Creating hunt (camera) activities...');
    for (const group of huntActivities) {
      let order = 1;
      for (const item of group.items) {
        await activitiesService.create({
          type: ActivityType.HUNT,
          title: item.title,
          titleAr: item.titleAr,
          levelId: levels[group.key],
          language: (group as any).lang || 'english',
          order: order++,
          points: 12,
          cognitiveCategory: CognitiveCategory.VISUAL,
          content: {
            prompt: item.prompt,
            promptAr: item.promptAr,
            correctAnswer: item.correct,
            options: item.mlLabels,
            optionIcons: [item.icon],
            optionLabels: [item.label],
            optionLabelsAr: [item.labelAr],
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

    console.log('✅ Seed complete! 14 levels, 28 words, 6 stories, 16 shapes/colors, 16 emotions, 12 hunt');
  } catch (error: any) {
    console.error('❌', error.message);
  } finally {
    await app.close();
  }
}

seedContent().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });

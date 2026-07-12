import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { LevelsService } from '../levels/levels.service';
import { WordsService } from '../words/words.service';
import { ActivitiesService } from '../activities/activities.service';
import { UsersService } from '../users/users.service';
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

  try {
    const existingLevels = await levelsService.findAll();
    if (existingLevels.length > 0) {
      console.log('⚠️  Content may already exist. Continuing to add missing items...');
    }

    // ─── LEVELS ───────────────────────────────────────────────
    console.log('📚 Creating levels...');
    const levelData = [
      {
        name: 'First Words',
        description: 'Simple everyday words - start here!',
        levelNumber: 1,
        requiredPoints: 0,
        icon: '🗣️',
        color: '#9C27B0',
        language: 'english',
      },
      {
        name: 'Fun Stories',
        description: 'Short stories with easy questions',
        levelNumber: 2,
        requiredPoints: 30,
        icon: '📖',
        color: '#FF4081',
        language: 'english',
      },
      {
        name: 'Shapes World',
        description: 'Learn circles, squares, and more',
        levelNumber: 3,
        requiredPoints: 60,
        icon: '🔷',
        color: '#00BCD4',
        language: 'english',
      },
      {
        name: 'Colors Fun',
        description: 'Match and name colors',
        levelNumber: 4,
        requiredPoints: 90,
        icon: '🎨',
        color: '#FF9800',
        language: 'english',
      },
      {
        name: 'كلمات أولى',
        description: 'كلمات يومية بسيطة',
        levelNumber: 1,
        requiredPoints: 0,
        icon: '🗣️',
        color: '#9C27B0',
        language: 'arabic',
      },
    ];

    const levels: Record<string, string> = {};
    for (const lvl of levelData) {
      const created = await levelsService.create(lvl as any);
      const id = (created as any)._id?.toString();
      levels[`${lvl.language}-${lvl.levelNumber}`] = id;
      console.log(`  ✅ Level: ${lvl.name}`);
    }

    const speechEn = levels['english-1'];
    const storiesEn = levels['english-2'];
    const shapesEn = levels['english-3'];
    const colorsEn = levels['english-4'];
    const speechAr = levels['arabic-1'];

    // ─── WORDS (Speech) ───────────────────────────────────────
    console.log('📝 Creating speech words...');
    const words = [
      { word: 'Mom', arabic: 'ماما', icon: '👩', levelId: speechEn },
      { word: 'Dad', arabic: 'بابا', icon: '👨', levelId: speechEn },
      { word: 'Cat', arabic: 'قطة', icon: '🐱', levelId: speechEn },
      { word: 'Dog', arabic: 'كلب', icon: '🐶', levelId: speechEn },
      { word: 'Ball', arabic: 'كرة', icon: '⚽', levelId: speechEn },
      { word: 'Sun', arabic: 'شمس', icon: '☀️', levelId: speechEn },
      { word: 'ماما', arabic: 'ماما', icon: '👩', levelId: speechAr },
      { word: 'بابا', arabic: 'بابا', icon: '👨', levelId: speechAr },
      { word: 'قطة', arabic: 'قطة', icon: '🐱', levelId: speechAr },
    ];

    for (const w of words) {
      await wordsService.create(w as any);
      console.log(`  ✅ Word: ${w.word}`);
    }

    // ─── STORIES ──────────────────────────────────────────────
    console.log('📖 Creating stories...');
    const stories = [
      {
        type: ActivityType.STORY,
        title: 'The Happy Cat',
        titleAr: 'القطة السعيدة',
        levelId: storiesEn,
        language: 'english',
        order: 1,
        points: 15,
        difficulty: 'easy',
        cognitiveCategory: CognitiveCategory.COMPREHENSION,
        content: {
          pages: [
            'Once there was a happy cat. 🐱',
            'The cat loved to play with a red ball. 🔴',
            'The cat and the ball had fun every day! 🌟',
          ],
          pagesAr: [
            'كانت هناك قطة سعيدة. 🐱',
            'أحبت القطة اللعب بكرة حمراء. 🔴',
            'القطة والكرة يمرحان كل يوم! 🌟',
          ],
          questions: [
            {
              prompt: 'What animal is in the story?',
              promptAr: 'ما الحيوان في القصة؟',
              options: ['Cat', 'Dog', 'Bird'],
              optionsAr: ['قطة', 'كلب', 'طائر'],
              correctIndex: 0,
            },
            {
              prompt: 'What did the cat play with?',
              promptAr: 'ماذا لعبت القطة؟',
              options: ['Ball', 'Book', 'Hat'],
              optionsAr: ['كرة', 'كتاب', 'قبعة'],
              correctIndex: 0,
            },
            {
              prompt: 'What color was the ball?',
              promptAr: 'ما لون الكرة؟',
              options: ['Red', 'Blue', 'Green'],
              optionsAr: ['أحمر', 'أزرق', 'أخضر'],
              correctIndex: 0,
            },
          ],
        },
      },
      {
        type: ActivityType.STORY,
        title: 'Sunny Day',
        titleAr: 'يوم مشمس',
        levelId: storiesEn,
        language: 'english',
        order: 2,
        points: 15,
        difficulty: 'easy',
        cognitiveCategory: CognitiveCategory.MEMORY,
        content: {
          pages: [
            'Today is a sunny day! ☀️',
            'A little boy goes to the park. 🌳',
            'He sees a big yellow sun in the sky. 🌞',
          ],
          pagesAr: [
            'اليوم يوم مشمس! ☀️',
            'ذهب ولد صغير إلى الحديقة. 🌳',
            'رأى شمساً كبيرة صفراء في السماء. 🌞',
          ],
          questions: [
            {
              prompt: 'Where did the boy go?',
              promptAr: 'أين ذهب الولد؟',
              options: ['Park', 'School', 'Shop'],
              optionsAr: ['الحديقة', 'المدرسة', 'المتجر'],
              correctIndex: 0,
            },
            {
              prompt: 'How is the weather?',
              promptAr: 'كيف كان الطقس؟',
              options: ['Sunny', 'Rainy', 'Snowy'],
              optionsAr: ['مشمس', 'ممطر', 'ثلجي'],
              correctIndex: 0,
            },
          ],
        },
      },
    ];

    for (const story of stories) {
      await activitiesService.create(story as any);
      console.log(`  ✅ Story: ${story.title}`);
    }

    // ─── SHAPES ───────────────────────────────────────────────
    console.log('🔷 Creating shape activities...');
    const shapes = [
      {
        type: ActivityType.SHAPES,
        title: 'Find the Circle',
        titleAr: 'أين الدائرة؟',
        levelId: shapesEn,
        language: 'english',
        order: 1,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the circle!',
          promptAr: 'اضغط على الدائرة!',
          correctAnswer: 'circle',
          options: ['circle', 'square', 'triangle'],
          optionIcons: ['⭕', '⬜', '🔺'],
          optionLabels: ['Circle', 'Square', 'Triangle'],
          optionLabelsAr: ['دائرة', 'مربع', 'مثلث'],
        },
      },
      {
        type: ActivityType.SHAPES,
        title: 'Find the Square',
        titleAr: 'أين المربع؟',
        levelId: shapesEn,
        language: 'english',
        order: 2,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the square!',
          promptAr: 'اضغط على المربع!',
          correctAnswer: 'square',
          options: ['star', 'square', 'heart'],
          optionIcons: ['⭐', '⬜', '❤️'],
          optionLabels: ['Star', 'Square', 'Heart'],
          optionLabelsAr: ['نجمة', 'مربع', 'قلب'],
        },
      },
      {
        type: ActivityType.SHAPES,
        title: 'Find the Star',
        titleAr: 'أين النجمة؟',
        levelId: shapesEn,
        language: 'english',
        order: 3,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the star!',
          promptAr: 'اضغط على النجمة!',
          correctAnswer: 'star',
          options: ['triangle', 'circle', 'star'],
          optionIcons: ['🔺', '⭕', '⭐'],
          optionLabels: ['Triangle', 'Circle', 'Star'],
          optionLabelsAr: ['مثلث', 'دائرة', 'نجمة'],
        },
      },
    ];

    for (const shape of shapes) {
      await activitiesService.create(shape as any);
      console.log(`  ✅ Shape: ${shape.title}`);
    }

    // ─── COLORS ───────────────────────────────────────────────
    console.log('🎨 Creating color activities...');
    const colors = [
      {
        type: ActivityType.COLORS,
        title: 'Find Red',
        titleAr: 'أين الأحمر؟',
        levelId: colorsEn,
        language: 'english',
        order: 1,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the RED color!',
          promptAr: 'اضغط على اللون الأحمر!',
          correctAnswer: 'red',
          options: ['red', 'blue', 'yellow'],
          optionIcons: ['#F44336', '#2196F3', '#FFEB3B'],
          optionLabels: ['Red', 'Blue', 'Yellow'],
          optionLabelsAr: ['أحمر', 'أزرق', 'أصفر'],
        },
      },
      {
        type: ActivityType.COLORS,
        title: 'Find Blue',
        titleAr: 'أين الأزرق؟',
        levelId: colorsEn,
        language: 'english',
        order: 2,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the BLUE color!',
          promptAr: 'اضغط على اللون الأزرق!',
          correctAnswer: 'blue',
          options: ['green', 'blue', 'orange'],
          optionIcons: ['#4CAF50', '#2196F3', '#FF9800'],
          optionLabels: ['Green', 'Blue', 'Orange'],
          optionLabelsAr: ['أخضر', 'أزرق', 'برتقالي'],
        },
      },
      {
        type: ActivityType.COLORS,
        title: 'Find Green',
        titleAr: 'أين الأخضر؟',
        levelId: colorsEn,
        language: 'english',
        order: 3,
        points: 10,
        cognitiveCategory: CognitiveCategory.VISUAL,
        content: {
          prompt: 'Tap the GREEN color!',
          promptAr: 'اضغط على اللون الأخضر!',
          correctAnswer: 'green',
          options: ['purple', 'green', 'pink'],
          optionIcons: ['#9C27B0', '#4CAF50', '#E91E63'],
          optionLabels: ['Purple', 'Green', 'Pink'],
          optionLabelsAr: ['بنفسجي', 'أخضر', 'وردي'],
        },
      },
    ];

    for (const color of colors) {
      await activitiesService.create(color as any);
      console.log(`  ✅ Color: ${color.title}`);
    }

    // ─── DEMO STUDENT ─────────────────────────────────────────
    const demoEmail = 'student@downlingo.com';
    const existingStudent = await usersService.findByEmail(demoEmail);
    if (!existingStudent) {
      await usersService.create({
        email: demoEmail,
        password: 'student123',
        name: 'Ahmad',
        role: UserRole.STUDENT,
      });
      console.log('👤 Demo student: student@downlingo.com / student123');
    }

    console.log('');
    console.log('✅ Content seeding completed!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Created:');
    console.log(`   • ${levelData.length} levels`);
    console.log(`   • ${words.length} speech words`);
    console.log(`   • ${stories.length} stories with MCQ`);
    console.log(`   • ${shapes.length} shape activities`);
    console.log(`   • ${colors.length} color activities`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  } catch (error: any) {
    console.error('❌ Seeding error:', error.message);
    console.error(error);
  } finally {
    await app.close();
  }
}

seedContent()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

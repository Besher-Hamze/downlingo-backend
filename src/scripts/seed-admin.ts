import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/schemas/user.schema';

async function seedAdmin() {
  console.log('🌱 Starting admin seeding...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  // Default admin credentials (can be overridden with environment variables)
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@downlingo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  try {
    // Check if admin already exists
    const existingAdmin = await usersService.findByEmail(adminEmail);
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', adminEmail);
      console.log('   If you want to reset the password, delete the user first or use a different email.');
      await app.close();
      return;
    }

    // Create admin user
    console.log('📝 Creating admin user...');
    const adminUser = await usersService.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: UserRole.ADMIN,
    });

    console.log('✅ Admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('👤 Name:', adminName);
    console.log('🔐 Role: Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 You can now login to the dashboard at: http://localhost:3000/dashboard/login.html');
    console.log('⚠️  Please change the default password after first login!');

  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
    if (error.message.includes('already exists')) {
      console.log('💡 Admin user already exists. Use a different email or delete the existing user.');
    }
  } finally {
    await app.close();
  }
}

// Run the seed function
seedAdmin()
  .then(() => {
    console.log('✨ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });


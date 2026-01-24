# Admin User Seeding Guide

This guide explains how to seed an admin user for the Downlingo backend.

## Quick Start

Run the seeding script to create a default admin user:

```bash
npm run seed:admin
```

This will create an admin user with:
- **Email**: `admin@downlingo.com`
- **Password**: `admin123`
- **Name**: `Admin User`
- **Role**: `admin`

## Custom Credentials

You can customize the admin credentials using environment variables:

```bash
ADMIN_EMAIL=your-email@example.com \
ADMIN_PASSWORD=your-secure-password \
ADMIN_NAME="Your Name" \
npm run seed:admin
```

Or create a `.env` file in the `downlingo-backend` directory:

```env
ADMIN_EMAIL=admin@downlingo.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin User
```

Then run:
```bash
npm run seed:admin
```

## What the Script Does

1. ✅ Connects to MongoDB (using the connection string from environment or default)
2. ✅ Checks if an admin user with the email already exists
3. ✅ Creates a new admin user if one doesn't exist
4. ✅ Hashes the password using bcrypt
5. ✅ Sets the role to `admin`
6. ✅ Displays the credentials for easy access

## Safety Features

- **Idempotent**: Running the script multiple times won't create duplicate admins
- **Safe**: If an admin with the email already exists, it will skip creation
- **Secure**: Passwords are automatically hashed using bcrypt

## After Seeding

1. Start your backend server:
   ```bash
   npm run start:dev
   ```

2. Open the dashboard:
   ```
   http://localhost:3000/dashboard/login.html
   ```

3. Login with the seeded credentials

4. **Important**: Change the default password after first login!

## Troubleshooting

### "User with this email already exists"
- The admin user already exists in the database
- To create a new admin, either:
  - Use a different email address
  - Delete the existing user from the database
  - Use the dashboard to create additional admin users

### "Connection refused" or MongoDB errors
- Make sure MongoDB is running
- Check your `MONGODB_URI` environment variable
- Default connection: `mongodb://localhost:27017/down-learning`

### Script not found
- Make sure you're in the `downlingo-backend` directory
- Run `npm install` to ensure all dependencies are installed
- Check that `ts-node` is installed (it should be in devDependencies)

## Manual Seeding (Alternative)

If you prefer to create the admin user manually, you can use MongoDB shell:

```javascript
use down-learning

db.users.insertOne({
  email: "admin@downlingo.com",
  password: "$2b$10$YourHashedPasswordHere", // Use bcrypt to hash
  name: "Admin User",
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Or use the dashboard's user creation feature after logging in with another admin account.

## Security Best Practices

1. **Change default password immediately** after first login
2. **Use strong passwords** for production environments
3. **Limit admin accounts** - only create as many as necessary
4. **Use environment variables** for credentials in production
5. **Never commit credentials** to version control


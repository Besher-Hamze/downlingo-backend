# Downlingo Admin Dashboard

A beautiful, modern web-based admin dashboard for managing the Downlingo learning platform.

## Features

- 📊 **Dashboard Overview**: View statistics and key metrics
- 📚 **Level Management**: Create, edit, and delete learning levels
- 📖 **Word Management**: Manage vocabulary words with Arabic translations
- 💪 **Exercise Management**: View and manage exercises
- 👥 **User Management**: Manage user accounts (students, family, admin)
- 📈 **Statistics**: View learning progress and analytics

## Access

1. Start the NestJS backend server:
   ```bash
   cd downlingo-backend
   npm run start:dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:3000/dashboard/login.html
   ```

3. Login with your admin credentials

## Authentication

- The dashboard requires authentication via JWT tokens
- Login credentials must have admin role
- Token is stored in localStorage
- Session persists until logout

## API Integration

The dashboard automatically connects to the backend API at `/api`:
- `/api/auth/login` - Authentication
- `/api/levels` - Level management
- `/api/words` - Word management
- `/api/users` - User management
- `/api/statistics` - Statistics data

## File Structure

```
dashboard/
├── index.html      # Main dashboard page
├── login.html      # Login page
├── styles.css      # All styling
├── app.js          # JavaScript functionality
└── README.md       # This file
```

## Features in Detail

### Dashboard
- Real-time statistics
- Quick overview of all entities
- Visual cards with key metrics

### Level Management
- Create new levels with:
  - Name and description
  - Level number
  - Required points to unlock
  - Icon (emoji)
  - Color
  - Language (English/Arabic)
- Edit existing levels
- Delete levels
- View all levels in a table

### Word Management
- Create new words with:
  - English word
  - Arabic translation
  - Icon (emoji)
  - Associated level
  - Image URL (optional)
  - Audio URL (optional)
- Edit existing words
- Delete words
- View all words in a table

### User Management
- Create new users with:
  - Name
  - Email
  - Password
  - Role (Student/Family/Admin)
- Edit existing users
- Delete users
- View all users in a table

## Styling

The dashboard uses a modern, responsive design with:
- Purple/pink gradient theme matching Downlingo brand
- Smooth animations and transitions
- Mobile-responsive layout
- Beautiful cards and tables
- Modal forms for creating/editing

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Notes

- Make sure the backend API is running before using the dashboard
- All API calls require authentication (JWT token)
- The dashboard automatically handles API errors and displays notifications
- Data is loaded dynamically when switching between sections


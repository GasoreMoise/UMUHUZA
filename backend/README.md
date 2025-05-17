# Umuhuza Backend

This is the backend service for the Citizen Engagement System, built with Node.js, Express, TypeScript, and PostgreSQL.

## Features

- User Authentication (Register, Login, Profile)
- Complaint Management
- Agency Management
- Category Management
- Response Handling
- Role-based Access Control

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/umuhuza_db?schema=public"
   JWT_SECRET="your-super-secret-key-change-in-production"
   JWT_EXPIRES_IN="24h"
   PORT=5000
   NODE_ENV="development"
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-specific-password"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/profile - Get user profile

### Complaints
- POST /api/complaints - Create a new complaint
- GET /api/complaints - Get all complaints
- GET /api/complaints/:id - Get complaint by ID
- PUT /api/complaints/:id - Update complaint
- DELETE /api/complaints/:id - Delete complaint

### Agencies
- POST /api/agencies - Create a new agency
- GET /api/agencies - Get all agencies
- GET /api/agencies/:id - Get agency by ID
- PUT /api/agencies/:id - Update agency
- DELETE /api/agencies/:id - Delete agency

### Categories
- POST /api/categories - Create a new category
- GET /api/categories - Get all categories
- GET /api/categories/:id - Get category by ID
- PUT /api/categories/:id - Update category
- DELETE /api/categories/:id - Delete category

## Project Structure

```
backend/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── index.ts        # App entry point
├── prisma/
│   └── schema.prisma   # Database schema
├── .env               # Environment variables
└── package.json       # Project dependencies
```

## Next Steps

1. Implement remaining API endpoints
2. Add input validation for all routes
3. Implement email notifications
4. Add logging system
5. Write tests
6. Add API documentation
7. Set up CI/CD pipeline

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the ISC License. 
# Vercel Deployment Guide

This guide will help you deploy the Ethos Network application to Vercel.

## Prerequisites

1. ✅ GitHub repository connected to Vercel
2. 🗄️ PostgreSQL database (recommended: [Neon](https://neon.tech/))
3. 🔧 Vercel account

## Setup Steps

### 1. Database Setup

1. Create a PostgreSQL database on [Neon](https://neon.tech/) (free tier available)
2. Copy the connection string (it will look like: `postgresql://user:password@host/database`)

### 2. Vercel Environment Variables

In your Vercel dashboard, go to your project settings and add these environment variables:

```
DATABASE_URL=postgresql://your-connection-string-here
NODE_ENV=production
```

### 3. Deploy

1. Push your code to GitHub
2. Vercel will automatically deploy when you push to the main branch
3. The first deployment might take a few minutes

## Project Structure for Vercel

```
├── api/
│   └── index.ts          # Serverless API functions
├── client/               # Frontend React app
├── server/               # Backend logic (imported by API)
├── shared/               # Shared types and schemas
├── vercel.json          # Vercel configuration
└── package.json         # Dependencies and build scripts
```

## API Endpoints

After deployment, your API will be available at:
- `https://your-app.vercel.app/api/users`
- `https://your-app.vercel.app/api/vouches`
- `https://your-app.vercel.app/api/health`

## Database Migrations

After deployment, you may need to run database migrations:

```bash
# Install Vercel CLI
npm i -g vercel

# Run database push
vercel env pull .env.local
npm run db:push
```

## Troubleshooting

### Common Issues:

1. **Database Connection Error**: Make sure `DATABASE_URL` is set correctly in Vercel
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **API Routes Not Working**: Verify `vercel.json` routing configuration

### Checking Logs:

```bash
vercel logs your-deployment-url
```

## Local Development

For local development with the same setup:

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your local database URL

# Start development server
npm run dev
```

## Production Database Setup

For production, you'll need to:

1. Set up your PostgreSQL database schema
2. Run migrations if needed
3. Optionally seed with initial data

The app will automatically create tables when it starts if using the built-in schema creation.
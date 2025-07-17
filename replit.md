# Ethos Network

## Overview

Ethos Network is a Web3 reputation and trust platform built as a Farcaster Frame application. It allows users to vouch for each other, leave reviews, and build credibility scores within the ecosystem. The application combines a modern React frontend with an Express.js backend, using PostgreSQL for data persistence and Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Storage**: DatabaseStorage class implementing full CRUD operations
- **API Design**: RESTful endpoints with JSON responses
- **Session Management**: PostgreSQL session store with connect-pg-simple

### Mobile-First Design
- Responsive design optimized for mobile devices
- Bottom navigation for mobile user experience
- PWA-ready with mobile-optimized components

## Key Components

### Database Schema
The application uses five main tables:
- **users**: Core user profiles with Farcaster integration (fid, username, credibility scores)
- **vouches**: Peer-to-peer vouching system with stake amounts
- **reviews**: User review system with rating scale (1-3)
- **activities**: Activity feed tracking user actions and score changes
- **connections**: Social connections between users

### Authentication & Identity
- Farcaster Frame integration for user authentication
- Mock Farcaster SDK for development environment
- User profiles linked to Farcaster IDs (fid) and usernames

### Core Features
- **Credibility System**: Numerical scoring based on vouches and reviews
- **Vouching**: Users can vouch for others with stake amounts
- **Reviews**: Three-tier rating system (down/neutral/up)
- **Activity Feed**: Real-time tracking of user actions
- **Network Building**: Connection system between users

## Data Flow

### User Authentication Flow
1. Initialize Farcaster SDK on app load
2. Authenticate user through Farcaster Frame
3. Create or retrieve user profile from database
4. Store user session and maintain state

### Vouching Process
1. User searches for target user by username
2. Submit vouch with stake amount and optional reason
3. Create vouch record in database
4. Update credibility scores for both users
5. Generate activity entries for both users

### Review System
1. User selects target for review
2. Submit rating (1-3) with optional comment
3. Update target user's credibility score
4. Log activity for review submission

## External Dependencies

### Core Libraries
- **@neondatabase/serverless**: Database connectivity
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui**: UI component primitives
- **zod**: Schema validation
- **wouter**: Client-side routing

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **Tailwind CSS**: Utility-first CSS framework
- **ESBuild**: Production bundling

### Farcaster Integration
- Mock SDK for development (to be replaced with actual @farcaster/miniapp-sdk)
- Frame metadata configuration in public/.well-known/farcaster.json
- Webhook endpoint for Farcaster interactions

## Deployment Strategy

### Build Process
- **Development**: `npm run dev` - TSX server with hot reload
- **Production Build**: `npm run build` - Vite frontend build + ESBuild backend bundle
- **Database**: `npm run db:push` - Drizzle schema migration

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment flag (development/production)
- **REPL_ID**: Replit-specific environment detection

### Production Deployment
- Static frontend assets served from dist/public
- Express server bundle in dist/index.js
- Database migrations handled through Drizzle Kit
- Session persistence through PostgreSQL store

The application is designed to be deployed on Replit with PostgreSQL provisioning, but can be adapted for other hosting platforms with minimal configuration changes.
# South Central - Roblox Hood Game Website

## Overview

South Central is a web application for a Roblox Hood game community. The application provides team information, development progress tracking, and user support through Discord integration and a ticket system. Built with a modern gaming aesthetic inspired by Discord and contemporary gaming platforms, it features a dark theme with depth, layering, and dynamic animations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- TanStack Query (React Query) for server state management and caching
- Single-page application (SPA) with client-side routing managed through component state

**UI Component Strategy**
- Radix UI primitives for accessible, unstyled component foundations
- shadcn/ui component library built on top of Radix for consistent design system
- Tailwind CSS for utility-first styling with custom design tokens
- CSS variables for theming (HSL color space for easy manipulation)
- "New York" shadcn style variant selected in components.json

**State Management Approach**
- Local component state with React hooks (useState, useEffect)
- TanStack Query for server data caching and synchronization
- LocalStorage for client-side persistence (tickets, messages, auth tokens, update status)
- No global state management library - relying on prop drilling and query cache

**Design System**
- Dark-first theme with gaming aesthetic
- Custom color palette: Deep navy primary (#00112C), Accent blue (#0075FF), Dark background (#121214)
- Typography: gg sans font stack with fallbacks to system fonts
- 3D depth effects using gradients, shadows, and layering
- Smooth animations and transitions for enhanced user experience

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and routing
- Native Node.js HTTP module wrapped by Express
- TypeScript for type safety across the stack

**API Design**
- RESTful API endpoints under `/api` prefix
- JSON request/response format
- Resource-based routing for tickets and messages
- CRUD operations for ticket management

**Storage Strategy**
- In-memory storage implementation (MemStorage class) as current data layer
- Interface-based storage abstraction (IStorage) for future database migration
- Drizzle ORM configured for PostgreSQL (ready for Neon database integration)
- Schema definitions using Zod for runtime validation and type inference

**Build & Deployment**
- Custom build script using esbuild for server bundling
- Vite for client build optimization
- Bundle allowlist for server dependencies to reduce cold start times
- Separate client and server build outputs in dist directory

### Authentication & Authorization

**Current Implementation**
- Simple password-based admin authentication
- Client-side auth token stored in localStorage (southcentral_staff_auth)
- Session verification through token check on protected routes
- No user registration system - admin access only

**Security Considerations**
- Environment variable for admin password
- Client-side session management (not production-ready for sensitive data)
- Future enhancement: Server-side session management with express-session and connect-pg-simple

### Data Models

**Ticket System**
- Ticket schema: id, ticketNumber, subject, message, status (open/claimed/closed), claimedBy, createdAt
- Message schema: id, ticketId, content, sender (user/staff), timestamp
- Zod schemas for validation with insert and select variants

**Team Structure**
- TeamMember interface: name, role, description, category (owner/coowner/highrank/developer), isHeadDeveloper flag
- Static team data stored in components (no backend persistence)

**Update Progress**
- Simple percentage value stored in localStorage
- UpdateStatus interface with percentage field

## External Dependencies

### UI Component Libraries
- **Radix UI**: Comprehensive suite of unstyled, accessible React components
  - Accordion, Alert Dialog, Avatar, Checkbox, Dialog, Dropdown Menu, Navigation Menu
  - Popover, Progress, Radio Group, Select, Tabs, Toast, Tooltip, and more
- **shadcn/ui**: Pre-styled components built on Radix UI primitives
- **Lucide React**: Icon library for consistent iconography

### Styling & Design
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **class-variance-authority (CVA)**: Type-safe variant handling for components
- **clsx & tailwind-merge**: Conditional class name utilities
- **Autoprefixer & PostCSS**: CSS processing for browser compatibility

### State Management & Data Fetching
- **TanStack Query (React Query)**: Server state management, caching, and synchronization
- **React Hook Form**: Form state management with validation
- **@hookform/resolvers**: Integration between React Hook Form and validation libraries

### Validation & Schema
- **Zod**: TypeScript-first schema validation
- **drizzle-zod**: Zod schema generation from Drizzle ORM schemas

### Database & ORM
- **Drizzle ORM**: Lightweight TypeScript ORM configured for PostgreSQL
- **@neondatabase/serverless**: Serverless Postgres driver for Neon database
- **drizzle-kit**: CLI tool for schema migrations and introspection

### Development & Build Tools
- **Vite**: Next-generation frontend build tool
- **esbuild**: Fast JavaScript bundler for server code
- **tsx**: TypeScript execution engine for development
- **TypeScript**: Static type checking across the application

### Utility Libraries
- **date-fns**: Modern date utility library for JavaScript
- **nanoid**: Compact, secure URL-friendly unique ID generator
- **embla-carousel-react**: Carousel component for React

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error overlay
- **@replit/vite-plugin-cartographer**: Code navigation helper
- **@replit/vite-plugin-dev-banner**: Development environment indicator

### Future Integrations (Configured but Not Implemented)
- **express-session**: Server-side session management
- **connect-pg-simple**: PostgreSQL session store for express-session
- **passport & passport-local**: Authentication middleware (installed but not used)
- **Stripe**: Payment processing (installed but not implemented)
- **OpenAI**: AI integration (installed but not implemented)
- **Nodemailer**: Email sending (installed but not implemented)
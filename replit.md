# ShareSub - Subscription Splitting Platform

A web-based MVP platform that connects users who want to split app subscription costs. The platform facilitates coordination between people but does not handle payments.

## Overview

ShareSub allows users to:
- Create rooms for sharing subscriptions (Netflix, Spotify, Disney+, Amazon Prime, and more)
- Browse and discover available rooms
- Request to join rooms they're interested in
- Chat in real-time with room members
- Manage join requests as a room creator

## Tech Stack

### Frontend
- **React** with TypeScript
- **Wouter** for client-side routing
- **TanStack Query (React Query)** for data fetching and state management
- **Tailwind CSS** + **Shadcn UI** for styling
- **WebSocket** for real-time chat
- **Lucide Icons** and **React Icons** for UI elements
- **date-fns** for date formatting

### Backend
- **Express.js** server
- **PostgreSQL** database (Neon-backed via Replit)
- **Drizzle ORM** for database operations
- **Replit Auth (OpenID Connect)** for authentication
- **WebSocket Server** for real-time communication
- **Passport.js** for session management

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/           # Shadcn UI components
│   │   │   ├── Navigation.tsx
│   │   │   ├── RoomCard.tsx
│   │   │   ├── ChatPanel.tsx
│   │   │   ├── RequestList.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx   # Landing page for logged-out users
│   │   │   ├── Home.tsx      # Browse rooms (logged-in)
│   │   │   ├── CreateRoom.tsx
│   │   │   └── RoomDetail.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts    # Authentication hook
│   │   ├── lib/
│   │   │   ├── authUtils.ts  # Auth error handling
│   │   │   └── queryClient.ts
│   │   └── App.tsx
│   └── index.html
├── server/
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Database operations (IStorage interface)
│   ├── replitAuth.ts      # Replit Auth setup
│   ├── routes.ts          # API routes + WebSocket server
│   └── vite.ts
├── shared/
│   └── schema.ts          # Drizzle schemas & TypeScript types
└── design_guidelines.md   # Design system specification
```

## Database Schema

### Tables

1. **sessions** - Session storage for Replit Auth
   - `sid` (varchar, primary key)
   - `sess` (jsonb)
   - `expire` (timestamp)

2. **users** - User accounts
   - `id` (varchar, primary key, UUID)
   - `email` (varchar, unique)
   - `firstName` (varchar)
   - `lastName` (varchar)
   - `profileImageUrl` (varchar)
   - `createdAt` (timestamp)
   - `updatedAt` (timestamp)

3. **rooms** - Subscription sharing rooms
   - `id` (varchar, primary key, UUID)
   - `appName` (varchar) - e.g., "Netflix", "Spotify"
   - `totalSeats` (integer) - Maximum members
   - `occupiedSeats` (integer) - Current members
   - `pricePerSeat` (integer) - Stored in cents
   - `creatorId` (varchar, foreign key → users.id)
   - `createdAt` (timestamp)

4. **joinRequests** - Requests to join rooms
   - `id` (varchar, primary key, UUID)
   - `roomId` (varchar, foreign key → rooms.id)
   - `userId` (varchar, foreign key → users.id)
   - `status` (varchar) - "pending", "accepted", or "declined"
   - `createdAt` (timestamp)

5. **messages** - Chat messages
   - `id` (varchar, primary key, UUID)
   - `roomId` (varchar, foreign key → rooms.id)
   - `userId` (varchar, foreign key → users.id)
   - `content` (text)
   - `createdAt` (timestamp)

### Relations
- Users can create multiple rooms
- Users can send multiple join requests
- Users can post multiple messages
- Rooms have one creator
- Rooms have many join requests
- Rooms have many messages

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow (redirects to Replit Auth)
- `GET /api/logout` - Log out and clear session
- `GET /api/callback` - OAuth callback handler
- `GET /api/auth/user` - Get current authenticated user

### Rooms
- `GET /api/rooms` - List all rooms (with creator info)
- `GET /api/rooms/:id` - Get room details
- `POST /api/rooms` - Create a new room (authenticated)

### Join Requests
- `GET /api/rooms/:id/requests` - Get join requests for a room
- `POST /api/join-requests` - Create a join request (authenticated)
- `PATCH /api/join-requests/:id` - Accept or decline a join request (room creator only)

### Messages
- `GET /api/rooms/:id/messages` - Get messages for a room

## WebSocket Protocol

WebSocket connection: `ws://[host]/ws` or `wss://[host]/ws`

### Client → Server Messages

**Join Room:**
```json
{
  "type": "join",
  "roomId": "uuid",
  "userId": "uuid"
}
```

**Send Message:**
```json
{
  "type": "sendMessage",
  "roomId": "uuid",
  "userId": "uuid",
  "content": "message text"
}
```

### Server → Client Messages

**New Message:**
```json
{
  "type": "message",
  "roomId": "uuid",
  "message": {
    "id": "uuid",
    "content": "message text",
    "userId": "uuid",
    "user": { /* user object */ },
    "createdAt": "timestamp"
  }
}
```

## Key Features

### 1. User Authentication
- Powered by Replit Auth (OpenID Connect)
- Supports Google, GitHub, email/password, and more
- Sessions stored in PostgreSQL for persistence
- Automatic token refresh

### 2. Room Management
- Create rooms with custom settings:
  - App selection (Netflix, Spotify, Disney+, Amazon Prime, Others)
  - Total seats (2-10)
  - Price per seat (display only)
- Unique room ID for each room
- Status badges: Available (green), Limited (orange), Full (red)
- Progress bar showing seat occupancy

### 3. Room Discovery
- Browse all active rooms on the home page
- See key details at a glance:
  - App name with icon
  - Available/total seats
  - Price per seat
  - Unique room ID
- One-click "Request to Join" button

### 4. Join Request System
- Users can request to join any room with available seats
- Room creators see all join requests in a dedicated panel
- Requests show:
  - Requester name and email
  - Profile picture
  - Time since request
  - Status badge ("Pending", "Accepted", or "Declined")
- Room creators can accept or decline requests with dedicated buttons
- Accepting a request:
  - Updates the request status to "accepted"
  - Increments the room's occupied seats counter
  - Prevents oversubscription (blocks acceptance if room is full)
- Declining a request updates status to "declined"

### 5. Real-Time Chat
- WebSocket-based instant messaging
- Message bubbles with:
  - User avatar
  - Username
  - Timestamp (relative, e.g., "2 minutes ago")
  - Own messages aligned right (primary color)
  - Other messages aligned left (muted background)
- Auto-scroll to latest message
- Connection status indicator
- Empty state for new rooms

### 6. Design System
- **Colors:** Blue primary (#4A90E2), green for available, orange for limited, red for full
- **Typography:** Inter for UI, JetBrains Mono for room IDs
- **Dark mode:** Full support with theme toggle
- **Responsive:** Mobile-first design, works on all screen sizes
- **Accessibility:** Proper contrast ratios, semantic HTML, keyboard navigation

## Environment Variables

Required (automatically set by Replit):
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit application ID
- `REPLIT_DOMAINS` - Comma-separated list of domains

Optional (with defaults):
- `ISSUER_URL` - OIDC issuer (defaults to https://replit.com/oidc)

## Development Commands

- `npm run dev` - Start development server (frontend + backend)
- `npm run db:push` - Push database schema changes
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## User Journeys

### Create a Room
1. Log in via Replit Auth
2. Click "Create Room" in navigation
3. Select an app from the grid
4. Set total seats and price per seat
5. Click "Create Room"
6. Redirected to room detail page

### Join a Room
1. Log in via Replit Auth
2. Browse rooms on home page
3. Click on a room card or "Request to Join"
4. View room details and chat
5. Room creator receives notification

### Chat in a Room
1. Navigate to room detail page
2. Type message in chat input
3. Press Enter or click Send
4. Message appears instantly for all connected users
5. Messages persist in database

### Manage Join Requests (Room Creator)
1. Create a room
2. Navigate to room detail page
3. See "Join Requests" panel on right side
4. View all requests with user details and status
5. Click "Accept" to approve a request (increments occupied seats)
6. Click "Decline" to reject a request
7. System prevents accepting more requests than available seats
8. Coordinate with requesters via chat

## Design Highlights

- **Clean, modern interface** with card-based layouts
- **Intuitive navigation** with clear visual hierarchy
- **Beautiful empty states** encouraging user action
- **Loading skeletons** for better perceived performance
- **Toast notifications** for user feedback
- **Hover and active states** with subtle elevation effects
- **Status badges** color-coded for quick understanding
- **Progress bars** for visual seat availability
- **Real-time updates** without page refresh

## Recent Changes

**October 18, 2025:**
- ✅ Implemented join request accept/decline functionality
- ✅ Added status tracking for join requests (pending, accepted, declined)
- ✅ Implemented seat increment logic when requests are accepted
- ✅ Added oversubscription protection (prevents accepting when room is full)
- ✅ Fixed critical bugs in PATCH endpoint and storage methods
- ✅ Enhanced RequestList component with Accept/Decline buttons
- ✅ All core MVP features now fully functional and tested

## Future Enhancements (Not in MVP)

- Room expiration and archiving
- User profiles with subscription history
- Search and filtering by app type, price range
- Email notifications for join requests
- Room editing capabilities
- Payment integration (currently coordination-only)
- User ratings and reviews
- Private rooms with invite codes
- Automated integration tests with Playwright

## Notes

- **No payment processing** - The platform only connects people; users handle payments externally
- **Real-time updates** - Chat messages and join request notifications use WebSockets
- **Persistent data** - All data stored in PostgreSQL database
- **Secure authentication** - Replit Auth with session storage in database
- **Responsive design** - Works seamlessly on mobile, tablet, and desktop

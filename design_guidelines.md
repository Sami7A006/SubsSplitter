# Design Guidelines: Subscription Splitting Platform MVP

## Design Approach

**Selected Approach:** Design System - Material Design Inspired
**Justification:** This utility-focused platform prioritizes clarity, efficiency, and trust. Users need to quickly understand room availability, manage requests, and communicate seamlessly. A clean, systematic approach ensures consistency across room listings, chat interfaces, and management dashboards.

**Key Design Principles:**
- Clarity First: Every element serves a clear purpose in facilitating room discovery and coordination
- Trust Through Transparency: Clean layouts that clearly show room details, pricing, and availability
- Efficient Navigation: Minimal clicks between browsing rooms, requesting to join, and managing requests
- Real-time Feedback: Immediate visual updates for chat and notifications

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 217 91% 60% (Blue - trust, reliability)
- Primary Hover: 217 91% 50%
- Surface: 0 0% 100% (White cards/backgrounds)
- Background: 220 14% 96% (Subtle gray page background)
- Text Primary: 220 13% 13%
- Text Secondary: 220 9% 46%
- Border: 220 13% 91%
- Success (Available Seats): 142 71% 45%
- Warning (Limited Seats): 38 92% 50%
- Danger (Full): 0 84% 60%

**Dark Mode:**
- Primary: 217 91% 60%
- Primary Hover: 217 91% 70%
- Surface: 220 13% 18% (Dark cards)
- Background: 220 13% 13% (Darker page background)
- Text Primary: 0 0% 98%
- Text Secondary: 220 9% 70%
- Border: 220 13% 25%
- Success: 142 71% 45%
- Warning: 38 92% 50%
- Danger: 0 84% 60%

### B. Typography

**Font Family:** 
- Primary: 'Inter' (Google Fonts) - clean, modern, excellent readability
- Monospace: 'JetBrains Mono' (for room IDs)

**Type Scale:**
- Page Headings: 2.25rem (36px), weight 700, tight leading
- Section Headings: 1.5rem (24px), weight 600
- Card Titles: 1.125rem (18px), weight 600
- Body Text: 1rem (16px), weight 400
- Small Text (metadata): 0.875rem (14px), weight 400
- Room IDs: 0.813rem (13px), monospace, weight 500

### C. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Component internal padding: p-4 to p-6
- Card spacing: gap-4
- Section spacing: py-12 to py-16
- Page margins: px-4 (mobile), px-6 (tablet), px-8 (desktop)

**Container Strategy:**
- Max width: max-w-7xl for main content
- Room grid: max-w-6xl
- Chat interface: max-w-4xl
- Forms: max-w-md

**Grid Layouts:**
- Room Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Dashboard Stats: grid-cols-2 lg:grid-cols-4, gap-4

---

## D. Component Library

### Navigation
- Fixed top navigation bar with logo left, auth actions right
- Height: h-16
- Background: Surface color with subtle border-bottom
- Include: Platform name/logo, "Browse Rooms", "My Rooms", "Create Room", User profile/logout
- Mobile: Hamburger menu for collapsed navigation

### Room Cards
- White/dark surface with rounded corners (rounded-lg)
- Padding: p-6
- Shadow: subtle elevation (shadow-sm hover:shadow-md transition)
- Structure:
  - App logo/icon (h-12 w-12, rounded)
  - App name (card title weight)
  - Seats indicator with progress bar showing filled/total
  - Price per seat (prominent, larger text)
  - Room ID in monospace font with copy button
  - "Request to Join" button (primary color, full width at bottom)
- Status badges: Green (Available), Orange (Limited <3 seats), Red (Full) with subtle background

### Chat Interface
- Split layout: Room details sidebar (w-80) + Chat area (flex-1)
- Message bubbles:
  - Own messages: align right, primary color background, white text
  - Others: align left, light gray background, dark text
  - Include avatar circle (w-8 h-8), username above, timestamp below (text-xs)
  - Rounded corners: rounded-2xl
  - Padding: px-4 py-2
- Input area: Fixed bottom, bg-surface, input field + send button (icon)
- Auto-scroll to latest message

### Dashboard/Management
- Two-column layout on desktop: Room list sidebar + Request details
- Request cards showing:
  - Requester username and timestamp
  - "View Profile" option
  - Status indicator (pending)
- Empty state with helpful illustration/icon when no requests

### Forms (Create Room)
- Clean vertical form layout
- App selection: Large icon buttons in grid (grid-cols-2 md:grid-cols-3)
- Input fields: Border style, focus:ring primary color
- Number inputs for seats and price with clear labels
- Submit button: Primary color, full width on mobile, auto on desktop

### Buttons
- Primary: bg-primary, text-white, rounded-lg, px-6 py-3
- Secondary: border-2 border-primary, text-primary, rounded-lg, px-6 py-3
- Small buttons: px-4 py-2, text-sm
- Icon buttons: Square, padding p-2, hover:bg-gray-100
- Disabled state: opacity-50, cursor-not-allowed

### Notifications/Toasts
- Top-right positioned (fixed)
- Slide-in animation
- Color coded: Success (green), Info (blue), Error (red)
- Include icon, message, close button
- Auto-dismiss after 5 seconds

### Data Display
- Tables for request logs: Striped rows, hover highlight
- Progress bars: Rounded-full, height h-2, bg-gray-200, fill with appropriate status color
- Badges: inline-flex, rounded-full, px-3 py-1, text-xs

---

## E. Animations

**Minimal, purposeful animations only:**
- Card hover: slight scale (scale-105) with shadow increase
- Button press: subtle scale-down (active:scale-95)
- Page transitions: Simple fade-in
- Chat message entry: Slide-up from bottom
- Toast notifications: Slide-in from right
- No background animations, parallax, or decorative motion

---

## Images

**App Logos/Icons:** 
- Use official app logos for Netflix, Spotify, Disney+, Amazon Prime (download from official brand resources)
- Consistent size: 48x48px for cards, 32x32px for lists
- Background: Slight shadow or border for visual consistency

**Empty States:**
- Simple SVG illustrations for "No rooms available", "No requests yet"
- Friendly, minimalist style (Undraw or similar)
- Centered with descriptive text below

**No Hero Image:** This is a utility app focused on immediate functionality. Homepage leads directly with room discovery grid rather than marketing-style hero section.
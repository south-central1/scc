# South Central - Design Guidelines

## Design Approach
Modern 3D gaming aesthetic inspired by Discord and contemporary gaming platforms. Focus on depth, layering, and dynamic animations to create an immersive experience for the Roblox Hood game community.

## Color Palette
- **Primary Dark**: #00112C (Deep navy for headers/accents)
- **Accent Blue**: #0075FF (CTAs, links, interactive elements)
- **Background**: #121214 (Primary dark background)
- **Text**: #FFFFFF (High contrast on dark)
- **Card Backgrounds**: Subtle gradients with rgba overlays for 3D depth

## Typography
- **Font Family**: gg sans, Noto Sans, Helvetica Neue, Arial (sans-serif stack)
- **Headings**: 24px bold for section titles
- **Body**: 16px regular for descriptions
- **Team Names**: 20px semibold
- **Roles**: 14px uppercase tracking-wide for labels

## Layout Structure

### Navigation Header
- Horizontal navigation with three dropdown menus: Main, Next Update, Support
- Logo (South Central text logo) left-aligned
- Sticky header with backdrop blur effect
- Admin Login button right-aligned with subtle glow effect

### Main Page - Team Section
- Expandable accordion-style sections with smooth height transitions
- Four categories: Owners → Co-owners → High Ranks → Developers
- Each team member card features:
  - Avatar placeholder (circular, 80px)
  - Name (bold)
  - Role badge (colored tag)
  - Short description (2-3 lines, muted text)
- Special highlighting for Head Developer (Abdz)
- Click-to-expand with smooth slide-down animation

### Next Update Page
- Large centered progress section
- Status indicator: "50%" text (or current percentage)
- Animated progress bar:
  - Track: rgba white 10% opacity
  - Fill: Accent blue with glow effect
  - Dynamic width based on percentage value
- Below bar: "The update progress is: [X%]" in secondary text
- Fade-in animation on page load

### Support Page
- Two-column layout on desktop (single column mobile)
- Left: Discord support card with icon and join button
- Right: Ticket creation panel
  - Simple form with subject/message fields
  - "Create Ticket" button with loading state
- Active tickets display below with status badges

### Staff Panel (Admin Login)
- Password prompt modal (centered overlay)
- Upon authentication: New tab/page labeled "Staff"
- Ticket queue display:
  - Each ticket as a card showing ID (Ticket-[5 digits])
  - Preview of message
  - "View" button opens full ticket interface
- Individual ticket view:
  - Two-column chat interface (staff left, user right)
  - Real-time message display
  - Claim button (yellow) and Close button (red) at top
  - Sound notification icon indicator

## 3D Effects & Depth
- **Card Shadows**: Multi-layered shadows (0 4px 6px, 0 10px 20px with different opacities)
- **Gradients**: Subtle radial gradients on cards from center
- **Transforms**: translateZ for hover effects, scale(1.02) on interaction
- **Glass Morphism**: Backdrop filters on modals and overlays (blur 20px)
- **Perspective**: Apply to parent containers for 3D card tilts

## Animation System
- **Fade In**: Opacity 0→1 with translateY(20px)→0, duration 0.6s
- **Pop Effect**: Scale 0.9→1 with spring easing
- **Slide Down**: Max-height transitions for accordions
- **Progress Bar**: Width animation over 1.5s with ease-out
- **Stagger**: Sequential delays of 0.1s between list items

## Icons
- **Custom SVG Icons**: Use geometric, line-based style matching gaming aesthetic
- **Icon Types Needed**: Team (users), Update (rocket/clock), Support (headset), Admin (shield), Close (X), Claim (hand), Send (arrow)
- **Size**: 24px standard, 32px for headers

## Component Specifications

### Buttons
- Primary: Accent blue background, white text, 8px border radius
- Secondary: Transparent with blue border
- Hover: Brightness increase + subtle scale
- Active tickets sound: Include speaker icon that pulses

### Input Fields
- Dark background with subtle border (#CCCCCC at 20% opacity)
- Focus: Accent blue border with glow
- 8px border radius
- Padding: 12px 16px

### Progress Bar
- Height: 24px
- Border radius: 12px (pill shape)
- Percentage text overlay in center (white, bold)
- Glow effect on fill using box-shadow

### Ticket Cards
- Rounded corners (12px)
- Gradient background (subtle)
- Border: 1px solid rgba(255,255,255,0.1)
- Ticket ID badge top-right corner
- Status indicator dot (green=active, gray=closed)

## Responsive Behavior
- Desktop: Multi-column layouts, side-by-side chat
- Tablet: Stack support columns
- Mobile: Single column, hamburger menu for navigation

## Images
- **Logo**: South Central text logo in header (provided)
- **Avatars**: Circular placeholders for team members (80px diameter)
- **Background**: Optional subtle pattern overlay on main background
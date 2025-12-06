# Cryptocurrency Trading Platform Design Guidelines

## Design Approach

**Selected Approach:** Design System with Reference Inspiration

Drawing from leading crypto platforms (Coinbase, Binance, Kraken) and financial dashboards (Robinhood, Interactive Brokers), prioritizing data density, quick information access, and trust-building UI patterns. This is a utility-focused application where efficiency and clarity are paramount.

## Typography System

**Font Selection:** Inter or System UI fonts via Google Fonts CDN
- **Display/Headers:** 32px, 24px, 20px (font-weight: 700)
- **Body/Primary:** 16px, 14px (font-weight: 400-500)
- **Data/Numbers:** 18px, 16px, 14px (font-weight: 600) - tabular numbers enabled
- **Labels/Secondary:** 12px, 11px (font-weight: 500)
- **Price Changes:** Same as data sizes but with +/- indicators

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4, p-6, p-8
- Section gaps: gap-4, gap-6, gap-8
- Card spacing: m-4, m-6
- Tight data rows: py-2, py-3

**Grid Structure:**
- Dashboard: 12-column grid with sidebar (256px fixed width)
- Responsive: Stack to single column below 1024px
- Chart containers: 8-12 columns width for primary charts
- Stat cards: 3-4 columns on desktop, full width on mobile

## Core Components

### Navigation & Layout
**Sidebar Navigation** (Desktop):
- Fixed left sidebar (w-64)
- Logo/branding at top
- Icon + label navigation items
- Active state highlighting
- Sticky position
- Collapsible on tablet/mobile to hamburger menu

**Top Bar:**
- Wallet balance summary (total portfolio value)
- Quick actions (Buy, Sell, Convert buttons)
- User profile/settings icon
- Search cryptocurrency input
- Height: h-16

### Dashboard Components

**Portfolio Summary Cards:**
- Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Each card shows: Label, Large number, Percentage change, Trend indicator
- Compact design with clear visual hierarchy

**Price Chart Widget:**
- Full-width primary section
- Time interval buttons (1H, 24H, 7D, 30D, 1Y)
- Current price prominent at top-left
- Price change percentage next to current price
- Chart fills remaining height (min-h-96)
- Use chart library via CDN (Chart.js or Lightweight Charts)

**Asset List Table:**
- Headers: Asset | Price | 24h Change | Holdings | Value | Actions
- Sortable columns
- Row height: h-14 to h-16
- Icon + symbol + name for each crypto
- Inline action buttons (Buy/Sell)
- Alternating row treatment for readability

**Transaction History:**
- Reverse chronological list
- Each row: Date/Time | Type (Buy/Sell/Convert) | Asset | Amount | Price | Status
- Filtering options at top (Date range, Type, Asset)
- Pagination for long lists

### Trading Interface

**Buy/Sell Modal:**
- Centered modal (max-w-lg)
- Toggle between Buy/Sell tabs
- Cryptocurrency selector dropdown
- Amount input with currency toggle (USD/Crypto)
- Price display (current market price)
- Total calculation preview
- Prominent CTA button
- Fee breakdown
- Balance available shown clearly

**Conversion Tool:**
- Two-column layout
- "From" crypto selector + amount input
- "To" crypto selector + calculated amount
- Swap direction button between columns
- Current exchange rate display
- Conversion preview with fees

### Wallet Section

**Multi-Wallet Display:**
- Card-based layout per cryptocurrency
- Each card: Icon, Symbol, Full name, Balance, USD value, Percentage of portfolio
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Action buttons per wallet (Send, Receive, Convert)

### Settings Panel

**Organized Sections:**
- Currency preferences
- Notification settings (toggle switches)
- Display preferences
- Security settings (2FA placeholder)
- Each section with clear headers and dividers
- Form inputs follow consistent styling

## Interactive Elements

**Buttons:**
- Primary actions: Larger size (h-12), full-width on mobile
- Secondary actions: Medium size (h-10)
- Icon buttons: Square (w-10 h-10)
- No custom hover states needed (component handles this)

**Form Inputs:**
- Text inputs: h-12, consistent border treatment
- Dropdowns: Custom styled with chevron icon
- Toggle switches: For binary settings
- All inputs with clear labels and helper text

**Data Visualization:**
- Use Chart.js or similar via CDN
- Candlestick/line charts for price history
- Donut chart for portfolio distribution
- Bar charts for transaction volume

## Icon System

**Selected Library:** Heroicons via CDN
- Navigation: Home, chart, wallet, history, settings icons
- Actions: Plus, minus, swap, search icons
- Status: Arrow up/down for price changes, checkmark, warning
- Size variants: 16px, 20px, 24px

## Responsive Behavior

**Breakpoints:**
- Mobile (< 768px): Single column, hamburger menu, stacked cards
- Tablet (768px - 1024px): 2-column grids, condensed sidebar
- Desktop (> 1024px): Full multi-column layout, expanded sidebar

**Mobile Optimizations:**
- Bottom navigation bar for primary actions
- Swipeable tabs for switching between sections
- Simplified charts (fewer data points)
- Condensed table view (hide less critical columns)

## Images

**No hero image needed** - this is a dashboard application prioritizing immediate data access.

**Asset Icons:**
- Use crypto icon library via CDN (Cryptocurrency Icons)
- Size: 32px for lists, 48px for featured displays
- Fallback to symbol initials if icon unavailable

**Empty States:**
- Simple illustration or icon for "No transactions yet"
- "Get started" prompt for empty wallet
- Keep minimal and not distracting

## Accessibility

- All interactive elements keyboard navigable
- ARIA labels for icon-only buttons
- Clear focus states (consistent ring treatment)
- Sufficient contrast for all text (especially important for green/red price indicators)
- Form validation messages clearly visible
- Loading states for async data fetching

## Animation Guidelines

**Minimal, Purposeful Animations:**
- Page transitions: None (instant)
- Number changes: CountUp animation for dramatic portfolio value changes only
- Chart rendering: Smooth entry (300ms ease)
- Modal appearance: Fade in (200ms)
- Avoid: Scroll animations, parallax, decorative motion
# FarmHaul – User Platform Upgrade

## Current State
- Internet Identity auth is fully implemented
- Backend has user profiles, activity logging APIs, and transport request CRUD
- UserDashboard exists at /dashboard with history, search, filter, favorites
- Navbar has: Home, Dashboard, Track Order, Stats, My History (logged-in only)
- All pages guard with login prompt
- i18n: English, Hindi, Kannada

## Requested Changes (Diff)

### Add
- Profile Page at /profile: name, role, ICP identity, join date, inline name edit (updateDisplayName), role switch (switchRole + refreshProfile), loading/success states
- Share button on FarmerDashboard request cards: copies /track/{index} URL to clipboard with toast
- Profile nav link (User icon, logged-in only)

### Modify
- Navbar: add Profile link, rename "My History" to "My Dashboard", update mobile menu
- UserDashboard: add Saved Outputs section (favorited activities), add quick-action buttons
- translations.ts: add nav_profile and nav_my_dashboard in en/hi/kn
- App.tsx: add /profile route

### Remove
- Nothing

## Implementation Plan
1. Create ProfilePage.tsx
2. Add /profile route in App.tsx
3. Update Navbar.tsx - Profile link + rename My History
4. Update translations.ts - new keys
5. Update UserDashboard.tsx - Saved Outputs section + quick actions
6. Update FarmerDashboard.tsx - share-link button on request cards
7. Validate and build

# FarmHaul - User Activity History System

## Current State
- Internet Identity authentication (ICP-native, no Google/email+OTP - not supported on this platform)
- UserProfile: displayName + role (farmer/driver)
- TransportRequests, chat messages, driver portfolio
- Authorization mixin for role-based access

## Requested Changes (Diff)

### Add
- `ActivityRecord` type in backend: id, userId (Principal), action (Text), inputData (Text), outputData (Text), timestamp, isFavorite (Bool)
- Backend methods: `logActivity`, `getMyActivities`, `deleteActivity`, `toggleFavorite`, `clearAllActivities`
- Activity is automatically logged on key user actions (create request, accept request, status update, etc.)
- New `/dashboard` route with a unified user activity history page
- Dashboard features: list history as cards/table, search by text, filter by favorite, delete individual entries, toggle bookmark/favorite, "re-run" button that pre-fills the farmer form with past request data
- User profile section on dashboard showing name, role, principal ID, and join date

### Modify
- Backend: existing `createTransportRequest`, `acceptRequest`, `updateRequestStatus` to also log activity records
- App.tsx: add `/dashboard` route
- Navbar: add Dashboard link for logged-in users

### Remove
- Nothing removed

## Implementation Plan
1. Extend Motoko backend with ActivityRecord type and CRUD operations
2. Auto-log activities on key actions in existing backend functions
3. Add `/dashboard` page with profile card, search bar, activity history table/cards
4. Implement search/filter, favorite toggle, delete, and re-run from history
5. Link dashboard from Navbar for authenticated users

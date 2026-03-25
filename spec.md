# FarmHaul

## Current State
Farmers can create transport requests with a scheduled time. Drivers see pending requests and can accept any pending request at any time. Farmers can view their requests but cannot delete them.

## Requested Changes (Diff)

### Add
- `deleteRequest(requestId)` backend function: allows only the request's farmer to delete a pending request
- Delete button on each farmer request card (only for pending requests)
- Time-gate on driver's Accept button: driver can only accept a request when current time is within ±2 minutes of the scheduledTime, or at the exact scheduledTime; otherwise the button is disabled with a tooltip showing how long until acceptance opens

### Modify
- DriverDashboard: Accept button shows countdown/disabled state until within the 2-minute acceptance window
- FarmerDashboard: Each pending request card gains a trash/delete button; confirmed via a small inline confirm or direct click

### Remove
- Nothing removed

## Implementation Plan
1. Add `deleteRequest` to backend main.mo — checks caller is the farmer and status is pending, then removes the entry
2. Regenerate backend bindings (handled by generate_motoko_code)
3. Add `useDeleteRequest` mutation hook in useQueries.ts
4. FarmerDashboard: add delete button with trash icon on pending request cards
5. DriverDashboard: compute whether each request is within acceptance window (scheduledTime ± 2 min from now); disable Accept button with remaining time when outside window; use a setInterval to re-check every 10s

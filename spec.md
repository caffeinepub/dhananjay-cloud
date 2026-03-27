# Phone Vault

## Current State
New project — no existing application files.

## Requested Changes (Diff)

### Add
- Lock screen with PIN pattern (3x3 grid pattern lock + fallback PIN entry)
- Full contact data store: name, phone numbers (multiple), email, address, birthday, notes, photo placeholder
- Contact list view with search/filter
- Contact detail view
- Add/edit/delete contacts
- Authorization so contacts are stored per-user

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Select authorization + blob-storage components
2. Generate Motoko backend with contact CRUD APIs
3. Build frontend: lock screen (pattern lock + PIN), contact list, contact detail, add/edit form

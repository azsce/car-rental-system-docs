# [infra] Bootstrap app/layout.tsx with real app shell

- **Labels:** `frontend`, `infrastructure`, `phase-1`
- **Milestone:** Phase 1 — Site looks alive
- **Due date:** 2026-03-13
- **Priority:** 🔴 Blocker — must be done before any other page

## Overview

`frontend/app/layout.tsx` is still the unmodified `create-next-app` boilerplate
(Geist fonts, title "Create Next App"). No page will look correct until this is
replaced with the real app shell.

## Acceptance Criteria

- [ ] Replace boilerplate `<title>` / metadata with real product name & description
- [ ] Add global providers: theme, auth context, react-query client, toast/notification provider
- [ ] Add `<Navbar />` component (responsive, shows Sign In / user avatar menu)
- [ ] Add `<Footer />` skeleton (links, copyright)
- [ ] Add cookie-consent banner stub (can be empty component for now)
- [ ] Configure baseline SEO `<meta>` tags (description, og:image placeholder)
- [ ] Geist font or design-system font properly wired up

## File

`frontend/app/layout.tsx`

## Notes

Every other page inherits this layout. Do not merge any page PR until this is done.

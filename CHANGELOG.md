# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versioning follows [Semantic Versioning](https://semver.org/).

---

## [Unreleased]

### Added

- 

### Fixed

- 

---

## [0.2.0] - Google OAuth Integration

### Added

- Google OAuth provider setup guide for Google Cloud Console and
  Supabase configuration in `docs/setup.md`
- Public `/auth/callback` splash route for Supabase OAuth redirects
- `loginWithGoogle()` in `AuthProvider` for shared Google OAuth startup
- Reusable `GoogleAuthButton` component plus Google sign-in integration
  in `LoginForm` and `SignupForm`
- Avatar rendering for OAuth users in `ProfilePage` and `UserRow`
- Username completion flow for first-time Google OAuth users through
  `/auth/complete-profile`
- `provider` and `username_confirmed` tracking in `public.users`
- Focused OAuth test coverage for callback routing, auth provider,
  shared button, forms, and profile completion

### Changed

- `handle_new_user()` now derives OAuth-safe usernames and stores
  `avatar_url`
- `userApi` now returns OAuth profile fields and supports username
  completion updates
- Architecture and testing docs now describe the full Google OAuth
  lifecycle, mock patterns, and setup requirements

### Fixed

- Full client suite blocker caused by the hanging
  `ReturnHomeButton.test.jsx` case

---

## [0.1.0] - Initial Release

### Added

- React + Express full-stack template
- JWT authentication with HttpOnly cookies and Passport.js
- Role-based access control: USER, ADMIN, SUPER_ADMIN
- AuthProvider, ThemeProvider, ToastProvider global context
- AuthRoute and AdminRoute protected route guards
- UserManagementPage with TableContainer, UserRow, UserRowActions
- ProfilePage, UserDashboard, AdminDashboard
- Prisma ORM with PostgreSQL - users model with role enum
- Full REST API for auth, user, admin domains
- Vitest + RTL client test suite
- Vitest + Supertest server integration tests
- ESLint + Prettier configuration
- VS Code workspace tasks and extension recommendations

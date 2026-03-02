# Feature: Account Lifecycle Management

## Overview

Account Lifecycle Management handles the various states an account can be in throughout its existence, from creation through verification, activation, suspension, and expiration. This feature includes automatic state transitions, temporary account support for guest checkout, and proper cleanup of expired accounts.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-009: Account Lifecycle Management

## User Stories

### As a user
- I want my account to be verified after email confirmation so that I have full access
- I want to complete guest checkout without registration so that I can book quickly
- I want my temporary account converted to permanent after payment so that I don't lose my booking

### As a system administrator
- I want accounts to transition through defined states so that account status is clear
- I want expired temporary accounts automatically deleted so that the database stays clean
- I want suspended accounts to be manageable so that security issues can be addressed

## Backend Specifications

### Account States

**State Definitions**:
1. **Created**: User record exists in database (initial state)
2. **Unverified**: Email not yet verified (limited access)
3. **Verified**: Email confirmed (full access for social login users)
4. **Active**: Account is active and usable (standard state)
5. **Suspended**: Account temporarily disabled (security investigation, payment dispute)
6. **Expired**: Temporary account expired (scheduled for deletion)

**State Transitions**:
- Created → Unverified (email/password registration)
- Created → Verified (social login with verified email)
- Unverified → Verified (email verification link clicked)
- Verified → Active (account activated)
- Active → Suspended (security event, admin action)
- Suspended → Active (issue resolved)
- Unverified → Expired (verification timeout, typically 7 days)
- Expired → Deleted (automatic cleanup)

### API Endpoints

**POST /api/auth/register**
- Creates account in "unverified" state
- Sends verification email
- Sets expiration for temporary accounts

**GET /api/auth/verify-email/:token**
- Transitions account from "unverified" to "verified"
- Removes expiration timestamp

**POST /api/admin/accounts/:id/suspend**
- Transitions account to "suspended" state
- Requires admin authentication
- Logs suspension reason

**POST /api/admin/accounts/:id/activate**
- Transitions account from "suspended" to "active"
- Requires admin authentication

**POST /api/auth/guest-checkout**
- Creates temporary account with expiration
- Account state: "unverified"
- Expiration: 24 hours from creation

### Business Logic

**Temporary Account Creation**:
1. Create user record with minimal information
2. Set account_type to "temporary"
3. Set expires_at to 24 hours from now
4. Allow booking without email verification
5. If payment succeeds: Remove expiration, convert to permanent
6. If payment fails or expires: Mark for deletion

**Automatic State Transitions**:
1. Scheduled job runs every hour
2. Find accounts in "unverified" state older than 7 days
3. Transition to "expired" state
4. Find accounts in "expired" state older than 30 days
5. Permanently delete expired accounts

**Account Suspension Logic**:
1. Admin or automated system triggers suspension
2. Update account_status to "suspended"
3. Log suspension reason and timestamp
4. Revoke all active sessions
5. Send notification email to user
6. Prevent new logins until reactivated

## Database Specifications

### Schema Changes

**users table** (add columns):
```sql
ALTER TABLE users
ADD COLUMN account_status ENUM('created', 'unverified', 'verified', 'active', 'suspended', 'expired') DEFAULT 'created',
ADD COLUMN account_type ENUM('permanent', 'temporary') DEFAULT 'permanent',
ADD COLUMN expires_at TIMESTAMP NULL,
ADD COLUMN suspended_at TIMESTAMP NULL,
ADD COLUMN suspension_reason TEXT NULL,
ADD COLUMN activated_at TIMESTAMP NULL;
```

**account_state_history table** (new):
```sql
CREATE TABLE account_state_history (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  from_state ENUM('created', 'unverified', 'verified', 'active', 'suspended', 'expired'),
  to_state ENUM('created', 'unverified', 'verified', 'active', 'suspended', 'expired') NOT NULL,
  reason TEXT,
  changed_by VARCHAR(36),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_changed_at (changed_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Definitions

**users table additions**:
- account_status: Current state of the account
- account_type: Permanent or temporary account
- expires_at: Expiration timestamp for temporary accounts
- suspended_at: When account was suspended
- suspension_reason: Reason for suspension
- activated_at: When account was activated

**account_state_history table**:
- Tracks all state transitions for audit trail
- Records who made the change and why
- Enables state transition analysis

## Technology Stack

- Backend: .NET 8+ with C# (ASP.NET Core Web API)
- Database: MySQL 8.0+
- Scheduled Jobs: Hangfire or similar
- Email Service: SendGrid, AWS SES

## Dependencies

- F-SEC-AUTH-001: Email/Password Authentication
- F-SEC-AUTH-006: Token-Based Session Management
- Email notification service
- Scheduled job infrastructure

## Acceptance Criteria

1. Accounts transition through defined states correctly
2. Email verification moves account from "unverified" to "verified"
3. Temporary accounts are created for guest checkout
4. Temporary accounts expire after 24 hours if payment fails
5. Successful payment converts temporary to permanent account
6. Unverified accounts expire after 7 days
7. Expired accounts are automatically deleted after 30 days
8. Account suspension revokes all active sessions
9. State transitions are logged in history table
10. Suspended accounts cannot log in until reactivated


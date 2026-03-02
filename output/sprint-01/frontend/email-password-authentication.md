# Feature: Email/Password Authentication

## Overview

Traditional credential-based authentication system that enables users to create accounts and securely log in using email addresses and passwords. This foundational authentication method provides secure password hashing using bcrypt or Argon2, email verification workflows, password reset capabilities, and encrypted session management. The system supports both standard and extended session durations with configurable "stay connected" options.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-001: Email/Password Authentication

## User Stories

### Registration and Account Creation

**As a new user**, I want to create an account with my email and password, so that I can access the car rental platform and manage my bookings.

**Acceptance Criteria**:
- User can register with valid email address and password
- Password must meet minimum security requirements (6+ characters, support for passphrases)
- System sends verification email with time-limited activation link
- User cannot access full platform features until email is verified
- System prevents duplicate registrations with same email address
- Registration form provides real-time validation feedback

### Secure Login

**As a registered user**, I want to log in securely with my email and password, so that I can access my account and personal information.

**Acceptance Criteria**:
- User can log in with verified email and correct password
- System validates credentials against securely hashed passwords
- Failed login attempts are tracked and rate-limited
- Account lockout occurs after multiple failed attempts (5 failures = 30-minute lockout)
- Successful login creates encrypted session token
- User can choose "stay connected" option for extended sessions (up to 400 days)

### Password Reset

**As a user who forgot my password**, I want to reset it securely via email, so that I can regain access to my account.

**Acceptance Criteria**:
- User can request password reset from login page
- System sends time-limited reset token to registered email (valid for 1 hour)
- Reset link directs to secure password change form
- New password must meet security requirements
- Old password is invalidated immediately upon successful reset
- User receives confirmation email after password change
- All active sessions are invalidated after password reset

### Session Management

**As a logged-in user**, I want my session to remain active for a reasonable duration, so that I don't have to log in repeatedly during normal usage.

**Acceptance Criteria**:
- Standard session duration is 24 hours
- "Stay connected" option extends session up to 400 days
- Session token is encrypted and includes user ID, expiration, and signature
- Token is stored in HTTP-only, secure, SameSite cookies (web) or secure storage (mobile)
- Expired tokens are automatically rejected
- User can manually log out to invalidate session

## Frontend Specifications

### Pages and Routes

**Registration Page** (`/register`):
- Email input field with validation
- Password input field with strength indicator
- Confirm password field
- Terms of service and privacy policy checkboxes
- Social login options (see F-SEC-AUTH-002)
- Link to login page for existing users

**Login Page** (`/login`):
- Email input field
- Password input field with show/hide toggle
- "Remember me" / "Stay connected" checkbox
- "Forgot password?" link
- Social login options
- Link to registration page for new users

**Email Verification Page** (`/verify-email`):
- Confirmation message after registration
- Resend verification email button
- Instructions for checking spam folder
- Support contact information

**Password Reset Request Page** (`/forgot-password`):
- Email input field
- Submit button to request reset link
- Link back to login page
- Confirmation message after submission

**Password Reset Form Page** (`/reset-password/:token`):
- New password input field with strength indicator
- Confirm new password field
- Submit button
- Token validation and expiration handling
- Success/error messaging

### UI Components

**RegistrationForm Component**:
- Email input with format validation
- Password input with real-time strength indicator
- Password requirements checklist (minimum length, character types)
- Confirm password with match validation
- Terms acceptance checkbox
- Submit button with loading state
- Error message display
- Success redirect to email verification page

**LoginForm Component**:
- Email input field
- Password input with show/hide toggle icon
- "Stay connected" checkbox
- Submit button with loading state
- Error message display for invalid credentials
- Account lockout warning after failed attempts
- CAPTCHA integration for suspicious activity

**PasswordStrengthIndicator Component**:
- Visual strength meter (weak/medium/strong)
- Color-coded feedback (red/yellow/green)
- Real-time validation as user types
- Specific improvement suggestions

**SessionExpirationWarning Component**:
- Modal dialog appearing 5 minutes before session expiration
- "Extend session" button
- "Log out" button
- Countdown timer

### User Flows

**Registration Flow**:
1. User navigates to registration page
2. User enters email and password
3. System validates input in real-time
4. User accepts terms and conditions
5. User submits registration form
6. System creates unverified account
7. System sends verification email
8. User redirected to email verification page
9. User clicks link in email
10. System verifies token and activates account
11. User redirected to login page with success message

**Login Flow**:
1. User navigates to login page
2. User enters email and password
3. User optionally checks "stay connected"
4. User submits login form
5. System validates credentials
6. System checks account status (verified, not suspended)
7. System creates encrypted session token
8. System stores token in secure cookie/storage
9. User redirected to dashboard or intended destination

**Password Reset Flow**:
1. User clicks "Forgot password?" on login page
2. User enters email address
3. System validates email exists
4. System generates time-limited reset token
5. System sends reset email with link
6. User clicks link in email
7. System validates token (not expired, not used)
8. User enters new password
9. System validates password requirements
10. System updates password hash
11. System invalidates all active sessions
12. User redirected to login page with success message

### Data Requirements

**From Backend APIs**:
- User registration endpoint response (user ID, email, verification status)
- Login endpoint response (session token, user profile, expiration)
- Email verification status
- Password reset token validation
- Session validation and refresh
- Account lockout status and remaining time

**State Management**:
- Current user authentication state (authenticated/unauthenticated)
- User profile data (name, email, roles)
- Session expiration timestamp
- Token refresh status
- Login error messages
- Registration validation errors

## Backend Specifications

### API Endpoints

**POST /api/auth/register**
- **Purpose**: Create new user account with email and password
- **Authentication**: None (public endpoint)
- **Rate Limiting**: 5 requests per hour per IP address

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "acceptedTerms": true,
  "acceptedPrivacy": true
}
```

**Response (201 Created)**:
```json
{
  "userId": "uuid-string",
  "email": "user@example.com",
  "emailVerified": false,
  "message": "Registration successful. Please check your email to verify your account."
}
```

**Error Responses**:
- 400: Invalid email format, weak password, missing required fields
- 409: Email already registered
- 429: Too many registration attempts

---

**POST /api/auth/login**
- **Purpose**: Authenticate user and create session
- **Authentication**: None (public endpoint)
- **Rate Limiting**: 5 attempts per 15 minutes per email

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "stayConnected": false
}
```

**Response (200 OK)**:
```json
{
  "token": "encrypted-jwt-token",
  "expiresAt": "2026-02-24T12:00:00Z",
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["customer"],
    "emailVerified": true
  }
}
```

**Error Responses**:
- 401: Invalid credentials
- 403: Account not verified, account suspended, account locked
- 429: Too many login attempts

---

**POST /api/auth/verify-email**
- **Purpose**: Verify user email address with token from email
- **Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "token": "verification-token-from-email"
}
```

**Response (200 OK)**:
```json
{
  "message": "Email verified successfully",
  "emailVerified": true
}
```

**Error Responses**:
- 400: Invalid or expired token
- 404: Token not found

---

**POST /api/auth/resend-verification**
- **Purpose**: Resend email verification link
- **Authentication**: None (public endpoint)
- **Rate Limiting**: 3 requests per hour per email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "Verification email sent"
}
```

---

**POST /api/auth/forgot-password**
- **Purpose**: Initiate password reset process
- **Authentication**: None (public endpoint)
- **Rate Limiting**: 3 requests per hour per email

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK)**:
```json
{
  "message": "If an account exists with this email, a password reset link has been sent"
}
```

---

**POST /api/auth/reset-password**
- **Purpose**: Complete password reset with token
- **Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "message": "Password reset successful"
}
```

**Error Responses**:
- 400: Invalid or expired token, weak password
- 404: Token not found

---

**POST /api/auth/logout**
- **Purpose**: Invalidate current session
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "message": "Logged out successfully"
}
```

---

**POST /api/auth/refresh**
- **Purpose**: Refresh session token before expiration
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "token": "new-encrypted-jwt-token",
  "expiresAt": "2026-02-24T12:00:00Z"
}
```

**Error Responses**:
- 401: Invalid or expired token

---

**GET /api/auth/session**
- **Purpose**: Validate current session and get user info
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "valid": true,
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["customer"],
    "emailVerified": true
  },
  "expiresAt": "2026-02-24T12:00:00Z"
}
```

**Error Responses**:
- 401: Invalid or expired session

### Business Logic

**Password Hashing**:
- Use bcrypt with work factor 12 (or Argon2id with recommended parameters)
- Generate unique salt for each password
- Never store plaintext passwords
- Hash comparison uses constant-time algorithm to prevent timing attacks

**Email Verification Token Generation**:
- Generate cryptographically secure random token (32 bytes)
- Store token hash in database with user ID and expiration (24 hours)
- Include token in verification email URL
- Mark token as used after successful verification
- Automatically delete expired tokens

**Password Reset Token Generation**:
- Generate cryptographically secure random token (32 bytes)
- Store token hash in database with user ID and expiration (1 hour)
- Include token in reset email URL
- Mark token as used after successful password reset
- Automatically delete expired tokens

**Session Token Generation**:
- Create JWT with user ID, email, roles, and expiration
- Sign with secret key using HS256 algorithm
- Set expiration: 24 hours (standard) or 400 days (stay connected)
- Include issued-at timestamp and token ID for revocation

**Account Lockout Logic**:
- Track failed login attempts per email address
- Increment counter on each failed attempt
- Reset counter on successful login
- Lock account for 30 minutes after 5 failed attempts
- Send email notification on account lockout
- Allow manual unlock by administrator

**Rate Limiting**:
- Implement sliding window rate limiting
- Track requests by IP address and email
- Return 429 status code when limit exceeded
- Include Retry-After header with wait time

### Authentication Requirements

**Public Endpoints** (no authentication required):
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-email
- POST /api/auth/resend-verification
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

**Protected Endpoints** (authentication required):
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/session

**Token Validation**:
- Extract token from Authorization header (Bearer scheme) or secure cookie
- Verify token signature
- Check token expiration
- Validate user exists and is active
- Validate user email is verified (for protected resources)
- Check user is not suspended

## Database Specifications

### Schema Changes

**Users Table** (modifications to existing table):
```sql
ALTER TABLE Users ADD COLUMN password_hash VARCHAR(255) NULL;
ALTER TABLE Users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE Users ADD COLUMN email_verified_at DATETIME NULL;
ALTER TABLE Users ADD COLUMN account_locked_until DATETIME NULL;
ALTER TABLE Users ADD COLUMN failed_login_attempts INT DEFAULT 0;
ALTER TABLE Users ADD COLUMN last_failed_login_at DATETIME NULL;
ALTER TABLE Users ADD COLUMN password_changed_at DATETIME NULL;
ALTER TABLE Users ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

CREATE INDEX idx_users_email_verified ON Users(email, email_verified);
CREATE INDEX idx_users_account_locked ON Users(account_locked_until);
```

**EmailVerificationTokens Table** (new table):
```sql
CREATE TABLE EmailVerificationTokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**PasswordResetTokens Table** (new table):
```sql
CREATE TABLE PasswordResetTokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**AuthenticationLogs Table** (new table):
```sql
CREATE TABLE AuthenticationLogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  email VARCHAR(255) NOT NULL,
  event_type ENUM('login_success', 'login_failure', 'logout', 'password_reset', 'email_verified', 'account_locked') NOT NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**Users ↔ EmailVerificationTokens**: One-to-Many
- One user can have multiple verification tokens (resend scenarios)
- Foreign key: EmailVerificationTokens.user_id → Users.id
- Cascade delete: When user is deleted, all tokens are deleted

**Users ↔ PasswordResetTokens**: One-to-Many
- One user can have multiple reset tokens (multiple requests)
- Foreign key: PasswordResetTokens.user_id → Users.id
- Cascade delete: When user is deleted, all tokens are deleted

**Users ↔ AuthenticationLogs**: One-to-Many
- One user can have many authentication events
- Foreign key: AuthenticationLogs.user_id → Users.id (nullable for failed attempts)
- No cascade delete: Logs retained for audit purposes

### Indexes

**Performance Optimization**:
- `idx_users_email_verified`: Fast lookup for login validation
- `idx_users_account_locked`: Efficient checking of locked accounts
- `idx_token_hash`: Fast token validation for email verification and password reset
- `idx_expires_at`: Efficient cleanup of expired tokens
- `idx_user_id`: Fast lookup of user's tokens and logs
- `idx_event_type`: Analytics queries on authentication events
- `idx_created_at`: Time-based queries and log retention

**Cleanup Jobs**:
- Daily job to delete expired verification tokens (expires_at < NOW())
- Daily job to delete expired password reset tokens (expires_at < NOW())
- Monthly job to archive old authentication logs (created_at < NOW() - INTERVAL 1 YEAR)

## Technology Stack

- **Backend**: .NET 8+ with ASP.NET Core Identity, Entity Framework Core
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React Hook Form for form validation
- **Password Hashing**: BCrypt.Net-Next or Argon2 library
- **JWT**: System.IdentityModel.Tokens.Jwt for token generation and validation
- **Email**: SendGrid or AWS SES for transactional emails
- **Rate Limiting**: AspNetCoreRateLimit middleware

## Implementation Notes

### Security Considerations

1. **Password Storage**: Never store plaintext passwords; always use bcrypt or Argon2 with appropriate work factors
2. **Token Security**: Use cryptographically secure random number generator for all tokens
3. **HTTPS Only**: All authentication endpoints must use HTTPS in production
4. **CORS Configuration**: Restrict CORS to trusted origins only
5. **Rate Limiting**: Implement aggressive rate limiting on authentication endpoints
6. **Audit Logging**: Log all authentication events for security monitoring
7. **Session Security**: Use HTTP-only, secure, SameSite cookies for web sessions

### Email Templates

**Verification Email**:
- Subject: "Verify your email address"
- Clear call-to-action button with verification link
- Link expiration notice (24 hours)
- Alternative text link for email clients that don't support buttons
- Support contact information

**Password Reset Email**:
- Subject: "Reset your password"
- Clear call-to-action button with reset link
- Link expiration notice (1 hour)
- Security notice: "If you didn't request this, ignore this email"
- Support contact information

**Account Lockout Email**:
- Subject: "Your account has been temporarily locked"
- Explanation of lockout reason (multiple failed login attempts)
- Lockout duration (30 minutes)
- Instructions for manual unlock if needed
- Security tips for protecting account

### Testing Requirements

**Unit Tests**:
- Password hashing and verification
- Token generation and validation
- Email format validation
- Password strength validation
- Rate limiting logic
- Account lockout logic

**Integration Tests**:
- Complete registration flow
- Complete login flow
- Email verification flow
- Password reset flow
- Session refresh flow
- Account lockout and unlock

**Security Tests**:
- Brute force attack prevention
- SQL injection attempts
- XSS attack prevention
- CSRF protection
- Token tampering detection
- Session hijacking prevention

### Performance Considerations

- Cache user authentication state to reduce database queries
- Use connection pooling for database connections
- Implement token blacklist with Redis for instant revocation
- Optimize email verification and password reset token lookups with indexes
- Use asynchronous email sending to avoid blocking API responses

### Compliance Requirements

**GDPR**:
- User consent for data processing during registration
- Right to data deletion (account deletion removes all authentication data)
- Data portability (export authentication logs)
- Privacy policy and terms acceptance required

**Password Security Standards**:
- Minimum password length: 6 characters (recommend 12+)
- Support for passphrases and special characters
- No maximum password length restriction
- Password history to prevent reuse (last 5 passwords)
- Secure password reset process with time-limited tokens

## Dependencies

- F-FUNC-UM-001: User Registration (functional requirement)
- F-FUNC-UM-002: User Authentication (functional requirement)
- F-FUNC-UM-004: Password Management (functional requirement)
- Email service integration (SendGrid, AWS SES, or similar)
- Rate limiting middleware
- Logging and monitoring infrastructure

## Related Features

- F-SEC-AUTH-002: Social Login Authentication (alternative authentication method)
- F-AM-011: Two-Factor Authentication (enhanced security)
- F-AM-012: Account Security Settings (session management, login history)
- F-FUNC-UM-006: Role-Based Access Control (authorization after authentication)

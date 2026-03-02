# Feature: Multi-Factor Authentication (MFA)

## Overview

Multi-Factor Authentication (MFA) adds an additional layer of security beyond username and password by requiring users to verify their identity through a second factor. This feature starts with email verification as a lightweight second factor and provides a foundation for future enhancements including SMS codes, authenticator apps, hardware keys, and biometric MFA.

## Sprint Category

nice-to-have (Would be great but not essential)

## Feature IDs

- F-SEC-AUTH-007: Multi-Factor Authentication (MFA)

## User Stories

### As a user
- I want to enable MFA on my account so that my account is more secure
- I want to verify my identity through email so that unauthorized users cannot access my account
- I want to use my authenticator app so that I can generate secure codes offline
- I want to use my hardware security key so that I have the strongest possible protection

### As a security-conscious user
- I want backup codes so that I can access my account if I lose my second factor
- I want to manage my MFA methods so that I can add or remove authentication factors
- I want to be notified of MFA changes so that I'm aware of security modifications to my account

### As a security administrator
- I want to enforce MFA for high-risk accounts so that sensitive accounts are protected
- I want to monitor MFA adoption so that I can encourage users to enable it
- I want to support multiple MFA methods so that users have flexibility in how they secure their accounts

## Frontend Specifications

### Pages

**MFA Setup Page** (`/account/security/mfa/setup`)
- Choose MFA method (email, SMS, authenticator app, hardware key)
- Step-by-step setup wizard for each method
- QR code display for authenticator app setup
- Backup codes generation and display
- Confirmation step to verify MFA is working

**MFA Verification Page** (`/login/verify`)
- Displayed after successful password authentication
- Input field for verification code
- "Remember this device" checkbox (optional)
- Resend code button (for email/SMS)
- Use backup code link
- Trouble signing in link

**Account Security Settings** (`/account/security`)
- MFA status indicator (enabled/disabled)
- List of configured MFA methods
- Add new MFA method button
- Remove MFA method button (with confirmation)
- View backup codes button
- Generate new backup codes button

### UI Components

**MFA Method Selector**
- Radio buttons or cards for each MFA method
- Email verification (available now)
- SMS verification (coming soon)
- Authenticator app (coming soon)
- Hardware key (coming soon)
- Biometric MFA (coming soon)
- Description and security level for each method

**Email Verification Component**
- 6-digit code input field
- Auto-focus and auto-advance between digits
- Countdown timer for code expiration (10 minutes)
- Resend code button (disabled during countdown)
- Success/error messages

**Authenticator App Setup Component**
- QR code display for scanning
- Manual entry code (for devices that can't scan)
- Instructions for popular apps (Google Authenticator, Authy, Microsoft Authenticator)
- Verification code input to confirm setup
- Success confirmation

**Backup Codes Display**
- List of 10 single-use backup codes
- Download as text file button
- Print button
- Copy to clipboard button
- Warning about storing codes securely
- Checkbox: "I have saved these codes"

**MFA Status Badge**
- Green checkmark icon for enabled
- Yellow warning icon for disabled
- Text: "MFA Enabled" or "MFA Disabled"
- Tooltip with additional information

### User Flows

**MFA Setup Flow (Email)**:
1. User navigates to Account Security Settings
2. User clicks "Enable MFA" button
3. System displays MFA method selector
4. User selects "Email Verification"
5. System sends verification code to user's email
6. User enters code from email
7. System validates code
8. System generates and displays backup codes
9. User confirms they've saved backup codes
10. System enables MFA for account
11. Success message displayed

**Login with MFA Flow**:
1. User enters email and password on login page
2. System validates credentials
3. System detects MFA is enabled for account
4. System redirects to MFA verification page
5. System sends verification code to user's email
6. User enters code
7. System validates code
8. If valid: User logged in and redirected to dashboard
9. If invalid: Error message, allow retry (max 3 attempts)

**Use Backup Code Flow**:
1. User on MFA verification page
2. User clicks "Use backup code" link
3. System displays backup code input field
4. User enters one of their backup codes
5. System validates backup code
6. If valid: User logged in, backup code marked as used
7. If invalid: Error message, allow retry

**Disable MFA Flow**:
1. User navigates to Account Security Settings
2. User clicks "Disable MFA" button
3. System displays confirmation modal with warning
4. User confirms they want to disable MFA
5. System requires password re-authentication
6. User enters password
7. System disables MFA
8. Confirmation message displayed

### Data Requirements

**MFA Configuration**:
- MFA enabled status (boolean)
- Enabled MFA methods (array)
- Backup codes (encrypted, array of strings)
- Backup codes used count
- MFA setup date
- Last MFA verification date

**Device Trust** (optional):
- Trusted device identifier
- Trust expiration date (30 days)
- Device name/description

## Backend Specifications

### API Endpoints

**POST /api/auth/mfa/setup/email**
- Purpose: Initiate email MFA setup
- Authentication: Required (valid session token)
- Request Body:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "message": "Verification code sent to email",
    "expiresIn": 600
  }
  ```

**POST /api/auth/mfa/verify/setup**
- Purpose: Verify MFA setup code and enable MFA
- Authentication: Required (valid session token)
- Request Body:
  ```json
  {
    "code": "123456",
    "method": "email"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "backupCodes": [
      "ABCD-1234-EFGH",
      "IJKL-5678-MNOP",
      ...
    ],
    "message": "MFA enabled successfully"
  }
  ```

**POST /api/auth/mfa/send-code**
- Purpose: Send MFA verification code during login
- Authentication: Partial (password verified, MFA pending)
- Request Body:
  ```json
  {
    "userId": "user-uuid",
    "method": "email"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "message": "Verification code sent",
    "expiresIn": 600
  }
  ```

**POST /api/auth/mfa/verify/login**
- Purpose: Verify MFA code during login
- Authentication: Partial (password verified, MFA pending)
- Request Body:
  ```json
  {
    "userId": "user-uuid",
    "code": "123456",
    "trustDevice": false
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "token": "<session_token>",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

**POST /api/auth/mfa/verify/backup-code**
- Purpose: Verify backup code during login
- Authentication: Partial (password verified, MFA pending)
- Request Body:
  ```json
  {
    "userId": "user-uuid",
    "backupCode": "ABCD-1234-EFGH"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "token": "<session_token>",
    "user": {...},
    "warning": "Backup code used. You have 9 backup codes remaining."
  }
  ```

**POST /api/auth/mfa/disable**
- Purpose: Disable MFA for account
- Authentication: Required (valid session token)
- Request Body:
  ```json
  {
    "password": "currentPassword"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "message": "MFA disabled successfully"
  }
  ```

**GET /api/auth/mfa/backup-codes**
- Purpose: Retrieve remaining backup codes
- Authentication: Required (valid session token)
- Response (200 OK):
  ```json
  {
    "backupCodes": [
      {"code": "ABCD-1234-EFGH", "used": false},
      {"code": "IJKL-5678-MNOP", "used": true},
      ...
    ],
    "remainingCodes": 8
  }
  ```

**POST /api/auth/mfa/backup-codes/regenerate**
- Purpose: Generate new backup codes (invalidates old ones)
- Authentication: Required (valid session token)
- Request Body:
  ```json
  {
    "password": "currentPassword"
  }
  ```
- Response (200 OK):
  ```json
  {
    "success": true,
    "backupCodes": [
      "NEW1-2345-ABCD",
      "NEW2-6789-EFGH",
      ...
    ]
  }
  ```

### Request Schemas

**MFASetupRequest**:
- email: string (required, valid email format)

**MFAVerifySetupRequest**:
- code: string (required, 6 digits)
- method: string (required, enum: email, sms, totp, hardware_key)

**MFAVerifyLoginRequest**:
- userId: string (required, UUID)
- code: string (required, 6 digits)
- trustDevice: boolean (optional, default false)

**MFABackupCodeRequest**:
- userId: string (required, UUID)
- backupCode: string (required, format: XXXX-XXXX-XXXX)

**MFADisableRequest**:
- password: string (required, minimum 6 characters)

### Response Schemas

**MFASetupResponse**:
- success: boolean
- message: string
- expiresIn: number (seconds until code expires)

**MFAVerifySetupResponse**:
- success: boolean
- backupCodes: array of strings
- message: string

**MFAVerifyLoginResponse**:
- success: boolean
- token: string (session token)
- user: UserObject
- warning: string (optional, for backup code usage)

### Business Logic

**Email Verification Code Generation**:
1. Generate random 6-digit code
2. Store code in Redis with user ID as key
3. Set expiration to 10 minutes
4. Send code via email
5. Rate limit: Max 3 codes per 15 minutes per user

**Backup Codes Generation**:
1. Generate 10 random codes (format: XXXX-XXXX-XXXX)
2. Hash each code using bcrypt
3. Store hashed codes in database
4. Return plaintext codes to user (only time they're shown)
5. Mark all codes as unused

**MFA Verification Logic**:
1. Retrieve code from Redis using user ID
2. Compare submitted code with stored code
3. If match: Delete code from Redis, proceed with login
4. If no match: Increment failure counter
5. If 3 failures: Lock MFA verification for 15 minutes
6. If code expired: Return error, allow resend

**Backup Code Verification Logic**:
1. Retrieve user's backup codes from database
2. Hash submitted backup code
3. Compare with stored hashed codes
4. If match and not used: Mark code as used, proceed with login
5. If match but already used: Return error
6. If no match: Increment failure counter

### Authentication Requirements

**Code Security**:
- 6-digit codes (1 million combinations)
- 10-minute expiration
- Single-use codes
- Rate limiting on generation and verification
- Secure transmission (HTTPS only)

**Backup Code Security**:
- 12-character codes with hyphens (format: XXXX-XXXX-XXXX)
- Bcrypt hashing (work factor 10)
- Single-use enforcement
- 10 codes per user
- Regeneration requires password confirmation

**Device Trust** (optional enhancement):
- 30-day trust period
- Encrypted device identifier
- Revocable trust
- Limited to 5 trusted devices per user

## Database Specifications

### Schema Changes

**users table** (add columns):
```sql
ALTER TABLE users
ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN mfa_methods JSON DEFAULT NULL COMMENT 'Array of enabled MFA methods',
ADD COLUMN mfa_setup_at TIMESTAMP NULL,
ADD COLUMN mfa_last_verified_at TIMESTAMP NULL;
```

**mfa_backup_codes table** (new):
```sql
CREATE TABLE mfa_backup_codes (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**trusted_devices table** (new, optional):
```sql
CREATE TABLE trusted_devices (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  device_identifier VARCHAR(255) NOT NULL,
  device_name VARCHAR(255),
  trusted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Definitions

**users table additions**:
- mfa_enabled: Boolean flag indicating if MFA is active
- mfa_methods: JSON array of enabled methods (e.g., ["email", "totp"])
- mfa_setup_at: Timestamp when MFA was first enabled
- mfa_last_verified_at: Timestamp of last successful MFA verification

**mfa_backup_codes table**:
- id: Unique backup code identifier (UUID)
- user_id: Reference to users table
- code_hash: Bcrypt hash of backup code
- used: Boolean flag indicating if code has been used
- used_at: Timestamp when code was used (NULL if unused)
- created_at: Timestamp when code was generated

**trusted_devices table**:
- id: Unique device identifier (UUID)
- user_id: Reference to users table
- device_identifier: Encrypted device fingerprint
- device_name: Human-readable device name
- trusted_at: Timestamp when device was trusted
- expires_at: Timestamp when trust expires (30 days from trusted_at)

### Relationships

**users ↔ mfa_backup_codes**: One-to-many
- One user has multiple backup codes (typically 10)
- CASCADE DELETE: Deleting user removes all backup codes

**users ↔ trusted_devices**: One-to-many
- One user can have multiple trusted devices (max 5)
- CASCADE DELETE: Deleting user removes all trusted devices

### Indexes

**mfa_backup_codes table**:
- PRIMARY KEY on id
- INDEX on user_id (find all codes for user)

**trusted_devices table**:
- PRIMARY KEY on id
- INDEX on user_id (find all trusted devices for user)
- INDEX on expires_at (cleanup expired trusts)

## Technology Stack

- Backend: .NET 8+ with C# (ASP.NET Core Web API)
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Email Service: SendGrid, AWS SES, or similar
- Cache: Redis (for verification codes)
- Libraries:
  - OtpNet (TOTP generation for authenticator apps)
  - QRCoder (QR code generation)
  - BCrypt.Net-Next (backup code hashing)

## Implementation Notes

### Future Enhancements

**SMS Verification**:
- Integration with Twilio, AWS SNS, or similar
- Phone number verification and storage
- International phone number support
- SMS delivery confirmation

**Authenticator App (TOTP)**:
- Generate secret key for user
- Display QR code for scanning
- Verify TOTP code to confirm setup
- Support for Google Authenticator, Authy, Microsoft Authenticator

**Hardware Keys (FIDO2/WebAuthn)**:
- WebAuthn API integration
- Support for YubiKey, Titan Security Key
- Biometric authentication on compatible devices
- Passwordless authentication option

**Biometric MFA**:
- Combine password with fingerprint or facial recognition
- Platform-specific biometric APIs
- Fallback to other MFA methods

### Security Best Practices

1. **Never store plaintext codes**: Hash all codes before storage
2. **Implement rate limiting**: Prevent brute force attacks on MFA codes
3. **Use secure random number generation**: System.Security.Cryptography.RandomNumberGenerator
4. **Enforce code expiration**: 10 minutes for email codes
5. **Limit verification attempts**: 3 attempts before lockout
6. **Log MFA events**: Track setup, verification, failures, disabling
7. **Notify users of MFA changes**: Email notifications for security changes

### User Experience Considerations

1. **Gradual rollout**: Make MFA optional initially, encourage adoption
2. **Clear instructions**: Provide step-by-step setup guides
3. **Multiple methods**: Support various MFA methods for user preference
4. **Backup codes**: Always provide backup codes for account recovery
5. **Remember device**: Optional device trust for convenience
6. **Recovery process**: Clear process for users who lose second factor

## Dependencies

- F-SEC-AUTH-001: Email/Password Authentication (primary authentication)
- F-SEC-AUTH-006: Token-Based Session Management (session handling)
- Email service integration (SendGrid, AWS SES)
- Redis cache for verification codes

## Related Features

- F-SEC-AUTH-008: Authentication Attack Protection (rate limiting)
- F-AM-012: Account Security Settings (MFA management UI)
- F-INT-NOTIF-001: Email Notification Service (verification code delivery)

## Acceptance Criteria

1. Users can enable MFA with email verification
2. Verification codes are sent via email and expire after 10 minutes
3. Users receive 10 backup codes when enabling MFA
4. Backup codes can be used for login when primary MFA method unavailable
5. Users can disable MFA by providing their password
6. MFA verification is required after password authentication
7. Failed MFA attempts are rate limited (3 attempts, then 15-minute lockout)
8. Users can regenerate backup codes (invalidates old codes)
9. MFA status is displayed in account security settings
10. Device trust (optional) allows skipping MFA for 30 days on trusted devices


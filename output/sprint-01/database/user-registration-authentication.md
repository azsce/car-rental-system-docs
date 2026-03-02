# Feature: User Registration & Authentication

## Overview

This document defines the database schema and data models required to support user registration and authentication in the car rental platform. The schema includes tables for user accounts, authentication methods, session management, login history, device tracking, and audit logging. The design supports multiple authentication methods (email, social login, phone, SSO), secure password storage, session management, and comprehensive security auditing.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-001: Multi-Method User Registration
- F-AM-002: Secure Authentication System
- F-FUNC-UM-001: User Registration Functional Requirements
- F-FUNC-UM-002: User Authentication Functional Requirements

## Database Specifications

### Schema Changes

This feature introduces the following new tables to the database:

1. **Users**: Core user account information
2. **UserAuthentications**: Authentication methods and credentials
3. **UserSessions**: Active user sessions
4. **UserDevices**: Registered devices for device recognition
5. **LoginHistory**: Historical login activity
6. **AuthAuditLogs**: Comprehensive authentication audit trail
7. **PasswordResetTokens**: Password reset tokens
8. **EmailVerificationTokens**: Email verification tokens
9. **PhoneVerificationCodes**: SMS OTP codes
10. **SocialLoginProviders**: Linked social login accounts

### Table Definitions

#### Users Table

Stores core user account information.

```sql
CREATE TABLE Users (
    Id VARCHAR(36) PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    Email VARCHAR(255) UNIQUE,
    PhoneNumber VARCHAR(20) UNIQUE,
    DateOfBirth DATE NOT NULL,
    ProfilePhotoUrl VARCHAR(500),
    Role ENUM('customer', 'supplier', 'admin') NOT NULL DEFAULT 'customer',
    VerificationStatus ENUM('unverified', 'pending_verification', 'verified') NOT NULL DEFAULT 'unverified',
    AccountStatus ENUM('active', 'suspended', 'locked', 'deleted') NOT NULL DEFAULT 'active',
    ProfileCompleteness INT NOT NULL DEFAULT 0,
    TermsAcceptedAt DATETIME NOT NULL,
    PrivacyAcceptedAt DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    DeletedAt DATETIME NULL,
    
    INDEX idx_email (Email),
    INDEX idx_phone (PhoneNumber),
    INDEX idx_verification_status (VerificationStatus),
    INDEX idx_account_status (AccountStatus),
    INDEX idx_created_at (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier (UUID format)
- `FullName`: User's full name
- `Email`: Email address (unique, nullable for phone-only registration)
- `PhoneNumber`: Phone number with country code (unique, nullable for email-only registration)
- `DateOfBirth`: Date of birth for age verification
- `ProfilePhotoUrl`: URL to profile photo
- `Role`: User role (customer, supplier, admin)
- `VerificationStatus`: Email/phone verification status
- `AccountStatus`: Account status (active, suspended, locked, deleted)
- `ProfileCompleteness`: Percentage of profile completion (0-100)
- `TermsAcceptedAt`: Timestamp when terms were accepted
- `PrivacyAcceptedAt`: Timestamp when privacy policy was accepted
- `CreatedAt`: Account creation timestamp
- `UpdatedAt`: Last update timestamp
- `DeletedAt`: Soft delete timestamp (NULL if not deleted)

**Constraints**:
- At least one of Email or PhoneNumber must be provided
- DateOfBirth must indicate age >= 18 (enforced in application layer)
- ProfileCompleteness must be between 0 and 100

---

#### UserAuthentications Table

Stores authentication credentials and methods.

```sql
CREATE TABLE UserAuthentications (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    AuthMethod ENUM('password', 'social', 'phone', 'sso', 'biometric') NOT NULL,
    PasswordHash VARCHAR(255),
    PasswordSalt VARCHAR(255),
    LastPasswordChange DATETIME,
    PasswordResetRequired BOOLEAN NOT NULL DEFAULT FALSE,
    TwoFactorEnabled BOOLEAN NOT NULL DEFAULT FALSE,
    TwoFactorMethod ENUM('sms', 'authenticator', 'email') NULL,
    TwoFactorSecret VARCHAR(255) NULL,
    BackupCodes TEXT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_auth_method (AuthMethod)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `AuthMethod`: Primary authentication method
- `PasswordHash`: Bcrypt hashed password (NULL for non-password methods)
- `PasswordSalt`: Password salt (NULL for bcrypt which includes salt)
- `LastPasswordChange`: Timestamp of last password change
- `PasswordResetRequired`: Flag to force password reset on next login
- `TwoFactorEnabled`: Whether 2FA is enabled
- `TwoFactorMethod`: 2FA method (SMS, authenticator app, email)
- `TwoFactorSecret`: TOTP secret for authenticator app
- `BackupCodes`: JSON array of backup codes for 2FA recovery
- `CreatedAt`: Record creation timestamp
- `UpdatedAt`: Last update timestamp

**Security Notes**:
- PasswordHash uses bcrypt with work factor 12
- TwoFactorSecret is encrypted at rest
- BackupCodes are hashed before storage

---

#### UserSessions Table

Stores active user sessions.

```sql
CREATE TABLE UserSessions (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    SessionToken VARCHAR(500) NOT NULL UNIQUE,
    RefreshToken VARCHAR(500) UNIQUE,
    DeviceId VARCHAR(255),
    DeviceType VARCHAR(50),
    Browser VARCHAR(100),
    OperatingSystem VARCHAR(100),
    IpAddress VARCHAR(45),
    Location VARCHAR(255),
    UserAgent TEXT,
    IsActive BOOLEAN NOT NULL DEFAULT TRUE,
    RememberMe BOOLEAN NOT NULL DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastActivityAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt DATETIME NOT NULL,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_session_token (SessionToken),
    INDEX idx_refresh_token (RefreshToken),
    INDEX idx_device_id (DeviceId),
    INDEX idx_is_active (IsActive),
    INDEX idx_expires_at (ExpiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `SessionToken`: JWT session token (hashed for storage)
- `RefreshToken`: Refresh token for extending session (hashed for storage)
- `DeviceId`: Device fingerprint for device recognition
- `DeviceType`: Device type (Desktop, Mobile, Tablet)
- `Browser`: Browser name and version
- `OperatingSystem`: Operating system name and version
- `IpAddress`: IP address (supports IPv4 and IPv6)
- `Location`: Geographic location (city, country)
- `UserAgent`: Full user agent string
- `IsActive`: Whether session is currently active
- `RememberMe`: Whether "Remember Me" was selected
- `CreatedAt`: Session creation timestamp
- `LastActivityAt`: Last activity timestamp
- `ExpiresAt`: Session expiration timestamp

**Cleanup**:
- Expired sessions should be deleted by scheduled job
- Inactive sessions (no activity for 30 days) should be deleted

---

#### UserDevices Table

Stores registered devices for device recognition and security monitoring.

```sql
CREATE TABLE UserDevices (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    DeviceFingerprint VARCHAR(255) NOT NULL,
    DeviceType VARCHAR(50),
    Browser VARCHAR(100),
    OperatingSystem VARCHAR(100),
    IpAddress VARCHAR(45),
    Location VARCHAR(255),
    IsTrusted BOOLEAN NOT NULL DEFAULT FALSE,
    FirstSeen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastSeen DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_device (UserId, DeviceFingerprint),
    INDEX idx_user_id (UserId),
    INDEX idx_device_fingerprint (DeviceFingerprint),
    INDEX idx_is_trusted (IsTrusted)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `DeviceFingerprint`: SHA-256 hash of device characteristics
- `DeviceType`: Device type (Desktop, Mobile, Tablet)
- `Browser`: Browser name and version
- `OperatingSystem`: Operating system name and version
- `IpAddress`: Last known IP address
- `Location`: Last known geographic location
- `IsTrusted`: Whether device is marked as trusted
- `FirstSeen`: First time device was used
- `LastSeen`: Last time device was used

**Device Fingerprinting**:
- Fingerprint generated from User-Agent, Accept-Language, Accept-Encoding
- Used to detect new devices and send security notifications

---

#### LoginHistory Table

Stores historical login activity for security monitoring.

```sql
CREATE TABLE LoginHistory (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36),
    Email VARCHAR(255),
    PhoneNumber VARCHAR(20),
    LoginMethod ENUM('password', 'social', 'magic_link', 'sms_otp', 'biometric', 'sso') NOT NULL,
    SocialProvider VARCHAR(50),
    DeviceType VARCHAR(50),
    Browser VARCHAR(100),
    OperatingSystem VARCHAR(100),
    IpAddress VARCHAR(45),
    Location VARCHAR(255),
    Success BOOLEAN NOT NULL,
    FailureReason VARCHAR(255),
    Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_user_id (UserId),
    INDEX idx_email (Email),
    INDEX idx_phone (PhoneNumber),
    INDEX idx_success (Success),
    INDEX idx_timestamp (Timestamp),
    INDEX idx_ip_address (IpAddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table (NULL for failed logins with invalid email)
- `Email`: Email used for login attempt
- `PhoneNumber`: Phone number used for login attempt
- `LoginMethod`: Authentication method used
- `SocialProvider`: Social provider name (google, facebook, apple, wechat)
- `DeviceType`: Device type
- `Browser`: Browser name and version
- `OperatingSystem`: Operating system name and version
- `IpAddress`: IP address of login attempt
- `Location`: Geographic location
- `Success`: Whether login was successful
- `FailureReason`: Reason for failure (invalid_credentials, account_locked, etc.)
- `Timestamp`: Login attempt timestamp

**Retention**:
- Keep login history for 90 days
- Archive older records to separate table for compliance

---

#### AuthAuditLogs Table

Comprehensive audit trail for all authentication events.

```sql
CREATE TABLE AuthAuditLogs (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36),
    EventType ENUM('registration', 'login', 'logout', 'password_change', 'password_reset', 'email_verification', 'phone_verification', '2fa_enabled', '2fa_disabled', 'account_locked', 'account_unlocked', 'session_terminated') NOT NULL,
    EventMethod VARCHAR(50),
    IpAddress VARCHAR(45),
    DeviceType VARCHAR(50),
    Browser VARCHAR(100),
    OperatingSystem VARCHAR(100),
    Location VARCHAR(255),
    Success BOOLEAN NOT NULL,
    FailureReason VARCHAR(255),
    Metadata JSON,
    Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE SET NULL,
    INDEX idx_user_id (UserId),
    INDEX idx_event_type (EventType),
    INDEX idx_success (Success),
    INDEX idx_timestamp (Timestamp),
    INDEX idx_ip_address (IpAddress)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `EventType`: Type of authentication event
- `EventMethod`: Method used (email, social, phone, etc.)
- `IpAddress`: IP address
- `DeviceType`: Device type
- `Browser`: Browser name and version
- `OperatingSystem`: Operating system name and version
- `Location`: Geographic location
- `Success`: Whether event was successful
- `FailureReason`: Reason for failure
- `Metadata`: Additional event-specific data (JSON)
- `Timestamp`: Event timestamp

**Retention**:
- Keep audit logs for 1 year minimum (compliance requirement)
- Archive older records for long-term storage

---

#### PasswordResetTokens Table

Stores password reset tokens.

```sql
CREATE TABLE PasswordResetTokens (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    IsUsed BOOLEAN NOT NULL DEFAULT FALSE,
    UsedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_token (Token),
    INDEX idx_expires_at (ExpiresAt),
    INDEX idx_is_used (IsUsed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `Token`: JWT token for password reset (hashed for storage)
- `ExpiresAt`: Token expiration timestamp (1 hour from creation)
- `IsUsed`: Whether token has been used
- `UsedAt`: Timestamp when token was used
- `CreatedAt`: Token creation timestamp

**Security**:
- Tokens expire after 1 hour
- Tokens can only be used once
- Old tokens are deleted after 24 hours

---

#### EmailVerificationTokens Table

Stores email verification tokens.

```sql
CREATE TABLE EmailVerificationTokens (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Token VARCHAR(500) NOT NULL UNIQUE,
    ExpiresAt DATETIME NOT NULL,
    IsUsed BOOLEAN NOT NULL DEFAULT FALSE,
    UsedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_email (Email),
    INDEX idx_token (Token),
    INDEX idx_expires_at (ExpiresAt),
    INDEX idx_is_used (IsUsed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `Email`: Email address being verified
- `Token`: JWT token for email verification (hashed for storage)
- `ExpiresAt`: Token expiration timestamp (24 hours from creation)
- `IsUsed`: Whether token has been used
- `UsedAt`: Timestamp when token was used
- `CreatedAt`: Token creation timestamp

**Security**:
- Tokens expire after 24 hours
- Tokens can only be used once
- Old tokens are deleted after 48 hours

---

#### PhoneVerificationCodes Table

Stores SMS OTP codes for phone verification and authentication.

```sql
CREATE TABLE PhoneVerificationCodes (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36),
    PhoneNumber VARCHAR(20) NOT NULL,
    Code VARCHAR(6) NOT NULL,
    Purpose ENUM('registration', 'login', 'verification') NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    IsUsed BOOLEAN NOT NULL DEFAULT FALSE,
    UsedAt DATETIME NULL,
    AttemptCount INT NOT NULL DEFAULT 0,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    INDEX idx_user_id (UserId),
    INDEX idx_phone_number (PhoneNumber),
    INDEX idx_code (Code),
    INDEX idx_expires_at (ExpiresAt),
    INDEX idx_is_used (IsUsed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table (NULL for registration)
- `PhoneNumber`: Phone number receiving OTP
- `Code`: 6-digit OTP code (hashed for storage)
- `Purpose`: Purpose of OTP (registration, login, verification)
- `ExpiresAt`: Code expiration timestamp (10 minutes from creation)
- `IsUsed`: Whether code has been used
- `UsedAt`: Timestamp when code was used
- `AttemptCount`: Number of verification attempts
- `CreatedAt`: Code creation timestamp

**Security**:
- Codes expire after 10 minutes
- Codes can only be used once
- Maximum 3 verification attempts per code
- Old codes are deleted after 1 hour

---

#### SocialLoginProviders Table

Stores linked social login accounts.

```sql
CREATE TABLE SocialLoginProviders (
    Id VARCHAR(36) PRIMARY KEY,
    UserId VARCHAR(36) NOT NULL,
    Provider ENUM('google', 'facebook', 'apple', 'wechat') NOT NULL,
    ProviderUserId VARCHAR(255) NOT NULL,
    Email VARCHAR(255),
    DisplayName VARCHAR(255),
    ProfilePhotoUrl VARCHAR(500),
    AccessToken TEXT,
    RefreshToken TEXT,
    TokenExpiresAt DATETIME,
    LinkedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    LastUsedAt DATETIME,
    
    FOREIGN KEY (UserId) REFERENCES Users(Id) ON DELETE CASCADE,
    UNIQUE KEY unique_provider_user (Provider, ProviderUserId),
    INDEX idx_user_id (UserId),
    INDEX idx_provider (Provider),
    INDEX idx_provider_user_id (ProviderUserId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Column Descriptions**:
- `Id`: Unique identifier
- `UserId`: Reference to Users table
- `Provider`: Social provider name
- `ProviderUserId`: User ID from social provider
- `Email`: Email from social provider
- `DisplayName`: Display name from social provider
- `ProfilePhotoUrl`: Profile photo URL from social provider
- `AccessToken`: OAuth access token (encrypted at rest)
- `RefreshToken`: OAuth refresh token (encrypted at rest)
- `TokenExpiresAt`: Access token expiration timestamp
- `LinkedAt`: Timestamp when account was linked
- `LastUsedAt`: Last time this provider was used for login

**Security**:
- Access and refresh tokens are encrypted at rest
- Tokens are refreshed automatically when expired

### Relationships

```
Users (1) ----< (N) UserAuthentications
Users (1) ----< (N) UserSessions
Users (1) ----< (N) UserDevices
Users (1) ----< (N) LoginHistory
Users (1) ----< (N) AuthAuditLogs
Users (1) ----< (N) PasswordResetTokens
Users (1) ----< (N) EmailVerificationTokens
Users (1) ----< (N) PhoneVerificationCodes
Users (1) ----< (N) SocialLoginProviders
```

### Indexes

**Performance Indexes**:
- Users: email, phone_number, verification_status, account_status, created_at
- UserAuthentications: user_id, auth_method
- UserSessions: user_id, session_token, refresh_token, device_id, is_active, expires_at
- UserDevices: user_id, device_fingerprint, is_trusted
- LoginHistory: user_id, email, phone_number, success, timestamp, ip_address
- AuthAuditLogs: user_id, event_type, success, timestamp, ip_address
- PasswordResetTokens: user_id, token, expires_at, is_used
- EmailVerificationTokens: user_id, email, token, expires_at, is_used
- PhoneVerificationCodes: user_id, phone_number, code, expires_at, is_used
- SocialLoginProviders: user_id, provider, provider_user_id

**Composite Indexes**:
- UserDevices: (user_id, device_fingerprint) - for device recognition
- SocialLoginProviders: (provider, provider_user_id) - for social login lookup

### Data Integrity Constraints

1. **User Uniqueness**: Email and phone number must be unique across Users table
2. **Authentication Method**: At least one authentication method must exist for each user
3. **Session Validity**: Session expiration must be in the future for active sessions
4. **Token Expiration**: All tokens must have expiration timestamps
5. **Audit Trail**: All authentication events must be logged in AuthAuditLogs
6. **Soft Delete**: Users are soft-deleted (DeletedAt set) rather than hard-deleted

### Data Migration Scripts

#### Initial Schema Creation

```sql
-- Create Users table
CREATE TABLE Users (
    -- (see table definition above)
);

-- Create UserAuthentications table
CREATE TABLE UserAuthentications (
    -- (see table definition above)
);

-- Create UserSessions table
CREATE TABLE UserSessions (
    -- (see table definition above)
);

-- Create UserDevices table
CREATE TABLE UserDevices (
    -- (see table definition above)
);

-- Create LoginHistory table
CREATE TABLE LoginHistory (
    -- (see table definition above)
);

-- Create AuthAuditLogs table
CREATE TABLE AuthAuditLogs (
    -- (see table definition above)
);

-- Create PasswordResetTokens table
CREATE TABLE PasswordResetTokens (
    -- (see table definition above)
);

-- Create EmailVerificationTokens table
CREATE TABLE EmailVerificationTokens (
    -- (see table definition above)
);

-- Create PhoneVerificationCodes table
CREATE TABLE PhoneVerificationCodes (
    -- (see table definition above)
);

-- Create SocialLoginProviders table
CREATE TABLE SocialLoginProviders (
    -- (see table definition above)
);
```

#### Cleanup Jobs

```sql
-- Delete expired sessions (run daily)
DELETE FROM UserSessions 
WHERE ExpiresAt < NOW() OR (IsActive = FALSE AND LastActivityAt < DATE_SUB(NOW(), INTERVAL 30 DAY));

-- Delete old password reset tokens (run daily)
DELETE FROM PasswordResetTokens 
WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 24 HOUR);

-- Delete old email verification tokens (run daily)
DELETE FROM EmailVerificationTokens 
WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 48 HOUR);

-- Delete old phone verification codes (run hourly)
DELETE FROM PhoneVerificationCodes 
WHERE CreatedAt < DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Archive old login history (run monthly)
INSERT INTO LoginHistoryArchive SELECT * FROM LoginHistory 
WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);
DELETE FROM LoginHistory 
WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- Archive old audit logs (run monthly)
INSERT INTO AuthAuditLogsArchive SELECT * FROM AuthAuditLogs 
WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
DELETE FROM AuthAuditLogs 
WHERE Timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB for ACID compliance and foreign key support
- **Character Set**: utf8mb4 for full Unicode support (including emojis)
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **ORM**: Entity Framework Core for .NET backend

## Implementation Notes

### Security Considerations

1. **Password Storage**: Never store passwords in plain text. Use bcrypt with work factor 12.
2. **Token Storage**: Hash tokens before storing in database.
3. **Encryption at Rest**: Encrypt sensitive fields (OAuth tokens, 2FA secrets) at rest.
4. **Audit Logging**: Log all authentication events for security monitoring.
5. **Data Retention**: Implement data retention policies for compliance.
6. **Soft Delete**: Use soft delete for users to maintain referential integrity.

### Performance Optimization

1. **Indexing**: Ensure all foreign keys and frequently queried columns are indexed.
2. **Partitioning**: Consider partitioning large tables (LoginHistory, AuthAuditLogs) by date.
3. **Archiving**: Archive old records to separate tables to maintain query performance.
4. **Connection Pooling**: Use connection pooling for database connections.
5. **Query Optimization**: Use EXPLAIN to optimize slow queries.

### Backup and Recovery

1. **Regular Backups**: Daily full backups and hourly incremental backups.
2. **Point-in-Time Recovery**: Enable binary logging for point-in-time recovery.
3. **Backup Testing**: Regularly test backup restoration procedures.
4. **Disaster Recovery**: Maintain off-site backups for disaster recovery.

### Monitoring

1. **Query Performance**: Monitor slow queries and optimize as needed.
2. **Table Growth**: Monitor table sizes and implement archiving strategies.
3. **Index Usage**: Monitor index usage and remove unused indexes.
4. **Replication Lag**: Monitor replication lag if using read replicas.
5. **Connection Pool**: Monitor connection pool usage and adjust as needed.

### Compliance

1. **GDPR**: Support data export and deletion for GDPR compliance.
2. **Data Retention**: Implement data retention policies per regulatory requirements.
3. **Audit Trail**: Maintain comprehensive audit trail for compliance.
4. **Encryption**: Encrypt sensitive data at rest and in transit.
5. **Access Control**: Implement role-based access control for database access.

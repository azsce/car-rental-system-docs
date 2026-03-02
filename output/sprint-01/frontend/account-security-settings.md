# Feature: Account Security Settings

## Overview

Account Security Settings provides a centralized security management dashboard where users can control all aspects of their account security. This feature includes password management, email and phone number updates with verification, active session monitoring and management, comprehensive login history with device and location details, suspicious activity alerts, account deactivation options, and GDPR-compliant data download. The system empowers users with complete visibility and control over their account security while maintaining robust verification processes for sensitive changes.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-AM-012

## Dependencies

- F-AM-002: Secure Authentication System (must be implemented first)

## User Stories

**US-1**: As a registered user, I want to change my password from the security settings, so that I can maintain account security with a strong, updated password.

**US-2**: As a registered user, I want to update my email address with verification, so that I can keep my contact information current while maintaining account security.

**US-3**: As a registered user, I want to update my phone number with SMS verification, so that I can receive security notifications and OTP codes at my current number.

**US-4**: As a registered user, I want to view all my active login sessions with device and location details, so that I can monitor who has access to my account.

**US-5**: As a registered user, I want to remotely log out of specific sessions or all sessions, so that I can revoke access from lost or stolen devices.

**US-6**: As a registered user, I want to view my login history with timestamps, devices, and locations, so that I can detect any unauthorized access attempts.

**US-7**: As a registered user, I want to receive notifications when someone logs into my account from a new device or suspicious location, so that I can quickly respond to potential security threats.


**US-8**: As a registered user, I want to request account deactivation from security settings, so that I can close my account when I no longer need the service.

**US-9**: As a registered user, I want to download all my account data in a machine-readable format, so that I can exercise my GDPR right to data portability.

**US-10**: As a platform operator, I want to prevent account changes without proper verification, so that accounts remain secure against unauthorized modifications.

## Frontend Specifications

### Pages

#### 1. Account Security Dashboard (`/settings/security`)

**Purpose**: Centralized hub for all account security settings and monitoring.

**Layout**:
- Page header with "Account Security" title
- Security score indicator (optional)
- Quick action cards for common tasks
- Sections for different security features
- Recent activity timeline

**Sections**:
- **Password Management**: Change password, password strength indicator
- **Email & Phone**: Update contact information with verification
- **Active Sessions**: View and manage current login sessions
- **Login History**: Recent login activity with details
- **Security Alerts**: Suspicious activity notifications
- **Two-Factor Authentication**: Enable/disable 2FA (links to F-AM-011)
- **Account Actions**: Deactivate account, download data

**Responsive Design**:
- Mobile: Single column, stacked sections
- Tablet: Two-column grid for cards
- Desktop: Three-column grid with sidebar navigation

#### 2. Change Password Page (`/settings/security/password`)

**Purpose**: Allow users to update their account password.

**Layout**:
- Page header with "Change Password" title
- Current password input field
- New password input field
- Confirm new password input field
- Password strength meter
- Password requirements checklist
- Submit button
- Cancel button

**Validation**:
- Current password must be correct
- New password must meet strength requirements
- New password must differ from current password
- Confirm password must match new password


#### 3. Change Email Page (`/settings/security/email`)

**Purpose**: Allow users to update their email address with verification.

**Layout**:
- Page header with "Change Email Address" title
- Current email display (read-only)
- New email input field
- Password verification field
- Submit button
- Verification status indicator

**Flow**:
1. User enters new email and password
2. System sends verification email to new address
3. User clicks verification link in email
4. System updates email address
5. System sends notification to old email

#### 4. Change Phone Number Page (`/settings/security/phone`)

**Purpose**: Allow users to update their phone number with SMS verification.

**Layout**:
- Page header with "Change Phone Number" title
- Current phone display (read-only)
- New phone number input with country code selector
- Password verification field
- Submit button
- SMS OTP verification field (appears after submission)

**Flow**:
1. User enters new phone number and password
2. System sends SMS OTP to new number
3. User enters OTP code
4. System verifies OTP and updates phone number
5. System sends confirmation notification

#### 5. Active Sessions Page (`/settings/security/sessions`)

**Purpose**: View and manage all active login sessions.

**Layout**:
- Page header with "Active Sessions" title
- Session count indicator
- List of active sessions with details
- "Log Out All Other Devices" button
- Filter options (All, Desktop, Mobile, Tablet)

**Session Card Display**:
- Device type icon (desktop, mobile, tablet)
- Device name and browser
- Operating system
- IP address and location
- Last activity timestamp
- "Current Session" badge (for current device)
- "Log Out" button (for other sessions)


#### 6. Login History Page (`/settings/security/history`)

**Purpose**: View comprehensive login history for security monitoring.

**Layout**:
- Page header with "Login History" title
- Filter controls (date range, status, device type)
- Export button (CSV/PDF)
- Paginated table of login attempts

**Table Columns**:
- Timestamp (date and time)
- Status (Success, Failed, Blocked)
- Device type and name
- Browser and OS
- IP address
- Location (city, country)
- Action button (Report if suspicious)

**Features**:
- Pagination (50 entries per page)
- Filtering by status, date range, device type
- Suspicious activity highlighting (red background)
- Export to CSV or PDF
- "Report Suspicious Activity" button

#### 7. Account Deactivation Page (`/settings/security/deactivate`)

**Purpose**: Allow users to request account closure.

**Layout**:
- Page header with "Deactivate Account" title
- Warning message about consequences
- Checklist of what happens when account is deactivated
- Active bookings warning (if applicable)
- Reason for deactivation dropdown
- Password verification field
- "Deactivate Account" button (red, prominent)
- "Cancel" button

**Deactivation Checklist**:
- All active sessions will be terminated
- Saved payment methods will be removed
- Booking history will be archived
- Account can be reactivated within 30 days
- After 30 days, account data will be permanently deleted

#### 8. Data Download Page (`/settings/security/data-download`)

**Purpose**: Allow users to download their account data (GDPR compliance).

**Layout**:
- Page header with "Download Your Data" title
- Explanation of data included
- Data categories checklist (select what to include)
- Format selection (JSON, CSV, PDF)
- "Request Download" button
- Download status indicator
- Previous download requests list

**Data Categories**:
- Profile information
- Booking history
- Payment history
- Login history
- Saved preferences
- Communication history


### UI Components

#### SecurityDashboardCard Component

**Purpose**: Display security feature cards on main dashboard.

**Props**:
- `title`: string - Card title
- `description`: string - Brief description
- `icon`: ReactNode - Icon component
- `status`: 'secure' | 'warning' | 'action-needed'
- `actionLabel`: string - Button text
- `onAction`: () => void - Click handler

**Display**:
- Icon with status color (green, yellow, red)
- Title and description
- Status badge
- Action button

#### PasswordChangeForm Component

**Purpose**: Form for changing account password.

**Fields**:
- Current Password (password input, required)
- New Password (password input, required, min 8 characters)
- Confirm New Password (password input, required, must match)

**Features**:
- Password strength meter
- Requirements checklist
- Show/hide password toggles
- Real-time validation
- Submit button (disabled until valid)

#### EmailChangeForm Component

**Purpose**: Form for updating email address with verification.

**Fields**:
- New Email Address (email input, required, validated)
- Current Password (password input, required)

**Features**:
- Email format validation
- Duplicate email detection
- Verification status display
- Resend verification email button

#### PhoneChangeForm Component

**Purpose**: Form for updating phone number with SMS verification.

**Fields**:
- New Phone Number (phone input with country code, required)
- Current Password (password input, required)
- SMS OTP Code (6-digit input, appears after submission)

**Features**:
- International phone number support
- Country code selector
- SMS OTP verification
- Resend OTP button
- Countdown timer


#### ActiveSessionCard Component

**Purpose**: Display individual active session with management options.

**Props**:
- `session`: SessionObject - Session data
- `isCurrent`: boolean - Whether this is current session
- `onLogout`: (sessionId: string) => void - Logout handler

**Display**:
- Device type icon
- Device name (e.g., "Chrome on Windows")
- Browser and OS details
- IP address and location
- Last activity timestamp
- "Current Session" badge (if applicable)
- "Log Out" button (if not current)

**Features**:
- Confirmation dialog before logout
- Disabled logout for current session
- Visual distinction for current session

#### LoginHistoryTable Component

**Purpose**: Display paginated table of login history.

**Props**:
- `entries`: LoginEntry[] - Array of login records
- `onFilter`: (filters: FilterObject) => void - Filter handler
- `onExport`: (format: 'csv' | 'pdf') => void - Export handler

**Columns**:
- Timestamp
- Status (with color coding)
- Device
- Browser
- Location
- IP Address
- Actions

**Features**:
- Sortable columns
- Filterable by status, date, device
- Pagination controls
- Export functionality
- Suspicious activity highlighting

#### SuspiciousActivityAlert Component

**Purpose**: Display alert for suspicious login attempts.

**Props**:
- `activity`: ActivityObject - Suspicious activity data
- `onDismiss`: () => void - Dismiss handler
- `onSecureAccount`: () => void - Secure account handler

**Display**:
- Warning icon
- Activity description
- Timestamp and location
- "Secure My Account" button
- "This Was Me" button
- "Dismiss" button


#### AccountDeactivationForm Component

**Purpose**: Form for requesting account deactivation.

**Fields**:
- Reason for Deactivation (dropdown, required)
- Additional Comments (textarea, optional)
- Current Password (password input, required)
- Confirmation Checkbox (required)

**Features**:
- Warning messages
- Active bookings check
- Confirmation dialog
- Password verification
- Irreversible action warning

#### DataDownloadRequest Component

**Purpose**: Interface for requesting account data download.

**Features**:
- Data category selection (checkboxes)
- Format selection (JSON, CSV, PDF)
- Request status display
- Download link (when ready)
- Previous requests history

**Display**:
- Category checkboxes with descriptions
- Format radio buttons
- "Request Download" button
- Status indicator (Pending, Processing, Ready)
- Download button (when ready)
- Expiration notice (downloads expire after 7 days)

### User Flows

#### Change Password Flow

1. User navigates to `/settings/security/password`
2. User enters current password
3. User enters new password
4. System displays password strength meter
5. User confirms new password
6. User clicks "Change Password" button
7. System validates current password
8. System validates new password meets requirements
9. System updates password in database
10. System invalidates all other sessions
11. System sends confirmation email
12. System displays success message
13. System redirects to security dashboard

#### Change Email Flow

1. User navigates to `/settings/security/email`
2. User enters new email address
3. User enters current password for verification
4. User clicks "Change Email" button
5. System validates password
6. System checks new email is not already in use
7. System sends verification email to new address
8. System displays "Check your email" message
9. User clicks verification link in email
10. System verifies token and updates email
11. System sends notification to old email
12. System displays success message
13. System redirects to security dashboard


#### View and Manage Active Sessions Flow

1. User navigates to `/settings/security/sessions`
2. System loads all active sessions for user
3. System displays sessions with details
4. User identifies unfamiliar session
5. User clicks "Log Out" button for that session
6. System displays confirmation dialog
7. User confirms logout
8. System terminates session
9. System removes session from list
10. System sends notification email
11. System displays success message

#### Account Deactivation Flow

1. User navigates to `/settings/security/deactivate`
2. System checks for active bookings
3. If active bookings: System displays warning and blocks deactivation
4. If no active bookings: System displays deactivation form
5. User selects reason for deactivation
6. User enters current password
7. User checks confirmation checkbox
8. User clicks "Deactivate Account" button
9. System displays final confirmation dialog
10. User confirms deactivation
11. System validates password
12. System marks account as deactivated
13. System terminates all sessions
14. System sends confirmation email
15. System redirects to goodbye page

#### Data Download Request Flow

1. User navigates to `/settings/security/data-download`
2. User selects data categories to include
3. User selects export format (JSON, CSV, PDF)
4. User clicks "Request Download" button
5. System creates background job to generate export
6. System displays "Processing" status
7. System generates data export file
8. System sends email notification when ready
9. User returns to page or clicks email link
10. User clicks "Download" button
11. System serves file for download
12. System logs download in audit trail

### Data Requirements

#### Password Change API

**POST /api/account/security/password**
```
Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!",
  "confirmPassword": "NewSecurePass456!"
}

Response:
{
  "success": true,
  "message": "Password changed successfully. All other sessions have been logged out.",
  "sessionsTerminated": 3
}
```


#### Email Change API

**POST /api/account/security/email**
```
Request:
{
  "newEmail": "newemail@example.com",
  "password": "CurrentPass123!"
}

Response:
{
  "success": true,
  "message": "Verification email sent to newemail@example.com. Please check your email to confirm the change.",
  "verificationRequired": true
}
```

**GET /api/account/security/email/verify?token=abc123**
```
Response:
{
  "success": true,
  "message": "Email address updated successfully.",
  "newEmail": "newemail@example.com"
}
```

#### Phone Change API

**POST /api/account/security/phone**
```
Request:
{
  "newPhoneNumber": "+1234567890",
  "countryCode": "US",
  "password": "CurrentPass123!"
}

Response:
{
  "success": true,
  "message": "Verification code sent to +1***-***-7890",
  "verificationId": "verify_abc123"
}
```

**POST /api/account/security/phone/verify**
```
Request:
{
  "verificationId": "verify_abc123",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Phone number updated successfully.",
  "newPhoneNumber": "+1234567890"
}
```

#### Active Sessions API

**GET /api/account/security/sessions**
```
Response:
{
  "sessions": [
    {
      "sessionId": "session_abc",
      "deviceType": "Desktop",
      "deviceName": "Chrome on Windows",
      "browser": "Chrome 120",
      "os": "Windows 11",
      "ipAddress": "192.168.1.1",
      "location": "New York, US",
      "lastActivity": "2026-02-23T10:15:00Z",
      "isCurrent": true
    }
  ],
  "totalSessions": 3
}
```

**DELETE /api/account/security/sessions/:sessionId**
```
Response:
{
  "success": true,
  "message": "Session terminated successfully."
}
```

**POST /api/account/security/sessions/logout-all**
```
Response:
{
  "success": true,
  "message": "All other sessions terminated successfully.",
  "terminatedCount": 2
}
```


#### Login History API

**GET /api/account/security/login-history**
```
Query Parameters:
- page: number (default: 1)
- limit: number (default: 50)
- status: 'all' | 'success' | 'failed' | 'blocked'
- startDate: ISO date string
- endDate: ISO date string
- deviceType: 'all' | 'desktop' | 'mobile' | 'tablet'

Response:
{
  "entries": [
    {
      "id": "log_123",
      "timestamp": "2026-02-23T10:15:00Z",
      "status": "success",
      "deviceType": "Desktop",
      "deviceName": "Chrome on Windows",
      "browser": "Chrome 120",
      "os": "Windows 11",
      "ipAddress": "192.168.1.1",
      "location": "New York, US",
      "isSuspicious": false
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 10,
    "totalEntries": 487,
    "limit": 50
  }
}
```

**POST /api/account/security/login-history/export**
```
Request:
{
  "format": "csv",
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-02-23"
  }
}

Response:
{
  "success": true,
  "downloadUrl": "https://cdn.example.com/exports/login-history-abc123.csv",
  "expiresAt": "2026-02-24T10:15:00Z"
}
```

#### Account Deactivation API

**POST /api/account/security/deactivate**
```
Request:
{
  "reason": "no_longer_needed",
  "comments": "Moving to a different service",
  "password": "CurrentPass123!",
  "confirmed": true
}

Response:
{
  "success": true,
  "message": "Account deactivated successfully. You have 30 days to reactivate before permanent deletion.",
  "deactivatedAt": "2026-02-23T10:15:00Z",
  "permanentDeletionDate": "2026-03-25T10:15:00Z"
}
```

#### Data Download API

**POST /api/account/security/data-download**
```
Request:
{
  "categories": ["profile", "bookings", "payments", "login_history"],
  "format": "json"
}

Response:
{
  "success": true,
  "requestId": "download_abc123",
  "status": "processing",
  "message": "Your data export is being prepared. You will receive an email when it's ready."
}
```

**GET /api/account/security/data-download/:requestId**
```
Response:
{
  "requestId": "download_abc123",
  "status": "ready",
  "downloadUrl": "https://cdn.example.com/exports/user-data-abc123.json",
  "expiresAt": "2026-03-02T10:15:00Z",
  "fileSize": "2.5 MB",
  "createdAt": "2026-02-23T10:15:00Z"
}
```


## Backend Specifications

### API Endpoints

#### POST /api/account/security/password
**Purpose**: Change user password with current password verification.

**Authentication**: Required (JWT token)

**Request Body**:
- `currentPassword`: string (required)
- `newPassword`: string (required, min 8 characters)
- `confirmPassword`: string (required, must match newPassword)

**Response**: Success confirmation and terminated sessions count

**Business Logic**:
- Verify current password is correct
- Validate new password meets strength requirements
- Ensure new password differs from current password
- Hash new password using bcrypt or Argon2
- Update password in database
- Terminate all other active sessions
- Send confirmation email
- Log password change in audit trail

#### POST /api/account/security/email
**Purpose**: Initiate email address change with verification.

**Authentication**: Required (JWT token)

**Request Body**:
- `newEmail`: string (required, valid email format)
- `password`: string (required)

**Response**: Verification email sent confirmation

**Business Logic**:
- Verify current password
- Check new email is not already in use
- Generate email verification token (expires in 24 hours)
- Send verification email to new address
- Store pending email change in database
- Send notification to current email

#### GET /api/account/security/email/verify
**Purpose**: Complete email change after verification.

**Authentication**: Not required (uses verification token)

**Query Parameters**:
- `token`: string (required) - Email verification token

**Response**: Email updated confirmation

**Business Logic**:
- Validate verification token
- Check token not expired
- Update email address in database
- Remove pending email change record
- Send confirmation to new email
- Send notification to old email
- Log email change in audit trail


#### POST /api/account/security/phone
**Purpose**: Initiate phone number change with SMS verification.

**Authentication**: Required (JWT token)

**Request Body**:
- `newPhoneNumber`: string (required, E.164 format)
- `countryCode`: string (required)
- `password`: string (required)

**Response**: SMS OTP sent confirmation

**Business Logic**:
- Verify current password
- Validate phone number format
- Generate 6-digit OTP code
- Store OTP with 5-minute expiration
- Send SMS via Twilio or AWS SNS
- Return verification ID for OTP submission

#### POST /api/account/security/phone/verify
**Purpose**: Complete phone number change after SMS verification.

**Authentication**: Required (JWT token)

**Request Body**:
- `verificationId`: string (required)
- `code`: string (required, 6 digits)

**Response**: Phone number updated confirmation

**Business Logic**:
- Validate OTP code
- Check code not expired
- Update phone number in database
- Send confirmation SMS to new number
- Log phone change in audit trail

#### GET /api/account/security/sessions
**Purpose**: Retrieve all active login sessions for user.

**Authentication**: Required (JWT token)

**Response**: Array of active session objects

**Business Logic**:
- Query sessions table for user's active sessions
- Include device metadata (type, browser, OS)
- Include location data from IP geolocation
- Mark current session
- Sort by last activity (most recent first)

#### DELETE /api/account/security/sessions/:sessionId
**Purpose**: Terminate specific login session.

**Authentication**: Required (JWT token)

**Response**: Session terminated confirmation

**Business Logic**:
- Verify session belongs to current user
- Remove session from database
- Invalidate session token
- Send notification email if session terminated remotely
- Log session termination in audit trail


#### POST /api/account/security/sessions/logout-all
**Purpose**: Terminate all login sessions except current.

**Authentication**: Required (JWT token)

**Response**: Terminated sessions count

**Business Logic**:
- Query all sessions for current user
- Exclude current session
- Remove all other sessions from database
- Invalidate all other session tokens
- Send notification email
- Log bulk session termination in audit trail

#### GET /api/account/security/login-history
**Purpose**: Retrieve paginated login history with filtering.

**Authentication**: Required (JWT token)

**Query Parameters**: page, limit, status, startDate, endDate, deviceType

**Response**: Paginated array of login history entries

**Business Logic**:
- Query login_history table with filters
- Include device and location metadata
- Flag suspicious activities (new location, unusual time)
- Paginate results (default 50 per page)
- Sort by timestamp (most recent first)

#### POST /api/account/security/deactivate
**Purpose**: Deactivate user account with 30-day grace period.

**Authentication**: Required (JWT token)

**Request Body**:
- `reason`: string (required)
- `comments`: string (optional)
- `password`: string (required)
- `confirmed`: boolean (required, must be true)

**Response**: Deactivation confirmation with deletion date

**Business Logic**:
- Verify current password
- Check for active bookings (block if any exist)
- Mark account as deactivated
- Set permanent deletion date (30 days from now)
- Terminate all active sessions
- Send confirmation email
- Schedule deletion job
- Log deactivation in audit trail

#### POST /api/account/security/data-download
**Purpose**: Request account data export (GDPR compliance).

**Authentication**: Required (JWT token)

**Request Body**:
- `categories`: string[] (required)
- `format`: string (required, 'json' | 'csv' | 'pdf')

**Response**: Request ID and processing status

**Business Logic**:
- Create data export job
- Queue background job to generate export
- Collect data from specified categories
- Generate file in requested format
- Upload to secure CDN with expiration
- Send email notification when ready
- Log data export request in audit trail


### Authentication Requirements

**User Authentication**: All endpoints require valid JWT token from authenticated user.

**Password Verification**: Sensitive operations (password change, email change, phone change, account deactivation) require current password verification.

**Rate Limiting**: Implement rate limiting on all endpoints to prevent abuse.

**Audit Logging**: Log all security-related actions for compliance and security monitoring.

## Database Specifications

### Schema Changes

**Modified Table: users**

Add columns for email/phone change tracking and account deactivation.

**New Table: pending_email_changes**

Purpose: Track pending email address changes awaiting verification.

**New Table: pending_phone_changes**

Purpose: Track pending phone number changes with OTP codes.

**New Table: login_history**

Purpose: Comprehensive log of all login attempts (success and failure).

**New Table: security_audit_log**

Purpose: Audit trail of all security-related actions.

**New Table: data_export_requests**

Purpose: Track user data export requests and download links.

### Table Definitions

#### users (modifications)

```sql
ALTER TABLE users
ADD COLUMN is_deactivated BOOLEAN DEFAULT FALSE,
ADD COLUMN deactivated_at TIMESTAMP NULL,
ADD COLUMN permanent_deletion_date TIMESTAMP NULL,
ADD COLUMN last_password_change TIMESTAMP NULL,
ADD COLUMN password_change_count INT DEFAULT 0;
```

#### pending_email_changes

```sql
CREATE TABLE pending_email_changes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  current_email VARCHAR(255) NOT NULL,
  new_email VARCHAR(255) NOT NULL,
  verification_token VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_token (verification_token),
  INDEX idx_user_active (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### pending_phone_changes

```sql
CREATE TABLE pending_phone_changes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  current_phone VARCHAR(20) NULL,
  new_phone VARCHAR(20) NOT NULL,
  otp_code_hash VARCHAR(255) NOT NULL,
  verification_id VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_verification (verification_id),
  INDEX idx_user_active (user_id, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### login_history

```sql
CREATE TABLE login_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  status ENUM('success', 'failed', 'blocked') NOT NULL,
  device_type ENUM('Desktop', 'Mobile', 'Tablet') NOT NULL,
  device_name VARCHAR(255) NOT NULL,
  browser VARCHAR(100) NULL,
  os VARCHAR(100) NULL,
  ip_address VARCHAR(45) NOT NULL,
  location VARCHAR(255) NULL,
  is_suspicious BOOLEAN DEFAULT FALSE,
  failure_reason VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_status_created (status, created_at),
  INDEX idx_suspicious (is_suspicious, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### security_audit_log

```sql
CREATE TABLE security_audit_log (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  action ENUM('password_change', 'email_change', 'phone_change', 'session_terminate', 'account_deactivate', 'data_export') NOT NULL,
  details JSON NULL,
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at),
  INDEX idx_action_created (action, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### data_export_requests

```sql
CREATE TABLE data_export_requests (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  request_id VARCHAR(255) NOT NULL,
  categories JSON NOT NULL,
  format ENUM('json', 'csv', 'pdf') NOT NULL,
  status ENUM('pending', 'processing', 'ready', 'expired', 'failed') NOT NULL,
  download_url VARCHAR(500) NULL,
  file_size VARCHAR(50) NULL,
  expires_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_request (request_id),
  INDEX idx_user_status (user_id, status),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**pending_email_changes → users**: Many-to-one. Each user can have one pending email change at a time.

**pending_phone_changes → users**: Many-to-one. Each user can have one pending phone change at a time.

**login_history → users**: Many-to-one. Each user has multiple login history entries.

**security_audit_log → users**: Many-to-one. Each user has multiple audit log entries.

**data_export_requests → users**: Many-to-one. Each user can have multiple export requests.

### Indexes

**Performance Indexes**:
- `idx_user_active` on pending_email_changes and pending_phone_changes: Fast lookup of active pending changes
- `idx_user_created` on login_history and security_audit_log: User activity history queries
- `idx_status_created` on login_history: Filter by login status
- `idx_suspicious` on login_history: Quick access to suspicious activities
- `idx_user_status` on data_export_requests: User's export request queries
- `idx_expires` on data_export_requests: Cleanup expired downloads

**Security Indexes**:
- Unique index on verification_token in pending_email_changes
- Unique index on verification_id in pending_phone_changes
- Unique index on request_id in data_export_requests

## Technology Stack

- **Frontend**: Next.js 14+ with TypeScript, React 18+
- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **SMS Service**: Twilio or AWS SNS for OTP delivery
- **Email Service**: SendGrid or AWS SES for notifications
- **File Storage**: AWS S3 or Azure Blob Storage for data exports
- **Background Jobs**: Hangfire or Azure Functions for data export processing


## Implementation Notes

### Security Considerations

1. **Password Verification**: Always require current password for sensitive operations (password change, email change, phone change, account deactivation).

2. **Email Verification**: Email changes must be verified via link sent to new email address. Notify old email address of change.

3. **Phone Verification**: Phone changes must be verified via SMS OTP. Use secure OTP generation and storage.

4. **Session Management**: Terminate all other sessions when password is changed to prevent unauthorized access.

5. **Rate Limiting**: Implement strict rate limiting on all security endpoints to prevent abuse.

6. **Audit Logging**: Log all security-related actions with IP address, user agent, and timestamp for compliance and security monitoring.

7. **Data Export Security**: Generate time-limited download URLs (7 days) and store exports in secure, private storage.

### User Experience Considerations

1. **Clear Communication**: Provide clear explanations of what happens when users change security settings.

2. **Confirmation Emails**: Send confirmation emails for all security changes to keep users informed.

3. **Suspicious Activity Alerts**: Proactively notify users of suspicious login attempts or unusual activity.

4. **Grace Period**: Provide 30-day grace period for account deactivation to allow users to change their mind.

5. **Data Export Transparency**: Clearly explain what data is included in exports and how long downloads are available.

6. **Session Visibility**: Provide detailed information about active sessions to help users identify unauthorized access.

### Accessibility Requirements

1. **Keyboard Navigation**: All security settings pages must be fully keyboard accessible.

2. **Screen Reader Support**: Provide clear ARIA labels and announcements for all security actions.

3. **Error Announcements**: Screen readers must announce validation errors and success messages.

4. **Focus Management**: Maintain logical focus order and visible focus indicators.

5. **Color Contrast**: WCAG AA compliance for all text and interactive elements.

### Testing Requirements

1. **Unit Tests**: Test all validation logic, password hashing, and token generation.

2. **Integration Tests**: Test complete flows for password change, email change, phone change, and account deactivation.

3. **Security Tests**: Test rate limiting, session management, and audit logging.

4. **E2E Tests**: Test user flows from security dashboard through completion of security actions.

5. **Load Tests**: Verify system can handle concurrent security operations.


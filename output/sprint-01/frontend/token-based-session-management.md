# Feature: Token-Based Session Management

## Overview

Token-Based Session Management provides secure, encrypted session tokens with configurable expiration, signature verification, and platform-specific storage mechanisms. This feature ensures secure authentication state management across web and mobile platforms, protecting against common attacks like XSS and CSRF while providing flexible session duration options.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-006: Token-Based Session Management

## User Stories

### As a user
- I want my login session to persist securely so that I don't have to re-authenticate frequently
- I want the option to "stay connected" for extended periods so that I can access the platform conveniently
- I want my session to be secure so that unauthorized users cannot hijack my account

### As a security administrator
- I want session tokens to be encrypted and signed so that they cannot be tampered with
- I want configurable token expiration so that I can balance security and user convenience
- I want platform-specific secure storage so that tokens are protected according to best practices

### As a developer
- I want a consistent token structure so that authentication logic is maintainable
- I want automatic token validation so that security checks are enforced consistently
- I want token lifecycle management so that expired or revoked tokens are handled properly

## Frontend Specifications

### Pages

**Login Page** (`/login`)
- Token received after successful authentication
- "Stay connected" checkbox for extended session duration
- Token stored in platform-specific secure storage

**All Authenticated Pages**
- Token automatically included in API requests
- Token expiration monitoring
- Automatic redirect to login on token expiration
- Silent token refresh (if implemented)

### UI Components

**Session Status Indicator**
- Visual indicator of authentication state
- Warning before session expiration (optional)
- Countdown timer for expiring sessions (optional)

**Stay Connected Checkbox**
- Checkbox on login form
- Label: "Keep me signed in for 400 days"
- Tooltip explaining extended session duration

**Session Expired Modal**
- Modal dialog when token expires
- Message: "Your session has expired. Please log in again."
- "Log In" button redirecting to login page
- Option to save current work before redirect (if applicable)

### User Flows

**Standard Login Flow**:
1. User enters credentials on login page
2. Backend validates credentials and generates token
3. Token returned in response (cookie for web, body for mobile)
4. Frontend stores token in secure storage
5. Token included in all subsequent API requests
6. User remains authenticated until token expires (24 hours default)

**Extended Session Flow**:
1. User checks "Stay connected" checkbox on login
2. Backend generates token with extended expiration (400 days)
3. Token stored with extended validity
4. User remains authenticated for extended period
5. Token automatically renewed on activity (optional)

**Token Expiration Flow**:
1. Token expiration time reached
2. Frontend detects expired token on next API request
3. API returns 401 Unauthorized
4. Frontend displays session expired modal
5. User redirected to login page
6. Previous page URL saved for post-login redirect

### Data Requirements

**Token Storage (Web)**:
- HTTP-only cookies (automatic browser management)
- Secure flag (HTTPS only)
- SameSite attribute (CSRF protection)
- Domain and path configuration

**Token Storage (Mobile)**:
- iOS Keychain for secure token storage
- Android Keystore for encrypted storage
- Biometric protection for token access (optional)
- Automatic token retrieval for API requests

**Token Metadata**:
- Token string (encrypted payload)
- Expiration timestamp
- User ID (for quick lookup)
- Device identifier (optional, for multi-device management)

## Backend Specifications

### API Endpoints

**POST /api/auth/login**
- Purpose: Authenticate user and generate session token
- Request Body:
  ```
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "stayConnected": false
  }
  ```
- Response (Web):
  ```
  Set-Cookie: session_token=<encrypted_token>; HttpOnly; Secure; SameSite=Strict; Max-Age=86400
  {
    "success": true,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```
- Response (Mobile):
  ```
  {
    "success": true,
    "token": "<encrypted_token>",
    "expiresAt": "2026-02-25T12:00:00Z",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
  ```

**POST /api/auth/logout**
- Purpose: Invalidate current session token
- Request Headers: `Cookie: session_token=<token>` (Web) or `X-Access-Token: <token>` (Mobile)
- Response:
  ```
  Set-Cookie: session_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

**GET /api/auth/validate**
- Purpose: Validate current session token
- Request Headers: `Cookie: session_token=<token>` (Web) or `X-Access-Token: <token>` (Mobile)
- Response:
  ```
  {
    "valid": true,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com"
    },
    "expiresAt": "2026-02-25T12:00:00Z"
  }
  ```

**POST /api/auth/refresh** (Optional Enhancement)
- Purpose: Refresh access token using refresh token
- Request Body:
  ```
  {
    "refreshToken": "<refresh_token>"
  }
  ```
- Response:
  ```
  {
    "success": true,
    "token": "<new_access_token>",
    "expiresAt": "2026-02-25T12:00:00Z"
  }
  ```

### Request Schemas

**LoginRequest**:
- email: string (required, valid email format)
- password: string (required, minimum 6 characters)
- stayConnected: boolean (optional, default false)

**RefreshTokenRequest**:
- refreshToken: string (required, valid JWT format)

### Response Schemas

**LoginResponse**:
- success: boolean
- token: string (mobile only, encrypted JWT)
- user: UserObject
- expiresAt: ISO 8601 timestamp

**ValidateResponse**:
- valid: boolean
- user: UserObject (if valid)
- expiresAt: ISO 8601 timestamp (if valid)
- error: string (if invalid)

**UserObject**:
- id: string (UUID)
- email: string
- name: string
- role: string (customer, admin, fleet_manager)

### Business Logic

**Token Generation**:
1. Validate user credentials
2. Create token payload:
   - User ID (encrypted)
   - Expiration timestamp (24 hours or 400 days based on stayConnected)
   - Issued at timestamp
   - Random nonce (prevent replay attacks)
3. Encrypt payload using secret key (AES-256)
4. Sign encrypted payload using HMAC-SHA256
5. Combine encrypted payload and signature into token string
6. Return token to client

**Token Validation**:
1. Extract token from request (cookie or header)
2. Split token into encrypted payload and signature
3. Verify signature using HMAC-SHA256
4. Decrypt payload using secret key
5. Check expiration timestamp
6. Validate user ID exists and account is active
7. Return validation result

**Token Invalidation**:
1. Extract token from request
2. Add token to revocation list (Redis cache)
3. Set revocation expiry to match token expiry
4. Clear client-side token (cookie deletion or response instruction)

**Session Duration Logic**:
- Standard session: 24 hours (86400 seconds)
- Extended session: 400 days (34560000 seconds)
- Configurable via environment variables
- Automatic expiration enforcement

### Authentication Requirements

**Token Security**:
- Encryption: AES-256-GCM for payload encryption
- Signing: HMAC-SHA256 for signature generation
- Secret Key: 256-bit random key stored in environment variables
- Key Rotation: Support for multiple active keys (graceful rotation)

**Platform-Specific Storage**:
- Web: HTTP-only, Secure, SameSite=Strict cookies
- Mobile: Secure storage APIs (Keychain, Keystore)
- No localStorage or sessionStorage for tokens (XSS vulnerability)

**Token Revocation**:
- Maintain revocation list in Redis cache
- Check revocation list on every token validation
- Automatic cleanup of expired revocations
- Revoke on logout, password change, security events

## Database Specifications

### Schema Changes

**users table** (existing, no changes required)
- id: UUID (primary key)
- email: VARCHAR(255)
- password_hash: VARCHAR(255)
- account_status: ENUM('created', 'unverified', 'verified', 'active', 'suspended', 'expired')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP

**sessions table** (new, optional for session tracking)
```sql
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  device_type ENUM('web', 'ios', 'android') NOT NULL,
  device_identifier VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Table Definitions

**sessions table** (optional, for session tracking and management):
- id: Unique session identifier (UUID)
- user_id: Reference to users table
- token_hash: SHA-256 hash of token (for lookup without storing full token)
- device_type: Platform identifier (web, ios, android)
- device_identifier: Device-specific identifier (optional)
- ip_address: IP address of session creation
- user_agent: Browser/app user agent string
- created_at: Session creation timestamp
- expires_at: Session expiration timestamp
- last_activity_at: Last API request timestamp
- revoked_at: Revocation timestamp (NULL if active)

### Relationships

**users ↔ sessions**: One-to-many relationship
- One user can have multiple active sessions (multi-device support)
- Sessions reference user via user_id foreign key
- Cascade delete: Deleting user removes all sessions

### Indexes

**sessions table**:
- PRIMARY KEY on id (fast session lookup)
- INDEX on user_id (find all sessions for user)
- INDEX on token_hash (validate token quickly)
- INDEX on expires_at (cleanup expired sessions efficiently)

**Cleanup Query** (scheduled job):
```sql
DELETE FROM sessions 
WHERE expires_at < NOW() 
  OR revoked_at IS NOT NULL;
```

## Technology Stack

- Backend: .NET 8+ with C# (ASP.NET Core Web API)
- Database: MySQL 8.0+ (optional sessions table)
- Frontend: Next.js 14+ with TypeScript
- Token Library: System.IdentityModel.Tokens.Jwt (JWT handling)
- Encryption: System.Security.Cryptography (AES-256, HMAC-SHA256)
- Cache: Redis (token revocation list)

## Implementation Notes

### Security Best Practices

1. **Never expose tokens in URLs**: Use headers or cookies only
2. **Implement token rotation**: Rotate tokens on sensitive actions (optional enhancement)
3. **Use short-lived access tokens**: Consider 15-minute access tokens with refresh tokens
4. **Monitor for suspicious activity**: Track login locations, device changes, unusual patterns
5. **Implement rate limiting**: Prevent brute force attacks on token validation
6. **Log security events**: Track token generation, validation failures, revocations

### Performance Considerations

1. **Cache token validation**: Use Redis to cache valid tokens (reduce database queries)
2. **Optimize revocation checks**: Use Redis for fast revocation list lookups
3. **Batch session cleanup**: Run scheduled job to delete expired sessions (not on every request)
4. **Consider stateless tokens**: JWT tokens can be validated without database lookup (trade-off: harder to revoke)

### Multi-Device Support

- Users can have multiple active sessions simultaneously
- Each device gets its own token
- Sessions table tracks all active sessions per user
- User can view and revoke sessions from account settings
- Automatic cleanup of expired sessions

### Token Refresh Strategy (Optional Enhancement)

- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (30 days)
- Access token used for API requests
- Refresh token used to obtain new access token
- Refresh token rotation on use (security best practice)

## Dependencies

- F-SEC-AUTH-001: Email/Password Authentication (primary authentication method)
- F-SEC-AUTH-002: Social Login Authentication (alternative authentication method)
- Redis cache for token revocation list
- Environment variables for secret keys and configuration

## Related Features

- F-SEC-AUTH-007: Multi-Factor Authentication (enhanced security layer)
- F-SEC-AUTH-008: Authentication Attack Protection (rate limiting, account lockout)
- F-AM-012: Account Security Settings (session management UI)

## Acceptance Criteria

1. Users can log in and receive a secure session token
2. Tokens are stored securely (HTTP-only cookies for web, secure storage for mobile)
3. Tokens are encrypted and signed to prevent tampering
4. Token expiration is enforced (24 hours standard, 400 days for "stay connected")
5. Expired tokens are rejected with 401 Unauthorized response
6. Users can log out and invalidate their session token
7. Token validation occurs on every authenticated API request
8. Revoked tokens are rejected even if not expired
9. Platform-specific storage mechanisms are implemented correctly
10. Session tracking table (optional) records all active sessions

## Testing Considerations

### Unit Tests
- Token generation with correct payload structure
- Token encryption and decryption
- Token signature generation and verification
- Token expiration validation
- Token revocation logic

### Integration Tests
- Login flow with token generation
- API requests with valid token
- API requests with expired token
- API requests with revoked token
- Logout flow with token invalidation
- Multi-device session management

### Security Tests
- Token tampering detection
- Expired token rejection
- Revoked token rejection
- XSS protection (HTTP-only cookies)
- CSRF protection (SameSite cookies)
- Token signature verification


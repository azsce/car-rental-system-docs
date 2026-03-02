# Feature: Token-Based Session Management

## Overview

Token-Based Session Management provides secure, encrypted session tokens with configurable expiration, signature verification, and platform-specific storage mechanisms. This backend feature implements the core token generation, validation, and lifecycle management logic that powers secure authentication across web and mobile platforms.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-006: Token-Based Session Management

## User Stories

### As a backend developer
- I want to generate secure session tokens so that user authentication state is protected
- I want to validate tokens efficiently so that API performance is not degraded
- I want to manage token lifecycle so that expired and revoked tokens are handled correctly

### As a security administrator
- I want tokens to be encrypted and signed so that they cannot be tampered with or forged
- I want configurable token expiration so that I can balance security and user convenience
- I want token revocation capability so that compromised tokens can be invalidated immediately

## Backend Specifications

### API Endpoints

**POST /api/auth/login**
- Purpose: Authenticate user and generate session token
- Authentication: None (public endpoint)
- Request Body:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "stayConnected": false
  }
  ```
- Success Response (200 OK):
  - Web: Set-Cookie header with encrypted token
  - Mobile: Token in response body
  ```json
  {
    "success": true,
    "token": "<encrypted_token>",
    "expiresAt": "2026-02-25T12:00:00Z",
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    }
  }
  ```
- Error Responses:
  - 400 Bad Request: Invalid email or password format
  - 401 Unauthorized: Invalid credentials
  - 429 Too Many Requests: Rate limit exceeded

**POST /api/auth/logout**
- Purpose: Invalidate current session token
- Authentication: Required (valid session token)
- Request Headers: `Cookie: session_token=<token>` or `X-Access-Token: <token>`
- Success Response (200 OK):
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```
- Error Responses:
  - 401 Unauthorized: Invalid or expired token

**GET /api/auth/validate**
- Purpose: Validate current session token and return user info
- Authentication: Required (valid session token)
- Request Headers: `Cookie: session_token=<token>` or `X-Access-Token: <token>`
- Success Response (200 OK):
  ```json
  {
    "valid": true,
    "user": {
      "id": "user-uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "customer"
    },
    "expiresAt": "2026-02-25T12:00:00Z"
  }
  ```
- Error Responses:
  - 401 Unauthorized: Invalid, expired, or revoked token

**POST /api/auth/refresh** (Optional Enhancement)
- Purpose: Refresh access token using refresh token
- Authentication: Required (valid refresh token)
- Request Body:
  ```json
  {
    "refreshToken": "<refresh_token>"
  }
  ```
- Success Response (200 OK):
  ```json
  {
    "success": true,
    "token": "<new_access_token>",
    "expiresAt": "2026-02-25T12:00:00Z"
  }
  ```
- Error Responses:
  - 401 Unauthorized: Invalid or expired refresh token

**GET /api/auth/sessions** (Optional Enhancement)
- Purpose: List all active sessions for current user
- Authentication: Required (valid session token)
- Success Response (200 OK):
  ```json
  {
    "sessions": [
      {
        "id": "session-uuid",
        "deviceType": "web",
        "deviceIdentifier": "Chrome on Windows",
        "ipAddress": "192.168.1.1",
        "createdAt": "2026-02-20T10:00:00Z",
        "lastActivityAt": "2026-02-24T15:30:00Z",
        "expiresAt": "2026-02-25T12:00:00Z",
        "current": true
      }
    ]
  }
  ```

**DELETE /api/auth/sessions/:sessionId** (Optional Enhancement)
- Purpose: Revoke specific session
- Authentication: Required (valid session token)
- Success Response (200 OK):
  ```json
  {
    "success": true,
    "message": "Session revoked successfully"
  }
  ```

### Request Schemas

**LoginRequest**:
- email: string (required, valid email format, max 255 characters)
- password: string (required, minimum 6 characters, max 255 characters)
- stayConnected: boolean (optional, default false)

**RefreshTokenRequest**:
- refreshToken: string (required, valid JWT format)

### Response Schemas

**LoginResponse**:
- success: boolean
- token: string (mobile only, encrypted JWT)
- expiresAt: string (ISO 8601 timestamp)
- user: UserObject

**ValidateResponse**:
- valid: boolean
- user: UserObject (if valid)
- expiresAt: string (ISO 8601 timestamp, if valid)
- error: string (if invalid)

**UserObject**:
- id: string (UUID)
- email: string
- name: string
- role: string (customer, admin, fleet_manager, support_agent)

**SessionObject**:
- id: string (UUID)
- deviceType: string (web, ios, android)
- deviceIdentifier: string
- ipAddress: string
- createdAt: string (ISO 8601 timestamp)
- lastActivityAt: string (ISO 8601 timestamp)
- expiresAt: string (ISO 8601 timestamp)
- current: boolean

### Business Logic

**Token Generation Algorithm**:
```
1. Validate user credentials against database
2. Check account status (must be 'active' or 'verified')
3. Determine expiration duration:
   - Standard: 24 hours (86400 seconds)
   - Extended: 400 days (34560000 seconds) if stayConnected=true
4. Create token payload:
   {
     "userId": "<encrypted_user_id>",
     "exp": <expiration_timestamp>,
     "iat": <issued_at_timestamp>,
     "nonce": "<random_32_byte_string>"
   }
5. Serialize payload to JSON
6. Encrypt payload using AES-256-GCM with secret key
7. Generate HMAC-SHA256 signature of encrypted payload
8. Combine: base64(encrypted_payload) + "." + base64(signature)
9. Return token to client
10. Optionally: Store session record in database
```

**Token Validation Algorithm**:
```
1. Extract token from request (Cookie header or X-Access-Token header)
2. If token missing: Return 401 Unauthorized
3. Split token into encrypted_payload and signature
4. Verify signature using HMAC-SHA256
5. If signature invalid: Return 401 Unauthorized
6. Decrypt payload using AES-256-GCM
7. If decryption fails: Return 401 Unauthorized
8. Parse JSON payload
9. Check expiration timestamp
10. If expired: Return 401 Unauthorized
11. Check token revocation list (Redis cache)
12. If revoked: Return 401 Unauthorized
13. Decrypt user ID from payload
14. Query database for user
15. If user not found or inactive: Return 401 Unauthorized
16. Return user object and validation success
17. Optionally: Update last_activity_at in sessions table
```

**Token Revocation Algorithm**:
```
1. Extract token from request
2. Validate token (ensure it's valid before revoking)
3. Generate token hash (SHA-256)
4. Add token hash to Redis revocation list
5. Set Redis expiry to match token expiry
6. Optionally: Update revoked_at in sessions table
7. Return success response
```

**Session Duration Configuration**:
- Environment variable: `SESSION_DURATION_HOURS` (default: 24)
- Environment variable: `EXTENDED_SESSION_DURATION_DAYS` (default: 400)
- Configurable per environment (dev, staging, production)
- Maximum session duration: 400 days (security policy)

### Authentication Requirements

**Token Security Standards**:
- Encryption Algorithm: AES-256-GCM (authenticated encryption)
- Signing Algorithm: HMAC-SHA256
- Secret Key: 256-bit random key (stored in environment variables)
- Key Rotation: Support multiple active keys with key versioning
- Nonce: 32-byte random nonce per token (prevent replay attacks)

**Secret Key Management**:
- Store in environment variables (never in code)
- Use different keys per environment
- Rotate keys periodically (quarterly recommended)
- Support graceful key rotation (multiple active keys)
- Use key versioning in token payload

**Token Revocation Strategy**:
- Redis cache for revocation list (fast lookup)
- Key format: `revoked:token:<token_hash>`
- TTL matches token expiration
- Automatic cleanup on expiry
- Check revocation on every validation

**Rate Limiting**:
- Login endpoint: 5 attempts per 15 minutes per IP
- Validate endpoint: 100 requests per minute per token
- Refresh endpoint: 10 requests per hour per refresh token
- Use Redis for rate limit counters

## Database Specifications

### Schema Changes

**sessions table** (new, optional for session tracking):
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
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_revoked_at (revoked_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Definitions

**sessions table** (optional):
- id: VARCHAR(36) - Unique session identifier (UUID)
- user_id: VARCHAR(36) - Reference to users table
- token_hash: VARCHAR(64) - SHA-256 hash of token (for lookup)
- device_type: ENUM - Platform identifier (web, ios, android)
- device_identifier: VARCHAR(255) - Device-specific identifier
- ip_address: VARCHAR(45) - IP address of session creation (supports IPv6)
- user_agent: TEXT - Browser/app user agent string
- created_at: TIMESTAMP - Session creation timestamp
- expires_at: TIMESTAMP - Session expiration timestamp
- last_activity_at: TIMESTAMP - Last API request timestamp (auto-updated)
- revoked_at: TIMESTAMP - Revocation timestamp (NULL if active)

### Relationships

**users ↔ sessions**: One-to-many
- One user can have multiple active sessions
- Sessions reference user via user_id foreign key
- CASCADE DELETE: Deleting user removes all sessions

### Indexes

**sessions table**:
- PRIMARY KEY on id (fast session lookup by ID)
- INDEX on user_id (find all sessions for user)
- INDEX on token_hash (validate token quickly)
- INDEX on expires_at (cleanup expired sessions efficiently)
- INDEX on revoked_at (find revoked sessions)

**Query Optimization**:
- Use token_hash index for validation queries
- Use expires_at index for cleanup jobs
- Use user_id index for session listing

## Technology Stack

- Backend: .NET 8+ with C# (ASP.NET Core Web API)
- Database: MySQL 8.0+ (optional sessions table)
- Cache: Redis 6.0+ (token revocation list, rate limiting)
- Libraries:
  - System.IdentityModel.Tokens.Jwt (JWT handling)
  - System.Security.Cryptography (AES-256, HMAC-SHA256)
  - StackExchange.Redis (Redis client)
  - BCrypt.Net-Next (password hashing)

## Implementation Notes

### .NET Implementation Details

**Token Generation Service**:
```
public class TokenService
{
    private readonly IConfiguration _config;
    private readonly IRedisCache _cache;
    
    public async Task<string> GenerateToken(User user, bool stayConnected)
    {
        var expiration = stayConnected 
            ? DateTime.UtcNow.AddDays(400)
            : DateTime.UtcNow.AddHours(24);
            
        var payload = new TokenPayload
        {
            UserId = EncryptUserId(user.Id),
            Expiration = expiration,
            IssuedAt = DateTime.UtcNow,
            Nonce = GenerateNonce()
        };
        
        var json = JsonSerializer.Serialize(payload);
        var encrypted = EncryptPayload(json);
        var signature = GenerateSignature(encrypted);
        
        return $"{Convert.ToBase64String(encrypted)}.{Convert.ToBase64String(signature)}";
    }
}
```

**Token Validation Middleware**:
```
public class TokenValidationMiddleware
{
    public async Task InvokeAsync(HttpContext context)
    {
        var token = ExtractToken(context.Request);
        
        if (token == null)
        {
            context.Response.StatusCode = 401;
            return;
        }
        
        var validationResult = await _tokenService.ValidateToken(token);
        
        if (!validationResult.IsValid)
        {
            context.Response.StatusCode = 401;
            return;
        }
        
        context.Items["User"] = validationResult.User;
        await _next(context);
    }
}
```

### Redis Integration

**Revocation List Management**:
- Key pattern: `revoked:token:{token_hash}`
- Value: Revocation timestamp
- TTL: Match token expiration
- Atomic operations for thread safety

**Rate Limiting**:
- Key pattern: `ratelimit:login:{ip_address}`
- Value: Attempt count
- TTL: 15 minutes
- Increment on each attempt
- Block if count exceeds threshold

### Performance Optimization

1. **Cache token validation results**: Cache valid tokens for 5 minutes
2. **Batch session updates**: Update last_activity_at every 5 minutes (not every request)
3. **Use Redis for revocation checks**: Faster than database queries
4. **Optimize database queries**: Use indexes for all lookups
5. **Consider stateless tokens**: JWT tokens can be validated without database (trade-off: harder to revoke)

### Security Considerations

1. **Never log tokens**: Redact tokens in application logs
2. **Use secure random number generator**: System.Security.Cryptography.RandomNumberGenerator
3. **Implement key rotation**: Support multiple active keys with versioning
4. **Monitor for suspicious activity**: Track failed validation attempts
5. **Implement token binding**: Bind tokens to IP address or device (optional)

## Dependencies

- F-SEC-AUTH-001: Email/Password Authentication (provides user credentials)
- F-SEC-AUTH-002: Social Login Authentication (alternative authentication)
- Redis cache infrastructure
- Environment configuration for secret keys

## Related Features

- F-SEC-AUTH-007: Multi-Factor Authentication (additional security layer)
- F-SEC-AUTH-008: Authentication Attack Protection (rate limiting, account lockout)
- F-AM-012: Account Security Settings (session management UI)

## Acceptance Criteria

1. Token generation creates encrypted, signed tokens with correct expiration
2. Token validation correctly verifies signature, expiration, and user status
3. Token revocation adds tokens to revocation list and rejects them on validation
4. Session duration is configurable (24 hours standard, 400 days extended)
5. Platform-specific token delivery (cookies for web, body for mobile)
6. Rate limiting prevents brute force attacks on authentication endpoints
7. Token revocation list is maintained in Redis with automatic cleanup
8. Sessions table (optional) tracks all active sessions per user
9. Multi-device support allows multiple concurrent sessions per user
10. Security best practices are followed (encryption, signing, secure storage)


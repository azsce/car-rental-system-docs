# Feature: API Key Authorization

## Overview

API Key Authorization provides an alternative authentication and authorization method for programmatic access to the car rental platform. This feature enables corporate clients, third-party integrations, and automated systems to access platform APIs using API keys instead of user credentials. The system supports API key generation, scope definition, rate limiting, key rotation, and revocation, enabling secure B2B integrations and automated booking systems.

## Sprint Category

nice-to-have

## Feature ID

F-SEC-AUTHZ-007

## User Stories

### As a corporate client
I want to generate API keys for my travel management system, so that I can integrate car rental bookings into our automated workflows.

### As a third-party developer
I want to use API keys to build applications on the platform, so that I can create value-added services for customers.

### As a platform administrator
I want to manage API key permissions and rate limits, so that I can control programmatic access and prevent abuse.

### As a security officer
I want API keys to be scoped and revocable, so that compromised keys can be immediately disabled without affecting other integrations.

## Frontend Specifications

### Pages

**API Keys Management Page** (`/settings/api-keys`)
- List of user's API keys with names and creation dates
- Create new API key button
- Revoke API key button for each key
- Last used timestamp for each key
- Usage statistics (requests per day)

**Create API Key Page** (`/settings/api-keys/create`)
- API key name input field
- Scope selector (permissions to grant)
- Rate limit selector (requests per hour/day)
- Expiration date selector (optional)
- Generate key button

**API Key Details Page** (`/settings/api-keys/:keyId`)
- API key value (shown once, then masked)
- Key name and description
- Granted permissions and scopes
- Rate limit configuration
- Usage statistics and graphs
- Revoke key button
- Rotate key button

**API Documentation Page** (`/docs/api`)
- API endpoint documentation
- Authentication instructions
- Example requests with API key
- Rate limit information
- Error codes and troubleshooting

### UI Components

**API Key Card Component**
- Displays API key name and masked value
- Shows creation date and last used timestamp
- Displays usage statistics (requests today)
- Revoke and rotate buttons
- Status indicator (active, expired, revoked)

**API Key Generator Component**
- Form for creating new API key
- Permission selector with checkboxes
- Scope dropdown for each permission
- Rate limit input fields
- Expiration date picker
- Generate button with confirmation

**API Key Value Display Component**
- Shows full API key value once after generation
- Copy to clipboard button
- Warning message about storing key securely
- Masked display after initial view
- Regenerate option

**Usage Statistics Component**
- Line graph showing API requests over time
- Current rate limit usage (e.g., "450/1000 requests today")
- Top endpoints by request count
- Error rate percentage
- Export usage data button

### User Flows

**Corporate Client Creating API Key Flow**:
1. Corporate admin navigates to API keys page
2. Admin clicks "Create New API Key"
3. System displays API key creation form
4. Admin enters key name "Travel Management System Integration"
5. Admin selects permissions: bookings:create, bookings:read, vehicles:read
6. Admin selects scope "organization" for all permissions
7. Admin sets rate limit to 1000 requests per hour
8. Admin sets expiration date to 1 year from now
9. Admin clicks "Generate API Key"
10. System generates API key and displays full value
11. Admin copies API key to secure storage
12. System masks API key value
13. Admin can now use API key for programmatic access

**Developer Using API Key Flow**:
1. Developer obtains API key from platform
2. Developer includes API key in request header: `X-API-Key: <key_value>`
3. System receives API request with API key
4. System validates API key (exists, not expired, not revoked)
5. System checks rate limit (requests within limit)
6. System checks permission (key has required permission)
7. System processes request and returns response
8. System increments rate limit counter
9. System logs API key usage

**Admin Revoking Compromised API Key Flow**:
1. Security team detects suspicious API key usage
2. Admin navigates to API key details page
3. Admin reviews usage statistics and recent requests
4. Admin clicks "Revoke API Key"
5. System displays confirmation dialog
6. Admin confirms revocation
7. System immediately revokes API key
8. System logs revocation event
9. Future requests with revoked key return 401 Unauthorized
10. Admin notifies key owner of revocation

### Data Requirements

**From Backend APIs**:
- List of user's API keys
- API key details and permissions
- Usage statistics and rate limit status
- Available permissions for API keys

**To Backend APIs**:
- API key creation requests
- API key revocation requests
- API key rotation requests
- Permission and scope selections

## Backend Specifications

### API Endpoints

**POST /api/api-keys**
- Purpose: Generate new API key
- Authentication: Required (JWT token)
- Request body: Key name, permissions, scopes, rate limit, expiration
- Response: Generated API key (full value shown once)
- Status codes: 201 (created), 401 (unauthorized), 400 (validation error)

**GET /api/api-keys**
- Purpose: List user's API keys
- Authentication: Required (JWT token)
- Response: Array of API keys (values masked)
- Status codes: 200 (success), 401 (unauthorized)

**GET /api/api-keys/:keyId**
- Purpose: Retrieve API key details
- Authentication: Required (JWT token)
- Authorization: Verify key owned by user
- Response: API key details with usage statistics
- Status codes: 200 (success), 401 (unauthorized), 404 (not found)

**DELETE /api/api-keys/:keyId**
- Purpose: Revoke API key
- Authentication: Required (JWT token)
- Authorization: Verify key owned by user
- Response: Revocation confirmation
- Status codes: 204 (no content), 401 (unauthorized), 404 (not found)

**POST /api/api-keys/:keyId/rotate**
- Purpose: Rotate API key (generate new value)
- Authentication: Required (JWT token)
- Authorization: Verify key owned by user
- Response: New API key value
- Status codes: 200 (success), 401 (unauthorized), 404 (not found)

**GET /api/api-keys/:keyId/usage**
- Purpose: Retrieve API key usage statistics
- Authentication: Required (JWT token)
- Authorization: Verify key owned by user
- Query parameters: start_date, end_date
- Response: Usage statistics and graphs
- Status codes: 200 (success), 401 (unauthorized), 404 (not found)

### Request Schemas

**Create API Key Request**:
```
{
  "name": "string (required, API key name)",
  "description": "string (optional)",
  "permissions": [
    {
      "code": "string (required, e.g., bookings:create)",
      "scope": "string (required, own|organization|all)"
    }
  ],
  "rateLimit": {
    "requestsPerHour": "number (optional, default 100)",
    "requestsPerDay": "number (optional, default 1000)"
  },
  "expiresAt": "string (optional, ISO 8601 timestamp)"
}
```

### Response Schemas

**Create API Key Response**:
```
{
  "id": "number",
  "key": "string (full API key value, shown once)",
  "name": "string",
  "description": "string",
  "permissions": [
    {
      "code": "string",
      "scope": "string"
    }
  ],
  "rateLimit": {
    "requestsPerHour": "number",
    "requestsPerDay": "number"
  },
  "createdAt": "string (ISO 8601)",
  "expiresAt": "string (ISO 8601, optional)"
}
```

**List API Keys Response**:
```
{
  "apiKeys": [
    {
      "id": "number",
      "key": "string (masked, e.g., sk_live_****1234)",
      "name": "string",
      "description": "string",
      "permissionCount": "number",
      "rateLimit": {
        "requestsPerHour": "number",
        "requestsPerDay": "number"
      },
      "lastUsedAt": "string (ISO 8601, optional)",
      "createdAt": "string (ISO 8601)",
      "expiresAt": "string (ISO 8601, optional)",
      "status": "string (active, expired, revoked)"
    }
  ]
}
```

**API Key Usage Response**:
```
{
  "keyId": "number",
  "period": {
    "startDate": "string (ISO 8601)",
    "endDate": "string (ISO 8601)"
  },
  "totalRequests": "number",
  "successfulRequests": "number",
  "failedRequests": "number",
  "errorRate": "number (percentage)",
  "requestsByDay": [
    {
      "date": "string (ISO 8601)",
      "requests": "number"
    }
  ],
  "topEndpoints": [
    {
      "endpoint": "string",
      "method": "string",
      "requests": "number"
    }
  ],
  "rateLimitStatus": {
    "requestsThisHour": "number",
    "hourlyLimit": "number",
    "requestsToday": "number",
    "dailyLimit": "number"
  }
}
```

### Business Logic

**API Key Generation**:
```
function generateAPIKey(userId, name, permissions, rateLimit, expiresAt) {
  // 1. Generate secure random key
  const keyValue = generateSecureRandomString(64); // 64 characters
  
  // 2. Hash key for storage
  const keyHash = bcrypt.hash(keyValue, 10);
  
  // 3. Create key prefix for identification
  const keyPrefix = 'sk_live_'; // or 'sk_test_' for test keys
  const fullKey = keyPrefix + keyValue;
  
  // 4. Store key in database
  const keyId = database.insert('api_keys', {
    user_id: userId,
    key_hash: keyHash,
    key_prefix: keyPrefix,
    name: name,
    rate_limit_hour: rateLimit.requestsPerHour,
    rate_limit_day: rateLimit.requestsPerDay,
    expires_at: expiresAt,
    created_at: new Date()
  });
  
  // 5. Store permissions
  for (const permission of permissions) {
    database.insert('api_key_permissions', {
      api_key_id: keyId,
      permission_code: permission.code,
      scope: permission.scope
    });
  }
  
  // 6. Return full key (only time it's shown)
  return { keyId, fullKey };
}
```

**API Key Validation**:
```
function validateAPIKey(keyValue) {
  // 1. Extract key prefix
  const prefix = keyValue.substring(0, 8); // 'sk_live_' or 'sk_test_'
  
  // 2. Query keys with matching prefix
  const keys = database.query(
    `SELECT * FROM api_keys WHERE key_prefix = ? AND revoked = FALSE`,
    [prefix]
  );
  
  // 3. Check each key hash
  for (const key of keys) {
    if (bcrypt.compare(keyValue.substring(8), key.key_hash)) {
      // 4. Check if key is expired
      if (key.expires_at && new Date(key.expires_at) < new Date()) {
        return { valid: false, reason: 'expired' };
      }
      
      // 5. Check rate limit
      if (!checkRateLimit(key.id)) {
        return { valid: false, reason: 'rate_limit_exceeded' };
      }
      
      // 6. Update last used timestamp
      database.update('api_keys', { id: key.id }, { last_used_at: new Date() });
      
      // 7. Return valid key
      return { valid: true, key: key };
    }
  }
  
  // 8. Key not found
  return { valid: false, reason: 'invalid_key' };
}
```

**Rate Limiting**:
```
function checkRateLimit(keyId) {
  // 1. Get current hour and day counts
  const hourCount = redis.get(`api_key:${keyId}:hour:${currentHour}`);
  const dayCount = redis.get(`api_key:${keyId}:day:${currentDay}`);
  
  // 2. Get key rate limits
  const key = database.query(`SELECT * FROM api_keys WHERE id = ?`, [keyId]);
  
  // 3. Check hourly limit
  if (hourCount >= key.rate_limit_hour) {
    return false;
  }
  
  // 4. Check daily limit
  if (dayCount >= key.rate_limit_day) {
    return false;
  }
  
  // 5. Increment counters
  redis.incr(`api_key:${keyId}:hour:${currentHour}`);
  redis.incr(`api_key:${keyId}:day:${currentDay}`);
  
  // 6. Set expiration on counters
  redis.expire(`api_key:${keyId}:hour:${currentHour}`, 3600); // 1 hour
  redis.expire(`api_key:${keyId}:day:${currentDay}`, 86400); // 1 day
  
  return true;
}
```

**Permission Check**:
```
function checkAPIKeyPermission(keyId, permissionCode, resourceOwnerId, resourceOrganizationId) {
  // 1. Get key permissions
  const permissions = database.query(
    `SELECT * FROM api_key_permissions WHERE api_key_id = ?`,
    [keyId]
  );
  
  // 2. Find matching permission
  const permission = permissions.find(p => p.permission_code === permissionCode);
  
  // 3. If permission not found, deny
  if (!permission) return false;
  
  // 4. Check scope
  const key = database.query(`SELECT * FROM api_keys WHERE id = ?`, [keyId]);
  
  if (permission.scope === 'all') return true;
  if (permission.scope === 'own' && key.user_id === resourceOwnerId) return true;
  if (permission.scope === 'organization' && key.organization_id === resourceOrganizationId) return true;
  
  // 5. Default deny
  return false;
}
```

### Authentication Requirements

**API Key Authentication**:
- API key provided in `X-API-Key` header or `Authorization: Bearer <key>` header
- Key must be valid (not expired, not revoked)
- Key must be within rate limits
- Key must have required permissions for endpoint

**No User Session Required**:
- API keys authenticate without user session
- API keys associated with user account
- API key permissions scoped to user's organization

## Database Specifications

### Schema Changes

**api_keys table** (new):
- `id` column: INT, primary key, auto-increment
- `user_id` column: INT, foreign key to users.id
- `organization_id` column: INT, foreign key to organizations.id (optional)
- `key_hash` column: VARCHAR(255), bcrypt hash of API key
- `key_prefix` column: VARCHAR(20), key prefix for identification
- `name` column: VARCHAR(255), user-friendly key name
- `description` column: TEXT, key description
- `rate_limit_hour` column: INT, requests per hour limit
- `rate_limit_day` column: INT, requests per day limit
- `last_used_at` column: TIMESTAMP, last time key was used
- `expires_at` column: TIMESTAMP, key expiration date (optional)
- `revoked` column: BOOLEAN, whether key is revoked
- `revoked_at` column: TIMESTAMP, when key was revoked
- `revoked_by` column: INT, foreign key to users.id (who revoked)
- `created_at` column: TIMESTAMP, key creation date

**api_key_permissions table** (new):
- `id` column: INT, primary key, auto-increment
- `api_key_id` column: INT, foreign key to api_keys.id
- `permission_code` column: VARCHAR(100), permission code
- `scope` column: VARCHAR(50), permission scope
- `created_at` column: TIMESTAMP, permission grant date

**api_key_usage_log table** (new):
- `id` column: INT, primary key, auto-increment
- `api_key_id` column: INT, foreign key to api_keys.id
- `endpoint` column: VARCHAR(255), API endpoint accessed
- `method` column: VARCHAR(10), HTTP method
- `status_code` column: INT, response status code
- `response_time_ms` column: INT, response time in milliseconds
- `ip_address` column: VARCHAR(45), request IP address
- `user_agent` column: TEXT, user agent string
- `created_at` column: TIMESTAMP, request timestamp

### Table Definitions

**api_keys table**:
```sql
CREATE TABLE api_keys (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  organization_id INT NULL,
  key_hash VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  rate_limit_hour INT NOT NULL DEFAULT 100,
  rate_limit_day INT NOT NULL DEFAULT 1000,
  last_used_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP NULL,
  revoked_by INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_key_prefix (key_prefix),
  INDEX idx_revoked (revoked),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**api_key_permissions table**:
```sql
CREATE TABLE api_key_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key_id INT NOT NULL,
  permission_code VARCHAR(100) NOT NULL,
  scope VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
  UNIQUE KEY unique_key_permission (api_key_id, permission_code),
  INDEX idx_api_key_id (api_key_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**api_key_usage_log table**:
```sql
CREATE TABLE api_key_usage_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  api_key_id INT NOT NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (api_key_id) REFERENCES api_keys(id) ON DELETE CASCADE,
  INDEX idx_api_key_id (api_key_id),
  INDEX idx_created_at (created_at),
  INDEX idx_status_code (status_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**api_keys ↔ users**: Many-to-One
- Many API keys for one user
- Foreign key: api_keys.user_id → users.id
- On Delete: CASCADE (delete keys when user deleted)

**api_keys ↔ organizations**: Many-to-One
- Many API keys for one organization
- Foreign key: api_keys.organization_id → organizations.id
- On Delete: CASCADE (delete keys when organization deleted)

**api_key_permissions ↔ api_keys**: Many-to-One
- Many permissions for one API key
- Foreign key: api_key_permissions.api_key_id → api_keys.id
- On Delete: CASCADE (delete permissions when key deleted)

**api_key_usage_log ↔ api_keys**: Many-to-One
- Many usage log entries for one API key
- Foreign key: api_key_usage_log.api_key_id → api_keys.id
- On Delete: CASCADE (delete logs when key deleted)

### Indexes

**api_keys table**:
- Primary key index on `id`
- Index on `user_id` for user-specific queries
- Index on `key_prefix` for key validation
- Index on `revoked` for filtering active keys
- Index on `expires_at` for expiration cleanup

**api_key_permissions table**:
- Primary key index on `id`
- Unique composite index on `(api_key_id, permission_code)`
- Index on `api_key_id` for key permission lookup

**api_key_usage_log table**:
- Primary key index on `id`
- Index on `api_key_id` for key usage queries
- Index on `created_at` for temporal queries
- Index on `status_code` for error rate analysis

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React 18+
- **Caching**: Redis for rate limiting
- **Authentication**: API key-based authentication

## Implementation Notes

### Security Considerations

**API Key Storage**:
- Never store API keys in plain text
- Use bcrypt to hash API keys
- Show full key value only once after generation
- Mask key values in UI and logs

**Rate Limiting**:
- Enforce rate limits to prevent abuse
- Use Redis for distributed rate limiting
- Return 429 Too Many Requests when limit exceeded
- Provide rate limit headers in responses

**Key Rotation**:
- Support key rotation without service disruption
- Allow grace period for old key after rotation
- Log all key rotations for audit

**Revocation**:
- Immediate revocation of compromised keys
- Log all revocations with reason
- Notify key owner of revocation

### Performance Optimization

**Rate Limit Caching**:
- Use Redis for fast rate limit checks
- Minimize database queries for validation
- Cache API key permissions

**Usage Logging**:
- Async logging to avoid blocking requests
- Batch insert usage logs
- Archive old logs to separate storage

### Error Handling

**API Key Errors**:
- 401 Unauthorized: Invalid or expired API key
- 403 Forbidden: API key lacks required permission
- 429 Too Many Requests: Rate limit exceeded
- Return clear error messages with error codes

### Testing Strategy

**Unit Tests**:
- Test API key generation and validation
- Test rate limiting logic
- Test permission checking
- Test key rotation and revocation

**Integration Tests**:
- Test end-to-end API key authentication
- Test rate limit enforcement
- Test usage logging
- Test key expiration

### Compliance

**Security Best Practices**:
- API keys stored securely with bcrypt
- Rate limiting prevents abuse
- Audit trail for all key operations
- Immediate revocation capability

## Related Requirements

- REQ-SEC-6: Role-Based Access Control (RBAC)
- REQ-SEC-8: Audit Logging and Monitoring

## Related Features

- F-SEC-AUTHZ-001: Role-Based Access Control (RBAC)
- F-SEC-AUTHZ-006: Fine-Grained Permissions
- F-INT-PAY-001: Payment Gateway Integration (for B2B billing)

## Success Metrics

- API key validation response time < 50ms
- Rate limit enforcement accuracy > 99.9%
- Zero API key compromises
- API key usage growth > 20% month-over-month
- Developer satisfaction with API > 4.0/5.0

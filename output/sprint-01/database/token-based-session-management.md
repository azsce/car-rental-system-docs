# Feature: Token-Based Session Management

## Overview

Token-Based Session Management database schema provides optional session tracking capabilities, enabling multi-device session management, security monitoring, and session lifecycle management. While tokens can be validated statelessly, the sessions table provides enhanced features like session listing, selective revocation, and activity tracking.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-006: Token-Based Session Management

## User Stories

### As a database administrator
- I want an efficient schema for session tracking so that queries perform well at scale
- I want proper indexes so that session lookups and cleanup operations are fast
- I want foreign key constraints so that data integrity is maintained

### As a security administrator
- I want to track all active sessions so that I can monitor user activity
- I want to identify suspicious sessions so that I can investigate security incidents
- I want to revoke specific sessions so that compromised tokens can be invalidated

### As a user
- I want to see all my active sessions so that I can manage my account security
- I want to revoke sessions from lost devices so that unauthorized access is prevented

## Database Specifications

### Schema Changes

**New Table: sessions**

```sql
CREATE TABLE sessions (
  id VARCHAR(36) PRIMARY KEY COMMENT 'Unique session identifier (UUID)',
  user_id VARCHAR(36) NOT NULL COMMENT 'Reference to users table',
  token_hash VARCHAR(64) NOT NULL COMMENT 'SHA-256 hash of token for lookup',
  device_type ENUM('web', 'ios', 'android') NOT NULL COMMENT 'Platform identifier',
  device_identifier VARCHAR(255) DEFAULT NULL COMMENT 'Device-specific identifier (browser, device model)',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP address of session creation (IPv4 or IPv6)',
  user_agent TEXT DEFAULT NULL COMMENT 'Browser/app user agent string',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Session creation timestamp',
  expires_at TIMESTAMP NOT NULL COMMENT 'Session expiration timestamp',
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last API request timestamp',
  revoked_at TIMESTAMP NULL DEFAULT NULL COMMENT 'Revocation timestamp (NULL if active)',
  
  INDEX idx_user_id (user_id) COMMENT 'Find all sessions for a user',
  INDEX idx_token_hash (token_hash) COMMENT 'Validate token quickly',
  INDEX idx_expires_at (expires_at) COMMENT 'Cleanup expired sessions efficiently',
  INDEX idx_revoked_at (revoked_at) COMMENT 'Find revoked sessions',
  INDEX idx_last_activity (last_activity_at) COMMENT 'Find inactive sessions',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks active user sessions for multi-device management and security monitoring';
```

### Table Definitions

**sessions table**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(36) | PRIMARY KEY | Unique session identifier (UUID format) |
| user_id | VARCHAR(36) | NOT NULL, FOREIGN KEY | Reference to users.id |
| token_hash | VARCHAR(64) | NOT NULL | SHA-256 hash of token (64 hex characters) |
| device_type | ENUM | NOT NULL | Platform: 'web', 'ios', or 'android' |
| device_identifier | VARCHAR(255) | NULL | Human-readable device description |
| ip_address | VARCHAR(45) | NULL | IPv4 (15 chars) or IPv6 (45 chars) |
| user_agent | TEXT | NULL | Full user agent string from request |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session creation time |
| expires_at | TIMESTAMP | NOT NULL | When session expires |
| last_activity_at | TIMESTAMP | AUTO-UPDATE | Last API request time |
| revoked_at | TIMESTAMP | NULL | When session was revoked (NULL if active) |

**Field Details**:

- **id**: Generated as UUID v4, stored as VARCHAR(36) with hyphens
- **token_hash**: SHA-256 hash of full token, used for lookup without storing sensitive token
- **device_type**: Enum restricts to known platforms, enables platform-specific queries
- **device_identifier**: Examples: "Chrome 120 on Windows 11", "iPhone 15 Pro", "Samsung Galaxy S24"
- **ip_address**: VARCHAR(45) supports both IPv4 (max 15 chars) and IPv6 (max 45 chars)
- **user_agent**: Full user agent string for detailed device identification
- **last_activity_at**: Auto-updated on row modification, tracks session activity
- **revoked_at**: NULL for active sessions, timestamp for revoked sessions

### Relationships

**users ↔ sessions**: One-to-Many Relationship

```
users (1) ----< (N) sessions
```

- One user can have multiple active sessions (multi-device support)
- Each session belongs to exactly one user
- Foreign key: sessions.user_id → users.id
- ON DELETE CASCADE: Deleting user automatically deletes all their sessions
- No ON UPDATE CASCADE needed (user IDs are immutable)

**Relationship Queries**:

```sql
-- Find all sessions for a user
SELECT * FROM sessions 
WHERE user_id = ? 
  AND revoked_at IS NULL 
  AND expires_at > NOW()
ORDER BY last_activity_at DESC;

-- Count active sessions per user
SELECT user_id, COUNT(*) as active_sessions
FROM sessions
WHERE revoked_at IS NULL 
  AND expires_at > NOW()
GROUP BY user_id;
```

### Indexes

**Index Strategy**:

1. **PRIMARY KEY (id)**
   - Clustered index for fast row lookup
   - Used when querying specific session by ID
   - Automatically created with PRIMARY KEY constraint

2. **INDEX idx_user_id (user_id)**
   - Find all sessions for a user (session listing)
   - Used in user account security page
   - Supports CASCADE DELETE efficiently
   - Query pattern: `WHERE user_id = ?`

3. **INDEX idx_token_hash (token_hash)**
   - Fast token validation lookup
   - Most frequently used index (every authenticated request)
   - Query pattern: `WHERE token_hash = ?`
   - Critical for performance

4. **INDEX idx_expires_at (expires_at)**
   - Efficient cleanup of expired sessions
   - Used by scheduled cleanup job
   - Query pattern: `WHERE expires_at < NOW()`
   - Enables fast batch deletes

5. **INDEX idx_revoked_at (revoked_at)**
   - Find revoked sessions for auditing
   - Filter active vs revoked sessions
   - Query pattern: `WHERE revoked_at IS NULL` or `WHERE revoked_at IS NOT NULL`

6. **INDEX idx_last_activity (last_activity_at)**
   - Find inactive sessions for security monitoring
   - Identify stale sessions for cleanup
   - Query pattern: `WHERE last_activity_at < DATE_SUB(NOW(), INTERVAL 30 DAY)`

**Index Maintenance**:

```sql
-- Analyze index usage
SHOW INDEX FROM sessions;

-- Check index cardinality
SELECT 
  INDEX_NAME,
  CARDINALITY,
  SEQ_IN_INDEX
FROM information_schema.STATISTICS
WHERE TABLE_NAME = 'sessions';

-- Rebuild indexes if needed
OPTIMIZE TABLE sessions;
```

### Data Integrity Constraints

**Foreign Key Constraint**:
```sql
CONSTRAINT fk_sessions_user_id 
  FOREIGN KEY (user_id) 
  REFERENCES users(id) 
  ON DELETE CASCADE
```

- Ensures every session belongs to a valid user
- Automatically deletes sessions when user is deleted
- Prevents orphaned session records

**Check Constraints** (MySQL 8.0.16+):
```sql
ALTER TABLE sessions
ADD CONSTRAINT chk_expires_after_created
CHECK (expires_at > created_at);

ALTER TABLE sessions
ADD CONSTRAINT chk_revoked_after_created
CHECK (revoked_at IS NULL OR revoked_at >= created_at);
```

### Common Queries

**Create Session**:
```sql
INSERT INTO sessions (
  id, user_id, token_hash, device_type, 
  device_identifier, ip_address, user_agent, expires_at
) VALUES (
  UUID(), ?, SHA2(?, 256), ?, ?, ?, ?, ?
);
```

**Validate Token**:
```sql
SELECT s.*, u.email, u.name, u.account_status
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.token_hash = SHA2(?, 256)
  AND s.expires_at > NOW()
  AND s.revoked_at IS NULL
  AND u.account_status IN ('active', 'verified');
```

**List User Sessions**:
```sql
SELECT 
  id, device_type, device_identifier, ip_address,
  created_at, last_activity_at, expires_at,
  (token_hash = SHA2(?, 256)) as is_current
FROM sessions
WHERE user_id = ?
  AND revoked_at IS NULL
  AND expires_at > NOW()
ORDER BY last_activity_at DESC;
```

**Revoke Session**:
```sql
UPDATE sessions
SET revoked_at = NOW()
WHERE id = ? AND user_id = ?;
```

**Cleanup Expired Sessions** (Scheduled Job):
```sql
DELETE FROM sessions
WHERE expires_at < NOW()
   OR (revoked_at IS NOT NULL AND revoked_at < DATE_SUB(NOW(), INTERVAL 30 DAY));
```

**Update Last Activity**:
```sql
UPDATE sessions
SET last_activity_at = NOW()
WHERE token_hash = SHA2(?, 256);
```

**Find Suspicious Sessions**:
```sql
-- Multiple sessions from different countries
SELECT user_id, COUNT(DISTINCT ip_address) as ip_count
FROM sessions
WHERE revoked_at IS NULL
  AND expires_at > NOW()
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
GROUP BY user_id
HAVING ip_count > 3;

-- Sessions with no recent activity
SELECT *
FROM sessions
WHERE revoked_at IS NULL
  AND expires_at > NOW()
  AND last_activity_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

## Technology Stack

- Database: MySQL 8.0+ (InnoDB storage engine)
- Character Set: utf8mb4 (full Unicode support including emojis)
- Collation: utf8mb4_unicode_ci (case-insensitive Unicode collation)
- Storage Engine: InnoDB (supports foreign keys, transactions, row-level locking)

## Implementation Notes

### Storage Considerations

**Table Size Estimation**:
- Average row size: ~500 bytes (with TEXT fields)
- 1 million sessions: ~500 MB
- 10 million sessions: ~5 GB
- Index overhead: ~30% of data size

**Growth Projections**:
- 100,000 users with 2 devices each: 200,000 sessions
- 1 million users with 2 devices each: 2 million sessions
- Cleanup job keeps table size manageable

### Performance Optimization

**Partitioning Strategy** (for large deployments):
```sql
ALTER TABLE sessions
PARTITION BY RANGE (UNIX_TIMESTAMP(expires_at)) (
  PARTITION p_current VALUES LESS THAN (UNIX_TIMESTAMP('2026-03-01')),
  PARTITION p_next VALUES LESS THAN (UNIX_TIMESTAMP('2026-04-01')),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

**Benefits**:
- Faster cleanup (drop old partitions)
- Improved query performance (partition pruning)
- Easier maintenance (optimize specific partitions)

**Query Optimization Tips**:
1. Always include `revoked_at IS NULL` and `expires_at > NOW()` in WHERE clauses
2. Use `token_hash` index for validation queries (most frequent)
3. Batch update `last_activity_at` (every 5 minutes, not every request)
4. Run cleanup job during low-traffic hours
5. Monitor index usage and adjust as needed

### Backup and Recovery

**Backup Strategy**:
- Sessions table is transient data (can be regenerated)
- Include in regular backups but lower priority than users table
- Consider excluding from point-in-time recovery
- Acceptable to lose recent sessions in disaster recovery

**Recovery Considerations**:
- Users will need to re-authenticate after recovery
- Revoked sessions list should be rebuilt from audit logs
- Session cleanup job will handle any inconsistencies

### Security Considerations

**Data Protection**:
- Never store full tokens (only SHA-256 hash)
- IP addresses are personal data (GDPR consideration)
- User agent strings may contain sensitive info
- Implement data retention policy (delete old revoked sessions)

**Audit Trail**:
- Track session creation, revocation, and expiration
- Log suspicious activity (multiple IPs, unusual devices)
- Retain revoked sessions for 30 days for investigation
- Comply with data protection regulations

### Migration Script

```sql
-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(64) NOT NULL,
  device_type ENUM('web', 'ios', 'android') NOT NULL,
  device_identifier VARCHAR(255) DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_activity_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_token_hash (token_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_revoked_at (revoked_at),
  INDEX idx_last_activity (last_activity_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add check constraints (MySQL 8.0.16+)
ALTER TABLE sessions
ADD CONSTRAINT chk_expires_after_created
CHECK (expires_at > created_at);

ALTER TABLE sessions
ADD CONSTRAINT chk_revoked_after_created
CHECK (revoked_at IS NULL OR revoked_at >= created_at);
```

### Rollback Script

```sql
-- Drop sessions table
DROP TABLE IF EXISTS sessions;
```

## Dependencies

- users table must exist with id column (VARCHAR(36))
- MySQL 8.0+ for check constraints and improved performance
- InnoDB storage engine for foreign key support

## Related Features

- F-SEC-AUTH-001: Email/Password Authentication (creates user accounts)
- F-SEC-AUTH-007: Multi-Factor Authentication (enhanced security)
- F-AM-012: Account Security Settings (session management UI)

## Acceptance Criteria

1. Sessions table is created with correct schema and indexes
2. Foreign key constraint ensures referential integrity with users table
3. CASCADE DELETE removes sessions when user is deleted
4. Indexes support efficient queries for validation, listing, and cleanup
5. Token hash is stored (not full token) for security
6. Session expiration and revocation are tracked correctly
7. Last activity timestamp is auto-updated on modifications
8. Cleanup queries efficiently remove expired and old revoked sessions
9. Multi-device support allows multiple sessions per user
10. Query performance meets requirements (< 10ms for token validation)


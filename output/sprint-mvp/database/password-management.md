# Feature: Password Management (Database)

## Overview

The Password Management database schema provides the data structures necessary to securely store password hashes, track password history, manage user sessions, and audit password-related activities. This schema ensures data integrity, supports security requirements, and enables efficient querying for password management operations.

## Sprint Category

sprint-mvp

## Feature ID

F-FUNC-UM-004

## Database Schema

### Table: users (modifications)

**Purpose**: Store user account information including password hash and password-related metadata.

**Modifications to Existing Table**:

```sql
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NOT NULL COMMENT 'Bcrypt hash of user password',
ADD COLUMN password_changed_at TIMESTAMP NULL COMMENT 'Timestamp of last password change',
ADD COLUMN password_change_required BOOLEAN DEFAULT FALSE COMMENT 'Flag to force password change on next login',
ADD COLUMN failed_login_attempts INT DEFAULT 0 COMMENT 'Count of consecutive failed login attempts',
ADD COLUMN account_locked_until TIMESTAMP NULL COMMENT 'Timestamp until which account is locked',
ADD INDEX idx_password_changed_at (password_changed_at),
ADD INDEX idx_account_locked_until (account_locked_until);
```

**Column Definitions**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash of user password (60 chars for bcrypt, 255 for future algorithms) |
| password_changed_at | TIMESTAMP | NULL | UTC timestamp of last password change |
| password_change_required | BOOLEAN | DEFAULT FALSE | Forces password change on next login (admin reset, security policy) |
| failed_login_attempts | INT | DEFAULT 0 | Counter for consecutive failed login attempts |
| account_locked_until | TIMESTAMP | NULL | UTC timestamp until which account is temporarily locked |

### Table: password_history

**Purpose**: Track historical passwords to prevent password reuse and maintain audit trail.

**Table Definition**:

```sql
CREATE TABLE password_history (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for password history record',
  user_id INT NOT NULL COMMENT 'Foreign key to users table',
  password_hash VARCHAR(255) NOT NULL COMMENT 'Historical bcrypt password hash',
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'UTC timestamp when password was changed',
  changed_from_ip VARCHAR(45) NULL COMMENT 'IP address from which password was changed (IPv4 or IPv6)',
  changed_from_location VARCHAR(255) NULL COMMENT 'Geographic location of password change',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Record creation timestamp',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_changed_at (changed_at),
  INDEX idx_user_changed (user_id, changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historical record of user password changes for security and audit purposes';
```

**Column Definitions**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users.id |
| password_hash | VARCHAR(255) | NOT NULL | Historical password hash |
| changed_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | When password was changed |
| changed_from_ip | VARCHAR(45) | NULL | IP address of change request |
| changed_from_location | VARCHAR(255) | NULL | Geographic location |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |

### Table: sessions

**Purpose**: Manage active user sessions for authentication and session invalidation.

**Table Definition**:

```sql
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY COMMENT 'Session token (JWT or UUID)',
  user_id INT NOT NULL COMMENT 'Foreign key to users table',
  device_type VARCHAR(50) NULL COMMENT 'Device type: desktop, mobile, tablet',
  browser VARCHAR(100) NULL COMMENT 'Browser name and version',
  operating_system VARCHAR(100) NULL COMMENT 'Operating system name and version',
  ip_address VARCHAR(45) NOT NULL COMMENT 'IP address of session (IPv4 or IPv6)',
  location VARCHAR(255) NULL COMMENT 'Geographic location (city, country)',
  user_agent TEXT NULL COMMENT 'Full user agent string',
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last activity timestamp',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Session creation timestamp',
  expires_at TIMESTAMP NOT NULL COMMENT 'Session expiration timestamp',
  invalidated_at TIMESTAMP NULL COMMENT 'Timestamp when session was manually invalidated',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_active (user_id, expires_at, invalidated_at),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Active user sessions for authentication and session management';
```

**Column Definitions**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | VARCHAR(255) | PRIMARY KEY | Session token (JWT or UUID) |
| user_id | INT | NOT NULL, FOREIGN KEY | Reference to users.id |
| device_type | VARCHAR(50) | NULL | Device type classification |
| browser | VARCHAR(100) | NULL | Browser identification |
| operating_system | VARCHAR(100) | NULL | OS identification |
| ip_address | VARCHAR(45) | NOT NULL | Client IP address |
| location | VARCHAR(255) | NULL | Geographic location |
| user_agent | TEXT | NULL | Full user agent string |
| last_activity | TIMESTAMP | NOT NULL, AUTO-UPDATE | Last activity time |
| created_at | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Session start time |
| expires_at | TIMESTAMP | NOT NULL | Session expiration time |
| invalidated_at | TIMESTAMP | NULL | Manual invalidation time |

### Table: audit_logs

**Purpose**: Comprehensive audit trail for password changes and security events.

**Table Definition**:

```sql
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for audit log entry',
  user_id INT NULL COMMENT 'Foreign key to users table (NULL for system events)',
  event_type VARCHAR(100) NOT NULL COMMENT 'Type of event (PASSWORD_CHANGE_SUCCESS, PASSWORD_CHANGE_FAILURE, etc.)',
  event_category VARCHAR(50) NOT NULL DEFAULT 'SECURITY' COMMENT 'Event category: SECURITY, AUTHENTICATION, AUTHORIZATION',
  ip_address VARCHAR(45) NULL COMMENT 'IP address associated with event',
  location VARCHAR(255) NULL COMMENT 'Geographic location of event',
  user_agent TEXT NULL COMMENT 'User agent string',
  details JSON NULL COMMENT 'Additional event details in JSON format',
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO' COMMENT 'Event severity: INFO, WARNING, ERROR, CRITICAL',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Event timestamp',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_event (user_id, event_type, timestamp DESC),
  INDEX idx_severity (severity, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Comprehensive audit trail for security and compliance';
```

**Column Definitions**:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| user_id | INT | NULL, FOREIGN KEY | Reference to users.id |
| event_type | VARCHAR(100) | NOT NULL | Event type identifier |
| event_category | VARCHAR(50) | NOT NULL, DEFAULT 'SECURITY' | Event category |
| ip_address | VARCHAR(45) | NULL | IP address |
| location | VARCHAR(255) | NULL | Geographic location |
| user_agent | TEXT | NULL | User agent string |
| details | JSON | NULL | Additional event data |
| severity | VARCHAR(20) | NOT NULL, DEFAULT 'INFO' | Event severity level |
| timestamp | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Event time |

## Relationships

### users ↔ password_history
- **Type**: One-to-Many
- **Description**: One user can have multiple password history records
- **Foreign Key**: password_history.user_id → users.id
- **On Delete**: CASCADE (delete all password history when user is deleted)
- **On Update**: CASCADE

### users ↔ sessions
- **Type**: One-to-Many
- **Description**: One user can have multiple active sessions
- **Foreign Key**: sessions.user_id → users.id
- **On Delete**: CASCADE (delete all sessions when user is deleted)
- **On Update**: CASCADE

### users ↔ audit_logs
- **Type**: One-to-Many
- **Description**: One user can have multiple audit log entries
- **Foreign Key**: audit_logs.user_id → users.id
- **On Delete**: SET NULL (preserve audit logs even if user is deleted)
- **On Update**: CASCADE

## Indexes

### password_history Indexes

**Primary Key Index**:
- Column: `id`
- Purpose: Unique identification and fast lookups

**User Lookup Index**:
- Column: `user_id`
- Purpose: Efficiently retrieve all password history for a user
- Query: `SELECT * FROM password_history WHERE user_id = ?`

**Temporal Index**:
- Column: `changed_at`
- Purpose: Time-based queries and cleanup operations
- Query: `SELECT * FROM password_history WHERE changed_at > ?`

**Composite User-Time Index**:
- Columns: `(user_id, changed_at DESC)`
- Purpose: Retrieve recent password history for a user
- Query: `SELECT * FROM password_history WHERE user_id = ? ORDER BY changed_at DESC LIMIT 5`

### sessions Indexes

**Primary Key Index**:
- Column: `id` (session token)
- Purpose: Fast session lookup by token

**User Sessions Index**:
- Column: `user_id`
- Purpose: Retrieve all sessions for a user
- Query: `SELECT * FROM sessions WHERE user_id = ?`

**Expiration Index**:
- Column: `expires_at`
- Purpose: Cleanup expired sessions
- Query: `DELETE FROM sessions WHERE expires_at < NOW()`

**Active Sessions Composite Index**:
- Columns: `(user_id, expires_at, invalidated_at)`
- Purpose: Efficiently find active sessions for a user
- Query: `SELECT * FROM sessions WHERE user_id = ? AND expires_at > NOW() AND invalidated_at IS NULL`

**Activity Index**:
- Column: `last_activity`
- Purpose: Find inactive sessions for timeout
- Query: `SELECT * FROM sessions WHERE last_activity < ?`

### audit_logs Indexes

**Primary Key Index**:
- Column: `id`
- Purpose: Unique identification

**User Audit Index**:
- Column: `user_id`
- Purpose: Retrieve all audit logs for a user
- Query: `SELECT * FROM audit_logs WHERE user_id = ?`

**Event Type Index**:
- Column: `event_type`
- Purpose: Filter logs by event type
- Query: `SELECT * FROM audit_logs WHERE event_type = 'PASSWORD_CHANGE_SUCCESS'`

**Timestamp Index**:
- Column: `timestamp`
- Purpose: Time-based queries and log retention
- Query: `SELECT * FROM audit_logs WHERE timestamp > ?`

**Composite User-Event-Time Index**:
- Columns: `(user_id, event_type, timestamp DESC)`
- Purpose: Retrieve specific event types for a user
- Query: `SELECT * FROM audit_logs WHERE user_id = ? AND event_type = ? ORDER BY timestamp DESC`

**Severity Index**:
- Columns: `(severity, timestamp DESC)`
- Purpose: Monitor critical security events
- Query: `SELECT * FROM audit_logs WHERE severity = 'CRITICAL' ORDER BY timestamp DESC`

## Data Integrity Constraints

### Password History Constraints

**Prevent Duplicate Entries**:
- Unique constraint on `(user_id, password_hash)` to prevent duplicate password history entries
- Note: This is optional as users may legitimately cycle through passwords

**Retention Policy**:
- Keep last 5 password hashes per user for reuse prevention
- Archive older entries to separate table after 1 year
- Implement cleanup job to remove archived entries after 7 years (compliance)

### Session Constraints

**Session Expiration**:
- `expires_at` must be greater than `created_at`
- Default expiration: 24 hours for standard sessions, 30 days for "remember me"
- Maximum expiration: 400 days for corporate users

**Session Invalidation**:
- `invalidated_at` must be NULL or greater than `created_at`
- Invalidated sessions should not be used for authentication

### Audit Log Constraints

**Immutability**:
- Audit logs should never be updated or deleted (except for retention policy)
- Use append-only pattern for audit logs
- Implement database triggers to prevent updates

**Timestamp Integrity**:
- `timestamp` must be in UTC
- `timestamp` should be close to current time (within 5 minutes)

## Query Patterns

### Password Change Queries

**Verify Current Password**:
```sql
SELECT password_hash 
FROM users 
WHERE id = ? AND deleted_at IS NULL;
```

**Update Password**:
```sql
UPDATE users 
SET password_hash = ?, 
    password_changed_at = NOW(),
    failed_login_attempts = 0,
    account_locked_until = NULL
WHERE id = ?;
```

**Check Password History**:
```sql
SELECT password_hash 
FROM password_history 
WHERE user_id = ? 
ORDER BY changed_at DESC 
LIMIT 5;
```

**Add to Password History**:
```sql
INSERT INTO password_history 
  (user_id, password_hash, changed_at, changed_from_ip, changed_from_location)
VALUES (?, ?, NOW(), ?, ?);
```

### Session Management Queries

**Get Active Sessions**:
```sql
SELECT id, device_type, browser, operating_system, ip_address, location, last_activity
FROM sessions
WHERE user_id = ? 
  AND expires_at > NOW() 
  AND invalidated_at IS NULL
ORDER BY last_activity DESC;
```

**Invalidate All Sessions Except Current**:
```sql
UPDATE sessions
SET invalidated_at = NOW()
WHERE user_id = ? 
  AND id != ?
  AND invalidated_at IS NULL;
```

**Delete Expired Sessions** (Cleanup Job):
```sql
DELETE FROM sessions
WHERE expires_at < NOW() 
  OR invalidated_at < DATE_SUB(NOW(), INTERVAL 30 DAY);
```

### Audit Log Queries

**Log Password Change Success**:
```sql
INSERT INTO audit_logs 
  (user_id, event_type, event_category, ip_address, location, details, severity, timestamp)
VALUES 
  (?, 'PASSWORD_CHANGE_SUCCESS', 'SECURITY', ?, ?, ?, 'INFO', NOW());
```

**Log Password Change Failure**:
```sql
INSERT INTO audit_logs 
  (user_id, event_type, event_category, ip_address, location, details, severity, timestamp)
VALUES 
  (?, 'PASSWORD_CHANGE_FAILURE', 'SECURITY', ?, ?, ?, 'WARNING', NOW());
```

**Get Recent Security Events**:
```sql
SELECT event_type, ip_address, location, details, timestamp
FROM audit_logs
WHERE user_id = ? 
  AND event_category = 'SECURITY'
  AND timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY timestamp DESC
LIMIT 50;
```

## Data Migration

### Initial Schema Creation

```sql
-- Run these migrations in order

-- Migration 1: Add password columns to users table
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN password_changed_at TIMESTAMP NULL,
ADD COLUMN password_change_required BOOLEAN DEFAULT FALSE,
ADD COLUMN failed_login_attempts INT DEFAULT 0,
ADD COLUMN account_locked_until TIMESTAMP NULL;

-- Migration 2: Add indexes to users table
ALTER TABLE users
ADD INDEX idx_password_changed_at (password_changed_at),
ADD INDEX idx_account_locked_until (account_locked_until);

-- Migration 3: Create password_history table
CREATE TABLE password_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_from_ip VARCHAR(45) NULL,
  changed_from_location VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_changed_at (changed_at),
  INDEX idx_user_changed (user_id, changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration 4: Create sessions table
CREATE TABLE sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INT NOT NULL,
  device_type VARCHAR(50) NULL,
  browser VARCHAR(100) NULL,
  operating_system VARCHAR(100) NULL,
  ip_address VARCHAR(45) NOT NULL,
  location VARCHAR(255) NULL,
  user_agent TEXT NULL,
  last_activity TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  invalidated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_active (user_id, expires_at, invalidated_at),
  INDEX idx_last_activity (last_activity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration 5: Create audit_logs table
CREATE TABLE audit_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_category VARCHAR(50) NOT NULL DEFAULT 'SECURITY',
  ip_address VARCHAR(45) NULL,
  location VARCHAR(255) NULL,
  user_agent TEXT NULL,
  details JSON NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_timestamp (timestamp),
  INDEX idx_user_event (user_id, event_type, timestamp DESC),
  INDEX idx_severity (severity, timestamp DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Rollback Scripts

```sql
-- Rollback in reverse order

-- Rollback 5: Drop audit_logs table
DROP TABLE IF EXISTS audit_logs;

-- Rollback 4: Drop sessions table
DROP TABLE IF EXISTS sessions;

-- Rollback 3: Drop password_history table
DROP TABLE IF EXISTS password_history;

-- Rollback 2: Remove indexes from users table
ALTER TABLE users
DROP INDEX idx_password_changed_at,
DROP INDEX idx_account_locked_until;

-- Rollback 1: Remove password columns from users table
ALTER TABLE users
DROP COLUMN password_hash,
DROP COLUMN password_changed_at,
DROP COLUMN password_change_required,
DROP COLUMN failed_login_attempts,
DROP COLUMN account_locked_until;
```

## Performance Optimization

### Query Optimization

**Use Prepared Statements**:
- All queries should use prepared statements to prevent SQL injection
- Prepared statements are cached and reused for better performance

**Limit Result Sets**:
- Always use LIMIT clause for password history queries
- Paginate audit log queries for large result sets

**Avoid SELECT ***:
- Select only required columns to reduce data transfer
- Use covering indexes where possible

### Index Maintenance

**Regular Index Analysis**:
- Run `ANALYZE TABLE` monthly to update index statistics
- Monitor index usage with `SHOW INDEX FROM table_name`
- Remove unused indexes to improve write performance

**Index Fragmentation**:
- Run `OPTIMIZE TABLE` quarterly to defragment indexes
- Schedule during low-traffic periods

### Data Archival

**Password History Archival**:
- Archive password history older than 1 year to separate table
- Keep only last 5 entries per user in active table
- Implement automated archival job (monthly)

**Audit Log Archival**:
- Archive audit logs older than 90 days to separate table
- Implement automated archival job (weekly)
- Retain archived logs for 7 years for compliance

**Session Cleanup**:
- Delete expired sessions daily
- Delete invalidated sessions older than 30 days

## Security Considerations

### Data Encryption

**At Rest**:
- Enable MySQL encryption at rest for sensitive tables
- Use encrypted file system for database files
- Encrypt database backups

**In Transit**:
- Enforce SSL/TLS for all database connections
- Use certificate-based authentication for database access

### Access Control

**Database User Permissions**:
- Application user: SELECT, INSERT, UPDATE on all tables
- Application user: DELETE only on sessions table
- Admin user: Full access for migrations and maintenance
- Read-only user: SELECT only for reporting

**Row-Level Security**:
- Implement application-level row filtering
- Users can only access their own data
- Admins can access all data with audit logging

### Backup and Recovery

**Backup Strategy**:
- Full backup daily at 2 AM UTC
- Incremental backup every 6 hours
- Transaction log backup every hour
- Retain backups for 30 days

**Recovery Testing**:
- Test backup restoration monthly
- Document recovery procedures
- Maintain recovery time objective (RTO) < 4 hours
- Maintain recovery point objective (RPO) < 1 hour

## Monitoring and Maintenance

### Database Monitoring

**Key Metrics**:
- Query response times (p50, p95, p99)
- Connection pool utilization
- Table sizes and growth rates
- Index usage statistics
- Slow query log analysis

**Alerts**:
- Query response time > 1 second
- Connection pool > 80% utilized
- Table size growth > 20% per week
- Failed queries > 1% of total

### Maintenance Tasks

**Daily**:
- Delete expired sessions
- Monitor slow query log
- Check replication lag (if applicable)

**Weekly**:
- Archive old audit logs
- Review database performance metrics
- Check for missing indexes

**Monthly**:
- Archive old password history
- Run ANALYZE TABLE on all tables
- Review and optimize slow queries

**Quarterly**:
- Run OPTIMIZE TABLE on all tables
- Review and update index strategy
- Test backup restoration

## Related Requirements

- REQ-UM-010: Account Security Management
- REQ-UM-002: User Authentication
- REQ-UM-009: Two-Factor Authentication

## Success Metrics

- Query response time < 100ms (p95)
- Database uptime > 99.9%
- Backup success rate > 99.9%
- Zero data loss incidents
- Audit log completeness > 99.99%

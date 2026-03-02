# Feature: Identity Verification - Database

## Overview

The database schema for identity verification stores user verification records, document images, OCR results, liveness check data, facial matching results, and verification history. The schema is designed for MySQL 8.0+ with InnoDB storage engine, emphasizing data security, audit trails, and efficient querying for verification status lookups.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-008: Driver License Verification
- F-AM-009: Digital KYC (Know Your Customer)

## Database Schema

### Table: user_verifications

**Purpose**: Store overall verification status for each user

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique verification record ID
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY → users.id): Reference to user
- `email_verified` (BOOLEAN, DEFAULT FALSE): Email verification status
- `email_verified_at` (DATETIME, NULL): Email verification timestamp
- `phone_verified` (BOOLEAN, DEFAULT FALSE): Phone verification status
- `phone_verified_at` (DATETIME, NULL): Phone verification timestamp
- `license_verified` (BOOLEAN, DEFAULT FALSE): License verification status
- `license_verified_at` (DATETIME, NULL): License verification timestamp
- `license_expires_at` (DATETIME, NULL): License expiration date
- `kyc_verified` (BOOLEAN, DEFAULT FALSE): KYC verification status
- `kyc_verified_at` (DATETIME, NULL): KYC verification timestamp
- `kyc_level` (ENUM('basic', 'standard', 'enhanced', 'premium'), NULL): KYC verification level
- `kyc_expires_at` (DATETIME, NULL): KYC expiration date
- `trust_score` (INT, DEFAULT 0): User trust score (0-100)
- `verification_completeness` (INT, DEFAULT 0): Percentage of completed verifications
- `created_at` (DATETIME, NOT NULL): Record creation timestamp
- `updated_at` (DATETIME, NOT NULL): Last update timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `idx_user_id` (`user_id`)
- INDEX `idx_license_expires` (`license_expires_at`)
- INDEX `idx_kyc_expires` (`kyc_expires_at`)
- INDEX `idx_trust_score` (`trust_score`)

**Constraints**:
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE



### Table: license_verifications

**Purpose**: Store driver license verification attempts and results

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique verification attempt ID
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY → users.id): Reference to user
- `verification_id` (VARCHAR(100), UNIQUE, NOT NULL): Public verification identifier
- `status` (ENUM('pending', 'processing', 'approved', 'rejected', 'expired'), NOT NULL): Verification status
- `front_image_url` (VARCHAR(500), NOT NULL): URL to front image in cloud storage
- `back_image_url` (VARCHAR(500), NULL): URL to back image in cloud storage
- `license_number` (VARCHAR(50), NULL): Extracted license number
- `full_name` (VARCHAR(200), NULL): Extracted full name
- `date_of_birth` (DATE, NULL): Extracted date of birth
- `expiration_date` (DATE, NULL): License expiration date
- `issuing_state` (VARCHAR(50), NULL): State/province that issued license
- `license_class` (VARCHAR(20), NULL): License class (e.g., Class C, CDL)
- `ocr_confidence_score` (INT, NULL): OCR confidence (0-100)
- `data_match_score` (INT, NULL): Profile data match score (0-100)
- `requires_manual_review` (BOOLEAN, DEFAULT FALSE): Flag for admin review
- `reviewed_by_admin_id` (BIGINT, NULL, FOREIGN KEY → users.id): Admin who reviewed
- `reviewed_at` (DATETIME, NULL): Manual review timestamp
- `rejection_reason` (TEXT, NULL): Reason for rejection
- `resubmission_of` (BIGINT, NULL, FOREIGN KEY → license_verifications.id): Previous attempt ID
- `created_at` (DATETIME, NOT NULL): Verification attempt timestamp
- `updated_at` (DATETIME, NOT NULL): Last update timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `idx_verification_id` (`verification_id`)
- INDEX `idx_user_status` (`user_id`, `status`)
- INDEX `idx_status_created` (`status`, `created_at`)
- INDEX `idx_manual_review` (`requires_manual_review`, `status`)
- INDEX `idx_expiration` (`expiration_date`)

**Constraints**:
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`reviewed_by_admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL
- FOREIGN KEY (`resubmission_of`) REFERENCES `license_verifications`(`id`) ON DELETE SET NULL

### Table: kyc_sessions

**Purpose**: Store KYC verification sessions and progress

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique session ID
- `session_id` (VARCHAR(100), UNIQUE, NOT NULL): Public session identifier
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY → users.id): Reference to user
- `verification_level` (ENUM('standard', 'enhanced', 'premium'), NOT NULL): Requested level
- `status` (ENUM('initiated', 'in_progress', 'completed', 'expired', 'failed'), NOT NULL): Session status
- `document_type` (ENUM('license', 'passport', 'national_id'), NULL): Selected document type
- `document_scan_completed` (BOOLEAN, DEFAULT FALSE): Document scan step completed
- `liveness_check_completed` (BOOLEAN, DEFAULT FALSE): Liveness check step completed
- `facial_match_completed` (BOOLEAN, DEFAULT FALSE): Facial match step completed
- `database_verification_completed` (BOOLEAN, DEFAULT FALSE): Database check completed
- `expires_at` (DATETIME, NOT NULL): Session expiration time
- `completed_at` (DATETIME, NULL): Session completion timestamp
- `created_at` (DATETIME, NOT NULL): Session creation timestamp
- `updated_at` (DATETIME, NOT NULL): Last update timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `idx_session_id` (`session_id`)
- INDEX `idx_user_status` (`user_id`, `status`)
- INDEX `idx_expires` (`expires_at`, `status`)

**Constraints**:
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE



### Table: kyc_verifications

**Purpose**: Store completed KYC verification results

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique verification ID
- `verification_id` (VARCHAR(100), UNIQUE, NOT NULL): Public verification identifier
- `session_id` (BIGINT, NOT NULL, FOREIGN KEY → kyc_sessions.id): Reference to session
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY → users.id): Reference to user
- `status` (ENUM('approved', 'review_needed', 'rejected'), NOT NULL): Final status
- `verification_level` (ENUM('basic', 'standard', 'enhanced', 'premium'), NOT NULL): Assigned level
- `document_image_url` (VARCHAR(500), NULL): URL to document image
- `selfie_image_url` (VARCHAR(500), NULL): URL to selfie image
- `ocr_data` (JSON, NULL): Extracted document data
- `liveness_score` (INT, NULL): Liveness confidence (0-100)
- `facial_match_score` (INT, NULL): Facial match confidence (0-100)
- `database_verification_result` (JSON, NULL): Database check results
- `trust_score` (INT, NOT NULL): Calculated trust score (0-100)
- `expires_at` (DATETIME, NOT NULL): Verification expiration date
- `reviewed_by_admin_id` (BIGINT, NULL, FOREIGN KEY → users.id): Admin reviewer
- `reviewed_at` (DATETIME, NULL): Manual review timestamp
- `rejection_reason` (TEXT, NULL): Reason for rejection
- `created_at` (DATETIME, NOT NULL): Verification timestamp
- `updated_at` (DATETIME, NOT NULL): Last update timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- UNIQUE KEY `idx_verification_id` (`verification_id`)
- INDEX `idx_user_status` (`user_id`, `status`)
- INDEX `idx_expires` (`expires_at`)
- INDEX `idx_level` (`verification_level`)
- INDEX `idx_trust_score` (`trust_score`)

**Constraints**:
- FOREIGN KEY (`session_id`) REFERENCES `kyc_sessions`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`reviewed_by_admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL

### Table: liveness_checks

**Purpose**: Store liveness detection attempt results

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique check ID
- `session_id` (BIGINT, NOT NULL, FOREIGN KEY → kyc_sessions.id): Reference to KYC session
- `check_type` (ENUM('blink', 'turn_head', 'smile'), NOT NULL): Type of liveness check
- `passed` (BOOLEAN, NOT NULL): Check passed or failed
- `confidence_score` (INT, NOT NULL): Confidence level (0-100)
- `liveness_score` (INT, NOT NULL): Liveness score (0-100)
- `spoofing_detected` (BOOLEAN, DEFAULT FALSE): Spoofing attempt detected
- `feedback` (TEXT, NULL): Feedback for failed attempts
- `attempt_number` (INT, NOT NULL): Attempt number in session
- `created_at` (DATETIME, NOT NULL): Check timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX `idx_session` (`session_id`)
- INDEX `idx_session_passed` (`session_id`, `passed`)

**Constraints**:
- FOREIGN KEY (`session_id`) REFERENCES `kyc_sessions`(`id`) ON DELETE CASCADE



### Table: facial_matches

**Purpose**: Store facial recognition matching results

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique match ID
- `session_id` (BIGINT, NOT NULL, FOREIGN KEY → kyc_sessions.id): Reference to KYC session
- `selfie_image_url` (VARCHAR(500), NOT NULL): URL to selfie image
- `document_photo_url` (VARCHAR(500), NOT NULL): URL to document photo
- `match_score` (INT, NOT NULL): Similarity score (0-100)
- `matched` (BOOLEAN, NOT NULL): Match successful
- `requires_review` (BOOLEAN, DEFAULT FALSE): Needs manual review
- `face_detected` (BOOLEAN, NOT NULL): Face detected in images
- `face_quality_score` (INT, NULL): Face quality (0-100)
- `eyes_open` (BOOLEAN, NULL): Eyes open in selfie
- `frontal_face` (BOOLEAN, NULL): Face is frontal
- `attempt_number` (INT, NOT NULL): Attempt number in session
- `created_at` (DATETIME, NOT NULL): Match timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX `idx_session` (`session_id`)
- INDEX `idx_session_matched` (`session_id`, `matched`)
- INDEX `idx_requires_review` (`requires_review`)

**Constraints**:
- FOREIGN KEY (`session_id`) REFERENCES `kyc_sessions`(`id`) ON DELETE CASCADE

### Table: verification_audit_log

**Purpose**: Audit trail for all verification activities

**Columns**:
- `id` (BIGINT, PRIMARY KEY, AUTO_INCREMENT): Unique log entry ID
- `user_id` (BIGINT, NOT NULL, FOREIGN KEY → users.id): User being verified
- `admin_id` (BIGINT, NULL, FOREIGN KEY → users.id): Admin performing action
- `verification_type` (ENUM('license', 'kyc'), NOT NULL): Type of verification
- `verification_id` (VARCHAR(100), NOT NULL): Reference to verification record
- `action` (VARCHAR(100), NOT NULL): Action performed (e.g., "approved", "rejected", "reviewed")
- `previous_status` (VARCHAR(50), NULL): Status before action
- `new_status` (VARCHAR(50), NOT NULL): Status after action
- `reason` (TEXT, NULL): Reason for action
- `ip_address` (VARCHAR(45), NULL): IP address of action
- `user_agent` (VARCHAR(500), NULL): User agent string
- `created_at` (DATETIME, NOT NULL): Action timestamp

**Indexes**:
- PRIMARY KEY (`id`)
- INDEX `idx_user_created` (`user_id`, `created_at`)
- INDEX `idx_admin_created` (`admin_id`, `created_at`)
- INDEX `idx_verification` (`verification_type`, `verification_id`)
- INDEX `idx_created` (`created_at`)

**Constraints**:
- FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
- FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON DELETE SET NULL



## Relationships

### One-to-One Relationships

- `users` ↔ `user_verifications`: Each user has one verification status record
  - Foreign Key: `user_verifications.user_id` → `users.id`

### One-to-Many Relationships

- `users` → `license_verifications`: User can have multiple license verification attempts
  - Foreign Key: `license_verifications.user_id` → `users.id`

- `users` → `kyc_sessions`: User can initiate multiple KYC sessions
  - Foreign Key: `kyc_sessions.user_id` → `users.id`

- `users` → `kyc_verifications`: User can have multiple KYC verification records
  - Foreign Key: `kyc_verifications.user_id` → `users.id`

- `kyc_sessions` → `liveness_checks`: Session can have multiple liveness check attempts
  - Foreign Key: `liveness_checks.session_id` → `kyc_sessions.id`

- `kyc_sessions` → `facial_matches`: Session can have multiple facial match attempts
  - Foreign Key: `facial_matches.session_id` → `kyc_sessions.id`

- `kyc_sessions` → `kyc_verifications`: Session results in one verification record
  - Foreign Key: `kyc_verifications.session_id` → `kyc_sessions.id`

- `license_verifications` → `license_verifications`: Verification can be resubmission of previous
  - Foreign Key: `license_verifications.resubmission_of` → `license_verifications.id`

### Audit Relationships

- `users` → `verification_audit_log`: All user verification actions are logged
  - Foreign Key: `verification_audit_log.user_id` → `users.id`

- `users` (admins) → `verification_audit_log`: Admin actions are logged
  - Foreign Key: `verification_audit_log.admin_id` → `users.id`

## Indexes and Performance

### Query Optimization

**Common Queries**:

1. **Get user verification status**:
   ```sql
   SELECT * FROM user_verifications WHERE user_id = ?
   ```
   - Optimized by: UNIQUE INDEX on `user_id`

2. **Find verifications needing manual review**:
   ```sql
   SELECT * FROM license_verifications 
   WHERE requires_manual_review = TRUE AND status = 'processing'
   ORDER BY created_at ASC
   ```
   - Optimized by: INDEX on `requires_manual_review`, `status`

3. **Find expiring licenses**:
   ```sql
   SELECT u.id, u.email, lv.expiration_date 
   FROM users u
   JOIN user_verifications uv ON u.id = uv.user_id
   JOIN license_verifications lv ON u.id = lv.user_id
   WHERE lv.status = 'approved' 
   AND lv.expiration_date BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 30 DAY)
   ```
   - Optimized by: INDEX on `license_verifications.expiration_date`

4. **Get user's verification history**:
   ```sql
   SELECT * FROM verification_audit_log 
   WHERE user_id = ? 
   ORDER BY created_at DESC 
   LIMIT 50
   ```
   - Optimized by: INDEX on `user_id`, `created_at`

5. **Find expired KYC verifications**:
   ```sql
   SELECT * FROM user_verifications 
   WHERE kyc_verified = TRUE AND kyc_expires_at < NOW()
   ```
   - Optimized by: INDEX on `kyc_expires_at`



### Performance Considerations

**Partitioning Strategy**:
- Partition `verification_audit_log` by month for efficient archival
- Partition `liveness_checks` and `facial_matches` by session creation date

**Caching Strategy**:
- Cache `user_verifications` records in Redis (TTL: 1 hour)
- Cache verification status lookups (TTL: 5 minutes)
- Invalidate cache on status updates

**Archive Strategy**:
- Archive `verification_audit_log` older than 2 years to cold storage
- Archive rejected `license_verifications` older than 1 year
- Archive expired `kyc_sessions` older than 90 days

## Data Retention and Privacy

### Retention Policies

**Active Verifications**:
- Keep approved verifications until expiration + 1 year
- Keep rejected verifications for 90 days
- Keep pending verifications for 30 days

**Images**:
- Delete license images 90 days after verification approval
- Delete KYC document images 90 days after verification
- Delete selfie images immediately after facial matching
- Retain only image URLs, not actual images, in database

**Audit Logs**:
- Retain audit logs for 7 years for compliance
- Archive logs older than 2 years to cold storage

### GDPR Compliance

**Right to Access**:
- Provide all verification data in machine-readable format
- Include verification history and audit logs

**Right to Erasure**:
- Delete all verification images from cloud storage
- Anonymize audit logs (replace user_id with "deleted_user")
- Retain minimal data for legal/regulatory requirements

**Right to Rectification**:
- Allow users to update incorrect verification data
- Maintain audit trail of corrections

## Migration Scripts

### Initial Schema Creation

```sql
-- Create user_verifications table
CREATE TABLE user_verifications (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at DATETIME NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verified_at DATETIME NULL,
  license_verified BOOLEAN DEFAULT FALSE,
  license_verified_at DATETIME NULL,
  license_expires_at DATETIME NULL,
  kyc_verified BOOLEAN DEFAULT FALSE,
  kyc_verified_at DATETIME NULL,
  kyc_level ENUM('basic', 'standard', 'enhanced', 'premium') NULL,
  kyc_expires_at DATETIME NULL,
  trust_score INT DEFAULT 0,
  verification_completeness INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_user_id (user_id),
  INDEX idx_license_expires (license_expires_at),
  INDEX idx_kyc_expires (kyc_expires_at),
  INDEX idx_trust_score (trust_score),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Data Migration

**Migrating existing user data**:
```sql
-- Create verification records for existing users
INSERT INTO user_verifications (user_id, email_verified, email_verified_at, phone_verified, phone_verified_at)
SELECT id, email_verified, email_verified_at, phone_verified, phone_verified_at
FROM users
WHERE NOT EXISTS (SELECT 1 FROM user_verifications WHERE user_id = users.id);
```

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Encryption**: AES-256 for sensitive data at rest
- **Backup**: Daily automated backups with 30-day retention
- **Replication**: Master-slave replication for read scalability
- **Monitoring**: Slow query log analysis and performance monitoring

## Implementation Notes

### Phase 1: Basic Schema (Week 1)

- Create `user_verifications` table
- Create `license_verifications` table
- Create `verification_audit_log` table
- Implement basic indexes

### Phase 2: KYC Schema (Week 2)

- Create `kyc_sessions` table
- Create `kyc_verifications` table
- Create `liveness_checks` table
- Create `facial_matches` table

### Phase 3: Optimization (Week 3)

- Add composite indexes for common queries
- Implement caching strategy
- Set up partitioning for audit logs
- Configure backup and replication

### Phase 4: Compliance (Week 4)

- Implement data retention policies
- Create GDPR compliance procedures
- Set up automated data archival
- Document privacy controls


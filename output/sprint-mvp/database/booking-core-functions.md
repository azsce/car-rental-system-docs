# Feature: Booking Core Functions - Database

## Overview

This document specifies the database schema, relationships, indexes, and data management strategies for the booking core functions. The database design ensures data integrity, supports high-performance queries, maintains comprehensive audit trails, and enables scalable booking operations.

The schema follows MySQL 8.0+ best practices with InnoDB storage engine, implementing proper normalization, foreign key constraints, and optimized indexing for booking lifecycle management.

## Sprint Category

sprint-mvp

## Feature IDs

F-FUNC-BM-001, F-FUNC-BM-004, F-FUNC-BM-006, F-FUNC-BM-007, F-FUNC-BM-008, F-FUNC-BM-009, F-FUNC-BM-010

## Database Schema

### Core Tables

#### bookings
Primary table storing all booking records with complete lifecycle information.

**Purpose:** Store booking reservations with customer, vehicle, location, pricing, and status information.

**Columns:**
- id: VARCHAR(36) PRIMARY KEY - Unique booking identifier (UUID)
- booking_reference: VARCHAR(20) UNIQUE NOT NULL - User-friendly booking reference
- user_id: VARCHAR(36) NOT NULL - Reference to user who created booking
- vehicle_id: VARCHAR(36) NOT NULL - Reference to booked vehicle
- pickup_date: DATETIME NOT NULL - Scheduled pickup date and time
- return_date: DATETIME NOT NULL - Scheduled return date and time
- pickup_location_id: VARCHAR(36) NOT NULL - Pickup location reference
- return_location_id: VARCHAR(36) NOT NULL - Return location reference
- status: ENUM NOT NULL - Booking status (pending, confirmed, active, completed, cancelled)

**Customer Information:**
- customer_full_name: VARCHAR(255) NOT NULL
- customer_email: VARCHAR(255) NOT NULL
- customer_phone: VARCHAR(50) NOT NULL
- customer_dob: DATE NOT NULL
- driver_license_number: VARCHAR(100) NOT NULL
- driver_license_expiration: DATE NOT NULL
- driver_license_country: VARCHAR(3) NOT NULL

**Pricing Information:**
- base_rate: DECIMAL(10, 2) NOT NULL
- insurance_cost: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- services_cost: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- equipment_cost: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- taxes: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- fees: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- discounts: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- total_cost: DECIMAL(10, 2) NOT NULL
- currency: VARCHAR(3) NOT NULL DEFAULT 'USD'


**Payment Information:**
- payment_method: VARCHAR(50) NOT NULL
- payment_status: ENUM NOT NULL - Payment status (pending, authorized, captured, refunded, failed)
- payment_transaction_id: VARCHAR(255)
- payment_gateway: VARCHAR(50)

**Insurance and Services:**
- insurance_type: VARCHAR(50) NOT NULL
- insurance_coverage_amount: DECIMAL(10, 2)
- additional_services: JSON - Array of additional service IDs
- equipment: JSON - Array of equipment IDs
- additional_drivers: JSON - Array of additional driver information

**Terms and Compliance:**
- terms_accepted: BOOLEAN NOT NULL DEFAULT FALSE
- terms_version: VARCHAR(20) NOT NULL
- terms_accepted_at: DATETIME
- terms_acceptance_ip: VARCHAR(45)

**Confirmation:**
- confirmation_sent: BOOLEAN NOT NULL DEFAULT FALSE
- confirmation_sent_at: DATETIME
- qr_code: TEXT

**Timestamps:**
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
- confirmed_at: DATETIME
- pickup_completed_at: DATETIME
- return_completed_at: DATETIME
- cancelled_at: DATETIME

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (booking_reference)
- INDEX idx_user_id (user_id)
- INDEX idx_vehicle_id (vehicle_id)
- INDEX idx_status (status)
- INDEX idx_pickup_date (pickup_date)
- INDEX idx_return_date (return_date)
- INDEX idx_created_at (created_at)
- INDEX idx_vehicle_availability (vehicle_id, pickup_date, return_date, status)
- INDEX idx_user_active_bookings (user_id, status, pickup_date)
- INDEX idx_location_schedule (pickup_location_id, pickup_date, status)

**Foreign Keys:**
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT
- FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE RESTRICT
- FOREIGN KEY (return_location_id) REFERENCES locations(id) ON DELETE RESTRICT

#### booking_modifications
Table tracking all modifications made to bookings for audit trail and history.

**Purpose:** Maintain complete history of booking changes with before/after states.

**Columns:**
- id: VARCHAR(36) PRIMARY KEY
- booking_id: VARCHAR(36) NOT NULL
- modified_by: VARCHAR(36) NOT NULL
- modification_type: ENUM NOT NULL (dates, vehicle, location, services, insurance, other)
- before_state: JSON NOT NULL - Complete booking state before modification
- after_state: JSON NOT NULL - Complete booking state after modification
- price_difference: DECIMAL(10, 2) NOT NULL
- modification_fee: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- payment_adjustment_status: ENUM NOT NULL (pending, processed, failed)
- payment_adjustment_transaction_id: VARCHAR(255)
- reason: TEXT
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_booking_id (booking_id)
- INDEX idx_modified_by (modified_by)
- INDEX idx_created_at (created_at)

**Foreign Keys:**
- FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
- FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE RESTRICT

#### booking_cancellations
Table storing cancellation details and refund information.

**Purpose:** Track booking cancellations with policy application and refund processing.

**Columns:**
- id: VARCHAR(36) PRIMARY KEY
- booking_id: VARCHAR(36) NOT NULL UNIQUE
- cancelled_by: VARCHAR(36) NOT NULL
- policy_type: ENUM NOT NULL (free, partial, no_refund, force_majeure)
- refund_percentage: DECIMAL(5, 2) NOT NULL
- original_amount: DECIMAL(10, 2) NOT NULL
- cancellation_fee: DECIMAL(10, 2) NOT NULL DEFAULT 0.00
- refund_amount: DECIMAL(10, 2) NOT NULL
- currency: VARCHAR(3) NOT NULL DEFAULT 'USD'
- refund_status: ENUM NOT NULL (pending, processing, completed, failed)
- refund_transaction_id: VARCHAR(255)
- refund_processed_at: DATETIME
- refund_method: VARCHAR(50)
- reason: TEXT
- reason_category: ENUM (plans_changed, found_alternative, emergency, other)
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE KEY (booking_id)
- INDEX idx_cancelled_by (cancelled_by)
- INDEX idx_created_at (created_at)
- INDEX idx_refund_status (refund_status)

**Foreign Keys:**
- FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
- FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE RESTRICT

#### booking_audit_log
Immutable audit trail of all booking operations for compliance and investigation.

**Purpose:** Maintain complete, tamper-proof log of all booking-related events.

**Columns:**
- id: VARCHAR(36) PRIMARY KEY
- booking_id: VARCHAR(36) NOT NULL
- event_type: ENUM NOT NULL (created, modified, cancelled, confirmed, pickup_completed, return_completed, payment_processed, refund_processed)
- actor_id: VARCHAR(36)
- actor_type: ENUM NOT NULL (customer, admin, system, support)
- event_data: JSON NOT NULL - Complete event details
- ip_address: VARCHAR(45)
- user_agent: TEXT
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_booking_id (booking_id)
- INDEX idx_event_type (event_type)
- INDEX idx_created_at (created_at)
- INDEX idx_actor_id (actor_id)

**Foreign Keys:**
- FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE

### Supporting Tables

#### booking_locks
Temporary table for managing vehicle locks during checkout process.

**Purpose:** Prevent overbooking by temporarily reserving vehicles during checkout.

**Columns:**
- id: VARCHAR(36) PRIMARY KEY
- vehicle_id: VARCHAR(36) NOT NULL
- user_id: VARCHAR(36) NOT NULL
- pickup_date: DATETIME NOT NULL
- return_date: DATETIME NOT NULL
- expires_at: DATETIME NOT NULL
- created_at: DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

**Indexes:**
- PRIMARY KEY (id)
- INDEX idx_vehicle_id (vehicle_id)
- INDEX idx_expires_at (expires_at)
- INDEX idx_user_id (user_id)

**Foreign Keys:**
- FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE

**Note:** This table should be stored in Redis for better performance, but MySQL backup is maintained.

## Table Creation Scripts

### bookings Table
```sql
CREATE TABLE bookings (
  id VARCHAR(36) PRIMARY KEY,
  booking_reference VARCHAR(20) UNIQUE NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  vehicle_id VARCHAR(36) NOT NULL,
  pickup_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  pickup_location_id VARCHAR(36) NOT NULL,
  return_location_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  
  customer_full_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_dob DATE NOT NULL,
  driver_license_number VARCHAR(100) NOT NULL,
  driver_license_expiration DATE NOT NULL,
  driver_license_country VARCHAR(3) NOT NULL,
  
  base_rate DECIMAL(10, 2) NOT NULL,
  insurance_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  services_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  equipment_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  taxes DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  fees DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discounts DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total_cost DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  
  payment_method VARCHAR(50) NOT NULL,
  payment_status ENUM('pending', 'authorized', 'captured', 'refunded', 'failed') NOT NULL DEFAULT 'pending',
  payment_transaction_id VARCHAR(255),
  payment_gateway VARCHAR(50),
  
  insurance_type VARCHAR(50) NOT NULL,
  insurance_coverage_amount DECIMAL(10, 2),
  additional_services JSON,
  equipment JSON,
  additional_drivers JSON,
  
  terms_accepted BOOLEAN NOT NULL DEFAULT FALSE,
  terms_version VARCHAR(20) NOT NULL,
  terms_accepted_at DATETIME,
  terms_acceptance_ip VARCHAR(45),
  
  confirmation_sent BOOLEAN NOT NULL DEFAULT FALSE,
  confirmation_sent_at DATETIME,
  qr_code TEXT,
  
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  confirmed_at DATETIME,
  pickup_completed_at DATETIME,
  return_completed_at DATETIME,
  cancelled_at DATETIME,
  
  INDEX idx_user_id (user_id),
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_status (status),
  INDEX idx_pickup_date (pickup_date),
  INDEX idx_return_date (return_date),
  INDEX idx_booking_reference (booking_reference),
  INDEX idx_created_at (created_at),
  INDEX idx_vehicle_availability (vehicle_id, pickup_date, return_date, status),
  INDEX idx_user_active_bookings (user_id, status, pickup_date),
  INDEX idx_location_schedule (pickup_location_id, pickup_date, status),
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
  FOREIGN KEY (pickup_location_id) REFERENCES locations(id) ON DELETE RESTRICT,
  FOREIGN KEY (return_location_id) REFERENCES locations(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### booking_modifications Table
```sql
CREATE TABLE booking_modifications (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  modified_by VARCHAR(36) NOT NULL,
  modification_type ENUM('dates', 'vehicle', 'location', 'services', 'insurance', 'other') NOT NULL,
  before_state JSON NOT NULL,
  after_state JSON NOT NULL,
  price_difference DECIMAL(10, 2) NOT NULL,
  modification_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  payment_adjustment_status ENUM('pending', 'processed', 'failed') NOT NULL DEFAULT 'pending',
  payment_adjustment_transaction_id VARCHAR(255),
  reason TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_modified_by (modified_by),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (modified_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### booking_cancellations Table
```sql
CREATE TABLE booking_cancellations (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL UNIQUE,
  cancelled_by VARCHAR(36) NOT NULL,
  policy_type ENUM('free', 'partial', 'no_refund', 'force_majeure') NOT NULL,
  refund_percentage DECIMAL(5, 2) NOT NULL,
  original_amount DECIMAL(10, 2) NOT NULL,
  cancellation_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  refund_amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  refund_status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  refund_transaction_id VARCHAR(255),
  refund_processed_at DATETIME,
  refund_method VARCHAR(50),
  reason TEXT,
  reason_category ENUM('plans_changed', 'found_alternative', 'emergency', 'other'),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_cancelled_by (cancelled_by),
  INDEX idx_created_at (created_at),
  INDEX idx_refund_status (refund_status),
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  FOREIGN KEY (cancelled_by) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### booking_audit_log Table
```sql
CREATE TABLE booking_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  event_type ENUM('created', 'modified', 'cancelled', 'confirmed', 'pickup_completed', 'return_completed', 'payment_processed', 'refund_processed') NOT NULL,
  actor_id VARCHAR(36),
  actor_type ENUM('customer', 'admin', 'system', 'support') NOT NULL,
  event_data JSON NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_booking_id (booking_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at),
  INDEX idx_actor_id (actor_id),
  
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### booking_locks Table
```sql
CREATE TABLE booking_locks (
  id VARCHAR(36) PRIMARY KEY,
  vehicle_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  pickup_date DATETIME NOT NULL,
  return_date DATETIME NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_user_id (user_id),
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Data Relationships

### Entity Relationship Diagram

```
users (1) ----< (M) bookings
vehicles (1) ----< (M) bookings
locations (1) ----< (M) bookings (pickup)
locations (1) ----< (M) bookings (return)
bookings (1) ----< (M) booking_modifications
bookings (1) ---- (1) booking_cancellations
bookings (1) ----< (M) booking_audit_log
vehicles (1) ----< (M) booking_locks
users (1) ----< (M) booking_locks
```

### Relationship Details

**Users to Bookings (One-to-Many)**
- One user can have multiple bookings
- Bookings cannot exist without a user
- Cascade: RESTRICT (prevent user deletion if bookings exist)

**Vehicles to Bookings (One-to-Many)**
- One vehicle can have multiple bookings
- Bookings cannot exist without a vehicle
- Cascade: RESTRICT (prevent vehicle deletion if bookings exist)

**Locations to Bookings (One-to-Many, twice)**
- One location can be pickup for multiple bookings
- One location can be return for multiple bookings
- Cascade: RESTRICT (prevent location deletion if bookings exist)

**Bookings to Modifications (One-to-Many)**
- One booking can have multiple modifications
- Modifications cannot exist without a booking
- Cascade: CASCADE (delete modifications when booking deleted)

**Bookings to Cancellations (One-to-One)**
- One booking can have one cancellation
- Cancellation cannot exist without a booking
- Cascade: CASCADE (delete cancellation when booking deleted)

**Bookings to Audit Log (One-to-Many)**
- One booking can have multiple audit entries
- Audit entries cannot exist without a booking
- Cascade: CASCADE (delete audit entries when booking deleted)

## Query Patterns and Optimization

### Common Queries

**Get User's Bookings**
```sql
SELECT 
  b.id, b.booking_reference, b.status,
  v.make, v.model, v.image_url,
  b.pickup_date, b.return_date,
  b.total_cost, b.currency
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
WHERE b.user_id = ?
  AND b.status IN ('confirmed', 'active')
ORDER BY b.pickup_date DESC
LIMIT 20 OFFSET 0;
```

**Check Vehicle Availability**
```sql
SELECT COUNT(*) as booking_count
FROM bookings
WHERE vehicle_id = ?
  AND status IN ('confirmed', 'active')
  AND (
    (pickup_date <= ? AND return_date >= ?) OR
    (pickup_date >= ? AND pickup_date < ?)
  );
```

**Get Booking with Full Details**
```sql
SELECT 
  b.*,
  v.make, v.model, v.year, v.category, v.image_url,
  pl.name as pickup_location_name, pl.address as pickup_address,
  rl.name as return_location_name, rl.address as return_address,
  u.email as user_email, u.full_name as user_name
FROM bookings b
JOIN vehicles v ON b.vehicle_id = v.id
JOIN locations pl ON b.pickup_location_id = pl.id
JOIN locations rl ON b.return_location_id = rl.id
JOIN users u ON b.user_id = u.id
WHERE b.id = ?;
```

**Get Booking Modification History**
```sql
SELECT 
  bm.*,
  u.full_name as modified_by_name
FROM booking_modifications bm
JOIN users u ON bm.modified_by = u.id
WHERE bm.booking_id = ?
ORDER BY bm.created_at DESC;
```

**Get Pending Refunds**
```sql
SELECT 
  bc.*,
  b.booking_reference,
  u.email as customer_email
FROM booking_cancellations bc
JOIN bookings b ON bc.booking_id = b.id
JOIN users u ON bc.cancelled_by = u.id
WHERE bc.refund_status = 'pending'
ORDER BY bc.created_at ASC
LIMIT 100;
```

### Index Usage

**idx_vehicle_availability (vehicle_id, pickup_date, return_date, status)**
- Used for availability checking queries
- Composite index covers all columns in WHERE clause
- Significantly improves availability check performance

**idx_user_active_bookings (user_id, status, pickup_date)**
- Used for user's active bookings queries
- Covers filtering by user and status
- Allows efficient sorting by pickup date

**idx_location_schedule (pickup_location_id, pickup_date, status)**
- Used for location-based booking queries
- Helps with location capacity planning
- Supports date range filtering

## Data Integrity Constraints

### Check Constraints

```sql
ALTER TABLE bookings
ADD CONSTRAINT chk_dates CHECK (return_date > pickup_date);

ALTER TABLE bookings
ADD CONSTRAINT chk_total_cost CHECK (total_cost >= 0);

ALTER TABLE bookings
ADD CONSTRAINT chk_license_expiration CHECK (driver_license_expiration > pickup_date);

ALTER TABLE booking_cancellations
ADD CONSTRAINT chk_refund_percentage CHECK (refund_percentage >= 0 AND refund_percentage <= 100);

ALTER TABLE booking_cancellations
ADD CONSTRAINT chk_refund_amount CHECK (refund_amount >= 0 AND refund_amount <= original_amount);
```

### Triggers

**Update Booking Updated Timestamp**
```sql
CREATE TRIGGER trg_bookings_updated
BEFORE UPDATE ON bookings
FOR EACH ROW
SET NEW.updated_at = CURRENT_TIMESTAMP;
```

**Validate Booking Status Transitions**
```sql
CREATE TRIGGER trg_validate_booking_status
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot change status of completed booking';
  END IF;
  
  IF OLD.status = 'cancelled' AND NEW.status != 'cancelled' THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Cannot change status of cancelled booking';
  END IF;
END;
```

**Auto-populate Confirmation Timestamp**
```sql
CREATE TRIGGER trg_booking_confirmed
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    SET NEW.confirmed_at = CURRENT_TIMESTAMP;
  END IF;
END;
```

## Data Migration Strategy

### Initial Schema Deployment
1. Create tables in dependency order (users, vehicles, locations first)
2. Create bookings table
3. Create supporting tables (modifications, cancellations, audit_log, locks)
4. Create indexes
5. Create triggers
6. Verify foreign key constraints

### Data Seeding
1. Seed test users
2. Seed test vehicles
3. Seed test locations
4. Create sample bookings for testing
5. Verify data integrity

### Rollback Strategy
- Maintain schema version tracking
- Create rollback scripts for each migration
- Test rollback procedures in staging
- Backup data before production deployment

## Performance Considerations

### Partitioning Strategy
Consider partitioning bookings table by date for large datasets:

```sql
ALTER TABLE bookings
PARTITION BY RANGE (YEAR(pickup_date)) (
  PARTITION p2024 VALUES LESS THAN (2025),
  PARTITION p2025 VALUES LESS THAN (2026),
  PARTITION p2026 VALUES LESS THAN (2027),
  PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

### Archiving Strategy
- Archive completed bookings older than 2 years to separate table
- Maintain audit logs for 7+ years for compliance
- Implement automated archiving job
- Keep archived data accessible for reporting

### Query Optimization
- Use EXPLAIN to analyze query performance
- Monitor slow query log
- Optimize indexes based on actual query patterns
- Consider read replicas for reporting queries

## Backup and Recovery

### Backup Strategy
- Daily full backups of all booking tables
- Hourly incremental backups
- Transaction log backups every 15 minutes
- Retain backups for 30 days
- Test restore procedures monthly

### Disaster Recovery
- Maintain hot standby replica
- RPO (Recovery Point Objective): 15 minutes
- RTO (Recovery Time Objective): 1 hour
- Document recovery procedures
- Conduct disaster recovery drills quarterly

## Monitoring and Maintenance

### Key Metrics
- Table sizes and growth rates
- Index usage statistics
- Query performance metrics
- Lock contention
- Replication lag (if applicable)

### Maintenance Tasks
- Weekly index optimization
- Monthly table statistics update
- Quarterly partition maintenance
- Annual capacity planning review

## Security Considerations

### Data Encryption
- Encrypt sensitive columns (license numbers, payment info)
- Use MySQL encryption functions
- Manage encryption keys securely
- Rotate encryption keys annually

### Access Control
- Implement role-based database access
- Limit application user permissions
- Audit database access logs
- Restrict direct database access

### Compliance
- GDPR: Support data deletion requests
- PCI-DSS: Secure payment data storage
- Audit trail retention: 7+ years
- Data anonymization for analytics

## Technology Stack

- Database: MySQL 8.0+
- Storage Engine: InnoDB
- Character Set: utf8mb4
- Collation: utf8mb4_unicode_ci
- Caching: Redis for locks and sessions
- Backup: MySQL Enterprise Backup or Percona XtraBackup
- Monitoring: MySQL Enterprise Monitor or Percona Monitoring

## Implementation Notes

### JSON Column Usage
- Use JSON columns for flexible data (additional_services, equipment, additional_drivers)
- Index JSON columns using generated columns if needed
- Validate JSON structure in application layer
- Consider extracting frequently queried JSON fields to regular columns

### UUID Generation
- Generate UUIDs in application layer (not database)
- Use UUID v4 for random generation
- Consider UUID v7 for time-ordered UUIDs
- Format as VARCHAR(36) with hyphens

### Booking Reference Generation
- Generate in application layer
- Format: PREFIX + DATE + RANDOM (e.g., BK260223-A7K9)
- Ensure uniqueness with database constraint
- Retry on collision (rare)

### Audit Log Best Practices
- Never delete audit log entries
- Store complete event context in JSON
- Include actor information for all events
- Consider blockchain integration for critical events
- Implement log rotation for very old entries

## Testing Strategy

### Unit Tests
- Test all constraints and triggers
- Test foreign key cascades
- Test data validation rules
- Test index usage

### Integration Tests
- Test booking creation flow
- Test modification flow
- Test cancellation flow
- Test concurrent booking attempts
- Test availability checking under load

### Performance Tests
- Load test booking creation
- Test query performance with large datasets
- Test index effectiveness
- Test backup and restore procedures

## Related Documentation

- Backend API Specifications
- Frontend Integration Guide
- Payment Gateway Integration
- Notification Service Integration
- Audit and Compliance Requirements

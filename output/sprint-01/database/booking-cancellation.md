# Feature: Booking Cancellation (Database)

## Overview

Database schema for tracking booking cancellations, refund processing, and cancellation analytics.

## Sprint Category

sprint-01

## Feature ID

F-BM-010

## Table Definitions

### booking_cancellations

```sql
CREATE TABLE booking_cancellations (
  cancellation_id VARCHAR(36) PRIMARY KEY COMMENT 'Unique cancellation identifier',
  booking_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Reference to cancelled booking',
  cancelled_by_user_id VARCHAR(36) NOT NULL COMMENT 'User who cancelled',
  cancelled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Cancellation timestamp',
  
  -- Timing
  hours_before_pickup DECIMAL(10,2) COMMENT 'Hours between cancellation and pickup',
  
  -- Reason
  cancellation_reason ENUM('plans_changed', 'found_better_price', 'emergency', 'vehicle_issue', 'other') DEFAULT 'other',
  reason_details TEXT COMMENT 'Additional details about cancellation',
  
  -- Financial
  original_cost DECIMAL(10,2) NOT NULL COMMENT 'Original booking cost',
  cancellation_fee DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Fee charged for cancellation',
  refund_percentage INT NOT NULL COMMENT 'Percentage of cost refunded',
  refund_amount DECIMAL(10,2) NOT NULL COMMENT 'Amount refunded to customer',
  refund_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  refund_transaction_id VARCHAR(100) COMMENT 'Payment gateway refund transaction ID',
  refund_completed_at TIMESTAMP COMMENT 'When refund was completed',
  
  -- Notifications
  confirmation_email_sent BOOLEAN DEFAULT FALSE,
  supplier_notified BOOLEAN DEFAULT FALSE,
  
  -- Audit
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (cancelled_by_user_id) REFERENCES users(user_id),
  
  INDEX idx_booking_cancellations (booking_id),
  INDEX idx_cancelled_at (cancelled_at),
  INDEX idx_refund_status (refund_status),
  INDEX idx_cancellation_reason (cancellation_reason),
  INDEX idx_hours_before_pickup (hours_before_pickup),
  
  CONSTRAINT chk_refund_percentage CHECK (refund_percentage >= 0 AND refund_percentage <= 100),
  CONSTRAINT chk_refund_amount_positive CHECK (refund_amount >= 0)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks all booking cancellations with refund details';
```

### bookings Table Updates

```sql
ALTER TABLE bookings
ADD COLUMN cancelled_at TIMESTAMP NULL COMMENT 'When booking was cancelled',
ADD COLUMN cancellation_reason TEXT COMMENT 'Reason for cancellation',
ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT 'Amount refunded',
ADD COLUMN refund_status ENUM('none', 'pending', 'processing', 'completed', 'failed') DEFAULT 'none',
ADD INDEX idx_cancelled_at (cancelled_at),
ADD INDEX idx_refund_status (refund_status);
```

## Relationships

### booking_cancellations → bookings
- One-to-one relationship
- Each cancellation belongs to one booking
- Foreign key: `booking_id` (UNIQUE constraint)
- Cascade delete

### booking_cancellations → users
- Many-to-one relationship
- Each cancellation made by one user
- Foreign key: `cancelled_by_user_id`

## Indexes

```sql
-- Primary lookup by booking
CREATE INDEX idx_booking_cancellations ON booking_cancellations(booking_id);

-- Temporal analysis
CREATE INDEX idx_cancelled_at ON booking_cancellations(cancelled_at);

-- Refund processing
CREATE INDEX idx_refund_status ON booking_cancellations(refund_status, cancelled_at);

-- Cancellation reason analysis
CREATE INDEX idx_cancellation_reason ON booking_cancellations(cancellation_reason, cancelled_at);

-- Timing analysis
CREATE INDEX idx_hours_before_pickup ON booking_cancellations(hours_before_pickup);
```

## Triggers

### Update Booking on Cancellation

```sql
DELIMITER //

CREATE TRIGGER trg_update_booking_on_cancel
AFTER INSERT ON booking_cancellations
FOR EACH ROW
BEGIN
  UPDATE bookings
  SET 
    status = 'cancelled',
    cancelled_at = NEW.cancelled_at,
    cancellation_reason = NEW.reason_details,
    refund_amount = NEW.refund_amount,
    refund_status = NEW.refund_status
  WHERE booking_id = NEW.booking_id;
END//

DELIMITER ;
```

## Query Patterns

### Get Cancellation Details

```sql
SELECT 
  c.cancellation_id,
  c.cancelled_at,
  c.hours_before_pickup,
  c.cancellation_reason,
  c.refund_amount,
  c.refund_status,
  u.email as cancelled_by,
  b.pickup_date,
  b.total_cost
FROM booking_cancellations c
JOIN users u ON c.cancelled_by_user_id = u.user_id
JOIN bookings b ON c.booking_id = b.booking_id
WHERE c.booking_id = ?;
```

### Find Pending Refunds

```sql
SELECT 
  c.cancellation_id,
  c.booking_id,
  c.refund_amount,
  c.cancelled_at,
  b.customer_email
FROM booking_cancellations c
JOIN bookings b ON c.booking_id = b.booking_id
WHERE c.refund_status = 'pending'
  AND c.cancelled_at < DATE_SUB(NOW(), INTERVAL 5 MINUTE)
ORDER BY c.cancelled_at ASC
LIMIT 100;
```

### Cancellation Statistics

```sql
SELECT 
  DATE(cancelled_at) as cancellation_date,
  COUNT(*) as total_cancellations,
  AVG(hours_before_pickup) as avg_hours_notice,
  SUM(refund_amount) as total_refunds,
  AVG(refund_percentage) as avg_refund_percentage,
  COUNT(CASE WHEN refund_percentage = 100 THEN 1 END) as free_cancellations,
  COUNT(CASE WHEN refund_percentage = 0 THEN 1 END) as no_refund_cancellations
FROM booking_cancellations
WHERE cancelled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(cancelled_at)
ORDER BY cancellation_date DESC;
```

### Cancellation Reasons Analysis

```sql
SELECT 
  cancellation_reason,
  COUNT(*) as count,
  AVG(hours_before_pickup) as avg_notice,
  AVG(refund_percentage) as avg_refund_pct
FROM booking_cancellations
WHERE cancelled_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
GROUP BY cancellation_reason
ORDER BY count DESC;
```

## Data Integrity

### Check Constraints

```sql
-- Refund percentage must be 0-100
ALTER TABLE booking_cancellations
ADD CONSTRAINT chk_refund_percentage 
CHECK (refund_percentage >= 0 AND refund_percentage <= 100);

-- Refund amount must be non-negative
ALTER TABLE booking_cancellations
ADD CONSTRAINT chk_refund_amount_positive 
CHECK (refund_amount >= 0);

-- Cancellation fee must be non-negative
ALTER TABLE booking_cancellations
ADD CONSTRAINT chk_cancellation_fee_positive 
CHECK (cancellation_fee >= 0);
```

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## Implementation Notes

### Migration Strategy
1. Create booking_cancellations table
2. Add columns to bookings table
3. Create indexes
4. Create triggers
5. Test with sample data
6. Deploy to production

### Performance
- Index on (refund_status, cancelled_at) for refund processing
- Partition by cancelled_at for high-volume systems
- Archive old cancellations after 2 years

### Monitoring
- Track cancellation rates
- Monitor refund processing times
- Alert on high refund failure rates
- Analyze cancellation patterns

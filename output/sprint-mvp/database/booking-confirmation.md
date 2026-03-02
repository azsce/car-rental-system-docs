# Feature: Booking Confirmation (Database)

## Overview

Database schema changes and data structures to support comprehensive booking confirmation functionality, including booking reference generation, confirmation token management, and delivery tracking for email and SMS notifications.

## Sprint Category

sprint-mvp

## Feature IDs

- F-BM-006: Comprehensive Booking Confirmation
- F-WF-BOOK-011: Booking Confirmation Delivery

## Schema Changes

### Bookings Table Modifications

Add columns to track confirmation delivery and provide guest access:

```sql
ALTER TABLE bookings
ADD COLUMN booking_reference VARCHAR(20) UNIQUE NOT NULL 
  COMMENT 'Unique customer-facing booking reference (e.g., RNT-ABC123)',
ADD COLUMN confirmation_email_sent BOOLEAN DEFAULT FALSE 
  COMMENT 'Flag indicating if confirmation email was sent',
ADD COLUMN confirmation_email_sent_at TIMESTAMP NULL 
  COMMENT 'Timestamp when confirmation email was sent',
ADD COLUMN confirmation_sms_sent BOOLEAN DEFAULT FALSE 
  COMMENT 'Flag indicating if confirmation SMS was sent',
ADD COLUMN confirmation_sms_sent_at TIMESTAMP NULL 
  COMMENT 'Timestamp when confirmation SMS was sent',
ADD COLUMN confirmation_token VARCHAR(255) UNIQUE NULL 
  COMMENT 'Secure token for guest access to confirmation page',
ADD COLUMN confirmation_token_expires_at TIMESTAMP NULL 
  COMMENT 'Expiration timestamp for confirmation token (30 days)',
ADD COLUMN qr_code_data TEXT NULL 
  COMMENT 'Cached QR code data (base64 encoded)',
ADD COLUMN pdf_url VARCHAR(500) NULL 
  COMMENT 'URL to generated PDF confirmation document';
```

### Indexes

Create indexes for fast lookup and query performance:

```sql
-- Index for booking reference lookup (customer service, check-in)
CREATE INDEX idx_booking_reference ON bookings(booking_reference);

-- Index for confirmation token lookup (guest access)
CREATE INDEX idx_confirmation_token ON bookings(confirmation_token);

-- Index for tracking confirmation delivery status
CREATE INDEX idx_confirmation_sent ON bookings(
  confirmation_email_sent, 
  confirmation_sms_sent
);

-- Index for finding expired confirmation tokens (cleanup job)
CREATE INDEX idx_confirmation_token_expiry ON bookings(
  confirmation_token_expires_at
);
```

## Table Definitions

### Booking Reference Format

**Format**: `RNT-XXXXXX`
- Prefix: `RNT-` (Rental)
- Suffix: 6 alphanumeric characters (uppercase)
- Example: `RNT-A3B7K9`

**Generation Logic**:
- Use cryptographically secure random generator
- Characters: A-Z, 0-9 (excluding ambiguous: O, 0, I, 1)
- Validate uniqueness before insertion
- Retry if collision detected (rare)

**Constraints**:
- VARCHAR(20) to accommodate format and future changes
- UNIQUE constraint to prevent duplicates
- NOT NULL to ensure every booking has reference

### Confirmation Token

**Format**: 64-character hexadecimal string
- Example: `a3f7b2c9d4e8f1a6b5c3d7e9f2a4b8c6d1e5f9a2b7c4d8e3f6a1b9c5d2e7f4a8`

**Generation Logic**:
- Use cryptographically secure random generator
- Generate 32 random bytes
- Convert to hexadecimal string (64 characters)
- Validate uniqueness before insertion

**Expiration**:
- Set to 30 days from booking confirmation
- Stored in `confirmation_token_expires_at`
- Expired tokens should be cleaned up by scheduled job

**Constraints**:
- VARCHAR(255) to accommodate token length
- UNIQUE constraint to prevent duplicates
- NULL allowed (tokens only for guest bookings)

### QR Code Data

**Storage**: Base64 encoded PNG image
- Stored in TEXT column
- Cached to avoid regeneration
- Can be regenerated if lost

**Content**: JSON payload encoded in QR code
```json
{
  "bookingReference": "RNT-A3B7K9",
  "verificationToken": "short-token",
  "type": "booking-confirmation"
}
```

### PDF URL

**Storage**: Full URL to PDF document in blob storage
- Example: `https://storage.example.com/confirmations/booking-123.pdf`
- VARCHAR(500) to accommodate long URLs
- NULL if PDF not yet generated

## Relationships

No new tables or relationships required. Existing relationships maintained:

- `bookings` → `customers` (many-to-one via `customer_id`)
- `bookings` → `vehicles` (many-to-one via `vehicle_id`)
- `bookings` → `locations` (many-to-one via `pickup_location_id`, `return_location_id`)
- `bookings` → `payments` (one-to-many via `booking_id`)

## Data Integrity

### Constraints

```sql
-- Ensure booking reference follows format
ALTER TABLE bookings
ADD CONSTRAINT chk_booking_reference_format 
CHECK (booking_reference REGEXP '^RNT-[A-Z0-9]{6}$');

-- Ensure confirmation token is valid length if present
ALTER TABLE bookings
ADD CONSTRAINT chk_confirmation_token_length 
CHECK (confirmation_token IS NULL OR LENGTH(confirmation_token) = 64);

-- Ensure email sent timestamp is set if email sent flag is true
ALTER TABLE bookings
ADD CONSTRAINT chk_email_sent_consistency 
CHECK (
  (confirmation_email_sent = FALSE AND confirmation_email_sent_at IS NULL) OR
  (confirmation_email_sent = TRUE AND confirmation_email_sent_at IS NOT NULL)
);

-- Ensure SMS sent timestamp is set if SMS sent flag is true
ALTER TABLE bookings
ADD CONSTRAINT chk_sms_sent_consistency 
CHECK (
  (confirmation_sms_sent = FALSE AND confirmation_sms_sent_at IS NULL) OR
  (confirmation_sms_sent = TRUE AND confirmation_sms_sent_at IS NOT NULL)
);

-- Ensure token expiration is set if token exists
ALTER TABLE bookings
ADD CONSTRAINT chk_token_expiration_consistency 
CHECK (
  (confirmation_token IS NULL AND confirmation_token_expires_at IS NULL) OR
  (confirmation_token IS NOT NULL AND confirmation_token_expires_at IS NOT NULL)
);
```

### Triggers

```sql
-- Trigger to set confirmation token expiration automatically
DELIMITER //
CREATE TRIGGER set_confirmation_token_expiry
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
  IF NEW.confirmation_token IS NOT NULL AND NEW.confirmation_token_expires_at IS NULL THEN
    SET NEW.confirmation_token_expires_at = DATE_ADD(NOW(), INTERVAL 30 DAY);
  END IF;
END//
DELIMITER ;

-- Trigger to update confirmation email sent timestamp
DELIMITER //
CREATE TRIGGER update_email_sent_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.confirmation_email_sent = TRUE AND OLD.confirmation_email_sent = FALSE THEN
    SET NEW.confirmation_email_sent_at = NOW();
  END IF;
END//
DELIMITER ;

-- Trigger to update confirmation SMS sent timestamp
DELIMITER //
CREATE TRIGGER update_sms_sent_timestamp
BEFORE UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF NEW.confirmation_sms_sent = TRUE AND OLD.confirmation_sms_sent = FALSE THEN
    SET NEW.confirmation_sms_sent_at = NOW();
  END IF;
END//
DELIMITER ;
```

## Queries

### Generate Booking Reference
```sql
-- Function to generate unique booking reference
DELIMITER //
CREATE FUNCTION generate_booking_reference()
RETURNS VARCHAR(20)
DETERMINISTIC
BEGIN
  DECLARE ref VARCHAR(20);
  DECLARE done INT DEFAULT 0;
  
  REPEAT
    SET ref = CONCAT('RNT-', 
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1),
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1),
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1),
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1),
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1),
      SUBSTRING('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 
        FLOOR(1 + RAND() * 32), 1)
    );
    
    IF NOT EXISTS (SELECT 1 FROM bookings WHERE booking_reference = ref) THEN
      SET done = 1;
    END IF;
  UNTIL done END REPEAT;
  
  RETURN ref;
END//
DELIMITER ;
```

### Retrieve Confirmation Data
```sql
-- Query to get complete confirmation data
SELECT 
  b.id AS booking_id,
  b.booking_reference,
  b.status,
  b.created_at,
  b.confirmation_email_sent,
  b.confirmation_email_sent_at,
  b.confirmation_sms_sent,
  b.confirmation_sms_sent_at,
  b.qr_code_data,
  b.pdf_url,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  v.make,
  v.model,
  v.category,
  v.year,
  v.license_plate,
  b.pickup_date,
  b.pickup_time,
  b.return_date,
  b.return_time,
  pl.name AS pickup_location_name,
  pl.address AS pickup_address,
  pl.city AS pickup_city,
  pl.phone AS pickup_phone,
  pl.operating_hours AS pickup_hours,
  rl.name AS return_location_name,
  rl.address AS return_address,
  p.total_amount,
  p.currency,
  p.payment_method,
  p.last_four_digits
FROM bookings b
INNER JOIN customers c ON b.customer_id = c.id
INNER JOIN vehicles v ON b.vehicle_id = v.id
INNER JOIN locations pl ON b.pickup_location_id = pl.id
INNER JOIN locations rl ON b.return_location_id = rl.id
INNER JOIN payments p ON b.id = p.booking_id
WHERE b.id = ? AND b.status = 'confirmed';
```

### Find Booking by Reference
```sql
-- Query to find booking by customer-facing reference
SELECT id, customer_id, status, booking_reference
FROM bookings
WHERE booking_reference = ?;
```

### Find Booking by Confirmation Token
```sql
-- Query to find booking by guest confirmation token
SELECT id, customer_id, status, booking_reference
FROM bookings
WHERE confirmation_token = ?
  AND confirmation_token_expires_at > NOW();
```

### Track Confirmation Delivery
```sql
-- Query to find bookings with pending confirmations
SELECT id, booking_reference, customer_id, created_at
FROM bookings
WHERE status = 'confirmed'
  AND (confirmation_email_sent = FALSE OR confirmation_sms_sent = FALSE)
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

### Cleanup Expired Tokens
```sql
-- Query to clean up expired confirmation tokens (scheduled job)
UPDATE bookings
SET confirmation_token = NULL,
    confirmation_token_expires_at = NULL
WHERE confirmation_token IS NOT NULL
  AND confirmation_token_expires_at < NOW();
```

## Migration Script

```sql
-- Migration: Add booking confirmation fields
-- Version: 1.0.0
-- Date: 2026-02-23

START TRANSACTION;

-- Add new columns
ALTER TABLE bookings
ADD COLUMN booking_reference VARCHAR(20) UNIQUE NULL,
ADD COLUMN confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmation_email_sent_at TIMESTAMP NULL,
ADD COLUMN confirmation_sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmation_sms_sent_at TIMESTAMP NULL,
ADD COLUMN confirmation_token VARCHAR(255) UNIQUE NULL,
ADD COLUMN confirmation_token_expires_at TIMESTAMP NULL,
ADD COLUMN qr_code_data TEXT NULL,
ADD COLUMN pdf_url VARCHAR(500) NULL;

-- Create indexes
CREATE INDEX idx_booking_reference ON bookings(booking_reference);
CREATE INDEX idx_confirmation_token ON bookings(confirmation_token);
CREATE INDEX idx_confirmation_sent ON bookings(confirmation_email_sent, confirmation_sms_sent);
CREATE INDEX idx_confirmation_token_expiry ON bookings(confirmation_token_expires_at);

-- Add constraints
ALTER TABLE bookings
ADD CONSTRAINT chk_booking_reference_format 
CHECK (booking_reference IS NULL OR booking_reference REGEXP '^RNT-[A-Z0-9]{6}$');

-- Generate booking references for existing bookings
UPDATE bookings
SET booking_reference = generate_booking_reference()
WHERE booking_reference IS NULL AND status = 'confirmed';

-- Make booking_reference NOT NULL after backfill
ALTER TABLE bookings
MODIFY COLUMN booking_reference VARCHAR(20) UNIQUE NOT NULL;

COMMIT;
```

## Technology Stack

- **Database**: MySQL 8.0+
- **ORM**: Entity Framework Core
- **Migrations**: EF Core Migrations or Flyway

## Implementation Notes

### Data Migration
- Generate booking references for all existing confirmed bookings
- Set confirmation flags based on existing email/SMS logs if available
- Tokens only needed for new bookings going forward

### Performance Considerations
- Index on booking_reference for fast customer service lookups
- Index on confirmation_token for guest access
- Cache QR codes to avoid database reads
- Consider partitioning bookings table if volume is high

### Maintenance
- Schedule job to clean up expired confirmation tokens weekly
- Monitor booking_reference generation for collisions
- Archive old QR code data if storage becomes issue
- Rotate PDF URLs if storage location changes

# Feature: Booking History & Dashboard - Database

## Overview

Database schema and queries to support comprehensive booking history management and real-time active trip monitoring. Includes optimized indexes for filtering, searching, and sorting booking data, plus support for trip tracking and vehicle status.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-011: Comprehensive Booking History
- F-BM-012: Active Trip Dashboard
- F-FUNC-BM-005: Booking History (Functional Requirement)

## Database Specifications

### Schema Changes

#### Bookings Table (Existing - Enhancements)

Add indexes and columns to support efficient history queries and trip tracking:

```sql
-- Add trip tracking columns if not exists
ALTER TABLE Bookings
ADD COLUMN IF NOT EXISTS actual_pickup_time DATETIME NULL COMMENT 'Actual time customer picked up vehicle',
ADD COLUMN IF NOT EXISTS actual_return_time DATETIME NULL COMMENT 'Actual time customer returned vehicle',
ADD COLUMN IF NOT EXISTS trip_status ENUM('not_started', 'in_progress', 'completed', 'cancelled') DEFAULT 'not_started' COMMENT 'Current trip status',
ADD COLUMN IF NOT EXISTS extension_count INT DEFAULT 0 COMMENT 'Number of times trip was extended',
ADD COLUMN IF NOT EXISTS last_extended_at DATETIME NULL COMMENT 'Last time trip was extended';

-- Add indexes for booking history queries
CREATE INDEX idx_bookings_user_status ON Bookings(user_id, status);
CREATE INDEX idx_bookings_user_pickup_date ON Bookings(user_id, pickup_date);
CREATE INDEX idx_bookings_user_created_at ON Bookings(user_id, created_at);
CREATE INDEX idx_bookings_status_pickup ON Bookings(status, pickup_date);
CREATE INDEX idx_bookings_trip_status ON Bookings(trip_status);

-- Add full-text search index for booking reference and notes
CREATE FULLTEXT INDEX idx_bookings_search ON Bookings(booking_reference, customer_notes);
```

#### TripTracking Table (New)

Store real-time trip tracking data:

```sql
CREATE TABLE TripTracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Timing information
    trip_start_time DATETIME NOT NULL COMMENT 'When trip actually started',
    scheduled_end_time DATETIME NOT NULL COMMENT 'Scheduled return time',
    actual_end_time DATETIME NULL COMMENT 'Actual return time',
    
    -- Cost tracking
    current_charges DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Current accumulated charges',
    estimated_total DECIMAL(10, 2) NOT NULL COMMENT 'Estimated total cost',
    last_cost_update DATETIME NOT NULL COMMENT 'Last time cost was calculated',
    
    -- Location tracking
    current_latitude DECIMAL(10, 8) NULL COMMENT 'Current vehicle latitude',
    current_longitude DECIMAL(11, 8) NULL COMMENT 'Current vehicle longitude',
    last_location_update DATETIME NULL COMMENT 'Last GPS update time',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE COMMENT 'Whether trip is currently active',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_trip_tracking_booking (booking_id),
    INDEX idx_trip_tracking_user_active (user_id, is_active),
    INDEX idx_trip_tracking_vehicle_active (vehicle_id, is_active),
    INDEX idx_trip_tracking_scheduled_end (scheduled_end_time, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### VehicleStatus Table (New)

Store current vehicle status for active trips:

```sql
CREATE TABLE VehicleStatus (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NULL COMMENT 'Current active booking if any',
    
    -- Lock status
    is_locked BOOLEAN DEFAULT TRUE COMMENT 'Whether vehicle is locked',
    last_lock_command DATETIME NULL COMMENT 'Last lock/unlock command time',
    
    -- Fuel/Battery
    fuel_level INT NULL COMMENT 'Fuel level percentage (0-100)',
    battery_level INT NULL COMMENT 'Battery level percentage for EVs (0-100)',
    
    -- Odometer
    odometer_reading INT NULL COMMENT 'Current odometer reading in km',
    
    -- Capabilities
    supports_remote_lock BOOLEAN DEFAULT FALSE,
    supports_remote_unlock BOOLEAN DEFAULT FALSE,
    supports_horn BOOLEAN DEFAULT FALSE,
    supports_lights BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    last_status_update DATETIME NOT NULL COMMENT 'Last telematics update',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE SET NULL,
    
    -- Indexes
    UNIQUE INDEX idx_vehicle_status_vehicle (vehicle_id),
    INDEX idx_vehicle_status_booking (booking_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### VehicleControlLog Table (New)

Audit log for vehicle control commands:

```sql
CREATE TABLE VehicleControlLog (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    vehicle_id BIGINT UNSIGNED NOT NULL,
    booking_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Command details
    action ENUM('lock', 'unlock', 'horn', 'lights') NOT NULL,
    success BOOLEAN NOT NULL COMMENT 'Whether command succeeded',
    error_message VARCHAR(500) NULL COMMENT 'Error message if failed',
    
    -- Metadata
    ip_address VARCHAR(45) NULL COMMENT 'User IP address',
    user_agent VARCHAR(500) NULL COMMENT 'User agent string',
    
    -- Timestamps
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (vehicle_id) REFERENCES Vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES Bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_control_log_vehicle (vehicle_id, executed_at),
    INDEX idx_control_log_booking (booking_id, executed_at),
    INDEX idx_control_log_user (user_id, executed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### BookingExports Table (New)

Track booking history export requests:

```sql
CREATE TABLE BookingExports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    
    -- Export parameters
    format ENUM('csv', 'pdf', 'excel') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    include_status JSON NULL COMMENT 'Array of statuses included',
    detailed BOOLEAN DEFAULT FALSE,
    
    -- File information
    file_url VARCHAR(500) NULL COMMENT 'CDN URL of generated file',
    file_size INT NULL COMMENT 'File size in bytes',
    expires_at DATETIME NOT NULL COMMENT 'When file will be deleted',
    
    -- Status
    status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
    error_message VARCHAR(500) NULL,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    
    -- Foreign keys
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Indexes
    INDEX idx_exports_user_created (user_id, created_at),
    INDEX idx_exports_expires (expires_at, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Key Queries

#### Query 1: Get Booking History with Filters

```sql
SELECT 
    b.id AS booking_id,
    b.booking_reference,
    b.status,
    b.pickup_date,
    b.return_date,
    b.actual_pickup_time,
    b.actual_return_time,
    b.total_cost,
    b.currency,
    b.created_at,
    b.updated_at,
    
    -- Vehicle information
    v.id AS vehicle_id,
    v.name AS vehicle_name,
    v.type AS vehicle_type,
    v.image_url AS vehicle_image,
    v.license_plate,
    
    -- Location information
    pl.name AS pickup_location_name,
    pl.address AS pickup_address,
    rl.name AS return_location_name,
    rl.address AS return_address,
    
    -- Supplier information
    s.id AS supplier_id,
    s.name AS supplier_name,
    s.logo_url AS supplier_logo,
    
    -- Pricing breakdown
    b.base_rate,
    b.insurance_cost,
    b.extras_cost,
    b.tax_amount,
    b.fees_amount,
    b.discount_amount
    
FROM Bookings b
INNER JOIN Vehicles v ON b.vehicle_id = v.id
INNER JOIN Locations pl ON b.pickup_location_id = pl.id
INNER JOIN Locations rl ON b.return_location_id = rl.id
INNER JOIN Suppliers s ON v.supplier_id = s.id

WHERE b.user_id = ? -- User ID parameter
    AND (@status IS NULL OR b.status IN (@status)) -- Status filter
    AND (@start_date IS NULL OR b.pickup_date >= @start_date) -- Date range start
    AND (@end_date IS NULL OR b.pickup_date <= @end_date) -- Date range end
    AND (@supplier_id IS NULL OR s.id IN (@supplier_id)) -- Supplier filter
    AND (@vehicle_type IS NULL OR v.type IN (@vehicle_type)) -- Vehicle type filter
    AND (@search IS NULL OR 
         b.booking_reference LIKE CONCAT('%', @search, '%') OR
         v.name LIKE CONCAT('%', @search, '%') OR
         pl.name LIKE CONCAT('%', @search, '%') OR
         rl.name LIKE CONCAT('%', @search, '%'))

ORDER BY 
    CASE WHEN @sort_by = 'createdAt' AND @sort_order = 'desc' THEN b.created_at END DESC,
    CASE WHEN @sort_by = 'createdAt' AND @sort_order = 'asc' THEN b.created_at END ASC,
    CASE WHEN @sort_by = 'pickupDate' AND @sort_order = 'desc' THEN b.pickup_date END DESC,
    CASE WHEN @sort_by = 'pickupDate' AND @sort_order = 'asc' THEN b.pickup_date END ASC,
    CASE WHEN @sort_by = 'totalCost' AND @sort_order = 'desc' THEN b.total_cost END DESC,
    CASE WHEN @sort_by = 'totalCost' AND @sort_order = 'asc' THEN b.total_cost END ASC

LIMIT @limit OFFSET @offset;
```

#### Query 2: Get Active Trip Information

```sql
SELECT 
    b.id AS booking_id,
    b.booking_reference,
    b.trip_status,
    
    -- Vehicle information
    v.id AS vehicle_id,
    v.name AS vehicle_name,
    v.type AS vehicle_type,
    v.image_url AS vehicle_image,
    v.license_plate,
    
    -- Trip tracking
    tt.trip_start_time,
    tt.scheduled_end_time,
    tt.current_charges,
    tt.estimated_total,
    tt.last_cost_update,
    tt.current_latitude,
    tt.current_longitude,
    tt.last_location_update,
    
    -- Vehicle status
    vs.is_locked,
    vs.fuel_level,
    vs.battery_level,
    vs.odometer_reading,
    vs.supports_remote_lock,
    vs.supports_remote_unlock,
    vs.supports_horn,
    vs.supports_lights,
    vs.last_status_update,
    
    -- Location information
    pl.name AS pickup_location_name,
    pl.address AS pickup_address,
    pl.latitude AS pickup_latitude,
    pl.longitude AS pickup_longitude,
    rl.name AS return_location_name,
    rl.address AS return_address,
    rl.latitude AS return_latitude,
    rl.longitude AS return_longitude,
    
    -- Timing calculations
    TIMESTAMPDIFF(MINUTE, tt.trip_start_time, NOW()) AS elapsed_minutes,
    TIMESTAMPDIFF(MINUTE, NOW(), tt.scheduled_end_time) AS remaining_minutes,
    b.grace_period_minutes
    
FROM Bookings b
INNER JOIN TripTracking tt ON b.id = tt.booking_id AND tt.is_active = TRUE
INNER JOIN Vehicles v ON b.vehicle_id = v.id
LEFT JOIN VehicleStatus vs ON v.id = vs.vehicle_id
INNER JOIN Locations pl ON b.pickup_location_id = pl.id
INNER JOIN Locations rl ON b.return_location_id = rl.id

WHERE b.user_id = ? -- User ID parameter
    AND b.trip_status = 'in_progress'
    AND tt.is_active = TRUE

LIMIT 1;
```

#### Query 3: Count Bookings by Status

```sql
SELECT 
    status,
    COUNT(*) AS count
FROM Bookings
WHERE user_id = ?
GROUP BY status;
```

#### Query 4: Update Trip Extension

```sql
-- Start transaction
START TRANSACTION;

-- Update booking return time
UPDATE Bookings
SET 
    return_date = @new_return_time,
    total_cost = total_cost + @additional_cost,
    extension_count = extension_count + 1,
    last_extended_at = NOW(),
    updated_at = NOW()
WHERE id = @booking_id
    AND user_id = @user_id
    AND trip_status = 'in_progress';

-- Update trip tracking
UPDATE TripTracking
SET 
    scheduled_end_time = @new_return_time,
    estimated_total = estimated_total + @additional_cost,
    updated_at = NOW()
WHERE booking_id = @booking_id
    AND is_active = TRUE;

-- Commit transaction
COMMIT;
```

#### Query 5: Log Vehicle Control Command

```sql
INSERT INTO VehicleControlLog (
    vehicle_id,
    booking_id,
    user_id,
    action,
    success,
    error_message,
    ip_address,
    user_agent,
    executed_at
) VALUES (
    @vehicle_id,
    @booking_id,
    @user_id,
    @action,
    @success,
    @error_message,
    @ip_address,
    @user_agent,
    NOW()
);
```

#### Query 6: Update Vehicle Status

```sql
UPDATE VehicleStatus
SET 
    is_locked = @is_locked,
    last_lock_command = CASE WHEN @action IN ('lock', 'unlock') THEN NOW() ELSE last_lock_command END,
    fuel_level = COALESCE(@fuel_level, fuel_level),
    battery_level = COALESCE(@battery_level, battery_level),
    odometer_reading = COALESCE(@odometer_reading, odometer_reading),
    last_status_update = NOW(),
    updated_at = NOW()
WHERE vehicle_id = @vehicle_id;
```

#### Query 7: Create Export Request

```sql
INSERT INTO BookingExports (
    user_id,
    format,
    start_date,
    end_date,
    include_status,
    detailed,
    expires_at,
    status,
    created_at
) VALUES (
    @user_id,
    @format,
    @start_date,
    @end_date,
    @include_status,
    @detailed,
    DATE_ADD(NOW(), INTERVAL 24 HOUR),
    'pending',
    NOW()
);
```

#### Query 8: Get Bookings for Export

```sql
SELECT 
    b.*,
    v.name AS vehicle_name,
    v.type AS vehicle_type,
    pl.name AS pickup_location,
    rl.name AS return_location,
    s.name AS supplier_name
FROM Bookings b
INNER JOIN Vehicles v ON b.vehicle_id = v.id
INNER JOIN Locations pl ON b.pickup_location_id = pl.id
INNER JOIN Locations rl ON b.return_location_id = rl.id
INNER JOIN Suppliers s ON v.supplier_id = s.id
WHERE b.user_id = @user_id
    AND b.pickup_date BETWEEN @start_date AND @end_date
    AND (@include_status IS NULL OR b.status IN (@include_status))
ORDER BY b.pickup_date DESC;
```

### Relationships

```
Users (1) ----< (N) Bookings
Bookings (1) ----< (1) TripTracking
Bookings (N) ----< (1) Vehicles
Vehicles (1) ----< (1) VehicleStatus
Vehicles (1) ----< (N) VehicleControlLog
Bookings (N) ----< (1) Locations (pickup)
Bookings (N) ----< (1) Locations (return)
Vehicles (N) ----< (1) Suppliers
Users (1) ----< (N) BookingExports
Users (1) ----< (N) VehicleControlLog
```

### Indexes

#### Performance Indexes
- `idx_bookings_user_status`: Fast filtering by user and status
- `idx_bookings_user_pickup_date`: Fast date range queries
- `idx_bookings_user_created_at`: Fast sorting by creation date
- `idx_bookings_trip_status`: Fast active trip lookups
- `idx_trip_tracking_user_active`: Fast active trip queries per user
- `idx_vehicle_status_vehicle`: Fast vehicle status lookups
- `idx_control_log_vehicle`: Fast audit log queries

#### Search Indexes
- `idx_bookings_search`: Full-text search on booking reference and notes

### Data Integrity Constraints

- Booking must belong to a valid user
- Trip tracking must reference valid booking, vehicle, and user
- Vehicle status must reference valid vehicle
- Control log must reference valid vehicle, booking, and user
- Export request must reference valid user
- Actual pickup time must be before actual return time
- Scheduled end time must be after trip start time
- Current charges must be non-negative
- Fuel and battery levels must be between 0 and 100

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 for full Unicode support
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **Transactions**: ACID-compliant transactions for data consistency
- **Indexes**: B-tree indexes for fast lookups, full-text indexes for search

## Implementation Notes

### Migration Strategy
1. Create new tables (TripTracking, VehicleStatus, VehicleControlLog, BookingExports)
2. Add new columns to Bookings table
3. Create indexes on existing and new columns
4. Backfill trip_status for existing bookings based on dates
5. Test queries with production-like data volume

### Performance Considerations
- Use covering indexes where possible to avoid table lookups
- Partition TripTracking and VehicleControlLog tables by date for large datasets
- Archive old booking data to separate tables after 2 years
- Use query result caching for common filter combinations
- Monitor slow query log and optimize problematic queries
- Consider read replicas for reporting queries

### Data Retention
- Keep all booking records indefinitely for audit purposes
- Archive trip tracking data older than 1 year to cold storage
- Delete vehicle control logs older than 2 years
- Delete expired export files after 24 hours
- Soft delete bookings (set deleted_at) rather than hard delete

### Backup and Recovery
- Daily full backups of all tables
- Point-in-time recovery capability
- Replicate to standby database for high availability
- Test restore procedures monthly

### Monitoring
- Monitor query execution times
- Track index usage and identify unused indexes
- Monitor table sizes and growth rates
- Alert on slow queries (> 1 second)
- Track connection pool usage

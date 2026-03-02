# Feature: Granular Multi-Criteria Filtering (Database)

## Overview

The database schema and optimization strategy for Granular Multi-Criteria Filtering supports efficient querying across multiple vehicle attributes, features, and relationships. The design emphasizes query performance through strategic indexing, normalized data structures for flexibility, and optimized join patterns. The schema accommodates complex filter combinations while maintaining sub-second query response times even with large vehicle inventories and high concurrent user loads.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-004

## Database Design Principles

### Normalization Strategy
- Vehicle attributes stored in main vehicles table for query performance
- Features normalized into separate tables with junction table for flexibility
- Accessibility features in dedicated table for specialized querying
- Supplier information normalized to avoid duplication

### Indexing Strategy
- Single-column indexes on frequently filtered attributes
- Composite indexes for common filter combinations
- Covering indexes to avoid table lookups
- Full-text indexes for search capabilities

### Query Optimization
- Denormalized rating data for performance (calculated from reviews)
- Materialized views for complex aggregations (optional)
- Partitioning strategy for large tables (future consideration)

## Schema Changes

### Vehicles Table Enhancements

**Purpose**: Ensure all filterable attributes are present and indexed

```sql
-- Add filter-relevant columns if not present
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) NOT NULL DEFAULT 'gasoline',
ADD COLUMN IF NOT EXISTS transmission VARCHAR(20) NOT NULL DEFAULT 'automatic',
ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'economy',
ADD COLUMN IF NOT EXISTS seats INT NOT NULL DEFAULT 5,
ADD COLUMN IF NOT EXISTS doors INT NOT NULL DEFAULT 4,
ADD COLUMN IF NOT EXISTS fuel_policy VARCHAR(50) DEFAULT 'full-to-full',
ADD COLUMN IF NOT EXISTS mileage_type VARCHAR(20) DEFAULT 'unlimited',
ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS supplier_id CHAR(36) NOT NULL,
ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS booking_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add constraints
ALTER TABLE vehicles
ADD CONSTRAINT chk_seats CHECK (seats >= 2 AND seats <= 15),
ADD CONSTRAINT chk_doors CHECK (doors IN (2, 3, 4, 5)),
ADD CONSTRAINT chk_daily_rate CHECK (daily_rate >= 0),
ADD CONSTRAINT chk_average_rating CHECK (average_rating >= 0 AND average_rating <= 5),
ADD CONSTRAINT chk_fuel_type CHECK (fuel_type IN ('diesel', 'gasoline', 'electric', 'hybrid', 'plugin-hybrid')),
ADD CONSTRAINT chk_transmission CHECK (transmission IN ('manual', 'automatic')),
ADD CONSTRAINT chk_mileage_type CHECK (mileage_type IN ('unlimited', 'limited'));

-- Add foreign key if not exists
ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) 
ON DELETE RESTRICT ON UPDATE CASCADE;
```

### New Tables

#### Features Reference Table

**Purpose**: Master list of all available vehicle features

```sql
CREATE TABLE IF NOT EXISTS features (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  icon_url VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_features_category (category),
  INDEX idx_features_display_order (display_order),
  INDEX idx_features_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert standard features
INSERT INTO features (code, name, category, display_order) VALUES
('apple-carplay', 'Apple CarPlay', 'connectivity', 1),
('android-auto', 'Android Auto', 'connectivity', 2),
('heated-seats', 'Heated Seats', 'comfort', 3),
('isofix', 'Isofix Child Seat Points', 'safety', 4),
('gps', 'GPS Navigation', 'navigation', 5),
('bluetooth', 'Bluetooth', 'connectivity', 6),
('touchscreen', 'Touchscreen', 'technology', 7),
('backup-camera', 'Backup Camera', 'safety', 8),
('sunroof', 'Sunroof', 'comfort', 9),
('leather-seats', 'Leather Seats', 'comfort', 10),
('cruise-control', 'Cruise Control', 'convenience', 11),
('parking-sensors', 'Parking Sensors', 'safety', 12),
('keyless-entry', 'Keyless Entry', 'convenience', 13),
('usb-ports', 'USB Charging Ports', 'connectivity', 14),
('wifi-hotspot', 'WiFi Hotspot', 'connectivity', 15)
ON DUPLICATE KEY UPDATE 
  name = VALUES(name),
  category = VALUES(category),
  display_order = VALUES(display_order);
```

#### Vehicle Features Junction Table

**Purpose**: Many-to-many relationship between vehicles and features

```sql
CREATE TABLE IF NOT EXISTS vehicle_features (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  feature_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (feature_code) REFERENCES features(code) ON DELETE CASCADE,
  
  UNIQUE KEY unique_vehicle_feature (vehicle_id, feature_code),
  INDEX idx_vehicle_features_vehicle_id (vehicle_id),
  INDEX idx_vehicle_features_feature_code (feature_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Accessibility Features Table

**Purpose**: Specialized accessibility features for vehicles

```sql
CREATE TABLE IF NOT EXISTS accessibility_features (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  feature_type VARCHAR(50) NOT NULL,
  description TEXT,
  certification_number VARCHAR(100),
  verified_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  
  INDEX idx_accessibility_vehicle_id (vehicle_id),
  INDEX idx_accessibility_feature_type (feature_type),
  
  CONSTRAINT chk_feature_type CHECK (feature_type IN ('hand-controls', 'wheelchair-ramp', 'accessible-modifications', 'hearing-assistance', 'visual-assistance'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Filter Analytics Table

**Purpose**: Track filter usage for optimization and insights

```sql
CREATE TABLE IF NOT EXISTS filter_analytics (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  session_id VARCHAR(100) NOT NULL,
  filter_type VARCHAR(50) NOT NULL,
  filter_value VARCHAR(255) NOT NULL,
  result_count INT,
  execution_time_ms INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_filter_analytics_user_id (user_id),
  INDEX idx_filter_analytics_session_id (session_id),
  INDEX idx_filter_analytics_filter_type (filter_type),
  INDEX idx_filter_analytics_timestamp (timestamp),
  INDEX idx_filter_analytics_composite (filter_type, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Performance Indexes

### Single-Column Indexes

**Purpose**: Optimize individual filter queries

```sql
-- Vehicles table indexes for filtering
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_transmission ON vehicles(transmission);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_seats ON vehicles(seats);
CREATE INDEX IF NOT EXISTS idx_vehicles_doors ON vehicles(doors);
CREATE INDEX IF NOT EXISTS idx_vehicles_daily_rate ON vehicles(daily_rate);
CREATE INDEX IF NOT EXISTS idx_vehicles_supplier_id ON vehicles(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_policy ON vehicles(fuel_policy);
CREATE INDEX IF NOT EXISTS idx_vehicles_mileage_type ON vehicles(mileage_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_average_rating ON vehicles(average_rating);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON vehicles(is_active);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_pet_friendly ON vehicles(is_pet_friendly);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);
```

### Composite Indexes

**Purpose**: Optimize common multi-filter combinations

```sql
-- Common filter combinations
CREATE INDEX IF NOT EXISTS idx_vehicles_category_transmission 
ON vehicles(category, transmission);

CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type_category 
ON vehicles(fuel_type, category);

CREATE INDEX IF NOT EXISTS idx_vehicles_price_category 
ON vehicles(daily_rate, category);

CREATE INDEX IF NOT EXISTS idx_vehicles_seats_doors 
ON vehicles(seats, doors);

CREATE INDEX IF NOT EXISTS idx_vehicles_active_category_price 
ON vehicles(is_active, category, daily_rate);

CREATE INDEX IF NOT EXISTS idx_vehicles_supplier_category 
ON vehicles(supplier_id, category);

CREATE INDEX IF NOT EXISTS idx_vehicles_rating_category 
ON vehicles(average_rating, category);
```

### Covering Indexes

**Purpose**: Include all columns needed for query to avoid table lookups

```sql
-- Covering index for common search queries
CREATE INDEX IF NOT EXISTS idx_vehicles_search_covering ON vehicles(
  is_active,
  category,
  fuel_type,
  transmission,
  daily_rate,
  seats,
  doors,
  supplier_id,
  average_rating,
  id
);
```

### Full-Text Indexes

**Purpose**: Enable text-based search on vehicle descriptions

```sql
-- Full-text search index
CREATE FULLTEXT INDEX IF NOT EXISTS idx_vehicles_fulltext 
ON vehicles(make, model, category);
```

## Relationships

### Entity Relationship Diagram

```
vehicles (1) ----< (M) vehicle_features (M) >---- (1) features
vehicles (1) ----< (M) accessibility_features
vehicles (M) >---- (1) suppliers
vehicles (1) ----< (M) bookings
vehicles (1) ----< (M) reviews
```

### Foreign Key Constraints

```sql
-- Ensure referential integrity
ALTER TABLE vehicle_features
ADD CONSTRAINT fk_vehicle_features_vehicle 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_vehicle_features_feature 
FOREIGN KEY (feature_code) REFERENCES features(code) ON DELETE CASCADE;

ALTER TABLE accessibility_features
ADD CONSTRAINT fk_accessibility_vehicle 
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE;

ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_supplier 
FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE RESTRICT;
```

## Query Optimization

### Example Optimized Filter Query

```sql
-- Complex multi-criteria filter query with optimal performance
SELECT 
  v.id,
  v.make,
  v.model,
  v.year,
  v.category,
  v.fuel_type,
  v.transmission,
  v.seats,
  v.doors,
  v.daily_rate,
  v.fuel_policy,
  v.mileage_type,
  v.average_rating,
  v.review_count,
  v.is_pet_friendly,
  s.name AS supplier_name,
  s.rating AS supplier_rating,
  GROUP_CONCAT(DISTINCT vf.feature_code) AS features,
  GROUP_CONCAT(DISTINCT af.feature_type) AS accessibility_features
FROM vehicles v
INNER JOIN suppliers s ON v.supplier_id = s.id
LEFT JOIN vehicle_features vf ON v.id = vf.vehicle_id
LEFT JOIN accessibility_features af ON v.id = af.vehicle_id
WHERE v.is_active = TRUE
  AND v.fuel_type IN ('electric', 'hybrid')
  AND v.transmission = 'automatic'
  AND v.category IN ('suv', 'luxury')
  AND v.seats >= 5
  AND v.doors IN (4, 5)
  AND v.daily_rate BETWEEN 50.00 AND 150.00
  AND v.mileage_type = 'unlimited'
  AND v.average_rating >= 4.0
  AND v.supplier_id IN ('supplier-uuid-1', 'supplier-uuid-2')
  -- Feature filter: vehicle must have ALL selected features
  AND v.id IN (
    SELECT vehicle_id 
    FROM vehicle_features 
    WHERE feature_code IN ('apple-carplay', 'heated-seats')
    GROUP BY vehicle_id 
    HAVING COUNT(DISTINCT feature_code) = 2
  )
  -- Availability check: exclude vehicles with conflicting bookings
  AND v.id NOT IN (
    SELECT vehicle_id 
    FROM bookings 
    WHERE status NOT IN ('cancelled', 'completed')
      AND pickup_date <= '2026-03-20 10:00:00'
      AND return_date >= '2026-03-15 10:00:00'
  )
GROUP BY v.id, s.id
ORDER BY v.daily_rate ASC
LIMIT 20 OFFSET 0;
```

### Query Performance Analysis

```sql
-- Analyze query execution plan
EXPLAIN ANALYZE
SELECT v.id, v.make, v.model, v.daily_rate
FROM vehicles v
WHERE v.is_active = TRUE
  AND v.fuel_type = 'electric'
  AND v.transmission = 'automatic'
  AND v.daily_rate BETWEEN 50 AND 150
ORDER BY v.daily_rate ASC
LIMIT 20;
```

### Index Usage Monitoring

```sql
-- Check index usage statistics
SELECT 
  TABLE_NAME,
  INDEX_NAME,
  SEQ_IN_INDEX,
  COLUMN_NAME,
  CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'car_rental_db'
  AND TABLE_NAME = 'vehicles'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Identify unused indexes
SELECT 
  s.TABLE_NAME,
  s.INDEX_NAME,
  s.CARDINALITY
FROM information_schema.STATISTICS s
LEFT JOIN information_schema.INDEX_STATISTICS i
  ON s.TABLE_SCHEMA = i.TABLE_SCHEMA
  AND s.TABLE_NAME = i.TABLE_NAME
  AND s.INDEX_NAME = i.INDEX_NAME
WHERE s.TABLE_SCHEMA = 'car_rental_db'
  AND s.TABLE_NAME = 'vehicles'
  AND i.INDEX_NAME IS NULL;
```

## Data Integrity

### Constraints and Validation

```sql
-- Ensure data quality with constraints
ALTER TABLE vehicles
ADD CONSTRAINT chk_seats_valid CHECK (seats >= 2 AND seats <= 15),
ADD CONSTRAINT chk_doors_valid CHECK (doors IN (2, 3, 4, 5)),
ADD CONSTRAINT chk_daily_rate_positive CHECK (daily_rate >= 0),
ADD CONSTRAINT chk_rating_range CHECK (average_rating >= 0 AND average_rating <= 5),
ADD CONSTRAINT chk_review_count_positive CHECK (review_count >= 0);
```

### Triggers for Denormalized Data

**Purpose**: Automatically update denormalized rating data when reviews change

```sql
DELIMITER //

-- Trigger to update average rating when new review is added
CREATE TRIGGER trg_update_vehicle_rating_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  UPDATE vehicles
  SET 
    average_rating = (
      SELECT AVG(rating) 
      FROM reviews 
      WHERE vehicle_id = NEW.vehicle_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE vehicle_id = NEW.vehicle_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.vehicle_id;
END//

-- Trigger to update average rating when review is updated
CREATE TRIGGER trg_update_vehicle_rating_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  UPDATE vehicles
  SET 
    average_rating = (
      SELECT AVG(rating) 
      FROM reviews 
      WHERE vehicle_id = NEW.vehicle_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.vehicle_id;
END//

-- Trigger to update average rating when review is deleted
CREATE TRIGGER trg_update_vehicle_rating_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
  UPDATE vehicles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0) 
      FROM reviews 
      WHERE vehicle_id = OLD.vehicle_id
    ),
    review_count = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE vehicle_id = OLD.vehicle_id
    ),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = OLD.vehicle_id;
END//

DELIMITER ;
```

## Data Migration

### Migrate Existing Data

```sql
-- Update existing vehicles with default values for new columns
UPDATE vehicles 
SET fuel_policy = 'full-to-full' 
WHERE fuel_policy IS NULL;

UPDATE vehicles 
SET mileage_type = 'unlimited' 
WHERE mileage_type IS NULL;

UPDATE vehicles 
SET is_pet_friendly = FALSE 
WHERE is_pet_friendly IS NULL;

UPDATE vehicles 
SET is_active = TRUE 
WHERE is_active IS NULL;

-- Calculate initial average ratings from existing reviews
UPDATE vehicles v
SET 
  average_rating = (
    SELECT COALESCE(AVG(r.rating), 0)
    FROM reviews r
    WHERE r.vehicle_id = v.id
  ),
  review_count = (
    SELECT COUNT(*)
    FROM reviews r
    WHERE r.vehicle_id = v.id
  );

-- Calculate booking counts
UPDATE vehicles v
SET booking_count = (
  SELECT COUNT(*)
  FROM bookings b
  WHERE b.vehicle_id = v.id
    AND b.status = 'completed'
);
```

### Populate Vehicle Features

```sql
-- Example: Migrate features from JSON column to normalized structure
-- (Assuming features were previously stored as JSON in vehicles table)

INSERT INTO vehicle_features (vehicle_id, feature_code)
SELECT 
  v.id,
  f.code
FROM vehicles v
CROSS JOIN features f
WHERE JSON_CONTAINS(v.features_json, CONCAT('"', f.code, '"'))
ON DUPLICATE KEY UPDATE vehicle_id = vehicle_id;
```

## Maintenance Procedures

### Regular Maintenance Tasks

```sql
-- Optimize tables monthly
OPTIMIZE TABLE vehicles, vehicle_features, accessibility_features, filter_analytics;

-- Analyze tables for query optimizer
ANALYZE TABLE vehicles, vehicle_features, accessibility_features;

-- Update table statistics
ANALYZE TABLE vehicles UPDATE HISTOGRAM ON 
  fuel_type, transmission, category, daily_rate, average_rating;
```

### Archival Strategy

```sql
-- Archive old filter analytics data (older than 1 year)
CREATE TABLE IF NOT EXISTS filter_analytics_archive LIKE filter_analytics;

INSERT INTO filter_analytics_archive
SELECT * FROM filter_analytics
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM filter_analytics
WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## Monitoring Queries

### Performance Monitoring

```sql
-- Identify slow queries related to vehicle filtering
SELECT 
  DIGEST_TEXT,
  COUNT_STAR AS execution_count,
  AVG_TIMER_WAIT / 1000000000000 AS avg_time_seconds,
  MAX_TIMER_WAIT / 1000000000000 AS max_time_seconds
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT LIKE '%vehicles%'
  AND DIGEST_TEXT LIKE '%WHERE%'
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;

-- Check table sizes
SELECT 
  TABLE_NAME,
  ROUND((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb,
  TABLE_ROWS
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'car_rental_db'
  AND TABLE_NAME IN ('vehicles', 'vehicle_features', 'accessibility_features', 'filter_analytics')
ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC;
```

### Filter Usage Analytics

```sql
-- Most popular filter combinations
SELECT 
  filter_type,
  filter_value,
  COUNT(*) AS usage_count,
  AVG(result_count) AS avg_results,
  AVG(execution_time_ms) AS avg_execution_time
FROM filter_analytics
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY filter_type, filter_value
ORDER BY usage_count DESC
LIMIT 20;

-- Filter performance by type
SELECT 
  filter_type,
  COUNT(*) AS total_uses,
  AVG(execution_time_ms) AS avg_time,
  MAX(execution_time_ms) AS max_time,
  AVG(result_count) AS avg_results
FROM filter_analytics
WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY filter_type
ORDER BY avg_time DESC;
```

## Backup and Recovery

### Backup Strategy

```sql
-- Backup critical tables
mysqldump -u root -p car_rental_db \
  vehicles \
  vehicle_features \
  features \
  accessibility_features \
  suppliers \
  > vehicle_filter_backup_$(date +%Y%m%d).sql

-- Backup with compression
mysqldump -u root -p car_rental_db \
  vehicles vehicle_features features accessibility_features \
  | gzip > vehicle_filter_backup_$(date +%Y%m%d).sql.gz
```

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB (ACID compliance, foreign keys, transactions)
- **Character Set**: utf8mb4 (full Unicode support including emojis)
- **Collation**: utf8mb4_unicode_ci (case-insensitive, accent-sensitive)
- **Connection Pooling**: Configured at application layer
- **Replication**: Master-slave for read scaling (optional)

## Implementation Notes

### Index Selection Strategy
Monitor actual query patterns in production and adjust indexes accordingly. Remove unused indexes that add write overhead without query benefits.

### Denormalization Trade-offs
The average_rating and review_count columns are denormalized for query performance. Triggers maintain consistency, but consider eventual consistency if trigger overhead becomes problematic.

### Partitioning Consideration
For very large vehicle inventories (millions of vehicles), consider partitioning the vehicles table by category or supplier_id to improve query performance.

### Read Replicas
For high read loads, implement read replicas and direct filter queries to replicas while writes go to the primary database.

### Query Cache
MySQL 8.0 removed query cache. Use application-level caching (Redis) for frequently executed filter queries instead.

### Future Enhancements
- Implement materialized views for complex aggregations
- Add spatial indexes for location-based filtering
- Consider columnar storage for analytics queries
- Implement change data capture (CDC) for real-time analytics

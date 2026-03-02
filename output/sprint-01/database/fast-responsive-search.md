# Feature: Fast, Responsive Search Experience (Database)

## Overview

The database implementation for the Fast, Responsive Search Experience feature focuses on query optimization, indexing strategies, and schema design to enable sub-second search performance. This implementation leverages MySQL 8.0+ spatial indexes, composite indexes, covering indexes, and query optimization techniques to handle complex search queries with multiple filters efficiently. The database design supports 1000+ concurrent search queries while maintaining response times under 500ms.

## Sprint Category

sprint-01

## Feature ID

F-SD-015

## Database Specifications

### Schema Changes

No new tables required. This feature optimizes existing tables with additional indexes and query patterns.

### Table Definitions

#### Existing Tables (Optimized)

**vehicles**
```sql
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    transmission VARCHAR(20) NOT NULL,
    fuel_type VARCHAR(20) NOT NULL,
    seats INT NOT NULL,
    doors INT NOT NULL,
    price_per_day DECIMAL(10, 2) NOT NULL,
    location_id VARCHAR(36) NOT NULL,
    status ENUM('available', 'rented', 'maintenance', 'retired') NOT NULL DEFAULT 'available',
    rating_average DECIMAL(3, 2) DEFAULT 0.00,
    rating_count INT DEFAULT 0,
    is_eco_friendly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT,
    
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_transmission (transmission),
    INDEX idx_fuel_type (fuel_type),
    INDEX idx_price (price_per_day),
    INDEX idx_rating (rating_average DESC, rating_count DESC),
    INDEX idx_location (location_id),
    INDEX idx_created (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**locations**
```sql
CREATE TABLE locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    geolocation POINT NOT NULL SRID 4326,
    operating_hours JSON,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    SPATIAL INDEX idx_geolocation (geolocation),
    INDEX idx_city_country (city, country),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**bookings**
```sql
CREATE TABLE bookings (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    pickup_date DATETIME NOT NULL,
    return_date DATETIME NOT NULL,
    status ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled') NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    
    INDEX idx_vehicle_dates (vehicle_id, pickup_date, return_date),
    INDEX idx_status (status),
    INDEX idx_dates (pickup_date, return_date),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_features**
```sql
CREATE TABLE vehicle_features (
    vehicle_id VARCHAR(36) NOT NULL,
    feature_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (vehicle_id, feature_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
    
    INDEX idx_feature_vehicle (feature_id, vehicle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**features**
```sql
CREATE TABLE features (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_images**
```sql
CREATE TABLE vehicle_images (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    is_thumbnail BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    
    INDEX idx_vehicle_thumbnail (vehicle_id, is_thumbnail, display_order),
    INDEX idx_vehicle_order (vehicle_id, display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**vehicles → locations**: Many-to-one
- Foreign Key: `vehicles.location_id` → `locations.id`
- Used for: Location-based filtering and distance calculations
- Cardinality: Many vehicles per location

**vehicles → bookings**: One-to-many
- Foreign Key: `bookings.vehicle_id` → `vehicles.id`
- Used for: Availability checking and date range filtering
- Cardinality: Many bookings per vehicle

**vehicles → vehicle_features**: Many-to-many (via junction table)
- Junction table: `vehicle_features`
- Used for: Feature-based filtering
- Cardinality: Many features per vehicle, many vehicles per feature

**vehicles → vehicle_images**: One-to-many
- Foreign Key: `vehicle_images.vehicle_id` → `vehicles.id`
- Used for: Image loading and thumbnail display
- Cardinality: Multiple images per vehicle

### Indexes

#### Critical Performance Indexes

**Composite Index for Common Search Patterns**:
```sql
-- Optimized for: status + location + price + rating queries
CREATE INDEX idx_vehicles_search_composite 
ON vehicles(status, location_id, price_per_day, rating_average DESC);
```

**Spatial Index for Location Queries**:
```sql
-- Optimized for: ST_Distance_Sphere and location radius queries
CREATE SPATIAL INDEX idx_locations_geolocation 
ON locations(geolocation);
```

**Availability Index for Date Range Queries**:
```sql
-- Optimized for: booking overlap detection
CREATE INDEX idx_bookings_availability 
ON bookings(vehicle_id, status, pickup_date, return_date);
```

**Feature Lookup Index**:
```sql
-- Optimized for: feature filtering (reverse lookup)
CREATE INDEX idx_vehicle_features_feature_lookup 
ON vehicle_features(feature_id, vehicle_id);
```

**Covering Index for Thumbnail Images**:
```sql
-- Optimized for: thumbnail retrieval without table access
CREATE INDEX idx_vehicle_images_thumbnail_covering 
ON vehicle_images(vehicle_id, is_thumbnail, image_url, display_order);
```

**Price Range Index**:
```sql
-- Optimized for: price filtering and sorting
CREATE INDEX idx_vehicles_price_range 
ON vehicles(price_per_day ASC, status, category);
```

**Rating Index**:
```sql
-- Optimized for: rating filtering and sorting
CREATE INDEX idx_vehicles_rating_sort 
ON vehicles(rating_average DESC, rating_count DESC, status);
```

**Category and Transmission Index**:
```sql
-- Optimized for: vehicle type and transmission filtering
CREATE INDEX idx_vehicles_category_transmission 
ON vehicles(category, transmission, status);
```

**Fuel Type Index**:
```sql
-- Optimized for: fuel type filtering
CREATE INDEX idx_vehicles_fuel_type_status 
ON vehicles(fuel_type, status);
```

**Location City Index**:
```sql
-- Optimized for: city-based location searches
CREATE INDEX idx_locations_city_active 
ON locations(city, country, is_active);
```

### Query Optimization

#### Main Search Query

**Optimized Search Query with All Filters**:
```sql
SELECT 
    v.id,
    v.name,
    v.make,
    v.model,
    v.year,
    v.category,
    v.transmission,
    v.fuel_type,
    v.seats,
    v.doors,
    v.price_per_day,
    v.rating_average,
    v.rating_count,
    v.is_eco_friendly,
    l.id AS location_id,
    l.name AS location_name,
    l.address AS location_address,
    l.latitude,
    l.longitude,
    ST_Distance_Sphere(
        POINT(l.longitude, l.latitude),
        POINT(?, ?)
    ) / 1000 AS distance_km,
    (
        SELECT image_url 
        FROM vehicle_images 
        WHERE vehicle_id = v.id 
          AND is_thumbnail = 1 
        ORDER BY display_order ASC 
        LIMIT 1
    ) AS thumbnail_url
FROM vehicles v
INNER JOIN locations l ON v.location_id = l.id
WHERE v.status = 'available'
  -- Date range availability filter (most selective)
  AND v.id NOT IN (
      SELECT vehicle_id 
      FROM bookings 
      WHERE status IN ('confirmed', 'active')
        AND pickup_date < ?
        AND return_date > ?
  )
  -- Location radius filter (spatial index)
  AND ST_Distance_Sphere(
      POINT(l.longitude, l.latitude),
      POINT(?, ?)
  ) / 1000 <= ?
  -- Price range filter (indexed)
  AND v.price_per_day BETWEEN ? AND ?
  -- Category filter (indexed)
  AND v.category IN (?, ?, ?)
  -- Transmission filter (indexed)
  AND v.transmission IN (?, ?)
  -- Fuel type filter (indexed)
  AND v.fuel_type IN (?, ?)
  -- Rating filter (indexed)
  AND v.rating_average >= ?
  -- Seat capacity filter
  AND v.seats BETWEEN ? AND ?
  -- Feature filter (subquery for multiple features)
  AND (
      SELECT COUNT(DISTINCT vf.feature_id)
      FROM vehicle_features vf
      INNER JOIN features f ON vf.feature_id = f.id
      WHERE vf.vehicle_id = v.id
        AND f.code IN (?, ?, ?)
  ) = ?
ORDER BY distance_km ASC, v.rating_average DESC
LIMIT ? OFFSET ?;
```

**Query Execution Plan Analysis**:
```sql
EXPLAIN ANALYZE
SELECT ...
-- Expected execution plan:
-- 1. Index scan on vehicles using idx_vehicles_search_composite
-- 2. Spatial index scan on locations using idx_locations_geolocation
-- 3. Index scan on bookings using idx_bookings_availability
-- 4. Nested loop join with index lookups
-- 5. Filesort for ORDER BY (unavoidable with distance calculation)
```

#### Result Count Query

**Optimized Count Query** (without fetching data):
```sql
SELECT COUNT(DISTINCT v.id) AS total_count
FROM vehicles v
INNER JOIN locations l ON v.location_id = l.id
WHERE v.status = 'available'
  AND v.id NOT IN (
      SELECT vehicle_id 
      FROM bookings 
      WHERE status IN ('confirmed', 'active')
        AND pickup_date < ?
        AND return_date > ?
  )
  AND ST_Distance_Sphere(
      POINT(l.longitude, l.latitude),
      POINT(?, ?)
  ) / 1000 <= ?
  AND v.price_per_day BETWEEN ? AND ?
  AND v.category IN (?, ?, ?)
  AND v.transmission IN (?, ?)
  AND v.fuel_type IN (?, ?)
  AND v.rating_average >= ?
  AND v.seats BETWEEN ? AND ?;
```

#### Alternative Date Suggestions Query

**Find Available Dates Near Requested Range**:
```sql
-- Find dates with availability in the next 30 days
SELECT 
    DATE_ADD(?, INTERVAL day_offset DAY) AS suggested_pickup_date,
    DATE_ADD(?, INTERVAL day_offset DAY) AS suggested_return_date,
    COUNT(DISTINCT v.id) AS available_vehicles
FROM 
    (SELECT 0 AS day_offset UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 
     UNION SELECT 7 UNION SELECT 14 UNION SELECT 21 UNION SELECT 28) AS offsets
CROSS JOIN vehicles v
INNER JOIN locations l ON v.location_id = l.id
WHERE v.status = 'available'
  AND ST_Distance_Sphere(
      POINT(l.longitude, l.latitude),
      POINT(?, ?)
  ) / 1000 <= ?
  AND v.id NOT IN (
      SELECT vehicle_id 
      FROM bookings 
      WHERE status IN ('confirmed', 'active')
        AND pickup_date < DATE_ADD(?, INTERVAL day_offset + ? DAY)
        AND return_date > DATE_ADD(?, INTERVAL day_offset DAY)
  )
GROUP BY day_offset
HAVING available_vehicles > 0
ORDER BY day_offset ASC
LIMIT 5;
```

#### Nearby Location Suggestions Query

**Find Locations with Availability**:
```sql
SELECT 
    l.id,
    l.name,
    l.city,
    ST_Distance_Sphere(
        POINT(l.longitude, l.latitude),
        POINT(?, ?)
    ) / 1000 AS distance_km,
    COUNT(DISTINCT v.id) AS available_vehicles
FROM locations l
INNER JOIN vehicles v ON v.location_id = l.id
WHERE l.is_active = TRUE
  AND l.id != ?  -- Exclude original location
  AND ST_Distance_Sphere(
      POINT(l.longitude, l.latitude),
      POINT(?, ?)
  ) / 1000 BETWEEN ? AND ?  -- Between original radius and 100km
  AND v.status = 'available'
  AND v.id NOT IN (
      SELECT vehicle_id 
      FROM bookings 
      WHERE status IN ('confirmed', 'active')
        AND pickup_date < ?
        AND return_date > ?
  )
GROUP BY l.id, l.name, l.city, distance_km
HAVING available_vehicles > 0
ORDER BY distance_km ASC
LIMIT 5;
```

### Performance Optimization Techniques

#### Query Optimization Settings

**MySQL Configuration for Search Performance**:
```sql
-- Increase query cache size (if using MySQL < 8.0)
SET GLOBAL query_cache_size = 268435456;  -- 256MB
SET GLOBAL query_cache_type = 1;

-- Optimize InnoDB buffer pool
SET GLOBAL innodb_buffer_pool_size = 8589934592;  -- 8GB

-- Optimize join buffer
SET GLOBAL join_buffer_size = 16777216;  -- 16MB

-- Optimize sort buffer
SET GLOBAL sort_buffer_size = 16777216;  -- 16MB

-- Enable parallel query execution (MySQL 8.0+)
SET GLOBAL innodb_parallel_read_threads = 4;

-- Optimize spatial index
SET GLOBAL innodb_ft_min_token_size = 1;
```

#### Index Hints

**Force Index Usage for Critical Queries**:
```sql
SELECT ...
FROM vehicles v FORCE INDEX (idx_vehicles_search_composite)
INNER JOIN locations l FORCE INDEX (idx_locations_geolocation)
WHERE ...
```

#### Partitioning Strategy

**Partition Bookings Table by Date** (for large datasets):
```sql
ALTER TABLE bookings
PARTITION BY RANGE (YEAR(pickup_date)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p2027 VALUES LESS THAN (2028),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

#### Materialized Views

**Create Materialized View for Vehicle Availability** (MySQL 8.0+):
```sql
-- Note: MySQL doesn't support materialized views natively
-- Use a regular table with scheduled refresh instead

CREATE TABLE vehicle_availability_cache (
    vehicle_id VARCHAR(36) PRIMARY KEY,
    next_available_date DATETIME,
    is_currently_available BOOLEAN,
    upcoming_bookings_count INT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
    INDEX idx_available (is_currently_available, next_available_date)
) ENGINE=InnoDB;

-- Refresh procedure (run every 5 minutes)
DELIMITER //
CREATE PROCEDURE refresh_vehicle_availability()
BEGIN
    TRUNCATE TABLE vehicle_availability_cache;
    
    INSERT INTO vehicle_availability_cache (
        vehicle_id,
        next_available_date,
        is_currently_available,
        upcoming_bookings_count
    )
    SELECT 
        v.id,
        COALESCE(MIN(b.return_date), NOW()) AS next_available_date,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM bookings 
                WHERE vehicle_id = v.id 
                  AND status IN ('confirmed', 'active')
                  AND pickup_date <= NOW()
                  AND return_date >= NOW()
            ) THEN FALSE
            ELSE TRUE
        END AS is_currently_available,
        COUNT(b.id) AS upcoming_bookings_count
    FROM vehicles v
    LEFT JOIN bookings b ON b.vehicle_id = v.id 
        AND b.status IN ('confirmed', 'active')
        AND b.pickup_date > NOW()
    WHERE v.status = 'available'
    GROUP BY v.id;
END //
DELIMITER ;

-- Schedule refresh
CREATE EVENT refresh_availability_cache
ON SCHEDULE EVERY 5 MINUTE
DO CALL refresh_vehicle_availability();
```

### Database Monitoring

#### Slow Query Log

**Enable and Configure Slow Query Log**:
```sql
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 1;  -- Log queries taking > 1 second
SET GLOBAL log_queries_not_using_indexes = 'ON';
```

#### Performance Schema

**Monitor Search Query Performance**:
```sql
-- Enable performance schema
SET GLOBAL performance_schema = ON;

-- Monitor statement execution
SELECT 
    DIGEST_TEXT,
    COUNT_STAR AS execution_count,
    AVG_TIMER_WAIT / 1000000000 AS avg_time_ms,
    MAX_TIMER_WAIT / 1000000000 AS max_time_ms,
    SUM_ROWS_EXAMINED AS total_rows_examined,
    SUM_ROWS_SENT AS total_rows_sent
FROM performance_schema.events_statements_summary_by_digest
WHERE DIGEST_TEXT LIKE '%vehicles%'
ORDER BY AVG_TIMER_WAIT DESC
LIMIT 10;
```

#### Index Usage Statistics

**Monitor Index Effectiveness**:
```sql
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    CARDINALITY,
    SEQ_IN_INDEX,
    COLUMN_NAME
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'car_rental'
  AND TABLE_NAME IN ('vehicles', 'locations', 'bookings', 'vehicle_features')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;
```

### Backup and Maintenance

#### Regular Maintenance Tasks

**Optimize Tables Weekly**:
```sql
-- Optimize vehicles table
OPTIMIZE TABLE vehicles;

-- Analyze tables for query optimizer
ANALYZE TABLE vehicles, locations, bookings, vehicle_features;

-- Update table statistics
ANALYZE TABLE vehicles UPDATE HISTOGRAM ON 
    price_per_day, rating_average, seats;
```

**Rebuild Spatial Indexes Monthly**:
```sql
ALTER TABLE locations DROP INDEX idx_geolocation;
ALTER TABLE locations ADD SPATIAL INDEX idx_geolocation (geolocation);
```

### Data Integrity

#### Constraints and Triggers

**Ensure Rating Consistency**:
```sql
DELIMITER //
CREATE TRIGGER update_vehicle_rating_after_review
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
    UPDATE vehicles
    SET 
        rating_average = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE vehicle_id = NEW.vehicle_id
        ),
        rating_count = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE vehicle_id = NEW.vehicle_id
        )
    WHERE id = NEW.vehicle_id;
END //
DELIMITER ;
```

**Prevent Overlapping Bookings**:
```sql
DELIMITER //
CREATE TRIGGER prevent_booking_overlap
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    DECLARE overlap_count INT;
    
    SELECT COUNT(*) INTO overlap_count
    FROM bookings
    WHERE vehicle_id = NEW.vehicle_id
      AND status IN ('confirmed', 'active')
      AND pickup_date < NEW.return_date
      AND return_date > NEW.pickup_date;
    
    IF overlap_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Booking dates overlap with existing booking';
    END IF;
END //
DELIMITER ;
```

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Spatial Extensions**: MySQL Spatial Data Types (POINT, GEOMETRY)
- **Indexing**: B-Tree indexes, Spatial indexes, Covering indexes
- **Partitioning**: Range partitioning for bookings table
- **Monitoring**: Performance Schema, Slow Query Log
- **Backup**: mysqldump with point-in-time recovery

## Implementation Notes

### Performance Targets

- Query execution time: < 500ms (p95)
- Index seek operations: < 100ms
- Spatial query time: < 200ms
- Count query time: < 100ms
- Concurrent queries: 1000+

### Testing Strategy

**Query Performance Testing**:
- Benchmark all search queries with EXPLAIN ANALYZE
- Test with 100K+ vehicles in database
- Test with various filter combinations
- Measure index effectiveness
- Test spatial query performance

**Load Testing**:
- 1000 concurrent search queries
- Sustained load for 10 minutes
- Monitor query queue depth
- Monitor buffer pool hit rate
- Monitor disk I/O

### Migration Strategy

**Index Creation** (zero downtime):
```sql
-- Create indexes online (MySQL 8.0+)
ALTER TABLE vehicles 
ADD INDEX idx_vehicles_search_composite (status, location_id, price_per_day, rating_average DESC),
ALGORITHM=INPLACE, LOCK=NONE;
```

### Dependencies

- Existing vehicle, location, booking, and feature tables
- MySQL 8.0+ with spatial extensions enabled
- Sufficient disk space for indexes (estimate 30% of table size)

# Feature: Map-Based Vehicle Discovery - Database

## Overview

Database schema enhancements and queries supporting map-based vehicle discovery with geospatial indexing, viewport queries, and clustering support.

## Sprint Category

nice-to-have (Would be great but not essential)

## Feature ID

F-SD-002: Map-Based Vehicle Discovery

## Dependencies

- F-SD-001: Location-Based Search (locations table and spatial indexes)

## Schema Changes

### Modified Tables

#### vehicles
Add geospatial coordinates for map display.

```sql
ALTER TABLE vehicles
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD SPATIAL INDEX idx_vehicle_coordinates (POINT(latitude, longitude));
```

Note: If vehicles are always at locations, coordinates can be retrieved via JOIN with locations table. This column is optional for performance optimization.

### New Tables

#### vehicle_map_cache
Cache viewport queries for performance.

```sql
CREATE TABLE vehicle_map_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  viewport_hash VARCHAR(64) NOT NULL,
  ne_latitude DECIMAL(10, 8) NOT NULL,
  ne_longitude DECIMAL(11, 8) NOT NULL,
  sw_latitude DECIMAL(10, 8) NOT NULL,
  sw_longitude DECIMAL(11, 8) NOT NULL,
  zoom_level TINYINT,
  filter_hash VARCHAR(64),
  vehicle_data JSON NOT NULL,
  vehicle_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_viewport_hash (viewport_hash),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Table Definitions

### vehicle_map_cache Table

**Purpose**: Cache map viewport queries to improve performance for frequently viewed areas.

**Key Columns**:
- `viewport_hash`: Hash of viewport bounds for cache lookup
- `ne_latitude`, `ne_longitude`: Northeast corner of viewport
- `sw_latitude`, `sw_longitude`: Southwest corner of viewport
- `zoom_level`: Map zoom level when cached
- `filter_hash`: Hash of applied filters
- `vehicle_data`: JSON array of vehicle data
- `expires_at`: Cache expiration timestamp (2 minutes TTL)

**Constraints**:
- Primary key on `cache_id`
- Index on `viewport_hash` for fast lookups
- Index on `expires_at` for cleanup queries

## Indexes

### Geospatial Indexes

```sql
-- Spatial index on vehicle coordinates (if coordinates stored in vehicles table)
SPATIAL INDEX idx_vehicle_coordinates ON vehicles(POINT(latitude, longitude));

-- Spatial index on location coordinates (from F-SD-001)
SPATIAL INDEX idx_location_coordinates ON locations(POINT(latitude, longitude));
```

### Performance Indexes

```sql
-- Composite index for availability and location queries
CREATE INDEX idx_vehicle_availability_location 
ON vehicles(availability_status, current_location_id);

-- Index for vehicle type filtering
CREATE INDEX idx_vehicle_type ON vehicles(vehicle_type);

-- Index for price range filtering
CREATE INDEX idx_price_per_day ON vehicles(price_per_day);
```

## Query Examples

### Viewport-Based Vehicle Query

```sql
-- Find all vehicles within map viewport bounds
SELECT 
  v.vehicle_id,
  v.make,
  v.model,
  v.year,
  v.vehicle_type,
  v.price_per_day,
  v.availability_status,
  l.latitude,
  l.longitude,
  l.street_address,
  l.city,
  l.state_province,
  l.postal_code,
  v.photo_url
FROM vehicles v
INNER JOIN locations l ON v.current_location_id = l.location_id
WHERE 
  v.availability_status = 'available'
  AND l.latitude BETWEEN @sw_latitude AND @ne_latitude
  AND l.longitude BETWEEN @sw_longitude AND @ne_longitude
  AND l.is_active = TRUE
ORDER BY v.price_per_day ASC
LIMIT 500;
```

### Viewport Query with Distance Calculation

```sql
-- Find vehicles in viewport with distance from user
SELECT 
  v.vehicle_id,
  v.make,
  v.model,
  v.vehicle_type,
  v.price_per_day,
  l.latitude,
  l.longitude,
  l.street_address,
  (
    6371 * ACOS(
      COS(RADIANS(@user_latitude)) * COS(RADIANS(l.latitude)) * 
      COS(RADIANS(l.longitude) - RADIANS(@user_longitude)) + 
      SIN(RADIANS(@user_latitude)) * SIN(RADIANS(l.latitude))
    )
  ) AS distance_km
FROM vehicles v
INNER JOIN locations l ON v.current_location_id = l.location_id
WHERE 
  v.availability_status = 'available'
  AND l.latitude BETWEEN @sw_latitude AND @ne_latitude
  AND l.longitude BETWEEN @sw_longitude AND @ne_longitude
  AND l.is_active = TRUE
HAVING distance_km <= @max_distance_km
ORDER BY distance_km ASC
LIMIT 500;
```

### Filtered Viewport Query

```sql
-- Find vehicles in viewport with filters applied
SELECT 
  v.vehicle_id,
  v.make,
  v.model,
  v.vehicle_type,
  v.price_per_day,
  l.latitude,
  l.longitude
FROM vehicles v
INNER JOIN locations l ON v.current_location_id = l.location_id
WHERE 
  v.availability_status = 'available'
  AND l.latitude BETWEEN @sw_latitude AND @ne_latitude
  AND l.longitude BETWEEN @sw_longitude AND @ne_longitude
  AND l.is_active = TRUE
  AND v.vehicle_type IN ('sedan', 'suv', 'van')
  AND v.price_per_day BETWEEN @min_price AND @max_price
  AND v.transmission_type = 'automatic'
ORDER BY v.price_per_day ASC
LIMIT 500;
```

### Clustering Query (Grid-Based)

```sql
-- Group vehicles into grid cells for clustering
SELECT 
  FLOOR(l.latitude / @grid_size) AS grid_lat,
  FLOOR(l.longitude / @grid_size) AS grid_lng,
  COUNT(*) AS vehicle_count,
  AVG(l.latitude) AS center_latitude,
  AVG(l.longitude) AS center_longitude,
  MIN(v.price_per_day) AS min_price,
  MAX(v.price_per_day) AS max_price,
  GROUP_CONCAT(DISTINCT v.vehicle_type) AS vehicle_types
FROM vehicles v
INNER JOIN locations l ON v.current_location_id = l.location_id
WHERE 
  v.availability_status = 'available'
  AND l.latitude BETWEEN @sw_latitude AND @ne_latitude
  AND l.longitude BETWEEN @sw_longitude AND @ne_longitude
  AND l.is_active = TRUE
GROUP BY grid_lat, grid_lng
HAVING vehicle_count >= @cluster_threshold;
```

### Cache Lookup Query

```sql
-- Check if viewport query is cached
SELECT 
  vehicle_data,
  vehicle_count
FROM vehicle_map_cache
WHERE 
  viewport_hash = @viewport_hash
  AND filter_hash = @filter_hash
  AND expires_at > NOW()
LIMIT 1;
```

### Cache Cleanup Query

```sql
-- Remove expired cache entries
DELETE FROM vehicle_map_cache
WHERE expires_at < NOW();
```

## Data Migration

### Migration Script: Add Map Support

```sql
-- Migration: 002_add_map_support.sql
START TRANSACTION;

-- Add coordinates to vehicles table (optional, for performance)
ALTER TABLE vehicles
ADD COLUMN latitude DECIMAL(10, 8),
ADD COLUMN longitude DECIMAL(11, 8),
ADD SPATIAL INDEX idx_vehicle_coordinates (POINT(latitude, longitude));

-- Create vehicle map cache table
CREATE TABLE vehicle_map_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  viewport_hash VARCHAR(64) NOT NULL,
  ne_latitude DECIMAL(10, 8) NOT NULL,
  ne_longitude DECIMAL(11, 8) NOT NULL,
  sw_latitude DECIMAL(10, 8) NOT NULL,
  sw_longitude DECIMAL(11, 8) NOT NULL,
  zoom_level TINYINT,
  filter_hash VARCHAR(64),
  vehicle_data JSON NOT NULL,
  vehicle_count INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_viewport_hash (viewport_hash),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add performance indexes
CREATE INDEX idx_vehicle_availability_location 
ON vehicles(availability_status, current_location_id);

CREATE INDEX idx_vehicle_type ON vehicles(vehicle_type);

CREATE INDEX idx_price_per_day ON vehicles(price_per_day);

COMMIT;
```

### Rollback Script

```sql
-- Rollback: 002_add_map_support_rollback.sql
START TRANSACTION;

-- Remove indexes
DROP INDEX idx_price_per_day ON vehicles;
DROP INDEX idx_vehicle_type ON vehicles;
DROP INDEX idx_vehicle_availability_location ON vehicles;

-- Drop cache table
DROP TABLE IF EXISTS vehicle_map_cache;

-- Remove coordinates from vehicles (if added)
ALTER TABLE vehicles
DROP INDEX idx_vehicle_coordinates,
DROP COLUMN longitude,
DROP COLUMN latitude;

COMMIT;
```

## Performance Considerations

### Query Optimization
- Use bounding box queries (latitude/longitude BETWEEN) before distance calculations
- Limit result sets to prevent performance degradation (max 500 vehicles)
- Use spatial indexes for geospatial queries
- Implement query result caching for popular viewports

### Caching Strategy
- Cache viewport queries for 2 minutes
- Use viewport hash as cache key (includes bounds + filters)
- Implement cache warming for popular areas
- Regular cleanup of expired cache entries (every 5 minutes)

### Index Maintenance
- Regularly analyze and optimize spatial indexes
- Monitor index usage and query performance
- Consider partitioning for very large vehicle datasets

### Data Volume Estimates
- Vehicles: ~10,000 records (small to medium fleet)
- Vehicle_map_cache: ~5,000 records (with 2-minute TTL and cleanup)
- Cache hit rate target: 60-70% for popular areas

## Sample Data

### Sample Vehicle with Coordinates

```sql
-- Vehicle at specific location
INSERT INTO vehicles (
  vehicle_id, make, model, year, vehicle_type, transmission_type,
  price_per_day, availability_status, current_location_id,
  latitude, longitude, photo_url
) VALUES (
  'VEH-12345',
  'Toyota',
  'Camry',
  2024,
  'sedan',
  'automatic',
  45.00,
  'available',
  'LOC-10002',
  34.0522,
  -118.2437,
  'https://cdn.example.com/vehicles/veh-12345.jpg'
);
```

### Sample Cache Entry

```sql
-- Cached viewport query result
INSERT INTO vehicle_map_cache (
  viewport_hash,
  ne_latitude,
  ne_longitude,
  sw_latitude,
  sw_longitude,
  zoom_level,
  filter_hash,
  vehicle_data,
  vehicle_count,
  expires_at
) VALUES (
  'abc123def456',
  34.1000,
  -118.2000,
  34.0000,
  -118.3000,
  12,
  'filter789',
  '[{"vehicleId":"VEH-12345","latitude":34.0522,"longitude":-118.2437,"pricePerDay":45.00}]',
  1,
  DATE_ADD(NOW(), INTERVAL 2 MINUTE)
);
```

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB
- **Spatial Data Types**: POINT, SPATIAL INDEX
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci

## Implementation Notes

### Geospatial Considerations
- Use POINT data type for coordinates
- Spatial indexes significantly improve bounding box queries
- Haversine formula for accurate distance calculations
- Consider Earth's radius: 6371 km

### Coordinate Storage Options
1. **Store in vehicles table**: Better performance, requires sync with locations
2. **JOIN with locations table**: Normalized data, slightly slower queries
3. **Hybrid approach**: Cache coordinates in vehicles, sync periodically

### Cache Management
- Implement automated cleanup job for expired entries
- Monitor cache size and hit rates
- Adjust TTL based on usage patterns
- Consider Redis for distributed caching in production

### Clustering Approach
- Grid-based clustering for simplicity and performance
- Grid size varies by zoom level (larger grid at lower zoom)
- Cluster threshold: 3+ vehicles in same grid cell
- Return individual vehicles when count < threshold

### Backup and Recovery
- Include vehicle_map_cache in backup strategy (optional, can be regenerated)
- Test restore procedures for spatial indexes
- Document recovery procedures

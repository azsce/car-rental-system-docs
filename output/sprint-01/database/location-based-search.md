# Feature: Location-Based Search - Database

## Overview

Database schema and structures supporting location-based vehicle search with hierarchical organization, geospatial indexing, landmark management, and one-way rental configuration.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-001: Location-Based Search
- F-WF-SRCH-001: Location-Based Vehicle Search
- F-FUNC-VS-001: Search by Location

## Schema Changes

### New Tables

#### locations
Stores rental pickup/dropoff locations with geospatial data.

```sql
CREATE TABLE locations (
  location_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  location_type ENUM('airport', 'neighborhood', 'delivery') NOT NULL,
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_landmark BOOLEAN DEFAULT FALSE,
  landmark_type VARCHAR(50),
  parent_location_id VARCHAR(20),
  hierarchy_level ENUM('country', 'state', 'city', 'location') NOT NULL,
  operating_hours JSON,
  contact_phone VARCHAR(20),
  contact_email VARCHAR(100),
  amenities JSON,
  photos JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
  INDEX idx_location_type (location_type),
  INDEX idx_city_country (city, country),
  INDEX idx_is_active (is_active),
  INDEX idx_is_landmark (is_landmark),
  INDEX idx_parent_location (parent_location_id),
  INDEX idx_hierarchy_level (hierarchy_level),
  SPATIAL INDEX idx_coordinates (POINT(latitude, longitude)),
  FULLTEXT INDEX idx_search (name, street_address, city)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### landmarks
Stores landmark information and aliases for enhanced search.

```sql
CREATE TABLE landmarks (
  landmark_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  aliases JSON,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  SPATIAL INDEX idx_landmark_coordinates (POINT(latitude, longitude)),
  FULLTEXT INDEX idx_landmark_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### landmark_locations
Maps landmarks to physical rental locations.

```sql
CREATE TABLE landmark_locations (
  landmark_id VARCHAR(20) NOT NULL,
  location_id VARCHAR(20) NOT NULL,
  distance_km DECIMAL(6, 2),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (landmark_id, location_id),
  FOREIGN KEY (landmark_id) REFERENCES landmarks(landmark_id) ON DELETE CASCADE,
  FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
  INDEX idx_landmark (landmark_id),
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### one_way_rental_fees
Stores one-way rental fee configuration between location pairs.

```sql
CREATE TABLE one_way_rental_fees (
  fee_id INT AUTO_INCREMENT PRIMARY KEY,
  pickup_location_id VARCHAR(20) NOT NULL,
  dropoff_location_id VARCHAR(20) NOT NULL,
  base_fee DECIMAL(10, 2) NOT NULL,
  distance_km DECIMAL(8, 2),
  seasonal_multiplier DECIMAL(4, 2) DEFAULT 1.00,
  effective_from DATE NOT NULL,
  effective_to DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (pickup_location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
  FOREIGN KEY (dropoff_location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
  INDEX idx_pickup_dropoff (pickup_location_id, dropoff_location_id),
  INDEX idx_effective_dates (effective_from, effective_to),
  INDEX idx_is_active (is_active),
  UNIQUE KEY unique_route_dates (pickup_location_id, dropoff_location_id, effective_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### location_search_cache
Caches popular location searches for performance optimization.

```sql
CREATE TABLE location_search_cache (
  cache_id INT AUTO_INCREMENT PRIMARY KEY,
  search_query VARCHAR(200) NOT NULL,
  search_hash VARCHAR(64) NOT NULL,
  results JSON NOT NULL,
  user_latitude DECIMAL(10, 8),
  user_longitude DECIMAL(11, 8),
  hit_count INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_search_hash (search_hash),
  INDEX idx_expires_at (expires_at),
  INDEX idx_hit_count (hit_count)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Modified Tables

#### vehicles
Add location reference for vehicle assignment.

```sql
ALTER TABLE vehicles
ADD COLUMN current_location_id VARCHAR(20),
ADD FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
ADD INDEX idx_current_location (current_location_id);
```

## Table Definitions

### locations Table

**Purpose**: Central repository for all rental locations with geospatial and hierarchical data.

**Key Columns**:
- `location_id`: Unique identifier (format: LOC-XXXXX)
- `name`: Display name of the location
- `location_type`: Type of location (airport, neighborhood, delivery)
- `latitude`, `longitude`: Geospatial coordinates for distance calculations
- `is_landmark`: Flag indicating if location is a notable landmark
- `parent_location_id`: Reference to parent in hierarchy (e.g., city location references state)
- `hierarchy_level`: Level in location hierarchy
- `operating_hours`: JSON object with daily operating hours
- `amenities`: JSON array of available amenities

**Constraints**:
- Primary key on `location_id`
- Foreign key to self for hierarchical structure
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- NOT NULL constraints on essential fields

**Indexes**:
- Spatial index on coordinates for geospatial queries
- Full-text index on name, address, and city for search
- Standard indexes on frequently queried fields

### landmarks Table

**Purpose**: Store landmark information for enhanced location search.

**Key Columns**:
- `landmark_id`: Unique identifier (format: LM-XXX)
- `name`: Official landmark name
- `category`: Landmark category (airport, hotel, attraction, etc.)
- `aliases`: JSON array of alternative names and spellings
- `latitude`, `longitude`: Landmark coordinates

**Constraints**:
- Primary key on `landmark_id`
- NOT NULL on name, category, and coordinates

**Indexes**:
- Spatial index on coordinates
- Full-text index on name and description

### landmark_locations Table

**Purpose**: Many-to-many relationship between landmarks and rental locations.

**Key Columns**:
- `landmark_id`: Reference to landmark
- `location_id`: Reference to rental location
- `distance_km`: Distance from landmark to location
- `is_primary`: Flag for primary/recommended location for landmark

**Constraints**:
- Composite primary key on (landmark_id, location_id)
- Foreign keys to both landmarks and locations tables

### one_way_rental_fees Table

**Purpose**: Configure fees for one-way rentals between location pairs.

**Key Columns**:
- `pickup_location_id`: Starting location
- `dropoff_location_id`: Ending location
- `base_fee`: Base one-way rental fee
- `distance_km`: Distance between locations
- `seasonal_multiplier`: Seasonal adjustment factor
- `effective_from`, `effective_to`: Date range for fee validity

**Constraints**:
- Foreign keys to locations table
- Unique constraint on (pickup_location_id, dropoff_location_id, effective_from)
- CHECK constraint: base_fee >= 0
- CHECK constraint: seasonal_multiplier > 0

### location_search_cache Table

**Purpose**: Cache popular location searches for performance.

**Key Columns**:
- `search_query`: Original search text
- `search_hash`: Hash of query + coordinates for cache key
- `results`: JSON array of cached search results
- `hit_count`: Number of times cache entry was used
- `expires_at`: Cache expiration timestamp

**Constraints**:
- Index on search_hash for fast lookups
- Index on expires_at for cleanup queries

## Relationships

### Location Hierarchy
- `locations.parent_location_id` → `locations.location_id` (self-referencing)
- Supports multi-level hierarchy: Country → State → City → Specific Location

### Landmark Associations
- `landmarks` ←→ `locations` (many-to-many via `landmark_locations`)
- One landmark can map to multiple rental locations
- One location can be associated with multiple landmarks

### Vehicle Location Assignment
- `vehicles.current_location_id` → `locations.location_id`
- Tracks current location of each vehicle

### One-Way Rental Configuration
- `one_way_rental_fees.pickup_location_id` → `locations.location_id`
- `one_way_rental_fees.dropoff_location_id` → `locations.location_id`
- Defines fees for specific location pairs

## Indexes

### Performance Indexes

#### Geospatial Queries
```sql
-- Spatial index for distance-based searches
SPATIAL INDEX idx_coordinates ON locations(POINT(latitude, longitude));
SPATIAL INDEX idx_landmark_coordinates ON landmarks(POINT(latitude, longitude));
```

#### Full-Text Search
```sql
-- Full-text index for location name and address search
FULLTEXT INDEX idx_search ON locations(name, street_address, city);
FULLTEXT INDEX idx_landmark_search ON landmarks(name, description);
```

#### Lookup Optimization
```sql
-- Composite index for one-way rental fee lookups
INDEX idx_pickup_dropoff ON one_way_rental_fees(pickup_location_id, dropoff_location_id);

-- Index for active location filtering
INDEX idx_is_active ON locations(is_active);

-- Index for hierarchy queries
INDEX idx_parent_location ON locations(parent_location_id);
INDEX idx_hierarchy_level ON locations(hierarchy_level);
```

#### Cache Performance
```sql
-- Index for cache lookups
INDEX idx_search_hash ON location_search_cache(search_hash);

-- Index for cache cleanup
INDEX idx_expires_at ON location_search_cache(expires_at);
```

## Sample Data

### Sample Location Records

```sql
-- Airport location
INSERT INTO locations (
  location_id, name, location_type, street_address, city, state_province, 
  country, postal_code, latitude, longitude, is_landmark, landmark_type, 
  hierarchy_level, operating_hours, contact_phone, contact_email, amenities
) VALUES (
  'LOC-10001',
  'Los Angeles International Airport',
  'airport',
  '1 World Way',
  'Los Angeles',
  'California',
  'USA',
  '90045',
  33.9416,
  -118.4085,
  TRUE,
  'airport',
  'location',
  '{"monday": {"open": "00:00", "close": "23:59"}, "tuesday": {"open": "00:00", "close": "23:59"}, "wednesday": {"open": "00:00", "close": "23:59"}, "thursday": {"open": "00:00", "close": "23:59"}, "friday": {"open": "00:00", "close": "23:59"}, "saturday": {"open": "00:00", "close": "23:59"}, "sunday": {"open": "00:00", "close": "23:59"}}',
  '+1-310-555-0100',
  'lax@rentalcompany.com',
  '["24/7 Service", "Free Shuttle", "Car Wash", "Fuel Station"]'
);

-- Neighborhood location
INSERT INTO locations (
  location_id, name, location_type, street_address, city, state_province, 
  country, postal_code, latitude, longitude, hierarchy_level, 
  operating_hours, contact_phone, contact_email
) VALUES (
  'LOC-10002',
  'Downtown Los Angeles',
  'neighborhood',
  '123 Main Street',
  'Los Angeles',
  'California',
  'USA',
  '90012',
  34.0522,
  -118.2437,
  'location',
  '{"monday": {"open": "08:00", "close": "18:00"}, "tuesday": {"open": "08:00", "close": "18:00"}, "wednesday": {"open": "08:00", "close": "18:00"}, "thursday": {"open": "08:00", "close": "18:00"}, "friday": {"open": "08:00", "close": "18:00"}, "saturday": {"open": "09:00", "close": "17:00"}, "sunday": {"open": "10:00", "close": "16:00"}}',
  '+1-213-555-0200',
  'downtown-la@rentalcompany.com'
);
```

### Sample Landmark Records

```sql
INSERT INTO landmarks (
  landmark_id, name, category, latitude, longitude, aliases, description
) VALUES (
  'LM-001',
  'Los Angeles International Airport',
  'airport',
  33.9416,
  -118.4085,
  '["LAX", "Los Angeles Airport", "LA Airport"]',
  'Major international airport serving Los Angeles area'
);

INSERT INTO landmark_locations (
  landmark_id, location_id, distance_km, is_primary
) VALUES (
  'LM-001',
  'LOC-10001',
  0.3,
  TRUE
);
```

### Sample One-Way Rental Fee

```sql
INSERT INTO one_way_rental_fees (
  pickup_location_id, dropoff_location_id, base_fee, distance_km, 
  effective_from, is_active
) VALUES (
  'LOC-10001',  -- LAX
  'LOC-20001',  -- SFO
  75.00,
  559.0,
  '2026-01-01',
  TRUE
);
```

## Query Examples

### Autocomplete Location Search

```sql
-- Search locations by name with full-text search
SELECT 
  location_id,
  name,
  CONCAT(street_address, ', ', city, ', ', state_province, ' ', postal_code) AS address,
  location_type,
  latitude,
  longitude,
  is_landmark
FROM locations
WHERE 
  is_active = TRUE
  AND MATCH(name, street_address, city) AGAINST('los angeles' IN NATURAL LANGUAGE MODE)
ORDER BY 
  MATCH(name, street_address, city) AGAINST('los angeles' IN NATURAL LANGUAGE MODE) DESC
LIMIT 10;
```

### Find Nearby Locations (Geospatial Query)

```sql
-- Find locations within 50km of user's coordinates
SELECT 
  location_id,
  name,
  street_address,
  city,
  latitude,
  longitude,
  (
    6371 * ACOS(
      COS(RADIANS(33.9416)) * COS(RADIANS(latitude)) * 
      COS(RADIANS(longitude) - RADIANS(-118.4085)) + 
      SIN(RADIANS(33.9416)) * SIN(RADIANS(latitude))
    )
  ) AS distance_km
FROM locations
WHERE 
  is_active = TRUE
  AND (
    6371 * ACOS(
      COS(RADIANS(33.9416)) * COS(RADIANS(latitude)) * 
      COS(RADIANS(longitude) - RADIANS(-118.4085)) + 
      SIN(RADIANS(33.9416)) * SIN(RADIANS(latitude))
    )
  ) <= 50
ORDER BY distance_km ASC
LIMIT 10;
```

### Get Location Hierarchy

```sql
-- Get all cities in a state
SELECT 
  location_id,
  name,
  COUNT(child.location_id) AS child_count
FROM locations parent
LEFT JOIN locations child ON child.parent_location_id = parent.location_id
WHERE 
  parent.hierarchy_level = 'city'
  AND parent.parent_location_id = 'STATE-CA'
  AND parent.is_active = TRUE
GROUP BY parent.location_id, parent.name
ORDER BY parent.name;
```

### Get One-Way Rental Fee

```sql
-- Get one-way rental fee for specific route
SELECT 
  base_fee,
  distance_km,
  seasonal_multiplier,
  (base_fee * seasonal_multiplier) AS total_fee
FROM one_way_rental_fees
WHERE 
  pickup_location_id = 'LOC-10001'
  AND dropoff_location_id = 'LOC-20001'
  AND is_active = TRUE
  AND CURDATE() BETWEEN effective_from AND COALESCE(effective_to, '9999-12-31')
LIMIT 1;
```

### Search Landmarks

```sql
-- Search landmarks with aliases
SELECT 
  l.landmark_id,
  l.name,
  l.category,
  l.latitude,
  l.longitude,
  ll.location_id,
  loc.name AS location_name,
  ll.distance_km
FROM landmarks l
INNER JOIN landmark_locations ll ON l.landmark_id = ll.landmark_id
INNER JOIN locations loc ON ll.location_id = loc.location_id
WHERE 
  MATCH(l.name, l.description) AGAINST('airport' IN NATURAL LANGUAGE MODE)
  OR JSON_CONTAINS(l.aliases, '"LAX"')
ORDER BY ll.is_primary DESC, ll.distance_km ASC;
```

## Data Migration

### Migration Script: Create Location Tables

```sql
-- Migration: 001_create_location_tables.sql
START TRANSACTION;

-- Create locations table
CREATE TABLE locations (...);

-- Create landmarks table
CREATE TABLE landmarks (...);

-- Create landmark_locations table
CREATE TABLE landmark_locations (...);

-- Create one_way_rental_fees table
CREATE TABLE one_way_rental_fees (...);

-- Create location_search_cache table
CREATE TABLE location_search_cache (...);

-- Modify vehicles table
ALTER TABLE vehicles
ADD COLUMN current_location_id VARCHAR(20),
ADD FOREIGN KEY (current_location_id) REFERENCES locations(location_id) ON DELETE SET NULL,
ADD INDEX idx_current_location (current_location_id);

COMMIT;
```

### Rollback Script

```sql
-- Rollback: 001_create_location_tables_rollback.sql
START TRANSACTION;

-- Remove foreign key from vehicles
ALTER TABLE vehicles
DROP FOREIGN KEY vehicles_ibfk_location,
DROP COLUMN current_location_id;

-- Drop tables in reverse order
DROP TABLE IF EXISTS location_search_cache;
DROP TABLE IF EXISTS one_way_rental_fees;
DROP TABLE IF EXISTS landmark_locations;
DROP TABLE IF EXISTS landmarks;
DROP TABLE IF EXISTS locations;

COMMIT;
```

## Performance Considerations

### Indexing Strategy
- Spatial indexes for geospatial queries (critical for distance calculations)
- Full-text indexes for name and address search
- Composite indexes for frequently joined columns
- Regular index maintenance and optimization

### Query Optimization
- Use EXPLAIN to analyze query performance
- Implement query result caching for popular searches
- Use covering indexes where possible
- Limit result sets appropriately

### Data Volume Estimates
- Locations: ~10,000 records (small to medium rental company)
- Landmarks: ~5,000 records
- Landmark_locations: ~15,000 records (3 locations per landmark average)
- One_way_rental_fees: ~50,000 records (location pairs × seasonal variations)
- Location_search_cache: ~100,000 records (with regular cleanup)

### Maintenance Tasks
- Regular cleanup of expired cache entries
- Periodic reindexing of full-text indexes
- Archive old one_way_rental_fees records
- Monitor and optimize slow queries

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **Geospatial**: MySQL Spatial Data Types and Functions

## Implementation Notes

### Geospatial Considerations
- Use POINT data type for coordinates
- Haversine formula for distance calculations
- Consider Earth's radius: 6371 km
- Precision: 6 decimal places for coordinates (~0.1 meter accuracy)

### JSON Column Usage
- `operating_hours`: Flexible daily schedule storage
- `amenities`: Variable list of location features
- `photos`: Array of photo URLs
- `aliases`: Landmark name variations

### Data Integrity
- Foreign key constraints ensure referential integrity
- CHECK constraints validate data ranges
- Unique constraints prevent duplicate configurations
- NOT NULL constraints on critical fields

### Backup and Recovery
- Regular automated backups of location data
- Point-in-time recovery capability
- Test restore procedures regularly
- Document recovery procedures

# Feature: Multi-Criteria Filtering (Database)

## Overview

The database layer for Multi-Criteria Filtering provides optimized schema design and indexing strategies to support high-performance vehicle search with complex filter combinations. The implementation leverages existing vehicle tables with strategic indexing, ensuring sub-second query response times even with multiple simultaneous filters applied across large vehicle inventories.

The database design supports efficient filter option aggregation, accurate result counting, and scalable query performance through composite indexes, covering indexes, and query optimization techniques specific to MySQL 8.0+.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-004: Granular Multi-Criteria Filtering
- F-WF-SRCH-003: Multi-Criteria Filtering Workflow

## Database Specifications

### Schema Changes

No new tables required. The multi-criteria filtering feature utilizes existing vehicle-related tables with additional indexes for optimal query performance.

### Table Definitions

#### Vehicles Table (Existing - Enhanced with Indexes)

The primary table storing vehicle information. Enhanced with indexes for filter performance.

```sql
-- Existing table structure (no changes to columns)
CREATE TABLE Vehicles (
    VehicleId VARCHAR(50) PRIMARY KEY,
    Make VARCHAR(100) NOT NULL,
    Model VARCHAR(100) NOT NULL,
    Year INT NOT NULL,
    Category VARCHAR(50) NOT NULL,
    FuelType VARCHAR(50) NOT NULL,
    Transmission VARCHAR(20) NOT NULL,
    Seats INT NOT NULL,
    Doors INT NOT NULL,
    DailyRate DECIMAL(10, 2) NOT NULL,
    MileagePolicy VARCHAR(20) NOT NULL,
    FuelPolicy VARCHAR(50) NOT NULL,
    SupplierId VARCHAR(50) NOT NULL,
    LocationId VARCHAR(50) NOT NULL,
    AverageRating DECIMAL(3, 2) DEFAULT 0.00,
    ReviewCount INT DEFAULT 0,
    BookingCount INT DEFAULT 0,
    IsAvailable BOOLEAN DEFAULT TRUE,
    ImageUrl VARCHAR(500),
    ThumbnailUrl VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT FK_Vehicles_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId),
    CONSTRAINT FK_Vehicles_Locations FOREIGN KEY (LocationId) REFERENCES Locations(LocationId),
    
    -- Constraints
    CONSTRAINT CHK_Vehicles_Year CHECK (Year >= 1900 AND Year <= 2100),
    CONSTRAINT CHK_Vehicles_Seats CHECK (Seats >= 1 AND Seats <= 20),
    CONSTRAINT CHK_Vehicles_Doors CHECK (Doors >= 2 AND Doors <= 5),
    CONSTRAINT CHK_Vehicles_DailyRate CHECK (DailyRate >= 0),
    CONSTRAINT CHK_Vehicles_Rating CHECK (AverageRating >= 0 AND AverageRating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### VehicleFeatures Table (Existing - Enhanced with Indexes)

Junction table linking vehicles to their features.

```sql
CREATE TABLE VehicleFeatures (
    VehicleFeatureId INT AUTO_INCREMENT PRIMARY KEY,
    VehicleId VARCHAR(50) NOT NULL,
    FeatureId VARCHAR(50) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT FK_VehicleFeatures_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    CONSTRAINT FK_VehicleFeatures_Features FOREIGN KEY (FeatureId) REFERENCES Features(FeatureId),
    
    -- Unique constraint to prevent duplicate feature assignments
    CONSTRAINT UQ_VehicleFeatures_Vehicle_Feature UNIQUE (VehicleId, FeatureId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Features Table (Existing)

Reference table for available vehicle features.

```sql
CREATE TABLE Features (
    FeatureId VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    FeatureGroup VARCHAR(50), -- connectivity, comfort, safety, special
    IconUrl VARCHAR(500),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT UQ_Features_Name UNIQUE (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### VehicleAccessibility Table (Existing - Enhanced with Indexes)

Table storing accessibility features for vehicles.

```sql
CREATE TABLE VehicleAccessibility (
    VehicleAccessibilityId INT AUTO_INCREMENT PRIMARY KEY,
    VehicleId VARCHAR(50) NOT NULL,
    AccessibilityFeatureId VARCHAR(50) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT FK_VehicleAccessibility_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    CONSTRAINT FK_VehicleAccessibility_Features FOREIGN KEY (AccessibilityFeatureId) REFERENCES AccessibilityFeatures(FeatureId),
    
    -- Unique constraint
    CONSTRAINT UQ_VehicleAccessibility_Vehicle_Feature UNIQUE (VehicleId, AccessibilityFeatureId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### AccessibilityFeatures Table (Existing)

Reference table for accessibility features.

```sql
CREATE TABLE AccessibilityFeatures (
    FeatureId VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT UQ_AccessibilityFeatures_Name UNIQUE (Name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Suppliers Table (Existing)

Reference table for vehicle suppliers.

```sql
CREATE TABLE Suppliers (
    SupplierId VARCHAR(50) PRIMARY KEY,
    Name VARCHAR(200) NOT NULL,
    AverageRating DECIMAL(3, 2) DEFAULT 0.00,
    ReviewCount INT DEFAULT 0,
    ResponseTime INT, -- in minutes
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT CHK_Suppliers_Rating CHECK (AverageRating >= 0 AND AverageRating <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

#### Vehicle Relationships
- **Vehicles → Suppliers** (Many-to-One): Each vehicle belongs to one supplier
  - Foreign Key: `Vehicles.SupplierId` → `Suppliers.SupplierId`
  
- **Vehicles → Locations** (Many-to-One): Each vehicle is assigned to one location
  - Foreign Key: `Vehicles.LocationId` → `Locations.LocationId`
  
- **Vehicles → VehicleFeatures** (One-to-Many): Each vehicle can have multiple features
  - Foreign Key: `VehicleFeatures.VehicleId` → `Vehicles.VehicleId`
  
- **Vehicles → VehicleAccessibility** (One-to-Many): Each vehicle can have multiple accessibility features
  - Foreign Key: `VehicleAccessibility.VehicleId` → `Vehicles.VehicleId`

#### Feature Relationships
- **VehicleFeatures → Features** (Many-to-One): Each vehicle feature links to one feature definition
  - Foreign Key: `VehicleFeatures.FeatureId` → `Features.FeatureId`
  
- **VehicleAccessibility → AccessibilityFeatures** (Many-to-One): Each accessibility entry links to one feature definition
  - Foreign Key: `VehicleAccessibility.AccessibilityFeatureId` → `AccessibilityFeatures.FeatureId`

### Indexes

#### Single-Column Indexes for Individual Filters

```sql
-- Fuel Type Filter
CREATE INDEX idx_vehicles_fuel_type 
ON Vehicles(FuelType);

-- Transmission Filter
CREATE INDEX idx_vehicles_transmission 
ON Vehicles(Transmission);

-- Category Filter
CREATE INDEX idx_vehicles_category 
ON Vehicles(Category);

-- Price Range Filter
CREATE INDEX idx_vehicles_daily_rate 
ON Vehicles(DailyRate);

-- Capacity Filters
CREATE INDEX idx_vehicles_seats 
ON Vehicles(Seats);

CREATE INDEX idx_vehicles_doors 
ON Vehicles(Doors);

-- Mileage Policy Filter
CREATE INDEX idx_vehicles_mileage_policy 
ON Vehicles(MileagePolicy);

-- Fuel Policy Filter
CREATE INDEX idx_vehicles_fuel_policy 
ON Vehicles(FuelPolicy);

-- Rating Filter
CREATE INDEX idx_vehicles_rating 
ON Vehicles(AverageRating);

-- Supplier Filter
CREATE INDEX idx_vehicles_supplier_id 
ON Vehicles(SupplierId);

-- Location Filter (for availability queries)
CREATE INDEX idx_vehicles_location_id 
ON Vehicles(LocationId);

-- Availability Filter
CREATE INDEX idx_vehicles_available 
ON Vehicles(IsAvailable);
```

#### Composite Indexes for Common Filter Combinations

```sql
-- Most common filter combination: Category + Transmission + Price
CREATE INDEX idx_vehicles_category_transmission_price 
ON Vehicles(Category, Transmission, DailyRate);

-- Fuel type + Transmission + Price
CREATE INDEX idx_vehicles_fuel_transmission_price 
ON Vehicles(FuelType, Transmission, DailyRate);

-- Location + Availability + Category (for location-based searches)
CREATE INDEX idx_vehicles_location_available_category 
ON Vehicles(LocationId, IsAvailable, Category);

-- Supplier + Rating (for supplier filtering with rating sort)
CREATE INDEX idx_vehicles_supplier_rating 
ON Vehicles(SupplierId, AverageRating);

-- Category + Seats + Price (for family vehicle searches)
CREATE INDEX idx_vehicles_category_seats_price 
ON Vehicles(Category, Seats, DailyRate);
```

#### Covering Indexes for Search Results

```sql
-- Covering index for basic search results (includes all commonly displayed fields)
CREATE INDEX idx_vehicles_search_covering 
ON Vehicles(
    IsAvailable, 
    LocationId, 
    Category, 
    DailyRate, 
    VehicleId, 
    Make, 
    Model, 
    Year, 
    Transmission, 
    FuelType, 
    Seats, 
    AverageRating
);
```

#### Junction Table Indexes

```sql
-- VehicleFeatures indexes for feature filtering
CREATE INDEX idx_vehicle_features_vehicle_id 
ON VehicleFeatures(VehicleId);

CREATE INDEX idx_vehicle_features_feature_id 
ON VehicleFeatures(FeatureId);

-- Composite index for feature existence checks
CREATE INDEX idx_vehicle_features_feature_vehicle 
ON VehicleFeatures(FeatureId, VehicleId);

-- VehicleAccessibility indexes
CREATE INDEX idx_vehicle_accessibility_vehicle_id 
ON VehicleAccessibility(VehicleId);

CREATE INDEX idx_vehicle_accessibility_feature_id 
ON VehicleAccessibility(AccessibilityFeatureId);

-- Composite index for accessibility checks
CREATE INDEX idx_vehicle_accessibility_feature_vehicle 
ON VehicleAccessibility(AccessibilityFeatureId, VehicleId);
```

#### Sorting Indexes

```sql
-- Price sorting (ascending/descending)
CREATE INDEX idx_vehicles_price_sort 
ON Vehicles(DailyRate, VehicleId);

-- Rating sorting
CREATE INDEX idx_vehicles_rating_sort 
ON Vehicles(AverageRating DESC, VehicleId);

-- Popularity sorting
CREATE INDEX idx_vehicles_popularity_sort 
ON Vehicles(BookingCount DESC, VehicleId);
```

### Query Optimization

#### Filter Query Example

```sql
-- Example: Search for automatic SUVs with Apple CarPlay, priced $50-$150/day
SELECT 
    v.VehicleId,
    v.Make,
    v.Model,
    v.Year,
    v.Category,
    v.FuelType,
    v.Transmission,
    v.Seats,
    v.Doors,
    v.DailyRate,
    v.AverageRating,
    v.ReviewCount,
    v.ImageUrl,
    s.Name AS SupplierName,
    s.AverageRating AS SupplierRating
FROM Vehicles v
INNER JOIN Suppliers s ON v.SupplierId = s.SupplierId
WHERE v.IsAvailable = TRUE
  AND v.LocationId = 'LAX-001'
  AND v.Category = 'suv'
  AND v.Transmission = 'automatic'
  AND v.DailyRate BETWEEN 50 AND 150
  AND EXISTS (
      SELECT 1 
      FROM VehicleFeatures vf 
      WHERE vf.VehicleId = v.VehicleId 
        AND vf.FeatureId = 'apple-carplay'
  )
ORDER BY v.DailyRate ASC
LIMIT 20 OFFSET 0;

-- This query will use: idx_vehicles_category_transmission_price
-- and idx_vehicle_features_feature_vehicle for the EXISTS subquery
```

#### Filter Count Aggregation Query

```sql
-- Example: Get counts for each fuel type filter option
SELECT 
    v.FuelType,
    COUNT(*) AS VehicleCount
FROM Vehicles v
WHERE v.IsAvailable = TRUE
  AND v.LocationId = 'LAX-001'
  AND v.DailyRate BETWEEN 0 AND 500
GROUP BY v.FuelType
ORDER BY v.FuelType;

-- This query will use: idx_vehicles_location_available_category
-- or idx_vehicles_fuel_type depending on optimizer decision
```

#### Feature Filter with Multiple Features (AND logic)

```sql
-- Example: Vehicles with BOTH Apple CarPlay AND Backup Camera
SELECT v.*
FROM Vehicles v
WHERE v.IsAvailable = TRUE
  AND v.LocationId = 'LAX-001'
  AND EXISTS (
      SELECT 1 
      FROM VehicleFeatures vf 
      WHERE vf.VehicleId = v.VehicleId 
        AND vf.FeatureId = 'apple-carplay'
  )
  AND EXISTS (
      SELECT 1 
      FROM VehicleFeatures vf 
      WHERE vf.VehicleId = v.VehicleId 
        AND vf.FeatureId = 'backup-camera'
  );

-- Alternative using JOIN and GROUP BY (may be faster for many features)
SELECT v.*
FROM Vehicles v
INNER JOIN VehicleFeatures vf ON v.VehicleId = vf.VehicleId
WHERE v.IsAvailable = TRUE
  AND v.LocationId = 'LAX-001'
  AND vf.FeatureId IN ('apple-carplay', 'backup-camera')
GROUP BY v.VehicleId
HAVING COUNT(DISTINCT vf.FeatureId) = 2;
```

### Performance Considerations

#### Index Selection Strategy
- MySQL query optimizer will choose the most selective index
- Composite indexes are used when query filters match index column order
- Covering indexes eliminate table lookups for frequently accessed columns
- Monitor slow query log to identify missing indexes

#### Query Optimization Techniques
1. **Use EXPLAIN ANALYZE** to verify index usage
2. **Avoid SELECT *** - specify only needed columns
3. **Use EXISTS instead of IN** for subqueries when checking existence
4. **Limit result sets** with LIMIT clause
5. **Use pagination** to avoid large result sets
6. **Cache filter options** to reduce aggregation queries

#### Index Maintenance
```sql
-- Analyze tables to update index statistics
ANALYZE TABLE Vehicles;
ANALYZE TABLE VehicleFeatures;
ANALYZE TABLE VehicleAccessibility;

-- Check index usage
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    SEQ_IN_INDEX,
    COLUMN_NAME,
    CARDINALITY
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = 'car_rental_db'
  AND TABLE_NAME IN ('Vehicles', 'VehicleFeatures', 'VehicleAccessibility')
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- Identify unused indexes
SELECT 
    s.TABLE_NAME,
    s.INDEX_NAME,
    s.CARDINALITY
FROM information_schema.STATISTICS s
LEFT JOIN performance_schema.table_io_waits_summary_by_index_usage i
    ON s.TABLE_SCHEMA = i.OBJECT_SCHEMA
    AND s.TABLE_NAME = i.OBJECT_NAME
    AND s.INDEX_NAME = i.INDEX_NAME
WHERE s.TABLE_SCHEMA = 'car_rental_db'
  AND s.TABLE_NAME = 'Vehicles'
  AND i.INDEX_NAME IS NULL
  AND s.INDEX_NAME != 'PRIMARY';
```

### Data Integrity

#### Constraints
- Foreign key constraints ensure referential integrity
- Check constraints validate data ranges (year, seats, doors, rating, price)
- Unique constraints prevent duplicate feature assignments
- NOT NULL constraints ensure required fields are populated

#### Triggers (Optional - for maintaining aggregated data)

```sql
-- Trigger to update vehicle rating when reviews are added
DELIMITER //

CREATE TRIGGER trg_update_vehicle_rating
AFTER INSERT ON VehicleReviews
FOR EACH ROW
BEGIN
    UPDATE Vehicles
    SET AverageRating = (
        SELECT AVG(Rating)
        FROM VehicleReviews
        WHERE VehicleId = NEW.VehicleId
    ),
    ReviewCount = (
        SELECT COUNT(*)
        FROM VehicleReviews
        WHERE VehicleId = NEW.VehicleId
    )
    WHERE VehicleId = NEW.VehicleId;
END//

DELIMITER ;
```

### Backup and Recovery

#### Backup Strategy
- Daily full backups of entire database
- Hourly incremental backups during business hours
- Transaction log backups every 15 minutes
- Backup retention: 30 days

#### Recovery Procedures
- Point-in-time recovery capability
- Test recovery procedures monthly
- Document recovery time objectives (RTO: 1 hour)
- Document recovery point objectives (RPO: 15 minutes)

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 for full Unicode support
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **Storage Engine**: InnoDB for ACID compliance and foreign key support
- **Indexing**: B-tree indexes for efficient filtering and sorting

## Implementation Notes

### Index Creation Order
1. Create single-column indexes first
2. Create composite indexes for common filter combinations
3. Create covering indexes for frequently accessed columns
4. Monitor query performance and add indexes as needed

### Index Monitoring
- Use MySQL slow query log to identify slow queries
- Use EXPLAIN ANALYZE to verify index usage
- Monitor index cardinality and selectivity
- Remove unused indexes to reduce write overhead

### Query Performance Targets
- Simple filter queries: <100ms
- Complex multi-filter queries: <500ms
- Filter option aggregation: <200ms
- Search result pagination: <100ms per page

### Scaling Considerations
- Consider partitioning Vehicles table by LocationId for very large inventories
- Implement read replicas for search queries
- Use connection pooling to manage database connections
- Monitor database CPU and memory usage
- Consider sharding by geographic region for global deployments

### Testing Considerations
- Test queries with various filter combinations
- Verify index usage with EXPLAIN ANALYZE
- Performance test with large datasets (100,000+ vehicles)
- Test concurrent filter queries
- Verify data integrity with foreign key constraints
- Test backup and recovery procedures

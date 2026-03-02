# Feature: Supplier Directory & Profiles - Database

## Overview

Database schema design for the Supplier Directory & Profiles feature, supporting supplier profile management, operational metrics tracking, location management, and specialization categorization. This schema enables efficient querying, filtering, and comparison of rental suppliers with comprehensive performance data.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-011

## Schema Changes

### New Tables

1. **Suppliers** - Core supplier profile information
2. **SupplierLocations** - Operational locations for each supplier
3. **SupplierSpecializations** - Supplier expertise areas (many-to-many)
4. **SupplierMetrics** - Calculated operational performance metrics
5. **SupplierCertifications** - Professional certifications and credentials

### Modified Tables

1. **Vehicles** - Add SupplierId foreign key to link vehicles to suppliers
2. **Reviews** - Add supplier-specific rating fields and SupplierId foreign key
3. **Bookings** - Ensure SupplierId is tracked for metrics calculation

## Table Definitions

### Suppliers Table


**Purpose**: Store core supplier/host profile information and aggregate metrics.

**Columns**:
- `SupplierId` CHAR(36) PRIMARY KEY - Unique identifier (GUID)
- `Name` VARCHAR(200) NOT NULL - Supplier business name
- `Tagline` VARCHAR(500) - Short marketing tagline
- `Description` TEXT - Detailed supplier description
- `LogoUrl` VARCHAR(500) - URL to supplier logo image
- `Email` VARCHAR(255) NOT NULL - Primary contact email (unique)
- `Phone` VARCHAR(50) - Primary contact phone number
- `Website` VARCHAR(500) - Supplier website URL
- `YearsInBusiness` INT - Number of years operating
- `IsVerified` BOOLEAN DEFAULT FALSE - Verification status
- `VerificationDate` DATETIME - Date of last verification
- `OverallRating` DECIMAL(3,2) DEFAULT 0.00 - Aggregate customer rating (0-5)
- `ReviewCount` INT DEFAULT 0 - Total number of reviews
- `FleetSize` INT DEFAULT 0 - Total number of vehicles
- `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP - Record creation timestamp
- `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - Last update timestamp
- `IsActive` BOOLEAN DEFAULT TRUE - Soft delete flag

**Indexes**:
```sql
CREATE INDEX idx_suppliers_name ON Suppliers(Name);
CREATE INDEX idx_suppliers_rating ON Suppliers(OverallRating DESC);
CREATE INDEX idx_suppliers_verified ON Suppliers(IsVerified);
CREATE INDEX idx_suppliers_active ON Suppliers(IsActive);
CREATE INDEX idx_suppliers_rating_active ON Suppliers(OverallRating DESC, IsActive);
CREATE INDEX idx_suppliers_rating_verified ON Suppliers(OverallRating DESC, IsVerified, IsActive);
CREATE FULLTEXT INDEX idx_suppliers_fulltext ON Suppliers(Name, Description, Tagline);
```

**Constraints**:
- PRIMARY KEY (SupplierId)
- UNIQUE (Email)
- CHECK (OverallRating BETWEEN 0 AND 5)
- CHECK (ReviewCount >= 0)
- CHECK (FleetSize >= 0)
- CHECK (YearsInBusiness >= 0)

**SQL Definition**:
```sql
CREATE TABLE Suppliers (
  SupplierId CHAR(36) PRIMARY KEY,
  Name VARCHAR(200) NOT NULL,
  Tagline VARCHAR(500),
  Description TEXT,
  LogoUrl VARCHAR(500),
  Email VARCHAR(255) NOT NULL UNIQUE,
  Phone VARCHAR(50),
  Website VARCHAR(500),
  YearsInBusiness INT,
  IsVerified BOOLEAN DEFAULT FALSE,
  VerificationDate DATETIME,
  OverallRating DECIMAL(3,2) DEFAULT 0.00,
  ReviewCount INT DEFAULT 0,
  FleetSize INT DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  IsActive BOOLEAN DEFAULT TRUE,
  INDEX idx_name (Name),
  INDEX idx_rating (OverallRating DESC),
  INDEX idx_verified (IsVerified),
  INDEX idx_active (IsActive),
  INDEX idx_rating_active (OverallRating DESC, IsActive),
  INDEX idx_rating_verified (OverallRating DESC, IsVerified, IsActive),
  FULLTEXT INDEX idx_fulltext (Name, Description, Tagline),
  CONSTRAINT chk_rating CHECK (OverallRating BETWEEN 0 AND 5),
  CONSTRAINT chk_review_count CHECK (ReviewCount >= 0),
  CONSTRAINT chk_fleet_size CHECK (FleetSize >= 0),
  CONSTRAINT chk_years CHECK (YearsInBusiness >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### SupplierLocations Table

**Purpose**: Store all operational locations for each supplier with geographic coordinates.

**Columns**:
- `LocationId` CHAR(36) PRIMARY KEY - Unique location identifier (GUID)
- `SupplierId` CHAR(36) NOT NULL - Foreign key to Suppliers table
- `LocationName` VARCHAR(200) NOT NULL - Location name/identifier
- `AddressLine1` VARCHAR(255) NOT NULL - Primary address line
- `AddressLine2` VARCHAR(255) - Secondary address line (suite, unit, etc.)
- `City` VARCHAR(100) NOT NULL - City name
- `Region` VARCHAR(100) - State/province/region
- `PostalCode` VARCHAR(20) - Postal/ZIP code
- `Country` VARCHAR(100) NOT NULL - Country name
- `Latitude` DECIMAL(10,8) - Geographic latitude
- `Longitude` DECIMAL(11,8) - Geographic longitude
- `IsPrimaryLocation` BOOLEAN DEFAULT FALSE - Primary location flag
- `LocationType` ENUM('airport', 'city_center', 'neighborhood', 'delivery') DEFAULT 'neighborhood' - Location category
- `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP - Record creation timestamp
- `UpdatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP - Last update timestamp

**Indexes**:
```sql
CREATE INDEX idx_locations_supplier ON SupplierLocations(SupplierId);
CREATE INDEX idx_locations_city ON SupplierLocations(City);
CREATE INDEX idx_locations_type ON SupplierLocations(LocationType);
CREATE INDEX idx_locations_coordinates ON SupplierLocations(Latitude, Longitude);
CREATE INDEX idx_locations_city_country ON SupplierLocations(City, Country, SupplierId);
```

**Constraints**:
- PRIMARY KEY (LocationId)
- FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE
- CHECK (Latitude BETWEEN -90 AND 90)
- CHECK (Longitude BETWEEN -180 AND 180)

**SQL Definition**:
```sql
CREATE TABLE SupplierLocations (
  LocationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  LocationName VARCHAR(200) NOT NULL,
  AddressLine1 VARCHAR(255) NOT NULL,
  AddressLine2 VARCHAR(255),
  City VARCHAR(100) NOT NULL,
  Region VARCHAR(100),
  PostalCode VARCHAR(20),
  Country VARCHAR(100) NOT NULL,
  Latitude DECIMAL(10,8),
  Longitude DECIMAL(11,8),
  IsPrimaryLocation BOOLEAN DEFAULT FALSE,
  LocationType ENUM('airport', 'city_center', 'neighborhood', 'delivery') DEFAULT 'neighborhood',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  INDEX idx_supplier (SupplierId),
  INDEX idx_city (City),
  INDEX idx_location_type (LocationType),
  INDEX idx_coordinates (Latitude, Longitude),
  INDEX idx_city_country (City, Country, SupplierId),
  CONSTRAINT chk_latitude CHECK (Latitude BETWEEN -90 AND 90),
  CONSTRAINT chk_longitude CHECK (Longitude BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### SupplierSpecializations Table

**Purpose**: Track supplier expertise areas and specializations (many-to-many relationship).

**Columns**:
- `SupplierSpecializationId` CHAR(36) PRIMARY KEY - Unique identifier (GUID)
- `SupplierId` CHAR(36) NOT NULL - Foreign key to Suppliers table
- `Specialization` ENUM('luxury', 'electric', 'accessible', 'commercial', 'budget', 'exotic', 'vintage') NOT NULL - Specialization category
- `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP - Record creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_specializations_supplier ON SupplierSpecializations(SupplierId);
CREATE INDEX idx_specializations_type ON SupplierSpecializations(Specialization);
CREATE UNIQUE INDEX idx_unique_supplier_specialization ON SupplierSpecializations(SupplierId, Specialization);
```

**Constraints**:
- PRIMARY KEY (SupplierSpecializationId)
- FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE
- UNIQUE (SupplierId, Specialization) - Prevent duplicate specializations

**SQL Definition**:
```sql
CREATE TABLE SupplierSpecializations (
  SupplierSpecializationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  Specialization ENUM('luxury', 'electric', 'accessible', 'commercial', 'budget', 'exotic', 'vintage') NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_specialization (SupplierId, Specialization),
  INDEX idx_supplier (SupplierId),
  INDEX idx_specialization (Specialization)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### SupplierMetrics Table

**Purpose**: Store calculated operational performance metrics for suppliers.

**Columns**:
- `MetricId` CHAR(36) PRIMARY KEY - Unique identifier (GUID)
- `SupplierId` CHAR(36) NOT NULL - Foreign key to Suppliers table (unique)
- `AverageResponseTimeMinutes` INT DEFAULT 0 - Average response time in minutes
- `CancellationRate` DECIMAL(5,2) DEFAULT 0.00 - Supplier cancellation rate percentage
- `BookingCompletionRate` DECIMAL(5,2) DEFAULT 100.00 - Booking completion rate percentage
- `CustomerSatisfactionScore` DECIMAL(5,2) DEFAULT 0.00 - Customer satisfaction score (0-100)
- `TotalCompletedBookings` INT DEFAULT 0 - Total number of completed bookings
- `OnTimePickupRate` DECIMAL(5,2) DEFAULT 100.00 - On-time pickup rate percentage
- `VehicleConditionRating` DECIMAL(3,2) DEFAULT 0.00 - Average vehicle condition rating (0-5)
- `CalculatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP - Last calculation timestamp

**Indexes**:
```sql
CREATE UNIQUE INDEX idx_metrics_supplier ON SupplierMetrics(SupplierId);
CREATE INDEX idx_metrics_calculated ON SupplierMetrics(CalculatedAt);
CREATE INDEX idx_metrics_response_time ON SupplierMetrics(AverageResponseTimeMinutes);
CREATE INDEX idx_metrics_cancellation ON SupplierMetrics(CancellationRate);
```

**Constraints**:
- PRIMARY KEY (MetricId)
- FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE
- UNIQUE (SupplierId) - One metrics record per supplier
- CHECK (CancellationRate BETWEEN 0 AND 100)
- CHECK (BookingCompletionRate BETWEEN 0 AND 100)
- CHECK (CustomerSatisfactionScore BETWEEN 0 AND 100)
- CHECK (OnTimePickupRate BETWEEN 0 AND 100)
- CHECK (VehicleConditionRating BETWEEN 0 AND 5)
- CHECK (AverageResponseTimeMinutes >= 0)
- CHECK (TotalCompletedBookings >= 0)

**SQL Definition**:
```sql
CREATE TABLE SupplierMetrics (
  MetricId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  AverageResponseTimeMinutes INT DEFAULT 0,
  CancellationRate DECIMAL(5,2) DEFAULT 0.00,
  BookingCompletionRate DECIMAL(5,2) DEFAULT 100.00,
  CustomerSatisfactionScore DECIMAL(5,2) DEFAULT 0.00,
  TotalCompletedBookings INT DEFAULT 0,
  OnTimePickupRate DECIMAL(5,2) DEFAULT 100.00,
  VehicleConditionRating DECIMAL(3,2) DEFAULT 0.00,
  CalculatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_metric (SupplierId),
  INDEX idx_supplier (SupplierId),
  INDEX idx_calculated (CalculatedAt),
  INDEX idx_response_time (AverageResponseTimeMinutes),
  INDEX idx_cancellation (CancellationRate),
  CONSTRAINT chk_cancellation_rate CHECK (CancellationRate BETWEEN 0 AND 100),
  CONSTRAINT chk_completion_rate CHECK (BookingCompletionRate BETWEEN 0 AND 100),
  CONSTRAINT chk_satisfaction_score CHECK (CustomerSatisfactionScore BETWEEN 0 AND 100),
  CONSTRAINT chk_ontime_rate CHECK (OnTimePickupRate BETWEEN 0 AND 100),
  CONSTRAINT chk_vehicle_rating CHECK (VehicleConditionRating BETWEEN 0 AND 5),
  CONSTRAINT chk_response_time CHECK (AverageResponseTimeMinutes >= 0),
  CONSTRAINT chk_completed_bookings CHECK (TotalCompletedBookings >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### SupplierCertifications Table

**Purpose**: Store professional certifications and credentials for suppliers.

**Columns**:
- `CertificationId` CHAR(36) PRIMARY KEY - Unique identifier (GUID)
- `SupplierId` CHAR(36) NOT NULL - Foreign key to Suppliers table
- `CertificationName` VARCHAR(200) NOT NULL - Name of certification
- `IssuingOrganization` VARCHAR(200) - Organization that issued certification
- `IssueDate` DATE - Date certification was issued
- `ExpiryDate` DATE - Date certification expires
- `CertificationUrl` VARCHAR(500) - URL to certification document/verification
- `CreatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP - Record creation timestamp

**Indexes**:
```sql
CREATE INDEX idx_certifications_supplier ON SupplierCertifications(SupplierId);
CREATE INDEX idx_certifications_expiry ON SupplierCertifications(ExpiryDate);
```

**Constraints**:
- PRIMARY KEY (CertificationId)
- FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE
- CHECK (ExpiryDate IS NULL OR ExpiryDate >= IssueDate)

**SQL Definition**:
```sql
CREATE TABLE SupplierCertifications (
  CertificationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  CertificationName VARCHAR(200) NOT NULL,
  IssuingOrganization VARCHAR(200),
  IssueDate DATE,
  ExpiryDate DATE,
  CertificationUrl VARCHAR(500),
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  INDEX idx_supplier (SupplierId),
  INDEX idx_expiry (ExpiryDate),
  CONSTRAINT chk_expiry_after_issue CHECK (ExpiryDate IS NULL OR ExpiryDate >= IssueDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Relationships

### Suppliers → SupplierLocations (One-to-Many)
- **Relationship**: One supplier can operate at multiple locations
- **Foreign Key**: SupplierLocations.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: CASCADE - When supplier is deleted, all locations are deleted
- **Business Rule**: At least one location required for active suppliers

### Suppliers → SupplierSpecializations (One-to-Many)
- **Relationship**: One supplier can have multiple specializations
- **Foreign Key**: SupplierSpecializations.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: CASCADE - When supplier is deleted, all specializations are deleted
- **Business Rule**: Specializations automatically assigned based on fleet composition

### Suppliers → SupplierMetrics (One-to-One)
- **Relationship**: Each supplier has one current metrics record
- **Foreign Key**: SupplierMetrics.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: CASCADE - When supplier is deleted, metrics are deleted
- **Business Rule**: Metrics updated daily via scheduled job

### Suppliers → Vehicles (One-to-Many)
- **Relationship**: One supplier owns/manages multiple vehicles
- **Foreign Key**: Vehicles.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: RESTRICT - Cannot delete supplier with active vehicles
- **Business Rule**: FleetSize in Suppliers table must match vehicle count

### Suppliers → Reviews (One-to-Many)
- **Relationship**: One supplier can have multiple reviews
- **Foreign Key**: Reviews.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: SET NULL or archive - Reviews preserved when supplier deleted
- **Business Rule**: OverallRating and ReviewCount updated when reviews added

### Suppliers → SupplierCertifications (One-to-Many)
- **Relationship**: One supplier can have multiple certifications
- **Foreign Key**: SupplierCertifications.SupplierId → Suppliers.SupplierId
- **Delete Behavior**: CASCADE - When supplier is deleted, certifications are deleted
- **Business Rule**: Expired certifications flagged for renewal

## Indexes and Performance

### Primary Indexes

**Suppliers Table**:
- `PRIMARY KEY (SupplierId)` - Clustered index for primary key lookups
- `UNIQUE (Email)` - Ensure email uniqueness
- `INDEX (Name)` - Supplier name searches
- `INDEX (OverallRating DESC)` - Rating-based sorting
- `INDEX (IsVerified)` - Filter verified suppliers
- `INDEX (IsActive)` - Filter active suppliers

**Composite Indexes**:
- `INDEX (OverallRating DESC, IsActive)` - Common filtering pattern
- `INDEX (OverallRating DESC, IsVerified, IsActive)` - Advanced filtering
- `FULLTEXT (Name, Description, Tagline)` - Full-text search

**SupplierLocations Table**:
- `INDEX (SupplierId)` - Join with Suppliers table
- `INDEX (City)` - Location-based filtering
- `INDEX (LocationType)` - Filter by location type
- `INDEX (Latitude, Longitude)` - Geospatial queries
- `INDEX (City, Country, SupplierId)` - Location search optimization

**SupplierSpecializations Table**:
- `UNIQUE (SupplierId, Specialization)` - Prevent duplicates
- `INDEX (SupplierId)` - Join with Suppliers table
- `INDEX (Specialization)` - Filter by specialization

**SupplierMetrics Table**:
- `UNIQUE (SupplierId)` - One metrics record per supplier
- `INDEX (AverageResponseTimeMinutes)` - Sort by response time
- `INDEX (CancellationRate)` - Sort by cancellation rate
- `INDEX (CalculatedAt)` - Track calculation freshness

### Query Optimization Strategies

**Supplier List Query**:
```sql
-- Optimized query for supplier directory with filters
SELECT 
  s.SupplierId, s.Name, s.LogoUrl, s.Tagline, 
  s.OverallRating, s.ReviewCount, s.FleetSize,
  s.YearsInBusiness, s.IsVerified
FROM Suppliers s
WHERE s.IsActive = TRUE
  AND s.OverallRating >= @minRating
  AND EXISTS (
    SELECT 1 FROM SupplierLocations sl 
    WHERE sl.SupplierId = s.SupplierId 
    AND sl.City = @city
  )
ORDER BY s.OverallRating DESC
LIMIT @limit OFFSET @offset;
```

**Supplier Profile Query**:
```sql
-- Optimized query for supplier profile with related data
SELECT 
  s.*,
  sm.AverageResponseTimeMinutes, sm.CancellationRate, 
  sm.BookingCompletionRate, sm.CustomerSatisfactionScore,
  COUNT(DISTINCT sl.LocationId) as LocationCount,
  GROUP_CONCAT(DISTINCT ss.Specialization) as Specializations
FROM Suppliers s
LEFT JOIN SupplierMetrics sm ON s.SupplierId = sm.SupplierId
LEFT JOIN SupplierLocations sl ON s.SupplierId = sl.SupplierId
LEFT JOIN SupplierSpecializations ss ON s.SupplierId = ss.SupplierId
WHERE s.SupplierId = @supplierId
GROUP BY s.SupplierId;
```

**Supplier Search Query**:
```sql
-- Full-text search with relevance scoring
SELECT 
  s.SupplierId, s.Name, s.LogoUrl, s.OverallRating,
  MATCH(s.Name, s.Description, s.Tagline) AGAINST(@searchTerm IN NATURAL LANGUAGE MODE) as relevance
FROM Suppliers s
WHERE s.IsActive = TRUE
  AND MATCH(s.Name, s.Description, s.Tagline) AGAINST(@searchTerm IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC, s.OverallRating DESC
LIMIT @limit;
```

## Data Migration

### Initial Data Import

**Step 1: Create Tables**
```sql
-- Execute table creation scripts in order:
-- 1. Suppliers
-- 2. SupplierLocations
-- 3. SupplierSpecializations
-- 4. SupplierMetrics
-- 5. SupplierCertifications
```

**Step 2: Import Supplier Data**
```sql
-- Import from legacy system or CSV
INSERT INTO Suppliers (
  SupplierId, Name, Email, Phone, Website, 
  Description, IsVerified, CreatedAt
)
SELECT 
  UUID(), Name, Email, Phone, Website,
  Description, IsVerified, NOW()
FROM LegacySuppliers
WHERE IsActive = TRUE;
```

**Step 3: Import Locations**
```sql
-- Geocode addresses and import locations
INSERT INTO SupplierLocations (
  LocationId, SupplierId, LocationName, AddressLine1,
  City, Region, PostalCode, Country, Latitude, Longitude
)
SELECT 
  UUID(), s.SupplierId, l.Name, l.Address,
  l.City, l.State, l.ZipCode, l.Country,
  l.Lat, l.Lng
FROM LegacyLocations l
JOIN Suppliers s ON l.SupplierEmail = s.Email;
```

**Step 4: Calculate Initial Metrics**
```sql
-- Calculate metrics from historical booking data
INSERT INTO SupplierMetrics (
  MetricId, SupplierId, TotalCompletedBookings,
  CancellationRate, BookingCompletionRate
)
SELECT 
  UUID(), s.SupplierId,
  COUNT(CASE WHEN b.Status = 'Completed' THEN 1 END),
  (COUNT(CASE WHEN b.CancelledBy = 'Supplier' THEN 1 END) * 100.0 / COUNT(*)),
  (COUNT(CASE WHEN b.Status = 'Completed' THEN 1 END) * 100.0 / COUNT(*))
FROM Suppliers s
LEFT JOIN Bookings b ON s.SupplierId = b.SupplierId
WHERE b.CreatedAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
GROUP BY s.SupplierId;
```

**Step 5: Assign Specializations**
```sql
-- Auto-assign specializations based on fleet
INSERT INTO SupplierSpecializations (
  SupplierSpecializationId, SupplierId, Specialization
)
SELECT 
  UUID(), s.SupplierId, 'luxury'
FROM Suppliers s
JOIN Vehicles v ON s.SupplierId = v.SupplierId
WHERE v.Category = 'Luxury'
GROUP BY s.SupplierId
HAVING COUNT(*) / s.FleetSize > 0.3;
```

### Ongoing Maintenance

**Daily Metrics Update Job**:
```sql
-- Update supplier metrics daily at 2:00 AM UTC
UPDATE SupplierMetrics sm
JOIN (
  SELECT 
    s.SupplierId,
    AVG(TIMESTAMPDIFF(MINUTE, i.CreatedAt, i.FirstResponseAt)) as AvgResponseTime,
    (COUNT(CASE WHEN b.CancelledBy = 'Supplier' THEN 1 END) * 100.0 / COUNT(*)) as CancelRate,
    (COUNT(CASE WHEN b.Status = 'Completed' THEN 1 END) * 100.0 / COUNT(*)) as CompletionRate,
    COUNT(CASE WHEN b.Status = 'Completed' THEN 1 END) as CompletedCount
  FROM Suppliers s
  LEFT JOIN Inquiries i ON s.SupplierId = i.SupplierId 
    AND i.CreatedAt >= DATE_SUB(NOW(), INTERVAL 90 DAY)
  LEFT JOIN Bookings b ON s.SupplierId = b.SupplierId 
    AND b.CreatedAt >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
  GROUP BY s.SupplierId
) calc ON sm.SupplierId = calc.SupplierId
SET 
  sm.AverageResponseTimeMinutes = COALESCE(calc.AvgResponseTime, 0),
  sm.CancellationRate = COALESCE(calc.CancelRate, 0),
  sm.BookingCompletionRate = COALESCE(calc.CompletionRate, 100),
  sm.TotalCompletedBookings = COALESCE(calc.CompletedCount, 0),
  sm.CalculatedAt = NOW();
```

**Weekly Specialization Update Job**:
```sql
-- Recalculate specializations weekly on Sundays at 4:00 AM UTC
-- Remove outdated specializations
DELETE FROM SupplierSpecializations
WHERE SupplierSpecializationId IN (
  SELECT ss.SupplierSpecializationId
  FROM SupplierSpecializations ss
  JOIN Suppliers s ON ss.SupplierId = s.SupplierId
  JOIN (
    SELECT v.SupplierId, v.Category, COUNT(*) as CategoryCount
    FROM Vehicles v
    GROUP BY v.SupplierId, v.Category
  ) vc ON s.SupplierId = vc.SupplierId
  WHERE (ss.Specialization = 'luxury' AND vc.Category = 'Luxury' AND vc.CategoryCount / s.FleetSize <= 0.3)
     OR (ss.Specialization = 'electric' AND vc.Category IN ('Electric', 'Hybrid') AND vc.CategoryCount / s.FleetSize <= 0.5)
);

-- Add new specializations
INSERT IGNORE INTO SupplierSpecializations (
  SupplierSpecializationId, SupplierId, Specialization
)
SELECT UUID(), s.SupplierId, 'luxury'
FROM Suppliers s
JOIN Vehicles v ON s.SupplierId = v.SupplierId
WHERE v.Category = 'Luxury'
GROUP BY s.SupplierId
HAVING COUNT(*) / s.FleetSize > 0.3;
```

## Data Integrity

### Referential Integrity

**Cascade Deletes**:
- Deleting a supplier cascades to: SupplierLocations, SupplierSpecializations, SupplierMetrics, SupplierCertifications
- Reviews are preserved (SET NULL or archived) for historical data

**Restrict Deletes**:
- Cannot delete supplier with active vehicles
- Cannot delete supplier with pending bookings

### Data Validation

**Triggers**:
```sql
-- Trigger to update FleetSize when vehicles added/removed
DELIMITER $$
CREATE TRIGGER trg_update_fleet_size_insert
AFTER INSERT ON Vehicles
FOR EACH ROW
BEGIN
  UPDATE Suppliers 
  SET FleetSize = FleetSize + 1
  WHERE SupplierId = NEW.SupplierId;
END$$

CREATE TRIGGER trg_update_fleet_size_delete
AFTER DELETE ON Vehicles
FOR EACH ROW
BEGIN
  UPDATE Suppliers 
  SET FleetSize = FleetSize - 1
  WHERE SupplierId = OLD.SupplierId;
END$$
DELIMITER ;
```

```sql
-- Trigger to update rating when review added
DELIMITER $$
CREATE TRIGGER trg_update_supplier_rating
AFTER INSERT ON Reviews
FOR EACH ROW
BEGIN
  UPDATE Suppliers s
  SET 
    s.OverallRating = (
      SELECT AVG(r.Rating)
      FROM Reviews r
      WHERE r.SupplierId = NEW.SupplierId
    ),
    s.ReviewCount = (
      SELECT COUNT(*)
      FROM Reviews r
      WHERE r.SupplierId = NEW.SupplierId
    )
  WHERE s.SupplierId = NEW.SupplierId;
END$$
DELIMITER ;
```

### Constraints

**Business Rules Enforced by Constraints**:
- Rating must be between 0 and 5
- Cancellation rate must be between 0 and 100
- Completion rate must be between 0 and 100
- Latitude must be between -90 and 90
- Longitude must be between -180 and 180
- Certification expiry date must be after issue date
- Email must be unique across all suppliers

## Backup and Recovery

### Backup Strategy

**Daily Full Backup**:
- Backup all supplier-related tables daily at 1:00 AM UTC
- Retention: 30 days
- Storage: Cloud storage with encryption

**Hourly Incremental Backup**:
- Backup changes to Suppliers, SupplierLocations tables
- Retention: 7 days

**Point-in-Time Recovery**:
- Enable binary logging for MySQL
- Allows recovery to any point in time within retention period

### Recovery Procedures

**Supplier Data Corruption**:
1. Identify affected records
2. Restore from most recent backup
3. Replay binary logs to current time
4. Verify data integrity
5. Recalculate metrics if needed

**Metrics Recalculation**:
```sql
-- Recalculate all supplier metrics from scratch
TRUNCATE TABLE SupplierMetrics;
-- Run initial metrics calculation script
-- Verify results against expected values
```

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 (full Unicode support)
- **Collation**: utf8mb4_unicode_ci (case-insensitive, accent-sensitive)
- **Storage Engine**: InnoDB (ACID compliance, foreign keys, transactions)

## Performance Considerations

**Table Partitioning**:
- Consider partitioning SupplierMetrics by CalculatedAt for historical data
- Partition SupplierCertifications by ExpiryDate for expired certifications

**Query Caching**:
- Enable query cache for frequently accessed supplier profiles
- Cache TTL: 1 hour for profiles, 6 hours for metrics

**Connection Pooling**:
- Use connection pooling to reduce connection overhead
- Pool size: 20-50 connections depending on load

**Read Replicas**:
- Use read replicas for supplier search and directory queries
- Write operations go to primary database
- Replication lag: <1 second acceptable

## Monitoring

**Key Metrics**:
- Query execution time (p50, p95, p99)
- Table size growth rate
- Index usage statistics
- Slow query log analysis
- Replication lag (if using replicas)

**Alerts**:
- Alert if query execution time > 200ms
- Alert if table size grows > 20% per week
- Alert if replication lag > 5 seconds
- Alert if disk space < 20% free

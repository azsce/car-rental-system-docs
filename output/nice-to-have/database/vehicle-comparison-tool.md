# Feature: Vehicle Comparison Tool - Database

## Overview

The database schema for the Vehicle Comparison Tool supports optional persistence of comparison sessions for sharing via URL. The schema stores comparison metadata, associated vehicles, and expiration dates for automatic cleanup. This is an optional feature - comparisons can also be generated on-demand without database persistence.

## Sprint Category

nice-to-have

## Feature ID

F-WF-SRCH-004

## Database Schema

### New Tables

**Comparisons Table**
```sql
CREATE TABLE Comparisons (
    comparisonId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    pickupDate DATETIME NOT NULL,
    returnDate DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL,
    INDEX idx_comparison_expiry (expiresAt),
    INDEX idx_user_comparisons (userId, createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**ComparisonVehicles Table**
```sql
CREATE TABLE ComparisonVehicles (
    comparisonVehicleId INT AUTO_INCREMENT PRIMARY KEY,
    comparisonId VARCHAR(50) NOT NULL,
    vehicleId VARCHAR(50) NOT NULL,
    vehicleOrder INT NOT NULL,
    
    FOREIGN KEY (comparisonId) REFERENCES Comparisons(comparisonId) ON DELETE CASCADE,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_comparison_vehicles (comparisonId, vehicleOrder),
    UNIQUE KEY unique_comparison_vehicle (comparisonId, vehicleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Descriptions

**Comparisons Table**
- Stores comparison session metadata
- Links to user if authenticated (optional)
- Includes rental dates for pricing calculation
- Tracks creation and expiration dates
- Expires after 7 days for automatic cleanup

**ComparisonVehicles Table**
- Links vehicles to comparison sessions
- Maintains vehicle order for display
- Prevents duplicate vehicles in same comparison
- Cascade deletes when comparison is removed

### Relationships

**Comparisons → ComparisonVehicles** (One-to-Many)
- One comparison contains multiple vehicles (2-4)
- Foreign key: ComparisonVehicles.comparisonId → Comparisons.comparisonId
- Cascade delete: Removing comparison deletes all vehicle associations

**ComparisonVehicles → Vehicles** (Many-to-One)
- Multiple comparisons can include same vehicle
- Foreign key: ComparisonVehicles.vehicleId → Vehicles.vehicleId
- Cascade delete: Removing vehicle deletes comparison associations

**Comparisons → Users** (Many-to-One, optional)
- Multiple comparisons can be created by one user
- Foreign key: Comparisons.userId → Users.userId
- Set NULL on user deletion (preserve anonymous comparisons)

### Indexes

**Performance Optimization Indexes**

```sql
-- Expiration cleanup (scheduled job)
CREATE INDEX idx_comparison_expiry ON Comparisons(expiresAt);

-- User comparison history
CREATE INDEX idx_user_comparisons ON Comparisons(userId, createdAt DESC);

-- Vehicle lookup in comparison
CREATE INDEX idx_comparison_vehicles ON ComparisonVehicles(comparisonId, vehicleOrder);

-- Prevent duplicate vehicles in comparison
CREATE UNIQUE INDEX unique_comparison_vehicle ON ComparisonVehicles(comparisonId, vehicleId);
```

### Sample Queries

**Create Comparison**
```sql
-- Insert comparison metadata
INSERT INTO Comparisons (comparisonId, userId, pickupDate, returnDate, expiresAt)
VALUES (
    'CMP-20260223-A1B2C3',
    'USER-789',
    '2026-03-01 10:00:00',
    '2026-03-05 10:00:00',
    DATE_ADD(NOW(), INTERVAL 7 DAY)
);

-- Insert vehicles in comparison
INSERT INTO ComparisonVehicles (comparisonId, vehicleId, vehicleOrder)
VALUES 
    ('CMP-20260223-A1B2C3', 'VEH-001', 1),
    ('CMP-20260223-A1B2C3', 'VEH-002', 2),
    ('CMP-20260223-A1B2C3', 'VEH-003', 3);
```

**Retrieve Comparison with Vehicles**
```sql
SELECT 
    c.comparisonId,
    c.userId,
    c.pickupDate,
    c.returnDate,
    c.createdAt,
    c.expiresAt,
    cv.vehicleId,
    cv.vehicleOrder,
    v.make,
    v.model,
    v.year,
    v.category,
    v.transmission,
    v.fuelType,
    v.seats,
    v.doors,
    v.luggageSpace
FROM Comparisons c
JOIN ComparisonVehicles cv ON c.comparisonId = cv.comparisonId
JOIN Vehicles v ON cv.vehicleId = v.vehicleId
WHERE c.comparisonId = 'CMP-20260223-A1B2C3'
  AND c.expiresAt > NOW()
ORDER BY cv.vehicleOrder;
```

**Get User's Recent Comparisons**
```sql
SELECT 
    c.comparisonId,
    c.pickupDate,
    c.returnDate,
    c.createdAt,
    COUNT(cv.vehicleId) AS vehicleCount
FROM Comparisons c
LEFT JOIN ComparisonVehicles cv ON c.comparisonId = cv.comparisonId
WHERE c.userId = 'USER-789'
  AND c.expiresAt > NOW()
GROUP BY c.comparisonId, c.pickupDate, c.returnDate, c.createdAt
ORDER BY c.createdAt DESC
LIMIT 10;
```

**Cleanup Expired Comparisons**
```sql
-- Delete expired comparisons (cascade deletes ComparisonVehicles)
DELETE FROM Comparisons
WHERE expiresAt < NOW();
```

**Check if Vehicle is in Comparison**
```sql
SELECT COUNT(*) AS isInComparison
FROM ComparisonVehicles
WHERE comparisonId = 'CMP-20260223-A1B2C3'
  AND vehicleId = 'VEH-001';
```

**Get Comparison Statistics**
```sql
SELECT 
    COUNT(*) AS totalComparisons,
    COUNT(DISTINCT userId) AS uniqueUsers,
    AVG(vehicleCount) AS avgVehiclesPerComparison,
    MAX(createdAt) AS lastComparisonDate
FROM (
    SELECT 
        c.comparisonId,
        c.userId,
        c.createdAt,
        COUNT(cv.vehicleId) AS vehicleCount
    FROM Comparisons c
    LEFT JOIN ComparisonVehicles cv ON c.comparisonId = cv.comparisonId
    WHERE c.expiresAt > NOW()
    GROUP BY c.comparisonId, c.userId, c.createdAt
) AS comparison_stats;
```

### Data Migration

**Migration Script**
```sql
-- Create Comparisons table
CREATE TABLE IF NOT EXISTS Comparisons (
    comparisonId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    pickupDate DATETIME NOT NULL,
    returnDate DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME NOT NULL,
    
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL,
    INDEX idx_comparison_expiry (expiresAt),
    INDEX idx_user_comparisons (userId, createdAt DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create ComparisonVehicles table
CREATE TABLE IF NOT EXISTS ComparisonVehicles (
    comparisonVehicleId INT AUTO_INCREMENT PRIMARY KEY,
    comparisonId VARCHAR(50) NOT NULL,
    vehicleId VARCHAR(50) NOT NULL,
    vehicleOrder INT NOT NULL,
    
    FOREIGN KEY (comparisonId) REFERENCES Comparisons(comparisonId) ON DELETE CASCADE,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_comparison_vehicles (comparisonId, vehicleOrder),
    UNIQUE KEY unique_comparison_vehicle (comparisonId, vehicleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Rollback Script**
```sql
-- Drop tables in reverse order (foreign key dependencies)
DROP TABLE IF EXISTS ComparisonVehicles;
DROP TABLE IF EXISTS Comparisons;
```

### Scheduled Maintenance

**Cleanup Job (Daily)**
```sql
-- Delete comparisons expired more than 1 day ago
DELETE FROM Comparisons
WHERE expiresAt < DATE_SUB(NOW(), INTERVAL 1 DAY);

-- Log cleanup statistics
SELECT 
    COUNT(*) AS deletedComparisons,
    NOW() AS cleanupDate
FROM Comparisons
WHERE expiresAt < DATE_SUB(NOW(), INTERVAL 1 DAY);
```

**Optimization Job (Weekly)**
```sql
-- Optimize tables for better performance
OPTIMIZE TABLE Comparisons;
OPTIMIZE TABLE ComparisonVehicles;

-- Analyze tables for query optimization
ANALYZE TABLE Comparisons;
ANALYZE TABLE ComparisonVehicles;
```

## Technology Stack

- Database: MySQL 8.0+ with InnoDB storage engine
- Character Set: utf8mb4 for full Unicode support
- Collation: utf8mb4_unicode_ci for proper sorting
- Storage Engine: InnoDB for ACID compliance and foreign key support

## Implementation Notes

**Optional Persistence**
- Comparison persistence is optional
- Can generate comparisons on-demand without database
- Persistence enables sharing via URL
- Consider storage costs vs. feature value

**Expiration Strategy**
- Set expiration to 7 days from creation
- Run daily cleanup job to remove expired comparisons
- Consider shorter expiration (24 hours) to reduce storage
- Log cleanup statistics for monitoring

**Data Integrity**
- Use foreign key constraints for referential integrity
- Use unique constraint to prevent duplicate vehicles in comparison
- Use cascade delete to maintain consistency
- Validate vehicle order (1-4) at application layer

**Performance Considerations**
- Index on expiresAt for fast cleanup queries
- Index on userId for user comparison history
- Composite index on (comparisonId, vehicleOrder) for ordered retrieval
- Consider partitioning Comparisons table by creation date if volume is high

**Storage Optimization**
- Comparisons table is lightweight (metadata only)
- ComparisonVehicles table stores only IDs and order
- Vehicle details retrieved from Vehicles table (no duplication)
- Automatic cleanup prevents unbounded growth

**Monitoring**
- Track comparison creation rate
- Monitor expired comparison cleanup
- Alert on cleanup job failures
- Track storage usage for comparison tables

**Alternative: Stateless Approach**
- Encode vehicle IDs and dates in URL
- No database persistence required
- Generate comparison data on-demand
- Simpler implementation, no cleanup needed
- Consider this approach if storage is a concern

**Security Considerations**
- Comparison IDs should be non-sequential and unpredictable
- Use UUID or timestamp + random string
- Validate comparison ownership for deletion
- Implement rate limiting on comparison creation
- Consider adding access control for sensitive comparisons

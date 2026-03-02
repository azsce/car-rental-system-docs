# Feature: Comprehensive Vehicle Details - Database

## Overview

The database schema for Comprehensive Vehicle Details supports storage and retrieval of detailed vehicle information, specifications, features, images, reviews, ratings, availability data, and supplier information. The schema is optimized for fast queries with appropriate indexes and relationships to support the vehicle details display feature.

## Sprint Category

sprint-mvp

## Feature ID

F-SD-009

## Database Schema

### Existing Tables (No Changes Required)

**Vehicles Table**
- Primary table storing vehicle specifications
- Already contains: vehicleId, make, model, year, licensePlate, category, type, transmission, fuelType, seats, doors, luggageSpace, mileagePolicy, mileageLimit, supplierId
- Indexed on vehicleId (Primary Key)
- Foreign key to Suppliers table

**Suppliers Table**
- Stores supplier/host information
- Contains: supplierId, name, logo, location, rating, responseTime, contactInfo
- Indexed on supplierId (Primary Key)

**Bookings Table**
- Stores booking records for availability checking
- Contains: bookingId, vehicleId, userId, pickupDate, returnDate, status
- Indexed on vehicleId, pickupDate, returnDate for availability queries

### Enhanced Tables

**VehicleImages Table**
```sql
CREATE TABLE VehicleImages (
    vehicleImageId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    imageUrl VARCHAR(500) NOT NULL,
    imageCategory ENUM('exterior', 'interior', 'features', 'damage') NOT NULL,
    imageOrder INT NOT NULL DEFAULT 0,
    caption VARCHAR(255),
    altText VARCHAR(255),
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_images (vehicleId, imageOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**VehicleFeatures Table**
```sql
CREATE TABLE VehicleFeatures (
    vehicleFeatureId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    featureCategory ENUM('Safety', 'Comfort', 'Technology', 'Accessibility') NOT NULL,
    featureName VARCHAR(100) NOT NULL,
    featureDescription VARCHAR(255),
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_features (vehicleId, featureCategory)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Reviews Table**
```sql
CREATE TABLE Reviews (
    reviewId VARCHAR(50) PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    bookingId VARCHAR(50) NOT NULL,
    userId VARCHAR(50) NOT NULL,
    overallRating DECIMAL(2,1) NOT NULL CHECK (overallRating >= 1.0 AND overallRating <= 5.0),
    cleanlinessRating DECIMAL(2,1) CHECK (cleanlinessRating >= 1.0 AND cleanlinessRating <= 5.0),
    performanceRating DECIMAL(2,1) CHECK (performanceRating >= 1.0 AND performanceRating <= 5.0),
    valueRating DECIMAL(2,1) CHECK (valueRating >= 1.0 AND valueRating <= 5.0),
    accuracyRating DECIMAL(2,1) CHECK (accuracyRating >= 1.0 AND accuracyRating <= 5.0),
    reviewText TEXT,
    verifiedBooking BOOLEAN NOT NULL DEFAULT TRUE,
    helpfulVotes INT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    FOREIGN KEY (bookingId) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
    INDEX idx_vehicle_reviews (vehicleId, createdAt DESC),
    INDEX idx_vehicle_rating (vehicleId, overallRating DESC),
    INDEX idx_helpful_reviews (vehicleId, helpfulVotes DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**ReviewPhotos Table**
```sql
CREATE TABLE ReviewPhotos (
    reviewPhotoId INT AUTO_INCREMENT PRIMARY KEY,
    reviewId VARCHAR(50) NOT NULL,
    photoUrl VARCHAR(500) NOT NULL,
    photoOrder INT NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES Reviews(reviewId) ON DELETE CASCADE,
    INDEX idx_review_photos (reviewId, photoOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**HostResponses Table**
```sql
CREATE TABLE HostResponses (
    hostResponseId INT AUTO_INCREMENT PRIMARY KEY,
    reviewId VARCHAR(50) NOT NULL UNIQUE,
    supplierId VARCHAR(50) NOT NULL,
    responseText TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reviewId) REFERENCES Reviews(reviewId) ON DELETE CASCADE,
    FOREIGN KEY (supplierId) REFERENCES Suppliers(supplierId) ON DELETE CASCADE,
    INDEX idx_host_responses (reviewId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**VehiclePricing Table**
```sql
CREATE TABLE VehiclePricing (
    vehiclePricingId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    hourlyRate DECIMAL(10,2),
    dailyRate DECIMAL(10,2) NOT NULL,
    weeklyRate DECIMAL(10,2),
    biweeklyRate DECIMAL(10,2),
    monthlyRate DECIMAL(10,2),
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    effectiveDate DATE NOT NULL,
    expiryDate DATE,
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_pricing (vehicleId, effectiveDate DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**InsuranceOptions Table**
```sql
CREATE TABLE InsuranceOptions (
    insuranceOptionId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    insuranceType ENUM('Theft Protection', 'Collision Damage Waiver', 'Full Insurance') NOT NULL,
    dailyCost DECIMAL(10,2) NOT NULL,
    coverageDescription TEXT,
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_insurance_options (vehicleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**AdditionalServices Table**
```sql
CREATE TABLE AdditionalServices (
    additionalServiceId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    serviceName VARCHAR(100) NOT NULL,
    dailyCost DECIMAL(10,2) NOT NULL,
    serviceDescription VARCHAR(255),
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_additional_services (vehicleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**VehicleEnvironmental Table**
```sql
CREATE TABLE VehicleEnvironmental (
    vehicleEnvironmentalId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL UNIQUE,
    co2EmissionsPerKm DECIMAL(5,2),
    fuelEfficiencyMpg DECIMAL(5,2),
    ecoFriendlyBadge BOOLEAN NOT NULL DEFAULT FALSE,
    carbonOffsetCost DECIMAL(10,2),
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_eco_friendly (ecoFriendlyBadge)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**VehicleAccessibility Table**
```sql
CREATE TABLE VehicleAccessibility (
    vehicleAccessibilityId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    accessibilityFeature VARCHAR(100) NOT NULL,
    featureDescription VARCHAR(255),
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_accessibility (vehicleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**MaintenanceSchedule Table**
```sql
CREATE TABLE MaintenanceSchedule (
    maintenanceScheduleId INT AUTO_INCREMENT PRIMARY KEY,
    vehicleId VARCHAR(50) NOT NULL,
    startDate DATE NOT NULL,
    endDate DATE NOT NULL,
    maintenanceType VARCHAR(100),
    notes TEXT,
    
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_maintenance_schedule (vehicleId, startDate, endDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**Vehicles → VehicleImages** (One-to-Many)
- One vehicle has multiple images
- Foreign key: VehicleImages.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes all images

**Vehicles → VehicleFeatures** (One-to-Many)
- One vehicle has multiple features
- Foreign key: VehicleFeatures.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes all features

**Vehicles → Reviews** (One-to-Many)
- One vehicle has multiple reviews
- Foreign key: Reviews.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes all reviews

**Reviews → ReviewPhotos** (One-to-Many)
- One review can have multiple photos
- Foreign key: ReviewPhotos.reviewId → Reviews.reviewId
- Cascade delete: Deleting review removes all photos

**Reviews → HostResponses** (One-to-One)
- One review can have one host response
- Foreign key: HostResponses.reviewId → Reviews.reviewId
- Unique constraint on reviewId
- Cascade delete: Deleting review removes host response

**Vehicles → VehiclePricing** (One-to-Many)
- One vehicle has pricing history
- Foreign key: VehiclePricing.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes pricing records

**Vehicles → InsuranceOptions** (One-to-Many)
- One vehicle has multiple insurance options
- Foreign key: InsuranceOptions.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes insurance options

**Vehicles → AdditionalServices** (One-to-Many)
- One vehicle has multiple additional services
- Foreign key: AdditionalServices.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes services

**Vehicles → VehicleEnvironmental** (One-to-One)
- One vehicle has one environmental record
- Foreign key: VehicleEnvironmental.vehicleId → Vehicles.vehicleId
- Unique constraint on vehicleId
- Cascade delete: Deleting vehicle removes environmental data

**Vehicles → VehicleAccessibility** (One-to-Many)
- One vehicle has multiple accessibility features
- Foreign key: VehicleAccessibility.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes accessibility features

**Vehicles → MaintenanceSchedule** (One-to-Many)
- One vehicle has multiple maintenance schedules
- Foreign key: MaintenanceSchedule.vehicleId → Vehicles.vehicleId
- Cascade delete: Deleting vehicle removes maintenance schedules

**Vehicles → Suppliers** (Many-to-One)
- Multiple vehicles belong to one supplier
- Foreign key: Vehicles.supplierId → Suppliers.supplierId

**Reviews → Bookings** (Many-to-One)
- Multiple reviews can reference one booking (if multiple vehicles in booking)
- Foreign key: Reviews.bookingId → Bookings.bookingId

**Reviews → Users** (Many-to-One)
- Multiple reviews written by one user
- Foreign key: Reviews.userId → Users.userId

**HostResponses → Suppliers** (Many-to-One)
- Multiple responses from one supplier
- Foreign key: HostResponses.supplierId → Suppliers.supplierId

### Indexes

**Performance Optimization Indexes**

```sql
-- Vehicle lookups (Primary Key, already indexed)
-- Vehicles.vehicleId

-- Image retrieval for vehicle
CREATE INDEX idx_vehicle_images ON VehicleImages(vehicleId, imageOrder);

-- Feature retrieval for vehicle
CREATE INDEX idx_vehicle_features ON VehicleFeatures(vehicleId, featureCategory);

-- Review retrieval sorted by date
CREATE INDEX idx_vehicle_reviews ON Reviews(vehicleId, createdAt DESC);

-- Review retrieval sorted by rating
CREATE INDEX idx_vehicle_rating ON Reviews(vehicleId, overallRating DESC);

-- Review retrieval sorted by helpfulness
CREATE INDEX idx_helpful_reviews ON Reviews(vehicleId, helpfulVotes DESC);

-- Review photo retrieval
CREATE INDEX idx_review_photos ON ReviewPhotos(reviewId, photoOrder);

-- Host response lookup
CREATE INDEX idx_host_responses ON HostResponses(reviewId);

-- Pricing retrieval (current pricing)
CREATE INDEX idx_vehicle_pricing ON VehiclePricing(vehicleId, effectiveDate DESC);

-- Insurance options retrieval
CREATE INDEX idx_insurance_options ON InsuranceOptions(vehicleId);

-- Additional services retrieval
CREATE INDEX idx_additional_services ON AdditionalServices(vehicleId);

-- Eco-friendly vehicle filtering
CREATE INDEX idx_eco_friendly ON VehicleEnvironmental(ecoFriendlyBadge);

-- Accessibility feature retrieval
CREATE INDEX idx_vehicle_accessibility ON VehicleAccessibility(vehicleId);

-- Availability checking (bookings)
CREATE INDEX idx_booking_availability ON Bookings(vehicleId, pickupDate, returnDate);

-- Maintenance schedule checking
CREATE INDEX idx_maintenance_schedule ON MaintenanceSchedule(vehicleId, startDate, endDate);
```

### Sample Queries

**Retrieve Complete Vehicle Details**
```sql
SELECT 
    v.*,
    s.name AS supplierName,
    s.rating AS supplierRating,
    s.location AS supplierLocation,
    s.responseTime AS supplierResponseTime,
    ve.co2EmissionsPerKm,
    ve.fuelEfficiencyMpg,
    ve.ecoFriendlyBadge
FROM Vehicles v
LEFT JOIN Suppliers s ON v.supplierId = s.supplierId
LEFT JOIN VehicleEnvironmental ve ON v.vehicleId = ve.vehicleId
WHERE v.vehicleId = 'VEH-12345';
```

**Retrieve Vehicle Images**
```sql
SELECT imageUrl, imageCategory, imageOrder, caption, altText
FROM VehicleImages
WHERE vehicleId = 'VEH-12345'
ORDER BY imageOrder ASC;
```

**Retrieve Vehicle Features**
```sql
SELECT featureCategory, featureName, featureDescription
FROM VehicleFeatures
WHERE vehicleId = 'VEH-12345'
ORDER BY featureCategory, featureName;
```

**Calculate Aggregate Rating**
```sql
SELECT 
    COUNT(*) AS reviewCount,
    AVG(overallRating) AS avgOverallRating,
    AVG(cleanlinessRating) AS avgCleanlinessRating,
    AVG(performanceRating) AS avgPerformanceRating,
    AVG(valueRating) AS avgValueRating,
    AVG(accuracyRating) AS avgAccuracyRating,
    SUM(CASE WHEN overallRating = 5.0 THEN 1 ELSE 0 END) AS fiveStarCount,
    SUM(CASE WHEN overallRating >= 4.0 AND overallRating < 5.0 THEN 1 ELSE 0 END) AS fourStarCount,
    SUM(CASE WHEN overallRating >= 3.0 AND overallRating < 4.0 THEN 1 ELSE 0 END) AS threeStarCount,
    SUM(CASE WHEN overallRating >= 2.0 AND overallRating < 3.0 THEN 1 ELSE 0 END) AS twoStarCount,
    SUM(CASE WHEN overallRating < 2.0 THEN 1 ELSE 0 END) AS oneStarCount
FROM Reviews
WHERE vehicleId = 'VEH-12345';
```

**Retrieve Paginated Reviews with Host Responses**
```sql
SELECT 
    r.reviewId,
    r.overallRating,
    r.cleanlinessRating,
    r.performanceRating,
    r.valueRating,
    r.accuracyRating,
    r.reviewText,
    r.verifiedBooking,
    r.helpfulVotes,
    r.createdAt,
    u.name AS reviewerName,
    u.avatar AS reviewerAvatar,
    hr.responseText AS hostResponse,
    hr.createdAt AS hostResponseDate
FROM Reviews r
LEFT JOIN Users u ON r.userId = u.userId
LEFT JOIN HostResponses hr ON r.reviewId = hr.reviewId
WHERE r.vehicleId = 'VEH-12345'
ORDER BY r.helpfulVotes DESC, r.createdAt DESC
LIMIT 10 OFFSET 0;
```

**Retrieve Review Photos**
```sql
SELECT photoUrl, photoOrder
FROM ReviewPhotos
WHERE reviewId = 'REV-456'
ORDER BY photoOrder ASC;
```

**Retrieve Current Pricing**
```sql
SELECT hourlyRate, dailyRate, weeklyRate, biweeklyRate, monthlyRate, currency
FROM VehiclePricing
WHERE vehicleId = 'VEH-12345'
  AND effectiveDate <= CURDATE()
  AND (expiryDate IS NULL OR expiryDate >= CURDATE())
ORDER BY effectiveDate DESC
LIMIT 1;
```

**Retrieve Insurance Options**
```sql
SELECT insuranceType, dailyCost, coverageDescription
FROM InsuranceOptions
WHERE vehicleId = 'VEH-12345';
```

**Retrieve Additional Services**
```sql
SELECT serviceName, dailyCost, serviceDescription
FROM AdditionalServices
WHERE vehicleId = 'VEH-12345';
```

**Check Availability for Date Range**
```sql
SELECT 
    DATE(pickup.date) AS date,
    CASE 
        WHEN b.bookingId IS NOT NULL THEN 'booked'
        WHEN m.maintenanceScheduleId IS NOT NULL THEN 'blocked'
        ELSE 'available'
    END AS status
FROM (
    SELECT DATE_ADD('2026-03-01', INTERVAL seq DAY) AS date
    FROM (
        SELECT @row := @row + 1 AS seq
        FROM (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t1,
             (SELECT 0 UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL SELECT 9) t2,
             (SELECT @row := -1) r
    ) seq
    WHERE DATE_ADD('2026-03-01', INTERVAL seq DAY) <= '2026-03-31'
) pickup
LEFT JOIN Bookings b ON b.vehicleId = 'VEH-12345' 
    AND DATE(pickup.date) BETWEEN DATE(b.pickupDate) AND DATE(b.returnDate)
    AND b.status IN ('confirmed', 'active')
LEFT JOIN MaintenanceSchedule m ON m.vehicleId = 'VEH-12345'
    AND DATE(pickup.date) BETWEEN m.startDate AND m.endDate
ORDER BY pickup.date;
```

### Data Migration

**Migration Script for New Tables**
```sql
-- Create VehicleImages table
CREATE TABLE IF NOT EXISTS VehicleImages (...);

-- Create VehicleFeatures table
CREATE TABLE IF NOT EXISTS VehicleFeatures (...);

-- Create Reviews table
CREATE TABLE IF NOT EXISTS Reviews (...);

-- Create ReviewPhotos table
CREATE TABLE IF NOT EXISTS ReviewPhotos (...);

-- Create HostResponses table
CREATE TABLE IF NOT EXISTS HostResponses (...);

-- Create VehiclePricing table
CREATE TABLE IF NOT EXISTS VehiclePricing (...);

-- Create InsuranceOptions table
CREATE TABLE IF NOT EXISTS InsuranceOptions (...);

-- Create AdditionalServices table
CREATE TABLE IF NOT EXISTS AdditionalServices (...);

-- Create VehicleEnvironmental table
CREATE TABLE IF NOT EXISTS VehicleEnvironmental (...);

-- Create VehicleAccessibility table
CREATE TABLE IF NOT EXISTS VehicleAccessibility (...);

-- Create MaintenanceSchedule table
CREATE TABLE IF NOT EXISTS MaintenanceSchedule (...);

-- Create all indexes
CREATE INDEX idx_vehicle_images ON VehicleImages(vehicleId, imageOrder);
-- ... (all other indexes)
```

## Technology Stack

- Database: MySQL 8.0+ with InnoDB storage engine
- Character Set: utf8mb4 for full Unicode support
- Collation: utf8mb4_unicode_ci for proper sorting
- Storage Engine: InnoDB for ACID compliance and foreign key support

## Implementation Notes

**Data Integrity**
- Use foreign key constraints for referential integrity
- Use CHECK constraints for rating validation (1.0-5.0)
- Use ENUM types for fixed value sets
- Use NOT NULL constraints where appropriate
- Use UNIQUE constraints for one-to-one relationships

**Performance Considerations**
- Index all foreign keys for fast joins
- Index commonly queried columns (vehicleId, createdAt, rating)
- Use composite indexes for multi-column queries
- Implement query result caching at application layer
- Consider partitioning Reviews table by date if volume is high

**Backup and Recovery**
- Implement daily full backups
- Implement hourly incremental backups
- Test restore procedures regularly
- Maintain backup retention for 30 days

**Monitoring**
- Monitor slow queries (>100ms)
- Track table sizes and growth rates
- Monitor index usage and effectiveness
- Alert on foreign key constraint violations

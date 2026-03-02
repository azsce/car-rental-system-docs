# Feature: Vehicle Inventory Management (Database)

## Overview

Database schema design for comprehensive vehicle inventory management supporting vehicle CRUD operations, status tracking, lifecycle metrics, and multi-location assignments. Implements normalized relational design with proper constraints, indexes, and audit trails.

## Sprint Category

sprint-mvp

## Feature ID

F-ADMIN-FM-001, F-ADMIN-FM-002, F-ADMIN-FM-005, F-FUNC-FM-001, F-FUNC-FM-002

## Database Specifications

### Schema Changes

**New Tables:**
- vehicles: Primary vehicle inventory table
- vehicle_images: Multiple images per vehicle with ordering
- vehicle_status_history: Audit trail for status changes
- vehicle_lifecycle_metrics: Calculated performance metrics
- vehicle_locations: Many-to-many relationship between vehicles and locations

**Modified Tables:**
- None (new feature)

### Table Definitions

**vehicles**

Primary table storing all vehicle inventory information.

```sql
CREATE TABLE vehicles (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(200) NOT NULL,
  license_plate VARCHAR(20) NOT NULL,
  year INT NOT NULL,
  vin VARCHAR(17) NOT NULL,
  category ENUM('economy', 'standard', 'luxury', 'suv', 'van', 'electric', 'hybrid') NOT NULL,
  supplier_id CHAR(36) NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  seats INT NOT NULL,
  doors INT NOT NULL,
  transmission_type ENUM('automatic', 'manual', 'cvt') NOT NULL,
  fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'plugin-hybrid') NOT NULL,
  mileage_unlimited BOOLEAN NOT NULL DEFAULT FALSE,
  mileage_daily_limit INT NULL,
  mileage_overage_fee DECIMAL(10,2) NULL,
  features JSON NULL,
  pricing_hourly DECIMAL(10,2) NULL,
  pricing_daily DECIMAL(10,2) NOT NULL,
  pricing_weekly DECIMAL(10,2) NULL,
  pricing_monthly DECIMAL(10,2) NULL,
  status ENUM('available', 'unavailable', 'fully_booked', 'coming_soon', 'maintenance', 'retired') NOT NULL DEFAULT 'coming_soon',
  current_mileage INT NOT NULL DEFAULT 0,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36) NOT NULL,
  updated_by CHAR(36) NOT NULL,
  
  CONSTRAINT chk_year CHECK (year >= 1900 AND year <= YEAR(CURDATE()) + 1),
  CONSTRAINT chk_seats CHECK (seats >= 2 AND seats <= 15),
  CONSTRAINT chk_doors CHECK (doors >= 2 AND doors <= 5),
  CONSTRAINT chk_mileage_limit CHECK (mileage_daily_limit IS NULL OR mileage_daily_limit > 0),
  CONSTRAINT chk_mileage_fee CHECK (mileage_overage_fee IS NULL OR mileage_overage_fee >= 0),
  CONSTRAINT chk_pricing_hourly CHECK (pricing_hourly IS NULL OR pricing_hourly >= 0),
  CONSTRAINT chk_pricing_daily CHECK (pricing_daily >= 10.00),
  CONSTRAINT chk_pricing_weekly CHECK (pricing_weekly IS NULL OR pricing_weekly >= 0),
  CONSTRAINT chk_pricing_monthly CHECK (pricing_monthly IS NULL OR pricing_monthly >= 0),
  CONSTRAINT chk_current_mileage CHECK (current_mileage >= 0),
  CONSTRAINT chk_mileage_policy CHECK (
    (mileage_unlimited = TRUE AND mileage_daily_limit IS NULL AND mileage_overage_fee IS NULL) OR
    (mileage_unlimited = FALSE AND mileage_daily_limit IS NOT NULL AND mileage_overage_fee IS NOT NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_images**

Stores multiple images per vehicle with display ordering.

```sql
CREATE TABLE vehicle_images (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_display_order CHECK (display_order >= 0 AND display_order < 20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_status_history**

Audit trail for all vehicle status changes.

```sql
CREATE TABLE vehicle_status_history (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  old_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  reason TEXT NULL,
  expected_return_date TIMESTAMP NULL,
  changed_by CHAR(36) NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_vehicle_date (vehicle_id, changed_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_lifecycle_metrics**

Stores calculated lifecycle and performance metrics per vehicle.

```sql
CREATE TABLE vehicle_lifecycle_metrics (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL UNIQUE,
  acquisition_date DATE NOT NULL,
  acquisition_cost DECIMAL(12,2) NOT NULL,
  total_bookings INT NOT NULL DEFAULT 0,
  total_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_maintenance_cost DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_mileage INT NOT NULL DEFAULT 0,
  utilization_rate DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  average_rating DECIMAL(3,2) NULL,
  profitability DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  retirement_score DECIMAL(5,2) NULL,
  last_calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT chk_acquisition_cost CHECK (acquisition_cost >= 0),
  CONSTRAINT chk_total_bookings CHECK (total_bookings >= 0),
  CONSTRAINT chk_total_revenue CHECK (total_revenue >= 0),
  CONSTRAINT chk_total_maintenance_cost CHECK (total_maintenance_cost >= 0),
  CONSTRAINT chk_total_mileage CHECK (total_mileage >= 0),
  CONSTRAINT chk_utilization_rate CHECK (utilization_rate >= 0 AND utilization_rate <= 100),
  CONSTRAINT chk_average_rating CHECK (average_rating IS NULL OR (average_rating >= 0 AND average_rating <= 5)),
  CONSTRAINT chk_retirement_score CHECK (retirement_score IS NULL OR (retirement_score >= 0 AND retirement_score <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**vehicle_locations**

Many-to-many junction table for vehicle-location assignments.

```sql
CREATE TABLE vehicle_locations (
  vehicle_id CHAR(36) NOT NULL,
  location_id CHAR(36) NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  assigned_by CHAR(36) NOT NULL,
  
  PRIMARY KEY (vehicle_id, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**vehicles → suppliers**
```sql
ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_supplier
FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```
- Many vehicles belong to one supplier
- Cannot delete supplier with vehicles
- Cascade updates to supplier ID

**vehicles → users (created_by, updated_by)**
```sql
ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_created_by
FOREIGN KEY (created_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE vehicles
ADD CONSTRAINT fk_vehicles_updated_by
FOREIGN KEY (updated_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```
- Track who created and last updated each vehicle
- Cannot delete users who created/updated vehicles
- Cascade updates to user IDs

**vehicle_images → vehicles**
```sql
ALTER TABLE vehicle_images
ADD CONSTRAINT fk_vehicle_images_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
- Many images belong to one vehicle
- Delete images when vehicle is deleted
- Cascade updates to vehicle ID

**vehicle_status_history → vehicles**
```sql
ALTER TABLE vehicle_status_history
ADD CONSTRAINT fk_vehicle_status_history_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
- Many status history entries per vehicle
- Delete history when vehicle is deleted
- Cascade updates to vehicle ID

**vehicle_status_history → users (changed_by)**
```sql
ALTER TABLE vehicle_status_history
ADD CONSTRAINT fk_vehicle_status_history_user
FOREIGN KEY (changed_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```
- Track who changed each status
- Cannot delete users who changed statuses
- Cascade updates to user IDs

**vehicle_lifecycle_metrics → vehicles**
```sql
ALTER TABLE vehicle_lifecycle_metrics
ADD CONSTRAINT fk_vehicle_lifecycle_metrics_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
- One-to-one relationship
- Delete metrics when vehicle is deleted
- Cascade updates to vehicle ID

**vehicle_locations → vehicles**
```sql
ALTER TABLE vehicle_locations
ADD CONSTRAINT fk_vehicle_locations_vehicle
FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
- Many-to-many relationship
- Delete assignments when vehicle is deleted
- Cascade updates to vehicle ID

**vehicle_locations → locations**
```sql
ALTER TABLE vehicle_locations
ADD CONSTRAINT fk_vehicle_locations_location
FOREIGN KEY (location_id) REFERENCES locations(id)
ON DELETE CASCADE
ON UPDATE CASCADE;
```
- Many-to-many relationship
- Delete assignments when location is deleted
- Cascade updates to location ID

**vehicle_locations → users (assigned_by)**
```sql
ALTER TABLE vehicle_locations
ADD CONSTRAINT fk_vehicle_locations_user
FOREIGN KEY (assigned_by) REFERENCES users(id)
ON DELETE RESTRICT
ON UPDATE CASCADE;
```
- Track who assigned vehicle to location
- Cannot delete users who made assignments
- Cascade updates to user IDs

### Indexes

**Primary Indexes (Uniqueness)**
```sql
CREATE UNIQUE INDEX idx_vehicles_license_plate_active 
ON vehicles(license_plate) 
WHERE is_deleted = FALSE;

CREATE UNIQUE INDEX idx_vehicles_vin 
ON vehicles(vin);

CREATE UNIQUE INDEX idx_vehicle_lifecycle_metrics_vehicle 
ON vehicle_lifecycle_metrics(vehicle_id);
```

**Search and Filter Indexes**
```sql
CREATE INDEX idx_vehicles_status 
ON vehicles(status, is_deleted);

CREATE INDEX idx_vehicles_category 
ON vehicles(category, is_deleted);

CREATE INDEX idx_vehicles_supplier 
ON vehicles(supplier_id, is_deleted);

CREATE INDEX idx_vehicles_created_at 
ON vehicles(created_at DESC);

CREATE INDEX idx_vehicles_updated_at 
ON vehicles(updated_at DESC);
```

**Composite Indexes for Common Queries**
```sql
CREATE INDEX idx_vehicles_status_category 
ON vehicles(status, category, is_deleted);

CREATE INDEX idx_vehicles_supplier_status 
ON vehicles(supplier_id, status, is_deleted);
```

**Full-Text Search Index**
```sql
CREATE FULLTEXT INDEX idx_vehicles_fulltext 
ON vehicles(name, make, model, license_plate);
```

**Related Table Indexes**
```sql
CREATE INDEX idx_vehicle_images_vehicle 
ON vehicle_images(vehicle_id, display_order);

CREATE INDEX idx_vehicle_images_primary 
ON vehicle_images(vehicle_id, is_primary);

CREATE INDEX idx_vehicle_status_history_vehicle_date 
ON vehicle_status_history(vehicle_id, changed_at DESC);

CREATE INDEX idx_vehicle_status_history_date 
ON vehicle_status_history(changed_at DESC);

CREATE INDEX idx_vehicle_lifecycle_retirement 
ON vehicle_lifecycle_metrics(retirement_score DESC) 
WHERE retirement_score IS NOT NULL;

CREATE INDEX idx_vehicle_locations_vehicle 
ON vehicle_locations(vehicle_id);

CREATE INDEX idx_vehicle_locations_location 
ON vehicle_locations(location_id);
```

### Data Integrity Constraints

**Business Rule Constraints**

Ensure pricing structure is logical:
```sql
ALTER TABLE vehicles
ADD CONSTRAINT chk_pricing_weekly_discount
CHECK (pricing_weekly IS NULL OR pricing_weekly < pricing_daily * 7);

ALTER TABLE vehicles
ADD CONSTRAINT chk_pricing_monthly_discount
CHECK (pricing_monthly IS NULL OR pricing_monthly < pricing_daily * 30);
```

Ensure only one primary image per vehicle:
```sql
CREATE UNIQUE INDEX idx_vehicle_images_one_primary
ON vehicle_images(vehicle_id, is_primary)
WHERE is_primary = TRUE;
```

Ensure display order is unique per vehicle:
```sql
CREATE UNIQUE INDEX idx_vehicle_images_unique_order
ON vehicle_images(vehicle_id, display_order);
```

### Migration Scripts

**Initial Migration: Create Tables**

```sql
-- Migration: 001_create_vehicles_tables.sql

-- Create vehicles table
CREATE TABLE vehicles (
  -- See Table Definitions section for complete schema
);

-- Create vehicle_images table
CREATE TABLE vehicle_images (
  -- See Table Definitions section for complete schema
);

-- Create vehicle_status_history table
CREATE TABLE vehicle_status_history (
  -- See Table Definitions section for complete schema
);

-- Create vehicle_lifecycle_metrics table
CREATE TABLE vehicle_lifecycle_metrics (
  -- See Table Definitions section for complete schema
);

-- Create vehicle_locations junction table
CREATE TABLE vehicle_locations (
  -- See Table Definitions section for complete schema
);

-- Add foreign key constraints
-- See Relationships section for all constraints

-- Create indexes
-- See Indexes section for all indexes
```

**Rollback Migration**

```sql
-- Rollback: 001_create_vehicles_tables_rollback.sql

DROP TABLE IF EXISTS vehicle_locations;
DROP TABLE IF EXISTS vehicle_lifecycle_metrics;
DROP TABLE IF EXISTS vehicle_status_history;
DROP TABLE IF EXISTS vehicle_images;
DROP TABLE IF EXISTS vehicles;
```

### Stored Procedures

**sp_update_vehicle_lifecycle_metrics**

Calculates and updates lifecycle metrics for a vehicle.

```sql
DELIMITER //

CREATE PROCEDURE sp_update_vehicle_lifecycle_metrics(
  IN p_vehicle_id CHAR(36)
)
BEGIN
  DECLARE v_total_bookings INT;
  DECLARE v_total_revenue DECIMAL(12,2);
  DECLARE v_total_maintenance DECIMAL(12,2);
  DECLARE v_total_mileage INT;
  DECLARE v_utilization_rate DECIMAL(5,2);
  DECLARE v_average_rating DECIMAL(3,2);
  DECLARE v_profitability DECIMAL(12,2);
  DECLARE v_retirement_score DECIMAL(5,2);
  DECLARE v_age_years INT;
  DECLARE v_acquisition_cost DECIMAL(12,2);
  
  -- Calculate total bookings
  SELECT COUNT(*) INTO v_total_bookings
  FROM bookings
  WHERE vehicle_id = p_vehicle_id AND status = 'completed';
  
  -- Calculate total revenue
  SELECT COALESCE(SUM(total_amount), 0) INTO v_total_revenue
  FROM bookings
  WHERE vehicle_id = p_vehicle_id AND status = 'completed';
  
  -- Calculate total maintenance cost
  SELECT COALESCE(SUM(cost), 0) INTO v_total_maintenance
  FROM maintenance_records
  WHERE vehicle_id = p_vehicle_id;
  
  -- Get current mileage
  SELECT current_mileage INTO v_total_mileage
  FROM vehicles
  WHERE id = p_vehicle_id;
  
  -- Calculate utilization rate
  SELECT 
    COALESCE(
      (SUM(DATEDIFF(return_date, pickup_date)) / 
       DATEDIFF(CURDATE(), MIN(created_at))) * 100,
      0
    ) INTO v_utilization_rate
  FROM bookings
  WHERE vehicle_id = p_vehicle_id AND status IN ('completed', 'confirmed', 'in_progress');
  
  -- Calculate average rating
  SELECT AVG(rating) INTO v_average_rating
  FROM reviews
  WHERE vehicle_id = p_vehicle_id;
  
  -- Get acquisition cost
  SELECT acquisition_cost INTO v_acquisition_cost
  FROM vehicle_lifecycle_metrics
  WHERE vehicle_id = p_vehicle_id;
  
  -- Calculate profitability
  SET v_profitability = v_total_revenue - v_total_maintenance - (v_acquisition_cost * 0.15); -- 15% annual depreciation
  
  -- Calculate vehicle age
  SELECT YEAR(CURDATE()) - year INTO v_age_years
  FROM vehicles
  WHERE id = p_vehicle_id;
  
  -- Calculate retirement score (0-100, higher = should retire)
  SET v_retirement_score = (
    (v_age_years / 10 * 30) +  -- Age component (30% weight)
    (LEAST(v_total_mileage / 150000, 1) * 25) +  -- Mileage component (25% weight)
    (LEAST(v_total_maintenance / v_total_revenue, 1) * 25) +  -- Maintenance cost component (25% weight)
    (CASE WHEN v_profitability < 0 THEN 20 ELSE 0 END)  -- Profitability component (20% weight)
  );
  
  -- Update lifecycle metrics
  UPDATE vehicle_lifecycle_metrics
  SET
    total_bookings = v_total_bookings,
    total_revenue = v_total_revenue,
    total_maintenance_cost = v_total_maintenance,
    total_mileage = v_total_mileage,
    utilization_rate = v_utilization_rate,
    average_rating = v_average_rating,
    profitability = v_profitability,
    retirement_score = v_retirement_score,
    last_calculated_at = CURRENT_TIMESTAMP
  WHERE vehicle_id = p_vehicle_id;
END //

DELIMITER ;
```

**sp_bulk_update_vehicle_status**

Performs bulk status updates with validation.

```sql
DELIMITER //

CREATE PROCEDURE sp_bulk_update_vehicle_status(
  IN p_vehicle_ids JSON,
  IN p_new_status VARCHAR(50),
  IN p_reason TEXT,
  IN p_changed_by CHAR(36)
)
BEGIN
  DECLARE v_vehicle_id CHAR(36);
  DECLARE v_old_status VARCHAR(50);
  DECLARE v_index INT DEFAULT 0;
  DECLARE v_count INT;
  
  SET v_count = JSON_LENGTH(p_vehicle_ids);
  
  WHILE v_index < v_count DO
    SET v_vehicle_id = JSON_UNQUOTE(JSON_EXTRACT(p_vehicle_ids, CONCAT('$[', v_index, ']')));
    
    -- Get current status
    SELECT status INTO v_old_status
    FROM vehicles
    WHERE id = v_vehicle_id AND is_deleted = FALSE;
    
    -- Update vehicle status
    UPDATE vehicles
    SET status = p_new_status, updated_by = p_changed_by
    WHERE id = v_vehicle_id AND is_deleted = FALSE;
    
    -- Insert status history
    INSERT INTO vehicle_status_history (vehicle_id, old_status, new_status, reason, changed_by)
    VALUES (v_vehicle_id, v_old_status, p_new_status, p_reason, p_changed_by);
    
    SET v_index = v_index + 1;
  END WHILE;
END //

DELIMITER ;
```

### Triggers

**trg_vehicles_before_update**

Validates business rules before vehicle updates.

```sql
DELIMITER //

CREATE TRIGGER trg_vehicles_before_update
BEFORE UPDATE ON vehicles
FOR EACH ROW
BEGIN
  -- Prevent VIN changes
  IF OLD.vin != NEW.vin THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'VIN cannot be changed after vehicle creation';
  END IF;
  
  -- Validate pricing structure
  IF NEW.pricing_weekly IS NOT NULL AND NEW.pricing_weekly >= NEW.pricing_daily * 7 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Weekly rate must be less than daily rate × 7';
  END IF;
  
  IF NEW.pricing_monthly IS NOT NULL AND NEW.pricing_monthly >= NEW.pricing_daily * 30 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Monthly rate must be less than daily rate × 30';
  END IF;
END //

DELIMITER ;
```

**trg_vehicle_images_enforce_one_primary**

Ensures only one primary image per vehicle.

```sql
DELIMITER //

CREATE TRIGGER trg_vehicle_images_enforce_one_primary
BEFORE INSERT ON vehicle_images
FOR EACH ROW
BEGIN
  IF NEW.is_primary = TRUE THEN
    -- Unset other primary images for this vehicle
    UPDATE vehicle_images
    SET is_primary = FALSE
    WHERE vehicle_id = NEW.vehicle_id AND is_primary = TRUE;
  END IF;
END //

DELIMITER ;
```

### Views

**vw_active_vehicles**

View of all active (non-deleted, non-retired) vehicles with supplier info.

```sql
CREATE VIEW vw_active_vehicles AS
SELECT 
  v.id,
  v.name,
  v.license_plate,
  v.year,
  v.make,
  v.model,
  v.category,
  v.status,
  v.pricing_daily,
  v.current_mileage,
  s.id AS supplier_id,
  s.name AS supplier_name,
  s.email AS supplier_email,
  (SELECT image_url FROM vehicle_images WHERE vehicle_id = v.id AND is_primary = TRUE LIMIT 1) AS primary_image,
  v.created_at,
  v.updated_at
FROM vehicles v
INNER JOIN suppliers s ON v.supplier_id = s.id
WHERE v.is_deleted = FALSE AND v.status != 'retired';
```

**vw_vehicle_performance**

View combining vehicle data with lifecycle metrics.

```sql
CREATE VIEW vw_vehicle_performance AS
SELECT
  v.id,
  v.name,
  v.license_plate,
  v.category,
  v.status,
  m.total_bookings,
  m.total_revenue,
  m.total_maintenance_cost,
  m.utilization_rate,
  m.average_rating,
  m.profitability,
  m.retirement_score,
  YEAR(CURDATE()) - v.year AS age_years,
  m.last_calculated_at
FROM vehicles v
LEFT JOIN vehicle_lifecycle_metrics m ON v.vehicle_id = m.vehicle_id
WHERE v.is_deleted = FALSE;
```

### Data Migration

**Initial Data Seeding**

No initial data required. Vehicles will be added through admin interface or bulk import.

**Data Validation Queries**

Check for vehicles without images:
```sql
SELECT v.id, v.name, v.license_plate
FROM vehicles v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id
WHERE v.is_deleted = FALSE
GROUP BY v.id
HAVING COUNT(vi.id) = 0;
```

Check for vehicles without primary image:
```sql
SELECT v.id, v.name, v.license_plate
FROM vehicles v
LEFT JOIN vehicle_images vi ON v.id = vi.vehicle_id AND vi.is_primary = TRUE
WHERE v.is_deleted = FALSE AND vi.id IS NULL;
```

Check for invalid pricing structures:
```sql
SELECT id, name, pricing_daily, pricing_weekly, pricing_monthly
FROM vehicles
WHERE is_deleted = FALSE
AND (
  (pricing_weekly IS NOT NULL AND pricing_weekly >= pricing_daily * 7) OR
  (pricing_monthly IS NOT NULL AND pricing_monthly >= pricing_daily * 30)
);
```

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 for full Unicode support including emojis
- **Collation**: utf8mb4_unicode_ci for case-insensitive comparisons
- **Storage Engine**: InnoDB for ACID compliance and foreign key support
- **Backup Strategy**: Daily full backups, hourly incremental backups
- **Replication**: Master-slave replication for read scalability

## Implementation Notes

### Migration Strategy

1. Create all tables in single migration
2. Add foreign key constraints after tables created
3. Create indexes after initial data load for performance
4. Test rollback migration in staging environment
5. Plan maintenance window for production deployment

### Performance Considerations

- Partition vehicle_status_history by year for large fleets
- Archive old status history (> 2 years) to separate table
- Use covering indexes for frequently accessed columns
- Monitor query performance and add indexes as needed
- Consider read replicas for reporting queries

### Data Retention

- Keep all vehicle records indefinitely (soft delete only)
- Archive status history older than 2 years
- Retain lifecycle metrics for all vehicles
- Backup deleted vehicle data to cold storage

### Monitoring

- Monitor table sizes and growth rates
- Track slow queries and optimize
- Monitor index usage and remove unused indexes
- Alert on constraint violations
- Track foreign key constraint failures

## Dependencies

**Required Tables:**
- suppliers (must exist before vehicles)
- users (must exist before vehicles)
- locations (must exist before vehicle_locations)

**Required for Full Functionality:**
- bookings table (for lifecycle metrics calculation)
- maintenance_records table (for lifecycle metrics calculation)
- reviews table (for average rating calculation)

## Related Requirements

- Requirement 1: Vehicle Inventory Management
- Requirement 2: Vehicle Status and Availability Management
- Requirement 11: Location and Multi-Site Management
- Requirement 17: Bulk Operations
- Requirement 20: Fleet Lifecycle Management

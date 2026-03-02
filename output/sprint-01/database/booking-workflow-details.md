# Feature: Booking Workflow Details (Database)

## Overview

Database schema supporting booking workflow details including vehicle locks, additional drivers, insurance selections, service selections, and terms acceptances. The schema ensures data integrity, supports efficient querying, and maintains audit trails for compliance.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-WF-BOOK-002: Vehicle Temporary Lock System
- F-WF-BOOK-003: Customer Information Pre-Fill
- F-WF-BOOK-004: Real-Time Form Validation
- F-WF-BOOK-005: Additional Driver Management
- F-WF-BOOK-006: Insurance Coverage Selection
- F-WF-BOOK-007: Additional Services and Equipment Rental (Nice-to-have)
- F-WF-BOOK-008: Booking Summary Review (Nice-to-have)
- F-WF-BOOK-010: Terms and Conditions Acceptance

## Technology Stack

- MySQL 8.0+ with InnoDB storage engine
- UTF-8 character encoding
- JSON columns for flexible data
- Full-text indexes for document search
- Partitioning for large tables

## Database Schema

### VehicleLocks Table

```sql
CREATE TABLE VehicleLocks (
    lock_id CHAR(36) PRIMARY KEY,
    vehicle_id CHAR(36) NOT NULL,
    session_id CHAR(36) NOT NULL,
    user_id CHAR(36) NULL,
    pickup_date DATETIME NOT NULL,
    return_date DATETIME NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    extension_count TINYINT NOT NULL DEFAULT 0,
    status ENUM('active', 'expired', 'released') NOT NULL DEFAULT 'active',
    
    CONSTRAINT fk_vehicle_locks_vehicle 
        FOREIGN KEY (vehicle_id) REFERENCES Vehicles(vehicle_id),
    CONSTRAINT fk_vehicle_locks_user 
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_vehicle_locks_dates 
        CHECK (return_date > pickup_date),
    CONSTRAINT chk_vehicle_locks_expires 
        CHECK (expires_at > created_at),
    CONSTRAINT chk_vehicle_locks_extensions 
        CHECK (extension_count <= 2),
    
    INDEX idx_vehicle_dates (vehicle_id, pickup_date, return_date, status),
    INDEX idx_expires_at (expires_at, status),
    INDEX idx_session_id (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### AdditionalDrivers Table

```sql
CREATE TABLE AdditionalDrivers (
    driver_id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_issuing_country VARCHAR(2) NOT NULL,
    license_issuing_state VARCHAR(50) NULL,
    license_expiration_date DATE NOT NULL,
    relationship_to_renter VARCHAR(50) NULL,
    fee_amount DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_additional_drivers_booking 
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT chk_additional_drivers_license 
        CHECK (license_expiration_date > date_of_birth),
    CONSTRAINT chk_additional_drivers_fee 
        CHECK (fee_amount >= 0),
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_license_number (license_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### InsuranceOptions Table

```sql
CREATE TABLE InsuranceOptions (
    insurance_option_id CHAR(36) PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    coverage_limit DECIMAL(12,2) NOT NULL,
    deductible DECIMAL(10,2) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    whats_covered JSON NOT NULL,
    whats_not_covered JSON NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_code (code),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### BookingInsurance Table

```sql
CREATE TABLE BookingInsurance (
    booking_insurance_id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    insurance_option_id CHAR(36) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_booking_insurance_booking 
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_insurance_option 
        FOREIGN KEY (insurance_option_id) REFERENCES InsuranceOptions(insurance_option_id),
    CONSTRAINT chk_booking_insurance_costs 
        CHECK (total_cost >= 0 AND daily_rate >= 0),
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_insurance_option_id (insurance_option_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Services Table

```sql
CREATE TABLE Services (
    service_id CHAR(36) PRIMARY KEY,
    category ENUM('navigation', 'child-safety', 'equipment', 'fuel', 'convenience') NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    specifications TEXT NULL,
    daily_rate DECIMAL(10,2) NULL,
    flat_fee DECIMAL(10,2) NULL,
    max_quantity INT NOT NULL DEFAULT 1,
    image_url VARCHAR(500) NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_services_pricing 
        CHECK ((daily_rate IS NOT NULL AND flat_fee IS NULL) OR 
               (daily_rate IS NULL AND flat_fee IS NOT NULL)),
    
    INDEX idx_category (category, active),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### ServiceInventory Table

```sql
CREATE TABLE ServiceInventory (
    inventory_id CHAR(36) PRIMARY KEY,
    service_id CHAR(36) NOT NULL,
    location_id CHAR(36) NOT NULL,
    quantity_available INT NOT NULL,
    quantity_total INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_service_inventory_service 
        FOREIGN KEY (service_id) REFERENCES Services(service_id),
    CONSTRAINT fk_service_inventory_location 
        FOREIGN KEY (location_id) REFERENCES Locations(location_id),
    CONSTRAINT chk_service_inventory_quantities 
        CHECK (quantity_available >= 0 AND quantity_available <= quantity_total),
    
    INDEX idx_service_location (service_id, location_id),
    INDEX idx_location_id (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### BookingServices Table

```sql
CREATE TABLE BookingServices (
    booking_service_id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    service_id CHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    daily_rate DECIMAL(10,2) NULL,
    flat_fee DECIMAL(10,2) NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_booking_services_booking 
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_services_service 
        FOREIGN KEY (service_id) REFERENCES Services(service_id),
    CONSTRAINT chk_booking_services_quantity 
        CHECK (quantity > 0),
    CONSTRAINT chk_booking_services_cost 
        CHECK (total_cost >= 0),
    CONSTRAINT chk_booking_services_pricing 
        CHECK ((daily_rate IS NOT NULL AND flat_fee IS NULL) OR 
               (daily_rate IS NULL AND flat_fee IS NOT NULL)),
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_service_id (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


### TermsDocuments Table

```sql
CREATE TABLE TermsDocuments (
    document_id CHAR(36) PRIMARY KEY,
    type ENUM('rental-agreement', 'cancellation-policy', 'privacy-policy', 
              'age-license-requirements', 'insurance-understanding') NOT NULL,
    title VARCHAR(200) NOT NULL,
    summary TEXT NOT NULL,
    content LONGTEXT NOT NULL,
    version VARCHAR(20) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT TRUE,
    pdf_url VARCHAR(500) NULL,
    effective_date DATE NOT NULL,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_type_version (type, version),
    INDEX idx_effective_date (effective_date),
    FULLTEXT idx_content (content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### TermsAcceptances Table

```sql
CREATE TABLE TermsAcceptances (
    acceptance_id CHAR(36) PRIMARY KEY,
    booking_id CHAR(36) NOT NULL,
    document_id CHAR(36) NOT NULL,
    document_version VARCHAR(20) NOT NULL,
    accepted_at DATETIME NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(500) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_terms_acceptances_booking 
        FOREIGN KEY (booking_id) REFERENCES Bookings(booking_id) ON DELETE CASCADE,
    CONSTRAINT fk_terms_acceptances_document 
        FOREIGN KEY (document_id) REFERENCES TermsDocuments(document_id),
    CONSTRAINT uq_booking_document 
        UNIQUE (booking_id, document_id),
    
    INDEX idx_booking_id (booking_id),
    INDEX idx_document_id (document_id),
    INDEX idx_accepted_at (accepted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
PARTITION BY RANGE (YEAR(accepted_at)) (
    PARTITION p2024 VALUES LESS THAN (2025),
    PARTITION p2025 VALUES LESS THAN (2026),
    PARTITION p2026 VALUES LESS THAN (2027),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```


## Data Migration Scripts

### Initial Data - Insurance Options

```sql
INSERT INTO InsuranceOptions (insurance_option_id, code, name, description, 
    coverage_limit, deductible, daily_rate, mandatory, whats_covered, whats_not_covered) 
VALUES
(UUID(), 'CDW', 'Collision Damage Waiver', 
    'Reduces your financial responsibility for damage to the rental vehicle',
    50000.00, 1000.00, 25.00, FALSE,
    '["Vehicle damage from collision", "Theft protection", "Vandalism coverage"]',
    '["Personal belongings", "Tire damage", "Interior damage"]'),
    
(UUID(), 'TP', 'Theft Protection', 
    'Covers theft of the rental vehicle',
    50000.00, 500.00, 15.00, FALSE,
    '["Vehicle theft", "Attempted theft damage", "Key replacement"]',
    '["Personal belongings theft", "Accessories theft"]'),
    
(UUID(), 'PAI', 'Personal Accident Insurance', 
    'Covers medical expenses for driver and passengers',
    100000.00, 0.00, 12.00, FALSE,
    '["Medical expenses", "Ambulance costs", "Hospital stays", "Accidental death benefit"]',
    '["Pre-existing conditions", "Intentional injuries"]'),
    
(UUID(), 'SLI', 'Supplemental Liability Insurance', 
    'Additional liability coverage beyond basic policy',
    1000000.00, 0.00, 18.00, FALSE,
    '["Third-party injury", "Third-party property damage", "Legal defense costs"]',
    '["Intentional damage", "Criminal acts"]');
```

### Initial Data - Services

```sql
INSERT INTO Services (service_id, category, name, description, specifications,
    daily_rate, flat_fee, max_quantity) 
VALUES
(UUID(), 'navigation', 'GPS Navigation System', 
    'Portable GPS device with latest maps', 
    'TomTom GO with lifetime map updates',
    10.00, NULL, 2),
    
(UUID(), 'child-safety', 'Infant Car Seat', 
    'Rear-facing car seat for infants up to 22 lbs',
    'Graco SnugRide 35 - rear-facing, 4-35 lbs',
    12.00, NULL, 3),
    
(UUID(), 'child-safety', 'Toddler Car Seat', 
    'Forward-facing car seat for toddlers 22-65 lbs',
    'Graco 4Ever - forward-facing, 22-65 lbs',
    12.00, NULL, 3),
    
(UUID(), 'child-safety', 'Booster Seat', 
    'Booster seat for children 40-100 lbs',
    'Graco TurboBooster - 40-100 lbs',
    8.00, NULL, 3),
    
(UUID(), 'equipment', 'Ski Rack', 
    'Roof-mounted ski and snowboard carrier',
    'Thule SnowPack - holds up to 6 pairs of skis',
    15.00, NULL, 1),
    
(UUID(), 'equipment', 'Bike Rack', 
    'Hitch-mounted bike carrier',
    'Thule T2 Pro XT - holds 2 bikes',
    20.00, NULL, 1),
    
(UUID(), 'fuel', 'Prepaid Fuel', 
    'Purchase full tank of fuel upfront',
    'Return vehicle empty - no refueling needed',
    NULL, 75.00, 1),
    
(UUID(), 'convenience', 'Toll Pass', 
    'Electronic toll collection device',
    'E-ZPass compatible - automatic toll payment',
    5.00, NULL, 1),
    
(UUID(), 'convenience', 'WiFi Hotspot', 
    'Portable WiFi device with unlimited data',
    '4G LTE hotspot - connects up to 5 devices',
    15.00, NULL, 1);
```


## Stored Procedures

### sp_CreateVehicleLock

```sql
DELIMITER //

CREATE PROCEDURE sp_CreateVehicleLock(
    IN p_vehicle_id CHAR(36),
    IN p_session_id CHAR(36),
    IN p_user_id CHAR(36),
    IN p_pickup_date DATETIME,
    IN p_return_date DATETIME,
    OUT p_lock_id CHAR(36),
    OUT p_expires_at DATETIME
)
BEGIN
    DECLARE v_available BOOLEAN;
    
    -- Check vehicle availability
    SELECT COUNT(*) = 0 INTO v_available
    FROM VehicleLocks
    WHERE vehicle_id = p_vehicle_id
        AND status = 'active'
        AND (
            (p_pickup_date BETWEEN pickup_date AND return_date) OR
            (p_return_date BETWEEN pickup_date AND return_date) OR
            (pickup_date BETWEEN p_pickup_date AND p_return_date)
        );
    
    IF v_available THEN
        SET p_lock_id = UUID();
        SET p_expires_at = DATE_ADD(NOW(), INTERVAL 15 MINUTE);
        
        INSERT INTO VehicleLocks (
            lock_id, vehicle_id, session_id, user_id,
            pickup_date, return_date, created_at, expires_at, status
        ) VALUES (
            p_lock_id, p_vehicle_id, p_session_id, p_user_id,
            p_pickup_date, p_return_date, NOW(), p_expires_at, 'active'
        );
    ELSE
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Vehicle not available for selected dates';
    END IF;
END //

DELIMITER ;
```

### sp_CleanupExpiredLocks

```sql
DELIMITER //

CREATE PROCEDURE sp_CleanupExpiredLocks()
BEGIN
    UPDATE VehicleLocks
    SET status = 'expired'
    WHERE status = 'active'
        AND expires_at < NOW();
    
    SELECT ROW_COUNT() AS locks_expired;
END //

DELIMITER ;
```


## Database Triggers

### trg_UpdateServiceInventory_AfterBookingService

```sql
DELIMITER //

CREATE TRIGGER trg_UpdateServiceInventory_AfterBookingService
AFTER INSERT ON BookingServices
FOR EACH ROW
BEGIN
    DECLARE v_location_id CHAR(36);
    
    -- Get pickup location from booking
    SELECT pickup_location_id INTO v_location_id
    FROM Bookings
    WHERE booking_id = NEW.booking_id;
    
    -- Decrease available inventory
    UPDATE ServiceInventory
    SET quantity_available = quantity_available - NEW.quantity
    WHERE service_id = NEW.service_id
        AND location_id = v_location_id;
END //

DELIMITER ;
```

### trg_RestoreServiceInventory_AfterBookingServiceDelete

```sql
DELIMITER //

CREATE TRIGGER trg_RestoreServiceInventory_AfterBookingServiceDelete
AFTER DELETE ON BookingServices
FOR EACH ROW
BEGIN
    DECLARE v_location_id CHAR(36);
    
    -- Get pickup location from booking
    SELECT pickup_location_id INTO v_location_id
    FROM Bookings
    WHERE booking_id = OLD.booking_id;
    
    -- Restore available inventory
    UPDATE ServiceInventory
    SET quantity_available = quantity_available + OLD.quantity
    WHERE service_id = OLD.service_id
        AND location_id = v_location_id;
END //

DELIMITER ;
```

## Database Views

### vw_ActiveVehicleLocks

```sql
CREATE VIEW vw_ActiveVehicleLocks AS
SELECT 
    vl.lock_id,
    vl.vehicle_id,
    v.make,
    v.model,
    vl.session_id,
    vl.user_id,
    u.email AS user_email,
    vl.pickup_date,
    vl.return_date,
    vl.created_at,
    vl.expires_at,
    vl.extension_count,
    TIMESTAMPDIFF(MINUTE, NOW(), vl.expires_at) AS minutes_remaining
FROM VehicleLocks vl
JOIN Vehicles v ON vl.vehicle_id = v.vehicle_id
LEFT JOIN Users u ON vl.user_id = u.user_id
WHERE vl.status = 'active'
    AND vl.expires_at > NOW();
```


### vw_BookingInsuranceSummary

```sql
CREATE VIEW vw_BookingInsuranceSummary AS
SELECT 
    bi.booking_id,
    COUNT(bi.booking_insurance_id) AS insurance_count,
    SUM(bi.total_cost) AS total_insurance_cost,
    GROUP_CONCAT(io.name SEPARATOR ', ') AS insurance_names,
    GROUP_CONCAT(io.code SEPARATOR ', ') AS insurance_codes
FROM BookingInsurance bi
JOIN InsuranceOptions io ON bi.insurance_option_id = io.insurance_option_id
GROUP BY bi.booking_id;
```

### vw_BookingServicesSummary

```sql
CREATE VIEW vw_BookingServicesSummary AS
SELECT 
    bs.booking_id,
    COUNT(bs.booking_service_id) AS service_count,
    SUM(bs.total_cost) AS total_services_cost,
    GROUP_CONCAT(s.name SEPARATOR ', ') AS service_names,
    GROUP_CONCAT(CONCAT(s.name, ' (', bs.quantity, ')') SEPARATOR ', ') AS services_with_quantity
FROM BookingServices bs
JOIN Services s ON bs.service_id = s.service_id
GROUP BY bs.booking_id;
```

### vw_ServiceAvailability

```sql
CREATE VIEW vw_ServiceAvailability AS
SELECT 
    s.service_id,
    s.name AS service_name,
    s.category,
    l.location_id,
    l.name AS location_name,
    si.quantity_available,
    si.quantity_total,
    CASE 
        WHEN si.quantity_available = 0 THEN 'Unavailable'
        WHEN si.quantity_available < 3 THEN 'Limited'
        ELSE 'Available'
    END AS availability_status
FROM Services s
JOIN ServiceInventory si ON s.service_id = si.service_id
JOIN Locations l ON si.location_id = l.location_id
WHERE s.active = TRUE;
```

## Performance Optimization

### Query Optimization Tips

1. Use indexes for frequently queried columns
2. Avoid SELECT * - specify needed columns
3. Use EXPLAIN to analyze query performance
4. Consider query caching for static data
5. Use prepared statements to prevent SQL injection

### Index Maintenance

```sql
-- Analyze table statistics
ANALYZE TABLE VehicleLocks;
ANALYZE TABLE AdditionalDrivers;
ANALYZE TABLE BookingInsurance;
ANALYZE TABLE BookingServices;
ANALYZE TABLE TermsAcceptances;

-- Optimize tables
OPTIMIZE TABLE VehicleLocks;
OPTIMIZE TABLE TermsAcceptances;
```


## Backup and Recovery

### Backup Strategy
- Full backup daily at 2 AM
- Incremental backups every 4 hours
- Transaction log backups every 15 minutes
- Retention: 30 days for full backups, 7 days for incremental

### Critical Tables for Backup Priority
1. TermsAcceptances (legal compliance)
2. BookingInsurance (financial records)
3. BookingServices (financial records)
4. AdditionalDrivers (customer data)
5. VehicleLocks (operational data - lower priority)

## Data Retention Policies

### VehicleLocks
- Active locks: Until expired or released
- Expired locks: Retain for 7 days for analytics
- Archive locks older than 7 days to cold storage

### TermsAcceptances
- Retain indefinitely for legal compliance
- Partition by year for performance
- Archive partitions older than 7 years to cold storage

### AdditionalDrivers
- Retain for duration of booking + 2 years
- Archive after 2 years for compliance
- Anonymize after 7 years (GDPR compliance)

### BookingInsurance and BookingServices
- Retain for duration of booking + 7 years (financial records)
- Archive after 7 years
- Never delete (audit requirement)

## Security Considerations

### Data Encryption
- Encrypt sensitive columns at rest
- Use TLS for data in transit
- Encrypt backups

### Access Control
- Principle of least privilege
- Role-based access control
- Audit all data access
- Separate read and write permissions

### PII Protection
- Hash IP addresses in TermsAcceptances
- Mask license numbers in logs
- Encrypt driver information
- Implement data anonymization for analytics


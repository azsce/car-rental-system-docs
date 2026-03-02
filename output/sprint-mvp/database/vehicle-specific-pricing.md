# Feature: Vehicle-Specific Pricing

## Overview

Database schema for storing individual vehicle rates with support for rate templates, bulk updates, and comprehensive audit trail. Includes optimized indexes for fast rate lookups and validation constraints to ensure pricing integrity.

## Sprint Category

sprint-mvp (MVP - Must have for first release)

## Feature ID

Pricing-Management-1.2

## User Stories

### As a database
I want to store unique rates for each vehicle, so that pricing can be differentiated based on vehicle characteristics.

### As a data integrity system
I want to enforce rate validation constraints, so that invalid pricing is prevented at the database level.

### As an audit system
I want to maintain complete rate change history, so that all pricing decisions are traceable.

## Database Specifications

### Schema Changes

**Tables Used**:
- `VehicleRates` (from Multi-Duration Rate Structures)
- `RateHistory` (from Multi-Duration Rate Structures)
- `RateTemplates` - Reusable rate configurations

### Table Definitions

**RateTemplates Table**:
```sql
CREATE TABLE RateTemplates (
  TemplateId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  TemplateName VARCHAR(100) NOT NULL,
  Description VARCHAR(500) NULL,
  VehicleCategory VARCHAR(50) NULL COMMENT 'Economy, Luxury, SUV, Van, etc.',
  HourlyRate DECIMAL(10,2) NULL,
  DailyRate DECIMAL(10,2) NOT NULL,
  WeeklyRate DECIMAL(10,2) NULL,
  BiWeeklyRate DECIMAL(10,2) NULL,
  MonthlyRate DECIMAL(10,2) NULL,
  MinimumDuration INT NOT NULL DEFAULT 1 COMMENT 'Hours',
  MaximumDuration INT NOT NULL DEFAULT 90 COMMENT 'Days',
  Currency CHAR(3) NOT NULL DEFAULT 'USD',
  IsActive BOOLEAN DEFAULT TRUE,
  UsageCount INT NOT NULL DEFAULT 0 COMMENT 'Number of times applied',
  CreatedBy CHAR(36) NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  FOREIGN KEY (CreatedBy) REFERENCES Users(UserId),
  
  INDEX idx_supplier_active (SupplierId, IsActive),
  INDEX idx_category (VehicleCategory),
  INDEX idx_usage (UsageCount DESC),
  UNIQUE KEY uk_supplier_name (SupplierId, TemplateName),
  
  CONSTRAINT chk_template_daily_positive CHECK (DailyRate > 0),
  CONSTRAINT chk_template_weekly CHECK (WeeklyRate IS NULL OR WeeklyRate < (DailyRate * 7)),
  CONSTRAINT chk_template_monthly CHECK (MonthlyRate IS NULL OR MonthlyRate < (DailyRate * 30))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**VehicleFeaturePremiums Table** (Optional Enhancement):
```sql
CREATE TABLE VehicleFeaturePremiums (
  PremiumId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  FeatureName VARCHAR(100) NOT NULL,
  DailyPremium DECIMAL(10,2) NOT NULL COMMENT 'Additional daily rate for feature',
  Description VARCHAR(500) NULL,
  IsActive BOOLEAN DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  
  INDEX idx_supplier_active (SupplierId, IsActive),
  UNIQUE KEY uk_supplier_feature (SupplierId, FeatureName),
  
  CONSTRAINT chk_premium_positive CHECK (DailyPremium >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**RateTemplates Relationships**:
- `RateTemplates.SupplierId` → `Suppliers.SupplierId` (Many-to-One, CASCADE DELETE)
- `RateTemplates.CreatedBy` → `Users.UserId` (Many-to-One)

**VehicleFeaturePremiums Relationships**:
- `VehicleFeaturePremiums.SupplierId` → `Suppliers.SupplierId` (Many-to-One, CASCADE DELETE)

**VehicleRates Relationships** (from Multi-Duration feature):
- `VehicleRates.VehicleId` → `Vehicles.VehicleId` (Many-to-One, CASCADE DELETE)
- `VehicleRates.SupplierId` → `Suppliers.SupplierId` (Many-to-One, CASCADE DELETE)

### Indexes

**Template Indexes**:
- `idx_supplier_active` on `RateTemplates(SupplierId, IsActive)` - Active template lookup
- `idx_category` on `RateTemplates(VehicleCategory)` - Category-based templates
- `idx_usage` on `RateTemplates(UsageCount DESC)` - Popular templates
- `uk_supplier_name` on `RateTemplates(SupplierId, TemplateName)` - Unique template names per supplier

**Feature Premium Indexes**:
- `idx_supplier_active` on `VehicleFeaturePremiums(SupplierId, IsActive)` - Active premium lookup
- `uk_supplier_feature` on `VehicleFeaturePremiums(SupplierId, FeatureName)` - Unique features per supplier

**Rate Indexes** (from Multi-Duration feature):
- `idx_vehicle_active` on `VehicleRates(VehicleId, IsActive, EffectiveDate DESC)` - Fast vehicle rate lookup
- `idx_supplier_active` on `VehicleRates(SupplierId, IsActive)` - Supplier rate queries

### Data Integrity Constraints

**Check Constraints**:
- `chk_template_daily_positive`: Template daily rate must be positive
- `chk_template_weekly`: Template weekly rate must be less than 7× daily
- `chk_template_monthly`: Template monthly rate must be less than 30× daily
- `chk_premium_positive`: Feature premiums must be non-negative

**Unique Constraints**:
- `uk_supplier_name`: Template names must be unique per supplier
- `uk_supplier_feature`: Feature names must be unique per supplier

**Foreign Key Constraints**:
- CASCADE DELETE on supplier deletion
- Preserve user references for audit trail

### Sample Data

**Rate Templates**:
```sql
-- Economy Template
INSERT INTO RateTemplates (TemplateId, SupplierId, TemplateName, Description, VehicleCategory, DailyRate, WeeklyRate, MonthlyRate, Currency, CreatedBy)
VALUES 
  ('template-001', 'supplier-001', 'Economy Standard', 'Standard rates for economy vehicles', 'Economy', 50.00, 300.00, 1200.00, 'USD', 'admin-001');

-- Luxury Template
INSERT INTO RateTemplates (TemplateId, SupplierId, TemplateName, Description, VehicleCategory, DailyRate, WeeklyRate, MonthlyRate, Currency, CreatedBy)
VALUES 
  ('template-002', 'supplier-001', 'Luxury Premium', 'Premium rates for luxury vehicles', 'Luxury', 250.00, 1500.00, 6000.00, 'USD', 'admin-001');

-- SUV Template
INSERT INTO RateTemplates (TemplateId, SupplierId, TemplateName, Description, VehicleCategory, DailyRate, WeeklyRate, MonthlyRate, Currency, CreatedBy)
VALUES 
  ('template-003', 'supplier-001', 'SUV Standard', 'Standard rates for SUVs', 'SUV', 120.00, 700.00, 2800.00, 'USD', 'admin-001');
```

**Feature Premiums**:
```sql
INSERT INTO VehicleFeaturePremiums (PremiumId, SupplierId, FeatureName, DailyPremium, Description)
VALUES 
  ('premium-001', 'supplier-001', 'GPS', 5.00, 'GPS navigation system'),
  ('premium-002', 'supplier-001', 'LeatherSeats', 8.00, 'Leather seat upholstery'),
  ('premium-003', 'supplier-001', 'Sunroof', 5.00, 'Panoramic sunroof'),
  ('premium-004', 'supplier-001', 'AllWheelDrive', 10.00, 'All-wheel drive system'),
  ('premium-005', 'supplier-001', 'PremiumAudio', 3.00, 'Premium audio system');
```

### Migration Scripts

**Create Tables Migration**:
```sql
-- Create RateTemplates table
CREATE TABLE RateTemplates (...);

-- Create VehicleFeaturePremiums table
CREATE TABLE VehicleFeaturePremiums (...);

-- Create indexes
CREATE INDEX idx_supplier_active ON RateTemplates(SupplierId, IsActive);
CREATE INDEX idx_category ON RateTemplates(VehicleCategory);
CREATE UNIQUE INDEX uk_supplier_name ON RateTemplates(SupplierId, TemplateName);

-- Insert default templates
INSERT INTO RateTemplates (...) VALUES (...);

-- Insert default feature premiums
INSERT INTO VehicleFeaturePremiums (...) VALUES (...);
```

**Rollback Migration**:
```sql
-- Drop tables in reverse order
DROP TABLE IF EXISTS VehicleFeaturePremiums;
DROP TABLE IF EXISTS RateTemplates;
```

### Query Patterns

**Get Active Rate for Vehicle**:
```sql
SELECT * FROM VehicleRates
WHERE VehicleId = ? 
  AND IsActive = TRUE
  AND EffectiveDate <= CURDATE()
  AND (ExpirationDate IS NULL OR ExpirationDate >= CURDATE())
ORDER BY EffectiveDate DESC
LIMIT 1;
```

**Get Category Average Rates**:
```sql
SELECT 
  v.Category,
  AVG(vr.DailyRate) as AvgDailyRate,
  AVG(vr.WeeklyRate) as AvgWeeklyRate,
  AVG(vr.MonthlyRate) as AvgMonthlyRate,
  COUNT(*) as VehicleCount
FROM VehicleRates vr
JOIN Vehicles v ON vr.VehicleId = v.VehicleId
WHERE vr.IsActive = TRUE
  AND vr.SupplierId = ?
GROUP BY v.Category;
```

**Get Rate Change History**:
```sql
SELECT 
  rh.ChangedAt,
  u.FullName as ChangedBy,
  rh.ChangeType,
  rh.PreviousRates,
  rh.NewRates,
  rh.ChangeReason
FROM RateHistory rh
JOIN Users u ON rh.ChangedBy = u.UserId
WHERE rh.VehicleId = ?
ORDER BY rh.ChangedAt DESC
LIMIT 50;
```

**Get Popular Templates**:
```sql
SELECT * FROM RateTemplates
WHERE SupplierId = ?
  AND IsActive = TRUE
ORDER BY UsageCount DESC, TemplateName ASC;
```

## Technology Stack

- Database: MySQL 8.0+
- ORM: Entity Framework Core
- Migration Tool: EF Core Migrations

## Implementation Notes

**Index Strategy**:
- Composite indexes for common query patterns
- Covering indexes where beneficial
- Regular index maintenance and optimization
- Monitor index usage and effectiveness

**Data Archival**:
- Archive old rate history after 2 years
- Maintain summary statistics
- Compress archived data
- Ensure compliance with retention policies

**Performance Monitoring**:
- Monitor query execution times
- Track slow queries
- Optimize problematic queries
- Use EXPLAIN to analyze query plans

**Backup Strategy**:
- Include rate tables in regular backups
- Test restoration procedures
- Maintain point-in-time recovery capability
- Archive rate history separately


# Feature: Persona-Based Booking Experience (Database)

## Overview

The database schema for Persona-Based Booking Experience stores user persona classifications, booking templates, split-payment configurations, VIN-specific vehicle details, accessibility features, and sustainability metrics. The schema supports dynamic personalization by maintaining user segment data, preference settings, and specialized booking workflows for different user types.

This database design enables efficient querying of persona-specific data, tracking of split-payment status, enforcement of VIN-locked bookings, and retrieval of environmental impact metrics for eco-conscious users.

## Sprint Category

nice-to-have

## Feature ID

F-BM-002

## User Stories

### Story 1: Persona Data Storage
As a database, I want to store user persona classifications with confidence scores, so that the system can deliver personalized booking experiences.

### Story 2: Booking Template Management
As a database, I want to store saved booking configurations, so that power renters can quickly rebook with their preferred settings.

### Story 3: Split-Payment Tracking
As a database, I want to track split-payment configurations and individual payment status, so that the system can coordinate group bookings.

### Story 4: VIN-Specific Vehicle Data
As a database, I want to store VIN-level details and service history, so that luxury customers can book specific vehicles with confidence.

### Story 5: Accessibility Feature Verification
As a database, I want to maintain verified accessibility features per vehicle, so that accessible mobility users receive guaranteed allocations.

## Database Specifications

### Schema Changes

**New Tables**:
1. UserPersonas - Stores user segment classifications and personalization settings
2. BookingTemplates - Stores saved booking configurations for quick rebooking
3. SplitPaymentBookings - Stores split-payment configuration and status
4. SplitPaymentCoRenters - Stores co-renter information and payment tracking
5. VehicleVINDetails - Stores VIN-specific information for luxury vehicles
6. VehicleAccessibilityFeatures - Stores verified accessibility features per vehicle
7. VehicleSustainabilityMetrics - Stores environmental impact data per vehicle
8. PersonaDetectionHistory - Stores historical persona detection results for ML training

**Modified Tables**:
- Bookings table: Add HardAllocation flag and VINLocked flag
- Users table: Add LastPersonaDetectionDate timestamp


### Table Definitions

#### UserPersonas Table

**Purpose**: Store user persona classifications and personalization preferences

**Columns**:
```sql
UserPersonaId BIGINT PRIMARY KEY AUTO_INCREMENT
UserId BIGINT NOT NULL UNIQUE
DetectedPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL
ConfidenceScore DECIMAL(3,2) DEFAULT 0.00
ManualOverride BOOLEAN DEFAULT FALSE
OneClickRebookingEnabled BOOLEAN DEFAULT FALSE
VinSpecificBookingEnabled BOOLEAN DEFAULT FALSE
SplitPaymentEnabled BOOLEAN DEFAULT FALSE
SustainabilityMetricsEnabled BOOLEAN DEFAULT FALSE
HardAllocationEnabled BOOLEAN DEFAULT FALSE
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
INDEX idx_user_persona (UserId)
INDEX idx_detected_persona (DetectedPersona)
```

**Constraints**:
- UserId must be unique (one persona profile per user)
- ConfidenceScore must be between 0.00 and 1.00
- DetectedPersona can be NULL if confidence is below threshold

**Sample Data**:
```sql
INSERT INTO UserPersonas (UserId, DetectedPersona, ConfidenceScore, ManualOverride, OneClickRebookingEnabled)
VALUES (1001, 'PowerRenter', 0.87, FALSE, TRUE);
```


#### BookingTemplates Table

**Purpose**: Store saved booking configurations for quick rebooking

**Columns**:
```sql
TemplateId BIGINT PRIMARY KEY AUTO_INCREMENT
UserId BIGINT NOT NULL
TemplateName VARCHAR(100) NOT NULL
VehicleTypePreference VARCHAR(50) NULL
PickupLocationId BIGINT NULL
ReturnLocationId BIGINT NULL
TypicalDurationDays INT NULL
InsurancePreferences JSON NULL
AdditionalServices JSON NULL
PaymentMethodId BIGINT NULL
IsShared BOOLEAN DEFAULT FALSE
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
FOREIGN KEY (PickupLocationId) REFERENCES Locations(LocationId) ON DELETE SET NULL
FOREIGN KEY (ReturnLocationId) REFERENCES Locations(LocationId) ON DELETE SET NULL
FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId) ON DELETE SET NULL
INDEX idx_user_templates (UserId)
INDEX idx_template_name (UserId, TemplateName)
```

**JSON Schema for InsurancePreferences**:
```json
{
  "insuranceTier": "Basic | Standard | Full",
  "additionalDrivers": 0-5,
  "coverageAmount": 50000-1000000
}
```

**JSON Schema for AdditionalServices**:
```json
["GPS", "ChildSeat", "SkiRack", "WiFiHotspot", "AdditionalDriver"]
```

**Sample Data**:
```sql
INSERT INTO BookingTemplates (UserId, TemplateName, VehicleTypePreference, TypicalDurationDays, InsurancePreferences)
VALUES (1001, 'Business Trip Template', 'Sedan', 3, '{"insuranceTier": "Full", "additionalDrivers": 0}');
```


#### SplitPaymentBookings Table

**Purpose**: Store split-payment configuration and overall status

**Columns**:
```sql
SplitPaymentId BIGINT PRIMARY KEY AUTO_INCREMENT
BookingId BIGINT NOT NULL UNIQUE
TotalAmount DECIMAL(10,2) NOT NULL
CollectedAmount DECIMAL(10,2) DEFAULT 0.00
PrimaryRenterId BIGINT NOT NULL
PaymentConfiguration JSON NOT NULL
PaymentStatus ENUM('pending', 'partial', 'complete', 'failed') DEFAULT 'pending'
BookingConfirmed BOOLEAN DEFAULT FALSE
ExpiresAt DATETIME NOT NULL
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE
FOREIGN KEY (PrimaryRenterId) REFERENCES Users(UserId) ON DELETE RESTRICT
INDEX idx_booking_split (BookingId)
INDEX idx_primary_renter (PrimaryRenterId)
INDEX idx_payment_status (PaymentStatus)
INDEX idx_expires_at (ExpiresAt)
```

**JSON Schema for PaymentConfiguration**:
```json
{
  "splitType": "equal | custom",
  "numberOfCoRenters": 2-10,
  "primaryRenterAmount": 150.00,
  "coRenterAmounts": [150.00, 150.00]
}
```

**Constraints**:
- TotalAmount must equal sum of all individual amounts
- CollectedAmount cannot exceed TotalAmount
- ExpiresAt typically set to 7 days from creation

**Sample Data**:
```sql
INSERT INTO SplitPaymentBookings (BookingId, TotalAmount, PrimaryRenterId, PaymentConfiguration, ExpiresAt)
VALUES (5001, 450.00, 1001, '{"splitType": "equal", "numberOfCoRenters": 3}', DATE_ADD(NOW(), INTERVAL 7 DAY));
```


#### SplitPaymentCoRenters Table

**Purpose**: Track individual co-renter payment status

**Columns**:
```sql
CoRenterId BIGINT PRIMARY KEY AUTO_INCREMENT
SplitPaymentId BIGINT NOT NULL
Email VARCHAR(255) NOT NULL
Phone VARCHAR(20) NULL
Amount DECIMAL(10,2) NOT NULL
PaymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending'
PaymentToken VARCHAR(255) UNIQUE NULL
PaymentMethodId BIGINT NULL
PaidAt DATETIME NULL
LiabilityAgreementAccepted BOOLEAN DEFAULT FALSE
RemindersSent INT DEFAULT 0
LastReminderSentAt DATETIME NULL
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (SplitPaymentId) REFERENCES SplitPaymentBookings(SplitPaymentId) ON DELETE CASCADE
FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId) ON DELETE SET NULL
INDEX idx_split_payment (SplitPaymentId)
INDEX idx_payment_token (PaymentToken)
INDEX idx_payment_status (PaymentStatus)
INDEX idx_email (Email)
```

**Constraints**:
- PaymentToken must be unique and cryptographically secure
- Amount must be positive
- PaidAt must be NULL when PaymentStatus is 'pending'

**Sample Data**:
```sql
INSERT INTO SplitPaymentCoRenters (SplitPaymentId, Email, Amount, PaymentToken)
VALUES (1, 'corenter1@example.com', 150.00, 'tok_abc123xyz789');
```


#### VehicleVINDetails Table

**Purpose**: Store VIN-specific information for luxury vehicle bookings

**Columns**:
```sql
VINDetailId BIGINT PRIMARY KEY AUTO_INCREMENT
VehicleId BIGINT NOT NULL
VIN VARCHAR(17) NOT NULL UNIQUE
ServiceHistory JSON NULL
ConditionReports JSON NULL
LastInspectionDate DATE NULL
CurrentMileage INT NULL
VehicleAge DECIMAL(3,1) NULL
AvailableForVINBooking BOOLEAN DEFAULT FALSE
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE
INDEX idx_vehicle_vin (VehicleId)
INDEX idx_vin_lookup (VIN)
INDEX idx_vin_booking_available (AvailableForVINBooking)
```

**JSON Schema for ServiceHistory**:
```json
[
  {
    "date": "2026-01-15",
    "type": "Routine Maintenance | Repair | Inspection",
    "mileage": 15000,
    "description": "Oil change, tire rotation",
    "cost": 150.00,
    "serviceProvider": "Authorized Dealer"
  }
]
```

**JSON Schema for ConditionReports**:
```json
[
  {
    "date": "2026-02-20",
    "overallCondition": "Excellent | Good | Fair | Poor",
    "exteriorCondition": "Excellent",
    "interiorCondition": "Excellent",
    "mechanicalCondition": "Excellent",
    "notes": "Vehicle in pristine condition",
    "inspectorId": 123
  }
]
```

**Constraints**:
- VIN must be exactly 17 characters (ISO 3779 standard)
- VIN must be unique across all vehicles
- CurrentMileage must be non-negative

**Sample Data**:
```sql
INSERT INTO VehicleVINDetails (VehicleId, VIN, CurrentMileage, AvailableForVINBooking)
VALUES (2001, '1HGBH41JXMN109186', 16500, TRUE);
```


#### VehicleAccessibilityFeatures Table

**Purpose**: Store verified accessibility features per vehicle

**Columns**:
```sql
AccessibilityFeatureId BIGINT PRIMARY KEY AUTO_INCREMENT
VehicleId BIGINT NOT NULL
FeatureCode VARCHAR(50) NOT NULL
FeatureDescription VARCHAR(255) NOT NULL
VerificationStatus ENUM('pending', 'verified', 'expired') DEFAULT 'pending'
LastVerificationDate DATE NULL
NextInspectionDate DATE NULL
VerificationNotes TEXT NULL
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE
INDEX idx_vehicle_accessibility (VehicleId)
INDEX idx_feature_code (FeatureCode)
INDEX idx_verification_status (VerificationStatus)
INDEX idx_next_inspection (NextInspectionDate)
```

**Standard Feature Codes**:
- WHEELCHAIR_RAMP: Wheelchair accessible ramp
- HAND_CONTROLS: Hand controls for acceleration/braking
- LOWERED_FLOOR: Lowered floor for wheelchair access
- SWIVEL_SEAT: Swivel seat for easier entry/exit
- LIFT_SYSTEM: Hydraulic lift system
- WIDE_DOOR: Extra-wide door opening
- AUTOMATIC_TRANSMISSION: Automatic transmission (accessibility requirement)
- VOICE_CONTROLS: Voice-activated vehicle controls

**Constraints**:
- FeatureCode must be from predefined list
- VerificationStatus 'verified' requires LastVerificationDate
- NextInspectionDate typically 6-12 months after LastVerificationDate

**Sample Data**:
```sql
INSERT INTO VehicleAccessibilityFeatures (VehicleId, FeatureCode, FeatureDescription, VerificationStatus, LastVerificationDate)
VALUES (2001, 'WHEELCHAIR_RAMP', 'Wheelchair accessible ramp', 'verified', '2026-02-20');
```


#### VehicleSustainabilityMetrics Table

**Purpose**: Store environmental impact data per vehicle

**Columns**:
```sql
SustainabilityMetricId BIGINT PRIMARY KEY AUTO_INCREMENT
VehicleId BIGINT NOT NULL UNIQUE
CO2EmissionsPerKm DECIMAL(5,2) NULL
FuelEfficiencyMPG DECIMAL(5,2) NULL
FuelEfficiencyMPGe DECIMAL(5,2) NULL
EVRange INT NULL
BatteryCapacity DECIMAL(5,2) NULL
ChargingTimeLevel2Hours DECIMAL(4,1) NULL
ChargingTimeDCFastMinutes INT NULL
SustainabilityBadge ENUM('Electric', 'Hybrid', 'EcoFriendly') NULL
CarbonOffsetBasePrice DECIMAL(6,2) DEFAULT 10.00
CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE
INDEX idx_vehicle_sustainability (VehicleId)
INDEX idx_sustainability_badge (SustainabilityBadge)
INDEX idx_ev_range (EVRange)
INDEX idx_co2_emissions (CO2EmissionsPerKm)
```

**Field Descriptions**:
- CO2EmissionsPerKm: Grams of CO2 per kilometer (0 for EVs direct emissions)
- FuelEfficiencyMPG: Miles per gallon for ICE vehicles
- FuelEfficiencyMPGe: Miles per gallon equivalent for EVs
- EVRange: Estimated range in kilometers for electric vehicles
- BatteryCapacity: Battery capacity in kWh for EVs
- ChargingTimeLevel2Hours: Hours to full charge on Level 2 charger
- ChargingTimeDCFastMinutes: Minutes to 80% charge on DC fast charger

**Constraints**:
- EVs should have CO2EmissionsPerKm = 0 (direct emissions)
- EVs should have FuelEfficiencyMPGe and EVRange populated
- ICE vehicles should have FuelEfficiencyMPG and CO2EmissionsPerKm populated
- Hybrids may have both MPG and MPGe

**Sample Data**:
```sql
INSERT INTO VehicleSustainabilityMetrics (VehicleId, CO2EmissionsPerKm, FuelEfficiencyMPGe, EVRange, BatteryCapacity, SustainabilityBadge)
VALUES (2001, 0.00, 110.0, 400, 75.0, 'Electric');
```


#### PersonaDetectionHistory Table

**Purpose**: Store historical persona detection results for ML model training

**Columns**:
```sql
DetectionHistoryId BIGINT PRIMARY KEY AUTO_INCREMENT
UserId BIGINT NOT NULL
DetectedPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL
ConfidenceScore DECIMAL(3,2) NOT NULL
DetectionFactors JSON NOT NULL
ManualOverrideApplied BOOLEAN DEFAULT FALSE
OverriddenToPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL
DetectedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP

FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE
INDEX idx_user_history (UserId)
INDEX idx_detected_at (DetectedAt)
INDEX idx_manual_override (ManualOverrideApplied)
```

**JSON Schema for DetectionFactors**:
```json
{
  "bookingFrequency": 0.9,
  "vehiclePreference": 0.7,
  "ageGroup": 0.8,
  "corporateAffiliation": 1.0,
  "accessibilityRequests": 0.0,
  "sustainabilityPreference": 0.3
}
```

**Purpose of History Table**:
- Track persona detection accuracy over time
- Identify patterns in manual overrides
- Train and improve ML model
- Analyze persona drift (users changing segments)

**Sample Data**:
```sql
INSERT INTO PersonaDetectionHistory (UserId, DetectedPersona, ConfidenceScore, DetectionFactors)
VALUES (1001, 'PowerRenter', 0.87, '{"bookingFrequency": 0.9, "corporateAffiliation": 1.0}');
```


### Relationships

**UserPersonas to Users**: One-to-One
- Each user has at most one persona profile
- Persona profile is deleted when user is deleted (CASCADE)

**BookingTemplates to Users**: Many-to-One
- Each user can have multiple booking templates
- Templates are deleted when user is deleted (CASCADE)

**BookingTemplates to Locations**: Many-to-One (Pickup and Return)
- Each template can reference pickup and return locations
- Location deletion sets template location to NULL (SET NULL)

**SplitPaymentBookings to Bookings**: One-to-One
- Each booking can have one split-payment configuration
- Split-payment is deleted when booking is deleted (CASCADE)

**SplitPaymentBookings to Users**: Many-to-One (Primary Renter)
- Each split-payment has one primary renter
- Primary renter cannot be deleted if active split-payments exist (RESTRICT)

**SplitPaymentCoRenters to SplitPaymentBookings**: Many-to-One
- Each split-payment can have multiple co-renters
- Co-renters are deleted when split-payment is deleted (CASCADE)

**VehicleVINDetails to Vehicles**: One-to-One
- Each vehicle can have VIN-specific details
- VIN details are deleted when vehicle is deleted (CASCADE)

**VehicleAccessibilityFeatures to Vehicles**: Many-to-One
- Each vehicle can have multiple accessibility features
- Features are deleted when vehicle is deleted (CASCADE)

**VehicleSustainabilityMetrics to Vehicles**: One-to-One
- Each vehicle has one sustainability metrics record
- Metrics are deleted when vehicle is deleted (CASCADE)

**PersonaDetectionHistory to Users**: Many-to-One
- Each user can have multiple detection history records
- History is deleted when user is deleted (CASCADE)


### Indexes

**Performance Optimization Indexes**:

**UserPersonas Table**:
- `idx_user_persona (UserId)`: Fast persona lookup by user
- `idx_detected_persona (DetectedPersona)`: Aggregate queries by persona type

**BookingTemplates Table**:
- `idx_user_templates (UserId)`: Fast template retrieval per user
- `idx_template_name (UserId, TemplateName)`: Unique template name per user

**SplitPaymentBookings Table**:
- `idx_booking_split (BookingId)`: Quick split-payment lookup by booking
- `idx_primary_renter (PrimaryRenterId)`: Find all split-payments for user
- `idx_payment_status (PaymentStatus)`: Query bookings by payment status
- `idx_expires_at (ExpiresAt)`: Identify expired split-payments for cleanup

**SplitPaymentCoRenters Table**:
- `idx_split_payment (SplitPaymentId)`: Fast co-renter queries per split-payment
- `idx_payment_token (PaymentToken)`: Token-based payment processing
- `idx_payment_status (PaymentStatus)`: Find pending/failed payments
- `idx_email (Email)`: Lookup co-renter by email

**VehicleVINDetails Table**:
- `idx_vehicle_vin (VehicleId)`: VIN lookup by vehicle
- `idx_vin_lookup (VIN)`: Direct VIN search
- `idx_vin_booking_available (AvailableForVINBooking)`: Find VIN-bookable vehicles

**VehicleAccessibilityFeatures Table**:
- `idx_vehicle_accessibility (VehicleId)`: Accessibility feature queries
- `idx_feature_code (FeatureCode)`: Feature-based vehicle search
- `idx_verification_status (VerificationStatus)`: Find verified features
- `idx_next_inspection (NextInspectionDate)`: Maintenance scheduling

**VehicleSustainabilityMetrics Table**:
- `idx_vehicle_sustainability (VehicleId)`: Sustainability data retrieval
- `idx_sustainability_badge (SustainabilityBadge)`: Badge-based filtering
- `idx_ev_range (EVRange)`: Range-based EV search
- `idx_co2_emissions (CO2EmissionsPerKm)`: Emissions-based filtering

**PersonaDetectionHistory Table**:
- `idx_user_history (UserId)`: User's detection history
- `idx_detected_at (DetectedAt)`: Time-based analysis
- `idx_manual_override (ManualOverrideApplied)`: Override analysis


### Database Migrations

**Migration 001: Create UserPersonas Table**
```sql
CREATE TABLE UserPersonas (
    UserPersonaId BIGINT PRIMARY KEY AUTO_INCREMENT,
    UserId BIGINT NOT NULL UNIQUE,
    DetectedPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL,
    ConfidenceScore DECIMAL(3,2) DEFAULT 0.00,
    ManualOverride BOOLEAN DEFAULT FALSE,
    OneClickRebookingEnabled BOOLEAN DEFAULT FALSE,
    VinSpecificBookingEnabled BOOLEAN DEFAULT FALSE,
    SplitPaymentEnabled BOOLEAN DEFAULT FALSE,
    SustainabilityMetricsEnabled BOOLEAN DEFAULT FALSE,
    HardAllocationEnabled BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    INDEX idx_user_persona (UserId),
    INDEX idx_detected_persona (DetectedPersona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 002: Create BookingTemplates Table**
```sql
CREATE TABLE BookingTemplates (
    TemplateId BIGINT PRIMARY KEY AUTO_INCREMENT,
    UserId BIGINT NOT NULL,
    TemplateName VARCHAR(100) NOT NULL,
    VehicleTypePreference VARCHAR(50) NULL,
    PickupLocationId BIGINT NULL,
    ReturnLocationId BIGINT NULL,
    TypicalDurationDays INT NULL,
    InsurancePreferences JSON NULL,
    AdditionalServices JSON NULL,
    PaymentMethodId BIGINT NULL,
    IsShared BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    FOREIGN KEY (PickupLocationId) REFERENCES Locations(LocationId) ON DELETE SET NULL,
    FOREIGN KEY (ReturnLocationId) REFERENCES Locations(LocationId) ON DELETE SET NULL,
    FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId) ON DELETE SET NULL,
    INDEX idx_user_templates (UserId),
    INDEX idx_template_name (UserId, TemplateName)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 003: Create Split-Payment Tables**
```sql
CREATE TABLE SplitPaymentBookings (
    SplitPaymentId BIGINT PRIMARY KEY AUTO_INCREMENT,
    BookingId BIGINT NOT NULL UNIQUE,
    TotalAmount DECIMAL(10,2) NOT NULL,
    CollectedAmount DECIMAL(10,2) DEFAULT 0.00,
    PrimaryRenterId BIGINT NOT NULL,
    PaymentConfiguration JSON NOT NULL,
    PaymentStatus ENUM('pending', 'partial', 'complete', 'failed') DEFAULT 'pending',
    BookingConfirmed BOOLEAN DEFAULT FALSE,
    ExpiresAt DATETIME NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    FOREIGN KEY (PrimaryRenterId) REFERENCES Users(UserId) ON DELETE RESTRICT,
    INDEX idx_booking_split (BookingId),
    INDEX idx_primary_renter (PrimaryRenterId),
    INDEX idx_payment_status (PaymentStatus),
    INDEX idx_expires_at (ExpiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE SplitPaymentCoRenters (
    CoRenterId BIGINT PRIMARY KEY AUTO_INCREMENT,
    SplitPaymentId BIGINT NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentStatus ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    PaymentToken VARCHAR(255) UNIQUE NULL,
    PaymentMethodId BIGINT NULL,
    PaidAt DATETIME NULL,
    LiabilityAgreementAccepted BOOLEAN DEFAULT FALSE,
    RemindersSent INT DEFAULT 0,
    LastReminderSentAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (SplitPaymentId) REFERENCES SplitPaymentBookings(SplitPaymentId) ON DELETE CASCADE,
    FOREIGN KEY (PaymentMethodId) REFERENCES PaymentMethods(PaymentMethodId) ON DELETE SET NULL,
    INDEX idx_split_payment (SplitPaymentId),
    INDEX idx_payment_token (PaymentToken),
    INDEX idx_payment_status (PaymentStatus),
    INDEX idx_email (Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


**Migration 004: Create Vehicle Detail Tables**
```sql
CREATE TABLE VehicleVINDetails (
    VINDetailId BIGINT PRIMARY KEY AUTO_INCREMENT,
    VehicleId BIGINT NOT NULL,
    VIN VARCHAR(17) NOT NULL UNIQUE,
    ServiceHistory JSON NULL,
    ConditionReports JSON NULL,
    LastInspectionDate DATE NULL,
    CurrentMileage INT NULL,
    VehicleAge DECIMAL(3,1) NULL,
    AvailableForVINBooking BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_vin (VehicleId),
    INDEX idx_vin_lookup (VIN),
    INDEX idx_vin_booking_available (AvailableForVINBooking)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VehicleAccessibilityFeatures (
    AccessibilityFeatureId BIGINT PRIMARY KEY AUTO_INCREMENT,
    VehicleId BIGINT NOT NULL,
    FeatureCode VARCHAR(50) NOT NULL,
    FeatureDescription VARCHAR(255) NOT NULL,
    VerificationStatus ENUM('pending', 'verified', 'expired') DEFAULT 'pending',
    LastVerificationDate DATE NULL,
    NextInspectionDate DATE NULL,
    VerificationNotes TEXT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_accessibility (VehicleId),
    INDEX idx_feature_code (FeatureCode),
    INDEX idx_verification_status (VerificationStatus),
    INDEX idx_next_inspection (NextInspectionDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE VehicleSustainabilityMetrics (
    SustainabilityMetricId BIGINT PRIMARY KEY AUTO_INCREMENT,
    VehicleId BIGINT NOT NULL UNIQUE,
    CO2EmissionsPerKm DECIMAL(5,2) NULL,
    FuelEfficiencyMPG DECIMAL(5,2) NULL,
    FuelEfficiencyMPGe DECIMAL(5,2) NULL,
    EVRange INT NULL,
    BatteryCapacity DECIMAL(5,2) NULL,
    ChargingTimeLevel2Hours DECIMAL(4,1) NULL,
    ChargingTimeDCFastMinutes INT NULL,
    SustainabilityBadge ENUM('Electric', 'Hybrid', 'EcoFriendly') NULL,
    CarbonOffsetBasePrice DECIMAL(6,2) DEFAULT 10.00,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    INDEX idx_vehicle_sustainability (VehicleId),
    INDEX idx_sustainability_badge (SustainabilityBadge),
    INDEX idx_ev_range (EVRange),
    INDEX idx_co2_emissions (CO2EmissionsPerKm)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 005: Create PersonaDetectionHistory Table**
```sql
CREATE TABLE PersonaDetectionHistory (
    DetectionHistoryId BIGINT PRIMARY KEY AUTO_INCREMENT,
    UserId BIGINT NOT NULL,
    DetectedPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL,
    ConfidenceScore DECIMAL(3,2) NOT NULL,
    DetectionFactors JSON NOT NULL,
    ManualOverrideApplied BOOLEAN DEFAULT FALSE,
    OverriddenToPersona ENUM('PowerRenter', 'ExperienceSeeker', 'YoungDriver', 'EcoConscious', 'AccessibleMobility') NULL,
    DetectedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
    INDEX idx_user_history (UserId),
    INDEX idx_detected_at (DetectedAt),
    INDEX idx_manual_override (ManualOverrideApplied)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Migration 006: Modify Bookings Table**
```sql
ALTER TABLE Bookings
ADD COLUMN HardAllocation BOOLEAN DEFAULT FALSE,
ADD COLUMN VINLocked VARCHAR(17) NULL,
ADD INDEX idx_hard_allocation (HardAllocation),
ADD INDEX idx_vin_locked (VINLocked);
```

**Migration 007: Modify Users Table**
```sql
ALTER TABLE Users
ADD COLUMN LastPersonaDetectionDate DATETIME NULL,
ADD INDEX idx_last_persona_detection (LastPersonaDetectionDate);
```


### Stored Procedures

**Procedure: UpdateSplitPaymentStatus**
```sql
DELIMITER //
CREATE PROCEDURE UpdateSplitPaymentStatus(IN p_SplitPaymentId BIGINT)
BEGIN
    DECLARE v_TotalAmount DECIMAL(10,2);
    DECLARE v_CollectedAmount DECIMAL(10,2);
    DECLARE v_BookingId BIGINT;
    
    -- Calculate collected amount
    SELECT SUM(Amount) INTO v_CollectedAmount
    FROM SplitPaymentCoRenters
    WHERE SplitPaymentId = p_SplitPaymentId AND PaymentStatus = 'paid';
    
    -- Get total amount and booking ID
    SELECT TotalAmount, BookingId INTO v_TotalAmount, v_BookingId
    FROM SplitPaymentBookings
    WHERE SplitPaymentId = p_SplitPaymentId;
    
    -- Update split payment status
    UPDATE SplitPaymentBookings
    SET CollectedAmount = v_CollectedAmount,
        PaymentStatus = CASE
            WHEN v_CollectedAmount = 0 THEN 'pending'
            WHEN v_CollectedAmount < v_TotalAmount THEN 'partial'
            WHEN v_CollectedAmount >= v_TotalAmount THEN 'complete'
        END,
        BookingConfirmed = (v_CollectedAmount >= v_TotalAmount)
    WHERE SplitPaymentId = p_SplitPaymentId;
    
    -- If fully paid, update booking status
    IF v_CollectedAmount >= v_TotalAmount THEN
        UPDATE Bookings
        SET BookingStatus = 'Confirmed'
        WHERE BookingId = v_BookingId;
    END IF;
END //
DELIMITER ;
```

**Procedure: DetectUserPersona**
```sql
DELIMITER //
CREATE PROCEDURE DetectUserPersona(IN p_UserId BIGINT)
BEGIN
    DECLARE v_BookingCount INT;
    DECLARE v_AvgDuration DECIMAL(5,2);
    DECLARE v_LuxuryRate DECIMAL(3,2);
    DECLARE v_UserAge INT;
    DECLARE v_DetectedPersona VARCHAR(50);
    DECLARE v_ConfidenceScore DECIMAL(3,2);
    
    -- Calculate booking metrics
    SELECT COUNT(*), AVG(DATEDIFF(ReturnDate, PickupDate))
    INTO v_BookingCount, v_AvgDuration
    FROM Bookings
    WHERE UserId = p_UserId AND BookingStatus = 'Completed';
    
    -- Calculate luxury vehicle rate
    SELECT COUNT(*) / NULLIF(v_BookingCount, 0)
    INTO v_LuxuryRate
    FROM Bookings b
    JOIN Vehicles v ON b.VehicleId = v.VehicleId
    WHERE b.UserId = p_UserId AND v.Category = 'Luxury';
    
    -- Get user age
    SELECT TIMESTAMPDIFF(YEAR, DateOfBirth, CURDATE())
    INTO v_UserAge
    FROM Users
    WHERE UserId = p_UserId;
    
    -- Detect persona
    IF v_BookingCount > 12 AND v_AvgDuration < 5 THEN
        SET v_DetectedPersona = 'PowerRenter';
        SET v_ConfidenceScore = 0.85;
    ELSEIF v_LuxuryRate > 0.7 THEN
        SET v_DetectedPersona = 'ExperienceSeeker';
        SET v_ConfidenceScore = 0.80;
    ELSEIF v_UserAge BETWEEN 18 AND 25 THEN
        SET v_DetectedPersona = 'YoungDriver';
        SET v_ConfidenceScore = 0.70;
    ELSE
        SET v_DetectedPersona = NULL;
        SET v_ConfidenceScore = 0.00;
    END IF;
    
    -- Update or insert persona
    INSERT INTO UserPersonas (UserId, DetectedPersona, ConfidenceScore)
    VALUES (p_UserId, v_DetectedPersona, v_ConfidenceScore)
    ON DUPLICATE KEY UPDATE
        DetectedPersona = v_DetectedPersona,
        ConfidenceScore = v_ConfidenceScore,
        UpdatedAt = CURRENT_TIMESTAMP;
    
    -- Update user's last detection date
    UPDATE Users
    SET LastPersonaDetectionDate = CURRENT_TIMESTAMP
    WHERE UserId = p_UserId;
END //
DELIMITER ;
```


### Database Triggers

**Trigger: AfterCoRenterPayment**
```sql
DELIMITER //
CREATE TRIGGER AfterCoRenterPayment
AFTER UPDATE ON SplitPaymentCoRenters
FOR EACH ROW
BEGIN
    IF NEW.PaymentStatus = 'paid' AND OLD.PaymentStatus != 'paid' THEN
        CALL UpdateSplitPaymentStatus(NEW.SplitPaymentId);
    END IF;
END //
DELIMITER ;
```

**Trigger: BeforeBookingInsert**
```sql
DELIMITER //
CREATE TRIGGER BeforeBookingInsert
BEFORE INSERT ON Bookings
FOR EACH ROW
BEGIN
    -- If VINLocked is set, mark as HardAllocation
    IF NEW.VINLocked IS NOT NULL THEN
        SET NEW.HardAllocation = TRUE;
    END IF;
END //
DELIMITER ;
```

**Trigger: AfterPersonaUpdate**
```sql
DELIMITER //
CREATE TRIGGER AfterPersonaUpdate
AFTER UPDATE ON UserPersonas
FOR EACH ROW
BEGIN
    -- Log persona change to history
    IF NEW.DetectedPersona != OLD.DetectedPersona OR NEW.ManualOverride = TRUE THEN
        INSERT INTO PersonaDetectionHistory (
            UserId, DetectedPersona, ConfidenceScore, DetectionFactors,
            ManualOverrideApplied, OverriddenToPersona
        ) VALUES (
            NEW.UserId, NEW.DetectedPersona, NEW.ConfidenceScore,
            JSON_OBJECT('source', 'update'),
            NEW.ManualOverride, NEW.DetectedPersona
        );
    END IF;
END //
DELIMITER ;
```


### Query Examples

**Query 1: Get User Persona with Booking Statistics**
```sql
SELECT 
    u.UserId,
    u.Email,
    up.DetectedPersona,
    up.ConfidenceScore,
    COUNT(b.BookingId) AS TotalBookings,
    AVG(DATEDIFF(b.ReturnDate, b.PickupDate)) AS AvgDuration,
    SUM(b.TotalAmount) AS TotalRevenue
FROM Users u
LEFT JOIN UserPersonas up ON u.UserId = up.UserId
LEFT JOIN Bookings b ON u.UserId = b.UserId
WHERE u.UserId = ?
GROUP BY u.UserId;
```

**Query 2: Find Accessible Vehicles with Specific Features**
```sql
SELECT 
    v.VehicleId,
    v.Make,
    v.Model,
    v.Year,
    GROUP_CONCAT(vaf.FeatureCode) AS AccessibilityFeatures
FROM Vehicles v
JOIN VehicleAccessibilityFeatures vaf ON v.VehicleId = vaf.VehicleId
WHERE vaf.VerificationStatus = 'verified'
    AND vaf.FeatureCode IN ('WHEELCHAIR_RAMP', 'HAND_CONTROLS')
GROUP BY v.VehicleId
HAVING COUNT(DISTINCT vaf.FeatureCode) = 2;
```

**Query 3: Get Split-Payment Status with Co-Renter Details**
```sql
SELECT 
    spb.BookingId,
    spb.TotalAmount,
    spb.CollectedAmount,
    spb.PaymentStatus,
    spc.Email,
    spc.Amount,
    spc.PaymentStatus AS CoRenterStatus,
    spc.PaidAt
FROM SplitPaymentBookings spb
JOIN SplitPaymentCoRenters spc ON spb.SplitPaymentId = spc.SplitPaymentId
WHERE spb.BookingId = ?
ORDER BY spc.PaymentStatus DESC, spc.CreatedAt;
```

**Query 4: Find Electric Vehicles with Range > 300km**
```sql
SELECT 
    v.VehicleId,
    v.Make,
    v.Model,
    vsm.EVRange,
    vsm.BatteryCapacity,
    vsm.FuelEfficiencyMPGe,
    vsm.SustainabilityBadge
FROM Vehicles v
JOIN VehicleSustainabilityMetrics vsm ON v.VehicleId = vsm.VehicleId
WHERE vsm.SustainabilityBadge = 'Electric'
    AND vsm.EVRange > 300
ORDER BY vsm.EVRange DESC;
```

**Query 5: Get User's Booking Templates**
```sql
SELECT 
    bt.TemplateId,
    bt.TemplateName,
    bt.VehicleTypePreference,
    l1.LocationName AS PickupLocation,
    l2.LocationName AS ReturnLocation,
    bt.TypicalDurationDays,
    bt.InsurancePreferences,
    bt.AdditionalServices
FROM BookingTemplates bt
LEFT JOIN Locations l1 ON bt.PickupLocationId = l1.LocationId
LEFT JOIN Locations l2 ON bt.ReturnLocationId = l2.LocationId
WHERE bt.UserId = ?
ORDER BY bt.UpdatedAt DESC;
```

**Query 6: Find Expired Split-Payments for Cleanup**
```sql
SELECT 
    spb.SplitPaymentId,
    spb.BookingId,
    spb.TotalAmount,
    spb.CollectedAmount,
    spb.ExpiresAt,
    COUNT(spc.CoRenterId) AS TotalCoRenters,
    SUM(CASE WHEN spc.PaymentStatus = 'paid' THEN 1 ELSE 0 END) AS PaidCoRenters
FROM SplitPaymentBookings spb
JOIN SplitPaymentCoRenters spc ON spb.SplitPaymentId = spc.SplitPaymentId
WHERE spb.ExpiresAt < NOW()
    AND spb.PaymentStatus != 'complete'
GROUP BY spb.SplitPaymentId;
```

**Query 7: Get VIN-Specific Vehicle Details**
```sql
SELECT 
    v.VehicleId,
    v.Make,
    v.Model,
    v.Year,
    vvd.VIN,
    vvd.CurrentMileage,
    vvd.LastInspectionDate,
    vvd.ServiceHistory,
    vvd.ConditionReports,
    vvd.AvailableForVINBooking
FROM Vehicles v
JOIN VehicleVINDetails vvd ON v.VehicleId = vvd.VehicleId
WHERE vvd.VIN = ?;
```


### Data Integrity Constraints

**Business Rules Enforced by Database**:

1. **Split-Payment Amount Validation**:
   - Sum of all co-renter amounts must equal booking total amount
   - Collected amount cannot exceed total amount
   - Individual amounts must be positive

2. **VIN Format Validation**:
   - VIN must be exactly 17 characters
   - VIN must be unique across all vehicles
   - VIN can only contain alphanumeric characters (no I, O, Q)

3. **Persona Confidence Score**:
   - Confidence score must be between 0.00 and 1.00
   - Scores below 0.60 should not assign a persona

4. **Accessibility Feature Verification**:
   - Verified features must have LastVerificationDate
   - NextInspectionDate must be after LastVerificationDate
   - Expired features (>12 months) should be marked as 'expired'

5. **Sustainability Metrics Consistency**:
   - Electric vehicles must have EVRange and BatteryCapacity
   - ICE vehicles must have FuelEfficiencyMPG and CO2EmissionsPerKm
   - CO2EmissionsPerKm for EVs should be 0 (direct emissions)

6. **Split-Payment Expiration**:
   - ExpiresAt must be in the future when created
   - Typically set to 7 days from creation
   - Expired bookings with incomplete payment should be cancelled

7. **Hard Allocation Enforcement**:
   - If VINLocked is set, HardAllocation must be TRUE
   - VINLocked must reference a valid VIN from VehicleVINDetails
   - Hard allocation bookings cannot be modified to different vehicles


# Feature: Multi-Step Booking Checkout (Database)

## Overview

Database schema and data model supporting the multi-step booking checkout workflow. Includes tables for bookings, customer information, additional drivers, insurance selections, services, pricing breakdowns, payments, and vehicle locks.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-001: Multi-Step Checkout Process
- F-WF-BOOK-001: Multi-Step Booking Checkout

## Database Specifications

### Schema Changes

Refer to the frontend documentation for complete database schema specifications including:

**New Tables:**
- `Bookings`: Core booking records
- `BookingCustomers`: Customer information for bookings
- `BookingAdditionalDrivers`: Additional driver information
- `BookingInsurance`: Insurance selections
- `BookingServices`: Additional services
- `BookingPricing`: Detailed pricing breakdowns
- `BookingPayments`: Payment transaction records
- `VehicleLocks`: Temporary vehicle locks during checkout

### Entity Relationship Diagram

```
Vehicles (1) ----< (M) Bookings (1) ---- (1) BookingCustomers
                        |
                        +----< (M) BookingAdditionalDrivers
                        |
                        +----< (M) BookingInsurance
                        |
                        +----< (M) BookingServices
                        |
                        +---- (1) BookingPricing
                        |
                        +----< (M) BookingPayments

Vehicles (1) ----< (M) VehicleLocks

Users (1) ----< (M) Bookings

Locations (1) ----< (M) Bookings (pickup)
Locations (1) ----< (M) Bookings (return)

Services (1) ----< (M) BookingServices
```


### Migration Scripts

#### Create Bookings Table
```sql
CREATE TABLE Bookings (
    BookingId CHAR(36) PRIMARY KEY,
    ReferenceNumber VARCHAR(20) UNIQUE NOT NULL,
    VehicleId CHAR(36) NOT NULL,
    CustomerId CHAR(36) NULL,
    PickupDateTime DATETIME NOT NULL,
    ReturnDateTime DATETIME NOT NULL,
    PickupLocationId CHAR(36) NOT NULL,
    ReturnLocationId CHAR(36) NOT NULL,
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled')),
    TotalAmount DECIMAL(10,2) NOT NULL CHECK (TotalAmount > 0),
    Currency CHAR(3) NOT NULL DEFAULT 'USD',
    PaymentStatus VARCHAR(20) NOT NULL CHECK (PaymentStatus IN ('Pending', 'Authorized', 'Captured', 'Refunded', 'Failed')),
    TransactionId VARCHAR(100) NULL,
    PromoCode VARCHAR(50) NULL,
    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (DiscountAmount >= 0),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ConfirmedAt DATETIME NULL,
    CancelledAt DATETIME NULL,
    CancellationReason TEXT NULL,
    CONSTRAINT FK_Bookings_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId),
    CONSTRAINT FK_Bookings_Users FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
    CONSTRAINT FK_Bookings_PickupLocation FOREIGN KEY (PickupLocationId) REFERENCES Locations(LocationId),
    CONSTRAINT FK_Bookings_ReturnLocation FOREIGN KEY (ReturnLocationId) REFERENCES Locations(LocationId),
    CONSTRAINT CHK_Bookings_Dates CHECK (ReturnDateTime > PickupDateTime),
    INDEX IDX_Bookings_Vehicle_Dates (VehicleId, PickupDateTime, ReturnDateTime),
    INDEX IDX_Bookings_Customer (CustomerId),
    INDEX IDX_Bookings_Status (Status),
    INDEX IDX_Bookings_CreatedAt (CreatedAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### Create BookingCustomers Table
```sql
CREATE TABLE BookingCustomers (
    BookingCustomerId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) UNIQUE NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(255) NOT NULL,
    Phone VARCHAR(20) NOT NULL,
    SecondaryPhone VARCHAR(20) NULL,
    DateOfBirth DATE NOT NULL,
    Age INT NOT NULL CHECK (Age >= 18),
    LicenseNumber VARCHAR(50) NOT NULL,
    LicenseIssuingLocation VARCHAR(100) NOT NULL,
    LicenseExpirationDate DATE NOT NULL,
    SpecialRequests TEXT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingCustomers_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    INDEX IDX_BookingCustomers_Email (Email),
    INDEX IDX_BookingCustomers_License (LicenseNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Create BookingAdditionalDrivers Table
```sql
CREATE TABLE BookingAdditionalDrivers (
    DriverId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) NOT NULL,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    DateOfBirth DATE NOT NULL,
    Age INT NOT NULL CHECK (Age >= 18),
    LicenseNumber VARCHAR(50) NOT NULL,
    LicenseIssuingLocation VARCHAR(100) NOT NULL,
    LicenseExpirationDate DATE NOT NULL,
    FeeAmount DECIMAL(10,2) NOT NULL CHECK (FeeAmount >= 0),
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingAdditionalDrivers_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    INDEX IDX_BookingAdditionalDrivers_Booking (BookingId),
    INDEX IDX_BookingAdditionalDrivers_License (LicenseNumber)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### Create BookingInsurance Table
```sql
CREATE TABLE BookingInsurance (
    BookingInsuranceId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) NOT NULL,
    InsuranceType VARCHAR(50) NOT NULL,
    CostPerDay DECIMAL(10,2) NOT NULL,
    TotalCost DECIMAL(10,2) NOT NULL,
    CoverageDetails TEXT NULL,
    Deductible DECIMAL(10,2) NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingInsurance_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    INDEX IDX_BookingInsurance_Booking (BookingId),
    INDEX IDX_BookingInsurance_Type (InsuranceType)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Create BookingServices Table
```sql
CREATE TABLE BookingServices (
    BookingServiceId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) NOT NULL,
    ServiceId CHAR(36) NOT NULL,
    ServiceName VARCHAR(100) NOT NULL,
    Quantity INT NOT NULL DEFAULT 1 CHECK (Quantity > 0),
    CostPerDay DECIMAL(10,2) NULL,
    FlatRate DECIMAL(10,2) NULL,
    TotalCost DECIMAL(10,2) NOT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingServices_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    CONSTRAINT FK_BookingServices_Services FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId),
    INDEX IDX_BookingServices_Booking (BookingId),
    INDEX IDX_BookingServices_Service (ServiceId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### Create BookingPricing Table
```sql
CREATE TABLE BookingPricing (
    BookingPricingId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) UNIQUE NOT NULL,
    BaseRate DECIMAL(10,2) NOT NULL,
    InsuranceCost DECIMAL(10,2) NOT NULL DEFAULT 0,
    DriverFees DECIMAL(10,2) NOT NULL DEFAULT 0,
    ServiceFees DECIMAL(10,2) NOT NULL DEFAULT 0,
    TaxAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    OtherFees DECIMAL(10,2) NOT NULL DEFAULT 0,
    DiscountAmount DECIMAL(10,2) NOT NULL DEFAULT 0,
    SubTotal DECIMAL(10,2) NOT NULL,
    Total DECIMAL(10,2) NOT NULL,
    Currency CHAR(3) NOT NULL DEFAULT 'USD',
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingPricing_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Create BookingPayments Table
```sql
CREATE TABLE BookingPayments (
    PaymentId CHAR(36) PRIMARY KEY,
    BookingId CHAR(36) NOT NULL,
    TransactionId VARCHAR(100) NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Currency CHAR(3) NOT NULL DEFAULT 'USD',
    Status VARCHAR(20) NOT NULL CHECK (Status IN ('Pending', 'Authorized', 'Captured', 'Failed', 'Refunded')),
    AuthorizationCode VARCHAR(50) NULL,
    ProcessedAt DATETIME NULL,
    FailureReason TEXT NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_BookingPayments_Bookings FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
    INDEX IDX_BookingPayments_Booking (BookingId),
    INDEX IDX_BookingPayments_Transaction (TransactionId),
    INDEX IDX_BookingPayments_Status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### Create VehicleLocks Table
```sql
CREATE TABLE VehicleLocks (
    LockId CHAR(36) PRIMARY KEY,
    VehicleId CHAR(36) NOT NULL,
    LockToken VARCHAR(100) UNIQUE NOT NULL,
    PickupDateTime DATETIME NOT NULL,
    ReturnDateTime DATETIME NOT NULL,
    SessionId VARCHAR(100) NOT NULL,
    ExpiresAt DATETIME NOT NULL,
    Released BOOLEAN NOT NULL DEFAULT FALSE,
    ReleasedAt DATETIME NULL,
    CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_VehicleLocks_Vehicles FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
    INDEX IDX_VehicleLocks_Vehicle (VehicleId),
    INDEX IDX_VehicleLocks_Expires (ExpiresAt),
    INDEX IDX_VehicleLocks_Released (Released),
    INDEX IDX_VehicleLocks_Availability (VehicleId, Released, ExpiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Data Integrity and Constraints

#### Referential Integrity
All foreign key relationships enforce referential integrity with appropriate cascade rules:
- Deleting a booking cascades to all related records (customers, drivers, insurance, services, pricing, payments)
- Deleting a vehicle does NOT cascade to bookings (preserve historical data)
- Deleting a user does NOT cascade to bookings (preserve booking history)
- Deleting a vehicle cascades to vehicle locks (cleanup temporary data)

#### Check Constraints
- Booking dates: Return date must be after pickup date
- Amounts: All monetary amounts must be non-negative
- Age: Minimum age 18 for all drivers
- Status: Booking and payment status limited to valid values
- Discount: Cannot exceed total amount

#### Unique Constraints
- Booking reference numbers must be unique
- Lock tokens must be unique
- One customer record per booking
- One pricing record per booking


### Query Optimization

#### Common Queries

**Check Vehicle Availability:**
```sql
SELECT v.VehicleId, v.Name, v.Status
FROM Vehicles v
WHERE v.VehicleId = @VehicleId
  AND v.Status = 'Available'
  AND NOT EXISTS (
    SELECT 1 FROM Bookings b
    WHERE b.VehicleId = v.VehicleId
      AND b.Status IN ('Confirmed', 'Active')
      AND (
        (@PickupDateTime BETWEEN b.PickupDateTime AND b.ReturnDateTime)
        OR (@ReturnDateTime BETWEEN b.PickupDateTime AND b.ReturnDateTime)
        OR (b.PickupDateTime BETWEEN @PickupDateTime AND @ReturnDateTime)
      )
  )
  AND NOT EXISTS (
    SELECT 1 FROM VehicleLocks vl
    WHERE vl.VehicleId = v.VehicleId
      AND vl.Released = FALSE
      AND vl.ExpiresAt > NOW()
      AND (
        (@PickupDateTime BETWEEN vl.PickupDateTime AND vl.ReturnDateTime)
        OR (@ReturnDateTime BETWEEN vl.PickupDateTime AND vl.ReturnDateTime)
        OR (vl.PickupDateTime BETWEEN @PickupDateTime AND @ReturnDateTime)
      )
  );
```

**Get Complete Booking Details:**
```sql
SELECT 
  b.*,
  bc.*,
  v.Name AS VehicleName,
  pl.Name AS PickupLocationName,
  rl.Name AS ReturnLocationName,
  bp.BaseRate, bp.Total
FROM Bookings b
INNER JOIN BookingCustomers bc ON b.BookingId = bc.BookingId
INNER JOIN Vehicles v ON b.VehicleId = v.VehicleId
INNER JOIN Locations pl ON b.PickupLocationId = pl.LocationId
INNER JOIN Locations rl ON b.ReturnLocationId = rl.LocationId
INNER JOIN BookingPricing bp ON b.BookingId = bp.BookingId
WHERE b.BookingId = @BookingId;
```


**Get Customer Booking History:**
```sql
SELECT 
  b.BookingId,
  b.ReferenceNumber,
  b.Status,
  b.PickupDateTime,
  b.ReturnDateTime,
  v.Name AS VehicleName,
  bp.Total
FROM Bookings b
INNER JOIN Vehicles v ON b.VehicleId = v.VehicleId
INNER JOIN BookingPricing bp ON b.BookingId = bp.BookingId
WHERE b.CustomerId = @CustomerId
ORDER BY b.CreatedAt DESC
LIMIT 50;
```

**Cleanup Expired Locks:**
```sql
UPDATE VehicleLocks
SET Released = TRUE, ReleasedAt = NOW()
WHERE Released = FALSE
  AND ExpiresAt < NOW();
```

### Index Strategy

#### Primary Indexes
All tables have primary key indexes on their ID columns for fast lookups.

#### Foreign Key Indexes
All foreign key columns have indexes for efficient join operations.

#### Composite Indexes
- `Bookings(VehicleId, PickupDateTime, ReturnDateTime)`: Optimizes availability checks
- `VehicleLocks(VehicleId, Released, ExpiresAt)`: Optimizes lock validation

#### Covering Indexes
Consider adding covering indexes for frequently accessed columns:
- `Bookings(CustomerId, Status, CreatedAt)`: Customer booking history queries
- `Bookings(Status, PickupDateTime)`: Upcoming bookings queries


### Data Archival Strategy

#### Completed Bookings
- Keep completed bookings in main table for 2 years
- Archive older bookings to separate archive table
- Maintain indexes on archive table for historical queries
- Preserve all related records (customers, payments, etc.)

#### Cancelled Bookings
- Keep cancelled bookings in main table for 1 year
- Archive older cancellations
- Maintain cancellation reason for analysis

#### Vehicle Locks
- Automatically cleanup released locks older than 7 days
- No archival needed (temporary data only)

#### Payment Records
- Never delete payment records (regulatory requirement)
- Archive to separate table after 7 years
- Maintain audit trail indefinitely

### Backup and Recovery

#### Backup Strategy
- Full database backup daily
- Transaction log backup every hour
- Point-in-time recovery capability
- Backup retention: 30 days for daily, 90 days for weekly

#### Recovery Procedures
- Test recovery procedures monthly
- Document recovery time objective (RTO): 1 hour
- Document recovery point objective (RPO): 1 hour
- Maintain disaster recovery site


## Technology Stack

### Database
- **RDBMS:** MySQL 8.0+ with InnoDB storage engine
- **Character Set:** utf8mb4 for full Unicode support
- **Collation:** utf8mb4_unicode_ci for case-insensitive comparisons
- **Migrations:** Entity Framework Core Migrations
- **Connection Pooling:** Built-in EF Core connection pooling

### Performance Features
- **Query Cache:** Enabled for frequently executed queries
- **Buffer Pool:** Configured for optimal memory usage
- **Indexes:** Comprehensive indexing strategy
- **Partitioning:** Consider partitioning Bookings table by date for large datasets

## Implementation Notes

### Critical Considerations

**Transaction Isolation:**
- Use READ COMMITTED isolation level for most operations
- Use SERIALIZABLE for booking creation to prevent race conditions
- Handle deadlocks with retry logic

**Concurrency Control:**
- Implement optimistic concurrency for booking updates
- Use row-level locking for vehicle availability checks
- Handle lock timeouts gracefully

**Data Consistency:**
- Ensure all monetary calculations use DECIMAL type (no floating point)
- Store all timestamps in UTC
- Use database transactions for multi-table operations
- Implement foreign key constraints for referential integrity

**Performance Monitoring:**
- Monitor slow query log
- Track index usage and optimize unused indexes
- Monitor table growth and plan for partitioning
- Track connection pool utilization


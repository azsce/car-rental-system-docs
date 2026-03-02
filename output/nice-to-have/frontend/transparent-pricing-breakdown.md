# Feature: Transparent Pricing Breakdown

## Overview

Clear, itemized pricing breakdown displaying all cost components with no hidden fees to build customer trust and reduce disputes. Shows base rental rate, insurance costs, additional services, taxes and fees, discounts, and total cost with price comparison against standard rates. Includes dynamic pricing display with time-based rates, volume discounts, seasonal pricing, real-time updates, and optional price lock functionality.

## Sprint Category

nice-to-have (Nice-to-have - Would be great but not essential)

## Feature ID

F-PB-007

## User Stories

### As a customer
I want to see a complete breakdown of all costs before booking, so that I understand exactly what I'm paying for with no surprises.

### As a budget-conscious customer
I want to see how much I'm saving with discounts and promotions, so that I feel confident I'm getting a good deal.

### As a business traveler
I want itemized pricing for expense reporting, so that I can properly categorize costs for reimbursement.

### As a comparison shopper
I want to see pricing compared to standard rates, so that I can evaluate the value of the current offer.

## Frontend Specifications

### Pages

**Pricing Breakdown Component** (Embedded in search results and booking flow)
- Displayed on vehicle detail pages
- Shown during booking checkout
- Included in booking confirmation
- Available in booking history

**Price Calculator Page** (`/pricing/calculator`)
- Interactive pricing calculator
- Adjust rental duration and see price changes
- Add/remove services and see impact
- Compare different vehicle options
- Export pricing estimate

### UI Components

**PricingBreakdownCard Component**
- Collapsible sections for each cost category
- Base rate with per-day/hour breakdown
- Insurance options with individual costs
- Additional services itemized
- Taxes and fees by type
- Discounts shown as negative amounts
- Total prominently displayed
- Currency formatting
- Tooltip explanations for each item

**DynamicPriceDisplay Component**
- Real-time price updates as options change
- Loading state during price calculation
- Price change animation
- Comparison to original price
- Savings badge if discounts applied
- Price lock timer if applicable

**PriceComparisonBadge Component**
- Show percentage savings
- Display "You save $X" message
- Highlight promotional pricing
- Show standard rate vs current rate
- Visual indicator (green badge, strikethrough)

**TaxBreakdownTooltip Component**
- Hover tooltip showing tax details
- Tax type and rate for each tax
- Jurisdiction information
- Total tax amount
- Link to tax policy page

**DiscountSummary Component**
- List all applied discounts
- Discount code or promotion name
- Discount amount or percentage
- Discount expiration if applicable
- Remove discount option

### User Flows

**Pricing Transparency Flow**:
1. User views vehicle in search results
2. System displays base price prominently
3. User clicks "See pricing details"
4. System expands pricing breakdown
5. User sees itemized costs for all components
6. User hovers over tax amount
7. System displays tax breakdown tooltip
8. User adds insurance option
9. System updates total price in real-time
10. User sees updated breakdown with insurance cost
11. User applies discount code
12. System recalculates and shows savings
13. User proceeds to booking with full price transparency

**Dynamic Pricing Flow**:
1. User selects rental dates
2. System calculates base rate for duration
3. System applies volume discount if applicable (7+ days)
4. System checks for seasonal pricing adjustments
5. System displays updated price
6. User changes rental duration
7. System recalculates in real-time
8. User sees new price with updated breakdown
9. System highlights savings from volume discount

### Data Requirements

**From Backend APIs**:
- GET `/api/pricing/breakdown` - Detailed pricing calculation
- GET `/api/pricing/taxes` - Tax rates for location
- GET `/api/pricing/discounts` - Available discounts
- POST `/api/pricing/calculate` - Calculate total with options
- POST `/api/pricing/lock` - Lock price for limited time

**Pricing Data**:
- Base rental rate (hourly, daily, weekly, monthly)
- Insurance option prices
- Additional service prices (GPS, child seat, etc.)
- Tax rates by jurisdiction
- Discount amounts and rules
- Volume discount thresholds
- Seasonal pricing multipliers

## Backend Specifications

### API Endpoints

**GET `/api/v1/pricing/breakdown`**
- Purpose: Get detailed pricing breakdown for vehicle and options
- Authentication: Optional (public pricing)
- Query Parameters:
  - `vehicleId` (guid, required): Vehicle ID
  - `startDate` (datetime, required): Rental start
  - `endDate` (datetime, required): Rental end
  - `insuranceOptions` (array, optional): Selected insurance IDs
  - `additionalServices` (array, optional): Selected service IDs
  - `discountCode` (string, optional): Promotional code
  - `locationId` (guid, required): Pickup location for tax calculation
- Response: Complete pricing breakdown with all line items

**POST `/api/v1/pricing/calculate`**
- Purpose: Calculate total price with all options
- Authentication: Optional
- Request Body:
  - `vehicleId` (guid, required)
  - `startDate` (datetime, required)
  - `endDate` (datetime, required)
  - `options` (object, required): All selected options
- Response: Total price with breakdown

**GET `/api/v1/pricing/taxes`**
- Purpose: Get applicable tax rates for location
- Authentication: Optional
- Query Parameters:
  - `locationId` (guid, required): Location ID
  - `amount` (decimal, optional): Amount for tax calculation
- Response: Array of tax types with rates and amounts

**POST `/api/v1/pricing/lock`**
- Purpose: Lock current price for limited time
- Authentication: Required (JWT)
- Request Body:
  - `vehicleId` (guid, required)
  - `pricingBreakdown` (object, required): Current pricing
  - `lockDuration` (int, optional): Minutes to lock (default 15)
- Response: Price lock token and expiration

### Request Schemas

**PricingBreakdownRequest**:
```
{
  vehicleId: guid,
  startDate: datetime,
  endDate: datetime,
  insuranceOptions: [guid],
  additionalServices: [guid],
  discountCode: string,
  locationId: guid
}
```

### Response Schemas

**PricingBreakdownResponse**:
```
{
  baseRate: {
    amount: decimal,
    unit: "hour" | "day" | "week" | "month",
    quantity: int,
    subtotal: decimal
  },
  insurance: [
    {
      id: guid,
      name: string,
      amount: decimal
    }
  ],
  additionalServices: [
    {
      id: guid,
      name: string,
      amount: decimal,
      quantity: int
    }
  ],
  taxes: [
    {
      type: string,
      rate: decimal,
      amount: decimal,
      jurisdiction: string
    }
  ],
  fees: [
    {
      type: string,
      amount: decimal,
      description: string
    }
  ],
  discounts: [
    {
      code: string,
      name: string,
      amount: decimal,
      type: "percentage" | "fixed"
    }
  ],
  subtotal: decimal,
  totalTaxes: decimal,
  totalFees: decimal,
  totalDiscounts: decimal,
  total: decimal,
  currency: string,
  standardPrice: decimal (for comparison),
  savings: decimal
}
```

### Business Logic

**Base Rate Calculation**:
- Determine rental duration in hours
- Select appropriate rate tier (hourly, daily, weekly, monthly)
- Calculate quantity of units (e.g., 5 days)
- Apply base rate × quantity
- Round to 2 decimal places

**Volume Discount Application**:
- 7-13 days: 10% discount
- 14-27 days: 15% discount
- 28+ days: 20% discount
- Apply to base rate only, not insurance or services

**Seasonal Pricing**:
- Load seasonal multipliers from configuration
- Apply multiplier to base rate
- Peak season (summer, holidays): 1.2-1.5x
- Off-peak season: 0.8-0.9x
- Standard season: 1.0x

**Tax Calculation**:
- Determine applicable taxes based on pickup location
- Calculate each tax on appropriate base (rental only, or rental + services)
- Apply tax rates to taxable amounts
- Sum all taxes for total tax amount

**Discount Processing**:
- Validate discount code
- Check eligibility (user, vehicle, dates)
- Calculate discount amount
- Apply discount to eligible items only
- Ensure discount doesn't exceed maximum allowed

**Price Lock**:
- Generate unique lock token
- Store pricing breakdown with token
- Set expiration (15-30 minutes)
- Validate lock token during checkout
- Honor locked price if still valid

### Authentication Requirements

- No authentication required for pricing display
- Authentication required for price lock
- Authentication required for discount code validation (user-specific codes)

## Database Specifications

### Schema Changes

**New Tables**:
- `PricingRules` - Configurable pricing rules
- `TaxRates` - Tax rates by jurisdiction
- `DiscountCodes` - Promotional discount codes
- `PriceLocks` - Temporary price locks

### Table Definitions

**PricingRules Table**:
```sql
CREATE TABLE PricingRules (
  PricingRuleId CHAR(36) PRIMARY KEY,
  VehicleId CHAR(36) NULL COMMENT 'NULL for global rules',
  SupplierId CHAR(36) NULL COMMENT 'NULL for platform rules',
  RuleType ENUM('base_rate', 'volume_discount', 'seasonal', 'early_bird', 'last_minute') NOT NULL,
  StartDate DATE NULL,
  EndDate DATE NULL,
  DayOfWeek VARCHAR(20) NULL COMMENT 'Comma-separated: Mon,Tue,Wed',
  MinDuration INT NULL COMMENT 'Minimum rental hours',
  MaxDuration INT NULL COMMENT 'Maximum rental hours',
  DiscountPercentage DECIMAL(5,2) NULL,
  PriceMultiplier DECIMAL(5,2) NULL,
  Priority INT NOT NULL DEFAULT 0 COMMENT 'Higher priority rules applied first',
  IsActive BOOLEAN DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  
  INDEX idx_vehicle_dates (VehicleId, StartDate, EndDate),
  INDEX idx_supplier_dates (SupplierId, StartDate, EndDate),
  INDEX idx_active_priority (IsActive, Priority DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**TaxRates Table**:
```sql
CREATE TABLE TaxRates (
  TaxRateId CHAR(36) PRIMARY KEY,
  LocationId CHAR(36) NOT NULL,
  TaxType VARCHAR(50) NOT NULL COMMENT 'VAT, Sales Tax, Tourism Tax, etc.',
  TaxRate DECIMAL(5,4) NOT NULL COMMENT 'e.g., 0.0825 for 8.25%',
  Jurisdiction VARCHAR(100) NOT NULL COMMENT 'State, Province, Country',
  AppliesTo ENUM('rental_only', 'rental_and_services', 'services_only') NOT NULL,
  EffectiveDate DATE NOT NULL,
  ExpirationDate DATE NULL,
  IsActive BOOLEAN DEFAULT TRUE,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (LocationId) REFERENCES Locations(LocationId) ON DELETE CASCADE,
  
  INDEX idx_location_active (LocationId, IsActive, EffectiveDate),
  INDEX idx_effective_dates (EffectiveDate, ExpirationDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**PriceLocks Table**:
```sql
CREATE TABLE PriceLocks (
  PriceLockId CHAR(36) PRIMARY KEY,
  UserId CHAR(36) NOT NULL,
  VehicleId CHAR(36) NOT NULL,
  PricingBreakdown JSON NOT NULL COMMENT 'Complete pricing details',
  LockedPrice DECIMAL(10,2) NOT NULL,
  Currency CHAR(3) NOT NULL,
  ExpiresAt DATETIME NOT NULL,
  UsedForBookingId CHAR(36) NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (UserId) REFERENCES Users(UserId) ON DELETE CASCADE,
  FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE,
  FOREIGN KEY (UsedForBookingId) REFERENCES Bookings(BookingId) ON DELETE SET NULL,
  
  INDEX idx_user_expires (UserId, ExpiresAt),
  INDEX idx_expires_at (ExpiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- `PricingRules.VehicleId` → `Vehicles.VehicleId` (Many-to-One)
- `PricingRules.SupplierId` → `Suppliers.SupplierId` (Many-to-One)
- `TaxRates.LocationId` → `Locations.LocationId` (Many-to-One)
- `PriceLocks.UserId` → `Users.UserId` (Many-to-One)
- `PriceLocks.VehicleId` → `Vehicles.VehicleId` (Many-to-One)
- `PriceLocks.UsedForBookingId` → `Bookings.BookingId` (Many-to-One)

### Indexes

- `idx_vehicle_dates` on `PricingRules(VehicleId, StartDate, EndDate)` - Vehicle-specific pricing
- `idx_active_priority` on `PricingRules(IsActive, Priority DESC)` - Rule application order
- `idx_location_active` on `TaxRates(LocationId, IsActive, EffectiveDate)` - Tax rate lookup
- `idx_expires_at` on `PriceLocks(ExpiresAt)` - Expired lock cleanup

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- PDF Generation: PuppeteerSharp or similar

## Implementation Notes

**Pricing Calculation Order**:
1. Calculate base rate (duration × rate)
2. Apply seasonal multipliers
3. Apply volume discounts
4. Add insurance costs
5. Add additional service costs
6. Calculate subtotal
7. Apply promotional discounts
8. Calculate taxes on taxable amounts
9. Add fees
10. Calculate final total

**Real-Time Updates**:
- Debounce price calculations (300ms delay)
- Use optimistic UI updates
- Show loading state during calculation
- Cache pricing rules for performance
- Invalidate cache on rule changes

**Price Lock Implementation**:
- Generate unique lock token
- Store complete pricing breakdown
- Set 15-30 minute expiration
- Validate lock during checkout
- Honor locked price if valid
- Expire locks automatically via background job

**Testing Requirements**:
- Test pricing calculation accuracy
- Test volume discount application
- Test seasonal pricing
- Test tax calculation for multiple jurisdictions
- Test discount code validation
- Test price lock functionality
- Test real-time price updates

## Related Features

- F-PB-009: Comprehensive Invoice Generation (Invoice display)
- F-PB-011: Dynamic Pricing Engine (Advanced pricing)
- F-BM-001: Multi-Step Checkout (Booking integration)

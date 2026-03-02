# Feature: Vehicle-Specific Pricing

## Overview

Individual vehicle rate management system enabling unique pricing for each vehicle based on category, features, age, condition, and market positioning. Supports price differentiation, revenue optimization, and flexible rate configuration with bulk update capabilities and rate templates for efficient pricing management.

## Sprint Category

sprint-mvp (MVP - Must have for first release)

## Feature ID

Pricing-Management-1.2

## User Stories

### As a supplier
I want to set different prices for each vehicle, so that I can charge premium rates for newer or better-equipped vehicles.

### As a fleet manager
I want to apply rate templates to new vehicles, so that I can quickly configure pricing without manual entry.

### As a revenue manager
I want to adjust rates based on vehicle performance, so that I can optimize revenue for each vehicle.

### As a platform administrator
I want to bulk update rates across vehicles, so that I can respond quickly to market changes.

## Frontend Specifications

### Pages

**Vehicle Pricing Page** (`/admin/vehicles/:id/pricing`)
- Configure rates for specific vehicle
- View rate history
- Apply rate template
- Preview rate calculations
- Compare with category averages

**Bulk Pricing Update Page** (`/admin/pricing/bulk-update`)
- Select multiple vehicles
- Choose update method (replace, multiply, add)
- Preview changes before applying
- Execute bulk update
- View update results

**Rate Templates Page** (`/admin/pricing/templates`)
- Create and manage rate templates
- Apply templates to vehicles
- Template usage analytics
- Template comparison

### UI Components

**VehiclePricingForm Component**
- Vehicle information display
- Rate input fields for all durations
- Category average comparison
- Age-based pricing suggestions
- Feature-based premium calculator
- Template selector
- Save and apply buttons
- Rate validation feedback

**RateTemplateSelector Component**
- Dropdown of available templates
- Template preview on hover
- Apply template button
- Create new template option
- Template details modal

**BulkUpdateWizard Component**
- Step 1: Vehicle selection (checkboxes, filters)
- Step 2: Update method selection (replace/multiply/add)
- Step 3: Rate adjustments input
- Step 4: Preview changes table
- Step 5: Confirmation and execution
- Progress indicator
- Results summary

**PriceComparisonChart Component**
- Bar chart comparing vehicle rates
- Category average line
- Competitor rates (if available)
- Historical rate trend
- Interactive tooltips

**FeaturePremiumCalculator Component**
- List of vehicle features
- Suggested premium per feature
- Total premium calculation
- Apply to base rate button
- Feature value justification

### User Flows

**Individual Vehicle Pricing Flow**:
1. Supplier navigates to vehicle pricing page
2. System displays current rates and vehicle details
3. System shows category average rates for comparison
4. Supplier sees vehicle has premium features (GPS, leather seats)
5. System suggests 15% premium over category average
6. Supplier adjusts daily rate from $80 to $92
7. Supplier adjusts weekly rate proportionally
8. System validates rates (weekly < 7×daily)
9. Supplier saves changes
10. System creates rate history entry
11. System invalidates pricing cache
12. System displays confirmation

**Rate Template Application Flow**:
1. Supplier adds new vehicle to fleet
2. Supplier navigates to vehicle pricing
3. Supplier clicks "Apply Template"
4. System displays available templates
5. Supplier selects "Luxury SUV Template"
6. System previews template rates
7. Supplier confirms application
8. System applies template rates to vehicle
9. System allows manual adjustments
10. Supplier saves final rates

**Bulk Rate Update Flow**:
1. Fleet manager navigates to bulk update page
2. Manager filters vehicles by category "Economy"
3. Manager selects 20 economy vehicles
4. Manager chooses "Multiply" update method
5. Manager enters multiplier: 1.10 (10% increase)
6. System previews new rates for all vehicles
7. Manager reviews and confirms
8. System updates all rates in transaction
9. System logs all changes
10. System displays success summary

### Data Requirements

**From Backend APIs**:
- GET `/api/pricing/rates/:vehicleId` - Get vehicle rates
- POST `/api/pricing/rates` - Create/update rates
- GET `/api/pricing/templates` - Get rate templates
- POST `/api/pricing/templates/apply` - Apply template
- POST `/api/pricing/bulk-update` - Bulk rate update
- GET `/api/pricing/category-averages` - Category pricing benchmarks

**Vehicle Data**:
- Vehicle ID, name, category
- Vehicle features and equipment
- Vehicle age and condition
- Current rates
- Rate history

**Template Data**:
- Template ID, name, description
- Template rates for all durations
- Category association
- Usage count

## Backend Specifications

### API Endpoints

**GET `/api/v1/pricing/vehicles/:vehicleId/rates`**
- Purpose: Get current and historical rates for vehicle
- Authentication: Optional (current rates), Required (history)
- Path Parameters:
  - `vehicleId` (guid, required): Vehicle ID
- Query Parameters:
  - `includeHistory` (boolean, optional): Include rate history
- Response: Vehicle rates with optional history

**POST `/api/v1/pricing/vehicles/:vehicleId/rates`**
- Purpose: Set rates for specific vehicle
- Authentication: Required (JWT)
- Authorization: Supplier (own vehicles) or Admin
- Path Parameters:
  - `vehicleId` (guid, required): Vehicle ID
- Request Body: VehicleRateConfiguration
- Response: Created/updated rates

**GET `/api/v1/pricing/templates`**
- Purpose: Get available rate templates
- Authentication: Required (JWT)
- Query Parameters:
  - `supplierId` (guid, optional): Filter by supplier
  - `category` (string, optional): Filter by vehicle category
- Response: Array of rate templates

**POST `/api/v1/pricing/templates`**
- Purpose: Create new rate template
- Authentication: Required (JWT)
- Authorization: Supplier or Admin
- Request Body: RateTemplate
- Response: Created template

**POST `/api/v1/pricing/templates/:templateId/apply`**
- Purpose: Apply template to vehicle(s)
- Authentication: Required (JWT)
- Authorization: Supplier (own vehicles) or Admin
- Path Parameters:
  - `templateId` (guid, required): Template ID
- Request Body:
  - `vehicleIds` (array<guid>, required): Vehicles to apply to
  - `effectiveDate` (date, optional): When rates become active
- Response: Application results

**POST `/api/v1/pricing/bulk-update`**
- Purpose: Update rates for multiple vehicles
- Authentication: Required (JWT)
- Authorization: Supplier or Admin
- Request Body: BulkUpdateRequest
- Response: Update results with success/failure details

**GET `/api/v1/pricing/category-averages`**
- Purpose: Get average rates by vehicle category
- Authentication: Required (JWT)
- Query Parameters:
  - `supplierId` (guid, optional): Filter by supplier
  - `locationId` (guid, optional): Filter by location
- Response: Average rates per category

### Request Schemas

**VehicleRateConfiguration**:
```
{
  vehicleId: guid,
  rates: {
    hourly: decimal (optional),
    daily: decimal (required),
    weekly: decimal (optional),
    biWeekly: decimal (optional),
    monthly: decimal (optional)
  },
  minimumDuration: int (hours),
  maximumDuration: int (days),
  effectiveDate: date,
  expirationDate: date (optional),
  reason: string (optional)
}
```

**RateTemplate**:
```
{
  templateName: string,
  description: string,
  vehicleCategory: string,
  rates: {
    hourly: decimal (optional),
    daily: decimal (required),
    weekly: decimal (optional),
    biWeekly: decimal (optional),
    monthly: decimal (optional)
  },
  minimumDuration: int,
  maximumDuration: int
}
```

**BulkUpdateRequest**:
```
{
  vehicleIds: [guid],
  updateType: "replace" | "multiply" | "add",
  rateAdjustments: {
    hourly: decimal (optional),
    daily: decimal (optional),
    weekly: decimal (optional),
    biWeekly: decimal (optional),
    monthly: decimal (optional)
  },
  effectiveDate: date,
  reason: string (optional)
}
```

### Response Schemas

**VehicleRatesResponse**:
```
{
  vehicleId: guid,
  vehicleName: string,
  category: string,
  currentRates: {
    hourly: decimal,
    daily: decimal,
    weekly: decimal,
    biWeekly: decimal,
    monthly: decimal,
    currency: string,
    effectiveDate: date
  },
  categoryAverages: {
    daily: decimal,
    weekly: decimal,
    monthly: decimal
  },
  pricePosition: "below_average" | "average" | "above_average" | "premium",
  history: [
    {
      changedAt: datetime,
      changedBy: string,
      previousDaily: decimal,
      newDaily: decimal,
      reason: string
    }
  ]
}
```

**BulkUpdateResponse**:
```
{
  totalVehicles: int,
  successCount: int,
  failureCount: int,
  results: [
    {
      vehicleId: guid,
      vehicleName: string,
      success: boolean,
      previousDaily: decimal,
      newDaily: decimal,
      error: string (if failed)
    }
  ],
  executedAt: datetime,
  executedBy: string
}
```

### Business Logic

**Feature-Based Premium Calculation**:
```csharp
public decimal CalculateFeaturePremium(Vehicle vehicle, decimal baseRate)
{
    decimal premium = 0m;
    
    // GPS: +$5/day
    if (vehicle.HasGPS) premium += 5m;
    
    // Premium audio: +$3/day
    if (vehicle.HasPremiumAudio) premium += 3m;
    
    // Leather seats: +$8/day
    if (vehicle.HasLeatherSeats) premium += 8m;
    
    // Sunroof: +$5/day
    if (vehicle.HasSunroof) premium += 5m;
    
    // Advanced safety features: +$7/day
    if (vehicle.HasAdvancedSafety) premium += 7m;
    
    return baseRate + premium;
}
```

**Age-Based Pricing Adjustment**:
```csharp
public decimal ApplyAgeAdjustment(decimal baseRate, int vehicleAge)
{
    // New vehicles (0-1 years): +20% premium
    if (vehicleAge <= 1) return baseRate * 1.20m;
    
    // Recent vehicles (2-3 years): +10% premium
    if (vehicleAge <= 3) return baseRate * 1.10m;
    
    // Standard vehicles (4-5 years): No adjustment
    if (vehicleAge <= 5) return baseRate;
    
    // Older vehicles (6-7 years): -10% discount
    if (vehicleAge <= 7) return baseRate * 0.90m;
    
    // Very old vehicles (8+ years): -20% discount
    return baseRate * 0.80m;
}
```

**Template Application**:
```csharp
public async Task<VehicleRates> ApplyTemplate(Guid vehicleId, Guid templateId, Guid userId)
{
    var template = await _dbContext.RateTemplates.FindAsync(templateId);
    var vehicle = await _dbContext.Vehicles.FindAsync(vehicleId);
    
    // Create new rate record from template
    var rates = new VehicleRates
    {
        VehicleId = vehicleId,
        SupplierId = vehicle.SupplierId,
        HourlyRate = template.HourlyRate,
        DailyRate = template.DailyRate,
        WeeklyRate = template.WeeklyRate,
        BiWeeklyRate = template.BiWeeklyRate,
        MonthlyRate = template.MonthlyRate,
        MinimumDuration = template.MinimumDuration,
        MaximumDuration = template.MaximumDuration,
        Currency = template.Currency,
        EffectiveDate = DateTime.UtcNow.Date,
        CreatedBy = userId
    };
    
    // Apply vehicle-specific adjustments
    rates = ApplyVehicleAdjustments(rates, vehicle);
    
    // Validate and save
    ValidateRates(rates);
    await _dbContext.VehicleRates.AddAsync(rates);
    await LogRateChange(rates, "template_applied", userId);
    await _dbContext.SaveChangesAsync();
    
    return rates;
}
```

**Bulk Update Processing**:
- Validate all vehicles belong to supplier (if not admin)
- Load current rates for all vehicles
- Apply update method to each vehicle
- Validate all new rates
- Execute updates in transaction
- Log all changes
- Return detailed results

### Authentication Requirements

- Public access for viewing vehicle rates
- Supplier role required to update own vehicle rates
- Admin role required to update any vehicle rates
- Admin role required for bulk updates across suppliers
- Audit logging for all rate changes

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript

## Implementation Notes

**Rate Inheritance**:
- Vehicle-specific rates override category defaults
- If no vehicle rate exists, use category rate
- If no category rate exists, use supplier default
- Always have fallback pricing

**Price Positioning**:
- Calculate category averages for comparison
- Show vehicle position relative to category
- Suggest optimal pricing based on features
- Alert if significantly over/under market

**Performance**:
- Cache vehicle rates (15-minute TTL)
- Batch load rates for search results
- Use indexes for fast lookups
- Optimize bulk update queries

**Testing Requirements**:
- Test individual vehicle rate CRUD
- Test template application
- Test bulk updates with various methods
- Test rate validation
- Test feature premium calculation
- Test age-based adjustments
- Verify audit trail accuracy

## Related Features

- Multi-Duration Rate Structures: Base rate configuration
- Location-Based Pricing: Geographic price differentiation
- Dynamic Pricing Engine: Advanced pricing optimization
- Rate Templates: Reusable pricing configurations


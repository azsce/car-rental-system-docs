# Feature: Vehicle-Specific Pricing

## Overview

Backend service for managing individual vehicle pricing with support for feature-based premiums, age-based adjustments, rate templates, and bulk updates. Provides APIs for rate configuration, validation, and retrieval with comprehensive audit trail and performance optimization.

## Sprint Category

sprint-mvp (MVP - Must have for first release)

## Feature ID

Pricing-Management-1.2

## User Stories

### As a pricing service
I want to retrieve the correct rate for any vehicle, so that bookings are priced accurately.

### As a rate management API
I want to support flexible rate configuration, so that suppliers can optimize pricing for each vehicle.

### As an audit system
I want to track all rate changes, so that pricing decisions are transparent and traceable.

## Backend Specifications

### API Endpoints

**GET `/api/v1/pricing/vehicles/:vehicleId/rates/current`**
- Purpose: Get current active rates for vehicle
- Authentication: Optional (public pricing)
- Path Parameters:
  - `vehicleId` (guid, required): Vehicle ID
- Response: Current rate structure

**POST `/api/v1/pricing/vehicles/:vehicleId/rates`**
- Purpose: Create or update vehicle rates
- Authentication: Required (JWT)
- Authorization: Supplier (own vehicles) or Admin
- Path Parameters:
  - `vehicleId` (guid, required): Vehicle ID
- Request Body: VehicleRateConfiguration
- Response: Created/updated rates with validation results

**GET `/api/v1/pricing/vehicles/:vehicleId/rates/history`**
- Purpose: Get rate change history
- Authentication: Required (JWT)
- Authorization: Supplier (own vehicles) or Admin
- Path Parameters:
  - `vehicleId` (guid, required): Vehicle ID
- Query Parameters:
  - `startDate` (date, optional): History start
  - `endDate` (date, optional): History end
  - `limit` (int, optional): Max records (default: 50)
- Response: Array of rate changes

**POST `/api/v1/pricing/templates/:templateId/apply`**
- Purpose: Apply rate template to vehicle(s)
- Authentication: Required (JWT)
- Authorization: Supplier or Admin
- Path Parameters:
  - `templateId` (guid, required): Template ID
- Request Body:
  - `vehicleIds` (array<guid>, required)
  - `applyAdjustments` (boolean, optional): Apply vehicle-specific adjustments
  - `effectiveDate` (date, optional)
- Response: Application results

**POST `/api/v1/pricing/bulk-update`**
- Purpose: Update rates for multiple vehicles
- Authentication: Required (JWT)
- Authorization: Supplier or Admin
- Request Body: BulkUpdateRequest
- Response: Detailed update results

**GET `/api/v1/pricing/category-averages`**
- Purpose: Get average rates by category
- Authentication: Required (JWT)
- Query Parameters:
  - `supplierId` (guid, optional): Filter by supplier
  - `locationId` (guid, optional): Filter by location
  - `category` (string, optional): Specific category
- Response: Average rates per category

**POST `/api/v1/pricing/calculate-premium`**
- Purpose: Calculate suggested premium based on vehicle features
- Authentication: Required (JWT)
- Request Body:
  - `vehicleId` (guid, required)
  - `baseRate` (decimal, required)
- Response: Suggested premium with breakdown

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
  minimumDuration: int (hours, default: 1),
  maximumDuration: int (days, default: 90),
  effectiveDate: date (default: today),
  expirationDate: date (optional),
  reason: string (optional)
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
  features: [string],
  age: int (years),
  currentRates: {
    rateId: guid,
    hourly: decimal,
    daily: decimal,
    weekly: decimal,
    biWeekly: decimal,
    monthly: decimal,
    currency: string,
    effectiveDate: date,
    expirationDate: date
  },
  categoryAverages: {
    daily: decimal,
    weekly: decimal,
    monthly: decimal
  },
  pricePosition: {
    vsCategory: decimal (percentage),
    classification: "budget" | "competitive" | "premium" | "luxury"
  },
  suggestedPremium: {
    amount: decimal,
    reasons: [string]
  }
}
```

**BulkUpdateResponse**:
```
{
  requestId: guid,
  totalVehicles: int,
  successCount: int,
  failureCount: int,
  results: [
    {
      vehicleId: guid,
      vehicleName: string,
      success: boolean,
      previousRates: {
        daily: decimal,
        weekly: decimal
      },
      newRates: {
        daily: decimal,
        weekly: decimal
      },
      error: string (if failed),
      validationErrors: [string] (if failed)
    }
  ],
  executedAt: datetime,
  executedBy: {
    userId: guid,
    userName: string
  }
}
```

### Business Logic

**Feature Premium Calculation**:
```csharp
public class FeaturePremiumCalculator
{
    private readonly Dictionary<string, decimal> _featurePremiums = new()
    {
        { "GPS", 5.00m },
        { "PremiumAudio", 3.00m },
        { "LeatherSeats", 8.00m },
        { "Sunroof", 5.00m },
        { "AdvancedSafety", 7.00m },
        { "AllWheelDrive", 10.00m },
        { "PremiumWheels", 4.00m },
        { "HeatedSeats", 3.00m },
        { "BackupCamera", 2.00m },
        { "BlindSpotMonitoring", 3.00m }
    };
    
    public PremiumCalculation CalculatePremium(Vehicle vehicle, decimal baseRate)
    {
        var premiums = new List<FeaturePremium>();
        decimal totalPremium = 0m;
        
        foreach (var feature in vehicle.Features)
        {
            if (_featurePremiums.TryGetValue(feature, out var premium))
            {
                premiums.Add(new FeaturePremium(feature, premium));
                totalPremium += premium;
            }
        }
        
        return new PremiumCalculation
        {
            BaseRate = baseRate,
            FeaturePremiums = premiums,
            TotalPremium = totalPremium,
            SuggestedRate = baseRate + totalPremium,
            PremiumPercentage = (totalPremium / baseRate) * 100
        };
    }
}
```

**Age-Based Adjustment**:
```csharp
public decimal ApplyAgeAdjustment(decimal baseRate, int vehicleAge)
{
    var multiplier = vehicleAge switch
    {
        <= 1 => 1.20m,  // New: +20%
        <= 3 => 1.10m,  // Recent: +10%
        <= 5 => 1.00m,  // Standard: No change
        <= 7 => 0.90m,  // Older: -10%
        _ => 0.80m      // Very old: -20%
    };
    
    return Math.Round(baseRate * multiplier, 2);
}
```

**Bulk Update Processing**:
```csharp
public async Task<BulkUpdateResponse> ProcessBulkUpdate(
    BulkUpdateRequest request,
    Guid userId)
{
    var response = new BulkUpdateResponse
    {
        RequestId = Guid.NewGuid(),
        TotalVehicles = request.VehicleIds.Count,
        ExecutedAt = DateTime.UtcNow,
        ExecutedBy = await GetUserInfo(userId)
    };
    
    using var transaction = await _dbContext.Database.BeginTransactionAsync();
    
    try
    {
        foreach (var vehicleId in request.VehicleIds)
        {
            var result = await UpdateVehicleRate(
                vehicleId,
                request.UpdateType,
                request.RateAdjustments,
                request.EffectiveDate,
                userId,
                request.Reason
            );
            
            response.Results.Add(result);
            
            if (result.Success)
                response.SuccessCount++;
            else
                response.FailureCount++;
        }
        
        await transaction.CommitAsync();
        
        // Invalidate cache for all updated vehicles
        await InvalidateRateCache(request.VehicleIds);
        
        return response;
    }
    catch (Exception ex)
    {
        await transaction.RollbackAsync();
        throw new BulkUpdateException("Bulk update failed", ex);
    }
}

private async Task<VehicleUpdateResult> UpdateVehicleRate(
    Guid vehicleId,
    UpdateType updateType,
    RateAdjustments adjustments,
    DateTime effectiveDate,
    Guid userId,
    string reason)
{
    try
    {
        var currentRates = await GetActiveRates(vehicleId);
        var newRates = ApplyAdjustments(currentRates, adjustments, updateType);
        
        var validation = ValidateRates(newRates);
        if (!validation.IsValid)
        {
            return new VehicleUpdateResult
            {
                VehicleId = vehicleId,
                Success = false,
                ValidationErrors = validation.Errors
            };
        }
        
        // Expire current rates
        currentRates.ExpirationDate = effectiveDate.AddDays(-1);
        currentRates.IsActive = false;
        
        // Create new rates
        newRates.EffectiveDate = effectiveDate;
        await _dbContext.VehicleRates.AddAsync(newRates);
        
        // Log change
        await LogRateChange(vehicleId, currentRates, newRates, userId, reason);
        
        return new VehicleUpdateResult
        {
            VehicleId = vehicleId,
            Success = true,
            PreviousRates = MapToDto(currentRates),
            NewRates = MapToDto(newRates)
        };
    }
    catch (Exception ex)
    {
        return new VehicleUpdateResult
        {
            VehicleId = vehicleId,
            Success = false,
            Error = ex.Message
        };
    }
}
```

**Rate Comparison**:
```csharp
public async Task<PricePosition> GetPricePosition(Guid vehicleId)
{
    var vehicle = await _dbContext.Vehicles
        .Include(v => v.Rates)
        .FirstAsync(v => v.VehicleId == vehicleId);
    
    var categoryAverage = await _dbContext.VehicleRates
        .Where(r => r.Vehicle.Category == vehicle.Category && r.IsActive)
        .AverageAsync(r => r.DailyRate);
    
    var difference = ((vehicle.Rates.DailyRate - categoryAverage) / categoryAverage) * 100;
    
    var classification = difference switch
    {
        < -20 => "budget",
        < 0 => "competitive",
        < 20 => "premium",
        _ => "luxury"
    };
    
    return new PricePosition
    {
        VehicleRate = vehicle.Rates.DailyRate,
        CategoryAverage = categoryAverage,
        DifferencePercentage = difference,
        Classification = classification
    };
}
```

### Authentication Requirements

- Public access for rate retrieval
- Supplier role for own vehicle rate management
- Admin role for any vehicle rate management
- Admin role for cross-supplier bulk updates
- All changes logged with user attribution

### Error Handling

**Validation Errors**:
- Return 400 Bad Request with detailed validation messages
- Include field-specific errors
- Suggest corrective actions

**Authorization Errors**:
- Return 403 Forbidden if supplier tries to update other supplier's vehicles
- Log unauthorized access attempts
- Include clear error message

**Concurrent Update Conflicts**:
- Use optimistic concurrency control
- Return 409 Conflict if rate was modified
- Include current rate version in response
- Allow retry with latest version

**Bulk Update Partial Failures**:
- Continue processing remaining vehicles
- Return detailed results for each vehicle
- Commit successful updates
- Report failures with reasons

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+ with Entity Framework Core
- Caching: Redis for rate caching
- Background Jobs: Hangfire for rate expiration

## Implementation Notes

**Service Architecture**:
- `PricingService`: Core pricing logic
- `RateRepository`: Data access layer
- `RateValidator`: Validation logic
- `RateCalculator`: Price calculation
- `FeaturePremiumCalculator`: Feature-based pricing
- `BulkUpdateProcessor`: Bulk operation handling

**Caching Strategy**:
- Cache active rates per vehicle
- 15-minute TTL
- Invalidate on updates
- Use Redis for distributed caching
- Cache key: `rates:vehicle:{vehicleId}`

**Performance Optimization**:
- Use compiled queries for frequent operations
- Batch load rates for search results
- Use read replicas for rate queries
- Optimize indexes for common queries
- Implement query result caching

**Testing Requirements**:
- Unit tests for rate calculation logic
- Unit tests for feature premium calculation
- Unit tests for age-based adjustments
- Integration tests for all API endpoints
- Property-based tests for rate validation
- Load tests for bulk updates
- Cache invalidation tests


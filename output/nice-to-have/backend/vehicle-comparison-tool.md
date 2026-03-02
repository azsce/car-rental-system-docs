# Feature: Vehicle Comparison Tool - Backend

## Overview

The backend implementation for the Vehicle Comparison Tool provides API endpoints to create and retrieve vehicle comparisons, aggregate vehicle data for side-by-side display, and optionally persist comparison sessions for sharing. The backend handles data retrieval for multiple vehicles, pricing calculations, feature matrix generation, and comparison session management.

## Sprint Category

nice-to-have

## Feature ID

F-WF-SRCH-004

## Backend Architecture

### API Endpoints

**POST /api/compare**
- Create new comparison session with specified vehicles
- Calculate pricing for rental period
- Check availability for all vehicles
- Generate unique comparison ID
- Optionally persist comparison for sharing
- Return complete comparison object

**GET /api/compare/{comparisonId}**
- Retrieve saved comparison by ID
- Load vehicle details for all vehicles in comparison
- Recalculate pricing if dates have changed
- Return comparison object with current data

**GET /api/vehicles/compare**
- Retrieve comparison data for multiple vehicles without creating session
- Supports ad-hoc comparisons without persistence
- Calculate pricing for specified rental period
- Return array of vehicle comparison objects

**DELETE /api/compare/{comparisonId}**
- Delete saved comparison session
- Remove comparison and associated vehicle records
- Return success confirmation

### Service Layer Components

**ComparisonService**
- CreateComparisonAsync(vehicleIds, pickupDate, returnDate, userId)
- GetComparisonAsync(comparisonId)
- DeleteComparisonAsync(comparisonId)
- CleanupExpiredComparisonsAsync()

**VehicleComparisonService**
- GetVehiclesForComparisonAsync(vehicleIds, pickupDate, returnDate)
- GenerateFeatureMatrixAsync(vehicles)
- CalculatePricingComparisonAsync(vehicles, pickupDate, returnDate)
- IdentifyLowestPriceAsync(vehicles)

**ComparisonDataAggregator**
- AggregateVehicleDataAsync(vehicleIds)
- BuildComparisonObjectAsync(vehicles, pickupDate, returnDate)
- FormatComparisonResponseAsync(comparison)

### Business Logic

**Comparison Creation Logic**
1. Validate vehicle IDs (all must exist and be active)
2. Validate date range (pickup before return, not in past)
3. Limit to maximum 4 vehicles
4. Retrieve vehicle details for all vehicles
5. Calculate pricing for specified rental period
6. Check availability for all vehicles
7. Generate unique comparison ID (CMP-{timestamp}-{random})
8. Set expiration date (7 days from creation)
9. Optionally persist comparison to database
10. Return comparison object with all data

**Feature Matrix Generation Logic**
1. Collect all unique features across all vehicles
2. Create matrix showing feature presence/absence per vehicle
3. Categorize features (Safety, Comfort, Technology, Accessibility)
4. Identify unique features per vehicle (features only one vehicle has)
5. Sort features by category and name
6. Return structured feature matrix

**Pricing Comparison Logic**
1. Calculate total cost for each vehicle (base rate + insurance + services)
2. Identify vehicle with lowest total cost
3. Calculate price difference from lowest for each vehicle
4. Calculate percentage difference from lowest
5. Format pricing data for display
6. Return pricing comparison object

**Availability Checking Logic**
1. Query bookings for each vehicle and date range
2. Query maintenance schedules for blocked dates
3. Determine availability status (available, booked, limited)
4. Return availability status per vehicle

**Comparison Expiration Logic**
1. Set expiration date 7 days from creation
2. Run scheduled job to cleanup expired comparisons
3. Delete comparisons where expiresAt < current date
4. Log cleanup statistics

### Data Aggregation

**Vehicle Comparison Data Aggregation**
- Retrieve vehicle details from Vehicles table
- Join with VehicleFeatures for features list
- Join with VehiclePricing for pricing data
- Join with Suppliers for supplier information
- Join with VehicleEnvironmental for environmental data
- Calculate aggregate rating from Reviews
- Check availability from Bookings and MaintenanceSchedule
- Combine all data into comparison vehicle object

**Performance Optimization**
- Use parallel queries for multiple vehicles
- Implement caching for vehicle details (TTL: 1 hour)
- Use database indexes for fast joins
- Batch vehicle data retrieval
- Cache comparison results (TTL: 15 minutes)

### Authentication & Authorization

**Public Endpoints** (No authentication required)
- POST /api/compare
- GET /api/compare/{comparisonId}
- GET /api/vehicles/compare

**Authenticated Endpoints** (Optional)
- DELETE /api/compare/{comparisonId} (only creator can delete)

**Authorization Rules**
- All comparison viewing is public
- Comparison deletion requires authentication and ownership
- No role-based restrictions

### Error Handling

**400 Bad Request**
- Invalid vehicle IDs
- More than 4 vehicles specified
- Invalid date range
- Return: `{ "error": "Invalid request", "details": "..." }`

**404 Not Found**
- Comparison ID does not exist
- One or more vehicle IDs not found
- Return: `{ "error": "Not found", "resource": "..." }`

**410 Gone**
- Comparison has expired
- Return: `{ "error": "Comparison expired", "comparisonId": "..." }`

**500 Internal Server Error**
- Database connection failure
- External service failure
- Return: `{ "error": "Internal server error", "requestId": "..." }`

### Caching Strategy

**Comparison Cache**
- Key: `comparison:{comparisonId}`
- TTL: 15 minutes
- Invalidate on comparison update or deletion

**Vehicle Comparison Data Cache**
- Key: `vehicle:comparison:{vehicleId}:{pickupDate}:{returnDate}`
- TTL: 1 hour
- Invalidate on vehicle update or pricing change

### API Response Examples

**Create Comparison Response**
```json
{
  "comparisonId": "CMP-20260223-A1B2C3",
  "createdAt": "2026-02-23T10:00:00Z",
  "expiresAt": "2026-03-02T10:00:00Z",
  "pickupDate": "2026-03-01T10:00:00Z",
  "returnDate": "2026-03-05T10:00:00Z",
  "shareUrl": "https://example.com/compare/CMP-20260223-A1B2C3",
  "vehicles": [
    {
      "vehicleId": "VEH-001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "category": "Standard",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "seats": 5,
      "doors": 4,
      "luggageSpace": 15.1,
      "luggageUnit": "cubic feet",
      "features": [
        {
          "category": "Safety",
          "name": "Backup Camera",
          "available": true
        },
        {
          "category": "Technology",
          "name": "Apple CarPlay",
          "available": true
        }
      ],
      "pricing": {
        "daily": 65.00,
        "weekly": 390.00,
        "monthly": 1350.00,
        "totalCost": 260.00,
        "currency": "USD",
        "isLowest": true,
        "differenceFromLowest": 0.00
      },
      "insuranceOptions": [
        {
          "type": "Full Insurance",
          "cost": 25.00
        }
      ],
      "mileagePolicy": "Unlimited",
      "supplier": {
        "name": "Premium Rentals",
        "rating": 4.7
      },
      "environmental": {
        "co2Emissions": 95,
        "ecoFriendly": true
      },
      "availability": "available",
      "imageUrl": "https://cdn.example.com/vehicles/VEH-001/thumb.jpg",
      "overallRating": 4.6
    }
  ],
  "featureMatrix": {
    "Safety": [
      {
        "feature": "Backup Camera",
        "vehicles": {
          "VEH-001": true,
          "VEH-002": true,
          "VEH-003": false
        }
      }
    ],
    "Technology": [
      {
        "feature": "Apple CarPlay",
        "vehicles": {
          "VEH-001": true,
          "VEH-002": false,
          "VEH-003": true
        }
      }
    ]
  },
  "pricingComparison": {
    "lowestPrice": 260.00,
    "highestPrice": 320.00,
    "averagePrice": 285.00,
    "currency": "USD"
  }
}
```

**Get Vehicles for Comparison Response**
```json
{
  "vehicles": [
    {
      "vehicleId": "VEH-001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "pricing": {
        "daily": 65.00,
        "totalCost": 260.00
      },
      "availability": "available"
    },
    {
      "vehicleId": "VEH-002",
      "make": "Honda",
      "model": "Accord",
      "year": 2024,
      "pricing": {
        "daily": 70.00,
        "totalCost": 280.00
      },
      "availability": "available"
    }
  ]
}
```

## Technology Stack

- Backend Framework: .NET 8+ with C#
- Web API: ASP.NET Core Web API
- ORM: Entity Framework Core 8+
- Database: MySQL 8.0+ (optional, for persistence)
- Caching: Redis 7+
- Background Jobs: Hangfire for cleanup tasks
- API Documentation: Swagger/OpenAPI

## Implementation Notes

**Database Persistence (Optional)**
- Comparisons can be stored in database for sharing
- Set expiration date for automatic cleanup
- Use background job to delete expired comparisons
- Consider not persisting if storage is concern

**Stateless Alternative**
- Encode vehicle IDs and dates in URL
- No database persistence required
- Generate comparison data on-demand
- Simpler implementation, no cleanup needed

**Performance Optimization**
- Parallel vehicle data retrieval
- Batch database queries
- Cache comparison results
- Use compiled queries for repeated operations

**Scalability Considerations**
- Implement rate limiting per IP
- Limit comparison creation frequency
- Use CDN for vehicle images
- Implement horizontal scaling

**Monitoring and Logging**
- Log comparison creation and retrieval
- Monitor comparison cache hit rates
- Track comparison expiration cleanup
- Alert on high error rates

**Security Considerations**
- Validate all vehicle IDs
- Sanitize comparison IDs
- Implement rate limiting
- Protect against enumeration attacks
- Use HTTPS for all endpoints

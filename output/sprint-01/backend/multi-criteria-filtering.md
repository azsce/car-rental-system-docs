# Feature: Multi-Criteria Filtering (Backend)

## Overview

The backend implementation for Multi-Criteria Filtering provides robust API endpoints and business logic to support comprehensive vehicle search filtering. The system handles complex filter combinations using efficient database queries, implements intelligent filter logic (OR within categories, AND across categories), and provides real-time filter option counts to guide user selections.

The backend ensures high performance through optimized database indexing, query caching, and efficient filter aggregation, supporting sub-second response times even with complex filter combinations across large vehicle inventories.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-004: Granular Multi-Criteria Filtering
- F-WF-SRCH-003: Multi-Criteria Filtering Workflow

## User Stories

### Story 1: Efficient Filter Processing
As a backend system, I want to process complex filter combinations efficiently, so that users receive filtered results within 500ms regardless of filter complexity.

### Story 2: Dynamic Filter Options
As a backend system, I want to provide filter options with accurate result counts, so that users can see which filters will yield results before applying them.

### Story 3: Scalable Filter Queries
As a backend system, I want to handle filter queries that scale to thousands of vehicles, so that the system performs well as inventory grows.

## Backend Specifications

### API Endpoints

#### GET /api/v1/search/filter-options
**Purpose**: Retrieve available filter options with result counts for current search context

**Authentication**: Optional (enhanced for logged-in users)

**Query Parameters**:
- `location` (required, string): Location ID for search
- `pickupDate` (required, ISO 8601 datetime): Pickup date and time
- `returnDate` (required, ISO 8601 datetime): Return date and time
- `currentFilters` (optional, JSON string): Currently applied filters to calculate counts

**Request Example**:
```
GET /api/v1/search/filter-options?location=LAX-001&pickupDate=2026-03-15T10:00:00Z&returnDate=2026-03-20T10:00:00Z
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "fuelTypes": [
      { "id": "diesel", "name": "Diesel", "count": 45 },
      { "id": "gasoline", "name": "Gasoline", "count": 120 },
      { "id": "electric", "name": "Electric", "count": 12 },
      { "id": "hybrid", "name": "Hybrid", "count": 18 },
      { "id": "plugin-hybrid", "name": "Plug-in Hybrid", "count": 8 }
    ],
    "transmissions": [
      { "id": "manual", "name": "Manual", "count": 85 },
      { "id": "automatic", "name": "Automatic", "count": 118 }
    ],
    "categories": [
      { "id": "economy", "name": "Economy", "count": 45, "icon": "economy-icon.svg" },
      { "id": "standard", "name": "Standard", "count": 38, "icon": "standard-icon.svg" },
      { "id": "luxury", "name": "Luxury", "count": 15, "icon": "luxury-icon.svg" },
      { "id": "suv", "name": "SUV", "count": 32, "icon": "suv-icon.svg" },
      { "id": "electric", "name": "Electric", "count": 12, "icon": "electric-icon.svg" }
    ],
    "features": [
      { "id": "apple-carplay", "name": "Apple CarPlay", "count": 67, "group": "connectivity" },
      { "id": "android-auto", "name": "Android Auto", "count": 65, "group": "connectivity" },
      { "id": "backup-camera", "name": "Backup Camera", "count": 89, "group": "safety" },
      { "id": "heated-seats", "name": "Heated Seats", "count": 34, "group": "comfort" },
      { "id": "gps", "name": "GPS Navigation", "count": 78, "group": "comfort" },
      { "id": "bluetooth", "name": "Bluetooth", "count": 145, "group": "connectivity" },
      { "id": "pet-friendly", "name": "Pet-Friendly", "count": 23, "group": "special" }
    ],
    "suppliers": [
      { "id": "supplier-1", "name": "Premium Rentals", "rating": 4.8, "count": 45 },
      { "id": "supplier-2", "name": "Budget Cars", "rating": 4.2, "count": 67 },
      { "id": "supplier-3", "name": "Luxury Fleet", "rating": 4.9, "count": 18 }
    ],
    "priceRange": {
      "min": 25.00,
      "max": 350.00,
      "currency": "USD"
    },
    "capacities": {
      "seats": [2, 4, 5, 7, 9],
      "doors": [2, 4, 5]
    },
    "fuelPolicies": [
      { "id": "like-for-like", "name": "Like for Like", "description": "Return with same fuel level" },
      { "id": "full-to-full", "name": "Full to Full", "description": "Pick up full, return full" },
      { "id": "full-to-empty", "name": "Full to Empty", "description": "Pick up full, return empty" },
      { "id": "free-tank", "name": "Free Tank", "description": "First tank included" }
    ],
    "accessibilityFeatures": [
      { "id": "hand-controls", "name": "Hand Controls", "count": 8 },
      { "id": "wheelchair-ramp", "name": "Wheelchair Ramp", "count": 5 },
      { "id": "accessible-mods", "name": "Accessible Modifications", "count": 12 }
    ]
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

**Status Codes**:
- 200 OK: Success
- 400 Bad Request: Invalid parameters
- 500 Internal Server Error: Server error

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid date format for pickupDate",
    "details": {
      "field": "pickupDate",
      "value": "invalid-date"
    }
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

#### GET /api/v1/vehicles/search
**Purpose**: Search vehicles with applied filters

**Authentication**: Optional (enhanced for logged-in users)

**Query Parameters**:
- `location` (required, string): Location ID
- `pickupDate` (required, ISO 8601 datetime): Pickup date and time
- `returnDate` (required, ISO 8601 datetime): Return date and time
- `fuelTypes` (optional, comma-separated): Fuel type IDs (e.g., "diesel,gasoline")
- `transmission` (optional, comma-separated): Transmission types (e.g., "manual,automatic")
- `categories` (optional, comma-separated): Category IDs (e.g., "suv,luxury")
- `minSeats` (optional, integer): Minimum number of seats
- `doors` (optional, comma-separated integers): Number of doors (e.g., "2,4")
- `features` (optional, comma-separated): Feature IDs (e.g., "apple-carplay,gps")
- `fuelPolicy` (optional, string): Fuel policy ID
- `minPrice` (optional, decimal): Minimum daily rate
- `maxPrice` (optional, decimal): Maximum daily rate
- `mileage` (optional, string): "unlimited" or "limited"
- `suppliers` (optional, comma-separated): Supplier IDs
- `minRating` (optional, decimal): Minimum rating (0-5)
- `accessibility` (optional, comma-separated): Accessibility feature IDs
- `page` (optional, integer, default: 1): Page number
- `pageSize` (optional, integer, default: 20, max: 100): Results per page
- `sortBy` (optional, string, default: "price"): Sort field (price, rating, distance, popularity)
- `sortOrder` (optional, string, default: "asc"): Sort order (asc, desc)

**Request Example**:
```
GET /api/v1/vehicles/search?location=LAX-001&pickupDate=2026-03-15T10:00:00Z&returnDate=2026-03-20T10:00:00Z&categories=suv&transmission=automatic&minPrice=50&maxPrice=150&features=apple-carplay,backup-camera&page=1&pageSize=20&sortBy=price&sortOrder=asc
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "vehicleId": "VEH-12345",
        "make": "Toyota",
        "model": "RAV4",
        "year": 2024,
        "category": "suv",
        "categoryName": "SUV",
        "fuelType": "hybrid",
        "fuelTypeName": "Hybrid",
        "transmission": "automatic",
        "transmissionName": "Automatic",
        "seats": 5,
        "doors": 4,
        "features": [
          { "id": "apple-carplay", "name": "Apple CarPlay" },
          { "id": "backup-camera", "name": "Backup Camera" },
          { "id": "heated-seats", "name": "Heated Seats" }
        ],
        "pricing": {
          "dailyRate": 89.99,
          "totalCost": 449.95,
          "currency": "USD"
        },
        "supplier": {
          "id": "supplier-1",
          "name": "Premium Rentals",
          "rating": 4.8,
          "reviewCount": 1234
        },
        "rating": 4.7,
        "reviewCount": 89,
        "imageUrl": "https://cdn.example.com/vehicles/veh-12345-main.jpg",
        "thumbnailUrl": "https://cdn.example.com/vehicles/veh-12345-thumb.jpg",
        "available": true,
        "fuelPolicy": "full-to-full",
        "mileagePolicy": "unlimited"
      }
    ],
    "pagination": {
      "totalResults": 45,
      "page": 1,
      "pageSize": 20,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "appliedFilters": {
      "categories": ["suv"],
      "transmission": ["automatic"],
      "priceRange": { "min": 50, "max": 150 },
      "features": ["apple-carplay", "backup-camera"]
    }
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

**Status Codes**:
- 200 OK: Success (even if no results)
- 400 Bad Request: Invalid filter parameters
- 500 Internal Server Error: Server error

**Empty Results Response**:
```json
{
  "success": true,
  "data": {
    "results": [],
    "pagination": {
      "totalResults": 0,
      "page": 1,
      "pageSize": 20,
      "totalPages": 0,
      "hasNextPage": false,
      "hasPreviousPage": false
    },
    "appliedFilters": { ... },
    "suggestions": {
      "message": "No vehicles found matching your criteria",
      "actions": [
        "Try removing some filters",
        "Adjust your price range",
        "Try different dates"
      ]
    }
  },
  "timestamp": "2026-02-23T10:30:00Z"
}
```

### Request Schemas

#### FilterOptionsRequest (C# Model)
```csharp
public class FilterOptionsRequest
{
    [Required]
    [StringLength(50)]
    public string Location { get; set; }
    
    [Required]
    public DateTime PickupDate { get; set; }
    
    [Required]
    public DateTime ReturnDate { get; set; }
    
    public Dictionary<string, object> CurrentFilters { get; set; }
    
    // Validation
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (PickupDate < DateTime.UtcNow)
            yield return new ValidationResult("Pickup date cannot be in the past");
            
        if (ReturnDate <= PickupDate)
            yield return new ValidationResult("Return date must be after pickup date");
    }
}
```

#### VehicleSearchRequest (C# Model)
```csharp
public class VehicleSearchRequest
{
    [Required]
    [StringLength(50)]
    public string Location { get; set; }
    
    [Required]
    public DateTime PickupDate { get; set; }
    
    [Required]
    public DateTime ReturnDate { get; set; }
    
    public List<string> FuelTypes { get; set; }
    public List<string> Transmission { get; set; }
    public List<string> Categories { get; set; }
    
    [Range(1, 20)]
    public int? MinSeats { get; set; }
    
    public List<int> Doors { get; set; }
    public List<string> Features { get; set; }
    public string FuelPolicy { get; set; }
    
    [Range(0, 10000)]
    public decimal? MinPrice { get; set; }
    
    [Range(0, 10000)]
    public decimal? MaxPrice { get; set; }
    
    public string Mileage { get; set; } // "unlimited" or "limited"
    public List<string> Suppliers { get; set; }
    
    [Range(0, 5)]
    public decimal? MinRating { get; set; }
    
    public List<string> Accessibility { get; set; }
    
    [Range(1, 1000)]
    public int Page { get; set; } = 1;
    
    [Range(1, 100)]
    public int PageSize { get; set; } = 20;
    
    public string SortBy { get; set; } = "price";
    public string SortOrder { get; set; } = "asc";
    
    // Validation
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (PickupDate < DateTime.UtcNow)
            yield return new ValidationResult("Pickup date cannot be in the past");
            
        if (ReturnDate <= PickupDate)
            yield return new ValidationResult("Return date must be after pickup date");
            
        if (MinPrice.HasValue && MaxPrice.HasValue && MinPrice > MaxPrice)
            yield return new ValidationResult("Minimum price cannot exceed maximum price");
            
        if (!string.IsNullOrEmpty(Mileage) && Mileage != "unlimited" && Mileage != "limited")
            yield return new ValidationResult("Mileage must be 'unlimited' or 'limited'");
            
        var validSortFields = new[] { "price", "rating", "distance", "popularity" };
        if (!validSortFields.Contains(SortBy?.ToLower()))
            yield return new ValidationResult($"Invalid sortBy value. Must be one of: {string.Join(", ", validSortFields)}");
            
        var validSortOrders = new[] { "asc", "desc" };
        if (!validSortOrders.Contains(SortOrder?.ToLower()))
            yield return new ValidationResult("Invalid sortOrder value. Must be 'asc' or 'desc'");
    }
}
```

### Response Schemas

See API endpoint response schemas above.

### Business Logic

#### Filter Logic Service
```csharp
public class VehicleFilterService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<VehicleFilterService> _logger;
    
    public async Task<FilterOptionsResponse> GetFilterOptionsAsync(FilterOptionsRequest request)
    {
        // Check cache first
        var cacheKey = $"filter-options:{request.Location}:{request.PickupDate:yyyyMMdd}:{request.ReturnDate:yyyyMMdd}";
        var cached = await _cacheService.GetAsync<FilterOptionsResponse>(cacheKey);
        if (cached != null) return cached;
        
        // Get available vehicles for date range and location
        var availableVehicles = await _vehicleRepository.GetAvailableVehiclesAsync(
            request.Location, 
            request.PickupDate, 
            request.ReturnDate
        );
        
        // Calculate filter options with counts
        var filterOptions = new FilterOptionsResponse
        {
            FuelTypes = CalculateFuelTypeCounts(availableVehicles),
            Transmissions = CalculateTransmissionCounts(availableVehicles),
            Categories = CalculateCategoryCounts(availableVehicles),
            Features = CalculateFeatureCounts(availableVehicles),
            Suppliers = CalculateSupplierCounts(availableVehicles),
            PriceRange = CalculatePriceRange(availableVehicles),
            Capacities = CalculateCapacities(availableVehicles),
            FuelPolicies = GetFuelPolicies(),
            AccessibilityFeatures = CalculateAccessibilityCounts(availableVehicles)
        };
        
        // Cache for 15 minutes
        await _cacheService.SetAsync(cacheKey, filterOptions, TimeSpan.FromMinutes(15));
        
        return filterOptions;
    }
    
    public async Task<VehicleSearchResponse> SearchVehiclesAsync(VehicleSearchRequest request)
    {
        // Build query with filters
        var query = _vehicleRepository.GetAvailableVehiclesQuery(
            request.Location,
            request.PickupDate,
            request.ReturnDate
        );
        
        // Apply filters with OR logic within categories, AND across categories
        query = ApplyFilters(query, request);
        
        // Get total count before pagination
        var totalCount = await query.CountAsync();
        
        // Apply sorting
        query = ApplySorting(query, request.SortBy, request.SortOrder);
        
        // Apply pagination
        var skip = (request.Page - 1) * request.PageSize;
        var vehicles = await query
            .Skip(skip)
            .Take(request.PageSize)
            .ToListAsync();
        
        // Map to response DTOs
        var results = vehicles.Select(MapToVehicleDto).ToList();
        
        return new VehicleSearchResponse
        {
            Results = results,
            Pagination = new PaginationInfo
            {
                TotalResults = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize),
                HasNextPage = request.Page * request.PageSize < totalCount,
                HasPreviousPage = request.Page > 1
            },
            AppliedFilters = BuildAppliedFiltersObject(request)
        };
    }
    
    private IQueryable<Vehicle> ApplyFilters(IQueryable<Vehicle> query, VehicleSearchRequest request)
    {
        // Fuel Types (OR logic)
        if (request.FuelTypes?.Any() == true)
        {
            query = query.Where(v => request.FuelTypes.Contains(v.FuelType));
        }
        
        // Transmission (OR logic)
        if (request.Transmission?.Any() == true)
        {
            query = query.Where(v => request.Transmission.Contains(v.Transmission));
        }
        
        // Categories (OR logic)
        if (request.Categories?.Any() == true)
        {
            query = query.Where(v => request.Categories.Contains(v.Category));
        }
        
        // Minimum Seats (at least)
        if (request.MinSeats.HasValue)
        {
            query = query.Where(v => v.Seats >= request.MinSeats.Value);
        }
        
        // Doors (OR logic)
        if (request.Doors?.Any() == true)
        {
            query = query.Where(v => request.Doors.Contains(v.Doors));
        }
        
        // Features (AND logic - vehicle must have ALL selected features)
        if (request.Features?.Any() == true)
        {
            foreach (var feature in request.Features)
            {
                query = query.Where(v => v.VehicleFeatures.Any(vf => vf.FeatureId == feature));
            }
        }
        
        // Fuel Policy
        if (!string.IsNullOrEmpty(request.FuelPolicy))
        {
            query = query.Where(v => v.FuelPolicy == request.FuelPolicy);
        }
        
        // Price Range
        if (request.MinPrice.HasValue)
        {
            query = query.Where(v => v.DailyRate >= request.MinPrice.Value);
        }
        if (request.MaxPrice.HasValue)
        {
            query = query.Where(v => v.DailyRate <= request.MaxPrice.Value);
        }
        
        // Mileage
        if (!string.IsNullOrEmpty(request.Mileage))
        {
            query = query.Where(v => v.MileagePolicy == request.Mileage);
        }
        
        // Suppliers (OR logic)
        if (request.Suppliers?.Any() == true)
        {
            query = query.Where(v => request.Suppliers.Contains(v.SupplierId));
        }
        
        // Minimum Rating
        if (request.MinRating.HasValue)
        {
            query = query.Where(v => v.AverageRating >= request.MinRating.Value);
        }
        
        // Accessibility Features (OR logic)
        if (request.Accessibility?.Any() == true)
        {
            query = query.Where(v => v.AccessibilityFeatures.Any(af => request.Accessibility.Contains(af.FeatureId)));
        }
        
        return query;
    }
    
    private IQueryable<Vehicle> ApplySorting(IQueryable<Vehicle> query, string sortBy, string sortOrder)
    {
        var ascending = sortOrder?.ToLower() == "asc";
        
        return sortBy?.ToLower() switch
        {
            "price" => ascending ? query.OrderBy(v => v.DailyRate) : query.OrderByDescending(v => v.DailyRate),
            "rating" => ascending ? query.OrderBy(v => v.AverageRating) : query.OrderByDescending(v => v.AverageRating),
            "popularity" => ascending ? query.OrderBy(v => v.BookingCount) : query.OrderByDescending(v => v.BookingCount),
            "distance" => ascending ? query.OrderBy(v => v.DistanceFromLocation) : query.OrderByDescending(v => v.DistanceFromLocation),
            _ => query.OrderBy(v => v.DailyRate) // Default to price ascending
        };
    }
}
```

#### Performance Optimization
- Use database indexes on all filterable columns
- Implement query result caching with 15-minute TTL
- Use compiled queries for frequently executed filter combinations
- Implement database query optimization (EXPLAIN ANALYZE)
- Use pagination to limit result set size
- Lazy load related entities only when needed
- Consider read replicas for search queries

#### Validation Rules
- Validate all filter values against allowed options
- Ensure price range: minPrice <= maxPrice
- Validate date range: pickupDate < returnDate
- Sanitize all inputs to prevent SQL injection
- Return 400 Bad Request for invalid filter combinations
- Validate page and pageSize parameters
- Validate sortBy and sortOrder parameters

### Authentication Requirements

- **Public Access**: Basic search and filtering available without authentication
- **Authenticated Users**: Enhanced features including:
  - Saved filter preferences
  - Personalized default filters
  - Filter history tracking
- **Corporate Users**: Automatic application of corporate policy filters based on user role
- **Subscription Users**: Automatic filtering by subscription tier eligibility

### Authorization

- No special authorization required for basic filtering
- Corporate policy filters enforced based on user's corporate account settings
- Subscription tier filters enforced based on user's subscription level

## Technology Stack

- **Backend Framework**: .NET 8+ with C#
- **API**: ASP.NET Core Web API with RESTful endpoints
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Caching**: Redis for filter option caching
- **Logging**: Serilog for structured logging
- **Validation**: FluentValidation for request validation
- **API Documentation**: Swagger/OpenAPI

## Implementation Notes

### Query Optimization
- Use Entity Framework Core's compiled queries for frequently executed filter queries
- Implement database indexes on all filterable columns
- Use EXPLAIN ANALYZE to optimize complex queries
- Consider materialized views for filter option aggregations
- Implement query result caching with appropriate TTL

### Caching Strategy
- Cache filter options for 15 minutes per location/date combination
- Invalidate cache when vehicle inventory changes
- Use Redis for distributed caching across multiple API instances
- Implement cache warming for popular locations

### Error Handling
- Return consistent error response format
- Log all errors with correlation IDs for debugging
- Provide helpful error messages for validation failures
- Handle database timeouts gracefully
- Implement circuit breaker pattern for external dependencies

### Monitoring
- Track filter query performance metrics
- Monitor cache hit rates
- Log slow queries (>500ms) for optimization
- Track most commonly used filter combinations
- Monitor API endpoint response times

### Testing Considerations
- Unit test filter logic with various combinations
- Integration test API endpoints with real database
- Performance test with large vehicle inventories (10,000+ vehicles)
- Test edge cases (no results, all filters applied)
- Test pagination with various page sizes
- Verify filter count accuracy

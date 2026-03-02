# Feature: Granular Multi-Criteria Filtering (Backend)

## Overview

The backend implementation for Granular Multi-Criteria Filtering provides RESTful API endpoints and business logic to support comprehensive vehicle filtering across multiple dimensions. The system processes complex filter queries with AND/OR logic, maintains real-time availability checking, optimizes query performance through strategic indexing and caching, and returns filtered results with pagination and sorting capabilities. This backend service powers the frontend filtering interface and ensures sub-second response times even with complex multi-criteria queries across large vehicle inventories.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-004

## User Stories

### API Consumer Story
As a frontend application, I need RESTful endpoints that accept filter parameters and return matching vehicles efficiently, so that users receive instant feedback on their filter selections.

### Performance Story
As a system administrator, I need the filtering system to handle complex queries with sub-second response times, so that the user experience remains smooth even under high load.

### Data Integrity Story
As a backend developer, I need comprehensive validation of filter parameters, so that invalid or malicious inputs are rejected before reaching the database.

## Technical Architecture

### Service Layer Design

**FilterService**
- Orchestrates filter application logic
- Validates filter parameters
- Builds dynamic queries
- Applies business rules
- Handles caching strategy

**VehicleSearchService**
- Executes vehicle search queries
- Manages availability checking
- Handles pagination and sorting
- Coordinates with multiple data sources

**FilterAnalyticsService**
- Tracks filter usage patterns
- Provides insights for optimization
- Monitors query performance
- Generates filter recommendations

## API Endpoints

### GET /api/v1/vehicles/search

**Purpose**: Execute filtered vehicle search with comprehensive criteria

**Authentication**: Optional (Bearer token for authenticated features)

**Request Headers**:
```
Authorization: Bearer {jwt_token} (optional)
Content-Type: application/json
Accept: application/json
X-Request-ID: {uuid} (for tracing)
```

**Query Parameters**:

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| location | string (UUID) | Yes | Pickup location ID | `550e8400-e29b-41d4-a716-446655440000` |
| pickupDate | ISO 8601 | Yes | Pickup date and time | `2026-03-15T10:00:00Z` |
| returnDate | ISO 8601 | Yes | Return date and time | `2026-03-20T10:00:00Z` |
| fuelTypes | string[] | No | Fuel type filters | `electric,hybrid` |
| transmission | string | No | Transmission type | `automatic` |
| categories | string[] | No | Vehicle categories | `suv,luxury` |
| minSeats | integer | No | Minimum seats | `5` |
| maxSeats | integer | No | Maximum seats | `7` |
| doors | integer[] | No | Number of doors | `4,5` |
| features | string[] | No | Required feature codes | `apple-carplay,heated-seats` |
| fuelPolicy | string | No | Fuel policy | `full-to-full` |
| minPrice | decimal | No | Minimum daily rate | `50.00` |
| maxPrice | decimal | No | Maximum daily rate | `150.00` |
| mileage | string | No | Mileage preference | `unlimited` |
| suppliers | string[] | No | Supplier IDs | `uuid1,uuid2` |
| minRating | decimal | No | Minimum rating | `4.0` |
| accessibility | string[] | No | Accessibility features | `hand-controls` |
| page | integer | No | Page number (default: 1) | `1` |
| pageSize | integer | No | Results per page (default: 20, max: 100) | `20` |
| sortBy | string | No | Sort field | `price` |
| sortOrder | string | No | Sort direction | `asc` |

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2024,
        "category": "electric",
        "fuelType": "electric",
        "transmission": "automatic",
        "seats": 5,
        "doors": 4,
        "features": [
          {
            "code": "apple-carplay",
            "name": "Apple CarPlay"
          },
          {
            "code": "backup-camera",
            "name": "Backup Camera"
          }
        ],
        "dailyRate": 89.99,
        "fuelPolicy": "n/a",
        "mileage": "unlimited",
        "supplier": {
          "id": "uuid",
          "name": "Premium Rentals",
          "rating": 4.7
        },
        "rating": 4.8,
        "reviewCount": 342,
        "images": [
          {
            "url": "https://cdn.example.com/vehicles/tesla-model3-1.jpg",
            "type": "exterior"
          }
        ],
        "available": true,
        "accessibility": []
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalResults": 127,
      "totalPages": 7,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "appliedFilters": {
      "fuelTypes": ["electric", "hybrid"],
      "transmission": "automatic",
      "minPrice": 50.00,
      "maxPrice": 150.00
    },
    "filterCounts": {
      "totalAvailable": 127,
      "byCategory": {
        "electric": 85,
        "hybrid": 42
      }
    }
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-02-23T10:30:00Z",
    "executionTime": 245
  }
}
```

**Error Responses**:

400 Bad Request - Invalid Parameters:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid filter parameters provided",
    "details": [
      {
        "field": "minPrice",
        "message": "Minimum price cannot be greater than maximum price"
      },
      {
        "field": "pickupDate",
        "message": "Pickup date must be in the future"
      }
    ]
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-02-23T10:30:00Z"
  }
}
```

404 Not Found - Location Not Found:
```json
{
  "success": false,
  "error": {
    "code": "LOCATION_NOT_FOUND",
    "message": "The specified location does not exist"
  }
}
```

429 Too Many Requests:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred. Please try again later.",
    "supportReference": "ERR-20260223-103000-ABC123"
  }
}
```

### GET /api/v1/vehicles/filters/options

**Purpose**: Retrieve available filter options with result counts for dynamic UI

**Authentication**: Optional

**Query Parameters**:
- `location` (string, required): Location ID
- `pickupDate` (ISO 8601, required): Pickup date
- `returnDate` (ISO 8601, required): Return date
- `currentFilters` (JSON string, optional): Currently applied filters for dynamic counts

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "fuelTypes": [
      {
        "value": "electric",
        "label": "Electric",
        "count": 45,
        "available": true
      },
      {
        "value": "hybrid",
        "label": "Hybrid",
        "count": 32,
        "available": true
      },
      {
        "value": "gasoline",
        "label": "Gasoline",
        "count": 156,
        "available": true
      },
      {
        "value": "diesel",
        "label": "Diesel",
        "count": 89,
        "available": true
      }
    ],
    "transmissions": [
      {
        "value": "automatic",
        "label": "Automatic",
        "count": 245,
        "available": true
      },
      {
        "value": "manual",
        "label": "Manual",
        "count": 77,
        "available": true
      }
    ],
    "categories": [
      {
        "value": "economy",
        "label": "Economy",
        "count": 98,
        "available": true
      },
      {
        "value": "suv",
        "label": "SUV",
        "count": 67,
        "available": true
      }
    ],
    "features": [
      {
        "code": "apple-carplay",
        "name": "Apple CarPlay",
        "category": "connectivity",
        "count": 134,
        "available": true
      }
    ],
    "fuelPolicies": [
      {
        "value": "full-to-full",
        "label": "Full to Full",
        "description": "Return with same fuel level",
        "count": 256,
        "available": true
      }
    ],
    "priceRange": {
      "min": 25.00,
      "max": 350.00,
      "currency": "USD",
      "averagePrice": 87.50
    },
    "suppliers": [
      {
        "id": "uuid",
        "name": "Premium Rentals",
        "rating": 4.7,
        "vehicleCount": 45,
        "available": true
      }
    ],
    "ratingRange": {
      "min": 1.0,
      "max": 5.0,
      "distribution": {
        "5": 120,
        "4": 145,
        "3": 45,
        "2": 10,
        "1": 2
      }
    },
    "accessibilityFeatures": [
      {
        "code": "hand-controls",
        "name": "Hand Controls",
        "count": 12,
        "available": true
      }
    ]
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-02-23T10:30:00Z",
    "executionTime": 89
  }
}
```

### GET /api/v1/vehicles/search/count

**Purpose**: Get count of vehicles matching filters (lightweight endpoint for real-time updates)

**Authentication**: Optional

**Query Parameters**: Same as /api/v1/vehicles/search (except pagination and sorting)

**Success Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "count": 127,
    "appliedFilters": {
      "fuelTypes": ["electric", "hybrid"],
      "transmission": "automatic",
      "priceRange": {
        "min": 50.00,
        "max": 150.00
      }
    }
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-02-23T10:30:00Z",
    "executionTime": 45
  }
}
```

## Business Logic Implementation

### Filter Validation Service

**C# Implementation Pattern**:
```csharp
public class FilterValidationService
{
    public ValidationResult ValidateFilters(VehicleSearchFilters filters)
    {
        var errors = new List<ValidationError>();
        
        // Date validation
        if (filters.PickupDate < DateTime.UtcNow)
            errors.Add(new ValidationError("pickupDate", "Pickup date must be in the future"));
            
        if (filters.ReturnDate <= filters.PickupDate)
            errors.Add(new ValidationError("returnDate", "Return date must be after pickup date"));
        
        // Price range validation
        if (filters.MinPrice.HasValue && filters.MaxPrice.HasValue)
        {
            if (filters.MinPrice > filters.MaxPrice)
                errors.Add(new ValidationError("minPrice", "Minimum price cannot exceed maximum price"));
        }
        
        // Rating validation
        if (filters.MinRating.HasValue && (filters.MinRating < 1.0m || filters.MinRating > 5.0m))
            errors.Add(new ValidationError("minRating", "Rating must be between 1.0 and 5.0"));
        
        // Seat capacity validation
        if (filters.MinSeats.HasValue && filters.MinSeats < 2)
            errors.Add(new ValidationError("minSeats", "Minimum seats must be at least 2"));
            
        if (filters.MaxSeats.HasValue && filters.MaxSeats > 15)
            errors.Add(new ValidationError("maxSeats", "Maximum seats cannot exceed 15"));
        
        return new ValidationResult(errors);
    }
}
```

### Dynamic Query Builder

**Query Construction Logic**:
```csharp
public class VehicleFilterQueryBuilder
{
    public IQueryable<Vehicle> BuildFilteredQuery(
        IQueryable<Vehicle> baseQuery,
        VehicleSearchFilters filters)
    {
        var query = baseQuery;
        
        // Apply fuel type filter (OR logic within category)
        if (filters.FuelTypes?.Any() == true)
        {
            query = query.Where(v => filters.FuelTypes.Contains(v.FuelType));
        }
        
        // Apply transmission filter
        if (!string.IsNullOrEmpty(filters.Transmission))
        {
            query = query.Where(v => v.Transmission == filters.Transmission);
        }
        
        // Apply category filter (OR logic)
        if (filters.Categories?.Any() == true)
        {
            query = query.Where(v => filters.Categories.Contains(v.Category));
        }
        
        // Apply seat capacity filter
        if (filters.MinSeats.HasValue)
        {
            query = query.Where(v => v.Seats >= filters.MinSeats.Value);
        }
        
        if (filters.MaxSeats.HasValue)
        {
            query = query.Where(v => v.Seats <= filters.MaxSeats.Value);
        }
        
        // Apply doors filter (OR logic)
        if (filters.Doors?.Any() == true)
        {
            query = query.Where(v => filters.Doors.Contains(v.Doors));
        }
        
        // Apply feature filter (AND logic - vehicle must have ALL selected features)
        if (filters.Features?.Any() == true)
        {
            foreach (var feature in filters.Features)
            {
                query = query.Where(v => v.VehicleFeatures.Any(vf => vf.FeatureCode == feature));
            }
        }
        
        // Apply price range filter
        if (filters.MinPrice.HasValue)
        {
            query = query.Where(v => v.DailyRate >= filters.MinPrice.Value);
        }
        
        if (filters.MaxPrice.HasValue)
        {
            query = query.Where(v => v.DailyRate <= filters.MaxPrice.Value);
        }
        
        // Apply supplier filter (OR logic)
        if (filters.Suppliers?.Any() == true)
        {
            query = query.Where(v => filters.Suppliers.Contains(v.SupplierId));
        }
        
        // Apply rating filter
        if (filters.MinRating.HasValue)
        {
            query = query.Where(v => v.AverageRating >= filters.MinRating.Value);
        }
        
        // Apply accessibility filter (OR logic)
        if (filters.AccessibilityFeatures?.Any() == true)
        {
            query = query.Where(v => v.AccessibilityFeatures
                .Any(af => filters.AccessibilityFeatures.Contains(af.FeatureType)));
        }
        
        // Apply fuel policy filter
        if (!string.IsNullOrEmpty(filters.FuelPolicy))
        {
            query = query.Where(v => v.FuelPolicy == filters.FuelPolicy);
        }
        
        // Apply mileage filter
        if (!string.IsNullOrEmpty(filters.Mileage))
        {
            query = query.Where(v => v.MileageType == filters.Mileage);
        }
        
        // Apply pet-friendly filter
        if (filters.Features?.Contains("pet-friendly") == true)
        {
            query = query.Where(v => v.IsPetFriendly);
        }
        
        return query;
    }
}
```

### Availability Integration

**Real-Time Availability Checking**:
```csharp
public class AvailabilityService
{
    public async Task<IQueryable<Vehicle>> FilterByAvailability(
        IQueryable<Vehicle> vehicles,
        DateTime pickupDate,
        DateTime returnDate)
    {
        // Subquery to find vehicles with conflicting bookings
        var unavailableVehicleIds = await _context.Bookings
            .Where(b => b.Status != BookingStatus.Cancelled &&
                       b.Status != BookingStatus.Completed &&
                       ((b.PickupDate <= returnDate && b.ReturnDate >= pickupDate)))
            .Select(b => b.VehicleId)
            .ToListAsync();
        
        // Filter out unavailable vehicles
        return vehicles.Where(v => !unavailableVehicleIds.Contains(v.Id));
    }
}
```

### Sorting Implementation

**Sort Logic**:
```csharp
public IQueryable<Vehicle> ApplySorting(
    IQueryable<Vehicle> query,
    string sortBy,
    string sortOrder)
{
    var ascending = sortOrder?.ToLower() == "asc";
    
    return sortBy?.ToLower() switch
    {
        "price" => ascending 
            ? query.OrderBy(v => v.DailyRate) 
            : query.OrderByDescending(v => v.DailyRate),
            
        "rating" => ascending 
            ? query.OrderBy(v => v.AverageRating) 
            : query.OrderByDescending(v => v.AverageRating),
            
        "distance" => ascending 
            ? query.OrderBy(v => v.Location.DistanceFromUser) 
            : query.OrderByDescending(v => v.Location.DistanceFromUser),
            
        "popularity" => query.OrderByDescending(v => v.BookingCount),
        
        "newest" => query.OrderByDescending(v => v.CreatedAt),
        
        _ => query.OrderBy(v => v.DailyRate) // Default sort by price ascending
    };
}
```

### Caching Strategy

**Redis Caching Implementation**:
```csharp
public class FilterCacheService
{
    private readonly IDistributedCache _cache;
    private const int CacheDurationSeconds = 60;
    
    public async Task<VehicleSearchResult> GetOrSetCachedResults(
        string cacheKey,
        Func<Task<VehicleSearchResult>> fetchFunction)
    {
        // Try to get from cache
        var cachedData = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedData))
        {
            return JsonSerializer.Deserialize<VehicleSearchResult>(cachedData);
        }
        
        // Fetch from database
        var result = await fetchFunction();
        
        // Cache the result
        var options = new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(CacheDurationSeconds)
        };
        
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(result),
            options);
        
        return result;
    }
    
    public string GenerateCacheKey(VehicleSearchFilters filters)
    {
        // Create deterministic cache key from filter parameters
        var keyParts = new List<string>
        {
            $"loc:{filters.LocationId}",
            $"pickup:{filters.PickupDate:yyyyMMddHHmm}",
            $"return:{filters.ReturnDate:yyyyMMddHHmm}",
            $"fuel:{string.Join(",", filters.FuelTypes ?? Array.Empty<string>())}",
            $"trans:{filters.Transmission}",
            $"cat:{string.Join(",", filters.Categories ?? Array.Empty<string>())}",
            $"price:{filters.MinPrice}-{filters.MaxPrice}",
            $"page:{filters.Page}",
            $"size:{filters.PageSize}"
        };
        
        return $"vehicle:search:{string.Join(":", keyParts)}";
    }
}
```

### Performance Optimization

**Query Optimization Techniques**:
1. Use `.AsNoTracking()` for read-only queries
2. Implement projection to select only needed fields
3. Use compiled queries for frequently executed filters
4. Implement database query hints for complex joins
5. Use batch loading for related entities
6. Implement query result pagination at database level

**Example Optimized Query**:
```csharp
public async Task<PagedResult<VehicleDto>> SearchVehiclesOptimized(
    VehicleSearchFilters filters)
{
    var query = _context.Vehicles
        .AsNoTracking() // Read-only, no change tracking overhead
        .Include(v => v.VehicleFeatures)
            .ThenInclude(vf => vf.Feature)
        .Include(v => v.Supplier)
        .Include(v => v.AccessibilityFeatures)
        .Where(v => v.IsActive); // Base filter
    
    // Apply filters
    query = _queryBuilder.BuildFilteredQuery(query, filters);
    
    // Apply availability check
    query = await _availabilityService.FilterByAvailability(
        query, 
        filters.PickupDate, 
        filters.ReturnDate);
    
    // Get total count before pagination
    var totalCount = await query.CountAsync();
    
    // Apply sorting
    query = ApplySorting(query, filters.SortBy, filters.SortOrder);
    
    // Apply pagination
    var vehicles = await query
        .Skip((filters.Page - 1) * filters.PageSize)
        .Take(filters.PageSize)
        .Select(v => new VehicleDto // Project to DTO
        {
            Id = v.Id,
            Make = v.Make,
            Model = v.Model,
            Year = v.Year,
            Category = v.Category,
            FuelType = v.FuelType,
            Transmission = v.Transmission,
            Seats = v.Seats,
            Doors = v.Doors,
            DailyRate = v.DailyRate,
            Rating = v.AverageRating,
            ReviewCount = v.ReviewCount,
            SupplierName = v.Supplier.Name,
            Features = v.VehicleFeatures.Select(vf => new FeatureDto
            {
                Code = vf.FeatureCode,
                Name = vf.Feature.Name
            }).ToList()
        })
        .ToListAsync();
    
    return new PagedResult<VehicleDto>
    {
        Items = vehicles,
        TotalCount = totalCount,
        Page = filters.Page,
        PageSize = filters.PageSize
    };
}
```

## Authentication & Authorization

**JWT Token Validation**:
```csharp
[Authorize(Policy = "ApiAccess")]
[HttpGet("search")]
public async Task<IActionResult> SearchVehicles([FromQuery] VehicleSearchFilters filters)
{
    // Optional authentication - enhanced features for authenticated users
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    if (!string.IsNullOrEmpty(userId))
    {
        // Apply user-specific enhancements
        filters = await _userPreferenceService.ApplyUserPreferences(userId, filters);
        
        // Track search for analytics
        await _analyticsService.TrackSearch(userId, filters);
    }
    
    var result = await _vehicleSearchService.SearchVehicles(filters);
    
    return Ok(result);
}
```

**Corporate Policy Enforcement**:
```csharp
public async Task<VehicleSearchFilters> ApplyCorporatePolicy(
    string userId,
    VehicleSearchFilters filters)
{
    var user = await _userService.GetUserWithCorporatePolicy(userId);
    
    if (user?.CorporatePolicy == null)
        return filters;
    
    // Apply corporate policy restrictions
    if (user.CorporatePolicy.MaxDailyRate.HasValue)
    {
        filters.MaxPrice = Math.Min(
            filters.MaxPrice ?? decimal.MaxValue,
            user.CorporatePolicy.MaxDailyRate.Value);
    }
    
    if (user.CorporatePolicy.AllowedCategories?.Any() == true)
    {
        filters.Categories = filters.Categories?
            .Intersect(user.CorporatePolicy.AllowedCategories)
            .ToList() ?? user.CorporatePolicy.AllowedCategories;
    }
    
    if (user.CorporatePolicy.ApprovedSuppliers?.Any() == true)
    {
        filters.Suppliers = filters.Suppliers?
            .Intersect(user.CorporatePolicy.ApprovedSuppliers)
            .ToList() ?? user.CorporatePolicy.ApprovedSuppliers;
    }
    
    return filters;
}
```

## Rate Limiting

**ASP.NET Core Rate Limiting**:
```csharp
public class RateLimitingConfiguration
{
    public static void ConfigureRateLimiting(IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            options.AddFixedWindowLimiter("VehicleSearch", opt =>
            {
                opt.PermitLimit = 100;
                opt.Window = TimeSpan.FromMinutes(1);
                opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
                opt.QueueLimit = 10;
            });
            
            options.AddFixedWindowLimiter("VehicleSearchAuthenticated", opt =>
            {
                opt.PermitLimit = 500;
                opt.Window = TimeSpan.FromMinutes(1);
            });
        });
    }
}

// Apply to controller
[EnableRateLimiting("VehicleSearch")]
[HttpGet("search")]
public async Task<IActionResult> SearchVehicles([FromQuery] VehicleSearchFilters filters)
{
    // Implementation
}
```

## Error Handling

**Global Exception Handler**:
```csharp
public class GlobalExceptionHandler : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var response = exception switch
        {
            ValidationException validationEx => new ErrorResponse
            {
                Code = "VALIDATION_ERROR",
                Message = "Validation failed",
                Details = validationEx.Errors
            },
            
            NotFoundException notFoundEx => new ErrorResponse
            {
                Code = "NOT_FOUND",
                Message = notFoundEx.Message
            },
            
            RateLimitExceededException rateLimitEx => new ErrorResponse
            {
                Code = "RATE_LIMIT_EXCEEDED",
                Message = "Too many requests",
                RetryAfter = 60
            },
            
            _ => new ErrorResponse
            {
                Code = "INTERNAL_ERROR",
                Message = "An unexpected error occurred",
                SupportReference = GenerateSupportReference()
            }
        };
        
        httpContext.Response.StatusCode = GetStatusCode(exception);
        await httpContext.Response.WriteAsJsonAsync(response, cancellationToken);
        
        return true;
    }
}
```

## Monitoring & Logging

**Application Insights Integration**:
```csharp
public class VehicleSearchService
{
    private readonly TelemetryClient _telemetry;
    
    public async Task<VehicleSearchResult> SearchVehicles(VehicleSearchFilters filters)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var result = await ExecuteSearch(filters);
            
            stopwatch.Stop();
            
            // Track successful search
            _telemetry.TrackEvent("VehicleSearchCompleted", new Dictionary<string, string>
            {
                { "FilterCount", filters.GetActiveFilterCount().ToString() },
                { "ResultCount", result.TotalCount.ToString() },
                { "ExecutionTime", stopwatch.ElapsedMilliseconds.ToString() }
            });
            
            return result;
        }
        catch (Exception ex)
        {
            stopwatch.Stop();
            
            // Track failed search
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                { "Operation", "VehicleSearch" },
                { "ExecutionTime", stopwatch.ElapsedMilliseconds.ToString() }
            });
            
            throw;
        }
    }
}
```

## Testing Strategy

**Unit Tests**:
- Filter validation logic
- Query builder correctness
- AND/OR logic implementation
- Sorting logic
- Pagination calculations

**Integration Tests**:
- End-to-end filter application
- Database query performance
- Cache behavior
- Rate limiting enforcement

**Performance Tests**:
- Load testing with concurrent requests
- Query performance with large datasets
- Cache hit rate optimization
- Response time under various filter combinations

## Technology Stack

- **Framework**: .NET 8+ with C#
- **Web API**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB
- **Caching**: Redis (optional, for query result caching)
- **Monitoring**: Application Insights or Prometheus
- **Logging**: Serilog with structured logging
- **API Documentation**: Swagger/OpenAPI

## Implementation Notes

### Query Performance
Monitor query execution plans and optimize indexes based on actual usage patterns. Consider implementing query result caching for common filter combinations.

### Scalability
Design for horizontal scaling by keeping services stateless. Use distributed caching (Redis) for shared cache across multiple instances.

### Data Consistency
Ensure availability checks are accurate by implementing proper transaction isolation levels and handling race conditions in booking creation.

### Future Enhancements
- Implement GraphQL endpoint for flexible client-side filtering
- Add full-text search capabilities for vehicle descriptions
- Implement machine learning for filter recommendations
- Add support for saved filter combinations
- Implement A/B testing framework for filter UI variations

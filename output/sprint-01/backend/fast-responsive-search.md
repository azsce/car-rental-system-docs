# Feature: Fast, Responsive Search Experience (Backend)

## Overview

The backend implementation of the Fast, Responsive Search Experience feature provides high-performance API endpoints for vehicle search operations. This implementation focuses on query optimization, intelligent caching, efficient pagination, and sub-second response times. The backend leverages database indexes, Redis caching, connection pooling, and query optimization techniques to ensure search operations complete within 2 seconds even under high load.

## Sprint Category

sprint-01

## Feature ID

F-SD-015

## User Stories

### Story 1: Fast API Response
As a backend system, I want to return search results within 1 second, so that the frontend can display results within the 2-second target.

### Story 2: Efficient Filter Processing
As a backend system, I want to process filter combinations efficiently, so that filter updates complete within 500 milliseconds.

### Story 3: Scalable Search
As a backend system, I want to handle 1000 concurrent search requests, so that performance remains consistent under load.

### Story 4: Intelligent Caching
As a backend system, I want to cache common search queries, so that repeated searches return instantly without database queries.

### Story 5: Optimized Queries
As a backend system, I want to use optimized database queries with proper indexes, so that complex searches complete quickly.

## Backend Specifications

### API Endpoints

#### POST /api/search/vehicles

**Purpose**: Execute vehicle search with filters, sorting, and pagination

**Authentication**: Optional (JWT Bearer token)
- Anonymous users: Generic results
- Authenticated users: Personalized results with booking history consideration

**Rate Limiting**:
- Anonymous: 100 requests per minute per IP
- Authenticated: 200 requests per minute per user
- Burst allowance: 20 requests

**Request Headers**:
```
Content-Type: application/json
Authorization: Bearer {jwt_token} (optional)
X-Request-ID: {unique_request_id}
Accept-Language: en-US (optional)
```

**Request Body**:
```json
{
  "location": {
    "latitude": 34.0522,
    "longitude": -118.2437,
    "radius": 50
  },
  "dateRange": {
    "pickupDate": "2026-03-15T10:00:00Z",
    "returnDate": "2026-03-20T10:00:00Z"
  },
  "filters": {
    "vehicleTypes": ["SUV", "sedan"],
    "transmissions": ["automatic"],
    "priceRange": {
      "min": 30,
      "max": 100
    },
    "features": ["gps", "bluetooth"],
    "minRating": 4.0,
    "minSeats": 4,
    "maxSeats": 7,
    "fuelTypes": ["electric", "hybrid"]
  },
  "sort": {
    "field": "price",
    "direction": "asc"
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "veh_abc123",
        "name": "Tesla Model 3",
        "make": "Tesla",
        "model": "Model 3",
        "year": 2024,
        "category": "sedan",
        "transmission": "automatic",
        "fuelType": "electric",
        "seats": 5,
        "doors": 4,
        "thumbnailUrl": "https://cdn.example.com/vehicles/abc123/thumb.jpg",
        "imageUrls": [
          "https://cdn.example.com/vehicles/abc123/1.jpg",
          "https://cdn.example.com/vehicles/abc123/2.jpg"
        ],
        "pricing": {
          "dailyRate": 75.00,
          "currency": "USD",
          "weeklyRate": 450.00,
          "monthlyRate": 1800.00
        },
        "rating": {
          "average": 4.8,
          "count": 156
        },
        "location": {
          "id": "loc_xyz789",
          "name": "Downtown LA",
          "address": "123 Main St, Los Angeles, CA",
          "distance": 2.5,
          "unit": "km"
        },
        "features": ["gps", "bluetooth", "backup_camera", "heated_seats"],
        "availability": true,
        "isEcoFriendly": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalResults": 47,
      "totalPages": 3,
      "hasNextPage": true,
      "hasPreviousPage": false
    },
    "metadata": {
      "executionTimeMs": 342,
      "cacheHit": false,
      "appliedFilters": {
        "vehicleTypes": ["SUV", "sedan"],
        "transmissions": ["automatic"],
        "priceRange": {"min": 30, "max": 100}
      },
      "requestId": "req_def456"
    }
  }
}
```

**Error Responses**:

*400 Bad Request* - Invalid parameters:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETERS",
    "message": "Invalid search parameters",
    "details": {
      "pickupDate": "Must be in the future",
      "priceRange.min": "Must be less than priceRange.max",
      "pagination.pageSize": "Must be between 1 and 50"
    },
    "requestId": "req_def456"
  }
}
```

*429 Too Many Requests* - Rate limit exceeded:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60,
    "requestId": "req_def456"
  }
}
```

*504 Gateway Timeout* - Search timeout:
```json
{
  "success": false,
  "error": {
    "code": "SEARCH_TIMEOUT",
    "message": "Search took too long. Please try with fewer filters.",
    "suggestions": [
      "Reduce date range",
      "Select specific location",
      "Remove some filters"
    ],
    "requestId": "req_def456"
  }
}
```

#### GET /api/search/count

**Purpose**: Get result count for filter combinations without fetching full results

**Authentication**: Optional

**Rate Limiting**: 200 requests per minute per IP

**Query Parameters**:
```
location: string (format: "lat,lng,radius")
dateRange: string (format: "ISO8601_start|ISO8601_end")
filters: string (URL-encoded JSON)
```

**Example Request**:
```
GET /api/search/count?location=34.0522,-118.2437,50&dateRange=2026-03-15T10:00:00Z|2026-03-20T10:00:00Z&filters=%7B%22vehicleTypes%22%3A%5B%22SUV%22%5D%7D
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "count": 47,
    "executionTimeMs": 89,
    "cacheHit": true
  }
}
```

#### GET /api/search/suggestions

**Purpose**: Get alternative suggestions when search returns no results

**Authentication**: Optional

**Rate Limiting**: 50 requests per minute per IP

**Query Parameters**:
```
location: string (format: "lat,lng,radius")
dateRange: string (format: "ISO8601_start|ISO8601_end")
filters: string (URL-encoded JSON)
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "alternativeDates": [
      {
        "pickupDate": "2026-03-16T10:00:00Z",
        "returnDate": "2026-03-21T10:00:00Z",
        "availableVehicles": 12,
        "reason": "Next day availability"
      },
      {
        "pickupDate": "2026-03-22T10:00:00Z",
        "returnDate": "2026-03-27T10:00:00Z",
        "availableVehicles": 23,
        "reason": "Following week"
      }
    ],
    "nearbyLocations": [
      {
        "id": "loc_nearby1",
        "name": "Santa Monica",
        "distance": 15.3,
        "unit": "km",
        "availableVehicles": 8
      },
      {
        "id": "loc_nearby2",
        "name": "Pasadena",
        "distance": 18.7,
        "unit": "km",
        "availableVehicles": 15
      }
    ],
    "relaxedFilters": {
      "suggestion": "Try removing the 'electric' fuel type filter",
      "resultCount": 34,
      "removedFilter": "fuelTypes"
    }
  }
}
```

### Business Logic

#### Search Query Builder

**VehicleSearchService.cs**:
```csharp
public class VehicleSearchService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly ICacheService _cacheService;
    private readonly ILogger<VehicleSearchService> _logger;
    
    public async Task<SearchResult> SearchVehiclesAsync(
        SearchRequest request, 
        CancellationToken cancellationToken)
    {
        // Generate cache key from request
        var cacheKey = GenerateCacheKey(request);
        
        // Check cache first
        var cachedResult = await _cacheService.GetAsync<SearchResult>(cacheKey);
        if (cachedResult != null)
        {
            _logger.LogInformation("Cache hit for search: {CacheKey}", cacheKey);
            return cachedResult;
        }
        
        // Build optimized query
        var query = BuildSearchQuery(request);
        
        // Execute with timeout
        using var cts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        cts.CancelAfter(TimeSpan.FromSeconds(5));
        
        var stopwatch = Stopwatch.StartNew();
        var vehicles = await _vehicleRepository.ExecuteSearchAsync(query, cts.Token);
        stopwatch.Stop();
        
        // Build result
        var result = new SearchResult
        {
            Vehicles = vehicles,
            ExecutionTimeMs = stopwatch.ElapsedMilliseconds,
            CacheHit = false
        };
        
        // Cache result
        await _cacheService.SetAsync(cacheKey, result, TimeSpan.FromMinutes(5));
        
        return result;
    }
    
    private string GenerateCacheKey(SearchRequest request)
    {
        // Create deterministic hash of request parameters
        var json = JsonSerializer.Serialize(request, new JsonSerializerOptions 
        { 
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase 
        });
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(json));
        return $"search:results:{Convert.ToBase64String(hash)}";
    }
}
```

#### Query Optimization

**Filter Application Order** (most selective first):
1. Date range availability (eliminates booked vehicles)
2. Location radius (spatial filter)
3. Price range (indexed filter)
4. Vehicle type/category (indexed filter)
5. Transmission type (indexed filter)
6. Features (join filter)
7. Rating threshold (indexed filter)

**Query Execution Strategy**:
```csharp
private IQueryable<Vehicle> BuildSearchQuery(SearchRequest request)
{
    var query = _context.Vehicles
        .Include(v => v.Location)
        .Include(v => v.Images.Where(i => i.IsThumbnail))
        .Where(v => v.Status == VehicleStatus.Available);
    
    // Apply date range filter (most selective)
    if (request.DateRange != null)
    {
        query = query.Where(v => !v.Bookings.Any(b =>
            (b.Status == BookingStatus.Confirmed || b.Status == BookingStatus.Active) &&
            b.PickupDate < request.DateRange.ReturnDate &&
            b.ReturnDate > request.DateRange.PickupDate
        ));
    }
    
    // Apply location filter (spatial index)
    if (request.Location != null)
    {
        var point = new Point(request.Location.Longitude, request.Location.Latitude) 
        { 
            SRID = 4326 
        };
        var radiusMeters = request.Location.Radius * 1000;
        
        query = query.Where(v => 
            v.Location.Geolocation.Distance(point) <= radiusMeters
        );
    }
    
    // Apply price range filter (indexed)
    if (request.Filters?.PriceRange != null)
    {
        query = query.Where(v =>
            v.PricePerDay >= request.Filters.PriceRange.Min &&
            v.PricePerDay <= request.Filters.PriceRange.Max
        );
    }
    
    // Apply vehicle type filter (indexed)
    if (request.Filters?.VehicleTypes?.Any() == true)
    {
        query = query.Where(v => 
            request.Filters.VehicleTypes.Contains(v.Category)
        );
    }
    
    // Apply transmission filter (indexed)
    if (request.Filters?.Transmissions?.Any() == true)
    {
        query = query.Where(v => 
            request.Filters.Transmissions.Contains(v.Transmission)
        );
    }
    
    // Apply feature filter (join)
    if (request.Filters?.Features?.Any() == true)
    {
        foreach (var feature in request.Filters.Features)
        {
            query = query.Where(v => 
                v.VehicleFeatures.Any(vf => vf.Feature.Code == feature)
            );
        }
    }
    
    // Apply rating filter (indexed)
    if (request.Filters?.MinRating != null)
    {
        query = query.Where(v => 
            v.RatingAverage >= request.Filters.MinRating
        );
    }
    
    // Apply sorting
    query = ApplySorting(query, request.Sort);
    
    return query;
}
```

#### Caching Strategy

**Cache Layers**:
1. **Application Cache** (In-Memory): Hot searches (1 minute TTL)
2. **Distributed Cache** (Redis): Common searches (5 minutes TTL)
3. **Database Query Cache**: MySQL query cache (automatic)

**Cache Key Structure**:
```
search:results:{hash}      - Full search results
search:count:{hash}        - Result counts
search:suggestions:{hash}  - No-results suggestions
```

**Cache Invalidation**:
```csharp
public class VehicleCacheInvalidationService
{
    public async Task InvalidateVehicleCacheAsync(string vehicleId)
    {
        // Invalidate all search caches containing this vehicle
        var pattern = "search:results:*";
        await _cacheService.DeleteByPatternAsync(pattern);
        
        _logger.LogInformation(
            "Invalidated search cache for vehicle: {VehicleId}", 
            vehicleId
        );
    }
    
    public async Task InvalidateLocationCacheAsync(string locationId)
    {
        // Invalidate searches for this location
        var pattern = $"search:*:loc:{locationId}:*";
        await _cacheService.DeleteByPatternAsync(pattern);
    }
}
```

#### Pagination Implementation

**Offset-Based Pagination** (for consistency):
```csharp
public async Task<PaginatedResult<Vehicle>> GetPaginatedResultsAsync(
    IQueryable<Vehicle> query,
    int page,
    int pageSize)
{
    // Validate pagination parameters
    page = Math.Max(1, page);
    pageSize = Math.Clamp(pageSize, 1, 50);
    
    // Get total count (cached separately)
    var totalCount = await query.CountAsync();
    
    // Calculate pagination
    var skip = (page - 1) * pageSize;
    var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
    
    // Fetch page of results
    var vehicles = await query
        .Skip(skip)
        .Take(pageSize)
        .ToListAsync();
    
    return new PaginatedResult<Vehicle>
    {
        Items = vehicles,
        CurrentPage = page,
        PageSize = pageSize,
        TotalResults = totalCount,
        TotalPages = totalPages,
        HasNextPage = page < totalPages,
        HasPreviousPage = page > 1
    };
}
```

### Authentication Requirements

**Optional Authentication**:
- Anonymous users can search without authentication
- Authenticated users receive personalized results
- JWT Bearer token validation using .NET Identity
- Token expiration: 24 hours
- Refresh token support for long sessions

**Personalization for Authenticated Users**:
- Consider previous booking history
- Apply user preferences (favorite features)
- Show recently viewed vehicles
- Boost vehicles similar to past rentals
- Apply corporate policy filters (if corporate user)

### Performance Optimization

**Database Connection Pooling**:
```csharp
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null
        );
        mysqlOptions.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
    });
}, ServiceLifetime.Scoped, ServiceLifetime.Singleton);

// Connection pool settings
services.Configure<MySqlConnectionStringBuilder>(options =>
{
    options.MinimumPoolSize = 10;
    options.MaximumPoolSize = 100;
    options.ConnectionTimeout = 30;
    options.ConnectionLifeTime = 300;
});
```

**Read Replicas**:
```csharp
public class VehicleRepository : IVehicleRepository
{
    private readonly ApplicationDbContext _writeContext;
    private readonly ApplicationDbContext _readContext;
    
    public async Task<List<Vehicle>> ExecuteSearchAsync(
        IQueryable<Vehicle> query,
        CancellationToken cancellationToken)
    {
        // Use read replica for search queries
        return await query
            .AsNoTracking()  // No change tracking needed
            .AsSplitQuery()  // Split complex queries
            .ToListAsync(cancellationToken);
    }
}
```

**Query Timeout Configuration**:
```csharp
services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.CommandTimeout(5);  // 5 second timeout
    });
});
```

### Error Handling

**Timeout Handling**:
```csharp
try
{
    var result = await SearchVehiclesAsync(request, cancellationToken);
    return Ok(result);
}
catch (OperationCanceledException)
{
    _logger.LogWarning("Search timeout for request: {RequestId}", requestId);
    return StatusCode(504, new ErrorResponse
    {
        Code = "SEARCH_TIMEOUT",
        Message = "Search took too long. Please try with fewer filters.",
        Suggestions = new[]
        {
            "Reduce date range",
            "Select specific location",
            "Remove some filters"
        }
    });
}
```

**Database Connection Errors**:
```csharp
catch (DbException ex)
{
    _logger.LogError(ex, "Database error during search: {RequestId}", requestId);
    return StatusCode(503, new ErrorResponse
    {
        Code = "DATABASE_ERROR",
        Message = "Search service temporarily unavailable. Please try again.",
        RetryAfter = 60
    });
}
```

**Validation Errors**:
```csharp
if (!ModelState.IsValid)
{
    var errors = ModelState
        .Where(x => x.Value.Errors.Any())
        .ToDictionary(
            x => x.Key,
            x => x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
        );
    
    return BadRequest(new ErrorResponse
    {
        Code = "INVALID_PARAMETERS",
        Message = "Invalid search parameters",
        Details = errors
    });
}
```

### Rate Limiting

**Implementation using AspNetCoreRateLimit**:
```csharp
services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new RateLimitRule
        {
            Endpoint = "POST:/api/search/vehicles",
            Period = "1m",
            Limit = 100
        },
        new RateLimitRule
        {
            Endpoint = "GET:/api/search/count",
            Period = "1m",
            Limit = 200
        },
        new RateLimitRule
        {
            Endpoint = "GET:/api/search/suggestions",
            Period = "1m",
            Limit = 50
        }
    };
});

services.AddInMemoryRateLimiting();
services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
```

### Monitoring and Logging

**Structured Logging**:
```csharp
_logger.LogInformation(
    "Search executed: RequestId={RequestId}, ExecutionTime={ExecutionTime}ms, " +
    "ResultCount={ResultCount}, CacheHit={CacheHit}, Filters={Filters}",
    requestId,
    executionTime,
    resultCount,
    cacheHit,
    JsonSerializer.Serialize(filters)
);
```

**Performance Metrics**:
```csharp
public class SearchMetricsService
{
    private readonly IMetricsCollector _metrics;
    
    public void RecordSearchExecution(SearchMetrics metrics)
    {
        _metrics.RecordHistogram("search.execution_time", metrics.ExecutionTimeMs);
        _metrics.RecordCounter("search.requests", 1);
        _metrics.RecordCounter($"search.cache_{(metrics.CacheHit ? "hit" : "miss")}", 1);
        _metrics.RecordGauge("search.result_count", metrics.ResultCount);
    }
}
```

## Technology Stack

- **Framework**: .NET 8+ with C# 12
- **Web Framework**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with spatial extensions
- **Caching**: Redis 7+ via StackExchange.Redis
- **Logging**: Serilog with structured logging
- **Monitoring**: Application Insights or Prometheus
- **Rate Limiting**: AspNetCoreRateLimit
- **Authentication**: ASP.NET Core Identity with JWT

## Implementation Notes

### Performance Targets

- API response time: < 1 second (p95)
- Database query time: < 500ms (p95)
- Cache hit rate: > 60%
- Concurrent requests: 1000+
- Throughput: 500 requests/second

### Testing Strategy

**Unit Tests**:
- Query builder logic
- Cache key generation
- Filter application
- Pagination calculations
- Error handling

**Integration Tests**:
- End-to-end search flow
- Database query performance
- Cache integration
- Rate limiting
- Authentication

**Load Tests**:
- 1000 concurrent users
- Sustained load (500 req/s for 10 minutes)
- Spike test (burst to 2000 req/s)
- Cache effectiveness under load

### Dependencies

- F-SD-001: Location-Based Search
- F-SD-003: Date & Time Availability Search
- F-SD-004: Granular Multi-Criteria Filtering
- F-SD-005: Intelligent Search Results Sorting

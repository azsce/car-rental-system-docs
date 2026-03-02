# Feature: Intelligent Search Results Sorting (Backend)

## Overview

The backend implementation for Intelligent Search Results Sorting provides efficient sorting algorithms and business logic to order vehicle search results according to multiple criteria. The system supports eight distinct sorting options including price, distance, customer ratings, popularity, newest additions, AI-powered recommendations, availability windows, and eco-friendly prioritization. The implementation emphasizes query performance through strategic database indexing, caching of calculated values, and optimized sorting algorithms that maintain sub-500ms response times even with complex filter and sort combinations.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-005: Intelligent Search Results Sorting (primary feature)
- F-WF-SRCH-005: Search Result Sorting (workflow integration)

**Note**: These features represent the same sorting capability documented from different perspectives - F-SD-005 describes the feature functionality, while F-WF-SRCH-005 describes how sorting integrates into the vehicle search workflow.

## Technical Architecture

### Service Layer Components

**SortingService**
- Orchestrates sort logic application
- Validates sort parameters
- Applies appropriate sorting algorithm
- Handles sort-specific business rules

**DistanceCalculationService**
- Calculates distances from user location to vehicles
- Caches distance calculations per session
- Uses Haversine formula for accuracy
- Integrates with mapping services

**RecommendationService**
- Generates personalized recommendation scores
- Analyzes user booking history
- Applies collaborative filtering
- Considers real-time context

**AvailabilityCalculationService**
- Calculates availability windows for vehicles
- Considers existing bookings and maintenance
- Caches availability data
- Updates in real-time

## API Endpoint Enhancement

### GET /api/v1/vehicles/search (Enhanced with Sorting)

**Additional Query Parameters**:

| Parameter | Type | Required | Description | Valid Values | Default |
|-----------|------|----------|-------------|--------------|---------|
| sortBy | string | No | Sort field | price, distance, rating, popularity, newest, recommended, availability, eco | price |
| sortOrder | string | No | Sort direction | asc, desc | asc |

**Enhanced Response**:
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
        "dailyRate": 89.99,
        "distance": 2.3,
        "distanceUnit": "km",
        "rating": 4.8,
        "reviewCount": 342,
        "bookingCount": 156,
        "createdAt": "2024-01-15T00:00:00Z",
        "co2Emissions": 0,
        "co2Unit": "g/km",
        "availabilityDays": 28,
        "recommendationScore": 0.87,
        "sortValue": 89.99
      }
    ],
    "sorting": {
      "sortBy": "price",
      "sortOrder": "asc",
      "appliedSort": "Daily Rate (Lowest First)"
    },
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "totalResults": 127,
      "totalPages": 7
    }
  },
  "meta": {
    "requestId": "req-uuid",
    "timestamp": "2026-02-23T10:30:00Z",
    "executionTime": 245
  }
}
```

**Sort Value Explanation**:
The `sortValue` field in each vehicle object contains the actual value used for sorting, making it transparent to the frontend which metric determined the order.

## Business Logic Implementation

### Sort Parameter Validation

**C# Implementation Pattern**:
```csharp
public class SortValidationService
{
    private static readonly string[] ValidSortFields = 
    {
        "price", "distance", "rating", "popularity", 
        "newest", "recommended", "availability", "eco"
    };
    
    private static readonly string[] ValidSortOrders = { "asc", "desc" };
    
    public ValidationResult ValidateSort(string sortBy, string sortOrder)
    {
        var errors = new List<ValidationError>();
        
        // Validate sortBy
        if (!string.IsNullOrEmpty(sortBy) && 
            !ValidSortFields.Contains(sortBy.ToLower()))
        {
            errors.Add(new ValidationError(
                "sortBy", 
                $"Invalid sort field. Valid values: {string.Join(", ", ValidSortFields)}"
            ));
        }
        
        // Validate sortOrder
        if (!string.IsNullOrEmpty(sortOrder) && 
            !ValidSortOrders.Contains(sortOrder.ToLower()))
        {
            errors.Add(new ValidationError(
                "sortOrder", 
                "Invalid sort order. Valid values: asc, desc"
            ));
        }
        
        // Distance sort requires user location
        if (sortBy?.ToLower() == "distance" && !HasUserLocation())
        {
            errors.Add(new ValidationError(
                "sortBy", 
                "Distance sort requires user location. Please enable location services."
            ));
        }
        
        // Recommended sort requires authentication
        if (sortBy?.ToLower() == "recommended" && !IsAuthenticated())
        {
            errors.Add(new ValidationError(
                "sortBy", 
                "Recommended sort is only available for authenticated users."
            ));
        }
        
        return new ValidationResult(errors);
    }
}
```

### Sorting Service Implementation

**Main Sorting Logic**:
```csharp
public class VehicleSortingService
{
    private readonly IDistanceCalculationService _distanceService;
    private readonly IRecommendationService _recommendationService;
    private readonly IAvailabilityService _availabilityService;
    
    public async Task<IQueryable<Vehicle>> ApplySorting(
        IQueryable<Vehicle> query,
        string sortBy,
        string sortOrder,
        SortContext context)
    {
        var ascending = sortOrder?.ToLower() != "desc";
        
        return sortBy?.ToLower() switch
        {
            "price" => ApplyPriceSort(query, ascending),
            "distance" => await ApplyDistanceSort(query, ascending, context),
            "rating" => ApplyRatingSort(query, ascending),
            "popularity" => ApplyPopularitySort(query, ascending),
            "newest" => ApplyNewestSort(query, ascending),
            "recommended" => await ApplyRecommendedSort(query, ascending, context),
            "availability" => await ApplyAvailabilitySort(query, ascending, context),
            "eco" => ApplyEcoSort(query, ascending),
            _ => ApplyPriceSort(query, true) // Default: price ascending
        };
    }
    
    private IQueryable<Vehicle> ApplyPriceSort(
        IQueryable<Vehicle> query, 
        bool ascending)
    {
        return ascending
            ? query.OrderBy(v => v.DailyRate).ThenBy(v => v.Id)
            : query.OrderByDescending(v => v.DailyRate).ThenBy(v => v.Id);
    }
    
    private IQueryable<Vehicle> ApplyRatingSort(
        IQueryable<Vehicle> query, 
        bool ascending)
    {
        return ascending
            ? query.OrderBy(v => v.AverageRating)
                   .ThenBy(v => v.ReviewCount)
                   .ThenBy(v => v.Id)
            : query.OrderByDescending(v => v.AverageRating)
                   .ThenByDescending(v => v.ReviewCount)
                   .ThenBy(v => v.Id);
    }
    
    private IQueryable<Vehicle> ApplyPopularitySort(
        IQueryable<Vehicle> query, 
        bool ascending)
    {
        return ascending
            ? query.OrderBy(v => v.BookingCount)
                   .ThenBy(v => v.AverageRating)
                   .ThenBy(v => v.Id)
            : query.OrderByDescending(v => v.BookingCount)
                   .ThenByDescending(v => v.AverageRating)
                   .ThenBy(v => v.Id);
    }
    
    private IQueryable<Vehicle> ApplyNewestSort(
        IQueryable<Vehicle> query, 
        bool ascending)
    {
        return ascending
            ? query.OrderBy(v => v.CreatedAt).ThenBy(v => v.Id)
            : query.OrderByDescending(v => v.CreatedAt).ThenBy(v => v.Id);
    }
    
    private IQueryable<Vehicle> ApplyEcoSort(
        IQueryable<Vehicle> query, 
        bool ascending)
    {
        // Sort by eco score (computed column) or CO2 emissions
        return ascending
            ? query.OrderBy(v => v.Co2Emissions).ThenBy(v => v.Id)
            : query.OrderByDescending(v => v.EcoScore).ThenBy(v => v.Id);
    }
}
```

### Distance Calculation Service

**Haversine Formula Implementation**:
```csharp
public class DistanceCalculationService : IDistanceCalculationService
{
    private readonly IDistributedCache _cache;
    private readonly ILocationService _locationService;
    private const double EarthRadiusKm = 6371.0;
    
    public async Task<IQueryable<Vehicle>> ApplyDistanceSort(
        IQueryable<Vehicle> query,
        bool ascending,
        SortContext context)
    {
        // Get user location
        var userLocation = context.UserLocation 
            ?? await _locationService.GetUserLocationAsync(context.UserId);
        
        if (userLocation == null)
        {
            throw new InvalidOperationException(
                "User location is required for distance sorting");
        }
        
        // Check cache first
        var cacheKey = $"distance:{context.SessionId}:{userLocation.Latitude}:{userLocation.Longitude}";
        var cachedDistances = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedDistances))
        {
            var distances = JsonSerializer.Deserialize<Dictionary<Guid, double>>(cachedDistances);
            return ApplyDistanceSortFromCache(query, distances, ascending);
        }
        
        // Calculate distances and cache
        var vehiclesWithDistances = await query
            .Include(v => v.Location)
            .Select(v => new
            {
                Vehicle = v,
                Distance = CalculateDistance(
                    userLocation.Latitude,
                    userLocation.Longitude,
                    v.Location.Latitude,
                    v.Location.Longitude
                )
            })
            .ToListAsync();
        
        // Cache distances for session
        var distanceMap = vehiclesWithDistances.ToDictionary(
            x => x.Vehicle.Id,
            x => x.Distance
        );
        
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(distanceMap),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
            }
        );
        
        // Return sorted query
        var sortedVehicles = ascending
            ? vehiclesWithDistances.OrderBy(x => x.Distance).ThenBy(x => x.Vehicle.Id)
            : vehiclesWithDistances.OrderByDescending(x => x.Distance).ThenBy(x => x.Vehicle.Id);
        
        return sortedVehicles.Select(x => x.Vehicle).AsQueryable();
    }
    
    private double CalculateDistance(
        double lat1, double lon1, 
        double lat2, double lon2)
    {
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
        
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        
        return EarthRadiusKm * c;
    }
    
    private double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180.0;
    }
}
```

### Recommendation Service

**AI-Powered Recommendation Scoring**:
```csharp
public class RecommendationService : IRecommendationService
{
    private readonly IUserHistoryService _historyService;
    private readonly ICollaborativeFilteringService _cfService;
    private readonly IDistributedCache _cache;
    
    public async Task<IQueryable<Vehicle>> ApplyRecommendedSort(
        IQueryable<Vehicle> query,
        bool ascending,
        SortContext context)
    {
        if (string.IsNullOrEmpty(context.UserId))
        {
            // Fallback to popularity for unauthenticated users
            return query.OrderByDescending(v => v.BookingCount)
                       .ThenByDescending(v => v.AverageRating)
                       .ThenBy(v => v.Id);
        }
        
        // Check cache
        var cacheKey = $"recommendations:{context.UserId}";
        var cachedScores = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedScores))
        {
            var scores = JsonSerializer.Deserialize<Dictionary<Guid, double>>(cachedScores);
            return ApplyRecommendationSortFromCache(query, scores, ascending);
        }
        
        // Calculate recommendation scores
        var userHistory = await _historyService.GetUserBookingHistoryAsync(context.UserId);
        var userPreferences = ExtractUserPreferences(userHistory);
        
        var vehiclesWithScores = await query
            .Select(v => new
            {
                Vehicle = v,
                Score = CalculateRecommendationScore(v, userPreferences, context)
            })
            .ToListAsync();
        
        // Cache scores
        var scoreMap = vehiclesWithScores.ToDictionary(
            x => x.Vehicle.Id,
            x => x.Score
        );
        
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(scoreMap),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(24)
            }
        );
        
        // Return sorted query
        var sortedVehicles = ascending
            ? vehiclesWithScores.OrderBy(x => x.Score).ThenBy(x => x.Vehicle.Id)
            : vehiclesWithScores.OrderByDescending(x => x.Score).ThenBy(x => x.Vehicle.Id);
        
        return sortedVehicles.Select(x => x.Vehicle).AsQueryable();
    }
    
    private double CalculateRecommendationScore(
        Vehicle vehicle,
        UserPreferences preferences,
        SortContext context)
    {
        double score = 0.0;
        
        // Category preference (30% weight)
        if (preferences.PreferredCategories.Contains(vehicle.Category))
            score += 0.30;
        
        // Fuel type preference (20% weight)
        if (preferences.PreferredFuelTypes.Contains(vehicle.FuelType))
            score += 0.20;
        
        // Price range preference (20% weight)
        if (vehicle.DailyRate >= preferences.MinPrice && 
            vehicle.DailyRate <= preferences.MaxPrice)
            score += 0.20;
        
        // Rating preference (15% weight)
        score += (vehicle.AverageRating / 5.0) * 0.15;
        
        // Collaborative filtering (15% weight)
        var cfScore = _cfService.GetSimilarUserScore(context.UserId, vehicle.Id);
        score += cfScore * 0.15;
        
        // Contextual factors
        if (IsWeekend(context.SearchDate) && preferences.WeekendPreference)
            score += 0.05;
        
        if (vehicle.Features.Any(f => preferences.PreferredFeatures.Contains(f)))
            score += 0.10;
        
        return Math.Min(score, 1.0); // Cap at 1.0
    }
    
    private UserPreferences ExtractUserPreferences(List<Booking> history)
    {
        return new UserPreferences
        {
            PreferredCategories = history
                .GroupBy(b => b.Vehicle.Category)
                .OrderByDescending(g => g.Count())
                .Take(3)
                .Select(g => g.Key)
                .ToList(),
            
            PreferredFuelTypes = history
                .GroupBy(b => b.Vehicle.FuelType)
                .OrderByDescending(g => g.Count())
                .Take(2)
                .Select(g => g.Key)
                .ToList(),
            
            MinPrice = history.Min(b => b.TotalCost / b.DurationDays),
            MaxPrice = history.Max(b => b.TotalCost / b.DurationDays),
            
            PreferredFeatures = history
                .SelectMany(b => b.Vehicle.Features)
                .GroupBy(f => f)
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList()
        };
    }
}
```

### Availability Calculation Service

**Availability Window Calculation**:
```csharp
public class AvailabilityCalculationService : IAvailabilityService
{
    private readonly IBookingRepository _bookingRepo;
    private readonly IMaintenanceRepository _maintenanceRepo;
    private readonly IDistributedCache _cache;
    
    public async Task<IQueryable<Vehicle>> ApplyAvailabilitySort(
        IQueryable<Vehicle> query,
        bool ascending,
        SortContext context)
    {
        var startDate = context.SearchStartDate ?? DateTime.UtcNow;
        var endDate = context.SearchEndDate ?? startDate.AddDays(30);
        
        // Check cache
        var cacheKey = $"availability:{startDate:yyyyMMdd}:{endDate:yyyyMMdd}";
        var cachedAvailability = await _cache.GetStringAsync(cacheKey);
        
        if (!string.IsNullOrEmpty(cachedAvailability))
        {
            var availability = JsonSerializer.Deserialize<Dictionary<Guid, int>>(cachedAvailability);
            return ApplyAvailabilitySortFromCache(query, availability, ascending);
        }
        
        // Calculate availability windows
        var vehicleIds = await query.Select(v => v.Id).ToListAsync();
        
        var availabilityMap = new Dictionary<Guid, int>();
        
        foreach (var vehicleId in vehicleIds)
        {
            var availableDays = await CalculateAvailableDays(
                vehicleId, 
                startDate, 
                endDate
            );
            availabilityMap[vehicleId] = availableDays;
        }
        
        // Cache availability data
        await _cache.SetStringAsync(
            cacheKey,
            JsonSerializer.Serialize(availabilityMap),
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            }
        );
        
        // Apply sorting
        var vehiclesWithAvailability = query
            .ToList()
            .Select(v => new
            {
                Vehicle = v,
                AvailableDays = availabilityMap.GetValueOrDefault(v.Id, 0)
            });
        
        var sortedVehicles = ascending
            ? vehiclesWithAvailability.OrderBy(x => x.AvailableDays).ThenBy(x => x.Vehicle.Id)
            : vehiclesWithAvailability.OrderByDescending(x => x.AvailableDays).ThenBy(x => x.Vehicle.Id);
        
        return sortedVehicles.Select(x => x.Vehicle).AsQueryable();
    }
    
    private async Task<int> CalculateAvailableDays(
        Guid vehicleId,
        DateTime startDate,
        DateTime endDate)
    {
        // Get all bookings in the date range
        var bookings = await _bookingRepo.GetBookingsForVehicleInRange(
            vehicleId, 
            startDate, 
            endDate
        );
        
        // Get maintenance schedules
        var maintenance = await _maintenanceRepo.GetMaintenanceForVehicleInRange(
            vehicleId, 
            startDate, 
            endDate
        );
        
        // Calculate unavailable days
        var unavailableDays = new HashSet<DateTime>();
        
        foreach (var booking in bookings)
        {
            for (var date = booking.PickupDate.Date; 
                 date <= booking.ReturnDate.Date; 
                 date = date.AddDays(1))
            {
                unavailableDays.Add(date);
            }
        }
        
        foreach (var maint in maintenance)
        {
            for (var date = maint.StartDate.Date; 
                 date <= maint.EndDate.Date; 
                 date = date.AddDays(1))
            {
                unavailableDays.Add(date);
            }
        }
        
        // Calculate available days
        var totalDays = (endDate - startDate).Days + 1;
        var availableDays = totalDays - unavailableDays.Count;
        
        return Math.Max(0, availableDays);
    }
}
```

## Performance Optimization

### Query Optimization

**Compiled Queries for Frequent Sorts**:
```csharp
public static class CompiledSortQueries
{
    private static readonly Func<AppDbContext, IQueryable<Vehicle>> 
        PriceSortAscQuery = EF.CompileQuery(
            (AppDbContext context) => 
                context.Vehicles
                    .Where(v => v.IsActive)
                    .OrderBy(v => v.DailyRate)
                    .ThenBy(v => v.Id)
        );
    
    private static readonly Func<AppDbContext, IQueryable<Vehicle>> 
        RatingSortDescQuery = EF.CompileQuery(
            (AppDbContext context) => 
                context.Vehicles
                    .Where(v => v.IsActive)
                    .OrderByDescending(v => v.AverageRating)
                    .ThenByDescending(v => v.ReviewCount)
                    .ThenBy(v => v.Id)
        );
    
    public static IQueryable<Vehicle> GetPriceSortedVehicles(AppDbContext context)
    {
        return PriceSortAscQuery(context);
    }
    
    public static IQueryable<Vehicle> GetRatingSortedVehicles(AppDbContext context)
    {
        return RatingSortDescQuery(context);
    }
}
```

### Caching Strategy

**Multi-Level Caching**:
```csharp
public class SortCacheService
{
    private readonly IDistributedCache _distributedCache;
    private readonly IMemoryCache _memoryCache;
    
    public async Task<T> GetOrSetCachedSort<T>(
        string cacheKey,
        Func<Task<T>> fetchFunction,
        TimeSpan? expiration = null)
    {
        // Try memory cache first (fastest)
        if (_memoryCache.TryGetValue(cacheKey, out T cachedValue))
        {
            return cachedValue;
        }
        
        // Try distributed cache (shared across instances)
        var distributedValue = await _distributedCache.GetStringAsync(cacheKey);
        if (!string.IsNullOrEmpty(distributedValue))
        {
            var value = JsonSerializer.Deserialize<T>(distributedValue);
            
            // Store in memory cache
            _memoryCache.Set(cacheKey, value, TimeSpan.FromMinutes(5));
            
            return value;
        }
        
        // Fetch from database
        var result = await fetchFunction();
        
        // Cache in both layers
        var serialized = JsonSerializer.Serialize(result);
        
        await _distributedCache.SetStringAsync(
            cacheKey,
            serialized,
            new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? TimeSpan.FromMinutes(15)
            }
        );
        
        _memoryCache.Set(cacheKey, result, TimeSpan.FromMinutes(5));
        
        return result;
    }
}
```

## Error Handling

**Sort-Specific Error Handling**:
```csharp
public class SortErrorHandler
{
    public async Task<IActionResult> HandleSortError(
        Exception exception,
        string sortBy,
        HttpContext context)
    {
        return exception switch
        {
            LocationRequiredException => new BadRequestObjectResult(new
            {
                Code = "LOCATION_REQUIRED",
                Message = "Distance sorting requires user location",
                SortBy = sortBy
            }),
            
            AuthenticationRequiredException => new UnauthorizedObjectResult(new
            {
                Code = "AUTHENTICATION_REQUIRED",
                Message = "Recommended sorting requires authentication",
                SortBy = sortBy
            }),
            
            InvalidSortParameterException invalidSort => new BadRequestObjectResult(new
            {
                Code = "INVALID_SORT_PARAMETER",
                Message = invalidSort.Message,
                ValidValues = invalidSort.ValidValues
            }),
            
            _ => new ObjectResult(new
            {
                Code = "SORT_ERROR",
                Message = "An error occurred while sorting results",
                SupportReference = GenerateSupportReference()
            })
            {
                StatusCode = 500
            }
        };
    }
}
```

## Monitoring and Analytics

**Sort Performance Tracking**:
```csharp
public class SortAnalyticsService
{
    private readonly TelemetryClient _telemetry;
    
    public void TrackSortOperation(
        string sortBy,
        string sortOrder,
        int resultCount,
        long executionTimeMs,
        bool fromCache)
    {
        _telemetry.TrackEvent("VehicleSortCompleted", new Dictionary<string, string>
        {
            { "SortBy", sortBy },
            { "SortOrder", sortOrder },
            { "ResultCount", resultCount.ToString() },
            { "ExecutionTime", executionTimeMs.ToString() },
            { "FromCache", fromCache.ToString() }
        });
        
        _telemetry.TrackMetric("SortExecutionTime", executionTimeMs, new Dictionary<string, string>
        {
            { "SortBy", sortBy },
            { "FromCache", fromCache.ToString() }
        });
    }
    
    public async Task<SortUsageStatistics> GetSortUsageStatistics(int days = 30)
    {
        // Query Application Insights or logging database
        return new SortUsageStatistics
        {
            MostPopularSort = "price",
            SortUsageBreakdown = new Dictionary<string, int>
            {
                { "price", 45000 },
                { "rating", 23000 },
                { "distance", 18000 },
                { "popularity", 8000 },
                { "recommended", 4500 },
                { "newest", 1200 },
                { "availability", 800 },
                { "eco", 500 }
            },
            AverageExecutionTimes = new Dictionary<string, double>
            {
                { "price", 120 },
                { "rating", 135 },
                { "distance", 450 },
                { "popularity", 140 },
                { "recommended", 680 },
                { "newest", 110 },
                { "availability", 520 },
                { "eco", 125 }
            }
        };
    }
}
```

## Testing Strategy

**Unit Tests**:
```csharp
[TestClass]
public class SortingServiceTests
{
    [TestMethod]
    public async Task ApplyPriceSort_Ascending_ReturnsLowestPriceFirst()
    {
        // Arrange
        var vehicles = CreateTestVehicles();
        var sortingService = new VehicleSortingService();
        
        // Act
        var result = await sortingService.ApplySorting(
            vehicles.AsQueryable(),
            "price",
            "asc",
            new SortContext()
        );
        
        // Assert
        var sortedList = await result.ToListAsync();
        Assert.AreEqual(25.00m, sortedList.First().DailyRate);
        Assert.AreEqual(350.00m, sortedList.Last().DailyRate);
    }
    
    [TestMethod]
    public async Task ApplyDistanceSort_WithoutLocation_ThrowsException()
    {
        // Arrange
        var vehicles = CreateTestVehicles();
        var sortingService = new VehicleSortingService();
        var context = new SortContext { UserLocation = null };
        
        // Act & Assert
        await Assert.ThrowsExceptionAsync<LocationRequiredException>(
            async () => await sortingService.ApplySorting(
                vehicles.AsQueryable(),
                "distance",
                "asc",
                context
            )
        );
    }
}
```

**Integration Tests**:
```csharp
[TestClass]
public class SortingIntegrationTests
{
    [TestMethod]
    public async Task EndToEnd_PriceSort_ReturnsCorrectOrder()
    {
        // Arrange
        var client = _factory.CreateClient();
        
        // Act
        var response = await client.GetAsync(
            "/api/v1/vehicles/search?location=test-location&sortBy=price&sortOrder=asc"
        );
        
        // Assert
        response.EnsureSuccessStatusCode();
        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<VehicleSearchResponse>(content);
        
        Assert.IsTrue(result.Data.Vehicles.Count > 0);
        
        // Verify ascending price order
        for (int i = 0; i < result.Data.Vehicles.Count - 1; i++)
        {
            Assert.IsTrue(
                result.Data.Vehicles[i].DailyRate <= 
                result.Data.Vehicles[i + 1].DailyRate
            );
        }
    }
}
```

## Technology Stack

- **Framework**: .NET 8+ with C#
- **Web API**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Caching**: Redis (distributed) + IMemoryCache (in-process)
- **Monitoring**: Application Insights
- **Logging**: Serilog with structured logging

## Implementation Notes

### Sort Performance
- Use compiled queries for frequently executed sorts
- Implement multi-level caching (memory + distributed)
- Monitor slow sorts and optimize indexes
- Consider pre-calculating complex sort values

### Distance Calculation
- Cache distance calculations per session
- Use spatial indexes if available in database
- Consider using external geocoding services for accuracy
- Implement fallback for users without location

### Recommendation Algorithm
- Start with simple rule-based recommendations
- Gradually introduce machine learning models
- A/B test recommendation algorithms
- Collect feedback to improve accuracy

### Availability Calculation
- Cache availability windows with short TTL
- Update cache when bookings change
- Consider eventual consistency for performance
- Implement real-time updates for critical paths

### Future Enhancements
- Implement machine learning-based recommendation models
- Add real-time popularity tracking with time decay
- Implement multi-criteria sorting (primary + secondary)
- Add user preference learning for default sort
- Consider Elasticsearch for advanced sorting and relevance

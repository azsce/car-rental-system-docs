# Feature: Map-Based Vehicle Discovery - Backend

## Overview

Backend services supporting map-based vehicle discovery with geospatial queries, viewport-based vehicle loading, clustering support, and distance calculations.

## Sprint Category

nice-to-have (Would be great but not essential)

## Feature ID

F-SD-002: Map-Based Vehicle Discovery

## Dependencies

- F-SD-001: Location-Based Search (backend services)
- R-VS-001: Location-Based Search Requirement

## API Endpoints

### GET /api/vehicles/map

Retrieve vehicles within map viewport bounds.

**Query Parameters:**
- `neLat` (required): number - Northeast corner latitude
- `neLng` (required): number - Northeast corner longitude
- `swLat` (required): number - Southwest corner latitude
- `swLng` (required): number - Southwest corner longitude
- `vehicleTypes` (optional): string - Comma-separated vehicle types
- `minPrice` (optional): number - Minimum price per day
- `maxPrice` (optional): number - Maximum price per day
- `maxDistance` (optional): number - Maximum distance from user in km
- `userLat` (optional): number - User's current latitude
- `userLng` (optional): number - User's current longitude
- `startDate` (optional): string - Rental start date (ISO 8601)
- `endDate` (optional): string - Rental end date (ISO 8601)

**Response:** 200 OK
```json
{
  "vehicles": [
    {
      "vehicleId": "VEH-12345",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "vehicleType": "sedan",
      "pricePerDay": 45.00,
      "location": {
        "latitude": 34.0522,
        "longitude": -118.2437,
        "address": "123 Main St, Los Angeles, CA 90012",
        "locationId": "LOC-10002"
      },
      "availability": "available",
      "photoUrl": "https://cdn.example.com/vehicles/veh-12345-thumb.jpg",
      "distanceFromUser": 2.5,
      "features": ["automatic", "bluetooth", "backup_camera"]
    }
  ],
  "totalCount": 45,
  "bounds": {
    "northEast": { "latitude": 34.1, "longitude": -118.2 },
    "southWest": { "latitude": 34.0, "longitude": -118.3 }
  }
}
```

**Error Responses:**
- 400 Bad Request: Invalid bounds or parameters
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

### GET /api/vehicles/map/clusters

Retrieve clustered vehicle data for map display.

**Query Parameters:**
- `neLat` (required): number - Northeast corner latitude
- `neLng` (required): number - Northeast corner longitude
- `swLat` (required): number - Southwest corner latitude
- `swLng` (required): number - Southwest corner longitude
- `zoom` (required): number - Current map zoom level (1-20)
- `clusterRadius` (optional): number - Clustering radius in pixels (default: 50)
- `vehicleTypes` (optional): string - Comma-separated vehicle types
- `minPrice` (optional): number - Minimum price per day
- `maxPrice` (optional): number - Maximum price per day

**Response:** 200 OK
```json
{
  "clusters": [
    {
      "clusterId": "cluster-1",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "vehicleCount": 15,
      "minPrice": 35.00,
      "maxPrice": 85.00,
      "vehicleTypes": ["sedan", "suv", "van"]
    }
  ],
  "vehicles": [
    {
      "vehicleId": "VEH-12345",
      "latitude": 34.0600,
      "longitude": -118.2500,
      "pricePerDay": 45.00,
      "vehicleType": "sedan",
      "availability": "available"
    }
  ],
  "totalVehicles": 45
}
```

**Error Responses:**
- 400 Bad Request: Invalid parameters
- 500 Internal Server Error: Server error

### POST /api/vehicles/map/distance

Calculate distances from user location to multiple vehicles.

**Request Body:**
```json
{
  "userLocation": {
    "latitude": 34.0522,
    "longitude": -118.2437
  },
  "vehicleIds": ["VEH-12345", "VEH-12346", "VEH-12347"]
}
```

**Response:** 200 OK
```json
{
  "distances": [
    {
      "vehicleId": "VEH-12345",
      "distanceKm": 2.5,
      "distanceMiles": 1.6,
      "walkingTimeMinutes": 30,
      "drivingTimeMinutes": 8
    },
    {
      "vehicleId": "VEH-12346",
      "distanceKm": 5.2,
      "distanceMiles": 3.2,
      "walkingTimeMinutes": 62,
      "drivingTimeMinutes": 15
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid location or vehicle IDs
- 500 Internal Server Error: Server error

## Business Logic

### Viewport-Based Vehicle Query
1. Validate map bounds (latitude: -90 to 90, longitude: -180 to 180)
2. Calculate viewport area and determine if clustering is needed
3. Query database for vehicles within bounds using geospatial index
4. Apply filters (vehicle type, price range, availability)
5. If user location provided, calculate distances using Haversine formula
6. Sort results by distance from user (if applicable) or price
7. Limit results to prevent performance issues (max 500 vehicles)
8. Return vehicle data with location coordinates

### Clustering Algorithm
1. Determine cluster radius based on zoom level (higher zoom = smaller radius)
2. Group vehicles within cluster radius using spatial clustering algorithm
3. For each cluster:
   - Calculate cluster center (average of vehicle coordinates)
   - Count vehicles in cluster
   - Calculate price range (min/max)
   - Aggregate vehicle types
4. Return clusters and individual vehicles outside clusters
5. Cache cluster data for 2 minutes per viewport

### Distance Calculation
1. Use Haversine formula for great-circle distance:
   ```
   a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
   c = 2 * atan2(√a, √(1−a))
   distance = R * c (where R = Earth's radius = 6371 km)
   ```
2. Calculate walking time: distance / 5 km/h (average walking speed)
3. Calculate driving time: distance / 40 km/h (average urban driving speed)
4. Round distances to 1 decimal place
5. Round times to nearest minute

### Performance Optimization
- Implement viewport caching with 2-minute TTL
- Use geospatial database indexes for fast bounding box queries
- Limit result set to 500 vehicles per request
- Implement request debouncing on client side
- Use database read replicas for map queries
- Pre-calculate and cache distances for popular locations

## Authentication Requirements

### Public Endpoints
- GET /api/vehicles/map (rate-limited)
- GET /api/vehicles/map/clusters (rate-limited)

### Authenticated Endpoints
- POST /api/vehicles/map/distance (requires valid JWT token)

### Rate Limiting
- Anonymous users: 30 requests per minute per IP
- Authenticated users: 100 requests per minute per user

## Data Validation

### Map Bounds
- Northeast latitude > Southwest latitude
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Maximum viewport area: 10,000 km² (prevents excessive queries)

### Zoom Level
- Range: 1 to 20
- Integer values only

### Distance Parameters
- maxDistance: 0 to 100 km
- Positive numbers only

### Vehicle IDs
- Pattern: VEH-[0-9]{5}
- Maximum 50 vehicle IDs per distance calculation request

## Error Handling

### Invalid Bounds
- Return 400 Bad Request with error message
- Provide example of valid bounds

### Viewport Too Large
- Return 400 Bad Request
- Suggest zooming in or reducing viewport size

### No Vehicles Found
- Return 200 OK with empty vehicles array
- Include totalCount: 0

### Geospatial Query Failure
- Return 500 Internal Server Error
- Log error details for debugging
- Provide fallback to non-geospatial query if possible

## Technology Stack

- **Backend Framework**: .NET 8+ with ASP.NET Core Web API
- **Language**: C#
- **ORM**: Entity Framework Core with spatial data support
- **Caching**: Redis for viewport and cluster caching
- **Database**: MySQL 8.0+ with spatial indexes
- **Clustering Library**: Custom implementation or NetTopologySuite

## Integration Points

### External Services
- Google Maps Distance Matrix API (optional, for accurate driving times)
- Geocoding service for address resolution

### Internal Services
- Vehicle availability service
- Location service (from F-SD-001)
- User service for authentication
- Analytics service for map interaction tracking

## Implementation Notes

### Geospatial Query Optimization
- Use MySQL spatial indexes (SPATIAL INDEX on coordinates)
- Implement bounding box queries before distance calculations
- Cache frequently queried viewports
- Use database connection pooling

### Clustering Strategy
- Implement server-side clustering for zoom levels 1-12
- Return individual vehicles for zoom levels 13-20
- Adjust cluster radius based on zoom level
- Use grid-based clustering for performance

### Security Considerations
- Validate all coordinate inputs
- Implement rate limiting to prevent abuse
- Sanitize vehicle data before returning
- Use HTTPS for all communications
- Implement CORS policies

### Monitoring
- Track map query response times
- Monitor cache hit rates
- Alert on high error rates
- Track most queried viewports for optimization

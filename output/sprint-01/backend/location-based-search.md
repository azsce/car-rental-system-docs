# Feature: Location-Based Search - Backend

## Overview

Backend services supporting location-based vehicle search with autocomplete, geolocation, hierarchical location management, one-way rental support, and landmark search capabilities.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-001: Location-Based Search
- F-WF-SRCH-001: Location-Based Vehicle Search
- F-FUNC-VS-001: Search by Location

## API Endpoints

### GET /api/locations/autocomplete

Search for locations with autocomplete suggestions.

**Query Parameters:**
- `query` (required): string - Search query text (minimum 3 characters)
- `locationType` (optional): string - Filter by location type (airport, neighborhood, delivery)
- `latitude` (optional): number - User's current latitude for distance calculation
- `longitude` (optional): number - User's current longitude for distance calculation
- `limit` (optional): number - Maximum suggestions to return (default: 10)

**Response:** 200 OK
```json
{
  "suggestions": [
    {
      "locationId": "LOC-12345",
      "displayText": "Los Angeles International Airport (LAX)",
      "address": "1 World Way, Los Angeles, CA 90045, USA",
      "locationType": "airport",
      "distance": 5.2,
      "isLandmark": true,
      "coordinates": {
        "latitude": 33.9416,
        "longitude": -118.4085
      },
      "availableVehicleCount": 45
    }
  ],
  "totalResults": 1
}
```

**Error Responses:**
- 400 Bad Request: Invalid query parameters
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server error

### GET /api/locations/{locationId}

Retrieve detailed information for a specific location.

**Path Parameters:**
- `locationId` (required): string - Unique location identifier

**Response:** 200 OK
```json
{
  "locationId": "LOC-12345",
  "name": "Los Angeles International Airport",
  "address": {
    "street": "1 World Way",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "postalCode": "90045",
    "coordinates": {
      "latitude": 33.9416,
      "longitude": -118.4085
    }
  },
  "locationType": "airport",
  "operatingHours": {
    "monday": { "open": "00:00", "close": "23:59" },
    "tuesday": { "open": "00:00", "close": "23:59" },
    "wednesday": { "open": "00:00", "close": "23:59" },
    "thursday": { "open": "00:00", "close": "23:59" },
    "friday": { "open": "00:00", "close": "23:59" },
    "saturday": { "open": "00:00", "close": "23:59" },
    "sunday": { "open": "00:00", "close": "23:59" }
  },
  "contactInfo": {
    "phone": "+1-310-555-0100",
    "email": "lax@rentalcompany.com"
  },
  "availableVehicleCount": 45,
  "isLandmark": true,
  "landmarkType": "airport",
  "photos": [
    "https://cdn.example.com/locations/lax-1.jpg",
    "https://cdn.example.com/locations/lax-2.jpg"
  ],
  "amenities": ["24/7 Service", "Free Shuttle", "Car Wash", "Fuel Station"]
}
```

**Error Responses:**
- 404 Not Found: Location not found
- 500 Internal Server Error: Server error

### POST /api/locations/geocode

Convert coordinates to address (reverse geocoding).

**Request Body:**
```json
{
  "latitude": 33.9416,
  "longitude": -118.4085
}
```

**Response:** 200 OK
```json
{
  "coordinates": {
    "latitude": 33.9416,
    "longitude": -118.4085
  },
  "address": {
    "formatted": "1 World Way, Los Angeles, CA 90045, USA",
    "street": "1 World Way",
    "city": "Los Angeles",
    "state": "CA",
    "country": "USA",
    "postalCode": "90045"
  },
  "nearbyLocations": [
    {
      "locationId": "LOC-12345",
      "name": "Los Angeles International Airport",
      "distance": 0.5,
      "availableVehicleCount": 45
    },
    {
      "locationId": "LOC-12346",
      "name": "LAX Area - Century Blvd",
      "distance": 1.2,
      "availableVehicleCount": 12
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid coordinates
- 500 Internal Server Error: Server error

### GET /api/locations/hierarchy

Retrieve hierarchical location structure for cascading selection.

**Query Parameters:**
- `level` (required): string - Hierarchy level (country, state, city, location)
- `parentId` (optional): string - Parent location ID for filtering

**Response:** 200 OK
```json
{
  "level": "city",
  "parentId": "STATE-CA",
  "locations": [
    {
      "id": "CITY-LA",
      "name": "Los Angeles",
      "childCount": 25,
      "availableVehicleCount": 150
    },
    {
      "id": "CITY-SF",
      "name": "San Francisco",
      "childCount": 18,
      "availableVehicleCount": 95
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid level or parentId
- 500 Internal Server Error: Server error

### POST /api/locations/validate

Validate location availability for specified dates.

**Request Body:**
```json
{
  "pickupLocationId": "LOC-12345",
  "dropoffLocationId": "LOC-12346",
  "pickupDateTime": "2026-03-15T10:00:00Z",
  "dropoffDateTime": "2026-03-20T10:00:00Z"
}
```

**Response:** 200 OK
```json
{
  "isValid": true,
  "pickupLocation": {
    "locationId": "LOC-12345",
    "name": "Los Angeles International Airport",
    "isAvailable": true,
    "operatingAtPickupTime": true
  },
  "dropoffLocation": {
    "locationId": "LOC-12346",
    "name": "San Francisco International Airport",
    "isAvailable": true,
    "operatingAtDropoffTime": true
  },
  "isOneWayRental": true,
  "oneWayFee": 75.00,
  "availableVehicleCount": 12
}
```

**Error Responses:**
- 400 Bad Request: Invalid request data
- 404 Not Found: Location not found
- 422 Unprocessable Entity: Location not available for specified dates
- 500 Internal Server Error: Server error

### GET /api/locations/landmarks

Search for landmarks and points of interest.

**Query Parameters:**
- `query` (required): string - Landmark search query
- `category` (optional): string - Landmark category (airport, hotel, attraction, etc.)
- `latitude` (optional): number - User's current latitude
- `longitude` (optional): number - User's current longitude

**Response:** 200 OK
```json
{
  "landmarks": [
    {
      "landmarkId": "LM-001",
      "name": "Los Angeles International Airport",
      "category": "airport",
      "coordinates": {
        "latitude": 33.9416,
        "longitude": -118.4085
      },
      "associatedLocations": [
        {
          "locationId": "LOC-12345",
          "name": "LAX Terminal Rental Center",
          "distance": 0.3
        }
      ]
    }
  ]
}
```

**Error Responses:**
- 400 Bad Request: Invalid query parameters
- 500 Internal Server Error: Server error

## Business Logic

### Location Search Algorithm
1. Parse and sanitize search query
2. Check cache for recent identical queries
3. Query database with full-text search on location names and addresses
4. If user coordinates provided, calculate distances using Haversine formula
5. Filter by location type if specified
6. Sort results by relevance score (combination of text match and distance)
7. Limit results to requested count
8. Enrich results with available vehicle counts
9. Cache results for 5 minutes
10. Return formatted suggestions

### Autocomplete Optimization
- Minimum 3 characters required to trigger search
- Implement query debouncing on client side (300ms)
- Use database full-text indexes for fast searching
- Cache popular searches in Redis with 1-hour TTL
- Implement rate limiting (100 requests per minute per user)

### Geolocation Processing
- Validate coordinate ranges (latitude: -90 to 90, longitude: -180 to 180)
- Use third-party geocoding service (Google Maps Geocoding API or similar)
- Cache geocoding results by coordinate grid (0.01 degree precision)
- Calculate distances to nearby locations using Haversine formula
- Return top 5 nearest locations within 50km radius

### One-Way Rental Fee Calculation
- Check if pickup and dropoff locations are in different regions
- Retrieve one-way fee configuration from database
- Calculate base one-way fee based on distance between locations
- Apply location-specific surcharges (e.g., airport fees)
- Apply seasonal adjustments if configured
- Return total one-way fee

### Hierarchical Location Management
- Maintain location hierarchy: Country → State/Province → City → Specific Location
- Support efficient querying at each hierarchy level
- Cache hierarchy structure in memory for fast access
- Update hierarchy cache when locations are added/modified

### Landmark Recognition
- Maintain database of known landmarks with aliases
- Use fuzzy matching for landmark name variations
- Map landmarks to one or more physical rental locations
- Support landmark categories (airports, hotels, attractions, stadiums, etc.)
- Prioritize landmarks in autocomplete results

## Authentication Requirements

### Public Endpoints
- GET /api/locations/autocomplete (rate-limited)
- GET /api/locations/{locationId} (rate-limited)
- POST /api/locations/geocode (rate-limited)
- GET /api/locations/landmarks (rate-limited)

### Authenticated Endpoints
- GET /api/locations/hierarchy (requires valid JWT token)
- POST /api/locations/validate (requires valid JWT token)

### Rate Limiting
- Anonymous users: 50 requests per minute per IP
- Authenticated users: 200 requests per minute per user
- Implement exponential backoff for repeated violations

## Data Validation

### Location Search Query
- Minimum length: 3 characters
- Maximum length: 200 characters
- Sanitize for SQL injection and XSS
- Trim whitespace

### Coordinates
- Latitude: -90 to 90 (decimal degrees)
- Longitude: -180 to 180 (decimal degrees)
- Precision: up to 6 decimal places

### Date/Time Validation
- Must be ISO 8601 format
- Pickup date/time must be in the future
- Dropoff date/time must be after pickup date/time
- Maximum rental period: 90 days

### Location ID Format
- Pattern: LOC-[0-9]{5}
- Example: LOC-12345

## Error Handling

### Invalid Query Parameters
- Return 400 Bad Request with detailed error message
- Include field-specific validation errors
- Provide example of correct format

### Location Not Found
- Return 404 Not Found
- Include suggestion for similar locations if available

### Service Unavailable
- Return 503 Service Unavailable when geocoding service is down
- Provide fallback to cached data if available
- Include retry-after header

### Rate Limit Exceeded
- Return 429 Too Many Requests
- Include rate limit headers (X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset)
- Provide clear message about rate limits

## Performance Considerations

### Database Optimization
- Create full-text indexes on location names and addresses
- Create geospatial indexes for coordinate-based queries
- Implement query result caching in Redis
- Use read replicas for search queries

### Caching Strategy
- Cache autocomplete results: 5 minutes TTL
- Cache location details: 1 hour TTL
- Cache geocoding results: 24 hours TTL
- Cache hierarchy structure: 1 hour TTL
- Invalidate cache on location updates

### Scalability
- Implement horizontal scaling for API servers
- Use CDN for static location photos
- Implement database connection pooling
- Use message queue for async geocoding operations

## Technology Stack

- **Backend Framework**: .NET 8+ with ASP.NET Core Web API
- **Language**: C#
- **ORM**: Entity Framework Core
- **Caching**: Redis
- **Geocoding Service**: Google Maps Geocoding API or Azure Maps
- **Database**: MySQL 8.0+ (see database documentation)
- **Authentication**: JWT tokens with .NET Identity

## Integration Points

### External Services
- Google Maps Geocoding API for reverse geocoding
- Google Maps Places API for landmark data
- Distance calculation using Haversine formula or external service

### Internal Services
- Vehicle availability service for vehicle counts
- Pricing service for one-way rental fees
- User service for authentication and rate limiting
- Analytics service for search pattern tracking

## Implementation Notes

### Security Considerations
- Sanitize all user inputs to prevent SQL injection
- Implement rate limiting to prevent abuse
- Validate coordinates to prevent invalid data
- Use HTTPS for all API communications
- Implement CORS policies for frontend access

### Monitoring and Logging
- Log all API requests with response times
- Monitor geocoding service availability and latency
- Track autocomplete query patterns for optimization
- Alert on high error rates or slow response times
- Monitor cache hit rates

### Testing Requirements
- Unit tests for business logic (location search, distance calculation, fee calculation)
- Integration tests for API endpoints
- Load tests for autocomplete under high traffic
- Test geocoding service fallback scenarios
- Test rate limiting enforcement

# Feature: Comprehensive Vehicle Details - Backend

## Overview

The backend implementation for Comprehensive Vehicle Details provides RESTful API endpoints to retrieve detailed vehicle information, availability calendars, reviews, pricing calculations, and supplier data. The backend handles data aggregation from multiple tables, pricing calculations with business rules, availability determination, and review management with proper authentication and authorization.

## Sprint Category

sprint-mvp

## Feature ID

F-SD-009

## Backend Architecture

### API Endpoints

**GET /api/vehicles/{vehicleId}**
- Retrieve comprehensive vehicle details including specifications, features, pricing, supplier info, and aggregate ratings
- Supports optional query parameters for pricing calculation (pickupDate, returnDate, currency)
- Returns complete vehicle object with all related data
- Implements caching for frequently accessed vehicles

**GET /api/vehicles/{vehicleId}/availability**
- Retrieve availability calendar for specified date range
- Queries bookings and maintenance schedules
- Applies buffer time rules between bookings
- Returns array of dates with availability status

**GET /api/vehicles/{vehicleId}/reviews**
- Retrieve paginated vehicle reviews with sorting and filtering
- Supports sorting by date, rating, or helpfulness
- Includes aggregate rating calculations
- Returns reviews with host responses if available

**GET /api/vehicles/{vehicleId}/pricing**
- Calculate detailed pricing for specific rental period
- Applies volume discounts, insurance costs, additional services
- Handles currency conversion if requested
- Returns itemized pricing breakdown

**GET /api/vehicles/{vehicleId}/images**
- Retrieve vehicle image gallery with metadata
- Supports responsive image sizing
- Returns images organized by category
- Includes CDN URLs for optimized delivery

**POST /api/vehicles/{vehicleId}/favorites**
- Add vehicle to authenticated user's favorites list
- Requires JWT authentication
- Creates favorite record with timestamp
- Returns success confirmation

**GET /api/suppliers/{supplierId}**
- Retrieve supplier/host information
- Includes rating, location, operating hours
- Returns contact information and response metrics
- Used for supplier card display

### Service Layer Components

**VehicleService**
- GetVehicleDetailsAsync(vehicleId, pickupDate, returnDate, currency)
- GetVehicleAvailabilityAsync(vehicleId, startDate, endDate)
- GetVehicleImagesAsync(vehicleId, size)
- AddToFavoritesAsync(userId, vehicleId)

**ReviewService**
- GetVehicleReviewsAsync(vehicleId, page, pageSize, sortBy, filterBy)
- CalculateAggregateRatingAsync(vehicleId)
- GetReviewDistributionAsync(vehicleId)

**PricingService**
- CalculatePricingAsync(vehicleId, pickupDate, returnDate, insuranceOptions, additionalServices, currency)
- ApplyVolumeDiscountsAsync(duration, baseRate)
- CalculateTaxesAndFeesAsync(subtotal, location)
- ConvertCurrencyAsync(amount, fromCurrency, toCurrency)

**AvailabilityService**
- CheckAvailabilityAsync(vehicleId, startDate, endDate)
- GetBookedDatesAsync(vehicleId, startDate, endDate)
- GetBlockedDatesAsync(vehicleId, startDate, endDate)
- ApplyBufferTimeAsync(bookings, bufferMinutes)

**SupplierService**
- GetSupplierDetailsAsync(supplierId)
- GetSupplierRatingAsync(supplierId)
- GetSupplierLocationsAsync(supplierId)

### Business Logic

**Pricing Calculation**
1. Calculate rental duration in hours/days
2. Determine applicable rate tier (hourly, daily, weekly, monthly)
3. Apply volume discount based on duration
4. Add insurance option costs if selected
5. Add additional service costs if selected
6. Calculate location-based taxes and fees
7. Apply promotional discounts if applicable
8. Convert to requested currency using current exchange rates
9. Return itemized breakdown with total

**Availability Determination**
1. Query bookings table for vehicle and date range
2. Query maintenance schedules for blocked dates
3. Identify all booked date ranges
4. Apply buffer time before and after each booking
5. Mark dates as available, booked, or blocked
6. Validate against minimum/maximum rental periods
7. Return availability calendar array

**Review Aggregation**
1. Query all reviews for vehicle
2. Calculate overall rating as average
3. Calculate category ratings (cleanliness, performance, value, accuracy)
4. Count reviews by star rating for distribution
5. Apply sorting criteria (date, rating, helpfulness)
6. Apply filtering if specified
7. Paginate results
8. Include host responses where available
9. Return paginated review list with aggregate data

**Environmental Score Calculation**
1. Retrieve vehicle CO2 emissions from specifications
2. Calculate fuel efficiency rating
3. Compare with category average
4. Determine eco-friendly badge eligibility
5. Calculate carbon offset cost if applicable
6. Return environmental data object

### Data Aggregation

**Vehicle Details Aggregation**
- Join Vehicles table with VehicleFeatures for features list
- Join with Suppliers table for supplier information
- Join with VehicleImages for image gallery
- Calculate aggregate rating from Reviews table
- Retrieve pricing from VehiclePricing table
- Combine all data into comprehensive vehicle object

**Performance Optimization**
- Use Entity Framework Core Include() for eager loading
- Implement Redis caching for vehicle details (TTL: 1 hour)
- Cache aggregate ratings (TTL: 15 minutes)
- Use database indexes for fast joins
- Implement query result caching for availability

### Authentication & Authorization

**Public Endpoints** (No authentication required)
- GET /api/vehicles/{vehicleId}
- GET /api/vehicles/{vehicleId}/availability
- GET /api/vehicles/{vehicleId}/reviews
- GET /api/vehicles/{vehicleId}/pricing
- GET /api/vehicles/{vehicleId}/images
- GET /api/suppliers/{supplierId}

**Authenticated Endpoints** (JWT required)
- POST /api/vehicles/{vehicleId}/favorites

**Authorization Rules**
- All vehicle viewing is public
- Favorites require authenticated user
- Review submission requires completed booking (handled in separate endpoint)
- No role-based restrictions for viewing

### Error Handling

**404 Not Found**
- Vehicle ID does not exist
- Supplier ID does not exist
- Return: `{ "error": "Vehicle not found", "vehicleId": "{id}" }`

**400 Bad Request**
- Invalid date format
- Return date before pickup date
- Invalid currency code
- Return: `{ "error": "Invalid request parameters", "details": "..." }`

**401 Unauthorized**
- Missing or invalid JWT token for favorites endpoint
- Return: `{ "error": "Authentication required" }`

**500 Internal Server Error**
- Database connection failure
- External service failure (currency conversion, image CDN)
- Return: `{ "error": "Internal server error", "requestId": "..." }`

**Retry Logic**
- Implement exponential backoff for external service calls
- Retry failed database queries up to 3 times
- Log all errors with request context

### Caching Strategy

**Vehicle Details Cache**
- Key: `vehicle:{vehicleId}`
- TTL: 1 hour
- Invalidate on vehicle update

**Aggregate Rating Cache**
- Key: `vehicle:{vehicleId}:rating`
- TTL: 15 minutes
- Invalidate on new review submission

**Availability Cache**
- Key: `vehicle:{vehicleId}:availability:{startDate}:{endDate}`
- TTL: 5 minutes
- Invalidate on new booking or cancellation

**Pricing Cache**
- Key: `vehicle:{vehicleId}:pricing:{pickupDate}:{returnDate}`
- TTL: 30 minutes
- Invalidate on pricing rule changes

### API Response Examples

**Vehicle Details Response**
```json
{
  "vehicleId": "VEH-12345",
  "make": "Toyota",
  "model": "Camry",
  "year": 2024,
  "licensePlate": "ABC-1234",
  "category": "Standard",
  "type": "Sedan",
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
      "description": "Rear-view camera for safe reversing"
    },
    {
      "category": "Technology",
      "name": "Apple CarPlay",
      "description": "Seamless iPhone integration"
    }
  ],
  "mileagePolicy": "Unlimited",
  "mileageLimit": null,
  "pricing": {
    "hourly": 12.50,
    "daily": 65.00,
    "weekly": 390.00,
    "biweekly": 720.00,
    "monthly": 1350.00,
    "currency": "USD"
  },
  "insuranceOptions": [
    {
      "type": "Theft Protection",
      "cost": 8.00,
      "coverage": "Covers theft of vehicle up to full value"
    },
    {
      "type": "Collision Damage Waiver",
      "cost": 15.00,
      "coverage": "Reduces liability for collision damage"
    },
    {
      "type": "Full Insurance",
      "cost": 25.00,
      "coverage": "Comprehensive coverage including theft and collision"
    }
  ],
  "additionalServices": [
    {
      "service": "GPS Navigation",
      "cost": 10.00,
      "description": "Portable GPS device with latest maps"
    },
    {
      "service": "Child Seat",
      "cost": 8.00,
      "description": "Age-appropriate child safety seat"
    }
  ],
  "supplier": {
    "supplierId": "SUP-789",
    "name": "Premium Rentals Inc.",
    "rating": 4.7,
    "location": "123 Main St, Los Angeles, CA",
    "responseTime": "Within 2 hours"
  },
  "environmental": {
    "co2Emissions": 95,
    "fuelEfficiency": 52,
    "ecoFriendly": true
  },
  "accessibility": [],
  "images": [
    "https://cdn.example.com/vehicles/VEH-12345/exterior-1.jpg",
    "https://cdn.example.com/vehicles/VEH-12345/interior-1.jpg"
  ],
  "aggregateRating": {
    "overall": 4.6,
    "reviewCount": 127,
    "distribution": {
      "5star": 85,
      "4star": 30,
      "3star": 8,
      "2star": 3,
      "1star": 1
    }
  }
}
```

**Availability Response**
```json
{
  "vehicleId": "VEH-12345",
  "availability": [
    {
      "date": "2026-03-01",
      "status": "available",
      "bufferTime": 0
    },
    {
      "date": "2026-03-02",
      "status": "booked",
      "bufferTime": 60
    },
    {
      "date": "2026-03-03",
      "status": "blocked",
      "bufferTime": 0
    }
  ]
}
```

**Reviews Response**
```json
{
  "vehicleId": "VEH-12345",
  "totalReviews": 127,
  "page": 1,
  "pageSize": 10,
  "reviews": [
    {
      "reviewId": "REV-456",
      "reviewer": {
        "name": "John D.",
        "avatar": "https://cdn.example.com/avatars/user-123.jpg"
      },
      "rating": {
        "overall": 5.0,
        "cleanliness": 5.0,
        "performance": 5.0,
        "value": 4.5,
        "accuracy": 5.0
      },
      "reviewText": "Excellent vehicle, very clean and well-maintained. Great fuel economy!",
      "photos": [
        "https://cdn.example.com/reviews/REV-456/photo-1.jpg"
      ],
      "verifiedBooking": true,
      "helpfulVotes": 23,
      "timestamp": "2026-02-15T14:30:00Z",
      "hostResponse": {
        "text": "Thank you for your kind review! We're glad you enjoyed the vehicle.",
        "timestamp": "2026-02-16T09:00:00Z"
      }
    }
  ]
}
```

## Technology Stack

- Backend Framework: .NET 8+ with C#
- Web API: ASP.NET Core Web API
- ORM: Entity Framework Core 8+
- Database: MySQL 8.0+ with InnoDB
- Caching: Redis 7+
- Authentication: JWT tokens with .NET Identity
- API Documentation: Swagger/OpenAPI

## Implementation Notes

**Database Query Optimization**
- Use compiled queries for frequently executed queries
- Implement query result caching
- Use AsNoTracking() for read-only queries
- Batch related data loading with Include()

**Scalability Considerations**
- Implement horizontal scaling with load balancer
- Use Redis for distributed caching
- Implement database read replicas for queries
- Use CDN for image delivery

**Monitoring and Logging**
- Log all API requests with response times
- Monitor cache hit rates
- Track slow queries (>100ms)
- Alert on error rate thresholds

**Security Considerations**
- Validate all input parameters
- Sanitize user-generated content (reviews)
- Implement rate limiting per IP
- Use HTTPS for all endpoints
- Protect against SQL injection with parameterized queries

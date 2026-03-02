# Feature: Date and Time Selection Workflow - Backend

## Overview

Backend services to support enhanced date/time selection workflow with quick date presets, business hours validation, duration-based cost estimation, and calendar month views. Extends MVP availability checking (F-SD-003) with workflow optimization features.

## Sprint Category

Project - Important but can wait until after MVP

## Feature ID

F-WF-SRCH-002

## Related Features

- **F-SD-003**: Date & Time Availability Search (MVP) - Base availability checking
- **F-WF-SRCH-001**: Location Selection (Sprint-01)

## Backend Specifications

### API Endpoints

**Quick Date Presets**
- **Endpoint**: `GET /api/config/quick-date-presets`
- **Query Parameters**: `locationId` (optional)
- **Purpose**: Retrieve configurable quick selection shortcuts
- **Authentication**: Public
- **Caching**: 1 hour TTL

**Business Hours**
- **Endpoint**: `GET /api/config/business-hours`
- **Query Parameters**: `locationId` (required)
- **Purpose**: Get location operating hours for time validation
- **Authentication**: Public
- **Caching**: 1 hour TTL

**Duration Cost Estimate**
- **Endpoint**: `POST /api/availability/duration-estimate`
- **Purpose**: Calculate estimated rental cost for duration
- **Authentication**: Public
- **Rate Limit**: 200 requests per minute per IP

**Calendar Month View**
- **Endpoint**: `GET /api/availability/calendar-view`
- **Query Parameters**: 
  - `locationId` (required)
  - `month` (required, YYYY-MM format)
  - `vehicleId` (optional)
  - `vehicleType` (optional)
- **Purpose**: Get availability status for entire month
- **Authentication**: Public
- **Caching**: 2 minutes TTL

### Request Schemas

**Duration Estimate Request:**
```json
{
  "pickupDateTime": "2026-03-15T10:00:00Z",
  "returnDateTime": "2026-03-18T10:00:00Z",
  "locationId": "string",
  "vehicleType": "string" (optional),
  "vehicleId": "string" (optional)
}
```

### Response Schemas

**Quick Date Presets Response:**
```json
{
  "presets": [
    {
      "id": "this-weekend",
      "key": "this-weekend",
      "label": "This Weekend",
      "pickupOffset": {
        "days": 0,
        "hours": 18
      },
      "returnOffset": {
        "days": 2,
        "hours": 18
      },
      "enabled": true,
      "displayOrder": 1
    },
    {
      "id": "next-week",
      "key": "next-week",
      "label": "Next Week",
      "pickupOffset": {
        "days": 7,
        "hours": 9
      },
      "returnOffset": {
        "days": 14,
        "hours": 9
      },
      "enabled": true,
      "displayOrder": 2
    }
  ],
  "locationId": "string" (if location-specific)
}
```

**Business Hours Response:**
```json
{
  "locationId": "string",
  "timezone": "America/Los_Angeles",
  "hours": [
    {
      "dayOfWeek": "Monday",
      "openTime": "08:00",
      "closeTime": "20:00",
      "isClosed": false
    },
    {
      "dayOfWeek": "Sunday",
      "openTime": null,
      "closeTime": null,
      "isClosed": true
    }
  ]
}
```

**Duration Estimate Response:**
```json
{
  "duration": {
    "days": 3,
    "hours": 72,
    "totalHours": 72
  },
  "estimatedCost": {
    "amount": 150.00,
    "currency": "USD",
    "breakdown": {
      "baseRate": 50.00,
      "dailyRate": 50.00,
      "days": 3,
      "subtotal": 150.00,
      "estimatedTax": 15.00,
      "estimatedTotal": 165.00
    }
  },
  "discounts": [
    {
      "type": "weekly",
      "description": "7+ day discount",
      "applicable": false
    }
  ],
  "note": "Final cost may vary based on vehicle selection and additional services"
}
```

**Calendar Month View Response:**
```json
{
  "month": "2026-03",
  "locationId": "string",
  "vehicleType": "string" (if filtered),
  "calendar": [
    {
      "date": "2026-03-01",
      "availableVehicles": 15,
      "totalVehicles": 20,
      "status": "available" | "limited" | "unavailable",
      "lowestPrice": 45.00
    },
    {
      "date": "2026-03-15",
      "availableVehicles": 0,
      "totalVehicles": 20,
      "status": "unavailable",
      "lowestPrice": null
    }
  ],
  "summary": {
    "totalDays": 31,
    "availableDays": 25,
    "limitedDays": 4,
    "unavailableDays": 2
  }
}
```

### Business Logic

**Quick Date Preset Calculation**
- Retrieve presets from database (location-specific or default)
- Calculate absolute dates from relative offsets
- Apply location timezone to dates
- Validate calculated dates against business hours
- Adjust for location-specific rules (holidays, events)
- Return sorted by display order

**Business Hours Validation**
- Retrieve business hours for location
- Check if pickup/return times fall within operating hours
- Handle closed days (return error or suggest alternative)
- Apply timezone conversions
- Provide alternative time suggestions if outside hours
- Support 24-hour locations (always open)

**Duration Cost Estimation**
- Calculate rental duration in days and hours
- Retrieve base pricing for vehicle type or specific vehicle
- Apply pricing model (hourly, daily, weekly, monthly)
- Calculate volume discounts for longer rentals
- Estimate taxes based on location
- Include estimated fees (if applicable)
- Cache pricing rules for performance
- Return breakdown for transparency

**Calendar Month View Generation**
- Query availability for all days in month
- Aggregate available vehicles per day
- Calculate lowest price per day
- Categorize days (available, limited, unavailable)
- Support filtering by vehicle type
- Cache results with short TTL (2 minutes)
- Optimize database queries with batch operations

**Pricing Model Logic**
- Hourly rate: For rentals < 24 hours
- Daily rate: For rentals 1-6 days
- Weekly rate: For rentals 7-29 days (discounted)
- Monthly rate: For rentals 30+ days (heavily discounted)
- Apply best rate automatically

### Authentication Requirements

**Public Endpoints**
- All endpoints are public (no authentication required)
- Rate limiting applied to prevent abuse
- IP-based throttling for cost estimation

**Rate Limiting**
- Quick date presets: 100 requests per minute per IP
- Business hours: 100 requests per minute per IP
- Duration estimate: 200 requests per minute per IP
- Calendar view: 50 requests per minute per IP

### Error Handling

**Validation Errors (400)**
- Invalid month format
- Invalid location ID
- Invalid date range
- Missing required parameters

**Not Found Errors (404)**
- Location not found
- No business hours configured
- No presets available

**Server Errors (500)**
- Database connection failure
- Pricing calculation error
- Timezone conversion error

### Performance Optimization

**Caching Strategy**
- Cache quick date presets (1 hour TTL)
- Cache business hours (1 hour TTL)
- Cache pricing rules (30 minutes TTL)
- Cache calendar views (2 minutes TTL)
- Use Redis for distributed caching
- Invalidate cache on configuration changes

**Database Optimization**
- Index on location_id for quick lookups
- Batch queries for calendar view
- Use read replicas for high-traffic queries
- Optimize date range queries with indexes

**Response Optimization**
- Compress responses with gzip
- Use ETags for conditional requests
- Implement pagination for large result sets
- Return minimal data for mobile clients

## Technology Stack

- Backend: .NET 8+ with C# and ASP.NET Core Web API
- Database: MySQL 8.0+ with InnoDB storage engine
- Caching: Redis for distributed caching
- Date/Time: NodaTime library for timezone handling
- API Documentation: Swagger/OpenAPI 3.0

## Implementation Notes

### Integration with MVP

This feature extends F-SD-003 (MVP) by adding:
- Quick date selection shortcuts
- Business hours validation
- Cost estimation
- Calendar month views

The MVP feature handles core availability checking, while this feature optimizes the workflow and provides additional user-facing features.

### Timezone Handling

- Store all times in UTC in database
- Convert to location timezone for display
- Use NodaTime for reliable timezone operations
- Handle DST transitions correctly
- Test edge cases (DST boundaries, leap years)

### Cost Estimation Accuracy

- Estimates are approximate (not binding)
- Final cost calculated during booking
- Include disclaimer in response
- Update estimates when pricing changes
- Log estimation errors for monitoring

### Testing Requirements

- Unit tests for preset calculation
- Unit tests for business hours validation
- Unit tests for cost estimation logic
- Integration tests for all endpoints
- Performance tests for calendar view
- Timezone handling tests
- Cache invalidation tests

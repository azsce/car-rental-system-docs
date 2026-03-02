# Feature: Location-Based Recommendations

## Overview

Provide personalized vehicle and location suggestions based on customer's current location, destination, and context. The system recommends nearby vehicles, closest pickup locations, popular destinations, and applies location-based promotions. Recommendations are ranked by distance and relevance, with context-aware suggestions for airports, tourist areas, and business districts.

## Sprint Category

sprint-01

## Feature ID

F-INT-MAP-009

## User Stories

As a customer, I want personalized vehicle and location suggestions based on my current location, so that I receive relevant and convenient options.

As a customer at an airport, I want vehicle recommendations suitable for airport pickup, so that I don't have to filter through inappropriate options.

As a tourist, I want suggestions for sightseeing-appropriate vehicles, so that I can choose the best vehicle for exploring the area.

## Frontend Specifications

### Pages

- Homepage with "Vehicles Near You" section
- Vehicle Search Page with Location-Based Recommendations
- Booking Page with Destination Suggestions
- User Profile with Recommendation Preferences

### UI Components

**Vehicles Near You Section**:
- Carousel of nearby vehicles
- Distance indicator for each vehicle
- Walking time estimate
- Price per day
- Quick book button
- "See all nearby" link
- Auto-updates based on location changes

**Recommended Locations Panel**:
- List of suggested pickup locations
- Distance from current location
- Vehicle availability count at each location
- Operating hours
- "Select Location" button
- Map preview on hover

**Popular Destinations Widget**:
- List of trending destinations from current area
- Destination name and category (airport, tourist, business)
- Distance and travel time
- Suggested vehicle types for destination
- "Search vehicles" button for destination

**Location-Based Promotion Banner**:
- Promotion title and discount amount
- Applicable area description
- Expiration date
- "Apply Discount" button
- Terms and conditions link

**Context-Aware Suggestions**:
- Dynamic section title based on context
  - Near airport: "Airport-Ready Vehicles"
  - Tourist area: "Perfect for Sightseeing"
  - Business district: "Business Travel Vehicles"
- Curated vehicle list matching context
- Explanation of why vehicles are recommended
- Filter by recommendation type

### User Flows

**Homepage Location-Based Recommendations**:
1. Customer opens homepage
2. System detects customer location (if permission granted)
3. System identifies nearby vehicles within 5km
4. Displays "Vehicles Near You" section
5. Shows top 5 nearest vehicles with distances
6. Customer scrolls through carousel
7. Customer clicks vehicle to view details
8. Customer can click "See all nearby" for full list

**Context-Aware Recommendations**:
1. Customer searches for vehicles
2. System detects customer is near airport (geofence)
3. System identifies context as "airport pickup"
4. Prioritizes vehicles suitable for airport (spacious, luggage capacity)
5. Displays "Airport-Ready Vehicles" section
6. Shows vehicles with trunk space, GPS, child seats available
7. Applies airport location promotion if available
8. Customer sees relevant, context-appropriate options

**Destination Suggestions**:
1. Customer enters pickup location
2. System analyzes popular destinations from that area
3. Displays "Popular Destinations" widget
4. Shows top 5 destinations (airports, tourist sites, business centers)
5. Customer clicks destination
6. System pre-fills destination in search
7. Recommends vehicle types suitable for destination
8. Customer proceeds with booking

**Location-Based Promotion Application**:
1. Customer in specific geographic area
2. System detects location matches active promotion geofence
3. Displays promotion banner at top of search results
4. Shows discount amount and applicable area
5. Customer clicks "Apply Discount"
6. Discount automatically applied to booking
7. Promotion code added to cart
8. Customer sees reduced price

### Data Requirements

**From Backend APIs**:
- GET /api/recommendations/nearby - Returns nearby vehicles
- GET /api/recommendations/locations - Returns recommended pickup locations
- GET /api/recommendations/destinations - Returns popular destinations
- GET /api/recommendations/context - Returns context-aware suggestions
- GET /api/promotions/location-based - Returns promotions for current location

**Recommendation Data Structure**:
```
{
  nearbyVehicles: [
    {
      id: string,
      name: string,
      type: string,
      latitude: number,
      longitude: number,
      distance: { value: number, text: string },
      walkingTime: { value: number, text: string },
      pricePerDay: number,
      thumbnailUrl: string,
      rating: number,
      recommendationReason: string
    }
  ],
  recommendedLocations: [
    {
      id: string,
      name: string,
      address: string,
      coordinates: { latitude, longitude },
      distance: { value: number, text: string },
      vehicleCount: number,
      operatingHours: string
    }
  ],
  popularDestinations: [
    {
      name: string,
      category: 'airport' | 'tourist' | 'business' | 'residential',
      coordinates: { latitude, longitude },
      distance: { value: number, text: string },
      suggestedVehicleTypes: [string]
    }
  ],
  context: {
    type: 'airport' | 'tourist' | 'business' | 'residential' | 'suburban',
    confidence: number,
    recommendations: [string]
  }
}
```

## Backend Specifications

### API Endpoints

**GET /api/recommendations/nearby**
- Purpose: Get vehicles near customer location
- Query Parameters: latitude, longitude, radius (default 5km), limit (default 10)
- Response: Array of nearby vehicles with distances
- Authentication: Optional (JWT for personalized results)
- Caching: 2 minutes

**GET /api/recommendations/locations**
- Purpose: Get recommended pickup locations near customer
- Query Parameters: latitude, longitude, limit (default 5)
- Response: Array of locations with vehicle counts
- Authentication: None required
- Caching: 5 minutes

**GET /api/recommendations/destinations**
- Purpose: Get popular destinations from customer location
- Query Parameters: latitude, longitude, limit (default 5)
- Response: Array of destinations with categories
- Authentication: None required
- Caching: 1 hour

**GET /api/recommendations/context**
- Purpose: Determine customer context and provide context-aware suggestions
- Query Parameters: latitude, longitude
- Response: { context, suggestedVehicles, promotions }
- Authentication: Optional (JWT for personalized results)
- Caching: 5 minutes

**GET /api/promotions/location-based**
- Purpose: Get active promotions for customer location
- Query Parameters: latitude, longitude
- Response: Array of applicable promotions
- Authentication: Optional
- Caching: 10 minutes

### Request Schemas

**Nearby Vehicles Request**:
- latitude: number (required, -90 to 90)
- longitude: number (required, -180 to 180)
- radius: number (optional, default 5, max 50 km)
- limit: number (optional, default 10, max 50)
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)

**Context Detection Request**:
- latitude: number (required)
- longitude: number (required)
- userId: string (optional, for personalization)

### Response Schemas

**Nearby Vehicles Response**:
- vehicles: Array of vehicle objects with distance and walking time
- totalCount: number
- searchRadius: number (km)
- centerPoint: { latitude, longitude }

**Context Response**:
- context: { type, confidence, description }
- suggestedVehicles: Array of vehicle IDs with recommendation reasons
- promotions: Array of applicable promotions
- tips: Array of helpful suggestions for the area

### Business Logic

**Proximity Ranking**:
- Calculate distance from user location to each vehicle
- Rank vehicles by distance (closest first)
- Apply secondary ranking by price (within same distance tier)
- Boost vehicles with high ratings
- Boost vehicles matching user preferences (if logged in)
- Limit to vehicles within 5km radius by default

**Context Detection Algorithm**:
- Check if user location is within airport geofence → airport context
- Check if user location is in tourist area (POI density) → tourist context
- Check if user location is in business district → business context
- Check time of day (business hours vs evening) → adjust context
- Use historical booking data to identify popular areas
- Confidence score based on multiple signals

**Context-Aware Vehicle Filtering**:
- Airport context: Prioritize vehicles with large trunk, GPS, child seats
- Tourist context: Prioritize convertibles, SUVs for sightseeing, vehicles with good fuel economy
- Business context: Prioritize sedans, luxury vehicles, vehicles with professional appearance
- Residential context: Prioritize economy vehicles, family-friendly options

**Location-Based Promotion Matching**:
- Check if user location is within promotion geofence
- Verify promotion is active and not expired
- Check promotion usage limits not exceeded
- Apply promotion automatically or show banner for user to apply
- Track promotion attribution by location

**Personalization**:
- Use booking history to identify preferred vehicle types
- Use saved preferences for vehicle features
- Use past pickup locations to suggest familiar locations
- Use search history to identify destination patterns
- Adjust recommendations based on user persona (power renter, eco-conscious, etc.)

### Authentication Requirements

- Nearby vehicles: No authentication required (public search)
- Personalized recommendations: JWT token required
- Context detection: No authentication required
- Location-based promotions: No authentication required
- Recommendation preferences: JWT token required

## Database Specifications

### Schema Changes

Add location-based promotions and recommendation tracking tables.

### Table Definitions

**LocationBasedPromotions Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- name: VARCHAR(200) NOT NULL
- description: TEXT
- discount_type: ENUM('percentage', 'fixed_amount') NOT NULL
- discount_value: DECIMAL(10, 2) NOT NULL
- geofence_id: INT NOT NULL - Links to Geofences table
- start_date: DATETIME NOT NULL
- end_date: DATETIME NOT NULL
- usage_limit: INT - Max number of uses
- usage_count: INT DEFAULT 0
- active: BOOLEAN DEFAULT TRUE
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

**RecommendationTracking Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- user_id: INT - NULL for anonymous users
- recommendation_type: ENUM('nearby', 'context', 'destination', 'promotion') NOT NULL
- vehicle_id: INT
- location_id: INT
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- context: VARCHAR(50) - airport, tourist, business, etc.
- clicked: BOOLEAN DEFAULT FALSE
- booked: BOOLEAN DEFAULT FALSE
- timestamp: DATETIME DEFAULT CURRENT_TIMESTAMP

### Relationships

- LocationBasedPromotions.geofence_id → Geofences.id (foreign key)
- RecommendationTracking.user_id → Users.id (foreign key, SET NULL on delete)
- RecommendationTracking.vehicle_id → Vehicles.id (foreign key, SET NULL on delete)
- RecommendationTracking.location_id → Locations.id (foreign key, SET NULL on delete)

### Indexes

- CREATE INDEX idx_location_promotions_geofence ON LocationBasedPromotions(geofence_id, active, start_date, end_date)
- CREATE INDEX idx_location_promotions_active ON LocationBasedPromotions(active, start_date, end_date)
- CREATE INDEX idx_recommendation_tracking_user ON RecommendationTracking(user_id, timestamp DESC)
- CREATE INDEX idx_recommendation_tracking_type ON RecommendationTracking(recommendation_type, clicked, booked)

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+ with spatial data support
- Frontend: Next.js 14+ with TypeScript, React 18+
- Mapping: Google Maps JavaScript API
- Geospatial: MySQL spatial functions (ST_Distance_Sphere)
- Machine Learning: Optional - recommendation engine for personalization

## Implementation Notes

- Calculate distances using MySQL ST_Distance_Sphere for efficiency
- Cache nearby vehicle queries for 2 minutes
- Implement context detection using geofences and POI data
- Use historical booking data to identify popular destinations
- Track recommendation click-through and conversion rates
- A/B test different recommendation algorithms
- Personalize recommendations for logged-in users
- Use collaborative filtering for "users like you" recommendations
- Implement location-based promotion geofences
- Automatically apply promotions when user in geofence
- Monitor promotion usage and ROI by location
- Provide analytics dashboard for recommendation performance
- Test recommendations in various geographic contexts
- Ensure recommendations work for both urban and rural areas
- Handle edge cases (no nearby vehicles, no context detected)
- Provide fallback to general recommendations if location unavailable
- Respect user privacy (don't store location without consent)
- Anonymize location data for analytics
- Consider using machine learning for improved context detection
- Implement recommendation explanation ("Recommended because...")
- Allow users to provide feedback on recommendation quality
- Use feedback to improve recommendation algorithm
- Test recommendation relevance with real users
- Monitor recommendation diversity (avoid showing same vehicles repeatedly)
- Implement recommendation refresh on location change
- Provide "Not interested" option to improve future recommendations

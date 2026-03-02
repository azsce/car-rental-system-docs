# Feature: Traffic Data Integration

## Overview

Integrate real-time traffic data to provide accurate travel time estimates, route recommendations, and pickup time predictions. The system displays traffic conditions on routes, adjusts travel time estimates based on current congestion, and suggests optimal pickup times to avoid traffic delays. Traffic integration improves customer experience and operational efficiency.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-018

## User Stories

As a customer, I want to see real-time traffic conditions on my route to pickup, so that I can plan my departure time accordingly.

As a customer booking a vehicle, I want traffic-aware travel time estimates, so that I know how long it will actually take to reach the vehicle.

As a fleet manager, I want traffic data for vehicle repositioning, so that I can optimize driver routes and minimize time spent in traffic.

## Frontend Specifications

### Pages

- Vehicle Details Page with Traffic-Aware Travel Time
- Directions Page with Traffic Overlay
- Booking Page with Optimal Pickup Time Suggestions

### UI Components

**Traffic Overlay**:
- Color-coded route segments (green: light, yellow: moderate, red: heavy, dark red: severe)
- Traffic legend
- Toggle traffic layer on/off
- Real-time traffic updates
- Incident markers (accidents, construction, road closures)

**Travel Time with Traffic**:
- Base travel time (no traffic)
- Current travel time (with traffic)
- Time difference indicator (+15 mins due to traffic)
- Traffic condition badge (light, moderate, heavy)
- Best time to leave suggestion
- Updates every 2 minutes

**Optimal Pickup Time Suggester**:
- Recommended departure time
- Expected traffic condition at that time
- Alternative time options
- Traffic forecast chart (next 4 hours)
- "Set reminder" button

### User Flows

**Viewing Traffic on Route**:
1. Customer views directions to vehicle
2. System displays route with traffic overlay
3. Route segments colored by traffic intensity
4. Travel time shows current estimate with traffic
5. System updates traffic every 2 minutes
6. Customer sees real-time traffic conditions
7. Customer can adjust departure time based on traffic

**Optimal Pickup Time Suggestion**:
1. Customer books vehicle for pickup in 2 hours
2. System analyzes traffic patterns
3. Identifies current traffic is heavy
4. Suggests leaving 30 minutes earlier to avoid traffic
5. Shows traffic forecast for next 4 hours
6. Customer adjusts pickup time
7. System recalculates with new time
8. Confirms improved travel time

### Data Requirements

**From Backend APIs**:
- GET /api/traffic/route - Returns traffic data for route
- GET /api/traffic/forecast - Returns traffic forecast
- GET /api/traffic/optimal-time - Suggests optimal departure time

## Backend Specifications

### API Endpoints

**GET /api/traffic/route**
- Purpose: Get traffic data for specific route
- Query Parameters: originLat, originLng, destLat, destLng, departureTime
- Response: { segments, incidents, travelTime, trafficCondition }
- Authentication: None required
- Caching: 2 minutes
- Rate Limiting: 100 requests per minute

**GET /api/traffic/forecast**
- Purpose: Get traffic forecast for route
- Query Parameters: originLat, originLng, destLat, destLng, forecastHours
- Response: Array of { time, travelTime, trafficCondition }
- Authentication: None required
- Caching: 10 minutes

**GET /api/traffic/optimal-time**
- Purpose: Suggest optimal departure time
- Query Parameters: originLat, originLng, destLat, destLng, arrivalTime
- Response: { optimalDepartureTime, travelTime, savings }
- Authentication: None required
- Caching: 10 minutes

### Request Schemas

**Traffic Route Request**:
- originLat, originLng: numbers (required)
- destLat, destLng: numbers (required)
- departureTime: string (ISO 8601, optional, default now)

**Traffic Forecast Request**:
- originLat, originLng: numbers (required)
- destLat, destLng: numbers (required)
- forecastHours: number (default 4, max 24)

### Response Schemas

**Traffic Route Response**:
- segments: Array of { start, end, trafficCondition, speedKmh }
- incidents: Array of { type, location, description, severity }
- travelTime: { value, text }
- trafficCondition: 'light' | 'moderate' | 'heavy' | 'severe'
- alternativeRoutes: Array with traffic data

**Traffic Forecast Response**:
- forecast: Array of { time, travelTime, trafficCondition, confidence }
- optimalTime: string (ISO 8601)
- worstTime: string (ISO 8601)

### Business Logic

**Traffic Data Integration**:
- Use Google Maps Traffic Layer API
- Update traffic data every 2 minutes
- Cache traffic data briefly (2 minutes)
- Provide traffic-aware travel time estimates
- Suggest alternative routes if traffic heavy

**Optimal Time Calculation**:
- Analyze traffic patterns for route
- Identify times with lightest traffic
- Calculate travel time for each time slot
- Recommend departure time with shortest travel time
- Consider customer's desired arrival time

### Authentication Requirements

- Traffic viewing: No authentication required
- Traffic forecasts: No authentication required

## Database Specifications

### Schema Changes

Add traffic data cache table.

### Table Definitions

**TrafficDataCache Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- route_hash: VARCHAR(64) UNIQUE NOT NULL
- traffic_condition: ENUM('light', 'moderate', 'heavy', 'severe')
- travel_time_seconds: INT
- segments: JSON
- incidents: JSON
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- expires_at: DATETIME

### Relationships

None required.

### Indexes

- CREATE INDEX idx_traffic_cache_route ON TrafficDataCache(route_hash)
- CREATE INDEX idx_traffic_cache_expires ON TrafficDataCache(expires_at)

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Traffic: Google Maps Traffic Layer API

## Implementation Notes

- Use Google Maps Traffic Layer for real-time traffic visualization
- Update traffic data every 2 minutes
- Cache traffic data briefly to reduce API calls
- Provide traffic-aware travel time estimates
- Suggest optimal departure times based on traffic patterns
- Display traffic incidents (accidents, construction)
- Test traffic integration in various cities and times
- Monitor traffic API usage and costs
- Implement fallback to historical traffic patterns if real-time unavailable

# Feature: Places and Points of Interest Integration

## Overview

Integrate Google Places API to display nearby points of interest, amenities, and landmarks around vehicle locations and pickup points. The system shows restaurants, gas stations, attractions, and other relevant POIs to help customers make informed decisions about vehicle selection and plan their trips. POI integration enhances the booking experience by providing contextual location information.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-019

## User Stories

As a customer, I want to see nearby amenities around vehicle locations, so that I can choose vehicles in convenient areas.

As a tourist, I want to see attractions near pickup locations, so that I can plan my sightseeing efficiently.

As a customer, I want to know about gas stations and charging stations near my route, so that I can plan refueling stops.

## Frontend Specifications

### Pages

- Vehicle Details Page with Nearby POIs
- Location Details Page with Amenities
- Route Planning Page with POI Markers

### UI Components

**Nearby POIs Panel**:
- List of nearby places with categories
- Distance from vehicle/location
- Rating and review count
- Opening hours
- "View on map" button
- Filter by category (restaurants, gas stations, attractions)

**POI Map Markers**:
- Category-specific icons (restaurant, gas, parking, attraction)
- Click to show POI details
- Distance indicator
- Rating badge

**POI Details Card**:
- Place name and category
- Rating and review count
- Address and distance
- Opening hours
- Phone number
- Website link
- "Get directions" button
- Photos (if available)

### User Flows

**Viewing Nearby Amenities**:
1. Customer views vehicle details
2. Scrolls to "Nearby Amenities" section
3. Sees list of restaurants, gas stations, attractions
4. Clicks "View on map"
5. Map displays vehicle and POI markers
6. Customer clicks POI marker
7. POI details popup appears
8. Customer can get directions to POI

### Data Requirements

**From Backend APIs**:
- GET /api/places/nearby - Returns POIs near coordinates
- GET /api/places/details - Returns detailed place information

## Backend Specifications

### API Endpoints

**GET /api/places/nearby**
- Purpose: Get nearby points of interest
- Query Parameters: latitude, longitude, radius, type, limit
- Response: Array of places with details
- Authentication: None required
- Caching: 1 hour

**GET /api/places/details**
- Purpose: Get detailed information about specific place
- Query Parameters: placeId
- Response: Place details with photos, reviews, hours
- Authentication: None required
- Caching: 24 hours

### Request Schemas

**Nearby Places Request**:
- latitude, longitude: numbers (required)
- radius: number (meters, default 1000, max 5000)
- type: string (optional, restaurant, gas_station, etc.)
- limit: number (default 10, max 20)

### Response Schemas

**Nearby Places Response**:
- places: Array with { placeId, name, type, coordinates, distance, rating, openNow }

### Business Logic

**POI Filtering**:
- Show relevant POIs based on context
- Near vehicles: restaurants, gas stations, parking
- Near airports: hotels, car rental offices
- Tourist areas: attractions, restaurants, shopping

**POI Ranking**:
- Rank by distance (closest first)
- Boost highly rated places
- Boost currently open places
- Filter out permanently closed places

### Authentication Requirements

- POI viewing: No authentication required

## Database Specifications

### Schema Changes

Add POI cache table.

### Table Definitions

**POICache Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- place_id: VARCHAR(200) UNIQUE NOT NULL
- name: VARCHAR(200)
- type: VARCHAR(50)
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- rating: DECIMAL(2, 1)
- details: JSON
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- expires_at: DATETIME

### Relationships

None required.

### Indexes

- CREATE INDEX idx_poi_cache_place ON POICache(place_id)
- CREATE INDEX idx_poi_cache_location ON POICache(latitude, longitude)
- CREATE INDEX idx_poi_cache_expires ON POICache(expires_at)

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Places: Google Places API

## Implementation Notes

- Use Google Places API for POI data
- Cache place details for 24 hours
- Show relevant POIs based on context
- Display POI markers on map with custom icons
- Provide POI filtering by category
- Test POI integration in various locations
- Monitor Places API usage and costs
- Implement rate limiting for POI requests

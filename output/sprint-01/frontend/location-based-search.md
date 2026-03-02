# Feature: Location-Based Search

## Overview

Location-Based Search enables customers to find available vehicles by specifying pickup and drop-off locations with flexible selection options. This feature supports hierarchical location selection, one-way rentals, current location detection, address autocomplete, landmark search, and multiple location types (airport, neighborhood, delivery to address).

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-001: Location-Based Search
- F-WF-SRCH-001: Location-Based Vehicle Search  
- F-FUNC-VS-001: Search by Location

## User Stories

### US-1: Basic Location Search
As an individual customer, I want to search for vehicles by specifying pickup and drop-off locations, so that I can find vehicles available at my desired location.

### US-2: One-Way Rental Support
As a traveler, I want to specify different pickup and return locations, so that I can rent a vehicle for one-way trips without returning to the starting point.

### US-3: Current Location Detection
As a mobile user, I want the system to detect my current location automatically, so that I can quickly find nearby vehicles without manual address entry.

### US-4: Address Autocomplete
As a customer, I want address suggestions as I type, so that I can quickly and accurately select my desired location.

### US-5: Landmark Search
As a tourist, I want to search by landmarks or points of interest, so that I can find vehicles near recognizable locations without knowing exact addresses.

## Frontend Specifications

### Pages

#### Vehicle Search Page (`/search`)
Main search interface where users specify location criteria and view available vehicles.

#### Location Selection Modal
Modal or dedicated page for detailed location selection with map integration.

### UI Components

#### LocationSearchInput Component
- Autocomplete text input field with dropdown suggestions
- Current location detection button with geolocation icon
- Clear input button
- Loading indicator during autocomplete fetch
- Error state display for invalid locations
- Support for both pickup and drop-off location inputs

**Props:**
- `value`: string - Current input value
- `onChange`: function - Callback when value changes
- `onSelect`: function - Callback when location is selected
- `placeholder`: string - Input placeholder text
- `enableCurrentLocation`: boolean - Show current location button
- `locationType`: enum - 'pickup' | 'dropoff'

#### LocationTypeSelector Component
- Radio buttons or tabs for location type selection
- Options: Airport, Neighborhood, Delivery to Address
- Visual icons for each location type
- Description text explaining each option

#### HierarchicalLocationPicker Component
- Multi-level dropdown or cascading selection
- Levels: Country → City → Specific Location/Parking Spot
- Breadcrumb navigation showing selected hierarchy
- Back button to navigate up hierarchy levels

#### MapLocationPicker Component
- Interactive map displaying available pickup locations
- Location markers with vehicle availability count
- Zoom and pan controls
- Current location indicator
- Distance display from current location to each marker
- Tap marker to select location

#### OneWayRentalToggle Component
- Toggle switch or checkbox
- Label: "Return to different location"
- Conditional display of separate return location input
- Visual indicator when one-way rental is enabled

#### LocationDetailsCard Component
- Display selected location information
- Address, operating hours, contact information
- Walking distance or driving time from current location
- Available vehicle count at location
- Location photos or thumbnail
- "Change Location" button

### User Flows

#### Flow 1: Basic Location Search
1. User lands on search page
2. User clicks pickup location input
3. User begins typing address
4. System displays autocomplete suggestions
5. User selects location from suggestions
6. System validates location has available vehicles
7. User repeats for drop-off location (or same as pickup)
8. User proceeds to date/time selection

#### Flow 2: Current Location Detection
1. User clicks "Use Current Location" button
2. System requests geolocation permission
3. User grants permission
4. System detects coordinates
5. System reverse geocodes to address
6. System auto-fills pickup location input
7. System displays nearby locations on map
8. User confirms or adjusts location

#### Flow 3: One-Way Rental
1. User enables "Return to different location" toggle
2. System displays separate return location input
3. User selects pickup location
4. User selects different return location
5. System calculates one-way rental fee
6. System displays fee in search results
7. User proceeds with search

#### Flow 4: Landmark Search
1. User types landmark name (e.g., "LAX Airport")
2. System recognizes landmark in autocomplete
3. System displays landmark with icon/badge
4. User selects landmark
5. System maps landmark to specific pickup locations
6. System displays available locations near landmark
7. User selects specific location or uses landmark as general area

### Data Requirements

#### Location Data from Backend
```
{
  "locationId": "string",
  "name": "string",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string",
    "coordinates": {
      "latitude": "number",
      "longitude": "number"
    }
  },
  "locationType": "airport" | "neighborhood" | "delivery",
  "operatingHours": {
    "monday": { "open": "string", "close": "string" },
    "tuesday": { "open": "string", "close": "string" },
    // ... other days
  },
  "contactInfo": {
    "phone": "string",
    "email": "string"
  },
  "availableVehicleCount": "number",
  "isLandmark": "boolean",
  "landmarkType": "string" | null,
  "photos": ["string"],
  "amenities": ["string"]
}
```

#### Autocomplete Suggestions from Backend
```
{
  "suggestions": [
    {
      "locationId": "string",
      "displayText": "string",
      "address": "string",
      "locationType": "string",
      "distance": "number" | null,
      "isLandmark": "boolean"
    }
  ]
}
```

#### Current Location Geocoding Response
```
{
  "coordinates": {
    "latitude": "number",
    "longitude": "number"
  },
  "address": {
    "formatted": "string",
    "street": "string",
    "city": "string",
    "state": "string",
    "country": "string",
    "postalCode": "string"
  },
  "nearbyLocations": [
    {
      "locationId": "string",
      "name": "string",
      "distance": "number"
    }
  ]
}
```

## Technology Stack

- **Frontend Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API or Zustand
- **Map Integration**: Google Maps API or Mapbox
- **Geolocation**: Browser Geolocation API
- **HTTP Client**: Axios or Fetch API

## Implementation Notes

### Accessibility Considerations
- Ensure autocomplete dropdown is keyboard navigable
- Provide ARIA labels for all location inputs
- Support screen reader announcements for location selection
- Ensure sufficient color contrast for location type indicators
- Provide text alternatives for map-based selection

### Performance Optimization
- Implement debouncing (300ms) for autocomplete requests
- Cache frequently searched locations in localStorage
- Lazy load map component only when needed
- Optimize autocomplete query with minimum character threshold (3 characters)
- Use virtual scrolling for long autocomplete suggestion lists

### Mobile Considerations
- Optimize touch targets for mobile (minimum 44x44px)
- Use native mobile geolocation for better accuracy
- Provide mobile-optimized map interface
- Support swipe gestures for map navigation
- Ensure autocomplete dropdown doesn't obscure keyboard

### Error Handling
- Display clear error messages for geolocation permission denial
- Handle network failures gracefully with retry options
- Validate location has available vehicles before proceeding
- Provide fallback when map service is unavailable
- Show helpful suggestions when no locations match search

### Integration Points
- Google Maps API or Mapbox for map display and geocoding
- Backend location search API for autocomplete
- Backend location validation API
- Backend vehicle availability check API
- Analytics tracking for location search patterns

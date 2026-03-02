# Feature: Map-Based Vehicle Discovery

## Overview

Map-Based Vehicle Discovery provides an interactive map interface displaying available vehicles as markers relative to the user's location or destination. This feature is essential for peer-to-peer and car-sharing models, enabling visual, intuitive vehicle discovery especially valuable for urban users.

## Sprint Category

nice-to-have (Would be great but not essential)

## Feature ID

F-SD-002: Map-Based Vehicle Discovery

## Dependencies

- F-SD-001: Location-Based Search
- R-VS-001: Location-Based Search Requirement

## User Stories

### US-1: Visual Vehicle Discovery
As an urban customer, I want to view available vehicles on an interactive map, so that I can visually identify vehicles near my location or destination.

### US-2: Distance-Based Selection
As a customer, I want to see walking distance estimates to each vehicle, so that I can choose vehicles that are conveniently located.

### US-3: Map Navigation
As a user, I want to zoom and pan the map, so that I can explore vehicles in different areas.

### US-4: Vehicle Clustering
As a user in a dense urban area, I want vehicle markers to cluster when zoomed out, so that the map remains readable and not cluttered.

### US-5: Quick Vehicle Information
As a customer, I want to tap a vehicle marker to see quick info, so that I can evaluate vehicles without leaving the map view.

## Frontend Specifications

### Pages

#### Map View Page (`/search/map`)
Dedicated map view for vehicle discovery with full-screen map interface.

#### Integrated Map Component
Map component embedded within main search results page with toggle between list and map views.

### UI Components

#### InteractiveMapView Component
- Full-screen or embedded map display
- Vehicle markers with custom icons based on vehicle type
- User location marker (blue dot)
- Destination marker (if specified)
- Zoom controls (+/- buttons)
- Pan gesture support
- Recenter button to return to user location
- Map/List view toggle button

**Props:**
- `vehicles`: array - List of vehicles to display
- `userLocation`: object - User's current coordinates
- `destination`: object - Optional destination coordinates
- `onVehicleSelect`: function - Callback when vehicle marker is tapped
- `mapStyle`: string - Map visual style (standard, satellite, terrain)
- `initialZoom`: number - Initial zoom level

#### VehicleMarker Component
- Custom marker icon based on vehicle type (car, SUV, van, etc.)
- Vehicle availability indicator (available, reserved, unavailable)
- Price badge overlay
- Pulse animation for newly available vehicles
- Cluster count badge when multiple vehicles grouped

**Props:**
- `vehicle`: object - Vehicle data
- `position`: object - Latitude/longitude coordinates
- `isSelected`: boolean - Whether marker is currently selected
- `onClick`: function - Callback when marker is clicked

#### VehicleCluster Component
- Circular cluster marker showing vehicle count
- Color-coded by vehicle density
- Expand on click to show individual vehicles
- Smooth zoom animation when expanding

**Props:**
- `vehicles`: array - Vehicles in cluster
- `position`: object - Cluster center coordinates
- `count`: number - Number of vehicles in cluster
- `onClick`: function - Callback when cluster is clicked

#### VehicleQuickInfoPopup Component
- Popup/tooltip appearing above selected marker
- Vehicle photo thumbnail
- Vehicle make/model
- Price per day
- Walking distance from user location
- Availability status
- "View Details" button
- "Navigate" button

**Props:**
- `vehicle`: object - Vehicle data
- `distance`: number - Distance from user in km/miles
- `onViewDetails`: function - Callback for view details action
- `onNavigate`: function - Callback for navigation action
- `onClose`: function - Callback to close popup

#### MapFilterPanel Component
- Floating panel with filter controls
- Vehicle type filter chips
- Price range slider
- Distance radius slider
- "Apply Filters" button
- Active filter count badge

**Props:**
- `filters`: object - Current filter state
- `onFilterChange`: function - Callback when filters change
- `vehicleCount`: number - Number of vehicles matching filters

#### DistanceIndicator Component
- Walking distance estimate display
- Time estimate (e.g., "5 min walk")
- Distance in km/miles
- Walking icon
- Color-coded by distance (green: close, yellow: moderate, red: far)

**Props:**
- `distance`: number - Distance in meters
- `unit`: string - 'metric' | 'imperial'

### User Flows

#### Flow 1: Map-Based Vehicle Search
1. User navigates to search page
2. User toggles to map view
3. System displays map with user's current location
4. System loads and displays vehicle markers in viewport
5. User pans/zooms to explore different areas
6. System dynamically loads vehicles as map moves
7. User taps vehicle marker
8. System displays quick info popup
9. User taps "View Details" to see full vehicle information

#### Flow 2: Cluster Expansion
1. User views map with clustered vehicles
2. User taps cluster marker
3. System zooms in and expands cluster
4. System displays individual vehicle markers
5. User selects specific vehicle

#### Flow 3: Distance-Based Selection
1. User views map with multiple vehicles
2. System displays walking distance for each vehicle
3. User identifies closest vehicles by distance indicators
4. User selects vehicle with acceptable distance
5. User taps "Navigate" to get directions

#### Flow 4: Filter Vehicles on Map
1. User opens map filter panel
2. User adjusts filters (vehicle type, price, distance)
3. System updates map markers in real-time
4. System shows filtered vehicle count
5. User applies filters
6. System displays only matching vehicles on map

### Data Requirements

#### Vehicle Location Data from Backend
```
{
  "vehicles": [
    {
      "vehicleId": "string",
      "make": "string",
      "model": "string",
      "year": "number",
      "vehicleType": "string",
      "pricePerDay": "number",
      "location": {
        "latitude": "number",
        "longitude": "number",
        "address": "string"
      },
      "availability": "available" | "reserved" | "unavailable",
      "photoUrl": "string",
      "distanceFromUser": "number"
    }
  ],
  "totalCount": "number"
}
```

#### Map Bounds Query
```
{
  "northEast": {
    "latitude": "number",
    "longitude": "number"
  },
  "southWest": {
    "latitude": "number",
    "longitude": "number"
  },
  "filters": {
    "vehicleTypes": ["string"],
    "priceRange": {
      "min": "number",
      "max": "number"
    },
    "maxDistance": "number"
  }
}
```

## Technology Stack

- **Frontend Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript
- **Map Library**: Google Maps JavaScript API or Mapbox GL JS
- **Clustering**: Supercluster or map library's built-in clustering
- **Styling**: Tailwind CSS
- **State Management**: React Context API or Zustand

## Implementation Notes

### Map Performance Optimization
- Implement viewport-based loading (only load vehicles in visible area)
- Use marker clustering for dense areas (threshold: 10+ vehicles in 50px radius)
- Debounce map move events (500ms) before fetching new vehicles
- Cache vehicle data for recently viewed map areas
- Use marker pooling to reuse marker instances
- Implement progressive loading for large vehicle datasets

### Mobile Considerations
- Optimize touch targets for mobile (minimum 44x44px for markers)
- Implement pinch-to-zoom gesture support
- Use mobile-optimized map controls
- Reduce marker detail at lower zoom levels
- Implement lazy loading for vehicle photos in popups
- Support offline map tiles for poor connectivity

### Accessibility
- Provide keyboard navigation for map controls
- Ensure screen reader support for vehicle markers
- Provide text-based alternative to map view (list view)
- Use ARIA labels for all interactive map elements
- Ensure sufficient color contrast for markers and labels

### Integration Points
- Google Maps API or Mapbox for map rendering
- Backend vehicle search API with geospatial queries
- Distance calculation service
- Navigation service for "Navigate" functionality
- Analytics tracking for map interactions

### Error Handling
- Handle map loading failures gracefully
- Provide fallback to list view if map unavailable
- Display error message for geolocation permission denial
- Handle network failures with retry mechanism
- Show placeholder when no vehicles in viewport

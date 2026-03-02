# Feature: Indoor Positioning

## Overview

Navigate customers to specific parking locations within large facilities using indoor positioning systems and floor plans. The system displays indoor maps with parking bay locations, provides turn-by-turn navigation from entrance to vehicle, and routes through elevators and stairways. This feature is especially valuable for airport locations and large multi-level parking garages where finding vehicles can be challenging.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-007

## User Stories

As a customer picking up from a large parking facility, I want indoor navigation to my specific parking bay, so that I can find my vehicle quickly without frustration.

As a customer at an airport rental location, I want to see exactly where my vehicle is parked, so that I don't waste time searching in a massive parking structure.

As a location manager, I want to assign specific parking bays to vehicles, so that customers can find their vehicles efficiently.

## Frontend Specifications

### Pages

- Booking Confirmation Page with Parking Location
- Indoor Navigation Page (mobile-optimized)
- Vehicle Pickup Instructions with Indoor Map

### UI Components

**Indoor Map Viewer**:
- Floor plan display for parking facility
- Floor selector (Level 1, Level 2, Level 3, etc.)
- Vehicle location marker with bay number
- User location indicator (blue dot)
- Zoom and pan controls
- Rotate map to match user orientation
- "You are here" label

**Indoor Navigation Panel**:
- Turn-by-turn text directions
- Current step highlighted
- Distance to next turn
- Total distance and estimated walking time
- Floor change indicators (elevator, stairs)
- "Start Navigation" button
- "Recalculate" button if user goes off route

**Parking Bay Information Card**:
- Bay number (e.g., "Bay 402")
- Floor level (e.g., "Level 3")
- Section/Zone (e.g., "Section B")
- Walking distance from entrance
- Estimated walking time
- Elevator/stairs recommendation
- Vehicle details (make, model, color, license plate)

**Indoor Positioning Status**:
- Accuracy indicator (high, medium, low)
- "Positioning active" status
- Battery usage warning (indoor positioning uses more power)
- "Switch to outdoor map" button when exiting facility

### User Flows

**Indoor Navigation to Vehicle**:
1. Customer arrives at parking facility entrance
2. Opens booking confirmation or mobile app
3. Clicks "Navigate to Vehicle" button
4. System detects customer is at facility (GPS + geofence)
5. Switches to indoor positioning mode
6. Displays indoor map with floor plan
7. Shows vehicle location (Bay 402, Level 3)
8. Calculates route from entrance to bay
9. Displays turn-by-turn directions
10. Updates customer position as they walk
11. Provides directions to elevator/stairs
12. Updates floor when customer changes levels
13. Guides to specific parking bay
14. Displays "You've arrived" when within 5 meters
15. Shows vehicle details for final confirmation

**Parking Bay Assignment** (location manager):
1. Location manager assigns vehicle to parking bay
2. System records bay number, floor, and section
3. System updates vehicle location in database
4. Customer receives notification with parking location
5. Indoor map link included in notification
6. Customer can access indoor navigation anytime

**Fallback to Text Directions**:
1. Indoor positioning unavailable or inaccurate
2. System detects positioning failure
3. Switches to text-based directions
4. Displays: "Level 3, Section B, Bay 402"
5. Provides general directions (e.g., "Take elevator to Level 3, turn right")
6. Shows facility map image (static) if available
7. Customer follows text directions to vehicle

### Data Requirements

**From Backend APIs**:
- GET /api/facilities/:id/map - Returns indoor map data and floor plans
- GET /api/vehicles/:id/parking-location - Returns parking bay assignment
- POST /api/indoor-positioning/navigate - Calculate indoor route
- WebSocket /api/indoor-positioning/track - Real-time position updates

**Indoor Map Data Structure**:
```
{
  facilityId: string,
  name: string,
  floors: [
    {
      level: number,
      name: string, // "Level 3", "Ground Floor"
      floorPlanUrl: string, // Image URL
      sections: [
        {
          id: string,
          name: string, // "Section B"
          bays: [
            {
              bayNumber: string,
              coordinates: { x, y }, // Pixel coordinates on floor plan
              occupied: boolean,
              vehicleId: string
            }
          ]
        }
      ],
      entrances: [{ name, coordinates }],
      elevators: [{ name, coordinates }],
      stairs: [{ name, coordinates }]
    }
  ]
}
```

## Backend Specifications

### API Endpoints

**GET /api/facilities/:id/map**
- Purpose: Retrieve indoor map data for parking facility
- Response: Indoor map structure with floor plans and bay locations
- Authentication: None required (public facility information)
- Caching: 1 hour

**GET /api/vehicles/:id/parking-location**
- Purpose: Get parking bay assignment for vehicle
- Response: { facilityId, floor, section, bayNumber, coordinates }
- Authentication: JWT token required (booking owner or fleet manager)
- Caching: 5 minutes

**POST /api/indoor-positioning/navigate**
- Purpose: Calculate indoor route from entrance to parking bay
- Request Body: { facilityId, startCoordinates, endCoordinates, accessibilityMode }
- Response: { steps, distance, estimatedTime, floorChanges }
- Authentication: None required
- Caching: 10 minutes per route

**PUT /api/vehicles/:id/parking-location**
- Purpose: Assign vehicle to parking bay
- Request Body: { facilityId, floor, section, bayNumber }
- Response: Updated parking location
- Authentication: JWT token required (location manager or admin role)

### Request Schemas

**Navigation Request**:
- facilityId: string (required)
- startCoordinates: { floor, x, y } (required)
- endCoordinates: { floor, x, y } (required)
- accessibilityMode: boolean (optional, prefer elevators over stairs)

**Parking Assignment Request**:
- facilityId: string (required)
- floor: number (required)
- section: string (required)
- bayNumber: string (required)

### Response Schemas

**Navigation Response**:
- steps: Array of { instruction, distance, floor, coordinates }
- totalDistance: number (meters)
- estimatedTime: number (seconds)
- floorChanges: Array of { fromFloor, toFloor, method: 'elevator' | 'stairs' }

**Parking Location Response**:
- facilityId: string
- facilityName: string
- floor: number
- floorName: string
- section: string
- bayNumber: string
- coordinates: { x, y } (pixel coordinates on floor plan)
- entranceDistance: number (meters from main entrance)
- estimatedWalkingTime: number (seconds)

### Business Logic

**Indoor Positioning Technology**:
- Use WiFi triangulation for indoor positioning
- Use Bluetooth beacons (BLE) for precise location
- Fall back to manual floor selection if positioning unavailable
- Combine multiple signals for improved accuracy
- Update position every 2-3 seconds during navigation

**Route Calculation**:
- Calculate shortest path from entrance to parking bay
- Consider accessibility requirements (elevator vs stairs)
- Avoid restricted areas (staff only, maintenance)
- Provide alternative routes if primary route blocked
- Update route if user deviates significantly

**Parking Bay Management**:
- Track bay occupancy in real-time
- Assign bays based on vehicle size and type
- Reserve bays for accessible vehicles near elevators
- Optimize bay assignments to minimize customer walking distance
- Handle bay reassignments when necessary

### Authentication Requirements

- Indoor map viewing: No authentication required
- Parking location for booked vehicle: JWT token required (booking owner)
- Parking bay assignment: JWT token required (location manager or admin role)
- Indoor navigation: No authentication required

## Database Specifications

### Schema Changes

Add parking facilities and bay assignments tables.

### Table Definitions

**ParkingFacilities Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- location_id: INT NOT NULL - Links to Locations table
- name: VARCHAR(200) NOT NULL
- total_floors: INT NOT NULL
- total_bays: INT NOT NULL
- indoor_positioning_enabled: BOOLEAN DEFAULT FALSE
- positioning_technology: ENUM('wifi', 'ble', 'manual') DEFAULT 'manual'
- floor_plans: JSON - Array of floor plan image URLs
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**ParkingBays Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- facility_id: INT NOT NULL
- bay_number: VARCHAR(20) NOT NULL
- floor: INT NOT NULL
- section: VARCHAR(10)
- x_coordinate: INT - Pixel X on floor plan
- y_coordinate: INT - Pixel Y on floor plan
- bay_type: ENUM('standard', 'accessible', 'ev_charging', 'oversized') DEFAULT 'standard'
- occupied: BOOLEAN DEFAULT FALSE
- current_vehicle_id: INT - Currently parked vehicle
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

**VehicleParkingAssignments Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- vehicle_id: INT NOT NULL
- booking_id: INT NOT NULL
- facility_id: INT NOT NULL
- bay_id: INT NOT NULL
- assigned_at: DATETIME DEFAULT CURRENT_TIMESTAMP
- released_at: DATETIME
- assigned_by: INT - User ID of location manager

### Relationships

- ParkingFacilities.location_id → Locations.id (foreign key)
- ParkingBays.facility_id → ParkingFacilities.id (foreign key, CASCADE on delete)
- ParkingBays.current_vehicle_id → Vehicles.id (foreign key, SET NULL on delete)
- VehicleParkingAssignments.vehicle_id → Vehicles.id (foreign key)
- VehicleParkingAssignments.booking_id → Bookings.id (foreign key)
- VehicleParkingAssignments.facility_id → ParkingFacilities.id (foreign key)
- VehicleParkingAssignments.bay_id → ParkingBays.id (foreign key)
- VehicleParkingAssignments.assigned_by → Users.id (foreign key)

### Indexes

- CREATE INDEX idx_parking_facilities_location ON ParkingFacilities(location_id)
- CREATE INDEX idx_parking_bays_facility ON ParkingBays(facility_id, floor, section)
- CREATE INDEX idx_parking_bays_occupied ON ParkingBays(occupied, bay_type)
- CREATE UNIQUE INDEX idx_parking_bays_unique ON ParkingBays(facility_id, bay_number)
- CREATE INDEX idx_vehicle_parking_vehicle ON VehicleParkingAssignments(vehicle_id, released_at)
- CREATE INDEX idx_vehicle_parking_booking ON VehicleParkingAssignments(booking_id)

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript, React 18+
- Indoor Positioning: WiFi triangulation, BLE beacons (Estimote, Kontakt.io)
- Mapping: Google Maps Indoor Maps API (where available)
- Navigation: Custom pathfinding algorithm (A* or Dijkstra)

## Implementation Notes

- Implement indoor positioning using WiFi triangulation and BLE beacons
- Deploy BLE beacons at strategic locations (entrances, elevators, bay clusters)
- Use trilateration to calculate position from multiple beacon signals
- Implement Kalman filter to smooth position estimates
- Provide manual floor selection fallback if positioning unavailable
- Upload floor plans as georeferenced images
- Define walkable paths and obstacles on floor plans
- Implement A* pathfinding algorithm for route calculation
- Consider accessibility requirements (elevator vs stairs preference)
- Provide visual and text directions simultaneously
- Update position every 2-3 seconds during active navigation
- Implement battery-efficient positioning (reduce update frequency when stationary)
- Cache floor plans and facility data for offline access
- Test indoor positioning accuracy (target < 5 meter accuracy)
- Handle multi-floor navigation with clear floor change instructions
- Integrate with parking facility management systems for bay assignments
- Provide location manager interface for bay assignment
- Optimize bay assignments to minimize customer walking distance
- Reserve accessible bays near elevators for customers with mobility needs
- Monitor indoor positioning system health and beacon battery levels
- Provide fallback to text directions if positioning fails
- Consider Google Maps Indoor Maps where available (airports, malls)
- Implement custom indoor maps for facilities without Google coverage
- Test with various smartphone models and positioning capabilities
- Ensure indoor navigation works in areas with poor GPS signal
- Provide clear instructions for transitioning from outdoor to indoor navigation

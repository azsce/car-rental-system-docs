# Feature: AR Wayfinding

## Overview

Provide augmented reality navigation overlays using device camera to guide customers to their vehicles in parking facilities. The system displays directional arrows and distance indicators in real-time AR view, updating as the customer moves. This innovative feature makes vehicle location intuitive and engaging, especially in large or complex parking structures.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-008

## User Stories

As a customer in a large parking facility, I want augmented reality navigation overlays, so that I can follow visual arrows to find my vehicle intuitively.

As a tech-savvy customer, I want to use AR to navigate to my vehicle, so that I have a modern and engaging pickup experience.

As a customer unfamiliar with the parking facility, I want visual guidance through AR, so that I don't get lost or confused.

## Frontend Specifications

### Pages

- AR Navigation Page (mobile-only, full-screen)
- Vehicle Pickup Instructions with "Use AR Navigation" button
- AR Feature Introduction/Tutorial Page

### UI Components

**AR Camera View**:
- Full-screen camera feed
- Directional arrow overlay pointing to vehicle
- Distance indicator (e.g., "50 meters ahead")
- Bearing indicator (compass direction)
- Floor level indicator
- "Exit AR" button
- Battery warning if low power

**AR Directional Overlay**:
- Large animated arrow pointing to vehicle
- Arrow color changes based on distance (green: close, blue: medium, orange: far)
- Pulsing animation to draw attention
- Distance text below arrow
- Turn indicators (left, right, straight)
- "You've arrived" celebration when within 5 meters

**AR Calibration Screen**:
- Instructions to move device in figure-8 pattern
- Calibration progress indicator
- "Calibration complete" confirmation
- Skip calibration option (reduced accuracy)

**AR Compatibility Check**:
- Device capability detection
- "AR not supported" message for incompatible devices
- Fallback to standard map navigation button
- Browser/OS requirements explanation

### User Flows

**AR Navigation to Vehicle**:
1. Customer opens booking confirmation on mobile device
2. Clicks "Navigate to Vehicle" button
3. System checks if device supports AR
4. If supported, shows "Use AR Navigation" option
5. Customer selects AR navigation
6. System requests camera permission
7. Customer grants camera permission
8. AR calibration screen appears
9. Customer moves device in figure-8 pattern
10. Calibration completes
11. AR camera view opens with directional overlay
12. Arrow points toward vehicle location
13. Distance indicator shows "150 meters"
14. Customer walks following arrow
15. Arrow updates direction as customer moves
16. Distance decreases as customer approaches
17. System provides turn indicators at intersections
18. Customer reaches correct floor (elevator/stairs guidance)
19. Arrow guides to specific parking bay
20. "You've arrived" message displays when within 5 meters
21. Vehicle details shown for final confirmation

**AR Feature Fallback**:
1. Customer attempts to use AR navigation
2. Device doesn't support AR or camera permission denied
3. System displays friendly error message
4. Offers standard map navigation as alternative
5. Customer switches to map view
6. Navigation continues with traditional map

### Data Requirements

**From Backend APIs**:
- GET /api/vehicles/:id/ar-navigation - Returns vehicle location and AR navigation data
- POST /api/ar/calibrate - Stores calibration data for improved accuracy
- WebSocket /api/ar/position - Real-time position updates during AR navigation

**AR Navigation Data Structure**:
```
{
  vehicleLocation: {
    latitude: number,
    longitude: number,
    floor: number,
    bayNumber: string,
    coordinates: { x, y } // Indoor coordinates
  },
  userLocation: {
    latitude: number,
    longitude: number,
    floor: number,
    accuracy: number
  },
  bearing: number, // Degrees from north
  distance: number, // Meters
  direction: 'straight' | 'left' | 'right' | 'up' | 'down',
  floorChange: boolean,
  arrived: boolean
}
```

## Backend Specifications

### API Endpoints

**GET /api/vehicles/:id/ar-navigation**
- Purpose: Get vehicle location data for AR navigation
- Response: Vehicle coordinates, parking bay, floor level
- Authentication: JWT token required (booking owner)
- Caching: 5 minutes

**POST /api/ar/calibrate**
- Purpose: Store device calibration data for improved accuracy
- Request Body: { deviceId, calibrationData, timestamp }
- Response: Success confirmation
- Authentication: JWT token required
- Rate Limiting: 10 requests per minute per user

**WebSocket /api/ar/position**
- Purpose: Stream real-time position updates during AR navigation
- Messages: { latitude, longitude, floor, bearing, accuracy, timestamp }
- Authentication: JWT token required
- Throttling: Max 2 updates per second

**POST /api/ar/feedback**
- Purpose: Collect user feedback on AR navigation accuracy
- Request Body: { vehicleId, accurate: boolean, comments, timestamp }
- Response: Success confirmation
- Authentication: JWT token required

### Request Schemas

**AR Navigation Request**:
- vehicleId: string (required)
- userLocation: { latitude, longitude, floor } (optional, for route calculation)

**Calibration Request**:
- deviceId: string (required)
- calibrationData: object (device-specific calibration parameters)
- timestamp: string (ISO 8601)

### Response Schemas

**AR Navigation Response**:
- vehicleLocation: { latitude, longitude, floor, bayNumber, section }
- facilityId: string
- facilityName: string
- indoorPositioningAvailable: boolean
- arSupported: boolean

### Business Logic

**AR Capability Detection**:
- Check device supports ARCore (Android) or ARKit (iOS)
- Verify camera permission granted
- Check device has gyroscope and accelerometer
- Validate GPS accuracy sufficient for outdoor-to-indoor transition
- Provide graceful fallback if AR unavailable

**Bearing Calculation**:
- Calculate bearing from user location to vehicle location
- Use device compass for user heading
- Compute relative bearing (difference between vehicle bearing and user heading)
- Update bearing continuously as user moves and rotates device
- Smooth bearing changes to prevent jittery arrows

**Distance Calculation**:
- Use Haversine formula for outdoor distances
- Use Euclidean distance for indoor coordinates
- Account for floor changes (add vertical distance)
- Update distance in real-time as user moves
- Trigger "arrived" state when distance < 5 meters

**Floor Change Detection**:
- Monitor altitude changes from barometer
- Detect elevator usage (rapid altitude change)
- Detect stairs usage (gradual altitude change)
- Update floor level automatically
- Confirm floor change with user if ambiguous

### Authentication Requirements

- AR navigation: JWT token required (booking owner)
- Calibration data: JWT token required
- Position tracking: JWT token required
- AR feedback: JWT token required

## Database Specifications

### Schema Changes

Add AR navigation usage tracking table.

### Table Definitions

**ARNavigationSessions Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- user_id: INT NOT NULL
- vehicle_id: INT NOT NULL
- booking_id: INT NOT NULL
- started_at: DATETIME NOT NULL
- completed_at: DATETIME
- duration_seconds: INT
- distance_traveled: INT - Meters
- accuracy_rating: INT - 1-5 stars from user feedback
- successful: BOOLEAN - Did user find vehicle
- device_model: VARCHAR(100)
- os_version: VARCHAR(50)
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

### Relationships

- ARNavigationSessions.user_id → Users.id (foreign key)
- ARNavigationSessions.vehicle_id → Vehicles.id (foreign key)
- ARNavigationSessions.booking_id → Bookings.id (foreign key)

### Indexes

- CREATE INDEX idx_ar_sessions_user ON ARNavigationSessions(user_id, started_at DESC)
- CREATE INDEX idx_ar_sessions_vehicle ON ARNavigationSessions(vehicle_id, started_at DESC)
- CREATE INDEX idx_ar_sessions_success ON ARNavigationSessions(successful, accuracy_rating)

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript, React 18+ (mobile web or React Native)
- AR Framework: ARCore (Android), ARKit (iOS), WebXR (browser-based AR)
- Positioning: Device GPS, compass, gyroscope, accelerometer
- Indoor Positioning: WiFi triangulation, BLE beacons

## Implementation Notes

- Use ARCore for Android and ARKit for iOS native apps
- Consider WebXR for browser-based AR (limited device support)
- Implement AR feature detection before showing AR option
- Request camera permission with clear explanation of AR usage
- Implement device calibration for improved accuracy
- Use device compass for heading/bearing calculation
- Combine GPS, compass, and gyroscope data for position tracking
- Implement Kalman filter to smooth position and bearing estimates
- Provide clear visual feedback (arrow, distance, instructions)
- Use large, high-contrast graphics for outdoor visibility
- Implement battery-efficient AR rendering (reduce frame rate if needed)
- Provide "Exit AR" button prominently for user control
- Fall back to standard map navigation if AR fails
- Test AR accuracy in various lighting conditions
- Test AR performance on different device models
- Implement AR tutorial for first-time users
- Show AR feature benefits before requesting camera permission
- Monitor AR usage and success rates
- Collect user feedback on AR accuracy and usefulness
- Consider AR navigation for other use cases (return location, amenities)
- Implement AR markers for facility landmarks (elevators, exits)
- Provide audio cues for accessibility (optional)
- Test AR in various parking facility types (indoor, outdoor, multi-level)
- Ensure AR works in areas with poor GPS signal (indoor positioning integration)
- Optimize AR rendering for battery life (target < 10% battery drain per 5 minutes)
- Implement AR session timeout (15 minutes) to prevent battery drain
- Provide clear instructions for transitioning from outdoor to indoor AR
- Consider gamification (achievement for using AR navigation)

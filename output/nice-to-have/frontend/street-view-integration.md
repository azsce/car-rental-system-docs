# Feature: Street View Integration

## Overview

Integrate Google Street View to allow customers to preview pickup locations and vehicle surroundings before booking. The system displays street-level imagery of parking locations, rental offices, and vehicle positions, helping customers familiarize themselves with the area and identify landmarks for easier navigation.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-017

## User Stories

As a customer, I want to see street-level views of pickup locations, so that I can familiarize myself with the area before arrival.

As a customer in an unfamiliar city, I want to preview the rental office location, so that I can identify landmarks and plan my approach.

As a P2P renter, I want to see the vehicle's parking location in Street View, so that I know exactly where to find it.

## Frontend Specifications

### Pages

- Location Details Page with Street View
- Vehicle Details Page with Parking Location Street View
- Booking Confirmation with Pickup Location Street View

### UI Components

**Street View Viewer**:
- Embedded Street View panorama
- Navigation controls (pan, zoom, move along street)
- Compass indicator
- Address overlay
- "Open in Google Maps" button
- Fullscreen toggle
- Close button

**Street View Thumbnail**:
- Small preview image of location
- Click to open full Street View
- "View in Street View" label
- Fallback to static map if Street View unavailable

### User Flows

**Viewing Pickup Location**:
1. Customer views booking confirmation
2. Sees pickup location address and map
3. Clicks "Street View" button
4. Street View opens showing location entrance
5. Customer pans around to see surroundings
6. Identifies landmarks for navigation
7. Closes Street View
8. Proceeds with confidence about location

### Data Requirements

**From Backend APIs**:
- GET /api/locations/:id/street-view - Returns Street View availability and coordinates

## Backend Specifications

### API Endpoints

**GET /api/locations/:id/street-view**
- Purpose: Check Street View availability for location
- Response: { available, coordinates, heading, pitch }
- Authentication: None required
- Caching: 24 hours

### Request Schemas

None required.

### Response Schemas

**Street View Response**:
- available: boolean
- coordinates: { latitude, longitude }
- heading: number (camera direction)
- pitch: number (camera angle)
- panoId: string (Street View panorama ID)

### Business Logic

**Street View Availability Check**:
- Query Google Street View API for location
- Check if imagery available at coordinates
- Return availability status and panorama ID
- Cache availability for 24 hours

### Authentication Requirements

- Street View viewing: No authentication required

## Database Specifications

### Schema Changes

No database changes required (Street View data from Google).

### Table Definitions

None required.

### Relationships

None required.

### Indexes

None required.

## Technology Stack

- Backend: .NET 8+ with C#
- Frontend: Next.js 14+ with TypeScript
- Street View: Google Maps Street View API

## Implementation Notes

- Use Google Street View API to embed panoramas
- Check Street View availability before showing option
- Provide fallback to static map if Street View unavailable
- Set appropriate heading and pitch for best view
- Allow users to navigate along street
- Implement Street View for pickup locations and vehicle positions
- Test Street View availability for all locations
- Ensure Street View loads quickly
- Provide clear indication when Street View not available
- Consider privacy implications (blur faces, license plates)

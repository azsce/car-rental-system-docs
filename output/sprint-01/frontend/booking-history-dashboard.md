# Feature: Booking History & Dashboard

## Overview

This feature provides comprehensive booking management capabilities including a complete history of all customer bookings with advanced filtering and search, plus a real-time dashboard for monitoring and managing active rentals. It combines historical record-keeping with live trip tracking to give customers complete visibility and control over their rental lifecycle.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-011: Comprehensive Booking History
- F-BM-012: Active Trip Dashboard
- F-FUNC-BM-005: Booking History (Functional Requirement)

## User Stories

### Booking History
**As an individual customer**, I want to view all my bookings with status tracking and filtering, so that I can easily access booking information for trip planning and expense tracking.

**As a corporate client**, I want to export my booking history for expense reporting, so that I can submit accurate travel reimbursements.

**As a power renter**, I want to quickly find past bookings to rebook similar trips, so that I can save time on repeat reservations.

### Active Trip Dashboard
**As a customer with an active rental**, I want a real-time dashboard to monitor and manage my current trip, so that I have complete visibility and control.

**As a subscription user**, I want to track my trip progress and costs in real-time, so that I can manage my usage effectively.

## Frontend Specifications

### Pages

#### Booking History Page (`/bookings/history`)
- Chronological list view of all customer bookings
- Status-based categorization tabs (All, Upcoming, Active, Completed, Cancelled, Pending Payment)
- Advanced filtering sidebar
- Search bar with autocomplete
- Export functionality
- Pagination or infinite scroll for large histories

#### Active Trip Dashboard Page (`/bookings/active`)
- Real-time trip monitoring interface
- Vehicle information card
- Trip progress visualization
- Cost tracking display
- Quick action buttons
- Map integration showing vehicle and return location

#### Booking Detail Modal
- Full booking information overlay
- Booking reference and QR code
- Vehicle details and specifications
- Pickup/return information
- Pricing breakdown
- Modification and cancellation options
- Support contact information

### UI Components

#### BookingHistoryList Component
- **Purpose**: Display paginated list of bookings with status indicators
- **Props**: bookings array, onBookingClick, onExport, filters
- **Features**:
  - Color-coded status badges (green=active, blue=upcoming, gray=completed, red=cancelled, yellow=pending)
  - Booking card with vehicle thumbnail, dates, location, price
  - Quick actions menu (view details, rebook, cancel, modify)
  - Empty state for no bookings
  - Loading skeleton states

#### BookingFilters Component
- **Purpose**: Advanced filtering sidebar for booking history
- **Filters**:
  - Status checkboxes (upcoming, active, completed, cancelled, pending)
  - Date range picker (custom range, last 30 days, last 6 months, last year, all time)
  - Supplier/host multi-select dropdown
  - Vehicle type multi-select (sedan, SUV, truck, van, luxury, electric)
  - Price range slider
  - Location search
- **Features**:
  - Active filter count badge
  - Clear all filters button
  - Collapsible filter sections
  - Mobile-responsive drawer

#### BookingSearchBar Component
- **Purpose**: Search bookings by multiple criteria
- **Features**:
  - Autocomplete suggestions as user types
  - Search by booking reference, vehicle name, location, supplier
  - Recent searches dropdown
  - Clear search button
  - Search results count display

#### ActiveTripCard Component
- **Purpose**: Display current active rental information
- **Layout**:
  - Vehicle image and name
  - Trip status indicator (in progress, extended, ending soon)
  - Time tracking: elapsed time, remaining time, countdown timer
  - Cost tracking: current charges, estimated total
  - Progress bar showing trip completion percentage
  - Quick action buttons (extend, navigate, report issue, end trip)

#### TripProgressMap Component
- **Purpose**: Visual map showing trip route and locations
- **Features**:
  - Vehicle current location marker (if GPS enabled)
  - Pickup location marker
  - Return location marker
  - Route visualization (if available)
  - Distance traveled display
  - Navigation button to return location

#### VehicleControlPanel Component
- **Purpose**: Remote vehicle controls (if supported)
- **Controls**:
  - Lock/unlock buttons with confirmation
  - Horn/lights activation
  - Vehicle status indicators (locked, battery level, fuel level)
  - Last updated timestamp
  - Requires vehicle telematics integration

#### ExportBookingHistory Component
- **Purpose**: Export booking data for record-keeping
- **Options**:
  - Format selection (CSV, PDF, Excel)
  - Date range selection
  - Include/exclude cancelled bookings
  - Detailed vs summary export
  - Email export option
- **Features**:
  - Preview before export
  - Download progress indicator
  - Export history tracking

### User Flows

#### View Booking History Flow
1. User navigates to Bookings section
2. System displays booking history page with all bookings
3. User sees status tabs and can switch between categories
4. User applies filters (status, date range, vehicle type, supplier)
5. System updates list in real-time based on filters
6. User searches for specific booking by reference or vehicle name
7. System highlights matching results
8. User clicks on booking card
9. System opens booking detail modal with full information
10. User can take actions (rebook, modify, cancel, contact support)

#### Monitor Active Trip Flow
1. User has active rental in progress
2. User navigates to Active Trip dashboard
3. System displays real-time trip information
4. User sees elapsed time, remaining time, current cost
5. User views vehicle location on map
6. User checks trip progress and status
7. User can extend trip if needed
8. User can navigate to return location
9. User can report issues or contact support
10. User initiates return process when ready

#### Export Booking History Flow
1. User navigates to booking history page
2. User clicks "Export" button
3. System opens export options modal
4. User selects format (CSV/PDF/Excel)
5. User selects date range and filters
6. User previews export data
7. User confirms export
8. System generates file and initiates download
9. System shows success notification
10. User receives exported file

### Data Requirements

#### Booking History Data
```typescript
interface BookingHistoryItem {
  bookingId: string;
  bookingReference: string;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled' | 'pending_payment';
  vehicle: {
    id: string;
    name: string;
    type: string;
    imageUrl: string;
    licensePlate?: string;
  };
  dates: {
    pickupDate: string; // ISO 8601
    returnDate: string; // ISO 8601
    actualPickupDate?: string;
    actualReturnDate?: string;
  };
  location: {
    pickupLocation: string;
    returnLocation: string;
    pickupAddress: string;
    returnAddress: string;
  };
  pricing: {
    totalCost: number;
    currency: string;
    breakdown: {
      baseRate: number;
      insurance: number;
      extras: number;
      taxes: number;
      fees: number;
      discounts: number;
    };
  };
  supplier: {
    id: string;
    name: string;
    logoUrl: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

#### Active Trip Data
```typescript
interface ActiveTrip {
  bookingId: string;
  bookingReference: string;
  tripStatus: 'in_progress' | 'extended' | 'ending_soon' | 'overdue';
  vehicle: {
    id: string;
    name: string;
    type: string;
    imageUrl: string;
    licensePlate: string;
    currentLocation?: {
      latitude: number;
      longitude: number;
      lastUpdated: string;
    };
    status: {
      locked: boolean;
      fuelLevel?: number;
      batteryLevel?: number;
      odometer?: number;
    };
  };
  timing: {
    startTime: string; // ISO 8601
    scheduledEndTime: string;
    elapsedMinutes: number;
    remainingMinutes: number;
    graceMinutes: number;
  };
  cost: {
    currentCharges: number;
    estimatedTotal: number;
    currency: string;
    lastUpdated: string;
  };
  locations: {
    pickupLocation: {
      name: string;
      address: string;
      coordinates: { latitude: number; longitude: number };
    };
    returnLocation: {
      name: string;
      address: string;
      coordinates: { latitude: number; longitude: number };
    };
  };
  controls: {
    canLock: boolean;
    canUnlock: boolean;
    canHorn: boolean;
    canLights: boolean;
  };
}
```

### API Integration Requirements

#### GET /api/bookings/history
- **Purpose**: Retrieve customer booking history
- **Query Parameters**: 
  - `status`: Filter by status (optional, multiple)
  - `startDate`: Filter by date range start (optional)
  - `endDate`: Filter by date range end (optional)
  - `supplierId`: Filter by supplier (optional, multiple)
  - `vehicleType`: Filter by vehicle type (optional, multiple)
  - `search`: Search term (optional)
  - `page`: Page number for pagination
  - `limit`: Items per page
  - `sortBy`: Sort field (date, price, status)
  - `sortOrder`: Sort direction (asc, desc)
- **Response**: Paginated list of BookingHistoryItem objects
- **Authentication**: Required (JWT token)

#### GET /api/bookings/active
- **Purpose**: Retrieve active trip information
- **Response**: ActiveTrip object or null if no active trip
- **Authentication**: Required (JWT token)
- **Real-time**: Should support polling or WebSocket for live updates

#### POST /api/bookings/export
- **Purpose**: Generate booking history export file
- **Request Body**:
  - `format`: 'csv' | 'pdf' | 'excel'
  - `startDate`: Date range start
  - `endDate`: Date range end
  - `includeStatus`: Array of statuses to include
  - `detailed`: Boolean for detailed vs summary
- **Response**: File download URL or stream
- **Authentication**: Required (JWT token)

#### POST /api/trips/{tripId}/extend
- **Purpose**: Extend active trip duration
- **Request Body**: New return time, payment method
- **Response**: Updated ActiveTrip object
- **Authentication**: Required (JWT token)

#### POST /api/vehicles/{vehicleId}/control
- **Purpose**: Send control command to vehicle
- **Request Body**: 
  - `action`: 'lock' | 'unlock' | 'horn' | 'lights'
  - `tripId`: Active trip identifier
- **Response**: Command status and vehicle status
- **Authentication**: Required (JWT token)

### Responsive Design Considerations

#### Mobile (< 768px)
- Stack booking cards vertically
- Collapsible filter drawer from bottom
- Simplified booking cards with essential info
- Swipe actions for quick operations
- Bottom navigation for active trip controls
- Full-screen map view option

#### Tablet (768px - 1024px)
- Two-column booking grid
- Side panel for filters
- Split view for booking list and details
- Inline map in active trip dashboard

#### Desktop (> 1024px)
- Three-column layout with filters, list, and preview
- Persistent filter sidebar
- Hover states and tooltips
- Keyboard shortcuts for navigation
- Multi-select for bulk operations

### Accessibility Requirements

- ARIA labels for all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader announcements for status changes
- High contrast mode support
- Focus indicators on all focusable elements
- Alt text for vehicle images
- Semantic HTML structure
- Color-blind friendly status indicators (use icons + colors)

### Performance Considerations

- Lazy load booking images
- Virtual scrolling for large booking lists
- Debounced search input (300ms)
- Cached filter results
- Optimistic UI updates for quick actions
- Progressive loading with skeleton states
- Pagination or infinite scroll (load 20 items at a time)
- Service worker caching for offline access to recent bookings

## Technology Stack

- **Frontend Framework**: Next.js 14+ with React 18+
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context API or Zustand for booking state
- **Data Fetching**: React Query for caching and real-time updates
- **Maps**: Google Maps API or Mapbox for location visualization
- **Date Handling**: date-fns or Day.js for date formatting
- **Export**: jsPDF for PDF generation, xlsx for Excel export
- **Real-time**: WebSocket or Server-Sent Events for active trip updates

## Implementation Notes

### Booking History
- Implement infinite scroll or pagination based on expected booking volume
- Cache booking history locally for offline access
- Provide quick filters for common use cases (last 30 days, active only)
- Support bulk operations (export multiple, cancel multiple)
- Maintain filter state in URL query parameters for shareable links
- Show booking count per status category in tabs

### Active Trip Dashboard
- Poll for updates every 30 seconds or use WebSocket for real-time data
- Show countdown timer with visual warning when trip is ending soon (< 30 minutes)
- Calculate estimated cost based on elapsed time and rate
- Provide grace period indicator before late fees apply
- Cache vehicle location for offline map viewing
- Disable vehicle controls if not supported by vehicle telematics
- Show trip extension option prominently when approaching end time

### Security Considerations
- Validate user ownership of bookings before displaying
- Sanitize search inputs to prevent XSS
- Rate limit export requests to prevent abuse
- Require re-authentication for sensitive operations (cancellation, vehicle control)
- Encrypt booking reference in QR codes
- Implement CSRF protection for all state-changing operations

### Error Handling
- Display friendly error messages for failed API calls
- Provide retry mechanism for failed requests
- Show offline indicator when network is unavailable
- Cache last known state for offline viewing
- Validate filter combinations before applying
- Handle empty states gracefully with helpful messaging

### Analytics Tracking
- Track booking history page views
- Monitor filter usage patterns
- Track export format preferences
- Measure active trip dashboard engagement
- Track vehicle control usage
- Monitor search query patterns for UX improvements

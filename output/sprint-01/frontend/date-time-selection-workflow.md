# Feature: Date and Time Selection Workflow

## Overview

Enhanced calendar picker for pickup/return dates with time selection in 30-minute increments and rental duration calculation. This feature extends the MVP date/time availability search (F-SD-003) with improved user experience, workflow optimization, and additional selection options.

## Sprint Category

Project - Important but can wait until after MVP

## Feature ID

F-WF-SRCH-002

## Related Features

- **F-SD-003**: Date & Time Availability Search (MVP) - Base functionality
- **F-WF-SRCH-001**: Location Selection (Sprint-01)
- **F-WF-SRCH-003**: Multi-Criteria Filtering (Sprint-01)

## User Stories

- As a customer, I want an intuitive calendar picker, so that selecting dates is quick and easy.
- As a customer, I want to see rental duration calculated in real-time, so that I understand the total rental length immediately.
- As a customer, I want time selection in 30-minute increments, so that I have flexibility in pickup/return times.
- As a customer, I want quick date selection shortcuts, so that I can choose common rental periods with one click.
- As a customer, I want to see unavailable dates grayed out, so that I don't waste time selecting invalid dates.

## Frontend Specifications

### Pages

- Enhanced search page with improved calendar UI
- Vehicle search results with date modification
- Booking flow with date/time confirmation and editing

### UI Components

**Enhanced Calendar Picker**
- Month view with previous/next navigation
- Year/month dropdown for quick navigation
- Visual indicators for available/unavailable dates
- Highlighted current date
- Selected date range highlighting
- Weekend highlighting (different color)
- Hover states for better interactivity
- Mobile-optimized touch targets
- Keyboard navigation support

**Time Picker Component**
- Dropdown or slider for time selection
- 30-minute increment intervals
- AM/PM format or 24-hour format (user preference)
- Visual time slots with availability indicators
- Quick time selection buttons (Morning, Afternoon, Evening)
- Validation for business hours
- Timezone display

**Duration Display Component**
- Real-time duration calculation
- Display in days and hours
- Visual representation (progress bar or icon)
- Cost estimate based on duration
- Comparison with common rental periods
- Editable duration with automatic date adjustment

**Quick Selection Shortcuts**
- "This Weekend" button (Friday evening to Sunday evening)
- "Next Week" button (7 days from today)
- "One Week" button (7-day rental)
- "Two Weeks" button (14-day rental)
- "One Month" button (30-day rental)
- Custom duration presets (configurable by location)

**Date Range Validation**
- Real-time validation feedback
- Error messages for invalid selections
- Minimum/maximum period warnings
- Past date prevention
- Visual indicators for validation state

### User Flows

**Standard Date Selection Flow**
1. User opens search page with calendar picker
2. User clicks on pickup date in calendar
3. Calendar highlights selected date
4. User clicks on return date in calendar
5. Calendar highlights date range
6. System calculates and displays duration
7. User selects pickup time from time picker
8. User selects return time from time picker
9. System validates rental period
10. System displays total cost estimate
11. User proceeds to vehicle search

**Quick Selection Flow**
1. User opens search page
2. User clicks "This Weekend" shortcut
3. System auto-fills pickup (Friday 6:00 PM) and return (Sunday 6:00 PM)
4. System calculates duration (2 days)
5. System displays cost estimate
6. User proceeds to vehicle search

**Date Modification Flow**
1. User views search results with selected dates
2. User clicks "Change Dates" button
3. Calendar picker opens with current dates pre-selected
4. User modifies pickup or return date
5. System recalculates duration and validates
6. System refreshes search results with new dates
7. User reviews updated availability

**Mobile Touch Flow**
1. User taps on date input field
2. Native-style calendar modal opens
3. User swipes to navigate months
4. User taps pickup date
5. User taps return date
6. User taps time selection
7. Modal shows duration summary
8. User taps "Apply" to confirm
9. Search page updates with selected dates

### Data Requirements

**API Endpoints**
- `GET /api/config/quick-date-presets` - Retrieve quick selection presets
- `GET /api/config/business-hours?locationId={id}` - Get location operating hours
- `POST /api/availability/duration-estimate` - Calculate cost estimate for duration
- `GET /api/availability/calendar-view?vehicleId={id}&month={YYYY-MM}` - Get month availability

**Response Schemas**

Quick Date Presets:
```json
{
  "presets": [
    {
      "id": "this-weekend",
      "label": "This Weekend",
      "pickupOffset": { "days": 0, "hours": 18 },
      "returnOffset": { "days": 2, "hours": 18 },
      "enabled": true
    }
  ]
}
```

Business Hours:
```json
{
  "locationId": "string",
  "timezone": "America/Los_Angeles",
  "hours": [
    {
      "dayOfWeek": "Monday",
      "openTime": "08:00",
      "closeTime": "20:00"
    }
  ]
}
```

Duration Estimate:
```json
{
  "duration": {
    "days": 3,
    "hours": 72
  },
  "estimatedCost": {
    "amount": 150.00,
    "currency": "USD",
    "breakdown": {
      "baseRate": 50.00,
      "days": 3
    }
  }
}
```

### User Experience Enhancements

**Visual Feedback**
- Smooth animations for date selection
- Loading indicators during validation
- Success/error states with color coding
- Tooltips for unavailable dates
- Progress indicators for multi-step selection

**Accessibility**
- ARIA labels for all calendar elements
- Keyboard navigation (arrow keys, tab, enter)
- Screen reader announcements for date changes
- High contrast mode support
- Focus indicators for keyboard users
- Skip links for calendar navigation

**Mobile Optimization**
- Touch-friendly date picker (minimum 44x44px targets)
- Swipe gestures for month navigation
- Native date picker fallback option
- Responsive layout for small screens
- Bottom sheet modal for date selection
- Haptic feedback on selection (iOS/Android)

**Performance**
- Lazy load calendar months
- Debounce duration calculations
- Cache availability data
- Optimize re-renders with React.memo
- Preload adjacent months

## Backend Specifications

### API Endpoints

**Quick Date Presets**
- **Endpoint**: `GET /api/config/quick-date-presets`
- **Purpose**: Retrieve configurable quick selection presets
- **Authentication**: Public

**Business Hours**
- **Endpoint**: `GET /api/config/business-hours`
- **Query Parameters**: `locationId` (required)
- **Purpose**: Get location operating hours for time validation
- **Authentication**: Public

**Duration Cost Estimate**
- **Endpoint**: `POST /api/availability/duration-estimate`
- **Purpose**: Calculate estimated cost for rental duration
- **Authentication**: Public

**Calendar Month View**
- **Endpoint**: `GET /api/availability/calendar-view`
- **Query Parameters**: `vehicleId` (optional), `locationId` (required), `month` (YYYY-MM format)
- **Purpose**: Get availability status for entire month
- **Authentication**: Public

### Business Logic

**Quick Date Preset Calculation**
- Calculate absolute dates from relative offsets
- Apply location timezone
- Validate against business hours
- Adjust for location-specific rules
- Handle edge cases (holidays, special events)

**Business Hours Validation**
- Validate pickup/return times within operating hours
- Support different hours by day of week
- Handle holiday schedules
- Apply timezone conversions
- Provide alternative time suggestions

**Duration-Based Cost Estimation**
- Calculate base cost from duration
- Apply volume discounts for longer rentals
- Include estimated taxes and fees
- Support multiple pricing models (hourly, daily, weekly)
- Cache pricing rules for performance

**Calendar View Optimization**
- Aggregate availability for entire month
- Batch database queries
- Cache month views with short TTL
- Support filtering by vehicle type
- Optimize for mobile bandwidth

## Database Specifications

### Schema Changes

**Quick Date Presets Table**
```sql
CREATE TABLE quick_date_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preset_key VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  pickup_offset_days INT NOT NULL,
  pickup_offset_hours INT NOT NULL DEFAULT 0,
  return_offset_days INT NOT NULL,
  return_offset_hours INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  location_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_enabled (is_enabled),
  INDEX idx_location (location_id),
  INDEX idx_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Hours Table**
```sql
CREATE TABLE business_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(50) NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location (location_id),
  INDEX idx_day (day_of_week),
  UNIQUE KEY unique_location_day (location_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Definitions

**quick_date_presets**
- Store configurable quick selection shortcuts
- Support location-specific presets
- Enable/disable presets without deletion
- Control display order for UI presentation

**business_hours**
- Define operating hours by location and day
- Support closed days
- Validate pickup/return times
- Enable location-specific scheduling

### Relationships

- locations → quick_date_presets (one-to-many)
- locations → business_hours (one-to-many)

## Technology Stack

- Backend: .NET 8+ with C# and ASP.NET Core Web API
- Database: MySQL 8.0+ with InnoDB storage engine
- Frontend: Next.js 14+ with React 18+, TypeScript, and Tailwind CSS
- Date Library: date-fns for date manipulation
- Calendar Component: react-datepicker or custom implementation
- State Management: React Context or Zustand for date selection state

## Implementation Notes

### Integration with MVP Feature

This feature extends F-SD-003 (MVP) with:
- Enhanced UI components for better user experience
- Quick selection shortcuts for common use cases
- Business hours validation
- Duration-based cost estimation
- Improved mobile experience

The MVP feature provides the core availability checking and validation logic, while this feature focuses on workflow optimization and user experience improvements.

### Phased Implementation

**Phase 1**: Enhanced calendar picker and time selection
**Phase 2**: Quick date selection shortcuts
**Phase 3**: Business hours validation
**Phase 4**: Duration cost estimation
**Phase 5**: Mobile optimization

### Testing Requirements

- Unit tests for date calculation logic
- Integration tests for API endpoints
- E2E tests for complete date selection workflow
- Accessibility tests for keyboard navigation
- Mobile device testing on iOS and Android
- Performance tests for calendar rendering
- Timezone handling tests

### Performance Considerations

- Lazy load calendar months to reduce initial load
- Cache quick date presets and business hours
- Debounce duration calculations (300ms)
- Optimize calendar re-renders
- Preload adjacent months for smooth navigation
- Use service workers for offline calendar access

### Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactions
- Screen reader support with ARIA labels
- High contrast mode support
- Focus management for modal dialogs
- Skip links for calendar navigation
- Alternative text for visual indicators

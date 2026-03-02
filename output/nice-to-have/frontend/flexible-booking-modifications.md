# Feature: Flexible Booking Modifications

## Overview

Self-service modification of existing bookings including date/time changes, location changes, vehicle changes, and additional services. The system provides automatic repricing, modification history tracking, and real-time availability validation to ensure customers can adapt their bookings to changing travel plans without the need to cancel and rebook.

## Sprint Category

nice-to-have

## Feature ID

F-BM-008

## User Stories

### User Story 1: Date and Time Modification
As a customer with an existing booking, I want to change my pickup or return dates and times, so that I can adapt my rental to my updated travel schedule without canceling and rebooking.

### User Story 2: Vehicle Upgrade/Downgrade
As a customer, I want to change my booked vehicle to a different model, so that I can upgrade to a larger vehicle or downgrade to save costs based on my changing needs.

### User Story 3: Location Change
As a customer, I want to change my pickup or drop-off location, so that I can adjust my rental to match my updated travel itinerary.

### User Story 4: Additional Services Management
As a customer, I want to add or remove additional services like insurance, GPS, or child seats, so that I can customize my rental as my needs change.

### User Story 5: Transparent Repricing
As a customer, I want to see the cost impact of my modifications before confirming, so that I can make informed decisions about changes to my booking.

## Frontend Specifications

### Pages

**Booking Management Page** (`/bookings/[bookingId]`)
- Display complete booking details with current configuration
- Provide "Modify Booking" button to initiate modification flow
- Show modification history timeline
- Display modification restrictions and policies

**Booking Modification Page** (`/bookings/[bookingId]/modify`)
- Multi-step modification wizard
- Real-time availability checking
- Before/after comparison view
- Price difference calculator
- Modification confirmation screen

### UI Components

**ModificationWizard Component**
- Step-by-step modification interface
- Progress indicator showing current step
- Navigation between modification types (dates, vehicle, location, services)
- Validation feedback for each modification type

**DateTimeModifier Component**
- Calendar picker for new pickup/return dates
- Time selector with 30-minute increments
- Availability indicator for selected dates
- Duration calculator showing new rental period

**VehicleSelector Component**
- Display current vehicle with specifications
- Show available alternative vehicles
- Filter by upgrade/downgrade/similar
- Real-time availability status
- Price comparison between current and new vehicle

**LocationModifier Component**
- Dropdown or search for new pickup location
- Dropdown or search for new return location
- Display location operating hours
- Show distance and directions to new location

**ServicesManager Component**
- Checklist of current additional services
- Add/remove insurance tiers
- Add/remove GPS navigation
- Add/remove child seats
- Add/remove additional drivers
- Price impact for each service change

**ModificationSummary Component**
- Side-by-side comparison of original vs modified booking
- Itemized price breakdown showing changes
- Display modification fees if applicable
- Total price difference (additional charge or refund)
- Terms and conditions for modifications

**ModificationHistory Component**
- Timeline view of all modifications
- Display date, time, and user who made modification
- Show what was changed (before/after values)
- Link to modification confirmation emails

### User Flows

**Flow 1: Modify Booking Dates**
1. Customer navigates to booking details page
2. Customer clicks "Modify Booking" button
3. System displays modification wizard
4. Customer selects "Change Dates" option
5. System displays calendar with availability
6. Customer selects new pickup and return dates/times
7. System checks real-time availability
8. System calculates new pricing
9. System displays before/after comparison
10. Customer reviews changes and price difference
11. Customer confirms modification
12. System processes additional payment or refund
13. System updates booking and sends confirmation email

**Flow 2: Change Vehicle**
1. Customer initiates modification from booking details
2. Customer selects "Change Vehicle" option
3. System displays available vehicles for new dates
4. Customer filters by upgrade/downgrade/similar
5. Customer selects new vehicle
6. System checks availability
7. System calculates price difference
8. Customer reviews comparison
9. Customer confirms vehicle change
10. System updates booking and processes payment difference

**Flow 3: Add Additional Services**
1. Customer initiates modification
2. Customer selects "Manage Services" option
3. System displays current services
4. Customer adds GPS navigation and child seat
5. System calculates additional cost
6. Customer reviews updated total
7. Customer confirms service additions
8. System processes additional payment
9. System updates booking confirmation

### Data Requirements

**From Backend APIs:**
- Current booking details (dates, vehicle, location, services, pricing)
- Available vehicles for modified dates
- Available locations for pickup/return
- Real-time availability status
- Pricing rules and modification fees
- Modification policies and restrictions
- User's modification history
- Payment methods on file

**State Management:**
- Current booking state
- Modification wizard step
- Selected modifications (dates, vehicle, location, services)
- Calculated price differences
- Validation errors
- Availability status
- Modification confirmation status

## Backend Specifications

### API Endpoints

**GET /api/bookings/{bookingId}/modification-options**
- Purpose: Retrieve available modification options and restrictions
- Authentication: Required (JWT token)
- Response: Modification policies, time windows, available changes

**POST /api/bookings/{bookingId}/check-availability**
- Purpose: Check availability for proposed modifications
- Authentication: Required
- Request Body: Modified dates, vehicle ID, location IDs
- Response: Availability status, alternative options if unavailable

**POST /api/bookings/{bookingId}/calculate-modification-cost**
- Purpose: Calculate price impact of proposed modifications
- Authentication: Required
- Request Body: Modification details (dates, vehicle, services)
- Response: Price breakdown, modification fees, total difference

**PUT /api/bookings/{bookingId}/modify**
- Purpose: Apply modifications to existing booking
- Authentication: Required
- Request Body: Confirmed modifications, payment method
- Response: Updated booking details, confirmation number

**GET /api/bookings/{bookingId}/modification-history**
- Purpose: Retrieve modification history for booking
- Authentication: Required
- Response: Array of modifications with timestamps and details

### Request Schemas

**CheckAvailabilityRequest**
```
{
  "newPickupDate": "ISO 8601 datetime",
  "newReturnDate": "ISO 8601 datetime",
  "newVehicleId": "string (optional)",
  "newPickupLocationId": "string (optional)",
  "newReturnLocationId": "string (optional)"
}
```

**CalculateModificationCostRequest**
```
{
  "dateChanges": {
    "newPickupDate": "ISO 8601 datetime (optional)",
    "newReturnDate": "ISO 8601 datetime (optional)"
  },
  "vehicleChange": {
    "newVehicleId": "string (optional)"
  },
  "locationChanges": {
    "newPickupLocationId": "string (optional)",
    "newReturnLocationId": "string (optional)"
  },
  "serviceChanges": {
    "addServices": ["array of service IDs"],
    "removeServices": ["array of service IDs"]
  }
}
```

**ModifyBookingRequest**
```
{
  "modifications": {
    "dates": { "pickupDate": "datetime", "returnDate": "datetime" },
    "vehicle": { "vehicleId": "string" },
    "locations": { "pickupLocationId": "string", "returnLocationId": "string" },
    "services": { "addedServices": ["array"], "removedServices": ["array"] }
  },
  "paymentMethodId": "string",
  "acceptModificationFees": "boolean"
}
```

### Response Schemas

**ModificationOptionsResponse**
```
{
  "bookingId": "string",
  "allowedModifications": ["dates", "vehicle", "location", "services"],
  "restrictions": {
    "minimumNoticeHours": "number",
    "modificationDeadline": "ISO 8601 datetime",
    "allowLocationChange": "boolean",
    "allowVehicleChange": "boolean"
  },
  "fees": {
    "dateChangeFee": "number",
    "vehicleChangeFee": "number",
    "locationChangeFee": "number"
  }
}
```

**AvailabilityCheckResponse**
```
{
  "available": "boolean",
  "vehicleAvailable": "boolean",
  "locationAvailable": "boolean",
  "alternativeVehicles": ["array of vehicle objects"],
  "message": "string"
}
```

**ModificationCostResponse**
```
{
  "originalCost": "number",
  "newCost": "number",
  "costDifference": "number",
  "breakdown": {
    "baseRateChange": "number",
    "serviceChanges": "number",
    "modificationFees": "number",
    "taxAdjustment": "number"
  },
  "refundAmount": "number (if negative difference)",
  "additionalPayment": "number (if positive difference)"
}
```

**ModifiedBookingResponse**
```
{
  "bookingId": "string",
  "modificationId": "string",
  "status": "modified",
  "updatedBooking": { "complete booking object" },
  "confirmationEmail": "sent",
  "paymentStatus": "processed/pending",
  "message": "Booking successfully modified"
}
```

### Business Logic

**Modification Validation**
- Check modification is within allowed time window (e.g., not within 24 hours of pickup)
- Verify user has permission to modify booking
- Validate new dates are in the future
- Ensure new rental duration meets minimum/maximum requirements
- Check vehicle availability for new dates
- Verify location supports requested changes

**Availability Checking**
- Query vehicle inventory for new date range
- Check location operating hours for new dates
- Verify vehicle not already booked for new period
- Consider maintenance schedules
- Check location capacity

**Cost Calculation**
- Calculate base rate for new dates using current pricing rules
- Apply any applicable discounts or promotions
- Calculate service cost changes
- Add modification fees based on policy
- Calculate tax adjustments
- Determine if additional payment or refund is required

**Modification Processing**
- Lock booking during modification
- Update booking dates, vehicle, location, or services
- Process payment difference (charge or refund)
- Update vehicle availability calendar
- Release old vehicle allocation
- Allocate new vehicle if changed
- Generate modification confirmation
- Send notification emails
- Log modification in history
- Unlock booking

**Notification Logic**
- Send modification confirmation email to customer
- Notify supplier/location of changes
- Update calendar invites
- Send SMS confirmation if enabled
- Trigger push notification to mobile app

### Authentication Requirements

- User must be authenticated with valid JWT token
- User must be the booking owner or authorized delegate
- Corporate users must have modification permissions
- Admin users can modify any booking
- Modification actions logged for audit trail

## Database Specifications

### Schema Changes

**booking_modifications table** (new)
- Tracks all modifications made to bookings
- Stores before/after values for audit trail
- Links to original booking

**bookings table** (modifications)
- Add `last_modified_at` timestamp column
- Add `modification_count` integer column
- Add `modification_fees_total` decimal column

### Table Definitions

**booking_modifications**
```
CREATE TABLE booking_modifications (
  modification_id VARCHAR(36) PRIMARY KEY,
  booking_id VARCHAR(36) NOT NULL,
  modified_by_user_id VARCHAR(36) NOT NULL,
  modification_type ENUM('dates', 'vehicle', 'location', 'services', 'multiple') NOT NULL,
  modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Original values
  original_pickup_date DATETIME,
  original_return_date DATETIME,
  original_vehicle_id VARCHAR(36),
  original_pickup_location_id VARCHAR(36),
  original_return_location_id VARCHAR(36),
  original_services JSON,
  original_total_cost DECIMAL(10,2),
  
  -- New values
  new_pickup_date DATETIME,
  new_return_date DATETIME,
  new_vehicle_id VARCHAR(36),
  new_pickup_location_id VARCHAR(36),
  new_return_location_id VARCHAR(36),
  new_services JSON,
  new_total_cost DECIMAL(10,2),
  
  -- Modification details
  cost_difference DECIMAL(10,2),
  modification_fee DECIMAL(10,2),
  refund_amount DECIMAL(10,2),
  additional_payment DECIMAL(10,2),
  payment_status ENUM('pending', 'processed', 'failed', 'refunded') DEFAULT 'pending',
  
  -- Metadata
  reason TEXT,
  notes TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  FOREIGN KEY (modified_by_user_id) REFERENCES users(user_id),
  INDEX idx_booking_modifications (booking_id),
  INDEX idx_modified_at (modified_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**bookings table updates**
```
ALTER TABLE bookings
ADD COLUMN last_modified_at TIMESTAMP NULL,
ADD COLUMN modification_count INT DEFAULT 0,
ADD COLUMN modification_fees_total DECIMAL(10,2) DEFAULT 0.00,
ADD INDEX idx_last_modified (last_modified_at);
```

### Relationships

**booking_modifications → bookings**
- Many-to-one relationship
- Each modification belongs to one booking
- One booking can have multiple modifications
- Foreign key: `booking_id`
- Cascade delete: When booking is deleted, all modifications are deleted

**booking_modifications → users**
- Many-to-one relationship
- Each modification is made by one user
- One user can make multiple modifications
- Foreign key: `modified_by_user_id`

**booking_modifications → vehicles** (indirect)
- References original and new vehicle IDs
- No direct foreign key to allow historical tracking even if vehicle is deleted

**booking_modifications → locations** (indirect)
- References original and new location IDs
- No direct foreign key to preserve modification history

### Indexes

**Performance Optimization Indexes:**

```
-- Find all modifications for a booking (most common query)
CREATE INDEX idx_booking_modifications ON booking_modifications(booking_id, modified_at DESC);

-- Find modifications by user
CREATE INDEX idx_user_modifications ON booking_modifications(modified_by_user_id, modified_at DESC);

-- Find modifications by type
CREATE INDEX idx_modification_type ON booking_modifications(modification_type, modified_at DESC);

-- Find pending payment modifications
CREATE INDEX idx_payment_status ON booking_modifications(payment_status, modified_at);

-- Composite index for reporting queries
CREATE INDEX idx_reporting ON booking_modifications(modified_at, modification_type, payment_status);
```

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript
- **State Management**: React Context API or Zustand
- **Form Validation**: Zod or Yup
- **Date Handling**: date-fns or Day.js
- **API Communication**: Axios or Fetch API with React Query

## Implementation Notes

### Modification Restrictions
- Implement time-based restrictions (e.g., no modifications within 24 hours of pickup)
- Enforce supplier-specific modification policies
- Handle different policies for different vehicle categories
- Consider peak season restrictions

### Availability Validation
- Perform real-time availability checks before allowing modifications
- Lock vehicle inventory during modification process
- Handle race conditions when multiple users modify simultaneously
- Provide alternative suggestions when requested changes unavailable

### Payment Processing
- Support both additional charges and refunds
- Process payments immediately for additional costs
- Queue refunds for processing according to payment provider timelines
- Handle partial refunds for service removals
- Store payment transaction IDs for reconciliation

### Notification Strategy
- Send immediate confirmation email after modification
- Update calendar invites with new dates
- Notify supplier/location of changes
- Send reminder notifications before new pickup date
- Provide modification summary in customer account

### Error Handling
- Handle availability conflicts gracefully
- Provide clear error messages for validation failures
- Offer alternative options when modifications not possible
- Support rollback if payment processing fails
- Log all modification attempts for debugging

### Audit Trail
- Maintain complete modification history
- Log user who made modification
- Store IP address and user agent
- Track payment transactions
- Enable dispute resolution with historical data

### Mobile Considerations
- Optimize modification flow for mobile devices
- Support touch-friendly date pickers
- Provide simplified modification options on small screens
- Enable quick modifications for common changes
- Support offline modification queuing with sync when online

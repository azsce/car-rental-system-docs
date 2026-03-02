# Feature: Booking Workflow Details

## Overview

This feature encompasses critical workflow steps within the booking creation process that ensure a smooth, secure, and user-friendly reservation experience. These workflow details include vehicle temporary locking to prevent double-booking, customer information pre-fill for convenience, real-time form validation for data quality, additional driver management, insurance coverage selection, additional services and equipment rental, booking summary review, and terms and conditions acceptance.

These workflow components work together to create a comprehensive booking experience that balances user convenience with business requirements, ensuring data accuracy, legal compliance, and revenue optimization through upsell opportunities.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-WF-BOOK-002: Vehicle Temporary Lock System
- F-WF-BOOK-003: Customer Information Pre-Fill
- F-WF-BOOK-004: Real-Time Form Validation
- F-WF-BOOK-005: Additional Driver Management
- F-WF-BOOK-006: Insurance Coverage Selection
- F-WF-BOOK-007: Additional Services and Equipment Rental (Nice-to-have)
- F-WF-BOOK-008: Booking Summary Review (Nice-to-have)
- F-WF-BOOK-010: Terms and Conditions Acceptance

## User Stories

### Vehicle Temporary Lock System (F-WF-BOOK-002)
As a customer completing a booking, I want the vehicle to be temporarily reserved during my checkout process, so that I don't lose the vehicle to another customer while I'm entering my information.

As a business owner, I want to prevent double-booking situations, so that we maintain customer trust and avoid operational conflicts.

### Customer Information Pre-Fill (F-WF-BOOK-003)
As a logged-in customer, I want my personal information automatically populated in the booking form, so that I can complete my reservation quickly without re-entering data.

As a returning customer, I want the ability to edit pre-filled information, so that I can update details that may have changed since my last booking.


### Real-Time Form Validation (F-WF-BOOK-004)
As a customer entering booking information, I want immediate feedback on data format errors, so that I can correct mistakes before submitting the form.

As a system administrator, I want to ensure data quality through validation, so that we have accurate customer information for operations and communication.

### Additional Driver Management (F-WF-BOOK-005)
As a customer planning to share driving responsibilities, I want to add multiple authorized drivers to my booking, so that all drivers are properly covered and legal to drive the vehicle.

As a rental company, I want to validate all driver information and calculate appropriate fees, so that we maintain insurance compliance and generate additional revenue.

### Insurance Coverage Selection (F-WF-BOOK-006)
As a customer, I want to understand available insurance options with clear descriptions and pricing, so that I can make an informed decision about coverage that meets my needs.

As a business owner, I want to present insurance options effectively, so that we increase coverage adoption rates and reduce liability exposure.

### Additional Services and Equipment Rental (F-WF-BOOK-007)
As a customer, I want to add optional equipment and services to my booking, so that I have everything I need for a comfortable and convenient trip.

As a rental company, I want to offer additional services during booking, so that we maximize revenue per booking and improve customer satisfaction.

### Booking Summary Review (F-WF-BOOK-008)
As a customer, I want to review a complete itemized breakdown of all charges before payment, so that I understand exactly what I'm paying for and can make changes if needed.

As a business, I want to provide transparent pricing, so that we build customer trust and reduce payment disputes.

### Terms and Conditions Acceptance (F-WF-BOOK-010)
As a rental company, I want customers to explicitly accept rental terms and conditions, so that we have legal documentation of agreement and can enforce policies.

As a customer, I want access to clear terms and policies, so that I understand my rights and responsibilities before committing to the rental.


## Frontend Specifications

### Pages

#### Booking Checkout Page
Multi-step booking interface with progress indicator showing current step and completion status.

**Route**: `/booking/checkout/:vehicleId`

**Sections**:
- Vehicle summary card (sticky header)
- Progress indicator (steps 1-7)
- Current step form content
- Pricing summary sidebar (sticky)
- Navigation buttons (Back, Continue, Complete Booking)

### UI Components

#### Vehicle Lock Indicator
**Purpose**: Show customer that vehicle is temporarily reserved during checkout

**Elements**:
- Lock icon with timer
- Countdown display (e.g., "Reserved for 12:34")
- Warning message when time is running low (< 2 minutes)
- Auto-refresh option to extend lock

**Behavior**:
- Display lock status prominently at top of booking form
- Update countdown every second
- Show warning at 2 minutes remaining
- Offer one-click extension before expiration
- Redirect to search if lock expires without extension

#### Customer Information Form
**Purpose**: Collect required customer details with pre-fill for logged-in users

**Fields**:
- Full name (first and last name, separate fields)
- Email address (with validation)
- Phone number (with country code selector)
- Date of birth (date picker)
- Driver's license number
- License issuing country/state (dropdown)
- License expiration date (date picker)
- Secondary phone (optional)
- Special requests (optional textarea)

**Pre-Fill Behavior**:
- Auto-populate all fields for logged-in users
- Show "Edit" button next to each pre-filled field
- Highlight fields that need updating (e.g., expired license)
- Offer to save changes to profile
- Show last updated date for profile information


#### Real-Time Validation Component
**Purpose**: Provide immediate feedback on form input errors

**Validation Types**:
- Email format validation (RFC 5322 compliant)
- Phone number format validation (per country)
- Date validation (birth date, license expiration)
- Age requirement validation (minimum 21 years)
- License expiration validation (must be valid during rental period)
- Required field validation

**Visual Feedback**:
- Green checkmark for valid fields
- Red error icon for invalid fields
- Inline error message below field
- Field border color change (red for error, green for valid)
- Debounced validation (300ms after typing stops)

**Error Messages**:
- Specific, actionable error descriptions
- Example of correct format when applicable
- No generic "invalid input" messages

#### Additional Drivers Section
**Purpose**: Allow adding multiple authorized drivers with validation

**Elements**:
- "Add Additional Driver" button
- Driver cards (one per added driver)
- Remove driver button per card
- Fee display per driver
- Total additional driver fees

**Driver Card Fields**:
- Full name
- Date of birth
- Driver's license number
- License issuing location
- License expiration date
- Relationship to primary renter (optional)

**Behavior**:
- Support up to 4 additional drivers
- Validate each driver independently
- Calculate and display per-driver fee
- Update total cost in real-time
- Allow removing drivers
- Confirm removal with modal dialog


#### Insurance Selection Component
**Purpose**: Present insurance options with clear descriptions and pricing

**Insurance Options Display**:
- Collision Damage Waiver (CDW)
- Theft Protection (TP)
- Personal Accident Insurance (PAI)
- Supplemental Liability Insurance (SLI)
- Full Protection Package (bundle)

**Per Option Card**:
- Insurance name and icon
- Clear description (2-3 sentences)
- Coverage limits
- Deductible amount
- Cost per day
- Total cost for rental period
- "What's Covered" expandable section
- "What's Not Covered" expandable section
- Selection checkbox or radio button

**Comparison Feature**:
- Side-by-side comparison table
- Highlight differences between options
- Recommended option badge
- "Compare All" button

**Behavior**:
- Allow multiple selections (except for mutually exclusive options)
- Update total cost in real-time
- Show savings for package deals
- Highlight mandatory coverage (if any)
- Provide "Learn More" links to detailed policy documents

#### Additional Services Component
**Purpose**: Offer optional equipment and services

**Service Categories**:
- Navigation (GPS devices)
- Child Safety (infant seats, toddler seats, booster seats)
- Equipment (ski racks, bike racks, snow chains)
- Fuel Options (prepaid fuel, fuel service charge)
- Convenience (toll passes, WiFi hotspot)

**Service Card Elements**:
- Service name and image
- Description
- Specifications (for equipment)
- Availability indicator
- Quantity selector (where applicable)
- Daily rate or flat fee
- Total cost for rental period
- Add/Remove button

**Behavior**:
- Check availability in real-time
- Show "Limited Availability" warning
- Allow quantity selection for items like child seats
- Update total cost immediately
- Show unavailable items as disabled
- Provide alternative suggestions for unavailable items


#### Booking Summary Component
**Purpose**: Display complete itemized breakdown of all charges

**Summary Sections**:
- Vehicle Information (make, model, category, features)
- Rental Period (dates, times, duration in days)
- Locations (pickup and return addresses)
- Customer Information (name, email, phone)
- Additional Drivers (names and fees)
- Insurance Coverage (selected options and costs)
- Additional Services (equipment and services with costs)
- Pricing Breakdown (detailed itemization)

**Pricing Breakdown Display**:
- Base rental rate (per day × number of days)
- Insurance costs (itemized by type)
- Additional driver fees (per driver)
- Equipment rental fees (itemized)
- Service fees (itemized)
- Subtotal
- Taxes (itemized by type)
- Airport surcharges (if applicable)
- Discount applied (if any)
- Total Amount Due (prominent display)

**Interactive Features**:
- Edit button for each section
- Clicking edit returns to relevant step
- Apply discount code field
- Save booking for later button (logged-in users)
- Print summary button
- Email summary button

**Behavior**:
- Recalculate totals when returning from edit
- Validate discount codes in real-time
- Show savings from discounts prominently
- Display currency symbol and code
- Format numbers with proper thousands separators

#### Terms and Conditions Component
**Purpose**: Display and require acceptance of legal agreements

**Required Acceptances**:
- Rental agreement terms and conditions
- Cancellation and modification policies
- Privacy policy and data usage
- Age and license requirements confirmation
- Insurance coverage understanding

**Elements Per Agreement**:
- Checkbox for acceptance
- Agreement title
- Brief summary (2-3 sentences)
- "Read Full Terms" link (opens modal or new tab)
- Last updated date

**Full Terms Modal**:
- Scrollable content area
- Section navigation
- Print button
- Download PDF button
- Close button

**Behavior**:
- Disable "Complete Booking" button until all required acceptances checked
- Record timestamp of acceptance
- Record IP address of acceptance
- Highlight unchecked required items when user attempts to proceed
- Show validation error if attempting to proceed without acceptance


### User Flows

#### Vehicle Lock Flow
1. User clicks "Book Now" on vehicle
2. System checks vehicle availability
3. System creates temporary lock (15 minutes)
4. Display lock indicator with countdown
5. User proceeds through booking steps
6. At 2 minutes remaining, show warning
7. Offer "Extend Reservation" button
8. If extended, add 10 more minutes
9. If expired, release lock and redirect to search

#### Pre-Fill and Edit Flow
1. Logged-in user initiates booking
2. System retrieves user profile data
3. Auto-populate all available fields
4. Display "Edit" button next to each field
5. User clicks "Edit" on specific field
6. Field becomes editable
7. User modifies value
8. System validates new value
9. Show "Save to Profile" checkbox
10. User continues with booking
11. If "Save to Profile" checked, update user profile

#### Real-Time Validation Flow
1. User enters data in form field
2. User stops typing (300ms debounce)
3. System validates input format
4. For date fields, check against business rules
5. Display validation result immediately
6. Show green checkmark for valid input
7. Show red error icon and message for invalid input
8. Prevent proceeding to next step if errors exist
9. Re-validate on blur event
10. Clear error when user corrects input

#### Additional Driver Flow
1. User clicks "Add Additional Driver"
2. System displays new driver form card
3. User enters driver information
4. System validates each field in real-time
5. System calculates additional driver fee
6. Update total cost display
7. User can add more drivers (up to limit)
8. User can remove driver by clicking remove button
9. System confirms removal with modal
10. System recalculates total cost
11. User proceeds to next step


#### Insurance Selection Flow
1. User reaches insurance step
2. System displays all available insurance options
3. User clicks "Learn More" on option
4. System displays detailed coverage information
5. User selects desired insurance options
6. System calculates insurance costs
7. Update total cost in real-time
8. User clicks "Compare All"
9. System displays comparison table
10. User makes final selection
11. User proceeds to next step

#### Additional Services Flow
1. User reaches additional services step
2. System displays available services and equipment
3. System checks real-time availability
4. User selects desired services
5. For quantity-based items, user adjusts quantity
6. System calculates service costs
7. Update total cost in real-time
8. If item unavailable, show alternative suggestions
9. User finalizes selections
10. User proceeds to next step

#### Booking Summary Review Flow
1. User reaches review step
2. System displays complete booking summary
3. System shows itemized pricing breakdown
4. User reviews all sections
5. User clicks "Edit" on section needing changes
6. System returns to relevant step
7. User makes changes
8. System recalculates totals
9. User returns to review step
10. User applies discount code (optional)
11. System validates and applies discount
12. User proceeds to payment

#### Terms Acceptance Flow
1. User reaches terms and conditions step
2. System displays all required agreements
3. User clicks "Read Full Terms" link
4. System opens terms modal or new tab
5. User reviews terms
6. User closes modal
7. User checks acceptance checkbox
8. System enables "Complete Booking" button when all checked
9. If user attempts to proceed without acceptance, show error
10. System records acceptance timestamp and IP
11. User proceeds to payment processing


### Data Requirements

#### From Backend APIs

**Vehicle Lock API**:
- Lock duration (default 15 minutes)
- Lock expiration timestamp
- Lock extension capability
- Lock status (active, expired, extended)

**User Profile API**:
- Full name
- Email address
- Phone number
- Date of birth
- Driver's license information
- Saved addresses
- Profile last updated timestamp

**Validation Rules API**:
- Minimum age requirement
- Email format regex
- Phone format per country
- License validation rules
- Required field definitions

**Insurance Options API**:
- Available insurance types
- Coverage descriptions
- Coverage limits
- Deductible amounts
- Pricing (daily and total)
- Mandatory vs optional flags
- Package deals and bundles

**Additional Services API**:
- Available services and equipment
- Service descriptions and specifications
- Availability status
- Quantity limits
- Pricing (daily or flat rate)
- Images and icons

**Pricing Calculation API**:
- Base rental rate
- Insurance costs
- Additional driver fees
- Service fees
- Tax rates and types
- Airport surcharges
- Discount validation and application
- Total calculation

**Terms and Conditions API**:
- Agreement documents
- Agreement versions
- Last updated dates
- Required acceptance flags
- Agreement categories


## Backend Specifications

### API Endpoints

#### POST /api/bookings/lock-vehicle
**Purpose**: Create temporary vehicle lock during booking process

**Request Body**:
```
{
  "vehicleId": "string (UUID)",
  "pickupDate": "string (ISO 8601)",
  "returnDate": "string (ISO 8601)",
  "sessionId": "string (UUID)"
}
```

**Response** (200 OK):
```
{
  "lockId": "string (UUID)",
  "vehicleId": "string (UUID)",
  "expiresAt": "string (ISO 8601)",
  "durationMinutes": "integer",
  "canExtend": "boolean"
}
```

**Business Logic**:
- Check vehicle availability for requested dates
- Create lock record with 15-minute expiration
- Associate lock with user session
- Return lock details
- Prevent other users from booking same vehicle/dates
- Allow only one active lock per session

#### PUT /api/bookings/lock-vehicle/:lockId/extend
**Purpose**: Extend vehicle lock before expiration

**Request Body**:
```
{
  "sessionId": "string (UUID)"
}
```

**Response** (200 OK):
```
{
  "lockId": "string (UUID)",
  "expiresAt": "string (ISO 8601)",
  "extensionsRemaining": "integer"
}
```

**Business Logic**:
- Verify lock belongs to session
- Check extension limit (max 2 extensions)
- Add 10 minutes to expiration
- Return updated expiration time


#### GET /api/users/:userId/profile
**Purpose**: Retrieve user profile for pre-filling booking form

**Response** (200 OK):
```
{
  "userId": "string (UUID)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "dateOfBirth": "string (ISO 8601)",
  "driversLicense": {
    "number": "string",
    "issuingCountry": "string",
    "issuingState": "string",
    "expirationDate": "string (ISO 8601)"
  },
  "lastUpdated": "string (ISO 8601)"
}
```

**Business Logic**:
- Retrieve user profile from database
- Return all available profile fields
- Include last updated timestamp
- Mask sensitive data appropriately

#### POST /api/bookings/validate-customer-info
**Purpose**: Validate customer information in real-time

**Request Body**:
```
{
  "email": "string",
  "phone": "string",
  "dateOfBirth": "string (ISO 8601)",
  "driversLicense": {
    "number": "string",
    "expirationDate": "string (ISO 8601)"
  },
  "rentalStartDate": "string (ISO 8601)"
}
```

**Response** (200 OK):
```
{
  "valid": "boolean",
  "errors": [
    {
      "field": "string",
      "message": "string",
      "code": "string"
    }
  ]
}
```

**Business Logic**:
- Validate email format (RFC 5322)
- Validate phone format for country
- Calculate age from date of birth
- Check minimum age requirement (21 years)
- Verify license expiration is after rental end date
- Return specific validation errors


#### POST /api/bookings/additional-drivers/validate
**Purpose**: Validate additional driver information

**Request Body**:
```
{
  "drivers": [
    {
      "firstName": "string",
      "lastName": "string",
      "dateOfBirth": "string (ISO 8601)",
      "driversLicense": {
        "number": "string",
        "issuingCountry": "string",
        "issuingState": "string",
        "expirationDate": "string (ISO 8601)"
      }
    }
  ],
  "rentalStartDate": "string (ISO 8601)",
  "rentalEndDate": "string (ISO 8601)"
}
```

**Response** (200 OK):
```
{
  "valid": "boolean",
  "drivers": [
    {
      "index": "integer",
      "valid": "boolean",
      "errors": ["array of error objects"],
      "fee": "decimal"
    }
  ],
  "totalFee": "decimal"
}
```

**Business Logic**:
- Validate each driver independently
- Check age requirements
- Verify license validity
- Calculate per-driver fee
- Calculate total additional driver fees
- Return validation results and pricing

#### GET /api/insurance/options
**Purpose**: Retrieve available insurance options for booking

**Query Parameters**:
- vehicleId: string (UUID)
- rentalDuration: integer (days)
- pickupLocation: string

**Response** (200 OK):
```
{
  "options": [
    {
      "id": "string (UUID)",
      "code": "string (CDW, TP, PAI, SLI)",
      "name": "string",
      "description": "string",
      "coverageLimit": "decimal",
      "deductible": "decimal",
      "dailyRate": "decimal",
      "totalCost": "decimal",
      "mandatory": "boolean",
      "whatsCovered": ["array of strings"],
      "whatsNotCovered": ["array of strings"]
    }
  ],
  "packages": [
    {
      "id": "string (UUID)",
      "name": "string",
      "description": "string",
      "includedOptions": ["array of option IDs"],
      "dailyRate": "decimal",
      "totalCost": "decimal",
      "savings": "decimal"
    }
  ]
}
```

**Business Logic**:
- Retrieve insurance options for vehicle category
- Calculate costs based on rental duration
- Identify mandatory coverage
- Calculate package savings
- Return comprehensive insurance information


#### GET /api/services/available
**Purpose**: Retrieve available additional services and equipment

**Query Parameters**:
- vehicleId: string (UUID)
- pickupLocationId: string (UUID)
- pickupDate: string (ISO 8601)
- returnDate: string (ISO 8601)

**Response** (200 OK):
```
{
  "services": [
    {
      "id": "string (UUID)",
      "category": "string (navigation, child-safety, equipment, fuel, convenience)",
      "name": "string",
      "description": "string",
      "specifications": "string",
      "available": "boolean",
      "quantityAvailable": "integer",
      "maxQuantity": "integer",
      "dailyRate": "decimal (nullable)",
      "flatFee": "decimal (nullable)",
      "totalCost": "decimal",
      "imageUrl": "string"
    }
  ]
}
```

**Business Logic**:
- Check service availability at pickup location
- Check equipment inventory for dates
- Calculate costs based on rental duration
- Return availability status
- Provide alternative suggestions for unavailable items

#### POST /api/bookings/calculate-total
**Purpose**: Calculate complete booking total with all selections

**Request Body**:
```
{
  "vehicleId": "string (UUID)",
  "rentalDuration": "integer (days)",
  "pickupLocationId": "string (UUID)",
  "returnLocationId": "string (UUID)",
  "additionalDrivers": "integer",
  "insuranceOptions": ["array of insurance option IDs"],
  "services": [
    {
      "serviceId": "string (UUID)",
      "quantity": "integer"
    }
  ],
  "discountCode": "string (optional)"
}
```

**Response** (200 OK):
```
{
  "breakdown": {
    "baseRate": "decimal",
    "insuranceCosts": [
      {
        "optionId": "string",
        "name": "string",
        "cost": "decimal"
      }
    ],
    "additionalDriverFees": "decimal",
    "serviceFees": [
      {
        "serviceId": "string",
        "name": "string",
        "cost": "decimal"
      }
    ],
    "subtotal": "decimal",
    "taxes": [
      {
        "type": "string",
        "rate": "decimal",
        "amount": "decimal"
      }
    ],
    "airportSurcharge": "decimal (nullable)",
    "discount": {
      "code": "string",
      "amount": "decimal"
    },
    "total": "decimal"
  },
  "currency": "string"
}
```

**Business Logic**:
- Calculate base rental rate
- Sum insurance costs
- Calculate additional driver fees
- Sum service fees
- Calculate applicable taxes
- Apply airport surcharges if applicable
- Validate and apply discount code
- Return itemized breakdown


#### GET /api/terms-and-conditions
**Purpose**: Retrieve terms and conditions documents

**Query Parameters**:
- type: string (rental-agreement, cancellation-policy, privacy-policy)
- version: string (optional, defaults to latest)

**Response** (200 OK):
```
{
  "documents": [
    {
      "id": "string (UUID)",
      "type": "string",
      "title": "string",
      "summary": "string",
      "content": "string (HTML or Markdown)",
      "version": "string",
      "lastUpdated": "string (ISO 8601)",
      "required": "boolean",
      "pdfUrl": "string"
    }
  ]
}
```

**Business Logic**:
- Retrieve latest version of terms documents
- Return document content and metadata
- Provide PDF download links
- Indicate which acceptances are required

#### POST /api/bookings/record-acceptance
**Purpose**: Record customer acceptance of terms and conditions

**Request Body**:
```
{
  "bookingId": "string (UUID)",
  "acceptances": [
    {
      "documentId": "string (UUID)",
      "documentVersion": "string",
      "acceptedAt": "string (ISO 8601)",
      "ipAddress": "string",
      "userAgent": "string"
    }
  ]
}
```

**Response** (200 OK):
```
{
  "recorded": "boolean",
  "acceptanceId": "string (UUID)"
}
```

**Business Logic**:
- Record acceptance timestamp
- Record IP address and user agent
- Associate with booking
- Store document version accepted
- Create audit trail

### Authentication Requirements

All booking workflow endpoints require:
- Valid session token or JWT
- User authentication (except for guest bookings)
- HTTPS/TLS encryption
- CSRF protection for state-changing operations
- Rate limiting to prevent abuse

For guest bookings:
- Session-based authentication
- Email verification before payment
- Temporary session with extended timeout during checkout


## Database Specifications

### Schema Changes

#### VehicleLocks Table (New)
Stores temporary vehicle reservations during booking process.

**Columns**:
- lock_id: CHAR(36) PRIMARY KEY (UUID)
- vehicle_id: CHAR(36) NOT NULL (FK to Vehicles)
- session_id: CHAR(36) NOT NULL
- user_id: CHAR(36) NULL (FK to Users, null for guest bookings)
- pickup_date: DATETIME NOT NULL
- return_date: DATETIME NOT NULL
- created_at: DATETIME NOT NULL
- expires_at: DATETIME NOT NULL
- extension_count: TINYINT DEFAULT 0
- status: ENUM('active', 'expired', 'released') DEFAULT 'active'

**Indexes**:
- idx_vehicle_dates: (vehicle_id, pickup_date, return_date, status)
- idx_expires_at: (expires_at, status)
- idx_session_id: (session_id)

#### AdditionalDrivers Table (New)
Stores additional authorized drivers for bookings.

**Columns**:
- driver_id: CHAR(36) PRIMARY KEY (UUID)
- booking_id: CHAR(36) NOT NULL (FK to Bookings)
- first_name: VARCHAR(100) NOT NULL
- last_name: VARCHAR(100) NOT NULL
- date_of_birth: DATE NOT NULL
- license_number: VARCHAR(50) NOT NULL
- license_issuing_country: VARCHAR(2) NOT NULL
- license_issuing_state: VARCHAR(50) NULL
- license_expiration_date: DATE NOT NULL
- relationship_to_renter: VARCHAR(50) NULL
- fee_amount: DECIMAL(10,2) NOT NULL
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL

**Indexes**:
- idx_booking_id: (booking_id)
- idx_license_number: (license_number)

#### BookingInsurance Table (New)
Stores insurance selections for bookings.

**Columns**:
- booking_insurance_id: CHAR(36) PRIMARY KEY (UUID)
- booking_id: CHAR(36) NOT NULL (FK to Bookings)
- insurance_option_id: CHAR(36) NOT NULL (FK to InsuranceOptions)
- daily_rate: DECIMAL(10,2) NOT NULL
- total_cost: DECIMAL(10,2) NOT NULL
- created_at: DATETIME NOT NULL

**Indexes**:
- idx_booking_id: (booking_id)
- idx_insurance_option_id: (insurance_option_id)


#### BookingServices Table (New)
Stores additional services and equipment for bookings.

**Columns**:
- booking_service_id: CHAR(36) PRIMARY KEY (UUID)
- booking_id: CHAR(36) NOT NULL (FK to Bookings)
- service_id: CHAR(36) NOT NULL (FK to Services)
- quantity: INT NOT NULL DEFAULT 1
- daily_rate: DECIMAL(10,2) NULL
- flat_fee: DECIMAL(10,2) NULL
- total_cost: DECIMAL(10,2) NOT NULL
- created_at: DATETIME NOT NULL

**Indexes**:
- idx_booking_id: (booking_id)
- idx_service_id: (service_id)

#### TermsAcceptances Table (New)
Records customer acceptance of terms and conditions.

**Columns**:
- acceptance_id: CHAR(36) PRIMARY KEY (UUID)
- booking_id: CHAR(36) NOT NULL (FK to Bookings)
- document_id: CHAR(36) NOT NULL (FK to TermsDocuments)
- document_version: VARCHAR(20) NOT NULL
- accepted_at: DATETIME NOT NULL
- ip_address: VARCHAR(45) NOT NULL
- user_agent: VARCHAR(500) NOT NULL
- created_at: DATETIME NOT NULL

**Indexes**:
- idx_booking_id: (booking_id)
- idx_document_id: (document_id)
- idx_accepted_at: (accepted_at)

#### InsuranceOptions Table (New)
Stores available insurance options.

**Columns**:
- insurance_option_id: CHAR(36) PRIMARY KEY (UUID)
- code: VARCHAR(10) NOT NULL UNIQUE (CDW, TP, PAI, SLI)
- name: VARCHAR(100) NOT NULL
- description: TEXT NOT NULL
- coverage_limit: DECIMAL(12,2) NOT NULL
- deductible: DECIMAL(10,2) NOT NULL
- daily_rate: DECIMAL(10,2) NOT NULL
- mandatory: BOOLEAN DEFAULT FALSE
- whats_covered: JSON NOT NULL
- whats_not_covered: JSON NOT NULL
- active: BOOLEAN DEFAULT TRUE
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL

**Indexes**:
- idx_code: (code)
- idx_active: (active)


#### Services Table (New)
Stores available additional services and equipment.

**Columns**:
- service_id: CHAR(36) PRIMARY KEY (UUID)
- category: ENUM('navigation', 'child-safety', 'equipment', 'fuel', 'convenience') NOT NULL
- name: VARCHAR(100) NOT NULL
- description: TEXT NOT NULL
- specifications: TEXT NULL
- daily_rate: DECIMAL(10,2) NULL
- flat_fee: DECIMAL(10,2) NULL
- max_quantity: INT DEFAULT 1
- image_url: VARCHAR(500) NULL
- active: BOOLEAN DEFAULT TRUE
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL

**Indexes**:
- idx_category: (category, active)
- idx_active: (active)

#### ServiceInventory Table (New)
Tracks equipment inventory at locations.

**Columns**:
- inventory_id: CHAR(36) PRIMARY KEY (UUID)
- service_id: CHAR(36) NOT NULL (FK to Services)
- location_id: CHAR(36) NOT NULL (FK to Locations)
- quantity_available: INT NOT NULL
- quantity_total: INT NOT NULL
- created_at: DATETIME NOT NULL
- updated_at: DATETIME NOT NULL

**Indexes**:
- idx_service_location: (service_id, location_id)
- idx_location_id: (location_id)

#### TermsDocuments Table (New)
Stores terms and conditions documents.

**Columns**:
- document_id: CHAR(36) PRIMARY KEY (UUID)
- type: ENUM('rental-agreement', 'cancellation-policy', 'privacy-policy', 'age-license-requirements', 'insurance-understanding') NOT NULL
- title: VARCHAR(200) NOT NULL
- summary: TEXT NOT NULL
- content: LONGTEXT NOT NULL
- version: VARCHAR(20) NOT NULL
- required: BOOLEAN DEFAULT TRUE
- pdf_url: VARCHAR(500) NULL
- effective_date: DATE NOT NULL
- last_updated: DATETIME NOT NULL
- created_at: DATETIME NOT NULL

**Indexes**:
- idx_type_version: (type, version)
- idx_effective_date: (effective_date)


### Table Definitions

#### VehicleLocks Table
**Purpose**: Prevent double-booking by temporarily reserving vehicles during checkout

**Key Constraints**:
- PRIMARY KEY: lock_id
- FOREIGN KEY: vehicle_id REFERENCES Vehicles(vehicle_id)
- FOREIGN KEY: user_id REFERENCES Users(user_id) ON DELETE SET NULL
- CHECK: expires_at > created_at
- CHECK: return_date > pickup_date
- CHECK: extension_count <= 2

**Business Rules**:
- Only one active lock per vehicle/date combination
- Locks expire after 15 minutes by default
- Maximum 2 extensions allowed (10 minutes each)
- Expired locks are automatically cleaned up by scheduled job

#### AdditionalDrivers Table
**Purpose**: Store authorized drivers beyond primary renter

**Key Constraints**:
- PRIMARY KEY: driver_id
- FOREIGN KEY: booking_id REFERENCES Bookings(booking_id) ON DELETE CASCADE
- CHECK: license_expiration_date > date_of_birth
- CHECK: fee_amount >= 0

**Business Rules**:
- Maximum 4 additional drivers per booking
- Each driver must meet age requirements
- License must be valid during rental period
- Fee calculated based on rental duration

#### BookingInsurance Table
**Purpose**: Track insurance selections for bookings

**Key Constraints**:
- PRIMARY KEY: booking_insurance_id
- FOREIGN KEY: booking_id REFERENCES Bookings(booking_id) ON DELETE CASCADE
- FOREIGN KEY: insurance_option_id REFERENCES InsuranceOptions(insurance_option_id)
- CHECK: total_cost >= 0
- CHECK: daily_rate >= 0

**Business Rules**:
- Multiple insurance options can be selected per booking
- Mandatory insurance automatically included
- Costs calculated based on rental duration


#### BookingServices Table
**Purpose**: Track additional services and equipment for bookings

**Key Constraints**:
- PRIMARY KEY: booking_service_id
- FOREIGN KEY: booking_id REFERENCES Bookings(booking_id) ON DELETE CASCADE
- FOREIGN KEY: service_id REFERENCES Services(service_id)
- CHECK: quantity > 0
- CHECK: total_cost >= 0
- CHECK: (daily_rate IS NOT NULL AND flat_fee IS NULL) OR (daily_rate IS NULL AND flat_fee IS NOT NULL)

**Business Rules**:
- Service has either daily rate or flat fee, not both
- Quantity limited by service max_quantity
- Availability checked against ServiceInventory

#### TermsAcceptances Table
**Purpose**: Legal record of customer agreement to terms

**Key Constraints**:
- PRIMARY KEY: acceptance_id
- FOREIGN KEY: booking_id REFERENCES Bookings(booking_id) ON DELETE CASCADE
- FOREIGN KEY: document_id REFERENCES TermsDocuments(document_id)
- UNIQUE: (booking_id, document_id)

**Business Rules**:
- Each required document must be accepted once per booking
- Acceptance timestamp and IP recorded for legal compliance
- Document version recorded for audit trail
- Cannot delete acceptance records (audit requirement)

### Relationships

**VehicleLocks**:
- Many-to-one with Vehicles (many locks can exist for one vehicle over time)
- Many-to-one with Users (one user can have multiple locks)

**AdditionalDrivers**:
- Many-to-one with Bookings (one booking can have multiple additional drivers)

**BookingInsurance**:
- Many-to-one with Bookings (one booking can have multiple insurance options)
- Many-to-one with InsuranceOptions (one option can be selected by many bookings)

**BookingServices**:
- Many-to-one with Bookings (one booking can have multiple services)
- Many-to-one with Services (one service can be selected by many bookings)

**TermsAcceptances**:
- Many-to-one with Bookings (one booking has multiple acceptances)
- Many-to-one with TermsDocuments (one document accepted by many bookings)

**ServiceInventory**:
- Many-to-one with Services (one service available at multiple locations)
- Many-to-one with Locations (one location has multiple services)


### Indexes

**Performance Optimization**:

VehicleLocks:
- idx_vehicle_dates: Optimize availability checks during booking
- idx_expires_at: Efficient cleanup of expired locks
- idx_session_id: Quick lookup of user's active locks

AdditionalDrivers:
- idx_booking_id: Fast retrieval of drivers for booking
- idx_license_number: Duplicate driver detection

BookingInsurance:
- idx_booking_id: Retrieve insurance for booking display
- idx_insurance_option_id: Analytics on popular insurance options

BookingServices:
- idx_booking_id: Retrieve services for booking display
- idx_service_id: Analytics on popular services

TermsAcceptances:
- idx_booking_id: Retrieve acceptances for booking verification
- idx_document_id: Track acceptance rates per document
- idx_accepted_at: Time-based analytics

InsuranceOptions:
- idx_code: Quick lookup by insurance code
- idx_active: Filter active options

Services:
- idx_category: Filter services by category
- idx_active: Filter active services

ServiceInventory:
- idx_service_location: Check availability at specific location
- idx_location_id: List all services at location

TermsDocuments:
- idx_type_version: Retrieve specific document version
- idx_effective_date: Get current effective documents


## Technology Stack

### Frontend
- Next.js 14+ with React 18+ for booking interface
- TypeScript for type safety
- React Hook Form for form management and validation
- Zod for schema validation
- TanStack Query for API state management
- Tailwind CSS for responsive styling
- Framer Motion for smooth transitions between steps
- date-fns for date manipulation and formatting

### Backend
- .NET 8+ with C# for API services
- ASP.NET Core Web API for RESTful endpoints
- Entity Framework Core for database access
- FluentValidation for request validation
- MediatR for CQRS pattern
- Hangfire for background job processing (lock cleanup)
- Serilog for structured logging

### Database
- MySQL 8.0+ with InnoDB storage engine
- JSON columns for flexible data (insurance coverage details)
- Full-text indexes for terms document search
- Partitioning for TermsAcceptances table (by date)

### Security
- JWT tokens for authentication
- HTTPS/TLS for all communications
- CSRF protection for state-changing operations
- Rate limiting on validation endpoints
- Input sanitization and validation
- SQL injection prevention via parameterized queries
- XSS protection via content security policy


## Implementation Notes

### Vehicle Lock Management
- Implement background job to clean up expired locks every minute
- Consider implementing lock extension notifications (push or polling)
- Monitor lock expiration rates to optimize default duration
- Implement graceful handling of lock expiration during checkout
- Consider implementing "save for later" feature for logged-in users

### Pre-Fill Optimization
- Cache user profile data in session storage for performance
- Implement optimistic UI updates when editing pre-filled data
- Consider implementing profile completeness indicator
- Prompt users to update outdated information (e.g., expired license)
- Implement profile update confirmation after booking completion

### Validation Strategy
- Use debounced validation (300ms) to reduce API calls
- Implement client-side validation first, then server-side confirmation
- Cache validation rules to reduce API calls
- Provide clear, actionable error messages
- Consider implementing progressive validation (validate as user progresses)

### Additional Drivers
- Implement driver information reuse for repeat customers
- Consider implementing driver profiles for corporate accounts
- Validate driver age requirements based on vehicle category
- Implement duplicate driver detection (same license number)
- Consider implementing driver pre-approval for corporate accounts

### Insurance Selection
- Implement A/B testing for insurance presentation
- Track insurance selection rates by option
- Consider implementing insurance recommendation engine
- Provide clear comparison tools
- Implement insurance education content (videos, infographics)
- Consider implementing insurance bundling discounts

### Additional Services
- Implement real-time inventory checking
- Consider implementing service recommendations based on booking details
- Track service selection rates for inventory planning
- Implement alternative suggestions for unavailable items
- Consider implementing service bundles (e.g., family package)


### Booking Summary
- Implement edit functionality that preserves other selections
- Consider implementing booking summary email before payment
- Implement print-friendly summary view
- Track which sections users edit most frequently
- Consider implementing summary comparison for modifications

### Terms and Conditions
- Implement version control for terms documents
- Track acceptance rates per document
- Consider implementing terms change notifications for existing customers
- Implement terms document search functionality
- Consider implementing terms summary videos
- Ensure accessibility compliance for terms documents (screen readers)

### Performance Considerations
- Implement progressive loading for booking steps
- Cache insurance and service options
- Optimize pricing calculation API calls
- Implement optimistic UI updates where appropriate
- Consider implementing booking draft auto-save
- Monitor and optimize API response times

### Mobile Optimization
- Ensure all components are mobile-responsive
- Implement touch-friendly form controls
- Consider implementing mobile-specific validation (e.g., camera for license scanning)
- Optimize for slower mobile connections
- Implement mobile-specific navigation patterns

### Analytics and Monitoring
- Track completion rates per booking step
- Monitor abandonment points
- Track insurance and service selection rates
- Monitor validation error rates
- Track lock expiration and extension rates
- Monitor API performance and error rates
- Implement conversion funnel analysis

### Accessibility
- Ensure WCAG 2.1 AA compliance
- Implement keyboard navigation
- Provide screen reader support
- Use semantic HTML
- Implement proper ARIA labels
- Ensure sufficient color contrast
- Provide alternative text for images

### Testing Strategy
- Unit tests for validation logic
- Integration tests for API endpoints
- End-to-end tests for complete booking flow
- Load testing for concurrent bookings
- Security testing for payment and data handling
- Accessibility testing with screen readers
- Cross-browser compatibility testing
- Mobile device testing


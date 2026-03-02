# Feature: Multi-Step Booking Checkout

## Overview

The Multi-Step Booking Checkout is a streamlined, guided workflow that transforms a customer's vehicle selection into a confirmed reservation. This feature provides a clear, step-by-step process from vehicle selection through payment confirmation, with progress indication, real-time validation, and comprehensive error handling. The workflow optimizes conversion rates by reducing friction while ensuring all necessary information is collected and validated.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-001: Multi-Step Checkout Process
- F-WF-BOOK-001: Multi-Step Booking Checkout

## User Stories

### As an individual customer
I want a clear, guided booking process with progress indication, so that I understand what information is needed and how close I am to completing my reservation.

### As a business traveler
I want my information pre-filled from my account, so that I can complete bookings quickly without re-entering the same details repeatedly.

### As a first-time user
I want inline validation and helpful error messages, so that I can correct mistakes immediately and complete my booking without frustration.

### As a customer with changing plans
I want to review my complete booking before payment, so that I can verify all details are correct and make changes if needed.

### As a mobile user
I want a responsive checkout flow optimized for mobile devices, so that I can complete bookings easily on my phone.


## Frontend Specifications

### Pages

#### Booking Checkout Page (`/booking/checkout`)
Multi-step form interface with progress indicator, step navigation, and responsive layout for completing vehicle reservations.

**Route Parameters:**
- Vehicle ID
- Pickup date/time
- Return date/time
- Pickup location
- Return location

**Page Sections:**
- Progress indicator (step tracker)
- Current step content area
- Pricing summary sidebar (sticky)
- Navigation buttons (Back, Continue, Complete Booking)
- Help/support access

### UI Components

#### Progress Indicator Component
Visual step tracker showing current position in checkout flow.

**Features:**
- 6 steps: Vehicle Selection → Customer Info → Additional Options → Payment → Review → Confirmation
- Current step highlighted
- Completed steps marked with checkmark
- Future steps grayed out
- Click completed steps to navigate back
- Mobile: Condensed progress bar with step numbers
- Desktop: Full step names with icons


#### Step 1: Vehicle Selection Confirmation
Display selected vehicle details with rental period summary.

**Display Elements:**
- Vehicle image and name
- Vehicle category and features
- Pickup/return dates, times, and locations
- Rental duration (days/hours)
- Base price per day
- Edit search criteria link
- Continue to customer information button

#### Step 2: Customer Information Form
Collect and validate customer personal and contact details.

**Form Fields:**
- Full name (first and last name - required)
- Email address (required, validated format)
- Phone number (required, validated format with country code)
- Date of birth (required, age validation)
- Driver's license number (required)
- Driver's license issuing country/state (required)
- Driver's license expiration date (required, must be valid during rental)
- Secondary phone number (optional)
- Special requests/notes (optional textarea)

**Features:**
- Pre-fill for logged-in users with edit capability
- Real-time validation with inline error messages
- Age calculation and minimum age verification (typically 21+)
- License expiration validation
- Email format validation
- Phone number format validation with country-specific patterns
- Save information to profile option (for logged-in users)
- Guest checkout option with account creation prompt
- Form field tooltips for guidance


#### Step 3: Additional Options Selection
Select insurance, additional drivers, and optional services.

**Insurance Section:**
- Collision Damage Waiver (CDW) with coverage details
- Theft Protection (TP) with coverage details
- Personal Accident Insurance (PAI) with coverage details
- Supplemental Liability Insurance (SLI) with coverage details
- Full Protection package option
- Coverage comparison table
- Cost per day and total cost for each option
- Recommended coverage badge
- "What's covered" expandable details

**Additional Drivers Section:**
- Add additional driver button
- Driver information form (name, DOB, license details)
- Multiple driver support (up to 3-4)
- Per-driver fee display
- Remove driver option
- Age validation for each driver

**Additional Services Section:**
- GPS Navigation System (daily fee)
- Child Safety Seats (infant/toddler/booster with quantity selector)
- Additional equipment (ski racks, bike racks, snow chains)
- Fuel options (prepaid fuel, fuel service charge)
- Toll passes (electronic toll collection)
- WiFi hotspot device
- Service descriptions with images
- Availability indicators
- Cost calculation based on rental duration


#### Step 4: Payment Method Selection
Choose payment method and provide payment details.

**Payment Options:**
- Credit card (Visa, Mastercard, Amex, Discover)
- Debit card
- Digital wallets (Apple Pay, Google Pay, PayPal)
- Pay at counter option (if enabled)

**Credit/Debit Card Form:**
- Card number (validated format, card type detection)
- Cardholder name
- Expiration date (MM/YY format)
- CVV/CVC security code
- Billing address (if required)
- Save card for future use checkbox (logged-in users)

**Features:**
- Display saved payment methods for logged-in users
- Secure payment indicators (SSL badge, PCI compliance)
- Real-time card validation
- Card type logo display
- One-click digital wallet authentication
- Payment timing options (pay in full, pay deposit, pay at counter)
- Security assurance messaging


#### Step 5: Review and Confirm
Complete booking summary with itemized pricing and terms acceptance.

**Summary Sections:**
- Vehicle information (make, model, category, features)
- Rental period (pickup/return dates, times, duration)
- Locations (pickup and return addresses with map links)
- Customer information (name, email, phone)
- Additional drivers (names and fees)
- Insurance coverage (selected options and costs)
- Additional services (equipment and services with costs)
- Discount/promo code application section

**Pricing Breakdown:**
- Base rental rate (per-day breakdown)
- Insurance costs (itemized)
- Additional driver fees
- Equipment rental fees
- Taxes and fees (itemized by type)
- Airport surcharges (if applicable)
- Discount amount (if applied)
- Total amount due (prominently displayed)

**Terms and Conditions:**
- Rental agreement checkbox with link to full terms
- Cancellation policy checkbox with link to policy
- Modification policy checkbox with link to policy
- Privacy policy checkbox with link
- Age and license requirements confirmation checkbox
- Insurance coverage understanding checkbox

**Actions:**
- Edit any section (returns to relevant step)
- Apply discount/promo code
- Complete booking button
- Cancel booking link
- Save for later option (logged-in users)


#### Step 6: Booking Confirmation
Display confirmation details and next steps.

**Confirmation Display:**
- Success message with animation
- Booking reference number (large, prominent, copyable)
- Complete booking summary
- Pickup instructions and location details
- What to bring checklist (ID, credit card, license)
- Contact information for questions
- QR code for quick check-in

**Actions:**
- Add to calendar button
- Download PDF confirmation
- Print confirmation
- Email confirmation (resend option)
- View booking details
- Modify booking link
- Cancel booking link
- Share booking details
- Create account prompt (for guest bookings)
- Return to homepage
- Search for another vehicle

#### Pricing Summary Sidebar
Sticky sidebar showing real-time pricing updates throughout checkout.

**Display Elements:**
- Vehicle thumbnail and name
- Rental duration
- Base rental cost
- Insurance costs (if selected)
- Additional driver fees (if added)
- Equipment fees (if selected)
- Taxes and fees
- Discount amount (if applied)
- Total amount due (prominent)
- Currency indicator
- Price breakdown toggle

**Features:**
- Updates in real-time as options selected
- Sticky positioning on scroll
- Responsive: Collapses to bottom bar on mobile
- Expandable/collapsible on mobile


### User Flows

#### Happy Path: Complete Booking Flow
1. User clicks "Book Now" on selected vehicle
2. System displays Step 1 (Vehicle Confirmation) with vehicle details
3. User reviews vehicle and clicks "Continue"
4. System displays Step 2 (Customer Information)
5. User enters/verifies personal details
6. System validates information in real-time
7. User clicks "Continue"
8. System displays Step 3 (Additional Options)
9. User selects insurance, adds drivers (optional), selects services (optional)
10. System updates pricing in sidebar
11. User clicks "Continue"
12. System displays Step 4 (Payment Method)
13. User enters payment details or selects saved method
14. System validates payment information
15. User clicks "Continue"
16. System displays Step 5 (Review & Confirm)
17. User reviews complete booking summary
18. User accepts terms and conditions
19. User clicks "Complete Booking"
20. System processes payment
21. System creates booking record
22. System displays Step 6 (Confirmation)
23. System sends confirmation email/SMS
24. User views confirmation and downloads/prints if desired

#### Logged-In User Flow
1. User clicks "Book Now" on selected vehicle
2. System pre-fills customer information from profile
3. System displays saved payment methods
4. User verifies pre-filled information
5. User selects options and saved payment method
6. User completes booking in under 2 minutes


#### Guest User Flow
1. User completes booking without account
2. System offers account creation after confirmation
3. User can create account with booking data pre-filled
4. System adds completed booking to new account history

#### Edit Previous Step Flow
1. User on Step 5 (Review) wants to change insurance
2. User clicks "Edit" on insurance section
3. System navigates back to Step 3 (Additional Options)
4. User modifies insurance selection
5. System updates pricing
6. User clicks "Continue"
7. System returns to Step 5 (Review) with updated information

#### Discount Code Application Flow
1. User on Step 5 (Review) enters promo code
2. System validates code
3. If valid: System applies discount and updates pricing
4. If invalid: System displays error message with reason
5. User can try different code or proceed without discount

#### Payment Declined Flow
1. User completes Step 5 and clicks "Complete Booking"
2. System processes payment
3. Payment gateway declines payment
4. System displays error message with reason
5. System maintains booking information
6. User can try different payment method
7. System extends vehicle lock temporarily
8. User re-enters payment details and retries


### Data Requirements

#### From Backend APIs

**Vehicle Availability Check:**
- GET `/api/vehicles/{vehicleId}/availability`
- Query params: pickupDate, returnDate, locationId
- Response: availability status, temporary lock token

**Customer Information Validation:**
- POST `/api/bookings/validate-customer`
- Request: customer details, license information
- Response: validation results, age verification, license validity

**Pricing Calculation:**
- POST `/api/bookings/calculate-price`
- Request: vehicle, dates, insurance options, services, drivers
- Response: itemized pricing breakdown, total amount

**Insurance Options:**
- GET `/api/insurance/options`
- Query params: vehicleId, rentalDuration
- Response: available insurance packages with coverage details and pricing

**Additional Services:**
- GET `/api/services/available`
- Query params: locationId, dates
- Response: available services with descriptions, pricing, and availability

**Discount Code Validation:**
- POST `/api/promotions/validate`
- Request: promo code, booking details
- Response: discount amount, validity, terms

**Payment Processing:**
- POST `/api/payments/process`
- Request: payment details, booking information, amount
- Response: payment confirmation, transaction ID

**Booking Creation:**
- POST `/api/bookings`
- Request: complete booking details
- Response: booking confirmation, reference number, confirmation details


#### State Management

**Booking State Object:**
```
{
  vehicleId: string
  pickupDateTime: DateTime
  returnDateTime: DateTime
  pickupLocationId: string
  returnLocationId: string
  customer: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: Date
    license: {
      number: string
      issuingLocation: string
      expirationDate: Date
    }
    secondaryPhone?: string
    specialRequests?: string
  }
  additionalDrivers: Array<DriverInfo>
  insurance: {
    cdw: boolean
    tp: boolean
    pai: boolean
    sli: boolean
    fullProtection: boolean
  }
  services: {
    gps: boolean
    childSeats: Array<{type: string, quantity: number}>
    equipment: Array<string>
    fuelOption: string
    tollPass: boolean
    wifi: boolean
  }
  payment: {
    method: string
    cardToken?: string
    billingAddress?: Address
  }
  pricing: {
    baseRate: number
    insuranceCost: number
    driverFees: number
    serviceFees: number
    taxes: number
    discount: number
    total: number
  }
  promoCode?: string
  termsAccepted: boolean
  currentStep: number
  vehicleLockToken: string
}
```


#### Validation Rules

**Customer Information:**
- First name: Required, 2-50 characters, letters only
- Last name: Required, 2-50 characters, letters only
- Email: Required, valid email format
- Phone: Required, valid format for selected country
- Date of birth: Required, age >= 21 years (configurable minimum)
- License number: Required, alphanumeric
- License expiration: Required, must be valid through return date

**Payment Information:**
- Card number: Required, valid card number (Luhn algorithm)
- Cardholder name: Required, matches customer name
- Expiration date: Required, not expired
- CVV: Required, 3-4 digits
- Billing address: Required if payment gateway requires

**Business Rules:**
- Minimum rental duration: 1 hour (configurable)
- Maximum rental duration: 30 days (configurable)
- Pickup time must be in future
- Return time must be after pickup time
- Additional driver age >= 21 years
- Maximum 4 additional drivers
- At least one insurance option recommended

#### Responsive Design Requirements

**Mobile (< 768px):**
- Single column layout
- Pricing summary collapses to bottom bar
- Progress indicator shows step numbers only
- Form fields stack vertically
- Touch-optimized buttons (min 44px height)
- Simplified navigation

**Tablet (768px - 1024px):**
- Two column layout (form + sidebar)
- Full progress indicator
- Optimized spacing

**Desktop (> 1024px):**
- Two column layout with wider sidebar
- Full progress indicator with step names
- Hover states on interactive elements
- Keyboard navigation support


## Backend Specifications

### API Endpoints

#### Check Vehicle Availability
**Endpoint:** `GET /api/vehicles/{vehicleId}/availability`

**Purpose:** Verify vehicle is available for selected dates and create temporary lock

**Query Parameters:**
- `pickupDate` (required): ISO 8601 datetime
- `returnDate` (required): ISO 8601 datetime
- `locationId` (required): Pickup location ID

**Response (200 OK):**
```
{
  available: boolean
  lockToken: string
  lockExpiresAt: DateTime
  pricing: {
    baseRate: number
    currency: string
  }
}
```

**Response (409 Conflict):**
```
{
  available: false
  reason: string
  alternativeVehicles: Array<VehicleId>
}
```

#### Validate Customer Information
**Endpoint:** `POST /api/bookings/validate-customer`

**Purpose:** Validate customer details and verify age/license requirements

**Request Body:**
```
{
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date
  license: {
    number: string
    issuingLocation: string
    expirationDate: Date
  }
}
```

**Response (200 OK):**
```
{
  valid: boolean
  errors: Array<{field: string, message: string}>
  ageVerified: boolean
  licenseValid: boolean
}
```


#### Calculate Booking Price
**Endpoint:** `POST /api/bookings/calculate-price`

**Purpose:** Calculate total booking cost with all options and fees

**Request Body:**
```
{
  vehicleId: string
  pickupDateTime: DateTime
  returnDateTime: DateTime
  locationId: string
  insurance: {
    cdw: boolean
    tp: boolean
    pai: boolean
    sli: boolean
    fullProtection: boolean
  }
  additionalDrivers: number
  services: Array<{serviceId: string, quantity: number}>
  promoCode?: string
}
```

**Response (200 OK):**
```
{
  breakdown: {
    baseRate: number
    insuranceCost: number
    driverFees: number
    serviceFees: Array<{name: string, cost: number}>
    taxes: Array<{name: string, amount: number}>
    fees: Array<{name: string, amount: number}>
    discount: number
  }
  total: number
  currency: string
}
```

#### Get Insurance Options
**Endpoint:** `GET /api/insurance/options`

**Purpose:** Retrieve available insurance packages for vehicle and rental period

**Query Parameters:**
- `vehicleId` (required): Vehicle identifier
- `rentalDuration` (required): Duration in days

**Response (200 OK):**
```
{
  options: Array<{
    id: string
    name: string
    description: string
    coverageDetails: string
    costPerDay: number
    totalCost: number
    deductible: number
    recommended: boolean
  }>
}
```


#### Get Available Services
**Endpoint:** `GET /api/services/available`

**Purpose:** Retrieve available additional services for location and dates

**Query Parameters:**
- `locationId` (required): Pickup location ID
- `pickupDate` (required): ISO 8601 datetime
- `returnDate` (required): ISO 8601 datetime

**Response (200 OK):**
```
{
  services: Array<{
    id: string
    name: string
    description: string
    category: string
    costPerDay: number
    flatRate: number
    available: boolean
    maxQuantity: number
    imageUrl: string
  }>
}
```

#### Validate Promo Code
**Endpoint:** `POST /api/promotions/validate`

**Purpose:** Validate promotional code and calculate discount

**Request Body:**
```
{
  promoCode: string
  vehicleId: string
  pickupDate: DateTime
  returnDate: DateTime
  totalAmount: number
}
```

**Response (200 OK):**
```
{
  valid: boolean
  discountAmount: number
  discountPercentage: number
  message: string
}
```

**Response (400 Bad Request):**
```
{
  valid: false
  reason: string
  suggestions: Array<string>
}
```


#### Process Payment
**Endpoint:** `POST /api/payments/process`

**Purpose:** Process payment through payment gateway

**Request Body:**
```
{
  amount: number
  currency: string
  paymentMethod: {
    type: string
    cardToken?: string
    walletType?: string
  }
  bookingDetails: {
    vehicleId: string
    customerId: string
    dates: {pickup: DateTime, return: DateTime}
  }
}
```

**Response (200 OK):**
```
{
  success: boolean
  transactionId: string
  authorizationCode: string
  capturedAmount: number
}
```

**Response (402 Payment Required):**
```
{
  success: false
  reason: string
  declineCode: string
  retryAllowed: boolean
}
```

#### Create Booking
**Endpoint:** `POST /api/bookings`

**Purpose:** Create confirmed booking record

**Request Body:**
```
{
  vehicleId: string
  customer: CustomerInfo
  additionalDrivers: Array<DriverInfo>
  pickupDateTime: DateTime
  returnDateTime: DateTime
  pickupLocationId: string
  returnLocationId: string
  insurance: InsuranceSelection
  services: Array<ServiceSelection>
  payment: {
    transactionId: string
    amount: number
  }
  promoCode?: string
  lockToken: string
}
```

**Response (201 Created):**
```
{
  bookingId: string
  referenceNumber: string
  status: string
  confirmationDetails: {
    email: string
    sms: string
    qrCode: string
  }
  pickupInstructions: string
}
```


### Request/Response Schemas

#### CustomerInfo Schema
```
{
  firstName: string (2-50 chars)
  lastName: string (2-50 chars)
  email: string (valid email format)
  phone: string (E.164 format)
  dateOfBirth: Date (ISO 8601)
  license: {
    number: string (alphanumeric)
    issuingLocation: string
    expirationDate: Date (ISO 8601)
  }
  secondaryPhone?: string (E.164 format)
  specialRequests?: string (max 500 chars)
}
```

#### DriverInfo Schema
```
{
  firstName: string (2-50 chars)
  lastName: string (2-50 chars)
  dateOfBirth: Date (ISO 8601)
  license: {
    number: string (alphanumeric)
    issuingLocation: string
    expirationDate: Date (ISO 8601)
  }
}
```

#### InsuranceSelection Schema
```
{
  cdw: boolean
  tp: boolean
  pai: boolean
  sli: boolean
  fullProtection: boolean
}
```

#### ServiceSelection Schema
```
{
  serviceId: string
  quantity: number (min: 1)
  costPerDay: number
  totalCost: number
}
```


### Business Logic

#### Vehicle Lock Management
- Create temporary vehicle lock when booking initiated (5-15 minute duration)
- Extend lock when user progresses through steps
- Release lock on booking completion or abandonment
- Prevent double-booking through lock token validation
- Handle lock expiration gracefully with user notification

#### Age Verification
- Calculate age from date of birth
- Verify customer meets minimum age requirement (configurable, typically 21)
- Apply young driver surcharge if age 21-24 (configurable)
- Verify additional drivers meet age requirements
- Store age verification timestamp for compliance

#### License Validation
- Verify license expiration date is after rental return date
- Validate license number format based on issuing location
- Check license against blacklist/suspension database (if integrated)
- Store license verification details for pickup process
- Flag international licenses for additional verification at pickup

#### Pricing Calculation
- Calculate base rental rate based on vehicle and duration
- Apply time-based discounts (weekly, monthly rates)
- Calculate insurance costs based on selections and duration
- Calculate additional driver fees (per driver, per day or flat rate)
- Calculate service fees based on selections and duration
- Apply taxes based on location and rental type
- Apply airport surcharges if applicable
- Apply promotional discounts
- Calculate final total with all components
- Store pricing breakdown for transparency and dispute resolution


#### Payment Processing
- Tokenize payment card details through payment gateway
- Authorize payment amount before booking creation
- Implement 3D Secure authentication for supported cards
- Handle payment gateway responses (success, decline, error)
- Store transaction ID and authorization code
- Capture payment on successful booking creation
- Handle partial captures for deposit payments
- Implement retry logic for transient payment failures
- Log all payment attempts for audit trail
- Comply with PCI DSS requirements (no card storage)

#### Booking Creation
- Validate all required information present
- Perform final vehicle availability check
- Create booking record with unique reference number
- Update vehicle availability calendar
- Store complete booking details
- Generate confirmation materials (email, SMS, QR code)
- Send notifications to customer
- Notify location/supplier of new booking
- Create pickup checklist for staff
- Update analytics and reporting
- Process loyalty points if applicable
- Release vehicle lock token

#### Discount Code Validation
- Verify code exists and is active
- Check code expiration date
- Verify usage limits not exceeded
- Validate code eligibility (vehicle types, dates, user segments)
- Calculate discount amount (percentage or fixed)
- Apply discount to appropriate line items
- Store code usage for tracking
- Prevent code stacking unless explicitly allowed


### Authentication Requirements

#### Public Endpoints (No Authentication)
- Check vehicle availability
- Get insurance options
- Get available services
- Calculate booking price (guest users)

#### Authenticated Endpoints (JWT Required)
- Validate customer information (for logged-in users)
- Get saved payment methods
- Create booking (for logged-in users)
- Apply user-specific discounts

#### Guest Checkout Support
- Allow booking creation without authentication
- Generate temporary session token for booking process
- Store minimal customer information
- Offer account creation post-booking
- Link booking to account if created

#### Security Measures
- Rate limiting on all endpoints (prevent abuse)
- CAPTCHA on booking submission (prevent bots)
- Payment card tokenization (PCI compliance)
- HTTPS required for all checkout pages
- Session timeout after 30 minutes of inactivity
- CSRF protection on form submissions
- Input sanitization to prevent injection attacks
- Audit logging of all booking attempts


## Database Specifications

### Schema Changes

#### Bookings Table
New table to store booking records.

**Table Name:** `Bookings`

**Columns:**
- `BookingId` (CHAR(36), PRIMARY KEY): Unique booking identifier (GUID)
- `ReferenceNumber` (VARCHAR(20), UNIQUE, NOT NULL): Customer-facing booking reference
- `VehicleId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Vehicles table
- `CustomerId` (CHAR(36), FOREIGN KEY, NULLABLE): Reference to Users table (null for guest)
- `PickupDateTime` (DATETIME, NOT NULL): Scheduled pickup date and time
- `ReturnDateTime` (DATETIME, NOT NULL): Scheduled return date and time
- `PickupLocationId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Locations table
- `ReturnLocationId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Locations table
- `Status` (VARCHAR(20), NOT NULL): Booking status (Pending, Confirmed, Active, Completed, Cancelled)
- `TotalAmount` (DECIMAL(10,2), NOT NULL): Total booking cost
- `Currency` (CHAR(3), NOT NULL): Currency code (ISO 4217)
- `PaymentStatus` (VARCHAR(20), NOT NULL): Payment status (Pending, Authorized, Captured, Refunded)
- `TransactionId` (VARCHAR(100), NULLABLE): Payment gateway transaction ID
- `PromoCode` (VARCHAR(50), NULLABLE): Applied promotional code
- `DiscountAmount` (DECIMAL(10,2), DEFAULT 0): Discount applied
- `CreatedAt` (DATETIME, NOT NULL): Booking creation timestamp
- `UpdatedAt` (DATETIME, NOT NULL): Last update timestamp
- `ConfirmedAt` (DATETIME, NULLABLE): Booking confirmation timestamp
- `CancelledAt` (DATETIME, NULLABLE): Cancellation timestamp
- `CancellationReason` (TEXT, NULLABLE): Reason for cancellation

**Indexes:**
- PRIMARY KEY on `BookingId`
- UNIQUE INDEX on `ReferenceNumber`
- INDEX on `VehicleId`
- INDEX on `CustomerId`
- INDEX on `Status`
- INDEX on `PickupDateTime`
- INDEX on `CreatedAt`
- COMPOSITE INDEX on (`VehicleId`, `PickupDateTime`, `ReturnDateTime`) for availability checks


#### BookingCustomers Table
Store customer information for bookings (including guest bookings).

**Table Name:** `BookingCustomers`

**Columns:**
- `BookingCustomerId` (CHAR(36), PRIMARY KEY): Unique identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `FirstName` (VARCHAR(50), NOT NULL): Customer first name
- `LastName` (VARCHAR(50), NOT NULL): Customer last name
- `Email` (VARCHAR(255), NOT NULL): Customer email
- `Phone` (VARCHAR(20), NOT NULL): Customer phone number
- `SecondaryPhone` (VARCHAR(20), NULLABLE): Secondary phone number
- `DateOfBirth` (DATE, NOT NULL): Customer date of birth
- `Age` (INT, NOT NULL): Calculated age at booking time
- `LicenseNumber` (VARCHAR(50), NOT NULL): Driver's license number
- `LicenseIssuingLocation` (VARCHAR(100), NOT NULL): License issuing country/state
- `LicenseExpirationDate` (DATE, NOT NULL): License expiration date
- `SpecialRequests` (TEXT, NULLABLE): Customer special requests
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `BookingCustomerId`
- UNIQUE INDEX on `BookingId`
- INDEX on `Email`
- INDEX on `LicenseNumber`

#### BookingAdditionalDrivers Table
Store additional driver information for bookings.

**Table Name:** `BookingAdditionalDrivers`

**Columns:**
- `DriverId` (CHAR(36), PRIMARY KEY): Unique driver identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `FirstName` (VARCHAR(50), NOT NULL): Driver first name
- `LastName` (VARCHAR(50), NOT NULL): Driver last name
- `DateOfBirth` (DATE, NOT NULL): Driver date of birth
- `Age` (INT, NOT NULL): Calculated age at booking time
- `LicenseNumber` (VARCHAR(50), NOT NULL): Driver's license number
- `LicenseIssuingLocation` (VARCHAR(100), NOT NULL): License issuing country/state
- `LicenseExpirationDate` (DATE, NOT NULL): License expiration date
- `FeeAmount` (DECIMAL(10,2), NOT NULL): Additional driver fee
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `DriverId`
- INDEX on `BookingId`
- INDEX on `LicenseNumber`


#### BookingInsurance Table
Store insurance selections for bookings.

**Table Name:** `BookingInsurance`

**Columns:**
- `BookingInsuranceId` (CHAR(36), PRIMARY KEY): Unique identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `InsuranceType` (VARCHAR(50), NOT NULL): Insurance type (CDW, TP, PAI, SLI, FullProtection)
- `CostPerDay` (DECIMAL(10,2), NOT NULL): Daily insurance cost
- `TotalCost` (DECIMAL(10,2), NOT NULL): Total insurance cost
- `CoverageDetails` (TEXT, NULLABLE): Coverage description
- `Deductible` (DECIMAL(10,2), NULLABLE): Deductible amount
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `BookingInsuranceId`
- INDEX on `BookingId`
- INDEX on `InsuranceType`

#### BookingServices Table
Store additional services for bookings.

**Table Name:** `BookingServices`

**Columns:**
- `BookingServiceId` (CHAR(36), PRIMARY KEY): Unique identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `ServiceId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Services table
- `ServiceName` (VARCHAR(100), NOT NULL): Service name (denormalized for history)
- `Quantity` (INT, NOT NULL, DEFAULT 1): Service quantity
- `CostPerDay` (DECIMAL(10,2), NULLABLE): Daily service cost
- `FlatRate` (DECIMAL(10,2), NULLABLE): Flat rate service cost
- `TotalCost` (DECIMAL(10,2), NOT NULL): Total service cost
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `BookingServiceId`
- INDEX on `BookingId`
- INDEX on `ServiceId`


#### BookingPricing Table
Store detailed pricing breakdown for bookings.

**Table Name:** `BookingPricing`

**Columns:**
- `BookingPricingId` (CHAR(36), PRIMARY KEY): Unique identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `BaseRate` (DECIMAL(10,2), NOT NULL): Base rental rate
- `InsuranceCost` (DECIMAL(10,2), NOT NULL): Total insurance cost
- `DriverFees` (DECIMAL(10,2), NOT NULL): Additional driver fees
- `ServiceFees` (DECIMAL(10,2), NOT NULL): Additional service fees
- `TaxAmount` (DECIMAL(10,2), NOT NULL): Total tax amount
- `OtherFees` (DECIMAL(10,2), NOT NULL): Other fees (airport, etc.)
- `DiscountAmount` (DECIMAL(10,2), NOT NULL): Discount applied
- `SubTotal` (DECIMAL(10,2), NOT NULL): Subtotal before tax
- `Total` (DECIMAL(10,2), NOT NULL): Final total amount
- `Currency` (CHAR(3), NOT NULL): Currency code
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `BookingPricingId`
- UNIQUE INDEX on `BookingId`

#### BookingPayments Table
Store payment transaction details for bookings.

**Table Name:** `BookingPayments`

**Columns:**
- `PaymentId` (CHAR(36), PRIMARY KEY): Unique payment identifier
- `BookingId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Bookings table
- `TransactionId` (VARCHAR(100), NOT NULL): Payment gateway transaction ID
- `PaymentMethod` (VARCHAR(50), NOT NULL): Payment method type
- `Amount` (DECIMAL(10,2), NOT NULL): Payment amount
- `Currency` (CHAR(3), NOT NULL): Currency code
- `Status` (VARCHAR(20), NOT NULL): Payment status (Pending, Authorized, Captured, Failed, Refunded)
- `AuthorizationCode` (VARCHAR(50), NULLABLE): Payment authorization code
- `ProcessedAt` (DATETIME, NULLABLE): Payment processing timestamp
- `FailureReason` (TEXT, NULLABLE): Failure reason if declined
- `CreatedAt` (DATETIME, NOT NULL): Record creation timestamp

**Indexes:**
- PRIMARY KEY on `PaymentId`
- INDEX on `BookingId`
- INDEX on `TransactionId`
- INDEX on `Status`


#### VehicleLocks Table
Manage temporary vehicle locks during booking process.

**Table Name:** `VehicleLocks`

**Columns:**
- `LockId` (CHAR(36), PRIMARY KEY): Unique lock identifier
- `VehicleId` (CHAR(36), FOREIGN KEY, NOT NULL): Reference to Vehicles table
- `LockToken` (VARCHAR(100), UNIQUE, NOT NULL): Lock token for validation
- `PickupDateTime` (DATETIME, NOT NULL): Requested pickup date/time
- `ReturnDateTime` (DATETIME, NOT NULL): Requested return date/time
- `SessionId` (VARCHAR(100), NOT NULL): User session identifier
- `ExpiresAt` (DATETIME, NOT NULL): Lock expiration timestamp
- `Released` (BOOLEAN, DEFAULT FALSE): Lock release status
- `ReleasedAt` (DATETIME, NULLABLE): Lock release timestamp
- `CreatedAt` (DATETIME, NOT NULL): Lock creation timestamp

**Indexes:**
- PRIMARY KEY on `LockId`
- UNIQUE INDEX on `LockToken`
- INDEX on `VehicleId`
- INDEX on `ExpiresAt`
- INDEX on `Released`
- COMPOSITE INDEX on (`VehicleId`, `Released`, `ExpiresAt`) for availability checks

### Table Definitions

#### Bookings Table Constraints
- `Status` CHECK constraint: IN ('Pending', 'Confirmed', 'Active', 'Completed', 'Cancelled')
- `PaymentStatus` CHECK constraint: IN ('Pending', 'Authorized', 'Captured', 'Refunded', 'Failed')
- `ReturnDateTime` must be greater than `PickupDateTime`
- `TotalAmount` must be greater than 0
- `DiscountAmount` must be >= 0 and <= `TotalAmount`

#### BookingCustomers Table Constraints
- `Age` must be >= 18
- `Email` must be valid email format
- `LicenseExpirationDate` must be in the future

#### BookingAdditionalDrivers Table Constraints
- `Age` must be >= 18
- `FeeAmount` must be >= 0


### Relationships

#### Bookings Relationships
- **Many-to-One** with `Vehicles`: Each booking references one vehicle
- **Many-to-One** with `Users`: Each booking may reference one customer (nullable for guests)
- **Many-to-One** with `Locations`: Each booking has pickup and return locations
- **One-to-One** with `BookingCustomers`: Each booking has one customer record
- **One-to-Many** with `BookingAdditionalDrivers`: Each booking may have multiple additional drivers
- **One-to-Many** with `BookingInsurance`: Each booking may have multiple insurance selections
- **One-to-Many** with `BookingServices`: Each booking may have multiple services
- **One-to-One** with `BookingPricing`: Each booking has one pricing breakdown
- **One-to-Many** with `BookingPayments`: Each booking may have multiple payment attempts

#### Foreign Key Relationships
```sql
ALTER TABLE Bookings
  ADD CONSTRAINT FK_Bookings_Vehicles 
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId),
  ADD CONSTRAINT FK_Bookings_Users 
    FOREIGN KEY (CustomerId) REFERENCES Users(UserId),
  ADD CONSTRAINT FK_Bookings_PickupLocation 
    FOREIGN KEY (PickupLocationId) REFERENCES Locations(LocationId),
  ADD CONSTRAINT FK_Bookings_ReturnLocation 
    FOREIGN KEY (ReturnLocationId) REFERENCES Locations(LocationId);

ALTER TABLE BookingCustomers
  ADD CONSTRAINT FK_BookingCustomers_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

ALTER TABLE BookingAdditionalDrivers
  ADD CONSTRAINT FK_BookingAdditionalDrivers_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

ALTER TABLE BookingInsurance
  ADD CONSTRAINT FK_BookingInsurance_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

ALTER TABLE BookingServices
  ADD CONSTRAINT FK_BookingServices_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE,
  ADD CONSTRAINT FK_BookingServices_Services 
    FOREIGN KEY (ServiceId) REFERENCES Services(ServiceId);

ALTER TABLE BookingPricing
  ADD CONSTRAINT FK_BookingPricing_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

ALTER TABLE BookingPayments
  ADD CONSTRAINT FK_BookingPayments_Bookings 
    FOREIGN KEY (BookingId) REFERENCES Bookings(BookingId) ON DELETE CASCADE;

ALTER TABLE VehicleLocks
  ADD CONSTRAINT FK_VehicleLocks_Vehicles 
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(VehicleId) ON DELETE CASCADE;
```


### Indexes

#### Performance Optimization Indexes

**Bookings Table:**
- Composite index on (`VehicleId`, `PickupDateTime`, `ReturnDateTime`) for availability queries
- Index on `Status` for filtering active/completed bookings
- Index on `CustomerId` for user booking history
- Index on `CreatedAt` for chronological queries
- Index on `ReferenceNumber` for customer lookup

**BookingCustomers Table:**
- Index on `Email` for customer lookup
- Index on `LicenseNumber` for verification queries

**BookingAdditionalDrivers Table:**
- Index on `BookingId` for driver retrieval
- Index on `LicenseNumber` for verification

**VehicleLocks Table:**
- Composite index on (`VehicleId`, `Released`, `ExpiresAt`) for availability checks
- Index on `ExpiresAt` for cleanup queries
- Index on `LockToken` for validation

**BookingPayments Table:**
- Index on `TransactionId` for payment gateway reconciliation
- Index on `Status` for payment status queries

### Data Integrity

#### Cascading Deletes
- Deleting a booking cascades to all related records (customers, drivers, insurance, services, pricing, payments)
- Deleting a vehicle does NOT cascade to bookings (prevent data loss)
- Deleting a user does NOT cascade to bookings (preserve booking history)

#### Soft Deletes
- Bookings use status-based soft deletes (Status = 'Cancelled')
- Maintain complete audit trail of all bookings
- Never physically delete booking records

#### Audit Trail
- All tables include `CreatedAt` timestamp
- Bookings table includes `UpdatedAt` for change tracking
- Payment attempts logged even if failed
- Lock creation and release tracked


## Technology Stack

### Frontend
- **Framework:** Next.js 14+ with React 18+
- **Language:** TypeScript for type safety
- **Styling:** Tailwind CSS for responsive design
- **Form Management:** React Hook Form for form state and validation
- **State Management:** React Context API or Zustand for booking state
- **API Client:** Axios or Fetch API for backend communication
- **Validation:** Zod or Yup for schema validation
- **Payment Integration:** Stripe Elements or similar for secure payment forms
- **Date Handling:** date-fns or Day.js for date manipulation

### Backend
- **Framework:** .NET 8+ with C#
- **API:** ASP.NET Core Web API with RESTful endpoints
- **ORM:** Entity Framework Core for database access
- **Authentication:** ASP.NET Core Identity with JWT tokens
- **Payment Gateway:** Stripe, PayPal, or Braintree SDK
- **Email Service:** SendGrid or AWS SES for confirmation emails
- **SMS Service:** Twilio for SMS notifications
- **Validation:** FluentValidation for request validation
- **Logging:** Serilog for structured logging

### Database
- **RDBMS:** MySQL 8.0+ with InnoDB storage engine
- **Migrations:** Entity Framework Core Migrations
- **Connection Pooling:** Built-in EF Core connection pooling
- **Transactions:** Database transactions for booking creation atomicity


## Implementation Notes

### Critical Success Factors

**Conversion Optimization:**
- Minimize form fields to essential information only
- Provide clear progress indication throughout flow
- Enable guest checkout to reduce friction
- Pre-fill information for logged-in users
- Show real-time pricing updates
- Provide inline validation with helpful error messages
- Optimize for mobile devices (majority of traffic)

**Security and Compliance:**
- Never store raw payment card data (use tokenization)
- Implement PCI DSS compliant payment handling
- Use HTTPS for all checkout pages
- Implement CSRF protection
- Rate limit API endpoints to prevent abuse
- Log all booking attempts for fraud detection
- Comply with data protection regulations (GDPR, CCPA)

**Performance:**
- Optimize API response times (< 200ms for validation, < 1s for booking creation)
- Implement caching for insurance options and services
- Use optimistic UI updates for better perceived performance
- Lazy load non-critical components
- Minimize bundle size for faster page loads
- Implement progressive enhancement for slow connections


### Error Handling Strategy

**User-Facing Errors:**
- Display clear, actionable error messages
- Avoid technical jargon in error messages
- Provide suggestions for resolution
- Maintain user-entered data on errors
- Offer customer support contact for unresolved issues

**System Errors:**
- Log all errors with context for debugging
- Implement graceful degradation for non-critical failures
- Provide fallback options when services unavailable
- Monitor error rates and alert on anomalies
- Implement circuit breakers for external service calls

**Payment Errors:**
- Distinguish between user errors and system errors
- Provide specific decline reasons when available
- Allow retry with different payment method
- Extend vehicle lock on payment failure
- Log all payment attempts for reconciliation

### Testing Requirements

**Unit Tests:**
- Validation logic for all form fields
- Pricing calculation accuracy
- Age and license verification logic
- Discount code validation
- Payment processing logic

**Integration Tests:**
- Complete booking flow end-to-end
- Payment gateway integration
- Email/SMS notification delivery
- Database transaction integrity
- Vehicle lock management

**User Acceptance Tests:**
- Complete booking as guest user
- Complete booking as logged-in user
- Apply discount code
- Handle payment decline
- Modify booking during checkout
- Session timeout recovery


### Accessibility Requirements

**WCAG 2.1 Level AA Compliance:**
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with ARIA labels
- Sufficient color contrast for text and UI elements
- Focus indicators on all interactive elements
- Error messages associated with form fields
- Progress indicator accessible to screen readers
- Alternative text for all images
- Logical tab order through form fields

**Mobile Accessibility:**
- Touch targets minimum 44x44 pixels
- Pinch-to-zoom enabled
- Responsive text sizing
- Simplified navigation for small screens

### Analytics and Monitoring

**Conversion Funnel Tracking:**
- Track completion rate for each step
- Identify abandonment points
- Measure time spent on each step
- Track error rates by field
- Monitor payment success/failure rates

**Business Metrics:**
- Average booking value
- Insurance and service attachment rates
- Discount code usage
- Guest vs. logged-in booking ratio
- Mobile vs. desktop conversion rates

**Performance Metrics:**
- Page load times
- API response times
- Payment processing duration
- Time to complete booking
- Error rates by endpoint

### Future Enhancements

**Phase 2 Considerations:**
- One-click rebooking from history
- Saved booking templates
- Split payment for group bookings
- Voice-activated booking
- Biometric authentication
- AI-powered vehicle recommendations
- Dynamic pricing display
- Real-time availability updates
- Multi-language support
- Multi-currency support


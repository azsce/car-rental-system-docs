# Feature: Booking Confirmation

## Overview

The Booking Confirmation feature provides customers with complete confirmation materials immediately after completing a vehicle reservation. This critical feature ensures customers have all necessary information for a smooth pickup experience, including booking reference, vehicle details, pickup instructions, pricing breakdown, and digital convenience features like QR codes, wallet passes, and calendar integration. The feature also handles immediate delivery of confirmation via multiple channels (email, SMS) to ensure customers receive their booking details promptly.

## Sprint Category

sprint-mvp

## Feature IDs

- F-BM-006: Comprehensive Booking Confirmation
- F-WF-BOOK-011: Booking Confirmation Delivery

## User Stories

### Primary User Story
As a customer who has just completed a booking, I want to receive complete confirmation materials immediately, so that I have all necessary information for a smooth vehicle pickup and can access my booking details anytime.

### Supporting User Stories
- As a business traveler, I want to add my booking to my calendar and digital wallet, so that I have quick access to my rental details during my trip
- As a customer, I want clear pickup instructions with navigation, so that I can easily find the rental location without confusion
- As a customer, I want a QR code for quick check-in, so that I can expedite the pickup process at the counter
- As a customer, I want an itemized pricing breakdown, so that I understand exactly what I'm paying for
- As a customer support agent, I want customers to have booking references, so that I can quickly locate and assist with their reservations

## Frontend Specifications

### Pages

#### Booking Confirmation Page
- **Route**: `/bookings/confirmation/:bookingId`
- **Purpose**: Display immediate confirmation after successful booking completion
- **Access**: Public (accessible via unique confirmation link)

### UI Components

#### ConfirmationHeader Component
- Success checkmark icon with animation
- "Booking Confirmed!" heading
- Booking reference number prominently displayed
- Subheading with pickup date and location summary

#### BookingReferenceCard Component
- Large, bold booking reference number
- Copy-to-clipboard button
- "Save this reference for check-in" instruction text
- Visual emphasis (colored background, border)

#### VehicleDetailsCard Component
- Vehicle image
- Make, model, and category
- Confirmed vehicle specifications
- License plate number (if available)
- Vehicle features list

#### PickupInstructionsCard Component
- Pickup location name and full address
- Operating hours
- Contact phone number
- Parking instructions
- Special instructions (if any)
- "Get Directions" button with map integration

#### PricingBreakdownCard Component
- Itemized cost summary:
  - Base rental rate (with per-day breakdown)
  - Insurance and protection
  - Additional services and equipment
  - Additional driver fees
  - Taxes and fees (itemized)
  - Discounts applied
  - Total amount charged
- Currency display
- Payment method used (last 4 digits)

#### RentalDetailsCard Component
- Pickup date and time
- Return date and time
- Rental duration
- Pickup location
- Return location
- Customer name
- Contact information

#### DigitalConvenienceActions Component
- "Add to Apple Wallet" button
- "Add to Google Wallet" button
- "Add to Calendar" button (with dropdown for calendar type)
- QR code display with "Show at pickup" label
- "Download PDF" button
- "Print Confirmation" button
- "Email Confirmation" button

#### TermsAndPoliciesCard Component
- Link to full rental agreement
- Link to cancellation policy
- Link to modification policy
- Terms acceptance timestamp
- "View Terms & Conditions" expandable section

#### NextStepsCard Component
- "What to Bring" checklist:
  - Valid driver's license
  - Credit card used for booking
  - Booking reference number
  - Additional driver licenses (if applicable)
- "Before Pickup" reminders
- Customer service contact information

#### ActionButtons Component
- "Modify Booking" button
- "Cancel Booking" button
- "View Booking Details" button
- "Contact Support" button
- "Return to Home" button

### User Flows

#### Successful Booking Confirmation Flow
1. Customer completes payment on checkout page
2. System processes payment successfully
3. System redirects to confirmation page with booking ID
4. Confirmation page loads with all booking details
5. Success animation plays
6. Booking reference is prominently displayed
7. Customer can scroll through all confirmation sections
8. Customer can take digital convenience actions (wallet, calendar, QR)
9. Customer receives confirmation email simultaneously
10. Customer receives confirmation SMS (if phone provided)

#### Confirmation Email Delivery Flow
1. Booking is confirmed in system
2. Email service generates confirmation email with all details
3. Email includes booking reference, vehicle details, pickup instructions
4. Email includes pricing breakdown and terms
5. Email includes QR code image
6. Email includes links to modify/cancel booking
7. Email includes customer service contact
8. Email is sent to customer's email address
9. System logs email delivery status

#### Confirmation SMS Delivery Flow
1. Booking is confirmed in system
2. SMS service generates short confirmation message
3. SMS includes booking reference and pickup date
4. SMS includes link to full confirmation page
5. SMS is sent to customer's phone number
6. System logs SMS delivery status

#### Digital Wallet Pass Flow
1. Customer clicks "Add to Apple Wallet" or "Add to Google Wallet"
2. System generates wallet pass with booking details
3. Pass includes booking reference, QR code, pickup details
4. Pass includes relevant dates and location
5. Pass is downloaded to customer's device
6. Customer adds pass to wallet app
7. Pass appears in wallet with booking information

#### Calendar Integration Flow
1. Customer clicks "Add to Calendar"
2. System displays calendar type options (Google, Outlook, iCal)
3. Customer selects calendar type
4. System generates calendar event file (.ics)
5. Event includes pickup and return times
6. Event includes location details
7. Event includes booking reference in description
8. Event includes reminders (24 hours before, 2 hours before)
9. Customer's calendar app opens with event
10. Customer confirms adding event to calendar

### Data Requirements

#### Booking Confirmation Data
```typescript
interface BookingConfirmation {
  bookingId: string;
  bookingReference: string;
  status: 'confirmed' | 'pending' | 'failed';
  createdAt: string;
  
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  
  vehicle: {
    id: string;
    make: string;
    model: string;
    category: string;
    year: number;
    licensePlate?: string;
    features: string[];
    imageUrl: string;
  };
  
  rental: {
    pickupDate: string;
    pickupTime: string;
    returnDate: string;
    returnTime: string;
    duration: {
      days: number;
      hours: number;
    };
  };
  
  locations: {
    pickup: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
      operatingHours: string;
      parkingInstructions?: string;
      specialInstructions?: string;
      coordinates: {
        latitude: number;
        longitude: number;
      };
    };
    return: {
      name: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
      operatingHours: string;
    };
  };
  
  pricing: {
    baseRate: number;
    baseRatePerDay: number;
    insurance: {
      type: string;
      cost: number;
    }[];
    additionalServices: {
      name: string;
      cost: number;
    }[];
    additionalDriverFees: number;
    taxes: {
      name: string;
      amount: number;
    }[];
    fees: {
      name: string;
      amount: number;
    }[];
    discounts: {
      code: string;
      description: string;
      amount: number;
    }[];
    totalAmount: number;
    currency: string;
  };
  
  payment: {
    method: string;
    lastFourDigits: string;
    transactionId: string;
  };
  
  terms: {
    rentalAgreementUrl: string;
    cancellationPolicyUrl: string;
    modificationPolicyUrl: string;
    acceptedAt: string;
  };
  
  digitalAssets: {
    qrCode: string; // Base64 encoded QR code image
    pdfUrl: string;
    walletPassUrls: {
      apple?: string;
      google?: string;
    };
    calendarEventUrl: string;
  };
  
  notifications: {
    emailSent: boolean;
    emailSentAt?: string;
    smsSent: boolean;
    smsSentAt?: string;
  };
}
```

#### API Endpoints Required
- `GET /api/bookings/:bookingId/confirmation` - Retrieve confirmation details
- `POST /api/bookings/:bookingId/resend-confirmation` - Resend confirmation email/SMS
- `GET /api/bookings/:bookingId/qr-code` - Generate QR code
- `GET /api/bookings/:bookingId/pdf` - Generate PDF confirmation
- `GET /api/bookings/:bookingId/wallet-pass/:type` - Generate wallet pass (apple/google)
- `GET /api/bookings/:bookingId/calendar-event` - Generate calendar event file

## Backend Specifications

### API Endpoints

#### GET /api/bookings/:bookingId/confirmation
**Purpose**: Retrieve complete booking confirmation details

**Authentication**: Required (booking owner or guest with confirmation token)

**Request Parameters**:
- `bookingId` (path): Unique booking identifier

**Response Schema**:
```json
{
  "success": true,
  "data": {
    // BookingConfirmation object as defined above
  }
}
```

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

#### POST /api/bookings/:bookingId/resend-confirmation
**Purpose**: Resend confirmation email and/or SMS

**Authentication**: Required (booking owner)

**Request Body**:
```json
{
  "channels": ["email", "sms"]
}
```

**Response Schema**:
```json
{
  "success": true,
  "data": {
    "emailSent": true,
    "smsSent": true,
    "sentAt": "2026-02-23T10:30:00Z"
  }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid request
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

#### GET /api/bookings/:bookingId/qr-code
**Purpose**: Generate QR code for booking

**Authentication**: Required (booking owner)

**Query Parameters**:
- `format` (optional): 'png' | 'svg' (default: 'png')
- `size` (optional): number (default: 300)

**Response**: Binary image data

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

#### GET /api/bookings/:bookingId/pdf
**Purpose**: Generate PDF confirmation document

**Authentication**: Required (booking owner)

**Response**: PDF file download

**Status Codes**:
- 200: Success
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

#### GET /api/bookings/:bookingId/wallet-pass/:type
**Purpose**: Generate digital wallet pass

**Authentication**: Required (booking owner)

**Request Parameters**:
- `bookingId` (path): Unique booking identifier
- `type` (path): 'apple' | 'google'

**Response**: Wallet pass file (.pkpass for Apple, .json for Google)

**Status Codes**:
- 200: Success
- 400: Invalid wallet type
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

#### GET /api/bookings/:bookingId/calendar-event
**Purpose**: Generate calendar event file

**Authentication**: Required (booking owner)

**Query Parameters**:
- `format` (optional): 'ics' | 'google' | 'outlook' (default: 'ics')

**Response**: Calendar event file (.ics)

**Status Codes**:
- 200: Success
- 400: Invalid format
- 401: Unauthorized
- 404: Booking not found
- 500: Server error

### Business Logic

#### Confirmation Generation Logic
1. Retrieve complete booking details from database
2. Validate booking status is 'confirmed'
3. Generate unique booking reference if not exists
4. Compile all booking information (vehicle, customer, pricing, locations)
5. Generate QR code containing booking reference and verification data
6. Generate PDF confirmation document
7. Prepare wallet pass data structures
8. Prepare calendar event data
9. Return complete confirmation object

#### Email Confirmation Logic
1. Retrieve booking confirmation data
2. Load email template for booking confirmation
3. Populate template with booking details
4. Embed QR code image in email
5. Include all pricing breakdown and terms
6. Add links to modify/cancel booking
7. Add customer service contact information
8. Send email via email service provider
9. Log email delivery status
10. Update booking record with email sent timestamp

#### SMS Confirmation Logic
1. Retrieve booking confirmation data
2. Format short SMS message with booking reference and pickup date
3. Include link to full confirmation page
4. Send SMS via SMS service provider
5. Log SMS delivery status
6. Update booking record with SMS sent timestamp

#### QR Code Generation Logic
1. Create data payload with booking reference and verification token
2. Encode payload as JSON string
3. Generate QR code from encoded string
4. Render QR code as image (PNG or SVG)
5. Return image data

#### PDF Generation Logic
1. Retrieve booking confirmation data
2. Load PDF template
3. Populate template with all booking details
4. Include QR code image
5. Include pricing breakdown table
6. Include terms and conditions
7. Generate PDF document
8. Return PDF file

#### Wallet Pass Generation Logic
1. Retrieve booking confirmation data
2. For Apple Wallet:
   - Create .pkpass file structure
   - Include booking reference as barcode
   - Add relevant fields (pickup date, location, vehicle)
   - Sign pass with Apple certificate
   - Return .pkpass file
3. For Google Wallet:
   - Create Google Pay pass JSON
   - Include booking reference as barcode
   - Add relevant fields
   - Return pass URL or JSON

#### Calendar Event Generation Logic
1. Retrieve booking confirmation data
2. Create iCalendar (.ics) event
3. Set event title: "Car Rental - [Vehicle Make Model]"
4. Set start time: pickup date and time
5. Set end time: return date and time
6. Set location: pickup location address
7. Add description with booking reference and details
8. Add reminders (24 hours before, 2 hours before)
9. Return .ics file

### Authentication Requirements

- Booking confirmation page accessible via unique confirmation token (for guest bookings)
- Logged-in users can access their booking confirmations via account
- API endpoints require authentication (JWT token or confirmation token)
- Confirmation token expires after 30 days
- Rate limiting on resend confirmation endpoint (max 3 per hour)

## Database Specifications

### Schema Changes

No new tables required. Updates to existing `bookings` table:

#### Bookings Table Updates
```sql
ALTER TABLE bookings
ADD COLUMN booking_reference VARCHAR(20) UNIQUE NOT NULL,
ADD COLUMN confirmation_email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmation_email_sent_at TIMESTAMP NULL,
ADD COLUMN confirmation_sms_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN confirmation_sms_sent_at TIMESTAMP NULL,
ADD COLUMN confirmation_token VARCHAR(255) UNIQUE NULL,
ADD COLUMN confirmation_token_expires_at TIMESTAMP NULL,
ADD COLUMN qr_code_data TEXT NULL,
ADD COLUMN pdf_url VARCHAR(500) NULL,
ADD INDEX idx_booking_reference (booking_reference),
ADD INDEX idx_confirmation_token (confirmation_token);
```

### Table Definitions

#### Booking Reference Generation
- Format: `RNT-XXXXXX` where X is alphanumeric
- Must be unique across all bookings
- Generated at booking confirmation time
- Stored in `booking_reference` column

#### Confirmation Token
- Random 64-character string
- Used for guest access to confirmation page
- Expires after 30 days
- Stored in `confirmation_token` column
- Expiration stored in `confirmation_token_expires_at` column

### Relationships

No new relationships required. Existing relationships maintained:
- Bookings → Customers (many-to-one)
- Bookings → Vehicles (many-to-one)
- Bookings → Locations (many-to-one for pickup and return)
- Bookings → Payments (one-to-many)

### Indexes

```sql
-- Index for fast booking reference lookup
CREATE INDEX idx_booking_reference ON bookings(booking_reference);

-- Index for confirmation token lookup
CREATE INDEX idx_confirmation_token ON bookings(confirmation_token);

-- Index for email/SMS delivery tracking
CREATE INDEX idx_confirmation_sent ON bookings(confirmation_email_sent, confirmation_sms_sent);
```

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+
- **Frontend**: Next.js 14+ with React 18+, TypeScript
- **Email Service**: SendGrid or AWS SES
- **SMS Service**: Twilio or AWS SNS
- **QR Code Generation**: QRCoder library (.NET) or qrcode.react (React)
- **PDF Generation**: iTextSharp or PdfSharp (.NET)
- **Wallet Pass**: PassKit for Apple Wallet, Google Pay API for Google Wallet
- **Calendar**: iCal.NET library for .ics generation

## Implementation Notes

### Priority Considerations
- Booking confirmation is a critical MVP feature - customers must receive confirmation immediately
- Email delivery must be reliable and fast (< 30 seconds)
- SMS delivery is secondary but important for customers without email access
- QR code generation should be fast and cached
- PDF generation can be asynchronous if needed

### User Experience Considerations
- Confirmation page should load quickly with all details
- Booking reference should be prominently displayed and easy to copy
- Digital convenience features (wallet, calendar) should be one-click
- Mobile-responsive design is critical - many customers will view on mobile
- Print-friendly version should be available

### Technical Considerations
- QR codes should encode booking reference and verification token
- QR codes should be scannable at pickup locations
- Email templates should be mobile-responsive
- PDF should be professionally formatted and printable
- Wallet passes should update if booking is modified
- Calendar events should include reminders

### Security Considerations
- Confirmation tokens must be cryptographically secure
- Confirmation pages should not expose sensitive payment details (only last 4 digits)
- API endpoints must validate booking ownership
- Rate limiting on resend confirmation to prevent abuse
- QR codes should include verification data to prevent forgery

### Performance Considerations
- Cache generated QR codes to avoid regeneration
- Generate PDF asynchronously if it impacts response time
- Use CDN for serving PDF and image assets
- Optimize email template size for fast delivery
- Batch email/SMS sending if multiple notifications needed

### Error Handling
- If email fails, retry up to 3 times with exponential backoff
- If SMS fails, log error but don't block confirmation page
- If QR code generation fails, show booking reference as fallback
- If PDF generation fails, allow customer to retry
- If wallet pass generation fails, provide alternative (PDF or email)

### Monitoring and Logging
- Log all confirmation email/SMS delivery attempts
- Track email open rates and link clicks
- Monitor QR code scan rates at pickup locations
- Track wallet pass adoption rates
- Monitor PDF download rates
- Alert on high email/SMS failure rates

## Dependencies

- F-BM-001: Multi-Step Checkout Process (must complete before confirmation)
- R-BM-001: Booking Management Requirements
- Payment Gateway Integration (must process payment before confirmation)
- Email Service Provider (SendGrid, AWS SES)
- SMS Service Provider (Twilio, AWS SNS)
- Vehicle Availability System (to confirm vehicle reservation)

## Stakeholder Benefit

**Customers**: Have all necessary information for smooth pickup. Reduces anxiety and confusion. Provides convenient digital access to booking details.

**Customer Support**: Reduces support inquiries about booking details. Customers can self-serve for most confirmation-related questions.

**Operations**: Reduces no-shows through clear communication. QR codes speed up check-in process at pickup locations.

**Business**: Improves customer satisfaction and reduces operational friction. Professional confirmation materials enhance brand perception.

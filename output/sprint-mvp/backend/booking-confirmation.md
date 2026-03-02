# Feature: Booking Confirmation (Backend)

## Overview

Backend services for generating and delivering comprehensive booking confirmation materials to customers immediately after successful payment. Handles confirmation data compilation, email/SMS delivery, QR code generation, PDF creation, digital wallet pass generation, and calendar event file creation.

## Sprint Category

sprint-mvp

## Feature IDs

- F-BM-006: Comprehensive Booking Confirmation
- F-WF-BOOK-011: Booking Confirmation Delivery

## User Stories

As a backend system, I need to generate complete booking confirmation data and deliver it through multiple channels (email, SMS, web) immediately after payment confirmation, so that customers receive all necessary information for their rental.

## API Endpoints

### GET /api/bookings/:bookingId/confirmation
Retrieve complete booking confirmation details including vehicle, customer, pricing, locations, and digital assets.

**Authentication**: Required (JWT or confirmation token)

**Response**: Complete BookingConfirmation object with all details

**Business Logic**:
- Validate booking exists and is confirmed
- Compile vehicle details from vehicles table
- Compile customer information from customers table
- Compile pricing breakdown from booking_items table
- Compile location details from locations table
- Generate QR code if not cached
- Return complete confirmation object

### POST /api/bookings/:bookingId/resend-confirmation
Resend confirmation email and/or SMS to customer.

**Authentication**: Required (booking owner)

**Request Body**: `{ "channels": ["email", "sms"] }`

**Business Logic**:
- Validate booking ownership
- Check rate limiting (max 3 per hour)
- Retrieve booking confirmation data
- Send email if requested
- Send SMS if requested
- Update delivery timestamps
- Return delivery status

### GET /api/bookings/:bookingId/qr-code
Generate QR code image for booking reference.

**Authentication**: Required

**Query Parameters**: `format` (png/svg), `size` (pixels)

**Business Logic**:
- Check cache for existing QR code
- If not cached, generate QR code with booking reference and verification token
- Encode as PNG or SVG based on format parameter
- Cache generated QR code
- Return image data

### GET /api/bookings/:bookingId/pdf
Generate and download PDF confirmation document.

**Authentication**: Required

**Business Logic**:
- Retrieve booking confirmation data
- Load PDF template
- Populate template with booking details
- Include QR code image
- Generate PDF using iTextSharp or PdfSharp
- Store PDF in blob storage
- Return PDF file for download


### GET /api/bookings/:bookingId/wallet-pass/:type
Generate digital wallet pass (Apple Wallet or Google Pay).

**Authentication**: Required

**Path Parameters**: `type` (apple/google)

**Business Logic**:
- Retrieve booking confirmation data
- For Apple Wallet: Create .pkpass file with booking details and QR barcode
- For Google Wallet: Create Google Pay pass JSON with booking details
- Sign pass with appropriate certificates
- Return pass file or URL

### GET /api/bookings/:bookingId/calendar-event
Generate calendar event file (.ics format).

**Authentication**: Required

**Query Parameters**: `format` (ics/google/outlook)

**Business Logic**:
- Retrieve booking confirmation data
- Create iCalendar event with pickup/return times
- Set event title, location, description
- Add reminders (24 hours, 2 hours before)
- Generate .ics file using iCal.NET
- Return calendar file

## Business Logic Components

### ConfirmationService
Core service for generating booking confirmations.

**Methods**:
- `GenerateConfirmation(bookingId)`: Compile complete confirmation data
- `GenerateBookingReference()`: Create unique booking reference (RNT-XXXXXX format)
- `GenerateConfirmationToken()`: Create secure 64-char token for guest access
- `GetConfirmationData(bookingId)`: Retrieve all confirmation details

**Logic**:
- Query booking with all related data (vehicle, customer, locations, payments)
- Calculate pricing breakdown with itemization
- Generate booking reference if not exists
- Generate confirmation token with 30-day expiration
- Compile complete confirmation object
- Cache confirmation data for performance

### EmailService
Handles confirmation email delivery.

**Methods**:
- `SendConfirmationEmail(bookingId)`: Send confirmation email to customer
- `GenerateEmailContent(confirmationData)`: Populate email template
- `EmbedQRCode(qrCodeData)`: Embed QR code image in email

**Logic**:
- Load email template from templates directory
- Populate template with booking details
- Include itemized pricing breakdown
- Embed QR code as inline image
- Add links to modify/cancel booking
- Send via SendGrid or AWS SES
- Retry up to 3 times on failure with exponential backoff
- Log delivery status and update database

### SMSService
Handles confirmation SMS delivery.

**Methods**:
- `SendConfirmationSMS(bookingId)`: Send SMS to customer
- `FormatSMSMessage(confirmationData)`: Create short SMS text

**Logic**:
- Format message: "Booking confirmed! Ref: [REF]. Pickup: [DATE]. View details: [LINK]"
- Send via Twilio or AWS SNS
- Log delivery status
- Update database with SMS sent timestamp

### QRCodeService
Generates QR codes for bookings.

**Methods**:
- `GenerateQRCode(bookingReference, verificationToken)`: Create QR code
- `GetCachedQRCode(bookingId)`: Retrieve cached QR code
- `CacheQRCode(bookingId, qrCodeData)`: Store QR code in cache

**Logic**:
- Create JSON payload with booking reference and verification token
- Encode payload as QR code using QRCoder library
- Render as PNG or SVG based on request
- Cache generated QR code in Redis or memory cache
- Return image data

### PDFService
Generates PDF confirmation documents.

**Methods**:
- `GeneratePDF(bookingId)`: Create PDF confirmation
- `PopulatePDFTemplate(confirmationData)`: Fill PDF template
- `StorePDF(bookingId, pdfData)`: Save PDF to blob storage

**Logic**:
- Load PDF template
- Populate with booking details using iTextSharp
- Include QR code image
- Add pricing breakdown table
- Add terms and conditions
- Generate PDF document
- Store in Azure Blob Storage or AWS S3
- Return PDF URL

### WalletPassService
Generates digital wallet passes.

**Methods**:
- `GenerateAppleWalletPass(bookingId)`: Create .pkpass file
- `GenerateGoogleWalletPass(bookingId)`: Create Google Pay pass

**Logic**:
- For Apple: Use PassKit library to create .pkpass with booking details
- For Google: Create JSON pass structure for Google Pay API
- Include booking reference as barcode
- Add relevant fields (dates, location, vehicle)
- Sign with appropriate certificates
- Return pass file or URL

### CalendarService
Generates calendar event files.

**Methods**:
- `GenerateCalendarEvent(bookingId)`: Create .ics file
- `FormatEventDetails(confirmationData)`: Format event data

**Logic**:
- Use iCal.NET library to create iCalendar event
- Set event title: "Car Rental - [Vehicle]"
- Set start/end times from pickup/return dates
- Set location to pickup address
- Add description with booking reference
- Add reminders (24h, 2h before)
- Generate .ics file
- Return file data

## Request/Response Schemas

### BookingConfirmation Response
```json
{
  "bookingId": "string",
  "bookingReference": "string",
  "status": "confirmed",
  "customer": {
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string"
  },
  "vehicle": {
    "make": "string",
    "model": "string",
    "category": "string",
    "licensePlate": "string",
    "features": ["string"]
  },
  "rental": {
    "pickupDate": "ISO8601",
    "returnDate": "ISO8601",
    "duration": { "days": 0, "hours": 0 }
  },
  "locations": {
    "pickup": {
      "name": "string",
      "address": "string",
      "phone": "string",
      "operatingHours": "string"
    }
  },
  "pricing": {
    "baseRate": 0,
    "insurance": [],
    "services": [],
    "taxes": [],
    "fees": [],
    "discounts": [],
    "totalAmount": 0,
    "currency": "USD"
  },
  "digitalAssets": {
    "qrCode": "base64",
    "pdfUrl": "string",
    "walletPassUrls": {}
  }
}
```

## Authentication Requirements

- JWT token authentication for logged-in users
- Confirmation token authentication for guest bookings
- Confirmation tokens expire after 30 days
- Rate limiting: 3 resend requests per hour per booking
- API key authentication for internal services

## Technology Stack

- **Framework**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with Entity Framework Core
- **Email**: SendGrid or AWS SES
- **SMS**: Twilio or AWS SNS
- **QR Codes**: QRCoder library
- **PDF**: iTextSharp or PdfSharp
- **Wallet**: PassKit (Apple), Google Pay API
- **Calendar**: iCal.NET
- **Caching**: Redis or in-memory cache
- **Storage**: Azure Blob Storage or AWS S3

## Implementation Notes

### Performance Optimization
- Cache QR codes to avoid regeneration
- Generate PDFs asynchronously if needed
- Use CDN for serving static assets
- Batch database queries for confirmation data
- Cache confirmation data for 1 hour

### Error Handling
- Retry email delivery up to 3 times with exponential backoff
- Log all delivery failures for monitoring
- Continue processing if SMS fails (non-critical)
- Provide fallbacks if digital assets fail to generate
- Return partial confirmation if some components fail

### Security
- Validate booking ownership before allowing access
- Use cryptographically secure tokens
- Don't expose full payment details (only last 4 digits)
- Rate limit resend confirmation endpoint
- Validate QR codes at pickup with verification token

### Monitoring
- Log all confirmation generation attempts
- Track email/SMS delivery success rates
- Monitor QR code generation performance
- Alert on high failure rates
- Track API endpoint response times

## Dependencies

- Booking creation must complete successfully
- Payment must be processed and confirmed
- Email service provider must be configured
- SMS service provider must be configured
- Storage service must be available for PDFs

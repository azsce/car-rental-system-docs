# Feature: Vehicle Pickup & Return Process

## Overview

The Vehicle Pickup & Return Process provides guided, digital workflows for customers to collect and return rental vehicles with comprehensive documentation, AI-powered damage detection, and transparent billing. This feature transforms the traditional manual pickup/return experience into a streamlined, contactless process that reduces disputes, improves customer confidence, and enhances operational efficiency.

The system includes pre-arrival digital check-in capabilities that allow customers to upload documents, review contracts, and complete paperwork before arriving at the pickup location, enabling express pickup and reducing counter wait times.

The pickup process guides customers through location verification, vehicle inspection with photo/video capture, odometer and fuel readings, AI-powered damage detection, digital key activation, and trip start confirmation. The return process mirrors this with location verification, final readings, condition assessment, AI damage comparison, vehicle lock confirmation, trip completion, and final invoice generation.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-BM-013: Vehicle Pickup Process
- F-BM-014: Vehicle Return Process
- F-WF-PICK-001: Digital Check-In System (Nice-to-have enhancement)
- F-WF-PICK-003: Digital Contract Signing (Project - Sprint-01)
- F-WF-PICK-005: Vehicle Inspection Documentation (Project - Sprint-01)
- F-WF-PICK-006: Vehicle Orientation Guide (Project - Sprint-01)
- F-WF-RET-001: Vehicle Return Inspection (Project - Sprint-01)
- F-WF-RET-002: Damage Assessment and Charging (Project - Sprint-01)
- F-WF-RET-003: Fuel Level Verification (Project - Sprint-01)
- F-WF-RET-004: Mileage Overage Calculation (Project - Sprint-01)
- F-WF-RET-005: Final Billing and Deposit Release (Project - Sprint-01)
- F-WF-RET-006: Charge Dispute Resolution (Project - Sprint-01)
- F-WF-RET-007: After-Hours Return System (Project - Sprint-01)

## Dependencies

- F-BM-006: Booking Confirmation (provides booking details for pickup)
- R-BM-001: Core booking management requirements
- R-BM-012: Vehicle inspection and documentation requirements
- Digital Key System (for keyless vehicle access)
- AI/ML Service (for damage detection)
- GPS/Location Services (for location verification)

## User Stories

### Digital Check-In (Pre-Arrival)

**As a customer**, I want to complete check-in before arriving at the pickup location, so that I can skip counter lines and get my vehicle faster.

**As a customer**, I want to upload my documents and review the contract from home, so that I don't have to spend time on paperwork at the counter.

**As a busy traveler**, I want an express pickup option after digital check-in, so that I can go straight to my vehicle without waiting.

### Pickup Process

**As a customer**, I want a guided pickup process with digital documentation, so that I can collect my vehicle quickly with clear evidence of its condition and avoid disputes later.

**As a customer**, I want to use my phone to inspect the vehicle and document its condition, so that I don't have to wait for staff and have my own record of the vehicle state.

**As a customer**, I want AI to help detect existing damage, so that I don't miss anything that could be blamed on me later.

**As a fleet manager**, I want digital pickup documentation with timestamps and photos, so that I have clear evidence of vehicle condition at the start of each rental.


### Return Process

**As a customer**, I want a guided return process with final inspection and transparent billing, so that I can complete my rental with confidence in fair charges.

**As a customer**, I want to see my final charges immediately upon return, so that I know exactly what I'm paying and can dispute any errors right away.

**As a customer**, I want AI to compare the vehicle condition at return vs pickup, so that I'm only charged for damage I actually caused.

**As a fleet manager**, I want automated damage detection at return, so that I can identify new damage quickly and process claims efficiently.

**As a support agent**, I want comprehensive pickup and return documentation, so that I can resolve customer disputes with clear evidence.

## Frontend Specifications

### Pages and Routes

#### Pre-Arrival Digital Check-In Pages

1. **Digital Check-In Start Page** (`/bookings/:bookingId/check-in/start`)
   - Booking summary and vehicle details
   - Benefits of digital check-in (skip lines, faster pickup)
   - Estimated time to complete (5-7 minutes)
   - "Start Check-In" button
   - Option to check in at counter instead

2. **Document Upload Page** (`/bookings/:bookingId/check-in/documents`)
   - Driver's license upload (front and back)
   - Additional driver licenses (if applicable)
   - Credit card photo for verification (optional)
   - Document quality validation
   - OCR preview of extracted information
   - "Continue" button

3. **Contract Review Page** (`/bookings/:bookingId/check-in/contract`)
   - Full rental agreement display
   - Key terms highlighted (fuel policy, mileage, insurance)
   - Scroll-to-read requirement
   - Terms acceptance checkbox
   - Electronic signature capture
   - "Sign Contract" button
   - Download contract PDF option

4. **Express Pickup Confirmation Page** (`/bookings/:bookingId/check-in/complete`)
   - Check-in completion confirmation
   - Express pickup instructions
   - Vehicle location and parking spot
   - QR code for express lane
   - Pickup time window
   - "I'm Ready to Pick Up" button

#### Pickup Flow Pages

1. **Pickup Start Page** (`/bookings/:bookingId/pickup/start`)
   - Display booking summary and vehicle details
   - Show pickup location and directions
   - Pickup checklist overview
   - Express pickup indicator (if check-in completed)
   - "Begin Pickup Process" button
   - Estimated time to complete (10-15 minutes, or 5 minutes for express)

2. **Location Verification Page** (`/bookings/:bookingId/pickup/location`)
   - GPS-based location verification
   - Map showing current location vs pickup location
   - Distance indicator
   - "Confirm Arrival" button (enabled when within geofence)
   - Manual override option with reason

3. **Vehicle Inspection Page** (`/bookings/:bookingId/pickup/inspection`)
   - Camera interface for photo/video capture
   - Vehicle diagram for marking damage
   - Guided walkthrough (front, sides, rear, roof, interior)
   - AI damage detection overlay
   - Photo gallery with timestamps
   - "Continue" button (requires minimum photos)


4. **Odometer & Fuel Reading Page** (`/bookings/:bookingId/pickup/readings`)
   - Odometer reading input with photo verification
   - Fuel level selector (Empty, 1/4, 1/2, 3/4, Full)
   - Battery level selector (for EVs)
   - Photo of dashboard/fuel gauge
   - Validation and confirmation

5. **Damage Review Page** (`/bookings/:bookingId/pickup/damage-review`)
   - AI-detected damage highlights
   - List of identified damage with severity
   - Customer can add/remove damage markers
   - Comparison with baseline vehicle condition
   - "Confirm Damage Report" button

6. **Digital Key Activation Page** (`/bookings/:bookingId/pickup/key-activation`)
   - Digital key activation status
   - Instructions for using digital key
   - Test unlock/lock buttons
   - Bluetooth pairing status
   - "Activate Key" button

7. **Pickup Confirmation Page** (`/bookings/:bookingId/pickup/confirm`)
   - Summary of all pickup documentation
   - Odometer and fuel readings
   - Damage report summary
   - Trip start time
   - "Start Trip" button
   - Download/email documentation option

#### Return Flow Pages

1. **Return Start Page** (`/bookings/:bookingId/return/start`)
   - Active trip summary
   - Return location and directions
   - Return checklist overview
   - Fuel policy reminder
   - "Begin Return Process" button

2. **Return Location Verification Page** (`/bookings/:bookingId/return/location`)
   - GPS-based location verification
   - Map showing current location vs return location
   - Distance indicator
   - "Confirm Arrival" button (enabled when within geofence)
   - After-hours return instructions


3. **Final Readings Page** (`/bookings/:bookingId/return/readings`)
   - Final odometer reading with photo
   - Final fuel level with photo
   - Total miles/kilometers driven display
   - Fuel usage calculation
   - Mileage overage warning (if applicable)

4. **Return Inspection Page** (`/bookings/:bookingId/return/inspection`)
   - Camera interface for return photos
   - Vehicle diagram for marking new damage
   - Guided walkthrough matching pickup sequence
   - AI damage detection with pickup comparison
   - Side-by-side pickup vs return photos
   - New damage highlights

5. **Damage Assessment Page** (`/bookings/:bookingId/return/damage-assessment`)
   - List of new damage detected
   - Severity and estimated repair cost
   - Insurance coverage application
   - Customer liability calculation
   - Dispute option for each damage item
   - "Acknowledge Damage" button

6. **Vehicle Lock Confirmation Page** (`/bookings/:bookingId/return/lock`)
   - Digital key deactivation
   - Vehicle lock status verification
   - "Lock Vehicle" button
   - Confirmation of secure vehicle

7. **Final Invoice Page** (`/bookings/:bookingId/return/invoice`)
   - Itemized final charges breakdown
   - Base rental cost
   - Additional days (if late)
   - Fuel charges
   - Mileage overage charges
   - Damage charges
   - Cleaning fees
   - Taxes and fees
   - Total amount charged
   - Payment method used
   - "Complete Return" button
   - Download/email invoice option


8. **Return Confirmation Page** (`/bookings/:bookingId/return/complete`)
   - Trip completion confirmation
   - Trip duration and distance summary
   - Final charges summary
   - Security deposit release timeline
   - Receipt and documentation links
   - "Rate Your Experience" prompt
   - "Book Again" button

### UI Components

#### DigitalCheckInCard Component
- Check-in status indicator
- Progress tracker for check-in steps
- Document upload status
- Contract signature status
- Express pickup eligibility badge
- "Start Check-In" or "Resume Check-In" button
- Estimated time savings display

#### DocumentUploadWidget Component
- Camera capture or file picker
- Document type selector (license front/back, credit card)
- Image quality validation with real-time feedback
- OCR processing indicator
- Extracted data preview
- Retry/replace image option
- Multiple document support

#### ContractViewer Component
- Scrollable contract display
- Key terms highlighting
- Section navigation
- Font size controls
- Download PDF button
- Scroll progress indicator
- "I have read and understood" checkbox
- Electronic signature pad

#### ExpressPickupBadge Component
- Visual indicator of express pickup eligibility
- Benefits display (skip lines, faster pickup)
- QR code for express lane access
- Vehicle location information
- Pickup time window
- Instructions for express pickup

#### PickupReturnStepper Component
- Multi-step progress indicator
- Shows current step and completed steps
- Step titles and icons
- Progress percentage
- Back/Next navigation
- Step validation indicators

#### LocationVerification Component
- Interactive map with user location marker
- Pickup/return location marker
- Distance calculation display
- Geofence visualization
- "Confirm Arrival" button with distance threshold
- Manual override option with reason input
- GPS accuracy indicator

#### VehicleInspectionCamera Component
- Camera viewfinder with capture button
- Photo/video mode toggle
- Flash control
- Gallery thumbnail strip
- Delete photo option
- Retake photo option
- AI processing indicator
- Minimum photo requirement counter

#### VehicleDiagram Component
- Interactive vehicle outline (top, sides, front, rear)
- Tap to mark damage locations
- Damage markers with severity colors
- Zoom and pan controls
- Damage detail popup on marker click
- Photo association with damage markers
- Comparison mode (pickup vs return)


#### DamageDetectionOverlay Component
- AI-detected damage highlights on photos
- Bounding boxes around damage areas
- Severity indicators (minor, moderate, major)
- Confidence score display
- Accept/reject damage detection
- Add manual damage markers
- Damage type classification (scratch, dent, crack)

#### ReadingsInput Component
- Odometer reading numeric input with validation
- Fuel level visual selector (gauge or slider)
- Battery level selector (for EVs)
- Photo capture for verification
- Previous reading comparison (for return)
- Validation rules and error messages

#### DamageList Component
- Scrollable list of detected/reported damage
- Damage thumbnail images
- Damage location and type
- Severity indicator
- Estimated repair cost
- Insurance coverage status
- Dispute button for each item
- Filter by severity or location

#### DigitalKeyControl Component
- Key activation/deactivation button
- Bluetooth connection status
- Lock/unlock test buttons
- Key sharing options
- Troubleshooting tips
- Battery level indicator
- Range indicator

#### InvoiceBreakdown Component
- Itemized charges table
- Expandable charge details
- Subtotals and total
- Tax breakdown
- Payment method display
- Discount/promotion application
- Download PDF button
- Email invoice button
- Dispute charge option


#### TripSummary Component
- Trip duration display (days, hours, minutes)
- Total distance driven
- Average daily mileage
- Fuel consumption (if available)
- Trip timeline visualization
- Key events (pickup, extensions, return)
- Cost summary

### User Flows

#### Digital Check-In Flow (Pre-Arrival)

1. Customer receives check-in notification 24-48 hours before pickup
2. Customer opens booking in app or web
3. Customer taps "Start Digital Check-In" button
4. System displays check-in benefits and estimated time
5. Customer uploads driver's license (front and back)
6. OCR extracts license information automatically
7. Customer reviews and confirms extracted data
8. Customer uploads additional driver licenses if applicable
9. System displays full rental contract
10. Customer scrolls through contract and reviews key terms
11. Customer checks "I agree" and provides electronic signature
12. System validates signature and completes check-in
13. Customer receives express pickup confirmation with QR code
14. Customer gets vehicle location and parking spot information
15. System sends pickup reminder with express lane instructions

#### Pickup Flow

1. Customer navigates to active booking
2. Taps "Start Pickup" button (or "Express Pickup" if check-in completed)
3. If express pickup: System verifies check-in completion and skips to location verification
4. If standard pickup: System guides through counter check-in process first
5. System verifies customer is at pickup location via GPS
4. Customer confirms arrival or uses manual override
5. System displays vehicle inspection instructions
6. Customer captures photos/videos of vehicle exterior (front, sides, rear, roof)
7. Customer captures photos of vehicle interior
8. AI processes images and detects existing damage
9. System displays detected damage on vehicle diagram
10. Customer reviews and confirms damage report
11. Customer enters odometer reading and captures photo
12. Customer selects fuel/battery level and captures photo
13. System validates all required documentation collected
14. Customer activates digital key
15. System tests key activation and vehicle unlock
16. Customer confirms pickup completion
17. System starts trip timer and updates booking status
18. Customer receives pickup confirmation email with all documentation

#### Return Flow

1. Customer navigates to active trip
2. Taps "Start Return" button
3. System verifies customer is at return location via GPS
4. Customer confirms arrival at return location
5. Customer enters final odometer reading with photo
6. Customer selects final fuel/battery level with photo
7. System calculates mileage and fuel usage
8. Customer captures return inspection photos (same sequence as pickup)
9. AI processes images and compares to pickup condition
10. System identifies new damage by comparing pickup vs return photos
11. System displays new damage with severity and cost estimates
12. Customer reviews damage assessment and can dispute items
13. Customer deactivates digital key and locks vehicle
14. System confirms vehicle is locked
15. System calculates final charges (base + fuel + mileage + damage + fees)
16. System displays itemized final invoice
17. Customer reviews and confirms charges
18. System processes payment against security deposit or payment method
19. Customer completes return and receives final invoice email
20. System updates vehicle status to available


### Data Requirements

#### Pickup Process Data
- Booking ID and details
- Vehicle information (make, model, VIN, license plate)
- Pickup location coordinates and geofence radius
- Customer location (GPS coordinates)
- Inspection photos/videos with timestamps
- Detected damage data (location, type, severity, confidence)
- Odometer reading (numeric value and photo)
- Fuel/battery level (percentage and photo)
- Digital key activation status
- Trip start timestamp
- Pickup completion status

#### Return Process Data
- Active trip ID and details
- Return location coordinates and geofence radius
- Customer location (GPS coordinates)
- Final odometer reading (numeric value and photo)
- Final fuel/battery level (percentage and photo)
- Return inspection photos/videos with timestamps
- New damage data (location, type, severity, cost estimate)
- Damage comparison results (pickup vs return)
- Vehicle lock status
- Trip end timestamp
- Final charges breakdown
- Payment processing status
- Return completion status

#### AI Damage Detection Data
- Image data (base64 or file upload)
- Detected damage bounding boxes
- Damage classification (scratch, dent, crack, etc.)
- Severity score (0-100)
- Confidence score (0-100)
- Comparison results (pickup vs return)
- Baseline vehicle condition data

## Backend Specifications

### API Endpoints

#### Digital Check-In Endpoints

**POST /api/bookings/:bookingId/check-in/start**
- Purpose: Initialize pre-arrival digital check-in process
- Authentication: Required (customer)
- Request: Booking ID in URL
- Response: Check-in session data, required documents, contract preview
- Status Codes: 200 (success), 404 (booking not found), 400 (too early for check-in)

**POST /api/bookings/:bookingId/check-in/upload-document**
- Purpose: Upload driver's license or other required documents
- Authentication: Required
- Request: Multipart form data with document image
- Response: `{ documentId: string, ocrData: object, verified: boolean }`
- Status Codes: 201 (created), 400 (invalid document), 413 (file too large)

**GET /api/bookings/:bookingId/check-in/contract**
- Purpose: Retrieve rental contract for review
- Authentication: Required
- Response: Contract PDF URL, key terms, signature requirements
- Status Codes: 200 (success), 404 (booking not found)

**POST /api/bookings/:bookingId/check-in/sign-contract**
- Purpose: Submit electronic signature for rental contract
- Authentication: Required
- Request Body: `{ signature: string (base64), agreedToTerms: boolean, signedAt: string }`
- Response: `{ contractId: string, signed: boolean, expressPickupEnabled: boolean }`
- Status Codes: 200 (success), 400 (invalid signature)

**POST /api/bookings/:bookingId/check-in/complete**
- Purpose: Complete digital check-in and enable express pickup
- Authentication: Required
- Request Body: `{ checkInConfirmed: boolean }`
- Response: `{ expressPickupCode: string, vehicleLocation: string, pickupInstructions: string }`
- Status Codes: 200 (success), 400 (incomplete check-in)

#### Pickup Endpoints

**POST /api/bookings/:bookingId/pickup/start**
- Purpose: Initialize pickup process
- Authentication: Required (customer or staff)
- Request: Booking ID in URL
- Response: Pickup session data, vehicle details, checklist
- Status Codes: 200 (success), 404 (booking not found), 400 (already picked up)


**POST /api/bookings/:bookingId/pickup/verify-location**
- Purpose: Verify customer is at pickup location
- Authentication: Required
- Request Body: `{ latitude: number, longitude: number, accuracy: number }`
- Response: `{ verified: boolean, distance: number, withinGeofence: boolean }`
- Status Codes: 200 (success), 400 (invalid coordinates)

**POST /api/bookings/:bookingId/pickup/upload-inspection-photo**
- Purpose: Upload inspection photo/video
- Authentication: Required
- Request: Multipart form data with image file
- Response: `{ photoId: string, url: string, timestamp: string, aiProcessing: boolean }`
- Status Codes: 201 (created), 400 (invalid file), 413 (file too large)

**POST /api/bookings/:bookingId/pickup/detect-damage**
- Purpose: Run AI damage detection on uploaded photos
- Authentication: Required
- Request Body: `{ photoIds: string[] }`
- Response: `{ damages: Array<{ location, type, severity, confidence, boundingBox }> }`
- Status Codes: 200 (success), 202 (processing), 400 (invalid photos)

**POST /api/bookings/:bookingId/pickup/submit-readings**
- Purpose: Submit odometer and fuel readings
- Authentication: Required
- Request Body: `{ odometerReading: number, odometerPhotoId: string, fuelLevel: number, fuelPhotoId: string, batteryLevel?: number }`
- Response: `{ validated: boolean, warnings: string[] }`
- Status Codes: 200 (success), 400 (invalid readings)

**POST /api/bookings/:bookingId/pickup/confirm-damage**
- Purpose: Confirm damage report
- Authentication: Required
- Request Body: `{ damages: Array<{ location, type, severity, notes, photoIds }>, customerAcknowledged: boolean }`
- Response: `{ damageReportId: string, confirmed: boolean }`
- Status Codes: 200 (success), 400 (invalid damage data)

**POST /api/bookings/:bookingId/pickup/activate-key**
- Purpose: Activate digital key for vehicle
- Authentication: Required
- Request Body: `{ deviceId: string, bluetoothMac?: string }`
- Response: `{ keyId: string, activated: boolean, expiresAt: string }`
- Status Codes: 200 (success), 400 (activation failed), 503 (key service unavailable)


**POST /api/bookings/:bookingId/pickup/complete**
- Purpose: Complete pickup process and start trip
- Authentication: Required
- Request Body: `{ pickupConfirmed: boolean, startTime: string }`
- Response: `{ tripId: string, startTime: string, documentationUrl: string }`
- Status Codes: 200 (success), 400 (incomplete pickup), 409 (already started)

#### Return Endpoints

**POST /api/trips/:tripId/return/start**
- Purpose: Initialize return process
- Authentication: Required
- Request: Trip ID in URL
- Response: Return session data, pickup documentation, expected charges
- Status Codes: 200 (success), 404 (trip not found), 400 (already returned)

**POST /api/trips/:tripId/return/verify-location**
- Purpose: Verify customer is at return location
- Authentication: Required
- Request Body: `{ latitude: number, longitude: number, accuracy: number }`
- Response: `{ verified: boolean, distance: number, withinGeofence: boolean, afterHours: boolean }`
- Status Codes: 200 (success), 400 (invalid coordinates)

**POST /api/trips/:tripId/return/submit-final-readings**
- Purpose: Submit final odometer and fuel readings
- Authentication: Required
- Request Body: `{ finalOdometer: number, odometerPhotoId: string, finalFuelLevel: number, fuelPhotoId: string, finalBatteryLevel?: number }`
- Response: `{ totalMiles: number, fuelUsed: number, mileageOverage: number, fuelCharge: number }`
- Status Codes: 200 (success), 400 (invalid readings)

**POST /api/trips/:tripId/return/upload-inspection-photo**
- Purpose: Upload return inspection photo
- Authentication: Required
- Request: Multipart form data with image file
- Response: `{ photoId: string, url: string, timestamp: string }`
- Status Codes: 201 (created), 400 (invalid file)


**POST /api/trips/:tripId/return/compare-damage**
- Purpose: Compare return photos with pickup photos using AI
- Authentication: Required
- Request Body: `{ returnPhotoIds: string[] }`
- Response: `{ newDamages: Array<{ location, type, severity, estimatedCost, pickupPhotoId, returnPhotoId, confidence }> }`
- Status Codes: 200 (success), 202 (processing), 400 (invalid photos)

**POST /api/trips/:tripId/return/dispute-damage**
- Purpose: Dispute a damage charge
- Authentication: Required
- Request Body: `{ damageId: string, reason: string, evidencePhotoIds?: string[] }`
- Response: `{ disputeId: string, status: string, reviewRequired: boolean }`
- Status Codes: 200 (success), 400 (invalid dispute)

**POST /api/trips/:tripId/return/deactivate-key**
- Purpose: Deactivate digital key and lock vehicle
- Authentication: Required
- Request Body: `{ keyId: string, lockConfirmed: boolean }`
- Response: `{ deactivated: boolean, vehicleLocked: boolean }`
- Status Codes: 200 (success), 400 (deactivation failed)

**GET /api/trips/:tripId/return/calculate-charges**
- Purpose: Calculate final charges before completion
- Authentication: Required
- Response: `{ baseRental, additionalDays, fuelCharges, mileageCharges, damageCharges, cleaningFees, taxes, total }`
- Status Codes: 200 (success), 404 (trip not found)

**POST /api/trips/:tripId/return/complete**
- Purpose: Complete return process and finalize charges
- Authentication: Required
- Request Body: `{ returnConfirmed: boolean, endTime: string, finalChargesAcknowledged: boolean }`
- Response: `{ invoiceId: string, totalCharged: number, depositReleased: number, documentationUrl: string }`
- Status Codes: 200 (success), 400 (incomplete return), 402 (payment failed)

### Request Schemas

#### PickupStartRequest
```
{
  bookingId: string (UUID)
}
```


#### LocationVerificationRequest
```
{
  latitude: number (decimal degrees, -90 to 90),
  longitude: number (decimal degrees, -180 to 180),
  accuracy: number (meters, positive)
}
```

#### InspectionPhotoUpload
```
Multipart form data:
- file: image/jpeg, image/png, or video/mp4
- viewAngle: enum (front, rear, left, right, roof, interior-front, interior-rear)
- timestamp: ISO 8601 datetime
```

#### DamageDetectionRequest
```
{
  photoIds: string[] (array of photo UUIDs)
}
```

#### ReadingsSubmissionRequest
```
{
  odometerReading: number (positive integer, miles or km),
  odometerPhotoId: string (UUID),
  fuelLevel: number (0-100, percentage),
  fuelPhotoId: string (UUID),
  batteryLevel?: number (0-100, percentage, for EVs)
}
```

#### DamageConfirmationRequest
```
{
  damages: Array<{
    location: string (front-bumper, rear-door-left, etc.),
    type: enum (scratch, dent, crack, chip, stain, tear),
    severity: enum (minor, moderate, major),
    notes: string (optional),
    photoIds: string[] (UUIDs)
  }>,
  customerAcknowledged: boolean
}
```

#### KeyActivationRequest
```
{
  deviceId: string (customer's device identifier),
  bluetoothMac?: string (optional, for BLE pairing)
}
```


#### PickupCompletionRequest
```
{
  pickupConfirmed: boolean,
  startTime: string (ISO 8601 datetime)
}
```

#### ReturnCompletionRequest
```
{
  returnConfirmed: boolean,
  endTime: string (ISO 8601 datetime),
  finalChargesAcknowledged: boolean
}
```

#### DamageDisputeRequest
```
{
  damageId: string (UUID),
  reason: string (max 500 characters),
  evidencePhotoIds?: string[] (optional, additional evidence)
}
```

### Response Schemas

#### PickupSessionResponse
```
{
  sessionId: string (UUID),
  booking: {
    id: string,
    referenceNumber: string,
    customer: { name, email, phone },
    vehicle: { make, model, year, color, licensePlate, vin },
    pickupLocation: { name, address, coordinates, geofenceRadius },
    scheduledPickupTime: string (ISO 8601)
  },
  checklist: Array<{
    step: string,
    completed: boolean,
    required: boolean
  }>,
  baselineCondition: {
    knownDamages: Array<{ location, type, severity, photoUrl }>,
    lastInspectionDate: string
  }
}
```

#### LocationVerificationResponse
```
{
  verified: boolean,
  distance: number (meters from target location),
  withinGeofence: boolean,
  message?: string (explanation if not verified)
}
```


#### InspectionPhotoResponse
```
{
  photoId: string (UUID),
  url: string (signed URL for viewing),
  thumbnail: string (signed URL for thumbnail),
  timestamp: string (ISO 8601),
  viewAngle: string,
  aiProcessing: boolean (true if queued for AI analysis)
}
```

#### DamageDetectionResponse
```
{
  damages: Array<{
    id: string (UUID),
    location: string,
    type: enum (scratch, dent, crack, chip),
    severity: enum (minor, moderate, major),
    confidence: number (0-100, AI confidence score),
    boundingBox: { x, y, width, height } (pixel coordinates),
    photoId: string (source photo UUID),
    estimatedCost?: number (optional, if available)
  }>,
  processingComplete: boolean,
  totalDamagesDetected: number
}
```

#### ReadingsValidationResponse
```
{
  validated: boolean,
  odometerReading: number,
  fuelLevel: number,
  batteryLevel?: number,
  warnings: string[] (e.g., "Odometer reading seems unusually high"),
  previousReading?: number (for comparison on return)
}
```

#### KeyActivationResponse
```
{
  keyId: string (UUID),
  activated: boolean,
  expiresAt: string (ISO 8601, when key will auto-deactivate),
  vehicleId: string,
  instructions: string (how to use the digital key)
}
```

#### TripStartResponse
```
{
  tripId: string (UUID),
  startTime: string (ISO 8601),
  expectedReturnTime: string (ISO 8601),
  documentationUrl: string (PDF with all pickup documentation),
  pickupSummary: {
    odometerReading: number,
    fuelLevel: number,
    damagesDocumented: number,
    photosUploaded: number
  }
}
```


#### ReturnSessionResponse
```
{
  sessionId: string (UUID),
  trip: {
    id: string,
    startTime: string,
    duration: number (hours),
    vehicle: { make, model, licensePlate },
    returnLocation: { name, address, coordinates, geofenceRadius }
  },
  pickupDocumentation: {
    odometerReading: number,
    fuelLevel: number,
    damages: Array<{ location, type, severity, photoUrl }>,
    photos: string[] (URLs)
  },
  expectedCharges: {
    baseRental: number,
    estimatedFuel: number,
    estimatedMileage: number,
    estimatedTotal: number
  }
}
```

#### DamageComparisonResponse
```
{
  newDamages: Array<{
    id: string (UUID),
    location: string,
    type: string,
    severity: enum (minor, moderate, major),
    estimatedCost: number,
    pickupPhotoId: string (for comparison),
    returnPhotoId: string (showing new damage),
    confidence: number (0-100),
    insuranceCovered: boolean,
    customerLiability: number
  }>,
  totalNewDamages: number,
  totalEstimatedCost: number,
  comparisonComplete: boolean
}
```

#### FinalChargesResponse
```
{
  baseRental: number,
  additionalDays: { days: number, cost: number },
  fuelCharges: { gallonsMissing: number, cost: number },
  mileageCharges: { overageMiles: number, cost: number },
  damageCharges: Array<{ damageId: string, description: string, cost: number }>,
  cleaningFees: number,
  tollCharges: number,
  lateFees: number,
  taxes: number,
  subtotal: number,
  total: number,
  securityDepositUsed: number,
  additionalPaymentRequired: number
}
```


#### ReturnCompletionResponse
```
{
  invoiceId: string (UUID),
  totalCharged: number,
  depositReleased: number (amount released back to customer),
  depositReleaseDate: string (ISO 8601, typically 7-14 days),
  documentationUrl: string (PDF with all return documentation and invoice),
  returnSummary: {
    tripDuration: number (hours),
    totalMiles: number,
    finalOdometer: number,
    finalFuelLevel: number,
    newDamagesFound: number,
    totalCharges: number
  }
}
```

### Business Logic

#### Location Verification Logic
- Calculate distance between customer GPS coordinates and target location
- Verify customer is within geofence radius (typically 100-200 meters)
- Account for GPS accuracy (if accuracy > 50m, require manual verification)
- Allow manual override with reason (e.g., GPS not working, indoor parking)
- Log all location verification attempts for audit trail

#### AI Damage Detection Logic
- Process uploaded photos through computer vision model
- Detect damage types: scratches, dents, cracks, chips, stains, tears
- Calculate severity based on size and depth
- Assign confidence score (0-100) to each detection
- Filter out low-confidence detections (< 60% confidence)
- Compare detected damage against vehicle baseline condition
- For return: compare return photos with pickup photos to identify new damage
- Flag significant damage for manual review
- Store all AI analysis results for dispute resolution

#### Odometer Validation Logic
- Verify odometer reading is numeric and positive
- For return: ensure final reading > pickup reading
- Calculate total miles driven
- Flag suspicious readings (e.g., > 500 miles/day for local rental)
- Compare with GPS tracking data if available
- Require photo verification for all readings


#### Fuel Charge Calculation Logic
- Determine fuel policy (full-to-full, prepaid, like-for-like)
- For full-to-full: calculate gallons/liters missing from full tank
- Apply per-gallon rate (typically $8-12/gallon, higher than market rate)
- Add fuel service fee if applicable
- For prepaid: no additional charges regardless of return level
- For like-for-like: compare pickup vs return levels, charge or credit difference
- Validate fuel level with photo evidence

#### Mileage Overage Calculation Logic
- Calculate total miles: final odometer - pickup odometer
- Determine mileage allowance (unlimited or daily limit)
- If limited: calculate overage = total miles - allowance
- Apply per-mile overage rate (typically $0.25-0.50/mile)
- Display overage warning before return completion
- No charges for unlimited mileage plans

#### Damage Cost Estimation Logic
- Classify damage severity: minor ($50-200), moderate ($200-500), major ($500+)
- Use standard repair cost database for common damage types
- Apply insurance coverage if customer purchased protection
- Calculate customer liability based on insurance deductible
- For major damage: flag for manual assessment by staff
- Store all cost calculations for transparency

#### Final Charges Calculation Logic
- Sum all charge components: base rental, additional days, fuel, mileage, damage, cleaning, tolls, late fees
- Apply taxes based on location and rental duration
- Calculate security deposit usage
- Determine if additional payment required beyond deposit
- Generate itemized invoice with all charges explained
- Process payment against authorized payment method
- Handle payment failures with retry logic


#### Digital Key Management Logic
- Generate unique key ID for each trip
- Activate key only after pickup confirmation
- Set key expiration to scheduled return time + grace period
- Support Bluetooth Low Energy (BLE) for vehicle communication
- Enable lock/unlock commands through key service
- Deactivate key immediately upon return completion
- Log all key usage events for security audit
- Handle key sharing for additional drivers

### Authentication Requirements

All pickup and return endpoints require:
- Valid JWT token with customer or staff role
- Customer must be the booking owner or authorized additional driver
- Staff must have pickup/return processing permissions
- Token must not be expired
- Rate limiting: 100 requests per 15 minutes per user
- IP-based rate limiting for photo uploads: 50 uploads per hour

Additional security measures:
- Location verification to prevent remote pickup/return fraud
- Photo metadata validation (timestamp, GPS coordinates if available)
- Device fingerprinting to detect suspicious activity
- Multi-factor authentication for high-value vehicles
- Audit logging of all pickup/return actions

## Database Specifications

### Schema Changes

#### New Tables

**digital_check_ins**
- id (UUID, primary key)
- booking_id (UUID, foreign key to bookings)
- customer_id (UUID, foreign key to users)
- check_in_status (enum: started, documents_uploaded, contract_signed, completed)
- documents_uploaded (boolean)
- contract_signed (boolean)
- signature_data (text, base64 encoded signature)
- signed_at (timestamp, nullable)
- express_pickup_code (varchar, unique, nullable)
- express_pickup_enabled (boolean, default false)
- created_at (timestamp)
- completed_at (timestamp, nullable)

**check_in_documents**
- id (UUID, primary key)
- check_in_id (UUID, foreign key to digital_check_ins)
- document_type (enum: license_front, license_back, additional_driver_license, credit_card)
- document_url (varchar, S3 or CDN URL)
- ocr_data (JSON, extracted information)
- verification_status (enum: pending, verified, rejected)
- uploaded_at (timestamp)

**pickup_sessions**
- id (UUID, primary key)
- booking_id (UUID, foreign key to bookings)
- customer_id (UUID, foreign key to users)
- vehicle_id (UUID, foreign key to vehicles)
- session_status (enum: started, in_progress, completed, abandoned)
- location_verified (boolean)
- location_verified_at (timestamp)
- customer_latitude (decimal)
- customer_longitude (decimal)
- created_at (timestamp)
- completed_at (timestamp)


**return_sessions**
- id (UUID, primary key)
- trip_id (UUID, foreign key to trips)
- customer_id (UUID, foreign key to users)
- vehicle_id (UUID, foreign key to vehicles)
- session_status (enum: started, in_progress, completed, abandoned)
- location_verified (boolean)
- location_verified_at (timestamp)
- customer_latitude (decimal)
- customer_longitude (decimal)
- created_at (timestamp)
- completed_at (timestamp)

**vehicle_inspections**
- id (UUID, primary key)
- inspection_type (enum: pickup, return, maintenance, damage_claim)
- booking_id (UUID, foreign key to bookings, nullable)
- trip_id (UUID, foreign key to trips, nullable)
- vehicle_id (UUID, foreign key to vehicles)
- inspector_id (UUID, foreign key to users)
- inspector_type (enum: customer, staff, automated)
- odometer_reading (integer)
- fuel_level (integer, 0-100)
- battery_level (integer, 0-100, nullable for non-EVs)
- inspection_status (enum: pending, completed, disputed)
- notes (text, nullable)
- created_at (timestamp)
- completed_at (timestamp)

**inspection_photos**
- id (UUID, primary key)
- inspection_id (UUID, foreign key to vehicle_inspections)
- photo_url (varchar, S3 or CDN URL)
- thumbnail_url (varchar)
- view_angle (enum: front, rear, left, right, roof, interior_front, interior_rear, dashboard, odometer, fuel_gauge)
- file_size (integer, bytes)
- mime_type (varchar)
- metadata (JSON, EXIF data, GPS coordinates if available)
- ai_processed (boolean)
- uploaded_at (timestamp)


**vehicle_damages**
- id (UUID, primary key)
- vehicle_id (UUID, foreign key to vehicles)
- inspection_id (UUID, foreign key to vehicle_inspections)
- damage_type (enum: scratch, dent, crack, chip, stain, tear, mechanical)
- damage_location (varchar, e.g., front_bumper, rear_door_left)
- severity (enum: minor, moderate, major, total_loss)
- estimated_cost (decimal)
- actual_cost (decimal, nullable, after repair)
- description (text)
- detected_by (enum: ai, customer, staff)
- ai_confidence (integer, 0-100, nullable)
- bounding_box (JSON, {x, y, width, height})
- photo_ids (JSON array of UUIDs)
- repair_status (enum: pending, in_progress, completed, waived)
- created_at (timestamp)
- repaired_at (timestamp, nullable)

**damage_comparisons**
- id (UUID, primary key)
- trip_id (UUID, foreign key to trips)
- pickup_inspection_id (UUID, foreign key to vehicle_inspections)
- return_inspection_id (UUID, foreign key to vehicle_inspections)
- new_damage_id (UUID, foreign key to vehicle_damages, nullable)
- comparison_status (enum: pending, completed, disputed)
- ai_confidence (integer, 0-100)
- customer_liability (decimal)
- insurance_covered (boolean)
- dispute_id (UUID, foreign key to damage_disputes, nullable)
- created_at (timestamp)

**damage_disputes**
- id (UUID, primary key)
- damage_id (UUID, foreign key to vehicle_damages)
- trip_id (UUID, foreign key to trips)
- customer_id (UUID, foreign key to users)
- dispute_reason (text)
- evidence_photo_ids (JSON array of UUIDs)
- dispute_status (enum: pending, under_review, resolved_customer, resolved_company, escalated)
- resolution_notes (text, nullable)
- resolved_by (UUID, foreign key to users, nullable)
- created_at (timestamp)
- resolved_at (timestamp, nullable)


**digital_keys**
- id (UUID, primary key)
- trip_id (UUID, foreign key to trips)
- vehicle_id (UUID, foreign key to vehicles)
- customer_id (UUID, foreign key to users)
- device_id (varchar)
- bluetooth_mac (varchar, nullable)
- key_status (enum: pending, active, deactivated, expired)
- activated_at (timestamp, nullable)
- expires_at (timestamp)
- deactivated_at (timestamp, nullable)
- usage_log (JSON array of {action, timestamp})
- created_at (timestamp)

**trip_charges**
- id (UUID, primary key)
- trip_id (UUID, foreign key to trips)
- charge_type (enum: base_rental, additional_days, fuel, mileage_overage, damage, cleaning, tolls, late_fee, tax)
- charge_description (varchar)
- quantity (decimal, nullable, e.g., gallons of fuel, miles over)
- unit_price (decimal, nullable)
- amount (decimal)
- tax_amount (decimal)
- total_amount (decimal)
- charge_status (enum: pending, authorized, charged, refunded, disputed)
- damage_id (UUID, foreign key to vehicle_damages, nullable)
- created_at (timestamp)
- charged_at (timestamp, nullable)

### Modified Tables

**bookings**
- Add column: digital_check_in_id (UUID, foreign key to digital_check_ins, nullable)
- Add column: check_in_completed_at (timestamp, nullable)
- Add column: express_pickup_enabled (boolean, default false)
- Add column: pickup_session_id (UUID, foreign key to pickup_sessions, nullable)
- Add column: pickup_completed_at (timestamp, nullable)
- Add indexes on digital_check_in_id and pickup_session_id

**trips**
- Add column: return_session_id (UUID, foreign key to return_sessions, nullable)
- Add column: pickup_inspection_id (UUID, foreign key to vehicle_inspections, nullable)
- Add column: return_inspection_id (UUID, foreign key to vehicle_inspections, nullable)
- Add column: digital_key_id (UUID, foreign key to digital_keys, nullable)
- Add column: return_completed_at (timestamp, nullable)
- Add column: final_invoice_id (UUID, foreign key to invoices, nullable)
- Add indexes on inspection IDs and key ID


**vehicles**
- Add column: baseline_condition_inspection_id (UUID, foreign key to vehicle_inspections, nullable)
- Add column: current_condition_status (enum: excellent, good, fair, poor, damaged)
- Add column: last_inspection_date (timestamp)
- Add column: known_damages_count (integer, default 0)

### Relationships

- digital_check_ins.booking_id → bookings.id (many-to-one)
- check_in_documents.check_in_id → digital_check_ins.id (many-to-one)
- pickup_sessions.booking_id → bookings.id (many-to-one)
- return_sessions.trip_id → trips.id (many-to-one)
- vehicle_inspections.vehicle_id → vehicles.id (many-to-one)
- vehicle_inspections.booking_id → bookings.id (many-to-one, nullable)
- vehicle_inspections.trip_id → trips.id (many-to-one, nullable)
- inspection_photos.inspection_id → vehicle_inspections.id (many-to-one)
- vehicle_damages.vehicle_id → vehicles.id (many-to-one)
- vehicle_damages.inspection_id → vehicle_inspections.id (many-to-one)
- damage_comparisons.trip_id → trips.id (many-to-one)
- damage_comparisons.pickup_inspection_id → vehicle_inspections.id (many-to-one)
- damage_comparisons.return_inspection_id → vehicle_inspections.id (many-to-one)
- damage_comparisons.new_damage_id → vehicle_damages.id (many-to-one, nullable)
- damage_disputes.damage_id → vehicle_damages.id (many-to-one)
- damage_disputes.trip_id → trips.id (many-to-one)
- digital_keys.trip_id → trips.id (many-to-one)
- digital_keys.vehicle_id → vehicles.id (many-to-one)
- trip_charges.trip_id → trips.id (many-to-one)
- trip_charges.damage_id → vehicle_damages.id (many-to-one, nullable)

### Indexes

Performance optimization indexes:
- digital_check_ins: (booking_id, check_in_status)
- digital_check_ins: (express_pickup_code) UNIQUE
- check_in_documents: (check_in_id, document_type)
- pickup_sessions: (booking_id, session_status)
- return_sessions: (trip_id, session_status)
- vehicle_inspections: (vehicle_id, inspection_type, created_at)
- vehicle_inspections: (booking_id), (trip_id)
- inspection_photos: (inspection_id, view_angle)
- vehicle_damages: (vehicle_id, repair_status)
- vehicle_damages: (inspection_id)
- damage_comparisons: (trip_id, comparison_status)
- damage_disputes: (customer_id, dispute_status)
- digital_keys: (trip_id, key_status)
- digital_keys: (vehicle_id, key_status)
- trip_charges: (trip_id, charge_type)


## Technology Stack

### Frontend
- Next.js 14+ with React 18+ for web application
- TypeScript for type safety
- React Native or Flutter for mobile apps (iOS/Android)
- Camera API for photo/video capture
- Geolocation API for GPS verification
- IndexedDB for offline photo storage
- WebRTC for real-time video inspection (optional)
- Canvas API for damage marking on vehicle diagrams

### Backend
- .NET 8+ with C# for API services
- ASP.NET Core Web API for RESTful endpoints
- Entity Framework Core for database ORM
- SignalR for real-time updates (optional)
- Azure Blob Storage or AWS S3 for photo/video storage
- Azure Computer Vision or AWS Rekognition for AI damage detection
- Azure Maps or Google Maps API for location services
- Background job processing (Hangfire or Azure Functions) for AI analysis

### Database
- MySQL 8.0+ with InnoDB storage engine
- JSON columns for flexible metadata storage
- Full-text search indexes for damage descriptions
- Spatial indexes for location queries (if using MySQL spatial types)

### External Services
- Digital key provider API (e.g., Smartcar, Otonomo)
- AI/ML service for damage detection
- Mapping service for geocoding and geofencing
- Cloud storage for photos/videos
- Email service for documentation delivery
- SMS service for notifications

## Implementation Notes

### AI Damage Detection Considerations

The AI damage detection system should:
- Use pre-trained computer vision models (e.g., YOLO, Faster R-CNN) fine-tuned on vehicle damage images
- Process images asynchronously to avoid blocking user flow
- Provide confidence scores to help users trust or question detections
- Allow manual override and correction of AI detections
- Continuously improve through feedback loop (disputed damages used for retraining)
- Handle various lighting conditions and photo angles
- Filter out reflections, shadows, and dirt that might be misidentified as damage


### Digital Key Integration

Digital key implementation requires:
- Integration with vehicle telematics system or OEM API
- Bluetooth Low Energy (BLE) support for proximity-based unlock
- Secure key generation and distribution
- Key expiration and automatic deactivation
- Fallback to physical keys if digital key fails
- Support for key sharing with additional drivers
- Battery optimization for mobile apps
- Offline key caching for areas with poor connectivity

### Location Verification Best Practices

- Use device GPS with fallback to network-based location
- Implement geofencing with appropriate radius (100-200m for parking lots)
- Account for GPS accuracy and indoor/underground parking
- Provide manual override with reason logging for edge cases
- Display helpful error messages when location verification fails
- Show map with user location and target location for transparency
- Consider time-based verification (e.g., must be within 2 hours of scheduled time)

### Photo Storage and Management

- Compress photos before upload to reduce bandwidth and storage costs
- Generate thumbnails for gallery views
- Use signed URLs with expiration for secure photo access
- Implement progressive upload with retry logic for poor connectivity
- Store photos in cloud storage (S3, Azure Blob) with CDN for fast access
- Retain photos for minimum 2 years for dispute resolution
- Implement photo deletion policy per data retention regulations
- Tag photos with metadata (timestamp, GPS, device info) for authenticity

### Performance Optimization

- Lazy load inspection photos in gallery views
- Cache vehicle diagrams and UI assets
- Preload next step in workflow for faster navigation
- Use optimistic UI updates for better perceived performance
- Implement offline mode with sync when connectivity restored
- Compress API responses with gzip
- Use pagination for damage lists and photo galleries
- Implement request debouncing for location verification


### Security Considerations

- Validate all uploaded photos for file type and size
- Scan uploaded files for malware
- Prevent photo manipulation by validating EXIF metadata
- Rate limit photo uploads to prevent abuse
- Encrypt photos at rest and in transit
- Implement access controls (only booking owner and staff can view)
- Log all access to sensitive inspection data
- Implement fraud detection for suspicious patterns (e.g., same damage photos used multiple times)
- Use device fingerprinting to detect account sharing or fraud
- Require re-authentication for high-value damage disputes

### Dispute Resolution Process

When a customer disputes damage charges:
1. Customer submits dispute with reason and optional evidence photos
2. System flags dispute for staff review
3. Staff reviews pickup photos, return photos, and AI analysis
4. Staff can request additional evidence or schedule in-person inspection
5. Decision is made: uphold charge, reduce charge, or waive charge
6. Customer is notified of decision with explanation
7. If charge waived, refund is processed automatically
8. Dispute resolution is logged for quality improvement

### Accessibility Requirements

- Support screen readers for visually impaired users
- Provide alternative text for all images and icons
- Ensure sufficient color contrast for readability
- Support keyboard navigation for all interactions
- Provide voice guidance for inspection process
- Allow text-to-speech for instructions
- Support larger text sizes
- Provide haptic feedback for mobile interactions
- Ensure camera interface is accessible with voice commands

### Internationalization

- Support multiple languages for UI and instructions
- Localize date/time formats
- Support metric and imperial units (miles vs kilometers, gallons vs liters)
- Localize currency formatting
- Provide region-specific fuel policies
- Support right-to-left languages
- Localize damage terminology
- Provide translated documentation and invoices


### Testing Strategy

#### Unit Tests
- Location distance calculation
- Fuel charge calculation
- Mileage overage calculation
- Damage cost estimation
- Final charges calculation
- Photo validation logic
- Key activation/deactivation logic

#### Integration Tests
- Complete pickup flow end-to-end
- Complete return flow end-to-end
- AI damage detection integration
- Digital key service integration
- Payment processing integration
- Photo upload and storage
- Email notification delivery

#### User Acceptance Tests
- Customer can complete pickup in under 15 minutes
- Customer can complete return in under 15 minutes
- AI detects at least 80% of visible damage
- Location verification works in 95% of cases
- Digital key activates successfully 99% of the time
- Final charges are accurate and transparent
- Dispute process is clear and fair

#### Performance Tests
- Photo upload completes in under 10 seconds on 4G
- AI damage detection completes in under 30 seconds
- Location verification responds in under 2 seconds
- Final charges calculation completes in under 1 second
- System handles 100 concurrent pickups/returns
- Database queries complete in under 100ms

### Monitoring and Analytics

Track key metrics:
- Average pickup completion time
- Average return completion time
- Photo upload success rate
- AI damage detection accuracy
- Location verification success rate
- Digital key activation success rate
- Dispute rate (% of returns with disputes)
- Customer satisfaction scores
- Staff intervention rate (% requiring manual review)
- System uptime and error rates


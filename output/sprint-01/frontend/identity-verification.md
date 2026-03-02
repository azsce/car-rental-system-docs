# Feature: Identity Verification

## Overview

Identity verification is a comprehensive system that ensures only qualified and verified users can rent vehicles on the platform. This feature combines driver license verification (F-AM-008), advanced digital KYC (Know Your Customer) processes (F-AM-009), and real-time document verification at pickup (F-WF-PICK-002) to create a secure, fraud-resistant, and user-friendly verification experience. The system uses OCR technology, AI-powered liveness detection, facial recognition, and database cross-referencing to validate user identities while maintaining a smooth user experience.

The document verification system at pickup validates driver's license authenticity, checks expiration dates, verifies age requirements, and matches information with booking details to prevent fraud and ensure compliance with rental policies.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-008: Driver License Verification
- F-AM-009: Digital KYC (Know Your Customer)
- F-WF-PICK-002: Document Verification System (at pickup counter)

## User Stories

### Driver License Verification

**As a new user**, I want to upload my driver's license and have it verified automatically, so that I can quickly prove I'm qualified to rent vehicles without waiting for manual approval.

**As a platform operator**, I want to verify that users have valid driver's licenses, so that only qualified drivers can rent vehicles and we reduce liability risks.

**As a returning user**, I want to be notified when my license is about to expire, so that I can update my information and continue renting without interruption.

### Digital KYC

**As a user renting a high-value vehicle**, I want to complete enhanced identity verification quickly using my phone, so that I can access premium vehicles without visiting a physical location.

**As a platform operator**, I want to perform comprehensive identity verification with liveness checks and facial recognition, so that I can prevent fraud and build trust in the platform.

**As a subscription user**, I want my verification to be portable across different rental platforms, so that I don't have to repeat the verification process multiple times.

### Document Verification at Pickup

**As a rental counter staff member**, I want to quickly verify a customer's driver's license authenticity and validity, so that I can ensure only qualified drivers receive vehicles.

**As a rental counter staff member**, I want the system to automatically check license expiration and age requirements, so that I don't miss critical validation steps during busy periods.

**As a customer at pickup**, I want my license verification to be quick and seamless, so that I can get my vehicle without unnecessary delays.

**As a fleet manager**, I want all pickups to include verified license checks, so that we maintain compliance and reduce liability risks.

## Frontend Specifications

### Pages

#### 1. License Upload Page (`/account/verification/license`)


**Purpose**: Allow users to upload driver's license images for verification

**Components**:
- Document upload interface with camera and file picker options
- Real-time image quality feedback
- Preview of uploaded images (front and back)
- Upload progress indicator
- Guidelines for optimal photo quality
- Support for international driving permits

**User Flow**:
1. User navigates to verification page from profile or booking flow
2. System displays clear instructions with example images
3. User captures or selects license front image
4. System validates image quality in real-time
5. User captures or selects license back image
6. System displays preview and confirmation
7. User submits for verification
8. System shows processing status

#### 2. KYC Verification Page (`/account/verification/kyc`)

**Purpose**: Guide users through enhanced identity verification process

**Components**:
- Multi-step verification wizard
- Document type selector (license, passport, national ID)
- Document scanner with OCR feedback
- Liveness check interface with instructions
- Selfie capture with facial recognition
- Verification progress tracker
- Verification level indicator (Basic, Standard, Enhanced, Premium)

**User Flow**:
1. User selects document type for verification
2. System guides through document scanning
3. OCR extracts and displays information for confirmation
4. User performs liveness check (blink, turn head, smile)
5. User captures selfie for facial matching
6. System processes and displays verification status
7. User receives verification level assignment

#### 3. Verification Status Dashboard (`/account/verification`)

**Purpose**: Display overall verification status and manage verification documents

**Components**:
- Verification status overview with badges
- List of completed verifications (email, phone, license, KYC)
- Expiration dates and renewal reminders
- Re-submission options for rejected verifications
- Verification history timeline
- Trust score display

#### 4. Pickup Counter Verification Interface (`/staff/pickup/:bookingId/verify-documents`)

**Purpose**: Staff interface for real-time document verification at pickup counter

**Components**:
- Customer information display
- License scanner interface
- Real-time authenticity check results
- Age verification calculator
- Booking information match validator
- Verification approval/rejection controls
- Override options with justification
- Verification history for customer



### UI Components

#### LicenseUploadCard Component

**Purpose**: Handle driver license image capture and upload

**Props**:
- `onUploadComplete`: Callback when upload succeeds
- `documentSide`: "front" or "back"
- `existingImage`: URL of previously uploaded image (optional)

**Features**:
- Camera access for live capture
- File picker for gallery selection
- Image quality validation (resolution, brightness, blur)
- Real-time feedback on image quality
- Crop and rotate tools
- Retry mechanism for failed uploads

#### OCRDataReview Component

**Purpose**: Display extracted OCR data for user confirmation

**Props**:
- `extractedData`: Object containing license number, name, DOB, expiration
- `profileData`: User's profile information for comparison
- `onConfirm`: Callback when user confirms data accuracy
- `onEdit`: Callback to manually correct OCR errors

**Features**:
- Side-by-side comparison of extracted vs profile data
- Highlight mismatches in red
- Manual edit fields for corrections
- Confidence score display for each field

#### LivenessCheckInterface Component

**Purpose**: Guide users through liveness detection process

**Props**:
- `onComplete`: Callback when liveness check passes
- `checkType`: "blink", "turn_head", or "smile"

**Features**:
- Real-time camera feed
- Visual instructions and animations
- Progress indicator
- Success/failure feedback
- Retry mechanism
- Accessibility support for users who cannot perform certain actions

#### FacialMatchingDisplay Component

**Purpose**: Show facial recognition matching results

**Props**:
- `selfieImage`: User's selfie image
- `documentPhoto`: Photo from ID document
- `matchScore`: Confidence score (0-100)
- `status`: "processing", "matched", "review_needed", "rejected"

**Features**:
- Side-by-side image comparison
- Match confidence visualization
- Status indicator with color coding
- Explanation of match result
- Next steps guidance

#### PickupDocumentVerifier Component

**Purpose**: Staff interface for verifying documents at pickup counter

**Props**:
- `bookingId`: Booking identifier
- `customerId`: Customer identifier
- `onVerificationComplete`: Callback when verification approved/rejected

**Features**:
- License scanner with camera or file input
- Real-time OCR processing
- Authenticity check indicators (hologram detection, UV features)
- Expiration date validation with visual alerts
- Age calculation and requirement check
- Booking information comparison
- Approve/reject buttons with reason codes
- Override capability with manager approval
- Verification history display

#### LicenseAuthenticityChecker Component

**Purpose**: Display authenticity validation results for physical licenses

**Props**:
- `licenseData`: Extracted license information
- `authenticityScore`: Confidence score (0-100)
- `securityFeatures`: Array of detected security features

**Features**:
- Security feature checklist (hologram, UV marks, microprinting)
- Authenticity confidence meter
- Red flags display (tampered, fake, expired)
- Comparison with DMV database results
- Manual verification override option

#### VerificationBadge Component

**Purpose**: Display verification status badges on user profile

**Props**:
- `verificationType`: "email", "phone", "license", "kyc"
- `status`: "verified", "pending", "rejected", "expired"
- `expirationDate`: Date when verification expires (optional)

**Features**:
- Icon and color coding by status
- Tooltip with verification details
- Click to view full verification information
- Expiration warning indicator



### Data Requirements

#### From Backend APIs

**License Verification Data**:
- Upload endpoint for license images
- OCR extraction results
- Verification status and history
- Expiration date tracking
- Rejection reasons and feedback
- Re-submission capabilities

**KYC Verification Data**:
- Supported document types by region
- Liveness check requirements
- Facial matching results and confidence scores
- Verification level assignment
- Database cross-reference results
- Trust score calculation

**User Verification Status**:
- Overall verification completeness
- Individual verification statuses
- Verification badges and levels
- Expiration dates and renewal reminders
- Verification history timeline

**Pickup Counter Verification Data**:
- Real-time license authenticity check results
- Age verification calculations
- Booking information match status
- DMV database lookup results
- Previous verification history for customer
- Override permissions and justifications

## Backend Specifications

### API Endpoints

#### POST /api/v1/verification/license/upload

**Purpose**: Upload driver license images for verification

**Request Body**:
```
{
  "documentSide": "front" | "back",
  "image": "base64_encoded_image_data",
  "imageFormat": "jpeg" | "png" | "pdf",
  "userId": "string"
}
```

**Response**:
```
{
  "uploadId": "string",
  "status": "uploaded",
  "imageUrl": "string",
  "qualityScore": number (0-100),
  "qualityIssues": ["blur", "low_resolution", "poor_lighting"],
  "timestamp": "ISO8601"
}
```

**Business Logic**:
- Validate image format and size (max 10MB)
- Check image quality (resolution, brightness, blur detection)
- Store image securely in cloud storage
- Generate secure URL for image access
- Return quality feedback for user guidance



#### POST /api/v1/verification/license/process

**Purpose**: Process uploaded license images with OCR and validation

**Request Body**:
```
{
  "userId": "string",
  "frontImageId": "string",
  "backImageId": "string"
}
```

**Response**:
```
{
  "verificationId": "string",
  "status": "processing" | "completed" | "review_needed" | "rejected",
  "extractedData": {
    "licenseNumber": "string",
    "fullName": "string",
    "dateOfBirth": "ISO8601",
    "expirationDate": "ISO8601",
    "issuingState": "string",
    "licenseClass": "string"
  },
  "dataMatches": {
    "name": boolean,
    "dateOfBirth": boolean
  },
  "confidenceScore": number (0-100),
  "requiresManualReview": boolean
}
```

**Business Logic**:
- Use OCR service to extract text from license images
- Parse extracted text into structured data fields
- Validate extracted data against user profile
- Calculate confidence score based on OCR quality
- Flag for manual review if confidence < 85% or data mismatch
- Update user verification status

#### POST /api/v1/verification/kyc/initiate

**Purpose**: Start enhanced KYC verification process

**Request Body**:
```
{
  "userId": "string",
  "documentType": "license" | "passport" | "national_id",
  "verificationLevel": "standard" | "enhanced" | "premium"
}
```

**Response**:
```
{
  "sessionId": "string",
  "requiredSteps": ["document_scan", "liveness_check", "facial_match"],
  "estimatedTime": "2-3 minutes",
  "expiresAt": "ISO8601"
}
```

**Business Logic**:
- Create KYC verification session
- Determine required verification steps based on level
- Generate session token for secure verification flow
- Set session expiration (15 minutes)



#### POST /api/v1/verification/kyc/liveness-check

**Purpose**: Perform AI-powered liveness detection

**Request Body**:
```
{
  "sessionId": "string",
  "videoFrames": ["base64_encoded_frame_1", "base64_encoded_frame_2", ...],
  "checkType": "blink" | "turn_head" | "smile"
}
```

**Response**:
```
{
  "passed": boolean,
  "confidence": number (0-100),
  "livenessScore": number (0-100),
  "spoofingDetected": boolean,
  "feedback": "string"
}
```

**Business Logic**:
- Analyze video frames for liveness indicators
- Detect spoofing attempts (photos, videos, masks)
- Calculate liveness confidence score
- Require score > 90% to pass
- Provide feedback for failed attempts

#### POST /api/v1/verification/kyc/facial-match

**Purpose**: Compare selfie to ID document photo using facial recognition

**Request Body**:
```
{
  "sessionId": "string",
  "selfieImage": "base64_encoded_image",
  "documentPhoto": "base64_encoded_image"
}
```

**Response**:
```
{
  "matchScore": number (0-100),
  "matched": boolean,
  "requiresReview": boolean,
  "facialFeatures": {
    "faceDetected": boolean,
    "faceQuality": number (0-100),
    "eyesOpen": boolean,
    "frontalFace": boolean
  }
}
```

**Business Logic**:
- Extract facial features from both images
- Calculate similarity score using facial recognition AI
- Auto-approve if match score > 85%
- Flag for manual review if score 70-85%
- Reject if score < 70%
- Validate face quality and positioning

#### POST /api/v1/verification/kyc/complete

**Purpose**: Finalize KYC verification and assign verification level

**Request Body**:
```
{
  "sessionId": "string",
  "userId": "string"
}
```

**Response**:
```
{
  "verificationId": "string",
  "status": "approved" | "review_needed" | "rejected",
  "verificationLevel": "basic" | "standard" | "enhanced" | "premium",
  "trustScore": number (0-100),
  "completedAt": "ISO8601",
  "expiresAt": "ISO8601"
}
```

**Business Logic**:
- Aggregate all verification step results
- Assign verification level based on completed checks
- Calculate trust score
- Update user verification status
- Send confirmation notification
- Set verification expiration (1-2 years depending on level)



#### GET /api/v1/verification/status/:userId

**Purpose**: Retrieve user's overall verification status

**Response**:
```
{
  "userId": "string",
  "verifications": {
    "email": {
      "verified": boolean,
      "verifiedAt": "ISO8601"
    },
    "phone": {
      "verified": boolean,
      "verifiedAt": "ISO8601"
    },
    "license": {
      "verified": boolean,
      "verifiedAt": "ISO8601",
      "expiresAt": "ISO8601",
      "status": "verified" | "pending" | "rejected" | "expired"
    },
    "kyc": {
      "verified": boolean,
      "level": "basic" | "standard" | "enhanced" | "premium",
      "verifiedAt": "ISO8601",
      "expiresAt": "ISO8601"
    }
  },
  "trustScore": number (0-100),
  "completenessPercentage": number (0-100)
}
```

**Business Logic**:
- Retrieve all verification records for user
- Calculate overall completeness percentage
- Check for expired verifications
- Return current trust score

#### POST /api/v1/verification/license/resubmit

**Purpose**: Allow users to resubmit rejected license verification

**Request Body**:
```
{
  "userId": "string",
  "previousVerificationId": "string",
  "frontImageId": "string",
  "backImageId": "string"
}
```

**Response**:
```
{
  "verificationId": "string",
  "status": "processing",
  "message": "Your license has been resubmitted for verification"
}
```

**Business Logic**:
- Validate user has a rejected verification
- Create new verification attempt
- Link to previous attempt for admin context
- Process with same OCR and validation logic

#### POST /api/v1/verification/pickup/verify-license

**Purpose**: Verify driver's license authenticity and validity at pickup counter

**Request Body**:
```
{
  "bookingId": "string",
  "customerId": "string",
  "licenseNumber": "string",
  "issuingState": "string",
  "expirationDate": "ISO8601",
  "dateOfBirth": "ISO8601",
  "licenseImageId": "string" (optional, if scanned)
}
```

**Response**:
```
{
  "verificationId": "string",
  "verified": boolean,
  "authenticityScore": number (0-100),
  "checks": {
    "notExpired": boolean,
    "meetsAgeRequirement": boolean,
    "matchesBooking": boolean,
    "dmvDatabaseMatch": boolean,
    "securityFeaturesValid": boolean
  },
  "warnings": string[] (e.g., "License expires in 30 days"),
  "canProceed": boolean,
  "requiresManagerOverride": boolean
}
```

**Business Logic**:
- Validate license is not expired (expiration date > current date)
- Calculate customer age from date of birth
- Verify age meets minimum requirement (typically 21-25 depending on vehicle)
- Compare license information with booking customer details
- Query DMV database for license validity (if integration available)
- Check for suspended or revoked licenses
- Validate security features if physical license scanned
- Flag for manager override if any checks fail but circumstances warrant exception

#### POST /api/v1/verification/pickup/override-verification

**Purpose**: Allow manager to override failed verification with justification

**Request Body**:
```
{
  "verificationId": "string",
  "bookingId": "string",
  "managerId": "string",
  "overrideReason": string,
  "approvedByManager": boolean
}
```

**Response**:
```
{
  "overrideId": "string",
  "approved": boolean,
  "canProceedWithPickup": boolean,
  "auditLogged": boolean
}
```

**Business Logic**:
- Validate manager has override permissions
- Log override with full justification
- Update verification status to approved with override flag
- Send notification to compliance team for review
- Allow pickup to proceed
- Track override rate for quality monitoring

#### GET /api/v1/verification/pickup/customer-history/:customerId

**Purpose**: Retrieve customer's verification history for pickup staff

**Response**:
```
{
  "customerId": "string",
  "verificationHistory": Array<{
    "verificationId": string,
    "verificationType": string,
    "verifiedAt": string,
    "status": string,
    "notes": string
  }>,
  "currentVerificationStatus": {
    "licenseVerified": boolean,
    "licenseExpiration": string,
    "kycLevel": string,
    "trustScore": number
  },
  "previousRentals": number,
  "issuesReported": number,
  "riskLevel": "low" | "medium" | "high"
}
```

**Business Logic**:
- Retrieve all verification records for customer
- Calculate risk level based on history
- Flag any previous issues or disputes
- Provide context for pickup staff decision-making

### Authentication Requirements

**All verification endpoints require**:
- Valid JWT token in Authorization header
- User must be authenticated
- User can only access their own verification data
- Admin users can access any user's verification for review

**Rate Limiting**:
- License upload: 10 requests per hour per user
- KYC initiation: 5 sessions per day per user
- Liveness check: 20 attempts per session
- Facial match: 10 attempts per session


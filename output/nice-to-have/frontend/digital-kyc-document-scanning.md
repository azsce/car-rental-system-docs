# Feature: Digital KYC and Document Scanning

## Overview

Automated identity verification system using optical character recognition (OCR) and AI-powered document validation to verify user identities remotely. This feature enables users to complete Know Your Customer (KYC) verification from their mobile devices by scanning driver's licenses or passports, performing liveness checks, preventing photo spoofing, and cross-referencing with government databases. The system provides instant verification for valid documents while flagging suspicious submissions for manual review.

## Sprint Category

nice-to-have (Would be great but not essential)

## Feature IDs

- F-SEC-AUTH-004: Digital KYC and Document Scanning

## User Stories

### Remote Identity Verification

**As a new user**, I want to verify my identity by scanning my driver's license with my phone camera, so that I can complete registration without visiting a physical location.

**Acceptance Criteria**:
- User can access document scanning from mobile app or responsive web
- Camera interface provides real-time guidance for document positioning
- System captures clear image of driver's license or passport
- OCR extracts name, date of birth, license number, expiration date
- System validates extracted data format and checksums
- User receives immediate feedback on scan quality
- Successful scan advances to liveness check

### Liveness Detection

**As a platform**, I want to verify that the user is physically present during verification, so that I can prevent fraud using photos or videos of real people.

**Acceptance Criteria**:
- User prompted to perform liveness actions (blink, turn head, smile)
- System detects and validates each action in real-time
- System rejects printed photos, video replays, and masks
- Liveness check completes within 30 seconds
- Failed liveness check allows retry (maximum 3 attempts)
- Successful liveness check captures reference selfie

### Automated Verification

**As a user**, I want my identity to be verified automatically, so that I can start using the platform immediately without waiting for manual review.

**Acceptance Criteria**:
- System cross-references extracted data with government databases (where available)
- System compares selfie to ID photo using facial recognition
- System validates document security features (holograms, watermarks)
- System checks document expiration date
- Automated approval for documents passing all checks
- Instant notification of verification status
- Verified users can immediately make bookings

### Manual Review Fallback

**As a compliance officer**, I want flagged verifications to be queued for manual review, so that I can approve legitimate users while blocking fraudulent submissions.

**Acceptance Criteria**:
- System flags low-confidence verifications for manual review
- Review queue displays document images, extracted data, and confidence scores
- Reviewer can approve, reject, or request resubmission
- Reviewer can add notes explaining decision
- User notified of manual review status and timeline
- Approved users gain full platform access
- Rejected users can resubmit with guidance

## Frontend Specifications

### Pages and Routes

**Identity Verification Page** (`/verify-identity`):
- Introduction explaining verification process
- Document type selection (driver's license, passport, national ID)
- Camera permission request
- Document scanning interface
- Liveness check interface
- Verification status display

**Document Scanning Interface** (`/verify-identity/scan`):
- Live camera preview
- Document outline overlay for positioning guidance
- Real-time feedback (too dark, too blurry, glare detected)
- Capture button
- Retake option
- Tips for optimal scanning

**Liveness Check Interface** (`/verify-identity/liveness`):
- Live camera preview (selfie mode)
- Action prompts (blink, turn left, turn right, smile)
- Progress indicator
- Real-time action detection feedback
- Retry option on failure

**Verification Status Page** (`/verify-identity/status`):
- Verification progress indicator
- Status messages (processing, approved, manual review, rejected)
- Estimated review time for manual review
- Next steps based on status
- Support contact information

**Verification History** (`/settings/verification-history`):
- List of all verification attempts
- Status of each attempt
- Submission timestamps
- Reviewer notes (if applicable)
- Resubmission option for rejected attempts

### UI Components

**DocumentScanner Component**:
- Camera stream with device camera access
- Document outline overlay (ID card or passport shape)
- Real-time image quality analysis
- Capture button with loading state
- Flash toggle for low-light conditions
- Switch camera button (front/back)
- Cancel button to exit scanning

**LivenessCheck Component**:
- Selfie camera stream
- Action prompt display (large, clear text)
- Face detection overlay (oval guide)
- Action completion indicators (checkmarks)
- Progress bar showing completed actions
- Retry button on failure
- Skip button (if liveness is optional)

**DocumentPreview Component**:
- Captured document image display
- Zoom and pan controls
- Extracted data overlay
- Confidence score indicators
- Retake button
- Confirm and submit button

**VerificationStatusCard Component**:
- Status icon (pending, success, warning, error)
- Status text and description
- Progress indicator for processing
- Estimated completion time
- Action buttons (retry, contact support)
- Detailed status information expandable section

**ExtractedDataDisplay Component**:
- Field-by-field display of extracted data
- Confidence score per field (color-coded)
- Edit button for manual corrections
- Validation status indicators
- Comparison with user-entered data

### User Flows

**Document Verification Flow**:
1. User navigates to identity verification page
2. User selects document type (license, passport, national ID)
3. System requests camera permission
4. User grants camera access
5. Document scanning interface opens
6. User positions document within overlay guide
7. System provides real-time feedback on image quality
8. User captures document image
9. System performs OCR and extracts data
10. User reviews extracted data
11. User confirms or retakes if data is incorrect
12. System advances to liveness check

**Liveness Check Flow**:
1. Liveness check interface opens with selfie camera
2. System displays first action prompt (e.g., "Blink")
3. User performs action
4. System detects and validates action
5. System displays next action prompt
6. User completes all required actions (3-5 actions)
7. System captures reference selfie
8. System validates liveness check passed
9. User advances to verification processing

**Verification Processing Flow**:
1. System displays processing status
2. Backend performs OCR validation
3. Backend checks document expiration
4. Backend validates security features
5. Backend performs facial recognition match
6. Backend cross-references with government databases (if available)
7. System calculates confidence score
8. If high confidence: Automatic approval
9. If low confidence: Queue for manual review
10. User notified of verification status

**Manual Review Flow**:
1. User sees "Manual review required" status
2. System displays estimated review time (24-48 hours)
3. Compliance officer reviews submission in admin panel
4. Officer approves, rejects, or requests resubmission
5. User receives email notification of decision
6. If approved: User gains full platform access
7. If rejected: User can resubmit with guidance
8. If resubmission requested: User receives specific instructions

### Data Requirements

**From Backend APIs**:
- Document scanning endpoint (upload image, receive OCR results)
- Liveness check endpoint (upload selfie, receive validation)
- Verification status endpoint (get current verification state)
- Verification history endpoint (list all attempts)
- Resubmission endpoint (start new verification attempt)

**State Management**:
- Current verification step (document scan, liveness, processing, complete)
- Captured document image
- Extracted document data
- Liveness check status
- Verification status (pending, approved, manual review, rejected)
- Error messages and retry counts

**Camera Requirements**:
- Minimum resolution: 1280x720 (720p)
- Autofocus support
- Flash control
- Front and rear camera access

## Backend Specifications

### API Endpoints

**POST /api/kyc/scan-document**
- **Purpose**: Upload document image and perform OCR extraction
- **Authentication**: Required (Bearer token)
- **Rate Limiting**: 5 attempts per hour per user

**Request Body** (multipart/form-data):
```
documentType: "drivers_license" | "passport" | "national_id"
documentImage: File (JPEG/PNG, max 10MB)
documentSide: "front" | "back"
```

**Response (200 OK)**:
```json
{
  "scanId": "uuid-string",
  "extractedData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "licenseNumber": "D1234567",
    "expirationDate": "2028-05-15",
    "address": "123 Main St, City, State 12345",
    "documentNumber": "DL123456789"
  },
  "confidenceScores": {
    "firstName": 0.98,
    "lastName": 0.97,
    "dateOfBirth": 0.99,
    "licenseNumber": 0.95,
    "expirationDate": 0.98,
    "overall": 0.97
  },
  "imageQuality": {
    "sharpness": 0.92,
    "brightness": 0.88,
    "glare": 0.05,
    "overall": "good"
  },
  "requiresBackScan": true
}
```

**Error Responses**:
- 400: Invalid document type, poor image quality, file too large
- 429: Too many scan attempts
- 500: OCR service error

---

**POST /api/kyc/liveness-check**
- **Purpose**: Perform liveness detection and capture reference selfie
- **Authentication**: Required (Bearer token)
- **Rate Limiting**: 10 attempts per hour per user

**Request Body** (multipart/form-data):
```
scanId: "uuid-string"
selfieImage: File (JPEG/PNG, max 5MB)
livenessActions: JSON array of performed actions
```

**Response (200 OK)**:
```json
{
  "livenessCheckId": "uuid-string",
  "livenessPassed": true,
  "confidenceScore": 0.96,
  "actionsDetected": ["blink", "turn_left", "turn_right", "smile"],
  "spoofingDetected": false,
  "faceMatchScore": 0.94
}
```

**Error Responses**:
- 400: Invalid scan ID, poor image quality, liveness check failed
- 429: Too many liveness attempts

---

**POST /api/kyc/submit-verification**
- **Purpose**: Submit complete verification for processing
- **Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "scanId": "uuid-string",
  "livenessCheckId": "uuid-string",
  "userConfirmedData": {
    "firstName": "John",
    "lastName": "Doe",
    "dateOfBirth": "1990-05-15",
    "licenseNumber": "D1234567"
  }
}
```

**Response (200 OK)**:
```json
{
  "verificationId": "uuid-string",
  "status": "processing",
  "estimatedCompletionTime": "2026-02-23T11:00:00Z",
  "message": "Your verification is being processed"
}
```

---

**GET /api/kyc/verification-status**
- **Purpose**: Get current verification status
- **Authentication**: Required (Bearer token)

**Response (200 OK)** - Approved:
```json
{
  "verificationId": "uuid-string",
  "status": "approved",
  "approvedAt": "2026-02-23T10:45:00Z",
  "verificationLevel": "full",
  "expiresAt": "2027-02-23T10:45:00Z"
}
```

**Response (200 OK)** - Manual Review:
```json
{
  "verificationId": "uuid-string",
  "status": "manual_review",
  "submittedAt": "2026-02-23T10:30:00Z",
  "estimatedReviewTime": "24-48 hours",
  "queuePosition": 15
}
```

**Response (200 OK)** - Rejected:
```json
{
  "verificationId": "uuid-string",
  "status": "rejected",
  "rejectedAt": "2026-02-23T11:00:00Z",
  "rejectionReason": "Document expired",
  "canResubmit": true,
  "resubmissionGuidance": "Please submit a valid, non-expired driver's license"
}
```

---

**GET /api/kyc/verification-history**
- **Purpose**: Get list of all verification attempts
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "verifications": [
    {
      "verificationId": "uuid-string",
      "status": "approved",
      "submittedAt": "2026-02-23T10:30:00Z",
      "approvedAt": "2026-02-23T10:45:00Z",
      "documentType": "drivers_license"
    },
    {
      "verificationId": "uuid-string-2",
      "status": "rejected",
      "submittedAt": "2026-02-20T14:00:00Z",
      "rejectedAt": "2026-02-21T09:00:00Z",
      "documentType": "passport",
      "rejectionReason": "Poor image quality"
    }
  ]
}
```

---

**POST /api/kyc/resubmit**
- **Purpose**: Start new verification attempt after rejection
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "message": "New verification attempt started",
  "previousRejectionReason": "Document expired",
  "guidance": "Please ensure your document is valid and not expired"
}
```

### Business Logic

**OCR Processing**:
- Use AWS Textract, Google Cloud Vision, or Azure Computer Vision
- Extract text from document image
- Parse structured data (name, DOB, license number, expiration)
- Validate data format (date formats, license number patterns)
- Calculate confidence scores per field
- Detect document type automatically if not specified

**Document Validation**:
- Check expiration date is in future
- Validate license number format matches issuing state/country
- Verify age meets minimum requirements (18+ or 21+ depending on vehicle)
- Check document security features (holograms, UV patterns)
- Validate MRZ (Machine Readable Zone) checksums for passports

**Liveness Detection**:
- Detect face in selfie image
- Verify actions performed (blink, head turn, smile)
- Check for photo spoofing (texture analysis, depth detection)
- Detect video replay attacks (temporal consistency)
- Validate face is real human (not mask or 3D model)

**Facial Recognition Matching**:
- Extract facial features from ID photo
- Extract facial features from selfie
- Calculate similarity score (0-1 scale)
- Threshold for automatic approval: 0.85+
- Threshold for manual review: 0.70-0.84
- Automatic rejection: <0.70

**Government Database Verification** (where available):
- Query DMV database with license number
- Verify name and DOB match
- Check for license suspension or revocation
- Validate license class and endorsements
- Log verification attempt for audit trail

**Automated Decision Logic**:
- High confidence (0.90+) + liveness passed + face match (0.85+) = Auto-approve
- Medium confidence (0.70-0.89) or face match (0.70-0.84) = Manual review
- Low confidence (<0.70) or liveness failed or face match (<0.70) = Auto-reject with retry option
- Expired document = Auto-reject with resubmission guidance
- Suspicious patterns (multiple attempts, different documents) = Flag for fraud review

### Authentication Requirements

**All Endpoints Require Authentication**:
- User must be logged in with valid session token
- User can only access their own verification data
- Rate limiting per user to prevent abuse

**Admin Endpoints** (for manual review):
- POST /api/admin/kyc/review/:verificationId
- GET /api/admin/kyc/review-queue
- Require admin role authorization

## Database Specifications

### Schema Changes

**KYCVerifications Table** (new table):
```sql
CREATE TABLE KYCVerifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  verification_id VARCHAR(36) NOT NULL UNIQUE,
  user_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'processing', 'approved', 'rejected', 'manual_review') NOT NULL,
  document_type ENUM('drivers_license', 'passport', 'national_id') NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME NULL,
  approved_at DATETIME NULL,
  rejected_at DATETIME NULL,
  rejection_reason VARCHAR(500) NULL,
  reviewer_id VARCHAR(36) NULL,
  reviewer_notes TEXT NULL,
  verification_level ENUM('basic', 'full') DEFAULT 'full',
  expires_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES Users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_submitted_at (submitted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**DocumentScans Table** (new table):
```sql
CREATE TABLE DocumentScans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  scan_id VARCHAR(36) NOT NULL UNIQUE,
  verification_id VARCHAR(36) NOT NULL,
  document_side ENUM('front', 'back') NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  extracted_data JSON NOT NULL,
  confidence_scores JSON NOT NULL,
  image_quality_metrics JSON NOT NULL,
  ocr_provider VARCHAR(50) NOT NULL,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES KYCVerifications(verification_id) ON DELETE CASCADE,
  INDEX idx_verification_id (verification_id),
  INDEX idx_scanned_at (scanned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**LivenessChecks Table** (new table):
```sql
CREATE TABLE LivenessChecks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  liveness_check_id VARCHAR(36) NOT NULL UNIQUE,
  verification_id VARCHAR(36) NOT NULL,
  selfie_image_url VARCHAR(500) NOT NULL,
  liveness_passed BOOLEAN NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL,
  actions_detected JSON NOT NULL,
  spoofing_detected BOOLEAN NOT NULL,
  face_match_score DECIMAL(5,4) NULL,
  liveness_provider VARCHAR(50) NOT NULL,
  checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (verification_id) REFERENCES KYCVerifications(verification_id) ON DELETE CASCADE,
  INDEX idx_verification_id (verification_id),
  INDEX idx_checked_at (checked_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**GovernmentVerifications Table** (new table):
```sql
CREATE TABLE GovernmentVerifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  verification_id VARCHAR(36) NOT NULL,
  verification_type ENUM('dmv', 'passport_office', 'national_registry') NOT NULL,
  query_sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  response_received_at DATETIME NULL,
  verification_result ENUM('verified', 'not_found', 'mismatch', 'error') NOT NULL,
  response_data JSON NULL,
  FOREIGN KEY (verification_id) REFERENCES KYCVerifications(verification_id) ON DELETE CASCADE,
  INDEX idx_verification_id (verification_id),
  INDEX idx_verification_type (verification_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**Users ↔ KYCVerifications**: One-to-Many
- One user can have multiple verification attempts
- Foreign key: KYCVerifications.user_id → Users.id
- Cascade delete: When user is deleted, all verifications are deleted

**KYCVerifications ↔ DocumentScans**: One-to-Many
- One verification can have multiple document scans (front and back)
- Foreign key: DocumentScans.verification_id → KYCVerifications.verification_id
- Cascade delete: When verification is deleted, all scans are deleted

**KYCVerifications ↔ LivenessChecks**: One-to-Many
- One verification can have multiple liveness check attempts
- Foreign key: LivenessChecks.verification_id → KYCVerifications.verification_id
- Cascade delete: When verification is deleted, all liveness checks are deleted

**KYCVerifications ↔ GovernmentVerifications**: One-to-Many
- One verification can have multiple government database queries
- Foreign key: GovernmentVerifications.verification_id → KYCVerifications.verification_id
- Cascade delete: When verification is deleted, all government verifications are deleted

### Indexes

**Performance Optimization**:
- `idx_user_id`: Fast lookup of user's verification history
- `idx_status`: Efficient filtering of verifications by status (for admin review queue)
- `idx_submitted_at`: Time-based queries and analytics
- `idx_verification_id`: Fast joins between related tables

**Cleanup Jobs**:
- Daily job to delete rejected verifications older than 90 days
- Monthly job to archive approved verifications older than 2 years
- Weekly job to delete orphaned document images (no associated verification)

## Technology Stack

- **Backend**: .NET 8+ with ASP.NET Core, Entity Framework Core
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React Camera libraries
- **OCR Services**: AWS Textract, Google Cloud Vision API, or Azure Computer Vision
- **Liveness Detection**: FaceTec, iProov, or custom ML model
- **Facial Recognition**: AWS Rekognition, Azure Face API, or custom model
- **Image Storage**: AWS S3 or Azure Blob Storage with encryption
- **Government APIs**: State DMV APIs, passport verification services (where available)

## Implementation Notes

### Security Considerations

1. **Data Encryption**: Encrypt all document images and extracted data at rest and in transit
2. **Access Control**: Strict role-based access to verification data
3. **Audit Logging**: Log all access to sensitive verification data
4. **Data Retention**: Delete document images after verification (retain only extracted data)
5. **PII Protection**: Mask sensitive data in logs and error messages
6. **Secure Transmission**: Use HTTPS for all API calls, secure upload to cloud storage

### Privacy and Compliance

**GDPR Compliance**:
- Explicit consent for document scanning and facial recognition
- Right to deletion of verification data
- Data minimization (collect only necessary information)
- Purpose limitation (use data only for identity verification)
- Clear privacy policy explaining KYC process

**Biometric Privacy Laws**:
- Comply with BIPA (Illinois), CCPA (California), and other biometric privacy laws
- Obtain informed consent before collecting biometric data
- Provide retention and deletion schedules
- Allow users to opt out (with manual verification alternative)

**Data Retention**:
- Document images: Delete after 30 days (or immediately after verification)
- Extracted data: Retain for compliance period (typically 5-7 years)
- Liveness check images: Delete after 30 days
- Verification logs: Retain for audit purposes (7 years)

### Testing Requirements

**Unit Tests**:
- OCR data extraction and parsing
- Confidence score calculation
- Document validation logic
- Liveness detection validation
- Facial recognition matching
- Automated decision logic

**Integration Tests**:
- Complete verification flow (scan → liveness → approval)
- OCR service integration
- Liveness detection service integration
- Facial recognition service integration
- Government database integration (with mocks)
- Manual review workflow

**User Acceptance Testing**:
- Test with various document types and conditions
- Test with different lighting conditions
- Test with users of diverse demographics
- Test liveness detection with various actions
- Test manual review workflow
- Test rejection and resubmission flow

### Performance Considerations

- Optimize image upload with compression (maintain quality for OCR)
- Use asynchronous processing for OCR and facial recognition
- Cache government database responses (with appropriate TTL)
- Implement retry logic for external service failures
- Use CDN for serving verification UI assets
- Optimize database queries with proper indexing

### User Experience Considerations

- Provide clear instructions for document positioning
- Show real-time feedback during scanning
- Explain liveness check actions clearly
- Display progress indicators during processing
- Provide helpful error messages with retry guidance
- Offer customer support for verification issues
- Allow manual verification as fallback option

## Dependencies

- OCR service provider (AWS Textract, Google Cloud Vision, Azure Computer Vision)
- Liveness detection service (FaceTec, iProov, or custom)
- Facial recognition service (AWS Rekognition, Azure Face API, or custom)
- Image storage service (AWS S3, Azure Blob Storage)
- Government database APIs (optional, where available)
- Camera access permissions (mobile and web)

## Related Features

- F-SEC-AUTH-001: Email/Password Authentication (primary authentication method)
- F-SEC-AUTH-003: Biometric Authentication (advanced verification alternative)
- F-AM-008: Identity Verification (manual verification alternative)
- F-AM-009: Driver License Verification (related verification feature)
- F-FUNC-UM-005: User Verification Status (functional requirement)
- F-SEC-DATA-006: Data Protection (privacy and security requirements)

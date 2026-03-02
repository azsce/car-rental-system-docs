# Feature: User Profile Management

## Overview

User Profile Management provides a comprehensive system for users to manage their personal information, preferences, and account settings. This feature enables users to create rich profiles with personal details, profile photos, addresses, emergency contacts, language/currency preferences, and communication settings. The system includes profile editing capabilities, verification status tracking, and GDPR-compliant data export functionality.

This feature synthesizes proven profile management patterns with modern personalization capabilities to create a user-centric account experience that reduces booking friction through pre-filled information and enables tailored experiences based on user preferences.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-005: Comprehensive User Profile
- F-AM-006: Persona-Based Profile Customization (Nice-to-have component)
- F-USER-IND-002: Customer Profile - User Profile Management
- F-USER-IND-003: Customer Profile - Persona-Based Customization
- REQ-UM-005: User Profile Management (Functional Requirement)

## User Stories

### Core Profile Management

**As a registered user**, I want to manage my personal information and preferences, so that I can personalize my experience and ensure my details are accurate for bookings.

**As a frequent renter**, I want to save my preferences and frequently used information, so that I can book vehicles faster without re-entering the same details.

**As a privacy-conscious user**, I want to control what profile information is visible to suppliers and other users, so that I can protect my personal data while using the platform.


### Persona-Based Customization

**As a business traveler (Power Renter)**, I want my profile to highlight corporate features and expense management, so that I can efficiently manage business rentals.

**As a luxury seeker (Experience Seeker)**, I want my profile to emphasize premium services and concierge options, so that I receive a white-glove experience.

**As a young driver (Gen Z)**, I want my profile to support social features and split payments, so that I can easily share rentals with friends.

**As an eco-conscious user**, I want my profile to track my carbon footprint and prioritize electric vehicles, so that I can make sustainable transportation choices.

**As a user with accessibility needs**, I want my profile to save my specific requirements, so that I only see compatible vehicles and receive guaranteed allocation.

## Frontend Specifications

### Pages

#### Profile Overview Page (`/account/profile`)
- Display complete user profile with all personal information
- Show profile completeness indicator (percentage)
- Display verification status badges (email, phone, driver's license)
- Quick edit buttons for each profile section
- Profile photo upload/change functionality
- Navigation to specialized profile sections

#### Edit Profile Page (`/account/profile/edit`)
- Form with all editable profile fields
- Real-time validation for email, phone, date formats
- Address autocomplete using mapping service API
- Profile photo upload with preview and cropping
- Save/Cancel actions with unsaved changes warning
- Success/error notifications


#### Preferences Page (`/account/preferences`)
- Language selection dropdown
- Currency selection dropdown
- Communication preferences (email, SMS, push notifications)
- Notification type controls (booking confirmations, promotions, alerts)
- Quiet hours configuration
- Saved locations management
- Default booking preferences (vehicle types, insurance, extras)
- Accessibility requirements settings

#### Privacy & Data Page (`/account/privacy`)
- Profile visibility controls
- Data sharing preferences
- Marketing opt-in/opt-out
- Cookie preferences
- Data export request button
- Account deletion request button
- Privacy policy link

#### Persona Profile Page (`/account/persona`) - Nice-to-have
- Display assigned persona segment
- Show persona-specific features and benefits
- Customize persona preferences
- View persona-based recommendations
- Switch between persona modes (if applicable)

### UI Components

#### ProfileCard Component
- Displays user avatar, name, and verification badges
- Shows profile completeness percentage with progress bar
- Quick action buttons (Edit Profile, View Settings)
- Responsive design for mobile and desktop
- Skeleton loading state


#### ProfilePhotoUpload Component
- Drag-and-drop or click to upload
- Image preview before upload
- Crop/resize functionality
- File type validation (JPEG, PNG)
- File size validation (max 5MB)
- Loading state during upload
- Error handling for failed uploads

#### VerificationBadge Component
- Visual indicator for verification status (verified, pending, unverified)
- Tooltip explaining verification type
- Click to view verification details or initiate verification
- Color-coded status (green for verified, yellow for pending, gray for unverified)

#### ProfileCompletenessIndicator Component
- Circular or linear progress bar showing completion percentage
- List of missing profile fields
- Call-to-action to complete profile
- Rewards/benefits for complete profiles

#### AddressAutocomplete Component
- Integration with Google Maps Places API or similar
- Real-time address suggestions as user types
- Display formatted address with street, city, state, postal code
- Geolocation support for current location
- Manual address entry fallback


#### PreferencesForm Component
- Grouped preference controls (language, currency, notifications)
- Toggle switches for boolean preferences
- Dropdown selects for single-choice options
- Multi-select for notification types
- Time picker for quiet hours
- Save/Reset buttons
- Real-time preview of preference changes

#### PersonaCard Component - Nice-to-have
- Display persona type with icon and description
- List persona-specific features and benefits
- Show persona-based statistics (bookings, savings, impact)
- Customize persona settings
- Visual design matching persona theme

### User Flows

#### Profile Creation/Update Flow
1. User navigates to Profile Edit page
2. System displays current profile information in editable form
3. User updates desired fields (name, email, phone, address, etc.)
4. System validates input in real-time (email format, phone format, required fields)
5. User uploads or changes profile photo (optional)
6. System validates photo (file type, size, dimensions)
7. User clicks Save button
8. System validates all fields
9. If email changed: System sends verification email to new address
10. If phone changed: System sends SMS verification code to new number
11. System updates profile in database
12. System displays success message
13. System updates profile completeness indicator
14. User is redirected to Profile Overview page


#### Email/Phone Verification Flow
1. User changes email or phone number in profile
2. System sends verification code (email link or SMS OTP)
3. User receives verification code
4. User enters code or clicks email link
5. System validates code/token
6. If valid: System updates email/phone and marks as verified
7. If invalid: System displays error and allows retry
8. System updates verification badge on profile

#### Data Export Flow (GDPR Compliance)
1. User navigates to Privacy & Data page
2. User clicks "Export My Data" button
3. System displays confirmation dialog explaining export process
4. User confirms export request
5. System queues data export job
6. System displays message: "Your data export will be ready within 30 days"
7. System sends email notification when export is ready
8. User downloads export file (JSON or CSV format)

#### Persona Assignment Flow - Nice-to-have
1. System analyzes user profile and booking history
2. System calculates persona scores for each segment
3. System assigns primary persona based on highest score
4. System customizes interface based on persona
5. User can view assigned persona on Persona Profile page
6. User can manually adjust persona preferences
7. System dynamically updates persona as behavior changes


### Data Requirements

#### Profile Data from Backend
- User ID (unique identifier)
- Full name (first name, last name)
- Email address (with verification status)
- Phone number (with verification status)
- Date of birth
- Profile photo URL
- Bio/description (optional)
- Home address (street, city, state, postal code, country)
- Emergency contact (name, phone, relationship)
- Language preference (ISO code)
- Currency preference (ISO code)
- Profile completeness percentage
- Verification badges (email, phone, license, KYC)
- Account creation date
- Last profile update timestamp

#### Preferences Data from Backend
- Communication preferences (email, SMS, push enabled/disabled)
- Notification type preferences (confirmations, promotions, alerts, etc.)
- Quiet hours (start time, end time)
- Saved locations (home, work, frequent locations with nicknames)
- Default vehicle type preferences
- Default insurance tier
- Default extras (GPS, child seat, etc.)
- Accessibility requirements
- Privacy settings (profile visibility, data sharing)

#### Persona Data from Backend - Nice-to-have
- Assigned persona segment (Power Renter, Experience Seeker, Young Driver, Eco-Conscious, Accessible Mobility)
- Persona score/confidence level
- Persona-specific preferences
- Persona-based feature flags
- Persona assignment history


#### Mapping Service Integration
- Address autocomplete API (Google Maps Places API or equivalent)
- Geocoding for address validation
- Reverse geocoding for location-based features

#### File Upload Service
- Profile photo upload endpoint
- Image optimization and resizing
- CDN URL for photo delivery

## Backend Specifications

### API Endpoints

#### GET /api/users/{userId}/profile
**Purpose**: Retrieve complete user profile information

**Authentication**: Required (JWT token)

**Authorization**: User can only access their own profile, or Admin can access any profile

**Request Parameters**:
- `userId` (path parameter): User ID

**Response Schema** (200 OK):
```json
{
  "userId": "string (UUID)",
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "emailVerified": "boolean",
  "phone": "string",
  "phoneVerified": "boolean",
  "dateOfBirth": "string (ISO date)",
  "profilePhotoUrl": "string (URL)",
  "bio": "string (optional)",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "emergencyContact": {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  },
  "languagePreference": "string (ISO code)",
  "currencyPreference": "string (ISO code)",
  "profileCompleteness": "number (0-100)",
  "verificationStatus": {
    "email": "boolean",
    "phone": "boolean",
    "driverLicense": "boolean",
    "kyc": "string (none|basic|standard|enhanced)"
  },
  "createdAt": "string (ISO timestamp)",
  "updatedAt": "string (ISO timestamp)"
}
```


**Error Responses**:
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User attempting to access another user's profile
- 404 Not Found: User profile not found

#### PUT /api/users/{userId}/profile
**Purpose**: Update user profile information

**Authentication**: Required (JWT token)

**Authorization**: User can only update their own profile

**Request Parameters**:
- `userId` (path parameter): User ID

**Request Body**:
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "email": "string (optional, triggers verification)",
  "phone": "string (optional, triggers verification)",
  "dateOfBirth": "string (ISO date, optional)",
  "bio": "string (optional)",
  "address": {
    "street": "string",
    "city": "string",
    "state": "string",
    "postalCode": "string",
    "country": "string"
  },
  "emergencyContact": {
    "name": "string",
    "phone": "string",
    "relationship": "string"
  },
  "languagePreference": "string (ISO code, optional)",
  "currencyPreference": "string (ISO code, optional)"
}
```

**Response Schema** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "profile": { /* Updated profile object */ },
  "verificationRequired": {
    "email": "boolean",
    "phone": "boolean"
  }
}
```


**Error Responses**:
- 400 Bad Request: Invalid data format or validation errors
- 401 Unauthorized: Invalid or missing authentication token
- 403 Forbidden: User attempting to update another user's profile
- 409 Conflict: Email or phone already in use by another account

#### POST /api/users/{userId}/profile/photo
**Purpose**: Upload or update profile photo

**Authentication**: Required (JWT token)

**Authorization**: User can only update their own photo

**Request Parameters**:
- `userId` (path parameter): User ID

**Request Body** (multipart/form-data):
- `photo`: File (JPEG or PNG, max 5MB)

**Response Schema** (200 OK):
```json
{
  "success": true,
  "photoUrl": "string (CDN URL)",
  "message": "Profile photo updated successfully"
}
```

**Error Responses**:
- 400 Bad Request: Invalid file type or size exceeds limit
- 401 Unauthorized: Invalid or missing authentication token
- 413 Payload Too Large: File size exceeds 5MB limit

#### GET /api/users/{userId}/preferences
**Purpose**: Retrieve user preferences and settings

**Authentication**: Required (JWT token)

**Authorization**: User can only access their own preferences

**Response Schema** (200 OK):
```json
{
  "communicationPreferences": {
    "email": "boolean",
    "sms": "boolean",
    "push": "boolean"
  },
  "notificationTypes": {
    "bookingConfirmations": "boolean",
    "paymentReceipts": "boolean",
    "tripReminders": "boolean",
    "promotionalOffers": "boolean",
    "platformUpdates": "boolean",
    "priceAlerts": "boolean",
    "availabilityAlerts": "boolean"
  },
  "quietHours": {
    "enabled": "boolean",
    "startTime": "string (HH:mm)",
    "endTime": "string (HH:mm)"
  },
  "savedLocations": [
    {
      "id": "string (UUID)",
      "nickname": "string",
      "address": "string",
      "latitude": "number",
      "longitude": "number",
      "type": "string (home|work|other)"
    }
  ],
  "defaultBookingPreferences": {
    "vehicleTypes": ["string"],
    "insuranceTier": "string",
    "extras": ["string"]
  },
  "accessibilityRequirements": ["string"],
  "privacySettings": {
    "profileVisibility": "string (public|private|friends)",
    "dataSharing": "boolean",
    "marketingOptIn": "boolean"
  }
}
```


#### PUT /api/users/{userId}/preferences
**Purpose**: Update user preferences and settings

**Authentication**: Required (JWT token)

**Authorization**: User can only update their own preferences

**Request Body**: Same structure as GET response

**Response Schema** (200 OK):
```json
{
  "success": true,
  "message": "Preferences updated successfully",
  "preferences": { /* Updated preferences object */ }
}
```

#### POST /api/users/{userId}/data-export
**Purpose**: Request GDPR-compliant data export

**Authentication**: Required (JWT token)

**Authorization**: User can only request their own data

**Response Schema** (202 Accepted):
```json
{
  "success": true,
  "message": "Data export request received. You will receive an email when your export is ready (within 30 days).",
  "requestId": "string (UUID)",
  "estimatedCompletionDate": "string (ISO date)"
}
```

#### GET /api/users/{userId}/persona - Nice-to-have
**Purpose**: Retrieve user persona classification and settings

**Authentication**: Required (JWT token)

**Response Schema** (200 OK):
```json
{
  "assignedPersona": "string (power-renter|experience-seeker|young-driver|eco-conscious|accessible-mobility)",
  "personaScore": "number (0-100)",
  "personaFeatures": ["string"],
  "personaPreferences": {
    "customSetting1": "value",
    "customSetting2": "value"
  },
  "assignedAt": "string (ISO timestamp)",
  "lastUpdated": "string (ISO timestamp)"
}
```


### Business Logic

#### Profile Completeness Calculation
- Calculate percentage based on filled vs. total fields
- Required fields: firstName, lastName, email, phone, dateOfBirth, address
- Optional fields: profilePhoto, bio, emergencyContact, preferences
- Weight critical fields higher (e.g., verified email/phone worth more)
- Update completeness score whenever profile is modified

#### Email/Phone Verification Process
- When email changes: Generate verification token, send email with link
- When phone changes: Generate 6-digit OTP, send via SMS
- Verification tokens expire after 24 hours
- OTP codes expire after 10 minutes
- Mark email/phone as unverified until confirmation
- Allow maximum 3 verification attempts per hour

#### Profile Photo Processing
- Validate file type (JPEG, PNG only)
- Validate file size (max 5MB)
- Resize image to standard dimensions (e.g., 400x400px)
- Generate thumbnail (e.g., 100x100px)
- Optimize image quality for web delivery
- Upload to CDN or cloud storage
- Store CDN URL in database
- Delete old photo from storage when new photo uploaded

#### Data Export Generation (GDPR)
- Queue background job for data export
- Collect all user data: profile, bookings, payments, communications
- Generate machine-readable file (JSON or CSV)
- Include metadata: export date, data categories
- Store export file securely with expiration (30 days)
- Send email notification with download link
- Log export request for compliance audit


#### Persona Classification Algorithm - Nice-to-have
- Analyze user attributes: booking frequency, vehicle preferences, corporate affiliation
- Calculate persona scores for each segment:
  - Power Renter: High booking frequency, business vehicles, expense reports
  - Experience Seeker: Luxury vehicles, premium services, high spending
  - Young Driver: Age 18-25, split payments, social features usage
  - Eco-Conscious: EV bookings, carbon tracking, sustainability features
  - Accessible Mobility: Accessibility requirements, specific vehicle needs
- Assign primary persona based on highest score (threshold: 70%)
- Update persona dynamically as behavior changes
- Allow manual persona preference overrides
- Store persona assignment history for analysis

### Authentication Requirements

- All profile endpoints require valid JWT authentication token
- Token must contain userId claim matching the requested profile
- Admin users can access any profile (role-based authorization)
- Session must be active and not expired
- Rate limiting: 100 requests per minute per user for profile endpoints
- Rate limiting: 10 requests per hour for data export requests

## Database Specifications

### Schema Changes

#### Users Table (Existing - Add Columns)
```sql
ALTER TABLE Users ADD COLUMN profile_photo_url VARCHAR(500);
ALTER TABLE Users ADD COLUMN bio TEXT;
ALTER TABLE Users ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en';
ALTER TABLE Users ADD COLUMN currency_preference VARCHAR(3) DEFAULT 'USD';
ALTER TABLE Users ADD COLUMN profile_completeness INT DEFAULT 0;
ALTER TABLE Users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE Users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
```


#### UserAddresses Table (New)
```sql
CREATE TABLE UserAddresses (
  address_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  address_type ENUM('home', 'work', 'billing', 'other') NOT NULL,
  street VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_addresses (user_id),
  INDEX idx_address_type (address_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### EmergencyContacts Table (New)
```sql
CREATE TABLE EmergencyContacts (
  contact_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  contact_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(20) NOT NULL,
  relationship VARCHAR(100),
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_emergency_contacts (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### UserPreferences Table (New)
```sql
CREATE TABLE UserPreferences (
  preference_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  notification_types JSON,
  quiet_hours_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  default_vehicle_types JSON,
  default_insurance_tier VARCHAR(50),
  default_extras JSON,
  accessibility_requirements JSON,
  profile_visibility ENUM('public', 'private', 'friends') DEFAULT 'public',
  data_sharing_enabled BOOLEAN DEFAULT FALSE,
  marketing_opt_in BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_preferences (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### SavedLocations Table (New)
```sql
CREATE TABLE SavedLocations (
  location_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  nickname VARCHAR(100) NOT NULL,
  address VARCHAR(500) NOT NULL,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  location_type ENUM('home', 'work', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_saved_locations (user_id),
  INDEX idx_location_type (location_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


#### UserPersonas Table (New - Nice-to-have)
```sql
CREATE TABLE UserPersonas (
  persona_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  assigned_persona ENUM('power-renter', 'experience-seeker', 'young-driver', 'eco-conscious', 'accessible-mobility') NOT NULL,
  persona_score INT NOT NULL,
  persona_preferences JSON,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_personas (user_id),
  INDEX idx_assigned_persona (assigned_persona)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### DataExportRequests Table (New)
```sql
CREATE TABLE DataExportRequests (
  request_id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  request_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  export_file_url VARCHAR(500),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  expires_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_export_requests (user_id),
  INDEX idx_request_status (request_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

- Users (1) → UserAddresses (Many): One user can have multiple addresses
- Users (1) → EmergencyContacts (Many): One user can have multiple emergency contacts
- Users (1) → UserPreferences (1): One user has one preferences record
- Users (1) → SavedLocations (Many): One user can save multiple locations
- Users (1) → UserPersonas (1): One user has one persona assignment (Nice-to-have)
- Users (1) → DataExportRequests (Many): One user can make multiple export requests


### Indexes

**Performance Optimization Indexes**:
- `idx_user_addresses (user_id)`: Fast lookup of user addresses
- `idx_address_type (address_type)`: Filter addresses by type
- `idx_user_emergency_contacts (user_id)`: Fast lookup of emergency contacts
- `idx_user_preferences (user_id)`: Fast lookup of user preferences
- `idx_user_saved_locations (user_id)`: Fast lookup of saved locations
- `idx_location_type (location_type)`: Filter locations by type
- `idx_user_personas (user_id)`: Fast lookup of user persona (Nice-to-have)
- `idx_assigned_persona (assigned_persona)`: Analytics on persona distribution
- `idx_user_export_requests (user_id)`: Fast lookup of export requests
- `idx_request_status (request_status)`: Monitor pending export requests

**Composite Indexes** (if needed for specific queries):
- `idx_user_address_type (user_id, address_type)`: Find specific address type for user
- `idx_user_location_type (user_id, location_type)`: Find specific location type for user

## Technology Stack

- **Backend**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **Authentication**: JWT tokens with .NET Identity
- **File Storage**: AWS S3, Azure Blob Storage, or similar CDN for profile photos
- **Mapping Service**: Google Maps Places API or equivalent for address autocomplete
- **Email Service**: SendGrid, AWS SES, or similar for verification emails
- **SMS Service**: Twilio, AWS SNS, or similar for phone verification


## Implementation Notes

### Profile Completeness Strategy
- Implement progressive profiling to reduce registration friction
- Collect minimum information at signup (email, password, name)
- Prompt for additional details at strategic moments (before first booking, after first booking)
- Incentivize profile completion with benefits (faster checkout, personalized recommendations)
- Display profile completeness indicator prominently to encourage completion

### Email/Phone Verification Best Practices
- Send verification immediately upon email/phone change
- Use secure, time-limited tokens (24 hours for email, 10 minutes for SMS)
- Implement rate limiting to prevent abuse (3 attempts per hour)
- Provide clear instructions in verification messages
- Allow users to resend verification if not received
- Mark email/phone as unverified until confirmation to prevent unauthorized changes

### Profile Photo Handling
- Validate file type and size on both client and server
- Resize and optimize images server-side to reduce storage and bandwidth
- Generate multiple sizes (original, standard, thumbnail) for different use cases
- Use CDN for fast photo delivery globally
- Implement lazy loading for profile photos in lists
- Provide default avatar if no photo uploaded

### GDPR Compliance Considerations
- Implement data export within 30 days as required by GDPR
- Include all personal data in export (profile, bookings, payments, communications)
- Provide machine-readable format (JSON or CSV)
- Log all data export requests for compliance audit
- Secure export files with expiration (30 days)
- Implement account deletion with grace period (30 days)
- Retain only legally required data after deletion


### Persona-Based Customization Strategy - Nice-to-have
- Analyze user behavior patterns to assign personas automatically
- Use machine learning for persona classification as data grows
- Allow manual persona preference overrides to respect user choice
- Update persona dynamically as behavior changes (monthly recalculation)
- A/B test persona-based features to validate effectiveness
- Provide clear value proposition for each persona segment
- Avoid stereotyping - use personas as guidance, not rigid categories

### Security Considerations
- Hash and salt passwords using bcrypt or Argon2
- Encrypt sensitive data at rest (emergency contact info, addresses)
- Use HTTPS for all profile-related communications
- Implement CSRF protection for profile update forms
- Validate all input server-side to prevent injection attacks
- Rate limit profile update requests to prevent abuse
- Log all profile changes for security audit trail
- Implement session timeout for inactive users

### Performance Optimization
- Cache user profile data in Redis for fast retrieval
- Invalidate cache on profile updates
- Use database indexes for fast lookups
- Implement pagination for saved locations if list grows large
- Lazy load profile photo in lists, eager load on profile page
- Optimize database queries with proper joins and indexes
- Use CDN for profile photo delivery to reduce latency

### Mobile Considerations
- Design mobile-first responsive UI for profile pages
- Optimize profile photo upload for mobile networks (compress before upload)
- Provide native camera integration for profile photo capture
- Use mobile-optimized address autocomplete
- Implement offline support for viewing profile (cached data)
- Optimize form inputs for mobile keyboards (email, phone, number types)
- Use native date pickers for date of birth selection


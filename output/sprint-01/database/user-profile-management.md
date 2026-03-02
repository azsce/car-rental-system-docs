# Feature: User Profile Management (Database)

## Overview

The User Profile Management database schema provides comprehensive data storage for user profiles, preferences, addresses, emergency contacts, saved locations, persona assignments, and data export requests. The schema is designed for MySQL 8.0+ with InnoDB storage engine, supporting ACID transactions, foreign key constraints, and efficient indexing for fast queries.

The database design follows normalization principles to reduce data redundancy while maintaining query performance through strategic indexing. JSON columns are used for flexible storage of preferences and settings that may evolve over time.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-005: Comprehensive User Profile
- F-AM-006: Persona-Based Profile Customization (Nice-to-have component)
- REQ-UM-005: User Profile Management (Functional Requirement)

## Database Schema

### Users Table (Extended)

**Purpose**: Store core user profile information

**Schema Modifications**:
```sql
ALTER TABLE Users ADD COLUMN profile_photo_url VARCHAR(500) AFTER phone;
ALTER TABLE Users ADD COLUMN bio TEXT AFTER profile_photo_url;
ALTER TABLE Users ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en' AFTER bio;
ALTER TABLE Users ADD COLUMN currency_preference VARCHAR(3) DEFAULT 'USD' AFTER language_preference;
ALTER TABLE Users ADD COLUMN profile_completeness INT DEFAULT 0 AFTER currency_preference;
ALTER TABLE Users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email;
ALTER TABLE Users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE AFTER phone;
```


**Column Descriptions**:
- `profile_photo_url`: CDN URL for user's profile photo (max 500 characters)
- `bio`: Optional user biography or description (TEXT type for longer content)
- `language_preference`: ISO language code (e.g., 'en', 'es', 'fr') for interface language
- `currency_preference`: ISO currency code (e.g., 'USD', 'EUR', 'GBP') for price display
- `profile_completeness`: Calculated percentage (0-100) of profile completion
- `email_verified`: Boolean flag indicating email verification status
- `phone_verified`: Boolean flag indicating phone verification status

**Constraints**:
- `profile_completeness` must be between 0 and 100
- `language_preference` should match ISO 639-1 codes
- `currency_preference` should match ISO 4217 codes

### UserAddresses Table

**Purpose**: Store user addresses (home, work, billing, other)

**Schema**:
```sql
CREATE TABLE UserAddresses (
  address_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for address',
  user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to Users table',
  address_type ENUM('home', 'work', 'billing', 'other') NOT NULL COMMENT 'Type of address',
  street VARCHAR(255) NOT NULL COMMENT 'Street address',
  city VARCHAR(100) NOT NULL COMMENT 'City name',
  state VARCHAR(100) COMMENT 'State or province',
  postal_code VARCHAR(20) COMMENT 'Postal or ZIP code',
  country VARCHAR(100) NOT NULL COMMENT 'Country name',
  latitude DECIMAL(10, 8) COMMENT 'Latitude for geocoding',
  longitude DECIMAL(11, 8) COMMENT 'Longitude for geocoding',
  is_primary BOOLEAN DEFAULT FALSE COMMENT 'Primary address flag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_addresses (user_id),
  INDEX idx_address_type (address_type),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User addresses for home, work, billing, and other locations';
```


**Column Descriptions**:
- `address_id`: UUID primary key for unique address identification
- `user_id`: Foreign key reference to Users table
- `address_type`: Enum for address classification (home, work, billing, other)
- `street`: Full street address including number and street name
- `city`: City or municipality name
- `state`: State, province, or region (optional for some countries)
- `postal_code`: Postal code or ZIP code (optional for some countries)
- `country`: Country name (required)
- `latitude`: Decimal latitude for geocoding and mapping (8 decimal places precision)
- `longitude`: Decimal longitude for geocoding and mapping (8 decimal places precision)
- `is_primary`: Boolean flag to mark primary address for user
- `created_at`: Timestamp when address was added
- `updated_at`: Timestamp when address was last modified

**Constraints**:
- Only one primary address per user (enforced in application logic)
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Cascade delete when user is deleted

### EmergencyContacts Table

**Purpose**: Store emergency contact information for users

**Schema**:
```sql
CREATE TABLE EmergencyContacts (
  contact_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for emergency contact',
  user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to Users table',
  contact_name VARCHAR(255) NOT NULL COMMENT 'Emergency contact full name',
  contact_phone VARCHAR(20) NOT NULL COMMENT 'Emergency contact phone number',
  relationship VARCHAR(100) COMMENT 'Relationship to user (e.g., spouse, parent, friend)',
  is_primary BOOLEAN DEFAULT TRUE COMMENT 'Primary emergency contact flag',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_emergency_contacts (user_id),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Emergency contact information for users';
```


**Column Descriptions**:
- `contact_id`: UUID primary key for unique contact identification
- `user_id`: Foreign key reference to Users table
- `contact_name`: Full name of emergency contact person
- `contact_phone`: Phone number for emergency contact (international format supported)
- `relationship`: Description of relationship to user (optional)
- `is_primary`: Boolean flag to mark primary emergency contact
- `created_at`: Timestamp when contact was added
- `updated_at`: Timestamp when contact was last modified

**Constraints**:
- At least one emergency contact recommended per user
- Cascade delete when user is deleted

### UserPreferences Table

**Purpose**: Store user preferences and settings

**Schema**:
```sql
CREATE TABLE UserPreferences (
  preference_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for preferences',
  user_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Foreign key to Users table (one-to-one)',
  email_notifications BOOLEAN DEFAULT TRUE COMMENT 'Enable email notifications',
  sms_notifications BOOLEAN DEFAULT FALSE COMMENT 'Enable SMS notifications',
  push_notifications BOOLEAN DEFAULT TRUE COMMENT 'Enable push notifications',
  notification_types JSON COMMENT 'Granular notification type preferences',
  quiet_hours_enabled BOOLEAN DEFAULT FALSE COMMENT 'Enable quiet hours',
  quiet_hours_start TIME COMMENT 'Quiet hours start time',
  quiet_hours_end TIME COMMENT 'Quiet hours end time',
  default_vehicle_types JSON COMMENT 'Preferred vehicle types array',
  default_insurance_tier VARCHAR(50) COMMENT 'Default insurance tier selection',
  default_extras JSON COMMENT 'Default extras array (GPS, child seat, etc.)',
  accessibility_requirements JSON COMMENT 'Accessibility requirements array',
  profile_visibility ENUM('public', 'private', 'friends') DEFAULT 'public' COMMENT 'Profile visibility setting',
  data_sharing_enabled BOOLEAN DEFAULT FALSE COMMENT 'Allow data sharing with partners',
  marketing_opt_in BOOLEAN DEFAULT TRUE COMMENT 'Opt-in for marketing communications',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_preferences (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User preferences and settings';
```


**Column Descriptions**:
- `preference_id`: UUID primary key for preferences record
- `user_id`: Foreign key reference to Users table (unique for one-to-one relationship)
- `email_notifications`: Global toggle for email notifications
- `sms_notifications`: Global toggle for SMS notifications
- `push_notifications`: Global toggle for push notifications
- `notification_types`: JSON object with granular notification preferences
  ```json
  {
    "bookingConfirmations": true,
    "paymentReceipts": true,
    "tripReminders": true,
    "promotionalOffers": false,
    "platformUpdates": true,
    "priceAlerts": true,
    "availabilityAlerts": true
  }
  ```
- `quiet_hours_enabled`: Enable do-not-disturb time window
- `quiet_hours_start`: Start time for quiet hours (TIME format HH:MM:SS)
- `quiet_hours_end`: End time for quiet hours (TIME format HH:MM:SS)
- `default_vehicle_types`: JSON array of preferred vehicle categories
  ```json
  ["sedan", "suv", "electric"]
  ```
- `default_insurance_tier`: Default insurance selection (e.g., "basic", "standard", "premium")
- `default_extras`: JSON array of default extras
  ```json
  ["gps", "child_seat", "additional_driver"]
  ```
- `accessibility_requirements`: JSON array of accessibility needs
  ```json
  ["wheelchair_accessible", "hand_controls", "hearing_assistance"]
  ```
- `profile_visibility`: Enum for profile visibility (public, private, friends)
- `data_sharing_enabled`: Allow sharing data with third-party partners
- `marketing_opt_in`: Opt-in for promotional communications
- `created_at`: Timestamp when preferences were created
- `updated_at`: Timestamp when preferences were last modified

**Constraints**:
- One preferences record per user (enforced by UNIQUE constraint on user_id)
- Cascade delete when user is deleted
- JSON columns validated in application layer


### SavedLocations Table

**Purpose**: Store user's frequently used locations

**Schema**:
```sql
CREATE TABLE SavedLocations (
  location_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for saved location',
  user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to Users table',
  nickname VARCHAR(100) NOT NULL COMMENT 'User-defined location nickname',
  address VARCHAR(500) NOT NULL COMMENT 'Full formatted address',
  latitude DECIMAL(10, 8) NOT NULL COMMENT 'Latitude for geocoding',
  longitude DECIMAL(11, 8) NOT NULL COMMENT 'Longitude for geocoding',
  location_type ENUM('home', 'work', 'other') NOT NULL COMMENT 'Location type',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Creation timestamp',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last update timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_saved_locations (user_id),
  INDEX idx_location_type (location_type),
  INDEX idx_user_location_type (user_id, location_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User saved locations for quick booking';
```

**Column Descriptions**:
- `location_id`: UUID primary key for saved location
- `user_id`: Foreign key reference to Users table
- `nickname`: User-defined name for location (e.g., "Home", "Office", "Airport")
- `address`: Full formatted address string
- `latitude`: Decimal latitude for geocoding (required for mapping)
- `longitude`: Decimal longitude for geocoding (required for mapping)
- `location_type`: Enum classification (home, work, other)
- `created_at`: Timestamp when location was saved
- `updated_at`: Timestamp when location was last modified

**Constraints**:
- Latitude range: -90 to 90
- Longitude range: -180 to 180
- Cascade delete when user is deleted
- Composite index on (user_id, location_type) for fast filtered queries


### UserPersonas Table - Nice-to-have

**Purpose**: Store user persona assignments and scores

**Schema**:
```sql
CREATE TABLE UserPersonas (
  persona_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for persona record',
  user_id VARCHAR(36) NOT NULL UNIQUE COMMENT 'Foreign key to Users table (one-to-one)',
  assigned_persona ENUM('power-renter', 'experience-seeker', 'young-driver', 'eco-conscious', 'accessible-mobility') NOT NULL COMMENT 'Assigned persona type',
  persona_score INT NOT NULL COMMENT 'Persona confidence score (0-100)',
  persona_preferences JSON COMMENT 'Persona-specific preferences and settings',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Initial assignment timestamp',
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last recalculation timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_personas (user_id),
  INDEX idx_assigned_persona (assigned_persona),
  CHECK (persona_score >= 0 AND persona_score <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User persona classifications for personalized experiences';
```

**Column Descriptions**:
- `persona_id`: UUID primary key for persona record
- `user_id`: Foreign key reference to Users table (unique for one-to-one relationship)
- `assigned_persona`: Enum for persona type classification
  - `power-renter`: Business travelers with high booking frequency
  - `experience-seeker`: Luxury seekers with premium preferences
  - `young-driver`: Age 18-25 with social features usage
  - `eco-conscious`: EV preference and sustainability focus
  - `accessible-mobility`: Users with accessibility requirements
- `persona_score`: Confidence score for persona assignment (0-100)
- `persona_preferences`: JSON object with persona-specific settings
  ```json
  {
    "customFeature1": "value",
    "customFeature2": true,
    "preferredVehicles": ["sedan", "suv"]
  }
  ```
- `assigned_at`: Timestamp when persona was first assigned
- `last_updated`: Timestamp when persona was last recalculated

**Constraints**:
- One persona record per user (enforced by UNIQUE constraint on user_id)
- Persona score must be between 0 and 100 (CHECK constraint)
- Cascade delete when user is deleted


### DataExportRequests Table

**Purpose**: Track GDPR-compliant data export requests

**Schema**:
```sql
CREATE TABLE DataExportRequests (
  request_id VARCHAR(36) PRIMARY KEY COMMENT 'UUID for export request',
  user_id VARCHAR(36) NOT NULL COMMENT 'Foreign key to Users table',
  request_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT 'Export request status',
  export_file_url VARCHAR(500) COMMENT 'URL to download export file',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Request timestamp',
  completed_at TIMESTAMP NULL COMMENT 'Completion timestamp',
  expires_at TIMESTAMP NULL COMMENT 'Export file expiration timestamp',
  
  FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
  INDEX idx_user_export_requests (user_id),
  INDEX idx_request_status (request_status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='GDPR data export request tracking';
```

**Column Descriptions**:
- `request_id`: UUID primary key for export request
- `user_id`: Foreign key reference to Users table
- `request_status`: Enum for request lifecycle
  - `pending`: Request received, queued for processing
  - `processing`: Export generation in progress
  - `completed`: Export file ready for download
  - `failed`: Export generation failed
- `export_file_url`: Secure URL for downloading export file (populated when completed)
- `requested_at`: Timestamp when user requested export
- `completed_at`: Timestamp when export was completed (NULL until completed)
- `expires_at`: Timestamp when export file expires (typically 30 days after completion)

**Constraints**:
- Cascade delete when user is deleted
- Export files expire after 30 days (enforced in application logic)
- Index on expires_at for cleanup job efficiency


## Relationships

### Entity Relationship Diagram

```
Users (1) ──────< (Many) UserAddresses
  │
  ├──────< (Many) EmergencyContacts
  │
  ├────── (1) UserPreferences
  │
  ├──────< (Many) SavedLocations
  │
  ├────── (1) UserPersonas [Nice-to-have]
  │
  └──────< (Many) DataExportRequests
```

### Relationship Details

**Users → UserAddresses** (One-to-Many)
- One user can have multiple addresses (home, work, billing, other)
- Foreign key: `UserAddresses.user_id` references `Users.user_id`
- Cascade delete: When user is deleted, all addresses are deleted
- Business rule: Only one primary address per user (enforced in application)

**Users → EmergencyContacts** (One-to-Many)
- One user can have multiple emergency contacts
- Foreign key: `EmergencyContacts.user_id` references `Users.user_id`
- Cascade delete: When user is deleted, all emergency contacts are deleted
- Business rule: At least one emergency contact recommended

**Users → UserPreferences** (One-to-One)
- One user has exactly one preferences record
- Foreign key: `UserPreferences.user_id` references `Users.user_id`
- Unique constraint on `user_id` enforces one-to-one relationship
- Cascade delete: When user is deleted, preferences are deleted
- Auto-created when user registers

**Users → SavedLocations** (One-to-Many)
- One user can save multiple locations
- Foreign key: `SavedLocations.user_id` references `Users.user_id`
- Cascade delete: When user is deleted, all saved locations are deleted
- No limit on number of saved locations (pagination recommended for large lists)

**Users → UserPersonas** (One-to-One) - Nice-to-have
- One user has exactly one persona assignment
- Foreign key: `UserPersonas.user_id` references `Users.user_id`
- Unique constraint on `user_id` enforces one-to-one relationship
- Cascade delete: When user is deleted, persona is deleted
- Created when persona is first calculated

**Users → DataExportRequests** (One-to-Many)
- One user can make multiple export requests over time
- Foreign key: `DataExportRequests.user_id` references `Users.user_id`
- Cascade delete: When user is deleted, all export requests are deleted
- Business rule: Rate limit to 1 request per day (enforced in application)


## Indexes

### Primary Indexes

All tables have primary key indexes on their ID columns:
- `Users.user_id` (PRIMARY KEY)
- `UserAddresses.address_id` (PRIMARY KEY)
- `EmergencyContacts.contact_id` (PRIMARY KEY)
- `UserPreferences.preference_id` (PRIMARY KEY)
- `SavedLocations.location_id` (PRIMARY KEY)
- `UserPersonas.persona_id` (PRIMARY KEY)
- `DataExportRequests.request_id` (PRIMARY KEY)

### Foreign Key Indexes

**Purpose**: Optimize JOIN operations and foreign key constraint checks

- `idx_user_addresses (user_id)`: Fast lookup of all addresses for a user
- `idx_user_emergency_contacts (user_id)`: Fast lookup of emergency contacts for a user
- `idx_user_preferences (user_id)`: Fast lookup of preferences for a user
- `idx_user_saved_locations (user_id)`: Fast lookup of saved locations for a user
- `idx_user_personas (user_id)`: Fast lookup of persona for a user
- `idx_user_export_requests (user_id)`: Fast lookup of export requests for a user

### Secondary Indexes

**Purpose**: Optimize common query patterns and filtering

**UserAddresses**:
- `idx_address_type (address_type)`: Filter addresses by type (home, work, billing, other)
- `idx_is_primary (is_primary)`: Quickly find primary addresses

**EmergencyContacts**:
- `idx_is_primary (is_primary)`: Quickly find primary emergency contacts

**SavedLocations**:
- `idx_location_type (location_type)`: Filter locations by type (home, work, other)
- `idx_user_location_type (user_id, location_type)`: Composite index for filtered user queries

**UserPersonas**:
- `idx_assigned_persona (assigned_persona)`: Analytics on persona distribution

**DataExportRequests**:
- `idx_request_status (request_status)`: Monitor pending/processing requests
- `idx_expires_at (expires_at)`: Cleanup job for expired exports


### Index Performance Considerations

**Query Optimization**:
- Composite index `idx_user_location_type` covers queries filtering by both user_id and location_type
- Covering indexes reduce need for table lookups
- Index selectivity is high for user_id (many unique values)

**Index Maintenance**:
- Indexes are automatically maintained by MySQL on INSERT/UPDATE/DELETE
- Monitor index usage with `SHOW INDEX` and query execution plans
- Remove unused indexes to reduce write overhead
- Rebuild indexes periodically if fragmentation occurs

**Write Performance Impact**:
- Each index adds overhead to INSERT/UPDATE/DELETE operations
- Balance between read performance and write performance
- JSON columns are not indexed (indexed in application layer if needed)

## Data Types and Constraints

### VARCHAR Sizing Guidelines

- `user_id`, `address_id`, `contact_id`, etc.: VARCHAR(36) for UUID storage
- `email`: VARCHAR(255) - standard email length
- `phone`: VARCHAR(20) - international phone numbers
- `profile_photo_url`, `export_file_url`: VARCHAR(500) - CDN URLs
- `street`, `contact_name`: VARCHAR(255) - reasonable name/address length
- `city`, `state`, `country`: VARCHAR(100) - location names
- `postal_code`: VARCHAR(20) - international postal codes
- `nickname`: VARCHAR(100) - user-defined location names
- `address`: VARCHAR(500) - full formatted addresses

### DECIMAL Precision

- `latitude`: DECIMAL(10, 8) - 8 decimal places for ~1mm precision
- `longitude`: DECIMAL(11, 8) - 8 decimal places for ~1mm precision

### ENUM Values

**AddressType**: 'home', 'work', 'billing', 'other'
**LocationType**: 'home', 'work', 'other'
**ProfileVisibility**: 'public', 'private', 'friends'
**PersonaType**: 'power-renter', 'experience-seeker', 'young-driver', 'eco-conscious', 'accessible-mobility'
**ExportStatus**: 'pending', 'processing', 'completed', 'failed'


### JSON Column Schemas

**UserPreferences.notification_types**:
```json
{
  "bookingConfirmations": boolean,
  "paymentReceipts": boolean,
  "tripReminders": boolean,
  "promotionalOffers": boolean,
  "platformUpdates": boolean,
  "priceAlerts": boolean,
  "availabilityAlerts": boolean
}
```

**UserPreferences.default_vehicle_types**:
```json
["sedan", "suv", "truck", "van", "electric", "hybrid", "luxury"]
```

**UserPreferences.default_extras**:
```json
["gps", "child_seat", "additional_driver", "wifi", "ski_rack", "bike_rack"]
```

**UserPreferences.accessibility_requirements**:
```json
["wheelchair_accessible", "hand_controls", "hearing_assistance", "visual_assistance"]
```

**UserPersonas.persona_preferences**:
```json
{
  "customSetting1": "value",
  "customSetting2": true,
  "preferredFeatures": ["feature1", "feature2"]
}
```

## Database Migrations

### Migration 001: Add Profile Extensions to Users Table

```sql
-- Add profile-related columns to Users table
ALTER TABLE Users 
  ADD COLUMN profile_photo_url VARCHAR(500) AFTER phone,
  ADD COLUMN bio TEXT AFTER profile_photo_url,
  ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en' AFTER bio,
  ADD COLUMN currency_preference VARCHAR(3) DEFAULT 'USD' AFTER language_preference,
  ADD COLUMN profile_completeness INT DEFAULT 0 AFTER currency_preference,
  ADD COLUMN email_verified BOOLEAN DEFAULT FALSE AFTER email,
  ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE AFTER phone;

-- Add check constraint for profile completeness
ALTER TABLE Users ADD CONSTRAINT chk_profile_completeness 
  CHECK (profile_completeness >= 0 AND profile_completeness <= 100);
```


### Migration 002: Create UserAddresses Table

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
  INDEX idx_address_type (address_type),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 003: Create EmergencyContacts Table

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
  INDEX idx_user_emergency_contacts (user_id),
  INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 004: Create UserPreferences Table

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


### Migration 005: Create SavedLocations Table

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
  INDEX idx_location_type (location_type),
  INDEX idx_user_location_type (user_id, location_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 006: Create UserPersonas Table (Nice-to-have)

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
  INDEX idx_assigned_persona (assigned_persona),
  CHECK (persona_score >= 0 AND persona_score <= 100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Migration 007: Create DataExportRequests Table

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
  INDEX idx_request_status (request_status),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```


## Sample Queries

### Retrieve Complete User Profile

```sql
SELECT 
  u.*,
  ua.street, ua.city, ua.state, ua.postal_code, ua.country,
  ec.contact_name, ec.contact_phone, ec.relationship,
  up.email_notifications, up.sms_notifications, up.push_notifications,
  up.profile_visibility, up.marketing_opt_in
FROM Users u
LEFT JOIN UserAddresses ua ON u.user_id = ua.user_id AND ua.is_primary = TRUE
LEFT JOIN EmergencyContacts ec ON u.user_id = ec.user_id AND ec.is_primary = TRUE
LEFT JOIN UserPreferences up ON u.user_id = up.user_id
WHERE u.user_id = 'user-uuid-here';
```

### Find Users by Persona Type

```sql
SELECT u.user_id, u.first_name, u.last_name, u.email, 
       p.assigned_persona, p.persona_score
FROM Users u
INNER JOIN UserPersonas p ON u.user_id = p.user_id
WHERE p.assigned_persona = 'power-renter'
  AND p.persona_score >= 80
ORDER BY p.persona_score DESC;
```

### Get User's Saved Locations

```sql
SELECT location_id, nickname, address, latitude, longitude, location_type
FROM SavedLocations
WHERE user_id = 'user-uuid-here'
ORDER BY location_type, nickname;
```

### Find Pending Data Export Requests

```sql
SELECT r.request_id, r.user_id, u.email, r.requested_at,
       TIMESTAMPDIFF(HOUR, r.requested_at, NOW()) as hours_pending
FROM DataExportRequests r
INNER JOIN Users u ON r.user_id = u.user_id
WHERE r.request_status = 'pending'
ORDER BY r.requested_at ASC;
```

### Calculate Profile Completeness

```sql
SELECT 
  user_id,
  (
    (CASE WHEN first_name IS NOT NULL AND first_name != '' THEN 2 ELSE 0 END) +
    (CASE WHEN last_name IS NOT NULL AND last_name != '' THEN 2 ELSE 0 END) +
    (CASE WHEN email IS NOT NULL AND email_verified = TRUE THEN 2 ELSE 0 END) +
    (CASE WHEN phone IS NOT NULL AND phone_verified = TRUE THEN 2 ELSE 0 END) +
    (CASE WHEN date_of_birth IS NOT NULL THEN 2 ELSE 0 END) +
    (CASE WHEN EXISTS(SELECT 1 FROM UserAddresses WHERE user_id = Users.user_id AND is_primary = TRUE) THEN 2 ELSE 0 END) +
    (CASE WHEN profile_photo_url IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN bio IS NOT NULL AND bio != '' THEN 1 ELSE 0 END) +
    (CASE WHEN EXISTS(SELECT 1 FROM EmergencyContacts WHERE user_id = Users.user_id) THEN 1 ELSE 0 END)
  ) * 100 / 15 as calculated_completeness
FROM Users
WHERE user_id = 'user-uuid-here';
```


## Data Integrity and Constraints

### Foreign Key Constraints

All foreign key relationships use `ON DELETE CASCADE` to maintain referential integrity:
- When a user is deleted, all related records are automatically deleted
- Prevents orphaned records in child tables
- Ensures data consistency across tables

### Check Constraints

**Users Table**:
- `profile_completeness` must be between 0 and 100

**UserPersonas Table**:
- `persona_score` must be between 0 and 100

### Unique Constraints

**UserPreferences Table**:
- `user_id` is UNIQUE (enforces one-to-one relationship)

**UserPersonas Table**:
- `user_id` is UNIQUE (enforces one-to-one relationship)

### Default Values

- `language_preference`: 'en' (English)
- `currency_preference`: 'USD' (US Dollar)
- `profile_completeness`: 0
- `email_verified`: FALSE
- `phone_verified`: FALSE
- `email_notifications`: TRUE
- `sms_notifications`: FALSE
- `push_notifications`: TRUE
- `profile_visibility`: 'public'
- `data_sharing_enabled`: FALSE
- `marketing_opt_in`: TRUE
- `is_primary`: FALSE (addresses, emergency contacts)
- `request_status`: 'pending' (data export requests)

## Performance Optimization

### Query Performance

**Indexed Queries**:
- User profile lookups by user_id: O(log n) with primary key index
- Address lookups by user_id: O(log n) with foreign key index
- Saved location lookups by user_id and type: O(log n) with composite index

**JOIN Performance**:
- Use INNER JOIN for required relationships
- Use LEFT JOIN for optional relationships (addresses, emergency contacts)
- Limit result sets with WHERE clauses before JOINs


### Storage Optimization

**VARCHAR vs TEXT**:
- Use VARCHAR for bounded strings (names, emails, URLs)
- Use TEXT for unbounded content (bio, descriptions)
- VARCHAR is stored inline, TEXT is stored separately (performance consideration)

**JSON Columns**:
- Use JSON for flexible, schema-less data (preferences, persona settings)
- JSON columns are not indexed (query performance consideration)
- Validate JSON structure in application layer
- Consider extracting frequently queried JSON fields to regular columns

**ENUM vs VARCHAR**:
- Use ENUM for fixed set of values (address_type, persona_type, status)
- ENUM is stored as integer internally (1-2 bytes vs VARCHAR overhead)
- ENUM provides data validation at database level

### Maintenance Tasks

**Regular Maintenance**:
- Analyze tables monthly: `ANALYZE TABLE Users, UserAddresses, ...`
- Optimize tables quarterly: `OPTIMIZE TABLE Users, UserAddresses, ...`
- Monitor index usage: `SHOW INDEX FROM Users`
- Check for unused indexes and remove if not needed

**Cleanup Jobs**:
- Delete expired data export files (expires_at < NOW())
- Archive old data export requests (completed > 90 days ago)
- Clean up orphaned records (should not occur with CASCADE DELETE)

## Backup and Recovery

### Backup Strategy

**Full Backups**:
- Daily full database backups
- Retain backups for 30 days
- Store backups in separate geographic location

**Incremental Backups**:
- Hourly incremental backups (binary logs)
- Retain incremental backups for 7 days

**Point-in-Time Recovery**:
- Enable binary logging for point-in-time recovery
- Test recovery procedures quarterly

### Data Retention

**User Data**:
- Retain active user data indefinitely
- Soft delete user accounts (mark as deleted, retain for 30 days)
- Hard delete after grace period (GDPR right to be forgotten)

**Export Files**:
- Retain export files for 30 days after generation
- Automatically delete expired exports
- Log all export requests for compliance audit (retain 7 years)


## Security Considerations

### Data Encryption

**At Rest**:
- Enable MySQL encryption at rest for sensitive data
- Encrypt backup files
- Use encrypted storage volumes

**In Transit**:
- Require SSL/TLS for all database connections
- Use certificate-based authentication for production

### Access Control

**Database Users**:
- Application user: SELECT, INSERT, UPDATE, DELETE on profile tables
- Admin user: Full access for maintenance and support
- Backup user: SELECT only for backup operations
- Read-only user: SELECT only for analytics and reporting

**Principle of Least Privilege**:
- Grant minimum necessary permissions
- Use separate database users for different application components
- Rotate database passwords regularly

### Sensitive Data Handling

**PII Protection**:
- Emergency contact information is sensitive (encrypt at rest)
- Addresses contain PII (encrypt at rest)
- Profile photos may contain biometric data (store URLs only, not images)

**Audit Logging**:
- Log all access to user profile data
- Log all modifications to user data
- Retain audit logs for compliance (7 years)

## Technology Stack

- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Character Set**: utf8mb4 (full Unicode support including emojis)
- **Collation**: utf8mb4_unicode_ci (case-insensitive, accent-sensitive)
- **Storage Engine**: InnoDB (ACID compliance, foreign key support, row-level locking)
- **Backup Tool**: mysqldump or Percona XtraBackup
- **Monitoring**: MySQL Enterprise Monitor or Percona Monitoring and Management

## Implementation Notes

### Migration Strategy

- Apply migrations in order (001 → 007)
- Test migrations on staging environment first
- Use transaction-safe migrations where possible
- Backup database before applying migrations
- Monitor migration performance on large tables

### Data Seeding

- Create default UserPreferences record for new users
- Initialize profile_completeness to 0 for new users
- Set default language and currency based on user's location
- Auto-create persona record when first calculated

### Monitoring and Alerts

- Monitor slow queries (> 1 second)
- Alert on high connection count
- Alert on low disk space
- Monitor replication lag (if using replication)
- Track table growth rates


# Feature: Supplier Directory & Profiles

## Overview

The Supplier Directory & Profiles feature enables customers to browse, evaluate, and compare rental suppliers or hosts operating on the platform. This feature provides comprehensive supplier information including company profiles, ratings, fleet details, operational metrics, and specializations, allowing customers to make informed decisions based on supplier reputation, location coverage, and service quality.

This feature is particularly valuable for corporate clients with preferred vendor programs, frequent renters who develop supplier preferences, and customers seeking specialized services (luxury vehicles, accessible vehicles, commercial fleets).

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-011

## User Stories

### As a customer
I want to browse and view detailed profiles of rental suppliers, so that I can choose suppliers based on their reputation, fleet offerings, and service quality.

### As a corporate client
I want to filter vehicles by preferred suppliers in our vendor program, so that I can ensure compliance with company travel policies and negotiated rates.

### As a frequent renter
I want to compare suppliers based on ratings, response times, and cancellation rates, so that I can select reliable suppliers for my rental needs.

### As a customer seeking specialized vehicles
I want to identify suppliers specializing in specific vehicle types (luxury, electric, accessible, commercial), so that I can find the right supplier for my specific requirements.

### As a customer planning multi-location trips
I want to view all locations where a supplier operates, so that I can book with the same supplier across multiple cities for consistency and potential loyalty benefits.

## Frontend Specifications

### Pages

**Supplier Directory Page** (`/suppliers`)
- Grid or list view of all suppliers on the platform
- Supplier card with key information (name, rating, fleet size, locations)
- Filtering and sorting controls
- Search bar for supplier name search
- Pagination or infinite scroll for large supplier lists

**Supplier Profile Page** (`/suppliers/[supplierId]`)
- Comprehensive supplier information display
- Fleet overview with vehicle categories
- Location map showing all supplier locations
- Customer reviews and ratings section
- Available vehicles from this supplier
- Contact information and response time metrics
- Specializations and certifications display

**Supplier Comparison Page** (`/suppliers/compare`)
- Side-by-side comparison of up to 3-4 suppliers
- Comparison matrix with key metrics
- Pricing comparison for similar vehicles
- Rating and review comparison
- Location coverage comparison
- Fleet size and specialization comparison

### UI Components

**SupplierCard Component**
- Supplier logo or placeholder image
- Supplier name and tagline
- Star rating with review count
- Fleet size indicator
- Primary location display
- Specialization badges (Luxury, Electric, Accessible, etc.)
- "View Profile" button
- "Add to Compare" checkbox

**SupplierProfileHeader Component**
- Large supplier logo
- Supplier name and company information
- Overall rating with breakdown by category
- Years in business
- Fleet size and vehicle count
- Primary contact information
- "View All Vehicles" button
- "Contact Supplier" button

**SupplierMetrics Component**
- Average response time display
- Cancellation rate percentage
- Booking completion rate
- Customer satisfaction score
- Total completed bookings
- Visual indicators (icons, progress bars)

**SupplierLocationMap Component**
- Interactive map with supplier location markers
- Location list with addresses
- Distance from user's current location
- "Get Directions" links
- Filter by location type (airport, city center, etc.)

**SupplierFleetOverview Component**
- Vehicle category breakdown (Economy, Luxury, SUV, etc.)
- Vehicle count per category
- Price range per category
- "Browse Vehicles" links per category
- Featured vehicles carousel

**SupplierReviewsSection Component**
- Overall rating display with star breakdown
- Review count and average rating
- Individual review cards with customer feedback
- Rating categories (Service, Vehicle Quality, Value, Communication)
- Review sorting options (Most Recent, Highest Rated, Most Helpful)
- Pagination for reviews

**SupplierFilterPanel Component**
- Filter by rating (minimum rating slider)
- Filter by location (city/region selection)
- Filter by fleet size (small, medium, large)
- Filter by specialization (checkboxes)
- Filter by availability (has vehicles available now)
- "Clear Filters" button

**SupplierComparisonTable Component**
- Column headers for each supplier being compared
- Row categories (Rating, Fleet Size, Locations, Response Time, etc.)
- Visual comparison indicators (better/worse)
- "Remove from Comparison" buttons
- "View Full Profile" links

### User Flows

**Browse Suppliers Flow**
1. User navigates to Supplier Directory page
2. System displays grid/list of suppliers with key information
3. User applies filters (rating, location, specialization)
4. System updates supplier list based on filters
5. User sorts suppliers (by rating, fleet size, name)
6. User clicks on supplier card to view full profile

**View Supplier Profile Flow**
1. User clicks on supplier from directory or search results
2. System loads supplier profile page
3. User views comprehensive supplier information
4. User scrolls through fleet overview and locations
5. User reads customer reviews and ratings
6. User clicks "View All Vehicles" to see supplier's fleet
7. System navigates to vehicle search filtered by this supplier

**Compare Suppliers Flow**
1. User browses supplier directory
2. User selects "Add to Compare" on multiple supplier cards (up to 4)
3. System adds suppliers to comparison list
4. User clicks "Compare Selected" button
5. System navigates to comparison page
6. User views side-by-side comparison matrix
7. User makes decision and clicks "View Profile" on preferred supplier

**Filter by Preferred Supplier Flow**
1. User performs vehicle search with dates and location
2. User opens supplier filter in search results
3. User selects preferred supplier(s) from dropdown
4. System filters vehicle results to show only selected suppliers
5. User views vehicles from preferred suppliers only

### Data Requirements

**From Backend APIs:**
- Supplier list with pagination
- Supplier profile details
- Supplier ratings and review statistics
- Supplier fleet composition
- Supplier location data
- Supplier operational metrics (response time, cancellation rate)
- Supplier specializations and certifications
- Customer reviews for supplier
- Vehicle count by category for supplier
- Availability status for supplier

**State Management:**
- Selected suppliers for comparison
- Applied filters and sort order
- Pagination state
- Supplier profile cache
- User's preferred suppliers (if logged in)

## Backend Specifications

### API Endpoints

**GET /api/suppliers**
- Purpose: Retrieve paginated list of suppliers with filtering and sorting
- Query Parameters:
  - `page` (integer): Page number for pagination
  - `limit` (integer): Number of suppliers per page (default: 20)
  - `minRating` (decimal): Minimum rating filter (0-5)
  - `location` (string): Filter by city or region
  - `specialization` (string): Filter by specialization (luxury, electric, accessible, commercial)
  - `fleetSize` (string): Filter by fleet size (small, medium, large)
  - `sortBy` (string): Sort field (rating, name, fleetSize, responseTime)
  - `sortOrder` (string): Sort direction (asc, desc)
- Response: 200 OK with supplier list and pagination metadata
- Authentication: Optional (public endpoint, enhanced for logged-in users)

**GET /api/suppliers/{supplierId}**
- Purpose: Retrieve detailed supplier profile information
- Path Parameters:
  - `supplierId` (GUID): Unique supplier identifier
- Response: 200 OK with comprehensive supplier details
- Error: 404 Not Found if supplier doesn't exist
- Authentication: Optional

**GET /api/suppliers/{supplierId}/vehicles**
- Purpose: Retrieve all vehicles offered by a specific supplier
- Path Parameters:
  - `supplierId` (GUID): Unique supplier identifier
- Query Parameters:
  - `page` (integer): Page number
  - `limit` (integer): Vehicles per page
  - `category` (string): Filter by vehicle category
  - `available` (boolean): Show only currently available vehicles
- Response: 200 OK with vehicle list
- Authentication: Optional

**GET /api/suppliers/{supplierId}/locations**
- Purpose: Retrieve all locations where supplier operates
- Path Parameters:
  - `supplierId` (GUID): Unique supplier identifier
- Response: 200 OK with location list including coordinates
- Authentication: Optional

**GET /api/suppliers/{supplierId}/reviews**
- Purpose: Retrieve customer reviews for a supplier
- Path Parameters:
  - `supplierId` (GUID): Unique supplier identifier
- Query Parameters:
  - `page` (integer): Page number
  - `limit` (integer): Reviews per page (default: 10)
  - `sortBy` (string): Sort by date, rating, helpfulness
- Response: 200 OK with review list and rating breakdown
- Authentication: Optional

**GET /api/suppliers/{supplierId}/metrics**
- Purpose: Retrieve operational metrics for a supplier
- Path Parameters:
  - `supplierId` (GUID): Unique supplier identifier
- Response: 200 OK with metrics (response time, cancellation rate, completion rate)
- Authentication: Optional

**GET /api/suppliers/compare**
- Purpose: Retrieve comparison data for multiple suppliers
- Query Parameters:
  - `supplierIds` (comma-separated GUIDs): Suppliers to compare
- Response: 200 OK with comparison data structure
- Authentication: Optional

### Request Schemas

**GET /api/suppliers Query Parameters**
```
{
  page: integer (optional, default: 1),
  limit: integer (optional, default: 20, max: 100),
  minRating: decimal (optional, range: 0-5),
  location: string (optional),
  specialization: enum (optional: luxury, electric, accessible, commercial, budget),
  fleetSize: enum (optional: small, medium, large),
  sortBy: enum (optional: rating, name, fleetSize, responseTime, default: rating),
  sortOrder: enum (optional: asc, desc, default: desc)
}
```

**GET /api/suppliers/compare Query Parameters**
```
{
  supplierIds: string (required, comma-separated GUIDs, max: 4)
}
```

### Response Schemas

**Supplier List Response**
```json
{
  "suppliers": [
    {
      "supplierId": "uuid",
      "name": "string",
      "logoUrl": "string",
      "tagline": "string",
      "overallRating": "decimal (0-5)",
      "reviewCount": "integer",
      "fleetSize": "integer",
      "primaryLocation": {
        "city": "string",
        "region": "string",
        "country": "string"
      },
      "specializations": ["string"],
      "yearsInBusiness": "integer",
      "isVerified": "boolean"
    }
  ],
  "pagination": {
    "currentPage": "integer",
    "totalPages": "integer",
    "totalCount": "integer",
    "hasNext": "boolean",
    "hasPrevious": "boolean"
  }
}
```

**Supplier Profile Response**
```json
{
  "supplierId": "uuid",
  "name": "string",
  "logoUrl": "string",
  "tagline": "string",
  "description": "string",
  "overallRating": "decimal (0-5)",
  "reviewCount": "integer",
  "ratingBreakdown": {
    "service": "decimal (0-5)",
    "vehicleQuality": "decimal (0-5)",
    "value": "decimal (0-5)",
    "communication": "decimal (0-5)"
  },
  "fleetSize": "integer",
  "yearsInBusiness": "integer",
  "isVerified": "boolean",
  "specializations": ["string"],
  "certifications": ["string"],
  "contactInfo": {
    "email": "string",
    "phone": "string",
    "website": "string"
  },
  "operationalMetrics": {
    "averageResponseTime": "string (e.g., '2 hours')",
    "cancellationRate": "decimal (percentage)",
    "bookingCompletionRate": "decimal (percentage)",
    "totalCompletedBookings": "integer"
  },
  "locationCount": "integer",
  "fleetComposition": [
    {
      "category": "string",
      "vehicleCount": "integer",
      "priceRange": {
        "min": "decimal",
        "max": "decimal",
        "currency": "string"
      }
    }
  ]
}
```

**Supplier Metrics Response**
```json
{
  "supplierId": "uuid",
  "averageResponseTime": "integer (minutes)",
  "cancellationRate": "decimal (percentage)",
  "bookingCompletionRate": "decimal (percentage)",
  "customerSatisfactionScore": "decimal (0-100)",
  "totalCompletedBookings": "integer",
  "onTimePickupRate": "decimal (percentage)",
  "vehicleConditionRating": "decimal (0-5)",
  "lastUpdated": "datetime"
}
```

**Supplier Comparison Response**
```json
{
  "suppliers": [
    {
      "supplierId": "uuid",
      "name": "string",
      "logoUrl": "string",
      "overallRating": "decimal",
      "reviewCount": "integer",
      "fleetSize": "integer",
      "locationCount": "integer",
      "averageResponseTime": "string",
      "cancellationRate": "decimal",
      "specializations": ["string"],
      "priceRange": {
        "min": "decimal",
        "max": "decimal"
      },
      "yearsInBusiness": "integer"
    }
  ]
}
```

### Business Logic

**Supplier Rating Calculation**
- Calculate overall rating as weighted average of all customer reviews
- Update rating in real-time when new reviews are submitted
- Calculate category-specific ratings (service, vehicle quality, value, communication)
- Weight recent reviews more heavily (last 12 months)

**Fleet Size Classification**
- Small: 1-10 vehicles
- Medium: 11-50 vehicles
- Large: 51+ vehicles
- Update classification when vehicles are added/removed

**Response Time Calculation**
- Track time between customer inquiry and supplier response
- Calculate rolling average over last 90 days
- Display in human-readable format (e.g., "Usually responds within 2 hours")

**Cancellation Rate Calculation**
- Calculate percentage of bookings cancelled by supplier (not customer)
- Track over last 12 months
- Flag suppliers with cancellation rate > 5% for review

**Specialization Assignment**
- Automatically assign specializations based on fleet composition
- Luxury: >30% of fleet are luxury vehicles
- Electric: >50% of fleet are electric/hybrid vehicles
- Accessible: Offers accessible vehicles with modifications
- Commercial: Offers trucks, vans, buses for commercial use
- Budget: >70% of fleet are economy vehicles

**Supplier Verification**
- Verify business registration and insurance
- Verify vehicle ownership or lease agreements
- Verify driver background checks (for peer-to-peer hosts)
- Display verification badge on profile

### Authentication Requirements

**Public Access:**
- View supplier directory
- View supplier profiles
- View supplier reviews
- Compare suppliers

**Authenticated Users:**
- Save preferred suppliers
- Contact suppliers directly
- Submit reviews for suppliers (after completed booking)
- Report issues with suppliers

**Supplier/Admin Access:**
- Update supplier profile information
- Respond to customer reviews
- View detailed analytics
- Manage fleet and locations

### Integration Points

**Review System Integration**
- Fetch reviews from review service
- Calculate aggregate ratings
- Display review statistics

**Vehicle Service Integration**
- Fetch vehicle count and categories
- Check real-time availability
- Link to vehicle search filtered by supplier

**Location Service Integration**
- Fetch supplier location data
- Calculate distances from user location
- Display locations on map

**Booking Service Integration**
- Fetch booking completion metrics
- Calculate cancellation rates
- Track response times

## Database Specifications

### Schema Changes

**New Table: Suppliers**
- Stores supplier/host profile information
- Tracks operational metrics
- Manages verification status

**New Table: SupplierLocations**
- Stores all locations where supplier operates
- Links suppliers to physical locations

**New Table: SupplierSpecializations**
- Many-to-many relationship between suppliers and specializations
- Tracks supplier expertise areas

**New Table: SupplierMetrics**
- Stores calculated operational metrics
- Updated periodically via background jobs

**Modified Table: Vehicles**
- Add foreign key to Suppliers table
- Link each vehicle to its supplier

**Modified Table: Reviews**
- Add supplier rating fields
- Link reviews to both vehicles and suppliers

### Table Definitions

**Suppliers Table**
```sql
CREATE TABLE Suppliers (
  SupplierId CHAR(36) PRIMARY KEY,
  Name VARCHAR(200) NOT NULL,
  Tagline VARCHAR(500),
  Description TEXT,
  LogoUrl VARCHAR(500),
  Email VARCHAR(255) NOT NULL,
  Phone VARCHAR(50),
  Website VARCHAR(500),
  YearsInBusiness INT,
  IsVerified BOOLEAN DEFAULT FALSE,
  VerificationDate DATETIME,
  OverallRating DECIMAL(3,2) DEFAULT 0.00,
  ReviewCount INT DEFAULT 0,
  FleetSize INT DEFAULT 0,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  IsActive BOOLEAN DEFAULT TRUE,
  INDEX idx_name (Name),
  INDEX idx_rating (OverallRating),
  INDEX idx_verified (IsVerified),
  INDEX idx_active (IsActive)
);
```

**SupplierLocations Table**
```sql
CREATE TABLE SupplierLocations (
  LocationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  LocationName VARCHAR(200) NOT NULL,
  AddressLine1 VARCHAR(255) NOT NULL,
  AddressLine2 VARCHAR(255),
  City VARCHAR(100) NOT NULL,
  Region VARCHAR(100),
  PostalCode VARCHAR(20),
  Country VARCHAR(100) NOT NULL,
  Latitude DECIMAL(10,8),
  Longitude DECIMAL(11,8),
  IsPrimaryLocation BOOLEAN DEFAULT FALSE,
  LocationType ENUM('airport', 'city_center', 'neighborhood', 'delivery') DEFAULT 'neighborhood',
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UpdatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  INDEX idx_supplier (SupplierId),
  INDEX idx_city (City),
  INDEX idx_location_type (LocationType),
  INDEX idx_coordinates (Latitude, Longitude)
);
```

**SupplierSpecializations Table**
```sql
CREATE TABLE SupplierSpecializations (
  SupplierSpecializationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  Specialization ENUM('luxury', 'electric', 'accessible', 'commercial', 'budget', 'exotic', 'vintage') NOT NULL,
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_specialization (SupplierId, Specialization),
  INDEX idx_supplier (SupplierId),
  INDEX idx_specialization (Specialization)
);
```

**SupplierMetrics Table**
```sql
CREATE TABLE SupplierMetrics (
  MetricId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  AverageResponseTimeMinutes INT DEFAULT 0,
  CancellationRate DECIMAL(5,2) DEFAULT 0.00,
  BookingCompletionRate DECIMAL(5,2) DEFAULT 100.00,
  CustomerSatisfactionScore DECIMAL(5,2) DEFAULT 0.00,
  TotalCompletedBookings INT DEFAULT 0,
  OnTimePickupRate DECIMAL(5,2) DEFAULT 100.00,
  VehicleConditionRating DECIMAL(3,2) DEFAULT 0.00,
  CalculatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  UNIQUE KEY unique_supplier_metric (SupplierId),
  INDEX idx_supplier (SupplierId),
  INDEX idx_calculated (CalculatedAt)
);
```

**SupplierCertifications Table**
```sql
CREATE TABLE SupplierCertifications (
  CertificationId CHAR(36) PRIMARY KEY,
  SupplierId CHAR(36) NOT NULL,
  CertificationName VARCHAR(200) NOT NULL,
  IssuingOrganization VARCHAR(200),
  IssueDate DATE,
  ExpiryDate DATE,
  CertificationUrl VARCHAR(500),
  CreatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE CASCADE,
  INDEX idx_supplier (SupplierId),
  INDEX idx_expiry (ExpiryDate)
);
```

### Relationships

**Suppliers → SupplierLocations** (One-to-Many)
- One supplier can operate at multiple locations
- Foreign key: SupplierLocations.SupplierId → Suppliers.SupplierId
- Cascade delete: When supplier is deleted, all locations are deleted

**Suppliers → SupplierSpecializations** (One-to-Many)
- One supplier can have multiple specializations
- Foreign key: SupplierSpecializations.SupplierId → Suppliers.SupplierId
- Cascade delete: When supplier is deleted, all specializations are deleted

**Suppliers → SupplierMetrics** (One-to-One)
- Each supplier has one current metrics record
- Foreign key: SupplierMetrics.SupplierId → Suppliers.SupplierId
- Cascade delete: When supplier is deleted, metrics are deleted

**Suppliers → Vehicles** (One-to-Many)
- One supplier owns/manages multiple vehicles
- Foreign key: Vehicles.SupplierId → Suppliers.SupplierId
- Restrict delete: Cannot delete supplier with active vehicles

**Suppliers → Reviews** (One-to-Many)
- One supplier can have multiple reviews
- Foreign key: Reviews.SupplierId → Suppliers.SupplierId
- Cascade delete: When supplier is deleted, reviews are archived (soft delete)

**Suppliers → SupplierCertifications** (One-to-Many)
- One supplier can have multiple certifications
- Foreign key: SupplierCertifications.SupplierId → Suppliers.SupplierId
- Cascade delete: When supplier is deleted, certifications are deleted

### Indexes

**Performance Optimization Indexes:**

```sql
-- Supplier search and filtering
CREATE INDEX idx_suppliers_rating_active ON Suppliers(OverallRating DESC, IsActive);
CREATE INDEX idx_suppliers_name_search ON Suppliers(Name, IsActive);
CREATE INDEX idx_suppliers_fleet_size ON Suppliers(FleetSize DESC, IsActive);

-- Location-based queries
CREATE INDEX idx_supplier_locations_city_country ON SupplierLocations(City, Country, SupplierId);
CREATE INDEX idx_supplier_locations_geo ON SupplierLocations(Latitude, Longitude);

-- Specialization filtering
CREATE INDEX idx_specializations_lookup ON SupplierSpecializations(Specialization, SupplierId);

-- Metrics queries
CREATE INDEX idx_metrics_response_time ON SupplierMetrics(AverageResponseTimeMinutes, SupplierId);
CREATE INDEX idx_metrics_cancellation ON SupplierMetrics(CancellationRate, SupplierId);

-- Composite index for common query patterns
CREATE INDEX idx_suppliers_rating_verified ON Suppliers(OverallRating DESC, IsVerified, IsActive);
```

**Full-Text Search Index:**
```sql
-- Enable full-text search on supplier names and descriptions
CREATE FULLTEXT INDEX idx_suppliers_fulltext ON Suppliers(Name, Description, Tagline);
```

### Data Migration Notes

**Initial Supplier Data Import:**
- Import existing supplier/host data from legacy systems
- Validate email and phone number formats
- Geocode addresses to populate latitude/longitude
- Calculate initial metrics from historical booking data
- Assign specializations based on fleet analysis

**Metrics Calculation Job:**
- Schedule daily job to recalculate supplier metrics
- Update response times from inquiry/message data
- Update cancellation rates from booking data
- Update completion rates from booking data
- Update ratings from review data

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript
- **Mapping**: Google Maps API or Mapbox for location display
- **Caching**: Redis for supplier profile and metrics caching
- **Search**: MySQL Full-Text Search or Elasticsearch for supplier search

## Implementation Notes

### Performance Considerations

**Caching Strategy:**
- Cache supplier profiles for 1 hour (frequently accessed)
- Cache supplier metrics for 6 hours (updated daily)
- Cache supplier location data for 24 hours (rarely changes)
- Invalidate cache when supplier updates profile

**Query Optimization:**
- Use indexed queries for filtering and sorting
- Implement pagination to limit result sets
- Use database views for complex metric calculations
- Consider read replicas for high-traffic supplier queries

**Image Optimization:**
- Compress and resize supplier logos
- Use CDN for logo delivery
- Implement lazy loading for supplier images

### Business Rules

**Supplier Verification Requirements:**
- Business registration documents
- Proof of insurance (minimum coverage amounts)
- Vehicle ownership or lease agreements
- Background checks for individual hosts
- Verification expires annually and must be renewed

**Minimum Rating Display:**
- Display rating only after 5+ reviews
- Show "New Supplier" badge for suppliers with <5 reviews
- Calculate ratings with recency weighting (last 12 months)

**Cancellation Rate Thresholds:**
- Green: <2% cancellation rate
- Yellow: 2-5% cancellation rate
- Red: >5% cancellation rate (flag for review)
- Automatic suspension at >10% cancellation rate

**Response Time Expectations:**
- Excellent: <2 hours average response time
- Good: 2-6 hours average response time
- Fair: 6-24 hours average response time
- Poor: >24 hours average response time

### Future Enhancements

**Phase 2 Enhancements:**
- Supplier messaging system for direct communication
- Supplier loyalty programs and preferred supplier benefits
- Supplier performance dashboards for hosts
- Automated specialization assignment based on fleet analysis
- Supplier comparison saved lists

**Phase 3 Enhancements:**
- Supplier recommendation engine based on user preferences
- Supplier network effects (suppliers who work together)
- Supplier insurance verification automation
- Supplier fleet optimization recommendations
- Multi-supplier booking coordination for complex trips

### Dependencies

**Prerequisite Features:**
- Vehicle management system (F-ADMIN-FLEET-001)
- Review and rating system (F-SD-010)
- Location management system
- User authentication system

**Related Features:**
- Vehicle search and filtering (F-SD-004)
- Booking management (F-BM-001)
- Corporate account management (F-USER-CORP-001)
- Fleet management (F-ADMIN-FLEET-001)

### Testing Considerations

**Unit Tests:**
- Supplier rating calculation logic
- Fleet size classification logic
- Response time calculation
- Cancellation rate calculation
- Specialization assignment logic

**Integration Tests:**
- Supplier profile retrieval with all related data
- Supplier filtering and sorting
- Supplier comparison data aggregation
- Supplier metrics calculation from booking data

**UI Tests:**
- Supplier directory browsing and filtering
- Supplier profile page display
- Supplier comparison functionality
- Mobile responsiveness for supplier pages

### Accessibility Requirements

- Supplier cards and profiles must be keyboard navigable
- Screen reader support for supplier ratings and metrics
- Alt text for supplier logos
- High contrast mode support for supplier information
- ARIA labels for interactive elements (filters, sort controls)

### Security Considerations

- Validate supplier IDs to prevent unauthorized access
- Sanitize supplier-provided content (descriptions, responses)
- Rate limit supplier search API to prevent scraping
- Protect supplier contact information (email/phone) from bots
- Implement CAPTCHA for supplier contact forms
- Audit log for supplier profile changes

### Monitoring and Analytics

**Key Metrics to Track:**
- Supplier profile view count
- Supplier comparison usage
- Filter usage patterns
- Supplier contact rate
- Conversion rate from supplier profile to booking
- Most viewed suppliers
- Supplier search queries

**Alerts:**
- Alert when supplier cancellation rate exceeds threshold
- Alert when supplier response time degrades significantly
- Alert when supplier rating drops below threshold
- Alert for suspicious supplier activity patterns

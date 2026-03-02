# Feature: Vehicle Inventory Management

## Overview

Comprehensive vehicle lifecycle management system enabling fleet managers to manage the complete vehicle inventory from acquisition through disposition. The system provides full CRUD operations for vehicle data, including specifications, images, pricing, availability, and status tracking. Supports bulk operations, advanced search/filtering, and maintains complete audit trails for all vehicle changes.

## Sprint Category

sprint-mvp

## Feature ID

F-ADMIN-FM-001, F-ADMIN-FM-002, F-ADMIN-FM-005, F-FUNC-FM-001, F-FUNC-FM-002

## User Stories

### User Story 1: Fleet Manager - Vehicle Inventory Management
As a fleet manager, I want to manage the complete vehicle inventory lifecycle from acquisition to disposition, so that I can maintain accurate vehicle information, optimize fleet composition, and ensure vehicles are properly configured for customer bookings.

### User Story 2: Fleet Manager - Vehicle Status Tracking
As a fleet manager, I want to track and manage operational status of each vehicle throughout its lifecycle, so that I can prevent booking conflicts, coordinate maintenance, and maintain accurate availability information.

### User Story 3: Fleet Manager - Lifecycle Management
As a fleet manager, I want to track vehicle age, mileage, and costs from acquisition to disposition, so that I can make data-driven decisions about optimal retirement timing and maximize fleet profitability.

## Frontend Specifications

### Pages

**Vehicle Management Dashboard** (`/admin/fleet/vehicles`)
- Grid/list view of all vehicles with filtering and search
- Quick status indicators (Available, Maintenance, Booked, Retired)
- Bulk action toolbar for multi-vehicle operations
- Export functionality for vehicle data

**Add/Edit Vehicle Form** (`/admin/fleet/vehicles/new`, `/admin/fleet/vehicles/:id/edit`)
- Multi-step form for vehicle creation and editing
- Image upload with drag-and-drop and preview
- Real-time validation for required fields
- Duplicate vehicle detection based on license plate/VIN

**Vehicle Details Page** (`/admin/fleet/vehicles/:id`)
- Complete vehicle information display
- Status history timeline
- Booking history and upcoming reservations
- Performance metrics (utilization, revenue, ratings)
- Quick actions (edit, change status, schedule maintenance)

**Bulk Operations Interface** (`/admin/fleet/bulk-operations`)
- Multi-select vehicle grid
- Bulk action options (pricing, status, location, availability)
- Preview changes before execution
- Progress indicator for batch processing
- Results summary with success/failure counts

### UI Components

**VehicleCard Component**
- Displays vehicle thumbnail, name, category, status
- Quick action buttons (edit, view, change status)
- Status badge with color coding
- Utilization indicator bar

**VehicleForm Component**
- Tabbed interface: Basic Info, Specifications, Features, Images, Pricing, Availability
- Auto-save draft functionality
- Field validation with inline error messages
- Image upload with cropping and optimization

**VehicleStatusBadge Component**
- Color-coded status indicators
- Tooltip with status details and last updated time
- Click to change status (with permission check)

**VehicleSearchFilter Component**
- Multi-criteria filter panel
- Search by name, license plate, VIN, category
- Filter by status, location, supplier, availability
- Save filter presets

**BulkActionToolbar Component**
- Select all/none/filtered vehicles
- Dropdown menu for bulk actions
- Confirmation dialog for destructive actions
- Progress modal during execution

**ImageGallery Component**
- Multiple image upload with drag-and-drop
- Image reordering and primary image selection
- Image cropping and optimization
- Delete with confirmation

### User Flows

**Add New Vehicle Flow**
1. Navigate to Vehicle Management Dashboard
2. Click "Add New Vehicle" button
3. Fill Basic Info tab (name, license plate, year, VIN, category, supplier)
4. System validates license plate uniqueness
5. Fill Specifications tab (seats, doors, transmission, fuel type, mileage policy)
6. Fill Features tab (select applicable features from checklist)
7. Upload Images tab (minimum 1 required, drag-and-drop multiple)
8. Configure Pricing tab (hourly, daily, weekly, monthly rates)
9. Set Availability tab (default status, operating locations)
10. Review summary and click "Save Vehicle"
11. System creates vehicle record and displays success message
12. Redirect to vehicle details page

**Update Vehicle Status Flow**
1. Navigate to Vehicle Management Dashboard or Vehicle Details Page
2. Click status badge or "Change Status" button
3. Select new status from dropdown (Available, Unavailable, Maintenance, Retired)
4. If Maintenance: Enter reason and expected return date
5. If Retired: Enter retirement reason and disposition plan
6. System validates status change (checks for active bookings)
7. Click "Update Status"
8. System updates status, blocks calendar if needed, logs change
9. Display confirmation message

**Bulk Update Flow**
1. Navigate to Vehicle Management Dashboard
2. Apply filters to narrow vehicle selection
3. Select vehicles using checkboxes (or "Select All Filtered")
4. Click "Bulk Actions" dropdown
5. Select action (Update Pricing, Change Status, Assign Location, Update Availability)
6. Configure bulk action parameters in modal
7. Preview changes showing affected vehicles
8. Click "Apply Changes"
9. System processes batch with progress indicator
10. Display results summary (X successful, Y failed with reasons)
11. Refresh vehicle grid with updated data

**Vehicle Lifecycle Management Flow**
1. Navigate to Vehicle Details Page
2. View lifecycle metrics (age, mileage, total revenue, maintenance costs)
3. System calculates profitability and retirement recommendations
4. If retirement recommended: Review retirement criteria
5. Click "Initiate Retirement Process"
6. Enter disposition details (sale channel, expected value, timeline)
7. System changes status to "Retired" and removes from customer search
8. Track disposition progress through retirement workflow
9. Complete sale and archive vehicle record

### Data Requirements

**From Backend APIs:**
- GET /api/admin/vehicles - List all vehicles with filtering and pagination
- GET /api/admin/vehicles/:id - Get detailed vehicle information
- POST /api/admin/vehicles - Create new vehicle
- PUT /api/admin/vehicles/:id - Update vehicle information
- DELETE /api/admin/vehicles/:id - Delete vehicle (with booking check)
- PATCH /api/admin/vehicles/:id/status - Update vehicle status
- POST /api/admin/vehicles/bulk - Perform bulk operations
- GET /api/admin/vehicles/:id/history - Get status and change history
- GET /api/admin/vehicles/:id/metrics - Get performance metrics
- POST /api/admin/vehicles/import - Bulk import from file
- GET /api/admin/vehicles/export - Export vehicle data

**Real-time Updates:**
- WebSocket connection for live status changes
- Real-time booking updates affecting availability
- Live utilization metrics updates

## Backend Specifications

### API Endpoints

**Vehicle CRUD Operations**

`POST /api/admin/vehicles`
- Purpose: Create new vehicle in inventory
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: Vehicle object with all specifications
- Response: 201 Created with vehicle ID and complete vehicle object
- Validation: License plate uniqueness, VIN format, required fields

`GET /api/admin/vehicles`
- Purpose: List vehicles with filtering, search, and pagination
- Authentication: Required (Admin, Fleet Manager, Supplier roles)
- Query Parameters: page, limit, status, category, location, supplier, search
- Response: 200 OK with paginated vehicle list and metadata
- Performance: Indexed queries, response time < 500ms

`GET /api/admin/vehicles/:id`
- Purpose: Get detailed vehicle information
- Authentication: Required (Admin, Fleet Manager, Supplier roles)
- Response: 200 OK with complete vehicle object including relationships
- Error: 404 if vehicle not found

`PUT /api/admin/vehicles/:id`
- Purpose: Update vehicle information
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: Partial or complete vehicle object
- Response: 200 OK with updated vehicle object
- Audit: Log all changes with user and timestamp

`DELETE /api/admin/vehicles/:id`
- Purpose: Delete vehicle from inventory
- Authentication: Required (Admin role only)
- Validation: Check for active or future bookings
- Response: 204 No Content if successful, 409 Conflict if bookings exist
- Soft Delete: Mark as deleted rather than physical deletion

**Vehicle Status Management**

`PATCH /api/admin/vehicles/:id/status`
- Purpose: Update vehicle operational status
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: { status, reason, expectedReturnDate }
- Response: 200 OK with updated vehicle
- Side Effects: Update availability calendar, send notifications

`GET /api/admin/vehicles/:id/status-history`
- Purpose: Get complete status change history
- Authentication: Required (Admin, Fleet Manager roles)
- Response: 200 OK with array of status changes (timestamp, old status, new status, user, reason)

**Bulk Operations**

`POST /api/admin/vehicles/bulk`
- Purpose: Perform bulk operations on multiple vehicles
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: { vehicleIds, action, parameters }
- Actions: updatePricing, changeStatus, assignLocation, updateAvailability
- Response: 200 OK with results { successful, failed, errors }
- Processing: Batch processing with transaction rollback on critical errors

`POST /api/admin/vehicles/import`
- Purpose: Bulk import vehicles from CSV/Excel file
- Authentication: Required (Admin role only)
- Request: Multipart form data with file upload
- Response: 200 OK with import summary (created, updated, failed)
- Validation: Validate all rows before import, provide detailed error report

`GET /api/admin/vehicles/export`
- Purpose: Export vehicle data for external analysis
- Authentication: Required (Admin, Fleet Manager roles)
- Query Parameters: format (csv, excel, json), filters
- Response: 200 OK with file download
- Include: All vehicle data, current status, performance metrics

**Vehicle Lifecycle**

`GET /api/admin/vehicles/:id/lifecycle`
- Purpose: Get lifecycle metrics and retirement recommendations
- Authentication: Required (Admin, Fleet Manager roles)
- Response: 200 OK with { age, mileage, totalRevenue, maintenanceCosts, profitability, retirementScore, recommendations }

`POST /api/admin/vehicles/:id/retire`
- Purpose: Initiate vehicle retirement process
- Authentication: Required (Admin role only)
- Request Body: { reason, dispositionPlan, expectedValue, timeline }
- Response: 200 OK with retirement workflow ID
- Side Effects: Change status to Retired, remove from customer search

### Request Schemas

**CreateVehicleRequest**
```
{
  name: string (required, max 200 chars)
  licensePlate: string (required, unique, max 20 chars)
  year: integer (required, 1900-current year+1)
  vin: string (required, 17 chars, alphanumeric)
  category: enum (required: economy, standard, luxury, suv, van, electric, hybrid)
  supplierId: uuid (required)
  make: string (required, max 100 chars)
  model: string (required, max 100 chars)
  seats: integer (required, 2-15)
  doors: integer (required, 2-5)
  transmissionType: enum (required: automatic, manual, cvt)
  fuelType: enum (required: gasoline, diesel, electric, hybrid, plugin-hybrid)
  mileagePolicy: object {
    unlimited: boolean
    dailyLimit: integer (if not unlimited)
    overageFee: decimal (if not unlimited)
  }
  features: array of strings (optional)
  images: array of image URLs (required, min 1)
  pricing: object {
    hourly: decimal (optional)
    daily: decimal (required)
    weekly: decimal (optional)
    monthly: decimal (optional)
  }
  locationIds: array of uuids (required, min 1)
  status: enum (default: coming-soon)
}
```

**UpdateVehicleStatusRequest**
```
{
  status: enum (required: available, unavailable, maintenance, retired)
  reason: string (required for maintenance/retired, max 500 chars)
  expectedReturnDate: datetime (required for maintenance)
  dispositionPlan: string (required for retired, max 1000 chars)
}
```

**BulkOperationRequest**
```
{
  vehicleIds: array of uuids (required, max 100 per request)
  action: enum (required: updatePricing, changeStatus, assignLocation, updateAvailability)
  parameters: object (varies by action)
}
```

### Response Schemas

**VehicleResponse**
```
{
  id: uuid
  name: string
  licensePlate: string
  year: integer
  vin: string
  category: string
  supplier: { id, name, email }
  make: string
  model: string
  seats: integer
  doors: integer
  transmissionType: string
  fuelType: string
  mileagePolicy: object
  features: array of strings
  images: array of { url, isPrimary, order }
  pricing: object
  locations: array of { id, name, address }
  status: string
  currentMileage: integer
  createdAt: datetime
  updatedAt: datetime
  createdBy: { id, name }
  updatedBy: { id, name }
}
```

**VehicleListResponse**
```
{
  vehicles: array of VehicleResponse
  pagination: {
    page: integer
    limit: integer
    total: integer
    totalPages: integer
  }
  filters: object (applied filters)
}
```

**BulkOperationResponse**
```
{
  totalProcessed: integer
  successful: integer
  failed: integer
  results: array of {
    vehicleId: uuid
    vehicleName: string
    success: boolean
    error: string (if failed)
  }
}
```

### Business Logic

**Vehicle Creation Logic**
- Validate license plate uniqueness across entire fleet
- Validate VIN format (17 alphanumeric characters)
- Ensure at least one image is uploaded
- Validate pricing structure (longer periods have lower per-day rates)
- Assign default status as "coming-soon"
- Generate audit log entry for creation
- Send notification to relevant stakeholders

**Vehicle Update Logic**
- Track all field changes for audit trail
- Validate license plate uniqueness if changed
- Prevent changes to VIN after initial creation
- Update search index for modified vehicles
- Invalidate cached vehicle data
- Send notifications for significant changes

**Vehicle Deletion Logic**
- Check for active bookings (present or future)
- Check for pending maintenance appointments
- If conflicts exist: Return 409 Conflict with details
- If no conflicts: Soft delete (mark as deleted, preserve data)
- Archive vehicle data for historical reporting
- Remove from customer-facing search results
- Maintain referential integrity in booking history

**Status Management Logic**
- Validate status transitions (business rules)
- When changing to Maintenance: Block rental calendar automatically
- When changing to Retired: Remove from search, preserve booking history
- When changing to Available: Verify no maintenance scheduled
- Update availability calculations in real-time
- Send notifications to affected stakeholders
- Log status change with reason and user

**Bulk Operations Logic**
- Validate all vehicle IDs exist and user has permission
- Process in batches of 50 to prevent timeout
- Use database transactions for data consistency
- Continue processing on individual failures (collect errors)
- Generate detailed results report
- Send completion notification with summary

**Lifecycle Tracking Logic**
- Calculate vehicle age from year and current date
- Track total mileage from odometer readings
- Sum all revenue from completed bookings
- Sum all maintenance costs from service records
- Calculate profitability: revenue - (maintenance + depreciation + insurance)
- Generate retirement score based on: age > 5 years, mileage > 100k, maintenance costs > revenue threshold
- Provide recommendations: keep, monitor, retire soon, retire immediately

### Authentication Requirements

- All endpoints require authentication via JWT token
- Role-based access control:
  - Admin: Full access to all operations including delete
  - Fleet Manager: Create, read, update vehicles; cannot delete
  - Supplier: Read and update only their own vehicles
- Audit logging for all create, update, delete, status change operations
- Rate limiting: 100 requests per minute per user

### Validation Rules

**License Plate Validation**
- Required field
- Maximum 20 characters
- Must be unique across entire fleet
- Alphanumeric with hyphens allowed
- Case-insensitive uniqueness check

**VIN Validation**
- Required field
- Exactly 17 characters
- Alphanumeric only (no I, O, Q to avoid confusion)
- Must be unique across entire fleet
- Immutable after creation

**Year Validation**
- Required field
- Integer between 1900 and current year + 1
- Cannot be future year beyond next model year

**Pricing Validation**
- Daily rate required (minimum $10)
- If weekly rate provided: must be < daily rate × 7
- If monthly rate provided: must be < daily rate × 30
- All rates must be positive decimals with 2 decimal places

**Image Validation**
- Minimum 1 image required
- Maximum 20 images per vehicle
- Supported formats: JPEG, PNG, WebP
- Maximum file size: 10MB per image
- Automatic resize to max 1920px width
- Generate thumbnails (300px width)

## Backend Specifications

### API Endpoints

See Frontend Specifications section for complete API endpoint details.

### Request Schemas

See Frontend Specifications section for complete request schema details.

### Response Schemas

See Frontend Specifications section for complete response schema details.

### Business Logic

See Frontend Specifications section for complete business logic details.

### Authentication Requirements

See Frontend Specifications section for complete authentication requirements.

## Database Specifications

### Schema Changes

**New Table: vehicles**

Primary table for storing vehicle inventory information.

**New Table: vehicle_images**

Stores multiple images per vehicle with ordering.

**New Table: vehicle_status_history**

Tracks all status changes for audit trail.

**New Table: vehicle_lifecycle_metrics**

Stores calculated lifecycle metrics for performance tracking.

### Table Definitions

**vehicles**
```
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
name: VARCHAR(200) NOT NULL
license_plate: VARCHAR(20) NOT NULL UNIQUE
year: INT NOT NULL CHECK (year >= 1900 AND year <= YEAR(CURDATE()) + 1)
vin: VARCHAR(17) NOT NULL UNIQUE
category: ENUM('economy', 'standard', 'luxury', 'suv', 'van', 'electric', 'hybrid') NOT NULL
supplier_id: UUID NOT NULL
make: VARCHAR(100) NOT NULL
model: VARCHAR(100) NOT NULL
seats: INT NOT NULL CHECK (seats >= 2 AND seats <= 15)
doors: INT NOT NULL CHECK (doors >= 2 AND doors <= 5)
transmission_type: ENUM('automatic', 'manual', 'cvt') NOT NULL
fuel_type: ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'plugin-hybrid') NOT NULL
mileage_unlimited: BOOLEAN NOT NULL DEFAULT FALSE
mileage_daily_limit: INT NULL CHECK (mileage_daily_limit > 0)
mileage_overage_fee: DECIMAL(10,2) NULL CHECK (mileage_overage_fee >= 0)
features: JSON NULL
pricing_hourly: DECIMAL(10,2) NULL CHECK (pricing_hourly >= 0)
pricing_daily: DECIMAL(10,2) NOT NULL CHECK (pricing_daily >= 10.00)
pricing_weekly: DECIMAL(10,2) NULL CHECK (pricing_weekly >= 0)
pricing_monthly: DECIMAL(10,2) NULL CHECK (pricing_monthly >= 0)
status: ENUM('available', 'unavailable', 'fully_booked', 'coming_soon', 'maintenance', 'retired') NOT NULL DEFAULT 'coming_soon'
current_mileage: INT NOT NULL DEFAULT 0
is_deleted: BOOLEAN NOT NULL DEFAULT FALSE
created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
updated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
created_by: UUID NOT NULL
updated_by: UUID NOT NULL
```

**vehicle_images**
```
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
vehicle_id: UUID NOT NULL
image_url: VARCHAR(500) NOT NULL
thumbnail_url: VARCHAR(500) NOT NULL
is_primary: BOOLEAN NOT NULL DEFAULT FALSE
display_order: INT NOT NULL DEFAULT 0
created_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**vehicle_status_history**
```
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
vehicle_id: UUID NOT NULL
old_status: VARCHAR(50) NULL
new_status: VARCHAR(50) NOT NULL
reason: TEXT NULL
expected_return_date: TIMESTAMP NULL
changed_by: UUID NOT NULL
changed_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**vehicle_lifecycle_metrics**
```
id: UUID PRIMARY KEY DEFAULT gen_random_uuid()
vehicle_id: UUID NOT NULL UNIQUE
acquisition_date: DATE NOT NULL
acquisition_cost: DECIMAL(12,2) NOT NULL
total_bookings: INT NOT NULL DEFAULT 0
total_revenue: DECIMAL(12,2) NOT NULL DEFAULT 0.00
total_maintenance_cost: DECIMAL(12,2) NOT NULL DEFAULT 0.00
total_mileage: INT NOT NULL DEFAULT 0
utilization_rate: DECIMAL(5,2) NOT NULL DEFAULT 0.00
average_rating: DECIMAL(3,2) NULL
profitability: DECIMAL(12,2) NOT NULL DEFAULT 0.00
retirement_score: DECIMAL(5,2) NULL
last_calculated_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
```

**vehicle_locations** (junction table)
```
vehicle_id: UUID NOT NULL
location_id: UUID NOT NULL
assigned_at: TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
assigned_by: UUID NOT NULL
PRIMARY KEY (vehicle_id, location_id)
```

### Relationships

**vehicles → suppliers**
- Foreign Key: vehicles.supplier_id → suppliers.id
- Relationship: Many-to-One (many vehicles belong to one supplier)
- On Delete: RESTRICT (cannot delete supplier with vehicles)
- On Update: CASCADE

**vehicles → users (created_by, updated_by)**
- Foreign Key: vehicles.created_by → users.id
- Foreign Key: vehicles.updated_by → users.id
- Relationship: Many-to-One
- On Delete: RESTRICT
- On Update: CASCADE

**vehicle_images → vehicles**
- Foreign Key: vehicle_images.vehicle_id → vehicles.id
- Relationship: Many-to-One (many images belong to one vehicle)
- On Delete: CASCADE (delete images when vehicle deleted)
- On Update: CASCADE

**vehicle_status_history → vehicles**
- Foreign Key: vehicle_status_history.vehicle_id → vehicles.id
- Relationship: Many-to-One
- On Delete: CASCADE
- On Update: CASCADE

**vehicle_status_history → users (changed_by)**
- Foreign Key: vehicle_status_history.changed_by → users.id
- Relationship: Many-to-One
- On Delete: RESTRICT
- On Update: CASCADE

**vehicle_lifecycle_metrics → vehicles**
- Foreign Key: vehicle_lifecycle_metrics.vehicle_id → vehicles.id
- Relationship: One-to-One
- On Delete: CASCADE
- On Update: CASCADE

**vehicle_locations → vehicles**
- Foreign Key: vehicle_locations.vehicle_id → vehicles.id
- Relationship: Many-to-Many (vehicles can be at multiple locations)
- On Delete: CASCADE
- On Update: CASCADE

**vehicle_locations → locations**
- Foreign Key: vehicle_locations.location_id → locations.id
- Relationship: Many-to-Many
- On Delete: CASCADE
- On Update: CASCADE

### Indexes

**Performance Optimization Indexes**

```
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE INDEX idx_vehicles_status ON vehicles(status) WHERE is_deleted = FALSE;
CREATE INDEX idx_vehicles_category ON vehicles(category) WHERE is_deleted = FALSE;
CREATE INDEX idx_vehicles_supplier ON vehicles(supplier_id) WHERE is_deleted = FALSE;
CREATE INDEX idx_vehicles_created_at ON vehicles(created_at);
CREATE INDEX idx_vehicles_search ON vehicles(name, make, model) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX idx_vehicles_license_unique ON vehicles(license_plate) WHERE is_deleted = FALSE;
CREATE UNIQUE INDEX idx_vehicles_vin_unique ON vehicles(vin) WHERE is_deleted = FALSE;

CREATE INDEX idx_vehicle_images_vehicle ON vehicle_images(vehicle_id);
CREATE INDEX idx_vehicle_images_primary ON vehicle_images(vehicle_id, is_primary);

CREATE INDEX idx_vehicle_status_history_vehicle ON vehicle_status_history(vehicle_id, changed_at DESC);
CREATE INDEX idx_vehicle_status_history_date ON vehicle_status_history(changed_at);

CREATE INDEX idx_vehicle_lifecycle_vehicle ON vehicle_lifecycle_metrics(vehicle_id);
CREATE INDEX idx_vehicle_lifecycle_retirement ON vehicle_lifecycle_metrics(retirement_score DESC) WHERE retirement_score IS NOT NULL;

CREATE INDEX idx_vehicle_locations_vehicle ON vehicle_locations(vehicle_id);
CREATE INDEX idx_vehicle_locations_location ON vehicle_locations(location_id);
```

**Full-Text Search Index**
```
CREATE FULLTEXT INDEX idx_vehicles_fulltext ON vehicles(name, make, model, license_plate);
```

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API, Entity Framework Core
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React 18+, Tailwind CSS
- **Authentication**: JWT tokens with .NET Identity
- **File Storage**: Cloud storage (AWS S3, Azure Blob) for vehicle images
- **Caching**: Redis for frequently accessed vehicle data
- **Search**: Elasticsearch for advanced vehicle search (optional)

## Implementation Notes

### Phase 1: Core Vehicle CRUD (Week 1-2)
- Implement database schema and migrations
- Create Entity Framework models and DbContext
- Implement basic CRUD API endpoints
- Build vehicle management UI with forms
- Implement image upload and storage

### Phase 2: Status and Availability (Week 3)
- Implement status management logic
- Build status history tracking
- Create availability calendar integration
- Implement real-time status updates

### Phase 3: Bulk Operations (Week 4)
- Implement bulk operation endpoints
- Build batch processing logic
- Create bulk operation UI
- Implement import/export functionality

### Phase 4: Lifecycle Management (Week 5)
- Implement lifecycle metrics calculation
- Build retirement recommendation engine
- Create lifecycle tracking UI
- Implement disposition workflow

### Testing Considerations
- Unit tests for validation logic
- Integration tests for API endpoints
- Property-based tests for business rules
- Performance tests for bulk operations (100+ vehicles)
- UI tests for critical workflows

### Performance Considerations
- Index all foreign keys and frequently queried fields
- Cache vehicle data with 5-minute TTL
- Use pagination for large result sets (50 vehicles per page)
- Optimize image loading with lazy loading and CDN
- Use database connection pooling
- Implement query result caching for search filters

### Security Considerations
- Validate all user inputs to prevent SQL injection
- Sanitize file uploads to prevent malicious files
- Implement rate limiting on API endpoints
- Use parameterized queries for all database operations
- Encrypt sensitive data (VIN) at rest
- Audit log all administrative actions

### Accessibility Considerations
- Keyboard navigation for all forms and actions
- Screen reader support with ARIA labels
- High contrast mode support
- Focus indicators for interactive elements
- Error messages with clear instructions
- Alternative text for all vehicle images

## Dependencies

**Prerequisite Features:**
- User Management System (authentication and authorization)
- Supplier Management System (supplier accounts)
- Location Management System (pickup/dropoff locations)
- File Storage Service (image uploads)

**Dependent Features:**
- Booking System (requires vehicle availability)
- Search and Discovery (requires vehicle data)
- Pricing Management (uses vehicle pricing)
- Maintenance Scheduling (requires vehicle status)
- Fleet Analytics (uses vehicle metrics)

## Related Requirements

- Requirement 1: Vehicle Inventory Management
- Requirement 2: Vehicle Status and Availability Management
- Requirement 11: Location and Multi-Site Management
- Requirement 17: Bulk Operations
- Requirement 20: Fleet Lifecycle Management

## Source Documents

- docs/05-features/administrative/fleet-management.md (Sections 1, 9)
- docs/06-requirements/functional/fleet-management.md (Requirements 1, 2, 11, 17, 20)
- docs/04-workflows/administrative/fleet-management.md
- docs/03-stakeholders/operational-staff/fleet-managers.md

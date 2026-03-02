# Feature: Vehicle Inventory Management (Backend)

## Overview

Backend services for comprehensive vehicle lifecycle management providing RESTful APIs for vehicle CRUD operations, status management, bulk operations, and lifecycle tracking. Implements business logic for validation, audit trails, and integration with booking and maintenance systems.

## Sprint Category

sprint-mvp

## Feature ID

F-ADMIN-FM-001, F-ADMIN-FM-002, F-ADMIN-FM-005, F-FUNC-FM-001, F-FUNC-FM-002

## User Stories

As a backend service, I want to provide secure, performant APIs for vehicle inventory management, so that frontend applications and integrations can reliably manage fleet data with proper validation and audit trails.

## Backend Specifications

### API Endpoints

**Vehicle CRUD Operations**

`POST /api/admin/vehicles`
- Purpose: Create new vehicle in inventory
- Authentication: Required (Admin, Fleet Manager roles)
- Authorization: Check user has fleet management permissions
- Request Body: CreateVehicleRequest (see Request Schemas)
- Response: 201 Created with vehicle ID and complete vehicle object
- Validation: License plate uniqueness, VIN format, required fields, pricing structure
- Side Effects: Create audit log entry, invalidate vehicle cache, send notifications

`GET /api/admin/vehicles`
- Purpose: List vehicles with filtering, search, and pagination
- Authentication: Required (Admin, Fleet Manager, Supplier roles)
- Authorization: Suppliers see only their vehicles, admins see all
- Query Parameters: page (default 1), limit (default 50, max 100), status, category, location, supplier, search
- Response: 200 OK with paginated vehicle list and metadata
- Performance: Use indexed queries, implement query result caching (5 min TTL)
- Optimization: Eager load related data (supplier, locations) to prevent N+1 queries

`GET /api/admin/vehicles/:id`
- Purpose: Get detailed vehicle information with relationships
- Authentication: Required (Admin, Fleet Manager, Supplier roles)
- Authorization: Suppliers can only access their own vehicles
- Response: 200 OK with complete vehicle object including supplier, locations, images, metrics
- Error: 404 if vehicle not found or user lacks permission
- Performance: Cache vehicle details with 5-minute TTL

`PUT /api/admin/vehicles/:id`
- Purpose: Update vehicle information
- Authentication: Required (Admin, Fleet Manager roles)
- Authorization: Suppliers can only update their own vehicles
- Request Body: UpdateVehicleRequest (partial updates supported)
- Response: 200 OK with updated vehicle object
- Validation: Same as create, plus check VIN immutability
- Side Effects: Update audit trail, invalidate cache, update search index, send notifications
- Concurrency: Use optimistic locking with version field

`DELETE /api/admin/vehicles/:id`
- Purpose: Soft delete vehicle from inventory
- Authentication: Required (Admin role only)
- Authorization: Only admins can delete vehicles
- Validation: Check for active or future bookings, pending maintenance
- Response: 204 No Content if successful, 409 Conflict if bookings exist
- Side Effects: Set is_deleted flag, archive data, remove from search index, audit log
- Error Response: { error: "Cannot delete vehicle", conflicts: [booking IDs] }

**Vehicle Status Management**

`PATCH /api/admin/vehicles/:id/status`
- Purpose: Update vehicle operational status
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: { status, reason, expectedReturnDate }
- Response: 200 OK with updated vehicle
- Validation: Validate status transitions, require reason for maintenance/retired
- Side Effects: Update availability calendar, send notifications, create status history entry
- Business Rules: Cannot set to Available if maintenance scheduled, cannot set to Retired if active bookings

`GET /api/admin/vehicles/:id/status-history`
- Purpose: Get complete status change history
- Authentication: Required (Admin, Fleet Manager roles)
- Query Parameters: startDate, endDate, limit
- Response: 200 OK with array of status changes ordered by date descending
- Performance: Paginated results, default limit 50

**Bulk Operations**

`POST /api/admin/vehicles/bulk`
- Purpose: Perform bulk operations on multiple vehicles
- Authentication: Required (Admin, Fleet Manager roles)
- Request Body: { vehicleIds, action, parameters }
- Supported Actions: updatePricing, changeStatus, assignLocation, updateAvailability
- Response: 200 OK with { totalProcessed, successful, failed, results }
- Processing: Batch process in chunks of 50, use database transactions
- Error Handling: Continue on individual failures, collect all errors
- Timeout: 5 minutes maximum, return partial results if timeout

`POST /api/admin/vehicles/import`
- Purpose: Bulk import vehicles from CSV/Excel file
- Authentication: Required (Admin role only)
- Request: Multipart form data with file upload
- Supported Formats: CSV, XLSX
- Response: 200 OK with { created, updated, failed, errors }
- Validation: Validate all rows before import, provide row-level error details
- Processing: Transaction-based, rollback all on critical errors
- Limits: Maximum 1000 vehicles per import

`GET /api/admin/vehicles/export`
- Purpose: Export vehicle data for external analysis
- Authentication: Required (Admin, Fleet Manager roles)
- Query Parameters: format (csv, excel, json), filters (same as list endpoint)
- Response: 200 OK with file download (Content-Disposition: attachment)
- Include: All vehicle data, current status, performance metrics, location assignments
- Performance: Stream large exports, implement background job for > 1000 vehicles

**Vehicle Lifecycle**

`GET /api/admin/vehicles/:id/lifecycle`
- Purpose: Get lifecycle metrics and retirement recommendations
- Authentication: Required (Admin, Fleet Manager roles)
- Response: 200 OK with lifecycle metrics object
- Calculation: Real-time calculation from bookings, maintenance records, current date
- Metrics: age, mileage, totalRevenue, maintenanceCosts, profitability, utilizationRate, retirementScore, recommendations

`POST /api/admin/vehicles/:id/retire`
- Purpose: Initiate vehicle retirement process
- Authentication: Required (Admin role only)
- Request Body: { reason, dispositionPlan, expectedValue, timeline }
- Response: 200 OK with retirement workflow ID
- Validation: Check no future bookings exist
- Side Effects: Change status to Retired, remove from search, create disposition record, send notifications

### Request Schemas

**CreateVehicleRequest**
```
{
  name: string (required, max 200 chars)
  licensePlate: string (required, unique, max 20 chars, alphanumeric with hyphens)
  year: integer (required, 1900 to current year + 1)
  vin: string (required, exactly 17 chars, alphanumeric excluding I,O,Q)
  category: enum (required: economy, standard, luxury, suv, van, electric, hybrid)
  supplierId: uuid (required, must exist in suppliers table)
  make: string (required, max 100 chars)
  model: string (required, max 100 chars)
  seats: integer (required, 2-15)
  doors: integer (required, 2-5)
  transmissionType: enum (required: automatic, manual, cvt)
  fuelType: enum (required: gasoline, diesel, electric, hybrid, plugin-hybrid)
  mileagePolicy: {
    unlimited: boolean (required)
    dailyLimit: integer (required if unlimited=false, > 0)
    overageFee: decimal (required if unlimited=false, >= 0)
  }
  features: array of strings (optional, max 50 features)
  images: array of { url, isPrimary, order } (required, min 1, max 20)
  pricing: {
    hourly: decimal (optional, >= 0)
    daily: decimal (required, >= 10.00)
    weekly: decimal (optional, >= 0, must be < daily × 7)
    monthly: decimal (optional, >= 0, must be < daily × 30)
  }
  locationIds: array of uuids (required, min 1, all must exist)
  currentMileage: integer (optional, default 0, >= 0)
}
```

**UpdateVehicleRequest**
```
{
  // All fields optional except id
  // Same validation rules as CreateVehicleRequest
  // VIN cannot be changed after creation
  // License plate uniqueness checked if changed
}
```

**UpdateVehicleStatusRequest**
```
{
  status: enum (required: available, unavailable, maintenance, retired)
  reason: string (required for maintenance/retired, max 500 chars)
  expectedReturnDate: datetime (required for maintenance, must be future date)
  dispositionPlan: string (required for retired, max 1000 chars)
}
```

**BulkOperationRequest**
```
{
  vehicleIds: array of uuids (required, min 1, max 100 per request)
  action: enum (required: updatePricing, changeStatus, assignLocation, updateAvailability)
  parameters: object (varies by action)
    // For updatePricing:
    {
      pricingChanges: { hourly, daily, weekly, monthly } (at least one required)
      changeType: enum (absolute, percentageIncrease, percentageDecrease)
    }
    // For changeStatus:
    {
      status: enum (required)
      reason: string (required for maintenance/retired)
    }
    // For assignLocation:
    {
      locationIds: array of uuids (required)
      replaceExisting: boolean (default false)
    }
    // For updateAvailability:
    {
      startDate: date (required)
      endDate: date (required)
      available: boolean (required)
    }
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
  supplier: { id: uuid, name: string, email: string }
  make: string
  model: string
  seats: integer
  doors: integer
  transmissionType: string
  fuelType: string
  mileagePolicy: { unlimited: boolean, dailyLimit: integer, overageFee: decimal }
  features: array of strings
  images: array of { id: uuid, url: string, thumbnailUrl: string, isPrimary: boolean, order: integer }
  pricing: { hourly: decimal, daily: decimal, weekly: decimal, monthly: decimal }
  locations: array of { id: uuid, name: string, address: string, coordinates: { lat, lng } }
  status: string
  currentMileage: integer
  createdAt: datetime (ISO 8601)
  updatedAt: datetime (ISO 8601)
  createdBy: { id: uuid, name: string }
  updatedBy: { id: uuid, name: string }
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
    hasNext: boolean
    hasPrevious: boolean
  }
  filters: {
    status: string
    category: string
    location: string
    supplier: string
    search: string
  }
}
```

**StatusHistoryResponse**
```
{
  history: array of {
    id: uuid
    oldStatus: string
    newStatus: string
    reason: string
    expectedReturnDate: datetime
    changedBy: { id: uuid, name: string }
    changedAt: datetime
  }
  pagination: { page, limit, total }
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
    licensePlate: string
    success: boolean
    error: string (if failed)
    errorCode: string (if failed)
  }
  executedAt: datetime
  executedBy: { id: uuid, name: string }
}
```

**LifecycleMetricsResponse**
```
{
  vehicleId: uuid
  acquisitionDate: date
  acquisitionCost: decimal
  age: { years: integer, months: integer }
  totalBookings: integer
  totalRevenue: decimal
  totalMaintenanceCost: decimal
  totalMileage: integer
  utilizationRate: decimal (percentage)
  averageRating: decimal
  profitability: decimal
  retirementScore: decimal (0-100, higher = should retire sooner)
  recommendations: array of strings
  lastCalculatedAt: datetime
}
```

### Business Logic

**Vehicle Creation Logic**
1. Validate all required fields present and correctly formatted
2. Check license plate uniqueness (case-insensitive, ignore deleted vehicles)
3. Check VIN uniqueness and validate format (17 chars, no I/O/Q)
4. Validate supplier exists and is active
5. Validate all location IDs exist
6. Validate pricing structure (longer periods have lower per-day rates)
7. Validate at least one image provided
8. Begin database transaction
9. Insert vehicle record
10. Insert vehicle images with ordering
11. Insert vehicle-location associations
12. Create initial status history entry
13. Initialize lifecycle metrics record
14. Commit transaction
15. Invalidate relevant caches
16. Update search index
17. Create audit log entry
18. Send notification to fleet managers
19. Return created vehicle with all relationships

**Vehicle Update Logic**
1. Validate vehicle exists and user has permission
2. Load current vehicle state for comparison
3. Validate changed fields (same rules as creation)
4. Check license plate uniqueness if changed (exclude current vehicle)
5. Prevent VIN changes (immutable after creation)
6. Begin database transaction
7. Update vehicle record with changed fields
8. Update updated_at timestamp and updated_by user
9. If images changed: Update vehicle_images table
10. If locations changed: Update vehicle_locations junction table
11. Create audit trail entries for all changes
12. Commit transaction
13. Invalidate vehicle cache
14. Update search index
15. Send notifications for significant changes
16. Return updated vehicle

**Vehicle Deletion Logic**
1. Validate vehicle exists and user is Admin
2. Check for active bookings (status IN ('confirmed', 'in_progress'))
3. Check for future bookings (pickup_date > current_date)
4. Check for pending maintenance appointments
5. If conflicts exist: Return 409 Conflict with detailed conflict list
6. If no conflicts: Begin transaction
7. Set is_deleted = TRUE (soft delete)
8. Set status = 'retired'
9. Create status history entry
10. Create audit log entry
11. Commit transaction
12. Remove from search index
13. Invalidate caches
14. Archive vehicle data to cold storage
15. Send notification to stakeholders
16. Return 204 No Content

**Status Management Logic**
1. Validate vehicle exists and user has permission
2. Validate status transition is allowed (business rules)
3. If changing to Maintenance:
   - Require reason and expected return date
   - Block rental calendar for maintenance period
   - Check no bookings conflict with maintenance window
4. If changing to Retired:
   - Require reason and disposition plan
   - Check no future bookings exist
   - Remove from customer search results
5. If changing to Available:
   - Verify no maintenance scheduled
   - Verify vehicle passed recent inspection
6. Begin transaction
7. Update vehicle status
8. Create status history entry
9. Update availability calendar if needed
10. Commit transaction
11. Invalidate caches
12. Send notifications to affected parties
13. Return updated vehicle

**Bulk Operations Logic**
1. Validate all vehicle IDs exist
2. Check user has permission for all vehicles
3. Validate action parameters
4. Split vehicle IDs into batches of 50
5. For each batch:
   - Begin transaction
   - Process each vehicle in batch
   - Collect successes and failures
   - Commit transaction if all successful, rollback if critical error
6. Aggregate results across all batches
7. Create audit log entries for all changes
8. Invalidate affected caches
9. Update search index for modified vehicles
10. Send completion notification with summary
11. Return detailed results

**Lifecycle Metrics Calculation**
1. Calculate vehicle age from year and current date
2. Query total bookings count for vehicle
3. Sum revenue from all completed bookings
4. Sum maintenance costs from service records
5. Calculate depreciation based on age and category
6. Calculate profitability: revenue - (maintenance + depreciation + insurance)
7. Calculate utilization rate: booked days / available days
8. Get average customer rating from reviews
9. Calculate retirement score based on:
   - Age weight: 30% (higher age = higher score)
   - Mileage weight: 25% (higher mileage = higher score)
   - Maintenance cost weight: 25% (higher cost = higher score)
   - Profitability weight: 20% (lower profit = higher score)
10. Generate recommendations based on score:
    - 0-25: Keep, vehicle performing well
    - 26-50: Monitor, watch for declining performance
    - 51-75: Consider retirement within 6-12 months
    - 76-100: Retire immediately, vehicle unprofitable
11. Cache calculated metrics for 1 hour
12. Return metrics object

### Authentication Requirements

**JWT Token Validation**
- All endpoints require valid JWT token in Authorization header
- Token must not be expired
- Token must contain valid user ID and roles
- Implement token refresh mechanism for long sessions

**Role-Based Authorization**
- Admin: Full access to all operations
- Fleet Manager: Create, read, update vehicles; cannot delete
- Supplier: Read and update only their own vehicles (filtered by supplier_id)
- Maintenance Coordinator: Read-only access to vehicle data
- Customer Support: Read-only access to vehicle data

**Permission Checks**
- Implement middleware for role-based access control
- Check permissions before executing business logic
- Return 403 Forbidden if user lacks required permissions
- Audit log all permission denials

**Rate Limiting**
- 100 requests per minute per user for standard endpoints
- 10 requests per minute for bulk operations
- 5 requests per minute for import/export operations
- Return 429 Too Many Requests with Retry-After header

### Validation Rules

**License Plate Validation**
- Required, non-empty string
- Maximum 20 characters
- Alphanumeric with hyphens allowed: ^[A-Z0-9-]+$
- Case-insensitive uniqueness check across non-deleted vehicles
- Trim whitespace before validation

**VIN Validation**
- Required, non-empty string
- Exactly 17 characters
- Alphanumeric excluding I, O, Q: ^[A-HJ-NPR-Z0-9]{17}$
- Uniqueness check across all vehicles (including deleted)
- Immutable after creation (reject updates to VIN field)

**Year Validation**
- Required integer
- Minimum: 1900
- Maximum: Current year + 1 (allow next model year)
- Cannot be future year beyond next model year

**Pricing Validation**
- Daily rate required, minimum $10.00
- All rates must be positive decimals with exactly 2 decimal places
- If weekly rate provided: weekly < daily × 7
- If monthly rate provided: monthly < daily × 30
- Hourly rate optional, if provided: hourly < daily

**Image Validation**
- Minimum 1 image required
- Maximum 20 images per vehicle
- Each image must have valid URL
- Exactly one image must be marked as primary
- Display order must be unique per vehicle (0-19)

**Mileage Policy Validation**
- If unlimited = false: dailyLimit and overageFee required
- If unlimited = true: dailyLimit and overageFee must be null
- dailyLimit must be positive integer
- overageFee must be non-negative decimal

### Error Handling

**Validation Errors (400 Bad Request)**
```
{
  error: "Validation failed",
  validationErrors: [
    { field: "licensePlate", message: "License plate already exists" },
    { field: "vin", message: "VIN must be exactly 17 characters" }
  ]
}
```

**Not Found Errors (404 Not Found)**
```
{
  error: "Vehicle not found",
  vehicleId: "uuid"
}
```

**Conflict Errors (409 Conflict)**
```
{
  error: "Cannot delete vehicle with active bookings",
  conflicts: [
    { bookingId: "uuid", pickupDate: "date", returnDate: "date" }
  ]
}
```

**Authorization Errors (403 Forbidden)**
```
{
  error: "Insufficient permissions",
  requiredRole: "Admin",
  userRole: "FleetManager"
}
```

## Technology Stack

- **Backend Framework**: ASP.NET Core 8.0 Web API
- **Language**: C# 12
- **ORM**: Entity Framework Core 8.0
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Authentication**: ASP.NET Core Identity with JWT Bearer tokens
- **Caching**: Redis for distributed caching
- **File Storage**: AWS S3 or Azure Blob Storage for images
- **Search**: Elasticsearch for advanced search (optional)
- **Logging**: Serilog with structured logging
- **API Documentation**: Swagger/OpenAPI 3.0

## Implementation Notes

### Entity Framework Models

Create C# entity classes for:
- Vehicle (with navigation properties)
- VehicleImage
- VehicleStatusHistory
- VehicleLifecycleMetrics
- VehicleLocation (junction entity)

Configure relationships using Fluent API in DbContext.

### Service Layer Architecture

Implement service classes:
- VehicleService: Core CRUD operations
- VehicleStatusService: Status management logic
- VehicleBulkService: Bulk operations processing
- VehicleLifecycleService: Lifecycle calculations
- VehicleValidationService: Centralized validation logic

### Repository Pattern

Implement repositories for data access:
- VehicleRepository: Database queries and commands
- Use async/await for all database operations
- Implement specification pattern for complex queries

### Caching Strategy

- Cache individual vehicles: Key = "vehicle:{id}", TTL = 5 minutes
- Cache vehicle lists: Key = "vehicles:list:{hash of filters}", TTL = 2 minutes
- Invalidate cache on create, update, delete, status change
- Use cache-aside pattern with Redis

### Background Jobs

Implement background jobs for:
- Lifecycle metrics calculation (daily at 2 AM)
- Retirement score updates (weekly)
- Large export operations (> 1000 vehicles)
- Bulk import processing

### Performance Optimization

- Use compiled queries for frequently executed queries
- Implement database connection pooling
- Use AsNoTracking() for read-only queries
- Batch database operations where possible
- Implement pagination for all list endpoints
- Use projection to select only needed fields

### Security Implementation

- Validate all inputs using Data Annotations and FluentValidation
- Use parameterized queries (EF Core handles this)
- Implement CORS policy for frontend origins only
- Add security headers (HSTS, X-Content-Type-Options, etc.)
- Encrypt sensitive fields (VIN) using AES-256
- Implement audit logging for all mutations

## Dependencies

**Required Services:**
- User Management Service (authentication, authorization)
- Supplier Management Service (supplier validation)
- Location Management Service (location validation)
- File Storage Service (image uploads)
- Notification Service (status change alerts)

**Database Dependencies:**
- suppliers table must exist
- users table must exist
- locations table must exist

## Related Requirements

- Requirement 1: Vehicle Inventory Management
- Requirement 2: Vehicle Status and Availability Management
- Requirement 11: Location and Multi-Site Management
- Requirement 17: Bulk Operations
- Requirement 20: Fleet Lifecycle Management

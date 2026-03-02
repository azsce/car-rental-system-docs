# Feature: Supplier Data Isolation

## Overview

Supplier Data Isolation ensures strict data segregation between different suppliers on the car rental platform. This feature implements comprehensive ownership verification and query filtering to guarantee that suppliers can only access their own vehicles, locations, bookings, and business data. The system prevents cross-supplier data access through database-level filtering, API endpoint protection, and information disclosure prevention, enabling a secure multi-supplier marketplace.

## Sprint Category

sprint-01

## Feature ID

F-SEC-AUTHZ-003

## User Stories

### As a supplier
I want to be confident that my business data is protected from competitors, so that I can operate on the platform without fear of data leakage.

### As a platform operator
I want to enforce strict data isolation between suppliers, so that I can build trust and enable a competitive multi-supplier marketplace.

### As a security administrator
I want all cross-supplier access attempts to be blocked and logged, so that I can detect and prevent unauthorized data access.

### As a compliance officer
I want supplier data isolation to meet business confidentiality requirements, so that the platform complies with data protection regulations.

## Frontend Specifications

### Pages

**Supplier Dashboard** (`/supplier/dashboard`)
- Displays only supplier's own metrics and data
- No visibility into other suppliers' information
- Clear indication of data scope (e.g., "Your Fleet", "Your Bookings")

**Vehicle Management** (`/supplier/vehicles`)
- Lists only vehicles owned by the supplier
- Cannot view or search for other suppliers' vehicles
- Vehicle IDs from other suppliers return 404 Not Found

**Booking Management** (`/supplier/bookings`)
- Shows only bookings for supplier's vehicles
- Cannot access bookings for other suppliers' vehicles
- Booking IDs from other suppliers return 404 Not Found

**Location Management** (`/supplier/locations`)
- Displays only supplier's rental locations
- Cannot view or modify other suppliers' locations
- Location IDs from other suppliers return 404 Not Found

### UI Components

**Supplier Scope Indicator Component**
- Visual indicator showing data is scoped to supplier
- Displays supplier name and ID
- Shows data ownership context (e.g., "Viewing: Your Vehicles")
- Prevents confusion about data scope

**Filtered Data Table Component**
- Automatically filters data by supplier ownership
- Displays only supplier's own records
- Includes supplier-scoped search and filtering
- Shows record counts scoped to supplier

**Access Denied Component**
- Displays 404 Not Found for unauthorized resource access
- Does not reveal existence of resources owned by other suppliers
- Provides helpful message without information disclosure
- Redirects to supplier dashboard

### User Flows

**Supplier Viewing Own Data Flow**:
1. Supplier logs in with supplier role
2. System loads supplier dashboard with supplier_id context
3. Supplier navigates to vehicles page
4. System queries vehicles WHERE supplier_id = current_supplier_id
5. System displays only supplier's vehicles
6. Supplier can view, edit, delete own vehicles
7. All operations scoped to supplier's data

**Supplier Attempting Cross-Supplier Access Flow**:
1. Supplier attempts to access vehicle ID belonging to another supplier
2. System receives request with vehicle_id parameter
3. System queries vehicle WHERE id = vehicle_id AND supplier_id = current_supplier_id
4. Query returns no results (vehicle not owned by supplier)
5. System returns 404 Not Found (not 403 Forbidden)
6. System logs unauthorized access attempt
7. Supplier sees "Vehicle not found" message
8. Supplier cannot determine if vehicle exists

**Supplier Searching Vehicles Flow**:
1. Supplier enters search query in vehicle management
2. System constructs search query with supplier_id filter
3. Query: SELECT * FROM vehicles WHERE supplier_id = current_supplier_id AND name LIKE '%query%'
4. System returns only matching vehicles owned by supplier
5. Supplier sees filtered results
6. No indication of vehicles owned by other suppliers

### Data Requirements

**From Backend APIs**:
- Supplier ID from authenticated session
- Supplier-scoped vehicle list
- Supplier-scoped booking list
- Supplier-scoped location list
- Supplier-scoped analytics and metrics

**To Backend APIs**:
- Supplier ID in all requests (from JWT token)
- Resource IDs for ownership verification
- Search queries with automatic supplier filtering

## Backend Specifications

### API Endpoints

**GET /api/supplier/vehicles**
- Purpose: Retrieve supplier's vehicles
- Authentication: Required (JWT token with Supplier role)
- Authorization: Automatically filtered by supplier_id from token
- Response: Array of vehicles owned by supplier
- Status codes: 200 (success), 401 (unauthorized)

**GET /api/supplier/vehicles/:vehicleId**
- Purpose: Retrieve specific vehicle details
- Authentication: Required (JWT token with Supplier role)
- Authorization: Verify vehicle owned by supplier
- Response: Vehicle details if owned by supplier
- Status codes: 200 (success), 401 (unauthorized), 404 (not found or not owned)

**PUT /api/supplier/vehicles/:vehicleId**
- Purpose: Update vehicle information
- Authentication: Required (JWT token with Supplier role)
- Authorization: Verify vehicle owned by supplier before update
- Request body: Vehicle update data
- Response: Updated vehicle details
- Status codes: 200 (success), 401 (unauthorized), 404 (not found or not owned), 400 (validation error)

**DELETE /api/supplier/vehicles/:vehicleId**
- Purpose: Delete vehicle from inventory
- Authentication: Required (JWT token with Supplier role)
- Authorization: Verify vehicle owned by supplier before deletion
- Response: Deletion confirmation
- Status codes: 204 (no content), 401 (unauthorized), 404 (not found or not owned)

**GET /api/supplier/bookings**
- Purpose: Retrieve bookings for supplier's vehicles
- Authentication: Required (JWT token with Supplier role)
- Authorization: Automatically filtered by supplier_id
- Query parameters: status, date_range, vehicle_id (scoped to supplier)
- Response: Array of bookings for supplier's vehicles
- Status codes: 200 (success), 401 (unauthorized)

**GET /api/supplier/locations**
- Purpose: Retrieve supplier's rental locations
- Authentication: Required (JWT token with Supplier role)
- Authorization: Automatically filtered by supplier_id
- Response: Array of locations owned by supplier
- Status codes: 200 (success), 401 (unauthorized)

**GET /api/supplier/analytics**
- Purpose: Retrieve supplier-specific analytics
- Authentication: Required (JWT token with Supplier role)
- Authorization: Automatically scoped to supplier_id
- Response: Analytics data for supplier's operations
- Status codes: 200 (success), 401 (unauthorized)

### Request Schemas

**Vehicle Update Request**:
```
{
  "name": "string (optional)",
  "description": "string (optional)",
  "category": "string (optional)",
  "pricePerDay": "number (optional)",
  "availability": "boolean (optional)",
  "locationId": "number (optional, must be owned by supplier)"
}
```

### Response Schemas

**Supplier Vehicles Response**:
```
{
  "vehicles": [
    {
      "id": "number",
      "supplierId": "number (always matches current supplier)",
      "name": "string",
      "description": "string",
      "category": "string",
      "pricePerDay": "number",
      "availability": "boolean",
      "locationId": "number",
      "createdAt": "string (ISO 8601)",
      "updatedAt": "string (ISO 8601)"
    }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number"
}
```

**Supplier Bookings Response**:
```
{
  "bookings": [
    {
      "id": "number",
      "vehicleId": "number (vehicle owned by supplier)",
      "supplierId": "number (always matches current supplier)",
      "customerId": "number",
      "customerName": "string",
      "startDate": "string (ISO 8601)",
      "endDate": "string (ISO 8601)",
      "status": "string (pending, confirmed, active, completed, cancelled)",
      "totalPrice": "number",
      "createdAt": "string (ISO 8601)"
    }
  ],
  "total": "number",
  "page": "number",
  "pageSize": "number"
}
```

**Error Response (404 Not Found)**:
```
{
  "error": "Resource not found",
  "message": "The requested resource does not exist",
  "statusCode": 404
}
```

### Business Logic

**Ownership Verification Logic**:
```
function verifyOwnership(resourceType, resourceId, supplierId) {
  // 1. Query resource from database
  const resource = database.query(
    `SELECT * FROM ${resourceType} WHERE id = ? AND supplier_id = ?`,
    [resourceId, supplierId]
  );
  
  // 2. If resource not found or not owned, return false
  if (!resource) {
    return false;
  }
  
  // 3. Resource exists and is owned by supplier
  return true;
}
```

**Query Filtering Logic**:
```
function buildSupplierQuery(baseQuery, supplierId) {
  // 1. Parse base query
  const query = parseQuery(baseQuery);
  
  // 2. Add supplier_id filter to WHERE clause
  query.where.push(`supplier_id = ${supplierId}`);
  
  // 3. Ensure supplier_id filter cannot be overridden
  query.immutableFilters.push('supplier_id');
  
  // 4. Return modified query
  return query.build();
}
```

**Cross-Supplier Access Prevention**:
- All supplier API endpoints automatically filter by supplier_id from JWT token
- Resource ownership verified before any read, update, or delete operation
- Unauthorized access returns 404 Not Found (not 403 Forbidden) to prevent information disclosure
- All cross-supplier access attempts logged for security monitoring
- Database queries use parameterized queries to prevent SQL injection

**Information Disclosure Prevention**:
- Return 404 Not Found instead of 403 Forbidden for unauthorized access
- Do not reveal existence of resources owned by other suppliers
- Error messages do not contain supplier-specific information
- API responses do not include data from other suppliers
- Search results do not show vehicles from other suppliers

### Authentication Requirements

**Required Authentication**:
- Valid JWT token in Authorization header
- Token must contain supplier_id claim
- Token must have Supplier role
- Supplier account must be active and verified

**Authorization Checks**:
- Extract supplier_id from JWT token
- Verify supplier_id matches resource owner
- Automatically filter all queries by supplier_id
- Log all authorization failures

## Database Specifications

### Schema Changes

**vehicles table** (modifications):
- Ensure `supplier_id` column exists: INT, NOT NULL, foreign key to suppliers.id
- Add index on `supplier_id` for efficient filtering
- Add composite index on `(supplier_id, id)` for ownership checks

**bookings table** (modifications):
- Ensure `supplier_id` column exists: INT, NOT NULL, foreign key to suppliers.id
- Add index on `supplier_id` for efficient filtering
- Add composite index on `(supplier_id, vehicle_id)` for booking queries

**locations table** (modifications):
- Ensure `supplier_id` column exists: INT, NOT NULL, foreign key to suppliers.id
- Add index on `supplier_id` for efficient filtering

**access_log table** (new):
- `id` column: INT, primary key, auto-increment
- `supplier_id` column: INT, foreign key to suppliers.id
- `resource_type` column: VARCHAR(50), type of resource accessed
- `resource_id` column: INT, ID of resource accessed
- `action` column: VARCHAR(50), action attempted (read, update, delete)
- `authorized` column: BOOLEAN, whether access was authorized
- `ip_address` column: VARCHAR(45), IP address of request
- `user_agent` column: TEXT, user agent string
- `created_at` column: TIMESTAMP, when access occurred

### Table Definitions

**access_log table**:
```sql
CREATE TABLE access_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT NOT NULL,
  resource_type VARCHAR(50) NOT NULL,
  resource_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  authorized BOOLEAN NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
  INDEX idx_supplier_id (supplier_id),
  INDEX idx_created_at (created_at),
  INDEX idx_authorized (authorized)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**vehicles ↔ suppliers**: Many-to-One
- Many vehicles belong to one supplier
- Foreign key: vehicles.supplier_id → suppliers.id
- On Delete: CASCADE (delete vehicles when supplier deleted)

**bookings ↔ suppliers**: Many-to-One
- Many bookings belong to one supplier (through vehicle)
- Foreign key: bookings.supplier_id → suppliers.id
- On Delete: RESTRICT (cannot delete supplier with active bookings)

**locations ↔ suppliers**: Many-to-One
- Many locations belong to one supplier
- Foreign key: locations.supplier_id → suppliers.id
- On Delete: CASCADE (delete locations when supplier deleted)

**access_log ↔ suppliers**: Many-to-One
- Many access log entries for one supplier
- Foreign key: access_log.supplier_id → suppliers.id
- On Delete: CASCADE (delete logs when supplier deleted)

### Indexes

**vehicles table**:
- Index on `supplier_id` for filtering vehicles by supplier
- Composite index on `(supplier_id, id)` for ownership verification
- Composite index on `(supplier_id, availability)` for available vehicle queries

**bookings table**:
- Index on `supplier_id` for filtering bookings by supplier
- Composite index on `(supplier_id, vehicle_id)` for vehicle booking queries
- Composite index on `(supplier_id, status)` for status-based queries

**locations table**:
- Index on `supplier_id` for filtering locations by supplier

**access_log table**:
- Index on `supplier_id` for supplier-specific log queries
- Index on `created_at` for temporal queries
- Index on `authorized` for filtering unauthorized access attempts

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React 18+
- **Authentication**: JWT tokens with supplier_id claim
- **Authorization**: Middleware-based ownership verification

## Implementation Notes

### Security Considerations

**Defense in Depth**:
- Supplier isolation enforced at multiple layers (API, business logic, database)
- Never rely solely on client-side filtering
- Always verify ownership on server side
- Use parameterized queries to prevent SQL injection

**Information Disclosure Prevention**:
- Return 404 Not Found instead of 403 Forbidden for unauthorized access
- Do not reveal existence of resources owned by other suppliers
- Sanitize error messages to prevent information leakage
- Do not include supplier-specific data in error responses

**Audit Trail**:
- Log all cross-supplier access attempts
- Log all ownership verification failures
- Retain access logs for security analysis
- Monitor for patterns of unauthorized access attempts

### Performance Optimization

**Database Optimization**:
- Index all supplier_id foreign keys
- Use composite indexes for common query patterns
- Cache supplier-scoped queries when appropriate
- Use database views for complex supplier-scoped queries

**Query Optimization**:
- Always include supplier_id in WHERE clause
- Use covering indexes for supplier-scoped queries
- Avoid N+1 queries with eager loading
- Use pagination for large result sets

### Error Handling

**Ownership Verification Errors**:
- 404 Not Found: Resource does not exist or not owned by supplier
- 401 Unauthorized: Supplier not authenticated
- 400 Bad Request: Invalid resource ID format
- Log all ownership verification failures

### Testing Strategy

**Unit Tests**:
- Test ownership verification logic with various scenarios
- Test query filtering with different supplier IDs
- Test error handling for unauthorized access
- Test information disclosure prevention

**Integration Tests**:
- Test end-to-end supplier data isolation
- Test cross-supplier access prevention
- Test audit logging functionality
- Test performance with large datasets

### Compliance

**Data Protection**:
- Supplier data isolation meets business confidentiality requirements
- Access logging provides audit trail for compliance
- Information disclosure prevention protects competitive information

**Principle of Least Privilege**:
- Suppliers have access only to their own data
- No visibility into competitors' business information
- Admin override requires separate authorization

## Related Requirements

- REQ-SEC-6: Role-Based Access Control (RBAC)
- REQ-SEC-7: Data Protection and Privacy
- REQ-SEC-8: Audit Logging and Monitoring

## Related Features

- F-SEC-AUTHZ-001: Role-Based Access Control (RBAC)
- F-SEC-AUTHZ-002: Application-Level Separation
- F-SEC-AUTHZ-004: User Data Privacy Controls
- F-SEC-AUTHZ-005: Admin Override with Audit Trail

## Success Metrics

- Zero cross-supplier data access incidents
- Ownership verification response time < 10ms
- 100% of supplier queries automatically filtered
- Audit log completeness > 99.99%
- Supplier confidence in data protection > 4.5/5.0

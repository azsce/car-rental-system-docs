# Feature: Role-Based Access Control (RBAC)

## Overview

Role-Based Access Control (RBAC) provides a comprehensive authorization system that enforces role-specific permissions across the car rental platform. This feature ensures that users can only access features and data appropriate to their assigned role (Customer, Supplier, Admin, Corporate Admin), protecting sensitive information and maintaining system security. The system implements fine-grained permission checks at the UI level, API level, and data access level.

The system also enforces application-level separation, ensuring that admin/supplier users can only access the admin application, while customer users can only access the customer-facing application. This architectural separation provides clear security boundaries and prevents unauthorized cross-application access.

## Sprint Category

sprint-mvp

## Feature ID

F-SEC-AUTHZ-001, F-SEC-AUTHZ-002, F-FUNC-UM-006, F-FUNC-UM-007, F-FUNC-UM-008

## User Stories

### As a platform operator
I want to enforce role-based access control, so that users can only access features and data appropriate to their role and sensitive information is protected.

### As a customer user
I want to access only my own bookings and profile information, so that my privacy is protected and I cannot see other users' data.

### As a supplier user
I want to manage only my own vehicles and bookings, so that I cannot access competitors' business data.

### As an admin user
I want full access to platform management features, so that I can effectively administer the system while maintaining audit trails.

### As a corporate admin
I want to manage users and policies within my organization only, so that I can control my company's rental operations without accessing other organizations' data.

### As a system architect
I want to enforce application-level separation between admin and customer interfaces, so that users cannot accidentally or maliciously access the wrong application.

### As a security administrator
I want all unauthorized access attempts logged and rejected, so that I can monitor security threats and maintain audit compliance.

## Frontend Specifications

### Pages

**Admin Dashboard** (`/admin/dashboard`)
- Accessible only to Admin and Corporate Admin roles
- System-wide metrics and analytics
- User management interface
- Supplier management interface
- System configuration tools

**Supplier Dashboard** (`/supplier/dashboard`)
- Accessible only to Supplier role
- Supplier-specific metrics and analytics
- Vehicle management interface
- Booking management for supplier's vehicles
- Location management

**Customer Dashboard** (`/dashboard`)
- Accessible to Customer role (default)
- Personal booking history
- Profile management
- Payment methods
- Saved preferences

**Corporate Admin Dashboard** (`/corporate/dashboard`)
- Accessible only to Corporate Admin role
- Organization-specific metrics
- Corporate user management
- Policy management
- Billing and reporting

### UI Components

**Role-Based Navigation Component**
- Dynamically renders navigation items based on user role
- Hides/shows menu items according to permissions
- Displays role badge in user profile dropdown
- Provides role-specific quick actions

**Permission Guard Component**
- Wraps protected UI elements
- Shows/hides content based on user permissions
- Displays "Access Denied" message for unauthorized access
- Redirects to appropriate page if permission denied

**Role Indicator Badge Component**
- Visual indicator of user's current role
- Color-coded badges (Customer: blue, Supplier: green, Admin: red, Corporate Admin: purple)
- Tooltip with role description
- Displayed in header and profile sections

**Access Denied Page Component**
- Friendly error message for unauthorized access
- Explanation of required permissions
- Link to appropriate dashboard
- Contact support option

### User Flows

**Customer User Flow**:
1. User logs in with Customer role
2. System loads Customer dashboard
3. Navigation shows: Dashboard, Search Vehicles, My Bookings, Profile, Support
4. User attempts to access /admin/dashboard
5. System checks permissions
6. System denies access (403 Forbidden)
7. System redirects to Access Denied page
8. User returns to Customer dashboard

**Supplier User Flow**:
1. User logs in with Supplier role
2. System loads Supplier dashboard
3. Navigation shows: Dashboard, My Vehicles, Bookings, Locations, Analytics, Profile
4. User can view only their own vehicles and bookings
5. User attempts to view another supplier's vehicle
6. System returns 404 Not Found (to avoid information disclosure)
7. User remains on current page with error message

**Admin User Flow**:
1. User logs in with Admin role
2. System loads Admin dashboard
3. Navigation shows: Dashboard, Users, Suppliers, Vehicles, Bookings, Analytics, Settings
4. User can access all platform features
5. All admin actions are logged for audit
6. User can view any user, supplier, or booking data
7. System logs all data access with timestamp and reason

**Corporate Admin User Flow**:
1. User logs in with Corporate Admin role
2. System loads Corporate Admin dashboard
3. Navigation shows: Dashboard, Corporate Users, Policies, Bookings, Billing, Reports
4. User can manage only users within their organization
5. User attempts to view another organization's data
6. System denies access (403 Forbidden)
7. User can configure corporate policies and approval workflows

### Data Requirements

**From Backend APIs**:
- User role and permissions
- Role-specific navigation items
- Feature flags for role-based features
- Organization ID (for Corporate Admin)
- Permission matrix for current user

**To Backend APIs**:
- User ID and session token for authentication
- Requested resource ID for authorization check
- Action being performed (read, write, delete)

## Backend Specifications

### API Endpoints

**GET /api/users/me/permissions**
- Purpose: Retrieve current user's permissions
- Authentication: Required (JWT token)
- Response: Permission matrix with allowed actions
- Status codes: 200 (success), 401 (unauthorized)

**GET /api/users/me/role**
- Purpose: Retrieve current user's role information
- Authentication: Required (JWT token)
- Response: Role details with description and capabilities
- Status codes: 200 (success), 401 (unauthorized)

**POST /api/admin/users/:userId/role**
- Purpose: Assign or change user role (Admin only)
- Authentication: Required (JWT token with Admin role)
- Request body: New role assignment
- Response: Updated user role information
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden), 404 (not found)

**GET /api/admin/roles**
- Purpose: List all available roles and their permissions (Admin only)
- Authentication: Required (JWT token with Admin role)
- Response: Array of role definitions
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden)

### Request Schemas

**Assign Role Request**:
```
{
  "roleId": "number (required, valid role ID)",
  "reason": "string (optional, reason for role change)",
  "effectiveDate": "string (optional, ISO 8601 date when role becomes active)"
}
```

### Response Schemas

**User Permissions Response**:
```
{
  "userId": "number",
  "role": "string (CUSTOMER, SUPPLIER, ADMIN, CORPORATE_ADMIN)",
  "permissions": {
    "bookings": {
      "create": "boolean",
      "read": "string (own, organization, all)",
      "update": "string (own, organization, all)",
      "delete": "string (own, organization, all)"
    },
    "vehicles": {
      "create": "boolean",
      "read": "string (public, own, all)",
      "update": "string (own, all)",
      "delete": "string (own, all)"
    },
    "users": {
      "create": "boolean",
      "read": "string (own, organization, all)",
      "update": "string (own, organization, all)",
      "delete": "string (none, organization, all)"
    },
    "suppliers": {
      "create": "boolean",
      "read": "string (public, own, all)",
      "update": "string (own, all)",
      "delete": "string (none, all)"
    },
    "analytics": {
      "view": "string (own, organization, all)"
    },
    "settings": {
      "view": "boolean",
      "update": "boolean"
    }
  },
  "organizationId": "number (null for non-corporate users)"
}
```

**Role Information Response**:
```
{
  "roleId": "number",
  "roleName": "string",
  "roleCode": "string (CUSTOMER, SUPPLIER, ADMIN, CORPORATE_ADMIN)",
  "description": "string",
  "capabilities": [
    "string (list of high-level capabilities)"
  ],
  "assignedAt": "string (ISO 8601 timestamp)",
  "assignedBy": "number (user ID who assigned the role)"
}
```

**Available Roles Response**:
```
{
  "roles": [
    {
      "roleId": "number",
      "roleName": "string",
      "roleCode": "string",
      "description": "string",
      "isActive": "boolean",
      "permissions": {
        "resource": {
          "action": "scope"
        }
      }
    }
  ]
}
```

### Business Logic

**Role Hierarchy**:
1. **Customer** (Default Role):
   - Access own profile and bookings
   - Search and book vehicles
   - Manage payment methods
   - View public supplier information
   - Cannot access admin or supplier features

2. **Supplier**:
   - All Customer permissions
   - Manage own vehicles and locations
   - View bookings for own vehicles
   - Access supplier analytics
   - Cannot access other suppliers' data
   - Cannot access admin features

3. **Corporate Admin**:
   - All Customer permissions
   - Manage users within organization
   - Configure corporate policies
   - View organization-wide analytics
   - Approve/reject bookings within organization
   - Cannot access other organizations' data
   - Cannot access platform admin features

4. **Admin** (Highest Privilege):
   - Full access to all platform features
   - Manage all users, suppliers, and bookings
   - Configure system settings
   - View all analytics and reports
   - Audit trail for all admin actions
   - Cannot be locked out of system

**Permission Check Logic**:
```
function checkPermission(user, resource, action, resourceOwnerId) {
  // 1. Check if user is authenticated
  if (!user.isAuthenticated) return false;
  
  // 2. Check if user account is active
  if (user.isLocked || user.isDeleted) return false;
  
  // 3. Get user's role permissions
  const permissions = getRolePermissions(user.roleId);
  
  // 4. Check if action is allowed for resource
  if (!permissions[resource]?.[action]) return false;
  
  // 5. Check scope (own, organization, all)
  const scope = permissions[resource][action];
  
  if (scope === true || scope === 'all') return true;
  if (scope === 'own' && user.id === resourceOwnerId) return true;
  if (scope === 'organization' && user.organizationId === resourceOrganizationId) return true;
  
  // 6. Default deny
  return false;
}
```

**Role Assignment Logic**:
- Only Admin users can assign roles
- Role changes are logged in audit trail
- Role changes invalidate existing sessions (force re-login)
- Email notification sent to user when role changes
- Previous role is stored in role history

**Authorization Middleware**:
- Every API request checks user authentication
- Every API request checks user authorization for requested resource
- Return 401 for unauthenticated requests
- Return 403 for unauthorized requests
- Return 404 for unauthorized access to prevent information disclosure
- Log all authorization failures for security monitoring

### Authentication Requirements

**Required Authentication**:
- Valid JWT token in Authorization header
- Token must not be expired
- Token must contain user ID and role
- User account must be active (not locked or deleted)

**Authorization Checks**:
- Verify user has required role for endpoint
- Verify user has required permission for action
- Verify user has access to requested resource
- Log all authorization checks for audit

**Application-Level Separation**:
- Admin and customer applications use different base URLs or subdomains
- Token validation includes role check against application context
- Admin/Supplier roles can only access admin application endpoints
- Customer role can only access customer-facing application endpoints
- Cross-application access attempts return 403 Forbidden
- All unauthorized access attempts logged for security monitoring

## Database Specifications

### Schema Changes

**users table** (modifications):
- `role_id` column: INT, foreign key to roles table
- `organization_id` column: INT, foreign key to organizations table (NULL for non-corporate users)
- `role_assigned_at` column: TIMESTAMP, when current role was assigned
- `role_assigned_by` column: INT, foreign key to users.id (who assigned the role)

**roles table** (new):
- `id` column: INT, primary key, auto-increment
- `role_name` column: VARCHAR(100), human-readable role name
- `role_code` column: VARCHAR(50), system role code (CUSTOMER, SUPPLIER, ADMIN, CORPORATE_ADMIN)
- `description` column: TEXT, role description
- `is_active` column: BOOLEAN, whether role is currently active
- `created_at` column: TIMESTAMP, role creation time
- `updated_at` column: TIMESTAMP, last update time

**permissions table** (new):
- `id` column: INT, primary key, auto-increment
- `role_id` column: INT, foreign key to roles.id
- `resource` column: VARCHAR(100), resource name (bookings, vehicles, users, etc.)
- `action` column: VARCHAR(50), action name (create, read, update, delete)
- `scope` column: VARCHAR(50), permission scope (own, organization, all, none)
- `created_at` column: TIMESTAMP, permission creation time

**role_history table** (new):
- `id` column: INT, primary key, auto-increment
- `user_id` column: INT, foreign key to users.id
- `old_role_id` column: INT, foreign key to roles.id
- `new_role_id` column: INT, foreign key to roles.id
- `changed_at` column: TIMESTAMP, when role was changed
- `changed_by` column: INT, foreign key to users.id (who made the change)
- `reason` column: TEXT, reason for role change
- `created_at` column: TIMESTAMP, record creation time

**organizations table** (new):
- `id` column: INT, primary key, auto-increment
- `organization_name` column: VARCHAR(255), organization name
- `organization_code` column: VARCHAR(100), unique organization code
- `is_active` column: BOOLEAN, whether organization is active
- `created_at` column: TIMESTAMP, organization creation time
- `updated_at` column: TIMESTAMP, last update time

### Table Definitions

**roles table**:
```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100) NOT NULL,
  role_code VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role_code (role_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**permissions table**:
```sql
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_permission (role_id, resource, action),
  INDEX idx_role_id (role_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**role_history table**:
```sql
CREATE TABLE role_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  old_role_id INT NULL,
  new_role_id INT NOT NULL,
  changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by INT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (old_role_id) REFERENCES roles(id) ON DELETE SET NULL,
  FOREIGN KEY (new_role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_changed_at (changed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**organizations table**:
```sql
CREATE TABLE organizations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organization_name VARCHAR(255) NOT NULL,
  organization_code VARCHAR(100) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_organization_code (organization_code),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**users ↔ roles**: Many-to-One
- Many users can have the same role
- Foreign key: users.role_id → roles.id
- On Delete: RESTRICT (cannot delete role if users assigned)

**users ↔ organizations**: Many-to-One
- Many users can belong to the same organization
- Foreign key: users.organization_id → organizations.id
- On Delete: SET NULL (preserve user if organization deleted)

**roles ↔ permissions**: One-to-Many
- One role can have multiple permissions
- Foreign key: permissions.role_id → roles.id
- On Delete: CASCADE (delete permissions when role deleted)

**users ↔ role_history**: One-to-Many
- One user can have multiple role history records
- Foreign key: role_history.user_id → users.id
- On Delete: CASCADE (delete history when user deleted)

### Indexes

**roles table**:
- Primary key index on `id`
- Unique index on `role_code`
- Index on `is_active` for filtering active roles

**permissions table**:
- Primary key index on `id`
- Unique composite index on `(role_id, resource, action)`
- Index on `role_id` for efficient role permission lookup

**role_history table**:
- Primary key index on `id`
- Index on `user_id` for user role history lookup
- Index on `changed_at` for temporal queries

**organizations table**:
- Primary key index on `id`
- Unique index on `organization_code`
- Index on `is_active` for filtering active organizations

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React 18+
- **Authentication**: JWT tokens with role claims
- **Authorization**: Policy-based authorization with custom middleware

## Implementation Notes

### Security Considerations

**Principle of Least Privilege**:
- Users are assigned the minimum role necessary
- Permissions are explicitly granted, not implicitly allowed
- Default deny for all actions unless explicitly permitted

**Defense in Depth**:
- Authorization checks at multiple layers (UI, API, database)
- Never rely solely on client-side permission checks
- Always validate permissions on server side

**Information Disclosure Prevention**:
- Return 404 instead of 403 when user shouldn't know resource exists
- Don't reveal existence of resources user can't access
- Sanitize error messages to prevent information leakage

**Audit Trail**:
- Log all role assignments and changes
- Log all authorization failures
- Log all admin actions with reason
- Retain audit logs for compliance (7 years)

### Role Assignment Best Practices

**Initial Role Assignment**:
- New users default to Customer role
- Supplier role requires verification and approval
- Admin role requires manual assignment by existing admin
- Corporate Admin role requires organization association

**Role Change Process**:
- Role changes require admin approval
- User is notified of role change via email
- All sessions are invalidated on role change
- User must re-login to activate new role
- Previous role is stored in history

### Performance Optimization

**Permission Caching**:
- Cache role permissions in memory
- Cache user permissions in JWT token
- Invalidate cache on role or permission changes
- Use distributed cache (Redis) for scalability

**Database Optimization**:
- Index all foreign keys
- Use covering indexes for permission checks
- Denormalize permissions in JWT token
- Minimize database queries for authorization

### Error Handling

**Authorization Errors**:
- 401 Unauthorized: User not authenticated
- 403 Forbidden: User authenticated but not authorized
- 404 Not Found: Resource doesn't exist or user can't access it
- Log all authorization failures for security monitoring

### Accessibility

**WCAG 2.1 AA Compliance**:
- Role indicators have sufficient color contrast
- Access denied messages are clear and actionable
- Keyboard navigation works for all role-based UI
- Screen readers announce role changes
- Focus management for permission-based navigation

## Related Requirements

- REQ-UM-016: Role-Based Access Control
- REQ-UM-002: User Authentication
- REQ-UM-010: Account Security Management

## Related Features

- F-AM-002: Secure Authentication System
- F-AM-012: Account Security Settings
- Authorization Features (RBAC, Resource-Level Authorization)

## Success Metrics

- Authorization check response time < 50ms
- Zero unauthorized access incidents
- Role assignment accuracy > 99.9%
- Audit log completeness > 99.99%
- User satisfaction with role-based features > 4.0/5.0

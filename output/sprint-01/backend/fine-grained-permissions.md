# Feature: Fine-Grained Permissions

## Overview

Fine-Grained Permissions extends the basic role-based access control system with granular permission management for specific actions and resources. This feature allows administrators to define precise permissions beyond role boundaries, enabling flexible access control that adapts to complex organizational needs. The system implements permission categories for different resource types (users, vehicles, bookings, suppliers) with specific actions (create, read, update, delete) and scope modifiers (own, organization, all).

## Sprint Category

sprint-01

## Feature ID

F-SEC-AUTHZ-006

## User Stories

### As a platform administrator
I want to define granular permissions for specific actions and resources, so that I can implement flexible access control policies beyond basic roles.

### As an organization manager
I want to assign specific permissions to team members, so that I can grant access to only the features they need without elevating their entire role.

### As a security officer
I want to enforce the principle of least privilege with fine-grained permissions, so that users have only the minimum access necessary for their responsibilities.

### As a developer
I want a flexible permission system that can adapt to changing business requirements, so that I don't need to create new roles for every permission combination.

## Frontend Specifications

### Pages

**Permission Management Page** (`/admin/permissions`)
- List of all available permissions by category
- Permission assignment interface for roles
- Permission matrix view showing role-permission mappings
- Search and filter permissions by resource type or action

**Role Permission Editor** (`/admin/roles/:roleId/permissions`)
- Detailed permission editor for specific role
- Grouped permissions by resource type
- Toggle switches for each permission
- Scope selector for read/update/delete permissions (own, organization, all)
- Save and cancel buttons

**User Custom Permissions** (`/admin/users/:userId/permissions`)
- Override permissions for specific user
- Shows inherited permissions from role (read-only)
- Additional permissions granted to user
- Permission revocation interface
- Audit trail of permission changes

### UI Components

**Permission Matrix Component**
- Table showing roles (rows) and permissions (columns)
- Checkboxes indicating granted permissions
- Color coding for permission scope (own, organization, all)
- Expandable rows for detailed permission view

**Permission Selector Component**
- Hierarchical tree view of permissions
- Checkboxes for selecting permissions
- Scope dropdown for applicable permissions
- Search and filter functionality
- Select all / deselect all options

**Permission Badge Component**
- Visual indicator of permission status
- Color-coded badges (granted: green, denied: red, inherited: blue)
- Tooltip showing permission details
- Scope indicator (own, org, all)

**Permission Audit Trail Component**
- Timeline of permission changes
- Shows who granted/revoked permissions
- Displays reason for permission change
- Filterable by date range and permission type

### User Flows

**Admin Assigning Permissions to Role Flow**:
1. Admin navigates to role permission editor
2. System displays current role permissions
3. Admin expands "Booking Management" category
4. Admin enables "bookings:update" permission
5. Admin selects scope "organization" (can update bookings within organization)
6. Admin saves changes
7. System validates permission combination
8. System updates role permissions
9. System invalidates sessions for users with this role
10. System logs permission change in audit trail

**Admin Granting Custom Permission to User Flow**:
1. Admin navigates to user custom permissions page
2. System displays user's inherited permissions from role
3. Admin clicks "Add Custom Permission"
4. Admin selects "vehicles:delete" permission
5. Admin selects scope "own" (can delete own vehicles only)
6. Admin enters justification "Temporary permission for fleet cleanup"
7. Admin sets expiration date (optional)
8. Admin saves custom permission
9. System grants permission to user
10. System logs custom permission grant
11. User's next API request includes new permission

### Data Requirements

**From Backend APIs**:
- Complete list of available permissions
- Role-permission mappings
- User-specific permission overrides
- Permission audit trail
- Permission validation results

**To Backend APIs**:
- Permission grant/revoke requests
- Role ID and permission IDs
- Scope selection for permissions
- Justification for permission changes

## Backend Specifications

### API Endpoints

**GET /api/admin/permissions**
- Purpose: Retrieve all available permissions
- Authentication: Required (JWT token with Admin role)
- Response: Hierarchical list of permissions grouped by resource type
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden)

**GET /api/admin/roles/:roleId/permissions**
- Purpose: Retrieve permissions for specific role
- Authentication: Required (JWT token with Admin role)
- Response: Array of permissions granted to role
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden), 404 (not found)

**PUT /api/admin/roles/:roleId/permissions**
- Purpose: Update permissions for specific role
- Authentication: Required (JWT token with Admin role)
- Request body: Array of permission grants/revokes
- Response: Updated role permissions
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden), 404 (not found), 400 (validation error)

**GET /api/admin/users/:userId/permissions**
- Purpose: Retrieve all permissions for user (inherited + custom)
- Authentication: Required (JWT token with Admin role)
- Response: Complete permission set with source (role or custom)
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden), 404 (not found)

**POST /api/admin/users/:userId/permissions**
- Purpose: Grant custom permission to user
- Authentication: Required (JWT token with Admin role)
- Request body: Permission grant details
- Response: Updated user permissions
- Status codes: 201 (created), 401 (unauthorized), 403 (forbidden), 404 (not found), 400 (validation error)

**DELETE /api/admin/users/:userId/permissions/:permissionId**
- Purpose: Revoke custom permission from user
- Authentication: Required (JWT token with Admin role)
- Response: Confirmation of revocation
- Status codes: 204 (no content), 401 (unauthorized), 403 (forbidden), 404 (not found)

**POST /api/admin/permissions/validate**
- Purpose: Validate permission combination for conflicts
- Authentication: Required (JWT token with Admin role)
- Request body: Array of permissions to validate
- Response: Validation result with conflicts or warnings
- Status codes: 200 (success), 401 (unauthorized), 403 (forbidden), 400 (validation error)

### Request Schemas

**Update Role Permissions Request**:
```
{
  "permissions": [
    {
      "permissionCode": "string (required, e.g., bookings:read)",
      "scope": "string (required, own|organization|all)",
      "granted": "boolean (required, true to grant, false to revoke)"
    }
  ],
  "reason": "string (optional, reason for permission change)"
}
```

**Grant Custom Permission Request**:
```
{
  "permissionCode": "string (required)",
  "scope": "string (required, own|organization|all)",
  "justification": "string (required)",
  "expiresAt": "string (optional, ISO 8601 timestamp)"
}
```

### Response Schemas

**Available Permissions Response**:
```
{
  "permissions": [
    {
      "category": "string (e.g., User Management)",
      "permissions": [
        {
          "code": "string (e.g., users:create)",
          "name": "string (e.g., Create Users)",
          "description": "string",
          "resource": "string (e.g., users)",
          "action": "string (e.g., create)",
          "supportsScope": "boolean",
          "availableScopes": ["string (own, organization, all)"]
        }
      ]
    }
  ]
}
```

**Role Permissions Response**:
```
{
  "roleId": "number",
  "roleName": "string",
  "permissions": [
    {
      "id": "number",
      "code": "string",
      "name": "string",
      "scope": "string",
      "grantedAt": "string (ISO 8601)",
      "grantedBy": "number (admin user ID)"
    }
  ]
}
```

**User Permissions Response**:
```
{
  "userId": "number",
  "roleId": "number",
  "roleName": "string",
  "permissions": [
    {
      "id": "number",
      "code": "string",
      "name": "string",
      "scope": "string",
      "source": "string (role or custom)",
      "grantedAt": "string (ISO 8601)",
      "grantedBy": "number (admin user ID)",
      "expiresAt": "string (ISO 8601, optional)",
      "justification": "string (for custom permissions)"
    }
  ]
}
```

**Permission Validation Response**:
```
{
  "valid": "boolean",
  "conflicts": [
    {
      "permission1": "string",
      "permission2": "string",
      "reason": "string"
    }
  ],
  "warnings": [
    {
      "permission": "string",
      "message": "string"
    }
  ]
}
```

### Business Logic

**Permission Categories**:

**User Management Permissions**:
- `users:create` - Create new user accounts
- `users:read` - View user profiles (scope: own, organization, all)
- `users:update` - Modify user information (scope: own, organization, all)
- `users:delete` - Delete user accounts (scope: organization, all)
- `users:verify` - Verify user identities
- `users:suspend` - Suspend/unsuspend user accounts

**Vehicle Management Permissions**:
- `vehicles:create` - Add new vehicles
- `vehicles:read` - View vehicle details (scope: public, own, all)
- `vehicles:update` - Modify vehicle information (scope: own, all)
- `vehicles:delete` - Remove vehicles (scope: own, all)
- `vehicles:approve` - Approve vehicles for listing (admin only)
- `vehicles:price` - Set vehicle pricing (scope: own, all)

**Booking Management Permissions**:
- `bookings:create` - Create new bookings
- `bookings:read` - View booking details (scope: own, organization, all)
- `bookings:update` - Modify bookings (scope: own, organization, all)
- `bookings:cancel` - Cancel bookings (scope: own, organization, all)
- `bookings:override` - Override booking policies (admin only)

**Supplier Management Permissions**:
- `suppliers:create` - Create supplier accounts (admin only)
- `suppliers:read` - View supplier information (scope: public, own, all)
- `suppliers:update` - Modify supplier details (scope: own, all)
- `suppliers:delete` - Delete supplier accounts (admin only)
- `suppliers:approve` - Approve supplier applications (admin only)

**Analytics Permissions**:
- `analytics:view` - View analytics dashboards (scope: own, organization, all)
- `analytics:export` - Export analytics data (scope: own, organization, all)

**Settings Permissions**:
- `settings:view` - View system settings
- `settings:update` - Modify system settings (admin only)

**Permission Check Logic**:
```
function checkPermission(user, permissionCode, resourceOwnerId, resourceOrganizationId) {
  // 1. Get user's permissions (role + custom)
  const permissions = getUserPermissions(user.id);
  
  // 2. Find matching permission
  const permission = permissions.find(p => p.code === permissionCode);
  
  // 3. If permission not found, deny
  if (!permission) return false;
  
  // 4. Check if permission has expired (for custom permissions)
  if (permission.expiresAt && new Date(permission.expiresAt) < new Date()) {
    return false;
  }
  
  // 5. Check scope
  if (permission.scope === 'all') return true;
  if (permission.scope === 'own' && user.id === resourceOwnerId) return true;
  if (permission.scope === 'organization' && user.organizationId === resourceOrganizationId) return true;
  
  // 6. Default deny
  return false;
}
```

**Permission Validation Logic**:
```
function validatePermissions(permissions) {
  const conflicts = [];
  const warnings = [];
  
  // Check for conflicting permissions
  for (let i = 0; i < permissions.length; i++) {
    for (let j = i + 1; j < permissions.length; j++) {
      const p1 = permissions[i];
      const p2 = permissions[j];
      
      // Check for scope conflicts (e.g., read:own and read:all)
      if (p1.resource === p2.resource && p1.action === p2.action) {
        if (p1.scope !== p2.scope) {
          conflicts.push({
            permission1: p1.code,
            permission2: p2.code,
            reason: 'Conflicting scopes for same action'
          });
        }
      }
    }
  }
  
  // Check for dangerous permission combinations
  const hasDeleteAll = permissions.some(p => p.action === 'delete' && p.scope === 'all');
  const hasUpdateAll = permissions.some(p => p.action === 'update' && p.scope === 'all');
  
  if (hasDeleteAll && hasUpdateAll) {
    warnings.push({
      permission: 'delete:all + update:all',
      message: 'User has full control over resources - ensure this is intentional'
    });
  }
  
  return { valid: conflicts.length === 0, conflicts, warnings };
}
```

**Custom Permission Expiration**:
- Custom permissions can have expiration dates
- Expired permissions are automatically excluded from permission checks
- Background job runs daily to clean up expired permissions
- Users notified 7 days before custom permission expires

### Authentication Requirements

**Required Authentication**:
- Valid JWT token in Authorization header
- Token must have Admin role for permission management
- User account must be active

**Authorization Checks**:
- Only Admin users can manage permissions
- Permission changes logged in audit trail
- Session invalidation on permission changes

## Database Specifications

### Schema Changes

**permissions table** (modifications):
- Add `supports_scope` column: BOOLEAN, whether permission supports scope modifiers
- Add `available_scopes` column: JSON, array of available scopes for permission
- Add `category` column: VARCHAR(100), permission category for grouping

**role_permissions table** (modifications):
- Ensure composite unique key on `(role_id, permission_id, scope)`
- Add `granted_at` column: TIMESTAMP, when permission was granted
- Add `granted_by` column: INT, foreign key to users.id (admin who granted)

**user_custom_permissions table** (new):
- `id` column: INT, primary key, auto-increment
- `user_id` column: INT, foreign key to users.id
- `permission_id` column: INT, foreign key to permissions.id
- `scope` column: VARCHAR(50), permission scope
- `justification` column: TEXT, reason for custom permission
- `granted_by` column: INT, foreign key to users.id (admin who granted)
- `granted_at` column: TIMESTAMP, when permission was granted
- `expires_at` column: TIMESTAMP, when permission expires (optional)
- `revoked` column: BOOLEAN, whether permission has been revoked
- `revoked_at` column: TIMESTAMP, when permission was revoked
- `revoked_by` column: INT, foreign key to users.id (admin who revoked)

**permission_audit_log table** (new):
- `id` column: INT, primary key, auto-increment
- `admin_id` column: INT, foreign key to users.id
- `target_type` column: VARCHAR(50), type of target (role or user)
- `target_id` column: INT, ID of role or user
- `permission_id` column: INT, foreign key to permissions.id
- `action` column: VARCHAR(50), action performed (grant, revoke)
- `scope` column: VARCHAR(50), permission scope
- `reason` column: TEXT, reason for permission change
- `created_at` column: TIMESTAMP, when change occurred

### Table Definitions

**user_custom_permissions table**:
```sql
CREATE TABLE user_custom_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  permission_id INT NOT NULL,
  scope VARCHAR(50) NOT NULL,
  justification TEXT NOT NULL,
  granted_by INT NOT NULL,
  granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMP NULL,
  revoked_by INT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (revoked_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_permission (user_id, permission_id, scope),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_revoked (revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**permission_audit_log table**:
```sql
CREATE TABLE permission_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id INT NOT NULL,
  permission_id INT NOT NULL,
  action VARCHAR(50) NOT NULL,
  scope VARCHAR(50) NOT NULL,
  reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  INDEX idx_admin_id (admin_id),
  INDEX idx_target (target_type, target_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**user_custom_permissions ↔ users**: Many-to-One
- Many custom permissions for one user
- Foreign key: user_custom_permissions.user_id → users.id
- On Delete: CASCADE (delete custom permissions when user deleted)

**user_custom_permissions ↔ permissions**: Many-to-One
- Many custom permission grants for one permission
- Foreign key: user_custom_permissions.permission_id → permissions.id
- On Delete: CASCADE (delete grants when permission deleted)

**permission_audit_log ↔ users**: Many-to-One
- Many audit log entries for one admin
- Foreign key: permission_audit_log.admin_id → users.id
- On Delete: CASCADE (delete logs when admin deleted)

**permission_audit_log ↔ permissions**: Many-to-One
- Many audit log entries for one permission
- Foreign key: permission_audit_log.permission_id → permissions.id
- On Delete: CASCADE (delete logs when permission deleted)

### Indexes

**user_custom_permissions table**:
- Primary key index on `id`
- Unique composite index on `(user_id, permission_id, scope)`
- Index on `user_id` for user permission lookup
- Index on `expires_at` for expiration cleanup
- Index on `revoked` for filtering active permissions

**permission_audit_log table**:
- Primary key index on `id`
- Index on `admin_id` for admin-specific queries
- Composite index on `(target_type, target_id)` for target-specific queries
- Index on `created_at` for temporal queries

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, React 18+
- **Authentication**: JWT tokens with permission claims
- **Authorization**: Policy-based authorization with custom middleware

## Implementation Notes

### Security Considerations

**Principle of Least Privilege**:
- Users granted only necessary permissions
- Custom permissions require justification
- Permissions can expire automatically
- Regular audit of granted permissions

**Permission Validation**:
- Validate permission combinations for conflicts
- Warn about dangerous permission combinations
- Prevent privilege escalation through permission grants

**Audit Trail**:
- Log all permission grants and revocations
- Track who granted permissions and why
- Retain audit logs for compliance

### Performance Optimization

**Permission Caching**:
- Cache user permissions in JWT token
- Cache role permissions in memory
- Invalidate cache on permission changes
- Use distributed cache (Redis) for scalability

**Database Optimization**:
- Index all foreign keys
- Use composite indexes for permission checks
- Denormalize permissions in JWT token
- Use covering indexes for common queries

### Error Handling

**Permission Management Errors**:
- 400 Bad Request: Invalid permission code or scope
- 401 Unauthorized: Admin not authenticated
- 403 Forbidden: User does not have Admin role
- 404 Not Found: Role, user, or permission not found
- 409 Conflict: Permission combination conflicts

### Testing Strategy

**Unit Tests**:
- Test permission check logic with various scenarios
- Test permission validation logic
- Test custom permission expiration
- Test permission conflict detection

**Integration Tests**:
- Test end-to-end permission management
- Test permission inheritance from roles
- Test custom permission grants and revocations
- Test audit logging functionality

### Compliance

**Principle of Least Privilege**:
- Fine-grained permissions enforce minimum necessary access
- Custom permissions allow temporary elevated access
- Audit trail provides evidence of permission management

## Related Requirements

- REQ-SEC-6: Role-Based Access Control (RBAC)
- REQ-SEC-8: Audit Logging and Monitoring

## Related Features

- F-SEC-AUTHZ-001: Role-Based Access Control (RBAC)
- F-SEC-AUTHZ-002: Application-Level Separation
- F-SEC-AUTHZ-005: Admin Override with Audit Trail

## Success Metrics

- Permission check response time < 10ms
- Zero privilege escalation incidents
- Custom permission usage < 5% of total permissions
- Audit log completeness > 99.99%
- Permission conflict detection accuracy > 95%

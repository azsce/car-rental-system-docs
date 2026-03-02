# Feature: Quick Rebooking & Booking Templates - Database

## Overview

Database schema and data model supporting One-Click Rebooking (F-BM-016) and Booking Templates & Favorites (F-BM-017). The schema enables efficient storage and retrieval of booking templates, rebooking history tracking, and template sharing for corporate accounts.

The database design optimizes for fast template lookups, booking history queries, and rebooking analytics while maintaining data integrity and supporting high-frequency read operations.

## Sprint Category

Nice-to-have ⭐

## Feature IDs

- F-BM-016: One-Click Rebooking
- F-BM-017: Booking Templates & Favorites

## Database Specifications

### Schema Changes

#### New Tables

**booking_templates**
```sql
CREATE TABLE booking_templates (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    vehicle_preferences JSON NOT NULL,
    insurance_type VARCHAR(50) NOT NULL,
    extras JSON,
    default_pickup_location_id CHAR(36),
    default_return_location_id CHAR(36),
    typical_duration_days INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_used_at DATETIME,
    use_count INT NOT NULL DEFAULT 0,
    is_shared BOOLEAN NOT NULL DEFAULT FALSE,
    shared_by_customer_id CHAR(36),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_customer_id) REFERENCES customers(id) ON DELETE SET NULL,
    FOREIGN KEY (default_pickup_location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (default_return_location_id) REFERENCES locations(id) ON DELETE SET NULL,
    INDEX idx_customer_active (customer_id, is_active),
    INDEX idx_last_used (last_used_at),
    INDEX idx_shared (is_shared, shared_by_customer_id),
    UNIQUE KEY uk_customer_template_name (customer_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**template_shares**
```sql
CREATE TABLE template_shares (
    id CHAR(36) PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    shared_with_customer_id CHAR(36) NOT NULL,
    shared_by_customer_id CHAR(36) NOT NULL,
    permission_level ENUM('view_only', 'can_modify') NOT NULL DEFAULT 'view_only',
    shared_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    accepted_at DATETIME,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (template_id) REFERENCES booking_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_with_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (shared_by_customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    INDEX idx_shared_with (shared_with_customer_id, is_active),
    INDEX idx_template (template_id),
    UNIQUE KEY uk_template_share (template_id, shared_with_customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**rebooking_history**
```sql
CREATE TABLE rebooking_history (
    id CHAR(36) PRIMARY KEY,
    customer_id CHAR(36) NOT NULL,
    original_booking_id CHAR(36) NOT NULL,
    new_booking_id CHAR(36) NOT NULL,
    rebooking_method ENUM('one_click', 'from_template', 'manual') NOT NULL,
    template_id CHAR(36),
    original_total_cost DECIMAL(10, 2) NOT NULL,
    new_total_cost DECIMAL(10, 2) NOT NULL,
    cost_difference DECIMAL(10, 2) NOT NULL,
    percentage_change DECIMAL(5, 2) NOT NULL,
    completion_time_seconds INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (original_booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (new_booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (template_id) REFERENCES booking_templates(id) ON DELETE SET NULL,
    INDEX idx_customer_date (customer_id, created_at),
    INDEX idx_original_booking (original_booking_id),
    INDEX idx_new_booking (new_booking_id),
    INDEX idx_template (template_id),
    INDEX idx_method (rebooking_method)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**template_usage_log**
```sql
CREATE TABLE template_usage_log (
    id CHAR(36) PRIMARY KEY,
    template_id CHAR(36) NOT NULL,
    customer_id CHAR(36) NOT NULL,
    booking_id CHAR(36),
    used_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modifications_made JSON,
    was_successful BOOLEAN NOT NULL DEFAULT TRUE,
    failure_reason VARCHAR(255),
    FOREIGN KEY (template_id) REFERENCES booking_templates(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
    INDEX idx_template_date (template_id, used_at),
    INDEX idx_customer_date (customer_id, used_at),
    INDEX idx_success (was_successful)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Modified Tables

**bookings** (add columns)
```sql
ALTER TABLE bookings
ADD COLUMN is_rebooking BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN original_booking_id CHAR(36),
ADD COLUMN created_from_template_id CHAR(36),
ADD COLUMN rebooking_completion_time_seconds INT,
ADD INDEX idx_rebooking (is_rebooking, original_booking_id),
ADD INDEX idx_template (created_from_template_id),
ADD FOREIGN KEY (original_booking_id) REFERENCES bookings(id) ON DELETE SET NULL,
ADD FOREIGN KEY (created_from_template_id) REFERENCES booking_templates(id) ON DELETE SET NULL;
```

**customers** (add columns for template limits)
```sql
ALTER TABLE customers
ADD COLUMN template_limit INT NOT NULL DEFAULT 20,
ADD COLUMN can_share_templates BOOLEAN NOT NULL DEFAULT FALSE;
```

### Table Definitions

#### booking_templates

**Purpose**: Store customer-defined booking templates with preferences

**Columns**:
- `id`: Unique template identifier (UUID)
- `customer_id`: Owner of the template
- `name`: Template name (unique per customer)
- `description`: Optional template description
- `vehicle_preferences`: JSON object with vehicle criteria
  ```json
  {
    "type": "sedan",
    "category": "premium",
    "features": ["gps", "bluetooth", "backup_camera"],
    "transmissionType": "automatic",
    "fuelType": "hybrid"
  }
  ```
- `insurance_type`: Preferred insurance level
- `extras`: JSON array of extra service IDs
- `default_pickup_location_id`: Preferred pickup location
- `default_return_location_id`: Preferred return location
- `typical_duration_days`: Typical rental duration
- `created_at`: Template creation timestamp
- `updated_at`: Last modification timestamp
- `last_used_at`: Last time template was used for booking
- `use_count`: Number of times template has been used
- `is_shared`: Whether template is shared with others
- `shared_by_customer_id`: Original owner if this is a shared template
- `is_active`: Soft delete flag

**Constraints**:
- Unique template name per customer
- Typical duration between 1 and 90 days
- Insurance type must be valid enum value
- Customer must exist

#### template_shares

**Purpose**: Track template sharing between corporate users

**Columns**:
- `id`: Unique share record identifier
- `template_id`: Template being shared
- `shared_with_customer_id`: Recipient customer
- `shared_by_customer_id`: Customer who shared the template
- `permission_level`: Access level (view_only or can_modify)
- `shared_at`: When template was shared
- `accepted_at`: When recipient accepted the share
- `is_active`: Whether share is currently active

**Constraints**:
- Unique share per template and recipient
- All referenced customers must exist
- Template must exist

#### rebooking_history

**Purpose**: Track rebooking operations for analytics and auditing

**Columns**:
- `id`: Unique rebooking record identifier
- `customer_id`: Customer who performed rebooking
- `original_booking_id`: Source booking
- `new_booking_id`: Newly created booking
- `rebooking_method`: How rebooking was performed
- `template_id`: Template used (if applicable)
- `original_total_cost`: Cost of original booking
- `new_total_cost`: Cost of new booking
- `cost_difference`: Price difference
- `percentage_change`: Percentage price change
- `completion_time_seconds`: Time taken to complete rebooking
- `created_at`: Rebooking timestamp

**Constraints**:
- Both bookings must exist
- Customer must exist
- Completion time must be positive

#### template_usage_log

**Purpose**: Detailed logging of template usage for analytics

**Columns**:
- `id`: Unique log entry identifier
- `template_id`: Template that was used
- `customer_id`: Customer who used the template
- `booking_id`: Resulting booking (if successful)
- `used_at`: Usage timestamp
- `modifications_made`: JSON object with changes from template
- `was_successful`: Whether usage resulted in booking
- `failure_reason`: Reason for failure (if applicable)

**Constraints**:
- Template and customer must exist
- Booking ID required if successful

### Relationships

**booking_templates**
- Belongs to: customers (customer_id)
- Belongs to: customers (shared_by_customer_id) - for shared templates
- Belongs to: locations (default_pickup_location_id)
- Belongs to: locations (default_return_location_id)
- Has many: template_shares
- Has many: template_usage_log
- Has many: bookings (created_from_template_id)
- Has many: rebooking_history

**template_shares**
- Belongs to: booking_templates (template_id)
- Belongs to: customers (shared_with_customer_id)
- Belongs to: customers (shared_by_customer_id)

**rebooking_history**
- Belongs to: customers (customer_id)
- Belongs to: bookings (original_booking_id)
- Belongs to: bookings (new_booking_id)
- Belongs to: booking_templates (template_id)

**template_usage_log**
- Belongs to: booking_templates (template_id)
- Belongs to: customers (customer_id)
- Belongs to: bookings (booking_id)

**bookings** (modified)
- Belongs to: bookings (original_booking_id) - self-referential
- Belongs to: booking_templates (created_from_template_id)

### Indexes

**Performance Indexes**

```sql
-- Fast template lookup by customer
CREATE INDEX idx_customer_active ON booking_templates(customer_id, is_active);

-- Template usage tracking
CREATE INDEX idx_last_used ON booking_templates(last_used_at);

-- Shared template queries
CREATE INDEX idx_shared ON booking_templates(is_shared, shared_by_customer_id);

-- Template sharing lookups
CREATE INDEX idx_shared_with ON template_shares(shared_with_customer_id, is_active);
CREATE INDEX idx_template ON template_shares(template_id);

-- Rebooking analytics
CREATE INDEX idx_customer_date ON rebooking_history(customer_id, created_at);
CREATE INDEX idx_original_booking ON rebooking_history(original_booking_id);
CREATE INDEX idx_method ON rebooking_history(rebooking_method);

-- Template usage analytics
CREATE INDEX idx_template_date ON template_usage_log(template_id, used_at);
CREATE INDEX idx_customer_date ON template_usage_log(customer_id, used_at);
CREATE INDEX idx_success ON template_usage_log(was_successful);

-- Booking rebooking queries
CREATE INDEX idx_rebooking ON bookings(is_rebooking, original_booking_id);
CREATE INDEX idx_template ON bookings(created_from_template_id);
```

**Composite Indexes for Common Queries**

```sql
-- Find active templates for customer sorted by last used
CREATE INDEX idx_customer_active_lastused 
ON booking_templates(customer_id, is_active, last_used_at DESC);

-- Find shared templates for customer
CREATE INDEX idx_shared_customer_active 
ON template_shares(shared_with_customer_id, is_active, shared_at DESC);

-- Rebooking analytics by method and date
CREATE INDEX idx_method_date 
ON rebooking_history(rebooking_method, created_at DESC);
```

### Data Integrity Constraints

**Business Rules Enforced by Database**

1. **Template Name Uniqueness**
   - Unique constraint on (customer_id, name)
   - Prevents duplicate template names per customer

2. **Template Sharing Uniqueness**
   - Unique constraint on (template_id, shared_with_customer_id)
   - Prevents duplicate shares

3. **Cascading Deletes**
   - Deleting customer deletes their templates
   - Deleting template deletes shares and usage logs
   - Deleting booking sets rebooking references to NULL

4. **Referential Integrity**
   - All foreign keys enforced
   - Prevents orphaned records

5. **Soft Deletes**
   - Templates use is_active flag
   - Preserves historical data for analytics

### Query Patterns

**Common Queries**

```sql
-- Get customer's active templates sorted by usage
SELECT * FROM booking_templates
WHERE customer_id = ? AND is_active = TRUE
ORDER BY last_used_at DESC, use_count DESC;

-- Get templates shared with customer
SELECT bt.*, ts.permission_level, ts.shared_at
FROM booking_templates bt
JOIN template_shares ts ON bt.id = ts.template_id
WHERE ts.shared_with_customer_id = ? 
  AND ts.is_active = TRUE
  AND bt.is_active = TRUE;

-- Get rebooking data for original booking
SELECT b.*, bt.name as template_name
FROM bookings b
LEFT JOIN booking_templates bt ON b.created_from_template_id = bt.id
WHERE b.original_booking_id = ?;

-- Get rebooking statistics for customer
SELECT 
    COUNT(*) as total_rebookings,
    AVG(completion_time_seconds) as avg_completion_time,
    AVG(percentage_change) as avg_price_change,
    rebooking_method
FROM rebooking_history
WHERE customer_id = ?
GROUP BY rebooking_method;

-- Get template usage statistics
SELECT 
    t.id,
    t.name,
    t.use_count,
    COUNT(tul.id) as total_attempts,
    SUM(CASE WHEN tul.was_successful THEN 1 ELSE 0 END) as successful_uses,
    MAX(tul.used_at) as last_used
FROM booking_templates t
LEFT JOIN template_usage_log tul ON t.id = tul.template_id
WHERE t.customer_id = ?
GROUP BY t.id, t.name, t.use_count;
```

### Data Migration

**Migration Steps**

1. Create new tables (booking_templates, template_shares, rebooking_history, template_usage_log)
2. Add new columns to existing tables (bookings, customers)
3. Create indexes for performance
4. Set default values for existing customers (template_limit = 20, can_share_templates based on account type)
5. Backfill is_rebooking flag for existing bookings (set to FALSE)

**Rollback Plan**

1. Drop foreign key constraints on new columns
2. Drop new columns from modified tables
3. Drop new tables
4. Restore from backup if data corruption occurs

### Performance Considerations

**Optimization Strategies**

- Use JSON columns for flexible vehicle preferences
- Index frequently queried fields (customer_id, is_active, last_used_at)
- Partition rebooking_history by created_at for large datasets
- Use read replicas for template queries
- Cache popular templates in Redis
- Archive old rebooking_history records (> 2 years)

**Expected Query Performance**

- Template lookup by customer: < 10ms
- Shared templates query: < 20ms
- Rebooking history query: < 50ms
- Template usage statistics: < 100ms

### Data Retention

**Retention Policies**

- Active templates: Indefinite (until customer deletes)
- Inactive templates: 2 years after last use
- Template shares: 1 year after deactivation
- Rebooking history: 3 years for analytics
- Template usage log: 1 year for recent analysis

**Archival Strategy**

- Move old rebooking_history to archive table
- Compress archived data
- Maintain summary statistics for historical analysis

## Technology Stack

- **Database**: MySQL 8.0+
- **Storage Engine**: InnoDB
- **Character Set**: utf8mb4
- **Collation**: utf8mb4_unicode_ci
- **JSON Support**: Native JSON data type

## Implementation Notes

### JSON Schema for vehicle_preferences

```json
{
  "type": "object",
  "properties": {
    "type": {
      "type": "string",
      "enum": ["sedan", "suv", "truck", "van", "luxury", "sports", "convertible"]
    },
    "category": {
      "type": "string",
      "enum": ["economy", "standard", "premium", "luxury"]
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "transmissionType": {
      "type": "string",
      "enum": ["automatic", "manual"]
    },
    "fuelType": {
      "type": "string",
      "enum": ["gasoline", "diesel", "hybrid", "electric"]
    },
    "minSeats": {
      "type": "integer",
      "minimum": 2,
      "maximum": 15
    }
  },
  "required": ["type", "category"]
}
```

### JSON Schema for extras

```json
{
  "type": "array",
  "items": {
    "type": "string",
    "format": "uuid"
  }
}
```

### JSON Schema for modifications_made

```json
{
  "type": "object",
  "properties": {
    "vehicleChanged": {
      "type": "boolean"
    },
    "insuranceChanged": {
      "type": "boolean"
    },
    "extrasChanged": {
      "type": "boolean"
    },
    "locationsChanged": {
      "type": "boolean"
    },
    "durationChanged": {
      "type": "boolean"
    }
  }
}
```

### Monitoring and Maintenance

**Database Health Checks**

- Monitor table sizes and growth rates
- Track index usage and efficiency
- Monitor query performance
- Alert on slow queries (> 1 second)
- Track template creation and usage trends

**Regular Maintenance**

- Optimize tables monthly
- Rebuild indexes quarterly
- Archive old data annually
- Review and update statistics weekly
- Monitor disk space usage

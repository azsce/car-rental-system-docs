# Feature: Date and Time Selection Workflow - Database

## Overview

Database schema to support enhanced date/time selection workflow with quick date presets and business hours configuration. Extends MVP availability schema (F-SD-003) with workflow optimization tables.

## Sprint Category

Project - Important but can wait until after MVP

## Feature ID

F-WF-SRCH-002

## Related Features

- **F-SD-003**: Date & Time Availability Search (MVP) - Base availability schema

## Database Specifications

### Schema Changes

**Quick Date Presets Table**
```sql
CREATE TABLE quick_date_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  preset_key VARCHAR(50) NOT NULL,
  label VARCHAR(100) NOT NULL,
  pickup_offset_days INT NOT NULL,
  pickup_offset_hours INT NOT NULL DEFAULT 0,
  return_offset_days INT NOT NULL,
  return_offset_hours INT NOT NULL DEFAULT 0,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  location_id VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_enabled (is_enabled),
  INDEX idx_location (location_id),
  INDEX idx_display_order (display_order),
  UNIQUE KEY unique_preset_location (preset_key, location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Business Hours Table**
```sql
CREATE TABLE business_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  location_id VARCHAR(50) NOT NULL,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location (location_id),
  INDEX idx_day (day_of_week),
  UNIQUE KEY unique_location_day (location_id, day_of_week)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Table Definitions

**quick_date_presets**
- **Purpose**: Store configurable quick selection shortcuts for common rental periods
- **Key Fields**:
  - `id`: Auto-incrementing primary key
  - `preset_key`: Unique identifier for preset (e.g., "this-weekend", "next-week")
  - `label`: Display label for UI (e.g., "This Weekend", "Next Week")
  - `pickup_offset_days`: Days from current date for pickup
  - `pickup_offset_hours`: Additional hours offset for pickup time
  - `return_offset_days`: Days from current date for return
  - `return_offset_hours`: Additional hours offset for return time
  - `is_enabled`: Enable/disable preset without deletion
  - `display_order`: Control order in UI (lower numbers first)
  - `location_id`: Optional location-specific preset (NULL for global)
- **Use Cases**:
  - Quick date selection shortcuts in search UI
  - Location-specific common rental periods
  - Seasonal or promotional date presets
- **Storage**: InnoDB for referential integrity

**business_hours**
- **Purpose**: Define operating hours by location and day of week for time validation
- **Key Fields**:
  - `id`: Auto-incrementing primary key
  - `location_id`: Reference to location
  - `day_of_week`: Day of the week (Monday-Sunday)
  - `open_time`: Opening time (TIME format, e.g., "08:00:00")
  - `close_time`: Closing time (TIME format, e.g., "20:00:00")
  - `is_closed`: Flag for closed days (overrides open/close times)
- **Use Cases**:
  - Validate pickup/return times within operating hours
  - Display available time slots to users
  - Prevent bookings outside business hours
  - Support location-specific schedules
- **Storage**: InnoDB for referential integrity

### Relationships

**locations → quick_date_presets (one-to-many)**
- A location can have multiple custom presets
- Presets deleted when location is removed (CASCADE)
- NULL location_id indicates global preset

**locations → business_hours (one-to-many)**
- A location must have business hours for each day
- Business hours deleted when location is removed (CASCADE)
- One entry per day of week per location

### Indexes

**quick_date_presets indexes:**
- `PRIMARY KEY (id)`: Fast lookup by preset ID
- `idx_enabled (is_enabled)`: Filter active presets
- `idx_location (location_id)`: Location-specific presets
- `idx_display_order (display_order)`: Sort presets for UI
- `UNIQUE KEY unique_preset_location (preset_key, location_id)`: Prevent duplicate presets per location

**business_hours indexes:**
- `PRIMARY KEY (id)`: Fast lookup by hours ID
- `idx_location (location_id)`: Retrieve hours by location
- `idx_day (day_of_week)`: Filter by specific day
- `UNIQUE KEY unique_location_day (location_id, day_of_week)`: One entry per day per location

### Query Patterns

**Get Quick Date Presets**
```sql
-- Get all enabled presets for location (with fallback to global)
SELECT *
FROM quick_date_presets
WHERE is_enabled = TRUE
  AND (location_id = ? OR location_id IS NULL)
ORDER BY 
  CASE WHEN location_id IS NOT NULL THEN 0 ELSE 1 END,
  display_order ASC;
```

**Get Business Hours for Location**
```sql
-- Retrieve business hours for all days of week
SELECT 
  day_of_week,
  open_time,
  close_time,
  is_closed
FROM business_hours
WHERE location_id = ?
ORDER BY 
  FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
```

**Validate Time Within Business Hours**
```sql
-- Check if time falls within business hours for specific day
SELECT 
  CASE 
    WHEN is_closed = TRUE THEN FALSE
    WHEN ? BETWEEN open_time AND close_time THEN TRUE
    ELSE FALSE
  END as is_valid
FROM business_hours
WHERE location_id = ?
  AND day_of_week = ?;
```

**Get Available Presets Count**
```sql
-- Count enabled presets for location
SELECT COUNT(*) as preset_count
FROM quick_date_presets
WHERE is_enabled = TRUE
  AND (location_id = ? OR location_id IS NULL);
```

### Data Integrity

**Constraints**
- Foreign key constraints prevent orphaned presets/hours
- CASCADE delete removes presets/hours when location deleted
- UNIQUE constraints prevent duplicate presets per location
- UNIQUE constraints ensure one business hours entry per day per location
- NOT NULL constraints on critical fields

**Validation**
- ENUM type enforces valid day of week values
- BOOLEAN type for is_enabled and is_closed flags
- TIME type for open/close times
- Positive values for offset days/hours (application level)
- Close time after open time (application level)

**Default Values**
- is_enabled defaults to TRUE
- display_order defaults to 0
- pickup_offset_hours defaults to 0
- return_offset_hours defaults to 0
- is_closed defaults to FALSE

### Sample Data

**Default Quick Date Presets**
```sql
INSERT INTO quick_date_presets (preset_key, label, pickup_offset_days, pickup_offset_hours, return_offset_days, return_offset_hours, display_order, location_id) VALUES
('this-weekend', 'This Weekend', 0, 18, 2, 18, 1, NULL),
('next-week', 'Next Week', 7, 9, 14, 9, 2, NULL),
('one-week', 'One Week', 0, 9, 7, 9, 3, NULL),
('two-weeks', 'Two Weeks', 0, 9, 14, 9, 4, NULL),
('one-month', 'One Month', 0, 9, 30, 9, 5, NULL);
```

**Default Business Hours (Monday-Friday 8 AM - 8 PM, Saturday 9 AM - 6 PM, Sunday Closed)**
```sql
INSERT INTO business_hours (location_id, day_of_week, open_time, close_time, is_closed) VALUES
('LOC-001', 'Monday', '08:00:00', '20:00:00', FALSE),
('LOC-001', 'Tuesday', '08:00:00', '20:00:00', FALSE),
('LOC-001', 'Wednesday', '08:00:00', '20:00:00', FALSE),
('LOC-001', 'Thursday', '08:00:00', '20:00:00', FALSE),
('LOC-001', 'Friday', '08:00:00', '20:00:00', FALSE),
('LOC-001', 'Saturday', '09:00:00', '18:00:00', FALSE),
('LOC-001', 'Sunday', '00:00:00', '00:00:00', TRUE);
```

### Performance Optimization

**Index Strategy**
- Composite unique index prevents duplicate presets
- Indexes on is_enabled and location_id for fast filtering
- Index on display_order for sorted retrieval
- Indexes on location_id and day_of_week for business hours

**Query Optimization**
- Use FIELD() function for custom day ordering
- Limit result sets with WHERE clauses
- Cache query results in application layer
- Use covering indexes where possible

**Data Volume**
- Presets table: Low volume (< 100 rows typically)
- Business hours table: Low volume (7 rows per location)
- No partitioning needed
- Regular table maintenance not required

### Migration Strategy

1. Create quick_date_presets table
2. Create business_hours table
3. Insert default quick date presets
4. Insert business hours for all existing locations
5. Verify foreign key constraints
6. Test queries for performance
7. Create application cache layer

### Data Maintenance

**Regular Tasks**
- Review and update preset labels seasonally
- Adjust business hours for holidays
- Disable unused presets
- Monitor preset usage analytics
- Archive old preset configurations

**Holiday Handling**
- Create temporary business hours overrides (future enhancement)
- Disable presets during holiday periods
- Update business hours manually for special days
- Communicate changes to users

## Technology Stack

- Database: MySQL 8.0+ with InnoDB storage engine
- Character Set: UTF-8 (utf8mb4) for international support
- Collation: utf8mb4_unicode_ci for proper sorting
- Storage Engine: InnoDB for transactions and foreign keys

## Implementation Notes

### Integration with MVP

This schema extends F-SD-003 (MVP) by adding:
- Quick date preset configuration
- Business hours validation data

The MVP schema handles core booking and availability data, while this schema supports workflow optimization features.

### Timezone Considerations

- Business hours stored in local time (TIME type)
- Location timezone stored in locations table
- Application layer handles timezone conversions
- Open/close times interpreted in location timezone

### Extensibility

**Future Enhancements**
- Holiday schedule table
- Special event hours overrides
- Seasonal preset variations
- Dynamic preset generation based on demand
- A/B testing for preset effectiveness

### Testing Requirements

- Unit tests for query patterns
- Integration tests with locations table
- Data integrity tests for constraints
- Performance tests with realistic data volumes
- Timezone handling tests
- Migration rollback tests

### Monitoring

- Track preset usage frequency
- Monitor business hours validation failures
- Alert on missing business hours for locations
- Log preset configuration changes
- Track query performance metrics

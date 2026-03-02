# Feature: Granular Multi-Criteria Filtering

## Overview

Granular Multi-Criteria Filtering provides customers with a comprehensive filtering system to narrow vehicle search results based on detailed characteristics, features, and preferences. This feature enables efficient discovery by allowing users to specify exact requirements across multiple dimensions including vehicle type, transmission, capacity, specific features, fuel policy, price range, mileage options, supplier preferences, ratings, and accessibility needs. The filtering system supports both simple single-criterion searches and complex multi-dimensional queries, serving diverse user segments from budget-conscious travelers to customers with specific accessibility requirements.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-004

## User Stories

### Primary User Story
As a customer with specific vehicle needs, I want to filter search results by detailed characteristics and features, so that I can efficiently find vehicles matching my exact requirements without browsing irrelevant options.

### Supporting User Stories

**Budget-Conscious Traveler**
As a budget-conscious customer, I want to filter vehicles by price range and fuel policy, so that I can find the most economical option for my trip.

**Family Traveler**
As a family traveler, I want to filter by passenger capacity, number of doors, and child seat compatibility (Isofix), so that I can find vehicles suitable for traveling with children.

**Accessibility User**
As a customer with mobility needs, I want to filter by accessibility features like hand controls and wheelchair ramps, so that I can find vehicles I can safely operate.

**Tech-Savvy User**
As a tech-savvy customer, I want to filter by connectivity features like Apple CarPlay and Android Auto, so that I can ensure seamless integration with my devices.

**Eco-Conscious User**
As an environmentally conscious customer, I want to filter by electric and hybrid vehicles, so that I can minimize my carbon footprint during my rental.

**Pet Owner**
As a pet owner, I want to filter for pet-friendly vehicles, so that I can travel with my companion without restrictions.

**Corporate User**
As a corporate traveler, I want to filter by supplier and vehicle category, so that I can comply with company travel policies.

## Dependencies

- F-SD-001: Location-Based Search (must be implemented first to provide base search results)
- R-VS-001: Location-Based Search requirement
- R-VS-003: Date and Time Availability Search requirement
- Vehicle inventory database with comprehensive attribute data
- Real-time availability checking system

## Frontend Specifications

### Pages

**Search Results Page** (`/search`)
- Primary page displaying filtered vehicle results
- Filter panel (sidebar on desktop, drawer on mobile)
- Results grid/list view
- Active filters display with removal options
- Result count indicator
- Clear all filters button

**Vehicle Listing Page** (`/vehicles`)
- Alternative entry point with filtering capabilities
- Similar layout to search results
- May include featured vehicles section

### UI Components

**Filter Panel Component**
- Collapsible filter sections organized by category
- Responsive design (sidebar on desktop, bottom drawer on mobile)
- Sticky positioning on desktop for easy access while scrolling
- Smooth animations for expand/collapse interactions
- Visual hierarchy emphasizing most-used filters

**Vehicle Type Filter**
- Checkbox group for fuel types:
  - Diesel
  - Gasoline
  - Electric
  - Hybrid
  - Plug-in Hybrid
- Icons representing each fuel type
- Multi-select capability with OR logic

**Transmission Filter**
- Radio buttons or toggle for:
  - Manual
  - Automatic
- Single selection (mutually exclusive)

**Vehicle Category Filter**
- Checkbox group with categories:
  - Economy
  - Standard
  - Luxury
  - SUV
  - Electric
  - Mini
  - Midi
  - Maxi
  - Scooter
  - Bus
  - Truck
  - Caravan
- Category icons for visual recognition
- Multi-select with OR logic

**Capacity Filters**
- Number of Seats: Dropdown or slider (2-9+ seats)
- Number of Doors: Checkbox group (2, 4, 5 doors)
- Visual indicators showing capacity

**Feature Filters**
- Checkbox group for specific features:
  - Apple CarPlay
  - Android Auto
  - Heated Seats
  - Isofix Child Seat Points
  - Pet-Friendly
  - GPS Navigation
  - Bluetooth
  - Touchscreen
  - Backup Camera
  - Sunroof
  - Leather Seats
- Search box for quick feature lookup
- "Show more" expansion for less common features
- Feature icons for visual scanning

**Fuel Policy Filter**
- Radio buttons for policies:
  - Like-for-like
  - Free Tank
  - Full-to-Full
  - Full-to-Empty
- Tooltip explaining each policy
- Single selection

**Price Range Filter**
- Dual-handle range slider
- Minimum and maximum price inputs
- Currency display based on user locale
- Real-time result count update as slider moves
- Price per day indicator

**Mileage Filter**
- Radio buttons or toggle:
  - Unlimited Mileage
  - Limited Mileage
- Display mileage limits when applicable

**Supplier Filter**
- Searchable dropdown or checkbox list
- Supplier logos for recognition
- Multi-select capability
- "Select All" / "Deselect All" options

**Rating Filter**
- Star rating selector (minimum rating threshold)
- Visual star display (1-5 stars)
- Review count indicator per rating level

**Accessibility Filter**
- Checkbox group for accessibility features:
  - Hand Controls
  - Wheelchair Ramps
  - Accessible Modifications
- Clear labeling and descriptions
- Prominent placement for visibility

**Active Filters Display**
- Chip/tag components showing applied filters
- Individual remove (X) button per filter
- "Clear All" button when multiple filters active
- Compact display above results
- Mobile-optimized layout

**Result Count Indicator**
- Real-time count of matching vehicles
- Updates immediately as filters change
- Format: "Showing X vehicles" or "X vehicles match your filters"
- Prominent placement near filter controls

### User Flows

**Basic Filtering Flow**
1. User arrives at search results page with initial results
2. User opens filter panel (auto-open on desktop, tap to open on mobile)
3. User selects desired filter criteria (e.g., "Automatic" transmission)
4. System updates results in real-time without page reload
5. Result count updates to show filtered count
6. Active filter appears as chip above results
7. User continues adding filters as needed
8. User can remove individual filters or clear all

**Advanced Multi-Criteria Flow**
1. User applies multiple filters across categories
2. System applies AND logic between categories (e.g., SUV AND Automatic AND Under $50/day)
3. System applies OR logic within categories (e.g., Electric OR Hybrid)
4. Results narrow progressively with each filter
5. If no results match, system displays "No vehicles match your filters" with suggestions
6. User can adjust filters to broaden search

**Mobile Filtering Flow**
1. User taps "Filters" button at top of results
2. Filter drawer slides up from bottom
3. User selects filters in drawer
4. User taps "Apply Filters" button
5. Drawer closes and results update
6. Active filters shown as chips with count badge on filter button

**Filter Persistence Flow**
1. User applies filters and views results
2. User navigates to vehicle detail page
3. User returns to search results (back button)
4. System preserves applied filters and scroll position
5. User can continue browsing with same filters

**Clear Filters Flow**
1. User has multiple active filters
2. User clicks "Clear All Filters" button
3. System removes all filters and returns to unfiltered results
4. Result count updates to show total available vehicles

### Data Requirements

**From Backend APIs**

GET `/api/vehicles/search`
- Query parameters for all filter criteria
- Returns filtered vehicle list with metadata
- Includes result count for current filters

GET `/api/vehicles/filters/options`
- Returns available filter options with counts
- Dynamic based on current search context (location, dates)
- Format:
```
{
  "fuelTypes": [
    { "value": "electric", "label": "Electric", "count": 45 },
    { "value": "hybrid", "label": "Hybrid", "count": 32 }
  ],
  "categories": [...],
  "features": [...],
  "suppliers": [...],
  "priceRange": { "min": 25, "max": 350 },
  "ratingRange": { "min": 1, "max": 5 }
}
```

GET `/api/vehicles/search/count`
- Returns count of vehicles matching current filters
- Used for real-time count updates
- Lightweight endpoint for performance

**State Management**
- Active filters state (Redux/Context)
- Filter options state
- Result count state
- Loading states for filter updates
- Filter panel open/closed state (mobile)

**Local Storage**
- Filter preferences for returning users
- Recently used filters
- Filter panel collapsed/expanded state

### Performance Considerations

- Debounce filter changes (300ms) to reduce API calls
- Optimistic UI updates for perceived performance
- Cache filter options to avoid repeated API calls
- Lazy load filter options for less common categories
- Implement virtual scrolling for long filter lists
- Progressive enhancement for slower connections

### Accessibility Requirements

- Keyboard navigation for all filter controls
- ARIA labels for screen readers
- Focus management when opening/closing filter panel
- Announce result count changes to screen readers
- High contrast mode support
- Touch target sizes minimum 44x44px for mobile

## Backend Specifications

### API Endpoints

**GET /api/vehicles/search**
- Purpose: Retrieve filtered vehicle search results
- Authentication: Optional (enhanced results for authenticated users)
- Query Parameters:
  - `location` (string, required): Pickup location ID
  - `pickupDate` (ISO 8601, required): Pickup date and time
  - `returnDate` (ISO 8601, required): Return date and time
  - `fuelTypes` (array): Fuel type filters (diesel, gasoline, electric, hybrid, plugin-hybrid)
  - `transmission` (string): Transmission type (manual, automatic)
  - `categories` (array): Vehicle categories
  - `minSeats` (integer): Minimum passenger capacity
  - `maxSeats` (integer): Maximum passenger capacity
  - `doors` (array): Number of doors (2, 4, 5)
  - `features` (array): Required feature codes
  - `fuelPolicy` (string): Fuel policy preference
  - `minPrice` (decimal): Minimum daily rate
  - `maxPrice` (decimal): Maximum daily rate
  - `mileage` (string): Mileage preference (unlimited, limited)
  - `suppliers` (array): Supplier IDs
  - `minRating` (decimal): Minimum customer rating (1-5)
  - `accessibility` (array): Accessibility feature codes
  - `page` (integer): Page number for pagination
  - `pageSize` (integer): Results per page (default 20, max 100)
  - `sortBy` (string): Sort field (price, distance, rating, etc.)
  - `sortOrder` (string): Sort direction (asc, desc)

- Response Schema (200 OK):
```json
{
  "vehicles": [
    {
      "id": "uuid",
      "make": "string",
      "model": "string",
      "year": "integer",
      "category": "string",
      "fuelType": "string",
      "transmission": "string",
      "seats": "integer",
      "doors": "integer",
      "features": ["string"],
      "dailyRate": "decimal",
      "fuelPolicy": "string",
      "mileage": "string",
      "supplierId": "uuid",
      "supplierName": "string",
      "rating": "decimal",
      "reviewCount": "integer",
      "imageUrl": "string",
      "available": "boolean"
    }
  ],
  "pagination": {
    "page": "integer",
    "pageSize": "integer",
    "totalResults": "integer",
    "totalPages": "integer"
  },
  "appliedFilters": {
    "fuelTypes": ["string"],
    "transmission": "string",
    ...
  }
}
```

- Error Responses:
  - 400 Bad Request: Invalid filter parameters
  - 404 Not Found: Location not found
  - 500 Internal Server Error: Server error

**GET /api/vehicles/filters/options**
- Purpose: Retrieve available filter options with result counts
- Authentication: Optional
- Query Parameters:
  - `location` (string, required): Pickup location ID
  - `pickupDate` (ISO 8601, required): Pickup date
  - `returnDate` (ISO 8601, required): Return date
  - `currentFilters` (object): Currently applied filters for dynamic counts

- Response Schema (200 OK):
```json
{
  "fuelTypes": [
    {
      "value": "electric",
      "label": "Electric",
      "count": 45,
      "available": true
    }
  ],
  "transmissions": [...],
  "categories": [...],
  "features": [...],
  "fuelPolicies": [...],
  "priceRange": {
    "min": 25.00,
    "max": 350.00,
    "currency": "USD"
  },
  "suppliers": [...],
  "ratingRange": {
    "min": 1.0,
    "max": 5.0
  },
  "accessibilityFeatures": [...]
}
```

**GET /api/vehicles/search/count**
- Purpose: Get count of vehicles matching filters (lightweight endpoint)
- Authentication: Optional
- Query Parameters: Same as /api/vehicles/search
- Response Schema (200 OK):
```json
{
  "count": 127,
  "appliedFilters": {
    "fuelTypes": ["electric", "hybrid"],
    "transmission": "automatic"
  }
}
```

### Request/Response Schemas

**Filter Request Object**
```json
{
  "location": "uuid",
  "pickupDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-20T10:00:00Z",
  "filters": {
    "fuelTypes": ["electric", "hybrid"],
    "transmission": "automatic",
    "categories": ["suv", "luxury"],
    "minSeats": 5,
    "doors": [4, 5],
    "features": ["apple-carplay", "heated-seats"],
    "fuelPolicy": "full-to-full",
    "priceRange": {
      "min": 50.00,
      "max": 150.00
    },
    "mileage": "unlimited",
    "suppliers": ["uuid1", "uuid2"],
    "minRating": 4.0,
    "accessibility": ["hand-controls"]
  },
  "pagination": {
    "page": 1,
    "pageSize": 20
  },
  "sort": {
    "field": "price",
    "order": "asc"
  }
}
```

### Business Logic

**Filter Application Logic**
1. Parse and validate all filter parameters
2. Build dynamic SQL query with WHERE clauses for each filter
3. Apply AND logic between different filter categories
4. Apply OR logic within same filter category (e.g., multiple fuel types)
5. Join with availability table to ensure real-time availability
6. Join with supplier table for supplier filtering
7. Join with reviews table for rating filtering
8. Apply sorting based on sortBy parameter
9. Apply pagination
10. Return results with metadata

**Filter Validation**
- Validate date ranges (return after pickup)
- Validate price ranges (min <= max)
- Validate seat capacity (2-9+)
- Validate rating range (1.0-5.0)
- Sanitize all string inputs to prevent SQL injection
- Validate UUIDs for location and supplier IDs

**Performance Optimization**
- Use database indexes on frequently filtered columns (fuelType, transmission, category, supplierId, rating)
- Implement query result caching with short TTL (30-60 seconds)
- Use database query optimization for complex multi-filter queries
- Implement connection pooling for database connections
- Use read replicas for search queries to reduce load on primary database

**Filter Count Calculation**
- Calculate available filter options based on current search context
- Show counts for each filter option (e.g., "Electric (45)")
- Disable filter options with zero results
- Update counts dynamically as filters are applied

### Authentication Requirements

**Public Access**
- Basic filtering available to all users
- Limited to standard filter options

**Authenticated Users**
- Access to saved filter preferences
- Personalized filter suggestions based on history
- Access to corporate policy filters (if applicable)
- Ability to save custom filter combinations

**Corporate Users**
- Automatic application of corporate policy filters
- Restricted filter options based on company policies
- Ability to request policy exceptions

### Rate Limiting

- 100 requests per minute per IP for unauthenticated users
- 500 requests per minute for authenticated users
- Implement exponential backoff for repeated requests
- Return 429 Too Many Requests with Retry-After header

## Database Specifications

### Schema Changes

**Vehicles Table Enhancements**
- Ensure comprehensive attribute columns exist for filtering
- Add indexes for filter performance

**Vehicle Features Junction Table**
- Many-to-many relationship between vehicles and features
- Enables efficient feature-based filtering

**Filter Analytics Table** (New)
- Track filter usage for optimization and insights

### Table Definitions

**vehicles table** (enhancements)
```sql
-- Existing columns assumed, adding/ensuring filter-relevant columns
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_type VARCHAR(50) NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS transmission VARCHAR(20) NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS seats INT NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS doors INT NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS fuel_policy VARCHAR(50);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS mileage_type VARCHAR(20);
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) NOT NULL;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS is_pet_friendly BOOLEAN DEFAULT FALSE;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS supplier_id CHAR(36) NOT NULL;

-- Add indexes for filter performance
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_type ON vehicles(fuel_type);
CREATE INDEX IF NOT EXISTS idx_vehicles_transmission ON vehicles(transmission);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_seats ON vehicles(seats);
CREATE INDEX IF NOT EXISTS idx_vehicles_doors ON vehicles(doors);
CREATE INDEX IF NOT EXISTS idx_vehicles_daily_rate ON vehicles(daily_rate);
CREATE INDEX IF NOT EXISTS idx_vehicles_supplier_id ON vehicles(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_fuel_policy ON vehicles(fuel_policy);
CREATE INDEX IF NOT EXISTS idx_vehicles_mileage_type ON vehicles(mileage_type);
```

**vehicle_features table** (new junction table)
```sql
CREATE TABLE IF NOT EXISTS vehicle_features (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  feature_code VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  UNIQUE KEY unique_vehicle_feature (vehicle_id, feature_code),
  INDEX idx_vehicle_features_vehicle_id (vehicle_id),
  INDEX idx_vehicle_features_feature_code (feature_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**features table** (reference table)
```sql
CREATE TABLE IF NOT EXISTS features (
  code VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  icon_url VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_features_category (category),
  INDEX idx_features_display_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**accessibility_features table** (new)
```sql
CREATE TABLE IF NOT EXISTS accessibility_features (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  vehicle_id CHAR(36) NOT NULL,
  feature_type VARCHAR(50) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  INDEX idx_accessibility_vehicle_id (vehicle_id),
  INDEX idx_accessibility_feature_type (feature_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**filter_analytics table** (new)
```sql
CREATE TABLE IF NOT EXISTS filter_analytics (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  session_id VARCHAR(100),
  filter_type VARCHAR(50) NOT NULL,
  filter_value VARCHAR(255) NOT NULL,
  result_count INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_filter_analytics_user_id (user_id),
  INDEX idx_filter_analytics_filter_type (filter_type),
  INDEX idx_filter_analytics_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**vehicles ↔ vehicle_features ↔ features**
- Many-to-many relationship
- A vehicle can have multiple features
- A feature can belong to multiple vehicles
- Junction table: vehicle_features

**vehicles → accessibility_features**
- One-to-many relationship
- A vehicle can have multiple accessibility features
- Each accessibility feature belongs to one vehicle

**vehicles → suppliers**
- Many-to-one relationship
- Multiple vehicles belong to one supplier
- Foreign key: supplier_id in vehicles table

**vehicles → reviews**
- One-to-many relationship (existing)
- Used for rating-based filtering
- Aggregate rating calculated from reviews

### Indexes

**Performance Indexes**
```sql
-- Composite indexes for common filter combinations
CREATE INDEX idx_vehicles_category_transmission ON vehicles(category, transmission);
CREATE INDEX idx_vehicles_fuel_type_category ON vehicles(fuel_type, category);
CREATE INDEX idx_vehicles_price_category ON vehicles(daily_rate, category);
CREATE INDEX idx_vehicles_seats_doors ON vehicles(seats, doors);

-- Full-text search index for vehicle search
CREATE FULLTEXT INDEX idx_vehicles_search ON vehicles(make, model, category);

-- Covering index for common queries
CREATE INDEX idx_vehicles_search_covering ON vehicles(
  category, fuel_type, transmission, daily_rate, seats, supplier_id
);
```

**Query Optimization**
- Use EXPLAIN ANALYZE to optimize complex filter queries
- Monitor slow query log for queries exceeding 1 second
- Implement query result caching at application layer
- Use database query cache for repeated identical queries

### Data Migration

**Initial Feature Data Population**
```sql
-- Insert standard features
INSERT INTO features (code, name, category, display_order) VALUES
('apple-carplay', 'Apple CarPlay', 'connectivity', 1),
('android-auto', 'Android Auto', 'connectivity', 2),
('heated-seats', 'Heated Seats', 'comfort', 3),
('isofix', 'Isofix Child Seat Points', 'safety', 4),
('gps', 'GPS Navigation', 'navigation', 5),
('bluetooth', 'Bluetooth', 'connectivity', 6),
('touchscreen', 'Touchscreen', 'technology', 7),
('backup-camera', 'Backup Camera', 'safety', 8),
('sunroof', 'Sunroof', 'comfort', 9),
('leather-seats', 'Leather Seats', 'comfort', 10);
```

**Migrate Existing Vehicle Data**
```sql
-- Update vehicles with default values if columns are new
UPDATE vehicles SET fuel_policy = 'full-to-full' WHERE fuel_policy IS NULL;
UPDATE vehicles SET mileage_type = 'unlimited' WHERE mileage_type IS NULL;
```

## Technology Stack

- **Backend**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **State Management**: Redux Toolkit or React Context API
- **API Communication**: Axios or Fetch API with React Query for caching
- **UI Components**: Tailwind CSS with custom filter components
- **Performance**: Redis for query result caching (optional)

## Implementation Notes

### Filter Logic Complexity
The AND/OR logic between and within filter categories requires careful implementation. Within a category (e.g., fuel types), use OR logic so selecting "Electric OR Hybrid" shows vehicles matching either. Between categories (e.g., fuel type AND transmission), use AND logic so results must match all selected criteria.

### Real-Time Updates
Implement debouncing (300ms delay) on filter changes to prevent excessive API calls while maintaining responsive feel. Use optimistic UI updates to show filter application immediately while API request is in flight.

### Mobile Optimization
On mobile devices, use a bottom drawer for filters instead of sidebar. Include "Apply Filters" button to batch filter changes and reduce API calls. Show active filter count badge on filter button.

### Accessibility Priority
Accessibility filters should be prominently displayed and easy to find. Consider dedicated accessibility search mode for users who primarily need these features.

### Performance Monitoring
Monitor filter query performance and optimize slow queries. Track most-used filter combinations to optimize indexes. Consider pre-computing common filter combinations during off-peak hours.

### Future Enhancements
- Save custom filter combinations as "presets"
- Share filter combinations via URL
- AI-powered filter suggestions based on user behavior
- Voice-activated filter selection
- Filter recommendations based on trip context (business vs. leisure)

### Testing Considerations
- Test all filter combinations for correct AND/OR logic
- Test edge cases (no results, all filters applied)
- Test performance with large result sets
- Test mobile drawer behavior
- Test accessibility with screen readers
- Test filter persistence across navigation
- Load test filter endpoints under high concurrency

## Success Metrics

- Filter usage rate (% of searches using filters)
- Average number of filters applied per search
- Conversion rate improvement with filtering
- Time to find desired vehicle (reduced with filtering)
- Filter abandonment rate (users who apply filters then clear them)
- Most popular filter combinations
- Mobile vs. desktop filter usage patterns
- Accessibility filter usage rate

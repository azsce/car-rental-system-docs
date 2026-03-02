# Feature: Multi-Criteria Filtering

## Overview

The Multi-Criteria Filtering feature provides customers with comprehensive filtering capabilities to narrow vehicle search results based on detailed characteristics, features, and preferences. This system enables efficient vehicle discovery by allowing users to specify exact requirements across multiple dimensions including vehicle type, transmission, capacity, features, fuel policy, price range, mileage, supplier, rating, and accessibility options.

The filtering system uses real-time updates, intelligent filter logic (OR within categories, AND across categories), and preserves filter state across navigation, ensuring a smooth and efficient search experience for all user segments from budget-conscious travelers to premium customers with specific requirements.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-004: Granular Multi-Criteria Filtering
- F-WF-SRCH-003: Multi-Criteria Filtering Workflow

## User Stories

### Story 1: Budget-Conscious Filtering
As a budget-conscious customer, I want to filter vehicles by price range and essential features, so that I can find affordable vehicles that meet my basic needs without browsing expensive options.

### Story 2: Specific Requirements Filtering
As a customer with specific needs (family trip, accessibility, pet travel), I want to filter by detailed characteristics like passenger capacity, pet-friendly options, and accessibility features, so that I can efficiently find vehicles matching my exact requirements.

### Story 3: Feature-Based Selection
As a tech-savvy customer, I want to filter vehicles by modern features like Apple CarPlay, Android Auto, and backup cameras, so that I can ensure my rental has the connectivity and convenience features I expect.

### Story 4: Eco-Conscious Filtering
As an environmentally conscious customer, I want to filter by fuel type (electric, hybrid) and eco-friendly options, so that I can make sustainable rental choices aligned with my values.

### Story 5: Corporate Policy Filtering
As a corporate traveler, I want to filter by vehicle category and price limits, so that I can quickly find policy-compliant vehicles without manual verification.

## Frontend Specifications

### Pages

#### Search Results Page with Filter Panel
- Main search results page with left sidebar or collapsible filter panel
- Filter panel displays all available filter categories
- Results grid/list view updates in real-time as filters are applied
- Mobile: Collapsible filter drawer accessible via "Filters" button

### UI Components

#### Filter Panel Container
- Collapsible sections for each filter category
- Sticky positioning on desktop for easy access while scrolling
- "Clear All Filters" button at top of panel
- Active filter count badge
- Responsive design: sidebar on desktop, drawer on mobile

#### Price Range Filter
- Dual-handle slider for minimum and maximum daily rate
- Input fields showing current min/max values
- Real-time price range display (e.g., "$25 - $150 per day")
- Currency symbol based on user's locale
- Debounced updates (300ms) to avoid excessive queries

#### Vehicle Type Filter (Fuel Type)
- Checkbox group with options:
  - Diesel
  - Gasoline
  - Electric
  - Hybrid
  - Plug-in Hybrid
- Icon for each fuel type
- Result count per option (e.g., "Electric (12)")
- Multi-select with OR logic

#### Transmission Filter
- Radio buttons or toggle:
  - Manual
  - Automatic
- Single or multi-select option
- Clear visual indication of selection

#### Vehicle Category Filter
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
- Vehicle icon for each category
- Result count per category
- Multi-select with OR logic

#### Capacity Filters
- **Passenger Capacity**: Dropdown or button group
  - Options: 2, 4, 5, 7, 9+ seats
  - "At least X seats" logic
- **Number of Doors**: Checkbox group
  - Options: 2, 4, 5 doors
  - Multi-select with OR logic

#### Features Filter
- Expandable checkbox list with search capability
- Grouped features:
  - **Connectivity**: Apple CarPlay, Android Auto, Bluetooth, Touchscreen
  - **Comfort**: Heated seats, Leather seats, Sunroof, GPS navigation
  - **Safety**: Backup camera, Isofix child seat points
  - **Special**: Pet-friendly
- "Show more" / "Show less" toggle for long lists
- Result count per feature
- Multi-select with OR logic within group, AND across groups

#### Fuel Policy Filter
- Radio buttons or dropdown:
  - Like-for-like
  - Free tank
  - Full-to-full
  - Full-to-empty
- Tooltip explaining each policy
- Single selection

#### Mileage Filter
- Radio buttons:
  - Unlimited mileage
  - Limited mileage
- Display mileage limits when available

#### Supplier Filter
- Searchable dropdown or checkbox list
- Supplier logo/name display
- Supplier rating display
- Result count per supplier
- Multi-select with OR logic
- "Show only preferred suppliers" quick filter

#### Rating Filter
- Star rating selector (minimum rating threshold)
- Options: 3+, 4+, 4.5+ stars
- Visual star display
- Result count per rating threshold

#### Accessibility Filter
- Checkbox group:
  - Hand controls
  - Wheelchair ramps
  - Accessible modifications
- Multi-select with OR logic
- Clear labeling for accessibility features

#### Active Filters Display
- Horizontal chip/tag display above results
- Each active filter shown as removable chip
- Click "X" to remove individual filter
- "Clear all" option
- Filter count indicator (e.g., "5 filters applied")

#### Filter Application Feedback
- Loading skeleton during filter updates
- Result count updates in real-time
- "No results" state with suggestions to remove filters
- Smooth transitions when results update

### User Flows

#### Flow 1: Apply Multiple Filters
1. User views search results page
2. User opens filter panel (if collapsed on mobile)
3. User selects vehicle category (e.g., "SUV")
4. Results update immediately showing only SUVs
5. User selects transmission type (e.g., "Automatic")
6. Results update showing automatic SUVs
7. User adjusts price range slider to $50-$100/day
8. Results update showing automatic SUVs in price range
9. User selects features (e.g., "Apple CarPlay", "Backup Camera")
10. Results update showing matching vehicles
11. Active filters displayed as chips above results
12. User reviews filtered results

#### Flow 2: Remove Filters
1. User has multiple filters applied
2. User clicks "X" on specific filter chip
3. That filter is removed, results update
4. OR user clicks "Clear All Filters"
5. All filters removed, full results displayed
6. Filter panel resets to default state

#### Flow 3: No Results Recovery
1. User applies multiple restrictive filters
2. System shows "No results found" message
3. System suggests: "Try removing some filters"
4. System highlights most restrictive filters
5. User removes one filter at a time
6. Results reappear when filters are relaxed

#### Flow 4: Mobile Filter Experience
1. User on mobile views search results
2. User taps "Filters" button
3. Filter drawer slides up from bottom
4. User applies filters in drawer
5. User sees result count update in drawer header
6. User taps "Show X Results" button
7. Drawer closes, filtered results displayed
8. Active filters shown as chips

### Data Requirements

#### Filter Options Data
```
GET /api/search/filter-options?location={locationId}&dates={dateRange}

Response:
{
  "fuelTypes": [
    { "id": "diesel", "name": "Diesel", "count": 45 },
    { "id": "gasoline", "name": "Gasoline", "count": 120 },
    { "id": "electric", "name": "Electric", "count": 12 },
    { "id": "hybrid", "name": "Hybrid", "count": 18 },
    { "id": "plugin-hybrid", "name": "Plug-in Hybrid", "count": 8 }
  ],
  "transmissions": [
    { "id": "manual", "name": "Manual", "count": 85 },
    { "id": "automatic", "name": "Automatic", "count": 118 }
  ],
  "categories": [
    { "id": "economy", "name": "Economy", "count": 45, "icon": "economy-icon.svg" },
    { "id": "suv", "name": "SUV", "count": 32, "icon": "suv-icon.svg" },
    ...
  ],
  "features": [
    { "id": "apple-carplay", "name": "Apple CarPlay", "count": 67, "group": "connectivity" },
    { "id": "backup-camera", "name": "Backup Camera", "count": 89, "group": "safety" },
    ...
  ],
  "suppliers": [
    { "id": "supplier-1", "name": "Premium Rentals", "rating": 4.8, "count": 45 },
    ...
  ],
  "priceRange": {
    "min": 25,
    "max": 350,
    "currency": "USD"
  },
  "capacities": {
    "seats": [2, 4, 5, 7, 9],
    "doors": [2, 4, 5]
  }
}
```

#### Filtered Search Results
```
GET /api/vehicles/search?filters={filterParams}

Request Parameters:
- location: string
- pickupDate: ISO datetime
- returnDate: ISO datetime
- fuelTypes: array of strings
- transmission: array of strings
- categories: array of strings
- minSeats: number
- doors: array of numbers
- features: array of strings
- fuelPolicy: string
- minPrice: number
- maxPrice: number
- mileage: string (unlimited/limited)
- suppliers: array of strings
- minRating: number
- accessibility: array of strings

Response: Array of vehicle objects with filtered results
```

## Backend Specifications

### API Endpoints

#### GET /api/search/filter-options
**Purpose**: Retrieve available filter options with result counts for current search context

**Query Parameters**:
- `location` (required): Location ID for search
- `pickupDate` (required): ISO datetime for pickup
- `returnDate` (required): ISO datetime for return
- `currentFilters` (optional): JSON object of currently applied filters

**Response Schema**:
```json
{
  "fuelTypes": [{ "id": "string", "name": "string", "count": "number" }],
  "transmissions": [{ "id": "string", "name": "string", "count": "number" }],
  "categories": [{ "id": "string", "name": "string", "count": "number", "icon": "string" }],
  "features": [{ "id": "string", "name": "string", "count": "number", "group": "string" }],
  "suppliers": [{ "id": "string", "name": "string", "rating": "number", "count": "number" }],
  "priceRange": { "min": "number", "max": "number", "currency": "string" },
  "capacities": { "seats": ["number"], "doors": ["number"] },
  "fuelPolicies": [{ "id": "string", "name": "string", "description": "string" }],
  "accessibilityFeatures": [{ "id": "string", "name": "string", "count": "number" }]
}
```

**Status Codes**:
- 200: Success
- 400: Invalid parameters
- 500: Server error

#### GET /api/vehicles/search
**Purpose**: Search vehicles with applied filters

**Query Parameters**:
- `location` (required): string
- `pickupDate` (required): ISO datetime
- `returnDate` (required): ISO datetime
- `fuelTypes` (optional): comma-separated string
- `transmission` (optional): comma-separated string
- `categories` (optional): comma-separated string
- `minSeats` (optional): number
- `doors` (optional): comma-separated numbers
- `features` (optional): comma-separated string
- `fuelPolicy` (optional): string
- `minPrice` (optional): number
- `maxPrice` (optional): number
- `mileage` (optional): "unlimited" or "limited"
- `suppliers` (optional): comma-separated string
- `minRating` (optional): number (0-5)
- `accessibility` (optional): comma-separated string
- `page` (optional): number (default: 1)
- `pageSize` (optional): number (default: 20)
- `sortBy` (optional): string (price, rating, distance)

**Response Schema**:
```json
{
  "results": [
    {
      "vehicleId": "string",
      "make": "string",
      "model": "string",
      "year": "number",
      "category": "string",
      "fuelType": "string",
      "transmission": "string",
      "seats": "number",
      "doors": "number",
      "features": ["string"],
      "dailyRate": "number",
      "totalCost": "number",
      "supplier": { "id": "string", "name": "string", "rating": "number" },
      "rating": "number",
      "reviewCount": "number",
      "imageUrl": "string",
      "available": "boolean"
    }
  ],
  "totalResults": "number",
  "page": "number",
  "pageSize": "number",
  "appliedFilters": { "object" }
}
```

**Status Codes**:
- 200: Success
- 400: Invalid filter parameters
- 404: No results found
- 500: Server error

### Request Schemas

#### Filter Options Request
```csharp
public class FilterOptionsRequest
{
    [Required]
    public string Location { get; set; }
    
    [Required]
    public DateTime PickupDate { get; set; }
    
    [Required]
    public DateTime ReturnDate { get; set; }
    
    public Dictionary<string, object> CurrentFilters { get; set; }
}
```

#### Vehicle Search Request
```csharp
public class VehicleSearchRequest
{
    [Required]
    public string Location { get; set; }
    
    [Required]
    public DateTime PickupDate { get; set; }
    
    [Required]
    public DateTime ReturnDate { get; set; }
    
    public List<string> FuelTypes { get; set; }
    public List<string> Transmission { get; set; }
    public List<string> Categories { get; set; }
    public int? MinSeats { get; set; }
    public List<int> Doors { get; set; }
    public List<string> Features { get; set; }
    public string FuelPolicy { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string Mileage { get; set; }
    public List<string> Suppliers { get; set; }
    public decimal? MinRating { get; set; }
    public List<string> Accessibility { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortBy { get; set; } = "price";
}
```

### Response Schemas

See API endpoint response schemas above.

### Business Logic

#### Filter Logic Implementation
1. **OR Logic Within Categories**: When multiple options within same category are selected (e.g., "Manual OR Automatic"), return vehicles matching ANY selected option
2. **AND Logic Across Categories**: When filters across different categories are selected (e.g., "SUV AND Automatic AND Under $50/day"), return vehicles matching ALL category requirements
3. **Range Filters**: Price and capacity filters use inclusive ranges (minPrice <= vehiclePrice <= maxPrice)
4. **Minimum Threshold Filters**: Rating and capacity use "at least" logic (vehicle.rating >= minRating)
5. **Feature Matching**: Vehicle must have ALL selected features (AND logic for features)

#### Filter Count Calculation
- Calculate result counts for each filter option based on current search context
- Update counts dynamically as filters are applied
- Show zero counts for unavailable options but keep them selectable
- Optimize queries to calculate counts efficiently

#### Performance Optimization
- Index database columns used in filters (fuelType, transmission, category, price, rating)
- Cache filter options for common search contexts (15-minute TTL)
- Use database query optimization for complex filter combinations
- Implement pagination to limit result set size
- Use lazy loading for filter option lists with many items

#### Validation Rules
- Validate filter values against allowed options
- Ensure price range: minPrice <= maxPrice
- Validate date range: pickupDate < returnDate
- Sanitize input to prevent SQL injection
- Return 400 Bad Request for invalid filter combinations

### Authentication Requirements

- Public endpoint: No authentication required for basic search
- Optional authentication: Enhanced features for logged-in users (saved filters, personalized defaults)
- Corporate users: Apply corporate policy filters automatically based on user role
- Subscription users: Filter by subscription tier eligibility

## Database Specifications

### Schema Changes

No new tables required. Utilize existing vehicle and related tables with proper indexing.

### Table Definitions

#### Vehicles Table (Existing - Add Indexes)
```sql
-- Add indexes for filter performance
CREATE INDEX idx_vehicles_fuel_type ON Vehicles(FuelType);
CREATE INDEX idx_vehicles_transmission ON Vehicles(Transmission);
CREATE INDEX idx_vehicles_category ON Vehicles(Category);
CREATE INDEX idx_vehicles_seats ON Vehicles(Seats);
CREATE INDEX idx_vehicles_doors ON Vehicles(Doors);
CREATE INDEX idx_vehicles_daily_rate ON Vehicles(DailyRate);

-- Composite index for common filter combinations
CREATE INDEX idx_vehicles_search_filters 
ON Vehicles(FuelType, Transmission, Category, DailyRate, Seats);
```

#### VehicleFeatures Table (Existing - Add Index)
```sql
-- Index for feature filtering
CREATE INDEX idx_vehicle_features_feature_id ON VehicleFeatures(FeatureId);
CREATE INDEX idx_vehicle_features_vehicle_id ON VehicleFeatures(VehicleId);
```

#### VehicleSuppliers Table (Existing - Add Index)
```sql
-- Index for supplier filtering
CREATE INDEX idx_vehicle_suppliers_supplier_id ON VehicleSuppliers(SupplierId);
CREATE INDEX idx_vehicle_suppliers_rating ON VehicleSuppliers(Rating);
```

### Relationships

- Vehicles → VehicleFeatures (one-to-many): Vehicle has multiple features
- Vehicles → VehicleSuppliers (many-to-one): Vehicle belongs to one supplier
- Vehicles → VehicleCategories (many-to-one): Vehicle belongs to one category
- Vehicles → FuelPolicies (many-to-one): Vehicle has one fuel policy

### Indexes

#### Performance Indexes
```sql
-- Single-column indexes for individual filters
CREATE INDEX idx_vehicles_fuel_type ON Vehicles(FuelType);
CREATE INDEX idx_vehicles_transmission ON Vehicles(Transmission);
CREATE INDEX idx_vehicles_category ON Vehicles(Category);
CREATE INDEX idx_vehicles_daily_rate ON Vehicles(DailyRate);
CREATE INDEX idx_vehicles_seats ON Vehicles(Seats);
CREATE INDEX idx_vehicles_doors ON Vehicles(Doors);
CREATE INDEX idx_vehicles_mileage_policy ON Vehicles(MileagePolicy);

-- Composite index for common filter combinations
CREATE INDEX idx_vehicles_search_filters 
ON Vehicles(Category, Transmission, FuelType, DailyRate);

-- Index for rating filter
CREATE INDEX idx_vehicles_rating ON Vehicles(AverageRating);

-- Index for supplier filter
CREATE INDEX idx_vehicles_supplier_id ON Vehicles(SupplierId);

-- Index for availability queries
CREATE INDEX idx_vehicles_available ON Vehicles(IsAvailable, LocationId);
```

#### Query Optimization
- Use covering indexes where possible to avoid table lookups
- Analyze query execution plans for filter combinations
- Consider materialized views for complex filter aggregations
- Implement query result caching for popular filter combinations

## Technology Stack

- **Backend**: .NET 8+ with C#, ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+, TypeScript
- **State Management**: React Context or Zustand for filter state
- **UI Components**: Tailwind CSS for styling, Headless UI for accessible components
- **API Communication**: Axios or Fetch API with React Query for caching
- **Performance**: Debouncing for slider inputs, lazy loading for filter options

## Implementation Notes

### Filter State Management
- Use URL query parameters to persist filter state (shareable URLs)
- Sync filter state with browser history for back/forward navigation
- Store filter preferences in local storage for returning users
- Clear filters on new search or location change

### Mobile Considerations
- Use bottom drawer for filter panel on mobile
- Implement touch-friendly controls (larger tap targets)
- Show result count in filter drawer header
- Provide "Apply Filters" button to close drawer and update results
- Consider filter presets for common combinations on mobile

### Accessibility
- Ensure all filter controls are keyboard accessible
- Provide ARIA labels for screen readers
- Use semantic HTML for filter groups
- Announce filter changes to screen readers
- Maintain focus management when opening/closing filter panel

### Performance
- Debounce price slider updates (300ms)
- Implement virtual scrolling for long filter lists
- Lazy load filter options as user scrolls
- Cache filter options for 15 minutes
- Use optimistic UI updates for perceived performance

### Testing Considerations
- Test filter combinations with various result sets
- Verify OR/AND logic works correctly
- Test edge cases (no results, all filters applied)
- Verify mobile filter drawer behavior
- Test accessibility with screen readers
- Performance test with large vehicle inventories

### Future Enhancements
- Save filter presets for quick access
- AI-powered filter suggestions based on user behavior
- Voice-activated filter application
- Advanced filter builder for power users
- Filter analytics to optimize default options

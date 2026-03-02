# Feature: Intelligent Search Results Sorting

## Overview

Intelligent Search Results Sorting provides customers with multiple sorting algorithms to organize vehicle search results according to their preferences and decision criteria. The feature offers eight distinct sorting options including price-based sorting, distance from pickup location, customer ratings, popularity metrics, newest additions, AI-powered personalized recommendations, availability windows, and eco-friendly prioritization. This flexibility enables users to quickly identify the most relevant vehicles based on their unique priorities, whether they're budget-conscious travelers seeking the lowest price, quality-focused customers prioritizing ratings, or eco-conscious users preferring low-emission vehicles.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SD-005: Intelligent Search Results Sorting (primary feature)
- F-WF-SRCH-005: Search Result Sorting (workflow integration)

**Note**: These features represent the same sorting capability documented from different perspectives - F-SD-005 describes the feature functionality, while F-WF-SRCH-005 describes how sorting integrates into the vehicle search workflow.

## User Stories

### Primary User Story
As a customer browsing vehicle search results, I want to sort vehicles by different criteria, so that I can prioritize vehicles based on my decision factors and find the best option quickly.

### Supporting User Stories

**Budget-Conscious Traveler**
As a budget-conscious customer, I want to sort vehicles by price from lowest to highest, so that I can immediately see the most affordable options.

**Quality-Focused Customer**
As a customer who values quality, I want to sort by customer rating, so that I can see the highest-rated vehicles first and avoid poor experiences.

**Convenience-Focused User**
As a customer prioritizing convenience, I want to sort by distance from my location, so that I can find the nearest available vehicles.

**Returning Customer**
As a returning customer with booking history, I want to see AI-recommended vehicles first, so that I receive personalized suggestions based on my preferences.

**Eco-Conscious User**
As an environmentally conscious customer, I want to sort by eco-friendliness, so that I can prioritize low-emission and electric vehicles.

**Flexible Traveler**
As a customer with flexible dates, I want to sort by availability, so that I can find vehicles with the longest availability windows.

**Early Adopter**
As a customer interested in new vehicles, I want to sort by newest additions, so that I can see the latest models in the fleet.

**Social Proof Seeker**
As a customer influenced by others' choices, I want to sort by popularity, so that I can see which vehicles are most frequently booked.

## Dependencies

- F-SD-001: Location-Based Search (provides base search results to sort)
- R-VS-004: Granular Multi-Criteria Filtering (sorting works with filtered results)
- Vehicle availability data
- Customer review and rating system
- Booking history data for popularity metrics
- User preference data for AI recommendations
- Vehicle emissions data for eco-friendly sorting

## Frontend Specifications

### Pages

**Search Results Page** (`/search`)
- Primary page displaying sortable vehicle results
- Sort control prominently placed above results
- Sort selection persists during session
- Visual indicator of current sort order

**Vehicle Listing Page** (`/vehicles`)
- Alternative entry point with sorting capabilities
- Same sorting options as search results
- Consistent UI across all vehicle browsing pages

### UI Components

**Sort Selector Component**
- Dropdown or segmented control for sort selection
- Desktop: Dropdown menu with icon
- Mobile: Bottom sheet or modal with radio buttons
- Current sort option clearly indicated
- Smooth transition when changing sort order

**Sort Options**:
```
- Price: Low to High
- Price: High to Low
- Distance: Nearest First
- Rating: Highest First
- Popularity: Most Booked
- Newest: Recently Added
- Recommended: For You (authenticated users)
- Availability: Longest Windows
- Eco-Friendly: Lowest Emissions
```

**Sort Dropdown (Desktop)**
- Label: "Sort by:"
- Dropdown button showing current selection
- Chevron icon indicating expandable menu
- Dropdown menu with all sort options
- Checkmark or highlight on selected option
- Hover states for better UX

**Sort Bottom Sheet (Mobile)**
- Trigger button: "Sort" with current selection subtitle
- Bottom sheet slides up from bottom
- Radio button list of all options
- "Apply" button to confirm selection
- Swipe down to dismiss gesture

**Sort Indicator**
- Text display: "Sorted by: [Option]"
- Positioned near results count
- Subtle styling to avoid visual clutter
- Updates immediately when sort changes

**Result Count with Sort Context**
- Format: "127 vehicles sorted by Price: Low to High"
- Provides context for current view
- Updates in real-time with sort changes

**AI Recommendation Badge** (for authenticated users)
- "Recommended for You" badge on vehicles
- Appears when "Recommended" sort is active
- Tooltip explaining recommendation basis
- Personalization indicator

**Eco-Friendly Badge**
- Green leaf icon on low-emission vehicles
- Appears prominently when eco-sort is active
- Shows CO2 emissions data
- Helps users identify sustainable choices

### User Flows

**Basic Sorting Flow**
1. User views search results with default sort (price: low to high)
2. User clicks sort dropdown/button
3. User selects desired sort option (e.g., "Rating: Highest First")
4. System reorders results immediately without page reload
5. Sort indicator updates to show new sort order
6. User continues browsing sorted results

**Mobile Sorting Flow**
1. User taps "Sort" button showing current sort
2. Bottom sheet slides up with sort options
3. User selects radio button for desired sort
4. User taps "Apply" button
5. Bottom sheet dismisses
6. Results reorder with smooth animation
7. Sort button updates to show new selection

**Authenticated User Recommendation Flow**
1. Logged-in user accesses search results
2. "Recommended" sort option is available and may be default
3. User selects "Recommended" sort
4. System applies AI-powered personalization
5. Results show vehicles matching user's historical preferences
6. Recommendation badges appear on suggested vehicles
7. User can switch to other sort options anytime

**Sort with Filters Flow**
1. User applies filters (e.g., "SUV", "Automatic")
2. Filtered results display with current sort
3. User changes sort order
4. System maintains filters while reordering results
5. Both filter and sort indicators remain visible
6. User can adjust either filters or sort independently

**Sort Persistence Flow**
1. User selects preferred sort option
2. User navigates to vehicle detail page
3. User returns to search results (back button)
4. System preserves selected sort order
5. User continues browsing with same sort
6. Sort preference persists for session duration

### Data Requirements

**From Backend APIs**

GET `/api/vehicles/search?sortBy={field}&sortOrder={direction}`
- Returns sorted vehicle list
- Supports all sort field options
- Includes sort metadata in response

**Sort Fields**:
- `price` - Daily rate sorting
- `distance` - Distance from pickup location
- `rating` - Average customer rating
- `popularity` - Booking frequency
- `newest` - Recently added vehicles
- `recommended` - AI-powered personalization (requires authentication)
- `availability` - Availability window length
- `eco` - Environmental impact (CO2 emissions)

**Sort Directions**:
- `asc` - Ascending order
- `desc` - Descending order

**Response Data Requirements**:
```json
{
  "vehicles": [...],
  "sorting": {
    "field": "price",
    "direction": "asc",
    "appliedAt": "2026-02-23T10:30:00Z"
  },
  "pagination": {...}
}
```

**Additional Data for Sort Options**:
- Distance calculations from user location to vehicle
- Aggregated rating data from reviews
- Booking count for popularity metrics
- Vehicle creation dates for newest sort
- User preference data for recommendations
- CO2 emissions data for eco-friendly sort
- Availability window calculations

**State Management**
- Current sort field and direction
- User's default sort preference (if authenticated)
- Sort history for analytics
- Loading state during sort operations

**Local Storage**
- Last used sort preference
- User's preferred default sort (if not authenticated)

### Performance Considerations

- Sort operations should complete within 500ms
- Use optimistic UI updates for perceived performance
- Cache sorted results for back navigation
- Implement smooth animations for result reordering
- Debounce rapid sort changes (unlikely but possible)
- Lazy load images during reordering to maintain smoothness

### Accessibility Requirements

- Keyboard navigation for sort dropdown
- ARIA labels for sort controls
- Screen reader announcements when sort changes
- Focus management when opening/closing sort menu
- High contrast mode support for sort indicators
- Touch target sizes minimum 44x44px for mobile

### Responsive Design

**Desktop (≥1024px)**
- Sort dropdown in header area
- Inline with search controls
- Hover states for better UX
- Keyboard shortcuts (optional)

**Tablet (768px - 1023px)**
- Sort dropdown or segmented control
- Positioned above results grid
- Touch-optimized tap targets

**Mobile (<768px)**
- Sort button with bottom sheet
- Full-width sort options
- Large tap targets for easy selection
- Swipe gestures for dismissal

## Backend Specifications

### API Endpoints

**GET /api/v1/vehicles/search**
- Enhanced with sorting parameters
- Supports all sort field options
- Returns sorted results with metadata

**Query Parameters** (sorting-specific):
- `sortBy` (string, optional): Sort field (price, distance, rating, popularity, newest, recommended, availability, eco)
- `sortOrder` (string, optional): Sort direction (asc, desc)
- Default: `sortBy=price&sortOrder=asc`

**Response Enhancement**:
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "uuid",
        "make": "Tesla",
        "model": "Model 3",
        "dailyRate": 89.99,
        "distance": 2.3,
        "rating": 4.8,
        "reviewCount": 342,
        "bookingCount": 156,
        "createdAt": "2024-01-15T00:00:00Z",
        "co2Emissions": 0,
        "availabilityDays": 28,
        "recommendationScore": 0.87
      }
    ],
    "sorting": {
      "field": "price",
      "direction": "asc",
      "appliedAt": "2026-02-23T10:30:00Z"
    },
    "pagination": {...}
  }
}
```

### Request/Response Schemas

**Sort Request Parameters**:
```typescript
interface SortParameters {
  sortBy?: 'price' | 'distance' | 'rating' | 'popularity' | 'newest' | 'recommended' | 'availability' | 'eco';
  sortOrder?: 'asc' | 'desc';
}
```

**Sort Metadata Response**:
```typescript
interface SortMetadata {
  field: string;
  direction: 'asc' | 'desc';
  appliedAt: string; // ISO 8601 timestamp
  isDefault: boolean;
  isPersonalized: boolean; // true for 'recommended' sort
}
```

### Business Logic

**Sort Field Mapping**:
- `price` → `vehicles.daily_rate`
- `distance` → Calculated distance from user location
- `rating` → `vehicles.average_rating`
- `popularity` → `vehicles.booking_count`
- `newest` → `vehicles.created_at`
- `recommended` → AI-calculated recommendation score
- `availability` → Calculated availability window length
- `eco` → `vehicles.co2_emissions`

**Default Sort Logic**:
- Unauthenticated users: `price` ascending
- Authenticated users without history: `price` ascending
- Authenticated users with history: `recommended` descending
- Can be overridden by user selection

**Distance Calculation**:
- Calculate distance from user's current location (if available)
- Or from selected pickup location
- Use Haversine formula for accuracy
- Cache calculations for performance

**Recommendation Score Calculation** (for authenticated users):
- Analyze user's booking history
- Consider vehicle categories previously booked
- Factor in price sensitivity
- Include feature preferences
- Weight recent bookings more heavily
- Collaborative filtering from similar users
- Real-time context (season, location, trip duration)

**Availability Window Calculation**:
- Calculate days between current date and next unavailable date
- Consider existing bookings
- Factor in maintenance schedules
- Return vehicles with longest availability first

### Authentication Requirements

**Public Access**:
- All sort options except "Recommended"
- Default sort: price ascending

**Authenticated Users**:
- Access to "Recommended" sort option
- Personalized default sort preference
- Sort preference saved to user profile
- Enhanced recommendation algorithms

### Performance Optimization

**Database Indexing**:
- Index on `daily_rate` for price sorting
- Index on `average_rating` for rating sorting
- Index on `booking_count` for popularity sorting
- Index on `created_at` for newest sorting
- Index on `co2_emissions` for eco sorting
- Composite indexes for common sort + filter combinations

**Caching Strategy**:
- Cache sorted results for 60 seconds
- Cache distance calculations for user session
- Cache recommendation scores for 5 minutes
- Invalidate cache on vehicle updates

**Query Optimization**:
- Use database-level sorting (ORDER BY)
- Limit result set before sorting when possible
- Use covering indexes to avoid table lookups
- Implement query result pagination

## Database Specifications

### Schema Changes

**Vehicles Table Enhancements**:
```sql
-- Ensure sorting-relevant columns exist
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS booking_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS co2_emissions DECIMAL(8,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS last_booked_at TIMESTAMP NULL;

-- Add indexes for sorting performance
CREATE INDEX IF NOT EXISTS idx_vehicles_daily_rate ON vehicles(daily_rate);
CREATE INDEX IF NOT EXISTS idx_vehicles_average_rating ON vehicles(average_rating);
CREATE INDEX IF NOT EXISTS idx_vehicles_booking_count ON vehicles(booking_count);
CREATE INDEX IF NOT EXISTS idx_vehicles_created_at ON vehicles(created_at);
CREATE INDEX IF NOT EXISTS idx_vehicles_co2_emissions ON vehicles(co2_emissions);
CREATE INDEX IF NOT EXISTS idx_vehicles_last_booked_at ON vehicles(last_booked_at);
```

### Indexes for Sorting

**Single-Column Sort Indexes**:
```sql
-- Price sorting
CREATE INDEX idx_vehicles_price_sort ON vehicles(daily_rate, id);

-- Rating sorting
CREATE INDEX idx_vehicles_rating_sort ON vehicles(average_rating DESC, id);

-- Popularity sorting
CREATE INDEX idx_vehicles_popularity_sort ON vehicles(booking_count DESC, id);

-- Newest sorting
CREATE INDEX idx_vehicles_newest_sort ON vehicles(created_at DESC, id);

-- Eco-friendly sorting
CREATE INDEX idx_vehicles_eco_sort ON vehicles(co2_emissions ASC, id);
```

**Composite Sort + Filter Indexes**:
```sql
-- Common: Category filter + Price sort
CREATE INDEX idx_vehicles_category_price ON vehicles(category, daily_rate, id);

-- Common: Active filter + Rating sort
CREATE INDEX idx_vehicles_active_rating ON vehicles(is_active, average_rating DESC, id);

-- Common: Fuel type filter + Eco sort
CREATE INDEX idx_vehicles_fuel_eco ON vehicles(fuel_type, co2_emissions, id);
```

### Triggers for Denormalized Data

**Update Booking Count Trigger**:
```sql
DELIMITER //

CREATE TRIGGER trg_update_booking_count_after_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
  IF NEW.status = 'completed' THEN
    UPDATE vehicles
    SET 
      booking_count = booking_count + 1,
      last_booked_at = NEW.created_at
    WHERE id = NEW.vehicle_id;
  END IF;
END//

CREATE TRIGGER trg_update_booking_count_after_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
  IF OLD.status != 'completed' AND NEW.status = 'completed' THEN
    UPDATE vehicles
    SET 
      booking_count = booking_count + 1,
      last_booked_at = NEW.updated_at
    WHERE id = NEW.vehicle_id;
  ELSIF OLD.status = 'completed' AND NEW.status != 'completed' THEN
    UPDATE vehicles
    SET booking_count = GREATEST(0, booking_count - 1)
    WHERE id = NEW.vehicle_id;
  END IF;
END//

DELIMITER ;
```

### Recommendation Score Table

**User Vehicle Preferences** (for AI recommendations):
```sql
CREATE TABLE IF NOT EXISTS user_vehicle_preferences (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) NOT NULL,
  vehicle_id CHAR(36) NOT NULL,
  preference_score DECIMAL(5,4) NOT NULL,
  last_calculated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  
  UNIQUE KEY unique_user_vehicle (user_id, vehicle_id),
  INDEX idx_user_preferences_user_id (user_id),
  INDEX idx_user_preferences_score (preference_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Technology Stack

- **Backend**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **State Management**: Redux Toolkit or Zustand for sort state
- **UI Components**: Tailwind CSS with custom dropdown/bottom sheet
- **Animations**: Framer Motion for smooth result reordering
- **Distance Calculation**: Haversine formula or mapping service API
- **AI/ML**: ML.NET or Python service for recommendation scoring

## Implementation Notes

### Sort Stability
Ensure sort is stable (maintains relative order of equal elements) by including vehicle ID as secondary sort key. This prevents results from jumping around on repeated sorts.

### Default Sort Strategy
For unauthenticated users, default to price ascending as it serves the broadest audience. For authenticated users with booking history, consider defaulting to "Recommended" to showcase personalization value.

### Distance Calculation Performance
Distance calculations can be expensive. Cache results per user session and recalculate only when location changes. Consider pre-calculating distances for popular locations.

### Recommendation Algorithm
Start with simple rule-based recommendations (category matching, price range matching) and evolve to ML-based collaborative filtering as data accumulates. Track recommendation click-through rates to measure effectiveness.

### Mobile UX Optimization
On mobile, use bottom sheet for sort selection rather than dropdown to provide larger tap targets and better thumb reachability. Include swipe-to-dismiss gesture for natural interaction.

### Sort Analytics
Track which sort options are most popular to inform future feature development and UI optimization. Monitor sort changes per session to understand user behavior.

### Future Enhancements
- Save custom sort preferences per user
- Multi-level sorting (primary + secondary sort)
- Sort by multiple criteria simultaneously
- A/B test different default sort strategies
- Voice-activated sort selection
- Smart sort that adapts to user behavior

### Testing Considerations
- Test all sort options with various data sets
- Verify sort stability with duplicate values
- Test sort performance with large result sets
- Test sort + filter combinations
- Test sort persistence across navigation
- Test mobile bottom sheet interactions
- Test accessibility with screen readers
- Load test sort endpoints under high concurrency

## Success Metrics

- Sort option usage distribution
- Average time to find desired vehicle (reduced with effective sorting)
- Conversion rate by sort option
- Recommendation sort click-through rate
- Sort changes per session (indicates exploration vs. satisfaction)
- Mobile vs. desktop sort usage patterns
- User satisfaction with sort options (survey data)
- Performance: Sort operation completion time (<500ms target)

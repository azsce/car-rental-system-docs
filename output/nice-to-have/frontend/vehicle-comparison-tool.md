# Feature: Vehicle Comparison Tool

## Overview

The Vehicle Comparison Tool enables customers to compare up to 4 vehicles side-by-side, displaying specifications, features, pricing, and supplier ratings in a structured comparison table. This feature helps customers make informed decisions by highlighting differences and similarities between vehicles, making it easier to evaluate options and select the best vehicle for their needs.

The comparison tool supports adding vehicles from search results, removing vehicles from comparison, and proceeding to book the selected vehicle directly from the comparison view.

## Sprint Category

nice-to-have

## Feature ID

F-WF-SRCH-004

## User Stories

### Primary User Story

As a customer evaluating multiple vehicles, I want to compare vehicles side-by-side, so that I can easily identify differences and make an informed booking decision.

### Supporting User Stories

1. As a customer with specific requirements, I want to compare vehicle specifications across multiple options, so that I can find the vehicle that best meets my needs.

2. As a budget-conscious customer, I want to compare pricing across vehicles, so that I can find the best value for my rental.

3. As a customer concerned about quality, I want to compare supplier ratings and reviews, so that I can choose a reliable vehicle and supplier.

4. As a customer on mobile, I want a mobile-optimized comparison view, so that I can compare vehicles easily on my smartphone.

## Frontend Specifications

### Pages

**Vehicle Comparison Page** (`/compare`)
- Dedicated comparison page showing selected vehicles side-by-side
- Accessible from search results via "Compare" button
- Shareable URL with vehicle IDs as query parameters
- Responsive design for mobile and desktop viewing

### UI Components

**Comparison Selection Component**
- "Add to Compare" button on vehicle cards in search results
- Comparison counter badge showing number of vehicles selected (e.g., "Compare (2)")
- Maximum 4 vehicles can be added to comparison
- Visual indicator on vehicle cards showing which are in comparison
- "View Comparison" button to navigate to comparison page

**Comparison Table Component**
- Horizontal scrollable table on mobile
- Fixed header row with vehicle images and names
- Rows for each specification category
- Highlight differences between vehicles
- Sticky column headers on scroll
- Responsive layout adapting to screen size

**Vehicle Column Component** (per vehicle in comparison)
- Vehicle image thumbnail
- Make, model, and year
- Overall rating (stars)
- "Remove from Comparison" button (X icon)
- "Book Now" button
- "View Details" link to full vehicle page

**Specification Rows**
- **Basic Info**: Category, transmission, fuel type
- **Capacity**: Seats, doors, luggage space
- **Features**: Checkmarks for available features
- **Pricing**: Daily rate, weekly rate, monthly rate
- **Insurance**: Available insurance options and costs
- **Mileage**: Mileage policy (unlimited/limited)
- **Supplier**: Supplier name and rating
- **Environmental**: CO2 emissions, eco-friendly badge
- **Availability**: Availability status for selected dates

**Feature Matrix Component**
- Grid showing feature availability across vehicles
- Checkmark (✓) for included features
- X mark (✗) for missing features
- Highlight unique features per vehicle
- Categorized features (Safety, Comfort, Technology)

**Pricing Comparison Component**
- Side-by-side pricing display
- Highlight lowest price in green
- Show price difference from lowest
- Include insurance and service costs
- Total estimated cost for rental period

**Action Buttons Component**
- "Remove All" button to clear comparison
- "Add More Vehicles" button (if less than 4)
- "Book Selected" button for chosen vehicle
- "Share Comparison" button with link copy

### User Flows

**Add Vehicles to Comparison Flow**
1. User views search results
2. User clicks "Add to Compare" on vehicle card
3. System adds vehicle to comparison list
4. System updates comparison counter badge
5. User adds more vehicles (up to 4 total)
6. User clicks "View Comparison" button
7. System navigates to comparison page

**View Comparison Flow**
1. User lands on comparison page
2. System loads details for all selected vehicles
3. System displays comparison table with all specifications
4. User scrolls through comparison rows
5. User identifies differences and similarities
6. User evaluates pricing and features
7. User decides on preferred vehicle

**Remove Vehicle from Comparison Flow**
1. User clicks "Remove" button on vehicle column
2. System removes vehicle from comparison
3. System updates comparison table layout
4. System updates comparison counter
5. User continues comparing remaining vehicles

**Book from Comparison Flow**
1. User reviews comparison and selects preferred vehicle
2. User clicks "Book Now" button on vehicle column
3. System verifies vehicle availability
4. System navigates to booking flow with vehicle selected
5. System preserves rental dates and search criteria

**Share Comparison Flow**
1. User clicks "Share Comparison" button
2. System generates shareable URL with vehicle IDs
3. System displays share options (copy link, email, social media)
4. User copies link or shares via selected method
5. Recipient opens link and views same comparison

### Data Requirements

**Comparison State Management**
- Array of selected vehicle IDs (max 4)
- Rental dates for pricing calculation
- Comparison preferences (sort order, highlighted features)
- Session persistence for comparison list

**Vehicle Data for Comparison**
- Vehicle ID, make, model, year
- Category, transmission, fuel type
- Seats, doors, luggage space
- Features list with categories
- Daily, weekly, monthly rates
- Insurance options and costs
- Mileage policy
- Supplier name and rating
- CO2 emissions and eco-friendly status
- Availability status for selected dates
- Vehicle image thumbnail

**Comparison Metadata**
- Number of vehicles in comparison
- Comparison creation timestamp
- Shareable comparison ID (for URL)

## Backend Specifications

### API Endpoints

**POST /api/compare**
- Purpose: Create comparison session and return comparison data
- Authentication: Optional
- Request Body: Array of vehicle IDs, pickup date, return date
- Response: Comparison object with all vehicle details
- Status Codes: 200 (Success), 400 (Invalid request), 404 (Vehicle not found)

**GET /api/compare/{comparisonId}**
- Purpose: Retrieve saved comparison by ID
- Authentication: Optional
- Request Parameters:
  - comparisonId (path parameter): Unique comparison identifier
- Response: Comparison object with vehicle details
- Status Codes: 200 (Success), 404 (Comparison not found)

**GET /api/vehicles/compare**
- Purpose: Retrieve comparison data for multiple vehicles
- Authentication: Optional
- Request Parameters:
  - vehicleIds (query parameter): Comma-separated vehicle IDs
  - pickupDate (query parameter): Rental start date
  - returnDate (query parameter): Rental end date
- Response: Array of vehicle comparison objects
- Status Codes: 200 (Success), 400 (Invalid parameters)

### Request Schemas

**Create Comparison Request**
```
POST /api/compare
{
  "vehicleIds": ["VEH-001", "VEH-002", "VEH-003"],
  "pickupDate": "2026-03-01T10:00:00Z",
  "returnDate": "2026-03-05T10:00:00Z"
}
```

**Get Comparison Request**
```
GET /api/vehicles/compare?vehicleIds=VEH-001,VEH-002,VEH-003&pickupDate=2026-03-01T10:00:00Z&returnDate=2026-03-05T10:00:00Z
```

### Response Schemas

**Comparison Response**
```
{
  "comparisonId": "CMP-12345",
  "createdAt": "2026-02-23T10:00:00Z",
  "pickupDate": "2026-03-01T10:00:00Z",
  "returnDate": "2026-03-05T10:00:00Z",
  "vehicles": [
    {
      "vehicleId": "VEH-001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "category": "Standard",
      "transmission": "Automatic",
      "fuelType": "Hybrid",
      "seats": 5,
      "doors": 4,
      "luggageSpace": 15.1,
      "features": [
        {"category": "Safety", "name": "Backup Camera"},
        {"category": "Technology", "name": "Apple CarPlay"}
      ],
      "pricing": {
        "daily": 65.00,
        "weekly": 390.00,
        "monthly": 1350.00,
        "currency": "USD"
      },
      "insuranceOptions": [
        {"type": "Full Insurance", "cost": 25.00}
      ],
      "mileagePolicy": "Unlimited",
      "supplier": {
        "name": "Premium Rentals",
        "rating": 4.7
      },
      "environmental": {
        "co2Emissions": 95,
        "ecoFriendly": true
      },
      "availability": "available",
      "imageUrl": "https://cdn.example.com/vehicles/VEH-001/thumb.jpg",
      "overallRating": 4.6
    }
  ]
}
```

### Business Logic

**Comparison Creation Logic**
1. Validate vehicle IDs (all must exist)
2. Validate date range (pickup before return)
3. Retrieve vehicle details for all vehicles
4. Calculate pricing for specified rental period
5. Check availability for all vehicles
6. Generate unique comparison ID
7. Store comparison session (optional, for sharing)
8. Return comparison object

**Feature Comparison Logic**
1. Collect all unique features across vehicles
2. Create feature matrix showing presence/absence
3. Identify unique features per vehicle
4. Categorize features for organized display
5. Return feature comparison data

**Pricing Comparison Logic**
1. Calculate total cost for each vehicle
2. Identify lowest-priced vehicle
3. Calculate price difference from lowest
4. Include insurance and service costs
5. Return pricing comparison data

### Authentication Requirements

**Public Access**
- Create comparison
- View comparison
- Retrieve comparison data

**No Authentication Required**
- All comparison functionality is public
- Comparison sessions can be shared via URL

## Database Specifications

### Schema Changes

**Comparisons Table** (new, optional for saving comparisons)
```sql
CREATE TABLE Comparisons (
    comparisonId VARCHAR(50) PRIMARY KEY,
    userId VARCHAR(50),
    pickupDate DATETIME NOT NULL,
    returnDate DATETIME NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME,
    
    FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE SET NULL,
    INDEX idx_comparison_expiry (expiresAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**ComparisonVehicles Table** (new, optional for saving comparisons)
```sql
CREATE TABLE ComparisonVehicles (
    comparisonVehicleId INT AUTO_INCREMENT PRIMARY KEY,
    comparisonId VARCHAR(50) NOT NULL,
    vehicleId VARCHAR(50) NOT NULL,
    vehicleOrder INT NOT NULL,
    
    FOREIGN KEY (comparisonId) REFERENCES Comparisons(comparisonId) ON DELETE CASCADE,
    FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
    INDEX idx_comparison_vehicles (comparisonId, vehicleOrder)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**Comparisons → ComparisonVehicles** (One-to-Many)
- One comparison has multiple vehicles
- Foreign key: ComparisonVehicles.comparisonId → Comparisons.comparisonId
- Cascade delete: Deleting comparison removes all vehicle associations

**ComparisonVehicles → Vehicles** (Many-to-One)
- Multiple comparisons can include same vehicle
- Foreign key: ComparisonVehicles.vehicleId → Vehicles.vehicleId

**Comparisons → Users** (Many-to-One, optional)
- Multiple comparisons can be created by one user
- Foreign key: Comparisons.userId → Users.userId
- Set NULL on user deletion

### Indexes

```sql
-- Comparison expiry for cleanup
CREATE INDEX idx_comparison_expiry ON Comparisons(expiresAt);

-- Vehicle lookup in comparison
CREATE INDEX idx_comparison_vehicles ON ComparisonVehicles(comparisonId, vehicleOrder);
```

### Sample Queries

**Create Comparison**
```sql
INSERT INTO Comparisons (comparisonId, userId, pickupDate, returnDate, expiresAt)
VALUES ('CMP-12345', 'USER-789', '2026-03-01 10:00:00', '2026-03-05 10:00:00', DATE_ADD(NOW(), INTERVAL 7 DAY));

INSERT INTO ComparisonVehicles (comparisonId, vehicleId, vehicleOrder)
VALUES 
    ('CMP-12345', 'VEH-001', 1),
    ('CMP-12345', 'VEH-002', 2),
    ('CMP-12345', 'VEH-003', 3);
```

**Retrieve Comparison**
```sql
SELECT 
    c.comparisonId,
    c.pickupDate,
    c.returnDate,
    c.createdAt,
    cv.vehicleId,
    cv.vehicleOrder,
    v.*
FROM Comparisons c
JOIN ComparisonVehicles cv ON c.comparisonId = cv.comparisonId
JOIN Vehicles v ON cv.vehicleId = v.vehicleId
WHERE c.comparisonId = 'CMP-12345'
ORDER BY cv.vehicleOrder;
```

**Cleanup Expired Comparisons**
```sql
DELETE FROM Comparisons
WHERE expiresAt < NOW();
```

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+ (optional, for saving comparisons)
- Frontend: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- State Management: React Context or Zustand for comparison state
- Caching: Session storage for comparison list

## Implementation Notes

**Performance Considerations**
- Limit comparison to 4 vehicles to avoid overwhelming UI
- Cache vehicle details for compared vehicles
- Use lazy loading for vehicle images
- Optimize comparison table rendering for mobile

**Mobile Optimization**
- Horizontal scrollable table for mobile
- Sticky column headers
- Swipe gestures for navigation
- Collapsible specification rows
- Simplified comparison view option

**Accessibility Considerations**
- Keyboard navigation for comparison table
- Screen reader support for comparison data
- Clear focus indicators
- Descriptive labels for all controls

**State Management**
- Store comparison list in session storage
- Persist comparison across page navigation
- Clear comparison on session end
- Support browser back/forward navigation

**Error Handling**
- Handle removed or unavailable vehicles gracefully
- Display error message for invalid vehicle IDs
- Provide fallback for failed data loading
- Allow partial comparison if some vehicles fail to load

**Future Enhancements**
- Save comparison for later viewing
- Email comparison to self or others
- Print-friendly comparison view
- Export comparison as PDF
- Compare more than 4 vehicles with pagination
- Advanced filtering within comparison
- Highlight recommended vehicle based on preferences

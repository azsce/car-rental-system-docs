# Feature: Environmental Impact Discovery

## Overview

The Environmental Impact Discovery feature provides comprehensive environmental information to support eco-conscious rental decisions. This feature displays detailed carbon emissions data, fuel efficiency metrics, eco-friendly badges, environmental comparisons, carbon offset options, EV-specific information, green routing suggestions, and sustainability scores for each vehicle in the rental fleet.

This feature serves environmentally conscious customers who prioritize sustainability in their transportation choices, corporate clients with ESG (Environmental, Social, Governance) reporting requirements, and users seeking to minimize their carbon footprint. By providing transparent environmental data, the platform enables informed decision-making aligned with sustainability goals.

**Note**: This feature has been categorized as "Exclude - Not needed for this project" based on stakeholder prioritization. This documentation is maintained for future reference and potential implementation in later phases.

## Sprint Category

excluded

## Feature ID

F-SD-012

## User Stories

### Primary User Story

As an eco-conscious customer, I want to view comprehensive environmental information for vehicles, so that I can make environmentally responsible rental decisions that align with my sustainability values.

### Supporting User Stories

1. As a corporate client with ESG goals, I want to see CO2 emissions data for vehicles, so that I can track and report on my company's carbon footprint from business travel.

2. As an environmentally aware customer, I want to easily identify electric and hybrid vehicles, so that I can prioritize low-emission transportation options.

3. As a customer concerned about climate change, I want to purchase carbon offsets for my rental, so that I can neutralize the environmental impact of my trip.

4. As an EV driver, I want to see battery range and charging information, so that I can plan my trip with confidence in electric vehicle capabilities.

5. As a sustainability-focused user, I want to compare environmental impact across similar vehicles, so that I can choose the most eco-friendly option in my preferred category.

6. As a customer planning a road trip in an EV, I want green routing suggestions with charging stations, so that I can travel confidently without range anxiety.

## Frontend Specifications

### Pages

**Vehicle Search Results Page** (`/search`)
- Environmental badges displayed on vehicle cards
- Eco-friendly filter option in search filters
- Sort by environmental impact option

**Vehicle Details Page** (`/vehicles/[vehicleId]`)
- Dedicated environmental information section
- Prominent eco-friendly badge if applicable
- Carbon offset option in booking flow

**Environmental Comparison Page** (`/vehicles/compare/environmental`)
- Side-by-side environmental comparison of selected vehicles
- Visual charts showing emissions differences
- Sustainability score breakdown

### UI Components

**Eco-Friendly Badge Component**
- Visual badge displayed on vehicle cards and detail pages
- Green leaf icon or similar environmental symbol
- Badge criteria: Electric vehicles, hybrids, or vehicles with emissions below category threshold
- Tooltip explaining badge criteria
- Different badge levels (Gold: Electric, Silver: Hybrid, Bronze: Low-emission)

**Environmental Information Card**
- CO2 emissions per kilometer/mile display
- Fuel type indicator with icon (Electric, Hybrid, Plug-in Hybrid, Gasoline, Diesel)
- Fuel efficiency rating (MPG or L/100km)
- Sustainability score (0-100 scale)
- Visual comparison with category average
- Expandable section for detailed methodology

**Carbon Emissions Display Component**
- Current vehicle emissions: X g CO2/km
- Category average comparison: "15% lower than average SUV"
- Visual progress bar or gauge showing relative performance
- Total estimated emissions for rental period
- Calculation methodology tooltip

**Carbon Offset Option Component**
- Carbon offset purchase checkbox
- Calculated offset cost based on rental duration and emissions
- Explanation of offset program and certification
- Link to detailed offset program information
- Visual representation of offset impact (e.g., "Equivalent to planting 3 trees")
- Third-party certification badges (Gold Standard, VCS, etc.)

**EV Information Panel** (for electric vehicles)
- Battery capacity (kWh)
- Estimated range on full charge (miles/kilometers)
- Charging time estimates:
  - Level 1 (120V): X hours
  - Level 2 (240V): X hours
  - DC Fast Charging: X minutes to 80%
- Charging port type (CCS, CHAdeMO, Tesla)
- Regenerative braking information
- Cold weather range impact notice

**Green Routing Component** (for EVs)
- Interactive map showing charging stations along route
- Charging station types and speeds
- Estimated charging stops for trip
- Alternative routes optimized for charging availability
- Real-time charging station availability (if integrated)
- Charging network compatibility information

**Environmental Comparison Chart**
- Bar chart comparing CO2 emissions across selected vehicles
- Fuel efficiency comparison
- Total environmental impact for rental period
- Category benchmarks for context
- Interactive tooltips with detailed data

**Sustainability Score Breakdown**
- Overall sustainability score (0-100)
- Score components:
  - Emissions rating (40%)
  - Fuel efficiency (30%)
  - Vehicle age and maintenance (15%)
  - Renewable energy usage (if applicable) (15%)
- Visual breakdown with progress bars
- Explanation of scoring methodology
- Comparison with fleet average

**Eco-Friendly Filter Component**
- Checkbox filter: "Show only eco-friendly vehicles"
- Multi-select filter by fuel type:
  - Electric only
  - Hybrid/Plug-in Hybrid
  - Low-emission (below threshold)
- Emissions range slider
- Fuel efficiency range slider

### User Flows

**Eco-Conscious Vehicle Search Flow**
1. User accesses search page
2. User applies "Eco-friendly vehicles only" filter
3. System displays vehicles with eco-friendly badges
4. User sorts results by "Lowest emissions"
5. System reorders vehicles by CO2 emissions ascending
6. User views environmental information on vehicle cards
7. User selects vehicle for detailed view
8. User reviews comprehensive environmental data
9. User proceeds to booking with carbon offset option

**Carbon Offset Purchase Flow**
1. User reviews vehicle environmental information
2. System displays total estimated emissions for rental period
3. User clicks "Add carbon offset" option
4. System calculates offset cost
5. System displays offset program details and certification
6. User confirms carbon offset addition
7. System adds offset cost to booking total
8. User completes booking with offset included
9. System provides offset certificate after booking completion

**EV Trip Planning Flow**
1. User selects electric vehicle
2. User views EV information panel with range details
3. User enters trip destination
4. System calculates trip distance and charging needs
5. System displays green routing with charging stations
6. User reviews charging stop locations and times
7. User adjusts route if needed
8. User confirms EV rental with confidence in trip feasibility

**Environmental Comparison Flow**
1. User selects multiple vehicles for comparison
2. User clicks "Compare environmental impact"
3. System displays environmental comparison page
4. System shows side-by-side emissions, efficiency, and sustainability scores
5. User reviews visual charts and data
6. User identifies most eco-friendly option
7. User selects preferred vehicle and proceeds to booking

### Data Requirements

**Environmental Data from Backend**
- CO2 emissions per kilometer/mile
- Fuel type (electric, hybrid, plug-in hybrid, gasoline, diesel)
- Fuel efficiency (MPG or L/100km)
- Eco-friendly badge eligibility and level
- Sustainability score (0-100)
- Category average emissions for comparison
- Total estimated emissions for rental period

**EV-Specific Data from Backend**
- Battery capacity (kWh)
- Estimated range (miles/kilometers)
- Charging time estimates by charging level
- Charging port type
- Regenerative braking capability
- Cold weather range impact percentage

**Carbon Offset Data from Backend**
- Offset cost per ton of CO2
- Offset program details and certification
- Third-party certification information
- Offset impact visualization data
- Certificate generation details

**Charging Station Data from Backend** (for green routing)
- Charging station locations (coordinates)
- Charging station types and speeds
- Network compatibility
- Real-time availability (if integrated)
- Pricing information

**Comparison Data from Backend**
- Category average emissions
- Fleet average sustainability score
- Emissions range for vehicle category
- Fuel efficiency benchmarks

## Backend Specifications

### API Endpoints

**GET /api/vehicles/{vehicleId}/environmental**
- Purpose: Retrieve comprehensive environmental information for a vehicle
- Authentication: Optional (public access)
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - rentalDuration (query parameter, optional): Duration in days for emissions calculation
- Response: Environmental data object
- Status Codes: 200 (Success), 404 (Vehicle not found), 500 (Server error)

**GET /api/vehicles/eco-friendly**
- Purpose: Retrieve list of eco-friendly vehicles
- Authentication: Optional
- Request Parameters:
  - location (query parameter): Pickup location
  - pickupDate (query parameter): Rental start date
  - returnDate (query parameter): Rental end date
  - fuelType (query parameter, optional): Filter by fuel type
  - maxEmissions (query parameter, optional): Maximum CO2 emissions threshold
- Response: Array of eco-friendly vehicles
- Status Codes: 200 (Success), 400 (Invalid parameters)

**GET /api/vehicles/{vehicleId}/carbon-offset**
- Purpose: Calculate carbon offset cost for rental period
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - pickupDate (query parameter): Rental start date
  - returnDate (query parameter): Rental end date
  - estimatedDistance (query parameter, optional): Expected trip distance
- Response: Carbon offset calculation object
- Status Codes: 200 (Success), 404 (Vehicle not found), 400 (Invalid dates)

**GET /api/vehicles/{vehicleId}/charging-stations**
- Purpose: Retrieve charging stations along route for EV
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - origin (query parameter): Starting location coordinates
  - destination (query parameter): Ending location coordinates
  - chargingType (query parameter, optional): Preferred charging type
- Response: Array of charging stations with route information
- Status Codes: 200 (Success), 404 (Vehicle not found), 400 (Invalid coordinates)

**GET /api/vehicles/compare/environmental**
- Purpose: Compare environmental impact of multiple vehicles
- Authentication: Optional
- Request Parameters:
  - vehicleIds (query parameter): Comma-separated vehicle IDs
  - rentalDuration (query parameter, optional): Duration for comparison
- Response: Environmental comparison data object
- Status Codes: 200 (Success), 400 (Invalid vehicle IDs)

**POST /api/bookings/{bookingId}/carbon-offset**
- Purpose: Add carbon offset to existing booking
- Authentication: Required
- Request Body:
  - offsetAmount (number): Tons of CO2 to offset
  - offsetCost (number): Cost of offset
- Response: Updated booking with offset details
- Status Codes: 200 (Success), 401 (Unauthorized), 404 (Booking not found), 400 (Invalid data)

**GET /api/environmental/sustainability-score/{vehicleId}**
- Purpose: Retrieve detailed sustainability score breakdown
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
- Response: Sustainability score breakdown object
- Status Codes: 200 (Success), 404 (Vehicle not found)

### Request Schemas

**Environmental Data Request**
```
GET /api/vehicles/VEH-12345/environmental?rentalDuration=7
```

**Eco-Friendly Vehicles Request**
```
GET /api/vehicles/eco-friendly?location=LAX&pickupDate=2026-03-01&returnDate=2026-03-08&fuelType=electric,hybrid&maxEmissions=120
```

**Carbon Offset Calculation Request**
```
GET /api/vehicles/VEH-12345/carbon-offset?pickupDate=2026-03-01&returnDate=2026-03-08&estimatedDistance=500
```

**Charging Stations Request**
```
GET /api/vehicles/VEH-12345/charging-stations?origin=34.0522,-118.2437&destination=36.7783,-119.4179&chargingType=dcfast
```

**Environmental Comparison Request**
```
GET /api/vehicles/compare/environmental?vehicleIds=VEH-12345,VEH-67890,VEH-11111&rentalDuration=7
```

### Response Schemas

**Environmental Data Response**
```json
{
  "vehicleId": "VEH-12345",
  "co2EmissionsPerKm": 95,
  "co2EmissionsPerMile": 153,
  "fuelType": "hybrid",
  "fuelEfficiency": {
    "mpg": 52,
    "litersPer100Km": 4.5
  },
  "ecoFriendlyBadge": {
    "eligible": true,
    "level": "silver",
    "criteria": "Hybrid vehicle with emissions below category average"
  },
  "sustainabilityScore": 78,
  "categoryAverage": {
    "co2EmissionsPerKm": 145,
    "sustainabilityScore": 55
  },
  "totalEstimatedEmissions": {
    "rentalDuration": 7,
    "estimatedDistance": 500,
    "totalCo2Kg": 47.5
  },
  "evDetails": null
}
```

**EV Details Response** (when vehicle is electric)
```json
{
  "vehicleId": "VEH-67890",
  "co2EmissionsPerKm": 0,
  "fuelType": "electric",
  "ecoFriendlyBadge": {
    "eligible": true,
    "level": "gold",
    "criteria": "Zero-emission electric vehicle"
  },
  "sustainabilityScore": 95,
  "evDetails": {
    "batteryCapacityKwh": 75,
    "estimatedRangeMiles": 280,
    "estimatedRangeKm": 450,
    "chargingTimes": {
      "level1Hours": 48,
      "level2Hours": 8,
      "dcFastMinutesTo80Percent": 35
    },
    "chargingPortType": "CCS",
    "regenerativeBraking": true,
    "coldWeatherRangeImpact": 20
  }
}
```

**Carbon Offset Response**
```json
{
  "vehicleId": "VEH-12345",
  "rentalPeriod": {
    "pickupDate": "2026-03-01",
    "returnDate": "2026-03-08",
    "durationDays": 7
  },
  "estimatedEmissions": {
    "totalCo2Kg": 47.5,
    "totalCo2Tons": 0.0475
  },
  "offsetDetails": {
    "costPerTon": 15.00,
    "totalOffsetCost": 0.71,
    "currency": "USD",
    "program": "Gold Standard Certified Reforestation",
    "certification": "Gold Standard",
    "impactVisualization": "Equivalent to planting 2 trees",
    "certificateAvailable": true
  }
}
```

**Charging Stations Response**
```json
{
  "vehicleId": "VEH-67890",
  "route": {
    "origin": "34.0522,-118.2437",
    "destination": "36.7783,-119.4179",
    "totalDistanceMiles": 185
  },
  "chargingStations": [
    {
      "stationId": "CS-001",
      "name": "ChargePoint Station - Bakersfield",
      "location": {
        "latitude": 35.3733,
        "longitude": -119.0187,
        "address": "123 Main St, Bakersfield, CA"
      },
      "distanceFromOriginMiles": 110,
      "chargingType": "dcfast",
      "chargingSpeed": "150 kW",
      "estimatedChargingTime": 25,
      "networkCompatibility": "CCS",
      "availability": "available",
      "pricing": "$0.35/kWh"
    }
  ],
  "recommendedStops": 1,
  "totalChargingTime": 25
}
```

**Environmental Comparison Response**
```json
{
  "vehicles": [
    {
      "vehicleId": "VEH-12345",
      "make": "Toyota",
      "model": "Prius",
      "co2EmissionsPerKm": 95,
      "fuelEfficiency": 52,
      "sustainabilityScore": 78,
      "totalEmissionsForPeriod": 47.5,
      "ecoFriendlyBadge": "silver"
    },
    {
      "vehicleId": "VEH-67890",
      "make": "Tesla",
      "model": "Model 3",
      "co2EmissionsPerKm": 0,
      "fuelEfficiency": null,
      "sustainabilityScore": 95,
      "totalEmissionsForPeriod": 0,
      "ecoFriendlyBadge": "gold"
    }
  ],
  "categoryBenchmark": {
    "averageCo2EmissionsPerKm": 145,
    "averageSustainabilityScore": 55
  },
  "rentalDuration": 7
}
```

**Sustainability Score Breakdown Response**
```json
{
  "vehicleId": "VEH-12345",
  "overallScore": 78,
  "components": {
    "emissionsRating": {
      "score": 75,
      "weight": 40,
      "weightedScore": 30
    },
    "fuelEfficiency": {
      "score": 85,
      "weight": 30,
      "weightedScore": 25.5
    },
    "vehicleAgeAndMaintenance": {
      "score": 70,
      "weight": 15,
      "weightedScore": 10.5
    },
    "renewableEnergyUsage": {
      "score": 80,
      "weight": 15,
      "weightedScore": 12
    }
  },
  "fleetAverage": 55,
  "categoryAverage": 60,
  "methodology": "Sustainability score calculated based on emissions, efficiency, maintenance, and renewable energy factors"
}
```

### Business Logic

**Eco-Friendly Badge Determination**
- Electric vehicles: Gold badge (zero emissions)
- Hybrid/Plug-in Hybrid: Silver badge (low emissions)
- Traditional fuel vehicles with emissions 20% below category average: Bronze badge
- Badge displayed prominently on vehicle cards and detail pages

**Sustainability Score Calculation**
- Emissions Rating (40%): Based on CO2 emissions compared to category average
  - 0 emissions: 100 points
  - 20% below average: 80 points
  - Average: 50 points
  - 20% above average: 30 points
- Fuel Efficiency (30%): Based on MPG or L/100km compared to category
- Vehicle Age and Maintenance (15%): Newer vehicles with regular maintenance score higher
- Renewable Energy Usage (15%): If supplier uses renewable energy for operations

**Carbon Offset Cost Calculation**
- Calculate total CO2 emissions: vehicle emissions per km × estimated distance
- Convert to tons of CO2
- Multiply by cost per ton (e.g., $15/ton)
- Round to nearest cent
- Add to booking total as optional line item

**Total Emissions Estimation**
- Base calculation: CO2 per km × estimated distance
- If distance not provided, use average daily distance (100 km/day) × rental duration
- For electric vehicles: Calculate grid emissions based on regional electricity mix
- Display in both kg and tons for clarity

**Green Routing Algorithm** (for EVs)
- Calculate total trip distance
- Determine vehicle range on full charge
- Identify charging stops needed based on range
- Query charging station database for stations along route
- Filter by charging type compatibility
- Prioritize DC fast charging for time efficiency
- Calculate estimated charging time at each stop
- Provide alternative routes if primary route has limited charging

**Environmental Comparison Logic**
- Retrieve environmental data for all selected vehicles
- Normalize scores for fair comparison
- Calculate total emissions for rental period
- Generate visual comparison charts
- Highlight most eco-friendly option
- Provide category benchmarks for context

### Authentication Requirements

**Public Access**
- View environmental information for vehicles
- View eco-friendly vehicle listings
- Calculate carbon offset costs
- View charging station locations
- Compare environmental impact of vehicles
- View sustainability score breakdowns

**Authenticated Access**
- Purchase carbon offset for booking
- Save eco-friendly vehicle preferences
- Receive notifications about new eco-friendly vehicles
- Access carbon offset certificates after booking

**No Special Permissions Required**
- All environmental information viewing is public
- Carbon offset purchase requires authentication for payment processing

## Database Specifications

### Schema Changes

**New Table: VehicleEnvironmentalData**
- Stores environmental metrics for each vehicle
- Updated regularly with latest emissions data

**New Table: CarbonOffsets**
- Tracks carbon offset purchases
- Links to bookings

**New Table: ChargingStations** (if not exists)
- Stores charging station locations and details
- Used for green routing

**Enhancement: Vehicles Table**
- Add sustainability score column
- Add eco-friendly badge level column

### Table Definitions

**VehicleEnvironmentalData Table**
```sql
CREATE TABLE VehicleEnvironmentalData (
  environmentalDataId INT PRIMARY KEY AUTO_INCREMENT,
  vehicleId INT NOT NULL,
  co2EmissionsPerKm DECIMAL(6,2) NOT NULL,
  co2EmissionsPerMile DECIMAL(6,2) NOT NULL,
  fuelEfficiencyMpg DECIMAL(5,2),
  fuelEfficiencyLitersPer100Km DECIMAL(5,2),
  sustainabilityScore INT NOT NULL,
  ecoFriendlyBadgeLevel ENUM('none', 'bronze', 'silver', 'gold'),
  batteryCapacityKwh DECIMAL(6,2),
  estimatedRangeMiles INT,
  estimatedRangeKm INT,
  chargingLevel1Hours INT,
  chargingLevel2Hours INT,
  chargingDcFastMinutes INT,
  chargingPortType VARCHAR(50),
  regenerativeBraking BOOLEAN,
  coldWeatherRangeImpact INT,
  lastUpdated DATETIME NOT NULL,
  FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
  INDEX idx_vehicleId (vehicleId),
  INDEX idx_sustainabilityScore (sustainabilityScore),
  INDEX idx_ecoFriendlyBadge (ecoFriendlyBadgeLevel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**CarbonOffsets Table**
```sql
CREATE TABLE CarbonOffsets (
  carbonOffsetId INT PRIMARY KEY AUTO_INCREMENT,
  bookingId INT NOT NULL,
  userId INT NOT NULL,
  vehicleId INT NOT NULL,
  co2TonsOffset DECIMAL(8,4) NOT NULL,
  offsetCost DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  offsetProgram VARCHAR(255) NOT NULL,
  certification VARCHAR(100),
  certificateUrl VARCHAR(500),
  purchaseDate DATETIME NOT NULL,
  FOREIGN KEY (bookingId) REFERENCES Bookings(bookingId) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES Users(userId) ON DELETE CASCADE,
  FOREIGN KEY (vehicleId) REFERENCES Vehicles(vehicleId) ON DELETE CASCADE,
  INDEX idx_bookingId (bookingId),
  INDEX idx_userId (userId),
  INDEX idx_purchaseDate (purchaseDate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**ChargingStations Table**
```sql
CREATE TABLE ChargingStations (
  chargingStationId INT PRIMARY KEY AUTO_INCREMENT,
  stationName VARCHAR(255) NOT NULL,
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postalCode VARCHAR(20),
  chargingType ENUM('level1', 'level2', 'dcfast') NOT NULL,
  chargingSpeed VARCHAR(50),
  networkName VARCHAR(100),
  portType VARCHAR(50),
  numberOfPorts INT,
  availability ENUM('available', 'occupied', 'out_of_service', 'unknown') DEFAULT 'unknown',
  pricingInfo VARCHAR(255),
  operatingHours VARCHAR(255),
  amenities TEXT,
  lastUpdated DATETIME NOT NULL,
  INDEX idx_location (latitude, longitude),
  INDEX idx_chargingType (chargingType),
  INDEX idx_city (city),
  INDEX idx_availability (availability)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**Enhancement to Vehicles Table**
```sql
ALTER TABLE Vehicles
ADD COLUMN sustainabilityScore INT DEFAULT 50,
ADD COLUMN ecoFriendlyBadgeLevel ENUM('none', 'bronze', 'silver', 'gold') DEFAULT 'none',
ADD INDEX idx_sustainabilityScore (sustainabilityScore),
ADD INDEX idx_ecoFriendlyBadge (ecoFriendlyBadgeLevel);
```

### Relationships

**Vehicles to VehicleEnvironmentalData**: One-to-One
- One vehicle has one environmental data record
- Foreign key: VehicleEnvironmentalData.vehicleId references Vehicles.vehicleId
- Cascade delete: If vehicle deleted, environmental data deleted

**Bookings to CarbonOffsets**: One-to-One (optional)
- One booking can have one carbon offset purchase
- Foreign key: CarbonOffsets.bookingId references Bookings.bookingId
- Cascade delete: If booking deleted, carbon offset record deleted

**Users to CarbonOffsets**: One-to-Many
- One user can have multiple carbon offset purchases
- Foreign key: CarbonOffsets.userId references Users.userId

**Vehicles to CarbonOffsets**: One-to-Many
- One vehicle can have multiple carbon offset purchases across bookings
- Foreign key: CarbonOffsets.vehicleId references Vehicles.vehicleId

### Indexes

**Performance Optimization Indexes**
- Index on VehicleEnvironmentalData.vehicleId for fast environmental data retrieval
- Index on VehicleEnvironmentalData.sustainabilityScore for sorting eco-friendly vehicles
- Index on VehicleEnvironmentalData.ecoFriendlyBadgeLevel for filtering by badge
- Composite index on ChargingStations (latitude, longitude) for geospatial queries
- Index on ChargingStations.chargingType for filtering by charging speed
- Index on CarbonOffsets.bookingId for retrieving offset details
- Index on CarbonOffsets.userId for user offset history
- Index on CarbonOffsets.purchaseDate for reporting and analytics

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+ with InnoDB storage engine
- Frontend: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- Mapping Service: Google Maps API or Mapbox for charging station locations
- Carbon Offset API: Integration with carbon offset providers (e.g., Cloverly, Patch)
- Charging Station Data: Integration with charging network APIs (ChargePoint, EVgo, Tesla Supercharger)

## Implementation Notes

**Data Sources**
- Vehicle emissions data from manufacturer specifications
- Fuel efficiency data from EPA or equivalent regulatory bodies
- Charging station data from third-party APIs or databases
- Carbon offset pricing from certified offset providers
- Regional electricity grid emissions for EV calculations

**Sustainability Score Methodology**
- Transparent scoring algorithm documented for users
- Regular updates to scoring criteria based on industry standards
- Comparison with fleet and category averages for context
- Consider lifecycle emissions, not just operational emissions

**Carbon Offset Program**
- Partner with certified carbon offset providers
- Ensure third-party verification (Gold Standard, VCS, etc.)
- Provide transparency on offset projects
- Generate certificates for users after purchase
- Track total offsets purchased for platform-wide impact reporting

**EV Charging Integration**
- Real-time charging station availability (if API available)
- Pricing information for charging networks
- User reviews and ratings for charging stations
- Navigation integration for seamless routing
- Charging network membership information

**Performance Considerations**
- Cache environmental data for frequently viewed vehicles
- Pre-calculate sustainability scores during off-peak hours
- Use geospatial indexes for fast charging station queries
- Optimize carbon offset calculations for quick display

**Accessibility Considerations**
- Color-blind friendly badge colors
- Screen reader support for environmental data
- Keyboard navigation for comparison tools
- Alt text for environmental icons and charts

**Future Enhancements**
- Integration with corporate ESG reporting tools
- Personalized carbon footprint tracking for users
- Gamification of eco-friendly choices (badges, rewards)
- Community challenges for reducing emissions
- Partnership with environmental organizations
- Blockchain-based carbon offset verification
- AI-powered trip optimization for minimal emissions
- Integration with renewable energy charging networks

**Exclusion Rationale**
This feature has been excluded from the current project scope based on stakeholder prioritization. Potential reasons for exclusion may include:
- Focus on core rental functionality first
- Limited availability of accurate emissions data
- Complexity of carbon offset program implementation
- Lower priority compared to essential booking features
- Potential future implementation in Phase 2 or 3
- Market research indicating lower demand in target segment

This documentation is maintained for future reference and can be revisited when environmental features become a priority.

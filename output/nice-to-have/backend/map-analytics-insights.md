# Feature: Map Analytics and Insights

## Overview

Collect and analyze user interactions with map features to gain insights into search behavior, popular areas, and feature usage. The system tracks map interactions (zoom, pan, marker clicks), analyzes search patterns, identifies high-engagement areas, and provides actionable insights for business decisions. Map analytics inform fleet positioning, marketing strategies, and product improvements.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-020

## User Stories

As a business analyst, I want to analyze map usage patterns, so that I can understand how customers search for vehicles.

As a fleet manager, I want to identify popular search areas, so that I can position vehicles where demand is highest.

As a product manager, I want map feature usage metrics, so that I can prioritize improvements and optimize user experience.

## Frontend Specifications

### Pages

- Analytics Dashboard with Map Usage Metrics
- Business Intelligence Dashboard with Search Patterns
- Fleet Optimization Dashboard with Popular Areas

### UI Components

**Map Usage Metrics Panel**:
- Total map views
- Average session duration on map
- Zoom level distribution chart
- Pan activity heat map
- Marker click rate
- List view vs map view preference
- Mobile vs desktop usage

**Search Pattern Visualization**:
- Heat map of search origins
- Popular destination areas
- Search radius distribution
- Time of day patterns
- Day of week patterns
- Seasonal trends

**Feature Usage Dashboard**:
- Street View usage rate
- Indoor navigation usage
- AR wayfinding adoption
- Geolocation permission grant rate
- Manual location entry rate
- Filter usage on map

### User Flows

**Analyzing Map Usage**:
1. Business analyst opens analytics dashboard
2. Selects "Map Analytics" section
3. Views map usage metrics
4. Identifies popular search areas
5. Analyzes zoom level preferences
6. Reviews marker click patterns
7. Exports data for further analysis
8. Shares insights with team

### Data Requirements

**From Backend APIs**:
- GET /api/analytics/map-usage - Returns map interaction metrics
- GET /api/analytics/search-patterns - Returns search behavior data
- GET /api/analytics/feature-adoption - Returns feature usage rates

## Backend Specifications

### API Endpoints

**GET /api/analytics/map-usage**
- Purpose: Retrieve map usage metrics
- Query Parameters: startDate, endDate, groupBy
- Response: Map interaction statistics
- Authentication: JWT token required (analyst or admin role)
- Caching: 1 hour

**GET /api/analytics/search-patterns**
- Purpose: Analyze search behavior patterns
- Query Parameters: startDate, endDate, metric
- Response: Search pattern data
- Authentication: JWT token required (analyst or admin role)
- Caching: 1 hour

**GET /api/analytics/feature-adoption**
- Purpose: Track adoption of map features
- Query Parameters: startDate, endDate
- Response: Feature usage rates and trends
- Authentication: JWT token required (analyst or admin role)
- Caching: 1 hour

### Request Schemas

**Analytics Query Request**:
- startDate: string (ISO 8601, required)
- endDate: string (ISO 8601, required)
- groupBy: 'hour' | 'day' | 'week' (default 'day')
- metric: string (optional, specific metric to retrieve)

### Response Schemas

**Map Usage Response**:
- totalViews: number
- averageSessionDuration: number (seconds)
- zoomLevelDistribution: { level: count }
- markerClicks: number
- listViewSwitches: number
- mobileVsDesktop: { mobile: number, desktop: number }

**Search Patterns Response**:
- searchOrigins: Array of { latitude, longitude, count }
- popularDestinations: Array of { name, count }
- averageSearchRadius: number (km)
- peakSearchHours: Array of hours
- conversionRate: number (searches to bookings)

**Feature Adoption Response**:
- features: Array of { name, usageCount, adoptionRate, trend }
- geolocationPermissionRate: number (percentage)
- streetViewUsage: number
- indoorNavigationUsage: number
- arWayfindingUsage: number

### Business Logic

**Event Tracking**:
- Track all map interactions (zoom, pan, marker clicks)
- Track search parameters (location, radius, filters)
- Track feature usage (Street View, indoor navigation, AR)
- Anonymize user data for analytics
- Aggregate events for performance

**Pattern Analysis**:
- Identify popular search areas (clustering)
- Analyze search-to-booking conversion by area
- Identify underserved high-demand areas
- Track feature adoption over time
- Measure impact of new features

**Insight Generation**:
- Generate actionable insights from data
- Recommend fleet positioning based on search patterns
- Identify areas for marketing campaigns
- Suggest product improvements based on usage
- Predict future demand by area

### Authentication Requirements

- Analytics viewing: JWT token required (analyst, fleet manager, or admin role)
- Raw data export: JWT token required (admin role only)

## Database Specifications

### Schema Changes

Add map analytics tracking tables.

### Table Definitions

**MapInteractionEvents Table** (new):
- id: BIGINT PRIMARY KEY AUTO_INCREMENT
- user_id: INT - NULL for anonymous
- session_id: VARCHAR(100)
- event_type: ENUM('map_view', 'zoom', 'pan', 'marker_click', 'list_toggle') NOT NULL
- latitude: DECIMAL(10, 8)
- longitude: DECIMAL(11, 8)
- zoom_level: INT
- device_type: ENUM('mobile', 'desktop')
- timestamp: DATETIME DEFAULT CURRENT_TIMESTAMP
- date: DATE
- hour: INT

**SearchPatternAnalytics Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- date: DATE NOT NULL
- hour: INT NOT NULL
- latitude: DECIMAL(10, 8) NOT NULL
- longitude: DECIMAL(11, 8) NOT NULL
- grid_cell: VARCHAR(50)
- search_count: INT DEFAULT 0
- booking_count: INT DEFAULT 0
- conversion_rate: DECIMAL(5, 2)
- average_radius: DECIMAL(10, 2)
- created_at: DATETIME DEFAULT CURRENT_TIMESTAMP

### Relationships

- MapInteractionEvents.user_id → Users.id (foreign key, SET NULL on delete)

### Indexes

- CREATE INDEX idx_map_events_date ON MapInteractionEvents(date, hour, event_type)
- CREATE INDEX idx_map_events_session ON MapInteractionEvents(session_id, timestamp)
- CREATE INDEX idx_map_events_location ON MapInteractionEvents(latitude, longitude, date)
- CREATE INDEX idx_search_patterns_date ON SearchPatternAnalytics(date, hour)
- CREATE INDEX idx_search_patterns_grid ON SearchPatternAnalytics(grid_cell, date)

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Analytics: Custom implementation or Google Analytics
- Visualization: Chart.js, D3.js for data visualization

## Implementation Notes

- Track map interactions using event listeners
- Batch analytics events to reduce database writes
- Anonymize user data for privacy compliance
- Aggregate data for performance (hourly, daily)
- Use background jobs for analytics processing
- Generate insights automatically using data analysis
- Provide dashboards for different stakeholder roles
- Monitor analytics data quality and completeness
- Test analytics tracking across different scenarios
- Ensure analytics don't impact map performance
- Implement privacy-compliant tracking (no PII)
- Provide opt-out option for analytics tracking
- Use analytics to inform product decisions
- Share insights with relevant teams (fleet, marketing, product)

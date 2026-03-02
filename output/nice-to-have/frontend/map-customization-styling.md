# Feature: Map Customization and Styling

## Overview

Provide customizable map styling and theming to match platform branding and improve user experience. The system supports custom map styles, dark mode, branded color schemes, and context-specific styling. Custom styling differentiates the platform visually and improves readability in different lighting conditions.

## Sprint Category

nice-to-have

## Feature ID

F-INT-MAP-016

## User Stories

As a platform operator, I want custom map styling that matches our brand, so that the platform has a cohesive visual identity.

As a customer using the app at night, I want dark mode for maps, so that the bright map doesn't strain my eyes.

As a designer, I want control over map colors and styling, so that maps integrate seamlessly with our UI design.

## Frontend Specifications

### Pages

- All pages with maps use custom styling
- Admin Settings with Map Style Editor

### UI Components

**Map Style Selector**:
- Default style option
- Dark mode option
- High contrast option
- Satellite view option
- Custom brand style option
- Preview thumbnail for each style

**Map Theme Controls**:
- Automatic theme switching (follow system preference)
- Manual theme override
- Dark mode toggle
- High contrast mode toggle

### User Flows

**Automatic Dark Mode**:
1. Customer uses device in dark mode
2. System detects system theme preference
3. Applies dark map style automatically
4. Map colors adjust for dark background
5. Markers remain visible with adjusted colors
6. Customer can override to light mode if preferred

### Data Requirements

**From Backend APIs**:
- GET /api/map/styles - Returns available map styles
- GET /api/map/config - Returns map configuration with style settings

## Backend Specifications

### API Endpoints

**GET /api/map/styles**
- Purpose: Retrieve available map styles
- Response: Array of style configurations
- Authentication: None required
- Caching: 1 hour

### Request Schemas

None required (GET only).

### Response Schemas

**Map Styles Response**:
- styles: Array with { id, name, description, styleJson, thumbnail }

### Business Logic

**Style Selection**:
- Detect system theme preference (dark/light)
- Apply appropriate map style automatically
- Allow manual override in user preferences
- Save style preference for future sessions

### Authentication Requirements

- Map style viewing: No authentication required
- Style preference saving: JWT token required

## Database Specifications

### Schema Changes

Add user map preferences.

### Table Definitions

**UserMapPreferences Table** (new):
- id: INT PRIMARY KEY AUTO_INCREMENT
- user_id: INT NOT NULL UNIQUE
- style_id: VARCHAR(50) DEFAULT 'default'
- auto_dark_mode: BOOLEAN DEFAULT TRUE
- high_contrast: BOOLEAN DEFAULT FALSE
- updated_at: DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP

### Relationships

- UserMapPreferences.user_id → Users.id (foreign key, CASCADE on delete)

### Indexes

- CREATE UNIQUE INDEX idx_user_map_prefs_user ON UserMapPreferences(user_id)

## Technology Stack

- Backend: .NET 8+ with C#
- Database: MySQL 8.0+
- Frontend: Next.js 14+ with TypeScript
- Mapping: Google Maps JavaScript API with custom styles

## Implementation Notes

- Use Google Maps Styling Wizard to create custom styles
- Implement dark mode map style for night usage
- Support automatic theme switching based on system preference
- Store map style preferences in user profile
- Test map styles for accessibility and readability
- Ensure markers remain visible in all styles
- Provide high contrast mode for accessibility
- Consider using Mapbox for more advanced styling options

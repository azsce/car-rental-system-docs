# Feature: Comprehensive Vehicle Details

## Overview

The Comprehensive Vehicle Details feature provides rich, detailed information display for each vehicle, enabling customers to make informed booking decisions without contacting support. This feature presents complete vehicle specifications, capacity information, technical details, features, pricing breakdowns, insurance options, additional services, supplier information, availability calendars, image galleries, customer reviews, environmental information, and accessibility features in a well-organized, easy-to-navigate interface.

This feature serves as the critical decision-making touchpoint where customers evaluate whether a vehicle meets their needs, understand total costs, and build confidence in their booking choice. By providing comprehensive information upfront, the feature reduces support inquiries, booking modifications, and post-booking surprises.

## Sprint Category

sprint-mvp

## Feature IDs

- F-SD-009 (Primary)
- F-WF-SRCH-006 (Related workflow)

## User Stories

### Primary User Story

As a customer, I want to view detailed vehicle information, so that I can make informed booking decisions without contacting support.

### Supporting User Stories

1. As a budget-conscious customer, I want to see complete pricing breakdowns including all fees and optional services, so that I understand the total cost before booking.

2. As a customer with specific needs, I want to see all vehicle features and specifications, so that I can verify the vehicle meets my requirements.

3. As a customer concerned about transparency, I want to read reviews from previous renters, so that I can make decisions based on authentic experiences.

4. As an eco-conscious customer, I want to view environmental information, so that I can make environmentally responsible rental decisions.

5. As a customer with accessibility needs, I want to see accessibility features clearly listed, so that I can find suitable vehicles.

6. As a customer planning my trip, I want to see the vehicle's availability calendar, so that I can understand booking flexibility.

## Frontend Specifications

### Pages

**Vehicle Details Page** (`/vehicles/[vehicleId]`)
- Comprehensive vehicle information display
- Accessible from search results, favorites, booking history
- Shareable URL for sending to others
- Responsive design for mobile and desktop viewing

### UI Components

**Vehicle Image Gallery Component**
- Primary hero image with high-quality vehicle exterior photo
- Thumbnail navigation for multiple images (exterior, interior, features, damage documentation)
- Full-screen image viewer with zoom capability
- Swipe gestures for mobile navigation
- Image loading with placeholders for performance
- Minimum 5-8 images per vehicle

**Vehicle Specifications Card**
- Basic specifications section: Make, model, year, license plate
- Capacity information: Seats, doors, luggage space (cubic feet/liters)
- Technical details: Engine type, transmission, fuel policy, mileage limits
- Organized in collapsible sections for mobile optimization
- Icons for visual clarity

**Features List Component**
- Categorized feature display (Safety, Comfort, Technology, Accessibility)
- Checkmark icons for included features
- Tooltip explanations for technical features
- Highlight premium or unique features
- Features include: Air conditioning, multimedia systems, safety features, connectivity options

**Pricing Breakdown Component**
- Hourly, daily, weekly, bi-weekly, and monthly rates
- Volume discount indicators for longer rentals
- Total estimated cost for selected rental period
- Currency display with conversion option
- Special offers or discounts highlighted
- Clear separation of base rate vs. additional costs

**Insurance Options Component**
- Theft protection with cost
- Collision damage waiver with cost
- Full insurance with cost
- Coverage details with expandable descriptions
- Comparison table showing what each option covers
- Recommended option indicator

**Additional Services Component**
- Additional driver fee
- GPS navigation rental
- Child seats (infant, toddler, booster)
- Pet fees
- Delivery/pickup service
- Each service with cost and description
- Add-to-booking checkboxes

**Supplier Information Card**
- Supplier/host name and logo
- Overall rating (1-5 stars)
- Location details with map
- Operating hours
- Response time indicator
- Contact information (phone, email)
- Link to supplier profile page

**Availability Calendar Component**
- Monthly calendar view
- Visual indicators for available, booked, and blocked dates
- Selected rental period highlighted
- Buffer time visualization
- Quick date selection for booking
- Month navigation controls

**Reviews and Ratings Section**
- Aggregate rating display (1-5 stars with half-star precision)
- Total review count
- Rating distribution chart (5-star, 4-star, etc.)
- Individual review cards with:
  - Reviewer name and avatar
  - Rating (overall and by category)
  - Written review text
  - Review photos from rental experience
  - Verified booking badge
  - Helpful votes count
  - Host response (if applicable)
- Review sorting options (date, rating, helpfulness)
- Review filtering by rental duration
- "Most helpful" reviews highlighted

**Environmental Information Component**
- CO2 emissions per kilometer/mile
- Fuel type badge (Electric, Hybrid, Plug-in Hybrid, Traditional)
- Eco-friendly badge for low-emission vehicles
- Fuel efficiency rating
- Environmental comparison with similar vehicles
- Carbon offset option with explanation

**Accessibility Features Component**
- List of accessibility modifications
- Hand controls availability
- Wheelchair ramps or lifts
- Accessible modifications description
- Contact information for accessibility questions

**Action Buttons Component**
- Primary "Book Now" button (sticky on mobile)
- "Add to Favorites" button (heart icon)
- "Share" button with social media and link copy options
- "Compare" button to add to comparison list
- "Contact Supplier" button

### User Flows

**View Vehicle Details Flow**
1. User clicks vehicle from search results
2. System loads vehicle details page
3. System displays hero image and primary information
4. System loads additional images, reviews, and availability data progressively
5. User scrolls through information sections
6. User views image gallery, reads reviews, checks availability
7. User decides to book, compare, save, or return to search

**Pricing Exploration Flow**
1. User views base pricing rates
2. User expands insurance options section
3. System displays coverage details and costs
4. User reviews additional services
5. User calculates total estimated cost
6. System updates total as user selects options
7. User proceeds to booking with selected options

**Review Reading Flow**
1. User scrolls to reviews section
2. System displays aggregate rating and distribution
3. User reads most helpful reviews
4. User applies sort or filter to reviews
5. System updates review display
6. User views review photos
7. User reads host responses
8. User gains confidence or concerns about vehicle

**Availability Checking Flow**
1. User views availability calendar
2. System displays booked and available dates
3. User selects alternative dates if needed
4. System updates pricing for new dates
5. User confirms dates and proceeds to booking

### Data Requirements

**Vehicle Data from Backend**
- Vehicle ID, make, model, year, license plate
- Category, type, transmission, fuel type
- Capacity (seats, doors, luggage space)
- Features list with categories
- Mileage policy and limits
- Current odometer reading
- Vehicle condition notes

**Pricing Data from Backend**
- Hourly, daily, weekly, bi-weekly, monthly rates
- Volume discount rules
- Insurance option pricing
- Additional service pricing
- Special offers or promotions
- Currency and exchange rates
- Tax and fee calculations

**Availability Data from Backend**
- Availability calendar for next 90 days
- Booked date ranges
- Blocked dates for maintenance
- Buffer time requirements
- Minimum/maximum rental periods

**Supplier Data from Backend**
- Supplier ID, name, logo
- Overall rating and review count
- Location details (address, coordinates)
- Operating hours
- Response time metrics
- Contact information

**Review Data from Backend**
- Review ID, reviewer name, avatar
- Overall rating and category ratings
- Review text and timestamp
- Review photos
- Verified booking status
- Helpful votes count
- Host response and timestamp

**Image Data from Backend**
- Image URLs (multiple sizes for responsive loading)
- Image captions and alt text
- Image order/sequence
- Image categories (exterior, interior, features)

**Environmental Data from Backend**
- CO2 emissions per km/mile
- Fuel efficiency rating
- Eco-friendly badge eligibility
- Carbon offset cost calculation

**Accessibility Data from Backend**
- Accessibility features list
- Modification descriptions
- Accessibility contact information

## Backend Specifications

### API Endpoints

**GET /api/vehicles/{vehicleId}**
- Purpose: Retrieve comprehensive vehicle details
- Authentication: Optional (public access, enhanced for logged-in users)
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - pickupDate (query parameter, optional): For pricing calculation
  - returnDate (query parameter, optional): For pricing calculation
  - currency (query parameter, optional): Preferred currency code
- Response: Vehicle details object with all information
- Status Codes: 200 (Success), 404 (Vehicle not found), 500 (Server error)

**GET /api/vehicles/{vehicleId}/availability**
- Purpose: Retrieve vehicle availability calendar
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - startDate (query parameter): Calendar start date
  - endDate (query parameter): Calendar end date
- Response: Availability calendar with booked/blocked dates
- Status Codes: 200 (Success), 404 (Vehicle not found)

**GET /api/vehicles/{vehicleId}/reviews**
- Purpose: Retrieve vehicle reviews and ratings
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - page (query parameter): Pagination page number
  - pageSize (query parameter): Number of reviews per page
  - sortBy (query parameter): Sort criteria (date, rating, helpfulness)
  - filterBy (query parameter, optional): Filter criteria
- Response: Paginated reviews list with aggregate ratings
- Status Codes: 200 (Success), 404 (Vehicle not found)

**GET /api/vehicles/{vehicleId}/pricing**
- Purpose: Calculate pricing for specific rental period
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - pickupDate (query parameter): Rental start date/time
  - returnDate (query parameter): Rental end date/time
  - insuranceOptions (query parameter, optional): Selected insurance
  - additionalServices (query parameter, optional): Selected services
  - currency (query parameter, optional): Preferred currency
- Response: Detailed pricing breakdown
- Status Codes: 200 (Success), 404 (Vehicle not found), 400 (Invalid dates)

**GET /api/vehicles/{vehicleId}/images**
- Purpose: Retrieve vehicle image gallery
- Authentication: Optional
- Request Parameters:
  - vehicleId (path parameter): Unique vehicle identifier
  - size (query parameter, optional): Image size (thumbnail, medium, large)
- Response: Array of image URLs with metadata
- Status Codes: 200 (Success), 404 (Vehicle not found)

**POST /api/vehicles/{vehicleId}/favorites**
- Purpose: Add vehicle to user's favorites
- Authentication: Required
- Request Body: None
- Response: Success confirmation
- Status Codes: 201 (Created), 401 (Unauthorized), 404 (Vehicle not found)

**GET /api/suppliers/{supplierId}**
- Purpose: Retrieve supplier information
- Authentication: Optional
- Request Parameters:
  - supplierId (path parameter): Unique supplier identifier
- Response: Supplier details object
- Status Codes: 200 (Success), 404 (Supplier not found)

### Request Schemas

**Vehicle Details Request**
```
GET /api/vehicles/{vehicleId}?pickupDate=2026-03-01T10:00:00Z&returnDate=2026-03-05T10:00:00Z&currency=USD
```

**Availability Request**
```
GET /api/vehicles/{vehicleId}/availability?startDate=2026-03-01&endDate=2026-04-30
```

**Reviews Request**
```
GET /api/vehicles/{vehicleId}/reviews?page=1&pageSize=10&sortBy=helpfulness
```

**Pricing Request**
```
GET /api/vehicles/{vehicleId}/pricing?pickupDate=2026-03-01T10:00:00Z&returnDate=2026-03-05T10:00:00Z&insuranceOptions=full&additionalServices=gps,childSeat
```

### Response Schemas

**Vehicle Details Response**
```
{
  "vehicleId": "string",
  "make": "string",
  "model": "string",
  "year": number,
  "licensePlate": "string",
  "category": "string",
  "type": "string",
  "transmission": "string",
  "fuelType": "string",
  "seats": number,
  "doors": number,
  "luggageSpace": number,
  "luggageUnit": "string",
  "features": [
    {
      "category": "string",
      "name": "string",
      "description": "string"
    }
  ],
  "mileagePolicy": "string",
  "mileageLimit": number,
  "pricing": {
    "hourly": number,
    "daily": number,
    "weekly": number,
    "biweekly": number,
    "monthly": number,
    "currency": "string"
  },
  "insuranceOptions": [
    {
      "type": "string",
      "cost": number,
      "coverage": "string"
    }
  ],
  "additionalServices": [
    {
      "service": "string",
      "cost": number,
      "description": "string"
    }
  ],
  "supplier": {
    "supplierId": "string",
    "name": "string",
    "rating": number,
    "location": "string",
    "responseTime": "string"
  },
  "environmental": {
    "co2Emissions": number,
    "fuelEfficiency": number,
    "ecoFriendly": boolean
  },
  "accessibility": [
    {
      "feature": "string",
      "description": "string"
    }
  ],
  "images": ["string"],
  "aggregateRating": {
    "overall": number,
    "reviewCount": number,
    "distribution": {
      "5star": number,
      "4star": number,
      "3star": number,
      "2star": number,
      "1star": number
    }
  }
}
```

**Availability Response**
```
{
  "vehicleId": "string",
  "availability": [
    {
      "date": "string",
      "status": "available | booked | blocked",
      "bufferTime": number
    }
  ]
}
```

**Reviews Response**
```
{
  "vehicleId": "string",
  "totalReviews": number,
  "page": number,
  "pageSize": number,
  "reviews": [
    {
      "reviewId": "string",
      "reviewer": {
        "name": "string",
        "avatar": "string"
      },
      "rating": {
        "overall": number,
        "cleanliness": number,
        "performance": number,
        "value": number,
        "accuracy": number
      },
      "reviewText": "string",
      "photos": ["string"],
      "verifiedBooking": boolean,
      "helpfulVotes": number,
      "timestamp": "string",
      "hostResponse": {
        "text": "string",
        "timestamp": "string"
      }
    }
  ]
}
```

### Business Logic

**Pricing Calculation Logic**
- Calculate rental duration from pickup to return date/time
- Apply appropriate rate (hourly, daily, weekly, monthly)
- Apply volume discounts for longer rentals
- Add insurance option costs if selected
- Add additional service costs if selected
- Calculate taxes and fees based on location
- Apply promotional discounts if applicable
- Convert to requested currency if needed

**Availability Determination Logic**
- Query bookings table for vehicle and date range
- Identify booked date ranges
- Identify blocked dates for maintenance
- Apply buffer time between bookings
- Mark dates as available, booked, or blocked
- Enforce minimum/maximum rental periods

**Review Aggregation Logic**
- Calculate overall rating as average of all reviews
- Calculate category ratings as averages
- Count reviews by star rating for distribution
- Sort reviews by selected criteria (date, rating, helpfulness)
- Filter reviews by criteria if specified
- Paginate results for performance

**Environmental Score Calculation**
- Retrieve CO2 emissions data from vehicle specifications
- Calculate fuel efficiency rating
- Determine eco-friendly badge eligibility (emissions below threshold)
- Compare emissions with similar vehicles in category

### Authentication Requirements

**Public Access**
- View vehicle details
- View availability calendar
- View reviews and ratings
- View pricing information
- View supplier information

**Authenticated Access**
- Add vehicle to favorites
- Submit reviews (after completed rental)
- View personalized pricing (loyalty discounts)
- Access booking history for rebooking

**No Special Permissions Required**
- All vehicle detail viewing is public
- Authentication enhances experience but not required

## Database Specifications

### Schema Changes

No new tables required. Existing tables support this feature:
- Vehicles table (already exists)
- Bookings table (for availability)
- Reviews table (for ratings and reviews)
- Suppliers table (for supplier information)
- VehicleImages table (for image gallery)
- VehicleFeatures table (for features list)

### Table Definitions

**Vehicles Table** (existing, no changes)
- Stores vehicle specifications and details
- Indexed on vehicleId for fast lookups

**VehicleImages Table** (existing, may need enhancement)
- vehicleImageId (Primary Key)
- vehicleId (Foreign Key to Vehicles)
- imageUrl (VARCHAR)
- imageCategory (ENUM: exterior, interior, features, damage)
- imageOrder (INT)
- caption (VARCHAR)
- altText (VARCHAR)
- createdAt (DATETIME)

**Reviews Table** (existing, may need enhancement)
- reviewId (Primary Key)
- vehicleId (Foreign Key to Vehicles)
- bookingId (Foreign Key to Bookings)
- userId (Foreign Key to Users)
- overallRating (DECIMAL)
- cleanlinessRating (DECIMAL)
- performanceRating (DECIMAL)
- valueRating (DECIMAL)
- accuracyRating (DECIMAL)
- reviewText (TEXT)
- verifiedBooking (BOOLEAN)
- helpfulVotes (INT)
- createdAt (DATETIME)
- updatedAt (DATETIME)

**ReviewPhotos Table** (new, if not exists)
- reviewPhotoId (Primary Key)
- reviewId (Foreign Key to Reviews)
- photoUrl (VARCHAR)
- photoOrder (INT)
- createdAt (DATETIME)

**HostResponses Table** (new, if not exists)
- hostResponseId (Primary Key)
- reviewId (Foreign Key to Reviews)
- supplierId (Foreign Key to Suppliers)
- responseText (TEXT)
- createdAt (DATETIME)

### Relationships

**Vehicles to VehicleImages**: One-to-Many
- One vehicle has multiple images
- Foreign key: VehicleImages.vehicleId references Vehicles.vehicleId

**Vehicles to Reviews**: One-to-Many
- One vehicle has multiple reviews
- Foreign key: Reviews.vehicleId references Vehicles.vehicleId

**Reviews to ReviewPhotos**: One-to-Many
- One review can have multiple photos
- Foreign key: ReviewPhotos.reviewId references Reviews.reviewId

**Reviews to HostResponses**: One-to-One
- One review can have one host response
- Foreign key: HostResponses.reviewId references Reviews.reviewId

**Vehicles to Suppliers**: Many-to-One
- Multiple vehicles belong to one supplier
- Foreign key: Vehicles.supplierId references Suppliers.supplierId

### Indexes

**Performance Optimization Indexes**
- Index on Vehicles.vehicleId (Primary Key, already indexed)
- Index on VehicleImages.vehicleId for fast image retrieval
- Index on Reviews.vehicleId for fast review retrieval
- Composite index on Reviews (vehicleId, createdAt) for sorted reviews
- Index on Reviews.helpfulVotes for sorting by helpfulness
- Index on Bookings (vehicleId, pickupDate, returnDate) for availability queries

## Technology Stack

- Backend: .NET 8+ with C#, ASP.NET Core Web API
- Database: MySQL 8.0+ with InnoDB storage engine
- Frontend: Next.js 14+ with React 18+, TypeScript, Tailwind CSS
- Image Storage: CDN for vehicle images (CloudFront, Cloudflare)
- Caching: Redis for vehicle details and availability caching

## Implementation Notes

**Performance Considerations**
- Cache vehicle details for frequently viewed vehicles
- Use CDN for image delivery with multiple sizes
- Implement lazy loading for reviews and availability calendar
- Paginate reviews to avoid loading all at once
- Use database indexes for fast queries

**Mobile Optimization**
- Responsive image gallery with touch gestures
- Collapsible sections for better mobile navigation
- Sticky "Book Now" button for easy access
- Optimized image sizes for mobile bandwidth
- Progressive loading of content sections

**Accessibility Considerations**
- Semantic HTML for screen reader compatibility
- Alt text for all images
- Keyboard navigation support
- Sufficient color contrast for text
- ARIA labels for interactive elements

**SEO Considerations**
- Server-side rendering for vehicle details pages
- Structured data markup for search engines
- Descriptive meta tags and titles
- Canonical URLs for vehicle pages
- Image optimization with descriptive filenames

**Error Handling**
- Graceful handling of missing images (placeholder images)
- Error messages for unavailable vehicles
- Fallback content for missing reviews
- Retry logic for failed API calls
- User-friendly error messages

**Future Enhancements**
- 360-degree vehicle interior views
- Video walkthroughs of vehicles
- Virtual test drive simulations
- AR vehicle inspection
- Real-time chat with supplier
- Comparison with similar vehicles
- Price history and trends

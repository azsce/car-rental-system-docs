# Feature: Vehicle Reviews & Ratings System

## Overview

The Vehicle Reviews & Ratings System provides a comprehensive customer feedback mechanism that enables renters to share their experiences and helps future customers make informed decisions. This feature builds trust and transparency in the platform by collecting authentic reviews from verified bookings, displaying aggregate ratings, and allowing hosts/suppliers to respond to feedback.

The system supports multiple rating dimensions (cleanliness, performance, value, accuracy, communication), written reviews with photo uploads, helpful voting, and moderation to ensure quality and authenticity.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature ID

F-SD-010

## Dependencies

- F-SD-009: Comprehensive Vehicle Details (reviews are displayed on vehicle detail pages)

## User Stories

### As a Customer
- As a customer who completed a rental, I want to leave a detailed review with ratings and photos, so that I can share my experience with other renters
- As a customer browsing vehicles, I want to read authentic reviews from previous renters, so that I can make an informed booking decision
- As a customer reading reviews, I want to see verified booking badges, so that I can trust the authenticity of the feedback
- As a customer, I want to upvote helpful reviews, so that the most useful feedback rises to the top
- As a customer, I want to filter and sort reviews by date, rating, or helpfulness, so that I can find the most relevant feedback

### As a Host/Supplier
- As a host, I want to respond to customer reviews, so that I can address concerns and show my commitment to service quality
- As a host, I want to see aggregate ratings across multiple dimensions, so that I can identify areas for improvement

### As a Platform Administrator
- As an administrator, I want to moderate reviews for inappropriate content, so that the platform maintains quality standards
- As an administrator, I want to track review submission rates, so that I can measure customer engagement

## Frontend Specifications

### Pages

**Vehicle Detail Page - Reviews Section**
- Display aggregate ratings with star visualization
- Show total review count
- Display rating breakdown by category (cleanliness, performance, value, accuracy, communication)
- List individual reviews with pagination or infinite scroll
- Filter and sort controls for reviews
- "Write a Review" button (visible only to verified renters)

**Review Submission Page**
- Star rating inputs for each category (1-5 stars with half-star precision)
- Text area for written review (minimum 50 characters, maximum 2000 characters)
- Photo upload interface (up to 5 photos, max 5MB each)
- Review guidelines and terms display
- Submit and cancel buttons
- Character counter for review text

**My Reviews Page (User Profile)**
- List of all reviews written by the user
- Edit and delete options (within 48 hours of submission)
- Review status indicators (pending moderation, published, flagged)

### UI Components

**ReviewCard Component**
- Reviewer name and profile photo
- Verified booking badge
- Review date (relative time: "2 days ago")
- Star ratings for each category with visual stars
- Written review text with "Read More" expansion for long reviews
- Review photos gallery with lightbox
- Helpful vote count and vote buttons (thumbs up/down)
- Host response section (if available)
- Report review button

**RatingStars Component**
- Interactive star input for rating submission
- Read-only star display for showing ratings
- Half-star precision support
- Hover effects for rating selection
- Accessible keyboard navigation

**RatingBreakdown Component**
- Overall rating with large star display
- Total review count
- Horizontal bar charts showing distribution across 5-4-3-2-1 stars
- Percentage display for each rating level
- Category-specific ratings (cleanliness, performance, value, accuracy, communication)

**ReviewFilters Component**
- Sort dropdown (Most Recent, Highest Rated, Lowest Rated, Most Helpful)
- Rating filter (All, 5 stars, 4 stars, 3 stars, 2 stars, 1 star)
- Verified bookings only toggle
- With photos only toggle
- Date range filter

**PhotoUpload Component**
- Drag-and-drop photo upload area
- File browser button
- Photo preview thumbnails with remove option
- Upload progress indicators
- Image validation (format, size, dimensions)
- Crop/rotate tools (optional)

### User Flows

**Submit Review Flow**
1. User completes rental and receives review invitation email
2. User clicks "Write a Review" from email or vehicle detail page
3. System verifies user has completed booking for this vehicle
4. User rates vehicle across multiple categories (1-5 stars)
5. User writes detailed review text
6. User optionally uploads photos from their rental
7. User reviews submission and accepts terms
8. User submits review
9. System queues review for moderation
10. User receives confirmation and notification when review is published

**Browse Reviews Flow**
1. User views vehicle detail page
2. User scrolls to reviews section
3. User sees aggregate ratings and review count
4. User applies filters/sorting to find relevant reviews
5. User reads individual reviews
6. User views review photos in lightbox
7. User votes on review helpfulness
8. User reads host responses to reviews

**Host Response Flow**
1. Host receives notification of new review
2. Host navigates to review from notification
3. Host reads customer review
4. Host writes response (maximum 1000 characters)
5. Host submits response
6. Response is published immediately below review
7. Customer receives notification of host response

### Data Requirements

**From Backend APIs**
- GET /api/vehicles/{vehicleId}/reviews - Retrieve paginated reviews for a vehicle
- GET /api/vehicles/{vehicleId}/ratings - Retrieve aggregate ratings and breakdown
- POST /api/reviews - Submit new review
- PUT /api/reviews/{reviewId} - Update existing review (within 48 hours)
- DELETE /api/reviews/{reviewId} - Delete review (within 48 hours)
- POST /api/reviews/{reviewId}/helpful - Vote review as helpful
- POST /api/reviews/{reviewId}/report - Report inappropriate review
- POST /api/reviews/{reviewId}/response - Submit host response
- GET /api/users/{userId}/reviews - Retrieve user's review history

**Review Data Model (Frontend)**
```
{
  reviewId: string
  vehicleId: string
  userId: string
  userName: string
  userPhoto: string
  verifiedBooking: boolean
  bookingId: string
  reviewDate: ISO8601 timestamp
  overallRating: number (1-5, half-star precision)
  categoryRatings: {
    cleanliness: number
    performance: number
    value: number
    accuracy: number
    communication: number
  }
  reviewText: string
  photos: Array<{photoId: string, url: string, thumbnail: string}>
  helpfulVotes: number
  unhelpfulVotes: number
  userVoted: 'helpful' | 'unhelpful' | null
  hostResponse: {
    responseText: string
    responseDate: ISO8601 timestamp
    hostName: string
  } | null
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'rejected'
}
```

## Backend Specifications

### API Endpoints

**GET /api/vehicles/{vehicleId}/reviews**
- Purpose: Retrieve paginated reviews for a specific vehicle
- Authentication: Optional (public endpoint, but user-specific data requires auth)
- Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10, max: 50)
  - sortBy: 'recent' | 'rating_high' | 'rating_low' | 'helpful' (default: 'recent')
  - minRating: number (1-5, optional filter)
  - verifiedOnly: boolean (default: false)
  - withPhotos: boolean (default: false)
- Response: 200 OK with paginated review list
- Error Responses: 404 if vehicle not found

**GET /api/vehicles/{vehicleId}/ratings**
- Purpose: Retrieve aggregate ratings and distribution for a vehicle
- Authentication: None (public endpoint)
- Response: 200 OK with ratings summary
- Response Body:
  - overallRating: number
  - totalReviews: number
  - ratingDistribution: {5: count, 4: count, 3: count, 2: count, 1: count}
  - categoryAverages: {cleanliness, performance, value, accuracy, communication}

**POST /api/reviews**
- Purpose: Submit a new review for a completed booking
- Authentication: Required (JWT token)
- Request Body:
  - bookingId: string (required)
  - vehicleId: string (required)
  - overallRating: number (required, 1-5)
  - categoryRatings: object (required)
  - reviewText: string (required, 50-2000 chars)
  - photos: Array<File> (optional, max 5 photos)
- Response: 201 Created with review object
- Error Responses:
  - 400 if validation fails
  - 401 if not authenticated
  - 403 if user hasn't completed booking or already reviewed
  - 404 if booking/vehicle not found

**PUT /api/reviews/{reviewId}**
- Purpose: Update an existing review (within 48 hours of submission)
- Authentication: Required (must be review author)
- Request Body: Same as POST /api/reviews
- Response: 200 OK with updated review
- Error Responses:
  - 400 if validation fails
  - 401 if not authenticated
  - 403 if not review author or edit window expired
  - 404 if review not found

**DELETE /api/reviews/{reviewId}**
- Purpose: Delete a review (within 48 hours of submission)
- Authentication: Required (must be review author or admin)
- Response: 204 No Content
- Error Responses:
  - 401 if not authenticated
  - 403 if not authorized or delete window expired
  - 404 if review not found

**POST /api/reviews/{reviewId}/helpful**
- Purpose: Vote on review helpfulness
- Authentication: Required
- Request Body: {vote: 'helpful' | 'unhelpful'}
- Response: 200 OK with updated vote counts
- Error Responses:
  - 400 if invalid vote value
  - 401 if not authenticated
  - 404 if review not found

**POST /api/reviews/{reviewId}/report**
- Purpose: Report a review for inappropriate content
- Authentication: Required
- Request Body: {reason: string, details: string}
- Response: 200 OK with report confirmation
- Error Responses:
  - 400 if validation fails
  - 401 if not authenticated
  - 404 if review not found

**POST /api/reviews/{reviewId}/response**
- Purpose: Submit host response to a review
- Authentication: Required (must be vehicle owner/supplier)
- Request Body: {responseText: string (max 1000 chars)}
- Response: 201 Created with response object
- Error Responses:
  - 400 if validation fails
  - 401 if not authenticated
  - 403 if not vehicle owner
  - 404 if review not found
  - 409 if response already exists

**GET /api/users/{userId}/reviews**
- Purpose: Retrieve all reviews written by a user
- Authentication: Required (must be user or admin)
- Query Parameters: page, limit, sortBy
- Response: 200 OK with paginated review list
- Error Responses:
  - 401 if not authenticated
  - 403 if not authorized
  - 404 if user not found

### Request Schemas

**Create Review Request**
```
{
  bookingId: string (UUID, required)
  vehicleId: string (UUID, required)
  overallRating: number (1-5, half-star precision, required)
  categoryRatings: {
    cleanliness: number (1-5, required)
    performance: number (1-5, required)
    value: number (1-5, required)
    accuracy: number (1-5, required)
    communication: number (1-5, required)
  }
  reviewText: string (50-2000 characters, required)
  photos: Array<File> (optional, max 5, each max 5MB, formats: jpg, png, webp)
}
```

**Vote Request**
```
{
  vote: 'helpful' | 'unhelpful' (required)
}
```

**Report Request**
```
{
  reason: 'spam' | 'offensive' | 'fake' | 'other' (required)
  details: string (max 500 characters, optional)
}
```

**Host Response Request**
```
{
  responseText: string (10-1000 characters, required)
}
```

### Response Schemas

**Review Object**
```
{
  reviewId: string (UUID)
  vehicleId: string (UUID)
  userId: string (UUID)
  userName: string
  userPhoto: string (URL)
  verifiedBooking: boolean
  bookingId: string (UUID)
  reviewDate: string (ISO8601)
  lastModified: string (ISO8601)
  overallRating: number (1-5)
  categoryRatings: {
    cleanliness: number
    performance: number
    value: number
    accuracy: number
    communication: number
  }
  reviewText: string
  photos: Array<{
    photoId: string
    url: string
    thumbnailUrl: string
    width: number
    height: number
  }>
  helpfulVotes: number
  unhelpfulVotes: number
  userVoted: 'helpful' | 'unhelpful' | null
  hostResponse: {
    responseId: string
    responseText: string
    responseDate: string (ISO8601)
    hostName: string
    hostPhoto: string
  } | null
  moderationStatus: 'pending' | 'approved' | 'flagged' | 'rejected'
  canEdit: boolean
  canDelete: boolean
}
```

**Ratings Summary Object**
```
{
  vehicleId: string
  overallRating: number (1-5, one decimal place)
  totalReviews: number
  ratingDistribution: {
    5: number (count)
    4: number (count)
    3: number (count)
    2: number (count)
    1: number (count)
  }
  categoryAverages: {
    cleanliness: number
    performance: number
    value: number
    accuracy: number
    communication: number
  }
  percentageRecommend: number (0-100)
}
```

### Business Logic

**Review Eligibility Validation**
- User must have completed booking for the vehicle
- Booking must be in "completed" status
- User can only submit one review per booking
- Review can be submitted up to 90 days after booking completion
- User cannot review their own vehicles (for peer-to-peer platforms)

**Review Moderation Logic**
- All reviews enter "pending" status initially
- Automated checks for profanity, spam patterns, suspicious content
- Reviews with photos require manual approval
- Reviews with ratings below 2 stars flagged for manual review
- Approved reviews published immediately
- Flagged reviews sent to moderation queue
- Rejected reviews notify user with reason

**Rating Calculation**
- Overall rating is average of all category ratings
- Vehicle aggregate rating is weighted average of all approved reviews
- Recent reviews (last 6 months) weighted 1.5x
- Verified bookings weighted 1.2x
- Reviews with photos weighted 1.1x
- Recalculate aggregate ratings on new review approval

**Helpful Vote Logic**
- Users can vote once per review (helpful or unhelpful)
- Users can change their vote
- Review author cannot vote on their own review
- Vote counts update in real-time
- Reviews sorted by helpfulness use net helpful votes (helpful - unhelpful)

**Host Response Rules**
- Hosts can respond once per review
- Response cannot be edited after submission
- Response cannot be deleted (only hidden by admin)
- Response published immediately without moderation
- Customer notified when host responds

**Edit/Delete Window**
- Reviews can be edited within 48 hours of submission
- Reviews can be deleted within 48 hours of submission
- After 48 hours, only admins can modify/delete
- Edits reset moderation status to "pending"
- Edit history tracked for audit purposes

### Authentication Requirements

**Public Endpoints (No Auth Required)**
- GET /api/vehicles/{vehicleId}/reviews (read-only)
- GET /api/vehicles/{vehicleId}/ratings (read-only)

**Authenticated User Endpoints**
- POST /api/reviews (requires completed booking)
- PUT /api/reviews/{reviewId} (requires ownership)
- DELETE /api/reviews/{reviewId} (requires ownership)
- POST /api/reviews/{reviewId}/helpful (requires authentication)
- POST /api/reviews/{reviewId}/report (requires authentication)
- GET /api/users/{userId}/reviews (requires ownership or admin)

**Host/Supplier Endpoints**
- POST /api/reviews/{reviewId}/response (requires vehicle ownership)

**Admin Endpoints**
- PUT /api/reviews/{reviewId}/moderate (admin only)
- DELETE /api/reviews/{reviewId} (admin override)

**Authorization Checks**
- Verify JWT token validity
- Check user role and permissions
- Verify booking ownership for review submission
- Verify vehicle ownership for host responses
- Verify review ownership for edits/deletes

## Database Specifications

### Schema Changes

**New Tables Required**

**reviews table**
- Primary table storing all review data
- Indexes on vehicleId, userId, bookingId for efficient queries
- Full-text index on reviewText for search functionality

**review_photos table**
- Stores photo metadata for reviews
- One-to-many relationship with reviews
- Stores original and thumbnail URLs

**review_votes table**
- Tracks helpful/unhelpful votes
- Composite unique index on (reviewId, userId) to prevent duplicate votes

**review_responses table**
- Stores host responses to reviews
- One-to-one relationship with reviews

**review_reports table**
- Tracks reported reviews for moderation
- Includes report reason and details

### Table Definitions

**reviews**
```sql
CREATE TABLE reviews (
  review_id CHAR(36) PRIMARY KEY,
  vehicle_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  booking_id CHAR(36) NOT NULL UNIQUE,
  overall_rating DECIMAL(2,1) NOT NULL CHECK (overall_rating >= 1.0 AND overall_rating <= 5.0),
  cleanliness_rating DECIMAL(2,1) NOT NULL CHECK (cleanliness_rating >= 1.0 AND cleanliness_rating <= 5.0),
  performance_rating DECIMAL(2,1) NOT NULL CHECK (performance_rating >= 1.0 AND performance_rating <= 5.0),
  value_rating DECIMAL(2,1) NOT NULL CHECK (value_rating >= 1.0 AND value_rating <= 5.0),
  accuracy_rating DECIMAL(2,1) NOT NULL CHECK (accuracy_rating >= 1.0 AND accuracy_rating <= 5.0),
  communication_rating DECIMAL(2,1) NOT NULL CHECK (communication_rating >= 1.0 AND communication_rating <= 5.0),
  review_text TEXT NOT NULL,
  helpful_votes INT DEFAULT 0,
  unhelpful_votes INT DEFAULT 0,
  moderation_status ENUM('pending', 'approved', 'flagged', 'rejected') DEFAULT 'pending',
  moderation_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  INDEX idx_vehicle_id (vehicle_id),
  INDEX idx_user_id (user_id),
  INDEX idx_booking_id (booking_id),
  INDEX idx_moderation_status (moderation_status),
  INDEX idx_created_at (created_at),
  FULLTEXT INDEX idx_review_text (review_text),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**review_photos**
```sql
CREATE TABLE review_photos (
  photo_id CHAR(36) PRIMARY KEY,
  review_id CHAR(36) NOT NULL,
  original_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500) NOT NULL,
  width INT NOT NULL,
  height INT NOT NULL,
  file_size INT NOT NULL,
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  display_order INT DEFAULT 0,
  INDEX idx_review_id (review_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**review_votes**
```sql
CREATE TABLE review_votes (
  vote_id CHAR(36) PRIMARY KEY,
  review_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  vote_type ENUM('helpful', 'unhelpful') NOT NULL,
  voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_review (review_id, user_id),
  INDEX idx_review_id (review_id),
  INDEX idx_user_id (user_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**review_responses**
```sql
CREATE TABLE review_responses (
  response_id CHAR(36) PRIMARY KEY,
  review_id CHAR(36) NOT NULL UNIQUE,
  host_id CHAR(36) NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_review_id (review_id),
  INDEX idx_host_id (host_id),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**review_reports**
```sql
CREATE TABLE review_reports (
  report_id CHAR(36) PRIMARY KEY,
  review_id CHAR(36) NOT NULL,
  reporter_id CHAR(36) NOT NULL,
  reason ENUM('spam', 'offensive', 'fake', 'other') NOT NULL,
  details TEXT,
  status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL,
  reviewed_by CHAR(36) NULL,
  INDEX idx_review_id (review_id),
  INDEX idx_reporter_id (reporter_id),
  INDEX idx_status (status),
  FOREIGN KEY (review_id) REFERENCES reviews(review_id) ON DELETE CASCADE,
  FOREIGN KEY (reporter_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**reviews → vehicles**
- Many-to-one relationship
- Each review belongs to one vehicle
- Each vehicle can have many reviews
- Foreign key: reviews.vehicle_id → vehicles.vehicle_id
- Cascade delete: When vehicle deleted, all reviews deleted

**reviews → users**
- Many-to-one relationship
- Each review written by one user
- Each user can write many reviews
- Foreign key: reviews.user_id → users.user_id
- Cascade delete: When user deleted, all reviews deleted

**reviews → bookings**
- One-to-one relationship
- Each review linked to one booking
- Each booking can have at most one review
- Foreign key: reviews.booking_id → bookings.booking_id
- Unique constraint on booking_id
- Cascade delete: When booking deleted, review deleted

**review_photos → reviews**
- Many-to-one relationship
- Each photo belongs to one review
- Each review can have multiple photos (max 5)
- Foreign key: review_photos.review_id → reviews.review_id
- Cascade delete: When review deleted, all photos deleted

**review_votes → reviews**
- Many-to-one relationship
- Each vote belongs to one review
- Each review can have many votes
- Foreign key: review_votes.review_id → reviews.review_id
- Cascade delete: When review deleted, all votes deleted

**review_votes → users**
- Many-to-one relationship
- Each vote cast by one user
- Each user can cast many votes
- Foreign key: review_votes.user_id → users.user_id
- Composite unique constraint: (review_id, user_id)

**review_responses → reviews**
- One-to-one relationship
- Each response belongs to one review
- Each review can have at most one response
- Foreign key: review_responses.review_id → reviews.review_id
- Unique constraint on review_id
- Cascade delete: When review deleted, response deleted

**review_responses → users (hosts)**
- Many-to-one relationship
- Each response written by one host
- Each host can write many responses
- Foreign key: review_responses.host_id → users.user_id

**review_reports → reviews**
- Many-to-one relationship
- Each report targets one review
- Each review can have multiple reports
- Foreign key: review_reports.review_id → reviews.review_id

**review_reports → users (reporters)**
- Many-to-one relationship
- Each report filed by one user
- Each user can file many reports
- Foreign key: review_reports.reporter_id → users.user_id

### Indexes

**Performance Optimization Indexes**

**reviews table**
- PRIMARY KEY (review_id): Clustered index for fast lookups
- INDEX idx_vehicle_id: Fast retrieval of all reviews for a vehicle
- INDEX idx_user_id: Fast retrieval of all reviews by a user
- INDEX idx_booking_id: Fast lookup to check if booking already reviewed
- INDEX idx_moderation_status: Fast filtering of pending/approved reviews
- INDEX idx_created_at: Efficient sorting by date
- FULLTEXT INDEX idx_review_text: Full-text search on review content
- Composite index (vehicle_id, moderation_status, created_at): Optimized for common query pattern

**review_photos table**
- PRIMARY KEY (photo_id): Fast photo lookups
- INDEX idx_review_id: Fast retrieval of all photos for a review

**review_votes table**
- PRIMARY KEY (vote_id): Fast vote lookups
- UNIQUE KEY (review_id, user_id): Enforce one vote per user per review, fast duplicate check
- INDEX idx_review_id: Fast vote count aggregation
- INDEX idx_user_id: Fast retrieval of user's voting history

**review_responses table**
- PRIMARY KEY (response_id): Fast response lookups
- UNIQUE INDEX idx_review_id: Enforce one response per review, fast response retrieval
- INDEX idx_host_id: Fast retrieval of all responses by a host

**review_reports table**
- PRIMARY KEY (report_id): Fast report lookups
- INDEX idx_review_id: Fast retrieval of all reports for a review
- INDEX idx_reporter_id: Fast retrieval of reports by user
- INDEX idx_status: Fast filtering of pending reports for moderation queue

**Query Optimization Considerations**
- Use covering indexes for common queries
- Partition reviews table by created_at for large datasets (monthly partitions)
- Archive old reviews (>2 years) to separate table
- Cache aggregate ratings in vehicles table for fast display
- Use materialized views for complex rating calculations

## Technology Stack

- **Backend**: .NET 8+ with C# and ASP.NET Core Web API
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with React 18+ and TypeScript
- **Image Storage**: Cloud storage (AWS S3, Azure Blob Storage, or Cloudflare R2)
- **Image Processing**: Sharp or ImageMagick for thumbnail generation
- **Content Moderation**: Azure Content Moderator or AWS Rekognition for automated checks
- **Authentication**: JWT tokens with .NET Identity
- **Caching**: Redis for aggregate rating caching

## Implementation Notes

### Review Submission Workflow
1. User completes booking and rental period ends
2. System sends review invitation email 24 hours after return
3. User clicks review link and is authenticated
4. System verifies booking eligibility (completed, not already reviewed)
5. User fills out review form with ratings, text, and optional photos
6. Frontend validates input (character limits, rating ranges, photo formats)
7. Backend validates booking ownership and eligibility
8. Photos uploaded to cloud storage with thumbnail generation
9. Review saved with "pending" moderation status
10. Automated moderation checks run (profanity, spam detection)
11. If passes automated checks, status set to "approved" and published
12. If flagged, review sent to moderation queue
13. User receives confirmation email
14. Vehicle aggregate ratings recalculated asynchronously

### Moderation Workflow
1. Flagged reviews appear in admin moderation queue
2. Moderator reviews content, photos, and context
3. Moderator approves, rejects, or requests changes
4. If approved, review published and user notified
5. If rejected, user notified with reason and option to revise
6. Moderation decision logged for audit trail

### Rating Calculation Strategy
- Calculate aggregate ratings asynchronously using background jobs
- Cache aggregate ratings in vehicles table for fast display
- Recalculate on new review approval, not on every page load
- Use weighted averages to prioritize recent, verified reviews
- Update cache every 5 minutes for active vehicles
- Full recalculation nightly for all vehicles

### Photo Handling
- Accept JPEG, PNG, WebP formats
- Maximum 5MB per photo, 5 photos per review
- Generate thumbnails (300x200) and medium (800x600) sizes
- Store originals and thumbnails in cloud storage
- Use CDN for fast photo delivery
- Lazy load photos in review list
- Implement lightbox for full-size viewing

### Performance Considerations
- Paginate review lists (10-20 per page)
- Implement infinite scroll for better UX
- Cache aggregate ratings for 5 minutes
- Use database indexes for efficient sorting and filtering
- Lazy load review photos
- Implement optimistic UI updates for helpful votes
- Use background jobs for rating recalculation
- Archive old reviews to separate table after 2 years

### Security Considerations
- Validate booking ownership before allowing review submission
- Prevent review spam with rate limiting (max 1 review per booking)
- Sanitize review text to prevent XSS attacks
- Validate photo uploads (format, size, content)
- Implement CAPTCHA for review submission to prevent bots
- Rate limit helpful votes to prevent manipulation
- Encrypt sensitive data in database
- Implement audit logging for all review modifications

### Accessibility Considerations
- Ensure star rating inputs are keyboard accessible
- Provide text alternatives for star ratings (e.g., "4.5 out of 5 stars")
- Use ARIA labels for interactive elements
- Ensure sufficient color contrast for ratings display
- Support screen readers for review content
- Provide skip links for long review lists
- Ensure photo lightbox is keyboard navigable

### Internationalization
- Support multiple languages for review text
- Translate UI labels and messages
- Format dates according to user locale
- Support right-to-left languages
- Translate moderation messages
- Support currency formatting for value ratings

### Analytics & Monitoring
- Track review submission rate
- Monitor average ratings over time
- Track moderation queue size and processing time
- Monitor helpful vote patterns
- Track photo upload success rate
- Alert on sudden rating drops for vehicles
- Track review edit/delete rates
- Monitor API response times for review endpoints

### Future Enhancements
- Video reviews (short clips from rental)
- Review templates for common scenarios
- Review incentives (loyalty points for reviews)
- Verified photo badges (photos taken during official inspection)
- Review translation for international users
- AI-powered review summaries
- Sentiment analysis for review text
- Review quality scoring
- Gamification (review badges, top reviewer leaderboard)

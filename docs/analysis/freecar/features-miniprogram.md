---
sidebar_position: 5
title: Mini-Program Features
description: Analysis of FreeCar's mini-program (mobile) features and user experience
tags: [freecar, features, mobile, mini-program, user-facing]
---

# FreeCar Mini-Program Features

## Overview

FreeCar's mini-program serves as the primary customer-facing interface, providing a lightweight, mobile-first experience for vehicle rental. Built as a WeChat mini-program, it demonstrates modern mobile UX patterns while leveraging platform-specific capabilities for seamless user experience.

The mini-program architecture is technology-agnostic in principle, applicable to any mobile platform (iOS, Android, web apps, or platform-specific mini-programs).

## Authentication & Onboarding Features

### Seamless Login

**Social Authentication**:
- One-tap login via platform authentication (WeChat)
- No traditional username/password required
- Automatic account creation on first login
- Persistent login across sessions
- Secure token-based authentication

**User Onboarding**:
- Welcome screen with app introduction
- Quick tutorial on key features
- Profile completion prompts
- Verification requirement notification
- Guided first booking flow

### Profile Setup

**Personal Information**:
- Name and contact details entry
- Date of birth selection
- Address input with autocomplete
- Emergency contact information
- Profile picture upload

**Preferences**:
- Language selection
- Currency preference
- Notification preferences
- Default payment method
- Favorite locations

## Vehicle Discovery Features

### Home Screen

**Quick Actions**:
- Prominent "Book Now" button
- Recent bookings quick access
- Saved favorite vehicles
- Nearby available vehicles
- Current active trip (if any)

**Personalized Content**:
- Recommended vehicles based on history
- Special offers and promotions
- Popular vehicles in user's area
- Seasonal recommendations
- New vehicle announcements

### Vehicle Search

**Location-Based Search**:
- Current location detection
- Search by address or landmark
- Map view of available vehicles
- Distance from user location
- Pickup location selection

**Date & Time Selection**:
- Calendar picker for pickup date
- Time picker with 30-minute intervals
- Return date/time selection
- Duration calculation and display
- Availability checking in real-time

**Advanced Filters**:
- Vehicle category (economy, standard, luxury, SUV, electric)
- Price range slider
- Transmission type (automatic, manual)
- Fuel type (gasoline, diesel, electric, hybrid)
- Seating capacity
- Features (GPS, Bluetooth, backup camera, etc.)
- Minimum rating filter

**Search Results**:
- Grid or list view toggle
- Vehicle cards with key information
- Price per hour/day display
- Distance from pickup location
- Vehicle rating and review count
- Availability indicator
- Favorite/save vehicle option

### Vehicle Details

**Comprehensive Information**:
- High-quality vehicle images (swipeable gallery)
- Make, model, year
- License plate number
- Vehicle category and features
- Detailed specifications (seats, transmission, fuel type)
- Current location on map
- Pricing breakdown (hourly, daily rates)

**Availability Calendar**:
- Visual calendar showing available dates
- Blocked dates for maintenance
- Already booked time slots
- Real-time availability updates

**Reviews & Ratings**:
- Overall rating (stars)
- Number of reviews
- Recent reviews with user comments
- Rating breakdown (cleanliness, performance, value)
- Photos from previous renters

**Similar Vehicles**:
- Alternative vehicle suggestions
- Same category vehicles
- Nearby vehicles
- Price comparison

## Booking & Reservation Features

### Booking Creation

**Booking Form**:
- Selected vehicle summary
- Pickup date/time confirmation
- Return date/time confirmation
- Pickup location selection
- Return location selection (same or different)
- Duration and price display

**Price Breakdown**:
- Base rental price
- Time-based charges
- Estimated distance charges (if applicable)
- Insurance options
- Additional services (GPS, child seat, etc.)
- Discount code application
- Tax breakdown
- Total price display

**Discount Codes**:
- Promo code input field
- Code validation
- Discount amount display
- Code expiration notification
- Available promotions list

**Booking Confirmation**:
- Review all booking details
- Terms and conditions acceptance
- Cancellation policy display
- Payment method selection
- Confirm and pay button

### Payment Processing

**Payment Methods**:
- Credit/debit card
- Platform wallet (WeChat Pay)
- Saved payment methods
- Add new payment method
- Default payment method selection

**Payment Flow**:
- Secure payment processing
- Payment confirmation
- Receipt generation
- Email/SMS confirmation
- Booking confirmation screen

**Payment Status**:
- Processing indicator
- Success confirmation
- Failure handling with retry
- Refund status tracking

## Trip Management Features

### Active Trip

**Trip Dashboard**:
- Current trip status
- Vehicle information
- Pickup/return times
- Elapsed time display
- Estimated cost so far
- Extend trip option
- End trip button

**Vehicle Controls** (if supported):
- Lock/unlock vehicle remotely
- Horn/lights control
- View vehicle location on map
- Navigation to vehicle
- Report issue button

**Trip Progress**:
- Real-time location tracking
- Route visualization on map
- Distance traveled
- Time remaining
- Fuel/battery level

### Trip Extension

**Extend Booking**:
- Select new return time
- Check vehicle availability
- Calculate additional cost
- Confirm extension
- Update booking confirmation

### Trip Completion

**Return Process**:
- Confirm return location
- Final odometer reading input
- Vehicle condition checklist
- Damage reporting (if any)
- Photo upload for condition
- Confirm return button

**Final Invoice**:
- Total trip duration
- Distance traveled
- Base charges
- Additional charges (late return, fuel, damage)
- Discounts applied
- Final amount charged
- Download invoice option

## Booking History Features

### My Bookings

**Booking List**:
- Upcoming bookings
- Active trips
- Past bookings
- Cancelled bookings
- Filter by status
- Search bookings

**Booking Details**:
- Complete booking information
- Vehicle details
- Pickup/return times and locations
- Price breakdown
- Payment status
- Invoice download
- Rebook option

### Booking Modifications

**Modify Booking**:
- Change pickup/return times
- Change vehicle (if available)
- Update locations
- Recalculate pricing
- Confirm changes

**Cancel Booking**:
- Cancellation policy display
- Refund amount calculation
- Cancellation reason selection
- Confirm cancellation
- Refund status tracking

## Profile & Verification Features

### My Profile

**Profile Information**:
- View personal details
- Edit profile information
- Change profile picture
- Update contact details
- Manage addresses

**Verification Status**:
- Verification status indicator
- Upload driver license
- View verification progress
- Re-submit documents if rejected
- Verification expiration reminder

### Driver License Verification

**Document Upload**:
- Camera access for photo capture
- Upload from photo library
- Front and back of license
- Image preview before upload
- Retake photo option

**Verification Progress**:
- Upload confirmation
- Under review status
- Approval notification
- Rejection with reason
- Re-submission guidance

**Verification Benefits**:
- Unlock booking capability
- Access to premium vehicles
- Better insurance rates
- Faster checkout process

## Notification Features

### Push Notifications

**Booking Notifications**:
- Booking confirmation
- Upcoming trip reminders (24h, 1h before)
- Trip start reminder
- Trip end reminder
- Booking modification confirmation
- Cancellation confirmation

**Payment Notifications**:
- Payment successful
- Payment failed
- Refund processed
- Invoice available

**Verification Notifications**:
- Documents received
- Verification approved
- Verification rejected
- Verification expiring soon

**Promotional Notifications**:
- Special offers
- Discount codes
- New vehicles available
- Seasonal promotions

### In-App Notifications

**Notification Center**:
- List of all notifications
- Unread indicator
- Mark as read
- Delete notifications
- Notification settings

**Real-Time Updates**:
- Vehicle availability changes
- Price changes
- Booking status updates
- Trip progress updates

## Location & Navigation Features

### Map Integration

**Interactive Map**:
- View available vehicles on map
- Vehicle markers with info
- User location indicator
- Pickup location selection
- Return location selection
- Zoom and pan controls

**Navigation**:
- Get directions to vehicle
- Turn-by-turn navigation
- Estimated arrival time
- Traffic information
- Alternative routes

**Geofencing**:
- Allowed driving areas
- Restricted zones notification
- Return location boundaries
- Parking zone indicators

## Support & Help Features

### Help Center

**FAQ Section**:
- Common questions and answers
- How-to guides
- Troubleshooting tips
- Policy information
- Contact information

**Search Help**:
- Search help articles
- Category browsing
- Related articles
- Helpful/not helpful feedback

### Customer Support

**Contact Options**:
- In-app chat support
- Phone support
- Email support
- Support ticket submission
- Emergency contact (24/7)

**Issue Reporting**:
- Report vehicle issues
- Report app bugs
- Report payment issues
- Report safety concerns
- Attach photos/screenshots

## Favorites & Preferences Features

### Saved Vehicles

**Favorite Vehicles**:
- Save favorite vehicles
- Quick access to favorites
- Availability notifications
- Price drop alerts
- Remove from favorites

### Saved Locations

**Frequent Locations**:
- Save home address
- Save work address
- Save frequent pickup locations
- Quick location selection
- Edit/delete saved locations

## Wallet & Payment Features

### Wallet Management

**Balance & Credits**:
- View wallet balance
- Add funds to wallet
- View transaction history
- Promotional credits
- Referral rewards

**Payment Methods**:
- Saved credit/debit cards
- Add new payment method
- Set default payment method
- Remove payment method
- Update card information

### Transaction History

**Payment Records**:
- All transactions list
- Filter by date range
- Filter by type (payment, refund, credit)
- Transaction details
- Download receipts

## Referral & Rewards Features

### Referral Program

**Invite Friends**:
- Generate referral code
- Share referral link
- Track referrals
- Referral rewards
- Terms and conditions

**Rewards Tracking**:
- Earned rewards
- Pending rewards
- Reward expiration
- Redeem rewards
- Reward history

### Loyalty Program

**Points System**:
- Earn points per booking
- Points balance
- Points expiration
- Redeem points for discounts
- Tier status (bronze, silver, gold)

## Settings Features

### App Settings

**Account Settings**:
- Change password
- Email preferences
- Phone number verification
- Two-factor authentication
- Account deletion

**Notification Settings**:
- Push notification toggle
- Email notification toggle
- SMS notification toggle
- Notification categories
- Quiet hours

**Display Settings**:
- Language selection
- Currency selection
- Date/time format
- Distance units (km/miles)
- Theme (light/dark mode)

### Privacy & Security

**Privacy Controls**:
- Location permissions
- Camera permissions
- Photo library permissions
- Data sharing preferences
- Privacy policy

**Security Features**:
- Biometric login (fingerprint, face ID)
- PIN code lock
- Auto-logout timeout
- Secure session management

## Offline Features

### Offline Capabilities

**Cached Data**:
- View recent bookings offline
- Access saved vehicles offline
- View profile information offline
- Access help articles offline

**Sync on Reconnect**:
- Automatic data sync
- Conflict resolution
- Pending actions queue
- Sync status indicator

## Accessibility Features

### Inclusive Design

**Accessibility Options**:
- Screen reader support
- High contrast mode
- Large text option
- Voice commands
- Keyboard navigation

**Localization**:
- Multiple language support
- Right-to-left language support
- Local currency display
- Local date/time formats
- Regional content

## Performance Features

### Optimized Experience

**Fast Loading**:
- Lazy loading of images
- Progressive image loading
- Cached content
- Optimized API calls
- Minimal data usage

**Smooth Interactions**:
- Smooth scrolling
- Instant feedback
- Loading indicators
- Skeleton screens
- Optimistic UI updates

## Conclusion

FreeCar's mini-program demonstrates a comprehensive, user-centric mobile experience with:
- **Seamless Onboarding**: Easy authentication and profile setup
- **Intuitive Discovery**: Powerful search and filtering
- **Smooth Booking**: Streamlined reservation process
- **Real-Time Updates**: Live trip tracking and notifications
- **Complete Management**: Full booking lifecycle control
- **Excellent Support**: Comprehensive help and customer service

These features provide a blueprint for building modern, mobile-first car rental applications that prioritize user experience, performance, and accessibility.

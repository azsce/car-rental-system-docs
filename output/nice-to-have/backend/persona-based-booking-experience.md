# Feature: Persona-Based Booking Experience (Backend)

## Overview

The backend implementation for Persona-Based Booking Experience provides the API infrastructure and business logic to support dynamic, user-segment-specific booking interfaces. The system detects user personas through machine learning analysis of booking patterns, manages personalization settings, processes split-payment bookings, handles VIN-specific allocations, and calculates sustainability metrics.

This backend service enables the frontend to deliver tailored experiences for Power Renters, Experience Seekers, Young Drivers, Eco-Conscious users, and Accessible Mobility users by providing persona detection, preference management, and specialized booking workflows.

## Sprint Category

nice-to-have

## Feature ID

F-BM-002

## User Stories

### Story 1: Persona Detection Service
As a backend system, I want to analyze user behavior and classify users into personas, so that the frontend can deliver personalized booking experiences.

### Story 2: Quick Rebooking API
As a Power Renter, I want the backend to retrieve my previous booking details and create a new booking with one API call, so that I can complete bookings in seconds.

### Story 3: Split-Payment Processing
As a Young Driver, I want the backend to manage split-payment coordination among multiple co-renters, so that we can share booking costs seamlessly.

### Story 4: VIN-Specific Allocation
As a luxury customer, I want the backend to enforce VIN-locked bookings with no vehicle swapping, so that I receive the exact vehicle I reserved.

### Story 5: Sustainability Metrics API
As an Eco-Conscious user, I want the backend to provide real-time environmental impact data, so that I can make informed sustainable choices.

## Backend Specifications

### API Endpoints

#### Persona Management

**GET /api/v1/users/{userId}/persona**
- **Purpose**: Retrieve user's detected persona segment and personalization settings
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only access their own persona data
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID)
- **Response**: 200 OK with PersonaDetectionResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found

**PUT /api/v1/users/{userId}/persona**
- **Purpose**: Update user's persona preferences or override automatic detection
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only update their own persona
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID)
- **Request Body**: PersonaUpdateRequest
- **Response**: 200 OK with updated PersonaDetectionResponse
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 404 Not Found

**POST /api/v1/users/{userId}/persona/detect**
- **Purpose**: Trigger manual persona re-detection based on latest user data
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only trigger detection for themselves
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID)
- **Response**: 200 OK with PersonaDetectionResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found

#### Booking Templates

**GET /api/v1/users/{userId}/booking-templates**
- **Purpose**: Retrieve all saved booking templates for user
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only access their own templates
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID)
- **Query Parameters**: includeShared (boolean, optional)
- **Response**: 200 OK with array of BookingTemplateResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found

**POST /api/v1/users/{userId}/booking-templates**
- **Purpose**: Create new booking template from booking configuration
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only create templates for themselves
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID)
- **Request Body**: CreateBookingTemplateRequest
- **Response**: 201 Created with BookingTemplateResponse
- **Error Responses**: 400 Bad Request, 401 Unauthorized

**DELETE /api/v1/users/{userId}/booking-templates/{templateId}**
- **Purpose**: Delete saved booking template
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only delete their own templates
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: userId (GUID), templateId (GUID)
- **Response**: 204 No Content
- **Error Responses**: 401 Unauthorized, 404 Not Found

#### Quick Rebooking

**POST /api/v1/bookings/quick-rebook**
- **Purpose**: Create new booking from previous booking with one API call
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only rebook their own previous bookings
- **Request Headers**: Authorization: Bearer {token}
- **Request Body**: QuickRebookRequest
- **Response**: 201 Created with BookingConfirmationResponse
- **Error Responses**: 400 Bad Request (vehicle unavailable), 401 Unauthorized, 404 Not Found (previous booking)

**POST /api/v1/bookings/from-template/{templateId}**
- **Purpose**: Create new booking from saved template
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User can only use their own templates
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: templateId (GUID)
- **Request Body**: BookingFromTemplateRequest
- **Response**: 201 Created with BookingConfirmationResponse
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Split-Payment Bookings

**POST /api/v1/bookings/split-payment**
- **Purpose**: Create booking with split-payment configuration
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: Authenticated user becomes primary renter
- **Request Headers**: Authorization: Bearer {token}
- **Request Body**: SplitPaymentBookingRequest
- **Response**: 201 Created with SplitPaymentBookingResponse
- **Error Responses**: 400 Bad Request (invalid split configuration), 401 Unauthorized

**GET /api/v1/bookings/{bookingId}/split-payment-status**
- **Purpose**: Check payment status for split-payment booking
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: Primary renter or co-renter with valid payment token
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: bookingId (GUID)
- **Response**: 200 OK with SplitPaymentStatusResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found

**POST /api/v1/bookings/split-payment/co-renter-payment**
- **Purpose**: Process payment from co-renter using payment token
- **Authentication**: Required (Payment token in request body)
- **Request Body**: CoRenterPaymentRequest
- **Response**: 200 OK with payment confirmation
- **Error Responses**: 400 Bad Request (invalid token or payment failed), 404 Not Found

**POST /api/v1/bookings/{bookingId}/split-payment/send-reminders**
- **Purpose**: Send payment reminder to unpaid co-renters
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: Primary renter only
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: bookingId (GUID)
- **Response**: 200 OK with reminder status
- **Error Responses**: 401 Unauthorized, 404 Not Found

#### VIN-Specific Bookings

**GET /api/v1/vehicles/{vehicleId}/vin-details**
- **Purpose**: Retrieve VIN-specific information for luxury bookings
- **Authentication**: Required (JWT Bearer token)
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: vehicleId (GUID)
- **Response**: 200 OK with VINDetailsResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found (vehicle or VIN details)

**GET /api/v1/vehicles/by-vin/{vin}**
- **Purpose**: Search for vehicle by VIN number
- **Authentication**: Required (JWT Bearer token)
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: vin (string, 17 characters)
- **Response**: 200 OK with VehicleDetailsResponse
- **Error Responses**: 401 Unauthorized, 404 Not Found

**POST /api/v1/bookings/hard-allocation**
- **Purpose**: Create VIN-locked booking with guaranteed allocation
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: Authenticated user with verified identity
- **Request Headers**: Authorization: Bearer {token}
- **Request Body**: HardAllocationBookingRequest
- **Response**: 201 Created with HardAllocationConfirmationResponse
- **Error Responses**: 400 Bad Request (VIN unavailable), 401 Unauthorized, 403 Forbidden (identity not verified)

#### Sustainability Metrics

**GET /api/v1/vehicles/{vehicleId}/sustainability-metrics**
- **Purpose**: Retrieve environmental impact data for vehicle
- **Authentication**: Optional (public data)
- **Request Headers**: Authorization: Bearer {token} (optional)
- **Path Parameters**: vehicleId (GUID)
- **Response**: 200 OK with SustainabilityMetricsResponse
- **Error Responses**: 404 Not Found

**GET /api/v1/vehicles/sustainability/search**
- **Purpose**: Search vehicles by sustainability criteria
- **Authentication**: Optional
- **Query Parameters**: minMPG, maxCO2, vehicleType (Electric/Hybrid), minRange
- **Response**: 200 OK with array of VehicleWithSustainabilityResponse
- **Error Responses**: 400 Bad Request (invalid parameters)

**POST /api/v1/bookings/{bookingId}/carbon-offset**
- **Purpose**: Add carbon offset to booking
- **Authentication**: Required (JWT Bearer token)
- **Authorization**: User must own the booking
- **Request Headers**: Authorization: Bearer {token}
- **Path Parameters**: bookingId (GUID)
- **Request Body**: CarbonOffsetRequest
- **Response**: 200 OK with updated booking total
- **Error Responses**: 400 Bad Request, 401 Unauthorized, 404 Not Found

#### Accessible Vehicles

**GET /api/v1/vehicles/accessible**
- **Purpose**: Retrieve vehicles with verified accessibility features
- **Authentication**: Optional
- **Query Parameters**: featureCodes (array), locationId, pickupDate, returnDate
- **Response**: 200 OK with array of AccessibleVehicleResponse
- **Error Responses**: 400 Bad Request (invalid parameters)

**GET /api/v1/vehicles/{vehicleId}/accessibility-features**
- **Purpose**: Get detailed accessibility features for vehicle
- **Authentication**: Optional
- **Path Parameters**: vehicleId (GUID)
- **Response**: 200 OK with AccessibilityFeaturesResponse
- **Error Responses**: 404 Not Found

### Request Schemas

**PersonaUpdateRequest**
```json
{
  "detectedPersona": "PowerRenter | ExperienceSeeker | YoungDriver | EcoConscious | AccessibleMobility",
  "manualOverride": true,
  "personalizationSettings": {
    "oneClickRebookingEnabled": true,
    "vinSpecificBookingEnabled": false,
    "splitPaymentEnabled": false,
    "sustainabilityMetricsEnabled": false,
    "hardAllocationEnabled": false
  }
}
```

**QuickRebookRequest**
```json
{
  "previousBookingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pickupDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-18T10:00:00Z",
  "skipTheCounter": true,
  "applyPreviousPreferences": true,
  "modifyInsurance": false,
  "modifyServices": false
}
```

**SplitPaymentBookingRequest**
```json
{
  "vehicleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pickupLocationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "returnLocationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pickupDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-18T10:00:00Z",
  "primaryRenter": {
    "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "amount": 150.00
  },
  "coRenters": [
    {
      "email": "corenter1@example.com",
      "phone": "+1234567890",
      "amount": 150.00
    },
    {
      "email": "corenter2@example.com",
      "phone": "+1234567891",
      "amount": 150.00
    }
  ],
  "insuranceOptions": {
    "insuranceTier": "Full",
    "additionalDrivers": 2
  },
  "additionalServices": ["GPS", "ChildSeat"]
}
```

**HardAllocationBookingRequest**
```json
{
  "vin": "1HGBH41JXMN109186",
  "pickupLocationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "returnLocationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "pickupDate": "2026-03-15T10:00:00Z",
  "returnDate": "2026-03-18T10:00:00Z",
  "accessibilityRequirements": [
    "WHEELCHAIR_RAMP",
    "HAND_CONTROLS",
    "LOWERED_FLOOR"
  ],
  "specialNotes": "Require vehicle with automatic transmission and hand controls for paraplegic driver",
  "insuranceOptions": {
    "insuranceTier": "Full"
  }
}
```

**CarbonOffsetRequest**
```json
{
  "offsetAmount": 25.00,
  "offsetDescription": "Plant 10 trees to offset 500kg CO2",
  "paymentMethodId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

### Response Schemas

**PersonaDetectionResponse**
```json
{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "detectedPersona": "PowerRenter",
  "confidenceScore": 0.87,
  "manualOverride": false,
  "personalizationSettings": {
    "oneClickRebookingEnabled": true,
    "vinSpecificBookingEnabled": false,
    "splitPaymentEnabled": false,
    "sustainabilityMetricsEnabled": false,
    "hardAllocationEnabled": false
  },
  "bookingHistory": {
    "totalBookings": 24,
    "averageFrequencyDays": 15,
    "preferredVehicleTypes": ["Sedan", "SUV"],
    "averageBookingDuration": 3.5
  },
  "detectionFactors": {
    "bookingFrequency": 0.9,
    "vehiclePreference": 0.7,
    "ageGroup": 0.8,
    "corporateAffiliation": 1.0
  }
}
```

**SplitPaymentStatusResponse**
```json
{
  "bookingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "totalAmount": 450.00,
  "collectedAmount": 300.00,
  "remainingAmount": 150.00,
  "currency": "USD",
  "paymentStatus": [
    {
      "renterId": "primary-user-id",
      "renterType": "primary",
      "email": "primary@example.com",
      "amount": 150.00,
      "status": "paid",
      "paidAt": "2026-02-23T14:30:00Z"
    },
    {
      "renterId": "corenter1@example.com",
      "renterType": "co-renter",
      "email": "corenter1@example.com",
      "amount": 150.00,
      "status": "paid",
      "paidAt": "2026-02-23T15:45:00Z"
    },
    {
      "renterId": "corenter2@example.com",
      "renterType": "co-renter",
      "email": "corenter2@example.com",
      "amount": 150.00,
      "status": "pending",
      "paidAt": null
    }
  ],
  "bookingConfirmed": false,
  "expiresAt": "2026-02-25T14:30:00Z"
}
```

**VINDetailsResponse**
```json
{
  "vehicleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "vin": "1HGBH41JXMN109186",
  "availableForVINBooking": true,
  "serviceHistory": [
    {
      "date": "2026-01-15",
      "type": "Routine Maintenance",
      "mileage": 15000,
      "description": "Oil change, tire rotation, brake inspection"
    },
    {
      "date": "2025-10-20",
      "type": "Repair",
      "mileage": 12000,
      "description": "Replaced front brake pads"
    }
  ],
  "conditionReports": [
    {
      "date": "2026-02-20",
      "overallCondition": "Excellent",
      "exteriorCondition": "Excellent",
      "interiorCondition": "Excellent",
      "mechanicalCondition": "Excellent",
      "notes": "Vehicle in pristine condition, no visible damage"
    }
  ],
  "lastInspectionDate": "2026-02-20",
  "currentMileage": 16500,
  "vehicleAge": 1.5
}
```

**SustainabilityMetricsResponse**
```json
{
  "vehicleId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "co2EmissionsPerKm": 0.0,
  "fuelEfficiency": {
    "mpg": null,
    "mpge": 110.0
  },
  "evRange": {
    "estimatedRange": 400,
    "batteryCapacity": 75.0,
    "chargingTime": {
      "level2": "8 hours",
      "dcFastCharge": "30 minutes to 80%"
    }
  },
  "carbonOffsetOptions": [
    {
      "amount": 10.00,
      "description": "Plant 5 trees",
      "impactDescription": "Offsets 250kg CO2 over 10 years"
    },
    {
      "amount": 25.00,
      "description": "Plant 10 trees",
      "impactDescription": "Offsets 500kg CO2 over 10 years"
    },
    {
      "amount": 50.00,
      "description": "Renewable energy credits",
      "impactDescription": "Offsets 1000kg CO2 immediately"
    }
  ],
  "sustainabilityBadge": "Electric",
  "nearbyChargingStations": [
    {
      "name": "Tesla Supercharger",
      "distance": 2.5,
      "availablePlugs": 8
    }
  ]
}
```

**HardAllocationConfirmationResponse**
```json
{
  "bookingId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "bookingReference": "HA-2026-001234",
  "vin": "1HGBH41JXMN109186",
  "hardAllocationGuarantee": true,
  "noSwapCertificate": {
    "certificateId": "CERT-2026-001234",
    "issuedAt": "2026-02-23T16:00:00Z",
    "guaranteeStatement": "This booking is guaranteed for the specific vehicle with VIN 1HGBH41JXMN109186. No vehicle substitution will occur."
  },
  "accessibilityFeatures": [
    {
      "featureCode": "WHEELCHAIR_RAMP",
      "description": "Wheelchair accessible ramp",
      "verificationStatus": "verified",
      "lastVerificationDate": "2026-02-20"
    },
    {
      "featureCode": "HAND_CONTROLS",
      "description": "Hand controls for acceleration and braking",
      "verificationStatus": "verified",
      "lastVerificationDate": "2026-02-20"
    }
  ],
  "operationsAlert": {
    "alertId": "ALERT-2026-001234",
    "message": "HARD ALLOCATION - DO NOT SWAP VEHICLE",
    "priority": "HIGH"
  }
}
```

### Business Logic

#### Persona Detection Algorithm

**Input Signals**:
- Booking frequency (bookings per year)
- Average booking duration
- Vehicle type preferences
- Price sensitivity (average booking value)
- User age and demographics
- Corporate affiliation
- Accessibility feature requests
- Environmental preferences (EV/Hybrid selection rate)

**Detection Rules**:
1. **Power Renter**: bookingFrequency > 12/year AND corporateAffiliation = true AND averageDuration < 5 days
2. **Experience Seeker**: averageBookingValue > $200/day AND luxuryVehicleRate > 70% AND vinSpecificRequests > 0
3. **Young Driver**: age 18-25 AND splitPaymentRequests > 0 AND socialSharingActivity > 0
4. **Eco-Conscious**: evHybridSelectionRate > 60% AND carbonOffsetOptIn > 0 AND sustainabilityInterest = true
5. **Accessible Mobility**: accessibilityFeatureRequests > 0 AND hardAllocationRequests > 0

**Confidence Score Calculation**:
```
confidenceScore = (
  bookingFrequencyWeight * bookingFrequencyScore +
  vehiclePreferenceWeight * vehiclePreferenceScore +
  ageGroupWeight * ageGroupScore +
  behaviorWeight * behaviorScore
) / totalWeight
```

**Minimum Confidence Threshold**: 0.60 (below this, no persona assigned)

#### Quick Rebooking Logic

**Process Flow**:
1. Validate previous booking exists and belongs to user
2. Retrieve previous booking configuration (vehicle type, insurance, services)
3. Check vehicle availability for new dates
4. If exact vehicle unavailable, find similar vehicle in same category
5. Apply saved payment method
6. Calculate pricing for new dates with current rates
7. Skip customer information step (pre-filled)
8. Skip insurance/services selection if applyPreviousPreferences = true
9. Create booking and confirm in single transaction
10. Target completion time: <30 seconds

#### Split-Payment Processing Logic

**Process Flow**:
1. Validate split amounts sum to booking total
2. Create booking in "pending payment" status
3. Generate unique payment tokens for each co-renter
4. Send payment request emails/SMS with payment links
5. Process payments as they arrive
6. Update payment status per co-renter
7. When all payments received, confirm booking automatically
8. If not fully paid within 48 hours, send reminders
9. If not fully paid within 7 days, cancel booking and refund collected amounts

**Refund Distribution on Cancellation**:
- Calculate refund amount based on cancellation policy
- Distribute refund proportionally to each payer
- Process refunds to original payment methods
- Send refund confirmation to all co-renters

#### Hard Allocation Enforcement Logic

**Process Flow**:
1. Validate VIN exists and is available for booking period
2. Verify user identity (enhanced verification for accessibility bookings)
3. Lock VIN to booking (prevent other bookings)
4. Generate no-swap guarantee certificate
5. Create high-priority operations alert
6. Set booking flag: hardAllocation = true
7. Implement penalty system for unauthorized vehicle swaps
8. Monitor booking throughout lifecycle
9. Verify correct vehicle at pickup
10. Alert management if swap attempted

**Penalty for Unauthorized Swap**:
- Automatic compensation to customer (e.g., 50% refund)
- Operations team incident report
- Supplier rating impact (if applicable)

#### Sustainability Calculation Logic

**CO2 Emissions Calculation**:
```
For ICE vehicles:
co2PerKm = (fuelConsumptionPer100Km * 2.31) / 100

For EVs:
co2PerKm = 0 (direct emissions)
co2PerKm = (electricityConsumptionPer100Km * gridCarbonIntensity) / 100 (lifecycle)
```

**EV Range Estimation**:
```
estimatedRange = batteryCapacity * efficiency * temperatureFactor * drivingStyleFactor

Where:
- efficiency = typical kWh per km for vehicle model
- temperatureFactor = 0.7-1.0 (lower in cold weather)
- drivingStyleFactor = 0.8-1.0 (lower for aggressive driving)
```

**Carbon Offset Pricing**:
- Base rate: $10 per 250kg CO2
- Calculate trip emissions: distance * co2PerKm
- Offer tiered offset options (50%, 100%, 200%)

### Authentication Requirements

**JWT Token Requirements**:
- All persona management endpoints require valid JWT token
- Token must contain userId claim
- Token expiration: 24 hours
- Refresh token support for extended sessions

**Identity Verification Levels**:
- **Basic**: Email verification (standard bookings)
- **Enhanced**: Driver's license verification (VIN-specific bookings)
- **Premium**: Biometric verification (hard allocation bookings)

**Authorization Rules**:
- Users can only access their own persona data
- Users can only create bookings for themselves as primary renter
- Co-renters receive temporary payment tokens (24-hour expiration)
- Corporate users require corporate account verification
- Hard allocation bookings require enhanced identity verification

### Error Handling

**Persona Detection Errors**:
- Insufficient data: Return null persona with confidence 0.0
- Detection service unavailable: Use cached persona or default to standard experience
- Invalid user data: Log error and return standard experience

**Quick Rebooking Errors**:
- Previous booking not found: Return 404 with clear message
- Vehicle unavailable: Return 400 with alternative vehicle suggestions
- Pricing calculation failure: Return 500 and notify operations team

**Split-Payment Errors**:
- Invalid split configuration: Return 400 with validation errors
- Payment processing failure: Notify primary renter and affected co-renter
- Timeout (7 days): Cancel booking, refund all collected payments, notify all parties

**Hard Allocation Errors**:
- VIN unavailable: Return 400 with alternative accessible vehicles
- Identity verification failure: Return 403 with verification instructions
- Unauthorized swap attempt: Trigger alert, compensate customer, log incident

### Performance Considerations

**Caching Strategy**:
- Cache persona detection results for 24 hours
- Cache sustainability metrics for 1 hour
- Cache VIN details for 15 minutes
- Invalidate cache on data updates

**Database Query Optimization**:
- Use indexes on frequently queried fields (userId, VIN, bookingId)
- Implement pagination for booking history queries
- Use database views for complex persona detection queries
- Implement read replicas for reporting queries

**API Rate Limiting**:
- Persona detection: 10 requests per minute per user
- Quick rebooking: 5 requests per minute per user
- Split-payment status: 30 requests per minute per booking
- Sustainability metrics: 60 requests per minute (public endpoint)

### Integration Points

**Payment Gateway Integration**:
- Process split-payments through payment gateway
- Support multiple payment methods per booking
- Handle payment failures and retries
- Implement webhook for payment status updates

**Email/SMS Service Integration**:
- Send co-renter payment requests
- Send payment reminders
- Send booking confirmations
- Send hard allocation certificates

**Machine Learning Service Integration**:
- Send user behavior data for persona training
- Receive persona predictions with confidence scores
- Implement fallback for ML service unavailability

**Operations Management System Integration**:
- Send hard allocation alerts
- Receive vehicle swap notifications
- Update vehicle availability in real-time
- Sync VIN details and service history

## Technology Stack

- **Backend Framework**: .NET 8+ with C#, ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Authentication**: JWT tokens with .NET Identity
- **Machine Learning**: ML.NET or Azure Machine Learning for persona detection
- **Caching**: Redis for distributed caching
- **Message Queue**: RabbitMQ or Azure Service Bus for async processing
- **Payment Processing**: Stripe or similar payment gateway
- **Email/SMS**: SendGrid or Twilio

## Implementation Notes

### Phased Rollout Strategy
Implement persona features in phases to manage complexity and risk:
- **Phase 1**: Persona detection and basic personalization
- **Phase 2**: Quick rebooking for Power Renters
- **Phase 3**: Split-payment for Young Drivers
- **Phase 4**: VIN-specific and hard allocation bookings
- **Phase 5**: Sustainability metrics and carbon offset

### Machine Learning Model Training
The persona detection model should be trained on historical booking data with the following features:
- Booking frequency and recency
- Vehicle type preferences
- Booking duration patterns
- Price sensitivity
- User demographics
- Behavioral signals (clicks, searches, preferences)

Retrain the model quarterly to adapt to changing user behaviors.

### Monitoring and Alerting
Implement comprehensive monitoring for:
- Persona detection accuracy (track manual overrides)
- Quick rebooking success rate and completion time
- Split-payment completion rate and average time to full payment
- Hard allocation compliance (track unauthorized swaps)
- API performance and error rates

### Testing Requirements
- Unit tests for all business logic components
- Integration tests for API endpoints
- Load tests for high-traffic endpoints (sustainability metrics)
- End-to-end tests for complete booking flows
- A/B tests to measure conversion rate improvements per persona

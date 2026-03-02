# Feature: User Profile Management (Backend)

## Overview

The User Profile Management backend provides RESTful API endpoints and business logic for managing user profiles, preferences, verification, and data export. This backend service handles profile CRUD operations, email/phone verification workflows, profile photo processing, GDPR-compliant data export, and persona-based customization.

The backend is built on .NET 8+ with ASP.NET Core Web API, using Entity Framework Core for database access and MySQL 8.0+ for data storage. The service integrates with external services for email delivery, SMS verification, file storage (CDN), and address autocomplete.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-005: Comprehensive User Profile
- F-AM-006: Persona-Based Profile Customization (Nice-to-have component)
- REQ-UM-005: User Profile Management (Functional Requirement)

## Backend Architecture

### Service Layer Components

#### ProfileService
**Responsibilities**:
- Retrieve user profile data
- Update user profile information
- Calculate profile completeness percentage
- Validate profile data (email format, phone format, date of birth)
- Trigger email/phone verification when contact info changes
- Handle profile photo upload and processing


**Key Methods**:
- `GetUserProfileAsync(userId)`: Retrieve complete user profile
- `UpdateUserProfileAsync(userId, profileData)`: Update profile information
- `UploadProfilePhotoAsync(userId, photoFile)`: Process and store profile photo
- `CalculateProfileCompletenessAsync(userId)`: Calculate completion percentage
- `ValidateProfileDataAsync(profileData)`: Validate profile fields

#### PreferencesService
**Responsibilities**:
- Retrieve user preferences and settings
- Update user preferences
- Manage saved locations
- Handle notification preferences
- Manage privacy settings

**Key Methods**:
- `GetUserPreferencesAsync(userId)`: Retrieve all preferences
- `UpdateUserPreferencesAsync(userId, preferences)`: Update preferences
- `AddSavedLocationAsync(userId, location)`: Add saved location
- `RemoveSavedLocationAsync(userId, locationId)`: Remove saved location
- `UpdateNotificationPreferencesAsync(userId, notificationSettings)`: Update notification settings

#### VerificationService
**Responsibilities**:
- Generate email verification tokens
- Generate SMS OTP codes
- Send verification emails
- Send verification SMS
- Validate verification tokens/codes
- Update verification status


**Key Methods**:
- `SendEmailVerificationAsync(userId, newEmail)`: Generate token and send verification email
- `SendPhoneVerificationAsync(userId, newPhone)`: Generate OTP and send SMS
- `VerifyEmailTokenAsync(userId, token)`: Validate email verification token
- `VerifyPhoneOTPAsync(userId, otp)`: Validate phone OTP code
- `UpdateVerificationStatusAsync(userId, verificationType, status)`: Update verification badges

#### DataExportService
**Responsibilities**:
- Queue data export requests
- Generate GDPR-compliant data exports
- Collect all user data (profile, bookings, payments, communications)
- Generate machine-readable export files (JSON/CSV)
- Store export files securely with expiration
- Send notification when export is ready

**Key Methods**:
- `RequestDataExportAsync(userId)`: Queue export request
- `GenerateDataExportAsync(requestId)`: Generate export file (background job)
- `GetExportStatusAsync(requestId)`: Check export status
- `GetExportDownloadUrlAsync(requestId)`: Get secure download URL

#### PersonaService - Nice-to-have
**Responsibilities**:
- Analyze user behavior and attributes
- Calculate persona scores for each segment
- Assign primary persona
- Update persona dynamically
- Manage persona preferences

**Key Methods**:
- `CalculatePersonaScoresAsync(userId)`: Calculate scores for all personas
- `AssignPersonaAsync(userId)`: Assign primary persona based on scores
- `GetUserPersonaAsync(userId)`: Retrieve current persona assignment
- `UpdatePersonaPreferencesAsync(userId, preferences)`: Update persona settings
- `RecalculatePersonaAsync(userId)`: Recalculate persona based on new behavior


### API Controllers

#### ProfileController
**Route**: `/api/users/{userId}/profile`

**Endpoints**:
- `GET /api/users/{userId}/profile`: Get user profile
- `PUT /api/users/{userId}/profile`: Update user profile
- `POST /api/users/{userId}/profile/photo`: Upload profile photo

**Authorization**: JWT authentication required, user can only access own profile (or admin)

#### PreferencesController
**Route**: `/api/users/{userId}/preferences`

**Endpoints**:
- `GET /api/users/{userId}/preferences`: Get user preferences
- `PUT /api/users/{userId}/preferences`: Update user preferences
- `POST /api/users/{userId}/preferences/locations`: Add saved location
- `DELETE /api/users/{userId}/preferences/locations/{locationId}`: Remove saved location

**Authorization**: JWT authentication required, user can only access own preferences

#### DataExportController
**Route**: `/api/users/{userId}/data-export`

**Endpoints**:
- `POST /api/users/{userId}/data-export`: Request data export
- `GET /api/users/{userId}/data-export/{requestId}`: Get export status
- `GET /api/users/{userId}/data-export/{requestId}/download`: Download export file

**Authorization**: JWT authentication required, user can only request own data

#### PersonaController - Nice-to-have
**Route**: `/api/users/{userId}/persona`

**Endpoints**:
- `GET /api/users/{userId}/persona`: Get user persona
- `PUT /api/users/{userId}/persona/preferences`: Update persona preferences
- `POST /api/users/{userId}/persona/recalculate`: Trigger persona recalculation

**Authorization**: JWT authentication required, user can only access own persona


### Data Models (C# Entities)

#### User Entity (Extended)
```csharp
public class User
{
    public Guid UserId { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public bool EmailVerified { get; set; }
    public string Phone { get; set; }
    public bool PhoneVerified { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string ProfilePhotoUrl { get; set; }
    public string Bio { get; set; }
    public string LanguagePreference { get; set; } = "en";
    public string CurrencyPreference { get; set; } = "USD";
    public int ProfileCompleteness { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<UserAddress> Addresses { get; set; }
    public ICollection<EmergencyContact> EmergencyContacts { get; set; }
    public UserPreferences Preferences { get; set; }
    public ICollection<SavedLocation> SavedLocations { get; set; }
    public UserPersona Persona { get; set; }
}
```

#### UserAddress Entity
```csharp
public class UserAddress
{
    public Guid AddressId { get; set; }
    public Guid UserId { get; set; }
    public AddressType AddressType { get; set; }
    public string Street { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string PostalCode { get; set; }
    public string Country { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public User User { get; set; }
}

public enum AddressType
{
    Home,
    Work,
    Billing,
    Other
}
```


#### EmergencyContact Entity
```csharp
public class EmergencyContact
{
    public Guid ContactId { get; set; }
    public Guid UserId { get; set; }
    public string ContactName { get; set; }
    public string ContactPhone { get; set; }
    public string Relationship { get; set; }
    public bool IsPrimary { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public User User { get; set; }
}
```

#### UserPreferences Entity
```csharp
public class UserPreferences
{
    public Guid PreferenceId { get; set; }
    public Guid UserId { get; set; }
    public bool EmailNotifications { get; set; } = true;
    public bool SmsNotifications { get; set; } = false;
    public bool PushNotifications { get; set; } = true;
    public string NotificationTypes { get; set; } // JSON
    public bool QuietHoursEnabled { get; set; }
    public TimeSpan? QuietHoursStart { get; set; }
    public TimeSpan? QuietHoursEnd { get; set; }
    public string DefaultVehicleTypes { get; set; } // JSON
    public string DefaultInsuranceTier { get; set; }
    public string DefaultExtras { get; set; } // JSON
    public string AccessibilityRequirements { get; set; } // JSON
    public ProfileVisibility ProfileVisibility { get; set; } = ProfileVisibility.Public;
    public bool DataSharingEnabled { get; set; }
    public bool MarketingOptIn { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public User User { get; set; }
}

public enum ProfileVisibility
{
    Public,
    Private,
    Friends
}
```


#### SavedLocation Entity
```csharp
public class SavedLocation
{
    public Guid LocationId { get; set; }
    public Guid UserId { get; set; }
    public string Nickname { get; set; }
    public string Address { get; set; }
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public LocationType LocationType { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public User User { get; set; }
}

public enum LocationType
{
    Home,
    Work,
    Other
}
```

#### UserPersona Entity - Nice-to-have
```csharp
public class UserPersona
{
    public Guid PersonaId { get; set; }
    public Guid UserId { get; set; }
    public PersonaType AssignedPersona { get; set; }
    public int PersonaScore { get; set; }
    public string PersonaPreferences { get; set; } // JSON
    public DateTime AssignedAt { get; set; }
    public DateTime LastUpdated { get; set; }
    
    // Navigation property
    public User User { get; set; }
}

public enum PersonaType
{
    PowerRenter,
    ExperienceSeeker,
    YoungDriver,
    EcoConscious,
    AccessibleMobility
}
```


#### DataExportRequest Entity
```csharp
public class DataExportRequest
{
    public Guid RequestId { get; set; }
    public Guid UserId { get; set; }
    public ExportStatus RequestStatus { get; set; } = ExportStatus.Pending;
    public string ExportFileUrl { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    
    // Navigation property
    public User User { get; set; }
}

public enum ExportStatus
{
    Pending,
    Processing,
    Completed,
    Failed
}
```

### Business Logic Implementation

#### Profile Completeness Calculation
```csharp
public async Task<int> CalculateProfileCompletenessAsync(Guid userId)
{
    var user = await _context.Users
        .Include(u => u.Addresses)
        .Include(u => u.EmergencyContacts)
        .Include(u => u.Preferences)
        .FirstOrDefaultAsync(u => u.UserId == userId);
    
    if (user == null) return 0;
    
    int totalFields = 15;
    int completedFields = 0;
    
    // Required fields (weight: 2 points each)
    if (!string.IsNullOrEmpty(user.FirstName)) completedFields += 2;
    if (!string.IsNullOrEmpty(user.LastName)) completedFields += 2;
    if (!string.IsNullOrEmpty(user.Email) && user.EmailVerified) completedFields += 2;
    if (!string.IsNullOrEmpty(user.Phone) && user.PhoneVerified) completedFields += 2;
    if (user.DateOfBirth != default) completedFields += 2;
    
    // Address (weight: 2 points)
    if (user.Addresses?.Any(a => a.IsPrimary) == true) completedFields += 2;
    
    // Optional fields (weight: 1 point each)
    if (!string.IsNullOrEmpty(user.ProfilePhotoUrl)) completedFields += 1;
    if (!string.IsNullOrEmpty(user.Bio)) completedFields += 1;
    if (user.EmergencyContacts?.Any() == true) completedFields += 1;
    
    int percentage = (completedFields * 100) / totalFields;
    return Math.Min(percentage, 100);
}
```


#### Email Verification Workflow
```csharp
public async Task SendEmailVerificationAsync(Guid userId, string newEmail)
{
    // Generate secure token
    var token = GenerateSecureToken();
    var expiresAt = DateTime.UtcNow.AddHours(24);
    
    // Store token in cache or database
    await _cache.SetAsync($"email_verification:{userId}", new VerificationToken
    {
        Token = token,
        Email = newEmail,
        ExpiresAt = expiresAt
    }, TimeSpan.FromHours(24));
    
    // Send verification email
    var verificationUrl = $"{_config.BaseUrl}/verify-email?token={token}&userId={userId}";
    await _emailService.SendEmailAsync(newEmail, "Verify Your Email", 
        $"Click here to verify your email: {verificationUrl}");
}

public async Task<bool> VerifyEmailTokenAsync(Guid userId, string token)
{
    var cachedToken = await _cache.GetAsync<VerificationToken>($"email_verification:{userId}");
    
    if (cachedToken == null || cachedToken.Token != token || cachedToken.ExpiresAt < DateTime.UtcNow)
    {
        return false;
    }
    
    // Update user email and verification status
    var user = await _context.Users.FindAsync(userId);
    user.Email = cachedToken.Email;
    user.EmailVerified = true;
    user.UpdatedAt = DateTime.UtcNow;
    
    await _context.SaveChangesAsync();
    await _cache.RemoveAsync($"email_verification:{userId}");
    
    return true;
}
```


#### Phone Verification Workflow
```csharp
public async Task SendPhoneVerificationAsync(Guid userId, string newPhone)
{
    // Generate 6-digit OTP
    var otp = GenerateOTP();
    var expiresAt = DateTime.UtcNow.AddMinutes(10);
    
    // Store OTP in cache
    await _cache.SetAsync($"phone_verification:{userId}", new VerificationOTP
    {
        OTP = otp,
        Phone = newPhone,
        ExpiresAt = expiresAt,
        Attempts = 0
    }, TimeSpan.FromMinutes(10));
    
    // Send SMS
    await _smsService.SendSMSAsync(newPhone, $"Your verification code is: {otp}");
}

public async Task<bool> VerifyPhoneOTPAsync(Guid userId, string otp)
{
    var cachedOTP = await _cache.GetAsync<VerificationOTP>($"phone_verification:{userId}");
    
    if (cachedOTP == null || cachedOTP.ExpiresAt < DateTime.UtcNow)
    {
        return false;
    }
    
    // Check attempts (max 3)
    if (cachedOTP.Attempts >= 3)
    {
        await _cache.RemoveAsync($"phone_verification:{userId}");
        return false;
    }
    
    if (cachedOTP.OTP != otp)
    {
        cachedOTP.Attempts++;
        await _cache.SetAsync($"phone_verification:{userId}", cachedOTP, TimeSpan.FromMinutes(10));
        return false;
    }
    
    // Update user phone and verification status
    var user = await _context.Users.FindAsync(userId);
    user.Phone = cachedOTP.Phone;
    user.PhoneVerified = true;
    user.UpdatedAt = DateTime.UtcNow;
    
    await _context.SaveChangesAsync();
    await _cache.RemoveAsync($"phone_verification:{userId}");
    
    return true;
}
```


#### Profile Photo Processing
```csharp
public async Task<string> UploadProfilePhotoAsync(Guid userId, IFormFile photoFile)
{
    // Validate file type
    var allowedTypes = new[] { "image/jpeg", "image/png" };
    if (!allowedTypes.Contains(photoFile.ContentType))
    {
        throw new ValidationException("Invalid file type. Only JPEG and PNG are allowed.");
    }
    
    // Validate file size (max 5MB)
    if (photoFile.Length > 5 * 1024 * 1024)
    {
        throw new ValidationException("File size exceeds 5MB limit.");
    }
    
    // Read image
    using var stream = photoFile.OpenReadStream();
    using var image = await Image.LoadAsync(stream);
    
    // Resize to standard size (400x400)
    image.Mutate(x => x.Resize(new ResizeOptions
    {
        Size = new Size(400, 400),
        Mode = ResizeMode.Crop
    }));
    
    // Generate unique filename
    var fileName = $"{userId}_{Guid.NewGuid()}.jpg";
    
    // Upload to CDN/cloud storage
    using var outputStream = new MemoryStream();
    await image.SaveAsJpegAsync(outputStream);
    outputStream.Position = 0;
    
    var photoUrl = await _storageService.UploadFileAsync(fileName, outputStream, "image/jpeg");
    
    // Update user profile
    var user = await _context.Users.FindAsync(userId);
    
    // Delete old photo if exists
    if (!string.IsNullOrEmpty(user.ProfilePhotoUrl))
    {
        await _storageService.DeleteFileAsync(user.ProfilePhotoUrl);
    }
    
    user.ProfilePhotoUrl = photoUrl;
    user.UpdatedAt = DateTime.UtcNow;
    await _context.SaveChangesAsync();
    
    return photoUrl;
}
```


#### Data Export Generation (Background Job)
```csharp
public async Task GenerateDataExportAsync(Guid requestId)
{
    var request = await _context.DataExportRequests
        .Include(r => r.User)
        .FirstOrDefaultAsync(r => r.RequestId == requestId);
    
    if (request == null) return;
    
    try
    {
        request.RequestStatus = ExportStatus.Processing;
        await _context.SaveChangesAsync();
        
        // Collect all user data
        var exportData = new
        {
            Profile = await GetUserProfileDataAsync(request.UserId),
            Bookings = await GetUserBookingsDataAsync(request.UserId),
            Payments = await GetUserPaymentsDataAsync(request.UserId),
            Communications = await GetUserCommunicationsDataAsync(request.UserId),
            ExportMetadata = new
            {
                ExportDate = DateTime.UtcNow,
                UserId = request.UserId,
                DataCategories = new[] { "Profile", "Bookings", "Payments", "Communications" }
            }
        };
        
        // Generate JSON file
        var json = JsonSerializer.Serialize(exportData, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        
        // Upload to secure storage
        var fileName = $"data_export_{request.UserId}_{DateTime.UtcNow:yyyyMMdd}.json";
        using var stream = new MemoryStream(Encoding.UTF8.GetBytes(json));
        var fileUrl = await _storageService.UploadFileAsync(fileName, stream, "application/json");
        
        // Update request
        request.RequestStatus = ExportStatus.Completed;
        request.ExportFileUrl = fileUrl;
        request.CompletedAt = DateTime.UtcNow;
        request.ExpiresAt = DateTime.UtcNow.AddDays(30);
        await _context.SaveChangesAsync();
        
        // Send notification email
        await _emailService.SendEmailAsync(request.User.Email, "Your Data Export is Ready",
            $"Your data export is ready for download: {fileUrl}");
    }
    catch (Exception ex)
    {
        request.RequestStatus = ExportStatus.Failed;
        await _context.SaveChangesAsync();
        _logger.LogError(ex, $"Data export failed for request {requestId}");
    }
}
```


#### Persona Classification Algorithm - Nice-to-have
```csharp
public async Task<PersonaType> CalculateAndAssignPersonaAsync(Guid userId)
{
    var user = await _context.Users
        .Include(u => u.Bookings)
        .FirstOrDefaultAsync(u => u.UserId == userId);
    
    var scores = new Dictionary<PersonaType, int>();
    
    // Power Renter scoring
    var powerRenterScore = 0;
    if (user.Bookings.Count >= 10) powerRenterScore += 30;
    if (user.Bookings.Any(b => b.IsBusinessBooking)) powerRenterScore += 40;
    if (user.Bookings.Average(b => b.Duration.TotalDays) < 3) powerRenterScore += 30;
    scores[PersonaType.PowerRenter] = powerRenterScore;
    
    // Experience Seeker scoring
    var experienceSeekerScore = 0;
    if (user.Bookings.Any(b => b.VehicleCategory == "Luxury")) experienceSeekerScore += 50;
    if (user.Bookings.Average(b => b.TotalCost) > 200) experienceSeekerScore += 30;
    if (user.Bookings.Any(b => b.HasConciergeService)) experienceSeekerScore += 20;
    scores[PersonaType.ExperienceSeeker] = experienceSeekerScore;
    
    // Young Driver scoring
    var youngDriverScore = 0;
    var age = DateTime.UtcNow.Year - user.DateOfBirth.Year;
    if (age >= 18 && age <= 25) youngDriverScore += 50;
    if (user.Bookings.Any(b => b.HasSplitPayment)) youngDriverScore += 30;
    if (user.Bookings.Any(b => b.HasAdditionalDrivers)) youngDriverScore += 20;
    scores[PersonaType.YoungDriver] = youngDriverScore;
    
    // Eco-Conscious scoring
    var ecoConsciousScore = 0;
    var evBookings = user.Bookings.Count(b => b.VehicleFuelType == "Electric");
    if (evBookings > 0) ecoConsciousScore += (evBookings * 10);
    if (user.Bookings.Any(b => b.HasCarbonOffset)) ecoConsciousScore += 30;
    scores[PersonaType.EcoConscious] = ecoConsciousScore;
    
    // Accessible Mobility scoring
    var accessibleMobilityScore = 0;
    if (user.Preferences?.AccessibilityRequirements != null) accessibleMobilityScore += 50;
    if (user.Bookings.Any(b => b.HasAccessibilityFeatures)) accessibleMobilityScore += 50;
    scores[PersonaType.AccessibleMobility] = accessibleMobilityScore;
    
    // Assign persona with highest score (threshold: 70)
    var topPersona = scores.OrderByDescending(s => s.Value).First();
    
    if (topPersona.Value >= 70)
    {
        var persona = await _context.UserPersonas.FirstOrDefaultAsync(p => p.UserId == userId);
        if (persona == null)
        {
            persona = new UserPersona
            {
                PersonaId = Guid.NewGuid(),
                UserId = userId,
                AssignedPersona = topPersona.Key,
                PersonaScore = topPersona.Value,
                AssignedAt = DateTime.UtcNow
            };
            _context.UserPersonas.Add(persona);
        }
        else
        {
            persona.AssignedPersona = topPersona.Key;
            persona.PersonaScore = topPersona.Value;
            persona.LastUpdated = DateTime.UtcNow;
        }
        
        await _context.SaveChangesAsync();
        return topPersona.Key;
    }
    
    return PersonaType.PowerRenter; // Default
}
```


### External Service Integrations

#### Email Service Integration
- **Provider**: SendGrid, AWS SES, or similar
- **Purpose**: Send verification emails, data export notifications
- **Configuration**: API key, sender email, templates
- **Rate Limiting**: Respect provider limits (e.g., 100 emails/second)

#### SMS Service Integration
- **Provider**: Twilio, AWS SNS, or similar
- **Purpose**: Send phone verification OTP codes
- **Configuration**: API key, phone number, region settings
- **Rate Limiting**: Respect provider limits and implement retry logic

#### Cloud Storage Integration
- **Provider**: AWS S3, Azure Blob Storage, or similar
- **Purpose**: Store profile photos and data export files
- **Configuration**: Bucket name, access keys, CDN URL
- **Security**: Use signed URLs for secure file access, set expiration on export files

#### Address Autocomplete Integration
- **Provider**: Google Maps Places API or equivalent
- **Purpose**: Provide address suggestions and geocoding
- **Configuration**: API key, region restrictions
- **Caching**: Cache frequent address lookups to reduce API costs

### Authentication & Authorization

#### JWT Token Validation
- Validate JWT token on all profile endpoints
- Extract userId from token claims
- Verify token signature and expiration
- Implement token refresh mechanism

#### Authorization Rules
- Users can only access their own profile data
- Admin users can access any profile (role-based check)
- Corporate admins can access profiles within their organization
- Implement resource-level authorization checks


### Error Handling

#### Validation Errors (400 Bad Request)
- Invalid email format
- Invalid phone format
- Invalid date of birth (future date, under minimum age)
- Invalid file type or size for profile photo
- Missing required fields

#### Authentication Errors (401 Unauthorized)
- Missing JWT token
- Invalid JWT token
- Expired JWT token

#### Authorization Errors (403 Forbidden)
- User attempting to access another user's profile
- User attempting to update another user's data
- Insufficient permissions for admin operations

#### Not Found Errors (404 Not Found)
- User profile not found
- Saved location not found
- Data export request not found

#### Conflict Errors (409 Conflict)
- Email already in use by another account
- Phone already in use by another account

#### Rate Limiting Errors (429 Too Many Requests)
- Too many profile update requests
- Too many verification attempts
- Too many data export requests

### Performance Optimization

#### Caching Strategy
- Cache user profile data in Redis (TTL: 15 minutes)
- Cache user preferences in Redis (TTL: 30 minutes)
- Invalidate cache on profile updates
- Use cache-aside pattern for read operations

#### Database Query Optimization
- Use Entity Framework Core Include() for eager loading
- Implement pagination for saved locations if list grows large
- Use database indexes for fast lookups (userId, email, phone)
- Optimize profile completeness calculation with single query


#### Background Jobs
- Use Hangfire or similar for background job processing
- Queue data export generation as background job
- Queue persona recalculation as scheduled job (monthly)
- Queue profile photo optimization as background job
- Implement retry logic for failed jobs

### Security Considerations

#### Data Protection
- Encrypt sensitive data at rest (emergency contact info, addresses)
- Use HTTPS for all API communications
- Implement CSRF protection for state-changing operations
- Sanitize all user input to prevent injection attacks
- Hash and salt passwords using bcrypt or Argon2

#### Audit Logging
- Log all profile changes with timestamp and user ID
- Log all verification attempts (email, phone)
- Log all data export requests
- Log all admin access to user profiles
- Store audit logs for compliance requirements

#### Rate Limiting
- Implement rate limiting per user (100 requests/minute)
- Implement rate limiting for verification (3 attempts/hour)
- Implement rate limiting for data export (1 request/day)
- Use distributed rate limiting with Redis for multi-server deployments

## Technology Stack

- **Backend Framework**: .NET 8+ with ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Caching**: Redis for session and data caching
- **Background Jobs**: Hangfire for async job processing
- **Authentication**: JWT tokens with .NET Identity
- **File Storage**: AWS S3, Azure Blob Storage, or similar CDN
- **Email Service**: SendGrid, AWS SES, or similar
- **SMS Service**: Twilio, AWS SNS, or similar
- **Mapping Service**: Google Maps Places API or equivalent
- **Image Processing**: ImageSharp or similar library
- **Logging**: Serilog with structured logging
- **Monitoring**: Application Insights or similar APM tool


## Implementation Notes

### Entity Framework Core Configuration
- Configure relationships using Fluent API
- Set up cascade delete for related entities
- Configure JSON columns for flexible data storage (preferences, persona settings)
- Implement soft delete for user accounts (retain data for legal requirements)
- Use migrations for database schema changes

### API Versioning
- Implement API versioning (e.g., /api/v1/users/{userId}/profile)
- Support multiple API versions for backward compatibility
- Document breaking changes in API changelog
- Provide migration guides for API consumers

### Testing Strategy
- Unit tests for business logic (profile completeness, persona calculation)
- Integration tests for API endpoints
- Mock external services (email, SMS, storage) in tests
- Test verification workflows end-to-end
- Test error handling and edge cases
- Performance tests for profile queries under load

### Monitoring & Observability
- Log all API requests with correlation IDs
- Track API response times and error rates
- Monitor background job execution and failures
- Alert on high error rates or slow queries
- Track verification success/failure rates
- Monitor external service health (email, SMS, storage)

### Deployment Considerations
- Use environment-specific configuration (dev, staging, production)
- Store secrets in Azure Key Vault or AWS Secrets Manager
- Implement health check endpoints for load balancers
- Use connection pooling for database connections
- Configure auto-scaling based on CPU/memory usage
- Implement graceful shutdown for background jobs


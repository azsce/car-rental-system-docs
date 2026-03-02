# Feature: User Registration & Authentication

## Overview

This feature implements the backend services for user account creation and secure authentication in the car rental platform. It provides RESTful API endpoints for multiple registration methods (email, social login, phone number, SSO), authentication mechanisms (password, social, magic link, SMS OTP, biometric), and session management. The system enforces robust security measures including password hashing, JWT token generation, rate limiting, account lockout protection, and comprehensive audit logging.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-AM-001: Multi-Method User Registration
- F-AM-002: Secure Authentication System
- F-FUNC-UM-001: User Registration Functional Requirements
- F-FUNC-UM-002: User Authentication Functional Requirements

## User Stories

(Same user stories as frontend - see frontend documentation)

## Backend Specifications

### API Endpoints

#### Registration Endpoints

**POST /api/auth/register**

Purpose: Create new user account with email and password

Request Body:
```json
{
  "method": "email",
  "fullName": "John Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "dateOfBirth": "1990-05-15",
  "termsAccepted": true,
  "privacyAccepted": true
}
```

Response (201 Created):
```json
{
  "success": true,
  "userId": "user_123",
  "email": "john.doe@example.com",
  "status": "unverified",
  "message": "Account created successfully. Please check your email to verify your account."
}
```

Validation Rules:
- Email must be valid format and unique
- Password minimum 8 characters, must contain uppercase, lowercase, number
- Full name required, 2-100 characters
- Date of birth must indicate age >= 18 (or regional minimum)
- Terms and privacy acceptance required

Error Responses:
- 400 Bad Request: Invalid input data
- 409 Conflict: Email already exists
- 422 Unprocessable Entity: Age requirement not met

---

**POST /api/auth/register/phone**

Purpose: Create new user account with phone number

Request Body:
```json
{
  "method": "phone",
  "fullName": "John Doe",
  "phoneNumber": "+1234567890",
  "countryCode": "US",
  "dateOfBirth": "1990-05-15",
  "termsAccepted": true,
  "privacyAccepted": true
}
```

Response (201 Created):
```json
{
  "success": true,
  "userId": "user_123",
  "phoneNumber": "+1234567890",
  "status": "pending_verification",
  "message": "SMS verification code sent to your phone."
}
```

Business Logic:
1. Validate phone number format using libphonenumber
2. Check for duplicate phone number
3. Create user account with status "pending_verification"
4. Generate 6-digit OTP code
5. Send SMS via Twilio or similar service
6. Store OTP with 10-minute expiration
7. Return success response

---

**POST /api/auth/register/verify-phone**

Purpose: Verify phone number with OTP code

Request Body:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

Response (200 OK):
```json
{
  "success": true,
  "userId": "user_123",
  "status": "verified",
  "sessionToken": "encrypted_jwt_token",
  "message": "Phone number verified successfully."
}
```

Business Logic:
1. Validate OTP code against stored value
2. Check OTP expiration (10 minutes)
3. Update user status to "verified"
4. Generate session token
5. Invalidate used OTP
6. Return session token for immediate login

---

**POST /api/auth/register/social**

Purpose: Create account or link social login provider

Request Body:
```json
{
  "provider": "google",
  "accessToken": "oauth_access_token",
  "idToken": "oauth_id_token"
}
```

Response (201 Created or 200 OK):
```json
{
  "success": true,
  "userId": "user_123",
  "email": "john.doe@example.com",
  "status": "verified",
  "sessionToken": "encrypted_jwt_token",
  "isNewUser": true,
  "message": "Account created successfully."
}
```

Business Logic:
1. Validate OAuth token with provider API
2. Extract user data (email, name, profile photo)
3. Check if email already exists in database
4. If new: Create account with status "verified"
5. If existing: Link social provider to existing account
6. Generate session token
7. Return session token and user data

Supported Providers:
- Google (OAuth 2.0)
- Facebook (OAuth 2.0)
- Apple (Sign in with Apple)
- WeChat (OAuth 2.0 for Chinese market)

---

**POST /api/auth/register/verify-email**

Purpose: Verify email address with token from verification email

Request Body:
```json
{
  "token": "email_verification_token"
}
```

Response (200 OK):
```json
{
  "success": true,
  "userId": "user_123",
  "email": "john.doe@example.com",
  "status": "verified",
  "message": "Email verified successfully."
}
```

Business Logic:
1. Validate token format and signature
2. Check token expiration (24 hours)
3. Retrieve user ID from token
4. Update user email verification status
5. Mark token as used
6. Return success response

---

**POST /api/auth/register/resend-verification**

Purpose: Resend email verification link

Request Body:
```json
{
  "email": "john.doe@example.com"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Verification email sent successfully."
}
```

Business Logic:
1. Validate email exists and is unverified
2. Generate new verification token
3. Send verification email
4. Implement rate limiting (max 3 per hour)
5. Return success response

#### Authentication Endpoints

**POST /api/auth/login**

Purpose: Authenticate user with email and password

Request Body:
```json
{
  "method": "password",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}
```

Response (200 OK):
```json
{
  "success": true,
  "sessionToken": "encrypted_jwt_token",
  "refreshToken": "encrypted_refresh_token",
  "user": {
    "id": "user_123",
    "fullName": "John Doe",
    "email": "john.doe@example.com",
    "role": "customer",
    "verificationStatus": "verified",
    "profileCompleteness": 75
  },
  "expiresAt": "2026-02-23T11:30:00Z"
}
```

Business Logic:
1. Validate email format
2. Retrieve user by email
3. Verify password using bcrypt.compare()
4. Check account status (not locked, not suspended)
5. Check failed login attempts
6. If > 5 attempts in 15 minutes: Lock account for 30 minutes
7. Generate JWT session token (1 hour expiration)
8. If rememberMe: Generate refresh token (30 days expiration)
9. Record login activity (device, IP, location)
10. Check if new device/location
11. If new: Send security notification email
12. Reset failed login counter
13. Return session token and user data

Error Responses:
- 401 Unauthorized: Invalid credentials
- 403 Forbidden: Account locked or suspended
- 429 Too Many Requests: Rate limit exceeded

---

**POST /api/auth/login/magic-link**

Purpose: Send magic link for passwordless login

Request Body:
```json
{
  "email": "john.doe@example.com"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Magic link sent to your email. Please check your inbox."
}
```

Business Logic:
1. Validate email exists in database
2. Generate one-time login token (UUID)
3. Store token with 15-minute expiration
4. Send email with magic link: `/auth/verify-magic-link?token=xxx`
5. Implement rate limiting (max 3 per hour)
6. Return success response

---

**GET /api/auth/verify-magic-link**

Purpose: Verify magic link token and create session

Query Parameters:
- `token`: Magic link token

Response (302 Redirect):
- Redirects to dashboard with session cookie set

Business Logic:
1. Validate token format
2. Check token expiration (15 minutes)
3. Retrieve user ID from token
4. Generate session token
5. Set session cookie
6. Mark token as used
7. Record login activity
8. Redirect to dashboard

---

**POST /api/auth/login/sms-otp**

Purpose: Send SMS OTP for authentication

Request Body:
```json
{
  "phoneNumber": "+1234567890"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "OTP sent to your phone number."
}
```

Business Logic:
1. Validate phone number exists in database
2. Generate 6-digit OTP code
3. Send SMS via Twilio
4. Store OTP with 10-minute expiration
5. Implement rate limiting (max 3 per hour)
6. Return success response

---

**POST /api/auth/login/verify-sms-otp**

Purpose: Verify SMS OTP and create session

Request Body:
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

Response (200 OK):
```json
{
  "success": true,
  "sessionToken": "encrypted_jwt_token",
  "user": { /* user data */ },
  "expiresAt": "2026-02-23T11:30:00Z"
}
```

Business Logic:
1. Validate OTP code
2. Check OTP expiration
3. Retrieve user by phone number
4. Generate session token
5. Invalidate used OTP
6. Record login activity
7. Return session token and user data

---

**POST /api/auth/login/biometric**

Purpose: Authenticate using biometric token

Request Body:
```json
{
  "userId": "user_123",
  "biometricToken": "encrypted_biometric_token",
  "deviceId": "device_abc"
}
```

Response (200 OK):
```json
{
  "success": true,
  "sessionToken": "encrypted_jwt_token",
  "user": { /* user data */ },
  "expiresAt": "2026-02-23T11:30:00Z"
}
```

Business Logic:
1. Validate biometric token signature
2. Verify device ID is registered for user
3. Check token expiration
4. Generate new session token
5. Record login activity
6. Return session token

Note: Biometric data never leaves the device. The biometric token is a device-generated proof of successful biometric authentication.

---

**POST /api/auth/refresh**

Purpose: Refresh expired session token using refresh token

Request Body:
```json
{
  "refreshToken": "encrypted_refresh_token"
}
```

Response (200 OK):
```json
{
  "success": true,
  "sessionToken": "new_encrypted_jwt_token",
  "expiresAt": "2026-02-23T12:30:00Z"
}
```

Business Logic:
1. Validate refresh token signature
2. Check refresh token expiration (30 days)
3. Retrieve user ID from token
4. Generate new session token (1 hour expiration)
5. Return new session token

---

**POST /api/auth/logout**

Purpose: Terminate current session

Request Headers:
- `Authorization: Bearer <session_token>`

Response (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

Business Logic:
1. Validate session token
2. Add token to blacklist (Redis cache)
3. Remove session from database
4. Return success response

---

**POST /api/auth/logout-all**

Purpose: Terminate all sessions except current

Request Headers:
- `Authorization: Bearer <session_token>`

Response (200 OK):
```json
{
  "success": true,
  "message": "All sessions terminated except current session.",
  "terminatedCount": 3
}
```

Business Logic:
1. Validate current session token
2. Retrieve all sessions for user
3. Delete all sessions except current
4. Add terminated tokens to blacklist
5. Return success response with count

#### Session Management Endpoints

**GET /api/auth/sessions**

Purpose: Retrieve all active sessions for current user

Request Headers:
- `Authorization: Bearer <session_token>`

Response (200 OK):
```json
{
  "sessions": [
    {
      "sessionId": "session_abc",
      "deviceType": "Desktop",
      "browser": "Chrome 120",
      "os": "Windows 11",
      "ipAddress": "192.168.1.1",
      "location": "New York, US",
      "lastActivity": "2026-02-23T10:15:00Z",
      "isCurrent": true
    }
  ]
}
```

Business Logic:
1. Validate session token
2. Retrieve user ID from token
3. Query all active sessions for user
4. Enrich with device and location data
5. Mark current session
6. Return sessions list

---

**DELETE /api/auth/sessions/:sessionId**

Purpose: Terminate specific session

Request Headers:
- `Authorization: Bearer <session_token>`

Response (200 OK):
```json
{
  "success": true,
  "message": "Session terminated successfully."
}
```

Business Logic:
1. Validate current session token
2. Verify session belongs to current user
3. Delete specified session
4. Add session token to blacklist
5. Return success response

#### Password Management Endpoints

**POST /api/auth/password/reset-request**

Purpose: Request password reset link

Request Body:
```json
{
  "email": "john.doe@example.com"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password reset link sent to your email."
}
```

Business Logic:
1. Validate email exists
2. Generate password reset token
3. Store token with 1-hour expiration
4. Send password reset email
5. Implement rate limiting (max 3 per hour)
6. Return success response (even if email doesn't exist, for security)

---

**POST /api/auth/password/reset**

Purpose: Reset password using reset token

Request Body:
```json
{
  "token": "password_reset_token",
  "newPassword": "NewSecurePass123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully."
}
```

Business Logic:
1. Validate token format and signature
2. Check token expiration (1 hour)
3. Validate new password strength
4. Hash new password using bcrypt
5. Update user password
6. Invalidate all existing sessions
7. Mark token as used
8. Send password change confirmation email
9. Return success response

---

**POST /api/auth/password/change**

Purpose: Change password for authenticated user

Request Headers:
- `Authorization: Bearer <session_token>`

Request Body:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewSecurePass123!"
}
```

Response (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully."
}
```

Business Logic:
1. Validate session token
2. Verify current password
3. Validate new password strength
4. Hash new password using bcrypt
5. Update user password
6. Invalidate all sessions except current
7. Send password change confirmation email
8. Return success response

### Request Schemas

#### RegisterEmailRequest
```csharp
public class RegisterEmailRequest
{
    [Required]
    [StringLength(100, MinimumLength = 2)]
    public string FullName { get; set; }

    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    [StringLength(100, MinimumLength = 8)]
    [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$")]
    public string Password { get; set; }

    [Required]
    [DataType(DataType.Date)]
    public DateTime DateOfBirth { get; set; }

    [Required]
    [Range(typeof(bool), "true", "true")]
    public bool TermsAccepted { get; set; }

    [Required]
    [Range(typeof(bool), "true", "true")]
    public bool PrivacyAccepted { get; set; }
}
```

#### LoginRequest
```csharp
public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; }

    [Required]
    public string Password { get; set; }

    public bool RememberMe { get; set; } = false;
}
```

#### SocialLoginRequest
```csharp
public class SocialLoginRequest
{
    [Required]
    public string Provider { get; set; } // "google", "facebook", "apple", "wechat"

    [Required]
    public string AccessToken { get; set; }

    public string IdToken { get; set; } // Required for Google and Apple
}
```

### Response Schemas

#### AuthResponse
```csharp
public class AuthResponse
{
    public bool Success { get; set; }
    public string SessionToken { get; set; }
    public string RefreshToken { get; set; }
    public UserDto User { get; set; }
    public DateTime ExpiresAt { get; set; }
}
```

#### UserDto
```csharp
public class UserDto
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PhoneNumber { get; set; }
    public string Role { get; set; }
    public string VerificationStatus { get; set; }
    public int ProfileCompleteness { get; set; }
    public string ProfilePhotoUrl { get; set; }
}
```

### Business Logic

#### Password Hashing

Use bcrypt with work factor 12 for password hashing:

```csharp
public class PasswordHasher
{
    private const int WorkFactor = 12;

    public string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);
    }

    public bool VerifyPassword(string password, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
    }
}
```

#### JWT Token Generation

Generate JWT tokens with appropriate claims and expiration:

```csharp
public class JwtTokenGenerator
{
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;

    public string GenerateSessionToken(User user, bool rememberMe = false)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role),
            new Claim("verification_status", user.VerificationStatus),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        
        var expiration = rememberMe 
            ? DateTime.UtcNow.AddDays(30) 
            : DateTime.UtcNow.AddHours(1);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expiration,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }
}
```

#### Account Lockout Logic

Implement account lockout after failed login attempts:

```csharp
public class AccountLockoutService
{
    private readonly IDistributedCache _cache;
    private const int MaxAttempts = 5;
    private const int LockoutMinutes = 30;
    private const int AttemptWindowMinutes = 15;

    public async Task<bool> IsAccountLocked(string email)
    {
        var lockoutKey = $"lockout:{email}";
        var lockoutUntil = await _cache.GetStringAsync(lockoutKey);
        
        if (lockoutUntil != null)
        {
            var unlockTime = DateTime.Parse(lockoutUntil);
            return DateTime.UtcNow < unlockTime;
        }
        
        return false;
    }

    public async Task RecordFailedAttempt(string email)
    {
        var attemptKey = $"attempts:{email}";
        var attempts = await GetFailedAttempts(email);
        attempts++;

        await _cache.SetStringAsync(
            attemptKey, 
            attempts.ToString(), 
            new DistributedCacheEntryOptions 
            { 
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(AttemptWindowMinutes) 
            }
        );

        if (attempts >= MaxAttempts)
        {
            await LockAccount(email);
        }
    }

    public async Task ResetFailedAttempts(string email)
    {
        var attemptKey = $"attempts:{email}";
        await _cache.RemoveAsync(attemptKey);
    }

    private async Task LockAccount(string email)
    {
        var lockoutKey = $"lockout:{email}";
        var unlockTime = DateTime.UtcNow.AddMinutes(LockoutMinutes);
        
        await _cache.SetStringAsync(
            lockoutKey, 
            unlockTime.ToString("O"), 
            new DistributedCacheEntryOptions 
            { 
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(LockoutMinutes) 
            }
        );
    }

    private async Task<int> GetFailedAttempts(string email)
    {
        var attemptKey = $"attempts:{email}";
        var attemptsStr = await _cache.GetStringAsync(attemptKey);
        return int.TryParse(attemptsStr, out var attempts) ? attempts : 0;
    }
}
```

#### Device Recognition

Track and recognize user devices:

```csharp
public class DeviceRecognitionService
{
    public async Task<bool> IsNewDevice(string userId, string deviceFingerprint)
    {
        // Check if device fingerprint exists for user
        var existingDevice = await _context.UserDevices
            .FirstOrDefaultAsync(d => 
                d.UserId == userId && 
                d.DeviceFingerprint == deviceFingerprint);
        
        return existingDevice == null;
    }

    public async Task RegisterDevice(string userId, DeviceInfo deviceInfo)
    {
        var device = new UserDevice
        {
            UserId = userId,
            DeviceFingerprint = deviceInfo.Fingerprint,
            DeviceType = deviceInfo.Type,
            Browser = deviceInfo.Browser,
            OperatingSystem = deviceInfo.OS,
            IpAddress = deviceInfo.IpAddress,
            Location = deviceInfo.Location,
            FirstSeen = DateTime.UtcNow,
            LastSeen = DateTime.UtcNow,
            IsTrusted = false
        };

        _context.UserDevices.Add(device);
        await _context.SaveChangesAsync();
    }

    public string GenerateDeviceFingerprint(HttpRequest request)
    {
        var userAgent = request.Headers["User-Agent"].ToString();
        var acceptLanguage = request.Headers["Accept-Language"].ToString();
        var acceptEncoding = request.Headers["Accept-Encoding"].ToString();
        
        var fingerprintData = $"{userAgent}|{acceptLanguage}|{acceptEncoding}";
        
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(fingerprintData));
        return Convert.ToBase64String(hashBytes);
    }
}
```

#### Email Verification

Send verification emails:

```csharp
public class EmailVerificationService
{
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public async Task SendVerificationEmail(User user)
    {
        var token = GenerateVerificationToken(user.Id);
        var verificationUrl = $"{_configuration["AppUrl"]}/auth/verify-email?token={token}";

        var emailBody = $@"
            <h2>Welcome to Car Rental Platform!</h2>
            <p>Hi {user.FullName},</p>
            <p>Please verify your email address by clicking the link below:</p>
            <p><a href='{verificationUrl}'>Verify Email Address</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, please ignore this email.</p>
        ";

        await _emailService.SendEmailAsync(
            to: user.Email,
            subject: "Verify Your Email Address",
            body: emailBody
        );
    }

    private string GenerateVerificationToken(string userId)
    {
        var claims = new[]
        {
            new Claim("user_id", userId),
            new Claim("purpose", "email_verification"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSecret"]));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["JwtIssuer"],
            audience: _configuration["JwtAudience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(24),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
```

### Authentication Requirements

All authenticated endpoints require valid JWT token in Authorization header:

```
Authorization: Bearer <session_token>
```

Token validation:
1. Verify token signature
2. Check token expiration
3. Verify issuer and audience
4. Check if token is blacklisted (for logout)
5. Extract user ID and role from claims

### Rate Limiting

Implement rate limiting for authentication endpoints:

- Registration: 5 requests per hour per IP
- Login: 10 requests per 15 minutes per IP
- Password reset: 3 requests per hour per email
- Email verification resend: 3 requests per hour per email
- Magic link: 3 requests per hour per email
- SMS OTP: 3 requests per hour per phone number

Use Redis for distributed rate limiting across multiple server instances.

### Audit Logging

Log all authentication events for security monitoring:

```csharp
public class AuthAuditLog
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string EventType { get; set; } // "registration", "login", "logout", "password_change"
    public string Method { get; set; } // "email", "social", "phone", "magic_link"
    public string IpAddress { get; set; }
    public string DeviceType { get; set; }
    public string Browser { get; set; }
    public string OperatingSystem { get; set; }
    public string Location { get; set; }
    public bool Success { get; set; }
    public string FailureReason { get; set; }
    public DateTime Timestamp { get; set; }
}
```

## Technology Stack

- **Backend Framework**: .NET 8+ with C#
- **Web API**: ASP.NET Core Web API
- **Authentication**: ASP.NET Core Identity, JWT Bearer Authentication
- **Password Hashing**: BCrypt.Net-Next
- **OAuth Libraries**: 
  - Google.Apis.Auth for Google Sign-In
  - Microsoft.AspNetCore.Authentication.Facebook
  - AspNet.Security.OAuth.Apple
- **SMS Service**: Twilio SDK
- **Email Service**: SendGrid or AWS SES
- **Caching**: Redis (StackExchange.Redis) for rate limiting and session management
- **Database**: Entity Framework Core with MySQL

## Implementation Notes

### Security Best Practices

1. **Never log sensitive data**: Passwords, tokens, OTPs should never appear in logs
2. **Use HTTPS only**: All authentication endpoints must use HTTPS in production
3. **Implement CORS properly**: Restrict origins to trusted domains
4. **Validate all inputs**: Use data annotations and custom validators
5. **Use parameterized queries**: Prevent SQL injection attacks
6. **Implement CSP headers**: Content Security Policy to prevent XSS
7. **Use secure cookies**: HTTP-only, Secure, SameSite=Strict for session cookies

### Performance Optimization

1. **Cache user data**: Cache frequently accessed user data in Redis
2. **Use connection pooling**: Configure database connection pooling
3. **Async/await**: Use async operations for all I/O operations
4. **Batch operations**: Batch database operations where possible
5. **Index optimization**: Ensure proper indexes on email, phone number, user ID

### Error Handling

1. **Generic error messages**: Don't reveal whether email exists in error messages
2. **Log detailed errors**: Log full error details for debugging
3. **Return user-friendly messages**: Return generic messages to clients
4. **Handle exceptions globally**: Use global exception handler middleware
5. **Validate early**: Validate inputs before expensive operations

### Testing Requirements

1. **Unit tests**: Test all business logic methods
2. **Integration tests**: Test API endpoints with test database
3. **Security tests**: Test for common vulnerabilities (SQL injection, XSS, CSRF)
4. **Load tests**: Test authentication endpoints under load
5. **OAuth mocking**: Mock OAuth providers for testing

### Monitoring and Alerting

1. **Failed login monitoring**: Alert on unusual failed login patterns
2. **Account lockout monitoring**: Track account lockout frequency
3. **Registration monitoring**: Track registration success/failure rates
4. **Performance monitoring**: Monitor API response times
5. **Error rate monitoring**: Alert on elevated error rates

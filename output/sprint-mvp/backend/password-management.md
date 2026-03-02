# Feature: Password Management (Backend)

## Overview

The Password Management backend provides secure API endpoints and business logic for users to change their passwords, validate password strength, and manage session security. This implementation ensures that password changes are properly authenticated, validated against security requirements, and audited for compliance and security monitoring.

## Sprint Category

sprint-mvp

## Feature ID

F-FUNC-UM-004

## Backend Architecture

### API Endpoints

**POST /api/users/me/password**
- **Purpose**: Change authenticated user's password
- **Authentication**: Required (JWT Bearer token)
- **Rate Limiting**: 3 requests per hour per user
- **Request Timeout**: 30 seconds
- **Content-Type**: application/json

**Request Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Password changed successfully",
  "sessionsInvalidated": 3,
  "newToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

400 Bad Request - Validation Error:
```json
{
  "success": false,
  "error": "Password validation failed",
  "code": "WEAK_PASSWORD",
  "validationErrors": [
    {
      "field": "newPassword",
      "message": "Password must contain at least one uppercase letter"
    }
  ]
}
```

401 Unauthorized - Invalid Token:
```json
{
  "success": false,
  "error": "Authentication required",
  "code": "UNAUTHORIZED"
}
```

403 Forbidden - Incorrect Current Password:
```json
{
  "success": false,
  "error": "Current password is incorrect",
  "code": "INVALID_CURRENT_PASSWORD"
}
```

429 Too Many Requests - Rate Limit Exceeded:
```json
{
  "success": false,
  "error": "Too many password change attempts",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 3600
}
```

500 Internal Server Error:
```json
{
  "success": false,
  "error": "An error occurred while changing password",
  "code": "INTERNAL_ERROR"
}
```

### Business Logic Implementation

**Password Change Service** (`PasswordService.cs`):

```csharp
public class PasswordService : IPasswordService
{
    private readonly IUserRepository _userRepository;
    private readonly ISessionRepository _sessionRepository;
    private readonly IPasswordHistoryRepository _passwordHistoryRepository;
    private readonly IEmailService _emailService;
    private readonly IAuditLogger _auditLogger;
    private readonly IPasswordValidator _passwordValidator;
    
    public async Task<PasswordChangeResult> ChangePasswordAsync(
        int userId, 
        string currentPassword, 
        string newPassword,
        string sessionToken,
        string ipAddress)
    {
        // 1. Retrieve user from database
        var user = await _userRepository.GetByIdAsync(userId);
        if (user == null)
            throw new UserNotFoundException();
        
        // 2. Verify current password
        if (!VerifyPassword(currentPassword, user.PasswordHash))
        {
            await _auditLogger.LogPasswordChangeFailureAsync(
                userId, ipAddress, "Invalid current password");
            throw new InvalidPasswordException("Current password is incorrect");
        }
        
        // 3. Validate new password strength
        var validationResult = await _passwordValidator.ValidateAsync(
            newPassword, user);
        if (!validationResult.IsValid)
        {
            throw new WeakPasswordException(validationResult.Errors);
        }
        
        // 4. Check password history (prevent reuse)
        var passwordHistory = await _passwordHistoryRepository
            .GetRecentPasswordsAsync(userId, 5);
        foreach (var historicalHash in passwordHistory)
        {
            if (VerifyPassword(newPassword, historicalHash))
            {
                throw new PasswordReusedException(
                    "Cannot reuse one of your last 5 passwords");
            }
        }
        
        // 5. Hash new password
        var newPasswordHash = HashPassword(newPassword);
        
        // 6. Update user password in database
        user.PasswordHash = newPasswordHash;
        user.PasswordChangedAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);
        
        // 7. Save to password history
        await _passwordHistoryRepository.AddAsync(new PasswordHistory
        {
            UserId = userId,
            PasswordHash = newPasswordHash,
            ChangedAt = DateTime.UtcNow,
            ChangedFromIp = ipAddress
        });
        
        // 8. Invalidate all other sessions
        var invalidatedCount = await _sessionRepository
            .InvalidateAllExceptAsync(userId, sessionToken);
        
        // 9. Generate new token for current session
        var newToken = GenerateNewSessionToken(user, sessionToken);
        
        // 10. Send confirmation email
        await _emailService.SendPasswordChangeConfirmationAsync(
            user.Email, DateTime.UtcNow, ipAddress);
        
        // 11. Log successful password change
        await _auditLogger.LogPasswordChangeSuccessAsync(
            userId, ipAddress);
        
        return new PasswordChangeResult
        {
            Success = true,
            SessionsInvalidated = invalidatedCount,
            NewToken = newToken
        };
    }
    
    private bool VerifyPassword(string password, string hash)
    {
        return BCrypt.Net.BCrypt.Verify(password, hash);
    }
    
    private string HashPassword(string password)
    {
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }
}
```

**Password Validator** (`PasswordValidator.cs`):

```csharp
public class PasswordValidator : IPasswordValidator
{
    private readonly ICommonPasswordChecker _commonPasswordChecker;
    
    public async Task<ValidationResult> ValidateAsync(
        string password, User user)
    {
        var errors = new List<ValidationError>();
        
        // Length check
        if (password.Length < 8)
            errors.Add(new ValidationError(
                "newPassword", 
                "Password must be at least 8 characters long"));
        
        // Uppercase check
        if (!password.Any(char.IsUpper))
            errors.Add(new ValidationError(
                "newPassword",
                "Password must contain at least one uppercase letter"));
        
        // Lowercase check
        if (!password.Any(char.IsLower))
            errors.Add(new ValidationError(
                "newPassword",
                "Password must contain at least one lowercase letter"));
        
        // Number check
        if (!password.Any(char.IsDigit))
            errors.Add(new ValidationError(
                "newPassword",
                "Password must contain at least one number"));
        
        // Special character check
        var specialChars = "!@#$%^&*()_+-=[]{}|;:,.<>?";
        if (!password.Any(c => specialChars.Contains(c)))
            errors.Add(new ValidationError(
                "newPassword",
                "Password must contain at least one special character"));
        
        // Check against common passwords
        if (await _commonPasswordChecker.IsCommonPasswordAsync(password))
            errors.Add(new ValidationError(
                "newPassword",
                "This password is too common. Please choose a stronger password"));
        
        // Check if password contains user's email or name
        if (password.ToLower().Contains(user.Email.Split('@')[0].ToLower()))
            errors.Add(new ValidationError(
                "newPassword",
                "Password cannot contain your email address"));
        
        if (!string.IsNullOrEmpty(user.FirstName) && 
            password.ToLower().Contains(user.FirstName.ToLower()))
            errors.Add(new ValidationError(
                "newPassword",
                "Password cannot contain your name"));
        
        return new ValidationResult
        {
            IsValid = errors.Count == 0,
            Errors = errors
        };
    }
}
```

### Session Management

**Session Invalidation Logic**:

```csharp
public class SessionRepository : ISessionRepository
{
    private readonly DbContext _context;
    
    public async Task<int> InvalidateAllExceptAsync(
        int userId, string currentSessionToken)
    {
        var sessionsToInvalidate = await _context.Sessions
            .Where(s => s.UserId == userId && s.Id != currentSessionToken)
            .ToListAsync();
        
        _context.Sessions.RemoveRange(sessionsToInvalidate);
        await _context.SaveChangesAsync();
        
        return sessionsToInvalidate.Count;
    }
    
    public async Task<List<SessionDto>> GetActiveSessionsAsync(int userId)
    {
        return await _context.Sessions
            .Where(s => s.UserId == userId && s.ExpiresAt > DateTime.UtcNow)
            .OrderByDescending(s => s.LastActivity)
            .Select(s => new SessionDto
            {
                SessionId = s.Id,
                DeviceType = s.DeviceType,
                Browser = s.Browser,
                OperatingSystem = s.OperatingSystem,
                IpAddress = s.IpAddress,
                Location = s.Location,
                LastActivity = s.LastActivity
            })
            .ToListAsync();
    }
}
```

### Authentication & Authorization

**JWT Token Validation**:
- Validate token signature using secret key
- Check token expiration timestamp
- Verify user ID exists in database
- Ensure user account is active (not locked/suspended)
- Extract user ID and role from token claims

**Authorization Rules**:
- Users can only change their own password
- Admin users cannot change other users' passwords through this endpoint
- Password change requires current password verification (no bypass)

### Rate Limiting

**Implementation**:
- Use distributed cache (Redis) to track password change attempts
- Key format: `password_change:{userId}`
- Sliding window: 1 hour
- Maximum attempts: 3 per hour
- Return 429 status code when limit exceeded
- Include `Retry-After` header with seconds until reset

### Audit Logging

**Password Change Events**:

```csharp
public class AuditLogger : IAuditLogger
{
    private readonly DbContext _context;
    
    public async Task LogPasswordChangeSuccessAsync(
        int userId, string ipAddress)
    {
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            EventType = "PASSWORD_CHANGE_SUCCESS",
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow,
            Details = JsonSerializer.Serialize(new
            {
                Action = "Password changed successfully",
                SessionsInvalidated = true
            })
        });
        
        await _context.SaveChangesAsync();
    }
    
    public async Task LogPasswordChangeFailureAsync(
        int userId, string ipAddress, string reason)
    {
        await _context.AuditLogs.AddAsync(new AuditLog
        {
            UserId = userId,
            EventType = "PASSWORD_CHANGE_FAILURE",
            IpAddress = ipAddress,
            Timestamp = DateTime.UtcNow,
            Details = JsonSerializer.Serialize(new
            {
                Action = "Password change failed",
                Reason = reason
            })
        });
        
        await _context.SaveChangesAsync();
    }
}
```

### Email Notifications

**Password Change Confirmation Email**:

```csharp
public class EmailService : IEmailService
{
    public async Task SendPasswordChangeConfirmationAsync(
        string email, DateTime timestamp, string ipAddress)
    {
        var emailTemplate = new EmailTemplate
        {
            To = email,
            Subject = "Your password has been changed",
            Body = $@"
                <h2>Password Changed</h2>
                <p>Your password was successfully changed.</p>
                <p><strong>Time:</strong> {timestamp:yyyy-MM-dd HH:mm:ss} UTC</p>
                <p><strong>IP Address:</strong> {ipAddress}</p>
                <p>If you did not make this change, please secure your account immediately:</p>
                <a href='https://app.example.com/account/security'>Secure My Account</a>
                <p>For assistance, contact support@example.com</p>
            "
        };
        
        await SendEmailAsync(emailTemplate);
    }
}
```

### Error Handling

**Exception Handling Strategy**:

```csharp
[ApiController]
[Route("api/users/me")]
public class UserPasswordController : ControllerBase
{
    [HttpPost("password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest request)
    {
        try
        {
            var userId = GetUserIdFromToken();
            var ipAddress = GetClientIpAddress();
            var sessionToken = GetSessionToken();
            
            var result = await _passwordService.ChangePasswordAsync(
                userId, 
                request.CurrentPassword,
                request.NewPassword,
                sessionToken,
                ipAddress);
            
            return Ok(result);
        }
        catch (InvalidPasswordException ex)
        {
            return StatusCode(403, new
            {
                success = false,
                error = ex.Message,
                code = "INVALID_CURRENT_PASSWORD"
            });
        }
        catch (WeakPasswordException ex)
        {
            return BadRequest(new
            {
                success = false,
                error = "Password validation failed",
                code = "WEAK_PASSWORD",
                validationErrors = ex.ValidationErrors
            });
        }
        catch (PasswordReusedException ex)
        {
            return BadRequest(new
            {
                success = false,
                error = ex.Message,
                code = "PASSWORD_REUSED"
            });
        }
        catch (RateLimitExceededException ex)
        {
            Response.Headers.Add("Retry-After", "3600");
            return StatusCode(429, new
            {
                success = false,
                error = "Too many password change attempts",
                code = "RATE_LIMIT_EXCEEDED",
                retryAfter = 3600
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error changing password for user {UserId}", 
                GetUserIdFromToken());
            return StatusCode(500, new
            {
                success = false,
                error = "An error occurred while changing password",
                code = "INTERNAL_ERROR"
            });
        }
    }
}
```

## Technology Stack

- **Framework**: .NET 8+ with C#
- **Web API**: ASP.NET Core Web API
- **ORM**: Entity Framework Core 8+
- **Database**: MySQL 8.0+ with InnoDB
- **Password Hashing**: BCrypt.Net-Next (bcrypt implementation)
- **JWT**: System.IdentityModel.Tokens.Jwt
- **Caching**: StackExchange.Redis (for rate limiting)
- **Email**: SendGrid or SMTP

## Security Considerations

### Password Hashing
- Use BCrypt with work factor 12 (2^12 = 4096 iterations)
- Salt is automatically generated and stored with hash
- Never store passwords in plain text
- Clear password from memory after hashing

### Secure Transmission
- Enforce HTTPS/TLS 1.2+ for all API requests
- Use secure HTTP headers (HSTS, CSP, X-Frame-Options)
- Never log passwords in application logs
- Sanitize error messages to prevent information disclosure

### Session Security
- Invalidate all other sessions on password change
- Generate new session token for current session
- Use secure, HTTP-only cookies for web sessions
- Implement session timeout for inactive sessions

## Performance Optimization

### Database Optimization
- Index user_id in password_history table
- Index user_id and expires_at in sessions table
- Use connection pooling for database connections
- Implement query result caching where appropriate

### Caching Strategy
- Cache password validation rules
- Cache common password dictionary in memory
- Use Redis for distributed rate limiting
- Cache user session data for quick lookups

### Async Operations
- Use async/await for all I/O operations
- Implement background jobs for email sending
- Use task parallelization where appropriate
- Avoid blocking calls in request pipeline

## Monitoring & Logging

### Metrics to Track
- Password change success rate
- Password change failure rate by reason
- Average password strength score
- Rate limit violations per hour
- API response times (p50, p95, p99)

### Logging Requirements
- Log all password change attempts (success and failure)
- Log rate limit violations
- Log authentication failures
- Log session invalidations
- Include user ID, IP address, and timestamp in all logs

## Testing Requirements

### Unit Tests
- Password validation logic
- Password hashing and verification
- Session invalidation logic
- Rate limiting logic
- Email notification formatting

### Integration Tests
- End-to-end password change flow
- Session management across multiple devices
- Rate limiting enforcement
- Email delivery confirmation
- Database transaction rollback on errors

### Security Tests
- Brute force attack prevention
- SQL injection prevention
- XSS prevention in error messages
- CSRF protection
- Password strength enforcement

## Related Requirements

- REQ-UM-010: Account Security Management
- REQ-UM-002: User Authentication
- REQ-UM-009: Two-Factor Authentication

## Success Metrics

- API response time < 500ms (p95)
- Password change success rate > 95%
- Zero security vulnerabilities
- Rate limiting effectiveness > 99%
- Email delivery rate > 98%

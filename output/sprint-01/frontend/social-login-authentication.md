# Feature: Social Login Authentication

## Overview

OAuth-based authentication system that enables users to sign in using trusted third-party identity providers including Facebook, Google, and Apple. This feature provides one-click registration and login without password management, automatic account creation with verified email addresses, profile data import, and account linking capabilities for users who want to connect multiple authentication methods.

## Sprint Category

sprint-01 (Project - Important but can wait until after MVP)

## Feature IDs

- F-SEC-AUTH-002: Social Login Authentication

## User Stories

### Quick Registration with Social Login

**As a new user**, I want to register using my Google/Facebook/Apple account, so that I can quickly create an account without setting up a new password.

**Acceptance Criteria**:
- User can click "Continue with Google/Facebook/Apple" button
- OAuth flow opens in secure popup or redirect
- User authenticates with chosen provider
- System automatically creates account with verified email from provider
- User profile is populated with name and avatar from provider
- User is immediately logged in after successful OAuth flow
- No password is required or stored for social-only accounts

### Seamless Login with Social Accounts

**As a returning user with social login**, I want to log in with one click using my social account, so that I can quickly access the platform without remembering a password.

**Acceptance Criteria**:
- User can click social login button on login page
- System recognizes existing account by email from OAuth provider
- User is logged in immediately after OAuth authorization
- Session is created with same security as email/password login
- User can choose "stay connected" for extended sessions

### Account Linking

**As a user with an email/password account**, I want to link my social accounts, so that I have multiple login options for convenience.

**Acceptance Criteria**:
- User can link Google/Facebook/Apple accounts from account settings
- System validates that social account email matches primary account email
- Multiple social accounts can be linked to one platform account
- User can unlink social accounts while maintaining email/password access
- User receives confirmation when accounts are linked or unlinked

### Profile Data Synchronization

**As a user logging in with social accounts**, I want my profile information to be automatically updated, so that my platform profile stays current with my social accounts.

**Acceptance Criteria**:
- Name and avatar are imported from social provider on first login
- User can choose to sync profile data on subsequent logins
- User can override imported data with custom values
- Profile photo from social account is displayed as avatar
- User can disconnect profile sync while keeping social login active

## Frontend Specifications

### Pages and Routes

**Login Page** (`/login`):
- Social login buttons for Google, Facebook, Apple
- Visual separation between social and email/password login
- "Or continue with email" divider
- Terms of service notice for social login

**Registration Page** (`/register`):
- Social registration buttons prominently displayed
- Same OAuth providers as login page
- Terms acceptance implicit in social registration
- Link to email/password registration option

**Account Settings - Connected Accounts** (`/settings/connected-accounts`):
- List of linked social accounts with provider logos
- "Connect" buttons for unlinked providers
- "Disconnect" buttons for linked providers
- Primary authentication method indicator
- Warning when attempting to disconnect last authentication method

**OAuth Callback Page** (`/auth/callback/:provider`):
- Loading indicator during OAuth token exchange
- Error handling for failed OAuth flows
- Redirect to intended destination after successful authentication
- Account linking confirmation for existing users

### UI Components

**SocialLoginButtons Component**:
- Branded buttons for each provider (Google, Facebook, Apple)
- Provider logos and consistent styling
- Loading states during OAuth flow
- Error message display
- Responsive layout (stacked on mobile, side-by-side on desktop)

**GoogleLoginButton Component**:
- Google branding guidelines compliance
- "Continue with Google" text
- Google logo icon
- Click handler to initiate OAuth flow
- Popup or redirect mode configuration

**FacebookLoginButton Component**:
- Facebook branding guidelines compliance
- "Continue with Facebook" text
- Facebook logo icon
- Click handler to initiate OAuth flow
- Popup or redirect mode configuration

**AppleLoginButton Component**:
- Apple branding guidelines compliance
- "Continue with Apple" text
- Apple logo icon
- Click handler to initiate OAuth flow
- Popup or redirect mode configuration
- Dark mode support

**ConnectedAccountCard Component**:
- Provider logo and name
- Connection status (connected/not connected)
- Connection date for linked accounts
- "Connect" or "Disconnect" button
- Confirmation modal for disconnection
- Primary authentication method badge

**OAuthLoadingModal Component**:
- Centered modal during OAuth flow
- Provider logo
- "Connecting to [Provider]..." message
- Spinner animation
- Cancel button (closes popup)

### User Flows

**Social Registration Flow**:
1. User navigates to registration page
2. User clicks "Continue with [Provider]" button
3. OAuth popup/redirect opens to provider's login page
4. User authenticates with provider (if not already logged in)
5. User authorizes platform to access profile data
6. Provider redirects back to platform with authorization code
7. Platform exchanges code for access token
8. Platform retrieves user profile from provider API
9. Platform creates new account with verified email
10. Platform imports name and avatar from provider
11. Platform creates session token
12. User redirected to dashboard with welcome message

**Social Login Flow (Existing Account)**:
1. User navigates to login page
2. User clicks "Continue with [Provider]" button
3. OAuth popup/redirect opens to provider's login page
4. User authenticates with provider
5. Provider redirects back with authorization code
6. Platform exchanges code for access token
7. Platform retrieves email from provider
8. Platform finds existing account by email
9. Platform creates session token
10. User redirected to dashboard

**Account Linking Flow**:
1. User navigates to connected accounts settings
2. User clicks "Connect [Provider]" button
3. OAuth flow initiates (same as login)
4. Platform validates provider email matches account email
5. Platform creates social account link record
6. Platform displays success message
7. Provider appears as connected in settings

**Account Unlinking Flow**:
1. User clicks "Disconnect" button on connected account
2. System checks if other authentication methods exist
3. Confirmation modal appears with warning
4. User confirms disconnection
5. Platform removes social account link
6. Platform displays success message
7. Provider appears as disconnected in settings

### Data Requirements

**From Backend APIs**:
- OAuth authorization URL for each provider
- OAuth callback handling and token exchange
- User profile data from social providers
- List of connected social accounts
- Account linking/unlinking endpoints
- Session token after successful OAuth

**State Management**:
- OAuth flow state (in progress, success, error)
- Current provider being authenticated
- Connected accounts list
- User profile data from providers
- Error messages from OAuth failures

**OAuth Provider Configuration**:
- Client IDs for each provider
- Redirect URIs for OAuth callbacks
- Requested scopes (email, profile, public_profile)
- OAuth flow mode (popup vs redirect)

## Backend Specifications

### API Endpoints

**GET /api/auth/oauth/:provider/authorize**
- **Purpose**: Generate OAuth authorization URL for provider
- **Authentication**: None (public endpoint)
- **Supported Providers**: google, facebook, apple

**Path Parameters**:
- `provider`: OAuth provider name (google, facebook, apple)

**Query Parameters**:
- `redirect_uri`: Optional custom redirect after authentication
- `link_account`: Boolean flag for account linking flow

**Response (200 OK)**:
```json
{
  "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&scope=email%20profile",
  "state": "random-state-token-for-csrf-protection"
}
```

---

**GET /api/auth/oauth/:provider/callback**
- **Purpose**: Handle OAuth callback and exchange authorization code for tokens
- **Authentication**: None (public endpoint)

**Query Parameters**:
- `code`: Authorization code from OAuth provider
- `state`: State token for CSRF protection

**Response (302 Redirect)**:
- Redirects to frontend with session token in URL or cookie
- Success: `/auth/success?token=...`
- Error: `/auth/error?message=...`

---

**POST /api/auth/oauth/:provider/token**
- **Purpose**: Exchange OAuth authorization code for platform session token
- **Authentication**: None (public endpoint)

**Request Body**:
```json
{
  "code": "authorization-code-from-provider",
  "state": "state-token-for-verification",
  "redirectUri": "https://platform.com/auth/callback/google"
}
```

**Response (200 OK)** - New User:
```json
{
  "token": "platform-session-token",
  "expiresAt": "2026-02-24T12:00:00Z",
  "isNewUser": true,
  "user": {
    "id": "uuid-string",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "emailVerified": true,
    "provider": "google"
  }
}
```

**Response (200 OK)** - Existing User:
```json
{
  "token": "platform-session-token",
  "expiresAt": "2026-02-24T12:00:00Z",
  "isNewUser": false,
  "user": {
    "id": "uuid-string",
    "email": "user@gmail.com",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://lh3.googleusercontent.com/...",
    "emailVerified": true,
    "connectedProviders": ["google", "facebook"]
  }
}
```

**Error Responses**:
- 400: Invalid authorization code, state mismatch
- 401: OAuth provider rejected authorization
- 409: Email already registered with different provider (account linking required)

---

**POST /api/auth/oauth/link**
- **Purpose**: Link social account to existing authenticated user
- **Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "provider": "google",
  "code": "authorization-code-from-provider",
  "state": "state-token-for-verification"
}
```

**Response (200 OK)**:
```json
{
  "message": "Account linked successfully",
  "provider": "google",
  "providerEmail": "user@gmail.com",
  "linkedAt": "2026-02-23T10:30:00Z"
}
```

**Error Responses**:
- 400: Invalid code or state
- 409: Provider email doesn't match account email
- 409: Provider already linked to another account

---

**DELETE /api/auth/oauth/unlink/:provider**
- **Purpose**: Unlink social account from user
- **Authentication**: Required (Bearer token)

**Path Parameters**:
- `provider`: Provider to unlink (google, facebook, apple)

**Response (200 OK)**:
```json
{
  "message": "Account unlinked successfully",
  "provider": "google"
}
```

**Error Responses**:
- 400: Cannot unlink last authentication method
- 404: Provider not linked to account

---

**GET /api/auth/oauth/connected**
- **Purpose**: Get list of connected social accounts
- **Authentication**: Required (Bearer token)

**Response (200 OK)**:
```json
{
  "connectedAccounts": [
    {
      "provider": "google",
      "providerEmail": "user@gmail.com",
      "linkedAt": "2026-01-15T08:00:00Z",
      "isPrimary": true
    },
    {
      "provider": "facebook",
      "providerEmail": "user@facebook.com",
      "linkedAt": "2026-02-01T14:30:00Z",
      "isPrimary": false
    }
  ],
  "availableProviders": ["apple"]
}
```

### Business Logic

**OAuth Authorization Flow**:
1. Generate random state token for CSRF protection
2. Store state token in session or database with expiration (10 minutes)
3. Construct authorization URL with client ID, redirect URI, scopes, and state
4. Return authorization URL to frontend
5. User redirected to provider's authorization page

**OAuth Token Exchange**:
1. Validate state token matches stored value
2. Exchange authorization code for access token via provider API
3. Retrieve user profile from provider API using access token
4. Extract email, name, and avatar from profile
5. Check if user exists by email
6. If new user: Create account with verified email
7. If existing user: Update last login timestamp
8. Generate platform session token
9. Return session token and user profile

**Account Linking Logic**:
1. Validate user is authenticated
2. Exchange OAuth code for provider access token
3. Retrieve provider email from profile
4. Validate provider email matches user's primary email
5. Check provider is not already linked to another account
6. Create social account link record
7. Return success confirmation

**Account Unlinking Logic**:
1. Validate user is authenticated
2. Check user has other authentication methods (password or other social accounts)
3. If last authentication method: Return error
4. Delete social account link record
5. Return success confirmation

**Profile Data Import**:
- Extract first name and last name from provider profile
- Download avatar image from provider URL
- Store avatar in platform storage (S3, Azure Blob)
- Update user profile with imported data
- Mark email as verified (provider has verified it)

**Provider-Specific Handling**:

**Google OAuth**:
- Scopes: `email`, `profile`
- Profile endpoint: `https://www.googleapis.com/oauth2/v2/userinfo`
- Token endpoint: `https://oauth2.googleapis.com/token`

**Facebook OAuth**:
- Scopes: `email`, `public_profile`
- Profile endpoint: `https://graph.facebook.com/me?fields=id,name,email,picture`
- Token endpoint: `https://graph.facebook.com/v18.0/oauth/access_token`

**Apple OAuth**:
- Scopes: `email`, `name`
- Token endpoint: `https://appleid.apple.com/auth/token`
- Special handling: Name only provided on first authorization

### Authentication Requirements

**Public Endpoints**:
- GET /api/auth/oauth/:provider/authorize
- GET /api/auth/oauth/:provider/callback
- POST /api/auth/oauth/:provider/token

**Protected Endpoints** (require authentication):
- POST /api/auth/oauth/link
- DELETE /api/auth/oauth/unlink/:provider
- GET /api/auth/oauth/connected

**OAuth Security**:
- State parameter for CSRF protection
- Validate redirect URI matches registered URI
- Verify authorization code is single-use
- Validate access token with provider API
- Store provider tokens securely (encrypted)

## Database Specifications

### Schema Changes

**Users Table** (modifications):
```sql
ALTER TABLE Users ADD COLUMN avatar_url VARCHAR(500) NULL;
ALTER TABLE Users ADD COLUMN profile_imported_from ENUM('google', 'facebook', 'apple', 'manual') NULL;
ALTER TABLE Users ADD COLUMN last_profile_sync_at DATETIME NULL;
```

**SocialAccounts Table** (new table):
```sql
CREATE TABLE SocialAccounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  provider ENUM('google', 'facebook', 'apple') NOT NULL,
  provider_user_id VARCHAR(255) NOT NULL,
  provider_email VARCHAR(255) NOT NULL,
  access_token TEXT NULL,
  refresh_token TEXT NULL,
  token_expires_at DATETIME NULL,
  profile_data JSON NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  linked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_used_at DATETIME NULL,
  FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_provider_user (provider, provider_user_id),
  INDEX idx_user_provider (user_id, provider),
  INDEX idx_provider_email (provider, provider_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**OAuthStates Table** (new table):
```sql
CREATE TABLE OAuthStates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  state_token VARCHAR(255) NOT NULL UNIQUE,
  provider ENUM('google', 'facebook', 'apple') NOT NULL,
  redirect_uri VARCHAR(500) NULL,
  link_account BOOLEAN DEFAULT FALSE,
  user_id VARCHAR(36) NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_state_token (state_token),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

### Relationships

**Users ↔ SocialAccounts**: One-to-Many
- One user can have multiple social accounts (one per provider)
- Foreign key: SocialAccounts.user_id → Users.id
- Cascade delete: When user is deleted, all social accounts are deleted

**Users ↔ OAuthStates**: One-to-Many (for account linking)
- OAuth states can be associated with user for linking flow
- Foreign key: OAuthStates.user_id → Users.id (nullable)
- No cascade: States expire and are cleaned up automatically

### Indexes

**Performance Optimization**:
- `unique_provider_user`: Ensures one provider account links to only one platform account
- `idx_user_provider`: Fast lookup of user's connected providers
- `idx_provider_email`: Fast lookup when matching provider email to existing users
- `idx_state_token`: Fast validation of OAuth state tokens
- `idx_expires_at`: Efficient cleanup of expired OAuth states

**Cleanup Jobs**:
- Hourly job to delete expired OAuth states (expires_at < NOW())
- Monthly job to refresh expired provider tokens
- Quarterly job to remove unused social accounts (last_used_at < NOW() - INTERVAL 6 MONTH)

## Technology Stack

- **Backend**: .NET 8+ with ASP.NET Core, OAuth client libraries
- **Database**: MySQL 8.0+ with InnoDB storage engine
- **Frontend**: Next.js 14+ with TypeScript, NextAuth.js or custom OAuth implementation
- **OAuth Libraries**: 
  - Google: Google.Apis.Auth
  - Facebook: Facebook SDK for .NET
  - Apple: Apple Sign In REST API
- **Image Storage**: AWS S3 or Azure Blob Storage for avatars
- **Session Management**: JWT tokens (same as email/password auth)

## Implementation Notes

### OAuth Provider Configuration

**Google OAuth Setup**:
1. Create project in Google Cloud Console
2. Enable Google+ API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs
6. Store client ID and client secret in environment variables

**Facebook OAuth Setup**:
1. Create app in Facebook Developers portal
2. Add Facebook Login product
3. Configure OAuth redirect URIs
4. Set up app review for email permission
5. Store app ID and app secret in environment variables

**Apple OAuth Setup**:
1. Create app ID in Apple Developer portal
2. Enable Sign in with Apple capability
3. Create service ID for web authentication
4. Configure return URLs
5. Generate private key for token validation
6. Store team ID, client ID, and key ID in environment variables

### Security Considerations

1. **State Token**: Always use state parameter to prevent CSRF attacks
2. **Redirect URI Validation**: Strictly validate redirect URIs match registered URIs
3. **Token Storage**: Encrypt provider access tokens and refresh tokens in database
4. **Scope Minimization**: Only request necessary scopes (email, profile)
5. **Token Expiration**: Respect provider token expiration and refresh when needed
6. **Email Verification**: Trust provider email verification, mark as verified
7. **Account Takeover Prevention**: Validate provider email matches account email for linking

### Error Handling

**OAuth Flow Errors**:
- User denies authorization: Redirect to login with message
- Invalid authorization code: Log error, show generic error message
- Provider API errors: Retry with exponential backoff, fallback to error page
- State mismatch: Reject request, log potential CSRF attempt
- Email mismatch on linking: Show clear error message with instructions

**Provider-Specific Errors**:
- Google: Handle "access_denied" error code
- Facebook: Handle "access_denied" and "server_error" codes
- Apple: Handle "user_cancelled_authorize" error

### Testing Requirements

**Unit Tests**:
- OAuth URL generation with correct parameters
- State token generation and validation
- Token exchange logic
- Profile data extraction from provider responses
- Account linking validation logic
- Account unlinking validation logic

**Integration Tests**:
- Complete OAuth flow with test accounts
- Account creation from social login
- Account linking to existing user
- Account unlinking
- Error handling for invalid codes
- CSRF protection with state validation

**Manual Testing**:
- Test with real Google, Facebook, Apple accounts
- Verify profile data import (name, email, avatar)
- Test account linking and unlinking flows
- Verify session creation and expiration
- Test error scenarios (denied authorization, network errors)

### User Experience Considerations

- Display provider logos consistently across all social login buttons
- Show loading state during OAuth flow (popup or redirect)
- Provide clear error messages for OAuth failures
- Allow users to easily switch between social and email/password login
- Display connected accounts clearly in settings
- Warn users before disconnecting last authentication method
- Sync profile data automatically but allow manual override

### Compliance Requirements

**GDPR**:
- User consent for data import from social providers
- Right to disconnect social accounts
- Data portability includes social account links
- Privacy policy explains social login data usage

**Provider Terms of Service**:
- Comply with Google, Facebook, Apple branding guidelines
- Display provider terms and privacy policies during OAuth flow
- Respect provider rate limits and API usage policies
- Handle provider account deletion webhooks

## Dependencies

- F-SEC-AUTH-001: Email/Password Authentication (alternative authentication method)
- OAuth provider accounts and API credentials
- Image storage service for avatars
- Email service for account notifications

## Related Features

- F-AM-001: User Registration (social registration is alternative flow)
- F-AM-002: User Authentication (social login is alternative method)
- F-AM-005: User Profile Management (profile data import)
- F-AM-012: Account Security Settings (connected accounts management)

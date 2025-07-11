# QuickFund Authentication Flow Diagram

## Complete Authentication Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend (Next.js)
    participant B as Backend (NestJS)
    participant DB as PostgreSQL
    participant JWT as JWT Service

    Note over U,DB: User Registration Flow
    U->>F: Register with email/password
    F->>B: POST /auth/register
    B->>DB: Check if user exists
    alt User doesn't exist
        B->>DB: Create new user (hashed password)
        B->>JWT: Generate JWT token
        JWT-->>B: Return token
        B-->>F: Return success + token
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    else User exists
        B-->>F: Return error (user exists)
        F-->>U: Show error message
    end

    Note over U,DB: User Login Flow
    U->>F: Login with credentials
    F->>B: POST /auth/login
    B->>DB: Find user by email
    alt User found & password valid
        B->>JWT: Generate JWT token
        JWT-->>B: Return token
        B-->>F: Return success + token
        F->>F: Store token in localStorage
        F-->>U: Redirect to dashboard
    else Invalid credentials
        B-->>F: Return error (invalid credentials)
        F-->>U: Show error message
    end

    Note over U,DB: Protected Route Access
    U->>F: Access protected route
    F->>F: Check localStorage for token
    alt Token exists
        F->>B: GET /api/protected-route (with Authorization header)
        B->>JWT: Verify token
        JWT-->>B: Token valid + user data
        B->>DB: Fetch user data
        DB-->>B: Return user data
        B-->>F: Return protected data
        F-->>U: Show protected content
    else No token
        F-->>U: Redirect to login
    end

    Note over U,DB: Token Refresh Flow
    U->>F: Continue using app
    F->>F: Check token expiration
    alt Token expired
        F->>B: POST /auth/refresh (with refresh token)
        B->>JWT: Verify refresh token
        JWT-->>B: Valid refresh token
        B->>JWT: Generate new access token
        JWT-->>B: Return new token
        B-->>F: Return new access token
        F->>F: Update localStorage
        F-->>U: Continue session
    else Token valid
        F-->>U: Continue normally
    end

    Note over U,DB: Logout Flow
    U->>F: Click logout
    F->>F: Clear localStorage
    F->>B: POST /auth/logout (optional - blacklist token)
    B->>B: Add token to blacklist
    F-->>U: Redirect to login page
```

## System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[User Interface<br/>Next.js + React]
        AuthC[Auth Context<br/>Token Management]
        Router[Protected Routes<br/>Route Guards]
    end

    subgraph "Backend Layer"
        AuthM[Auth Module<br/>NestJS Guards]
        JWTService[JWT Service<br/>Token Generation/Validation]
        UserService[User Service<br/>CRUD Operations]
        HashService[Password Hashing<br/>bcrypt]
    end

    subgraph "Database Layer"
        Users[(Users Table<br/>id, email, password_hash)]
        Sessions[(Sessions Table<br/>user_id, token, expires)]
    end

    subgraph "Security Layer"
        RateLimit[Rate Limiting<br/>Request Throttling]
        CORS[CORS Configuration<br/>Cross-Origin Security]
        Validation[Input Validation<br/>DTO Validation]
    end

    UI --> AuthC
    AuthC --> Router
    Router --> AuthM
    AuthM --> JWTService
    AuthM --> UserService
    UserService --> HashService
    UserService --> Users
    JWTService --> Sessions
    AuthM --> RateLimit
    AuthM --> CORS
    AuthM --> Validation
```

## JWT Token Structure

```mermaid
graph LR
    subgraph "JWT Token Components"
        Header[Header<br/>Algorithm: HS256<br/>Type: JWT]
        Payload[Payload<br/>User ID<br/>Email<br/>Role<br/>Expiration]
        Signature[Signature<br/>HMAC SHA256<br/>Secret Key]
    end

    Header --> Payload
    Payload --> Signature
```

## Security Features Implementation

```mermaid
graph TD
    subgraph "Password Security"
        Salt[Bcrypt Salt<br/>Random salt per user]
        Rounds[Bcrypt Rounds<br/>12 rounds for hashing]
        Hash[Password Hash<br/>Stored in database]
    end

    subgraph "Token Security"
        Expiry[Token Expiration<br/>15 minutes access<br/>7 days refresh]
        Refresh[Refresh Tokens<br/>Secure HTTP-only cookies]
        Blacklist[Token Blacklist<br/>Logout invalidation]
    end

    subgraph "Request Security"
        RateLimit[Rate Limiting<br/>100 requests/minute]
        Validation[Input Validation<br/>DTO schemas]
        Sanitization[Data Sanitization<br/>XSS Prevention]
    end

    Salt --> Rounds
    Rounds --> Hash
    Expiry --> Refresh
    Refresh --> Blacklist
    RateLimit --> Validation
    Validation --> Sanitization
```

## Error Handling Flow

```mermaid
flowchart TD
    Start([User Action]) --> Check{Valid Request?}
    Check -->|No| ValidationError[Return 400<br/>Validation Error]
    Check -->|Yes| Auth{Authenticated?}
    Auth -->|No| Unauthorized[Return 401<br/>Unauthorized]
    Auth -->|Yes| TokenValid{Token Valid?}
    TokenValid -->|No| TokenExpired[Return 401<br/>Token Expired]
    TokenValid -->|Yes| Authorized{Authorized?}
    Authorized -->|No| Forbidden[Return 403<br/>Forbidden]
    Authorized -->|Yes| Success[Return 200<br/>Success Response]
    
    ValidationError --> End([End])
    Unauthorized --> End
    TokenExpired --> End
    Forbidden --> End
    Success --> End
```

## Database Schema for Authentication

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string password_hash
        string first_name
        string last_name
        enum role
        timestamp created_at
        timestamp updated_at
    }
    
    SESSIONS {
        uuid id PK
        uuid user_id FK
        string refresh_token
        timestamp expires_at
        boolean is_revoked
        timestamp created_at
    }
    
    USERS ||--o{ SESSIONS : "has"
```

## Key Security Features Explained

### 1. **Password Hashing**
- Uses bcrypt with 12 rounds
- Each user gets unique salt
- Prevents rainbow table attacks

### 2. **JWT Token Management**
- Access tokens expire in 15 minutes
- Refresh tokens last 7 days
- Tokens stored in HTTP-only cookies
- Blacklist for logout invalidation

### 3. **Rate Limiting**
- 100 requests per minute per IP
- Prevents brute force attacks
- Configurable per endpoint

### 4. **Input Validation**
- DTO validation on all endpoints
- Sanitizes user input
- Prevents injection attacks

### 5. **CORS Configuration**
- Restricts cross-origin requests
- Whitelist approach for security
- Prevents unauthorized access

This diagram shows the complete authentication workflow that demonstrates:
- Secure user registration and login
- JWT token-based authentication
- Protected route access
- Token refresh mechanism
- Proper logout handling
- Comprehensive error handling
- Security best practices implementation 
# QuickFund Authentication Flow - Actual Implementation

## 1. User Registration Flow

```mermaid
flowchart TD
    A[User fills signup form] --> B[Frontend validation]
    B --> C{Validation passed?}
    C -->|No| D[Show error message]
    C -->|Yes| E[Call authApi.register]
    E --> F[POST /auth/register]
    F --> G[Backend validation]
    G --> H{User exists?}
    H -->|Yes| I[Return 409 Conflict]
    H -->|No| J[Hash password with bcrypt]
    J --> K[Create user in database]
    K --> L[Create virtual account]
    L --> M[Generate temp JWT token]
    M --> N[Create session with SessionService]
    N --> O[Generate final JWT with sessionId]
    O --> P[Send welcome notification]
    P --> Q[Return user data only]
    Q --> R[Show success modal]
    R --> S[Redirect to login]
    
    I --> T[Show error in frontend]
    D --> U[User corrects form]
    U --> B
    T --> U
```

## 2. User Login Flow

```mermaid
flowchart TD
    A[User enters credentials] --> B[Call authApi.login]
    B --> C[POST /auth/login]
    C --> D[Find user by email]
    D --> E{User found?}
    E -->|No| F[Check admin table]
    F --> G{Admin found?}
    G -->|No| H[Return 401 Unauthorized]
    G -->|Yes| I[Verify admin password]
    I --> J{Password valid?}
    J -->|No| H
    J -->|Yes| K[Check if admin active]
    K --> L{Admin active?}
    L -->|No| M[Return 401 - Account deactivated]
    L -->|Yes| N[Generate temp JWT]
    
    E -->|Yes| O[Verify user password]
    O --> P{Password valid?}
    P -->|No| H
    P -->|Yes| Q[Check if user active]
    Q --> R{User active?}
    R -->|No| M
    R -->|Yes| N
    
    N --> S[Create session with SessionService]
    S --> T[Generate final JWT with sessionId]
    T --> U[Return accessToken + refreshToken]
    U --> V[Store tokens securely]
    V --> W[Update auth store]
    W --> X[Redirect to dashboard]
    
    H --> Y[Show error in frontend]
    M --> Y
    Y --> Z[User retries]
    Z --> A
```

## 3. Token Management & Security

```mermaid
graph TB
    subgraph "Frontend Token Storage"
        A[Access Token<br/>Memory only<br/>SecureTokenManager]
        B[Refresh Token<br/>sessionStorage<br/>quickfund-refresh-token]
    end
    
    subgraph "Backend Session Management"
        C[SessionService<br/>In-memory sessions<br/>Map<string, Session>]
        D[Session Validation<br/>Token rotation limits<br/>Activity tracking]
    end
    
    subgraph "Security Features"
        E[bcrypt password hashing<br/>12 rounds + salt]
        F[JWT with sessionId<br/>15min expiry]
        G[Refresh token rotation<br/>10 rotations max]
        H[Session limits<br/>3 sessions per user]
    end
    
    A --> C
    B --> C
    C --> D
    D --> E
    D --> F
    D --> G
    D --> H
```

## 4. Protected Route Access Flow

```mermaid
flowchart TD
    A[User accesses protected route] --> B[Check auth store]
    B --> C{User authenticated?}
    C -->|No| D[Redirect to login]
    C -->|Yes| E[Add Authorization header]
    E --> F[API request with Bearer token]
    F --> G[JwtAuthGuard intercepts]
    G --> H[Extract token from header]
    H --> I[Verify JWT signature]
    I --> J{Token valid?}
    J -->|No| K[Return 401 Unauthorized]
    J -->|Yes| L[Decode token payload]
    L --> M[Extract sessionId & userId]
    M --> N[SessionService.validateSession]
    N --> O{Session valid?}
    O -->|No| P[Return 401 - Session invalid]
    O -->|Yes| Q[Update session activity]
    Q --> R[Attach user to request]
    R --> S[Execute protected endpoint]
    S --> T[Return protected data]
    
    K --> U[Clear tokens]
    P --> U
    U --> V[Redirect to login]
```

## 5. Token Refresh Flow

```mermaid
flowchart TD
    A[API request fails with 401] --> B[Response interceptor catches]
    B --> C{Is 401 error?}
    C -->|No| D[Return original error]
    C -->|Yes| E{Already retried?}
    E -->|Yes| F[Clear tokens & reject]
    E -->|No| G[Mark as retried]
    G --> H[Get refresh token from sessionStorage]
    H --> I{Refresh token exists?}
    I -->|No| F
    I -->|Yes| J[Call authApi.refreshToken]
    J --> K[POST /auth/refresh]
    K --> L[Backend validates refresh token]
    L --> M{Token valid?}
    M -->|No| F
    M -->|Yes| N[SessionService.refreshSession]
    N --> O[Generate new access token]
    O --> P[Update session tokens]
    P --> Q[Return new tokens]
    Q --> R[Update frontend tokens]
    R --> S[Retry original request]
    S --> T[Return successful response]
    
    F --> U[Redirect to login]
```

## 6. Logout Flow

```mermaid
flowchart TD
    A[User clicks logout] --> B[Call authApi.logout]
    B --> C[Extract sessionId from token]
    C --> D[POST /auth/logout]
    D --> E[JwtAuthGuard validates]
    E --> F[SessionService.invalidateSession]
    F --> G[Remove session from memory]
    G --> H[Emit session.invalidated event]
    H --> I[Return success]
    I --> J[Clear frontend tokens]
    J --> K[Clear sessionStorage]
    K --> L[Update auth store]
    L --> M[Redirect to login]
    
    subgraph "Error Handling"
        N[Logout request fails]
        O[Still clear local tokens]
        P[Show success message]
    end
    
    N --> O
    O --> P
    P --> M
```

## 7. System Architecture Overview

```mermaid
graph TB
    subgraph "Frontend Layer (Next.js)"
        A[Signup/Login Pages<br/>React Components]
        B[Auth Store<br/>Zustand + Persist]
        C[API Client<br/>Axios with interceptors]
        D[Protected Routes<br/>Route guards]
    end
    
    subgraph "Backend Layer (NestJS)"
        E[Auth Controller<br/>REST endpoints]
        F[Auth Service<br/>Business logic]
        G[Session Service<br/>Session management]
        H[JWT Strategy<br/>Token validation]
        I[Password Service<br/>bcrypt hashing]
    end
    
    subgraph "Database Layer (PostgreSQL)"
        J[Users Table<br/>User profiles]
        K[Admins Table<br/>Admin accounts]
        L[Virtual Accounts<br/>User wallets]
    end
    
    subgraph "Security Layer"
        M[Rate Limiting<br/>Request throttling]
        N[CORS Configuration<br/>Cross-origin security]
        O[Input Validation<br/>DTO schemas]
        P[Session Limits<br/>3 sessions per user]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    F --> J
    F --> K
    F --> L
    E --> M
    E --> N
    E --> O
    G --> P
```

## 8. Session Management Details

```mermaid
graph LR
    subgraph "Session Lifecycle"
        A[Create Session<br/>Login/Register]
        B[Validate Session<br/>Every API call]
        C[Refresh Session<br/>Token rotation]
        D[Invalidate Session<br/>Logout/Expiry]
    end
    
    subgraph "Session Data"
        E[Session ID<br/>Unique identifier]
        F[User ID<br/>Session owner]
        G[Device Info<br/>IP, User-Agent]
        H[Tokens<br/>Access + Refresh]
        I[Permissions<br/>Role-based access]
        J[Activity<br/>Last activity time]
    end
    
    subgraph "Session Limits"
        K[Max 3 sessions per user]
        L[30-minute timeout]
        M[10 token rotations max]
        N[Automatic cleanup]
    end
    
    A --> B
    B --> C
    C --> B
    B --> D
    
    A --> E
    A --> F
    A --> G
    A --> H
    A --> I
    A --> J
    
    K --> A
    L --> B
    M --> C
    N --> D
```

## 9. Error Handling & Security

```mermaid
flowchart TD
    A[API Request] --> B{Input Validation}
    B -->|Failed| C[400 Bad Request<br/>DTO validation error]
    B -->|Passed| D{Authentication}
    D -->|No Token| E[401 Unauthorized<br/>Missing token]
    D -->|Invalid Token| F[401 Unauthorized<br/>Invalid signature]
    D -->|Expired Token| G[401 Unauthorized<br/>Token expired]
    D -->|Valid Token| H{Session Validation}
    H -->|Invalid Session| I[401 Unauthorized<br/>Session invalid]
    H -->|Valid Session| J{Authorization}
    J -->|Insufficient Permissions| K[403 Forbidden<br/>Access denied]
    J -->|Authorized| L[200 Success<br/>Return data]
    
    C --> M[Frontend Error Handling]
    E --> M
    F --> M
    G --> M
    I --> M
    K --> M
    L --> N[Update UI]
    
    M --> O[Show user-friendly message]
    O --> P[Clear invalid tokens]
    P --> Q[Redirect if needed]
```

## Key Implementation Details

### **Frontend Security Features:**
- **Memory-only access tokens** - Stored in `SecureTokenManager` singleton
- **SessionStorage for refresh tokens** - More secure than localStorage
- **Automatic token refresh** - Via Axios response interceptors
- **Route protection** - Zustand auth store integration

### **Backend Security Features:**
- **Session-based authentication** - In-memory session management
- **Token rotation limits** - Max 10 rotations per session
- **Session limits** - Max 3 sessions per user
- **Automatic cleanup** - Expired sessions removed every 5 minutes
- **bcrypt password hashing** - 12 rounds with unique salt

### **API Security:**
- **JWT with sessionId** - Tokens include session identifier
- **CORS protection** - Cross-origin request restrictions
- **Rate limiting** - Request throttling per IP
- **Input validation** - DTO schemas for all endpoints

This implementation demonstrates enterprise-level security practices suitable for a senior developer role, with proper session management, token security, and comprehensive error handling. 
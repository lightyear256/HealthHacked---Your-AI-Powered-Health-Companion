``` mermaid 
   graph TB
    %% User Interface Layer
    subgraph "Frontend React TypeScript"
        A[User Browser] --> B[React App Loads]
        B --> C{Token in localStorage?}
        C -->|No| D[Login/Register Page]
        C -->|Yes| E[Dashboard Page]
        
        D --> F[User Enters Credentials]
        F --> G[POST /api/auth/login]
        
        E --> H[Load Dashboard Data]
        H --> I[GET /api/health/dashboard]
        
        E --> J[User Opens Chat]
        J --> K[Chat Interface]
        K --> L[User Types Health Message]
        L --> M[POST /api/chat]
    end
    
    %% API Gateway Layer
    subgraph "Express.js Server"
        G --> N[Auth Route Handler]
        I --> O[Health Route Handler]
        M --> P[Chat Route Handler]
        
        N --> Q{Input Validation}
        Q -->|Invalid| R[Return 400 Error]
        Q -->|Valid| S[Database User Lookup]
        
        O --> T[JWT Middleware]
        P --> U[JWT Middleware]
        
        T --> V{Valid Token?}
        U --> W{Valid Token?}
        V -->|No| X[Return 401 Error]
        W -->|No| Y[Return 401 Error]
        V -->|Yes| Z[Load User Health Data]
        W -->|Yes| AA[Process Chat Message]
    end
    
    %% Authentication Flow
    subgraph "Authentication System"
        S --> BB[MongoDB User Query]
        BB --> CC{User Exists?}
        CC -->|No| DD[Return 401 Error]
        CC -->|Yes| EE[bcrypt Password Compare]
        EE --> FF{Password Match?}
        FF -->|No| GG[Return 401 Error]
        FF -->|Yes| HH[Generate JWT Token]
        HH --> II[Update Last Active]
        II --> JJ[Return User + Token]
    end
    
    %% Chat Processing Flow
    subgraph "AI Processing Engine"
        AA --> KK[Intent Classification]
        KK --> LL{Intent Type?}
        LL -->|Emergency| MM[Emergency Response]
        LL -->|Medical Query| NN[Primary Chatbot]
        LL -->|Follow-up| OO[Secondary Chatbot]
        LL -->|General| PP[General Response]
        
        NN --> QQ[Build Medical Prompt]
        QQ --> RR[Send to Gemini AI]
        RR --> SS[Parse AI Response]
        SS --> TT[Create Health Context]
        TT --> UU[Generate Care Plan]
        UU --> VV[Return Complete Response]
    end
    
    %% Database Layer
    subgraph "MongoDB Database"
        direction TB
        
        subgraph "Collections"
            WW[(Users Collection)]
            XX[(HealthContexts Collection)]
            YY[(CarePlans Collection)]
            ZZ[(ChatHistory Collection)]
            AAA[(Notifications Collection)]
        end
        
        %% User Operations
        BB --> WW
        II --> WW
        
        %% Health Context Operations
        TT --> XX
        Z --> XX
        
        %% Care Plan Operations
        UU --> YY
        Z --> YY
        
        %% Chat History
        VV --> ZZ
    end
    
    %% External Services
    subgraph "External APIs"
        RR --> BBB[Google Gemini AI]
        BBB --> CCC[AI Response Processing]
        CCC --> SS
    end
    
    %% Logging System
    subgraph "Winston Logging"
        DDD[Error Logs] --> EEE[logs/error.log]
        FFF[Info Logs] --> GGG[logs/combined.log]
        HHH[Console Logs] --> III[Development Console]
        
        %% Connect logging to main flow
        N -.-> FFF
        P -.-> FFF
        AA -.-> FFF
        RR -.-> FFF
        R -.-> DDD
        X -.-> DDD
        DD -.-> DDD
    end
    
    %% Data Flow Examples
    subgraph "Database Document Creation"
        TT --> JJJ[New HealthContext Document]
        JJJ --> KKK["userId: ObjectId, primaryConcern: Headache, symptoms: headache fatigue, severity: 7, status: active, chatHistory: array"]
        
        UU --> LLL[New CarePlan Document]
        LLL --> MMM["userId: ObjectId, contextId: ObjectId, title: Headache Management, recommendations: array, progress: completionPercentage 0"]
    end
    
    %% User Journey Flow
    subgraph "Complete User Journey"
        NNN[User Registration] --> OOO[Email Verification]
        OOO --> PPP[First Login]
        PPP --> QQQ[Dashboard Load]
        QQQ --> RRR[First Health Chat]
        RRR --> SSS[AI Analysis]
        SSS --> TTT[Care Plan Creation]
        TTT --> UUU[Progress Tracking]
        UUU --> VVV[Follow-up Conversations]
    end
    
    %% Security Layers
    subgraph "Security and Protection"
        WWW[Rate Limiting] --> T
        XXX[CORS Headers] --> T
        YYY[Helmet.js Security] --> T
        ZZZ[Input Validation] --> Q
        AAAA[User Data Isolation] --> Z
        BBBB[JWT Signature Verification] --> V
    end
    
    %% Response Flow Back to User
    VV --> CCCC[Format API Response]
    CCCC --> DDDD[Send to Frontend]
    DDDD --> EEEE[Update React State]
    EEEE --> FFFF[Re-render Components]
    FFFF --> GGGG[Display AI Response and Care Plan]
    
    JJ --> HHHH[Store JWT in localStorage]
    HHHH --> IIII[Redirect to Dashboard]
    
    %% Error Handling Flow
    subgraph "Error Handling"
        JJJJ[Error Occurs] --> KKKK[Winston Logger]
        KKKK --> LLLL[Error Handler Middleware]
        LLLL --> MMMM[Format Error Response]
        MMMM --> NNNN[Send to Frontend]
        NNNN --> OOOO[Display Error Toast]
    end
    
    %% Care Plan Progress Update Flow
    subgraph "Care Plan Progress Tracking"
        PPPP[User Marks Recommendation Complete] --> QQQQ[PUT /api/health/care-plans/:id/recommendations/:recId/complete]
        QQQQ --> RRRR[Update Recommendation in Database]
        RRRR --> SSSS[CarePlan Pre-save Middleware Triggers]
        SSSS --> TTTT[Auto-calculate Progress Percentage]
        TTTT --> UUUU[Update Database]
        UUUU --> VVVV[Return Updated Care Plan]
        VVVV --> WWWW[Frontend Updates Progress Bar]
    end
    
    %% Multi-User Data Separation
    subgraph "Multi-User Data Isolation"
        XXXX[User A Login] --> YYYY[JWT with User A ID]
        ZZZZ[User B Login] --> AAAAA[JWT with User B ID]
        
        YYYY --> BBBBB["Query userId: A_ID"]
        AAAAA --> CCCCC["Query userId: B_ID"]
        
        BBBBB --> DDDDD[Returns Only User A Data]
        CCCCC --> EEEEE[Returns Only User B Data]
    end
    
    %% Styling
    classDef frontend fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef backend fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef database fill:#e8f5e8,stroke:#1b5e20,stroke-width:2px
    classDef ai fill:#fff3e0,stroke:#e65100,stroke-width:2px
    classDef security fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef logging fill:#f9fbe7,stroke:#33691e,stroke-width:2px
    
    class A,B,C,D,E,F,J,K,L frontend
    class N,O,P,Q,S,T,U,V,W,Z,AA backend
    class WW,XX,YY,ZZ,AAA,JJJ,KKK,LLL,MMM database
    class KK,LL,NN,QQ,RR,SS,TT,UU,VV,BBB,CCC ai
    class WWW,XXX,YYY,ZZZ,AAAA,BBBB security
    class DDD,EEE,FFF,GGG,HHH,III,KKKK logging
    ```
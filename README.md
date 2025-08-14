This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Authentication System**: JWT-based authentication with access and refresh tokens
- **Token Management**: Centralized token storage using singleton pattern
- **API Routes**: Login, refresh, logout, and protected endpoints
- **Token Store**: In-memory token storage with automatic cleanup (production-ready with Redis/DB)
- **Custom Axios Library**: Custom HTTP client with interceptors and error handling
- **Interactive Testing UI**: Built-in UI for testing all authentication endpoints

## Getting Started

### Running the Application

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

### Testing the Authentication System

The application includes a comprehensive testing UI that allows you to:

1. **Login**: Test user authentication and receive JWT tokens
2. **Token Refresh**: Test refresh token functionality
3. **Protected Access**: Test access to protected resources
4. **Logout**: Test token invalidation
5. **Token Status**: Monitor stored tokens and cleanup expired ones

Simply open [http://localhost:3000](http://localhost:3000) and use the interactive test cards to verify all authentication features.

## API Endpoints

### Authentication

- `POST /api/auth/login` - User login with JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout (token invalidation)
- `GET /api/auth/status` - Token status and management

### Protected Resources

- `GET /api/protected` - Protected data endpoint (requires valid access token)

## Token Store Architecture

The project uses a singleton `TokenStore` class to centrally manage refresh tokens:

```typescript
import { tokenStore } from "@/lib/provider/token-store.server";

// Store a refresh token
tokenStore.setRefreshToken(token, {
  userId: "user123",
  exp: Date.now() + 3600000,
});

// Check if token exists
const exists = tokenStore.hasRefreshToken(token);

// Delete a token
tokenStore.deleteRefreshToken(token);

// Clean up expired tokens
tokenStore.cleanupExpiredTokens();
```

**Note**: Current implementation uses in-memory storage. For production, consider using Redis or a database.

### AI Tool Reference

- [Google Gemini](https://g.co/gemini/share/512d3e8a3cdc)
- [Cursor Chat History](./public/cursor_refresh_tokens_as_a_singleton.md)

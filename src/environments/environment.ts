// =============================================================================
// src/environments/environment.development.ts
// Development Environment - Uses JSON Server
// =============================================================================

import { Environment } from './environment.interface';

export const environment: Environment = {
  production: false,
  APIUrl: 'http://localhost:3000/accounts',
  BankingAPIUrl: 'http://localhost:3000', // JSON Server for Banking
  displayname: 'Angular 18 Banking App - Development (JSON Server)'
};

// =============================================================================
// src/environments/environment.ts
// Production Environment - Would use real API
// =============================================================================

// import { Environment } from './environment.interface';
// 
// export const environment: Environment = {
//   production: true,
//   APIUrl: 'https://api.yourapp.com/product',
//   BankingAPIUrl: 'https://api.yourbank.com', // Real .NET API in production
//   displayname: 'Angular 18 Banking App'
// };

// =============================================================================
// NOTES FOR SWITCHING BETWEEN JSON SERVER AND .NET API:
// =============================================================================

/**
 * JSON SERVER SETUP (Development):
 * 
 * 1. Install JSON Server globally (if not installed):
 *    npm install -g json-server
 * 
 * 2. Start JSON Server:
 *    json-server --watch src/data/db.json --port 3000
 * 
 * 3. Verify it's running:
 *    Open http://localhost:3000/accounts in browser
 * 
 * 4. Use this environment:
 *    ng serve
 *    (automatically uses environment.development.ts)
 * 
 * FEATURES:
 * - Full REST API simulation
 * - Automatic ID generation
 * - Search with ?q=
 * - Filter with ?field=value
 * - Sort with ?_sort=field&_order=asc/desc
 * - Pagination with ?_page=1&_limit=10
 * - Data persists in db.json
 */

/**
 * .NET API SETUP (Production):
 * 
 * 1. Update environment.ts BankingAPIUrl to your .NET API URL
 * 
 * 2. Build for production:
 *    ng build --configuration production
 * 
 * 3. Deploy the dist/ folder
 * 
 * 4. Ensure .NET API implements these endpoints:
 *    GET    /api/accounts
 *    GET    /api/accounts/{id}
 *    POST   /api/accounts
 *    DELETE /api/accounts/{id}
 *    GET    /api/accounts/{id}/balance
 * 
 * MIGRATION PATH:
 * - The AccountService is already structured to work with either
 * - Just change the BankingAPIUrl in environment files
 * - Update endpoint paths if .NET API uses different routes
 * - Add authentication tokens in interceptor if needed
 */

/**
 * CURRENT CONFIGURATION:
 * 
 * Development (ng serve):
 *   - Uses: environment.development.ts
 *   - Banking API: http://localhost:3000 (JSON Server)
 *   - Product API: http://localhost:3000/product (JSON Server)
 * 
 * Production (ng build --prod):
 *   - Uses: environment.ts
 *   - Banking API: Configure for real .NET API
 *   - Product API: Configure for real API
 */

/**
 * TESTING THE SETUP:
 * 
 * 1. Start JSON Server:
 *    json-server --watch src/data/db.json --port 3000
 * 
 * 2. In another terminal, start Angular:
 *    ng serve
 * 
 * 3. Open browser: http://localhost:4200
 * 
 * 4. Login with:
 *    Username: admin
 *    Password: admin
 * 
 * 5. Navigate to Banking → My Accounts
 * 
 * 6. You should see 7 accounts loaded from db.json
 * 
 * 7. Try creating a new account
 * 
 * 8. Check db.json - the new account should be saved there!
 */
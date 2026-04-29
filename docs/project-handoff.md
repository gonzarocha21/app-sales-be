# Inventory Management MVP Backend Handoff

Last updated: 2026-04-29

This document summarizes the current backend state for future developers and AI assistants. It is meant to preserve context when the chat history gets long or compacted.

## Fast Resume Checklist

If this conversation context was reset, start here:

1. Confirm repo and branch:

   ```bash
   pwd
   git status -sb
   git log --oneline -5
   ```

2. Run the backend build:

   ```bash
   npm run build
   ```

3. Remember the API base URL:

   ```text
   http://localhost:3000/api
   ```

4. Product endpoints are the most actively changing area. Read these files first if the next task mentions products:

   ```text
   src/models/index.ts
   src/modules/products/products.storage.ts
   src/modules/products/products.service.ts
   src/modules/products/products.controller.ts
   src/modules/products/products.routes.ts
   ```

5. Current frontend sibling repo:

   ```text
   ../app-ventas-fe
   ```

6. Backend response format is standardized. Use `sendSuccess` and `AppError`; do not hand-roll `res.json` payloads in new controllers.

7. Storage is still in memory. Do not add database persistence unless explicitly requested.

## Project Overview

This repository contains the backend for an inventory and sales management MVP.

Tech stack:

- Node.js
- TypeScript
- Express.js
- In-memory storage only
- No database yet
- No real authentication yet

The app currently supports product creation/listing, locations, stock entries, stock transfers, sales, returns, stock adjustments, movement history, reports, and mock login.

## Run Commands

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start compiled server:

```bash
npm start
```

Default port:

```bash
3000
```

Base API URL:

```bash
http://localhost:3000/api
```

Health endpoints:

```bash
GET /health
GET /api/health
```

## Response Contract

All successful API responses should use:

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

All error API responses should use:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Readable error message"
  }
}
```

The shared success helper is:

```ts
src/utils/apiResponse.ts
```

The shared error class is:

```ts
src/utils/AppError.ts
```

Global error handling is in:

```ts
src/middleware/errorHandler.ts
```

404 handling is in:

```ts
src/middleware/notFoundHandler.ts
```

## Important Architecture Notes

The backend is organized by modules:

```text
src/
  app/
  config/
  middleware/
  models/
  modules/
    adjustments/
    auth/
    categories/
    locations/
    movements/
    products/
    reports/
    returns/
    sales/
    settings/
    stock/
    stock-lots/
    stock-movements/
    users/
  routes/
  types/
  utils/
```

Main app setup:

```ts
src/app/index.ts
```

Route mounting:

```ts
src/routes/index.ts
```

All module routes are mounted under:

```text
/api
```

Example:

```text
POST /api/products
```

## Domain Enums And Models

Domain types live in:

```ts
src/models/index.ts
```

Canonical runtime arrays are also exported there. Prefer using these arrays for validation instead of duplicating string literals.

Current enums/unions:

```ts
UserRole = "admin" | "seller"
LocationType = "warehouse" | "store"
ProductStatus = "active" | "inactive"
MovementType = "entry" | "transfer" | "sale" | "return" | "removal" | "manual_adjustment"
RemovalReason = "expired" | "broken" | "lost" | "internal_consumption" | "loading_error" | "other"
PaymentMethod = "cash" | "card" | "bank_transfer" | "other"
```

Compatibility re-exports exist in:

```ts
src/types/domain.ts
```

Future code should import from `src/models` when possible.

## Storage Model

Everything is stored in memory.

This means:

- All data resets when the server restarts.
- Services own their own arrays.
- There is no transaction support.
- Multi-step operations can partially mutate state if future code throws after a mutation.

Important service stores:

```text
productsStorage       src/modules/products/products.storage.ts
locationsService      src/modules/locations/locations.service.ts
stockLotsService      src/modules/stock-lots/stockLots.service.ts
stockMovementsService src/modules/stock-movements/stockMovements.service.ts
salesService          src/modules/sales/sales.service.ts
returnsService        src/modules/returns/returns.service.ts
adjustmentsService    src/modules/adjustments/adjustments.service.ts
```

When adding a database later, these services are the natural boundary to replace with repositories.

## Implemented API

### Auth

```text
POST /api/auth/login
```

Request:

```json
{
  "username": "admin",
  "password": "admin"
}
```

Valid hardcoded users:

- `admin` / `admin`
- `seller` / `seller`

Success:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-admin",
      "username": "admin",
      "role": "admin"
    },
    "token": "mock-token-admin"
  },
  "message": "Login successful"
}
```

Invalid credentials:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid username or password"
  }
}
```

No real auth or token validation exists yet.

### Products

```text
POST /api/products
GET /api/products
GET /api/products/:id
PUT /api/products/:id
DELETE /api/products/:id
```

`POST /api/products` request:

```json
{
  "name": "string",
  "internalCode": "string",
  "barcode": "string",
  "category": "string",
  "salePrice": 10,
  "cost": 5,
  "description": "string"
}
```

`imageUrl` may also be provided, but it is no longer required. If omitted, the backend stores and returns an empty string.

Created product response data:

```json
{
  "id": "string",
  "name": "string",
  "internalCode": "string",
  "barcode": "string",
  "category": "string",
  "salePrice": 10,
  "cost": 5,
  "description": "string",
  "imageUrl": "string",
  "status": "active",
  "createdAt": "string",
  "updatedAt": "string"
}
```

Product storage is separated from the service:

```text
src/modules/products/products.storage.ts
```

Seeded products:

- `product-1`: Remera Básica Blanca
- `product-2`: Jean Azul
- `product-3`: Botella Térmica

`GET /api/products` returns product list DTOs with stock fields:

```json
{
  "id": "string",
  "name": "string",
  "internalCode": "string",
  "barcode": "string",
  "category": "string",
  "salePrice": 10,
  "cost": 5,
  "description": "string",
  "imageUrl": "string",
  "status": "active",
  "totalStock": 25,
  "stockByLocation": [
    {
      "locationId": "string",
      "locationName": "string",
      "quantity": 25
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

Supported query params:

- `search`
- `category`
- `locationId`
- `status`
- `lowStock`
- `sortBy`
- `sortOrder`

Supported `sortBy`:

- `name`
- `internalCode`
- `barcode`
- `category`
- `totalStock`
- `salePrice`
- `cost`
- `createdAt`
- `status`

Supported `sortOrder`:

- `asc`
- `desc`

Default sort:

```text
name asc
```

Search behavior:

- case-insensitive
- matches product `name`
- matches product `id`
- matches `internalCode`
- matches `barcode`

`GET /api/products/:id` returns a product detail DTO:

```json
{
  "id": "string",
  "name": "string",
  "internalCode": "string",
  "barcode": "string",
  "category": "string",
  "salePrice": 10,
  "cost": 5,
  "description": "string",
  "imageUrl": "string",
  "status": "active",
  "totalStock": 25,
  "stockByLocation": [
    {
      "locationId": "location-1",
      "locationName": "Depósito",
      "quantity": 25
    }
  ],
  "stockLots": [
    {
      "id": "stock-lot-1",
      "locationId": "location-1",
      "locationName": "Depósito",
      "quantity": 25,
      "expirationDate": "2026-12-31"
    }
  ],
  "createdAt": "string",
  "updatedAt": "string"
}
```

`PUT /api/products/:id` requires the full product payload:

```json
{
  "name": "string",
  "internalCode": "string",
  "barcode": "string",
  "category": "string",
  "salePrice": 10,
  "cost": 5,
  "description": "string",
  "status": "active"
}
```

`imageUrl` is optional on update too. If omitted, it becomes an empty string.

Update response message:

```text
Product updated successfully
```

Soft delete:

```text
DELETE /api/products/:id
```

sets product `status` to `inactive`, updates `updatedAt`, preserves the product record, and returns:

```json
{
  "id": "string",
  "status": "inactive"
}
```

Delete response message:

```text
Product deactivated successfully
```

### Locations

```text
GET /api/locations
POST /api/locations
```

Location shape:

```json
{
  "id": "string",
  "name": "string",
  "type": "warehouse",
  "active": true
}
```

Seeded locations:

```json
[
  {
    "id": "location-1",
    "name": "Depósito",
    "type": "warehouse",
    "active": true
  },
  {
    "id": "location-2",
    "name": "Local 1",
    "type": "store",
    "active": true
  },
  {
    "id": "location-3",
    "name": "Local 2",
    "type": "store",
    "active": true
  }
]
```

`POST /api/locations` request:

```json
{
  "name": "Local 3",
  "type": "store"
}
```

Rules:

- `name` is required
- `type` is required
- `type` must be `warehouse` or `store`
- `active` is always set to `true`
- name must be unique, case-insensitive and trimmed

Duplicate location error:

```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_LOCATION",
    "message": "Location with this name already exists"
  }
}
```

### Stock Entry

```text
POST /api/stock/entry
```

Request:

```json
{
  "productId": "string",
  "locationId": "string",
  "quantity": 10,
  "expirationDate": "2026-12-31",
  "notes": "string"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "movement": {
      "id": "string",
      "type": "entry",
      "productId": "string",
      "quantity": 10
    }
  },
  "message": "Stock entry registered successfully"
}
```

Behavior:

- validates required fields
- creates a stock lot
- creates an `entry` movement
- movement is mandatory

Note: `notes` is accepted by the endpoint but is not currently stored on the `StockLot` or `StockMovement` model.

### Stock Transfer

```text
POST /api/stock/transfer
```

Request:

```json
{
  "productId": "string",
  "quantity": 5,
  "originLocationId": "location-1",
  "destinationLocationId": "location-2"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "movement": {
      "type": "transfer"
    }
  }
}
```

Behavior:

- decreases origin stock
- increases destination stock
- prevents same origin and destination
- creates a `transfer` movement

Important implementation note:

- Transfers use `stockLotsService.decrease`.
- That method finds one lot with enough quantity.
- It does not split quantities across multiple lots yet.

### Sales

```text
POST /api/sales
GET /api/sales
GET /api/sales/:id
PUT /api/sales/:id
DELETE /api/sales/:id
```

`POST /api/sales` request:

```json
{
  "locationId": "string",
  "paymentMethod": "cash",
  "items": [
    {
      "productId": "string",
      "quantity": 2,
      "unitPrice": 100
    }
  ]
}
```

For this endpoint, accepted payment methods are currently:

- `cash`
- `card`
- `other`

Response:

```json
{
  "success": true,
  "data": {
    "sale": {
      "id": "string",
      "totalAmount": 200
    }
  }
}
```

Behavior:

- supports multiple items
- validates item `productId`, positive `quantity`, and `unitPrice`
- checks available stock before mutating
- decreases stock per item
- creates one `sale` movement per item

Important implementation note:

- The `Sale` model still stores the field as `total`, while the endpoint response exposes `totalAmount`.
- Future database schema should decide one canonical name.

### Returns

```text
POST /api/returns
GET /api/returns
```

`POST /api/returns` request:

```json
{
  "productId": "string",
  "quantity": 1,
  "locationId": "string"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "movement": {
      "type": "return"
    }
  }
}
```

Behavior:

- increases stock
- creates a `return` movement

### Adjustments

```text
POST /api/adjustments
GET /api/adjustments
```

Request:

```json
{
  "productId": "string",
  "locationId": "string",
  "quantity": 22,
  "reason": "Cycle count correction"
}
```

Behavior:

- sets stock to the given quantity
- creates a `manual_adjustment` movement when quantity changes
- stores adjustment record in memory

Positive adjustment creates movement with `toLocationId`.

Negative adjustment creates movement with `fromLocationId`.

### Movements

```text
GET /api/movements
```

Supported filters:

- `productId`
- `locationId`
- `fromLocationId`
- `toLocationId`
- `type`
- `dateFrom`
- `dateTo`

Valid movement types:

- `entry`
- `transfer`
- `sale`
- `return`
- `removal`
- `manual_adjustment`

### Reports

```text
GET /api/reports
GET /api/reports/stock
GET /api/reports/stock/low
GET /api/reports/sales
```

Stock report:

- total quantity
- total lots
- stock grouped by product
- stock grouped by location
- raw lots

Low stock report:

- threshold
- low stock products
- negative stock products
- low stock locations
- negative stock locations
- all product/location statuses

Config:

```env
LOW_STOCK_THRESHOLD=5
```

Sales report:

- total sales count
- total revenue
- total items sold
- sales grouped by product
- raw sales

## Frontend Notes

There is a sibling frontend repository:

```text
../app-ventas-fe
```

Current frontend `.env` should use:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

The stock entry form has been wired to:

```text
POST /stock/entry
```

Frontend `apiClient` expects the backend response contract:

```json
{
  "success": true,
  "data": {}
}
```

and error shape:

```json
{
  "success": false,
  "error": {
    "message": "Readable message"
  }
}
```

## Known Gaps And Sharp Edges

These are important for future AI developers:

1. In-memory storage only.

   Do not assume state persists across server restarts.

2. No real authentication.

   `POST /api/auth/login` returns mock tokens. No middleware validates those tokens.

3. No authorization.

   Role restrictions are mostly frontend-only for now.

4. Stock lot selection is simplistic.

   `decrease` requires a single lot with enough quantity. It does not consume FIFO/FEFO or split across lots.

5. Expiration dates are stored on lots but not used for FEFO.

6. Notes are accepted by some endpoints but not modeled consistently yet.

7. Product list returns list DTOs that include product fields plus stock aggregates. Product detail additionally includes `stockLots`.

8. Product detail returns the full stored product.

9. Sales response uses `totalAmount`, but stored sale uses `total`.

10. Some older CRUD placeholder modules remain.

    Examples: categories, settings, users, stock-lots, stock-movements still use generic CRUD controllers in places.

11. There are no automated tests yet.

12. There is no validation library.

    Validation is currently hand-written in services.

13. There is no API versioning.

14. There is no persistence abstraction yet.

    Services are the intended migration boundary.

## Recommended Next Backend Tasks

1. Add tests for product, location, stock entry, transfer, sales, and returns contracts.

2. Add repository layer interfaces before introducing a database.

3. Add real auth middleware and role authorization.

4. Decide canonical naming for sales totals: `total` vs `totalAmount`.

5. Add stock lot consumption strategy:

   - FIFO
   - FEFO by expiration date
   - manual lot selection

6. Add request validation middleware or schemas.

   Good future choices:

   - Zod
   - Joi
   - Valibot

7. Normalize error codes.

8. Add pagination for product and movement lists.

9. Persist notes/references in movement records.

10. Add removal endpoint contract if not already finalized.

## Useful Smoke Tests

Health:

```bash
curl http://localhost:3000/api/health
```

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

Create product:

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Blue Shirt",
    "internalCode":"SHIRT-BLUE-001",
    "barcode":"7791234567890",
    "category":"Clothing",
    "salePrice":49.99,
    "cost":22.5,
    "description":"Blue cotton shirt",
    "imageUrl":"https://example.com/blue-shirt.jpg"
  }'
```

List products:

```bash
curl "http://localhost:3000/api/products?sortBy=totalStock&sortOrder=desc"
```

List locations:

```bash
curl http://localhost:3000/api/locations
```

Create location:

```bash
curl -X POST http://localhost:3000/api/locations \
  -H "Content-Type: application/json" \
  -d '{"name":"Local 3","type":"store"}'
```

Stock entry:

```bash
curl -X POST http://localhost:3000/api/stock/entry \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"product-1",
    "locationId":"location-1",
    "quantity":10,
    "expirationDate":"2026-12-31",
    "notes":"Initial entry"
  }'
```

Transfer:

```bash
curl -X POST http://localhost:3000/api/stock/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"product-1",
    "quantity":2,
    "originLocationId":"location-1",
    "destinationLocationId":"location-2"
  }'
```

Sale:

```bash
curl -X POST http://localhost:3000/api/sales \
  -H "Content-Type: application/json" \
  -d '{
    "locationId":"location-1",
    "paymentMethod":"cash",
    "items":[
      {
        "productId":"product-1",
        "quantity":1,
        "unitPrice":100
      }
    ]
  }'
```

Return:

```bash
curl -X POST http://localhost:3000/api/returns \
  -H "Content-Type: application/json" \
  -d '{
    "productId":"product-1",
    "quantity":1,
    "locationId":"location-1"
  }'
```

Movements:

```bash
curl "http://localhost:3000/api/movements?type=entry"
```

Reports:

```bash
curl http://localhost:3000/api/reports/stock
curl http://localhost:3000/api/reports/stock/low
curl http://localhost:3000/api/reports/sales
```

## Current Git Context

The backend repo has already been initialized and pushed previously.

Remote:

```text
https://github.com/gonzarocha21/app-sales-be.git
```

Branch:

```text
main
```

Latest known pushed backend commit during this handoff:

```text
2a64014 Support product table sorting fields
```

At the time this document was refreshed, `main` was synced with `origin/main` before editing this doc.

Run this before committing:

```bash
npm run build
git status --short
```

# Crypto Events Analytics Dashboard - Purpose & Scope

This file tracks the purpose and constraints of the technical interview project.

## Repository Context

- **Delivery repository:** `events`
- **Reference architecture repository:** `urlshortener`
- We will reuse/copy selected patterns and code structure from `urlshortener` into `events` where appropriate.

## Technical Challenge – Senior Full-Stack Engineer

### Objective

This technical challenge aims to assess the candidate’s ability to:
- Manipulate and structure event-based data (logs / telemetry).
- Design a data model suitable for analytics.
- Build efficient aggregation APIs (filters, group-by, statistics).
- Expose data via a frontend using tables and analytical visualizations.
- Justify technical choices in terms of performance, readability, and extensibility.

Target duration: 3–4 hours. This is not expected to be a production-ready product, but a solid and well-reasoned foundation.

### Functional Context

CryptoNext develops a product that collects network-related events associated with cryptographic assets (certificates, keys, etc.) and makes them searchable in order to:
- Identify algorithms in use (e.g. RSA2048, RSA1024, ECDSA-P256, Ed25519, SHA1, 3DES).
- Track the evolution of event volumes over time.
- Detect weak signals (deprecated algorithms, anomalies, errors).

You are expected to build a small **Crypto Events Analytics Dashboard**.

### Dataset (Simplified)

You will work with a simulated event stream represented by a JSON or NDJSON file that you create yourself. Each event follows the structure below:

```ts
{
  id: string;
  assetId: string;
  assetType: string;       // e.g. certificate, ssh-key, api-key
  algorithm: string;
  severity: "info" | "warning" | "critical";
  sourceIp: string;
  observedAt: string;      // ISO datetime
  eventType: string;       // e.g. observed, rotation, expiration-warning, error
}
```

You may generate between 20 and 50 test events with varied values.

## Part 1 – Backend (Data-Oriented)

### Objectives
- Load the dataset into a SQL database (SQLite, PostgreSQL, or equivalent).
- Expose filtering and aggregation endpoints.

### Expected Stack
- Node.js with TypeScript.
- ORM or query builder of your choice (Prisma, Knex, raw SQL, etc.).

### Required Endpoints
- `GET /events`  
  Supports filtering via query parameters (assetType, algorithm, severity, date range) and simple pagination.

- `GET /stats/events-per-day`  
  Returns the number of events per day over a given period.

- `GET /stats/by-algorithm`  
  Returns event counts per algorithm, optionally broken down by severity.

- `GET /stats/inventory-keys`  
  Example of a more complex query combining filters on asset type, severity, year, and algorithm list.

- `GET /stats/top-source-ips`  
  Returns the top N source IPs generating the most events.

### Backend Requirements
- Coherent and documented data model.
- Reasonably optimized queries.
- Input validation and clean error handling.

## Part 2 – Frontend (Data-Oriented)

### Expected Stack
- React or Next.js.
- TypeScript recommended.
- HTTP client and charting library of your choice.

### Required Screens
1. Main dashboard with global filters and charts (events per day, events by algorithm).
2. Paginated table showing detailed events with local filtering.
3. IP-focused view showing total events and breakdowns by severity and/or algorithm.

### Frontend Requirements
- Clear component structure and reusable code.
- Simple, readable UX.
- Loading states and basic error handling.

## Part 3 – Data & Architecture Documentation

Provide an `ARCHITECTURE_DATA.md` file (1–2 pages) describing:
- Data model and indexing strategy.
- Aggregation approach and scalability considerations.
- Performance optimizations and future evolution (high volume, streaming).
- Security considerations and multi-tenancy strategy.
- What you would improve with two extra days.

## Optional Bonus
- Automated seed script.
- Docker / Docker Compose.
- Basic CI pipeline.
- Aggregation tests.

## Expected Deliverables

A Git repository containing:
- `/backend`
- `/frontend`
- `ARCHITECTURE_DATA.md`
- `README.md` with setup instructions.

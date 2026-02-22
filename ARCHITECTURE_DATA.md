# Data Architecture

## 1) Data model and indexing strategy

### Current model
The system stores security observations in a single `Event` table:

- `id` (PK)
- `assetId`
- `assetType`
- `algorithm`
- `severity`
- `sourceIp`
- `observedAt`
- `eventType`

This is a pragmatic model for an events stream: append-heavy writes, filter-heavy reads, and analytical aggregations.

### Current indexes (implemented)

- `PRIMARY KEY (id)`
- `INDEX (observedAt)`
- `INDEX (algorithm)`
- `INDEX (assetType)`
- `INDEX (assetId)`
- `INDEX (assetId, algorithm)`
- `INDEX (eventType)`
- `INDEX (sourceIp)`

### Filter and index justification

- `observedAt`
  - Used by date-range filters (`startDate/endDate`, `from/to`) and time-based sorting.
  - Critical for `/events` timeline navigation and stats windows (last 7/30 days).
  - Index impact: avoids full scans on time-bounded queries.

- `assetId`
  - Used as direct equality filter in `/events`.
  - High-cardinality identifier; selective predicate.
  - Index impact: fast lookup for a single asset history.

- `assetType`
  - Used as a categorical filter in `/events` and stats endpoints.
  - Often combined with date/severity for dashboards.
  - Index impact: reduces scanned rows for type-specific views.

- `algorithm`
  - Core dimension for `/stats/by-algorithm` and inventory-related stats.
  - Also used in `/events` filtering.
  - Index impact: improves grouped/filter access on algorithm-centric queries.

- `severity`
  - Business-critical filter for risk-focused views and incident triage.
  - Frequently combined with `assetType` and time filters in stats use cases.
  - Recommended index if severity filtering volume increases.

- `eventType`
  - Used for event categorization (`observed`, `rotation`, etc.) in `/events`.
  - Useful for workflow-specific slices of data.
  - Index impact: faster category filtering, especially when paired with other predicates.

- `sourceIp`
  - Required by `/stats/top-source-ips` and direct `/events` filtering.
  - Supports suspicious-source analysis and top-N reporting.
  - Index impact: reduces cost of source-based group/filter operations.

- Composite `INDEX (assetId, algorithm)`
  - Supports inventory-style logic around distinct `(assetId, algorithm)` pairs.
  - Matches access pattern where both columns are constrained/aggregated together.
  - Index impact: more efficient than separate indexes for this combined shape.

4. If traffic grows, consider BRIN on time:
- `BRIN(observedAt)` for very large append-only tables (often with partitioning).

## 2) Aggregation approach and scalability

### Current approach

Aggregations are computed on-demand from raw `Event` data (`groupBy`, filtered scans, in-memory post-processing).

Pros:
- Simple implementation
- No pre-aggregation maintenance complexity

Limits at scale:
- Expensive repeated scans for dashboards
- Rising latency with larger retention windows
- Potential database contention between ingest and analytics

### Proposed solution: Redis bucket aggregation + worker

Use PostgreSQL as source of truth and Redis as low-latency stats store.

#### Design

1. Real-time minute buckets in Redis  
- For each ingested event, increment minute-level counters:
  - `stats:{tenant}:events:minute:{YYYYMMDDHHmm}`
  - `stats:{tenant}:algo:minute:{YYYYMMDDHHmm}:{algorithm}`
  - `stats:{tenant}:algo_severity:minute:{YYYYMMDDHHmm}:{algorithm}:{severity}`
  - `stats:{tenant}:source_ip:minute:{YYYYMMDDHHmm}` (sorted set with `ZINCRBY`)

2. Incremental flush worker (every minute, or configurable)  
- Read closed buckets (for example minute `t-1`) and upsert into Postgres aggregate tables.
- Do not recompute from raw events each cycle.
- This keeps CPU and DB load stable as volume grows.

3. Correction window for late/out-of-order events  
- Reprocess and re-upsert the last 5–15 minutes each run.
- Guarantees eventual consistency without full recompute.

4. Read strategy  
- Dashboard endpoints read Redis for hot windows (last 60 min / last 24h).
- For cold windows or cache miss, read Postgres aggregate tables.

#### Why this answers the current pain points

- Expensive repeated scans: endpoints read pre-aggregated buckets, not raw `Event`.
- Rising latency: query cost depends on requested window, not full data retention.
- DB contention: heavy analytics reads move away from raw-event scans.

## 3) Performance optimizations and future evolution (high volume, streaming)

### Near term
- Add aggregate tables in Postgres (minute and day granularity).
- Implement worker idempotency (`SETNX processed:{eventId}` with TTL) to avoid double-counting.
- Add backfill/reconciliation job: compare Redis/Postgres for recent windows and repair drift.

### High volume
- Partition raw `Event` by time (`observedAt`) for write/read isolation.
- Keep hot buckets in Redis with TTL; keep long-term historical stats in Postgres.
- Add composite indexes on aggregate tables for common dashboard queries (`tenantId + bucketStart`, `tenantId + algorithm + bucketStart`).
- Add lifecycle tiering for raw events:
  - keep recent data in hot storage (Postgres primary),
  - after a retention threshold (for example 90/180 days), move old events to cold storage (object storage or archive DB),
  - keep only aggregates or minimal metadata in hot storage for old periods.
  This reduces primary database cost and improves performance, with low product impact since very old raw events are rarely queried.

### Streaming evolution
- Add queue/outbox between API ingestion and aggregation worker.
- Worker consumes asynchronously, batches writes, and flushes in pipeline/upsert mode.
- Scale workers horizontally by tenant/date shard when throughput increases.

## 4) Security considerations and multi-tenancy strategy

- Tenant-scoped stats and access control:
  - all stats computation paths (Redis buckets and Postgres aggregates) must be scoped by tenant,
  - enforce auth + role + tenant checks at the API layer,
  - apply rate limits on expensive endpoints per tenant to prevent abuse and noisy-neighbor impact.

- Tenant ID mandatory everywhere:
  - `tenantId` must be non-nullable on raw `Event` records,
  - `tenantId` must be present on all aggregate tables,
  - `tenantId` must be part of Redis bucket keys and cache keys.

- Tenant-first indexing strategy:
  - use composite indexes with `tenantId` as the leading column for isolation and performance,
  - examples: `(tenantId, observedAt)`, `(tenantId, algorithm, observedAt)`,
  - apply the same rule on aggregate tables (for example `(tenantId, bucketStart)`).

## 5) What I would improve with two extra days

1. Create Postgres aggregate tables (`stats_minute`, `stats_day`, `stats_algo_minute`, `stats_source_ip_minute`).
2. Implement minute-bucket worker with incremental flush + correction window.
3. Add fallback logic in stats service: Redis hot path, Postgres aggregate fallback.
4. Add observability: queue lag, bucket flush delay, Redis hit ratio, drift metrics.

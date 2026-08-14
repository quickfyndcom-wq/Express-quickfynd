# QuickFynd Express Platform

Courier and last-mile logistics software suite. Each module can be built and deployed as separate software, sharing one core data model and API layer.

## Ownership & licence

| Item | Entity |
|------|--------|
| **Trade name** | NILAAS |
| **Brand** | QuickFynd (operated under NILAAS) |
| **GSTIN** | 32JWYPS4831L1Z1 |
| **Courier / Express ops** | QuickFynd Express (same legal entity) |

Use NILAAS + GSTIN `32JWYPS4831L1Z1` on invoices and tax documents.

---

## Architecture overview

```
Merchants / Partners ──► API & Webhooks ──► Core Shipment Engine
                                              │
        ┌─────────────┬─────────────┬─────────┼─────────┬──────────────┐
        ▼             ▼             ▼         ▼         ▼              ▼
   Admin Dashboard  Merchant     Hub Mgmt   Rider App  Support     Finance/COD
                    Portal       Portal                              Module
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                   Route Optimizer     Notifications       Customer Tracking
```

**Suggested stack (per product):** Next.js / React Native · Node.js or NestJS API · PostgreSQL · Redis · message queue (BullMQ / SQS) · object storage for POD photos.

**Shared services:** Auth (RBAC), Shipment lifecycle, Geo/zones, Audit log, Event bus.

---

## 1. Admin Dashboard

**Purpose:** Network-wide control plane for QuickFynd operators.

**Users:** Super admins, ops managers, city managers.

**Core features**
- User & role management (merchant, hub, rider, support, finance)
- City / zone / hub configuration and serviceability maps
- SLA rules, delivery windows, and holiday calendars
- Rate cards and surcharges (weight, COD, remote area)
- Live ops board: delayed shipments, failed attempts, rider utilization
- Feature flags and system health
- Audit logs and compliance exports

**Key entities:** User, Role, Zone, Hub, RateCard, SlaPolicy, FeatureFlag

**Separate app idea:** `quickfynd-admin` — web app (Next.js)

---

## 2. Merchant Portal

**Purpose:** Self-serve shipping for sellers and brands.

**Users:** Merchants, warehouse staff, merchant finance.

**Core features**
- Create single / bulk shipments (CSV / Excel)
- Address book, saved receivers, and draft orders
- Label & airway bill (AWB) generation / print
- Order status, returns (RTO), and reattempts
- Rate calculator and wallet / credit balance
- COD receivable reports
- Branding for tracking page (optional logo)
- API key management (links to API platform)

**Key entities:** Merchant, Shipment, Label, Return, MerchantWallet

**Separate app idea:** `quickfynd-merchant` — web app (Next.js)

---

## 3. Hub Management Portal

**Purpose:** Operate sorting centers and micro-hubs.

**Users:** Hub managers, sorters, dispatch clerks.

**Core features**
- Inbound scan (receive from merchant / linehaul)
- Sort by destination zone / bag
- Exception handling (damaged, missing, wrong hub)
- Dispatch waves: assign bags/shipments to riders or vehicles
- Hub inventory snapshot (what’s physically on site)
- Capacity and shift planning
- Inter-hub transfer manifests

**Key entities:** HubScan, Bag, Manifest, DispatchWave, Exception

**Separate app idea:** `quickfynd-hub` — web + handheld barcode scanners

---

## 4. Rider Mobile App

**Purpose:** Field execution for pickup and delivery.

**Users:** Couriers / riders.

**Core features**
- Login, shift start/end, vehicle type
- Assigned tasks: pickup, delivery, return
- Navigation / deep-link to maps
- Status updates (out for delivery, delivered, failed)
- Proof of delivery: photo, OTP, signature
- COD collection and cash handover to hub
- Offline-tolerant queue with sync
- Push notifications for new assignments

**Key entities:** Rider, Task, PodProof, CashHandover, Shift

**Separate app idea:** `quickfynd-rider` — React Native / Flutter

---

## 5. Customer Tracking Page

**Purpose:** Public, no-login tracking experience.

**Users:** End customers receiving parcels.

**Core features**
- Track by AWB / tracking number
- Timeline of milestones (created → picked → hub → OFD → delivered)
- Live ETA when rider is out for delivery (optional map)
- Delivery instructions / preferred time window (if allowed)
- Shareable tracking link
- Branding per merchant / QuickFynd

**Key entities:** TrackingEvent (read model from shipment events)

**Separate app idea:** `quickfynd-track` — public Next.js page (`/track/[awb]`)

---

## 6. Customer Support Portal

**Purpose:** Resolve delivery issues and tickets.

**Users:** Support agents, team leads.

**Core features**
- Shipment search (AWB, phone, order id)
- Ticket creation: delay, wrong address, lost, damaged, COD dispute
- Actions: reattempt, redirect, cancel, escalate to hub
- Macros / canned responses
- SLA timers on tickets
- Customer communication log (calls, SMS, chat)
- Agent performance dashboards

**Key entities:** Ticket, TicketAction, CommunicationLog

**Separate app idea:** `quickfynd-support` — web app (Next.js)

---

## 7. Finance and COD Module

**Purpose:** Money movement and merchant settlement.

**Users:** Finance team, merchant finance users (read-only portal views).

**Core features**
- COD expected vs collected vs remitted
- Rider cash reconciliation per shift / day
- Merchant payout cycles (daily / weekly)
- Invoices, credit notes, and fee deductions
- Wallet top-ups and adjustments
- Fraud / mismatch alerts (collected ≠ expected)
- Export to accounting (CSV / API)

**Key entities:** CodLedger, Payout, Invoice, Adjustment, CashSession

**Separate app idea:** `quickfynd-finance` — web app + scheduled settlement jobs

---

## 8. Route Optimization System

**Purpose:** Build efficient rider routes and ETAs.

**Users:** Dispatchers (via hub/admin); system services.

**Core features**
- Cluster stops by zone / geofence
- Sequence stops (TSP / vehicle routing heuristics)
- Respect capacity (weight, volume, stops per shift)
- Priority / SLA-aware ordering
- Re-optimize when new tasks arrive mid-shift
- ETA engine feeding tracking page
- Simulation / what-if for peak days

**Key entities:** RoutePlan, RouteStop, EtaEstimate, VehicleCapacity

**Separate app idea:** `quickfynd-routing` — backend service + optional dispatcher UI

---

## 9. Notification System

**Purpose:** Multi-channel alerts for shipment lifecycle.

**Users:** System + configurable by admin/merchant.

**Core features**
- Channels: SMS, email, WhatsApp, push, in-app
- Templates per event (created, OFD, delivered, failed, COD)
- Preference & quiet hours
- Delivery receipts and failure retry
- Merchant-branded message options
- Rate limiting and cost controls

**Key entities:** NotificationTemplate, NotificationJob, ChannelConfig

**Separate app idea:** `quickfynd-notify` — worker service + admin template UI

---

## 10. API and Webhook Platform

**Purpose:** Integrate QuickFynd with merchant ERPs, marketplaces, and partners.

**Users:** Merchant developers, partners, internal services.

**Core features**
- REST (and optionally GraphQL) for shipments, rates, tracking, COD
- API keys, OAuth apps, scopes, rate limits
- Sandbox environment
- Outbound webhooks on status changes (signed payloads)
- Webhook retry with exponential backoff
- Developer docs & Postman collection
- Partner marketplace connectors (optional)

**Key entities:** ApiClient, WebhookEndpoint, WebhookDelivery, ApiUsage

**Separate app idea:** `quickfynd-api` — NestJS/Fastify gateway + docs portal

---

## Shared shipment lifecycle

Recommended status flow:

```
DRAFT → CREATED → PICKED_UP → AT_HUB → IN_TRANSIT → OUT_FOR_DELIVERY
  → DELIVERED
  → FAILED_ATTEMPT → (reattempt) OUT_FOR_DELIVERY
  → RETURN_TO_ORIGIN → RETURNED
  → CANCELLED
```

Every status change should emit an **domain event** consumed by:
- Tracking page
- Notifications
- Webhooks
- Finance (on DELIVERED / COD collected)
- Support (on FAILED / exceptions)

---

## Suggested build order

| Phase | Products | Why |
|-------|----------|-----|
| 1 | Core API + Admin + Merchant + Tracking | Ship and track end-to-end |
| 2 | Hub + Rider app | Field operations |
| 3 | Notifications + Support | Customer experience |
| 4 | Finance / COD | Cash and payouts |
| 5 | Route Optimization | Efficiency at scale |
| 6 | Full API / Webhook platform | Partner growth |

---

## Repo layout (recommended monorepo later)

```
quickfynd-express/
├── apps/
│   ├── web-landing/          ← this Next.js marketing site
│   ├── admin/
│   ├── merchant/
│   ├── hub/
│   ├── support/
│   ├── finance/
│   ├── track/
│   └── rider/                ← mobile
├── services/
│   ├── api-gateway/
│   ├── routing/
│   └── notify/
├── packages/
│   ├── db/
│   ├── ui/
│   └── shared-types/
└── docs/
    └── PLATFORM.md           ← this file
```

---

## This repository

Currently contains the **QuickFynd Express landing website** (Next.js) that markets the full platform. Use this `PLATFORM.md` as the product blueprint while you build each module as separate software.

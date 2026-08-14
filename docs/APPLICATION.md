# QuickFynd Logistics — Application Guide

**Brand:** QuickFynd Logistics (QuickFynd Express)  
**Legal entity:** NILAAS · GSTIN `32JWYPS4831L1Z1`  
**Repo:** this Next.js app (`I:/xpress`)  
**Related:** [API.md](./API.md) · [PLATFORM.md](./PLATFORM.md) · [SOFTWARE_STRUCTURE.md](./SOFTWARE_STRUCTURE.md) · [ORDER_FLOW.md](./ORDER_FLOW.md) · [FLUTTER_DELIVERY_APP.md](./FLUTTER_DELIVERY_APP.md)

This document describes **what is built in this repository today**: public courier booking, company dashboards, Super Admin, live tracking, and APIs. Ecommerce orders and public courier jobs use the **same delivery network**.

---

## 1. What the product is

QuickFynd Logistics is an on-demand delivery marketplace. Anyone can create an account (or book as a guest on the web) and send goods — they do **not** need to buy from QuickFynd.com.

```text
Anyone
  → Choose service (bike, auto, van, truck, parcel, movers)
  → Pickup + drop (+ optional extra stops)
  → Goods / package details
  → See nearby partners + fare
  → Quick Assign  or  choose a partner (they still must Accept)
  → Confirm booking
  → Live track to pickup, then to drop
  → Pickup OTP → Picked up
  → Delivery OTP → Delivered
  → Rating / tip
```

Two order types share one infrastructure:

| Type | How it starts | Customer sees |
|------|----------------|---------------|
| **Public courier** | `/logistics` or `POST /api/v1/logistics/book` | Same tracking page |
| **Ecommerce / company** | Website or `POST /api/v1/deliveries` | Same tracking page |

---

## 2. Who uses it

| Role | Who | Where |
|------|-----|--------|
| Public customer | Individuals, shops, sellers, restaurants, warehouses | `/logistics`, `/track/[awb]` |
| Company / merchant | QuickFynd, Nilaas, Local Mart, future orgs | `/dashboard` |
| Super Admin | Platform operators | `/super-admin` |
| Seller | Warehouse / shop desk | `/seller` |
| Delivery partner | Riders | Flutter `apps/rider_app` + `/rider` |

Anyone can book a laptop Kozhikode → Feroke without purchasing it on QuickFynd.

---

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Auth is Firebase (email + Google). Super Admin emails must match Firebase exactly (see §7). Do not commit `.env.local`. Flutter must never receive `SUPABASE_SECRET_KEY`.

---

## 4. Screens and portals

| URL | Purpose |
|-----|---------|
| `/` | Marketing site |
| `/logistics` | Customer booking wizard (core UX) |
| `/logistics/activity` | Ongoing / all bookings by mobile |
| `/book` | Redirects to `/logistics` |
| `/track/[awb]` | Live public tracking (no login) |
| `/login` | Merchant + Google login |
| `/super-admin/login` | Super Admin Google (Gmail) login |
| `/super-admin` | Network ops: live map, deliveries, riders, pricing |
| `/super-admin/bookings` | Public courier bookings |
| `/dashboard` | Company shipping desk |
| `/dashboard/logistics` | That company’s public bookings |
| `/dashboard/create` | Manual / API-style company delivery |
| `/seller` | Seller orders |
| `/register` | New merchant (needs Super Admin approval) |

---

## 5. Customer booking flow (web)

Wizard steps on `/logistics`:

1. **Service** — Bike, Cargo Auto, Mini Truck, Van, Truck, Parcel, Packers & Movers  
2. **Pickup** — area, contact, mobile, instructions  
3. **Drop** — receiver, mobile, instructions, optional extra stop  
4. **Goods** — category, packages, weight, fragile  
5. **Partners** — recommended vehicle, fare, nearby riders, **Find My Driver** (default) or **SELECT** a partner  
6. **Confirm** — breakdown, payment method (UPI / card / wallet / cash / business), CONFIRM BOOKING  

After confirm:

```text
Finding a delivery partner…
  → Partner accepts
  → Track live (/track/{AWB})
```

If a chosen partner declines or times out, the customer can **Find another partner** (`POST /api/v1/logistics/request-rider`). A specific rider is never guaranteed until they accept.

**Privacy before assignment:** first name, photo, rating, vehicle type, approximate distance, pickup ETA, completed trips. Full vehicle registration appears after accept.

Demo pickup/drop areas (Kozhikode): Kozhikode, Feroke, Mavoor Road, Palayam, Medical College.

---

## 6. Delivery lifecycle

```text
created → ready_for_pickup → searching_rider
  → rider_assigned → going_to_pickup → arrived_pickup
  → pickup OTP → picked_up → in_transit / out_for_delivery
  → rider_arriving → delivery OTP → delivered
```

Also: `cancelled`, `failed`, `returned`.

**Pickup OTP** — customer/seller shares only after handing over goods.  
**Delivery OTP** — receiver shares only after receiving the package.  
Driver app / API: `POST /api/v1/deliveries/{awb}/otp` with `{ "kind": "pickup"|"delivery", "code": "4812" }`.

Live GPS: rider app posts every few seconds to `POST /api/v1/riders/gps` (`riderId`, `lat`, `lng`, optional `heading`, `speed`, `battery`). Super Admin live map and `/track/[awb]` consume the same pings.

---

## 7. Super Admin (Gmail)

Allow-list in `src/lib/admins.ts`:

- `quickfynd.com@gmail.com`
- `rohithsagar14325@gmail.com`

**Login:** `/super-admin/login` → **Continue with Google**. Use the Gmail above. Google sign-in must be enabled in Firebase Console, and this domain must be an authorized domain.

After login: Overview, Live operations, Public bookings, Companies, All deliveries, Riders, Zones, Pricing, API.

---

## 8. Company dashboard

Merchants (after approval) use `/dashboard` to:

- Create deliveries (warehouse → customer)
- See live tracking
- Bulk / COD / billing (portal nav)
- Call the same APIs (`x-org-slug: quickfynd`)

Public courier jobs for that org appear under **Public bookings**.

---

## 9. APIs

Base: `/api/v1`  
JSON. In-memory delivery engine (`src/lib/delivery/`) unless Supabase is configured. Restarting the Next.js server resets demo data (seeded Kozhikode riders, sample AWBs).

### 9.1 Customer logistics

| Method | Path | Body / query | Result |
|--------|------|----------------|--------|
| GET | `/logistics/services` | — | Services, goods types, places, assign modes |
| POST | `/logistics/quote` | `pickup`, `drop`, `weightKg`, `goods` | Recommended vehicle + fare quotes |
| GET/POST | `/logistics/nearby` | `lat`, `lng`, `vehicle` | Counts, nearest ETA, partner cards |
| POST | `/logistics/book` | pickup/drop/goods/vehicle/`assignMode`/`preferredRiderId` | `{ awb, tracking_url, booking }` |
| POST | `/logistics/request-rider` | `awb`, `riderId` or `mode: "quick"` / `findAnother` | Re-offer |
| GET | `/logistics/book?phone=` | optional `status=active` | Customer activity |
| POST | `/logistics/rate` | `awb`, `overall` 1–5, optional `tipInr` | Rating |
| GET/POST | `/logistics/places` | `owner`, saved place | Saved addresses |

**Book example**

```http
POST /api/v1/logistics/book
Content-Type: application/json

{
  "pickup": {
    "name": "Warehouse desk",
    "phone": "9876500001",
    "line": "Kozhikode",
    "lat": 11.2588,
    "lng": 75.7804,
    "instructions": "Call at the gate"
  },
  "drop": {
    "name": "Receiver",
    "phone": "9745001100",
    "line": "Feroke",
    "lat": 11.18,
    "lng": 75.83
  },
  "goods": "Electronics",
  "weightKg": 2,
  "packages": 1,
  "fragile": true,
  "vehicle": "bike",
  "assignMode": "quick",
  "payment": { "type": "prepaid" }
}
```

`assignMode`: `"quick"` (default) or `"choose"` plus `preferredRiderId`.

**Nearby partner card (no phone):** `id`, `firstName`, `rating`, `vehicle`, `distanceKm`, `pickupEtaMin`, `completedTrips`.

### 9.2 Company / ecommerce

| Method | Path | Notes |
|--------|------|--------|
| POST | `/deliveries` | Create job. Headers: `x-org-slug` or `x-org-id` |
| GET | `/deliveries` | Filter `company`, `status`, `source`, `q` |
| POST | `/deliveries/{awb}/dispatch` | Offer next ranked rider |
| POST | `/deliveries/{awb}/accept` | `{ "riderId", "accept": true\|false }` |
| POST | `/deliveries/{awb}/status` | Advance status |
| POST | `/deliveries/{awb}/otp` | Pickup / delivery OTP |
| POST | `/quote` | Simple price |
| POST | `/public/book` | Legacy one-shot public book (same engine) |
| POST | `/shipments` | Ecommerce-style create (see ORDER_FLOW.md) |

### 9.3 Ops, track, riders

| Method | Path | Notes |
|--------|------|--------|
| GET | `/track/{awb}` | Public tracking JSON |
| GET | `/ops/live` | Super Admin live board + map |
| GET/POST | `/riders` | List / set online |
| POST | `/riders/gps` | Live location ping |
| GET | `/stats` | Dashboard aggregates |
| GET | `/zones` | Service zones |
| GET | `/pricing` | Rate rules |
| GET | `/health` | App health |

---

## 10. Fare (demo engine)

From `src/lib/delivery/engine.ts` (Kozhikode defaults):

- Base + per-km + weight + vehicle factor + optional express / COD  
- Response includes `base`, `distance`, `platformFee`, `total`, `distanceKm`, `riderEarning`

Not a production rate card. Super Admin **Pricing** is the place to change rules later.

---

## 11. Dispatch

Scoring uses distance, rating, workload, vehicle match, availability, completion/acceptance.

**Quick Assign** — offer the top ranked online rider (~30s window). Decline/timeout → next rider.

**Choose partner** — offer that rider first. If they decline: customer is told they are unavailable and can find another.

Do not treat SELECT as a confirmed booking until Accept.

---

## 12. Code map

```text
src/lib/delivery/          Engine: types, pricing, dispatch, catalog, in-memory store
src/app/logistics/         Customer wizard + activity
src/app/track/             Public live tracking UI
src/app/super-admin/       Super Admin portal
src/app/dashboard/         Company portal
src/app/api/v1/            HTTP APIs
src/lib/admins.ts          Super Admin email allow-list
apps/rider_app/            Flutter delivery-partner app
docs/                      This file and related specs
```

---

## 13. Demo data (after server start)

Seeded companies include QuickFynd, Nilaas, Local Mart. Sample riders around Kozhikode (example: Ahamed `RIDER102`, bike). Sample AWBs such as `QFD12345601`. Use these to test accept/OTP/track without creating a booking first.

---

## 14. Flutter rider app

Field app for partners: online/offline, accept/decline, navigation, OTP, COD, GPS. Spec: [FLUTTER_DELIVERY_APP.md](./FLUTTER_DELIVERY_APP.md). Local-only keys: `docs/FLUTTER_DEVELOPER_HANDOFF.md` (gitignored).

A **customer** Flutter app is not in this repo yet; the web wizard at `/logistics` is the customer experience. The same `/api/v1/logistics/*` endpoints are what a future customer app should call.

---

## 15. Current limits

- Delivery state is **in-memory** unless you persist to Postgres/Supabase.  
- Public booking does not yet run full mobile OTP registration (web collects name/phone on the job).  
- Business GST, bulk CSV, staff accounts, and production wallets are portal placeholders / partial.  
- Maps: Google Maps if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set; otherwise Leaflet fallback.

---

## 16. Quick test checklist

1. `npm run dev`  
2. Open `/logistics` → book Kozhikode → Feroke → Confirm  
3. Copy AWB → `/track/{AWB}`  
4. Super Admin: `/super-admin/login` with `quickfynd.com@gmail.com` → Live operations + Public bookings  
5. Company: `/dashboard/logistics`  
6. Optional: `POST /api/v1/deliveries/{awb}/accept` with `{ "riderId": "RIDER102" }` then OTP

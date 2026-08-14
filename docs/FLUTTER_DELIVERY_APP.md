# QuickFynd Delivery — Flutter Rider App (Detailed)

**App name:** QuickFynd Rider  
**Package:** `apps/rider_app` (`quickfynd_rider`)  
**Platforms:** Android and iOS  
**Brand:** QuickFynd Delivery · **Licence:** Nilaas (GSTIN `32JWYPS4831L1Z1`)  
**Backend:** Next.js APIs in this repo  
**Related portals:** Super Admin `/super-admin`, Company `/dashboard`, Seller `/seller`, Public track `/track/[awb]`

Product spec (no secrets): [FLUTTER_DELIVERY_APP.md](./FLUTTER_DELIVERY_APP.md)

**Private keys for the Flutter developer** (local file, not in git): `docs/FLUTTER_DEVELOPER_HANDOFF.md`

---

## 1. Purpose

The Flutter app is the field tool for delivery partners (riders). It is not a customer shopping app.

A rider uses it to:

1. Go **online** and become available for jobs
2. Receive a **new delivery request** (push + sound + full-screen alert)
3. **Accept** or **decline** within a short window (default 30 seconds)
4. Navigate to **pickup**, verify the package (OTP / QR / scan)
5. Navigate to the **customer**, collect COD if needed, verify delivery OTP
6. Capture **proof of delivery** (photo, signature, GPS, time)
7. Report a **failed attempt** with a reason
8. See **earnings, wallet, COD outstanding**, and daily settlement
9. Send **live GPS** so customers and Super Admin can track the rider

The same rider network serves:

- QuickFynd ecommerce orders
- Other company API orders (example: Nilaas)
- Manual company bookings
- Public courier bookings from `/logistics`

---

## 2. How the app fits the platform

```text
Flutter Rider App
        │
        │  HTTPS + Bearer token
        ▼
Next.js API  (/api/rider/*  and  /api/v1/deliveries, /api/v1/riders)
        │
        ├── Delivery engine   src/lib/delivery/
        ├── Super Admin live map
        ├── Company dashboard
        └── Customer tracking page  /track/{AWB}
```

When a seller marks **Ready for pickup** (or a public customer confirms a booking):

```text
Ready for pickup
      ↓
Dispatch engine scores nearby online riders
      ↓
Nearest suitable rider gets an offer (30 seconds)
      ↓
Accept  →  RIDER ASSIGNED  →  GO TO PICKUP
Decline / timeout  →  next rider in the ranked list
```

Customer tracking starts after pickup. The rider app must keep sending GPS while a job is active.

---

## 3. Repository map

```text
apps/rider_app/
├── pubspec.yaml
├── README.md
└── lib/
    ├── main.dart                 Auth gate, theme, token persist
    ├── config.dart               API_BASE (emulator / device)
    ├── api.dart                  HTTP client for all rider APIs
    └── screens/
        ├── login_screen.dart
        ├── home_shell.dart       Bottom tabs + first GPS ping
        ├── attendance_screen.dart
        ├── pickups_screen.dart
        ├── deliveries_screen.dart
        ├── scan_screen.dart
        ├── task_actions_screen.dart
        └── settlement_screen.dart
```

**Dependencies (current):** `http`, `shared_preferences`, `url_launcher`, `geolocator`, `mobile_scanner`, `image_picker`.

---

## 4. Run the app

### Backend first

From the repo root:

```bash
npm install
npm run dev
```

API default: `http://localhost:3000`.

### Flutter

```bash
cd apps/rider_app
flutter pub get
flutter run
```

### API base URL

Set in `lib/config.dart` via `--dart-define=API_BASE=...`.

| Device | Base URL |
|---|---|
| Android emulator | `http://10.0.2.2:3000` (default) |
| iOS simulator | `http://localhost:3000` |
| Physical phone | `http://<your-PC-LAN-IP>:3000` |

```bash
flutter run --dart-define=API_BASE=http://192.168.1.10:3000
```

The phone and the PC must be on the same Wi-Fi. Windows firewall must allow port 3000.

### Demo login (current `/api/rider` store)

| Field | Value |
|---|---|
| Email | `rider@quickfynd.com` |
| Password | `rider123` |

The delivery engine also seeds field riders (`RIDER102` Ahamed, `RIDER103` Fathima, and others) for dashboard / dispatch demos. The Flutter login should be wired to those rider IDs when the delivery engine is the source of truth.

---

## 5. Current navigation (built)

```text
Login
  ↓
Home (bottom tabs)
  ├── Duty        attendance, profile, check-in / check-out
  ├── Pickups     assigned pickup list
  ├── Deliver     assigned delivery list
  ├── Scan        AWB / barcode
  └── Settle      daily COD handover
        ↓
   Task detail
     ├── Call seller / customer
     ├── Open Google Maps navigation
     ├── Send / verify OTP
     ├── Photo + signature POD
     ├── Collect COD
     └── Failed delivery
```

Token is stored in `SharedPreferences` under `token`. Logout clears it.

---

## 6. Target navigation (full product)

The finished delivery app should use this main menu (from the platform spec):

```text
HOME
DELIVERIES
EARNINGS
MAP
NOTIFICATIONS
SUPPORT
PROFILE
```

| Tab | What it shows |
|---|---|
| **Home** | Online/offline, today’s earnings, today’s deliveries, active jobs, acceptance rate, rating, large **GO ONLINE** button |
| **Deliveries** | Incoming offer, go-to-pickup, go-to-drop, multi-stop route |
| **Earnings** | Today / week / pending settlement / available balance, wallet ledger |
| **Map** | Rider position, pickup pin, customer pin, remaining km, ETA |
| **Notifications** | New job, approaching customer, settlement, SOS ack |
| **Support** | Ticket to ops, call hub |
| **Profile** | Photo, vehicle, documents, bank, duty status |

---

## 7. Screen-by-screen (current + required)

### 7.1 Login

**File:** `lib/screens/login_screen.dart`  
**API:** `POST /api/rider/auth/login`

```json
{ "email": "rider@quickfynd.com", "password": "rider123" }
```

Success returns `{ ok, token, rider }`. The token is sent as:

```http
Authorization: Bearer <token>
```

**Still required for production**

- Mobile + OTP login (not only email)
- Rider registration: photo, address, ID, licence, vehicle, bank
- Admin approval before the rider can go online
- Block suspended riders

### 7.2 Home / Duty

**File:** `lib/screens/attendance_screen.dart`  
**APIs:** `GET /api/rider/me`, `POST /api/rider/attendance/check-in`, `POST /api/rider/attendance/check-out`

Shows name, hub, vehicle, today’s in/out, open pickup/delivery counts.

**Required Home KPIs**

```text
ONLINE / OFFLINE
Today's earnings          ₹1,250
Today's deliveries        18
Active deliveries         2
Acceptance rate           94%
Rating                    4.8
```

**GO ONLINE** must call the delivery engine so dispatch can offer jobs:

```http
POST /api/v1/riders
{ "riderId": "RIDER102", "online": true }
```

Duty states the backend already models:

`available` · `busy` · `pickup` · `delivering` · `break` · `offline`

Only **online + available** riders should receive new offers.

### 7.3 New delivery alert (required)

When dispatch offers a job, the app must interrupt the rider:

- Push notification
- Sound + vibration
- Full-screen overlay with a countdown (default **30 seconds**)

```text
NEW DELIVERY REQUEST

Pickup:        QuickFynd Warehouse, Kozhikode
Pickup distance: 1.2 KM
Drop:          Mavoor Road
Delivery distance: 7.5 KM
Package:       1 package · Laptop · Fragile
Expected earnings: ₹65
Expected duration: 22 min

[ ACCEPT ]     [ DECLINE ]
```

**APIs**

```http
POST /api/v1/deliveries/{awb}/accept
{ "riderId": "RIDER102" }

POST /api/v1/deliveries/{awb}/accept
{ "riderId": "RIDER102", "decline": true }
```

If the rider does not answer, the engine offers the next scored rider.

Scoring (already on the server):

```text
Score = Distance + Availability + Workload + Vehicle + Performance
```

A nearby rider with 4 active jobs can lose to a slightly farther idle rider.

### 7.4 Pickups list

**File:** `lib/screens/pickups_screen.dart`  
**API:** `GET /api/rider/pickups`

Each row: merchant name, AWB, address, status.  
Tap → task actions. Long-press → Google Maps.

**After accept, this screen should become “GO TO PICKUP”** with:

- Map: rider → pickup
- Distance and ETA
- Seller phone
- Pickup instructions
- Button: **ARRIVED AT PICKUP**

### 7.5 Deliveries list

**File:** `lib/screens/deliveries_screen.dart`  
**API:** `GET /api/rider/deliveries`

Each row: customer name, AWB, address, COD amount, status, navigate icon.

**After pickup, this screen should become “GO TO DROP”** with remaining km, ETA, and “stops before this customer” for batch routes.

### 7.6 Task actions (pickup + delivery)

**File:** `lib/screens/task_actions_screen.dart`

| Action | API | Notes |
|---|---|---|
| Call | `GET /api/rider/tasks/:id/customer` | Opens `tel:` |
| Navigation | `GET /api/rider/tasks/:id/navigation` | Opens Google Maps URL |
| Send OTP | `POST /api/rider/otp/send` | Demo OTP may be returned |
| Verify OTP | `POST /api/rider/otp/verify` | Marks pickup or delivery verified |
| POD | `POST /api/rider/pod` | Photo + signature URLs |
| COD | `POST /api/rider/cod/collect` | Cash or UPI |
| Failed | `POST /api/rider/delivery/failed` | Reason + notes |

**Delivery-engine equivalents (use these going forward)**

```http
POST /api/v1/deliveries/{awb}/otp
{ "kind": "pickup" }                    // send
{ "kind": "pickup", "code": "5682" }    // verify → PICKED UP

POST /api/v1/deliveries/{awb}/otp
{ "kind": "delivery", "code": "7231" }  // verify → DELIVERED

POST /api/v1/deliveries/{awb}/status
{ "status": "arrived_pickup" }

POST /api/v1/deliveries/{awb}/status
{ "status": "failed", "failReason": "Customer unavailable" }
```

### 7.7 Scan / barcode

**File:** `lib/screens/scan_screen.dart`  
**API:** `POST /api/rider/scan` `{ "awb": "QFD12345601" }`

`mobile_scanner` is already a dependency. Wire the camera to the same `scan()` call. Use scan for:

- Pickup package confirmation
- Hub inbound (if the rider also does hub handoff)
- Delivery package check before OTP

### 7.8 Settlement / earnings

**File:** `lib/screens/settlement_screen.dart`  
**APIs:** `GET /api/rider/settlement`, `POST /api/rider/settlement` `{ "cashHanded": 3200 }`

**Required wallet view**

```text
Balance
Delivery earnings
Bonuses / tips
COD collected
Platform charges
Penalties
Withdraw / payout history
```

Example split the engine already calculates:

```text
Customer charge   ₹150
Platform fee      ₹30
Rider earning     ₹120
```

---

## 8. Full job lifecycle the app must follow

```text
OFFLINE
  ↓  GO ONLINE
AVAILABLE
  ↓  offer arrives
SEARCHING / OFFERED          (30s timer)
  ↓  ACCEPT
RIDER ASSIGNED
  ↓
GOING TO PICKUP
  ↓  ARRIVED AT PICKUP
ARRIVED PICKUP               (seller notified)
  ↓  Pickup OTP / QR / scan
PICKUP VERIFIED → PICKED UP
  ↓
IN TRANSIT / OUT FOR DELIVERY
  ↓  500 m geofence (server can set rider_arriving)
RIDER ARRIVING               (customer SMS: rider is close)
  ↓  ARRIVED
ARRIVED
  ↓  Delivery OTP + POD + COD
DELIVERED
  ↓
Earnings posted · COD ledger updated · rider returns to AVAILABLE
```

**Failed attempt reasons the app must list**

- Customer unavailable
- Customer phone unreachable
- Wrong address
- Customer rejected order
- COD unavailable
- Location inaccessible
- Damaged package
- Customer requested reschedule

Ops then chooses: retry, return to seller, schedule tomorrow, or cancel.

---

## 9. Live GPS (critical)

**Current:** one ping when Home opens (`home_shell.dart` → `Geolocator.getCurrentPosition` → `POST /api/rider/gps`).

**Required:** while a delivery is active, send a ping every **5–10 seconds**.

```json
{
  "riderId": "RIDER102",
  "latitude": 11.2588,
  "longitude": 75.7804,
  "speed": 32,
  "heading": 140,
  "battery": 67,
  "timestamp": "2026-08-14T10:20:00"
}
```

Use:

```http
POST /api/rider/gps
{ "lat": 11.2588, "lng": 75.7804, "accuracy": 8 }

POST /api/v1/riders/gps
{
  "riderId": "RIDER102",
  "latitude": 11.2588,
  "longitude": 75.7804,
  "speed": 32,
  "heading": 140,
  "battery": 67
}
```

The delivery engine updates the rider pin and, inside 500 m of the drop, sets status **rider arriving**. That is what the public page `/track/{AWB}` and Super Admin live map read.

**Implementation notes**

- Request location **always** (or “while in use” + background) on Android/iOS
- Pause high-frequency pings when offline and idle (save battery)
- Include battery % so ops can see a dying phone
- Do not write every ping to Postgres; Redis / in-memory is enough for live, with occasional history samples

---

## 10. Pickup and delivery verification

### Pickup

1. Rider taps **Arrived at pickup**
2. Seller sees “Rider has arrived”
3. Rider enters **Pickup OTP** (example `5682`) and/or scans QR / barcode
4. Optional proof: package photo, seller signature, GPS, timestamp
5. Status becomes **PICKED UP** — customer tracking link becomes useful

### Delivery

1. Rider taps **Arrived**
2. Customer receives OTP (example `7231`)
3. Rider enters OTP
4. Optional: customer signature, package photo
5. If COD: collect cash/UPI and post the amount
6. Status becomes **DELIVERED**

Proof record should store: OTP result, GPS, time, receiver name, photo, signature.

---

## 11. Current rider API reference

Base: `{API_BASE}`  
Auth: `Authorization: Bearer <token>` on all routes except login.

| Feature | Method | Path | Body / notes |
|---|---|---|---|
| Login | POST | `/api/rider/auth/login` | `email`, `password` |
| Profile + today | GET | `/api/rider/me` | rider, attendance, last GPS, open counts |
| Check in | POST | `/api/rider/attendance/check-in` | — |
| Check out | POST | `/api/rider/attendance/check-out` | — |
| Pickups | GET | `/api/rider/pickups` | `{ pickups: [...] }` |
| Deliveries | GET | `/api/rider/deliveries` | `{ deliveries: [...] }` |
| Scan | POST | `/api/rider/scan` | `{ awb }` |
| Navigation | GET | `/api/rider/tasks/:id/navigation` | `{ mapsUrl, lat, lng }` |
| Customer call | GET | `/api/rider/tasks/:id/customer` | `{ telUrl, phone, name }` |
| GPS | POST | `/api/rider/gps` | `{ lat, lng, accuracy }` |
| Send OTP | POST | `/api/rider/otp/send` | `{ taskId }` |
| Verify OTP | POST | `/api/rider/otp/verify` | `{ taskId, otp }` |
| POD | POST | `/api/rider/pod` | `{ taskId, photoUrl, signatureUrl, otpVerified }` |
| COD | POST | `/api/rider/cod/collect` | `{ taskId, amount, method: cash\|upi }` |
| Failed | POST | `/api/rider/delivery/failed` | `{ taskId, reason, notes }` |
| Settlement | GET | `/api/rider/settlement` | today’s totals |
| Submit settlement | POST | `/api/rider/settlement` | `{ cashHanded }` |

Typical pickup task JSON:

```json
{
  "id": "pk_...",
  "awb": "QFD12345602",
  "merchantName": "Coastal Electronics",
  "address": "SM Street, Palayam",
  "phone": "9876500002",
  "lat": 11.251,
  "lng": 75.778,
  "status": "assigned",
  "riderId": "RIDER106"
}
```

Typical delivery task JSON:

```json
{
  "id": "dl_...",
  "awb": "QFD12345601",
  "customerName": "Ahamed",
  "address": "Mavoor Road, Kozhikode",
  "phone": "9999999999",
  "lat": 11.2655,
  "lng": 75.79,
  "status": "assigned",
  "codAmount": 1499,
  "otpRequired": true,
  "riderId": "RIDER104"
}
```

---

## 12. Delivery-engine APIs the Flutter app should adopt

These power Super Admin live ops, company dashboards, and `/track/{awb}`. The Flutter client should migrate job lifecycle onto them so one engine owns status.

| Feature | Method | Path |
|---|---|---|
| List jobs | GET | `/api/v1/deliveries?status=active` |
| Job + rider + ETA | GET | `/api/v1/deliveries/{awb}` |
| Start / refresh offer | POST | `/api/v1/deliveries/{awb}/dispatch` |
| Accept / decline | POST | `/api/v1/deliveries/{awb}/accept` |
| Advance or fail | POST | `/api/v1/deliveries/{awb}/status` |
| Send / verify OTP | POST | `/api/v1/deliveries/{awb}/otp` |
| Go online / offline | POST | `/api/v1/riders` |
| High-rate GPS | POST | `/api/v1/riders/gps` |
| Public track (debug) | GET | `/api/v1/track/{awb}` |

Accept response assigns the rider and moves status to **going_to_pickup**.

OTP pickup success moves: `pickup_verified` → `picked_up` → `in_transit`.  
OTP delivery success moves: `otp_verified` → `delivered` and posts rider earning.

---

## 13. Suggested Dart models

Keep API JSON out of widgets. Add `lib/models/`:

```dart
class RiderProfile {
  final String id;
  final String firstName;
  final String vehicle;
  final String vehicleReg;
  final bool online;
  final String duty;
  final double rating;
  final int acceptanceRate;
  final int todayEarnings;
  final int todayDeliveries;
}

class DeliveryJob {
  final String id;
  final String awb;
  final String status;
  final Address pickup;
  final Address drop;
  final double earnings;
  final double distanceKm;
  final int? etaMinutes;
  final int codAmount;
  final String? pickupOtpHint; // never show real OTP in production UI
  final int stopsBefore;
}
```

`lib/api.dart` already centralizes HTTP. Extend it with `acceptJob`, `goOnline`, `pingGpsV1`, `verifyDeliveryOtp` rather than calling `http` from screens.

---

## 14. Permissions

| Permission | Why |
|---|---|
| Location (precise) | Dispatch distance, live map, geofence |
| Location (background) | GPS every 5–10s during an active job |
| Camera | Barcode / QR, POD photo |
| Notifications | New job alert, approaching customer |
| Phone | Call seller / customer |
| Vibration | Incoming job |

Android: `ACCESS_FINE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `CAMERA`, `POST_NOTIFICATIONS`, `CALL_PHONE`.  
iOS: `NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`, `NSCameraUsageDescription`.

---

## 15. Safety and fraud

**SOS (required)**  
One emergency button. POST rider id, live lat/lng, current AWB, phone, vehicle to Super Admin. Ops must see it immediately on `/super-admin/live`.

**Fraud signals the backend can flag from app data**

- Impossible GPS jumps (fake GPS)
- OTP failed many times
- Arrived far from the drop pin
- Repeated cancellations
- COD collected ≠ expected

The app should send real GPS from the device, not a mocked location, in production builds.

---

## 16. What ops and customers see from this app

| Action in Flutter | Who sees it |
|---|---|
| GO ONLINE | Super Admin live map (green pin) |
| Accept job | Company dashboard + customer “Rider assigned” |
| GPS ping | `/track/{AWB}` map + `/super-admin/live` |
| Pickup OTP | Status **Picked up**, customer SMS |
| Enter 500 m | Customer “rider is arriving” |
| Delivery OTP | **Delivered**, COD + earnings |
| Failed reason | Super Admin / company exception queue |
| Settlement submit | Finance / COD settlement |

Try a live customer view with seeded AWB: `/track/QFD12345601`.

---

## 17. Build status

| Area | Status |
|---|---|
| Login + token persist | Built |
| Check-in / check-out | Built |
| Pickup & delivery lists | Built |
| Call + Maps navigation | Built |
| OTP send / verify | Built (demo OTP) |
| POD + COD + fail | Built (demo photo URLs) |
| Manual AWB scan | Built |
| Daily settlement | Built |
| One-shot GPS on home | Built |
| GO ONLINE for dispatch | Use `/api/v1/riders` — wire next |
| Full-screen 30s job offer | Not built yet |
| 5–10s GPS loop | Not built yet |
| Camera barcode | Dependency present, UI is text field |
| Wallet / earnings tab | Partial (settlement only) |
| SOS | Not built yet |
| Push notifications | Not built yet |
| Rider registration + KYC | Not built yet |

---

## 18. Recommended next Flutter work (order)

1. Poll or websocket for **open offers** while online; show 30s accept/decline
2. Call `/api/v1/deliveries/{awb}/accept` and then show **Go to pickup**
3. Timer: GPS every 8 seconds on active jobs via `/api/v1/riders/gps`
4. Pickup OTP + delivery OTP against `/api/v1/deliveries/{awb}/otp`
5. Home KPIs from delivery-engine rider object (`todayEarnings`, `rating`, …)
6. Camera scan with `mobile_scanner`
7. FCM / APNs for new-job push
8. SOS + document upload for onboarding

---

## 19. Related documents

| Doc | Contents |
|---|---|
| [RIDER_APP.md](./RIDER_APP.md) | Short API ↔ screen table |
| [ORDER_FLOW.md](./ORDER_FLOW.md) | Website → AWB → webhook |
| [PLATFORM.md](./PLATFORM.md) | All ten platform modules |
| [SOFTWARE_STRUCTURE.md](./SOFTWARE_STRUCTURE.md) | Portal URL map |
| Company create delivery | `/dashboard/create` |
| Public book | `/book` |
| Super Admin live | `/super-admin/live` |

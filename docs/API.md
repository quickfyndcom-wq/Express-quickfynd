# QuickFynd Express — Complete API document

**Share this file:** [docs/API.md](https://github.com/quickfyndcom-wq/Express-quickfynd/blob/main/docs/API.md)  
**Live page:** https://express-quickfynd-iawj.vercel.app/developers  
**Live app:** https://express-quickfynd-iawj.vercel.app  
**API base:** `https://express-quickfynd-iawj.vercel.app`

Brand: **QuickFynd Express** · Legal: **NILAAS** · GSTIN `32JWYPS4831L1Z1`

JSON, `Content-Type: application/json`. Demo routes do not require an API key.  
Delivery jobs live **in memory** (a new Vercel instance can reset data).

Local: `http://localhost:3000` (same paths).

---

## Customer app home (choose vehicle + scooter available?)

This matches the mobile home: pickup bar, tiles **Trucks / 2 Wheeler / Packers & Movers / Car**, then check if a scooter/bike partner is nearby.

```text
Open app
   ↓
GET /api/v1/logistics/home?lat=&lng=
   ↓
Show pickup + 4 tiles
   ↓
User taps 2 Wheeler
   ↓
GET /api/v1/logistics/nearby?vehicle=scooter
   ↓
scooter.available = true?  →  enter drop → quote → book
                 = false?  →  “No scooter partner nearby”
```

### GET `/api/v1/logistics/home`

```bash
curl "https://express-quickfynd-iawj.vercel.app/api/v1/logistics/home?lat=11.2588&lng=75.7804"
```

Returns:

- `pickup` — label, lat, lng  
- `banner` — Packers & Movers promo  
- `services[]` — each tile: `available`, `partnersNearby`, `nearestEtaMin`, `subtitle`  
- `scooter` — `{ available, partnersNearby, nearestEtaMin, message }`  
- `flow` — next API steps  

`two_wheeler` uses **bike + scooter**. If `scooter.available` is true, a 2-wheeler delivery guy is nearby.

Then:

1. Drop location (app UI)  
2. `POST /api/v1/logistics/quote`  
3. `POST /api/v1/logistics/book` with `"vehicle": "scooter"` and `"assignMode": "quick"`  
4. `GET /api/v1/track/{awb}`  

To list the actual riders (first name, rating, ETA — no phone):

```bash
curl -X POST https://express-quickfynd-iawj.vercel.app/api/v1/logistics/nearby \
  -H "Content-Type: application/json" \
  -d "{\"lat\":11.2588,\"lng\":75.7804,\"vehicle\":\"scooter\"}"
```

---

## Index — every endpoint

### A. Health

| Method | Path |
|--------|------|
| GET | `/api/v1/health` |
| GET | `/api/v1/supabase/health` |

### B. Customer logistics (public courier)

| Method | Path |
|--------|------|
| GET | `/api/v1/logistics/home` |
| GET | `/api/v1/logistics/services` |
| POST | `/api/v1/logistics/quote` |
| GET | `/api/v1/logistics/nearby` |
| POST | `/api/v1/logistics/nearby` |
| GET | `/api/v1/logistics/book` |
| POST | `/api/v1/logistics/book` |
| POST | `/api/v1/logistics/request-rider` |
| POST | `/api/v1/logistics/rate` |
| GET | `/api/v1/logistics/places` |
| POST | `/api/v1/logistics/places` |
| POST | `/api/v1/public/book` |
| POST | `/api/v1/quote` |
| GET | `/api/v1/track/{awb}` |

### C. Company deliveries

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/v1/deliveries` | `?company=&status=&source=&q=&seller=` |
| POST | `/api/v1/deliveries` | Header `x-org-slug` or `x-org-id` |
| GET | `/api/v1/deliveries/{id}` | id or AWB |
| DELETE | `/api/v1/deliveries/{id}` | |
| POST | `/api/v1/deliveries/{id}/dispatch` | Offer next rider |
| POST | `/api/v1/deliveries/{id}/accept` | Accept or decline |
| POST | `/api/v1/deliveries/{id}/status` | Advance status |
| POST | `/api/v1/deliveries/{id}/otp` | Pickup / delivery OTP |

### D. Shipments (ecommerce alias)

| Method | Path |
|--------|------|
| GET | `/api/v1/shipments` |
| POST | `/api/v1/shipments` |
| GET | `/api/v1/shipments/{awb}` |
| POST | `/api/v1/shipments/{awb}/status` |

### E. Ops, riders, network

| Method | Path |
|--------|------|
| GET | `/api/v1/ops/live` |
| GET | `/api/v1/stats` |
| GET | `/api/v1/riders` |
| POST | `/api/v1/riders` |
| DELETE | `/api/v1/riders?id=` |
| POST | `/api/v1/riders/gps` |
| GET | `/api/v1/zones` |
| DELETE | `/api/v1/zones?id=` |
| GET | `/api/v1/sellers` |
| GET | `/api/v1/pricing` |
| GET | `/api/admin/ops` |

### F. Companies (orgs)

| Method | Path |
|--------|------|
| GET | `/api/v1/orgs` |
| GET | `/api/v1/orgs?email=` |
| POST | `/api/v1/orgs` |
| GET | `/api/v1/orgs/{id}` |
| PATCH | `/api/v1/orgs/{id}` |
| DELETE | `/api/v1/orgs/{id}` |
| GET | `/api/v1/organizations` |

### G. Records & webhooks

| Method | Path |
|--------|------|
| DELETE | `/api/v1/records?type=&id=` |
| GET | `/api/v1/webhooks/demo` |
| POST | `/api/v1/webhooks/demo` |

### H. Rider mobile app

Header after login: `Authorization: Bearer {token}`

| Method | Path |
|--------|------|
| POST | `/api/rider/auth/login` |
| GET | `/api/rider/me` |
| POST | `/api/rider/attendance/check-in` |
| POST | `/api/rider/attendance/check-out` |
| GET | `/api/rider/pickups` |
| GET | `/api/rider/deliveries` |
| POST | `/api/rider/scan` |
| GET | `/api/rider/gps` |
| POST | `/api/rider/gps` |
| POST | `/api/rider/otp/send` |
| POST | `/api/rider/otp/verify` |
| POST | `/api/rider/pod` |
| POST | `/api/rider/cod/collect` |
| POST | `/api/rider/delivery/failed` |
| GET | `/api/rider/settlement` |
| POST | `/api/rider/settlement` |
| GET | `/api/rider/tasks/{id}/navigation` |
| GET | `/api/rider/tasks/{id}/customer` |

---

## 1. Health

```bash
curl https://express-quickfynd-iawj.vercel.app/api/v1/health
```

---

## 2. Customer logistics

### GET `/api/v1/logistics/services`

Services, goods types, Kozhikode places, assign modes (`quick` / `choose`).

### POST `/api/v1/logistics/quote`

```json
{
  "pickup": { "lat": 11.2588, "lng": 75.7804 },
  "drop": { "lat": 11.18, "lng": 75.83 },
  "weightKg": 2,
  "goods": "Electronics"
}
```

Returns recommended vehicle and fare quotes.

### GET or POST `/api/v1/logistics/nearby`

Query: `?lat=&lng=&vehicle=`  
Body: `{ "lat": 11.2588, "lng": 75.7804, "vehicle": "bike" }`

Partner cards: first name, rating, vehicle, km, pickup ETA, trips. **No phone.**

### POST `/api/v1/logistics/book`

```json
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

`assignMode`: `quick` or `choose` + `preferredRiderId`.  
Response: `{ ok, awb, tracking_url, booking }`.

### GET `/api/v1/logistics/book?phone=&status=&q=`

`status=active` for ongoing.

### POST `/api/v1/logistics/request-rider`

```json
{ "awb": "QFD12345601", "mode": "quick", "findAnother": true }
```

or `{ "awb": "...", "riderId": "RIDER102" }`

### POST `/api/v1/logistics/rate`

```json
{ "awb": "QFD12345601", "overall": 5, "partner": 5, "speed": 4, "handling": 5, "behaviour": 5, "tipInr": 20 }
```

### Saved places

`GET /api/v1/logistics/places?owner=`  
`POST` `{ "owner", "label", "line", "city", "lat", "lng", "pincode" }`

### POST `/api/v1/public/book`

Same as logistics book (legacy).

### POST `/api/v1/quote`

Simple price only.

### GET `/api/v1/track/{awb}`

Public tracking JSON. Page: `/track/{awb}`.

---

## 3. Company deliveries

Headers: `x-org-slug: quickfynd` or `x-org-id`.

### POST `/api/v1/deliveries`

```json
{
  "companyId": "quickfynd",
  "orderId": "QF-ORD-1001",
  "pickup": {
    "name": "QuickFynd Warehouse",
    "phone": "9876500001",
    "address": "QuickFynd Warehouse, Kozhikode",
    "lat": 11.2588,
    "lng": 75.7804
  },
  "customer": {
    "name": "Anjali",
    "phone": "9900112233",
    "address": "Mavoor Road, Kozhikode",
    "lat": 11.2655,
    "lng": 75.79
  },
  "package": { "type": "parcel", "weightKg": 1 },
  "payment": { "type": "cod", "amount": 499 }
}
```

### POST `/api/v1/deliveries/{awb}/dispatch`

Empty body. Offers the next ranked rider.

### POST `/api/v1/deliveries/{awb}/accept`

```json
{ "riderId": "RIDER102", "accept": true }
```

`accept: false` or `decline: true` to refuse.

### POST `/api/v1/deliveries/{awb}/status`

```json
{ "status": "picked_up", "note": "Loaded" }
```

Statuses include: `ready_for_pickup`, `searching_rider`, `rider_assigned`, `going_to_pickup`, `picked_up`, `out_for_delivery`, `delivered`, `cancelled`, `failed`.

### POST `/api/v1/deliveries/{awb}/otp`

```json
{ "kind": "pickup", "code": "4812" }
```

`kind`: `pickup` | `delivery`. Omit `code` to generate/send.

`POST /api/v1/shipments` is the same create flow for ecommerce sites.

---

## 4. Live ops and GPS

```bash
curl https://express-quickfynd-iawj.vercel.app/api/v1/ops/live
curl https://express-quickfynd-iawj.vercel.app/api/v1/riders?online=1
```

### POST `/api/v1/riders/gps`

```json
{
  "riderId": "RIDER102",
  "lat": 11.2588,
  "lng": 75.7804,
  "heading": 140,
  "speed": 28,
  "battery": 80
}
```

### POST `/api/v1/riders`

```json
{ "riderId": "RIDER102", "online": true }
```

---

## 5. Rider app

### POST `/api/rider/auth/login`

```json
{ "email": "rider@quickfynd.com", "password": "rider123" }
```

Returns `{ token, rider }`. Use `Authorization: Bearer {token}`.

| Call | Body |
|------|------|
| POST scan | `{ "awb": "QFD12345601" }` |
| POST gps | `{ "lat", "lng", "heading", "speed" }` |
| POST otp/send | `{ "taskId" }` |
| POST otp/verify | `{ "taskId", "otp" }` |
| POST pod | `{ "taskId", "photoUrl", "otpVerified": true }` |
| POST cod/collect | `{ "taskId", "amount" }` |
| POST delivery/failed | `{ "taskId", "reason" }` |

---

## 6. Orgs

`GET /api/v1/orgs?email=` — find company by contact email.  
`POST /api/v1/orgs` — register (pending until Super Admin approves).  
`PATCH /api/v1/orgs/{id}` — approve / update (`status`: `pending` \| `active` \| `suspended`).

---

## 7. Delete records

```http
DELETE /api/v1/records?type=delivery&id=QFD12345601
```

`type`: `delivery` | `company` | `rider` | `zone` | `ticket`

---

## 8. Demo data

Riders include `RIDER102` (Ahamed, bike). Sample AWB `QFD12345601`. Companies: QuickFynd, Nilaas, Local Mart.

---

## 9. Web login (not REST)

Firebase Google / email on `/login`. Super Admin: `quickfynd.com@gmail.com`.  
Never put `SUPABASE_SECRET_KEY` in Flutter or this document.

# QuickFynd Express — API (share this)

**Live app:** [https://express-quickfynd-iawj.vercel.app](https://express-quickfynd-iawj.vercel.app)  
**API base:** `https://express-quickfynd-iawj.vercel.app/api`  
**Brand:** QuickFynd Express · **Legal:** NILAAS · GSTIN `32JWYPS4831L1Z1`

JSON over HTTPS. No API key required for these demo routes.  
**Note:** delivery data is in-memory on the server. A Vercel restart or a different serverless instance can reset demo jobs.

Public docs page: [https://express-quickfynd-iawj.vercel.app/developers](https://express-quickfynd-iawj.vercel.app/developers)

---

## 1. Product URLs

| Page | URL |
|------|-----|
| Home | https://express-quickfynd-iawj.vercel.app/ |
| Book courier | https://express-quickfynd-iawj.vercel.app/logistics |
| Track | https://express-quickfynd-iawj.vercel.app/track/{AWB} |
| Merchant login | https://express-quickfynd-iawj.vercel.app/login |
| Super Admin | https://express-quickfynd-iawj.vercel.app/super-admin/login |

---

## 2. Health

```http
GET /api/v1/health
```

```bash
curl https://express-quickfynd-iawj.vercel.app/api/v1/health
```

---

## 3. Customer logistics (anyone can book)

Same flow as the website: service → pickup/drop → quote → nearby partners → book → track.

### Catalogue

```http
GET /api/v1/logistics/services
```

Returns services (bike, auto, van, truck, parcel, movers), goods types, places, assign modes.

### Quote / recommended vehicle

```http
POST /api/v1/logistics/quote
Content-Type: application/json
```

```json
{
  "pickup": { "lat": 11.2588, "lng": 75.7804 },
  "drop": { "lat": 11.18, "lng": 75.83 },
  "weightKg": 2,
  "goods": "Electronics",
  "vehicle": "bike"
}
```

### Nearby partners (privacy: first name, rating, ETA — no phone)

```http
POST /api/v1/logistics/nearby
Content-Type: application/json
```

```json
{ "lat": 11.2588, "lng": 75.7804, "vehicle": "bike" }
```

```bash
curl -X POST https://express-quickfynd-iawj.vercel.app/api/v1/logistics/nearby \
  -H "Content-Type: application/json" \
  -d "{\"lat\":11.2588,\"lng\":75.7804,\"vehicle\":\"bike\"}"
```

### Create booking

```http
POST /api/v1/logistics/book
Content-Type: application/json
```

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

`assignMode`: `"quick"` (default) or `"choose"` plus `preferredRiderId`.

Response includes `awb`, `tracking_url`, `booking`.

### List bookings by mobile

```http
GET /api/v1/logistics/book?phone=9876500001&status=active
```

### Request another partner

```http
POST /api/v1/logistics/request-rider
```

```json
{ "awb": "QFD12345601", "mode": "quick", "findAnother": true }
```

or `{ "awb": "...", "riderId": "RIDER102" }`

### Rate + optional tip

```http
POST /api/v1/logistics/rate
```

```json
{ "awb": "QFD12345601", "overall": 5, "tipInr": 20 }
```

### Saved places

```http
GET  /api/v1/logistics/places?owner=guest
POST /api/v1/logistics/places
```

```json
{
  "owner": "9876500001",
  "label": "Home",
  "line": "Feroke",
  "city": "Kozhikode",
  "lat": 11.18,
  "lng": 75.83
}
```

### Legacy one-shot book

```http
POST /api/v1/public/book
```

Same engine as logistics book.

---

## 4. Track (public, no login)

```http
GET /api/v1/track/{awb}
GET /api/v1/quote
```

```bash
curl https://express-quickfynd-iawj.vercel.app/api/v1/track/QFD12345601
```

Web: `https://express-quickfynd-iawj.vercel.app/track/QFD12345601`

Simple fare:

```http
POST /api/v1/quote
```

```json
{
  "pickup": { "lat": 11.2588, "lng": 75.7804 },
  "drop": { "lat": 11.18, "lng": 75.83 },
  "weightKg": 2,
  "vehicle": "bike"
}
```

---

## 5. Company / ecommerce deliveries

Header: `x-org-slug: quickfynd` (or `x-org-id`, or `?company=quickfynd`)

```http
GET  /api/v1/deliveries?company=quickfynd&status=active
POST /api/v1/deliveries
POST /api/v1/deliveries/{awb}/dispatch
POST /api/v1/deliveries/{awb}/accept
POST /api/v1/deliveries/{awb}/status
POST /api/v1/deliveries/{awb}/otp
GET  /api/v1/deliveries/{awb}
```

**Create**

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

**Accept / decline**

```json
{ "riderId": "RIDER102", "accept": true }
```

**Status** — e.g. `picked_up`, `out_for_delivery`, `delivered`

```json
{ "status": "picked_up", "riderId": "RIDER102" }
```

**OTP**

```json
{ "kind": "pickup", "code": "4812" }
```

`kind` is `pickup` or `delivery`. Omit `code` to (re)send.

Ecommerce-style alias: `POST /api/v1/shipments`, `GET /api/v1/shipments/{awb}`, `POST /api/v1/shipments/{awb}/status`.

---

## 6. Live ops, riders, GPS

```http
GET  /api/v1/ops/live
GET  /api/v1/riders
GET  /api/v1/riders?online=1
POST /api/v1/riders
POST /api/v1/riders/gps
GET  /api/v1/stats
GET  /api/v1/zones
GET  /api/v1/sellers
GET  /api/v1/pricing
```

**GPS ping**

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

Set duty: `{ "riderId": "RIDER102", "online": true }`

---

## 7. Rider app (`/api/rider`)

Demo login (in-memory):

```http
POST /api/rider/auth/login
```

```json
{ "email": "rider@quickfynd.com", "password": "rider123" }
```

Then `Authorization: Bearer {token}` on:

| Method | Path |
|--------|------|
| GET | `/api/rider/me` |
| POST | `/api/rider/attendance/check-in` |
| POST | `/api/rider/attendance/check-out` |
| GET | `/api/rider/pickups` |
| GET | `/api/rider/deliveries` |
| POST | `/api/rider/scan` |
| POST | `/api/rider/gps` |
| POST | `/api/rider/otp/send` |
| POST | `/api/rider/otp/verify` |
| POST | `/api/rider/pod` |
| POST | `/api/rider/cod/collect` |
| POST | `/api/rider/delivery/failed` |
| GET | `/api/rider/settlement` |
| GET | `/api/rider/tasks/{id}/navigation` |
| GET | `/api/rider/tasks/{id}/customer` |

---

## 8. Other

```http
GET|POST /api/v1/orgs
GET|PATCH /api/v1/orgs/{id}
GET /api/v1/organizations
POST /api/v1/webhooks/demo
DELETE /api/v1/records?type=delivery&id={awb}
GET /api/v1/supabase/health
GET /api/admin/ops
```

---

## 9. Demo data

After a fresh process start: companies QuickFynd / Nilaas / Local Mart, Kozhikode riders (example `RIDER102` Ahamed, bike), sample AWB `QFD12345601`.

---

## 10. Auth (web, not these JSON APIs)

Merchant and Super Admin UI use **Firebase** (Google + email). Super Admin Gmail: `quickfynd.com@gmail.com`.  
Do not put `SUPABASE_SECRET_KEY` in Flutter or public docs.

# Rider App — API & Product Spec

**Brand:** QuickFynd Express (QuickFynd)  
**Licence:** Nilaas  
**Client:** Flutter (`apps/rider_app`)  
**Backend:** Next.js App Router APIs (`/api/rider/*`)  
**Ops UI:** Admin Dashboard (`/dashboard`)

**Full Flutter delivery-app document:** [FLUTTER_DELIVERY_APP.md](./FLUTTER_DELIVERY_APP.md) — screens, job lifecycle, GPS, OTP, APIs, and build status.

---

## Feature → API map

| Rider feature | Method | Endpoint |
|---|---|---|
| Login | `POST` | `/api/rider/auth/login` |
| Attendance check-in | `POST` | `/api/rider/attendance/check-in` |
| Attendance check-out | `POST` | `/api/rider/attendance/check-out` |
| Assigned pickups | `GET` | `/api/rider/pickups` |
| Assigned deliveries | `GET` | `/api/rider/deliveries` |
| Parcel barcode scan | `POST` | `/api/rider/scan` |
| Navigation | `GET` | `/api/rider/tasks/:id/navigation` |
| Live GPS | `POST` | `/api/rider/gps` |
| Customer call | `GET` | `/api/rider/tasks/:id/customer` |
| Send OTP | `POST` | `/api/rider/otp/send` |
| Verify OTP | `POST` | `/api/rider/otp/verify` |
| Photo / signature POD | `POST` | `/api/rider/pod` |
| COD collection | `POST` | `/api/rider/cod/collect` |
| Failed delivery | `POST` | `/api/rider/delivery/failed` |
| Daily settlement | `GET` | `/api/rider/settlement` |
| Submit settlement | `POST` | `/api/rider/settlement` |
| Rider profile / today | `GET` | `/api/rider/me` |

Auth: send `Authorization: Bearer <token>` (demo tokens from login).

---

## Dashboard screens (ops)

| Menu | Path | What you see |
|---|---|---|
| Overview | `/dashboard` | Counts: riders online, pickups, deliveries, COD |
| Riders | `/dashboard/riders` | Login/attendance, live GPS status |
| Pickups | `/dashboard/pickups` | All assigned pickups |
| Deliveries | `/dashboard/deliveries` | Assigned deliveries + status |
| Live tracking | `/dashboard/live` | Latest GPS pings |
| COD | `/dashboard/cod` | Collections & mismatches |
| Failures | `/dashboard/failures` | Failed delivery reports |
| Settlements | `/dashboard/settlements` | Daily rider settlements |
| Scans / POD | `/dashboard/proofs` | Scans, OTP, photo, signature |

---

## Flutter screens

```
Login → Attendance → Home (tabs)
  ├── Pickups
  ├── Deliveries
  ├── Scan
  ├── Navigation / Map
  ├── Task detail (Call, OTP, POD, COD, Fail)
  └── Settlement
```

Demo login: `rider@quickfynd.com` / `rider123`

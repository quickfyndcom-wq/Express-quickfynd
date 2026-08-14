# QuickFynd Express — Rider Flutter App

Brand: **QuickFynd** · Licence: **Nilaas**

Detailed product + API spec: [docs/FLUTTER_DELIVERY_APP.md](../../docs/FLUTTER_DELIVERY_APP.md)

## Prerequisites

1. Install [Flutter](https://docs.flutter.dev/get-started/install)
2. Run the Next.js API: from repo root `npm run dev`

## Run

```bash
cd apps/rider_app
flutter pub get
flutter run
```

### API base URL

Default in `lib/config.dart` is `http://10.0.2.2:3000` (Android emulator → host).

- iOS simulator: `http://localhost:3000`
- Physical device: `http://<your-pc-lan-ip>:3000`

```bash
flutter run --dart-define=API_BASE=http://192.168.1.10:3000
```

## Demo login

- Email: `rider@quickfynd.com`
- Password: `rider123`

## Features (all wired to backend)

| Feature | Screen / action |
|---|---|
| Login and Attendance | Login + Duty tab |
| Assigned Pickups | Pickups tab |
| Assigned Deliveries | Deliver tab |
| Parcel Barcode Scanner | Scan tab |
| Navigation | Task → Navigation / long-press pickup |
| Live GPS Tracking | Auto ping on home open |
| Customer Call Option | Task → Customer call |
| OTP Verification | Task → Send / Verify OTP |
| Photo and Signature Proof | Task → POD |
| COD Collection | Task → Collect COD |
| Failed Delivery Report | Task → Failed delivery |
| Daily Settlement | Settle tab |

## Ops dashboard

Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard) to see the same data from admin side.

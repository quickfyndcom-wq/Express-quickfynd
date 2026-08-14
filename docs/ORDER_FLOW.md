# Website → QuickFynd Express order flow

```
Customer Places Order on Website
              ↓
Website Confirms the Order
              ↓
Website Sends Order to Courier API
              ↓
QuickFynd Express Creates Shipment
              ↓
Tracking Number Generated
              ↓
Tracking Number Returned to Website
              ↓
Pickup Request Created
              ↓
Courier Rider Assigned
              ↓
Parcel Picked Up
              ↓
Live Tracking Starts
              ↓
Parcel Delivered
              ↓
Delivery Status Sent Back to Website
```

## API steps

### 1. Create shipment (website → courier)

```http
POST /api/v1/shipments
x-org-slug: quickfynd
Content-Type: application/json

{
  "orderId": "QF-ORD-9999",
  "consigneeName": "Anjali Menon",
  "consigneePhone": "+919900112233",
  "destination": "Kakkanad, Kochi",
  "pincode": "682030",
  "codAmount": 450,
  "weightKg": 1.2
}
```

Response includes `awb`, `trackingUrl`, and `pickup`.

### 2. Advance status (ops / rider → courier → website webhook)

```http
POST /api/v1/shipments/{awb}/status
Content-Type: application/json

{ "riderId": "rdr_001" }
```

Omit `status` to move one step forward. Response includes `webhook` payload to POST to the merchant site.

### 3. Website receives status

```http
POST /api/v1/webhooks/demo
```

Demo sink acknowledging `shipment.status_updated` / `shipment.delivered`.

### 4. Customer tracks

`GET /api/v1/track/{awb}` or browser `/track/{awb}`

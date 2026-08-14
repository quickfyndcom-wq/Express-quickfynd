"use client";

import { useEffect, useRef, useState } from "react";
import type { Delivery } from "@/lib/delivery";

export type MapRider = {
  id: string;
  firstName: string;
  lat: number;
  lng: number;
  duty: string;
  online: boolean;
  heading?: number;
  speed?: number;
  vehicle?: string;
  currentDelivery?: string;
};

type LeafletMap = {
  setView: (c: [number, number], z?: number) => void;
  remove: () => void;
  fitBounds: (b: [number, number][], o?: { padding: [number, number] }) => void;
};
type LeafletMarker = {
  setLatLng: (c: [number, number]) => void;
  setIcon: (i: unknown) => void;
  remove: () => void;
  on: (e: string, fn: () => void) => void;
};
type LeafletLine = { setLatLngs: (c: [number, number][]) => void; remove: () => void };
type LeafletNS = {
  map: (el: HTMLElement, o: Record<string, unknown>) => LeafletMap;
  tileLayer: (u: string, o: Record<string, unknown>) => { addTo: (m: LeafletMap) => void };
  marker: (c: [number, number], o?: Record<string, unknown>) => LeafletMarker & { addTo: (m: LeafletMap) => LeafletMarker };
  polyline: (c: [number, number][], o: Record<string, unknown>) => LeafletLine & { addTo: (m: LeafletMap) => LeafletLine };
  divIcon: (o: Record<string, unknown>) => unknown;
};

declare global {
  interface Window {
    L?: LeafletNS;
    google?: {
      maps: {
        Map: new (el: HTMLElement, o: Record<string, unknown>) => GoogleMap;
        Marker: new (o: Record<string, unknown>) => GoogleMarker;
        Polyline: new (o: Record<string, unknown>) => GoogleLine;
        Size: new (w: number, h: number) => unknown;
        Point: new (x: number, y: number) => unknown;
      };
    };
  }
}

type GoogleMap = {
  setCenter: (c: { lat: number; lng: number }) => void;
  setZoom: (z: number) => void;
  fitBounds: (b: GoogleBounds) => void;
};
type GoogleMarker = {
  setPosition: (c: { lat: number; lng: number }) => void;
  setIcon: (i: unknown) => void;
  setMap: (m: GoogleMap | null) => void;
  addListener: (e: string, fn: () => void) => void;
};
type GoogleLine = {
  setPath: (c: { lat: number; lng: number }[]) => void;
  setMap: (m: GoogleMap | null) => void;
};
type GoogleBounds = {
  extend: (c: { lat: number; lng: number }) => void;
};

const KOZ = { lat: 11.2588, lng: 75.7804 };

function dutyColor(duty: string, online: boolean) {
  if (!online) return "#94a3b8";
  if (duty === "available") return "#22c55e";
  if (duty === "pickup") return "#0ea5e9";
  if (duty === "delivering") return "#f59e0b";
  return "#ef4444";
}

function scooterSvg(color: string, heading = 0) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
    <g transform="translate(22 22) rotate(${heading}) translate(-22 -22)">
      <circle cx="22" cy="22" r="13" fill="${color}" stroke="white" stroke-width="3"/>
      <path d="M14 26c0-1.2.8-2 2-2h5l2-5h5c1 0 2 .8 2 2v1h2v3h-3.2a3.2 3.2 0 0 1-6.2 0H18a3.2 3.2 0 0 1-6.2 0H10v-3h4z" fill="white"/>
      <circle cx="16.2" cy="29" r="2.1" fill="${color}"/>
      <circle cx="27.6" cy="29" r="2.1" fill="${color}"/>
    </g>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function loadScript(src: string, id: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.getElementById(id)) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error(`Failed ${src}`));
    document.head.appendChild(s);
  });
}

function loadCss(href: string, id: string) {
  if (document.getElementById(id)) return;
  const l = document.createElement("link");
  l.id = id;
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

export function OpsMap({
  riders,
  deliveries,
  onSelect,
  focusRiderId,
}: {
  riders: MapRider[];
  deliveries: Delivery[];
  onSelect?: (id: string) => void;
  focusRiderId?: string;
}) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const wrap = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<"google" | "leaflet" | "loading">("loading");
  const googleRef = useRef<{
    map: GoogleMap;
    markers: Map<string, GoogleMarker>;
    pins: Map<string, GoogleMarker>;
    line: GoogleLine | null;
  } | null>(null);
  const leafletRef = useRef<{
    map: LeafletMap;
    markers: Map<string, LeafletMarker>;
    pins: Map<string, LeafletMarker>;
    line: LeafletLine | null;
  } | null>(null);
  const display = useRef<Map<string, { lat: number; lng: number }>>(new Map());
  const target = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  useEffect(() => {
    for (const r of riders) {
      target.current.set(r.id, { lat: r.lat, lng: r.lng });
      if (!display.current.has(r.id)) display.current.set(r.id, { lat: r.lat, lng: r.lng });
    }
  }, [riders]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (key) {
        try {
          await loadScript(
            `https://maps.googleapis.com/maps/api/js?key=${key}`,
            "qf-google-maps",
          );
          if (!cancelled) setEngine("google");
          return;
        } catch {
          /* fall through to leaflet */
        }
      }
      loadCss("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css", "qf-leaflet-css");
      await loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", "qf-leaflet-js");
      if (!cancelled) setEngine("leaflet");
    })();
    return () => {
      cancelled = true;
    };
  }, [key]);

  useEffect(() => {
    const el = wrap.current;
    if (!el || engine === "loading") return;

    if (engine === "google" && window.google?.maps && !googleRef.current) {
      const g = window.google.maps;
      const map = new g.Map(el, {
        center: KOZ,
        zoom: 13,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
          { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
          { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
          { featureType: "road", elementType: "geometry", stylers: [{ color: "#304a7d" }] },
          { featureType: "water", elementType: "geometry", stylers: [{ color: "#0e1626" }] },
          { featureType: "poi", stylers: [{ visibility: "off" }] },
        ],
      });
      googleRef.current = { map, markers: new Map(), pins: new Map(), line: null };
    }

    if (engine === "leaflet" && window.L && !leafletRef.current) {
      const L = window.L;
      const map = L.map(el, { zoomControl: true, attributionControl: false });
      map.setView([KOZ.lat, KOZ.lng], 13);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);
      leafletRef.current = { map, markers: new Map(), pins: new Map(), line: null };
    }
  }, [engine]);

  useEffect(() => {
    let frame = 0;
    const step = () => {
      for (const [id, to] of target.current) {
        const from = display.current.get(id) ?? to;
        const next = {
          lat: from.lat + (to.lat - from.lat) * 0.12,
          lng: from.lng + (to.lng - from.lng) * 0.12,
        };
        display.current.set(id, next);
      }

      const g = googleRef.current;
      if (g && window.google?.maps) {
        const GM = window.google.maps;
        for (const r of riders) {
          const pos = display.current.get(r.id) ?? r;
          let marker = g.markers.get(r.id);
          const icon = {
            url: scooterSvg(dutyColor(r.duty, r.online), r.heading ?? 0),
            scaledSize: new GM.Size(44, 44),
            anchor: new GM.Point(22, 22),
          };
          if (!marker) {
            marker = new GM.Marker({
              position: pos,
              map: g.map,
              icon,
              title: `${r.firstName} · ${r.duty}`,
            });
            marker.addListener("click", () => onSelect?.(r.id));
            g.markers.set(r.id, marker);
          } else {
            marker.setPosition(pos);
            marker.setIcon(icon);
          }
        }
        for (const [id, marker] of g.markers) {
          if (!riders.some((r) => r.id === id)) {
            marker.setMap(null);
            g.markers.delete(id);
          }
        }
        for (const d of deliveries) {
          upsertGooglePin(g, GM, `p-${d.id}`, d.pickup, "📦");
          upsertGooglePin(g, GM, `d-${d.id}`, d.drop, "🏠");
        }
        const focus = riders.find((r) => r.id === focusRiderId) ?? riders.find((r) => r.online);
        const job = deliveries.find((d) => d.riderId === focus?.id) ?? deliveries[0];
        if (focus && job) {
          const pos = display.current.get(focus.id) ?? focus;
          const path = [pos, job.status.includes("pickup") || job.status.includes("assigned") ? job.pickup : job.drop];
          if (!g.line) {
            g.line = new GM.Polyline({
              path,
              map: g.map,
              strokeColor: "#2dd4bf",
              strokeWeight: 4,
              strokeOpacity: 0.85,
            });
          } else {
            g.line.setPath(path);
          }
        }
      }

      const lf = leafletRef.current;
      if (lf && window.L) {
        const L = window.L;
        for (const r of riders) {
          const pos = display.current.get(r.id) ?? r;
          const icon = L.divIcon({
            className: "",
            html: `<img src="${scooterSvg(dutyColor(r.duty, r.online), r.heading ?? 0)}" width="40" height="40" alt="" />`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          let marker = lf.markers.get(r.id);
          if (!marker) {
            marker = L.marker([pos.lat, pos.lng], { icon }).addTo(lf.map);
            marker.on("click", () => onSelect?.(r.id));
            lf.markers.set(r.id, marker);
          } else {
            marker.setLatLng([pos.lat, pos.lng]);
            marker.setIcon(icon);
          }
        }
        for (const [id, marker] of lf.markers) {
          if (!riders.some((r) => r.id === id)) {
            marker.remove();
            lf.markers.delete(id);
          }
        }
        for (const d of deliveries) {
          upsertLeafletPin(lf, L, `p-${d.id}`, d.pickup, "📦");
          upsertLeafletPin(lf, L, `d-${d.id}`, d.drop, "🏠");
        }
        const focus = riders.find((r) => r.id === focusRiderId) ?? riders.find((r) => r.online);
        const job = deliveries.find((x) => x.riderId === focus?.id) ?? deliveries[0];
        if (focus && job) {
          const pos = display.current.get(focus.id) ?? focus;
          const dest =
            job.status.includes("pickup") || job.status.includes("assigned")
              ? job.pickup
              : job.drop;
          const path: [number, number][] = [
            [pos.lat, pos.lng],
            [dest.lat, dest.lng],
          ];
          if (!lf.line) {
            lf.line = L.polyline(path, { color: "#0f766e", weight: 4, opacity: 0.85 }).addTo(lf.map);
          } else {
            lf.line.setLatLngs(path);
          }
        }
      }

      frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [riders, deliveries, onSelect, focusRiderId, engine]);

  return (
    <div className="relative h-[480px] overflow-hidden rounded-[22px] bg-[#0b1c24]">
      <div ref={wrap} className="absolute inset-0" />
      {engine === "loading" ? (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
          Loading live map…
        </p>
      ) : null}
      <div className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] text-white">
        <span className="rounded-full bg-black/45 px-2 py-1">🟢 Available</span>
        <span className="rounded-full bg-black/45 px-2 py-1">🔵 To pickup</span>
        <span className="rounded-full bg-black/45 px-2 py-1">🟠 Delivering</span>
        <span className="rounded-full bg-black/45 px-2 py-1">🛵 Live scooter</span>
      </div>
      <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white">
        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
        {key ? "Google Maps" : "Live streets"} · scooters realtime
      </div>
    </div>
  );
}

function upsertGooglePin(
  g: { map: GoogleMap; pins: Map<string, GoogleMarker> },
  GM: NonNullable<Window["google"]>["maps"],
  id: string,
  point: { lat: number; lng: number },
  emoji: string,
) {
  const icon = {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28"><text y="22" font-size="22">${emoji}</text></svg>`,
    )}`,
    scaledSize: new GM.Size(28, 28),
  };
  const existing = g.pins.get(id);
  if (!existing) {
    g.pins.set(id, new GM.Marker({ position: point, map: g.map, icon, clickable: false }));
  } else {
    existing.setPosition(point);
  }
}

function upsertLeafletPin(
  lf: { map: LeafletMap; pins: Map<string, LeafletMarker> },
  L: LeafletNS,
  id: string,
  point: { lat: number; lng: number },
  emoji: string,
) {
  const icon = L.divIcon({
    className: "",
    html: `<div style="font-size:20px;line-height:1">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
  const existing = lf.pins.get(id);
  if (!existing) {
    lf.pins.set(id, L.marker([point.lat, point.lng], { icon }).addTo(lf.map));
  } else {
    existing.setLatLng([point.lat, point.lng]);
  }
}

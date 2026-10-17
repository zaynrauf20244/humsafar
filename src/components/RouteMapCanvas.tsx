"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import type { GeoPoint } from "@/lib/geo";
import "leaflet/dist/leaflet.css";

const PK_CENTER: L.LatLngExpression = [31.5204, 74.3587];

function makeDotIcon(color: string) {
  return L.divIcon({
    className: "humsafar-map-dot",
    html: `<span style="display:block;width:14px;height:14px;border-radius:999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

type Props = {
  from: GeoPoint | null;
  to: GeoPoint | null;
  path: [number, number][] | null;
};

/**
 * Imperative Leaflet — syncs layers after every map (re)create so Strict Mode
 * remounts don’t leave a blank / broken map.
 */
export default function RouteMapCanvas({ from, to, path }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const propsRef = useRef({ from, to, path });
  propsRef.current = { from, to, path };

  const fromIcon = useRef(makeDotIcon("#0d9488"));
  const toIcon = useRef(makeDotIcon("#ea580c"));

  function paintLayers(map: L.Map) {
    const { from: f, to: t, path: p } = propsRef.current;
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    const group = L.layerGroup().addTo(map);
    layerRef.current = group;

    if (f) {
      L.marker([f.lat, f.lng], { icon: fromIcon.current }).addTo(group);
    }
    if (t) {
      L.marker([t.lat, t.lng], { icon: toIcon.current }).addTo(group);
    }
    if (p && p.length > 1) {
      L.polyline(p, {
        color: "#0d9488",
        weight: 4,
        opacity: 0.85,
      }).addTo(group);
    }

    const pts: L.LatLngExpression[] = [];
    if (p && p.length > 1) pts.push(...p);
    else {
      if (f) pts.push([f.lat, f.lng]);
      if (t) pts.push([t.lat, t.lng]);
    }

    try {
      map.invalidateSize();
      if (pts.length === 0) map.setView(PK_CENTER, 11);
      else if (pts.length === 1) map.setView(pts[0], 14);
      else map.fitBounds(L.latLngBounds(pts), { padding: [36, 36], maxZoom: 15 });
    } catch {
      /* map removed mid-paint */
    }
  }

  // Create map once per mount
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    let cancelled = false;
    let map: L.Map | null = null;
    let ro: ResizeObserver | null = null;
    let t1 = 0;
    let t2 = 0;

    const boot = () => {
      if (cancelled || !hostRef.current) return;
      const node = hostRef.current;
      const stale = node as HTMLDivElement & { _leaflet_id?: number };
      if (stale._leaflet_id) {
        stale._leaflet_id = undefined;
        node.replaceChildren();
      }

      map = L.map(node, {
        center: PK_CENTER,
        zoom: 11,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      // Free OSM tiles — no API key (Carto basemaps now require a key)
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      paintLayers(map);

      ro =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(() => {
              map?.invalidateSize();
            })
          : null;
      ro?.observe(node);

      t1 = window.setTimeout(() => map?.invalidateSize(), 80);
      t2 = window.setTimeout(() => map?.invalidateSize(), 350);
    };

    // Wait a frame so the 220px host has layout (Safari / flex)
    const raf = window.requestAnimationFrame(boot);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      ro?.disconnect();
      layerRef.current = null;
      if (map) {
        map.remove();
        map = null;
      }
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-paint when ends / path change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    paintLayers(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, path]);

  return (
    <div className="overflow-hidden rounded-2xl border border-black/10">
      <div
        ref={hostRef}
        className="h-[220px] w-full bg-[var(--uber-soft,#f3f3f3)]"
      />
    </div>
  );
}

export type GeoPoint = {
  lat: number;
  lng: number;
  label: string;
};

export type PlaceHit = GeoPoint & {
  id: string;
};

export type DrivingRoute = {
  coords: [number, number][];
  distanceKm: number;
  durationMin: number;
};

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OSRM = "https://router.project-osrm.org/route/v1/driving";

/** Soft Pakistan viewbox (west,south,east,north) for better local hits. */
const PK_VIEWBOX = "60.87,23.69,77.84,37.08";

export type PlaceSearchOpts = {
  signal?: AbortSignal;
  /** Bias results near this point (helps “To” after “From”). */
  near?: Pick<GeoPoint, "lat" | "lng"> | null;
};

let lastNominatimAt = 0;

async function waitNominatimGap(signal?: AbortSignal) {
  const gap = 1100 - (Date.now() - lastNominatimAt);
  if (gap <= 0) return;
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, gap);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(t);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true }
    );
  });
}

/** Pakistan-biased place search (buildings, areas, homes). */
export async function searchPlaces(
  query: string,
  opts?: PlaceSearchOpts | AbortSignal
): Promise<PlaceHit[]> {
  const options: PlaceSearchOpts =
    opts instanceof AbortSignal || opts === undefined
      ? { signal: opts as AbortSignal | undefined }
      : opts;
  const q = query.trim();
  if (q.length < 2) return [];

  // Prefer “Arfa Tower Lahore Pakistan” style queries
  const enriched = /pakistan|lahore|karachi|islamabad|rawalpindi/i.test(q)
    ? q
    : `${q}, Pakistan`;

  await waitNominatimGap(options.signal);
  lastNominatimAt = Date.now();

  const url = new URL(NOMINATIM);
  url.searchParams.set("format", "json");
  url.searchParams.set("q", enriched);
  url.searchParams.set("countrycodes", "pk");
  url.searchParams.set("limit", "8");
  url.searchParams.set("addressdetails", "0");
  url.searchParams.set("viewbox", PK_VIEWBOX);
  url.searchParams.set("bounded", "0");
  if (options.near) {
    url.searchParams.set(
      "viewbox",
      [
        options.near.lng - 0.35,
        options.near.lat - 0.25,
        options.near.lng + 0.35,
        options.near.lat + 0.25,
      ].join(",")
    );
  }

  const fetchOnce = () =>
    fetch(url.toString(), {
      signal: options.signal,
      headers: {
        Accept: "application/json",
        "Accept-Language": "en",
      },
    });

  let res = await fetchOnce();
  if (res.status === 429) {
    await new Promise((r) => setTimeout(r, 1200));
    lastNominatimAt = Date.now();
    res = await fetchOnce();
  }
  if (!res.ok) return [];

  const data = (await res.json()) as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
  }>;

  return data.map((p) => ({
    id: String(p.place_id),
    label: shortLabel(p.display_name),
    lat: Number(p.lat),
    lng: Number(p.lon),
  }));
}

/** Driving path between two points via public OSRM. */
export async function fetchDrivingRoute(
  from: GeoPoint,
  to: GeoPoint,
  signal?: AbortSignal
): Promise<DrivingRoute | null> {
  const path = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const url = `${OSRM}/${path}?overview=full&geometries=geojson`;

  const res = await fetch(url, { signal });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    code?: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }>;
  };

  const route = data.routes?.[0];
  if (!route || data.code !== "Ok") return null;

  const coords: [number, number][] = route.geometry.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );

  return {
    coords,
    distanceKm: Math.round((route.distance / 1000) * 10) / 10,
    durationMin: Math.max(1, Math.round(route.duration / 60)),
  };
}

function shortLabel(displayName: string) {
  const parts = displayName.split(",").map((p) => p.trim());
  if (parts.length <= 3) return displayName;
  return parts.slice(0, 3).join(", ");
}

import { Suspense } from "react";
import { RideDetail } from "./RideDetail";

export default function RideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<main className="page text-muted">Loading…</main>}>
      <RideDetail params={params} />
    </Suspense>
  );
}

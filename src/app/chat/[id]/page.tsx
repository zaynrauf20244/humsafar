import { Suspense } from "react";
import { ChatThread } from "./ChatThread";

export default function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={<main className="page text-muted">Loading…</main>}
    >
      <ChatThread params={params} />
    </Suspense>
  );
}

"use client";

import Link from "next/link";
import { Card, ScreenStates } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar, useUser } from "@/lib/store";

export default function ChatListPage() {
  const { me, chats, bookings } = useHumSafar();
  const { t } = useI18n();
  const mine = chats.filter((c) => {
    const b = bookings.find((x) => x.id === c.bookingId);
    return b && (b.driverId === me?.id || b.passengerId === me?.id);
  });

  return (
    <main className="page space-y-4">
      <h1 className="font-display text-26 font-bold">{t("chat")}</h1>
      <ScreenStates
        empty={mine.length === 0}
        emptyTitle={t("emptyChat")}
        emptyBody={t("emptyChatBody")}
      >
        <div className="space-y-3">
          {mine.map((c) => {
            const b = bookings.find((x) => x.id === c.bookingId);
            const otherId =
              me?.id === b?.driverId ? b?.passengerId : b?.driverId;
            return (
              <ChatRow key={c.id} chatId={c.id} otherId={otherId} />
            );
          })}
        </div>
      </ScreenStates>
    </main>
  );
}

function ChatRow({
  chatId,
  otherId,
}: {
  chatId: string;
  otherId?: string;
}) {
  const other = useUser(otherId);
  const { chats } = useHumSafar();
  const c = chats.find((x) => x.id === chatId);
  const last = c?.messages[c.messages.length - 1];
  return (
    <Link href={`/chat/${chatId}`}>
      <Card className="flex items-center justify-between gap-3">
        <div>
          <p className="font-bold">{other?.name || "HumSafar"}</p>
          <p className="truncate text-14 text-muted">{last?.text}</p>
        </div>
        <span className="text-12 text-muted">{last?.at}</span>
      </Card>
    </Link>
  );
}

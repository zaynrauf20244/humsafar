"use client";

import { use, useState } from "react";
import { Button, Card, useToast } from "@/components/ui";
import { useI18n } from "@/lib/i18n";
import { useHumSafar, useUser } from "@/lib/store";

export function ChatThread({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { me, chats, sendChat, blockUser, addComplaint, bookings } =
    useHumSafar();
  const { t } = useI18n();
  const { show } = useToast();
  const [text, setText] = useState("");
  const chat = chats.find((c) => c.id === id);
  const booking = bookings.find((b) => b.id === chat?.bookingId);
  const otherId =
    me?.id === booking?.driverId
      ? booking?.passengerId
      : booking?.driverId;
  const other = useUser(otherId);
  const closed =
    chat?.closedAt && new Date(chat.closedAt) < new Date();

  const quick = [t("reached"), t("fiveMin"), t("atGate")];

  if (!chat) {
    return (
      <main className="page">
        <p className="text-muted">{t("emptyChat")}</p>
      </main>
    );
  }

  return (
    <main className="page flex max-w-lg flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-20 font-bold">
            {other?.name || t("chat")}
          </h1>
          <p className="text-12 text-muted">{t("phoneWarn")}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="!min-h-11 !px-3 text-12"
            onClick={() => otherId && blockUser(otherId)}
          >
            Block
          </Button>
          <Button
            variant="danger"
            className="!min-h-11 !px-3 text-12"
            onClick={() => {
              if (otherId)
                addComplaint(otherId, "Report from chat", booking?.id);
              show("Report");
            }}
          >
            Report
          </Button>
        </div>
      </div>

      <Card className="flex min-h-[420px] flex-col gap-2 !p-3">
        <div className="flex-1 space-y-2 overflow-y-auto">
          {chat.messages.map((m) => {
            const mine = m.senderId === me?.id;
            return (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-14 ${
                  m.system
                    ? "mx-auto bg-mist text-center text-muted"
                    : mine
                      ? "ms-auto bg-teal text-white"
                      : "me-auto bg-mist text-ink"
                }`}
              >
                {m.text}
                <div
                  className={`mt-1 text-12 ${mine ? "text-white/70" : "text-muted"}`}
                >
                  {m.at}
                </div>
              </div>
            );
          })}
        </div>

        {!closed ? (
          <>
            <div className="flex flex-wrap gap-2">
              {quick.map((q) => (
                <button
                  key={q}
                  type="button"
                  className="chip"
                  onClick={() => {
                    const r = sendChat(id, q);
                    if (r.warn) show(t("phoneWarn"));
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t("chat")}
              />
              <Button
                onClick={() => {
                  const r = sendChat(id, text);
                  if (r.warn) show(t("phoneWarn"));
                  setText("");
                }}
              >
                Send
              </Button>
            </div>
            <Button variant="secondary" className="w-full">
              Call (hidden)
            </Button>
          </>
        ) : (
          <p className="text-center text-14 text-muted">
            Chat closes 24 hours after the ride
          </p>
        )}
      </Card>
    </main>
  );
}

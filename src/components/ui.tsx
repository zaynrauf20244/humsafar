"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import {
  AlertCircle,
  CheckCircle2,
  Inbox,
  Loader2,
  Shield,
  Star,
  Venus,
  WifiOff,
  X,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type BtnVariant = "primary" | "secondary" | "danger" | "ghost";

export function Button({
  variant = "primary",
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  loading?: boolean;
}) {
  return (
    <button
      className={cn(
        "btn w-full sm:w-auto",
        variant === "primary" && "btn-primary",
        variant === "secondary" && "btn-secondary",
        variant === "danger" && "btn-danger",
        variant === "ghost" && "btn-ghost",
        className
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="size-5 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function Card({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn("card p-4", className)}>{children}</div>;
}

export function Chip({
  active,
  tone,
  children,
  onClick,
  className,
}: {
  active?: boolean;
  tone?: "default" | "plum" | "marigold";
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "chip",
        active && "active",
        tone === "plum" && "chip-plum",
        tone === "marigold" && "chip-marigold",
        className
      )}
    >
      {children}
    </button>
  );
}

export function Badge({
  tone = "teal",
  children,
}: {
  tone?: "teal" | "marigold" | "plum" | "red" | "mist";
  children: ReactNode;
}) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}

export function GirlsOnlyBadge() {
  return (
    <span className="girls-only" title="Verified women drivers only">
      <Venus className="size-3.5" aria-hidden />
      Only women
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 44,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size }}>
      {src ? <img src={src} alt="" /> : initials}
    </span>
  );
}

export function Switch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={cn("switch", on && "on")}
      onClick={() => onChange(!on)}
    />
  );
}

export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="stepper" aria-label={`Step ${step} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={cn("step-dot", i + 1 === step && "active")} />
      ))}
    </div>
  );
}

export function RatingStars({
  value,
  onChange,
  size = 22,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={cn("star", n <= value && "on")}
          onClick={() => onChange?.(n)}
          aria-label={`${n} stars`}
          disabled={!onChange}
        >
          <Star
            className="size-5"
            style={{ width: size, height: size }}
            fill={n <= value ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-rise">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-box animate-rise">
      <Inbox className="mx-auto size-8 text-muted" />
      <p className="mt-3 font-display text-20 font-bold text-ink">{title}</p>
      {body ? <p className="mt-1 text-14 text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  body,
  onRetry,
}: {
  title: string;
  body?: string;
  onRetry?: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="error-box animate-rise">
      <AlertCircle className="mx-auto size-8 text-red" />
      <p className="mt-3 font-display text-20 font-bold text-ink">{title}</p>
      {body ? <p className="mt-1 text-14 text-muted">{body}</p> : null}
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          {t("tryAgain")}
        </Button>
      ) : null}
    </div>
  );
}

export function OfflineBanner() {
  const { t } = useI18n();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (!offline) return null;
  return (
    <div className="offline-banner flex items-center justify-center gap-2">
      <WifiOff className="size-4" />
      {t("offline")}
    </div>
  );
}

export function VerifiedMark() {
  const { t } = useI18n();
  return (
    <span className="inline-flex items-center gap-1 text-12 font-bold text-teal">
      <CheckCircle2 className="size-3.5" />
      {t("verified")}
    </span>
  );
}

export function PriceTag({
  kind,
}: {
  kind: "cheap" | "normal" | "expensive";
}) {
  const { t } = useI18n();
  if (kind === "cheap")
    return <Badge tone="teal">{t("priceCheap")}</Badge>;
  if (kind === "expensive")
    return <Badge tone="marigold">{t("priceExpensive")}</Badge>;
  return <Badge tone="mist">{t("priceNormal")}</Badge>;
}

export function MapPinDot({ label }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-14 font-semibold text-ink">
      <span className="relative flex size-6 items-center justify-center">
        <span className="absolute size-6 rounded-full bg-teal/15" />
        <span className="relative size-2.5 rounded-full bg-teal" />
      </span>
      {label}
    </span>
  );
}

export function BottomSheet({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  if (!open) return null;
  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[60] bg-ink/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="sheet animate-rise">
        <div className="sheet-handle" />
        <div className="mb-3 flex items-center justify-between gap-3">
          {title ? (
            <h3 className="font-display text-20 font-bold">{title}</h3>
          ) : (
            <span />
          )}
          <button
            type="button"
            className="flex size-11 items-center justify-center rounded-2xl border border-line"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}

type ToastCtx = {
  show: (msg: string) => void;
};

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<string | null>(null);
  const show = useCallback((m: string) => {
    setMsg(m);
    window.setTimeout(() => setMsg(null), 2800);
  }, []);
  const value = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {msg ? <div className="toast animate-rise">{msg}</div> : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

export function SosButton({ onTrigger }: { onTrigger: () => void }) {
  const { t } = useI18n();
  const [holding, setHolding] = useState(false);
  const [left, setLeft] = useState(3);

  useEffect(() => {
    if (!holding) return;
    if (left <= 0) {
      onTrigger();
      setHolding(false);
      setLeft(3);
      return;
    }
    const id = window.setTimeout(() => setLeft((n) => n - 1), 1000);
    return () => window.clearTimeout(id);
  }, [holding, left, onTrigger]);

  return (
    <div className="fixed end-4 bottom-[calc(var(--nav-h)+var(--safe-bottom)+16px)] z-40 md:bottom-6">
      {holding ? (
        <div className="mb-2 rounded-2xl bg-ink px-3 py-2 text-12 font-semibold text-white">
          {t("sosCancelHint")} {left}s
          <button
            type="button"
            className="ms-2 underline"
            onClick={() => {
              setHolding(false);
              setLeft(3);
            }}
          >
            {t("cancel")}
          </button>
        </div>
      ) : null}
      <button
        type="button"
        className="flex size-14 items-center justify-center rounded-full bg-red text-white shadow-lg"
        onPointerDown={() => {
          setHolding(true);
          setLeft(3);
        }}
        onPointerUp={() => {
          setHolding(false);
          setLeft(3);
        }}
        onPointerLeave={() => {
          setHolding(false);
          setLeft(3);
        }}
        aria-label="SOS"
      >
        <Shield className="size-6" />
      </button>
    </div>
  );
}

export function ScreenStates({
  loading,
  error,
  empty,
  emptyTitle,
  emptyBody,
  emptyAction,
  errorTitle,
  errorBody,
  onRetry,
  children,
}: {
  loading?: boolean;
  error?: boolean;
  empty?: boolean;
  emptyTitle: string;
  emptyBody?: string;
  emptyAction?: ReactNode;
  errorTitle?: string;
  errorBody?: string;
  onRetry?: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();
  if (loading) return <LoadingState />;
  if (error)
    return (
      <ErrorState
        title={errorTitle || t("errorTitle")}
        body={errorBody || t("errorBody")}
        onRetry={onRetry}
      />
    );
  if (empty)
    return (
      <EmptyState title={emptyTitle} body={emptyBody} action={emptyAction} />
    );
  return <>{children}</>;
}

"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { contactEmail, profile } from "@/data/profile";
import { Icon } from "@/components/ui/Icon";

import Reveal from "@/components/ui/Reveal";
import SocialLinks from "@/components/ui/SocialLinks";
import { useInViewPause } from "@/components/ui/useInView";
import { usePerformanceMode } from "@/components/ui/usePerformanceMode";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type IconName = ComponentProps<typeof Icon>["name"];
type CopyStatus = "idle" | "copied" | "error";
type SendStatus = "idle" | "loading" | "success" | "error";
type FieldName = "name" | "email" | "message";
type FieldErrors = Partial<Record<FieldName, string>>;

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MESSAGE_MIN_LENGTH = 10;
const HEADING_WORDS = ["Let’s", "build", "something", "together"];

const gridVariants: Variants = { hidden: {}, show: {} };

/** Shared entrance for cards and the form; `custom` is the stagger order. */
function createRevealVariants(reduced: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : 28 },
    show: (order: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: reduced ? 0 : 0.7,
        ease: EASE_OUT_EXPO,
        delay: reduced ? 0 : order * 0.1,
      },
    }),
  };
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for insecure contexts / older browsers.
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) throw new Error("Copy failed");
}

/* ------------------------------------------------------------------ */
/* Background: static layers + two GPU-only blobs (paused offscreen)   */
/* ------------------------------------------------------------------ */

const Backdrop = memo(function Backdrop({ lite }: { lite: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const inView = useInView(ref, { margin: "200px 0px 200px 0px" });
  const animate = !lite && !reduced && inView;

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-white dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#081426]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(37,99,235,0.14),transparent_42%),radial-gradient(circle_at_10%_85%,rgba(59,130,246,0.12),transparent_45%)] dark:bg-[radial-gradient(circle_at_85%_15%,rgba(37,99,235,0.22),transparent_44%),radial-gradient(circle_at_10%_85%,rgba(30,64,175,0.22),transparent_48%)]" />

      {!lite && (
        <>
          <motion.div
            className="absolute -right-24 top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(96,165,250,0.3),transparent_70%)] will-change-transform dark:bg-[radial-gradient(circle,rgba(37,99,235,0.26),transparent_70%)]"
            animate={animate ? { x: [0, -50, 0], y: [0, 36, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute -left-24 bottom-16 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.26),transparent_70%)] will-change-transform dark:bg-[radial-gradient(circle,rgba(29,78,216,0.24),transparent_70%)]"
            animate={animate ? { x: [0, 56, 0], y: [0, -34, 0] } : { x: 0, y: 0 }}
            transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-0 blue-dots opacity-50 dark:opacity-30" />
        </>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Heading: words rise out of a mask, one orchestrated moment          */
/* ------------------------------------------------------------------ */

function AnimatedHeading({
  words,
  reduced,
}: {
  words: string[];
  reduced: boolean;
}) {
  const containerVariants = useMemo<Variants>(
    () => ({
      hidden: {},
      show: { transition: { staggerChildren: reduced ? 0 : 0.09 } },
    }),
    [reduced],
  );

  const wordVariants = useMemo<Variants>(
    () => ({
      hidden: reduced ? { opacity: 0 } : { y: "110%" },
      show: {
        y: 0,
        opacity: 1,
        transition: { duration: reduced ? 0 : 0.8, ease: EASE_OUT_EXPO },
      },
    }),
    [reduced],
  );

  return (
    <motion.h2
      aria-label={words.join(" ")}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className="mt-6 block font-display text-4xl font-bold leading-[1.1] sm:text-5xl lg:text-6xl"
    >
      {words.map((word, index) => (
        <span key={word} aria-hidden>
          {/* Mask: padding keeps ascenders/descenders from being clipped */}
          <span className="inline-block overflow-hidden whitespace-nowrap py-[0.05em] align-top leading-[1.1]">
            <motion.span
              variants={wordVariants}
              className="inline-block pb-[0.04em] leading-[1.1] text-gradient"
            >
              {word}
            </motion.span>
          </span>
          {index < words.length - 1 ? " " : null}
        </span>
      ))}
    </motion.h2>
  );
}

/* ------------------------------------------------------------------ */
/* Info card: shared shell with a cursor spotlight (CSS vars, no state)*/
/* ------------------------------------------------------------------ */

const ContactCard = memo(function ContactCard({
  icon,
  title,
  order,
  variants,
  background,
  className = "",
  children,
}: {
  icon: IconName;
  title: string;
  order: number;
  variants: Variants;
  background?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const frame = useRef(0);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (event.pointerType !== "mouse") return;

      const el = cardRef.current;
      if (!el) return;

      const { clientX, clientY } = event;
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${clientX - rect.left}px`);
        el.style.setProperty("--my", `${clientY - rect.top}px`);
      });
    },
    [],
  );

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (
    <motion.div
      custom={order}
      variants={variants}
      className={`flex ${className}`}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        className="glass group relative flex min-w-0 flex-1 flex-col overflow-hidden rounded-3xl p-5 shadow-sm sm:p-6 [@media(hover:hover)]:transition-shadow [@media(hover:hover)]:duration-300 [@media(hover:hover)]:hover:shadow-xl [@media(hover:hover)]:hover:shadow-blue-900/10"
      >
        {background}

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 [@media(hover:hover)]:transition-opacity [@media(hover:hover)]:duration-300 [@media(hover:hover)]:group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), rgba(59,130,246,0.15), transparent 65%)",
          }}
        />

        <div className="relative mt-auto flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800 transition-transform duration-300 group-hover:scale-105 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon name={icon} className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {title}
            </h3>
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

/* ------------------------------------------------------------------ */
/* Email card                                                          */
/* ------------------------------------------------------------------ */

function EmailCard({
  order,
  variants,
}: {
  order: number;
  variants: Variants;
}) {
  const reduced = useReducedMotion();
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copyEmail = useCallback(async () => {
    try {
      await copyToClipboard(contactEmail);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyStatus("idle"), 2000);
  }, []);

  const statusIcon: IconName =
    copyStatus === "copied" ? "check" : copyStatus === "error" ? "alert" : "copy";
  const statusLabel =
    copyStatus === "copied"
      ? "Copied"
      : copyStatus === "error"
        ? "Failed"
        : "Copy email";

  const buttonTone =
    copyStatus === "copied"
      ? "border-blue-600 bg-blue-600 text-white"
      : copyStatus === "error"
        ? "border-red-500 bg-red-500 text-white"
        : "border-zinc-200/80 bg-white/80 text-zinc-700 hover:border-blue-300 hover:text-blue-800 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:text-blue-300";

  return (
    <ContactCard icon="email" title="Email" order={order} variants={variants}>
      <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-300">
        {contactEmail}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`mailto:${contactEmail}`}
          className="text-sm font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-blue-300 dark:hover:text-blue-200"
        >
          Send a message
        </a>

        <motion.button
          type="button"
          onClick={copyEmail}
          whileTap={reduced ? undefined : { scale: 0.94 }}
          className={`inline-flex min-w-[7.5rem] items-center justify-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${buttonTone}`}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={statusIcon}
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: -40 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4, rotate: 40 }}
              transition={{ duration: reduced ? 0 : 0.18 }}
              className="grid place-items-center"
            >
              <Icon name={statusIcon} className="h-3.5 w-3.5" />
            </motion.span>
          </AnimatePresence>
          {statusLabel}
        </motion.button>

        <span role="status" aria-live="polite" className="sr-only">
          {copyStatus === "copied"
            ? "Email address copied to clipboard"
            : copyStatus === "error"
              ? "Could not copy the email address"
              : ""}
        </span>
      </div>
    </ContactCard>
  );
}

/* ------------------------------------------------------------------ */
/* Location card: the route draws itself, the pin drops in             */
/* ------------------------------------------------------------------ */

const MAP_ROUTES = [
  {
    d: "M-20 150 C 50 130, 80 70, 160 92 S 280 48, 420 26",
    width: 12,
    delay: 0,
    className: "text-blue-100/80 dark:text-blue-900/35",
  },
  {
    d: "M30 -10 C 80 60, 120 80, 170 210",
    width: 8,
    delay: 0.25,
    className: "text-blue-100/70 dark:text-blue-900/30",
  },
  {
    d: "M250 -10 C 240 70, 300 120, 280 210",
    width: 8,
    delay: 0.45,
    className: "text-blue-100/70 dark:text-blue-900/30",
  },
] as const;

function MapBackdrop() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const seen = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const visible = useInView(ref);
  const pulse = visible && !lite && !reduced;

  return (
    <div ref={ref} aria-hidden className="absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/40 to-transparent dark:from-blue-950/40 dark:via-zinc-900/20 dark:to-transparent" />

      <svg
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        {MAP_ROUTES.map((route) => (
          <motion.path
            key={route.d}
            d={route.d}
            fill="none"
            stroke="currentColor"
            strokeWidth={route.width}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className={route.className}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: seen || reduced ? 1 : 0 }}
            transition={{ duration: 1.6, delay: route.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>

      <motion.span
        className="absolute left-1/2 top-[38%] grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center"
        initial={reduced ? false : { opacity: 0, y: -28, scale: 0.6 }}
        animate={seen || reduced ? { opacity: 1, y: 0, scale: 1 } : undefined}
        transition={{ type: "spring", stiffness: 300, damping: 16, delay: 0.8 }}
      >
        {pulse &&
          [0, 1].map((ring) => (
            <motion.span
              key={ring}
              className="absolute h-full w-full rounded-full bg-blue-500/50"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 3.4, opacity: 0 }}
              transition={{
                duration: 2.4,
                delay: ring * 1.2,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}
        <span className="relative h-3 w-3 rounded-full bg-blue-700 ring-4 ring-white/70 dark:bg-blue-400 dark:ring-zinc-900/70" />
      </motion.span>
    </div>
  );
}

function LocationCard({
  order,
  variants,
}: {
  order: number;
  variants: Variants;
}) {
  return (
    <ContactCard
      icon="location"
      title="Location"
      order={order}
      variants={variants}
      background={<MapBackdrop />}
      className="min-h-[13rem] lg:flex-1"
    >
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        {profile.location}
      </p>
    </ContactCard>
  );
}

/* ------------------------------------------------------------------ */
/* Social card                                                         */
/* ------------------------------------------------------------------ */

function SocialCard({
  order,
  variants,
}: {
  order: number;
  variants: Variants;
}) {
  return (
    <ContactCard icon="github" title="Social" order={order} variants={variants}>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
        Find me around the web.
      </p>
      <SocialLinks size="sm" className="mt-4 flex-wrap" />
    </ContactCard>
  );
}

/* ------------------------------------------------------------------ */
/* Form field: GPU-only floating label + animated inline error         */
/* ------------------------------------------------------------------ */

function FloatingField({
  id,
  label,
  name,
  type = "text",
  multiline = false,
  rows = 4,
  autoComplete,
  error,
  onValueChange,
}: {
  id: string;
  label: string;
  name: FieldName;
  type?: string;
  multiline?: boolean;
  rows?: number;
  autoComplete?: string;
  error?: string;
  onValueChange?: () => void;
}) {
  const errorId = `${id}-error`;

  const fieldClass = `peer w-full rounded-xl border bg-white/70 px-4 pb-2.5 pt-5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-transparent dark:bg-zinc-900/60 dark:text-zinc-100 ${
    error
      ? "border-red-400 focus:border-red-500 dark:border-red-500/70"
      : "border-zinc-200/80 focus:border-blue-400 dark:border-zinc-700/70"
  }`;

  const sharedProps = {
    id,
    name,
    placeholder: " ",
    required: true,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? errorId : undefined,
    onChange: onValueChange,
  } as const;

  return (
    <div>
      <div className="relative">
        {multiline ? (
          <textarea
            {...sharedProps}
            rows={rows}
            className={`${fieldClass} resize-none`}
          />
        ) : (
          <input
            {...sharedProps}
            type={type}
            autoComplete={autoComplete}
            className={fieldClass}
          />
        )}

        {/* Label moves with transform only (no layout work per frame). */}
        <label
          htmlFor={id}
          className={`pointer-events-none absolute left-4 top-4 origin-left -translate-y-2 scale-75 text-sm font-medium transition-[transform,color] duration-300 ease-out motion-reduce:transition-none peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 ${
            error
              ? "text-red-600 peer-focus:text-red-600 dark:text-red-400 dark:peer-focus:text-red-400"
              : "text-zinc-500 peer-focus:text-blue-700 dark:text-zinc-400 dark:peer-focus:text-blue-300"
          }`}
        >
          {label}
        </label>

        <span
          aria-hidden
          className={`pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r to-transparent transition-transform duration-500 ease-out peer-focus:scale-x-100 motion-reduce:transition-none ${
            error ? "from-red-600 via-red-400" : "from-blue-700 via-blue-500"
          }`}
        />
      </div>

      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden px-1 pt-1.5 text-xs text-red-600 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Contact form                                                        */
/* ------------------------------------------------------------------ */

function validateFields(values: Record<FieldName, string>): FieldErrors {
  const errors: FieldErrors = {};

  if (!values.name) errors.name = "Please enter your name.";

  if (!values.email) errors.email = "Please enter your email.";
  else if (!EMAIL_PATTERN.test(values.email))
    errors.email = "That email doesn’t look right.";

  if (!values.message) errors.message = "Please write a message.";
  else if (values.message.length < MESSAGE_MIN_LENGTH)
    errors.message = `Add a little more detail (at least ${MESSAGE_MIN_LENGTH} characters).`;

  return errors;
}

const SEND_LABELS: Record<SendStatus, string> = {
  idle: "Send message",
  loading: "Preparing email…",
  success: "Email ready",
  error: "Try again",
};

function ContactForm() {
  const reduced = useReducedMotion();
  const { lite } = usePerformanceMode();
  const formId = useId();
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [status, setStatus] = useState<SendStatus>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const clearError = useCallback((name: FieldName) => {
    setErrors((current) =>
      current[name] ? { ...current, [name]: undefined } : current,
    );
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "loading") return;

    // Capture before any await: React clears currentTarget afterwards.
    const form = event.currentTarget;
    const data = new FormData(form);
    const values: Record<FieldName, string> = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    const nextErrors = validateFields(values);
    setErrors(nextErrors);

    const firstInvalid = (["name", "email", "message"] as const).find(
      (field) => nextErrors[field],
    );
    if (firstInvalid) {
      form.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    if (resetTimer.current) clearTimeout(resetTimer.current);
    setStatus("loading");

    // TODO: Replace this mailto fallback with a POST to an API route (e.g. Resend).
    try {
      const subject = encodeURIComponent(`Portfolio message from ${values.name}`);
      const body = encodeURIComponent(
        `${values.message}\n\nFrom: ${values.name}\nEmail: ${values.email}`,
      );

      await new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 450));
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;

      setStatus("success");
      form.reset();
      resetTimer.current = setTimeout(() => setStatus("idle"), 5000);
    } catch {
      setStatus("error");
    }
  };

  const buttonIcon: IconName =
    status === "success" ? "check" : status === "error" ? "alert" : "send";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={status === "loading"}
      className="glass relative overflow-hidden rounded-3xl p-6 shadow-sm sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.18),transparent_70%)]"
      />

      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <h3 className="font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Send a message
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          I usually reply within a day or two.
        </p>
      </div>

      <div className="relative mt-7 space-y-5">
        <FloatingField
          id={`${formId}-name`}
          name="name"
          label="Name"
          autoComplete="name"
          error={errors.name}
          onValueChange={() => clearError("name")}
        />
        <FloatingField
          id={`${formId}-email`}
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email}
          onValueChange={() => clearError("email")}
        />
        <FloatingField
          id={`${formId}-message`}
          name="message"
          label="Message"
          multiline
          error={errors.message}
          onValueChange={() => clearError("message")}
        />
      </div>

      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileTap={reduced ? undefined : { scale: 0.98 }}
        className="group relative mt-7 w-full overflow-hidden rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {/* Sheen sweeps once on hover (transform only, no idle loop) */}
        {!lite && (
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full motion-reduce:hidden"
          />
        )}

        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={status}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: reduced ? 0 : 0.18 }}
            className="relative z-10 flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <motion.span
                aria-hidden
                className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
              />
            ) : (
              <span
                className={`grid place-items-center transition-transform duration-300 ${
                  status === "idle"
                    ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    : ""
                }`}
              >
                <Icon name={buttonIcon} className="h-4 w-4" />
              </span>
            )}
            {SEND_LABELS[status]}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <div role="status" aria-live="polite" className="mt-3 min-h-[1rem] text-center text-xs">
        <AnimatePresence initial={false}>
          {(status === "success" || status === "error") && (
            <motion.p
              key={status}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className={
                status === "success"
                  ? "text-blue-800 dark:text-blue-300"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {status === "success"
                ? "Your email app should open with the message ready."
                : "Something went wrong. Please try again."}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

export default function Contact() {
  const sectionRef = useInViewPause<HTMLElement>();
  const reduced = useReducedMotion() ?? false;
  const { lite } = usePerformanceMode();
  const revealVariants = useMemo(() => createRevealVariants(reduced), [reduced]);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative isolate scroll-mt-20 overflow-hidden px-4 py-24"
    >
      <Backdrop lite={lite} />

      <div className="relative mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <Reveal variant="fade-up">
            <p className="block font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300 sm:text-xs">
              05 / Contact
            </p>
          </Reveal>

          <AnimatedHeading words={HEADING_WORDS} reduced={reduced} />

          <Reveal variant="fade-up" delay={0.35}>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              {profile.tagline}
            </p>
          </Reveal>
        </div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-5"
        >
          <div className="flex flex-col gap-4 lg:col-span-2">
            <EmailCard order={0} variants={revealVariants} />
            <LocationCard order={1} variants={revealVariants} />
            <SocialCard order={2} variants={revealVariants} />
          </div>

          <motion.div
            custom={1}
            variants={revealVariants}
            className="h-full lg:col-span-3"
          >
            <ContactForm />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
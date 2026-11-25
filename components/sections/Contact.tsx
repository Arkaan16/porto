"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { contactEmail, profile } from "@/data/profile";
import { Icon } from "@/components/ui/Icon";
import Reveal from "@/components/ui/Reveal";
import SocialLinks from "@/components/ui/SocialLinks";

type CopyStatus = "idle" | "copied" | "error";
type SendStatus = "idle" | "loading" | "success" | "error";

function FloatingField({
  id,
  label,
  name,
  type = "text",
  multiline = false,
  rows = 4,
  autoComplete,
}: {
  id: string;
  label: string;
  name: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  autoComplete?: string;
}) {
  const fieldClass =
    "peer w-full rounded-xl border border-zinc-200/80 bg-white/70 px-4 pb-2.5 pt-5 text-sm text-zinc-900 outline-none transition-colors placeholder:text-transparent focus:border-blue-400 dark:border-zinc-700/70 dark:bg-zinc-900/60 dark:text-zinc-100";

  return (
    <div className="relative">
      {multiline ? (
        <textarea
          id={id}
          name={name}
          rows={rows}
          required
          placeholder=" "
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required
          placeholder=" "
          className={fieldClass}
        />
      )}
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-2 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500 transition-all duration-300 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:uppercase peer-focus:tracking-[0.14em] peer-focus:text-blue-700 dark:text-zinc-400 dark:peer-focus:text-blue-300"
      >
        {label}
      </label>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-4 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-blue-700 via-blue-500 to-transparent transition-transform duration-500 peer-focus:scale-x-100"
      />
    </div>
  );
}

function EmailCard() {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const copyEmail = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(contactEmail);
      } else {
        const input = document.createElement("textarea");
        input.value = contactEmail;
        input.style.position = "fixed";
        input.style.opacity = "0";
        document.body.appendChild(input);
        input.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(input);
        if (!copied) throw new Error("Copy failed");
      }
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopyStatus("idle"), 1800);
  };

  const statusIcon =
    copyStatus === "copied" ? "check" : copyStatus === "error" ? "alert" : "copy";
  const statusLabel =
    copyStatus === "copied"
      ? "Copied"
      : copyStatus === "error"
        ? "Failed"
        : "Copy email";

  return (
    <Reveal variant="fade-left" className="h-full">
      <div className="glass group relative h-full overflow-hidden rounded-3xl p-5 shadow-sm sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-blue-500/15 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        />
        <div className="relative flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon name="email" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-zinc-900 dark:text-zinc-100">
              Email
            </h3>
            <p className="mt-2 break-all text-sm text-zinc-600 dark:text-zinc-300">
              {contactEmail}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${contactEmail}`}
                className="text-sm font-semibold text-blue-800 underline decoration-blue-300 underline-offset-4 transition-colors hover:text-blue-600 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Send a message
              </a>
              <button
                type="button"
                onClick={copyEmail}
                aria-live="polite"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200/80 bg-white/80 px-3 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:border-blue-300 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:border-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-200 dark:hover:text-blue-300"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={statusIcon}
                    initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.5, rotate: 30 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon name={statusIcon} className="h-3.5 w-3.5" />
                  </motion.span>
                </AnimatePresence>
                {statusLabel}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {copyStatus !== "idle" && (
            <motion.span
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.9 }}
              className={`absolute right-4 top-3 rounded-full px-2.5 py-1 font-mono text-[10px] font-medium shadow-sm ${
                copyStatus === "copied"
                  ? "bg-blue-900 text-white dark:bg-blue-600"
                  : "bg-red-600 text-white"
              }`}
            >
              {copyStatus === "copied" ? "Copied to clipboard" : "Copy failed"}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function LocationCard() {
  return (
    <Reveal variant="zoom" delay={0.08} className="h-full">
      <div className="glass relative flex h-full min-h-[13rem] flex-col overflow-hidden rounded-3xl p-5 shadow-sm sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-white/40 to-transparent dark:from-blue-950/40 dark:via-zinc-900/20 dark:to-transparent" />
        <svg
          viewBox="0 0 400 200"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <path
            d="M-20 150 C 50 130, 80 70, 160 92 S 280 48, 420 26"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-blue-100/80 dark:text-blue-900/35"
          />
          <path
            d="M30 -10 C 80 60, 120 80, 170 210"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-blue-100/70 dark:text-blue-900/30"
          />
          <path
            d="M250 -10 C 240 70, 300 120, 280 210"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-blue-100/70 dark:text-blue-900/30"
          />
        </svg>

        <span className="absolute left-1/2 top-1/2 grid h-4 w-4 -translate-x-1/2 -translate-y-1/2 place-items-center">
          <span className="absolute h-full w-full animate-ping rounded-full bg-blue-500/50" />
          <span className="relative h-3 w-3 rounded-full bg-blue-700 ring-4 ring-white/70 dark:bg-blue-400 dark:ring-zinc-900/70" />
        </span>

        <div className="relative mt-auto flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon name="location" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-zinc-900 dark:text-zinc-100">
              Location
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{profile.location}</p>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

function SocialCard() {
  return (
    <Reveal variant="blur-in" delay={0.16} className="h-full">
      <div className="glass relative h-full overflow-hidden rounded-3xl p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300">
            <Icon name="github" className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-[0.16em] text-zinc-900 dark:text-zinc-100">
              Social
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              Find me around the web.
            </p>
          </div>
        </div>
        <SocialLinks size="sm" className="mt-5 flex-wrap" />
      </div>
    </Reveal>
  );
}

function ContactForm() {
  const reduced = useReducedMotion();
  const [status, setStatus] = useState<SendStatus>("idle");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const email = String(data.get("email") ?? "");
    const message = String(data.get("message") ?? "");

    setStatus("loading");

    // TODO: Replace this mailto fallback with a POST to an API route powered by Resend.
    try {
      const subject = encodeURIComponent(`Portfolio message from ${name}`);
      const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
      await new Promise((resolve) => setTimeout(resolve, reduced ? 0 : 450));
      window.location.href = `mailto:${contactEmail}?subject=${subject}&body=${body}`;
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const buttonLabel =
    status === "loading"
      ? "Preparing email..."
      : status === "success"
        ? "Email ready"
        : status === "error"
          ? "Try again"
          : "Send message";

  return (
    <form
      onSubmit={handleSubmit}
      className="glass relative overflow-hidden rounded-3xl p-6 shadow-sm sm:p-8"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300">
            Say hello
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Send a message
          </h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          I usually reply within a day or two.
        </p>
      </div>

      <div className="relative mt-7 space-y-5">
        <FloatingField id="contact-name" name="name" label="Name" autoComplete="name" />
        <FloatingField
          id="contact-email"
          name="email"
          label="Email"
          type="email"
          autoComplete="email"
        />
        <FloatingField id="contact-message" name="message" label="Message" multiline />
      </div>

      <motion.button
        type="submit"
        disabled={status === "loading"}
        whileHover={reduced ? undefined : { y: -2 }}
        whileTap={reduced ? undefined : { scale: 0.99 }}
        className="group relative mt-7 w-full overflow-hidden rounded-xl bg-blue-900 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition-colors hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        <span
          aria-hidden
          className="absolute inset-0 animate-shimmer bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.28),transparent)] bg-[length:200%_100%]"
        />
        <span className="relative z-10 flex items-center justify-center gap-2">
          {status === "loading" ? (
            <motion.span
              aria-hidden
              className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, ease: "linear", repeat: Infinity }}
            />
          ) : (
            <Icon
              name={status === "success" ? "check" : status === "error" ? "alert" : "send"}
              className="h-4 w-4"
            />
          )}
          {buttonLabel}
        </span>
      </motion.button>

      <AnimatePresence initial={false}>
        {status !== "idle" && status !== "loading" && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={`mt-3 text-center text-xs ${
              status === "success"
                ? "text-blue-800 dark:text-blue-300"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {status === "success"
              ? "Your email app should open with the message ready."
              : "Something went wrong. Please try again."}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

export default function Contact() {
  return (
    <section id="contact" className="relative isolate overflow-hidden px-4 py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-zinc-50 to-white dark:from-[#0b1220] dark:via-zinc-950 dark:to-[#081426]" />
        <div className="absolute inset-0 blue-dots opacity-50 dark:opacity-30" />
        <div className="absolute inset-0 grid-bg opacity-15 dark:opacity-10" />
        <div className="absolute inset-0">
          <div className="noise h-full w-full" />
        </div>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <Reveal variant="blur-in">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-blue-700 dark:text-blue-300 sm:text-xs">
              05 / Contact
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[1.05] text-gradient sm:text-5xl lg:text-6xl">
              Let&apos;s build something together
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 sm:text-base">
              {profile.tagline}
            </p>
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-5">
          <div className="flex flex-col gap-4 lg:col-span-2">
            <EmailCard />
            <LocationCard />
            <SocialCard />
          </div>
          <Reveal variant="fade-right" delay={0.2} className="h-full lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useAuth, useSignIn } from "@clerk/nextjs";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Clock3, LoaderCircle, ShieldCheck } from "lucide-react";
import { FaTelegram } from "react-icons/fa6";

declare global {
  interface Window {
    TelegramGameProxy?: {
      receiveEvent?: (...args: unknown[]) => void;
    };
    Telegram?: {
      WebApp?: {
        initData?: string;
        ready?: () => void;
        expand?: () => void;
      };
    };
  }
}

export default function TelegramSignInPage() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const started = useRef(false);
  const [isTelegramScriptReady, setIsTelegramScriptReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("Connecting to Telegram…");

  useEffect(() => {
    window.TelegramGameProxy ??= { receiveEvent: () => undefined };
  }, []);

  const checkApprovalAndSignIn = useCallback(async () => {
    if (!isLoaded || !signIn || isChecking) return;
    const webApp = window.Telegram?.WebApp;
    const initData = webApp?.initData;
    if (!initData) {
      setMessage("Open this page from the approved Telegram Mini App.");
      return;
    }

    webApp.ready?.();
    webApp.expand?.();
    setIsChecking(true);

    try {
      const response = await fetch("/api/auth/telegram-mini-app", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      });
      const data = await response.json();
      if (response.status === 202 && data.status === "pending") {
        setIsPending(true);
        setMessage("Access is pending admin approval. Please wait for an admin to approve your request before signing in.");
        return;
      }
      if (!response.ok) throw new Error(data.error || "Telegram sign-in failed");

      setIsPending(false);
      setMessage("Signing you in…");
      const signInAttempt = await signIn.create({ strategy: "ticket", ticket: data.ticket });
      if (signInAttempt.status !== "complete" || !signInAttempt.createdSessionId) {
        throw new Error("Clerk sign-in did not complete");
      }
      await setActive({ session: signInAttempt.createdSessionId });
      router.replace("/search");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Telegram sign-in failed");
      setIsPending(false);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking, isLoaded, router, setActive, signIn]);

  useEffect(() => {
    if (!isAuthLoaded || !isLoaded || !isTelegramScriptReady || started.current) return;
    if (isSignedIn) {
      router.replace("/search");
      return;
    }

    started.current = true;
    const timer = window.setTimeout(() => void checkApprovalAndSignIn(), 0);
    return () => window.clearTimeout(timer);
  }, [checkApprovalAndSignIn, isAuthLoaded, isLoaded, isSignedIn, isTelegramScriptReady, router]);

  useEffect(() => {
    if (!isPending) return;
    const timer = window.setInterval(() => void checkApprovalAndSignIn(), 10_000);
    return () => window.clearInterval(timer);
  }, [checkApprovalAndSignIn, isPending]);

  const isSigningIn = message === "Signing you in…";
  const isError = !isChecking && !isPending && !isSigningIn && message !== "Connecting to Telegram…";

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js?63"
        strategy="afterInteractive"
        onReady={() => setIsTelegramScriptReady(true)}
        onError={() => setMessage("Could not load Telegram. Reopen this page inside Telegram.")}
      />
      <main className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white text-center shadow-xl shadow-slate-900/10">
        <div className="h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-sky-600" />
        <div className="px-7 pb-8 pt-9 sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] bg-sky-500 text-white shadow-lg shadow-sky-500/25">
            <FaTelegram aria-hidden="true" className="h-11 w-11 -ml-1" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Learning on Telegram</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
            Sign in securely with your Telegram account to continue to your courses.
          </p>

          <div className={`mt-7 rounded-2xl border p-4 text-left ${isError ? "border-rose-200 bg-rose-50" : isPending ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 shrink-0 ${isError ? "text-rose-600" : isPending ? "text-amber-600" : "text-sky-600"}`}>
                {isError ? <AlertCircle className="h-5 w-5" /> : isPending ? <Clock3 className="h-5 w-5" /> : isSigningIn ? <LoaderCircle className="h-5 w-5 animate-spin" /> : isChecking ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
              </div>
              <div>
                <p className={`text-sm font-semibold ${isError ? "text-rose-900" : isPending ? "text-amber-900" : "text-slate-900"}`}>
                  {isError ? "Couldn’t sign in" : isPending ? "Waiting for admin approval" : isSigningIn ? "Signing you in" : "Connecting to Telegram"}
                </p>
                <p className={`mt-1 text-sm leading-5 ${isError ? "text-rose-800" : isPending ? "text-amber-800" : "text-slate-600"}`}>{message}</p>
              </div>
            </div>
          </div>

          {isPending && (
            <button
              type="button"
              disabled={isChecking}
              onClick={checkApprovalAndSignIn}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-200 disabled:cursor-wait disabled:opacity-60"
            >
              {isChecking ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Checking approval…</> : "I’ve been approved — continue"}
            </button>
          )}

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Your Telegram identity is securely verified</span>
          </div>
        </div>
      </main>
    </>
  );
}

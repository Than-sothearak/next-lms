"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TelegramRootGate() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  const checkTelegram = () => {
    if (window.Telegram?.WebApp?.initData) router.replace("/telegram-sign-in");
    else router.replace("/sign-in");
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js?63"
        strategy="afterInteractive"
        onReady={checkTelegram}
        onError={() => {
          setIsChecking(false);
          router.replace("/sign-in");
        }}
      />
      <main className="p-8 text-center text-sm text-slate-600">
        {isChecking ? "Opening your account…" : "Redirecting to sign in…"}
      </main>
    </>
  );
}

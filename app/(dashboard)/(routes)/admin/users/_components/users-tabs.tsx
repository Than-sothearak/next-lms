"use client";

import { useState } from "react";
import { TelegramAllowlist } from "./telegram-allowlist";
import { UserDataTable } from "./user-data-table";

type Tab = "users" | "telegram";

export function UsersTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("users");

  return (
    <div className="space-y-5">
      <div role="tablist" aria-label="User management sections" className="flex gap-2 border-b">
        <button
          type="button"
          role="tab"
          id="users-tab"
          aria-selected={activeTab === "users"}
          aria-controls="users-panel"
          onClick={() => setActiveTab("users")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "users" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          All users
        </button>
        <button
          type="button"
          role="tab"
          id="telegram-tab"
          aria-selected={activeTab === "telegram"}
          aria-controls="telegram-panel"
          onClick={() => setActiveTab("telegram")}
          className={`border-b-2 px-4 py-2 text-sm font-medium ${activeTab === "telegram" ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
        >
          Telegram approvals
        </button>
      </div>
      {activeTab === "users" ? (
        <div role="tabpanel" id="users-panel" aria-labelledby="users-tab">
          <UserDataTable />
        </div>
      ) : (
        <div role="tabpanel" id="telegram-panel" aria-labelledby="telegram-tab">
          <TelegramAllowlist />
        </div>
      )}
    </div>
  );
}

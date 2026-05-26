"use client";

import { cn } from "@/lib/utils";
import { Bell, User } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <span className="text-sm text-gray-700">Admin</span>
        </div>
      </div>
    </header>
  );
}

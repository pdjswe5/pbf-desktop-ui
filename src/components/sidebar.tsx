"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Daftar Customer", href: "/daftar-customer", icon: Users },
  { label: "Billing", href: "/billing", icon: Receipt },
  {
    label: "Laporan",
    icon: FileText,
    children: [
      { label: "Histori", href: "/laporan/histori" },
      { label: "Posisi", href: "/laporan/posisi" },
      { label: "Rekap Setahun", href: "/laporan/rekap-setahun" },
    ],
  },
  { label: "Maintenance", href: "/maintenance", icon: AlertTriangle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>(["Laporan"]);

  const toggleExpand = (label: string) => {
    setExpanded((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const NavItem = ({
    item,
    depth = 0,
  }: {
    item: (typeof navItems)[number];
    depth?: number;
  }) => {
    const hasChildren = "children" in item && item.children;
    const isExpanded = expanded.includes(item.label);
    const isActive = pathname === item.href;
    const isChildActive =
      hasChildren &&
      item.children?.some((child) => pathname === child.href);
    const active = isActive || isChildActive;

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpand(item.label)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-gray-200 text-gray-900"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{item.label}</span>
            {isExpanded ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </button>
          {isExpanded &&
            item.children?.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className={cn(
                  "ml-8 flex items-center rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === child.href
                    ? "bg-gray-200 text-gray-900 font-medium"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {child.label}
              </Link>
            ))}
        </div>
      );
    }

    return (
      <Link
        href={item.href!}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-gray-200 text-gray-900"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <item.icon className="h-4 w-4 flex-shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile toggle */}
      <button
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-md border border-gray-200 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white font-bold text-sm">
            AP
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900">APOFAST</h1>
            <p className="text-[10px] text-gray-400">PBF Desktop v1.0</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => (
            <NavItem key={item.label} item={item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <p className="text-[10px] text-gray-400 text-center">
            &copy; 2025 APOFAST. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
}

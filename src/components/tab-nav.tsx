"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Daftar Customer",  href: "/daftar-customer" },
  { label: "Aktivasi",         href: "/aktivasi" },
  { label: "Laporan Posisi",   href: "/laporan/posisi" },
  { label: "Laporan Histori",  href: "/laporan/histori" },
  { label: "Rekap Setahun",    href: "/laporan/rekap-setahun" },
  { label: "Billing",          href: "/billing" },
  { label: "Maintenance",      href: "/maintenance" },
];

export default function TabNav() {
  const pathname = usePathname();

  return (
    <div className="tab-nav">
      {tabs.map((t) => {
        const active =
          pathname === t.href ||
          (t.href !== "/" && pathname.startsWith(t.href));
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`tab-nav-item${active ? " active" : ""}`}
          >
            {t.label}
          </Link>
        );
      })}
      <div className="tab-nav-brand">APOFAST&nbsp;|&nbsp;PBF Desktop v1.0</div>
    </div>
  );
}

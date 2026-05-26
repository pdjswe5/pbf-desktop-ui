"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const menus = [
  {
    label: "File",
    items: [
      { label: "Logout", href: "/" },
      { label: "---" },
      { label: "Keluar", href: "/" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { label: "Stok Barang", href: "/" },
      { label: "Mutasi Stok", href: "/" },
    ],
  },
  {
    label: "Master",
    items: [
      { label: "Daftar Customer", href: "/daftar-customer" },
      { label: "Aktivasi & Manajemen User", href: "/aktivasi" },
      { label: "Data Barang", href: "/" },
      { label: "Data Sales", href: "/" },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Billing", href: "/billing" },
      { label: "Payment", href: "/" },
    ],
  },
  {
    label: "Laporan",
    items: [
      { label: "Posisi User Apofast", href: "/laporan/posisi" },
      { label: "Histori Per Apotek", href: "/laporan/histori" },
      { label: "Rekap Setahun", href: "/laporan/rekap-setahun" },
    ],
  },
  {
    label: "Proses",
    items: [
      { label: "Setting Approval Order", href: "/setting-approval" },
      { label: "---" },
      { label: "Hitung Plafon", href: "/" },
      { label: "Reset Map", href: "/" },
    ],
  },
  {
    label: "Window",
    items: [
      { label: "Tutup Semua", href: "/" },
      { label: "---" },
      { label: "Daftar Customer", href: "/daftar-customer" },
    ],
  },
];

export default function WinMenuBar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleItem = (href: string) => {
    setOpenMenu(null);
    if (href !== "/") router.push(href);
  };

  return (
    <div className="win-menubar" ref={ref}>
      {menus.map((menu) => (
        <div key={menu.label} style={{ position: "relative" }}>
          <div
            className={`win-menu-item${openMenu === menu.label ? " open" : ""}`}
            onMouseDown={() =>
              setOpenMenu(openMenu === menu.label ? null : menu.label)
            }
            onMouseEnter={() => openMenu !== null && setOpenMenu(menu.label)}
          >
            {menu.label}
          </div>
          {openMenu === menu.label && (
            <div className="win-dropdown">
              {menu.items.map((item, i) =>
                item.label === "---" ? (
                  <div key={i} className="win-dropdown-sep" />
                ) : (
                  <div
                    key={i}
                    className="win-dropdown-item"
                    onMouseDown={() => handleItem(item.href!)}
                  >
                    {item.label}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

"use client";

import { useState, useMemo } from "react";
import { customers, aktivasiMonthly, omsetPerCustomer } from "@/lib/dummy-data";

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function fmtRp(n: number): string {
  if (!n) return "—";
  return "Rp " + n.toLocaleString("id-ID");
}

export default function RekapSetahunPage() {
  const today = new Date();
  const [tahun, setTahun] = useState(String(today.getFullYear()));
  const tahunNum = parseInt(tahun);

  const rows = useMemo(() => {
    return customers.map((c) => {
      const months = MONTHS_SHORT.map((_, idx) => {
        const mm = String(idx + 1).padStart(2, "0");
        const key = `${c.kode}-${tahunNum}-${mm}`;
        return !!aktivasiMonthly[key];
      });
      const jmlBulan = months.filter(Boolean).length;
      const omset = omsetPerCustomer[`${c.kode}-${tahunNum}`] ?? 0;
      return { customer: c, months, jmlBulan, omset };
    });
  }, [tahunNum]);

  // Only show customers that have at least 1 active month
  const visible = rows.filter((r) => r.jmlBulan > 0);

  // Totals
  const totalPerMonth = MONTHS_SHORT.map((_, idx) => visible.filter((r) => r.months[idx]).length);
  const totalJmlBulan = visible.reduce((s, r) => s + r.jmlBulan, 0);
  const totalOmset = visible.reduce((s, r) => s + r.omset, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Laporan Rekap Setahun</div>

      <div className="win-toolbar">
        <button className="win-btn">🖨️ Print</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      <div className="win-searchbar" style={{ gap: 8 }}>
        <span style={{ fontWeight: "bold" }}>Tahun:</span>
        <select className="win-select" value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ width: 80 }}>
          {["2023", "2024", "2025", "2026", "2027"].map((y) => <option key={y}>{y}</option>)}
        </select>
        <span style={{ marginLeft: 12, color: "#6B7280" }}>
          {visible.length} apotek aktif di tahun {tahun}
        </span>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table className="win-grid" style={{ minWidth: "max-content" }}>
          <thead>
            <tr>
              <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
              <th style={{ minWidth: 100 }}>Kode</th>
              <th style={{ minWidth: 220 }}>Nama Apotek</th>
              {MONTHS_SHORT.map((m) => (
                <th key={m} style={{ minWidth: 38, textAlign: "center" }}>{m}</th>
              ))}
              <th style={{ minWidth: 60, textAlign: "center" }}>Jml Bln</th>
              <th style={{ minWidth: 140, textAlign: "right" }}>Omset Tahun Ini</th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 && (
              <tr>
                <td colSpan={17} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                  Tidak ada data aktivasi untuk tahun {tahun}
                </td>
              </tr>
            )}
            {visible.map(({ customer: c, months, jmlBulan, omset }, i) => (
              <tr key={c.id} style={{ cursor: "default" }}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td style={{ color: "#800000", fontWeight: "bold" }}>{c.kode}</td>
                <td>{c.nama}</td>
                {months.map((active, idx) => (
                  <td key={idx} style={{ textAlign: "center", color: active ? "#16a34a" : "#D1D5DB", fontWeight: active ? "bold" : "normal" }}>
                    {active ? "A" : "—"}
                  </td>
                ))}
                <td style={{ textAlign: "center", fontWeight: "bold" }}>{jmlBulan}</td>
                <td style={{ textAlign: "right" }}>{fmtRp(omset)}</td>
              </tr>
            ))}

            {/* TOTAL row */}
            {visible.length > 0 && (
              <tr style={{ fontWeight: "bold", background: "#F3F4F6", borderTop: "2px solid #D1D5DB" }}>
                <td colSpan={3} style={{ textAlign: "right", paddingRight: 8 }}>TOTAL</td>
                {totalPerMonth.map((count, idx) => (
                  <td key={idx} style={{ textAlign: "center" }}>{count || ""}</td>
                ))}
                <td style={{ textAlign: "center" }}>{totalJmlBulan}</td>
                <td style={{ textAlign: "right" }}>{fmtRp(totalOmset)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">Total {visible.length} apotek aktif</div>
        <div className="win-statusbar-panel">Total bulan aktif: {totalJmlBulan}</div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

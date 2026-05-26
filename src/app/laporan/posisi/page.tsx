"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { customers, aktivasiRecords, billingRecords } from "@/lib/dummy-data";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function parseDate(ddmmyyyy: string): Date | null {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0); // month is 1-based here
}

export default function LaporanPosisiPage() {
  const router = useRouter();
  const today = new Date();
  const [bulan, setBulan] = useState(String(today.getMonth() + 1));
  const [tahun, setTahun] = useState(String(today.getFullYear()));
  const [filterStatus, setFilterStatus] = useState<"AKTIF" | "NON_AKTIF" | "SEMUA">("AKTIF");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const bulanNum = parseInt(bulan);
  const tahunNum = parseInt(tahun);

  const belumFinal = useMemo(() => {
    const lastDay = lastDayOfMonth(tahunNum, bulanNum);
    return today <= lastDay && today.getFullYear() === tahunNum && today.getMonth() + 1 === bulanNum;
  }, [bulanNum, tahunNum]);

  const monthFirstDay = new Date(tahunNum, bulanNum - 1, 1);
  const monthLastDay = lastDayOfMonth(tahunNum, bulanNum);

  // Find billing status for selected month
  const billing = billingRecords.find(
    (b) => b.bulan === MONTHS[bulanNum - 1] && b.tahun === tahunNum
  );
  const statusBayar = billing?.status ?? null;

  // Build active rows: for each customer, find their relevant aktivasi record
  const rows = useMemo(() => {
    return customers
      .map((c) => {
        const rec = aktivasiRecords
          .filter((r) => r.customerKode === c.kode)
          .find((r) => {
            const tglAktif = parseDate(r.tglAktif);
            const tglNonAktif = r.tglNonAktif ? parseDate(r.tglNonAktif) : null;
            if (!tglAktif) return false;
            const startedBeforeMonthEnd = tglAktif <= monthLastDay;
            const endedAfterMonthStart = !tglNonAktif || tglNonAktif >= monthFirstDay;
            return startedBeforeMonthEnd && endedAfterMonthStart;
          });
        if (!rec) return null;
        return { customer: c, rec, isActive: !rec.tglNonAktif };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [bulanNum, tahunNum]);

  const filtered = rows.filter((r) => {
    if (filterStatus === "AKTIF") return r.isActive;
    if (filterStatus === "NON_AKTIF") return !r.isActive;
    return true;
  });

  function goForecast() {
    const nextBulan = bulanNum === 12 ? 1 : bulanNum + 1;
    const nextTahun = bulanNum === 12 ? tahunNum + 1 : tahunNum;
    router.push(`/laporan/posisi/forecast?bulan=${nextBulan}&tahun=${nextTahun}`);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Laporan Posisi User Apofast</div>

      <div className="win-toolbar">
        <button className="win-btn">🖨️ Print</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn" onClick={goForecast}>
          📅 Forecast Bulan Depan
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      {/* Filter bar */}
      <div className="win-searchbar" style={{ gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: "bold" }}>Bulan:</span>
        <select className="win-select" value={bulan} onChange={(e) => setBulan(e.target.value)} style={{ width: 120 }}>
          {MONTHS.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
        </select>
        <span style={{ fontWeight: "bold", marginLeft: 8 }}>Tahun:</span>
        <select className="win-select" value={tahun} onChange={(e) => setTahun(e.target.value)} style={{ width: 70 }}>
          {["2024", "2025", "2026", "2027"].map((y) => <option key={y}>{y}</option>)}
        </select>
        <div style={{ marginLeft: 16, display: "flex", gap: 4, alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>Status:</span>
          {([["AKTIF", "Aktif"], ["NON_AKTIF", "Non-Aktif"], ["SEMUA", "Semua"]] as const).map(([val, label]) => (
            <label key={val} className="win-checkbox" style={{ marginLeft: 4 }}>
              <input type="radio" name="posisi-status" checked={filterStatus === val} onChange={() => setFilterStatus(val)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* BELUM FINAL warning */}
      {belumFinal && (
        <div className="notice-bar" style={{ background: "#FEF3C7", borderColor: "#F59E0B", color: "#92400E" }}>
          ⚠ BELUM FINAL — Data aktif 1 s/d {today.getDate()} {MONTHS[bulanNum - 1]} {tahun}. Laporan akan final pada akhir bulan.
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table className="win-grid">
          <thead>
            <tr>
              <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
              <th style={{ minWidth: 110 }}>Kode ERP</th>
              <th style={{ minWidth: 220 }}>Nama Apotek</th>
              <th style={{ minWidth: 110, textAlign: "center" }}>Tgl Start Aktif</th>
              <th style={{ minWidth: 110, textAlign: "center" }}>Tgl Non-Aktif</th>
              <th style={{ minWidth: 100, textAlign: "center" }}>Status Bayar</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                  Tidak ada data untuk periode ini
                </td>
              </tr>
            )}
            {filtered.map(({ customer: c, rec, isActive }, i) => (
              <tr
                key={c.id}
                className={selectedId === c.id ? "win-selected" : ""}
                onClick={() => setSelectedId(c.id)}
                style={{ cursor: "default" }}
              >
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td style={{ color: selectedId === c.id ? undefined : "#800000", fontWeight: "bold" }}>{c.kode}</td>
                <td>{c.nama}</td>
                <td style={{ textAlign: "center", color: selectedId === c.id ? undefined : "#16a34a" }}>
                  {rec.tglAktif}
                </td>
                <td style={{ textAlign: "center", color: selectedId === c.id ? undefined : rec.tglNonAktif ? "#DC2626" : "#9CA3AF" }}>
                  {rec.tglNonAktif || (isActive ? "—" : "—")}
                </td>
                <td style={{ textAlign: "center" }}>
                  {statusBayar === "LUNAS" ? (
                    <span className="badge badge-lunas">LUNAS</span>
                  ) : statusBayar === "BELUM_BAYAR" ? (
                    <span className="badge badge-belum">BELUM BAYAR</span>
                  ) : (
                    <span className="badge badge-estimasi">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">Total: {filtered.length} apotek</div>
        <div className="win-statusbar-panel">
          Billing: {billing ? `${billing.jmlApotekAktif} apotek × Rp ${billing.tarifPerApotek.toLocaleString("id-ID")} = Rp ${billing.totalTagihan.toLocaleString("id-ID")}` : "—"}
        </div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

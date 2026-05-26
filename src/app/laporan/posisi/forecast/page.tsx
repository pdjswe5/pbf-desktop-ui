"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { customers, aktivasiRecords } from "@/lib/dummy-data";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function parseDate(ddmmyyyy: string): Date | null {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

function ForecastContent() {
  const router = useRouter();
  const params = useSearchParams();
  const bulanNum = parseInt(params.get("bulan") ?? "6");
  const tahunNum = parseInt(params.get("tahun") ?? String(new Date().getFullYear()));

  const bulanLabel = MONTHS[bulanNum - 1] ?? "—";
  const generatedAt = new Date().toLocaleString("id-ID");

  const monthFirstDay = new Date(tahunNum, bulanNum - 1, 1);
  const monthLastDay = lastDayOfMonth(tahunNum, bulanNum);

  const rows = useMemo(() => {
    return customers
      .map((c) => {
        const rec = aktivasiRecords
          .filter((r) => r.customerKode === c.kode)
          .find((r) => {
            const tglAktif = parseDate(r.tglAktif);
            const tglNonAktif = r.tglNonAktif ? parseDate(r.tglNonAktif) : null;
            if (!tglAktif) return false;
            return tglAktif <= monthLastDay && (!tglNonAktif || tglNonAktif >= monthFirstDay);
          });
        if (!rec) return null;
        return { customer: c, rec };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);
  }, [bulanNum, tahunNum]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">
        Forecast Laporan Posisi — {bulanLabel} {tahunNum}
      </div>

      <div className="win-toolbar">
        <button className="win-btn" onClick={() => router.back()}>
          ← Kembali
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🖨️ Print</button>
      </div>

      {/* Forecast warning bar */}
      <div className="notice-bar" style={{ background: "#FFF7ED", borderColor: "#F59E0B", color: "#92400E" }}>
        📅 FORECAST — Ini adalah estimasi apotek yang akan aktif pada bulan{" "}
        <strong>{bulanLabel} {tahunNum}</strong>. Data bersifat perkiraan dan dapat berubah.
      </div>

      {/* Stat cards */}
      <div className="stat-cards" style={{ padding: "8px 12px", gap: 8 }}>
        <div className="stat-card">
          <div className="stat-card-label">Estimasi Apotek Aktif</div>
          <div className="stat-card-value">{rows.length} Apotek</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Di-generate pada</div>
          <div className="stat-card-value" style={{ fontSize: 13 }}>{generatedAt}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Status</div>
          <div className="stat-card-value">
            <span className="badge badge-estimasi">FORECAST</span>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table className="win-grid">
          <thead>
            <tr>
              <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
              <th style={{ minWidth: 110 }}>Kode ERP</th>
              <th style={{ minWidth: 220 }}>Nama Apotek</th>
              <th style={{ minWidth: 120 }}>Kota</th>
              <th style={{ minWidth: 110, textAlign: "center" }}>Tgl Start Aktif</th>
              <th style={{ minWidth: 120, textAlign: "center" }}>Estimasi Status Bayar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                  Tidak ada estimasi apotek aktif untuk bulan ini
                </td>
              </tr>
            )}
            {rows.map(({ customer: c, rec }, i) => (
              <tr key={c.id} style={{ cursor: "default" }}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td style={{ color: "#800000", fontWeight: "bold" }}>{c.kode}</td>
                <td>{c.nama}</td>
                <td>{c.kota}</td>
                <td style={{ textAlign: "center", color: "#16a34a" }}>{rec.tglAktif}</td>
                <td style={{ textAlign: "center", fontStyle: "italic", color: "#B45309" }}>
                  Estimasi BELUM BAYAR
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">Estimasi: {rows.length} apotek aktif</div>
        <div className="win-statusbar-panel">
          Perkiraan tagihan: Rp {(rows.length * 50000).toLocaleString("id-ID")}
        </div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>Memuat data forecast…</div>}>
      <ForecastContent />
    </Suspense>
  );
}

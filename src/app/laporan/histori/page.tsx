"use client";

import { useState, useMemo } from "react";
import { customers, aktivasiRecords, billingRecords } from "@/lib/dummy-data";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function parseDate(ddmmyyyy: string): Date | null {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function formatPeriode(tglAktif: string): string {
  const d = parseDate(tglAktif);
  if (!d) return "—";
  return `${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`;
}

function calcDurasi(tglAktif: string, tglNonAktif: string): string {
  const d1 = parseDate(tglAktif);
  const d2 = tglNonAktif ? parseDate(tglNonAktif) : new Date();
  if (!d1 || !d2) return "—";
  const diffMs = d2.getTime() - d1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  return months > 0 ? `${months} bulan` : `${diffDays} hari`;
}

function getStatusBayarForPeriod(tglAktif: string): "LUNAS" | "BELUM_BAYAR" | null {
  const d = parseDate(tglAktif);
  if (!d) return null;
  const monthName = MONTHS[d.getMonth()];
  const year = d.getFullYear();
  const rec = billingRecords.find((b) => b.bulan === monthName && b.tahun === year);
  return rec?.status ?? null;
}

export default function LaporanHistoriPage() {
  const [selectedKode, setSelectedKode] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);

  const selectedCustomer = customers.find((c) => c.kode === selectedKode) ?? null;

  const histori = useMemo(() => {
    if (!selectedKode) return [];
    return aktivasiRecords.filter((r) => r.customerKode === selectedKode);
  }, [selectedKode]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Laporan Histori Per Apotek</div>

      <div className="win-toolbar">
        <button className="win-btn">🖨️ Print</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      {/* Apotek selector */}
      <div className="win-searchbar" style={{ gap: 8 }}>
        <span style={{ fontWeight: "bold" }}>Pilih Apotek:</span>
        <select
          className="win-select"
          style={{ width: 320 }}
          value={selectedKode}
          onChange={(e) => { setSelectedKode(e.target.value); setSelectedRowId(null); }}
        >
          <option value="">— Pilih apotek —</option>
          {customers.map((c) => (
            <option key={c.kode} value={c.kode}>{c.kode} — {c.nama}</option>
          ))}
        </select>
      </div>

      {/* Customer info bar */}
      {selectedCustomer && (
        <div style={{
          display: "flex", gap: 16, padding: "6px 12px", background: "#F9FAFB",
          borderBottom: "1px solid #E5E7EB", fontSize: 11
        }}>
          <span><strong>Kode:</strong> {selectedCustomer.kode}</span>
          <span><strong>Nama:</strong> {selectedCustomer.nama}</span>
          <span><strong>Kota:</strong> {selectedCustomer.kota}</span>
          <span>
            <strong>Status:</strong>{" "}
            <span className={selectedCustomer.aktif ? "badge badge-lunas" : "badge badge-belum"}>
              {selectedCustomer.aktif ? "Aktif" : "Non-Aktif"}
            </span>
          </span>
        </div>
      )}

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        {!selectedKode ? (
          <div style={{ padding: 32, textAlign: "center", color: "#9CA3AF", fontSize: 12 }}>
            Pilih apotek untuk melihat histori aktivasi
          </div>
        ) : (
          <table className="win-grid">
            <thead>
              <tr>
                <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                <th style={{ minWidth: 80, textAlign: "center" }}>Periode</th>
                <th style={{ minWidth: 100, textAlign: "center" }}>Tgl Aktif</th>
                <th style={{ minWidth: 100, textAlign: "center" }}>Tgl Non-Aktif</th>
                <th style={{ minWidth: 80, textAlign: "center" }}>Durasi</th>
                <th style={{ minWidth: 100, textAlign: "center" }}>Status Bayar</th>
                <th style={{ minWidth: 60, textAlign: "center" }}>Admin</th>
                <th style={{ minWidth: 180 }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {histori.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                    Belum ada histori aktivasi
                  </td>
                </tr>
              )}
              {histori.map((r, i) => {
                const durasi = calcDurasi(r.tglAktif, r.tglNonAktif);
                const statusBayar = getStatusBayarForPeriod(r.tglAktif);
                const isSelected = selectedRowId === r.id;
                return (
                  <tr
                    key={r.id}
                    className={isSelected ? "win-selected" : ""}
                    onClick={() => setSelectedRowId(r.id)}
                    style={{ cursor: "default" }}
                  >
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td style={{ textAlign: "center" }}>{formatPeriode(r.tglAktif)}</td>
                    <td style={{ textAlign: "center", color: isSelected ? undefined : "#16a34a" }}>{r.tglAktif}</td>
                    <td style={{ textAlign: "center", color: isSelected ? undefined : r.tglNonAktif ? "#DC2626" : "#9CA3AF" }}>
                      {r.tglNonAktif || "Aktif"}
                    </td>
                    <td style={{ textAlign: "center" }}>{durasi}</td>
                    <td style={{ textAlign: "center" }}>
                      {statusBayar === "LUNAS" ? (
                        <span className="badge badge-lunas">LUNAS</span>
                      ) : statusBayar === "BELUM_BAYAR" ? (
                        <span className="badge badge-belum">BELUM BAYAR</span>
                      ) : (
                        <span style={{ color: "#9CA3AF" }}>—</span>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>{r.admin}</td>
                    <td>{r.keterangan}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">
          {selectedCustomer ? `${histori.length} record histori` : "Pilih apotek"}
        </div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

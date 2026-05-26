"use client";

import { useState, useMemo } from "react";
import { billingRecords, customers, aktivasiRecords, type BillingRecord } from "@/lib/dummy-data";

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function fmtRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

function parseDate(ddmmyyyy: string): Date | null {
  if (!ddmmyyyy) return null;
  const [d, m, y] = ddmmyyyy.split("/").map(Number);
  return new Date(y, m - 1, d);
}

function lastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month, 0);
}

export default function BillingPage() {
  const today = new Date();
  const currentBulanIdx = today.getMonth(); // 0-based
  const currentTahun = today.getFullYear();

  const [records, setRecords] = useState<BillingRecord[]>(billingRecords);
  const [showPreview, setShowPreview] = useState(false);

  // Current billing = the one for current month (BELUM_BAYAR) or latest
  const currentBilling = records.find(
    (b) => b.bulan === MONTHS[currentBulanIdx] && b.tahun === currentTahun
  ) ?? records[records.length - 1];

  const histori = records.filter((b) => b.id !== currentBilling?.id);

  // Apotek aktif bulan ini
  const activeApotekThisMonth = useMemo(() => {
    const monthFirst = new Date(currentTahun, currentBulanIdx, 1);
    const monthLast = lastDayOfMonth(currentTahun, currentBulanIdx + 1);
    return customers.filter((c) => {
      return aktivasiRecords.some((r) => {
        if (r.customerKode !== c.kode) return false;
        const tglAktif = parseDate(r.tglAktif);
        const tglNonAktif = r.tglNonAktif ? parseDate(r.tglNonAktif) : null;
        if (!tglAktif) return false;
        return tglAktif <= monthLast && (!tglNonAktif || tglNonAktif >= monthFirst);
      });
    });
  }, []);

  function konfirmasiLunas(id: number) {
    const today2 = new Date();
    const dd = String(today2.getDate()).padStart(2, "0");
    const mm = String(today2.getMonth() + 1).padStart(2, "0");
    const yyyy = today2.getFullYear();
    setRecords((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, status: "LUNAS", tglBayar: `${dd}/${mm}/${yyyy}` } : b
      )
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Billing / Tagihan Langganan</div>

      <div className="win-toolbar">
        <button className="win-btn">🖨️ Print</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">📤 Export</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#F9FAFB", padding: 12 }}>
        {/* ── Section: Tagihan Bulan Ini ── */}
        <div className="section-card" style={{ marginBottom: 12 }}>
          <div className="section-card-header">
            Tagihan Bulan Ini — {currentBilling?.bulan} {currentBilling?.tahun}
          </div>
          <div style={{ padding: 12 }}>
            {/* Stat cards */}
            <div className="stat-cards" style={{ marginBottom: 12 }}>
              <div className="stat-card">
                <div className="stat-card-label">Apotek Aktif</div>
                <div className="stat-card-value">{currentBilling?.jmlApotekAktif ?? 0} Apotek</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Tarif per Apotek</div>
                <div className="stat-card-value">{fmtRp(currentBilling?.tarifPerApotek ?? 50000)}</div>
              </div>
              <div className="stat-card">
                <div className="stat-card-label">Total Tagihan</div>
                <div className="stat-card-value">
                  {fmtRp(currentBilling?.totalTagihan ?? 0)}
                  {currentBilling && (
                    <span style={{ marginLeft: 8 }}>
                      <span className={currentBilling.status === "LUNAS" ? "badge badge-lunas" : "badge badge-belum"}>
                        {currentBilling.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Action */}
            {currentBilling && currentBilling.status === "BELUM_BAYAR" && (
              <div style={{ marginBottom: 10 }}>
                <button
                  className="win-btn"
                  style={{ fontWeight: "bold", color: "#16a34a" }}
                  onClick={() => konfirmasiLunas(currentBilling.id)}
                >
                  ✓ Konfirmasi LUNAS
                </button>
              </div>
            )}
            {currentBilling && currentBilling.status === "LUNAS" && (
              <div style={{ fontSize: 11, color: "#16a34a", marginBottom: 8 }}>
                Pembayaran dikonfirmasi pada {currentBilling.tglBayar}
              </div>
            )}

            {/* Preview apotek */}
            <div>
              <button
                className="win-btn"
                onClick={() => setShowPreview((v) => !v)}
              >
                {showPreview ? "▲" : "▼"} Preview Apotek dalam Tagihan ({activeApotekThisMonth.length})
              </button>
              {showPreview && (
                <div style={{ marginTop: 8, border: "1px solid #E5E7EB", borderRadius: 3 }}>
                  <table className="win-grid">
                    <thead>
                      <tr>
                        <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                        <th style={{ minWidth: 110 }}>Kode</th>
                        <th style={{ minWidth: 220 }}>Nama Apotek</th>
                        <th style={{ minWidth: 120 }}>Kota</th>
                        <th style={{ minWidth: 90, textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeApotekThisMonth.map((c, i) => (
                        <tr key={c.id}>
                          <td style={{ textAlign: "center" }}>{i + 1}</td>
                          <td style={{ color: "#800000", fontWeight: "bold" }}>{c.kode}</td>
                          <td>{c.nama}</td>
                          <td>{c.kota}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className={currentBilling?.status === "LUNAS" ? "badge badge-lunas" : "badge badge-belum"}>
                              {currentBilling?.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Section: Histori Pembayaran ── */}
        <div className="section-card">
          <div className="section-card-header">Histori Pembayaran</div>
          <div style={{ padding: 0 }}>
            <table className="win-grid">
              <thead>
                <tr>
                  <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                  <th style={{ minWidth: 110 }}>Bulan</th>
                  <th style={{ minWidth: 60, textAlign: "center" }}>Tahun</th>
                  <th style={{ minWidth: 80, textAlign: "center" }}>Jml Apotek</th>
                  <th style={{ minWidth: 130, textAlign: "right" }}>Total Tagihan</th>
                  <th style={{ minWidth: 90, textAlign: "center" }}>Status</th>
                  <th style={{ minWidth: 100, textAlign: "center" }}>Tgl Bayar</th>
                  <th style={{ minWidth: 140, textAlign: "center" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {records.map((b, i) => (
                  <tr key={b.id} style={{ cursor: "default" }}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td>{b.bulan}</td>
                    <td style={{ textAlign: "center" }}>{b.tahun}</td>
                    <td style={{ textAlign: "center" }}>{b.jmlApotekAktif}</td>
                    <td style={{ textAlign: "right" }}>{fmtRp(b.totalTagihan)}</td>
                    <td style={{ textAlign: "center" }}>
                      <span className={b.status === "LUNAS" ? "badge badge-lunas" : "badge badge-belum"}>
                        {b.status === "LUNAS" ? "LUNAS" : "BELUM BAYAR"}
                      </span>
                    </td>
                    <td style={{ textAlign: "center" }}>{b.tglBayar || "—"}</td>
                    <td style={{ textAlign: "center" }}>
                      {b.status === "BELUM_BAYAR" ? (
                        <button
                          className="win-btn"
                          style={{ fontSize: 10, color: "#16a34a" }}
                          onClick={() => konfirmasiLunas(b.id)}
                        >
                          ✓ Konfirmasi LUNAS
                        </button>
                      ) : (
                        <span style={{ color: "#9CA3AF", fontSize: 10 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">
          {records.filter((b) => b.status === "LUNAS").length} bulan LUNAS /{" "}
          {records.filter((b) => b.status === "BELUM_BAYAR").length} bulan belum bayar
        </div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

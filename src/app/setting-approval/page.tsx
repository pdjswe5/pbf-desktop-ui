"use client";

import { useState } from "react";
import { customers } from "@/lib/dummy-data";

interface ApprovalRow {
  kode: string;
  nama: string;
  kota: string;
  approvalAktif: boolean;
  saved: boolean;
}

export default function SettingApprovalPage() {
  const [rows, setRows] = useState<ApprovalRow[]>(
    customers.map((c) => ({
      kode: c.kode,
      nama: c.nama,
      kota: c.kota,
      approvalAktif: false,
      saved: true,
    }))
  );
  const [search, setSearch] = useState("");

  const filtered = rows.filter(
    (r) =>
      r.nama.toLowerCase().includes(search.toLowerCase()) ||
      r.kode.toLowerCase().includes(search.toLowerCase())
  );

  function toggleApproval(kode: string) {
    setRows((prev) =>
      prev.map((r) => r.kode === kode ? { ...r, approvalAktif: !r.approvalAktif, saved: false } : r)
    );
  }

  function saveRow(kode: string) {
    setRows((prev) =>
      prev.map((r) => r.kode === kode ? { ...r, saved: true } : r)
    );
  }

  function saveAll() {
    setRows((prev) => prev.map((r) => ({ ...r, saved: true })));
  }

  const unsavedCount = rows.filter((r) => !r.saved).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Setting Approval Order</div>

      <div className="win-toolbar">
        <button className="win-btn" onClick={saveAll} disabled={unsavedCount === 0}
          style={{ fontWeight: unsavedCount > 0 ? "bold" : undefined }}>
          💾 Simpan Semua{unsavedCount > 0 ? ` (${unsavedCount})` : ""}
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      {/* Info bar */}
      <div className="notice-bar" style={{ background: "#EFF6FF", borderColor: "#93C5FD", color: "#1E40AF" }}>
        Jika Approval <strong>Aktif</strong>: setiap pesanan apotek wajib di-approve sebelum dikirim ke PBF.
        Jika <strong>Non-aktif</strong>: pesanan langsung masuk ke sistem PBF tanpa approval.
      </div>

      {/* Search */}
      <div className="win-searchbar" style={{ gap: 8 }}>
        <span style={{ fontWeight: "bold" }}>Pencarian:</span>
        <input
          className="win-input"
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Kode atau nama apotek…"
        />
        <span style={{ color: "#6B7280", marginLeft: 8 }}>{filtered.length} apotek</span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table className="win-grid">
          <thead>
            <tr>
              <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
              <th style={{ minWidth: 110 }}>Kode</th>
              <th style={{ minWidth: 220 }}>Nama Apotek</th>
              <th style={{ minWidth: 120 }}>Kota</th>
              <th style={{ minWidth: 120, textAlign: "center" }}>Status Approval</th>
              <th style={{ minWidth: 100, textAlign: "center" }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <tr key={r.kode} style={{ cursor: "default", background: r.saved ? undefined : "#FFFBEB" }}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td style={{ color: "#800000", fontWeight: "bold" }}>{r.kode}</td>
                <td>{r.nama}</td>
                <td>{r.kota}</td>
                <td style={{ textAlign: "center" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={r.approvalAktif}
                      onChange={() => toggleApproval(r.kode)}
                      style={{ width: 14, height: 14 }}
                    />
                    <span className={r.approvalAktif ? "badge badge-lunas" : "badge badge-belum"}>
                      {r.approvalAktif ? "Aktif" : "Non-aktif"}
                    </span>
                  </label>
                </td>
                <td style={{ textAlign: "center" }}>
                  {!r.saved ? (
                    <button
                      className="win-btn"
                      style={{ fontSize: 10 }}
                      onClick={() => saveRow(r.kode)}
                    >
                      💾 Simpan
                    </button>
                  ) : (
                    <span style={{ color: "#9CA3AF", fontSize: 10 }}>Tersimpan</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">
          {rows.filter((r) => r.approvalAktif).length} apotek approval aktif
        </div>
        {unsavedCount > 0 && (
          <div className="win-statusbar-panel" style={{ color: "#B45309" }}>
            {unsavedCount} perubahan belum disimpan
          </div>
        )}
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

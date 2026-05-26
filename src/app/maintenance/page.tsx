"use client";

import { useState } from "react";
import { adminLogs } from "@/lib/dummy-data";

export default function MaintenancePage() {
  const [mode, setMode] = useState(false);
  const [logs] = useState(adminLogs);

  function toggleMode() {
    setMode((v) => !v);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      <div className="win-window-title">Maintenance</div>

      <div className="win-toolbar">
        <button className="win-btn" onClick={toggleMode}>
          {mode ? "🔓 Nonaktifkan Maintenance" : "🔒 Aktifkan Maintenance"}
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🔄 Rebuild / Refresh Data Master</button>
        <button className="win-btn">🔁 Sinkronisasi ke Server Apofast</button>
        <div className="win-toolbar-sep" />
        <button className="win-btn">🚪 Keluar</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", background: "#F9FAFB", padding: 12, display: "flex", flexDirection: "column", gap: 12 }}>
        {/* ── Status Mode Maintenance ── */}
        <div className="section-card">
          <div className="section-card-header">Status Mode Maintenance</div>
          <div style={{ padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 14, height: 14, borderRadius: "50%",
              background: mode ? "#DC2626" : "#16a34a",
              flexShrink: 0,
            }} />
            <div>
              <div style={{ fontWeight: "bold", color: mode ? "#DC2626" : "#16a34a", fontSize: 12 }}>
                {mode ? "MAINTENANCE MODE AKTIF" : "NORMAL — Semua apotek dapat login"}
              </div>
              {mode && (
                <div style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                  Semua login apotek dinonaktifkan sementara selama maintenance berlangsung.
                </div>
              )}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                className="win-btn"
                style={{ fontWeight: "bold", color: mode ? "#16a34a" : "#DC2626" }}
                onClick={toggleMode}
              >
                {mode ? "🔓 Nonaktifkan Maintenance" : "🔒 Aktifkan Maintenance"}
              </button>
            </div>
          </div>
        </div>

        {/* ── Log Aktivitas Admin ── */}
        <div className="section-card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div className="section-card-header">Log Aktivitas Admin</div>
          <div style={{ flex: 1, overflow: "auto" }}>
            <table className="win-grid">
              <thead>
                <tr>
                  <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                  <th style={{ minWidth: 150 }}>Waktu</th>
                  <th style={{ minWidth: 60, textAlign: "center" }}>Admin</th>
                  <th style={{ minWidth: 140 }}>Aksi</th>
                  <th style={{ minWidth: 260 }}>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} style={{ cursor: "default" }}>
                    <td style={{ textAlign: "center" }}>{i + 1}</td>
                    <td style={{ fontFamily: "monospace", fontSize: 10 }}>{log.waktu}</td>
                    <td style={{ textAlign: "center", fontWeight: "bold" }}>{log.admin}</td>
                    <td style={{ fontWeight: "bold", color: log.aksi.includes("OFF") || log.aksi.includes("MAINTENANCE ON") ? "#DC2626" : "#111827" }}>
                      {log.aksi}
                    </td>
                    <td>{log.keterangan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="win-statusbar">
        <div className="win-statusbar-panel">Mode: {mode ? "MAINTENANCE" : "NORMAL"}</div>
        <div className="win-statusbar-panel">{logs.length} log aktivitas</div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>
    </div>
  );
}

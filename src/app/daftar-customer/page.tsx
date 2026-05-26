"use client";

import { useState } from "react";
import { customers, type Customer } from "@/lib/dummy-data";
import Link from "next/link";

// ─── helpers ───────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (!n) return "";
  return n.toLocaleString("id-ID");
}

function rowClass(c: Customer, selected: boolean): string {
  if (selected) return "win-selected";
  if (c.blacklist) return "win-row-blacklist";
  if (c.catatan && /TUTUP|MATI|CABUT|JELEK/i.test(c.catatan)) return "win-row-issue";
  return "";
}

// ─── Edit Popup ──────────────────────────────────────────────────────────────
type EditTab = "General" | "NPWP" | "Apoteker" | "Koordinat Map";

function EditPopup({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<EditTab>("General");
  const [form, setForm] = useState<Customer>({ ...customer });

  const set = (field: keyof Customer, value: string | boolean | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="win-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="win-dialog" style={{ width: 520 }}>
        <div className="win-dialog-titlebar">
          <span>{form.kode} — {form.nama}</span>
          <button className="win-dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="win-dialog-body">
          <div className="win-tabs">
            {(["General", "NPWP", "Apoteker", "Koordinat Map"] as EditTab[]).map((t) => (
              <div key={t} className={`win-tab${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
                {t}
              </div>
            ))}
          </div>

          <div className="win-tab-panel" style={{ minHeight: 260 }}>
            {tab === "General" && <TabGeneral form={form} set={set} />}
            {tab === "NPWP" && <TabNPWP form={form} set={set} />}
            {tab === "Apoteker" && <TabApoteker form={form} set={set} />}
            {tab === "Koordinat Map" && <TabKoordinat />}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 4, marginTop: 6 }}>
            <button className="win-btn" onClick={onClose}>
              <span style={{ color: "#1a6e1a" }}>💾</span> Save
            </button>
            <button className="win-btn" onClick={onClose}>
              <span style={{ color: "#cc0000" }}>✕</span> Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab General ─────────────────────────────────────────────────────────────
function TabGeneral({
  form,
  set,
}: {
  form: Customer;
  set: (f: keyof Customer, v: string | boolean | number) => void;
}) {
  return (
    <div style={{ fontSize: 11 }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
        <div style={{ flex: 1 }}>
          <div className="win-form-row">
            <span className="win-form-label">Kode</span>
            <input className="win-input" value={form.kode} readOnly style={{ width: 110 }} />
            <label className="win-checkbox" style={{ marginLeft: 8 }}>
              <input type="checkbox" checked={form.aktif} onChange={(e) => set("aktif", e.target.checked)} />
              AKTIF
            </label>
            <span style={{ fontSize: 9, color: "#555" }}>(un-Check jika tidak aktif atau suspend)</span>
          </div>
        </div>
        <div>
          <label className="win-checkbox">
            <input type="checkbox" checked={form.blacklist} onChange={(e) => set("blacklist", e.target.checked)} />
            <span style={{ color: "red", fontWeight: "bold" }}>BLACKLIST</span>
          </label>
        </div>
      </div>

      <div className="win-form-row">
        <span className="win-form-label">Nama</span>
        <input className="win-input" value={form.nama} onChange={(e) => set("nama", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Alamat</span>
        <input className="win-input" value={form.alamat} onChange={(e) => set("alamat", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Kota</span>
        <input className="win-input" value={form.kota} onChange={(e) => set("kota", e.target.value)} style={{ width: 140 }} />
        <span style={{ marginLeft: 8 }}>Propinsi</span>
        <input className="win-input" value={form.propinsi} onChange={(e) => set("propinsi", e.target.value)} style={{ flex: 1, marginLeft: 4 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Kecamatan</span>
        <input className="win-input" value={form.kecamatan} onChange={(e) => set("kecamatan", e.target.value)} style={{ width: 140 }} />
        <span style={{ marginLeft: 8 }}>Telp</span>
        <input className="win-input" value={form.telpon} onChange={(e) => set("telpon", e.target.value)} style={{ flex: 1, marginLeft: 4 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Tempo</span>
        <input className="win-input" value={form.tempo} onChange={(e) => set("tempo", e.target.value)} style={{ width: 50 }} />
        <span style={{ marginLeft: 4 }}>hari (faktur)</span>
        <span style={{ marginLeft: 12 }}>Fax</span>
        <input className="win-input" value={form.fax} onChange={(e) => set("fax", e.target.value)} style={{ flex: 1, marginLeft: 4 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Tempo (2)</span>
        <input className="win-input" value={form.tempo2} onChange={(e) => set("tempo2", e.target.value)} style={{ width: 50 }} />
        <span style={{ marginLeft: 4 }}>hari (Overdue)</span>
        <span style={{ marginLeft: 12 }}>Plafon Rp.</span>
        <input className="win-input" value={form.plafon} onChange={(e) => set("plafon", e.target.value)} style={{ flex: 1, marginLeft: 4 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Sales</span>
        <input className="win-input" value={form.sales} onChange={(e) => set("sales", e.target.value)} style={{ width: 100 }} />
        <span style={{ marginLeft: 8 }}>AREA</span>
        <select className="win-select" value={form.area} onChange={(e) => set("area", e.target.value)} style={{ marginLeft: 4, width: 60 }}>
          <option value="LK">LK</option>
          <option value="DK">DK</option>
        </select>
        <span style={{ marginLeft: 8 }}>🔍</span>
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Chanel</span>
        <input className="win-input" value={form.channel} onChange={(e) => set("channel", e.target.value)} style={{ width: 80 }} />
        <span style={{ marginLeft: 8 }}>🔍</span>
        <span style={{ marginLeft: 16 }}>Kode PBF</span>
        <input className="win-input" value={form.kodePBF} onChange={(e) => set("kodePBF", e.target.value)} style={{ flex: 1, marginLeft: 4 }} />
      </div>
      <div className="win-form-row" style={{ alignItems: "flex-start" }}>
        <span className="win-form-label">Keterangan</span>
        <textarea
          className="win-input"
          value={form.keterangan}
          onChange={(e) => set("keterangan", e.target.value)}
          style={{ flex: 1, height: 36, resize: "none", paddingTop: 2 }}
        />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
        <div style={{ flex: 1 }}>
          <div className="win-form-row">
            <span className="win-form-label" style={{ minWidth: 80 }}>Bank Transfer</span>
            <input className="win-input" value={form.bankTransfer} onChange={(e) => set("bankTransfer", e.target.value)} style={{ flex: 1 }} />
          </div>
          <div className="win-form-row">
            <span className="win-form-label" style={{ minWidth: 80 }}>Atas Nama</span>
            <input className="win-input" value={form.atasNama} onChange={(e) => set("atasNama", e.target.value)} style={{ flex: 1 }} />
          </div>
          <div className="win-form-row">
            <span className="win-form-label" style={{ minWidth: 80 }}>Kode Cust Prinsipel</span>
            <input className="win-input" value={form.kodeCustPrinsipel} onChange={(e) => set("kodeCustPrinsipel", e.target.value)} style={{ flex: 1 }} />
          </div>
        </div>
        <div>
          <label className="win-checkbox">
            <input type="checkbox" checked={form.wapu} onChange={(e) => set("wapu", e.target.checked)} />
            W.A.P.U
          </label>
          <div style={{ fontSize: 9, color: "#555", marginTop: 2 }}>(check jika nota diatas 1jt,<br />maka kode ppn 020)</div>
        </div>
      </div>
    </div>
  );
}

// ── Tab NPWP ────────────────────────────────────────────────────────────────
function TabNPWP({
  form,
  set,
}: {
  form: Customer;
  set: (f: keyof Customer, v: string | boolean | number) => void;
}) {
  return (
    <div style={{ fontSize: 11 }}>
      <div className="win-form-row">
        <span className="win-form-label">Nomor</span>
        <input className="win-input" value={form.noNPWP} onChange={(e) => set("noNPWP", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Nama</span>
        <input className="win-input" value={form.npwpNama} onChange={(e) => set("npwpNama", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row" style={{ alignItems: "flex-start" }}>
        <span className="win-form-label">Alamat</span>
        <textarea
          className="win-input"
          value={form.npwpAlamat}
          onChange={(e) => set("npwpAlamat", e.target.value)}
          style={{ flex: 1, height: 48, resize: "none", paddingTop: 2 }}
        />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Kota</span>
        <input className="win-input" value={form.npwpKota} onChange={(e) => set("npwpKota", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">No KTP</span>
        <input className="win-input" value={form.noKTP} onChange={(e) => set("noKTP", e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

// ── Tab Apoteker ─────────────────────────────────────────────────────────────
function TabApoteker({
  form,
  set,
}: {
  form: Customer;
  set: (f: keyof Customer, v: string | boolean | number) => void;
}) {
  return (
    <div style={{ fontSize: 11 }}>
      <div className="win-form-row">
        <span className="win-form-label">Nama</span>
        <input className="win-input" value={form.apotekerNama} onChange={(e) => set("apotekerNama", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row" style={{ alignItems: "flex-start" }}>
        <span className="win-form-label">Alamat</span>
        <textarea
          className="win-input"
          value={form.apotekerAlamat}
          onChange={(e) => set("apotekerAlamat", e.target.value)}
          style={{ flex: 1, height: 36, resize: "none", paddingTop: 2 }}
        />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Telp</span>
        <input className="win-input" value={form.apotekerTelp} onChange={(e) => set("apotekerTelp", e.target.value)} style={{ flex: 1 }} />
      </div>
      <div className="win-form-row">
        <span className="win-form-label">No. SIPA</span>
        <input className="win-input" value={form.noSIPA} onChange={(e) => set("noSIPA", e.target.value)} style={{ flex: 1 }} />
        <span style={{ marginLeft: 8 }}>Tgl SIPA</span>
        <input className="win-input" value={form.tglSIPADate} onChange={(e) => set("tglSIPADate", e.target.value)} style={{ width: 86, marginLeft: 4 }} />
        <span style={{ marginLeft: 2 }}>🗓</span>
      </div>
      <div className="win-form-row">
        <span className="win-form-label">No. SIA</span>
        <input className="win-input" value={form.noSIANum} onChange={(e) => set("noSIANum", e.target.value)} style={{ flex: 1 }} />
        <span style={{ marginLeft: 8 }}>Tgl SIA</span>
        <input className="win-input" value={form.tglSIADate} onChange={(e) => set("tglSIADate", e.target.value)} style={{ width: 86, marginLeft: 4 }} />
        <span style={{ marginLeft: 2 }}>🗓</span>
      </div>
      <div className="win-form-row">
        <span className="win-form-label">No CDOB</span>
        <input className="win-input" value={form.noCDOB} onChange={(e) => set("noCDOB", e.target.value)} style={{ flex: 1 }} />
        <span style={{ marginLeft: 8 }}>Tgl CDOB</span>
        <input className="win-input" value={form.tglCDOBDate} onChange={(e) => set("tglCDOBDate", e.target.value)} style={{ width: 86, marginLeft: 4 }} />
        <span style={{ marginLeft: 2 }}>🗓</span>
      </div>
      <div className="win-form-row">
        <span className="win-form-label">Asisten</span>
        <input className="win-input" value={form.asisten} onChange={(e) => set("asisten", e.target.value)} style={{ flex: 1 }} />
      </div>
    </div>
  );
}

// ── Tab Koordinat Map ────────────────────────────────────────────────────────
function TabKoordinat() {
  return (
    <div style={{ padding: 8 }}>
      <button className="win-btn">RESET</button>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function DaftarCustomerPage() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<Customer | null>(null);
  const [data] = useState<Customer[]>(customers);

  const filtered = data.filter(
    (c) =>
      c.nama.toLowerCase().includes(search.toLowerCase()) ||
      c.kode.toLowerCase().includes(search.toLowerCase()) ||
      c.kota.toLowerCase().includes(search.toLowerCase()) ||
      c.sales.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCustomer = data.find((c) => c.id === selectedId) ?? null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Window title */}
      <div className="win-window-title">Daftar Customer</div>

      {/* Toolbar */}
      <div className="win-toolbar">
        <button className="win-btn" title="Tambah">
          <span>👤</span> Tambah
        </button>
        <button className="win-btn" onClick={() => selectedCustomer && setEditTarget(selectedCustomer)} disabled={!selectedId} title="Edit">
          <span>✏️</span> Edit
        </button>
        <button className="win-btn" disabled={!selectedId} title="Hapus">
          <span style={{ color: "red" }}>✕</span> Hapus
        </button>
        <div className="win-toolbar-sep" />
        <Link
          className="win-btn"
          href={selectedCustomer ? `/aktivasi?kode=${selectedCustomer.kode}` : "/aktivasi"}
          style={{ textDecoration: "none" }}
          title="Aktivasi & Manajemen User"
        >
          🔑 Aktivasi
        </Link>
        <div className="win-toolbar-sep" />
        <button className="win-btn" title="Refresh">
          <span>🔄</span> Refresh
        </button>
        <button className="win-btn" title="Saldo">
          <span>💰</span> SALDO
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn" title="Export">
          <span>📤</span> Export
        </button>
        <button className="win-btn" title="Reset Map">
          📍 RESET MAP
        </button>
        <button className="win-btn" title="Hitung Plafon">
          🧮 HITUNG PLAFON
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn" title="Keluar">
          <span>🚪</span> Keluar
        </button>
      </div>

      {/* Search bar */}
      <div className="win-searchbar">
        <span style={{ fontWeight: "bold" }}>Pencarian</span>
        <input
          className="win-input"
          style={{ width: 200 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span style={{ color: "#666", marginLeft: 8 }}>
          {filtered.length} record
        </span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        <table className="win-grid">
          <thead>
            <tr>
              <th style={{ minWidth: 90 }}>Kode</th>
              <th style={{ minWidth: 160 }}>Nama</th>
              <th style={{ minWidth: 200 }}>Alamat</th>
              <th style={{ minWidth: 100 }}>Kota</th>
              <th style={{ minWidth: 80 }}>Sales</th>
              <th style={{ minWidth: 160 }}>Catatan</th>
              <th style={{ minWidth: 80, textAlign: "right" }}>plafon</th>
              <th style={{ minWidth: 100, textAlign: "right", color: "#00008B" }}>saldo</th>
              <th style={{ minWidth: 130 }}>No NPWP</th>
              <th style={{ minWidth: 34, color: "red", textAlign: "center" }}>aktif</th>
              <th style={{ minWidth: 66, color: "red", textAlign: "center" }}>BLACKLIST</th>
              <th style={{ minWidth: 170 }}>Nama NPWP</th>
              <th style={{ minWidth: 130 }}>No KTP</th>
              <th style={{ minWidth: 100 }}>Telpon</th>
              <th style={{ minWidth: 36, textAlign: "center" }}>T.O.P</th>
              <th style={{ minWidth: 46, textAlign: "center" }}>T.O.P(2)</th>
              <th style={{ minWidth: 60 }}>Bank</th>
              <th style={{ minWidth: 80 }}>Nama Bank</th>
              <th style={{ minWidth: 36, textAlign: "center" }}>grup</th>
              <th style={{ minWidth: 34, textAlign: "center" }}>Area</th>
              <th style={{ minWidth: 80, textAlign: "center" }}>tgl_sia</th>
              <th style={{ minWidth: 80, textAlign: "center" }}>tgl_sipa</th>
              <th style={{ minWidth: 80, textAlign: "center" }}>Tgl CDOB</th>
              <th style={{ minWidth: 60 }}>Kode PBF</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => {
              const isSelected = c.id === selectedId;
              const cls = rowClass(c, isSelected);
              const negSaldo = c.saldo < 0;
              const issueCatatan = c.catatan && /TIDAK ADA|TUTUP|MATI|CABUT|JELEK|BELUM/i.test(c.catatan);

              return (
                <tr
                  key={c.id}
                  className={cls}
                  onDoubleClick={() => setEditTarget(c)}
                  onClick={() => setSelectedId(c.id)}
                  style={{ cursor: "default" }}
                >
                  <td className="win-cell-kode" style={{ color: isSelected ? undefined : "#800000", fontWeight: "bold" }}>
                    {c.kode}
                  </td>
                  <td className="win-cell-nama" style={{ color: isSelected ? undefined : "#800000", fontWeight: "bold" }}>
                    {c.nama}
                  </td>
                  <td>{c.alamat}</td>
                  <td>{c.kota}</td>
                  <td>{c.sales}</td>
                  <td style={{ color: isSelected ? undefined : issueCatatan ? "red" : undefined }}>
                    {c.catatan}
                  </td>
                  <td style={{ textAlign: "right" }}>{fmt(c.plafon)}</td>
                  <td style={{ textAlign: "right", color: isSelected ? undefined : negSaldo ? "red" : c.saldo > 0 ? "#00008B" : undefined }}>
                    {fmt(c.saldo)}
                  </td>
                  <td>{c.noNPWP}</td>
                  <td style={{ textAlign: "center", color: isSelected ? undefined : "red", fontWeight: "bold" }}>
                    {c.aktif ? "Y" : ""}
                  </td>
                  <td style={{ textAlign: "center", color: isSelected ? undefined : "red", fontWeight: "bold" }}>
                    {c.blacklist ? "Y" : ""}
                  </td>
                  <td>{c.namaNPWP}</td>
                  <td>{c.noKTP}</td>
                  <td>{c.telpon}</td>
                  <td style={{ textAlign: "center", color: isSelected ? undefined : "red" }}>{c.top || 0}</td>
                  <td style={{ textAlign: "center", color: isSelected ? undefined : "red" }}>{c.top2 || 0}</td>
                  <td>{c.bank}</td>
                  <td>{c.namaBank}</td>
                  <td style={{ textAlign: "center" }}>{c.grup}</td>
                  <td style={{ textAlign: "center" }}>{c.area}</td>
                  <td style={{ textAlign: "center" }}>{c.tglSIA}</td>
                  <td style={{ textAlign: "center" }}>{c.tglSIPA}</td>
                  <td style={{ textAlign: "center" }}>{c.tglCDOB}</td>
                  <td>{c.kodePBF}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="win-statusbar">
        <div className="win-statusbar-panel">Create by : 30/09/2025 08:41:36</div>
        <div className="win-statusbar-panel">Edit by : MM: 24/04/2026 08:34:51</div>
        <div className="win-statusbar-panel" style={{ flex: 1 }}></div>
        <div className="win-statusbar-panel">MAKASAR</div>
        <div className="win-statusbar-panel">V.140426</div>
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">Last Modified: 22-04-2026 15:04:32</div>
      </div>

      {/* Edit popup */}
      {editTarget && <EditPopup customer={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  );
}

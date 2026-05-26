"use client";

import { useState, useMemo, useRef, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  customers,
  aktivasiRecords,
  mobileUsers,
  type Customer,
  type AktivasiRecord,
  type MobileUser,
} from "@/lib/dummy-data";

// ─── helpers ───────────────────────────────────────────────────────────────
function fmtCurrency(n: number): string {
  if (!n) return "—";
  return "Rp " + n.toLocaleString("id-ID");
}

function parseDateDMY(s: string): Date | null {
  if (!s) return null;
  const [d, m, y] = s.split("/").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function isEndOfMonth(dateStr: string): boolean {
  if (!dateStr) return false;
  const [d, m, y] = dateStr.split("/").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return d === lastDay;
}

function getMonthName(dateStr: string): string {
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  if (!dateStr) return "";
  const m = parseInt(dateStr.split("/")[1]) - 1;
  return months[m] ?? "";
}

function getLatestAktivasi(kode: string, records: AktivasiRecord[]): AktivasiRecord | undefined {
  return records
    .filter((r) => r.customerKode === kode)
    .sort((a, b) => {
      const da = parseDateDMY(a.tglAktif)?.getTime() ?? 0;
      const db = parseDateDMY(b.tglAktif)?.getTime() ?? 0;
      return db - da;
    })[0];
}

function getAktivasiHistory(kode: string, records: AktivasiRecord[]): AktivasiRecord[] {
  return records
    .filter((r) => r.customerKode === kode)
    .sort((a, b) => {
      const da = parseDateDMY(a.tglAktif)?.getTime() ?? 0;
      const db = parseDateDMY(b.tglAktif)?.getTime() ?? 0;
      return db - da;
    });
}

function getUsersByKode(kode: string, users: MobileUser[]): MobileUser[] {
  return users.filter((u) => u.customerKode === kode);
}

// ─── Searchable Dropdown Component ─────────────────────────────────────────
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder ?? "— Pilih —";

  const filtered = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} style={{ position: "relative", minWidth: 280 }}>
      <div
        className="win-input"
        style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}
        onClick={() => setOpen(!open)}
      >
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedLabel}</span>
        <span style={{ fontSize: 10, color: "#6B7280" }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid var(--c-border-dark)",
            borderRadius: 3,
            zIndex: 50,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            maxHeight: 280,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <input
            className="win-input"
            style={{ border: "none", borderBottom: "1px solid var(--c-border)", borderRadius: 0, width: "100%" }}
            placeholder="Cari apotek…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div style={{ overflow: "auto", maxHeight: 240 }}>
            <div
              style={{ padding: "4px 10px", fontSize: 11, cursor: "pointer", color: value === "" ? "#1E40AF" : "inherit", background: value === "" ? "#EFF6FF" : "transparent" }}
              onMouseDown={() => { onChange(""); setSearch(""); setOpen(false); }}
            >
              — Semua Apotek —
            </div>
            {filtered.map((o) => (
              <div
                key={o.value}
                style={{
                  padding: "4px 10px",
                  fontSize: 12,
                  cursor: "pointer",
                  color: value === o.value ? "#1E40AF" : "inherit",
                  background: value === o.value ? "#EFF6FF" : "transparent",
                }}
                onMouseDown={() => { onChange(o.value); setSearch(""); setOpen(false); }}
              >
                {o.label}
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: 8, fontSize: 11, color: "#9CA3AF", textAlign: "center" }}>Tidak ditemukan</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tambah/Edit Aktivasi Popup ─────────────────────────────────────────────────
function AktivasiFormPopup({
  customer,
  record,
  onClose,
  onSave,
  onDelete,
}: {
  customer: Customer;
  record?: AktivasiRecord;
  onClose: () => void;
  onSave: (r: AktivasiRecord) => void;
  onDelete?: (id: number) => void;
}) {
  const isEdit = !!record;
  const [tglAktif, setTglAktif] = useState(record?.tglAktif ?? "");
  const [tglNonAktif, setTglNonAktif] = useState(record?.tglNonAktif ?? "");
  const [keterangan, setKeterangan] = useState(record?.keterangan ?? "");
  const [confirmMsg, setConfirmMsg] = useState("");
  const [pending, setPending] = useState<AktivasiRecord | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSimpan() {
    if (!tglAktif) return;
    const rec: AktivasiRecord = {
      id: record?.id ?? Date.now(),
      customerKode: customer.kode,
      tglAktif,
      tglNonAktif,
      durasi: record?.durasi ?? "-",
      admin: record?.admin ?? "MM",
      keterangan,
    };
    if (tglNonAktif && !isEndOfMonth(tglNonAktif)) {
      const bulan = getMonthName(tglNonAktif);
      setConfirmMsg(`Tanggal non-aktif bukan akhir bulan. Biaya bulan ${bulan} tetap dihitung penuh. Lanjutkan?`);
      setPending(rec);
    } else {
      onSave(rec);
      onClose();
    }
  }

  function doSave(rec: AktivasiRecord) {
    onSave(rec);
    setConfirmMsg("");
    setPending(null);
    onClose();
  }

  function handleDelete() {
    if (record && onDelete) {
      onDelete(record.id);
      onClose();
    }
  }

  return (
    <div className="win-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="win-dialog" style={{ width: 460 }}>
        <div className="win-dialog-titlebar">
          <span>{isEdit ? "Edit" : "Tambah"} Aktivasi — {customer.kode}</span>
          <button className="win-dialog-close" onClick={onClose}>✕</button>
        </div>
        <div className="win-dialog-body">
          <div className="win-form-row">
            <span className="win-form-label">Tgl Aktif</span>
            <input className="win-input" placeholder="DD/MM/YYYY" value={tglAktif} onChange={(e) => setTglAktif(e.target.value)} style={{ width: 110 }} />
          </div>
          <div className="win-form-row">
            <span className="win-form-label">Tgl Non-Aktif</span>
            <input className="win-input" placeholder="DD/MM/YYYY" value={tglNonAktif} onChange={(e) => setTglNonAktif(e.target.value)} style={{ width: 110 }} />
            <span style={{ marginLeft: 8, color: "#6B7280", fontSize: 11 }}>Kosongkan jika masih aktif</span>
          </div>
          <div className="win-form-row">
            <span className="win-form-label">Keterangan</span>
            <input className="win-input" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} style={{ flex: 1 }} />
          </div>
          {confirmMsg && (
            <div style={{ marginTop: 8, padding: 8, background: "#FFF7ED", border: "1px solid #F59E0B", borderRadius: 3 }}>
              <div style={{ marginBottom: 6, color: "#92400E", fontSize: 11 }}>{confirmMsg}</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="win-btn" onClick={() => pending && doSave(pending)}>Ya, Lanjutkan</button>
                <button className="win-btn" onClick={() => { setConfirmMsg(""); setPending(null); }}>Batal</button>
              </div>
            </div>
          )}
        </div>
        <div className="win-dialog-footer">
          {isEdit && onDelete && (
            <button className="win-btn" style={{ background: "#DC2626", color: "#fff", marginRight: "auto" }} onClick={() => setShowDeleteConfirm(true)}>
              🗑️ Hapus
            </button>
          )}
          <button className="win-btn primary" onClick={handleSimpan}>💾 {isEdit ? "Update" : "Simpan"} Aktivasi</button>
          <button className="win-btn" onClick={onClose}>Batal</button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="win-dialog-overlay" style={{ zIndex: 60 }}>
          <div className="win-dialog" style={{ width: 380 }}>
            <div className="win-dialog-titlebar">
              <span>Konfirmasi Hapus</span>
              <button className="win-dialog-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="win-dialog-body">
              <p style={{ fontSize: 13, margin: 0 }}>Apakah Anda yakin ingin menghapus data aktivasi ini?</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="win-dialog-footer">
              <button className="win-btn" style={{ background: "#DC2626", color: "#fff" }} onClick={handleDelete}>Ya, Hapus</button>
              <button className="win-btn" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tambah/Edit User Popup ─────────────────────────────────────────────────────
function UserFormPopup({
  customer,
  user,
  onClose,
  onSave,
  onDelete,
}: {
  customer: Customer;
  user?: MobileUser;
  onClose: () => void;
  onSave: (u: MobileUser) => void;
  onDelete?: (id: number) => void;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState<Partial<MobileUser>>({
    customerKode: customer.kode,
    username: user?.username ?? "",
    nama: user?.nama ?? "",
    role: user?.role ?? "Owner",
    status: user?.status ?? true,
    password: user?.password ?? "",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  function handleSave() {
    if (!form.username || !form.nama || !form.password) return;
    onSave({
      id: user?.id ?? Date.now(),
      customerKode: customer.kode,
      username: form.username,
      nama: form.nama,
      role: form.role as "Owner" | "Apoteker",
      status: form.status ?? true,
      password: form.password,
    });
    onClose();
  }

  function handleDelete() {
    if (user && onDelete) {
      onDelete(user.id);
      onClose();
    }
  }

  return (
    <div className="win-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="win-dialog" style={{ width: 420 }}>
        <div className="win-dialog-titlebar">
          <span>{isEdit ? "Edit" : "Tambah"} User — {customer.kode}</span>
          <button className="win-dialog-close" onClick={onClose}>✕</button>
        </div>
        <div className="win-dialog-body">
          <div className="win-form-row">
            <span className="win-form-label">Username</span>
            <input className="win-input" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div className="win-form-row">
            <span className="win-form-label">Nama</span>
            <input className="win-input" value={form.nama} onChange={(e) => setForm((f) => ({ ...f, nama: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div className="win-form-row">
            <span className="win-form-label">Role</span>
            <select className="win-select" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "Owner" | "Apoteker" }))} style={{ width: 120 }}>
              <option value="Owner">Owner</option>
              <option value="Apoteker">Apoteker</option>
            </select>
          </div>
          <div className="win-form-row">
            <span className="win-form-label">Password</span>
            <input className="win-input" type="text" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} style={{ flex: 1 }} />
          </div>
          <div className="win-form-row">
            <label className="win-checkbox">
              <input type="checkbox" checked={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.checked }))} />
              Aktif
            </label>
          </div>
        </div>
        <div className="win-dialog-footer">
          {isEdit && onDelete && (
            <button className="win-btn" style={{ background: "#DC2626", color: "#fff", marginRight: "auto" }} onClick={() => setShowDeleteConfirm(true)}>
              🗑️ Hapus
            </button>
          )}
          <button className="win-btn primary" onClick={handleSave}>💾 {isEdit ? "Update" : "Simpan"}</button>
          <button className="win-btn" onClick={onClose}>Batal</button>
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="win-dialog-overlay" style={{ zIndex: 60 }}>
          <div className="win-dialog" style={{ width: 380 }}>
            <div className="win-dialog-titlebar">
              <span>Konfirmasi Hapus</span>
              <button className="win-dialog-close" onClick={() => setShowDeleteConfirm(false)}>✕</button>
            </div>
            <div className="win-dialog-body">
              <p style={{ fontSize: 13, margin: 0 }}>Apakah Anda yakin ingin menghapus user <strong>{form.username}</strong>?</p>
              <p style={{ fontSize: 11, color: "#6B7280", marginTop: 8 }}>Tindakan ini tidak dapat dibatalkan.</p>
            </div>
            <div className="win-dialog-footer">
              <button className="win-btn" style={{ background: "#DC2626", color: "#fff" }} onClick={handleDelete}>Ya, Hapus</button>
              <button className="win-btn" onClick={() => setShowDeleteConfirm(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Detail Riwayat Aktivasi Popup ─────────────────────────────────────────
function RiwayatAktivasiPopup({
  customer,
  records,
  history,
  onClose,
  onEdit,
  onDelete,
}: {
  customer: Customer;
  records: AktivasiRecord[];
  history: AktivasiRecord[];
  onClose: () => void;
  onEdit: (record: AktivasiRecord) => void;
  onDelete: (id: number) => void;
}) {
  const [editRecord, setEditRecord] = useState<AktivasiRecord | null>(null);

  function handleEditFromHistory(record: AktivasiRecord) {
    setEditRecord(record);
  }

  function handleSaveEdit(record: AktivasiRecord) {
    onEdit(record);
    setEditRecord(null);
  }

  return (
    <>
      <div className="win-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="win-dialog" style={{ width: 800 }}>
          <div className="win-dialog-titlebar">
            <span>Riwayat Aktivasi — {customer.kode} {customer.nama}</span>
            <button className="win-dialog-close" onClick={onClose}>✕</button>
          </div>
          <div className="win-dialog-body" style={{ maxHeight: 400, overflow: "auto" }}>
            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#9CA3AF" }}>Belum ada riwayat aktivasi</div>
            ) : (
              <table className="win-grid">
                <thead>
                  <tr>
                    <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                    <th style={{ minWidth: 90, textAlign: "center" }}>Tgl Aktif</th>
                    <th style={{ minWidth: 90, textAlign: "center" }}>Tgl Non-Aktif</th>
                    <th style={{ minWidth: 70, textAlign: "center" }}>Durasi</th>
                    <th style={{ minWidth: 50, textAlign: "center" }}>Admin</th>
                    <th style={{ minWidth: 140 }}>Keterangan</th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r, i) => (
                    <tr key={r.id}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td style={{ textAlign: "center", color: "#16a34a" }}>{r.tglAktif}</td>
                      <td style={{ textAlign: "center", color: r.tglNonAktif ? "#DC2626" : "#9CA3AF" }}>
                        {r.tglNonAktif || "Aktif"}
                      </td>
                      <td style={{ textAlign: "center" }}>{r.durasi}</td>
                      <td style={{ textAlign: "center" }}>{r.admin}</td>
                      <td>{r.keterangan}</td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button className="win-btn" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => handleEditFromHistory(r)}>
                            ✏️ Edit
                          </button>
                          <button className="win-btn" style={{ fontSize: 10, padding: "2px 8px", background: "#FEE2E2", color: "#DC2626" }} onClick={() => onDelete(r.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="win-dialog-footer">
            <button className="win-btn" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>

      {editRecord && (
        <AktivasiFormPopup
          customer={customer}
          record={editRecord}
          onClose={() => setEditRecord(null)}
          onSave={handleSaveEdit}
          onDelete={onDelete}
        />
      )}
    </>
  );
}

// ─── Detail User Popup ─────────────────────────────────────────────────────
function DetailUserPopup({
  customer,
  users,
  onClose,
  onEdit,
  onDelete,
  onAdd,
}: {
  customer: Customer;
  users: MobileUser[];
  onClose: () => void;
  onEdit: (user: MobileUser) => void;
  onDelete: (id: number) => void;
  onAdd: (user: MobileUser) => void;
}) {
  const [showPw, setShowPw] = useState<Record<number, boolean>>({});
  const [editUser, setEditUser] = useState<MobileUser | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  function handleEdit(user: MobileUser) {
    setEditUser(user);
  }

  function handleSaveEdit(user: MobileUser) {
    onEdit(user);
    setEditUser(null);
  }

  function handleAddNew() {
    setShowAddForm(true);
  }

  function handleSaveAdd(user: MobileUser) {
    onAdd(user);
    setShowAddForm(false);
  }

  return (
    <>
      <div className="win-dialog-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="win-dialog" style={{ width: 780 }}>
          <div className="win-dialog-titlebar">
            <span>Manajemen User — {customer.kode} {customer.nama}</span>
            <button className="win-dialog-close" onClick={onClose}>✕</button>
          </div>
          <div className="win-dialog-body" style={{ maxHeight: 400, overflow: "auto" }}>
            {users.length === 0 ? (
              <div style={{ textAlign: "center", padding: 24, color: "#9CA3AF" }}>Belum ada user mobile</div>
            ) : (
              <table className="win-grid">
                <thead>
                  <tr>
                    <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                    <th style={{ minWidth: 140 }}>Username</th>
                    <th style={{ minWidth: 180 }}>Nama</th>
                    <th style={{ minWidth: 80, textAlign: "center" }}>Role</th>
                    <th style={{ minWidth: 70, textAlign: "center" }}>Status</th>
                    <th style={{ minWidth: 90, textAlign: "center" }}>Password</th>
                    <th style={{ minWidth: 100, textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id}>
                      <td style={{ textAlign: "center" }}>{i + 1}</td>
                      <td style={{ fontFamily: "monospace" }}>{u.username}</td>
                      <td>{u.nama}</td>
                      <td style={{ textAlign: "center" }}>
                        <span className={u.role === "Owner" ? "badge badge-owner" : "badge badge-apoteker"}>{u.role}</span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <span className={u.status ? "badge badge-lunas" : "badge badge-belum"}>{u.status ? "Aktif" : "Non-aktif"}</span>
                      </td>
                      <td style={{ fontFamily: "monospace", letterSpacing: 2, textAlign: "center" }}>
                        <span style={{ cursor: "pointer", userSelect: "none" }} onClick={() => setShowPw((p) => ({ ...p, [u.id]: !p[u.id] }))} title="Klik untuk lihat/sembunyikan">
                          {showPw[u.id] ? u.password : "••••••••"}
                        </span>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                          <button className="win-btn" style={{ fontSize: 10, padding: "2px 8px" }} onClick={() => handleEdit(u)}>
                            ✏️ Edit
                          </button>
                          <button className="win-btn" style={{ fontSize: 10, padding: "2px 8px", background: "#FEE2E2", color: "#DC2626" }} onClick={() => onDelete(u.id)}>
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: 8, fontSize: 10, color: "#6B7280", padding: "4px 0" }}>
              * Semua akun dibuat oleh admin PBF. Tidak ada self-register dari apotek.
            </div>
          </div>
          <div className="win-dialog-footer">
            <button className="win-btn primary" onClick={handleAddNew}>➕ Tambah User Baru</button>
            <div style={{ flex: 1 }} />
            <button className="win-btn" onClick={onClose}>Tutup</button>
          </div>
        </div>
      </div>

      {editUser && (
        <UserFormPopup
          customer={customer}
          user={editUser}
          onClose={() => setEditUser(null)}
          onSave={handleSaveEdit}
          onDelete={onDelete}
        />
      )}

      {showAddForm && (
        <UserFormPopup
          customer={customer}
          onClose={() => setShowAddForm(false)}
          onSave={handleSaveAdd}
        />
      )}
    </>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
type Tab = "Aktivasi" | "Manajemen User";

function AktivasiContent() {
  const params = useSearchParams();
  const initKode = params.get("kode") ?? "";
  const [tab, setTab] = useState<Tab>("Aktivasi");
  const [selectedKode, setSelectedKode] = useState<string>(initKode);
  const [aktivasiData, setAktivasiData] = useState<AktivasiRecord[]>(aktivasiRecords);
  const [userData, setUserData] = useState<MobileUser[]>(mobileUsers);

  const [detailAktivasi, setDetailAktivasi] = useState<Customer | null>(null);
  const [detailUser, setDetailUser] = useState<Customer | null>(null);
  const [addAktivasiTarget, setAddAktivasiTarget] = useState<Customer | null>(null);
  const [addUserTarget, setAddUserTarget] = useState<Customer | null>(null);

  const selectedCustomer = customers.find((c) => c.kode === selectedKode) ?? null;

  const apotekOptions = useMemo(
    () => customers.map((c) => ({ value: c.kode, label: `${c.kode} — ${c.nama}` })),
    []
  );

  // Grid rows = 1 row per apotek (latest aktivasi only)
  const aktivasiRows = useMemo(() => {
    let list = customers;
    if (selectedKode) list = list.filter((c) => c.kode === selectedKode);
    return list.map((c) => {
      const latest = getLatestAktivasi(c.kode, aktivasiData);
      const total = getAktivasiHistory(c.kode, aktivasiData).length;
      return { customer: c, latest, total };
    });
  }, [selectedKode, aktivasiData]);

  // User rows = 1 row per apotek (summary)
  const userRows = useMemo(() => {
    let list = customers;
    if (selectedKode) list = list.filter((c) => c.kode === selectedKode);
    return list.map((c) => {
      const users = getUsersByKode(c.kode, userData);
      const owner = users.find((u) => u.role === "Owner");
      const apoteker = users.find((u) => u.role === "Apoteker");
      return { customer: c, users, owner, apoteker, total: users.length };
    });
  }, [selectedKode, userData]);

  // ─── CRUD Handlers for Aktivasi ───
  function handleAddAktivasi(rec: AktivasiRecord) {
    setAktivasiData((prev) => [...prev, rec]);
  }

  function handleEditAktivasi(rec: AktivasiRecord) {
    setAktivasiData((prev) => prev.map((r) => (r.id === rec.id ? rec : r)));
  }

  function handleDeleteAktivasi(id: number) {
    setAktivasiData((prev) => prev.filter((r) => r.id !== id));
  }

  // ─── CRUD Handlers for User ───
  function handleAddUser(user: MobileUser) {
    setUserData((prev) => [...prev, user]);
  }

  function handleEditUser(user: MobileUser) {
    setUserData((prev) => prev.map((u) => (u.id === user.id ? user : u)));
  }

  function handleDeleteUser(id: number) {
    setUserData((prev) => prev.filter((u) => u.id !== id));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Title */}
      <div className="win-window-title">Aktivasi &amp; Manajemen User</div>

      {/* Toolbar */}
      <div className="win-toolbar">
        <button className="win-btn" onClick={() => selectedCustomer && setAddAktivasiTarget(selectedCustomer)} disabled={!selectedKode}>
          <span>➕</span> Tambah Aktivasi
        </button>
        <button className="win-btn" onClick={() => selectedCustomer && setAddUserTarget(selectedCustomer)} disabled={!selectedKode}>
          <span>👤</span> Tambah User
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn" onClick={() => setSelectedKode("")}>
          <span>🔄</span> Semua Apotek
        </button>
        <div className="win-toolbar-sep" />
        <button className="win-btn" title="Export">
          <span>📤</span> Export
        </button>
        <button className="win-btn" title="Keluar">
          <span>🚪</span> Keluar
        </button>
      </div>

      {/* Filter bar */}
      <div className="win-searchbar" style={{ gap: 12 }}>
        <span style={{ fontWeight: "bold", whiteSpace: "nowrap" }}>Pilih Apotek:</span>
        <SearchableSelect options={apotekOptions} value={selectedKode} onChange={setSelectedKode} placeholder="— Semua Apotek —" />
        <span style={{ color: "#666", marginLeft: 8, fontSize: 11 }}>
          {selectedKode ? "1 apotek dipilih" : `${customers.length} apotek`}
        </span>
      </div>

      {/* Tab switcher */}
      <div style={{ display: "flex", background: "var(--c-tab-inactive)", borderBottom: "1px solid var(--c-border)", flexShrink: 0 }}>
        {(["Aktivasi", "Manajemen User"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "6px 16px",
              fontSize: 12,
              fontFamily: "inherit",
              border: "none",
              borderBottom: tab === t ? "2px solid var(--c-header-bg)" : "2px solid transparent",
              background: tab === t ? "var(--c-tab-active)" : "transparent",
              cursor: "pointer",
              fontWeight: tab === t ? 600 : 400,
              color: tab === t ? "var(--c-text)" : "var(--c-text-muted)",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", background: "#fff" }}>
        {/* ── Tab Aktivasi ── */}
        {tab === "Aktivasi" && (
          <table className="win-grid">
            <thead>
              <tr>
                <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                <th style={{ minWidth: 110 }}>Kode ERP</th>
                <th style={{ minWidth: 240 }}>Nama Apotek</th>
                <th style={{ minWidth: 100 }}>Kota</th>
                <th style={{ minWidth: 80, textAlign: "center" }}>Sales</th>
                <th style={{ minWidth: 90, textAlign: "center" }}>Tgl Aktif Terakhir</th>
                <th style={{ minWidth: 90, textAlign: "center" }}>Tgl Non-Aktif</th>
                <th style={{ minWidth: 70, textAlign: "center" }}>Durasi</th>
                <th style={{ minWidth: 80, textAlign: "center" }}>Status</th>
                <th style={{ minWidth: 60, textAlign: "center" }}>Jml Riwayat</th>
                <th style={{ minWidth: 120, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {aktivasiRows.length === 0 && (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                    Tidak ada data
                  </td>
                </tr>
              )}
              {aktivasiRows.map(({ customer: c, latest, total }, i) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setDetailAktivasi(c)}
                  title="Klik untuk lihat riwayat lengkap"
                >
                  <td style={{ textAlign: "center" }}>{i + 1}</td>
                  <td style={{ color: "#800000", fontWeight: "bold" }}>{c.kode}</td>
                  <td>{c.nama}</td>
                  <td>{c.kota}</td>
                  <td style={{ textAlign: "center" }}>{c.sales}</td>
                  <td style={{ textAlign: "center", color: "#16a34a" }}>{latest?.tglAktif || "—"}</td>
                  <td style={{ textAlign: "center", color: latest?.tglNonAktif ? "#DC2626" : "#9CA3AF" }}>
                    {latest?.tglNonAktif || "Aktif"}
                  </td>
                  <td style={{ textAlign: "center" }}>{latest?.durasi || "—"}</td>
                  <td style={{ textAlign: "center" }}>
                    {c.aktif ? (
                      <span className="badge badge-lunas">AKTIF</span>
                    ) : (
                      <span className="badge badge-belum">NON-AKTIF</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center", fontWeight: "bold", color: total > 1 ? "#1E40AF" : "#9CA3AF" }}>
                    {total > 1 ? `${total} riwayat` : total === 1 ? "1 riwayat" : "—"}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="win-btn"
                      style={{ fontSize: 10 }}
                      onClick={(e) => { e.stopPropagation(); setDetailAktivasi(c); }}
                    >
                      📋 Riwayat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── Tab Manajemen User ── */}
        {tab === "Manajemen User" && (
          <table className="win-grid">
            <thead>
              <tr>
                <th style={{ minWidth: 36, textAlign: "center" }}>No</th>
                <th style={{ minWidth: 110 }}>Kode ERP</th>
                <th style={{ minWidth: 240 }}>Nama Apotek</th>
                <th style={{ minWidth: 100 }}>Kota</th>
                <th style={{ minWidth: 70, textAlign: "center" }}>Jml User</th>
                <th style={{ minWidth: 160 }}>Owner</th>
                <th style={{ minWidth: 160 }}>Apoteker</th>
                <th style={{ minWidth: 80, textAlign: "center" }}>Status Cust</th>
                <th style={{ minWidth: 120, textAlign: "center" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {userRows.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ textAlign: "center", padding: 16, color: "#9CA3AF" }}>
                    Tidak ada data
                  </td>
                </tr>
              )}
              {userRows.map(({ customer: c, total, owner, apoteker }, i) => (
                <tr
                  key={c.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => setDetailUser(c)}
                  title="Klik untuk lihat detail user"
                >
                  <td style={{ textAlign: "center" }}>{i + 1}</td>
                  <td style={{ color: "#800000", fontWeight: "bold" }}>{c.kode}</td>
                  <td>{c.nama}</td>
                  <td>{c.kota}</td>
                  <td style={{ textAlign: "center", fontWeight: "bold", color: total > 0 ? "#1E40AF" : "#9CA3AF" }}>
                    {total}
                  </td>
                  <td>{owner ? `${owner.nama} (${owner.status ? "A" : "N"})` : "—"}</td>
                  <td>{apoteker ? `${apoteker.nama} (${apoteker.status ? "A" : "N"})` : "—"}</td>
                  <td style={{ textAlign: "center" }}>
                    {c.aktif ? (
                      <span className="badge badge-lunas">AKTIF</span>
                    ) : (
                      <span className="badge badge-belum">NON-AKTIF</span>
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>
                    <button
                      className="win-btn"
                      style={{ fontSize: 10 }}
                      onClick={(e) => { e.stopPropagation(); setDetailUser(c); }}
                    >
                      📋 Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div className="win-statusbar">
        <div className="win-statusbar-panel">
          {tab === "Aktivasi" ? `${aktivasiRows.length} apotek` : `${userRows.length} apotek`}
        </div>
        <div className="win-statusbar-panel">
          {tab === "Aktivasi"
            ? `${aktivasiData.length} total record aktivasi`
            : `${userData.length} total akun user`}
        </div>
        <div className="win-statusbar-panel" style={{ flex: 1 }} />
        <div className="win-statusbar-panel">User : ADMIN</div>
        <div className="win-statusbar-panel">V.140426</div>
      </div>

      {/* Popups */}
      {detailAktivasi && (
        <RiwayatAktivasiPopup
          customer={detailAktivasi}
          records={aktivasiData}
          history={getAktivasiHistory(detailAktivasi.kode, aktivasiData)}
          onClose={() => setDetailAktivasi(null)}
          onEdit={handleEditAktivasi}
          onDelete={handleDeleteAktivasi}
        />
      )}
      {detailUser && (
        <DetailUserPopup
          customer={detailUser}
          users={getUsersByKode(detailUser.kode, userData)}
          onClose={() => setDetailUser(null)}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onAdd={handleAddUser}
        />
      )}
      {addAktivasiTarget && (
        <AktivasiFormPopup
          customer={addAktivasiTarget}
          onClose={() => setAddAktivasiTarget(null)}
          onSave={handleAddAktivasi}
        />
      )}
      {addUserTarget && (
        <UserFormPopup
          customer={addUserTarget}
          onClose={() => setAddUserTarget(null)}
          onSave={handleAddUser}
        />
      )}
    </div>
  );
}

export default function AktivasiPage() {
  return (
    <Suspense fallback={<div style={{ padding: 32, textAlign: "center", color: "#6B7280" }}>Memuat halaman aktivasi…</div>}>
      <AktivasiContent />
    </Suspense>
  );
}

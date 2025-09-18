// resources/js/Pages/Web/components/vendors/driver/Driver.jsx
import React, { useEffect, useRef, useState } from "react";
import SideMenu from "../SideMenu.jsx";

import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

const PAGE_SIZE = 8;

/* ---- UI helpers aligned with AddUnit ---- */
const Req = () => <span className="text-red-600 ml-0.5">*</span>;
const inputClasses = (hasError = false) =>
  `w-full rounded-lg px-4 py-2 transition ${
    hasError
      ? "border border-red-500 focus:ring-red-500 focus:border-red-500"
      : "border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
  }`;
const selectClasses = inputClasses;
/* ---------------------------------------- */

export default function Driver() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query] = useState(""); // kept empty (no free-text search)
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });
  const [errors, setErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedRows, setExpandedRows] = useState(() => new Set()); // details toggle
  const gotCsrf = useRef(false);

  const formRef = useRef(null);

  // ---------- helpers ----------
  const toAbsoluteUrl = (u) => {
    if (!u) return "";
    if (u.startsWith("blob:")) return u;
    if (/^https?:\/\//i.test(u)) return u;
    const withSlash = u.startsWith("/") ? u : "/" + u;
    return new URL(withSlash, window.location.origin).toString();
  };

  // stream/download controller endpoints
  const driverStream = (id, kind) => `/vendor/drivers/${id}/${kind}/stream`;     // kind: 'license' | 'nic'
  const driverDownload = (id, kind) => `/vendor/drivers/${id}/${kind}/download`; // direct download
  // --------------------------------

  const empty = {
    full_name: "",
    phone: "",
    email: "",
    license_no: "",
    license_expiry: "",
    vehicle_type: "",
    vehicle_no: "",
    status: "Active",
    address: "",
    notes: "",
    license_photo: null,
    nic_photo: null,
    license_photo_url: "",
    nic_photo_url: "",
  };
  const [form, setForm] = useState(empty);

  // ---------- CSRF ----------
  function getCookie(name) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")[1];
  }
  function getMetaCsrf() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");
  }
  async function ensureCsrf() {
    if (gotCsrf.current) return;
    const existing = getMetaCsrf() || getCookie("XSRF-TOKEN");
    if (!existing) {
      try {
        await fetch("/sanctum/csrf-cookie", { method: "GET", credentials: "same-origin" });
      } catch {}
    }
    gotCsrf.current = true;
  }
  function currentToken() {
    return getMetaCsrf() || (getCookie("XSRF-TOKEN") ? decodeURIComponent(getCookie("XSRF-TOKEN")) : null);
  }
  // -----------------------------------

  // ---------- HTTP ----------
  async function http(method, path, body, params = {}) {
    const url = new URL(`/vendor${path}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));
    if (method !== "GET") await ensureCsrf();

    const token = currentToken();
    const isFormData = body instanceof FormData;
    if (isFormData && token && !body.has("_token")) body.append("_token", token);

    const res = await fetch(url, {
      method,
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { "X-CSRF-TOKEN": token, "X-XSRF-TOKEN": token } : {}),
        ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      },
      credentials: "same-origin",
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    });

    if (!res.ok) {
      let payload = null;
      try { payload = await res.json(); } catch {}
      const message = payload?.message || `HTTP ${res.status}`;
      if (payload?.errors) throw { validation: payload.errors, message };
      throw new Error(message);
    }
    return res.status === 204 ? null : res.json();
  }

  const api = {
    list: (q, sort, dir, page, per_page) =>
      http("GET", "/drivers", null, { q, sort, dir, page, per_page }),
    create: (payload) => http("POST", "/drivers", toFormData(payload)),
    update: (id, payload) => {
      const fd = toFormData(payload);
      fd.append("_method", "PUT");
      return http("POST", `/drivers/${id}`, fd);
    },
    remove: (id) => http("DELETE", `/drivers/${id}`),
  };

  function toFormData(values) {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (k === "license_photo" || k === "nic_photo") {
        if (v instanceof File) fd.append(k, v);
        return;
      }
      if (k.endsWith("_url")) return;
      fd.append(k, v);
    });
    return fd;
  }
  // -----------------------------------

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const searchText = statusFilter === "All" ? "" : `${statusFilter}`;
      const data = await api.list(searchText, sort.key, sort.dir, page, PAGE_SIZE);
      setRows(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, statusFilter]);

  // ---------- form ----------
  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.license_no.trim()) e.license_no = "License no. is required";
    if (!form.vehicle_type.trim()) e.vehicle_type = "Vehicle type is required";
    if (!form.vehicle_no.trim()) e.vehicle_no = "Vehicle no. is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";

    const needsLicense = !editing || (editing && form.license_photo instanceof File);
    const needsNIC = !editing || (editing && form.nic_photo instanceof File);

    if (!form.license_photo && !form.license_photo_url && !editing) {
      e.license_photo = "License photo is required";
    } else if (needsLicense && form.license_photo && !form.license_photo.type?.startsWith("image/")) {
      e.license_photo = "License photo must be an image";
    }

    if (!form.nic_photo && !form.nic_photo_url && !editing) {
      e.nic_photo = "NIC photo is required";
    } else if (needsNIC && form.nic_photo && !form.nic_photo.type?.startsWith("image/")) {
      e.nic_photo = "NIC photo must be an image";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const resetForm = () => {
    setForm(empty);
    setEditing(null);
    setErrors({});
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editing) await api.update(editing, form);
      else await api.create(form);
      resetForm();
      await fetchData(meta.current_page);
      window.scrollTo({ top: document.body.scrollHeight / 3, behavior: "smooth" });
    } catch (err) {
      if (err.validation) setErrors(err.validation);
      else alert(err.message || "Failed");
    }
  };

  const onEdit = (r) => {
    setEditing(r.id);
    setForm({
      full_name: r.full_name,
      phone: r.phone,
      email: r.email || "",
      license_no: r.license_no,
      license_expiry: r.license_expiry || "",
      vehicle_type: r.vehicle_type,
      vehicle_no: r.vehicle_no,
      status: r.status || "Active",
      address: r.address || "",
      notes: r.notes || "",
      license_photo: null,
      nic_photo: null,
      license_photo_url: r.license_photo_url || "",
      nic_photo_url: r.nic_photo_url || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this driver?")) return;
    await api.remove(id);
    const nextPage = rows.length === 1 && meta.current_page > 1 ? meta.current_page - 1 : meta.current_page;
    await fetchData(nextPage);
  };

  const onSort = (key) => {
    setSort((s) => {
      const dir = s.key === key ? (s.dir === "asc" ? "desc" : "asc") : "asc";
      return { key, dir };
    });
  };

  const Label = ({ children }) => (
    <label className="block text-[14px] font-medium text-gray-700">{children}</label>
  );

  const ImageInput = ({ label, field, urlField, requiredText, kind }) => {
    const file = form[field];
    const hasExisting = !!form[urlField] || !!editing;
    const previewSrc = file
      ? URL.createObjectURL(file)
      : editing
      ? driverStream(editing, kind)
      : (form[urlField] ? toAbsoluteUrl(form[urlField]) : "");

    return (
      <div className="space-y-1">
        <Label>{label}</Label>
        <div className="flex items-center gap-3">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0] || null;
              setForm((prev) => ({
                ...prev,
                [field]: f,
                [urlField]: f ? "" : prev[urlField],
              }));
            }}
            className={inputClasses(!!errors[field]) + " bg-white"}
          />
          {hasExisting && editing ? (
            <a
              href={driverDownload(editing, kind)}
              download
              className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
            >
              Download
            </a>
          ) : null}
        </div>
        {previewSrc ? (
          <img
            src={previewSrc}
            alt={`${typeof label === "string" ? label : "Image"} preview`}
            className="mt-2 h-16 w-16 object-cover rounded-md border border-gray-200"
          />
        ) : null}
        {errors[field] && (
          <span className="text-red-500 text-xs">{errors[field]}</span>
        )}
      </div>
    );
  };

  const ThumbCell = ({ id, url, kind }) => {
    if (!url) return <span className="text-[#00000066]">-</span>;
    const imgSrc = driverStream(id, kind);
    const dlHref = driverDownload(id, kind);
    return (
      <div className="flex items-center gap-2">
        <img
          src={imgSrc}
          alt={`${kind} preview`}
          className="h-10 w-10 object-cover rounded border"
        />
        <a
          href={dlHref}
          download
          title="Download"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-gray-200 bg-white hover:bg-gray-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#0955AC]" aria-hidden="true">
            <path d="M3 14.5A1.5 1.5 0 014.5 13h11a1.5 1.5 0 010 3h-11A1.5 1.5 0 013 14.5z" />
            <path d="M10 2a.75.75 0 01.75.75V11l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06L9.25 11V2.75A.75.75 0 0110 2z" />
          </svg>
          <span className="sr-only">Download</span>
        </a>
      </div>
    );
  };

  const toggleExpand = (id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SideMenu />

      <main className="flex-1 w-full py-8">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-row gap-5 justify-between items-center">
            <h1 className="figtree text-[28px] font-[700]">Drivers</h1>
            <div className="flex flex-row gap-4 items-center">
              <div className="size-10 rounded-[10px] bg-[#E8EBEF] flex justify-center items-center"><img src={search} /></div>
              <div className="size-10 rounded-[10px] bg-[#E8EBEF] flex justify-center items-center"><img src={settings} /></div>
              <div className="size-10 rounded-[10px] bg-[#E8EBEF] flex justify-center items-center"><img src={bell} /></div>
              <div className="size-10 rounded-[10px] bg-[#E8EBEF] flex justify-center items-center"><img src={proPic} /></div>
              <div className="figtree hidden sm:flex flex-col justify-center items-start">
                <div className="text-[16px] font-[700]">Steve Gibson</div>
                <div className="text-[13px] font-[600] text-[#7B7B7A]">Vendor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Form: reduced padding & width, matches table width */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <form
            ref={formRef}
            onSubmit={submit}
            className="bg-white rounded-lg p-5 border border-gray-200"
          >
            <h2 className="text-[18px] font-[400] text-gray-800 mb-4">Driver Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Full Name <Req /></Label>
                <input
                  className={inputClasses(!!errors.full_name)}
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="John Doe"
                />
                {errors.full_name && <span className="text-red-500 text-xs">{errors.full_name}</span>}
              </div>

              <div className="space-y-1">
                <Label>Phone <Req /></Label>
                <input
                  className={inputClasses(!!errors.phone)}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                />
                {errors.phone && <span className="text-red-500 text-xs">{errors.phone}</span>}
              </div>

              <div className="space-y-1">
                <Label>Email</Label>
                <input
                  type="email"
                  className={inputClasses(!!errors.email)}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                />
                {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
              </div>

              <div className="space-y-1">
                <Label>License No. <Req /></Label>
                <input
                  className={inputClasses(!!errors.license_no)}
                  value={form.license_no}
                  onChange={(e) => setForm({ ...form, license_no: e.target.value })}
                  placeholder="B1234567"
                />
                {errors.license_no && <span className="text-red-500 text-xs">{errors.license_no}</span>}
              </div>

              <div className="space-y-1">
                <Label>License Expiry</Label>
                <input
                  type="date"
                  className={inputClasses(false)}
                  value={form.license_expiry}
                  onChange={(e) => setForm({ ...form, license_expiry: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <Label>Vehicle Type <Req /></Label>
                <input
                  className={inputClasses(!!errors.vehicle_type)}
                  value={form.vehicle_type}
                  onChange={(e) => setForm({ ...form, vehicle_type: e.target.value })}
                  placeholder="Van / Car / Truck / Bike"
                />
                {errors.vehicle_type && <span className="text-red-500 text-xs">{errors.vehicle_type}</span>}
              </div>

              <div className="space-y-1">
                <Label>Vehicle No. <Req /></Label>
                <input
                  className={inputClasses(!!errors.vehicle_no)}
                  value={form.vehicle_no}
                  onChange={(e) => setForm({ ...form, vehicle_no: e.target.value })}
                  placeholder="WP ABC-1234"
                />
                {errors.vehicle_no && <span className="text-red-500 text-xs">{errors.vehicle_no}</span>}
              </div>

              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  className={selectClasses(false)}
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>

              <ImageInput
                label={<><span>Driver License Photo</span> <Req /></>}
                field="license_photo"
                urlField="license_photo_url"
                requiredText
                kind="license"
              />

              <ImageInput
                label={<><span>NIC Photo</span> <Req /></>}
                field="nic_photo"
                urlField="nic_photo_url"
                requiredText
                kind="nic"
              />

              <div className="md:col-span-2 space-y-1">
                <Label>Address</Label>
                <textarea
                  rows={2}
                  className={inputClasses(false)}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Street, City"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <Label>Notes</Label>
                <textarea
                  rows={2}
                  className={inputClasses(false)}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional details..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 border-t border-gray-200 mt-5">
              {editing && (
                <button
                  type="button"
                  className="px-5 py-2 border border-gray-300 text-gray-700 font-[700] rounded-lg"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              )}
              <button
                className="inline-flex items-center px-5 py-2 border border-transparent font-[700] rounded-lg text-white bg-[#0955AC] hover:opacity-95"
                type="submit"
              >
                {editing ? "Update Driver" : "Add Driver"}
              </button>
            </div>
          </form>
        </div>

        {/* Table: same width as form, includes details toggle + images */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="w-full bg-white rounded-lg border border-gray-200">
            {/* Header with chips (Add button removed) */}
            <div className="px-4 sm:px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white border-b border-gray-200 rounded-t-lg">
              <div className="flex items-center gap-4">
                <div className="flex text-[#0955AC] text-[14px] font-[700]">
                  <button
                    className={`h-9 px-4 rounded-l-md ${statusFilter === "All" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"}`}
                    onClick={() => setStatusFilter("All")}
                    type="button"
                  >
                    All
                  </button>
                  <button
                    className={`h-9 px-4 ${statusFilter === "Active" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"}`}
                    onClick={() => setStatusFilter("Active")}
                    type="button"
                  >
                    Active
                  </button>
                  <button
                    className={`h-9 px-4 rounded-r-md ${statusFilter === "Inactive" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"}`}
                    onClick={() => setStatusFilter("Inactive")}
                    type="button"
                  >
                    Inactive
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-[14px] font-[600] text-[#00000080]">
                  <span>Results</span>
                  <span className="text-[#0955AC]">• {meta.total}</span>
                </div>
              </div>

              {/* Right side now empty since Add button removed */}
              <div className="h-0 md:h-auto" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-[#F3F3F3]">
                  <tr className="text-left figtree">
                    {[
                      ["full_name", "Name"],
                      ["phone", "Phone"],
                      ["vehicle_no", "Vehicle No."],
                      ["vehicle_type", "Type"],
                      ["license_no", "License No."],
                      ["license_expiry", "Expiry"],
                      ["status", "Status"],
                      ["created_at", "Created"],
                    ].map(([key, label]) => (
                      <th
                        key={key}
                        className="px-4 sm:px-6 py-3 font-[700] cursor-pointer whitespace-nowrap text-[#000000CC]"
                        onClick={() => onSort(key)}
                      >
                        {label}{sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                      </th>
                    ))}
                    <th className="px-4 sm:px-6 py-3 font-[700] text-[#000000CC] whitespace-nowrap">License Img</th>
                    <th className="px-4 sm:px-6 py-3 font-[700] text-[#000000CC] whitespace-nowrap">NIC Img</th>
                    <th className="px-4 sm:px-6 py-3 font-[700] text-[#000000CC] whitespace-nowrap">Details</th>
                    <th className="px-4 sm:px-6 py-3 font-[700] text-[#000000CC]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr><td colSpan={13} className="px-6 py-10 text-center text-gray-500">Loading…</td></tr>
                  ) : rows.length === 0 ? (
                    <tr><td colSpan={13} className="px-6 py-10 text-center text-gray-500">No drivers found.</td></tr>
                  ) : (
                    rows.map((r) => {
                      const isOpen = expandedRows.has(r.id);
                      return (
                        <React.Fragment key={r.id}>
                          <tr className="border-t border-gray-200">
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap font-medium">{r.full_name}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.phone}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.vehicle_no}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.vehicle_type}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.license_no}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.license_expiry ?? "-"}</td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <span className={`px-2.5 py-1 rounded-md text-xs figtree ${r.status==="Active"?"bg-[#C5E6F9] text-[#0955AC]":"bg-[#FFDBDF] text-[#7B7B7A]"}`}>{r.status}</span>
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">{r.created_at ? new Date(r.created_at).toLocaleDateString() : "-"}</td>

                            {/* Small thumbs */}
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <ThumbCell id={r.id} url={r.license_photo_url} kind="license" />
                            </td>
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <ThumbCell id={r.id} url={r.nic_photo_url} kind="nic" />
                            </td>

                            {/* Details toggle */}
                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => toggleExpand(r.id)}
                                className="px-3 py-1.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[13px] font-semibold"
                              >
                                {isOpen ? "Hide" : "Details"}
                              </button>
                            </td>

                            <td className="px-4 sm:px-6 py-3 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <button onClick={() => onEdit(r)} className="text-[#0955AC] font-[600] hover:underline">Edit</button>
                                <button onClick={() => onDelete(r.id)} className="text-[#FF0000] font-[600] hover:underline">Delete</button>
                              </div>
                            </td>
                          </tr>

                          {/* Expanded full details row */}
                          {isOpen && (
                            <tr className="border-t border-gray-100 bg-[#FAFAFA]">
                              <td colSpan={13} className="px-4 sm:px-6 py-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Email</div>
                                    <div className="text-sm text-gray-900 break-words">{r.email || "-"}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Address</div>
                                    <div className="text-sm text-gray-900 whitespace-pre-line">{r.address || "-"}</div>
                                  </div>
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Notes</div>
                                    <div className="text-sm text-gray-900 whitespace-pre-line">{r.notes || "-"}</div>
                                  </div>

                                  {/* Large previews + downloads */}
                                  <div className="space-y-2">
                                    <div className="text-xs text-gray-500">License Image</div>
                                    {r.license_photo_url ? (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={driverStream(r.id, "license")}
                                          alt="License"
                                          className="h-28 w-28 object-cover rounded-md border border-gray-200"
                                        />
                                        <a
                                          href={driverDownload(r.id, "license")}
                                          download
                                          className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[13px] font-semibold"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    ) : <div className="text-sm text-gray-500">—</div>}
                                  </div>

                                  <div className="space-y-2">
                                    <div className="text-xs text-gray-500">NIC Image</div>
                                    {r.nic_photo_url ? (
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={driverStream(r.id, "nic")}
                                          alt="NIC"
                                          className="h-28 w-28 object-cover rounded-md border border-gray-200"
                                        />
                                        <a
                                          href={driverDownload(r.id, "nic")}
                                          download
                                          className="px-3 py-2 rounded-md border border-gray-200 bg-white hover:bg-gray-50 text-[13px] font-semibold"
                                        >
                                          Download
                                        </a>
                                      </div>
                                    ) : <div className="text-sm text-gray-500">—</div>}
                                  </div>

                                  {/* Meta */}
                                  <div className="space-y-1">
                                    <div className="text-xs text-gray-500">Meta</div>
                                    <div className="text-sm text-gray-900">
                                      Status: <span className="font-semibold">{r.status}</span><br/>
                                      Created: {r.created_at ? new Date(r.created_at).toLocaleString() : "-"}
                                    </div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
              <span className="text-sm text-[#00000080]">
                Page {meta.current_page} of {meta.last_page} • {meta.total} result(s)
              </span>
              <div className="flex items-center gap-2">
                <button
                  className="h-9 px-4 bg-[#F3F3F3] rounded-md border border-gray-200 disabled:opacity-40"
                  onClick={() => fetchData(meta.current_page - 1)}
                  disabled={meta.current_page <= 1}
                >
                  Prev
                </button>
                <button
                  className="h-9 px-4 bg-[#F3F3F3] rounded-md border border-gray-200 disabled:opacity-40"
                  onClick={() => fetchData(meta.current_page + 1)}
                  disabled={meta.current_page >= meta.last_page}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

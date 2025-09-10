// resources/js/Pages/Web/components/vendors/driver/Driver.jsx
import React, { useEffect, useState } from "react";
import SideMenu from "../SideMenu.jsx";

// top bar icons (same set you used in Calendar)
import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

const PAGE_SIZE = 8;

export default function Driver() {
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState({ key: "created_at", dir: "desc" });
  const [errors, setErrors] = useState({});
  const [statusFilter, setStatusFilter] = useState("All"); // All | Active | Inactive

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
  };
  const [form, setForm] = useState(empty);

  // ---------- fetch helper (CSRF) ----------
  async function http(method, path, body, params = {}) {
    const url = new URL(`/vendor${path}`, window.location.origin);
    Object.entries(params).forEach(([k, v]) => v != null && url.searchParams.set(k, v));

    const token = document
      .querySelector('meta[name="csrf-token"]')
      ?.getAttribute("content");

    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
      },
      credentials: "same-origin",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let payload = null;
      try {
        payload = await res.json();
      } catch {}
      const message = payload?.message || `HTTP ${res.status}`;
      if (payload?.errors) throw { validation: payload.errors, message };
      throw new Error(message);
    }
    return res.status === 204 ? null : res.json();
  }

  const api = {
    list: (q, sort, dir, page, per_page) =>
      http("GET", "/drivers", null, { q, sort, dir, page, per_page }),
    create: (payload) => http("POST", "/drivers", payload),
    update: (id, payload) => http("PUT", `/drivers/${id}`, payload),
    remove: (id) => http("DELETE", `/drivers/${id}`),
  };
  // ----------------------------------------

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      // Apply status filter via query text (simple approach)
      const searchText =
        statusFilter === "All" ? query : `${query} ${statusFilter}`;
      const data = await api.list(
        searchText,
        sort.key,
        sort.dir,
        page,
        PAGE_SIZE
      );
      setRows(data.data);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page,
        total: data.total,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, statusFilter]);

  // ---------- form helpers ----------
  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = "Name is required";
    if (!form.phone.trim()) e.phone = "Phone is required";
    if (!form.license_no.trim()) e.license_no = "License no. is required";
    if (!form.vehicle_type.trim()) e.vehicle_type = "Vehicle type is required";
    if (!form.vehicle_no.trim()) e.vehicle_no = "Vehicle no. is required";
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
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
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this driver?")) return;
    await api.remove(id);
    const nextPage =
      rows.length === 1 && meta.current_page > 1
        ? meta.current_page - 1
        : meta.current_page;
    await fetchData(nextPage);
  };

  const onSort = (key) => {
    setSort((s) => {
      const dir = s.key === key ? (s.dir === "asc" ? "desc" : "asc") : "asc";
      return { key, dir };
    });
  };
  // -----------------------------------

  const Label = ({ children }) => (
    <label className="text-[14px] figtree text-[#00000080]">{children}</label>
  );

  return (
    <div className="flex bg-[#F5F7FA] min-h-screen">
      {/* Left: Side menu */}
      <SideMenu />

      {/* Right: Content */}
      <main className="flex-1 w-full pr-5 py-10">
        {/* ===== Header (match Calendar) ===== */}
        <div className="flex flex-row gap-5 justify-between items-center">
          <h1 className="figtree text-[35px] font-[700]">Drivers</h1>
          <div className="flex flex-row gap-5">
            <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
              <img src={search} />
            </div>
            <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
              <img src={settings} />
            </div>
            <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
              <img src={bell} />
            </div>
            <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
              <img src={proPic} />
            </div>

            <div className="figtree flex flex-col justify-center items-start">
              <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
              <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
            </div>
          </div>
        </div>

        {/* ===== Controls row (chips + search) ===== */}
        <div className="mt-8 px-1 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* status chips -> same style as your segmented buttons */}
          <div className="flex flex-row justify-center items-center text-[#0955AC] text-[14px] font-[700]">
            <button
              className={`w-[85px] h-[35px] rounded-l-[6px] flex justify-center items-center ${
                statusFilter === "All" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"
              }`}
              onClick={() => setStatusFilter("All")}
              type="button"
            >
              All
            </button>
            <button
              className={`w-[85px] h-[35px] flex justify-center items-center ${
                statusFilter === "Active" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"
              }`}
              onClick={() => setStatusFilter("Active")}
              type="button"
            >
              Active
            </button>
            <button
              className={`w-[85px] h-[35px] rounded-r-[6px] flex justify-center items-center ${
                statusFilter === "Inactive" ? "bg-[#D8E4F2]" : "bg-[#F3F3F3]"
              }`}
              onClick={() => setStatusFilter("Inactive")}
              type="button"
            >
              Inactive
            </button>
          </div>

          {/* search input (style harmonized) */}
          <div className="flex items-center gap-3 w-full max-w-[420px]">
            <input
              placeholder="Search by name, phone, license..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-[10px] border border-[#E5E5E5] bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-[#0955AC]"
            />
            <button
              onClick={resetForm}
              className="h-[40px] px-4 rounded-[10px] border border-[#E5E5E5] bg-[#F3F3F3] hover:bg-[#E8EBEF]"
              type="button"
            >
              New
            </button>
          </div>
        </div>

        {/* ===== Form card (white with soft shadow) ===== */}
        <form
          onSubmit={submit}
          className="mt-8 w-full bg-[#FFFFFF] rounded-[10px] px-8 py-8"
          style={{ boxShadow: "4px 4px 4px #0000001A" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1">
              <Label>Full Name *</Label>
              <input
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="John Doe"
              />
              {errors.full_name && (
                <span className="text-red-500 text-xs">{errors.full_name}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Phone *</Label>
              <input
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+94 77 123 4567"
              />
              {errors.phone && (
                <span className="text-red-500 text-xs">{errors.phone}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Email</Label>
              <input
                type="email"
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
              {errors.email && (
                <span className="text-red-500 text-xs">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>License No. *</Label>
              <input
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.license_no}
                onChange={(e) =>
                  setForm({ ...form, license_no: e.target.value })
                }
                placeholder="B1234567"
              />
              {errors.license_no && (
                <span className="text-red-500 text-xs">{errors.license_no}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>License Expiry</Label>
              <input
                type="date"
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.license_expiry}
                onChange={(e) =>
                  setForm({ ...form, license_expiry: e.target.value })
                }
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label>Vehicle Type *</Label>
              <input
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.vehicle_type}
                onChange={(e) =>
                  setForm({ ...form, vehicle_type: e.target.value })
                }
                placeholder="Van / Car / Truck / Bike"
              />
              {errors.vehicle_type && (
                <span className="text-red-500 text-xs">
                  {errors.vehicle_type}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Vehicle No. *</Label>
              <input
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.vehicle_no}
                onChange={(e) =>
                  setForm({ ...form, vehicle_no: e.target.value })
                }
                placeholder="WP ABC-1234"
              />
              {errors.vehicle_no && (
                <span className="text-red-500 text-xs">
                  {errors.vehicle_no}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label>Status</Label>
              <select
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <Label>Address</Label>
              <textarea
                rows={2}
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Street, City"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <Label>Notes</Label>
              <textarea
                rows={2}
                className="w-full rounded-[10px] border border-[#E5E5E5] px-3 py-2 focus:ring-2 focus:ring-[#0955AC]"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Any additional details..."
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <button
              className="bg-[#0955AC] text-white px-6 py-2 rounded-[10px] hover:opacity-95"
              type="submit"
            >
              {editing ? "Update Driver" : "Add Driver"}
            </button>
            {editing && (
              <button
                type="button"
                className="px-6 py-2 rounded-[10px] border border-[#E5E5E5] bg-[#F3F3F3] hover:bg-[#E8E8E8]"
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ===== Table card ===== */}
        <div
          className="w-full h-auto bg-[#FFFFFF] rounded-[10px] mt-10"
          style={{ boxShadow: "4px 4px 4px #0000001A" }}
        >
          {/* table head / controls (optional space for future filters) */}
          <div className="px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[16px] font-[600] text-[#00000080]">
              <span>Results</span>
              <span className="text-[#0955AC]">• {meta.total}</span>
            </div>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-[#F3F3F3]">
                <tr className="text-left figtree">
                  {[
                    ["full_name", "Name"],
                    ["phone", "Phone"],
                    ["vehicle_no", "Vehicle No."],
                    ["vehicle_type", "Vehicle Type"],
                    ["license_no", "License No."],
                    ["license_expiry", "Expiry"],
                    ["status", "Status"],
                    ["created_at", "Created"],
                  ].map(([key, label]) => (
                    <th
                      key={key}
                      className="px-6 py-3 font-[700] cursor-pointer whitespace-nowrap text-[#000000CC]"
                      onClick={() => onSort(key)}
                    >
                      {label}
                      {sort.key === key ? (sort.dir === "asc" ? " ↑" : " ↓") : ""}
                    </th>
                  ))}
                  <th className="px-6 py-3 font-[700] text-[#000000CC]">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Loading…
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No drivers found.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr key={r.id} className="border-t border-[#00000026]">
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.full_name}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">{r.phone}</td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.vehicle_no}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.vehicle_type}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.license_no}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.license_expiry ?? "-"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-[8px] text-xs figtree ${
                            r.status === "Active"
                              ? "bg-[#C5E6F9] text-[#0955AC]"
                              : "bg-[#FFDBDF] text-[#7B7B7A]"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onEdit(r)}
                            className="text-[#0955AC] font-[600] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => onDelete(r.id)}
                            className="text-[#FF0000] font-[600] hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination (match style) */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#00000026] bg-[#F3F3F3] rounded-b-[10px]">
            <span className="text-sm text-[#00000080]">
              Page {meta.current_page} of {meta.last_page} • {meta.total} result(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                className="w-[75px] h-[35px] bg-[#F3F3F3] rounded-[6px] border border-[#E5E5E5] disabled:opacity-40"
                onClick={() => fetchData(meta.current_page - 1)}
                disabled={meta.current_page <= 1}
              >
                Prev
              </button>
              <button
                className="w-[75px] h-[35px] bg-[#F3F3F3] rounded-[6px] border border-[#E5E5E5] disabled:opacity-40"
                onClick={() => fetchData(meta.current_page + 1)}
                disabled={meta.current_page >= meta.last_page}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { router } from "@inertiajs/react"; // ⬅️ use the React adapter router

// top bar icons
import search from "../../../assets/vendors/dashboard/searchIcon.svg";
import settings from "../../../assets/vendors/dashboard/settings.svg";
import bell from "../../../assets/vendors/dashboard/bell.svg";
import proPic from "../../../assets/vendors/dashboard/proPic.svg";

// filters
import filterIcon from "../../../assets/vendors/dashboard/icons/filterIcon.svg";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";

// unit card assets
import car1 from "../../../assets/vendors/dashboard/icons/car1.svg";
import availableIcon from "../../../assets/vendors/units/availableIcon.svg";

import icon1 from "../../../assets/vendors/units/icons/icon1.svg"; // mileage
import icon2 from "../../../assets/vendors/units/icons/icon2.svg"; // transmission
import icon3 from "../../../assets/vendors/units/icons/icon3.svg"; // capacity
import icon4 from "../../../assets/vendors/units/icons/icon4.svg"; // fuel

// actions
import editIcon from "../../../assets/vendors/units/edit.svg";
import deleteIcon from "../../../assets/vendors/units/delete.svg";

// modal
import AddUnit from "../../../home/vendors/AddUnit";

const UnitContent = () => {
  const [showAddUnit, setShowAddUnit] = useState(false);

  // filters
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("");      // Available | Pending | Maintenance
  const [category, setCategory] = useState("");  // Land | Air | Sea

  // pagination & data
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const perPageOptions = [5, 10, 20, 50];

  const [loading, setLoading] = useState(false);
  const [unitsPage, setUnitsPage] = useState({
    data: [],
    current_page: 1,
    last_page: 1,
    links: [],
    total: 0,
  });

  // delete confirm modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  // fetch list
  const fetchUnits = async (url = null) => {
    setLoading(true);
    try {
      const endpoint =
        url ??
        `/vendor/vehicles/list?${new URLSearchParams({
          search: searchTerm || "",
          status: status || "",
          category: category || "",
          per_page: String(itemsPerPage || 10),
          page: String(unitsPage.current_page || 1),
        }).toString()}`;

      const res = await fetch(endpoint, { credentials: "same-origin" });
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
      const json = await res.json();

      setUnitsPage({
        data: json.data ?? [],
        current_page: json.current_page ?? json.meta?.current_page ?? 1,
        last_page: json.last_page ?? json.meta?.last_page ?? 1,
        links: json.links ?? [],
        total: json.total ?? json.meta?.total ?? (json.data?.length ?? 0),
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, status, category, itemsPerPage, unitsPage.current_page]);

  const handleAddUnitClick = () => setShowAddUnit(true);

  const goToLink = (link) => {
    if (link?.url && !link.active) {
      fetchUnits(link.url);
      try {
        const u = new URL(link.url, window.location.origin);
        const p = Number(u.searchParams.get("page") || "1");
        setUnitsPage((prev) => ({ ...prev, current_page: p }));
      } catch {}
    }
  };

  const goPrev = () => {
    if (unitsPage.current_page > 1) {
      setUnitsPage((prev) => ({ ...prev, current_page: prev.current_page - 1 }));
    }
  };
  const goNext = () => {
    if (unitsPage.current_page < unitsPage.last_page) {
      setUnitsPage((prev) => ({ ...prev, current_page: prev.current_page + 1 }));
    }
  };

  const onPerPageChange = (n) => {
    setItemsPerPage(n);
    setUnitsPage((prev) => ({ ...prev, current_page: 1 }));
  };
  const onStatusChange = (val) => {
    setStatus(val);
    setUnitsPage((prev) => ({ ...prev, current_page: 1 }));
  };
  const onCategoryChange = (val) => {
    setCategory(val);
    setUnitsPage((prev) => ({ ...prev, current_page: 1 }));
  };
  const onSearchEnter = (e) => {
    if (e.key === "Enter") {
      setUnitsPage((prev) => ({ ...prev, current_page: 1 }));
      fetchUnits();
    }
  };

  // delete flow (modal + router.delete with optimistic UI)
  const requestDelete = (id) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!pendingDeleteId) return;
    const id = pendingDeleteId;

    // close modal immediately
    setConfirmOpen(false);
    setPendingDeleteId(null);

    // optimistic remove from the list
    setUnitsPage((prev) => ({
      ...prev,
      data: prev.data.filter((u) => u.id !== id),
      total: Math.max(0, (prev.total || 1) - 1),
    }));

    // CSRF token for Laravel
    const csrf =
      document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ||
      (window.Laravel?.csrfToken ?? '');

    // call backend
    router.delete(`/vendor/vehicles/${id}`, {
      preserveScroll: true,
      headers: csrf ? { 'X-CSRF-TOKEN': csrf } : {},
      onError: (errors) => {
        console.error("Delete failed", errors);
        // rollback: refetch if backend failed
        fetchUnits();
        alert("Failed to delete the unit.");
      },
      // onSuccess: () => fetchUnits(), // optional full refresh
    });
  };

  const cancelDelete = () => {
    setConfirmOpen(false);
    setPendingDeleteId(null);
  };

  const viewDetails = () => {
    window.location.href = "/vendors/unitDetails";
  };

  // EDIT → open Add Unit in edit mode (server will prefill props)
  const editUnit = (unit) => {
    router.visit(`/vendors/addUnit/${unit.id}`);
  };

  return (
    <div className="w-full h-auto pr-5 py-10">
      {/* Header */}
      <div className="flex flex-row gap-5 justify-between items-center">
        <h1 className="figtree text-[35px] font-[700]">Units</h1>
        <div className="flex flex-row gap-5">
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={search} alt="Search" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={settings} alt="Settings" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={bell} alt="Notifications" />
          </div>
          <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
            <img src={proPic} alt="Profile" />
          </div>
          <div className="figtree flex flex-col justify-center items-start">
            <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
            <h1 className="text-[16px] font-[600] text-[#7B7B7A]">Vendor</h1>
          </div>
        </div>
      </div>

      {/* Search / Filters */}
      <div className="flex flex-row justify-between mt-10 mb-5">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="flex flex-row gap-5 justify-center items-center">
            {/* Search */}
            <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
              <img src={miniSearchIcon} alt="Search" />
              <input
                type="text"
                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                placeholder="Search brand, model…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={onSearchEnter}
              />
            </div>

            {/* Category */}
            <div className="w-[180px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center py-2 px-3">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <select
                className="text-[14px] font-[500] text-[#7B7B7ACC] bg-transparent outline-none w-full mx-2 border-none focus:outline-none focus:ring-0 appearance-none"
                value={category}
                onChange={(e) => onCategoryChange(e.target.value)}
              >
                <option value="">Category</option>
                <option value="Land">Land</option>
                <option value="Air">Air</option>
                <option value="Sea">Sea</option>
              </select>
            </div>

            {/* Status */}
            <div className="w-[180px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center py-2 px-3">
              <img src={filterIcon} className="size-[12px]" alt="Filter" />
              <select
                className="text-[14px] font-[500] text-[#7B7BACC] bg-transparent outline-none w-full mx-2 border-none focus:outline-none focus:ring-0 appearance-none"
                value={status}
                onChange={(e) => onStatusChange(e.target.value)}
              >
                <option value="">Status</option>
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>

          <button
            className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
            onClick={handleAddUnitClick}
          >
            Add Unit
          </button>
        </div>
      </div>

      {/* Body */}
      {showAddUnit ? (
        <AddUnit />
      ) : (
        <>
          {loading && (
            <div className="text-sm text-gray-600 my-4">Loading units…</div>
          )}

          {!loading && unitsPage.data.length === 0 && (
            <div className="text-sm text-gray-600 my-4">
              No units found. Try adjusting your search or filters.
            </div>
          )}

          {/* Cards */}
          {unitsPage.data.map((unit) => (
            <div
              key={unit.id}
              className="relative w-auto h-auto min-h-[157px] bg-white rounded-[10px] flex lg:flex-row flex-col items-center my-10"
              style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
              {/* FIXED-SIZE IMAGE BOX */}
              <div className="shrink-0 w-[260px] h-[157px] overflow-hidden rounded-l-[10px] border border-[#E5E7EB] bg-[#F8FAFC]">
                <img
                  src={unit.image || car1}
                  alt="Vehicle"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="px-5 py-5 flex flex-row justify-center items-center">
                <div>
                  <div className="bebas-neue text-[30px] font-[400]">
                    <h1>
                      {unit.brand}{" "}
                      <span className="text-[#0955AC]">{unit.model}</span>
                    </h1>
                    <h1>
                      ${Number(unit.price ?? 0).toFixed(0)}
                      <span className="figtree text-[#00000080] text-[15px] font-[600]">
                        /day
                      </span>
                    </h1>
                  </div>

                  <div className="poppins flex flex-row justify-start items-center gap-8 text-[14px] font-[600]">
                    <div className="flex flex-row justify-center items-center gap-3">
                      <img
                        src={availableIcon}
                        className="w-[26px] h-[26px]"
                        alt="Status"
                      />
                      <h1
                        className={
                          (unit.status || "") === "Available"
                            ? "text-[#3C9A34]"
                            : (unit.status || "") === "Pending"
                            ? "text-[#D97706]"
                            : "text-[#6B7280]"
                        }
                      >
                        {unit.status || "—"}
                      </h1>
                    </div>
                  </div>
                </div>

                <div className="flex lg:flex-row flex-col justify-center items-center pl-[40px] gap-20">
                  <div className="poppins flex lg:flex-row flex-col gap-10 text-[15px] font-[500]">
                    <div className="flex flex-col justify-center items-center gap-7">
                      <img src={icon1} className="w-[26px] h-[26px]" alt="Mileage" />
                      <h1>{unit.mileage ?? "-"}</h1>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-7">
                      <img src={icon2} className="w-[26px] h-[26px]" alt="Transmission" />
                      <h1>{unit.transmission ?? "-"}</h1>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-7">
                      <img src={icon3} className="w-[26px] h-[26px]" alt="Capacity" />
                      <h1>{unit.capacity ?? "-"}</h1>
                    </div>
                    <div className="flex flex-col justify-center items-center gap-7">
                      <img src={icon4} className="w-[26px] h-[26px]" alt="Fuel Type" />
                      <h1>{unit.fuel_type ?? unit.fuelType ?? "-"}</h1>
                    </div>
                  </div>

                  <button
                    className="figtree min-w-[140px] h-[44px] bg-[#0955AC] rounded-[5px] text-[20px] text-white font-[700]"
                    onClick={viewDetails}
                  >
                    View
                  </button>
                </div>
              </div>

              {/* right actions */}
              <div className="absolute right-0 w-auto min-w-[143px] h-full bg-[#D8E4F2] flex flex-row justify-center items-center gap-3 rounded-tr-[10px] rounded-br-[10px]">
                <div
                  className="size-[36px] border-[1.5px] border-[#0955AC] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer"
                  onClick={() => editUnit(unit)}
                >
                  <img src={editIcon} className="size-[24px]" alt="Edit" />
                </div>
                <div
                  className="size-[36px] border-[1.5px] border-[#FF0000] bg-[#D8E4F2] rounded-[5px] flex justify-center items-center cursor-pointer"
                  onClick={() => requestDelete(unit.id)}
                >
                  <img src={deleteIcon} className="size-[24px]" alt="Delete" />
                </div>
              </div>
            </div>
          ))}

          {/* Pagination + per-page */}
          <div className="flex justify-between items-center gap-2 mt-20">
            {/* Left: Results per page */}
            <div className="flex items-center">
              <span className="mr-3 text-[#00000080] text-[15px]">
                Results per page
              </span>
              <select
                className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] w/[71px] h/[40px] outline-none border-none focus:outline-none focus:ring-0 appearance-none"
                value={itemsPerPage}
                onChange={(e) => onPerPageChange(Number(e.target.value))}
              >
                {perPageOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Right: Pagination */}
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                onClick={goPrev}
                disabled={unitsPage.current_page <= 1}
              >
                <span className="text-lg">&#60;</span>
              </button>

              {unitsPage.links
                ?.filter((l) => !["&laquo; Previous", "Next &raquo;"].includes(l.label))
                .map((l, idx) => (
                  <button
                    key={idx}
                    className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${
                      l.active ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC]" : ""
                    }`}
                    onClick={() => goToLink(l)}
                    disabled={!l.url}
                    dangerouslySetInnerHTML={{ __html: l.label }}
                  />
                ))}

              <button
                className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                onClick={goNext}
                disabled={unitsPage.current_page >= unitsPage.last_page}
              >
                <span className="text-lg">&#62;</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ===== Delete Confirm Modal ===== */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={cancelDelete}
          />
          {/* modal */}
          <div className="relative bg-white rounded-xl shadow-xl w/full max-w-md mx-4 p-6">
            <h2 className="text-xl font-semibold mb-2 text-center">
              Are you sure?
            </h2>
            <p className="text-gray-600 text-center mb-6">
              Do you really want to delete this unit? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={cancelDelete}
                className="px-5 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-5 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ===== /Delete Confirm Modal ===== */}
    </div>
  );
};

export default UnitContent;

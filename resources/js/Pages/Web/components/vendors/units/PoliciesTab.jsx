import React, { useEffect, useMemo, useState } from "react";

const PoliciesTab = ({ vehicleId, initialPdfUrl = null }) => {
  const resolvedVehicleId = useMemo(() => {
    if (vehicleId) return Number(vehicleId);
    const inertiaId = window?.Inertia?.page?.props?.vehicle?.id ?? null;
    if (inertiaId) return Number(inertiaId);
    const qsId = new URLSearchParams(window.location.search).get("id");
    if (qsId) return Number(qsId);
    const m = window.location.pathname.match(/(?:unitDetails|vehicles)\/(\d+)/i);
    if (m && m[1]) return Number(m[1]);
    return null;
  }, [vehicleId]);

  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl || null);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");

  const getMetaCsrf = () =>
    document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") ||
    window?.Laravel?.csrfToken ||
    "";
  const getCookie = (name) => {
    const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
    return m ? decodeURIComponent(m[1]) : "";
  };
  const authHeaders = () => {
    const meta = getMetaCsrf();
    const xsrf = getCookie("XSRF-TOKEN");
    return {
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      ...(meta ? { "X-CSRF-TOKEN": meta } : {}),
      ...(xsrf ? { "X-XSRF-TOKEN": xsrf } : {}),
    };
  };
  const parseMaybeJson = async (res) => {
    const txt = await res.text();
    try { return JSON.parse(txt); } catch { return { _raw: txt }; }
  };

  useEffect(() => {
    if (pdfUrl || !resolvedVehicleId) return;
    (async () => {
      try {
        const res = await fetch(`/vendor/vehicles/${resolvedVehicleId}`, {
          credentials: "same-origin",
          headers: authHeaders(),
        });
        if (!res.ok) return;
        const json = await res.json();
        const stream = json?.policy_stream_url;
        const publicUrl = json?.policy_pdf_url;
        setPdfUrl(stream || publicUrl || null);
      } catch {}
    })();
  }, [resolvedVehicleId, pdfUrl]);

  const onFileChange = (e) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      e.target.value = "";
      return;
    }
    const MAX_MB = 20;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`File too large. Max ${MAX_MB}MB.`);
      e.target.value = "";
      return;
    }
    setFileToUpload(file);
    setPdfUrl(URL.createObjectURL(file)); // local preview
  };

  const onSave = async () => {
    setError("");
    if (!resolvedVehicleId) return setError("vehicleId is required.");
    if (!fileToUpload) {
      setToast("Nothing to save.");
      setTimeout(() => setToast(""), 1200);
      return;
    }

    const form = new FormData();
    form.append("pdf", fileToUpload);

    setSaving(true);
    try {
      const res = await fetch(`/vendor/vehicles/${resolvedVehicleId}/policy`, {
        method: "POST",
        credentials: "same-origin",
        headers: authHeaders(),
        body: form,
      });

      if (!res.ok) {
        const data = await parseMaybeJson(res);
        if (res.status === 419) setError("CSRF token mismatch (419). Refresh and try again.");
        else if (res.status === 422) {
          const e = data?.errors || {};
          setError(e?.pdf?.[0] || e?.policy?.[0] || e?.file?.[0] || "Validation error (422).");
        } else setError(data?.message || "Upload failed.");
        return;
      }

      const json = await res.json();
      const newUrl = json?.policy_stream_url || json?.policy_pdf_url || json?.url || null;
      setPdfUrl(newUrl);
      setFileToUpload(null);
      setToast("Saved successfully");
      setTimeout(() => setToast(""), 1400);
    } catch (err) {
      console.error(err);
      setError("Failed to save PDF. See console.");
    } finally {
      setSaving(false);
    }
  };

  const removePdf = async () => {
    setError("");
    if (!resolvedVehicleId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/vendor/vehicles/${resolvedVehicleId}/policy`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        const data = await parseMaybeJson(res);
        setError(data?.message || "Failed to remove PDF.");
        return;
      }
      setPdfUrl(null);
      setFileToUpload(null);
      setToast("Removed");
      setTimeout(() => setToast(""), 1200);
    } catch (err) {
      console.error(err);
      setError("Failed to remove PDF. See console.");
    } finally {
      setDeleting(false);
    }
  };

  const viewerUrl = React.useMemo(() => {
    if (!pdfUrl) return null;
    const isStream = /\/vendor\/vehicles\/\d+\/policy\/view/.test(pdfUrl);
    return isStream ? `${pdfUrl}#toolbar=0&navpanes=0&view=FitH` : pdfUrl;
  }, [pdfUrl]);

  const noId = !resolvedVehicleId;

  return (
    <div className="relative p-3 md:p-0">
      {toast && (
        <div className="fixed z-[60] top-4 right-4 bg-gray-900 text-white text-xs px-3 py-2 rounded shadow">
          {toast}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error}
        </div>
      )}

      <h1 className="text-[20px] font-[600] mb-4">Added Important Information</h1>

      <div className="flex items-center gap-3 mb-6">
        <label
          className={`cursor-pointer px-4 py-2 rounded-md text-sm font-semibold text-white ${
            noId || saving || deleting ? "bg-[#9bb7de] cursor-not-allowed" : "bg-[#0955AC] hover:bg-[#074183]"
          }`}
        >
          Upload PDF
          <input
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={onFileChange}
            disabled={noId || saving || deleting}
          />
        </label>

        <button
          onClick={onSave}
          disabled={noId || !fileToUpload || saving}
          className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
            noId || !fileToUpload || saving ? "bg-green-300 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {saving ? "Saving…" : "Save"}
        </button>

        {pdfUrl && (
          <button
            onClick={removePdf}
            disabled={noId || deleting}
            className={`px-4 py-2 rounded-md text-sm font-semibold text-white ${
              noId || deleting ? "bg-red-300 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {deleting ? "Removing…" : "Remove"}
          </button>
        )}
      </div>

      {noId ? (
        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
          This page doesn’t include a vehicle id. Open the unit from your list or add <code>?id=123</code> to the URL.
        </div>
      ) : viewerUrl ? (
        <div className="w-full min-h-[60vh] bg-[#f5f6f8] rounded-md px-4 py-8 flex justify-center overflow-auto">
          <div className="w-full max-w-[720px]">
            <div className="mx-auto bg-white rounded-[6px] shadow-[0_8px_28px_rgba(0,0,0,0.12)] overflow-hidden">
              <div className="w-full h-[85vh]">
                <iframe title="PDF preview" src={viewerUrl} className="w-full h-full border-0" />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center text-gray-500">
          No PDF uploaded yet. Click <span className="font-semibold">Upload PDF</span> and then{" "}
          <span className="font-semibold">Save</span>.
        </div>
      )}
    </div>
  );
};

export default PoliciesTab;

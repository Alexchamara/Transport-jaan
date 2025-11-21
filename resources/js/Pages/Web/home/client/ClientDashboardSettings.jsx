import React, { useRef, useState } from "react";
import { usePage } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import Header from "./ClientHeader";

/* ------------------------------------------------------------------ */
/*  Re-usable components                                              */
/* ------------------------------------------------------------------ */
const Section = ({ title, description, children, editBtn }) => (
  <section className="bg-white rounded-[10px] border border-gray-200 p-6 md:p-10">
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h2 className="text-[18px] font-[700] text-gray-900">{title}</h2>
        {description && (
          <p className="text-[12px] text-gray-500">{description}</p>
        )}
      </div>
      {editBtn}
    </div>
    {children}
  </section>
);

const Field = ({ label, htmlFor, children, required, help }) => (
  <label className="block" htmlFor={htmlFor}>
    <span className="block text-[14px] font-[700] text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </span>
    <div className="mt-1">{children}</div>
    {help && <p className="mt-1 text-[10px] text-gray-500">{help}</p>}
  </label>
);

const ErrorText = ({ children }) =>
  children ? (
    <p className="mt-1 text-[14px] text-red-600">{children}</p>
  ) : null;

/* ------------------------------------------------------------------ */
/*  EditableSection – wrapper that shows Edit / Save / Cancel          */
/* ------------------------------------------------------------------ */
const EditableSection = ({
  title,
  description,
  isEditing,
  toggleEdit,
  onSave,
  children,
}) => {
  return (
    <Section
      title={title}
      description={description}
      editBtn={
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={onSave}
                className="px-3 py-1 text-sm font-medium text-white bg-[#0955AC] rounded-md"
              >
                Save
              </button>
              <button
                type="button"
                onClick={toggleEdit}
                className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-md"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={toggleEdit}
              className="px-3 py-1 text-sm font-medium text-[#0955AC] border border-[#0955AC] rounded-md"
            >
              Edit
            </button>
          )}
        </div>
      }
    >
      {children}
    </Section>
  );
};

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */
const MAX_AVATAR_MB = 3;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
const ClientDashboardSettings = () => {
  const { props } = usePage();
  const user = props.user || {};

  const fileInputRef = useRef(null);
  const [photoPreview, setPhotoPreview] = useState(user?.image || null);
  const [clientErrors, setClientErrors] = useState({});

  /* ---------- editing flags for each section ---------- */
  const [editing, setEditing] = useState({
    profile: false,
    security: false,
  });

  const toggleSection = (section) =>
    setEditing((prev) => ({ ...prev, [section]: !prev[section] }));

  /* ---------- form data ---------- */
  const {
    data,
    setData,
    post,
    processing,
    errors,
    clearErrors,
    reset,
  } = useForm({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    country: user?.country || "",
    date_of_birth: user?.date_of_birth || "",
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
    image: null,
  });

  const updateUrl = route('client.settings.update');

  /* ---------- validation helpers ---------- */
  const validatePasswords = () => {
    const e = {};
    if (data.new_password || data.new_password_confirmation || data.current_password) {
      if (!data.current_password)
        e.current_password = "Current password is required.";
      if ((data.new_password?.length || 0) < 8)
        e.new_password = "Use at least 8 characters.";
      if (data.new_password !== data.new_password_confirmation)
        e.new_password_confirmation = "Passwords do not match.";
    }
    return e;
  };

  const validateImage = (file) => {
    const e = {};
    if (!file) return e;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type))
      e.image = "Please upload a JPG, PNG, or WEBP image.";
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_AVATAR_MB)
      e.image = `Image must be under ${MAX_AVATAR_MB}MB (current ~${sizeMb.toFixed(
        1
      )}MB).`;
    return e;
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    const eImage = validateImage(file);
    setClientErrors((prev) => ({ ...prev, ...eImage }));
    if (Object.keys(eImage).length === 0) {
      setData("image", file || null);
      clearErrors("image");
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => setPhotoPreview(ev.target.result);
        reader.readAsDataURL(file);
      } else {
        setPhotoPreview(user?.image || null);
      }
    }
  };

  const removePhoto = () => {
    setData("image", null);
    setPhotoPreview(null);
    setClientErrors((prev) => ({ ...prev, image: undefined }));
  };

  const submitAll = (e) => {
    e.preventDefault();
    const ePwd = validatePasswords();
    setClientErrors((prev) => ({ ...prev, ...ePwd }));
    if (Object.keys(ePwd).length > 0) return;

    post(updateUrl, {
      preserveScroll: true,
      forceFormData: true,
      onSuccess: () => {
        setEditing({ profile: false, security: false });
        clearErrors();
        setClientErrors({});
      }
    });
  };

  /* ---------- Render helpers for read-only values ---------- */
  const ReadOnly = ({ value }) => (
    <p className="h-16 flex items-center text-gray-900">{value ?? "-"}</p>
  );

  /* ------------------------------------------------------------------ */
  return (
    <div>
      <Header />
      <div className="bg-[#E5E5E5] poppins w-full">
        <div className="w-full h-auto px-5 py-10">
          {/* Header */}
          <div className="flex flex-row gap-5 justify-between items-center">
            <h1 className="figtree text-[35px] font-[700]">
              Client Profile Settings
            </h1>
          </div>

          <form onSubmit={submitAll} className="space-y-8 mt-10" noValidate>
            {/* ====================== PROFILE ====================== */}
            <EditableSection
              title="Profile"
              description="Update your photo and personal details."
              isEditing={editing.profile}
              toggleEdit={() => toggleSection("profile")}
              onSave={() => toggleSection("profile")}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Photo */}
                <div className="md:col-span-1">
                  <div className="flex items-center gap-4">
                    <div className="sm:h-40 sm:w-40 w-20 h-20 rounded-full overflow-hidden bg-gray-100 border border-gray-200">
                      {photoPreview ? (
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-400 sm:text-[14px] text-[10px]">
                          No photo
                        </div>
                      )}
                    </div>

                    {editing.profile ? (
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept={ACCEPTED_IMAGE_TYPES.join(",")}
                          className="hidden"
                          onChange={handleImageChange}
                        />
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-2 text-[14px] text-[#FFFFFF] font-[700] rounded-md bg-[#0955AC] border border-[#0955AC]"
                          >
                            Upload
                          </button>
                          {photoPreview && (
                            <button
                              type="button"
                              onClick={removePhoto}
                              className="px-3 py-2 text-[14px] font-medium rounded-md border border-red-300 text-red-600 hover:bg-red-50"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <ErrorText>
                          {clientErrors.image || errors.image}
                        </ErrorText>
                        <p className="text-[12px] text-gray-500">
                          JPG, PNG, or WEBP up to {MAX_AVATAR_MB}MB.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Name / Email / Phone */}
                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Full Name" htmlFor="name" required>
                    {editing.profile ? (
                      <input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        required
                      />
                    ) : (
                      <ReadOnly value={data.name} />
                    )}
                    <ErrorText>{errors.name}</ErrorText>
                  </Field>

                  <Field label="Email" htmlFor="email" required>
                    {editing.profile ? (
                      <input
                        id="email"
                        type="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        required
                      />
                    ) : (
                      <ReadOnly value={data.email} />
                    )}
                    <ErrorText>{errors.email}</ErrorText>
                  </Field>

                  <Field
                    label="Phone"
                    htmlFor="phone"
                    help="Include country code, e.g., +94 70 123 4567"
                  >
                    {editing.profile ? (
                      <input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => setData("phone", e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    ) : (
                      <ReadOnly value={data.phone} />
                    )}
                    <ErrorText>{errors.phone}</ErrorText>
                  </Field>

                  <Field label="Date of Birth" htmlFor="date_of_birth">
                    {editing.profile ? (
                      <input
                        id="date_of_birth"
                        type="date"
                        value={data.date_of_birth}
                        onChange={(e) => setData("date_of_birth", e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    ) : (
                      <ReadOnly value={data.date_of_birth} />
                    )}
                    <ErrorText>{errors.date_of_birth}</ErrorText>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Address" htmlFor="address">
                      {editing.profile ? (
                        <textarea
                          id="address"
                          value={data.address}
                          onChange={(e) => setData("address", e.target.value)}
                          rows={3}
                          className="w-full rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        />
                      ) : (
                        <ReadOnly value={data.address} />
                      )}
                      <ErrorText>{errors.address}</ErrorText>
                    </Field>
                  </div>

                  <Field label="Country" htmlFor="country">
                    {editing.profile ? (
                      <input
                        id="country"
                        type="text"
                        value={data.country}
                        onChange={(e) => setData("country", e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                      />
                    ) : (
                      <ReadOnly value={data.country} />
                    )}
                    <ErrorText>{errors.country}</ErrorText>
                  </Field>
                </div>
              </div>
            </EditableSection>

            {/* ====================== SECURITY ====================== */}
            <EditableSection
              title="Security"
              description="Change your password to keep your account secure."
              isEditing={editing.security}
              toggleEdit={() => toggleSection("security")}
              onSave={() => {
                const pwdErr = validatePasswords();
                setClientErrors((prev) => ({ ...prev, ...pwdErr }));
                if (Object.keys(pwdErr).length === 0) toggleSection("security");
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: "current_password", label: "Current password" },
                  { id: "new_password", label: "New password" },
                  { id: "new_password_confirmation", label: "Confirm password" },
                ].map((f) => (
                  <Field key={f.id} label={f.label} htmlFor={f.id}>
                    {editing.security ? (
                      <input
                        id={f.id}
                        type="password"
                        value={data[f.id]}
                        onChange={(e) => setData(f.id, e.target.value)}
                        className="w-full h-16 rounded-[10px] border-gray-300 focus:border-gray-900 focus:ring-gray-900"
                        autoComplete={f.id.includes("current") ? "current-password" : "new-password"}
                      />
                    ) : (
                      <ReadOnly value={data[f.id] ? "••••••••" : "-"} />
                    )}
                    <ErrorText>
                      {clientErrors[f.id] || errors[f.id]}
                    </ErrorText>
                  </Field>
                ))}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                If you fill any password field, all three are required. Password
                must be at least 8 characters.
              </p>
            </EditableSection>

            {/* ====================== GLOBAL ACTIONS ====================== */}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  reset();
                  setPhotoPreview(user?.image || null);
                  clearErrors();
                  setClientErrors({});
                  setEditing({
                    profile: false,
                    security: false,
                  });
                }}
                className="px-4 py-2 rounded-[10px] text-[14px] font-[700] text-[#0955AC] border border-[#0955AC] disabled:opacity-60"
                disabled={processing}
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-[10px] text-[14px] font-[700] bg-[#0955AC] text-[#FFFFFF] disabled:opacity-60"
                disabled={processing}
              >
                {processing ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboardSettings;

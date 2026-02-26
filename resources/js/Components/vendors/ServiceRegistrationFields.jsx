import React, { useState, useEffect } from "react";
import { Upload, X, Check, Calendar, FileText, AlertCircle } from "lucide-react";

/**
 * Dynamic form component that renders registration fields
 * based on the required_fields JSON from the service sub-category.
 *
 * Field types supported:
 * - "file"            → File upload only
 * - "file_with_dates" → File upload + Effective date + Expiry date
 * - "checkbox"        → Toggle switch (tick ✓)
 * - "file_optional"   → Optional file upload with dates
 */
const ServiceRegistrationFields = ({
    requiredFields = [],
    existingValues = {},
    onChange,
    errors = {},
}) => {
    const [fieldValues, setFieldValues] = useState({});

    useEffect(() => {
        // Initialize with existing values
        const initial = {};
        requiredFields.forEach((field) => {
            const key = field.key;
            if (existingValues[key] !== undefined) {
                initial[key] = existingValues[key];
            } else {
                switch (field.type) {
                    case "checkbox":
                        initial[key] = false;
                        break;
                    case "file":
                        initial[key] = { file: null, existing_file: "", existing_name: "" };
                        break;
                    case "file_with_dates":
                    case "file_optional":
                        initial[key] = {
                            file: null,
                            existing_file: "",
                            existing_name: "",
                            effective_date: "",
                            expiry_date: "",
                        };
                        break;
                    default:
                        initial[key] = null;
                }
            }
        });
        setFieldValues(initial);
    }, [requiredFields, existingValues]);

    const updateField = (key, value) => {
        const updated = { ...fieldValues, [key]: value };
        setFieldValues(updated);
        if (onChange) onChange(updated);
    };

    const handleFileChange = (key, file, type) => {
        if (type === "file") {
            updateField(key, { file, existing_file: "", existing_name: "" });
        } else {
            // file_with_dates or file_optional
            const current = fieldValues[key] || {};
            updateField(key, {
                ...current,
                file,
                existing_file: "",
                existing_name: "",
            });
        }
    };

    const handleDateChange = (key, dateField, value) => {
        const current = fieldValues[key] || {};
        updateField(key, { ...current, [dateField]: value });
    };

    const handleCheckboxChange = (key, checked) => {
        updateField(key, checked);
    };

    const removeFile = (key, type) => {
        if (type === "file") {
            updateField(key, { file: null, existing_file: "", existing_name: "" });
        } else {
            const current = fieldValues[key] || {};
            updateField(key, {
                ...current,
                file: null,
                existing_file: "",
                existing_name: "",
            });
        }
    };

    const getFileName = (key, type) => {
        const val = fieldValues[key];
        if (!val) return null;

        if (type === "checkbox") return null;

        if (val.file instanceof File) {
            return val.file.name;
        }
        if (typeof val === "object" && val.original_name) {
            return val.original_name;
        }
        if (typeof val === "object" && val.existing_name) {
            return val.existing_name;
        }
        if (typeof val === "object" && val.file && typeof val.file === "string") {
            return val.file.split("/").pop();
        }
        return null;
    };

    const hasFile = (key, type) => {
        const val = fieldValues[key];
        if (!val) return false;
        if (type === "checkbox") return false;
        if (val.file instanceof File) return true;
        if (typeof val === "object" && (val.existing_file || val.file)) return true;
        return false;
    };

    if (!requiredFields || requiredFields.length === 0) {
        return (
            <div className="text-center py-6 text-gray-500 text-sm">
                <Check className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No documents or requirements needed for this sub-category.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {requiredFields.map((field) => {
                const key = field.key;
                const error = errors[key];

                return (
                    <div
                        key={key}
                        className={`p-4 rounded-lg border transition-colors ${
                            error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                        }`}
                    >
                        <div className="flex items-start gap-2 mb-2">
                            <label className="text-sm font-semibold text-gray-700 flex-1">
                                {field.label}
                                {field.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                            {field.type === "checkbox" && (
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                    Tick to confirm
                                </span>
                            )}
                            {(field.type === "file" || field.type === "file_with_dates") && (
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                    Upload document
                                </span>
                            )}
                            {field.type === "file_optional" && (
                                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                                    Optional
                                </span>
                            )}
                        </div>

                        {/* CHECKBOX FIELD */}
                        {field.type === "checkbox" && (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCheckboxChange(key, !fieldValues[key])
                                    }
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        fieldValues[key]
                                            ? "bg-[#0955AC]"
                                            : "bg-gray-300"
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            fieldValues[key]
                                                ? "translate-x-6"
                                                : "translate-x-1"
                                        }`}
                                    />
                                </button>
                                <span className="text-sm text-gray-600">
                                    {fieldValues[key] ? "Confirmed ✓" : "Not confirmed"}
                                </span>
                            </div>
                        )}

                        {/* FILE UPLOAD FIELD */}
                        {(field.type === "file" || field.type === "file_optional") && (
                            <div>
                                {hasFile(key, field.type) ? (
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                        <FileText className="w-5 h-5 text-[#0955AC]" />
                                        <span className="text-sm text-gray-700 flex-1 truncate">
                                            {getFileName(key, field.type)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(key, field.type)}
                                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-[#0955AC] transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-1 pb-2">
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">
                                                Click to upload (PDF, JPG, PNG - Max 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileChange(
                                                        key,
                                                        e.target.files[0],
                                                        field.type
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                )}
                            </div>
                        )}

                        {/* FILE WITH DATES / FILE OPTIONAL WITH DATES */}
                        {field.type === "file_with_dates" && (
                            <div className="space-y-3">
                                {/* File upload */}
                                {hasFile(key, field.type) ? (
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                        <FileText className="w-5 h-5 text-[#0955AC]" />
                                        <span className="text-sm text-gray-700 flex-1 truncate">
                                            {getFileName(key, field.type)}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(key, field.type)}
                                            className="p-1 hover:bg-red-100 rounded-full transition-colors"
                                        >
                                            <X className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-white hover:border-[#0955AC] transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-1 pb-2">
                                            <Upload className="w-6 h-6 text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">
                                                Click to upload (PDF, JPG, PNG - Max 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.jpg,.jpeg,.png,.webp"
                                            onChange={(e) => {
                                                if (e.target.files[0]) {
                                                    handleFileChange(
                                                        key,
                                                        e.target.files[0],
                                                        field.type
                                                    );
                                                }
                                            }}
                                        />
                                    </label>
                                )}

                                {/* Date fields */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            Effective Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fieldValues[key]?.effective_date || ""}
                                            onChange={(e) =>
                                                handleDateChange(
                                                    key,
                                                    "effective_date",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500 mb-1 block">
                                            <Calendar className="w-3 h-3 inline mr-1" />
                                            Expiry Date
                                        </label>
                                        <input
                                            type="date"
                                            value={fieldValues[key]?.expiry_date || ""}
                                            onChange={(e) =>
                                                handleDateChange(
                                                    key,
                                                    "expiry_date",
                                                    e.target.value
                                                )
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0955AC] focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                {error}
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default ServiceRegistrationFields;

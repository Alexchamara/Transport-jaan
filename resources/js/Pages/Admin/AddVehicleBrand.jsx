import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import { useForm } from "@inertiajs/react";
import React, { useState } from "react";

export default function AddVehicleBrand({ brands }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    description: "",
    logo: null,
    status: "active",
  });

  const [logoPreview, setLogoPreview] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("vehicle-brands.store"), {
      onSuccess: () => {
        reset();
        setLogoPreview(null);
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      post(route("vehicle-brand.destroy", id), {
        method: "delete",
        onSuccess: () => {
          // Optionally reset the form or update state after deletion
          reset();
          setPreview(null);
        },
      });
    }
  };
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setData("logo", file);
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    } else {
      setLogoPreview(null);
    }
  };

  return (
    <AuthenticatedLayout>
      <Head title="Vehicle Brands" />

      <div className="px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vehicle Brands</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Brand Table */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-4">All Brands</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Logo</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <tr key={brand.id} className="border-b">
                          <td className="px-4 py-2">
                            {brand.logo ? (
                              <img
                                src={`/storage/${brand.logo}`}
                                alt={brand.name}
                                className="h-10 w-10 object-contain rounded"
                              />
                            ) : (
                              <span className="text-gray-400 italic">No Logo</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{brand.name}</td>
                          <td className="px-4 py-2 capitalize">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                brand.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {brand.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            {/* <button className="text-blue-600 hover:underline">Edit</button> */}
                            <button onClick={() => handleDelete(brand.id)}  className="bg-red-100 text-black hover:underline px-4 py-1 border rounded-2xl hover:bg-red-200">Delete</button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-gray-500 py-4">
                          No brands added yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Add Brand Form */}
          <div className="w-full lg:w-1/2">
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="bg-white p-8 rounded-2xl shadow-md border"
            >
              <h3 className="text-lg font-semibold mb-6">Add a New Brand</h3>

              {/* Brand Name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={data.name}
                  onChange={(e) => setData("name", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
              </div>

              {/* Logo */}
              <div className="mb-4">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                  Brand Logo
                </label>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {errors.logo && <p className="text-sm text-red-600 mt-1">{errors.logo}</p>}

                {/* Image Preview */}
                {logoPreview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      className="h-20 w-20 object-contain rounded border"
                    />
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData("description", e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              {/* Status */}
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={data.status}
                  onChange={(e) => setData("status", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
              </div>

              {/* Submit Button */}
              <div className="text-right">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? "Saving..." : "Add Brand"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

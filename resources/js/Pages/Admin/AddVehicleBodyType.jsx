import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm } from "@inertiajs/react";
import React, { useState } from "react";
import { usePage } from "@inertiajs/react";



export default function AddVehicleBodyType({ bodyTypes }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    bodyType: "",
    bodyTypeImage: null,
    description: "",
    status: "1",
  });

  const { props } = usePage();
    const flashMessage = props.flash?.success;

    const successMessage = flashMessage ? (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{flashMessage}</span>
        </div>
    ) : null;

  const [preview, setPreview] = useState(null);

  const handleSubmit = (e) => {
    // alert("Form submitted");
    e.preventDefault();
    post(route("vehicle-body-types.store"), {
      onSuccess: () => {
        reset();
        setPreview(null);
      },
    });
  };

  const handleDelete = (id) => {
    // alert("Delete function called with ID: " + id);
    if (confirm("Are you sure you want to delete this body type?")) {
      post(route("vehicle-body-types.destroy", id), {
        method: "delete",
        onSuccess: () => {
          // Optionally reset the form or update state after deletion
          reset();
          setPreview(null);
        },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setData("bodyTypeImage", file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <AuthenticatedLayout>
      <Head title="Vehicle Body Types" />

      <div className="px-4 py-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Vehicle Body Types</h2>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT: Body Types Table */}
          <div className="w-full lg:w-1/2">
            <div className="bg-white p-6 rounded-xl shadow border">
              <h3 className="text-lg font-semibold mb-4">All Body Types</h3>
              <div className="overflow-auto">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                    <tr>
                      <th className="px-4 py-2">Image</th>
                      <th className="px-4 py-2">Type</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bodyTypes.length > 0 ? (
                      bodyTypes.map((item) => (
                        <tr key={item.id} className="border-b">
                          <td className="px-4 py-2">
                            {item.bodyTypeImage ? (
                              <img
                                src={`/storage/${item.bodyTypeImage}`}
                                alt={item.bodyType}
                                className="h-10 w-10 object-contain rounded"
                              />
                            ) : (
                              <span className="text-gray-400 italic">No Image</span>
                            )}
                          </td>
                          <td className="px-4 py-2">{item.bodyType}</td>
                          <td className="px-4 py-2 capitalize">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                item.status
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {item.status ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-2 space-x-2">
                            {/* <button className="text-blue-600 hover:underline">Edit</button> vehicle-body-types.destroy */}
                            {/* <button  className="bg-red-100 text-black hover:underline px-4 py-1 border rounded-2xl hover:bg-red-200">Delete</button> */}
                            <button onClick={() => handleDelete(item.id)}  className="bg-red-100 text-black hover:underline px-4 py-1 border rounded-2xl hover:bg-red-200">Delete</button>

                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center text-gray-500 py-4">
                          No body types found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT: Add Form */}
          <div className="w-full lg:w-1/2">
            <form
              onSubmit={handleSubmit}
              encType="multipart/form-data"
              className="bg-white p-8 rounded-2xl shadow-md border"
            >
              <h3 className="text-lg font-semibold mb-6">Add Body Type</h3>

              {/* Body Type */}
              <div className="mb-4">
                <label htmlFor="bodyType" className="block text-sm font-medium text-gray-700 mb-1">
                  Body Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="bodyType"
                  value={data.bodyType}
                  onChange={(e) => setData("bodyType", e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {errors.bodyType && <p className="text-sm text-red-600 mt-1">{errors.bodyType}</p>}
              </div>

              {/* Image */}
              <div className="mb-4">
                <label htmlFor="bodyTypeImage" className="block text-sm font-medium text-gray-700 mb-1">
                  Image
                </label>
                <input
                  type="file"
                  id="bodyTypeImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {errors.bodyTypeImage && <p className="text-sm text-red-600 mt-1">{errors.bodyTypeImage}</p>}

                {preview && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600 mb-1">Preview:</p>
                    <img
                      src={preview}
                      alt="Preview"
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
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
                {errors.status && <p className="text-sm text-red-600 mt-1">{errors.status}</p>}
              </div>

              {/* Submit */}
              <div className="text-right">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? "Saving..." : "Add Body Type"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}

import { useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Create({ auth }) {
    const [locationCount, setLocationCount] = useState(1);
    
    const { data, setData, post, processing, errors, reset } = useForm({
        sender_name: "",
        sender_address: "",
        sender_telephone: "",
        parcel_type: "",
        custom_parcel_type: "",
        parcel_count: 1,
        parcel_weight: "",
        payment_method: "",
        locations: 1,
        receivers: [{ receiver_name: "", receiver_address: "", receiver_telephone: "" }],
    });
    
    const parcelTypes = [
        { value: "document", label: "Document" },
        { value: "small_package", label: "Small Package" },
        { value: "medium_package", label: "Medium Package" },
        { value: "large_package", label: "Large Package" },
        { value: "fragile", label: "Fragile" },
        { value: "other", label: "Other" },
    ];
    
    const paymentMethods = [
        { value: "cash", label: "Cash" },
        { value: "credit_card", label: "Credit Card" },
        { value: "online_payment", label: "Online Payment" },
    ];
    
    const handleLocationCountChange = (e) => {
        const count = parseInt(e.target.value);
        setLocationCount(count);
        
        const updatedReceivers = [...data.receivers];
        
        if (count > updatedReceivers.length) {
            // Add more receiver fields
            for (let i = updatedReceivers.length; i < count; i++) {
                updatedReceivers.push({ receiver_name: "", receiver_address: "", receiver_telephone: "" });
            }
        } else if (count < updatedReceivers.length) {
            // Remove excess receiver fields
            updatedReceivers.splice(count);
        }
        
        setData({
            ...data,
            locations: count,
            receivers: updatedReceivers
        });
    };
    
    const handleReceiverChange = (index, field, value) => {
        const updatedReceivers = [...data.receivers];
        updatedReceivers[index] = {
            ...updatedReceivers[index],
            [field]: value
        };
        setData("receivers", updatedReceivers);
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("couriers.store"));
    };
    
    console.log("Current form data:", data);
    console.log("Validation errors:", errors);
    
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Book Courier Pickup</h2>}
        >
            <Head title="Book Courier Pickup" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-6">Book Courier Pickup</h2>
                        
                        {/* Display validation errors summary */}
                        {Object.keys(errors).length > 0 && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                                <p className="text-red-600 font-medium">Please fix the following errors:</p>
                                <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                                    {Object.keys(errors).map(key => (
                                        <li key={key}>{errors[key]}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4 border-b pb-2">Sender's Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.sender_name}
                                            onChange={e => setData("sender_name", e.target.value)}
                                        />
                                        {errors.sender_name && <p className="text-red-500 text-sm mt-1">{errors.sender_name}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block mb-1">Telephone Number</label>
                                        <input
                                            type="text"
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.sender_telephone}
                                            onChange={e => setData("sender_telephone", e.target.value)}
                                        />
                                        {errors.sender_telephone && <p className="text-red-500 text-sm mt-1">{errors.sender_telephone}</p>}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block mb-1">Address</label>
                                        <textarea
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            rows="3"
                                            value={data.sender_address}
                                            onChange={e => setData("sender_address", e.target.value)}
                                        ></textarea>
                                        {errors.sender_address && <p className="text-red-500 text-sm mt-1">{errors.sender_address}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block mb-1">Parcel Type</label>
                                        <select
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.parcel_type}
                                            onChange={e => setData("parcel_type", e.target.value)}
                                        >
                                            <option value="">Select parcel type</option>
                                            {parcelTypes.map(type => (
                                                <option key={type.value} value={type.value}>{type.label}</option>
                                            ))}
                                        </select>
                                        {errors.parcel_type && <p className="text-red-500 text-sm mt-1">{errors.parcel_type}</p>}
                                    </div>
                                    
                                    {data.parcel_type === "other" && (
                                        <div>
                                            <label className="block mb-1">Specify Parcel Type</label>
                                            <input
                                                type="text"
                                                className="w-full border-gray-300 rounded-md shadow-sm"
                                                value={data.custom_parcel_type}
                                                onChange={e => setData("custom_parcel_type", e.target.value)}
                                            />
                                            {errors.custom_parcel_type && <p className="text-red-500 text-sm mt-1">{errors.custom_parcel_type}</p>}
                                        </div>
                                    )}
                                    
                                    <div>
                                        <label className="block mb-1">Parcel Count</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.parcel_count}
                                            onChange={e => setData("parcel_count", parseInt(e.target.value) || 0)}
                                        />
                                        {errors.parcel_count && <p className="text-red-500 text-sm mt-1">{errors.parcel_count}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block mb-1">Weight (kg)</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.parcel_weight}
                                            onChange={e => setData("parcel_weight", e.target.value)}
                                        />
                                        {errors.parcel_weight && <p className="text-red-500 text-sm mt-1">{errors.parcel_weight}</p>}
                                    </div>
                                    
                                    <div>
                                        <label className="block mb-1">Payment Method</label>
                                        <select
                                            className="w-full border-gray-300 rounded-md shadow-sm"
                                            value={data.payment_method}
                                            onChange={e => setData("payment_method", e.target.value)}
                                        >
                                            <option value="">Select payment method</option>
                                            {paymentMethods.map(method => (
                                                <option key={method.value} value={method.value}>{method.label}</option>
                                            ))}
                                        </select>
                                        {errors.payment_method && <p className="text-red-500 text-sm mt-1">{errors.payment_method}</p>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-8">
                                <h3 className="text-lg font-medium mb-4 border-b pb-2">Receiver's Details</h3>
                                
                                <div className="mb-4">
                                    <label className="block mb-1">Number of Delivery Locations</label>
                                    <select
                                        className="w-full border-gray-300 rounded-md shadow-sm"
                                        value={locationCount}
                                        onChange={handleLocationCountChange}
                                    >
                                        {[1, 2, 3, 4, 5].map(num => (
                                            <option key={num} value={num}>{num}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                {data.receivers.map((receiver, index) => (
                                    <div key={index} className="border rounded-md p-4 mb-4">
                                        <h4 className="font-medium mb-3">Location {index + 1}</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block mb-1">Receiver Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                                    value={receiver.receiver_name || ""}
                                                    onChange={e => handleReceiverChange(index, "receiver_name", e.target.value)}
                                                />
                                                {errors[`receivers.${index}.receiver_name`] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors[`receivers.${index}.receiver_name`]}</p>
                                                )}
                                            </div>
                                            
                                            <div>
                                                <label className="block mb-1">Telephone Number</label>
                                                <input
                                                    type="text"
                                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                                    value={receiver.receiver_telephone || ""}
                                                    onChange={e => handleReceiverChange(index, "receiver_telephone", e.target.value)}
                                                />
                                                {errors[`receivers.${index}.receiver_telephone`] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors[`receivers.${index}.receiver_telephone`]}</p>
                                                )}
                                            </div>
                                            
                                            <div className="md:col-span-2">
                                                <label className="block mb-1">Address</label>
                                                <textarea
                                                    className="w-full border-gray-300 rounded-md shadow-sm"
                                                    rows="3"
                                                    value={receiver.receiver_address || ""}
                                                    onChange={e => handleReceiverChange(index, "receiver_address", e.target.value)}
                                                ></textarea>
                                                {errors[`receivers.${index}.receiver_address`] && (
                                                    <p className="text-red-500 text-sm mt-1">{errors[`receivers.${index}.receiver_address`]}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                
                                {errors.receivers && <p className="text-red-500 text-sm mt-1">{errors.receivers}</p>}
                                {errors.locations && <p className="text-red-500 text-sm mt-1">{errors.locations}</p>}
                            </div>
                            
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                                    disabled={processing}
                                >
                                    {processing ? "Booking..." : "Book Pickup"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
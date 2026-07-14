import React, { useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import miniSearchIcon from "../../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";
import miniUp from "../../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../../assets/vendors/dashboard/icons/miniDown.svg";
import file from "../../../../assets/vendors/clients/file.svg";
import proPic from "../../../../assets/vendors/clients/proPic.svg";

const ClientTable = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

    const [clients, setClients] = useState([
        {
            id: 1,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 2,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 3,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 4,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 5,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 6,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
        {
            id: 7,
            name: "Steve Gibson",
            email: "steve.gibson@example.com",
            phone: "+94 78 390 1623",
            address: "123, Maple Street, Colombo",
            documents: [
                { name: "NIC Copy" },
                { name: "Driving Licence" },
                { name: "Certification" },
            ],
        },
    ]);

    // State for popup
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentClientId, setCurrentClientId] = useState(null);
    const [newClient, setNewClient] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        documents: [],
    });
    const [documentInput, setDocumentInput] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentClients = clients.slice(startIdx, endIdx);

    const goToPage = (page) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper for pagination numbers with ellipsis
    const getPageNumbers = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, "...", totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(
                    1,
                    "...",
                    totalPages - 2,
                    totalPages - 1,
                    totalPages
                );
            } else {
                pages.push(
                    1,
                    "...",
                    currentPage - 1,
                    currentPage,
                    currentPage + 1,
                    "...",
                    totalPages
                );
            }
        }
        return pages;
    };

    // Handle form input changes
    const handleInputChange = (e) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const { name, value } = e.target;
        setNewClient({ ...newClient, [name]: value });
    };

    // Handle file input
    const handleFileChange = (e) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    // Add file to documents
    const addFileToDocuments = () => {
  const { auth } = usePage().props;
  const user = auth?.user;

        if (selectedFile) {
            setNewClient({
                ...newClient,
                documents: [
                    ...newClient.documents,
                    { name: selectedFile.name },
                ],
            });
            setSelectedFile(null);
        }
    };

    // Handle form submission
    const handleSubmit = (e) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        e.preventDefault();
        if (isEditing) {
            setClients(
                clients.map((client) =>
                    client.id === currentClientId
                        ? { ...newClient, id: currentClientId }
                        : client
                )
            );
        } else {
            setClients([...clients, { ...newClient, id: clients.length + 1 }]);
        }
        setNewClient({
            name: "",
            email: "",
            phone: "",
            address: "",
            documents: [],
        });
        setDocumentInput("");
        setSelectedFile(null);
        setIsPopupOpen(false);
        setIsEditing(false);
        setCurrentClientId(null);
    };

    // Handle edit button click
    const handleEdit = (client) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        setNewClient({ ...client });
        setCurrentClientId(client.id);
        setIsEditing(true);
        setIsPopupOpen(true);
    };

    // Handle delete button click
    const handleDelete = (id) => {
  const { auth } = usePage().props;
  const user = auth?.user;

        setClients(clients.filter((client) => client.id !== id));
    };

    // Reset to first page when itemsPerPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="relative">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-between items-start sm:items-center w-full">
                <div className="flex flex-row gap-5 justify-center items-center">
                    <div className="w-full sm:w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                        <img src={miniSearchIcon} />
                        <input
                            type="text"
                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                            placeholder="Search client name, car, etc."
                        />
                    </div>
                </div>
                <button
                    className="w-full sm:w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]"
                    onClick={() => {
                        setIsEditing(false);
                        setNewClient({
                            name: "",
                            email: "",
                            phone: "",
                            address: "",
                            documents: [],
                        });
                        setIsPopupOpen(true);
                    }}
                >
                    Add Client
                </button>
            </div>

            {/* Popup for adding/editing client */}
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 poppins p-4">
                    <div className="bg-white p-6 sm:p-10 rounded-[10px] w-full max-w-[500px] max-h-[100vh] overflow-y-auto">
                        <h2 className="text-[18px] font-[700] mb-4">
                            {isEditing ? "Edit Client" : "Add New Client"}
                        </h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[14px] font-[600]">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={newClient.name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 sm:p-5 border rounded-[5px] focus:outline-none focus:ring-0 focus:border-[#000000]"
                                    placeholder="Enter name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-[600]">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={newClient.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 sm:p-5 border rounded-[5px] focus:outline-none focus:ring-0 focus:border-[#000000]"
                                    placeholder="Enter email"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-[600]">
                                    Phone
                                </label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={newClient.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-3 sm:p-5 border rounded-[5px] focus:outline-none focus:ring-0 focus:border-[#000000]"
                                    placeholder="Enter phone number"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-[600]">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={newClient.address}
                                    onChange={handleInputChange}
                                    className="w-full p-3 sm:p-5 border rounded-[5px] focus:outline-none focus:ring-0 focus:border-[#000000]"
                                    placeholder="Enter address"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-[600]">
                                    Documents
                                </label>
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="w-full p-3 sm:p-5 border border-[#000000] border-dashed rounded-[5px] focus:outline-none focus:ring-0 focus:border-[#000000] text-[12px] file:mr-3 file:rounded file:border-0 file:px-3 file:py-2 file:bg-[#F3F4F6] file:text-[12px] file:cursor-pointer"
                                    />
                                    <button
                                        onClick={addFileToDocuments}
                                        disabled={!selectedFile}
                                        className={`px-4 py-2 sm:py-5 font-[600] rounded-[5px] text-white ${
                                            selectedFile
                                                ? "bg-[#0955AC]"
                                                : "bg-gray-400 cursor-not-allowed"
                                        }`}
                                    >
                                        Add File
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2">
                                {newClient.documents.map((doc, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2"
                                    >
                                        <img src={file} alt="file icon" />
                                        <span>{doc.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-end gap-2">
                                <button
                                    onClick={() => {
                                        setIsPopupOpen(false);
                                        setIsEditing(false);
                                        setNewClient({
                                            name: "",
                                            email: "",
                                            phone: "",
                                            address: "",
                                            documents: [],
                                        });
                                        setDocumentInput("");
                                        setSelectedFile(null);
                                    }}
                                    className="px-4 py-2 bg-gray-200 rounded-[5px] font-[700]"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="px-4 py-2 bg-[#0955AC] text-white rounded-[5px] font-[700]"
                                >
                                    {isEditing ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {isMobile ? (
                // Mobile Card View
                <div className="mt-10 space-y-4">
                    {currentClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-white rounded-lg p-4 shadow-md border"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <img src={proPic} className="size-[50px] rounded-full" />
                                <div>
                                    <h3 className="text-[16px] font-[700]">{client.name}</h3>
                                    <p className="text-[10px] text-[#616161]">{client.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-[14px]">
                                <div>
                                    <span className="font-[600]">Phone:</span> {client.phone}
                                </div>
                                <div>
                                    <span className="font-[600]">Address:</span> {client.address}
                                </div>
                                <div>
                                    <span className="font-[600]">Documents:</span>
                                    <div className="mt-1 space-y-1">
                                        {client.documents.map((doc, idx) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <img src={file} className="w-4 h-4" />
                                                <span className="text-[12px]">{doc.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    className="flex-1 h-[30px] border border-[#0955AC] rounded-[4px] text-[12px] text-[#0955AC] font-[500] flex justify-center items-center"
                                    onClick={() => handleEdit(client)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="flex-1 h-[30px] border border-[#FF0000] rounded-[4px] text-[12px] text-[#FF0000] font-[500] flex justify-center items-center"
                                    onClick={() => handleDelete(client.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {/* table headings */}
                    <div className="figtree grid grid-cols-7 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10 mt-10">
                        <div className="flex flex-row gap-5 items-center col-span-2">
                            <input
                                type="checkbox"
                                className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                            />
                            <h1>Client Name</h1>
                            <div className="flex flex-col justify-center items-center">
                                <img src={miniUp} className="w-[6px] h-[4px]" />
                                <img src={miniDown} className="w-[6px] h-[4px]" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center pl-10">
                            <h1>Contact No</h1>
                            <div className="flex flex-col justify-center items-center">
                                <img src={miniUp} className="w-[6px] h-[4px]" />
                                <img src={miniDown} className="w-[6px] h-[4px]" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center col-span-2 pl-20">
                            <h1>Address</h1>
                            <div className="flex flex-col justify-center items-center">
                                <img src={miniUp} className="w-[6px] h-[4px]" />
                                <img src={miniDown} className="w-[6px] h-[4px]" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <h1>Documents</h1>
                            <div className="flex flex-col justify-center items-center">
                                <img src={miniUp} className="w-[6px] h-[4px]" />
                                <img src={miniDown} className="w-[6px] h-[4px]" />
                            </div>
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <h1>Action</h1>
                            <div className="flex flex-col justify-center items-center">
                                <img src={miniUp} className="w-[6px] h-[4px]" />
                                <img src={miniDown} className="w-[6px] h-[4px]" />
                            </div>
                        </div>
                    </div>
                    {/* end */}

                    {/* table rows */}
                    {currentClients.map((client, idx) => (
                        <div
                            key={client.id}
                            className="figtree grid grid-cols-7 h-[100px] border-b-[1.5px] border-[#00000033] px-10 items-center text-[12px] font-[500]"
                        >
                            <div className="flex flex-row col-span-2 items-center gap-7">
                                <input
                                    type="checkbox"
                                    className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                                />
                                <div className="flex flex-row gap-3 justify-center items-center">
                                    <img src={proPic} className="size-[50px]" />
                                    <div>
                                        <h1 className="text-[15px]">{client.name}</h1>
                                        <h1 className="text-[#616161] text-[10px] break-all">
                                            {client.email}
                                        </h1>
                                    </div>
                                </div>
                            </div>
                            <div className="pl-10">{client.phone}</div>
                            <div className="col-span-2 pl-20">{client.address}</div>
                            <div className="text-[12px]">
                                {client.documents.map((doc, docIdx) => (
                                    <div className="flex flex-row gap-2" key={docIdx}>
                                        <img src={file} />
                                        <h1>{doc.name}</h1>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-row justify-center items-center gap-3">
                                <div
                                    className="w-[54px] h-[20px] border-[1px] border-[#0955AC] rounded-[4px] text-[10px] text-[#0955AC] font-500 flex justify-center items-center cursor-pointer"
                                    onClick={() => handleEdit(client)}
                                >
                                    Edit
                                </div>
                                <div
                                    className="w-[54px] h-[20px] border-[1px] border-[#FF0000] rounded-[4px] text-[10px] text-[#FF0000] font-500 flex justify-center items-center cursor-pointer"
                                    onClick={() => handleDelete(client.id)}
                                >
                                    Delete
                                </div>
                            </div>
                        </div>
                    ))}
                    {/* end */}
                </>
            )}

            {/* Pagination Controls and Results per page */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-20">
                {/* Left: Results per page */}
                <div className="flex items-center">
                    <span className="mr-3 text-[#00000080] text-[14px] sm:text-[15px]">
                        Results per page
                    </span>
                    <select
                        className="rounded px-3 py-1 font-[600] text-[14px] sm:text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                        value={itemsPerPage}
                        onChange={(e) =>
                            setItemsPerPage(Number(e.target.value))
                        }
                    >
                        {perPageOptions.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                </div>
                {/* Right: Pagination */}
                <div className="flex items-center gap-2 flex-wrap">
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="text-lg">&#60;</span>
                    </button>
                    {getPageNumbers().map((num, idx) =>
                        num === "..." ? (
                            <span key={idx} className="px-2">
                                ...
                            </span>
                        ) : (
                            <button
                                key={num}
                                className={`px-3 py-1 text-[14px] sm:text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${
                                    currentPage === num
                                        ? " text-[#0955AC] font-[600] border-[2px] border-[#0955AC]"
                                        : "bg-[#F4F3F3]"
                                }`}
                                onClick={() => goToPage(num)}
                            >
                                {num}
                            </button>
                        )
                    )}
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <span className="text-lg">&#62;</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClientTable;

import React, { useState } from "react";
import miniSearchIcon from "../../../assets/vendors/dashboard/icons/miniSearchIcon.svg";

import miniUp from "../../../assets/vendors/dashboard/icons/miniUp.svg";
import miniDown from "../../../assets/vendors/dashboard/icons/miniDown.svg";
import file from "../../../assets/vendors/clients/file.svg";
import proPic from "../../../assets/vendors/clients/proPic.svg";

const ClientTable = () => {
    const clients = [
        {
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
    ];

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(clients.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentClients = clients.slice(startIdx, endIdx);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Helper for pagination numbers with ellipsis
    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    // Reset to first page when itemsPerPage changes
    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div>
            <div className="flex flex-row items-center justify-between w-full">
                <div className="flex flex-row gap-5 justify-center items-center">
                    <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                        <img src={miniSearchIcon} />
                        <input
                            type="text"
                            className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                            placeholder="Search client name, car, etc."
                        />
                    </div>
                </div>
                <button className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700]">
                    Add Booking
                </button>
            </div>

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
                    key={startIdx + idx}
                    className="figtree grid grid-cols-7 h-[100px] border-b-[1.5px] border-[#00000033] px-10 items-center text-[14px] font-[500]"
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
                                <h1 className="text-[#616161] text-[14px]">
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
                        <div className="w-[54px] h-[20px] border-[1px] border-[#0955AC] rounded-[4px] text-[10px] text-[#0955AC] font-500 flex justify-center items-center cursor-pointer">
                            Edit
                        </div>
                        <div className="w-[54px] h-[20px] border-[1px] border-[#FF0000] rounded-[4px] text-[10px] text-[#FF0000] font-500 flex justify-center items-center cursor-pointer">
                            Delete
                        </div>
                    </div>
                </div>
            ))}
            {/* end */}

            {/* Pagination Controls and Results per page */}
            <div className="flex justify-between items-center gap-2 mt-20">
                {/* Left: Results per page */}
                <div className="flex items-center">
                    <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
                    <select
                        className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
                        value={itemsPerPage}
                        onChange={e => setItemsPerPage(Number(e.target.value))}
                    >
                        {perPageOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
                {/* Right: Pagination */}
                <div className="flex items-center gap-2">
                    <button
                        className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <span className="text-lg">&#60;</span>
                    </button>
                    {getPageNumbers().map((num, idx) =>
                        num === '...'
                            ? <span key={idx} className="px-2">...</span>
                            : <button
                                key={num}
                                className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${currentPage === num ? ' text-[#0955AC] font-[600] border-[2px] border-[#0955AC]' : 'bg-[#F4F3F3]'}`}
                                onClick={() => goToPage(num)}
                            >
                                {num}
                            </button>
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

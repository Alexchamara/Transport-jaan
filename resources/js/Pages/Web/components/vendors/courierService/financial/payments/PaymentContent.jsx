import React, { useState } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable"; 
import {
  Search,
  Settings,
  Bell,
  UserCircle2,
  Wallet,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  ChevronDown,
  ChevronsUpDown
} from "lucide-react";

const PaymentContent = () => {
    const transactions = [
      {
        id: "INV-1001",
        customer: "Bob Smith",
        service: "Express Delivery",
        packages: 2,
        amount: "$12.50",
        dueDate: "2025-08-10",
        status: "Paid",
        statusColor: "#3B8F31",
        statusBg: "#ACE19957",
      },
      {
        id: "INV-1002",
        customer: "Alice Johnson",
        service: "Standard Delivery",
        packages: 1,
        amount: "$7.90",
        dueDate: "2025-08-12",
        status: "Pending",
        statusColor: "#FF6060",
        statusBg: "#FF60608C",
      },
      {
        id: "INV-1003",
        customer: "Nimal Perera",
        service: "International",
        packages: 3,
        amount: "$38.00",
        dueDate: "2025-08-15",
        status: "Paid",
        statusColor: "#3B8F31",
        statusBg: "#ACE19957",
      },
      {
        id: "INV-1004",
        customer: "Chamari Silva",
        service: "Economy",
        packages: 1,
        amount: "$5.40",
        dueDate: "2025-08-18",
        status: "Paid",
        statusColor: "#3B8F31",
        statusBg: "#ACE19957",
      },
      {
        id: "INV-1005",
        customer: "Steve Gibson",
        service: "Same Day",
        packages: 2,
        amount: "$9.20",
        dueDate: "2025-08-20",
        status: "Pending",
        statusColor: "#FF6060",
        statusBg: "#FF60608C",
      },
    ];

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedRows, setSelectedRows] = useState(new Set());
    const perPageOptions = [5, 10, 20, 50];
    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const currentTransactions = transactions.slice(startIdx, endIdx);

    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
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

    const handleRowSelection = (rowIndex) => {
        const actualIndex = startIdx + rowIndex;
        const newSelectedRows = new Set(selectedRows);
        if (newSelectedRows.has(actualIndex)) {
            newSelectedRows.delete(actualIndex);
        } else {
            newSelectedRows.add(actualIndex);
        }
        setSelectedRows(newSelectedRows);
    };

    const handleSelectAll = () => {
        if (selectedRows.size === currentTransactions.length) {
            setSelectedRows(new Set());
        } else {
            const allCurrentIndices = currentTransactions.map(
                (_, index) => startIdx + index
            );
            setSelectedRows(new Set(allCurrentIndices));
        }
    };

    const downloadTableAsPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("Recent Transactions", 14, 20);

        const tableData = transactions.map((txn) => [
          txn.id,
          txn.customer,
          txn.service,
          String(txn.packages),
          txn.amount,
          txn.dueDate,
          txn.status,
        ]);

        autoTable(doc, {
          head: [[
            "Invoice Id",
            "Customer",
            "Service",
            "Packages",
            "Amount",
            "Due Date",
            "Status",
          ]],
          body: tableData,
          startY: 30,
          theme: "grid",
          headStyles: {
            fillColor: [216, 228, 242],
            textColor: [0, 0, 0],
            fontStyle: "bold",
          },
          styles: {
            cellPadding: 2,
            fontSize: 10,
            textColor: [0, 0, 0],
            lineWidth: 0.1,
            lineColor: [0, 0, 0],
          },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 35 },
            3: { cellWidth: 20 },
            4: { cellWidth: 25 },
            5: { cellWidth: 25 },
            6: { cellWidth: 20 },
          },
        });

        doc.save("transactions.pdf");
    };

    React.useEffect(() => {
        setCurrentPage(1);
    }, [itemsPerPage]);

    return (
        <div className="flex flex-col gap-10 w-full h-auto pr-5 py-10">
            {/* Header section */}
            <div className="flex flex-row gap-5 justify-between items-center">
                <h1 className="figtree text-[35px] font-[700]">Courier Service Payment</h1>
                <div className="flex flex-row gap-5">
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Search size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Settings size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <Bell size={28} />
                    </div>
                    <div className="size-[60px] rounded-[10px] bg-[#E8EBEF] flex justify-center items-center">
                        <UserCircle2 size={28} />
                    </div>
                    <div className="figtree flex flex-col justify-center items-start">
                        <h1 className="text-[20px] font-[700]">Steve Gibson</h1>
                        <h1 className="text-[16px] font-[600] text-[#7B7B7A]">
                            Vendor
                        </h1>
                    </div>
                </div>
            </div>
            {/* end of header section */}

            {/* mini 4 cards */}
            <div className="flex flex-row gap-5 w-full">
                {/* card 1 */}
                <div
                    className="min-w-[350px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                    style={{
                        boxShadow: "4px 4px 4px #0000001A",
                    }}
                >
                    <div className="flex flex-row gap-5 justify-center items-center">
                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                            <Wallet />
                        </div>
                        <div>
                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                Balance
                            </h1>
                            <h1 className="text-[26px] font-[700]">$8,450</h1>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                            <TrendingUp className="w-[19px] h-[19px]" />
                            <h1 className="">+2.86%</h1>
                        </div>
                        <h1 className="text-[#7B7B7A]">from last week</h1>
                    </div>
                </div>
                {/* end of card 1 */}

                {/* card 2 */}
                <div
                    className="min-w-[350px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                    style={{
                        boxShadow: "4px 4px 4px #0000001A",
                    }}
                >
                    <div className="flex flex-row gap-5 justify-center items-center">
                        <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                            <TrendingUp />
                        </div>
                        <div>
                            <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                Income
                            </h1>
                            <h1 className="text-[26px] font-[700]">$25,700</h1>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                        <div className="w-[81px] h-[26px] bg-[#D8E4F2] rounded-[5px] flex flex-row justify-center items-center">
                            <TrendingUp className="w-[19px] h-[19px]" />
                            <h1 className="">+1.73%</h1>
                        </div>
                        <h1 className="text-[#7B7B7A]">from last week</h1>
                    </div>
                </div>
                {/* end of card 2 */}

                <div className="flex flex-row gap-5 w-full">
                    {/* card 3 */}
                    <div
                        className="min-w-[350px] w-full min-h-[91px] bg-[#FFFFFF] rounded-[8px] flex justify-between items-center gap-2 px-5 py-2"
                        style={{
                            boxShadow: "4px 4px 4px #0000001A",
                        }}
                    >
                        <div className="flex flex-row gap-5 justify-center items-center">
                            <div className="size-[50px] bg-[#D8E4F2] rounded-full flex justify-center items-center">
                                <TrendingDown />
                            </div>
                            <div>
                                <h1 className="text-[16px] font-[500] text-[#7B7B7A]">
                                    Expenses
                                </h1>
                                <h1 className="text-[26px] font-[700]">
                                    $14,756
                                </h1>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end text-[14px] font-[500]">
                            <div className="w-[81px] h-[26px] bg-[#FF888880] rounded-[5px] flex flex-row justify-center items-center">
                                <TrendingDown className="w-[19px] h-[19px]" />
                                <h1 className="">+2.86%</h1>
                            </div>
                            <h1 className="text-[#7B7B7A]">from last week</h1>
                        </div>
                    </div>
                    {/* end of card 3 */}
                </div>
            </div>

            <div
                className="w-full h-auto bg-[#FFFFFF] rounded-[10px] px-10 py-10"
                style={{
                    boxShadow: "4px 4px 4px #0000001A",
                }}
            >
                {/* card header */}
                <div className="flex flex-row justify-between">
                    <h1 className="text-[24px] font-[700]">
                        Recent Transactions
                    </h1>
                    <div className="flex flex-row gap-5">
                        <div className="w-[253px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row justify-center items-center py-2 px-5">
                            <Search size={14} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Search customer, service, etc."
                            />
                        </div>
                        <div className="w-[125px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <Filter size={12} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="Status"
                            />
                            <ChevronDown size={14} />
                        </div>
                        <div className="w-[139px] h-[35px] bg-[#F3F3F3] rounded-[6px] flex flex-row items-center justify-between py-2 px-5">
                            <Calendar size={17} />
                            <input
                                type="text"
                                className="w-full outline-none bg-transparent shadow-none focus:ring-0 border-none placeholder:text-[#7B7B7ACC]"
                                placeholder="25th May"
                            />
                            <ChevronDown size={14} />
                        </div>
                        <button
                            onClick={downloadTableAsPDF}
                            className="w-[125px] h-[35px] bg-[#0955AC] text-[14px] rounded-[6px] text-[#FFFFFF] font-[700] flex justify-center items-center gap-3"
                        >
                            <Download size={18} />
                            <h1>Download</h1>
                        </button>
                    </div>
                </div>
                {/* end */}

                {/* expenses table */}
                {/* table headings */}
                <div className="figtree grid grid-cols-9 bg-[#D8E4F2] h-[42px] justify-center items-center rounded-[8px] text-[14px] font-[600] px-10 mt-10">
                    <div className="flex flex-row gap-3 items-center">
                      <input
                        type="checkbox"
                        className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                        checked={
                          selectedRows.size === currentTransactions.length &&
                          currentTransactions.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                      <h1>Invoice Id</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Customer</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Service</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center ml-5">
                      <h1>Packages</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Amount</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Due Date</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Status</h1>
                      <ChevronsUpDown size={12} />
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                      <h1>Action</h1>
                    </div>
                </div>
                {/* end */}
                {currentTransactions.map((txn, idx) => (
                  <div
                    key={startIdx + idx}
                    className="grid grid-cols-9 h-[100px] justify-center items-center text-[15px] font-[500] px-10 border-b-[1.5px] border-[#00000033]"
                    style={{
                      backgroundColor: selectedRows.has(startIdx + idx)
                        ? "#CCCCCC4F"
                        : "transparent",
                    }}
                  >
                    <div className="flex flex-row items-center gap-5">
                      <input
                        type="checkbox"
                        className="size-[20px] rounded-[4px] bg-[#CCCCCC73]"
                        checked={selectedRows.has(startIdx + idx)}
                        onChange={() => handleRowSelection(idx)}
                      />
                      <h1>{txn.id}</h1>
                    </div>
                    <div>{txn.customer}</div>
                    <div>{txn.service}</div>
                    <div className="ml-5">{txn.packages}</div>
                    <div>{txn.amount}</div>
                    <div>{txn.dueDate}</div>
                    <div>
                      <div
                        className="w-[72px] h-[20px] text-[10px] font-[700] rounded-[4px] flex justify-center items-center"
                        style={{
                          border: `1px solid ${txn.statusColor}`,
                          background: txn.statusBg,
                          color: txn.statusColor,
                        }}
                      >
                        {txn.status}
                      </div>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">
                      <div className="w-[54px] h-[20px] border-[1px] border-[#0955AC] rounded-[4px] text-[10px] text-[#0955AC] font-500 flex justify-center items-center cursor-pointer">
                        Edit
                      </div>
                      <div className="w-[54px] h-[20px] border-[1px] border-[#FF0000] rounded-[4px] text-[10px] text-[#FF0000] font-500 flex justify-center items-center cursor-pointer">
                        Delete
                      </div>
                    </div>
                  </div>
                ))}
                {/* Pagination Controls and Results per page inline */}
                <div className="flex justify-between items-center gap-2 mt-20">
                    {/* Left: Results per page */}
                    <div className="flex items-center">
                        <span className="mr-3 text-[#00000080] text-[15px]">
                            Results per page
                        </span>
                        <select
                            className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none"
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
                    <div className="flex items-center gap-2">
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
                                    className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] bg-[#F4F3F3] ${
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
        </div>
    );
};

export default PaymentContent;

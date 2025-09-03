import React from 'react';

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange = () => {}, 
  itemsPerPage = 10,
  onItemsPerPageChange = () => {},
  totalItems = 0,
  perPageOptions = [5, 10, 20, 50]
}) => {
  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  // Helper for pagination numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-between items-center gap-2 mt-6">
      {/* Left: Results per page */}
      <div className="flex items-center">
        <span className="mr-3 text-[#00000080] text-[15px]">Results per page</span>
        <select 
          className="rounded px-3 py-1 font-[600] text-[16px] bg-[#F4F3F3] border-[1px] border-[#BEBEBE] w-[71px] h-[40px] focus:outline-none" 
          value={itemsPerPage} 
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        >
          {perPageOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      {/* Center: Results info */}
      <div className="text-[#7B7B7A] text-sm">
        Page {currentPage} of {totalPages} ({totalItems} total items)
      </div>

      {/* Right: Pagination */}
      <div className="flex items-center gap-2">
        <button 
          className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors" 
          onClick={() => goToPage(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          <span className="text-lg">&#60;</span>
        </button>
        
        {getPageNumbers().map((num, idx) =>
          num === "..." ? (
            <span key={idx} className="px-2">...</span>
          ) : (
            <button 
              key={num} 
              className={`px-3 py-1 text-[16px] font-[600] rounded-[4px] size-[40px] hover:bg-[#E5E5E5] transition-colors ${
                currentPage === num 
                  ? "text-[#0955AC] font-[600] border-[2px] border-[#0955AC] bg-[#F4F3F3]" 
                  : "bg-[#F4F3F3]"
              }`} 
              onClick={() => goToPage(num)}
            >
              {num}
            </button>
          )
        )}
        
        <button 
          className="px-3 py-1 size-[40px] rounded-[4px] bg-[#F4F3F3] disabled:opacity-50 hover:bg-[#E5E5E5] transition-colors" 
          onClick={() => goToPage(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          <span className="text-lg">&#62;</span>
        </button>
      </div>
    </div>
  );
};

export default Pagination;
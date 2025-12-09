import React from "react";
import proPic from "../../../../assets/vendors/clients/proPic.svg";

const MobilePaymentCards = ({ transactions, handleEdit, handleDelete }) => {
  return (
    <div className="md:hidden space-y-4 mt-5">
      {transactions.map((txn) => (
        <div
          key={txn.id}
          className="bg-white border border-gray-200 rounded-[10px] p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <img src={proPic} className="size-[50px] rounded-full" />
            <div>
              <h1 className="text-[16px] font-[700] break-all">{txn.client}</h1>
              <h1 className="text-[#616161] text-[12px] break-all">Invoice #{txn.id}</h1>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Car Model:</span>
              <span className="text-[12px]">{txn.car}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Rent Per Day:</span>
              <span className="text-[12px]">{txn.rentPerDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Days:</span>
              <span className="text-[12px]">{txn.days}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Amount:</span>
              <span className="text-[12px] font-[700]">{txn.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Due Date:</span>
              <span className="text-[12px]">{txn.dueDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Status:</span>
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
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 h-[30px] border border-[#0955AC] rounded-[4px] text-[12px] text-[#0955AC] font-[500]"
              onClick={() => handleEdit(txn)}
            >
              Edit
            </button>
            <button
              className="flex-1 h-[30px] border border-[#FF0000] rounded-[4px] text-[12px] text-[#FF0000] font-[500]"
              onClick={() => handleDelete(txn.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobilePaymentCards;
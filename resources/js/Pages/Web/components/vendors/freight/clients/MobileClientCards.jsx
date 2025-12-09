import React from "react";
import file from "../../../../assets/vendors/clients/file.svg";
import proPic from "../../../../assets/vendors/clients/proPic.svg";

const MobileClientCards = ({ clients, handleEdit, handleDelete }) => {
  return (
    <div className="md:hidden space-y-4 mt-5">
      {clients.map((client) => (
        <div
          key={client.id}
          className="bg-white border border-gray-200 rounded-[10px] p-4 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-3">
            <img src={proPic} className="size-[50px] rounded-full" />
            <div>
              <h1 className="text-[16px] font-[700] break-all">{client.name}</h1>
              <h1 className="text-[#616161] text-[12px] break-all">{client.email}</h1>
            </div>
          </div>
          <div className="space-y-2 mb-3">
            <div className="flex justify-between">
              <span className="text-[12x] font-[600] text-gray-600">Phone:</span>
              <span className="text-[12px]">{client.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[12px] font-[600] text-gray-600">Address:</span>
              <span className="text-[12px] break-all">{client.address}</span>
            </div>
            <div>
              <span className="text-[12px] font-[600] text-gray-600">Documents:</span>
              <div className="mt-1 space-y-1">
                {client.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <img src={file} className="size-[16px]" />
                    <span className="text-[12px] break-all">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 h-[30px] border border-[#0955AC] rounded-[4px] text-[12px] text-[#0955AC] font-[500]"
              onClick={() => handleEdit(client)}
            >
              Edit
            </button>
            <button
              className="flex-1 h-[30px] border border-[#FF0000] rounded-[4px] text-[12px] text-[#FF0000] font-[500]"
              onClick={() => handleDelete(client.id)}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MobileClientCards;
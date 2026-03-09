import React from 'react';
import { ChevronLeft } from 'lucide-react';

const BackButton = () => {
  const handleBack = () => {
    window.history.back();
  };

  return (
    <button
      onClick={handleBack}
      className="flex items-center gap-1 text-[#0955AC] hover:text-[#073d82] font-[500] text-[14px] transition-colors"
    >
      <ChevronLeft className="w-5 h-5" />
      Back
    </button>
  );
};

export default BackButton;
import React from "react";
import { usePage } from "@inertiajs/react";

const WarehouseImages = () => {
  const { props } = usePage();
  const { warehouse } = props;
  // Handle images - warehouse.images is an array of image paths
  const images = warehouse?.images || [];
  const fallbackImage = 'https://via.placeholder.com/600x400?text=Warehouse+Image';
  const imgSrc = (index) => (images[index] ? `/storage/${images[index]}` : fallbackImage);

  return (
    <div className="xl:w:[844px] xl:h-[435px] rounded-[22px]">
      <div className="flex flex-col xl:flex-row justify-center gap-[14px] items-center">
        <img src={imgSrc(0)} className="w-[200px] md:w-[420px]" />
        <div className="hidden xl:flex flex-col gap-[14px]">
          <img src={imgSrc(1)} />
          <img src={imgSrc(2)} />
        </div>
        <div className="hidden xl:flex flex-col gap-[14px]">
          <img src={imgSrc(3)} />
          <img src={imgSrc(4)} />
        </div>
      </div>
    </div>
  );
};

export default WarehouseImages;
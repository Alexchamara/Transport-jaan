import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import info from "../../assets/rentAVehicle/collection/info.png";
import heartFill from '../../assets/rentAVehicle/collection/heartFill.png';
import heart from '../../assets/rentAVehicle/collection/heart.png';

const VehicleListContent = ({ vehicles: initialVehicles, authUser, likedVehicleIds }) => {
  const [likedVehicles, setLikedVehicles] = useState(likedVehicleIds || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredVehicles, setFilteredVehicles] = useState(initialVehicles?.data || []);
  const itemsPerPage = 6;

  useEffect(() => {
    setFilteredVehicles(initialVehicles?.data || []);
    setCurrentPage(1);
    setLikedVehicles(likedVehicleIds || []);
  }, [initialVehicles, likedVehicleIds]);

  const toggleLike = async (vehicleId) => {
    if (!authUser) {
      alert("You must be logged in to like a vehicle.");
      router.visit("/signin");
      return;
    }

    try {
      const response = await axios.post(route("vehicle.like.toggle"), { vehicle_id: vehicleId });
      const { likedVehicleIds } = response.data;

      // Sync state with backend
      setLikedVehicles(likedVehicleIds);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while liking the vehicle.");
    }
  };

  const handleViewDetails = (vehicle) => {
    router.visit(`/vehicleDetails/${vehicle.id}`);
  };

  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentVehicles = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="w-full py-6 md:py-12 px-4 md:px-40">
      <div className="container mx-auto">
        <p className="bebas-neue text-[28px] md:text-[40px] font-[400] mb-6 md:mb-10">
          we found <span className="text-[#0955AC]">{filteredVehicles.length} cars</span> for you
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-15 justify-items-center">
          {currentVehicles.map((vehicle) => (
            <div
              key={vehicle.id}
              className="bg-white shadow-md overflow-hidden h-auto w-full max-w-[286px] py-5"
            >
              <div className="flex items-center justify-center mt-5">
                <img src={info} alt="info" className="h-[30px] md:h-[36px] w-[180px] md:w-[207px]" />
              </div>

              <div className="flex items-center justify-center">
                <img
                  src={vehicle.images?.[0]?.image_path ? `/storage/${vehicle.images[0].image_path}` : 'https://via.placeholder.com/286x150?text=No+Image'}
                  alt={vehicle.model}
                  className="w-full h-[120px] md:h-[150px] object-cover"
                />
              </div>

              <div className="p-2 flex flex-col items-center justify-center">
                <h3 className="bebas-neue text-[24px] md:text-[30px] font-[400] text-center">
                  {vehicle.model.split(" ").map((word, i) => (
                    <span key={i} className={i === 1 ? "text-[#0955AC]" : ""}>
                      {word}{" "}
                    </span>
                  ))}
                </h3>
                <p className="poppins font-[700] text-[20px] md:text-[25px]">
                  {vehicle.rental_price_per_day ?? 89}.00
                  <span className="text-[#00000080] text-[8px] md:text-[10px] font-[600]"> /day</span>
                </p>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleViewDetails(vehicle)}
                    className="bg-[#0955AC] text-white px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => toggleLike(vehicle.id)}
                    className="border border-[#0955AC] text-[#0955AC] px-3 md:px-4 py-1.5 md:py-2 rounded"
                  >
                    {likedVehicles.includes(vehicle.id) ? (
                      <img src={heartFill} alt="Liked" className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <img src={heart} alt="Not Liked" className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-6 md:mt-8 gap-1 md:gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`px-3 md:px-4 py-1.5 md:py-2 rounded text-sm md:text-base ${currentPage === page
                    ? "bg-[#0955AC] text-white"
                    : "bg-white text-[#0955AC] border border-[#0955AC]"
                  }`}
              >
                {page}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleListContent;

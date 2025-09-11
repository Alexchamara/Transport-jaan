import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import clock from "../../assets/landVehicleDetails/clock.svg";
import QuoteModal from "../LandVehicleDetails/QuoteModal";
import useScrollLock from "../LandVehicleDetails/useScrollLock";

const WarehouseSearch = () => {
  const { props } = usePage();
  const { warehouse } = props;
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  useScrollLock(showQuoteModal);

  const [formData, setFormData] = useState({
    warehouseLocation: warehouse?.address || '',
    requiredSpace: '',
    moveinDate: '',
    moveinTime: '',
    leaseDuration: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Build search parameters
    const searchParams = {
      warehouseLocation: formData.warehouseLocation,
      requiredSpace: formData.requiredSpace,
      moveinDate: formData.moveinDate,
      moveinTime: formData.moveinTime,
      leaseDuration: formData.leaseDuration
    };

    // Remove empty parameters
    Object.keys(searchParams).forEach(key => {
      if (!searchParams[key]) {
        delete searchParams[key];
      }
    });

    // Navigate to warehouse list with search parameters
    router.visit('/warehouseList', {
      method: 'get',
      data: searchParams
    });
  };

  // Map select value to a month count string compatible with checkout parser
  const mapLeaseToDurationString = (val) => {
    switch (val) {
      case '1-3':
        return '1 month';
      case '3-6':
        return '3 months';
      case '6-12':
        return '6 months';
      case '12+':
        return '12 months';
      case 'long-term':
        return '24 months';
      default:
        return '1 month';
    }
  };

  const handleContinueToCheckout = () => {
    try {
      const bookingData = {
        warehouse_id: warehouse?.id,
        warehouse_name: warehouse?.name,
        location: formData.warehouseLocation,
        required_space: formData.requiredSpace,
        move_in_date: formData.moveinDate,
        move_in_time: formData.moveinTime,
        storage_duration: mapLeaseToDurationString(formData.leaseDuration),
        pricing_model: warehouse?.pricing_model || 'month',
      };
      sessionStorage.setItem('warehouseBookingData', JSON.stringify(bookingData));
    } catch (err) {
      // Fallback: continue even if sessionStorage fails
      console.error('Failed saving booking data', err);
    }
    router.visit('/warehouse-bookings/checkout');
  };

  return (
    <div className="px-5 xl:px-0">
      <QuoteModal
        open={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="figtree text-[16px] font-[600]">
            <h1>Company Name</h1>
            <h1>Perahera Rd, </h1>
            <h1>011 - 3 455 675</h1>
            <h1>Colombo 03</h1>
          </div>

          <div className="text-center poppins text-[25px] font-[700] uppercase">
            <h1>
              Company <br /> <span className="text-[#0955AC]">Logo</span>
            </h1>
          </div>
        </div>

        <div className="figtree flex flex-row justify-end text-[35px] font-[700] text-[#0955AC]">
          <h1>Quotation</h1>
        </div>

        <div className="flex flex-row justify-between items-end">
          <div className="text-[16px] font-[600]">
            <h1 className="text-[#0955AC]">Bill To</h1>
            <h1>Client Name</h1>
            <h1>Perahera Rd, </h1>
            <h1>011 - 3 455 675</h1>
            <h1>Colombo 03</h1>
          </div>

          <div className="text-right text-[16px] font-[600]">
            <h1>
              <span className="text-[#0955AC]">Quotation No:</span> #123456
            </h1>
            <h1>
              <span className="text-[#0955AC]">Quotation Date:</span> March 23, 2025
            </h1>
            <h1>
              <span className="text-[#0955AC]">Due Date:</span> May 23, 2025
            </h1>
          </div>
        </div>

        <div className="w-full h-[36px] bg-[#0955AC] mt-10 flex flex-row justify-center items-center text-[#FFFFFF] px-10 text-[14px] font-[700]">
          <h1 className="w-[200px]">Description</h1>
          <h1 className="w-[140px]">QTY.</h1>
          <h1 className="w-[140px]">UNIT price</h1>
          <h1 className="w-[140px] text-end">Sub Total</h1>
        </div>

        <div className="w-full h-[36px] flex flex-row justify-center items-center px-10 text-[14px] font-[600] mt-5">
          <h1 className="w-[200px]">{warehouse?.name || 'Warehouse Unit'}</h1>
          <h1 className="w-[140px]">1 Month</h1>
          <h1 className="w-[140px]">{warehouse?.monthly_rate || warehouse?.price || '—'}</h1>
          <h1 className="w-[140px] text-end">US$ {(warehouse?.monthly_rate || warehouse?.price || 0).toLocaleString?.() || warehouse?.monthly_rate || warehouse?.price || '—'}</h1>
        </div>

        <div className="w-full h-[1.5px] bg-[#0955AC] my-5" />

        <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
          <h1 className="w-[140px]">Subtotal</h1>
          <h1 className="w-[140px] text-end">US$ {(warehouse?.monthly_rate || warehouse?.price || 0).toLocaleString?.() || warehouse?.monthly_rate || warehouse?.price || '—'}</h1>
        </div>
        <div className="w-full h-[36px] flex flex-row justify-end items-center px-10 text-[14px] font-[600]">
          <h1 className="w-[140px]">Sales Tax (5%)</h1>
          <h1 className="w-[140px] text-end">—</h1>
        </div>
        <div className="flex justify-end items-center">
          <div className="flex flex-row items-center border-t-[1px] border-b-[1px] w-[340px] px-10 h-[39px] bg-[#E8EBEF] border-[#0955AC] text-[14px] font-[700] text-[#0955AC]">
            <h1 className="w-[140px]">Total (USD)</h1>
            <h1 className="w-[140px] text-end">US$ {(warehouse?.monthly_rate || warehouse?.price || 0).toLocaleString?.() || warehouse?.monthly_rate || warehouse?.price || '—'}</h1>
          </div>
        </div>

        <h1 className="text-[14px] font-[700] text-[#0955AC]">Terms and Conditions</h1>
        <h1 className="text-[14px] font-[500]">Payment is due in 14 days</h1>

        <div className="flex justify-center items-center">
          <div className="w-[231px] h-[41px] bg-[#0955AC] rounded-[5px] text-[#FFFFFF] font-[600] text-[12px] poppins flex justify-center items-center cursor-pointer">
            Download quotation
          </div>
        </div>
      </QuoteModal>

      <div className="poppins w-auto h-auto xl:w-[440px] xl:h-auto bg-[#F4F3F3] rounded-[19px] flex flex-col gap-10 py-10 xl:px-20 px-10">
        <div className="text-[25px] font-[700]">
          <h1>
            {warehouse?.monthly_rate || warehouse?.price ? `US$ ${(warehouse?.monthly_rate || warehouse?.price).toLocaleString?.() || (warehouse?.monthly_rate || warehouse?.price)}` : 'US$ —'}
            <span className="text-[10px] text-[#00000080]">/{warehouse?.pricing_model || 'month'}</span>
          </h1>
          <h1 className="text-[10px] font-[600] text-[#00000080] py-4">Total before taxes</h1>
          <div className=" w-auto md:w-[346px] h-[1px] bg-[#0000001F]" />
        </div>

        <form onSubmit={handleSearch} className="text-[10px] text-[#00000080] font-[600]">
          <div>
            {/* Location */}
            <div>
              <label htmlFor="warehouseLocation" className="block mb-3">Location</label>
              <input
                type="text"
                id="warehouseLocation"
                placeholder="Hudson Rd, Colombo 03"
                value={formData.warehouseLocation}
                onChange={handleInputChange}
                className="appearance-none w-full h-[35px] border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9] placeholder:text-[12px] placeholder:font-[600]"
              />
            </div>

            {/* Move-in Date/Time */}
            <div className="flex flex-row gap-5">
              <div>
                <label htmlFor="moveinDate" className="block mb-3">Move-in Date</label>
                <input
                  type="text"
                  id="moveinDate"
                  placeholder="23 / 07 / 2025"
                  value={formData.moveinDate}
                  onChange={handleInputChange}
                  className="w-full border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                />
              </div>
              <div className="relative">
                <label htmlFor="moveinTime" className="block mb-3">Move-in Time</label>
                <input
                  type="text"
                  id="moveinTime"
                  placeholder="10 : 00 AM"
                  value={formData.moveinTime}
                  onChange={handleInputChange}
                  className="w-full relative border-[1px] border-[#00000042] bg-transparent rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                />
                <img src={clock} className="hidden sm:block absolute top-11 left-40 z-10" />
              </div>
            </div>
          </div>

          <div>
            {/* Required Space */}
            <div>
              <label htmlFor="requiredSpace" className="block mb-3">Required Space (sq ft)</label>
              <input
                type="number"
                id="requiredSpace"
                placeholder="e.g., 10,000"
                value={formData.requiredSpace}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 leading-tight focus:outline-none placeholder:text-[#000000D9] placeholder:text-[12px] placeholder:font-[600]"
              />
            </div>

            {/* Lease Duration */}
            <div>
              <label htmlFor="leaseDuration" className="block mb-3">Lease Duration</label>
              <select
                id="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 leading-tight focus:outline-none text-[#000000D9]"
              >
                <option value="">Select duration</option>
                <option value="1-3">1-3 months</option>
                <option value="3-6">3-6 months</option>
                <option value="6-12">6-12 months</option>
                <option value="12+">12+ months</option>
                <option value="long-term">Long-term (2+ years)</option>
              </select>
            </div>
          </div>
        </form>

        <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
          <h1 className="font-[600] mb-5 text-[#000000D9]">Pricing Breakdown</h1>
          <div className="w-full h-[1px] bg-[#CDD0D4]" />
          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Space Cost</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>{warehouse?.monthly_rate ? `US$ ${(warehouse.monthly_rate).toLocaleString?.() || warehouse.monthly_rate}/month` : '—'}</h1>
                <h1 className="text-[#0955AC]">(x 1 month)</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">{warehouse?.monthly_rate ? `US$ ${(warehouse.monthly_rate).toLocaleString?.() || warehouse.monthly_rate}` : '—'}</div>
          </div>
          <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Service Fee</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>Platform fee</h1>
                <h1 className="text-[#0955AC]">(5%)</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">—</div>
          </div>
          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Refundable deposit</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>Refunded after inspection</h1>
                <h1 className="text-[#0955AC]">—</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">—</div>
          </div>
          <div className="w-full h-[1px] bg-[#CDD0D4]" />

          <h1 className="font-[600] mt-5 text-[#000000D9]">Summary</h1>

          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Advance Payment</h1>
              <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                <h1>First payment</h1>
                <h1 className="text-[#0955AC]"></h1>
              </div>
            </div>
            <div className="text-[#000000CC] text-[12px] font-[500]">—</div>
          </div>

          <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Total Price Due</h1>
              <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                <h1>Deposit refunded after move-out</h1>
                <h1 className="text-[#0955AC]"></h1>
              </div>
            </div>
            <div className="text-[#000000CC] text-[16px] font-[700]">—</div>
          </div>

          <div className="relative flex flex-col md:flex-row items-start justify-start px-5">
            <span className="absolute top-[5px] left-[20px] w-[2px] h-[2px] bg-[#FF0000] rounded-full" />
            <p className="text-[8.5px] text-[#00000061] ml-4">
              Your total amount will be calculated depending on the move-in date, required space and lease duration
            </p>
          </div>

          <div className="flex justify-center items-center mt-10">
            <div
              className="w-auto xl:w-[261px] xl:h-[29px] bg-[#0955AC] px-4 py-2 rounded-[5px] mt-5 flex items-center justify-center text-[12px] font-[700] text-[#FFFFFF] text-center cursor-pointer"
              onClick={handleContinueToCheckout}
            >
              CONTINUE TO CHECKOUT
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseSearch;
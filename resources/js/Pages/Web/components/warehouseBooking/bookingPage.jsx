import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import Header from '../../layouts/Header';
import Footer from '../../layouts/Footer';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

export default function WarehouseBookingPage({ warehouse = {}, warehouseDetails = {}, warehouseImages = [] }) {
  const [countryCode, setCountryCode] = useState("lk");
  const [phone, setPhone] = useState("");

  const handleWarehouseCheckout = () => {
    router.visit("/warehouse-bookings/checkout", {
      method: "get",
      preserveScroll: true,
    });
  };

  const handleWarehouseList = () => {
    router.visit("/warehouse-bookings/", {
      method: "get",
      preserveScroll: true,
    });
  };

  // Form state
  const [formData, setFormData] = useState({
    warehouse_id: warehouse.id || '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    storage_type: 'general',
    required_space: '',
    storage_duration: '',
    move_in_date: '',
    move_in_time: '',
    move_out_date: '',
    move_out_time: '',
    goods_description: '',
    special_handling: '',
    access_frequency: 'weekly',
    climate_controlled: false,
    insurance_required: true,
    special_requirements: '',
    terms_accepted: false,
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/warehouse-bookings/book', formData);

      if (response.data.success) {
        alert('Warehouse booking completed successfully!');
        window.location.href = '/warehouse-bookings/bookings/list';
      } else {
        alert('Booking failed. Please try again.');
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        console.error('Validation errors:', error.response.data.errors);
        alert('Please fix the validation errors.');
      } else {
        alert('Failed to submit booking. Please try again.');
        console.error('Booking error:', error);
      }
    }
  };

  return (
    <div>
      <Header />

      <div className="flex flex-col xl:flex-row justify-center items-center xl:items-start px-10 py-10 gap-10">
        <div className="flex flex-col gap-10">
          <div className="flex flex-row items-start justify-center pb-10">
            <div
              className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
              onClick={handleWarehouseList}
            >
              <div
                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                style={{
                  boxShadow: "0 0 10px 8px #1565c088", // blur
                }}
              />
              <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                Select Warehouse
              </h1>
            </div>
            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
            <div className="md:flex flex-col hidden justify-center items-center gap-3">
              <div
                className="w-[18px] h-[18px] rounded-full bg-[#1565c0]"
                style={{
                  boxShadow: "0 0 10px 8px #1565c088", // blur
                }}
              />
              <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                Booking Info
              </h1>
            </div>
            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
            <div
              className="flex flex-col justify-center items-center gap-3 cursor-pointer"
              onClick={handleWarehouseCheckout}
            >
              <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#1565c0]" />
              <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                Checkout
              </h1>
            </div>
            <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
            <div
              className="md:flex flex-col justify-center hidden items-center cursor-pointer"
            >
              <div className="w-[22px] h-[22px] rounded-full border-[2px] border-[#1565c0]" />
              <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">
                Booking Confirmation
              </h1>
            </div>
          </div>

          <div
            className="border-l-[0.2px] rounded-[10px] xl:w-[874px] xl:h-auto bg-[#FFFFFF] px-10 py-10"
            style={{
              boxShadow: "4px 4px 4px #0000001A",
              borderLeftWidth: "0.2px",
              borderTopWidth: "0.2px",
            }}
          >
            <h1 className="text-[20px] font-[700]">
              Company Information
            </h1>

            <div className="flex flex-col justify-center gap-5">
              <div className="flex flex-col lg:flex-row justify-between mt-3">
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Company Name :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="text"
                      name="company_name"
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      placeholder="Enter your company name"
                      required
                    />
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Contact Person :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="text"
                      name="contact_person"
                      value={formData.contact_person}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      placeholder="Enter contact person name"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Email Address :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Phone Number :
                  </label>
                  <div className="flex flex-row gap-3">
                    <div className="w-[69px] h-[49px] border-[1px] border-[#0000004D] rounded-[5px] flex items-center justify-center">
                      <PhoneInput
                        country={countryCode}
                        value={""}
                        onChange={(value, data) =>
                          setCountryCode(
                            data.countryCode || "us"
                          )
                        }
                        inputStyle={{
                          display: "none",
                        }}
                        buttonStyle={{
                          border: "none",
                          borderRadius: "5px",
                          width: "100%",
                          height: "47px",
                        }}
                        containerStyle={{
                          width: "100%",
                          height: "100%",
                        }}
                        dropdownStyle={{
                          zIndex: 1000,
                        }}
                        disableCountryCode={false}
                        disableDropdown={false}
                        countryCodeEditable={true}
                        enableSearch={true}
                      />
                    </div>
                    <div className="md:w-[293px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-l-[0.2px] rounded-[10px] lg:w-[874px] h-auto bg-[#FFFFFF] px-10 py-10"
            style={{
              borderLeftWidth: "0.2px",
              borderTopWidth: "0.2px",
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            <h1 className="text-[20px] font-[700]">
              Storage Requirements
            </h1>
            <div className="flex flex-col justify-center gap-5 mt-3">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Storage Type :
                  </label>
                  <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <select
                      name="storage_type"
                      value={formData.storage_type}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                      required
                    >
                      <option value="general">General Storage</option>
                      <option value="cold">Cold Storage</option>
                      <option value="hazardous">Hazardous Materials</option>
                      <option value="electronics">Electronics</option>
                      <option value="food">Food & Beverages</option>
                      <option value="pharmaceutical">Pharmaceutical</option>
                    </select>
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Required Space (sq ft) :
                  </label>
                  <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="number"
                      name="required_space"
                      value={formData.required_space}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      placeholder="1000"
                      required
                    />
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Storage Duration :
                  </label>
                  <div className="md:w-[240px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <select
                      name="storage_duration"
                      value={formData.storage_duration}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent text-[12px] font-[500] text-[#808080]"
                      required
                    >
                      <option value="">Select Duration</option>
                      <option value="1-week">1 Week</option>
                      <option value="2-weeks">2 Weeks</option>
                      <option value="1-month">1 Month</option>
                      <option value="3-months">3 Months</option>
                      <option value="6-months">6 Months</option>
                      <option value="12-months">12 Months</option>
                      <option value="long-term">Long Term (2+ years)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-l-[0.2px] rounded-[10px] lg:w-[874px] h-auto bg-[#FFFFFF] px-10 py-10"
            style={{
              borderLeftWidth: "0.2px",
              borderTopWidth: "0.2px",
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            <h1 className="text-[20px] font-[700]">
              Schedule Information
            </h1>
            <div className="flex flex-col justify-center gap-5 mt-3">
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Move-in Date :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="date"
                      name="move_in_date"
                      value={formData.move_in_date}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      required
                    />
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Move-in Time :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="time"
                      name="move_in_time"
                      value={formData.move_in_time}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col lg:flex-row justify-between">
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Move-out Date :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="date"
                      name="move_out_date"
                      value={formData.move_out_date}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                    />
                  </div>
                </div>
                <div className="">
                  <label className="text-[10px]/[24px] font-[600]">
                    Move-out Time :
                  </label>
                  <div className="md:w-[374px] w-auto h-[49px] border-[1px] border-[#0000004D] rounded-[5px]">
                    <input
                      type="time"
                      name="move_out_time"
                      value={formData.move_out_time}
                      onChange={handleInputChange}
                      className="w-full h-full rounded-[5px] focus:outline-none focus:ring-0 focus:border-transparent border-transparent placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="border-l-[0.2px] rounded-[10px] lg:w-[874px] h-auto bg-[#FFFFFF] px-10 py-10"
            style={{
              borderLeftWidth: "0.2px",
              borderTopWidth: "0.2px",
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            <h1 className="text-[20px] font-[700]">
              Goods Information
            </h1>
            <div className="">
              <label className="text-[10px]/[24px] font-[600]">
                Goods Description :
              </label>
              <textarea
                name="goods_description"
                value={formData.goods_description}
                onChange={handleInputChange}
                className="w-full h-[87px] border-[1px] border-[#0000004D] rounded-[5px] focus:outline-none focus:ring-0 placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080] focus:border-[#0000004D]"
                placeholder="Describe the items you plan to store..."
                required
              />
            </div>
          </div>

          <div
            className="border-l-[0.2px] rounded-[10px] lg:w-[874px] h-auto bg-[#FFFFFF] px-10 py-10"
            style={{
              borderLeftWidth: "0.2px",
              borderTopWidth: "0.2px",
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            <h1 className="text-[20px] font-[700]">
              Additional Information
            </h1>
            <div className="">
              <label className="text-[10px]/[24px] font-[600]">
                Special Requirements :
              </label>
              <textarea
                name="special_requirements"
                value={formData.special_requirements}
                onChange={handleInputChange}
                className="w-full h-[87px] border-[1px] border-[#0000004D] rounded-[5px] focus:outline-none focus:ring-0 placeholder:text-[12px] placeholder:font-[500] placeholder:text-[#808080] focus:border-[#0000004D]"
                placeholder="Temperature requirements, loading dock access, forklift services, etc."
              />
            </div>
          </div>

          <div
            onClick={handleWarehouseCheckout}
            className="rounded-[5px] flex justify-center items-center text-[#FFFFFF] font-[700] text-[12px] lg:w-[874px] h-[50px] bg-[#0955AC] px-5 py-5 cursor-pointer hover:bg-[#074a8f] transition-colors"
          >
            Next
          </div>
        </div>

        <div className="flex flex-col gap-10">
          {/* right side mini card 1 */}
          <div
            className="md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-5"
            style={{
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            {/* upper section */}
            <div className="flex flex-col md:flex-row gap-3 items-center border-b-[1px] pb-5 border-[#00000026]">
              {warehouseImages && warehouseImages.length > 0 ? (
                <img src={`/storage/${warehouseImages[0]}`} className="w-[120px] h-[80px] object-cover rounded" />
              ) : (
                <div className="w-[120px] h-[80px] bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-500 text-xs">No Image</span>
                </div>
              )}
              <div className="flex flex-col gap-3">
                <h1 className="figtree text-[20px] font-[700]">
                  {warehouse.name || 'Premium Warehouse Storage'}
                </h1>
                <div className="poppins flex flex-row gap-5 text-[9px] text-[#000000B2] font-[500]">
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <div className="size-[17px] bg-blue-500 rounded-full"></div>
                    <h1>{warehouseDetails.area || '5000'} sq ft</h1>
                  </div>
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <div className="size-[17px] bg-green-500 rounded-full"></div>
                    <h1>{warehouse.type || 'General'}</h1>
                  </div>
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <div className="size-[17px] bg-purple-500 rounded-full"></div>
                    <h1>24/7 Access</h1>
                  </div>
                  <div className="flex flex-col gap-2 justify-center items-center">
                    <div className="size-[17px] bg-orange-500 rounded-full"></div>
                    <h1>Climate Ctrl</h1>
                  </div>
                </div>
              </div>
            </div>
            {/* end */}
            {/* bottom section */}
            <div className="py-10 px-20">
              <div className="flex flex-row gap-5 justify-center items-start">
                <div className="flex flex-col items-center mt-2">
                  <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                  <div className="h-[77px] w-[1.5px] bg-[#0955AC]"></div>
                  <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                </div>
                <div className="figtree flex flex-col gap-10 text-[14px] font-[500] text-[#00000080]">
                  <div>
                    <h1 className="text-[16px] font-[700] text-[#000000]">
                      Location: {warehouseDetails.address || warehouse.address || 'Premium Location'}
                    </h1>
                    <h1>Move-in Date : {formData.move_in_date || 'To be selected'}</h1>
                    <h1>Move-in Time : {formData.move_in_time || 'To be selected'}</h1>
                  </div>
                  <div>
                    <h1 className="text-[16px] font-[700] text-[#000000]">
                      Storage: {formData.storage_type || 'General Storage'}
                    </h1>
                    <h1>Duration : {formData.storage_duration || 'To be selected'}</h1>
                    <h1>Space Required : {formData.required_space || 'To be specified'} sq ft</h1>
                  </div>
                </div>
              </div>
            </div>
            {/* end */}
          </div>
          {/* right side mini card 2 */}
          <div
            className="poppins md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-10 py-10"
            style={{
              boxShadow: "4px 4px 4px #0000001A",
            }}
          >
            <h1 className="font-[600] text-[20px]">
              Storage Details
            </h1>

            <div className="md:px-10 py-5">
              <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
                <h1 className="font-[600] mb-5 text-[#000000D9]">
                  Storage Requirements
                </h1>
                <div className="w-full h-[1px] bg-[#CDD0D4]" />
                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                  <div>
                    <h1 className="text-[#000000CC]">
                      Storage Type
                    </h1>
                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                      <h1>{formData.storage_type || 'General Storage'}</h1>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
                  <div>
                    <h1 className="text-[#000000CC]">
                      Required Space
                    </h1>
                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                      <h1>{formData.required_space || '0'} sq ft</h1>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                  <div>
                    <h1 className="text-[#000000CC]">
                      Duration
                    </h1>
                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061]">
                      <h1>{formData.storage_duration || 'Not selected'}</h1>
                    </div>
                  </div>
                </div>
                <div className="w-full h-[1px] bg-[#CDD0D4]" />

                <h1 className="font-[600] mt-5 text-[#000000D9]">
                  Additional Services
                </h1>

                {/* checkbox section */}
                <div className="flex flex-col justify-center text-[12px] font-[500] mt-5">
                  <div className="flex flex-col md:flex-row justify-between w-full px-5">
                    <div className="flex flex-row md:justify-center items-center gap-4">
                      <h1>Climate Control</h1>
                    </div>
                    <h1>{formData.climate_controlled ? 'Included' : 'Not selected'}</h1>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[#CDD0D4] mt-5" />

                <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
                  <div>
                    <h1 className="text-[#000000CC]">
                      Insurance
                    </h1>
                    <div className="flex flex-col md:flex-row gap-3 text-[#00000061] mt-3">
                      <h1>{formData.insurance_required ? 'Required' : 'Not required'}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
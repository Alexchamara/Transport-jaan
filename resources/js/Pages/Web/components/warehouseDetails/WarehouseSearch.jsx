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
    leaseDuration: '',
    storageType: warehouse?.type || '',
    accessHours: '24/7',
    specialRequirements: '',
    company_name: '',
    contact_person: '',
    email: '',
    phone: ''
  });

  const [pricingCalculation, setPricingCalculation] = useState({
    monthly_rate: 0,
    security_deposit: 0,
    setup_fee: 0,
    tax_rate: 0,
    subtotal: 0,
    tax_amount: 0,
    total_amount: 0,
    final_amount: 0
  });

  const [isCalculating, setIsCalculating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    // Trigger calculation when key fields change
    if (['requiredSpace', 'leaseDuration'].includes(name)) {
      calculatePricing({ ...formData, [name]: value });
    }
  };

  // Calculate pricing based on warehouse data and user inputs
  const calculatePricing = (currentFormData = formData) => {
    if (!warehouse || !currentFormData.requiredSpace || !currentFormData.leaseDuration) {
      setPricingCalculation({
        monthly_rate: 0,
        security_deposit: 0,
        setup_fee: 0,
        tax_rate: 0,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        final_amount: 0
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Get pricing from warehouse data
      const baseMonthlyRate = parseFloat(warehouse.monthly_rate || warehouse.price || warehouse.base_price || 0);
      const securityDeposit = parseFloat(warehouse.security_deposit || baseMonthlyRate * 0.5 || 0);
      const setupFee = parseFloat(warehouse.setup_fee || baseMonthlyRate * 0.2 || 0);
      const taxRate = parseFloat(warehouse.tax_rate || 0.08); // 8% default tax
      
      // Calculate based on required space and duration
      const requiredSpace = parseFloat(currentFormData.requiredSpace || 0);
      const totalArea = parseFloat(warehouse.total_area || 1);
      const durationMonths = parseDurationToMonths(currentFormData.leaseDuration);
      
      // Calculate space utilization factor (if requiring partial space)
      const spaceUtilization = Math.min(requiredSpace / totalArea, 1);
      const adjustedMonthlyRate = baseMonthlyRate * spaceUtilization;
      
      // Calculate pricing breakdown
      const monthlyRate = adjustedMonthlyRate;
      const subtotal = monthlyRate * durationMonths;
      const taxAmount = subtotal * taxRate;
      const totalBeforeFees = subtotal + taxAmount;
      const finalAmount = totalBeforeFees + securityDeposit + setupFee;

      setPricingCalculation({
        monthly_rate: monthlyRate,
        security_deposit: securityDeposit,
        setup_fee: setupFee,
        tax_rate: taxRate,
        subtotal: subtotal,
        tax_amount: taxAmount,
        total_amount: totalBeforeFees,
        final_amount: finalAmount,
        duration_months: durationMonths,
        space_utilization: spaceUtilization
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
      setPricingCalculation({
        monthly_rate: 0,
        security_deposit: 0,
        setup_fee: 0,
        tax_rate: 0,
        subtotal: 0,
        tax_amount: 0,
        total_amount: 0,
        final_amount: 0
      });
    } finally {
      setIsCalculating(false);
    }
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
      case "1": return "1 Month";
      case "3": return "3 Months";
      case "6": return "6 Months";
      case "12": return "12 Months";
      case "24": return "24 Months";
      case "36": return "36 Months";
      default: return "1 Month";
    }
  };

  // Parse duration string to get number of months
  const parseDurationToMonths = (durationStr) => {
    if (!durationStr) return 1;
    
    // Handle both select values and duration strings
    if (typeof durationStr === 'string' && !isNaN(durationStr)) {
      return parseInt(durationStr);
    }
    
    const match = durationStr.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  };

  // Format currency for display
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'LKR 0.00';
    return `LKR ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Validate form before proceeding to checkout
  const validateForm = () => {
    const errors = {};
    
    if (!formData.requiredSpace || parseFloat(formData.requiredSpace) <= 0) {
      errors.requiredSpace = 'Please enter required space';
    }
    
    if (!formData.moveinDate) {
      errors.moveinDate = 'Please select move-in date';
    }
    
    if (!formData.moveinTime) {
      errors.moveinTime = 'Please select move-in time';
    }
    
    if (!formData.leaseDuration) {
      errors.leaseDuration = 'Please select lease duration';
    }

    if (formData.requiredSpace && warehouse?.total_area && 
        parseFloat(formData.requiredSpace) > parseFloat(warehouse.total_area)) {
      errors.requiredSpace = `Cannot exceed ${warehouse.total_area} sq ft`;
    }

    // Validate move-in date is not in the past
    if (formData.moveinDate) {
      const selectedDate = new Date(formData.moveinDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.moveinDate = 'Cannot select past date';
      }
    }
    
    return errors;
  };

  const handleContinueToCheckout = () => {
    const validationErrors = validateForm();
    
    if (Object.keys(validationErrors).length > 0) {
      // Set field errors to display under each field
      setFieldErrors(validationErrors);
      
      // Focus on the first missing field
      if (validationErrors.requiredSpace) {
        document.getElementById('requiredSpace')?.focus();
      } else if (validationErrors.moveinDate) {
        document.getElementById('moveinDate')?.focus();
      } else if (validationErrors.moveinTime) {
        document.getElementById('moveinTime')?.focus();
      } else if (validationErrors.leaseDuration) {
        document.getElementById('leaseDuration')?.focus();
      }
      
      return;
    }
    
    // Clear any existing errors
    setFieldErrors({});

    try {
      const durationString = mapLeaseToDurationString(formData.leaseDuration);
      const durationMonths = parseDurationToMonths(formData.leaseDuration);
      
      // Prepare comprehensive booking data for checkout
      const bookingData = {
        // Warehouse Information
        warehouse_id: warehouse?.id,
        warehouse_name: warehouse?.name,
        warehouse_type: warehouse?.type,
        location: formData.warehouseLocation,
        
        // Space and Duration Requirements
        required_space: parseFloat(formData.requiredSpace),
        total_area: warehouse?.total_area,
        space_utilization: pricingCalculation.space_utilization,
        move_in_date: formData.moveinDate,
        move_in_time: formData.moveinTime,
        move_in_datetime: formData.moveinDate && formData.moveinTime ? 
          `${formData.moveinDate} ${formData.moveinTime}` : null,
        storage_duration: durationString,
        duration_months: durationMonths,
        
        // Storage Requirements
        storage_type: formData.storageType || warehouse?.type,
        access_hours: formData.accessHours,
        special_requirements: formData.specialRequirements,
        
        // Contact Information (if provided)
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone,
        
        // Pricing Breakdown
        pricing: {
          monthly_rate: pricingCalculation.monthly_rate,
          security_deposit: pricingCalculation.security_deposit,
          setup_fee: pricingCalculation.setup_fee,
          tax_rate: pricingCalculation.tax_rate,
          subtotal: pricingCalculation.subtotal,
          tax_amount: pricingCalculation.tax_amount,
          total_amount: pricingCalculation.total_amount,
          final_amount: pricingCalculation.final_amount
        },
        
        // Warehouse Features
        amenities: warehouse?.amenities || [],
        capacity: warehouse?.capacity,
        capacity_unit: warehouse?.capacity_unit,
        pricing_model: warehouse?.pricing_model || 'monthly',
        
        // Timestamps
        quote_generated_at: new Date().toISOString(),
        quote_valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      sessionStorage.setItem('warehouseBookingData', JSON.stringify(bookingData));
    } catch (err) {
      // Fallback: continue even if sessionStorage fails
      console.error('Failed saving booking data', err);
    }
    
    router.visit('/warehouse-bookings/checkout');
  };

  // Initialize pricing calculation on component mount and when dependencies change
  React.useEffect(() => {
    if (warehouse && formData.requiredSpace && formData.leaseDuration) {
      calculatePricing();
    }
  }, [warehouse, formData.requiredSpace, formData.leaseDuration]);

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
                <label htmlFor="moveinDate" className="block mb-3">
                  Move-in Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="moveinDate"
                  name="moveinDate"
                  value={formData.moveinDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => (e.target.type = "text")}
                />
                {fieldErrors.moveinDate && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {fieldErrors.moveinDate}
                  </p>
                )}
              </div>
              <div className="relative">
                <label htmlFor="moveinTime" className="block mb-3">
                  Move-in Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="moveinTime"
                  name="moveinTime"
                  value={formData.moveinTime}
                  onChange={handleInputChange}
                  className="w-full relative border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 py-3 leading-tight focus:outline-none focus:shadow-outline placeholder:text-[#000000D9]"
                />
                {fieldErrors.moveinTime && (
                  <p className="text-[10px] text-red-500 mt-1">
                    {fieldErrors.moveinTime}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            {/* Required Space */}
            <div>
              <label htmlFor="requiredSpace" className="block mb-3">
                Required Space (sq ft) <span className="text-red-500">*</span>
                {warehouse?.total_area && (
                  <span className="text-[#0955AC] ml-2">
                    - Available: {warehouse.total_area.toLocaleString()} sq ft
                  </span>
                )}
              </label>
              <input
                type="number"
                id="requiredSpace"
                name="requiredSpace"
                value={formData.requiredSpace}
                onChange={handleInputChange}
                min="1"
                max={warehouse?.total_area || 999999}
                placeholder={warehouse?.total_area ? `Enter up to ${warehouse.total_area.toLocaleString()} sq ft` : "Enter required space"}
                className="w-full px-4 py-3 border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 leading-tight focus:outline-none placeholder:text-[#000000D9] placeholder:text-[12px] placeholder:font-[600]"
              />
              {warehouse?.total_area && (
                <p className="text-[10px] text-gray-500 mt-1">
                  Maximum available: {warehouse.total_area.toLocaleString()} sq ft
                </p>
              )}
              {fieldErrors.requiredSpace && (
                <p className="text-[10px] text-red-500 mt-1">
                  {fieldErrors.requiredSpace}
                </p>
              )}
            </div>

            {/* Lease Duration */}
            <div>
              <label htmlFor="leaseDuration" className="block mb-3">
                Lease Duration <span className="text-red-500">*</span>
              </label>
              <select
                id="leaseDuration"
                name="leaseDuration"
                value={formData.leaseDuration}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-[1px] border-[#00000042] bg-[#F4F3F3] rounded-[5px] mb-3 leading-tight focus:outline-none text-[#000000D9]"
              >
                <option value="">Select duration</option>
                <option value="1">1 month</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
                <option value="36">36 months</option>
              </select>
              {fieldErrors.leaseDuration && (
                <p className="text-[10px] text-red-500 mt-1">
                  {fieldErrors.leaseDuration}
                </p>
              )}
            </div>

            {/* Storage Type */}
            <div>
              <label className="block mb-3">Storage Type</label>
              <div className="w-full px-4 py-3 border-[1px] border-[#00000042] bg-[#E5E5E5] rounded-[5px] mb-3 text-[#000000D9] text-[12px] font-[600]">
                {warehouse?.type || 'Not specified'}
              </div>
            </div>


          </div>
        </form>

        <div className="poppins text-[12px] w-full h-auto bg-[#0955AC0D] rounded-[5px] flex flex-col py-10 px-10">
          <div className="flex justify-between items-center mb-5">
            <h1 className="font-[600] text-[#000000D9]">Pricing Breakdown</h1>
            {isCalculating && (
              <div className="text-[#0955AC] text-[10px] font-[500]">Calculating...</div>
            )}
          </div>
          <div className="w-full h-[1px] bg-[#CDD0D4]" />
          
          {/* Monthly Rate */}
          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Monthly Rate</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>{formatCurrency(pricingCalculation.monthly_rate)}/month</h1>
                <h1 className="text-[#0955AC]">
                  ({pricingCalculation.duration_months || 1} month{(pricingCalculation.duration_months || 1) > 1 ? 's' : ''})
                </h1>
              </div>
            </div>
            <div className="text-[#000000CC]">{formatCurrency(pricingCalculation.subtotal)}</div>
          </div>

          {/* Security Deposit */}
          <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Security Deposit</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>Refundable deposit</h1>
                <h1 className="text-[#0955AC]">(One-time)</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">{formatCurrency(pricingCalculation.security_deposit)}</div>
          </div>

          {/* Setup Fee */}
          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Setup Fee</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>Initial setup and processing</h1>
                <h1 className="text-[#0955AC]">(One-time)</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">{formatCurrency(pricingCalculation.setup_fee)}</div>
          </div>

          {/* Tax */}
          <div className="flex flex-col md:flex-row justify-between w-full px-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Tax</h1>
              <div className="flex flex-row gap-3 text-[#00000061]">
                <h1>VAT and other taxes</h1>
                <h1 className="text-[#0955AC]">({((pricingCalculation.tax_rate || 0) * 100).toFixed(1)}%)</h1>
              </div>
            </div>
            <div className="text-[#000000CC]">{formatCurrency(pricingCalculation.tax_amount)}</div>
          </div>

          <div className="w-full h-[1px] bg-[#CDD0D4] my-5" />

          {/* Space Utilization Info */}
          {pricingCalculation.space_utilization && pricingCalculation.space_utilization < 1 && (
            <div className="bg-blue-50 p-3 rounded mb-5">
              <h2 className="text-[11px] font-[600] text-blue-800 mb-1">Space Utilization</h2>
              <p className="text-[10px] text-blue-600">
                You're using {(pricingCalculation.space_utilization * 100).toFixed(1)}% of the total warehouse space 
                ({formatCurrency(formData.requiredSpace)} / {warehouse?.total_area} sq ft)
              </p>
            </div>
          )}

          <div className="w-full h-[1px] bg-[#CDD0D4]" />

          <h1 className="font-[600] mt-5 text-[#000000D9]">Summary</h1>

          <div className="flex flex-col md:flex-row justify-between w-full px-5 py-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Initial Payment</h1>
              <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                <h1>First month + deposits + setup</h1>
                <h1 className="text-[#0955AC]">(Due at booking)</h1>
              </div>
            </div>
            <div className="text-[#000000CC] text-[12px] font-[600]">
              {formatCurrency(pricingCalculation.monthly_rate + pricingCalculation.security_deposit + pricingCalculation.setup_fee + (pricingCalculation.tax_amount / (pricingCalculation.duration_months || 1)))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between w-full px-5 pb-5 font-[500]">
            <div>
              <h1 className="text-[#000000CC]">Total Contract Value</h1>
              <div className="flex flex-row gap-3 text-[#00000061] mt-3">
                <h1>Complete lease term total</h1>
                <h1 className="text-[#0955AC]">
                  ({pricingCalculation.duration_months || 0} month{(pricingCalculation.duration_months || 0) !== 1 ? 's' : ''})
                </h1>
              </div>
            </div>
            <div className="text-[#000000CC] text-[16px] font-[700]">
              {formatCurrency(pricingCalculation.final_amount)}
            </div>
          </div>

          {/* Quote Validity */}
          {pricingCalculation.final_amount > 0 && (
            <div className="bg-green-50 p-3 rounded mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-[11px] font-[600] text-green-800">Quote Valid Until</h2>
                  <p className="text-[10px] text-green-600">
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-[11px] font-[600] text-green-800">Space Available</h2>
                  <p className="text-[10px] text-green-600">
                    {warehouse?.is_available ? 'Yes' : 'Limited'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="relative flex flex-col md:flex-row items-start justify-start px-5">
            <span className="absolute top-[5px] left-[20px] w-[2px] h-[2px] bg-[#0955AC] rounded-full" />
            <p className="text-[8.5px] text-[#00000061] ml-4">
              Prices shown are estimates based on your requirements. Final pricing will be confirmed during checkout process.
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
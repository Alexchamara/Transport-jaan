import React, { useEffect, useState } from "react";
import { useForm, usePage } from "@inertiajs/react";
import bg from "../../assets/freight/bg.svg";
import locationIcon from "../../assets/freight/Location.svg";
import line from "../../assets/freight/line.svg";
import goods from "../../assets/freight/goods.svg";
import load from "../../assets/freight/load.svg";

const HeroSection = () => {
  const { flash } = usePage().props;

  // local visibility so we can auto-hide and allow manual close
  const [visibleFlash, setVisibleFlash] = useState({
    type: null, // "success" | "error" | null
    message: null,
  });

  useEffect(() => {
    if (flash?.success) {
      setVisibleFlash({ type: "success", message: flash.success });
    } else if (flash?.error) {
      setVisibleFlash({ type: "error", message: flash.error });
    } else {
      setVisibleFlash({ type: null, message: null });
    }
  }, [flash]);

  useEffect(() => {
    if (!visibleFlash.message) return;
    const t = setTimeout(() => {
      setVisibleFlash({ type: null, message: null });
    }, 5000);
    return () => clearTimeout(t);
  }, [visibleFlash.message]);

  const { data, setData, post, processing, errors, reset } = useForm({
    origin: "",
    destination: "",
    load_type: "",
    goods_description: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    total_weight_kg: "",
    preferred_method: "",
    shipping_date: "",
    notes: "",
  });

  const [selectedTab, setSelectedTab] = useState("quote");

  const inputBase =
    "w-full h-[56px] border border-[#0000001A] rounded-[8px] px-3 text-[16px] text-[#286BB6] placeholder:text-[#286BB6] focus:outline-none focus:ring-2 focus:ring-[#0955AC]";
  const labelBase = "text-[#286BB6]";

  const submitForm = (e) => {
    e.preventDefault();
    post(route("freight-quotes.store"), {
      onSuccess: () => {
        // Server sends flash.success; UI shows it via middleware share.
        reset();
        // Optionally keep the Quote tab selected and scroll to banner
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      onError: () => {
        // Server sends validation errors; banner will show flash.error if you sent it.
        window.scrollTo({ top: 0, behavior: "smooth" });
      },
      preserveScroll: true,
    });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "auto",
        position: "relative",
        paddingBottom: "50px",
      }}
    >
      {/* overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "#0955AC38",
          clipPath: "polygon(0 0, 40% 0, 70% 100%, 0 100%)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      <div style={{ position: "relative", zIndex: 2 }}>
        {/* headline */}
        <div className="flex flex-col items-center">
          <div className="container mx-auto px-10 pt-20">
            <div className="w-[125px] h-[5px] bg-[#FFFFFF] mb-6 rounded-sm"></div>
            <h1 className="bebas-neue text-[78px]/[70px] font-[400] mb-4 text-[#FFFFFF]">
              Speed Up Logistics with <br /> Smarter Freight Planning.
            </h1>
            <p className="poppins py-5 text-[12px]/[20px] md:text-[14px]/[33px] font-[400] text-[#FFFFFF] text-justify mb-10 md:mb-20">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit...
            </p>
          </div>
        </div>

        {/* tabs + form */}
        <div className="flex flex-col justify-center items-center">
          <div>
            <div className="flex flex-row justify-center items-center gap-5 w-auto xl:w-[600px] h-[80px] bg-[#FFFFFF] rounded-tl-[15px] rounded-tr-[15px] px-5 text-[16px] font-[700]">
              <div
                className={`flex justify-center items-center h-[60px] xl:w-[263px] rounded-[10px] p-5 cursor-pointer transition-all duration-200 ${
                  selectedTab === "quote"
                    ? "bg-[#0955AC] text-white"
                    : "text-[#0955AC] bg-transparent"
                }`}
                onClick={() => setSelectedTab("quote")}
              >
                <h1
                  className={
                    selectedTab === "quote" ? "border-b-2 border-white" : ""
                  }
                >
                  Request a Freight Quote
                </h1>
              </div>

              <div
                className={`flex justify-center items-center h-[60px] xl:w-[263px] rounded-[10px] p-5 cursor-pointer transition-all duration-200 ${
                  selectedTab === "track"
                    ? "bg-[#0955AC] text-white"
                    : "text-[#0955AC] bg-transparent"
                }`}
                onClick={() => setSelectedTab("track")}
              >
                <h1
                  className={
                    selectedTab === "track" ? "border-b-2 border-white" : ""
                  }
                >
                  Track Shipment
                </h1>
              </div>
            </div>

            {/* Flash banner */}
            {visibleFlash.message && (
              <div
                className={`p-3 mb-4 rounded flex items-start justify-between gap-4 ${
                  visibleFlash.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : "bg-red-100 text-red-700 border border-red-300"
                }`}
              >
                <span>{visibleFlash.message}</span>
                <button
                  type="button"
                  onClick={() => setVisibleFlash({ type: null, message: null })}
                  className="shrink-0 px-2"
                  aria-label="Dismiss"
                  title="Dismiss"
                >
                  ×
                </button>
              </div>
            )}

            {/* QUOTE TAB */}
            {selectedTab === "quote" && (
              <form
                onSubmit={submitForm}
                className="w-auto h-auto bg-[#FFFFFF] rounded-b-[15px] xl:rounded-tr-[15px] text-[16px] text-[#286BB6] font-[400] px-10 py-10 flex flex-col gap-6"
              >
                {/* row 1 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelBase}>Origin</label>
                    <div className="flex items-center gap-2">
                      <img src={locationIcon} alt="" />
                      <input
                        className={inputBase}
                        placeholder="City/Port, Country"
                        value={data.origin}
                        onChange={(e) => setData("origin", e.target.value)}
                      />
                    </div>
                    {errors.origin && (
                      <p className="text-red-600 text-sm">{errors.origin}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelBase}>Destination</label>
                    <div className="flex items-center gap-2">
                      <img src={locationIcon} alt="" />
                      <input
                        className={inputBase}
                        placeholder="City/Port, Country"
                        value={data.destination}
                        onChange={(e) => setData("destination", e.target.value)}
                      />
                    </div>
                    {errors.destination && (
                      <p className="text-red-600 text-sm">
                        {errors.destination}
                      </p>
                    )}
                  </div>
                </div>

                {/* row 2 */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className={labelBase}>Load Type</label>
                    <div className="flex items-center gap-2">
                      <img src={load} alt="" />
                      <select
                        className={inputBase}
                        value={data.load_type}
                        onChange={(e) => setData("load_type", e.target.value)}
                      >
                        <option value="">Select load type…</option>
                        <option value="20ft_container">20ft container</option>
                        <option value="40ft_container">40ft container</option>
                        <option value="lcl">LCL (Less than Container Load)</option>
                        <option value="pallets">Pallets</option>
                        <option value="boxes">Boxes</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    {errors.load_type && (
                      <p className="text-red-600 text-sm">{errors.load_type}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className={labelBase}>Preferred Shipping Method</label>
                    <select
                      className={inputBase}
                      value={data.preferred_method}
                      onChange={(e) =>
                        setData("preferred_method", e.target.value)
                      }
                    >
                      <option value="">Select method…</option>
                      <option value="Air">Air</option>
                      <option value="Sea">Sea</option>
                      <option value="Road">Road</option>
                    </select>
                    {errors.preferred_method && (
                      <p className="text-red-600 text-sm">
                        {errors.preferred_method}
                      </p>
                    )}
                  </div>
                </div>

                {/* goods description */}
                <div className="flex flex-col gap-2">
                  <label className={labelBase}>Goods Description</label>
                  <div className="flex items-start gap-2">
                    <img src={goods} alt="" className="mt-3" />
                    <textarea
                      className={`${inputBase} h-[120px]`}
                      placeholder="e.g., 500 cartons of tea, 10,000 kg total weight"
                      value={data.goods_description}
                      onChange={(e) =>
                        setData("goods_description", e.target.value)
                      }
                    />
                  </div>
                  {errors.goods_description && (
                    <p className="text-red-600 text-sm">
                      {errors.goods_description}
                    </p>
                  )}
                </div>

                {/* dimensions & weight */}
                <div className="flex flex-col gap-2">
                  <label className={labelBase}>Dimensions & Weight</label>
                  <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputBase}
                      placeholder="Length (cm)"
                      value={data.length_cm}
                      onChange={(e) => setData("length_cm", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputBase}
                      placeholder="Width (cm)"
                      value={data.width_cm}
                      onChange={(e) => setData("width_cm", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputBase}
                      placeholder="Height (cm)"
                      value={data.height_cm}
                      onChange={(e) => setData("height_cm", e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="col-span-2 xl:col-span-2 w-full h-[56px] border border-[#0000001A] rounded-[8px] px-3 text-[16px] text-[#286BB6] placeholder:text-[#286BB6] focus:outline-none focus:ring-2 focus:ring-[#0955AC]"
                      placeholder="Total Weight (kg)"
                      value={data.total_weight_kg}
                      onChange={(e) => setData("total_weight_kg", e.target.value)}
                    />
                  </div>
                  {(errors.length_cm ||
                    errors.width_cm ||
                    errors.height_cm ||
                    errors.total_weight_kg) && (
                    <p className="text-red-600 text-sm">
                      {errors.length_cm ||
                        errors.width_cm ||
                        errors.height_cm ||
                        errors.total_weight_kg}
                    </p>
                  )}
                </div>

                {/* date */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-center">
                  <div className="flex flex-col gap-2">
                    <label className={labelBase}>Shipping Date</label>
                    <input
                      type="date"
                      className={inputBase}
                      value={data.shipping_date}
                      onChange={(e) => setData("shipping_date", e.target.value)}
                    />
                    {errors.shipping_date && (
                      <p className="text-red-600 text-sm">{errors.shipping_date}</p>
                    )}
                  </div>
                </div>

                {/* notes */}
                <div className="flex flex-col gap-2">
                  <label className={labelBase}>Additional Notes (optional)</label>
                  <textarea
                    className={`${inputBase} h-[100px]`}
                    placeholder="Anything else we should know?"
                    value={data.notes}
                    onChange={(e) => setData("notes", e.target.value)}
                  />
                </div>

                {/* submit */}
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={processing}
                    className="size-[85px] bg-[#0955AC] rounded-[8px] flex justify-center items-center disabled:opacity-70"
                    title="Submit"
                  >
                    <img src={line} alt="submit" />
                  </button>
                </div>
              </form>
            )}

            {/* TRACK TAB (placeholder) */}
            {selectedTab === "track" && (
              <div className="w-auto xl:h-[175px] bg-[#FFFFFF] rounded-b-[15px] text-[16px] text-[#286BB6] font-[400] px-10 py-10 flex flex-col md:flex-row gap-5 md:gap-0 justify-evenly items-center">
                <div className="flex flex-col gap-2">
                  <label>Tracking Number</label>
                  <div className="xl:w-[268px] xl:h-[56px] border-[1px] border-[#0000001A] rounded-[8px] flex flex-row justify-center items-center p-2">
                    <input
                      className="w-full text-[16px] focus:outline-none focus:ring-0 border-none placeholder:text-[#286BB6] placeholder:text-[16px]"
                      placeholder="Enter your tracking number"
                    />
                  </div>
                </div>
                <div className="size-[85px] bg-[#0955AC] rounded-[8px] flex justify-center items-center">
                  <img src={line} alt="" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;

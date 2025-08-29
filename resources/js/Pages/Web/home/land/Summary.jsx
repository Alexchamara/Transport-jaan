import React from "react";
import { usePage, router } from "@inertiajs/react";
import Header from "../../layouts/Header";
import car from "../../assets/vehicleCheckout/car.svg";
import icon1 from "../../assets/vehicleCheckout/icon1.svg";
import icon2 from "../../assets/vehicleCheckout/icon2.svg";
import icon3 from "../../assets/vehicleCheckout/icon3.svg";
import icon4 from "../../assets/vehicleCheckout/icon4.svg";
import tick from "../../assets/vehicleCheckout/tick.svg";
import { route } from "ziggy-js"; // keep for POST route

const Summary = () => {
  const { props } = usePage();
  const booking = props.booking;
  const schedule = booking?.schedule;
  const vehicle = booking?.vehicle;

  // ---- helpers ----
  const C = booking?.currency || "USD";
  const n = (v) => Number(v || 0);
  const money = (v) => `${C} ${n(v).toFixed(2)}`;

  // derived amounts
  const baseTotal = n(booking?.price_per_day) * n(booking?.rental_days);
  const addonsTotal = n(booking?.addons_total);
  const subtotal = n(booking?.subtotal); // base + addons
  const total = n(booking?.total_amount); // grand total

  // advance cap from DB, capped to total
  const advanceCap = Math.min(n(booking?.advance_amount), total);

  // Due amount = To pay (Full) - To pay (Advance)
  const dueAmount = Math.max(total - advanceCap, 0);

  const handleBackBooking = () => {
    router.visit(route("bookings.checkout"), {
      method: "get",
      preserveScroll: true,
      data: { vehicle_id: vehicle?.id },
    });
  };

  const handlePaymentBooking = () => {
    router.visit(route("bookings.payments", booking.id), {
      method: "get",
      preserveScroll: true,
    });
  };

  const handleVehicleList = () => {
    router.visit("/vehicleList", { method: "get", preserveScroll: true });
  };

  // DONE → go to /clientRent
  const handleDone = () => {
    router.visit("/clientRent", { method: "get", preserveScroll: true });
  };

  const onlyDate = (dt) => (dt ? new Date(dt).toLocaleDateString() : "—");
  const onlyTime = (dt) =>
    dt ? new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div>
      <Header />

      <div>
        <div className="flex flex-col xl:flex-row justify-center items-center xl:items-start px-10 py-10 gap-10">
          <div className="flex flex-col gap-10">
            {/* breadcrumb */}
            <div className="flex flex-row items-start justify-center pb-10">
              <div
                className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                onClick={handleVehicleList}
              >
                <div className="w-[18px] h-[18px] rounded-full bg-[#1565c0]" style={{ boxShadow: "0 0 10px 8px #1565c088" }} />
                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">Select Car</h1>
              </div>
              <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
              <div
                className="md:flex flex-col hidden justify-center items-center gap-3 cursor-pointer"
                onClick={handleBackBooking}
              >
                <div className="w-[18px] h-[18px] rounded-full bg-[#1565c0]" style={{ boxShadow: "0 0 10px 8px #1565c088" }} />
                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">Booking Info</h1>
              </div>
              <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
              <div
                className="md:flex hidden flex-col justify-center items-center gap-3 cursor-pointer"
                onClick={handlePaymentBooking}
              >
                <div className="w-[18px] h-[18px] rounded-full bg-[#1565c0]" style={{ boxShadow: "0 0 10px 8px #1565c088" }} />
                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">Payments</h1>
              </div>
              <div className="lg:w-[136px] w-[50px] md:block hidden h-[2px] bg-[#0955AC] mt-3" />
              <div className="flex flex-col justify-center items-center gap-3">
                <div className="w-[18px] h-[18px] rounded-full bg-[#1565c0]" style={{ boxShadow: "0 0 10px 8px #1565c088" }} />
                <h1 className="figtree text-[16px] font-[700] text-[#0955AC]">Booking Confirmation</h1>
              </div>
            </div>

            {/* success banner */}
            <div
              className="figtree h-auto bg-[#E2F6DC] rounded-[10px] px-10 py-10 w-full"
              style={{ boxShadow: "4px 4px 4px #0000001A" }}
            >
              <div className="flex md:flex-row flex-col justify-center gap-5 md:items-center">
                <div className="size-[70px] border-[1.5px] border-[#13790A] rounded-[5px] flex justify-center items-center p-5">
                  <img src={tick} className="w-[40px] h-[35px]" />
                </div>
                <div>
                  <h1 className="text-[20px]/[24px] font-[700] text-[#13790A]">
                    YOUR BOOKING CONFIRMED !
                  </h1>
                  <h1 className="text-[14px]/[33px] xl:w-[713px] font-[400] text-[#00000080]">
                    It is important to us that you enjoy your experience…
                  </h1>

                  <p className="text-[13px] mt-1 text-[#13790A] font-[600]">
                    After vendor approval, a confirmation email will be sent to you.
                  </p>
                </div>
              </div>
            </div>

            {/* travel summary */}
            <div>
              <h1 className="text-[20px]/[24px] font-[700] poppins">Travel Summary</h1>
              <h1 className="text-[14px]/[24px] font-[600px] mb-10 poppins">
                <span className="text-[10px]">#{booking?.id}</span> {vehicle?.manufacturer} {vehicle?.model}
              </h1>

              <div className="h-auto bg-[#FFFFFF] border-t-[0.2px] border-l-[0.2px] border-[#00000080] rounded-[10px] px-10 py-20 w-full" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
                <div className="flex md:flex-row flex-col justify-between items-center text-[14px] font-[500]">
                  <div>
                    <h1 className="text-[#00000080]">Pick-up From: </h1>
                    <h1 className="font-[700] text-[16px]">{schedule?.pickup_location || "—"}</h1>
                    <div className="flex flex-row items-center gap-5 text-[#00000080]">
                      <h1>{onlyDate(schedule?.pickup_at)}</h1>
                      <div className="w-[1px] h-[32px] bg-[#808080]"></div>
                      <h1>{onlyTime(schedule?.pickup_at)}</h1>
                    </div>
                  </div>

                  <div className="relative flex flex-row justify-center items-end h-auto">
                    <div className="absolute left-0 bottom-[-4px] w-[10px] h-[10px] bg-[#0955AC] rounded-full"></div>
                    <div className="flex flex-col justify-center items-center">
                      <h1 className="text-[16px] font-[700] text-[#0955AC]">
                        {booking?.rental_days} {booking?.rental_days === 1 ? "day" : "days"}
                      </h1>
                      <div className="md:w-[287px] w-[187px] h-[2px] border-b-2 border-dotted border-[#0955AC]"></div>
                    </div>
                    <div className="absolute right-0 bottom-[-4px] w-[10px] h-[10px] bg-[#0955AC] rounded-full"></div>
                  </div>

                  <div>
                    <h1 className="text-[#00000080]">Drop-off At: </h1>
                    <h1 className="font-[700] text-[16px]">{schedule?.dropoff_location || "—"}</h1>
                    <div className="flex flex-row items-center gap-5 text-[#00000080]">
                      <h1>{onlyDate(schedule?.dropoff_at)}</h1>
                      <div className="w-[1px] h-[32px] bg-[#808080]"></div>
                      <h1>{onlyTime(schedule?.dropoff_at)}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* actions (second button is non-functional and looks like DONE) */}
            <div className="flex xl:flex-row flex-col items-center gap-5 justify-between poppins">
              <div
                onClick={handleDone}
                className="md:w-[425px] w-auto h-[50px] bg-[#0955AC] text-[#FFFFFF] text-[12px] font-[700] flex justify-center items-center rounded-[5px] cursor-pointer p-5"
                role="button"
              >
                DONE
              </div>

              {/* Non-functional button, same style as DONE */}
              <div
                className="md:w-[425px] w-auto h-[50px] bg-[#0955AC] text-[#FFFFFF] text-[12px] font-[700] flex justify-center items-center rounded-[5px] cursor-pointer p-5"
                role="button"
              >
                DOWNLOAD SUMMARY
              </div>
            </div>

            <div className="flex justify-end text-[#0955AC] text-[16px] font-[500] cursor-pointer">
              <h1>Need a Driver ?</h1>
            </div>
          </div>

          {/* right column */}
          <div className="flex flex-col gap-10">
            <div className="md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-5" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <div className="flex flex-col md:flex-row gap-3 items-center border-b-[1px] pb-5 border-[#00000026]">
                <img src={car} />
                <div className="flex flex-col gap-3">
                  <h1 className="figtree text-[20px] font-[700] ">{vehicle?.manufacturer} {vehicle?.model}</h1>
                  <div className="poppins flex flex-row gap-5 text-[9px] text-[#000000B2] font-[500]">
                    <div className="flex flex-col gap-2 justify-center items-center"><img src={icon1} className="size-[17px]" /><h1>{vehicle?.mileage_km || "—"}</h1></div>
                    <div className="flex flex-col gap-2 justify-center items-center"><img src={icon2} className="size-[17px]" /><h1>{vehicle?.landSpec?.transmission_type || "—"}</h1></div>
                    <div className="flex flex-col gap-2 justify-center items-center"><img src={icon3} className="size-[17px]" /><h1>{vehicle?.passenger_capacity ? `${vehicle.passenger_capacity} Person` : "—"}</h1></div>
                    <div className="flex flex-col gap-2 justify-center items-center"><img src={icon4} className="size-[17px]" /><h1>{vehicle?.landSpec?.fuel_type || "—"}</h1></div>
                  </div>
                </div>
              </div>

              <div className="py-10 px-20">
                <div className="flex flex-row gap-5 justify-center items-start">
                  <div className="md:flex hidden flex-col items-center mt-2">
                    <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                    <div className="h-[77px] w-[1.5px] bg-[#0955AC]"></div>
                    <div className="size-[17px] bg-[#0955AC] rounded-full"></div>
                  </div>
                  <div className="figtree flex flex-col gap-10 text-[14px] font-[500] text-[#00000080]">
                    <div>
                      <h1 className="text-[16px] font-[700] text-[#000000]">Pick up: {schedule?.pickup_location || "—"}</h1>
                      <h1>Pick-up Date : {onlyDate(schedule?.pickup_at)}</h1>
                      <h1>Pick-up Time : {onlyTime(schedule?.pickup_at)}</h1>
                    </div>
                    <div>
                      <h1 className="text-[16px] font-[700] text-[#000000]">Drop off: {schedule?.dropoff_location || "—"}</h1>
                      <h1>Drop-off Date : {onlyDate(schedule?.dropoff_at)}</h1>
                      <h1>Drop-off Time : {onlyTime(schedule?.dropoff_at)}</h1>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details (unchanged) */}
            <div className="poppins md:w-[459px] h-auto bg-[#F4F3F3] rounded-[10px] px-10 py-10" style={{ boxShadow: "4px 4px 4px #0000001A" }}>
              <h2 className="text-[16px] font-[700] mb-4">Payment Details</h2>

              <div className="text-[12px] space-y-2">
                <div className="flex justify-between">
                  <span>Price per day × {booking?.rental_days}</span>
                  <span>{money(baseTotal)}</span>
                </div>

                {Array.isArray(booking?.addons) && booking.addons.length > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between font-[600]">
                      <span>Add-ons total</span>
                      <span>{money(addonsTotal)}</span>
                    </div>
                    <div className="mt-2 pl-2 space-y-1 text-[#000000B2]">
                      {booking.addons.map((a) => (
                        <div key={a.id} className="flex justify-between">
                          <span>{a.name} × {a.qty}</span>
                          <span>{money(a.line_total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full h-[1px] bg-[#CDD0D4] my-3" />

                <div className="flex justify-between font-[600]">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                {n(booking?.deposit_amount) > 0 && (
                  <div className="flex justify-between">
                    <span>Refundable deposit</span>
                    <span>{money(booking?.deposit_amount)}</span>
                  </div>
                )}

                <div className="w-full h-[1px] bg-[#CDD0D4] my-3" />

                <div className="flex justify-between text-[13px]">
                  <span>To pay (Full)</span>
                  <span className="font-[700]">{money(total)}</span>
                </div>
                <div className="flex justify-between text-[12px] text-[#000000B2]">
                  <span>To pay (Advance)</span>
                  <span className="font-[600]">{money(advanceCap)}</span>
                </div>

                <div className="w-full h-[1px] bg-[#CDD0D4] my-3" />
                <div className="flex justify-between text-[13px]">
                  <span>Due amount (Full − Advance)</span>
                  <span className="font-[700]">{money(dueAmount)}</span>
                </div>
              </div>
            </div>
            {/* /Payment Details */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Summary;

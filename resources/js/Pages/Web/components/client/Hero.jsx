// import React, { useMemo, useState } from "react";
// import { motion } from "framer-motion";
// import {
//     Car,
//     Plane,
//     Ship,
//     Calendar,
//     MapPin,
//     Search,
//     Filter,
//     Plus,
//     Download,
//     ChevronRight,
//     Star,
//     CreditCard,
//     Clock,
// } from "lucide-react";
// import {
//     Card,
//     CardHeader,
//     CardTitle,
//     CardDescription,
//     CardContent,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from "@/components/ui/select";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu";
// import {
//     Tooltip,
//     TooltipContent,
//     TooltipProvider,
//     TooltipTrigger,
// } from "@/components/ui/tooltip";
// import {
//     AreaChart,
//     Area,
//     XAxis,
//     YAxis,
//     CartesianGrid,
//     Tooltip as RTooltip,
//     ResponsiveContainer,
//     PieChart,
//     Pie,
//     Cell,
// } from "recharts";

// // ---------- Mock Data ----------
// const monthly = [
//     { month: "Jan", land: 22, air: 8, sea: 12 },
//     { month: "Feb", land: 25, air: 7, sea: 14 },
//     { month: "Mar", land: 28, air: 10, sea: 16 },
//     { month: "Apr", land: 30, air: 12, sea: 18 },
//     { month: "May", land: 33, air: 11, sea: 20 },
//     { month: "Jun", land: 31, air: 13, sea: 21 },
//     { month: "Jul", land: 35, air: 15, sea: 22 },
//     { month: "Aug", land: 36, air: 16, sea: 23 },
//     { month: "Sep", land: 34, air: 14, sea: 21 },
//     { month: "Oct", land: 32, air: 13, sea: 19 },
//     { month: "Nov", land: 29, air: 12, sea: 18 },
//     { month: "Dec", land: 27, air: 9, sea: 16 },
// ];

// const fleets = {
//     land: [
//         {
//             id: "L-001",
//             name: "SUV – Ranger X",
//             rating: 4.7,
//             location: "Colombo",
//             price: 68,
//             unit: "day",
//         },
//         {
//             id: "L-002",
//             name: "Sedan – Swift S",
//             rating: 4.5,
//             location: "Kandy",
//             price: 45,
//             unit: "day",
//         },
//         {
//             id: "L-003",
//             name: "Van – Comfort Pro",
//             rating: 4.8,
//             location: "Galle",
//             price: 80,
//             unit: "day",
//         },
//     ],
//     air: [
//         {
//             id: "A-101",
//             name: "Cessna 172",
//             rating: 4.9,
//             location: "Ratmalana",
//             price: 350,
//             unit: "hr",
//         },
//         {
//             id: "A-102",
//             name: "Helicopter – H125",
//             rating: 4.6,
//             location: "Katunayake",
//             price: 1200,
//             unit: "hr",
//         },
//     ],
//     sea: [
//         {
//             id: "S-501",
//             name: "Speedboat – Wave 24",
//             rating: 4.4,
//             location: "Trincomalee",
//             price: 180,
//             unit: "hr",
//         },
//         {
//             id: "S-502",
//             name: "Yacht – Oceanis 38",
//             rating: 4.9,
//             location: "Bentota",
//             price: 950,
//             unit: "day",
//         },
//     ],
// };

// const reservations = [
//     {
//         code: "BK-202508-001",
//         mode: "land",
//         item: "SUV – Ranger X",
//         from: "2025-09-01 09:00",
//         to: "2025-09-05 18:00",
//         pickup: "Colombo",
//         status: "confirmed",
//         amount: 272,
//     },
//     {
//         code: "BK-202508-002",
//         mode: "air",
//         item: "Cessna 172",
//         from: "2025-09-10 07:00",
//         to: "2025-09-10 11:00",
//         pickup: "Ratmalana",
//         status: "pending",
//         amount: 1400,
//     },
//     {
//         code: "BK-202508-003",
//         mode: "sea",
//         item: "Yacht – Oceanis 38",
//         from: "2025-10-02 12:00",
//         to: "2025-10-04 12:00",
//         pickup: "Bentota",
//         status: "paid",
//         amount: 1900,
//     },
//     {
//         code: "BK-202508-004",
//         mode: "land",
//         item: "Van – Comfort Pro",
//         from: "2025-08-28 08:00",
//         to: "2025-08-29 20:00",
//         pickup: "Galle",
//         status: "cancelled",
//         amount: 80,
//     },
// ];

// // ---------- Helpers ----------
// const ModeIcon = ({ mode, className }) => {
//     if (mode === "air") return <Plane className={className} />;
//     if (mode === "sea") return <Ship className={className} />;
//     return <Car className={className} />;
// };

// const statusMap = {
//     confirmed: {
//         label: "Confirmed",
//         tone: "bg-emerald-50 text-emerald-700 border-emerald-200",
//     },
//     paid: { label: "Paid", tone: "bg-blue-50 text-blue-700 border-blue-200" },
//     pending: {
//         label: "Pending",
//         tone: "bg-amber-50 text-amber-700 border-amber-200",
//     },
//     cancelled: {
//         label: "Cancelled",
//         tone: "bg-rose-50 text-rose-700 border-rose-200",
//     },
// };

// const pieData = [
//     { name: "Land", value: monthly.reduce((a, b) => a + b.land, 0) },
//     { name: "Air", value: monthly.reduce((a, b) => a + b.air, 0) },
//     { name: "Sea", value: monthly.reduce((a, b) => a + b.sea, 0) },
// ];

// const Hero = () => {
//     const [mode, setMode] = useState("all");
//     const [q, setQ] = useState("");
//     const [location, setLocation] = useState("all");
//     const [sort, setSort] = useState("popular");

//     const filteredFleets = useMemo(() => {
//         const pool =
//             mode === "all"
//                 ? [...fleets.land, ...fleets.air, ...fleets.sea]
//                 : fleets[mode] ?? [];
//         return pool
//             .filter((f) => {
//                 const text = `${f.name} ${f.location}`.toLowerCase();
//                 const okQ = q ? text.includes(q.toLowerCase()) : true;
//                 const okLoc =
//                     location === "all" ? true : f.location === location;
//                 return okQ && okLoc;
//             })
//             .sort((a, b) => {
//                 if (sort === "price") return a.price - b.price;
//                 if (sort === "rating") return b.rating - a.rating;
//                 return b.rating - a.rating; // popular ~ rating
//             });
//     }, [mode, q, location, sort]);

//     const locations = useMemo(() => {
//         const set = new Set([
//             "Colombo",
//             "Kandy",
//             "Galle",
//             "Ratmalana",
//             "Katunayake",
//             "Trincomalee",
//             "Bentota",
//         ]);
//         return ["all", ...Array.from(set)];
//     }, []);

//     const upcoming = reservations.filter((r) =>
//         ["confirmed", "paid", "pending"].includes(r.status)
//     );

//     return (
//         <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-white p-6 md:p-10">
//             <div className="mx-auto max-w-7xl">
//                 {/* Header */}
//                 <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between">
//                     <div>
//                         <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
//                             Your Rentals Dashboard
//                         </h1>
//                         <p className="text-slate-600">
//                             Plan, book, and manage rentals across Land, Air, and
//                             Sea.
//                         </p>
//                     </div>
//                     <div className="flex gap-2">
//                         <Button variant="outline" className="rounded-2xl">
//                             <Download className="mr-2 h-4 w-4" /> Export
//                         </Button>
//                         <Button className="rounded-2xl">
//                             <Plus className="mr-2 h-4 w-4" /> New Booking
//                         </Button>
//                     </div>
//                 </div>

//                 {/* KPI Cards */}
//                 <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
//                     <Card className="rounded-2xl shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardDescription className="flex items-center gap-2 text-slate-500">
//                                 <Car className="h-4 w-4" /> Active Land Rentals
//                             </CardDescription>
//                             <CardTitle className="text-3xl">12</CardTitle>
//                         </CardHeader>
//                         <CardContent className="text-sm text-slate-500">
//                             +3 this week
//                         </CardContent>
//                     </Card>

//                     <Card className="rounded-2xl shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardDescription className="flex items-center gap-2 text-slate-500">
//                                 <Plane className="h-4 w-4" /> Scheduled Flight
//                                 Hours
//                             </CardDescription>
//                             <CardTitle className="text-3xl">47h</CardTitle>
//                         </CardHeader>
//                         <CardContent className="text-sm text-slate-500">
//                             2 upcoming missions
//                         </CardContent>
//                     </Card>

//                     <Card className="rounded-2xl shadow-sm">
//                         <CardHeader className="pb-2">
//                             <CardDescription className="flex items-center gap-2 text-slate-500">
//                                 <Ship className="h-4 w-4" /> Sea Trips This
//                                 Month
//                             </CardDescription>
//                             <CardTitle className="text-3xl">9</CardTitle>
//                         </CardHeader>
//                         <CardContent className="text-sm text-slate-500">
//                             +2 vs last month
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Top Row: Filters + Charts */}
//                 <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
//                     <Card className="lg:col-span-2 rounded-2xl shadow-sm">
//                         <CardHeader className="pb-0">
//                             <div className="flex items-center justify-between">
//                                 <div>
//                                     <CardTitle>Bookings by Month</CardTitle>
//                                     <CardDescription>
//                                         Land • Air • Sea (year to date)
//                                     </CardDescription>
//                                 </div>
//                                 <DropdownMenu>
//                                     <DropdownMenuTrigger asChild>
//                                         <Button
//                                             variant="outline"
//                                             className="rounded-xl"
//                                         >
//                                             <Filter className="mr-2 h-4 w-4" />
//                                             View
//                                         </Button>
//                                     </DropdownMenuTrigger>
//                                     <DropdownMenuContent align="end">
//                                         <DropdownMenuItem>
//                                             Year to Date
//                                         </DropdownMenuItem>
//                                         <DropdownMenuItem>
//                                             Last 90 Days
//                                         </DropdownMenuItem>
//                                         <DropdownMenuItem>
//                                             Custom Range…
//                                         </DropdownMenuItem>
//                                     </DropdownMenuContent>
//                                 </DropdownMenu>
//                             </div>
//                         </CardHeader>
//                         <CardContent className="pt-6">
//                             <div className="h-64 w-full">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <AreaChart
//                                         data={monthly}
//                                         margin={{ left: 8, right: 8, top: 10 }}
//                                     >
//                                         <defs>
//                                             <linearGradient
//                                                 id="gLand"
//                                                 x1="0"
//                                                 y1="0"
//                                                 x2="0"
//                                                 y2="1"
//                                             >
//                                                 <stop
//                                                     offset="5%"
//                                                     stopColor="#3b82f6"
//                                                     stopOpacity={0.35}
//                                                 />
//                                                 <stop
//                                                     offset="95%"
//                                                     stopColor="#3b82f6"
//                                                     stopOpacity={0.02}
//                                                 />
//                                             </linearGradient>
//                                             <linearGradient
//                                                 id="gAir"
//                                                 x1="0"
//                                                 y1="0"
//                                                 x2="0"
//                                                 y2="1"
//                                             >
//                                                 <stop
//                                                     offset="5%"
//                                                     stopColor="#10b981"
//                                                     stopOpacity={0.35}
//                                                 />
//                                                 <stop
//                                                     offset="95%"
//                                                     stopColor="#10b981"
//                                                     stopOpacity={0.02}
//                                                 />
//                                             </linearGradient>
//                                             <linearGradient
//                                                 id="gSea"
//                                                 x1="0"
//                                                 y1="0"
//                                                 x2="0"
//                                                 y2="1"
//                                             >
//                                                 <stop
//                                                     offset="5%"
//                                                     stopColor="#6366f1"
//                                                     stopOpacity={0.35}
//                                                 />
//                                                 <stop
//                                                     offset="95%"
//                                                     stopColor="#6366f1"
//                                                     stopOpacity={0.02}
//                                                 />
//                                             </linearGradient>
//                                         </defs>
//                                         <CartesianGrid
//                                             strokeDasharray="3 3"
//                                             vertical={false}
//                                         />
//                                         <XAxis
//                                             dataKey="month"
//                                             tickLine={false}
//                                             axisLine={false}
//                                         />
//                                         <YAxis
//                                             tickLine={false}
//                                             axisLine={false}
//                                         />
//                                         <RTooltip />
//                                         <Area
//                                             type="monotone"
//                                             dataKey="land"
//                                             name="Land"
//                                             stroke="#3b82f6"
//                                             fill="url(#gLand)"
//                                             strokeWidth={2}
//                                         />
//                                         <Area
//                                             type="monotone"
//                                             dataKey="air"
//                                             name="Air"
//                                             stroke="#10b981"
//                                             fill="url(#gAir)"
//                                             strokeWidth={2}
//                                         />
//                                         <Area
//                                             type="monotone"
//                                             dataKey="sea"
//                                             name="Sea"
//                                             stroke="#6366f1"
//                                             fill="url(#gSea)"
//                                             strokeWidth={2}
//                                         />
//                                     </AreaChart>
//                                 </ResponsiveContainer>
//                             </div>
//                         </CardContent>
//                     </Card>

//                     <Card className="rounded-2xl shadow-sm">
//                         <CardHeader>
//                             <CardTitle>Mode Mix</CardTitle>
//                             <CardDescription>
//                                 Share of total bookings
//                             </CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                             <div className="h-64 w-full">
//                                 <ResponsiveContainer width="100%" height="100%">
//                                     <PieChart>
//                                         <Pie
//                                             data={pieData}
//                                             innerRadius={55}
//                                             outerRadius={80}
//                                             paddingAngle={3}
//                                             dataKey="value"
//                                             nameKey="name"
//                                         >
//                                             {pieData.map((_, i) => (
//                                                 <Cell
//                                                     key={i}
//                                                     fill={
//                                                         [
//                                                             "#3b82f6",
//                                                             "#10b981",
//                                                             "#6366f1",
//                                                         ][i]
//                                                     }
//                                                 />
//                                             ))}
//                                         </Pie>
//                                         <RTooltip />
//                                     </PieChart>
//                                 </ResponsiveContainer>
//                             </div>
//                             <div className="mt-4 flex items-center justify-center gap-4 text-sm text-slate-600">
//                                 <div className="flex items-center gap-2">
//                                     <span className="h-2 w-2 rounded-full bg-blue-500" />{" "}
//                                     Land
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
//                                     Air
//                                 </div>
//                                 <div className="flex items-center gap-2">
//                                     <span className="h-2 w-2 rounded-full bg-indigo-500" />{" "}
//                                     Sea
//                                 </div>
//                             </div>
//                         </CardContent>
//                     </Card>
//                 </div>

//                 {/* Search & Filters */}
//                 <Card className="mb-8 rounded-2xl shadow-sm">
//                     <CardContent className="pt-6">
//                         <div className="grid items-center gap-3 md:grid-cols-2 lg:grid-cols-4">
//                             <div className="relative">
//                                 <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
//                                 <Input
//                                     value={q}
//                                     onChange={(e) => setQ(e.target.value)}
//                                     placeholder="Search vehicles, aircraft, boats…"
//                                     className="pl-9 rounded-xl"
//                                 />
//                             </div>
//                             <Select value={mode} onValueChange={setMode}>
//                                 <SelectTrigger className="rounded-xl">
//                                     <SelectValue placeholder="Mode" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="all">
//                                         All Modes
//                                     </SelectItem>
//                                     <SelectItem value="land">Land</SelectItem>
//                                     <SelectItem value="air">Air</SelectItem>
//                                     <SelectItem value="sea">Sea</SelectItem>
//                                 </SelectContent>
//                             </Select>
//                             <Select
//                                 value={location}
//                                 onValueChange={setLocation}
//                             >
//                                 <SelectTrigger className="rounded-xl">
//                                     <SelectValue placeholder="Location" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     {locations.map((loc) => (
//                                         <SelectItem key={loc} value={loc}>
//                                             {loc === "all"
//                                                 ? "All Locations"
//                                                 : loc}
//                                         </SelectItem>
//                                     ))}
//                                 </SelectContent>
//                             </Select>
//                             <Select value={sort} onValueChange={setSort}>
//                                 <SelectTrigger className="rounded-xl">
//                                     <SelectValue placeholder="Sort By" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                     <SelectItem value="popular">
//                                         Most Popular
//                                     </SelectItem>
//                                     <SelectItem value="price">
//                                         Price (Asc)
//                                     </SelectItem>
//                                     <SelectItem value="rating">
//                                         Rating (Desc)
//                                     </SelectItem>
//                                 </SelectContent>
//                             </Select>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Fleets & Upcoming */}
//                 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//                     <div className="lg:col-span-2">
//                         <div className="mb-3 flex items-center justify-between">
//                             <h2 className="text-lg font-semibold">
//                                 Available Fleet
//                             </h2>
//                             <Tabs
//                                 value={mode === "all" ? "all" : mode}
//                                 onValueChange={(v) => setMode(v)}
//                                 className="hidden sm:block"
//                             >
//                                 <TabsList className="rounded-2xl">
//                                     <TabsTrigger
//                                         value="all"
//                                         className="rounded-xl"
//                                     >
//                                         All
//                                     </TabsTrigger>
//                                     <TabsTrigger
//                                         value="land"
//                                         className="rounded-xl flex items-center gap-2"
//                                     >
//                                         <Car className="h-4 w-4" />
//                                         Land
//                                     </TabsTrigger>
//                                     <TabsTrigger
//                                         value="air"
//                                         className="rounded-xl flex items-center gap-2"
//                                     >
//                                         <Plane className="h-4 w-4" />
//                                         Air
//                                     </TabsTrigger>
//                                     <TabsTrigger
//                                         value="sea"
//                                         className="rounded-xl flex items-center gap-2"
//                                     >
//                                         <Ship className="h-4 w-4" />
//                                         Sea
//                                     </TabsTrigger>
//                                 </TabsList>
//                             </Tabs>
//                         </div>

//                         <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
//                             {filteredFleets.map((f) => (
//                                 <motion.div
//                                     key={f.id}
//                                     initial={{ opacity: 0, y: 8 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     transition={{ duration: 0.25 }}
//                                 >
//                                     <Card className="group rounded-2xl shadow-sm">
//                                         <CardHeader className="pb-2">
//                                             <div className="flex items-start justify-between">
//                                                 <div>
//                                                     <CardTitle className="text-base">
//                                                         {f.name}
//                                                     </CardTitle>
//                                                     <CardDescription className="flex items-center gap-2">
//                                                         <MapPin className="h-3.5 w-3.5" />{" "}
//                                                         {f.location}
//                                                     </CardDescription>
//                                                 </div>
//                                                 <TooltipProvider>
//                                                     <Tooltip>
//                                                         <TooltipTrigger asChild>
//                                                             <Badge
//                                                                 variant="secondary"
//                                                                 className="rounded-full"
//                                                             >
//                                                                 <Star className="mr-1 h-3.5 w-3.5" />
//                                                                 {f.rating}
//                                                             </Badge>
//                                                         </TooltipTrigger>
//                                                         <TooltipContent>
//                                                             Average customer
//                                                             rating
//                                                         </TooltipContent>
//                                                     </Tooltip>
//                                                 </TooltipProvider>
//                                             </div>
//                                         </CardHeader>
//                                         <CardContent className="flex items-end justify-between gap-2">
//                                             <div className="text-sm text-slate-600">
//                                                 <div className="flex items-center gap-2 text-slate-700">
//                                                     <CreditCard className="h-4 w-4" />{" "}
//                                                     <span className="font-medium">
//                                                         ${""}
//                                                         {f.price}
//                                                     </span>{" "}
//                                                     / {f.unit}
//                                                 </div>
//                                                 <div className="mt-1 flex items-center gap-2 text-slate-500">
//                                                     <Clock className="h-4 w-4" />{" "}
//                                                     Instant confirm
//                                                 </div>
//                                             </div>
//                                             <Button className="rounded-xl">
//                                                 Book{" "}
//                                                 <ChevronRight className="ml-1 h-4 w-4" />
//                                             </Button>
//                                         </CardContent>
//                                     </Card>
//                                 </motion.div>
//                             ))}
//                             {filteredFleets.length === 0 && (
//                                 <Card className="rounded-2xl border-dashed">
//                                     <CardContent className="py-10 text-center text-slate-500">
//                                         No results. Try changing filters.
//                                     </CardContent>
//                                 </Card>
//                             )}
//                         </div>
//                     </div>

//                     <div className="space-y-4">
//                         <Card className="rounded-2xl shadow-sm">
//                             <CardHeader>
//                                 <CardTitle>Upcoming Reservations</CardTitle>
//                                 <CardDescription>
//                                     Next trips and rentals
//                                 </CardDescription>
//                             </CardHeader>
//                             <CardContent className="space-y-3">
//                                 {upcoming.map((r) => (
//                                     <div
//                                         key={r.code}
//                                         className="rounded-2xl border p-3"
//                                     >
//                                         <div className="flex items-center justify-between">
//                                             <div className="flex items-center gap-2 text-slate-700">
//                                                 <ModeIcon
//                                                     mode={r.mode}
//                                                     className="h-4 w-4"
//                                                 />
//                                                 <span className="font-medium">
//                                                     {r.item}
//                                                 </span>
//                                             </div>
//                                             <span
//                                                 className={`rounded-full border px-2 py-0.5 text-xs ${
//                                                     statusMap[r.status].tone
//                                                 }`}
//                                             >
//                                                 {statusMap[r.status].label}
//                                             </span>
//                                         </div>
//                                         <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
//                                             <Calendar className="h-4 w-4" />
//                                             <span>
//                                                 {r.from} → {r.to}
//                                             </span>
//                                         </div>
//                                         <div className="mt-1 text-sm text-slate-500">
//                                             Pickup: {r.pickup}
//                                         </div>
//                                         <div className="mt-2 flex items-center justify-between text-sm">
//                                             <span className="text-slate-500">
//                                                 Ref: {r.code}
//                                             </span>
//                                             <Button
//                                                 size="sm"
//                                                 variant="outline"
//                                                 className="rounded-xl"
//                                             >
//                                                 Manage
//                                             </Button>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </CardContent>
//                         </Card>

//                         <Card className="rounded-2xl shadow-sm">
//                             <CardHeader>
//                                 <CardTitle>Quick Actions</CardTitle>
//                                 <CardDescription>Common tasks</CardDescription>
//                             </CardHeader>
//                             <CardContent className="grid grid-cols-2 gap-2">
//                                 <Button
//                                     variant="outline"
//                                     className="justify-start rounded-2xl"
//                                 >
//                                     <Car className="mr-2 h-4 w-4" /> Extend Land
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     className="justify-start rounded-2xl"
//                                 >
//                                     <Plane className="mr-2 h-4 w-4" /> Charter
//                                     Flight
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     className="justify-start rounded-2xl"
//                                 >
//                                     <Ship className="mr-2 h-4 w-4" /> Book Yacht
//                                 </Button>
//                                 <Button
//                                     variant="outline"
//                                     className="justify-start rounded-2xl"
//                                 >
//                                     <Calendar className="mr-2 h-4 w-4" /> Change
//                                     Dates
//                                 </Button>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>

//                 {/* History Table */}
//                 <Card className="mt-8 rounded-2xl shadow-sm">
//                     <CardHeader>
//                         <CardTitle>Recent Activity</CardTitle>
//                         <CardDescription>
//                             Latest bookings and changes
//                         </CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                         <div className="overflow-x-auto">
//                             <table className="w-full table-auto border-separate border-spacing-y-2">
//                                 <thead>
//                                     <tr className="text-left text-slate-500">
//                                         <th className="px-3 py-2">Mode</th>
//                                         <th className="px-3 py-2">Item</th>
//                                         <th className="px-3 py-2">From</th>
//                                         <th className="px-3 py-2">To</th>
//                                         <th className="px-3 py-2">Pickup</th>
//                                         <th className="px-3 py-2">Status</th>
//                                         <th className="px-3 py-2 text-right">
//                                             Amount
//                                         </th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {reservations.map((r) => (
//                                         <tr
//                                             key={r.code}
//                                             className="rounded-xl bg-white shadow-sm"
//                                         >
//                                             <td className="px-3 py-3">
//                                                 <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-2 py-1 text-slate-700">
//                                                     <ModeIcon
//                                                         mode={r.mode}
//                                                         className="h-4 w-4"
//                                                     />
//                                                     {r.mode.toUpperCase()}
//                                                 </div>
//                                             </td>
//                                             <td className="px-3 py-3 font-medium">
//                                                 {r.item}
//                                             </td>
//                                             <td className="px-3 py-3 text-slate-600">
//                                                 {r.from}
//                                             </td>
//                                             <td className="px-3 py-3 text-slate-600">
//                                                 {r.to}
//                                             </td>
//                                             <td className="px-3 py-3 text-slate-600">
//                                                 {r.pickup}
//                                             </td>
//                                             <td className="px-3 py-3">
//                                                 <span
//                                                     className={`rounded-full border px-2 py-0.5 text-xs ${
//                                                         statusMap[r.status].tone
//                                                     }`}
//                                                 >
//                                                     {statusMap[r.status].label}
//                                                 </span>
//                                             </td>
//                                             <td className="px-3 py-3 text-right font-medium">
//                                                 ${""}
//                                                 {r.amount.toFixed(2)}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     </CardContent>
//                 </Card>

//                 {/* Footer */}
//                 <div className="mt-8 text-center text-xs text-slate-400">
//                     © {new Date().getFullYear()} Rental Portal · Land • Air •
//                     Sea
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Hero;

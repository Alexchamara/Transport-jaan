import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Calendar,
  Users,
  MapPin,
  Star,
  X,
  Plane,
  ChevronRight,
} from "lucide-react";

// --- Sample data -------------------------------------------------------------
const DESTINATIONS = [
  {
    id: "bali",
    title: "Bali",
    country: "Indonesia",
    price: 899,
    rating: 4.8,
    days: 5,
    img:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1600&auto=format&fit=crop",
    description:
      "Sunrise over emerald rice terraces, cliffside temples, and laid‑back beach towns. Perfect for first‑timers and surfers alike.",
    highlights: ["Uluwatu Temple show", "Nusa Penida day trip", "Canggu cafes"],
  },
  {
    id: "kyoto",
    title: "Kyoto",
    country: "Japan",
    price: 1199,
    rating: 4.9,
    days: 6,
    img:
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1600&auto=format&fit=crop",
    description:
      "Historic lanes, tea houses, and crimson torii tunnels. Slow travel through shrines, gardens, and quiet rivers.",
    highlights: ["Fushimi Inari hike", "Arashiyama bamboo grove", "Gion district"],
  },
  {
    id: "amalfi",
    title: "Amalfi Coast",
    country: "Italy",
    price: 1320,
    rating: 4.7,
    days: 5,
    img:
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=1600&auto=format&fit=crop",
    description:
      "Sun‑splashed cliff towns, lemon groves, and cerulean bays. Hop boats between Positano, Amalfi, and Capri.",
    highlights: ["Capri day cruise", "Path of the Gods", "Limoncello tasting"],
  },
  {
    id: "iceland",
    title: "Iceland",
    country: "Nordics",
    price: 1490,
    rating: 4.8,
    days: 7,
    img:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1600&auto=format&fit=crop",
    description:
      "Waterfalls, black‑sand beaches, and steaming blue lagoons. A cinematic road trip on the Ring Road.",
    highlights: ["Skógafoss & Seljalandsfoss", "Glacier hike", "Blue Lagoon"],
  },
];

// --- Small UI bits -----------------------------------------------------------
const Badge = ({ children }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
    {children}
  </span>
);

const Glass = ({ className = "", children }) => (
  <div
    className={
      "rounded-2xl border border-white/15 bg-white/5 p-4 shadow-2xl backdrop-blur-xl " +
      className
    }
  >
    {children}
  </div>
);

// --- Main component ----------------------------------------------------------
export default function TravelExploreAnimation() {
  const [query, setQuery] = useState("");
  const [guests, setGuests] = useState(2);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    if (!query) return DESTINATIONS;
    return DESTINATIONS.filter((d) =>
      (d.title + " " + d.country).toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Header / Search */}
      <div className="mx-auto max-w-7xl px-4 pt-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6 md:flex-row md:items-end"
        >
          <div className="flex-1">
            <h1 className="text-3xl font-semibold md:text-4xl">
              Find your next <span className="text-sky-300">escape</span>
            </h1>
            <p className="mt-2 max-w-prose text-sm text-white/70">
              Smooth, delightful micro‑interactions inspired by modern UI motion.
              Click a card to see the shared‑element transition.
            </p>
          </div>

          <Glass className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:items-center">
            <label className="group flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10 focus-within:bg-white/10">
              <Search className="h-4 w-4 text-white/70" />
              <input
                className="w-56 bg-transparent text-sm placeholder-white/50 outline-none"
                placeholder="Where to? (try Bali)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <Calendar className="h-4 w-4 text-white/70" />
              <span className="text-sm text-white/80">Next month</span>
            </label>
            <label className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
              <Users className="h-4 w-4 text-white/70" />
              <input
                type="number"
                min={1}
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value || "1", 10))}
                className="w-12 bg-transparent text-sm outline-none"
              />
              <span className="text-sm text-white/80">guests</span>
            </label>
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-400/90 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg shadow-sky-400/20"
            >
              <Plane className="h-4 w-4" /> Explore
            </motion.button>
          </Glass>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((d, idx) => (
            <DestinationCard key={d.id} d={d} idx={idx} onOpen={() => setSelected(d)} />
          ))}
        </motion.div>

        {/* Helper blurb */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-10 flex max-w-2xl items-center justify-center gap-2 text-white/60"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="text-sm">Click a destination to preview itinerary</span>
        </motion.div>
      </div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              layoutId={`card-${selected.id}`}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-2xl backdrop-blur-xl"
            >
              <motion.div
                layoutId={`image-${selected.id}`}
                className="h-64 w-full bg-cover bg-center sm:h-80"
                style={{ backgroundImage: `url(${selected.img})` }}
              />

              <div className="relative grid gap-6 p-6 sm:p-8 md:grid-cols-3">
                <div className="md:col-span-2">
                  <motion.h3 layoutId={`title-${selected.id}`} className="text-2xl font-semibold">
                    {selected.title}
                  </motion.h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-white/70">
                    <MapPin className="h-4 w-4" /> {selected.country}
                    <span className="mx-2 h-1 w-1 rounded-full bg-white/25" />
                    <Star className="h-4 w-4 text-yellow-300" /> {selected.rating}
                    <span className="mx-2 h-1 w-1 rounded-full bg-white/25" />
                    {selected.days} days
                  </div>

                  <p className="mt-4 text-white/80">{selected.description}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {selected.highlights.map((h) => (
                      <Badge key={h}>{h}</Badge>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col justify-between">
                  <div className="space-y-3">
                    <Glass>
                      <div className="text-sm text-white/70">From</div>
                      <div className="text-3xl font-bold">${selected.price}</div>
                      <div className="text-xs text-white/60">per person · flights included</div>
                    </Glass>
                    <Glass>
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin className="h-4 w-4" /> Suggested route
                      </div>
                      <div className="mt-3 h-28 w-full rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/10">
                        {/* lightweight faux map */}
                        <svg viewBox="0 0 200 100" className="h-full w-full opacity-70">
                          <defs>
                            <marker id="dot" markerWidth="4" markerHeight="4" refX="2" refY="2">
                              <circle cx="2" cy="2" r="2" fill="currentColor" />
                            </marker>
                          </defs>
                          <path
                            d="M10 80 C 40 20, 80 20, 100 50 S 160 80, 190 30"
                            stroke="currentColor"
                            className="text-sky-300"
                            strokeWidth="2"
                            fill="none"
                            markerStart="url(#dot)"
                            markerEnd="url(#dot)"
                          />
                        </svg>
                      </div>
                    </Glass>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-400/90 px-4 py-3 font-semibold text-slate-900 shadow-lg shadow-sky-400/20"
                  >
                    Book this trip <ChevronRight className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="absolute right-3 top-3 inline-flex items-center justify-center rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer shimmer */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}

function DestinationCard({ d, idx, onOpen }) {
  return (
    <motion.button
      layoutId={`card-${d.id}`}
      onClick={onOpen}
      className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-lg"
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Image */}
      <motion.div
        layoutId={`image-${d.id}`}
        className="h-56 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${d.img})` }}
        initial={false}
      />

      {/* Overlay content */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center justify-between">
          <motion.h3
            layoutId={`title-${d.id}`}
            className="text-xl font-semibold tracking-tight"
          >
            {d.title}
          </motion.h3>
          <div className="flex items-center gap-1 text-yellow-300">
            <Star className="h-4 w-4" />
            <span className="text-sm">{d.rating}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2 text-sm text-white/80">
          <MapPin className="h-4 w-4 text-white/70" /> {d.country}
          <span className="mx-2 h-1 w-1 rounded-full bg-white/30" /> {d.days} days
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge>${d.price} pp</Badge>
            <Badge className="">Flexible dates</Badge>
          </div>
          <motion.span
            className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-900 group-hover:bg-white"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Preview
          </motion.span>
        </div>
      </div>
    </motion.button>
  );
}

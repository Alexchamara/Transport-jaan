import React, {useState} from "react";
import SideMenu from "../../../components/vendors/ticketBooking/SideMenu";
import ExpensesContent from "../../../components/vendors/ticketBooking/financial/expenses/ExpensesContent";
import { Menu } from "lucide-react"; // simple clean icon


const Expenses = () => {
const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-[#E5E5E5] min-h-screen w-full flex gap-0">
            {/* Toggle Button (only visible on mobile) */}
            <button
                className="lg:hidden p-2 m-2 fixed left-2 top-2 z-50 bg-white rounded-full shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Menu size={22} />
            </button>

            {/* Side Menu - Fixed, does not scroll */}
            <div
                className={`fixed lg:static top-0 left-0 min-h-screen lg:h-screen w-64 z-40 transition-transform duration-300 overflow-hidden
                 ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                 lg:translate-x-0 bg-white shadow lg:shadow-none flex-shrink-0`}
            >
                <SideMenu />
            </div>

            {/* Main Content - Only vertical scroll */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden h-screen">
                <ExpensesContent />
            </div>
        </div>
    );
};


export default Expenses;

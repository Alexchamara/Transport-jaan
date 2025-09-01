import React from "react";
import SideMenu from "../../components/vendors/SideMenu";
import ExpensesContent from "../../components/vendors/financial/expenses/ExpensesContent";

const Expenses = () => {
    return (
        <div className="bg-[#E5E5E5] h-auto">
            <div className="flex flex-row gap-10 h-auto">
                <SideMenu />
                <ExpensesContent />
            </div>
        </div>
    );
};

export default Expenses;

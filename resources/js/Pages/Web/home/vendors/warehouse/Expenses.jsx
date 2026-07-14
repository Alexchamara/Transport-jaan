import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ExpensesContent from "../../../components/vendors/warehouse/financial/expenses/ExpensesContent";

const Expenses = () => {
    return (
        <VendorShellLayout activeService="Warehousing">
            <ExpensesContent />
        </VendorShellLayout>
    );
};

export default Expenses;

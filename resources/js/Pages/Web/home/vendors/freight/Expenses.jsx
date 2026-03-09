import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ExpensesContent from "../../../components/vendors/freight/financial/expenses/ExpensesContent";

const Expenses = () => {
    return (
        <VendorShellLayout activeService="Freight">
            <ExpensesContent />
        </VendorShellLayout>
    );
};

export default Expenses;

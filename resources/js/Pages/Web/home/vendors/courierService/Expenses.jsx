import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ExpensesContent from "../../../components/vendors/courierService/financial/expenses/ExpensesContent";

const Expenses = () => {
    return (
        <VendorShellLayout activeService="Courier Service">
            <ExpensesContent />
        </VendorShellLayout>
    );
};

export default Expenses;

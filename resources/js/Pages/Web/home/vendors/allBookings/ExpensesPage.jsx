import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ExpensesContent from "../../../components/vendors/financial/expenses/ExpensesContent";

const ExpensesPage = () => (
    <VendorShellLayout activeService="All Bookings">
        <ExpensesContent />
    </VendorShellLayout>
);

export default ExpensesPage;

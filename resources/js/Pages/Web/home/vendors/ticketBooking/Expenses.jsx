import React from "react";
import VendorShellLayout from "../../../../../Components/vendors/VendorShellLayout";
import ExpensesContent from "../../../components/vendors/ticketBooking/financial/expenses/ExpensesContent";

const Expenses = () => {
    return (
        <VendorShellLayout activeService="Ticket Booking">
            <ExpensesContent />
        </VendorShellLayout>
    );
};

export default Expenses;

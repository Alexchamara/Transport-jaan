import React from "react";

const CurrentYear = () => {
    const year = new Date().getFullYear();
    return <span>{year}</span>;
};

export default CurrentYear;

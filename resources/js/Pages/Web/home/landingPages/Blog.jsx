import React from "react";
import HeaderTwo from "../../layouts/HeaderTwo";
import Hero from "../../components/landingPages/blog/Hero";
import Categories from "../../components/landingPages/blog/Categories";
import Spotlight from "../../components/landingPages/blog/Spotlight";
import PopularNews from "../../components/landingPages/blog/PopularNews";
import TrendingNews from "../../components/landingPages/blog/TrendingNews";
import BestNews from "../../components/landingPages/blog/BestNews";
import FooterTwo from "../../layouts/FooterTwo";

import "../../components/landingPages/blog/blog.css";

const Blog = () => {
    return (
        <div className="bg-[#000000] text-[#FFFFFF] poppins">
            <HeaderTwo />
            <Hero />
            <Categories />
            <Spotlight />
            <PopularNews />
            <TrendingNews />
            <BestNews />
            <FooterTwo />
        </div>
    );
};

export default Blog;

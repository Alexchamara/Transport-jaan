import React from 'react'
import HeaderTwo from "../../layouts/HeaderTwo";
import Hero from "../../components/landingPages/blogExample/Hero";
import FooterTwo from "../../layouts/FooterTwo";


import "../../components/landingPages/blog/blog.css"


const BlogExample = () => {
  return (
    <div className='bg-[#000000] text-[#FFFFFF] poppins'>
     <HeaderTwo />
     <Hero />
     <FooterTwo />
    </div>
  )
}

export default BlogExample;
import React from 'react'
import Hero from "../components/home/Hero.jsx";
import FeatureSection from "../components/home/FeatureSection.jsx";
import FAQSection from "../components/home/FAQSection.jsx";
import Footer from "../components/home/Footer.jsx";
import TestimonialSection from "../components/home/TestimonialSection.jsx";


const Home = () => {
  return (
    <div >
      <Hero/>
      <FeatureSection/>
      <TestimonialSection/>
      <FAQSection/>
      <Footer/>
    </div>
  )
}

export default Home
import React from 'react';
import Header from '../components/homePage/Header';
import Hero from '../components/homePage/Hero';
import ProblemStatement from '../components/homePage/ProblemStatement';
import HowItWorks from '../components/homePage/HowItWorks';
import DashboardShowcase from '../components/homePage/DashboardShowcase';
import Benefits from '../components/homePage/Benefits';
import FinalCTA from '../components/homePage/FinalCTA';
import Footer from '../components/homePage/Footer';
import StickyCTA from '../components/homePage/StickyCTA';

function homePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <Hero />
      <ProblemStatement />
      <HowItWorks />
      <DashboardShowcase />
      <Benefits />
      <FinalCTA />
      <Footer />
      <StickyCTA />
    </div>
  );
}

export default homePage;
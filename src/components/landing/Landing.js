import React from 'react';
import { Link } from 'react-router-dom';
import Hero from './Hero';
import Features from './Features';
import Testimonials from './Testimonials';
import Pricing from './Pricing';
import Footer from './Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-secondary-100 fixed w-full z-10">
        <div className="container-custom py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-primary-600">TaskFlow</Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/#features" className="text-secondary-600 hover:text-primary-600 font-medium">Features</Link>
            <Link to="/#testimonials" className="text-secondary-600 hover:text-primary-600 font-medium">Testimonials</Link>
            <Link to="/#pricing" className="text-secondary-600 hover:text-primary-600 font-medium">Pricing</Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/signin" className="text-secondary-600 hover:text-primary-600 font-medium">Sign In</Link>
            <Link to="/signup" className="btn btn-primary">Get Started Free</Link>
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <main className="pt-20">
        <Hero />
        <Features />
        <Testimonials />
        <Pricing />
      </main>
      
      <Footer />
    </div>
  );
};

export default Landing;
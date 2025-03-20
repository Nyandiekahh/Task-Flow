import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Hero = () => {
  return (
    <section className="section bg-gradient-to-b from-white to-primary-50">
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center md:space-x-12">
          <motion.div 
            className="md:w-1/2 mb-10 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-6">
              Streamline Your Workflow
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 leading-tight mb-6">
              Manage Tasks Effortlessly with <span className="text-primary-600">TaskFlow</span>
            </h1>
            <p className="text-xl text-secondary-600 mb-8">
              The all-in-one solution for teams to collaborate, track, and 
              complete tasks. Boost productivity and stay organized with
              our intuitive task management platform.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup" className="btn btn-primary text-center py-3 px-8 text-lg">
                Start for Free
              </Link>
              <Link to="/#features" className="btn btn-secondary text-center py-3 px-8 text-lg">
                Learn More
              </Link>
            </div>
            
            <div className="mt-8 flex items-center text-secondary-500">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </span>
              <span className="mx-4">•</span>
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                14-day free trial
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            className="md:w-1/2"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-secondary-100">
              <div className="p-1 bg-secondary-100 flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-danger-500"></div>
                <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                <div className="w-3 h-3 rounded-full bg-success-500"></div>
              </div>
              <div className="p-6">
                {/* Placeholder for app screenshot - in a real app, use an actual image */}
                <div className="bg-primary-50 p-10 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p className="text-primary-600 font-medium">TaskFlow Dashboard Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-lg text-secondary-600 mb-6">Trusted by teams at</p>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8">
            {/* Placeholder for company logos - in a real app, use actual images */}
            {['Acme Inc.', 'TechCorp', 'GlobalSys', 'InnovateLabs', 'FutureTech'].map((company, index) => (
              <div key={index} className="text-secondary-400 font-semibold text-xl">
                {company}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
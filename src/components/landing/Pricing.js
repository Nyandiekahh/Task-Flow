import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const pricingPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small teams getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      'Up to 5 team members',
      'Basic task management',
      'Simple role management',
      'Email notifications',
      '5GB storage',
      'Community support'
    ],
    cta: 'Start for Free',
    highlight: false
  },
  {
    name: 'Professional',
    description: 'Ideal for growing teams with advanced needs',
    monthlyPrice: 19,
    yearlyPrice: 190,
    features: [
      'Up to 20 team members',
      'Advanced task management',
      'Custom roles and permissions',
      'Email and in-app notifications',
      '25GB storage',
      'Priority support',
      'Analytics dashboard',
      'API access'
    ],
    cta: 'Start 14-Day Trial',
    highlight: true
  },
  {
    name: 'Enterprise',
    description: 'For large organizations with complex workflows',
    monthlyPrice: 49,
    yearlyPrice: 490,
    features: [
      'Unlimited team members',
      'Advanced task management',
      'Custom roles and workflows',
      'All notification channels',
      'Unlimited storage',
      '24/7 dedicated support',
      'Advanced analytics',
      'API access',
      'SAML Single Sign-On',
      'Custom integrations',
      'Dedicated account manager'
    ],
    cta: 'Contact Sales',
    highlight: false
  }
];

const Pricing = () => {
  const [annual, setAnnual] = useState(true);
  
  return (
    <section id="pricing" className="section bg-white">
      <div className="container-custom">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Pricing
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-secondary-600 mb-8">
            Choose the plan that's right for your team, with no hidden fees or commitments.
          </p>
          
          {/* Billing toggle */}
          <div className="flex items-center justify-center">
            <span className={`text-sm font-medium ${!annual ? 'text-secondary-900' : 'text-secondary-500'}`}>
              Monthly
            </span>
            <button 
              className="mx-4 relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none"
              onClick={() => setAnnual(!annual)}
              style={{ backgroundColor: annual ? '#0ea5e9' : '#cbd5e1' }}
            >
              <span 
                className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                style={{ transform: annual ? 'translateX(1.5rem)' : 'translateX(0.25rem)' }}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-secondary-900' : 'text-secondary-500'}`}>
              Annual <span className="text-success-500 font-bold">(Save 20%)</span>
            </span>
          </div>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div 
              key={index}
              className={`card border ${plan.highlight ? 'border-primary-500 shadow-xl' : 'border-secondary-200'} h-full flex flex-col`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {plan.highlight && (
                <div className="bg-primary-500 text-white text-center py-1 text-sm font-semibold rounded-t-xl -mt-6 -mx-6 mb-6">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">{plan.name}</h3>
              <p className="text-secondary-600 mb-6">{plan.description}</p>
              
              <div className="mb-6">
                <span className="text-4xl font-bold text-secondary-900">
                  ${annual ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-secondary-600">
                  {plan.monthlyPrice === 0 ? ' forever' : annual ? '/year' : '/month'}
                </span>
              </div>
              
              <ul className="space-y-3 mb-8 grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-success-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-secondary-600">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Link 
                to={plan.name === 'Enterprise' ? '/contact' : '/signup'} 
                className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} text-center py-3 mt-auto`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-secondary-900 mb-2">
            Need a custom plan for your organization?
          </h3>
          <p className="text-secondary-600 mb-6">
            Contact our sales team for a tailored solution to meet your specific requirements.
          </p>
          <Link to="/contact" className="inline-flex items-center font-medium text-primary-600 hover:text-primary-700">
            Contact Sales
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Pricing;
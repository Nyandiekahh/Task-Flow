import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    quote: "TaskFlow has completely transformed how our team collaborates. We've reduced our project completion time by 40% since implementing it.",
    author: "Sarah Johnson",
    role: "Project Manager",
    company: "TechCorp",
    avatar: "SJ" // In a real app, use an actual image
  },
  {
    quote: "The role-based permissions system is exactly what we needed. Now everyone has the right level of access without confusion or security concerns.",
    author: "Michael Chen",
    role: "CTO",
    company: "InnovateLabs",
    avatar: "MC"
  },
  {
    quote: "I was amazed by how quickly our team adapted to TaskFlow. The intuitive interface made onboarding a breeze.",
    author: "Emily Rodriguez",
    role: "Team Lead",
    company: "GlobalSys",
    avatar: "ER"
  }
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="section bg-primary-50">
      <div className="container-custom">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 mb-4">
            What our customers are saying
          </h2>
          <p className="text-xl text-secondary-600">
            Teams of all sizes trust TaskFlow to manage their workload and boost productivity.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={index}
              className="card h-full flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="mb-6">
                {/* Star rating */}
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-warning-500" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                
                <p className="text-secondary-700 italic font-medium">
                  "{testimonial.quote}"
                </p>
              </div>
              
              <div className="mt-auto flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-600 text-white flex items-center justify-center font-medium text-lg">
                  {testimonial.avatar}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-secondary-900">{testimonial.author}</h4>
                  <p className="text-secondary-600 text-sm">{testimonial.role}, {testimonial.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-16 bg-white rounded-xl p-8 border border-secondary-100 shadow-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <h3 className="text-2xl font-bold text-secondary-900 mb-2">
                Ready to streamline your workflow?
              </h3>
              <p className="text-secondary-600">
                Join thousands of teams already using TaskFlow to boost productivity.
              </p>
            </div>
            <a href="/signup" className="btn btn-primary text-lg py-3 px-8 whitespace-nowrap">
              Start Your Free Trial
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
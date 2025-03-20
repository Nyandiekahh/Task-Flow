import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    {
      title: 'Product',
      links: [
        { text: 'Features', url: '/#features' },
        { text: 'Pricing', url: '/#pricing' },
        { text: 'Testimonials', url: '/#testimonials' },
        { text: 'Integrations', url: '/integrations' },
        { text: 'Roadmap', url: '/roadmap' },
      ]
    },
    {
      title: 'Company',
      links: [
        { text: 'About Us', url: '/about' },
        { text: 'Careers', url: '/careers' },
        { text: 'Blog', url: '/blog' },
        { text: 'Contact', url: '/contact' },
      ]
    },
    {
      title: 'Resources',
      links: [
        { text: 'Documentation', url: '/docs' },
        { text: 'Help Center', url: '/help' },
        { text: 'Community', url: '/community' },
        { text: 'Webinars', url: '/webinars' },
        { text: 'API', url: '/api' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Terms of Service', url: '/terms' },
        { text: 'Cookie Policy', url: '/cookies' },
        { text: 'GDPR', url: '/gdpr' },
      ]
    },
  ];
  
  return (
    <footer className="bg-secondary-900 text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <Link to="/" className="text-2xl font-bold text-white mb-4 inline-block">
              TaskFlow
            </Link>
            <p className="text-secondary-400 mb-6 max-w-md">
              The all-in-one solution for teams to collaborate, track, and 
              complete tasks. Boost productivity and stay organized with
              our intuitive task management platform.
            </p>
            <div className="flex space-x-4">
              {/* Social Media Icons */}
              {['twitter', 'facebook', 'linkedin', 'github'].map((platform) => (
                <a 
                  key={platform}
                  href={`https://${platform}.com`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-secondary-800 flex items-center justify-center text-secondary-400 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <span className="sr-only">{platform}</span>
                  {/* Placeholder for social icons */}
                  <div className="capitalize text-xs">{platform.charAt(0).toUpperCase()}</div>
                </a>
              ))}
            </div>
          </div>
          
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link to={link.url} className="text-secondary-400 hover:text-primary-400 transition-colors">
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="border-t border-secondary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-secondary-400 text-sm mb-4 md:mb-0">
            &copy; {currentYear} TaskFlow. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-secondary-400 hover:text-primary-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-secondary-400 hover:text-primary-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="text-secondary-400 hover:text-primary-400 text-sm transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
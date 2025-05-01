import { useState } from 'react';
import { Link } from 'wouter';

export function BioNewsHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <i className="ri-flask-line text-[#1ABC9C] text-2xl"></i>
            <h1 className="text-[#2C3E50] font-heading font-bold text-xl md:text-2xl">BioNews Digest</h1>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><Link href="/" className="text-[#2C3E50] hover:text-[#3498DB] transition-colors">Home</Link></li>
              <li><a href="#features" className="text-[#2C3E50] hover:text-[#3498DB] transition-colors">About</a></li>
              <li><a href="#news" className="text-[#2C3E50] hover:text-[#3498DB] transition-colors">Archive</a></li>
            </ul>
          </nav>
          <button 
            className="md:hidden text-[#2C3E50] text-xl"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <i className="ri-menu-line"></i>
          </button>
        </div>
      </header>
      
      {/* Mobile Navigation Menu */}
      <div className={`bg-white shadow-md absolute w-full z-10 ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="container mx-auto px-4 py-3">
          <ul className="space-y-3">
            <li><Link href="/" className="block text-[#2C3E50] hover:text-[#3498DB] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
            <li><a href="#features" className="block text-[#2C3E50] hover:text-[#3498DB] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>About</a></li>
            <li><a href="#news" className="block text-[#2C3E50] hover:text-[#3498DB] transition-colors py-2" onClick={() => setIsMobileMenuOpen(false)}>Archive</a></li>
          </ul>
        </nav>
      </div>
    </>
  );
}

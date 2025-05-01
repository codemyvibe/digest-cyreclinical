import { Link } from 'wouter';

export function BioNewsFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#2C3E50] text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="ri-flask-line text-[#1ABC9C] text-2xl"></i>
              <h3 className="font-heading font-bold text-xl">BioNews Digest</h3>
            </div>
            <p className="text-[#ECF0F1]/80 mb-4">Stay informed on the latest biotech and pharmaceutical industry developments.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-[#ECF0F1] hover:text-[#1ABC9C] transition-colors" aria-label="Twitter">
                <i className="ri-twitter-fill text-xl"></i>
              </a>
              <a href="#" className="text-[#ECF0F1] hover:text-[#1ABC9C] transition-colors" aria-label="LinkedIn">
                <i className="ri-linkedin-box-fill text-xl"></i>
              </a>
              <a href="#" className="text-[#ECF0F1] hover:text-[#1ABC9C] transition-colors" aria-label="Facebook">
                <i className="ri-facebook-fill text-xl"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Home</Link></li>
              <li><a href="#features" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Features</a></li>
              <li><a href="#signup" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Sign Up</a></li>
              <li><Link href="/admin" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Admin</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#news" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">News Archive</a></li>
              <li><a href="#" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Industry Reports</a></li>
              <li><a href="#" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-[#ECF0F1]/80 hover:text-[#1ABC9C] transition-colors">Terms of Service</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-start">
                <i className="ri-mail-line text-[#1ABC9C] mr-2 mt-1"></i>
                <span className="text-[#ECF0F1]/80">support@bionewsdigest.com</span>
              </li>
              <li className="flex items-start">
                <i className="ri-customer-service-2-line text-[#1ABC9C] mr-2 mt-1"></i>
                <span className="text-[#ECF0F1]/80">1-800-BIO-NEWS</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#34495E] pt-6 text-center text-[#ECF0F1]/60 text-sm">
          <p>&copy; {currentYear} BioNews Digest. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

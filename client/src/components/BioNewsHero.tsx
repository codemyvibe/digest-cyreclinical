import { Link } from 'wouter';

export function BioNewsHero() {
  return (
    <section className="bg-[#2C3E50] text-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-4">
              Stay Informed on Biotech & Pharma News
            </h2>
            <p className="text-lg mb-6">
              Get the most important industry developments delivered to your inbox. Curated by experts.
            </p>
            <div className="flex space-x-3">
              <a href="#signup" className="bg-[#1ABC9C] hover:bg-[#48C9B0] text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 inline-flex items-center">
                <i className="ri-mail-line mr-2"></i> Sign up now
              </a>
              <a href="#features" className="border border-white text-white font-medium py-2 px-6 rounded-md hover:bg-white hover:text-[#2C3E50] transition-colors duration-300 inline-flex items-center">
                <i className="ri-information-line mr-2"></i> Learn more
              </a>
            </div>
          </div>
          <div className="md:w-1/2 md:pl-8">
            <div className="relative rounded-lg overflow-hidden shadow-xl">
              <img 
                src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="Scientist in laboratory" 
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50]/80 to-transparent flex items-end">
                <div className="p-4">
                  <span className="bg-[#1ABC9C] text-white text-xs font-semibold px-2 py-1 rounded-md uppercase">Daily Updates</span>
                  <h3 className="text-white font-medium mt-2">Curated news from trusted sources</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

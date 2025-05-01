export function BioNewsFeatures() {
  return (
    <section id="features" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#2C3E50] mb-4">Why Choose BioNews Digest?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Our curated digest brings you the most significant developments in biotech and pharma, saving you time while keeping you informed.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-[#ECF0F1] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block p-3 bg-[#3498DB]/10 rounded-lg text-[#3498DB] mb-4">
              <i className="ri-filter-3-line text-2xl"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl text-[#2C3E50] mb-2">Expert Curation</h3>
            <p className="text-gray-600">Our algorithm identifies the most important news based on industry impact factors.</p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-[#ECF0F1] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block p-3 bg-[#1ABC9C]/10 rounded-lg text-[#1ABC9C] mb-4">
              <i className="ri-timer-line text-2xl"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl text-[#2C3E50] mb-2">Time-Saving Summaries</h3>
            <p className="text-gray-600">Get concise, to-the-point summaries of complex biotech developments.</p>
          </div>
          
          {/* Feature 3 */}
          <div className="bg-[#ECF0F1] rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="inline-block p-3 bg-[#2C3E50]/10 rounded-lg text-[#2C3E50] mb-4">
              <i className="ri-user-settings-line text-2xl"></i>
            </div>
            <h3 className="font-heading font-semibold text-xl text-[#2C3E50] mb-2">Personalization Options</h3>
            <p className="text-gray-600">Customize your digest by connecting LinkedIn or selecting topics of interest.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

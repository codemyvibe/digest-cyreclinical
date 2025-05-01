export function BioNewsTestimonials() {
  const testimonials = [
    {
      id: 1,
      text: "BioNews Digest has become an essential part of my morning routine. It's helped me stay on top of industry developments without spending hours reading multiple sources.",
      author: "Dr. Jennifer Davis",
      position: "Research Director, PharmaTech",
      initials: "JD",
      rating: 5
    },
    {
      id: 2,
      text: "The curated approach is what sets this digest apart. I only receive updates on meaningful developments, not every press release. It's a huge time-saver.",
      author: "Robert Martinez",
      position: "Biotech Investor",
      initials: "RM",
      rating: 5
    },
    {
      id: 3,
      text: "As a clinical researcher, staying updated on industry news is critical. This digest highlights developments I might otherwise miss and presents them clearly and concisely.",
      author: "Dr. Sarah Kim",
      position: "Clinical Research Director",
      initials: "SK",
      rating: 4.5
    }
  ];

  return (
    <section className="py-16 bg-[#ECF0F1]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#2C3E50] mb-4">What Our Subscribers Say</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Join thousands of professionals who rely on BioNews Digest to stay informed.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                <div className="text-[#1ABC9C]">
                  {[...Array(5)].map((_, i) => {
                    if (i < Math.floor(testimonial.rating)) {
                      return <i key={i} className="ri-star-fill"></i>;
                    } else if (i < testimonial.rating) {
                      return <i key={i} className="ri-star-half-fill"></i>;
                    } else {
                      return <i key={i} className="ri-star-line"></i>;
                    }
                  })}
                </div>
              </div>
              <p className="text-gray-600 mb-4">"{testimonial.text}"</p>
              <div className="flex items-center">
                <div className="bg-[#2C3E50]/10 w-10 h-10 rounded-full flex items-center justify-center text-[#2C3E50] font-semibold mr-3">
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-medium text-[#2C3E50]">{testimonial.author}</h4>
                  <p className="text-sm text-gray-500">{testimonial.position}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

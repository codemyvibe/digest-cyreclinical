import { useState } from 'react';

type FAQItem = {
  id: number;
  question: string;
  answer: string;
  isOpen: boolean;
};

export function BioNewsFAQ() {
  const [faqItems, setFaqItems] = useState<FAQItem[]>([
    {
      id: 1,
      question: "How often will I receive the news digest?",
      answer: "By default, you'll receive the digest daily, Monday through Friday. However, you can adjust your preferences to receive it weekly instead.",
      isOpen: false
    },
    {
      id: 2,
      question: "What sources do you use for the news?",
      answer: "We aggregate news from a variety of reputable biotech and pharmaceutical industry sources, including major publications, company press releases, and regulatory announcements.",
      isOpen: false
    },
    {
      id: 3,
      question: "Can I customize which news topics I receive?",
      answer: "Yes! After signing up, you'll have the option to personalize your digest by connecting your LinkedIn profile or manually selecting topics of interest.",
      isOpen: false
    },
    {
      id: 4,
      question: "How do I unsubscribe if I no longer want to receive the digest?",
      answer: "Every email includes an unsubscribe link at the bottom. Clicking this link will immediately remove you from our mailing list. You can also manage your subscription preferences through your account settings.",
      isOpen: false
    }
  ]);

  const toggleFAQ = (id: number) => {
    setFaqItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, isOpen: !item.isOpen } : item
      )
    );
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#2C3E50] mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Find answers to common questions about our biotech news digest service.</p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {faqItems.map((faq) => (
            <div key={faq.id} className="mb-4">
              <button 
                className="w-full text-left p-4 bg-[#ECF0F1] rounded-lg font-medium text-[#2C3E50] hover:bg-[#BDC3C7] transition-colors flex justify-between items-center" 
                aria-expanded={faq.isOpen}
                aria-controls={`faq-${faq.id}`}
                onClick={() => toggleFAQ(faq.id)}
              >
                {faq.question}
                <i className={`${faq.isOpen ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}`}></i>
              </button>
              <div 
                id={`faq-${faq.id}`} 
                className={`p-4 bg-white border border-[#ECF0F1] rounded-b-lg mt-1 ${faq.isOpen ? 'block' : 'hidden'}`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

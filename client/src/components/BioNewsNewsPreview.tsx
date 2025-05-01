import { useQuery } from '@tanstack/react-query';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
}

export function BioNewsNewsPreview() {
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['/api/news/latest'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  const calculateTimeAgo = (dateStr: string) => {
    const now = new Date();
    const publishedDate = new Date(dateStr);
    const diffInHours = Math.floor((now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return 'Yesterday';
    }
  };
  
  const getCategoryStyle = (category: string) => {
    switch (category.toUpperCase()) {
      case 'FDA APPROVAL':
        return 'bg-[#3498DB]/10 text-[#3498DB]';
      case 'CLINICAL TRIAL':
        return 'bg-[#1ABC9C]/10 text-[#1ABC9C]';
      case 'M&A':
        return 'bg-[#2C3E50]/10 text-[#2C3E50]';
      default:
        return 'bg-[#3498DB]/10 text-[#3498DB]';
    }
  };
  
  // Default sample news items if no data is available
  const sampleNewsItems: NewsItem[] = [
    {
      id: 1,
      title: "Novartis Receives FDA Approval for Breakthrough Cancer Therapy",
      summary: "The FDA has granted approval for Novartis' new CAR-T cell therapy for treating multiple myeloma, marking a significant advancement in blood cancer treatment options.",
      sourceUrl: "#",
      publishedAt: new Date().toISOString(),
      category: "FDA APPROVAL"
    },
    {
      id: 2,
      title: "Pfizer Reports Positive Phase 3 Results for Alzheimer's Drug",
      summary: "Pfizer announced that its experimental Alzheimer's treatment showed significant cognitive improvements in late-stage clinical trials, potentially offering new hope for patients.",
      sourceUrl: "#",
      publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      category: "CLINICAL TRIAL"
    },
    {
      id: 3,
      title: "Amgen Acquires Emerging Biotech Startup for $3.7 Billion",
      summary: "Amgen has completed the acquisition of a promising biotech startup focused on RNA therapeutics, expanding its pipeline in the rare disease treatment space.",
      sourceUrl: "#",
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      category: "M&A"
    }
  ];
  
  const displayedNewsItems = newsItems || [];
  
  return (
    <section id="news" className="py-16 bg-[#ECF0F1]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-[#2C3E50] mb-4">Sample Digest Preview</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Here's what you can expect in your daily biotech news summary.</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-10 max-w-3xl mx-auto">
          <div className="border-b border-[#BDC3C7] pb-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <i className="ri-mail-line text-lg text-[#1ABC9C] mr-2"></i>
                <h3 className="font-heading font-semibold text-[#2C3E50]">Today's BioNews Digest</h3>
              </div>
              <span className="text-sm text-gray-500">{formatDate(new Date().toISOString())}</span>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
            </div>
          ) : displayedNewsItems.length > 0 ? (
            displayedNewsItems.map((item) => (
              <div key={item.id} className="mb-6 pb-6 border-b border-[#ECF0F1] last:border-0">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded mr-2 ${getCategoryStyle(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">{calculateTimeAgo(item.publishedAt)}</span>
                    </div>
                    <h4 className="font-heading font-medium text-lg text-[#2C3E50] mb-2">{item.title}</h4>
                    <p className="text-gray-600 mb-3">{item.summary}</p>
                    <a href={item.sourceUrl} className="text-[#3498DB] hover:underline inline-flex items-center text-sm font-medium" target="_blank" rel="noopener noreferrer">
                      Read original article <i className="ri-external-link-line ml-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            sampleNewsItems.map((item) => (
              <div key={item.id} className="mb-6 pb-6 border-b border-[#ECF0F1] last:border-0">
                <div className="flex items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-1">
                      <span className={`text-xs font-semibold px-2 py-1 rounded mr-2 ${getCategoryStyle(item.category)}`}>
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">{calculateTimeAgo(item.publishedAt)}</span>
                    </div>
                    <h4 className="font-heading font-medium text-lg text-[#2C3E50] mb-2">{item.title}</h4>
                    <p className="text-gray-600 mb-3">{item.summary}</p>
                    <a href={item.sourceUrl} className="text-[#3498DB] hover:underline inline-flex items-center text-sm font-medium" target="_blank" rel="noopener noreferrer">
                      Read original article <i className="ri-external-link-line ml-1"></i>
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
          
          <div className="mt-6 pt-6 border-t border-[#ECF0F1] text-center">
            <a href="#signup" className="inline-flex items-center justify-center bg-[#1ABC9C] hover:bg-[#48C9B0] text-white font-medium py-2 px-6 rounded-md transition-colors duration-300">
              <i className="ri-mail-add-line mr-2"></i> Get this in your inbox
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

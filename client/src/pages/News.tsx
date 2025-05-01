import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { formatDate } from '@/lib/utils';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
}

export default function News() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: newsItems, isLoading } = useQuery<NewsItem[]>({
    queryKey: ['/api/news/latest'],
  });
  
  // Filter news items by category if a category is selected
  const filteredNews = selectedCategory
    ? newsItems?.filter((item: NewsItem) => item.category === selectedCategory)
    : newsItems;
  
  // Get unique categories
  const categories = newsItems 
    ? Array.from(new Set(newsItems.map((item: NewsItem) => item.category)))
    : [];
  
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <i className="ri-flask-line text-[#1ABC9C] text-2xl"></i>
              <h1 className="text-[#2C3E50] font-heading font-bold text-xl">BioNews Digest</h1>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow py-6 px-4">
        <div className="container mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Latest Biotech & Pharma News</h2>
            <p className="text-gray-600">
              Stay updated with the most recent developments in the biotech and pharmaceutical industry
            </p>
          </div>
          
          {/* Category Filter */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              <button
                className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                  selectedCategory === null
                    ? 'bg-[#1DA1F2] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => setSelectedCategory(null)}
              >
                All Categories
              </button>
              
              {categories.map((category: string) => (
                <button
                  key={category}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-[#1DA1F2] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DA1F2]"></div>
            </div>
          ) : filteredNews && filteredNews.length > 0 ? (
            <div className="space-y-6">
              {filteredNews.map((item: NewsItem) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-semibold px-2 py-1 rounded mr-2 ${
                      item.category === 'FDA APPROVAL' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'CLINICAL TRIAL' ? 'bg-green-100 text-green-800' :
                      item.category === 'M&A' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.category}
                    </span>
                    <span className="text-xs text-gray-500">{formatDate(new Date(item.publishedAt))}</span>
                  </div>
                  
                  <h3 className="font-medium text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 mb-3 text-sm">{item.summary}</p>
                  
                  <a 
                    href={item.sourceUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#1DA1F2] hover:underline text-sm font-medium inline-flex items-center"
                  >
                    Read full article
                    <i className="ri-external-link-line ml-1"></i>
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <i className="ri-newspaper-line text-gray-400 text-4xl mb-3"></i>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No news articles found</h3>
              <p className="text-gray-500">
                {selectedCategory 
                  ? `No articles found in the ${selectedCategory} category` 
                  : 'Check back later for the latest industry updates'}
              </p>
            </div>
          )}
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Subscribe to get these updates delivered directly to your inbox
            </p>
            <Link 
              href="/" 
              className="mt-3 inline-block px-4 py-2 bg-[#1DA1F2] text-white rounded-md font-medium"
            >
              Sign up for free
            </Link>
          </div>
        </div>
      </main>
      
      <footer className="py-6 px-4 border-t">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <i className="ri-flask-line text-gray-400 text-lg"></i>
              <p className="text-gray-500 text-sm">© {new Date().getFullYear()} BioNews Digest</p>
            </div>
            <div className="text-sm text-gray-500">
              <Link href="#" className="hover:text-[#1DA1F2] mr-4">Privacy Policy</Link>
              <Link href="#" className="hover:text-[#1DA1F2] mr-4">Terms of Service</Link>
              <Link href="#" className="hover:text-[#1DA1F2]">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
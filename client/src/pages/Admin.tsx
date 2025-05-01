import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { formatDate } from '@/lib/utils';

interface User {
  id: number;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  publishedAt: string;
  category: string;
  importance: number;
}

interface FeedSource {
  id: number;
  name: string;
  url: string;
  isActive: boolean;
  lastFetched: string | null;
}

interface EmailDigest {
  id: number;
  subject: string;
  sentTo: number;
  sentAt: string;
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('news');
  const { toast } = useToast();
  
  // Users
  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
  });
  
  // News Items
  const { data: newsItems, isLoading: newsLoading } = useQuery<NewsItem[]>({
    queryKey: ['/api/admin/news'],
  });
  
  // Feed Sources
  const { data: feedSources, isLoading: feedsLoading } = useQuery<FeedSource[]>({
    queryKey: ['/api/admin/feeds'],
  });
  
  // Email Digests
  const { data: emailDigests, isLoading: digestsLoading } = useQuery<EmailDigest[]>({
    queryKey: ['/api/admin/digests'],
  });
  
  // Send digest mutation
  const sendDigestMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/send-digest', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/digests'] });
      toast({
        title: "Success",
        description: "Digest sent successfully to all verified users."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send digest.",
        variant: "destructive"
      });
    }
  });
  
  // Fetch news mutation
  const fetchNewsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/admin/fetch-news', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      toast({
        title: "Success",
        description: "News fetched and processed successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch news.",
        variant: "destructive"
      });
    }
  });
  
  // Add feed source mutation
  const [newFeed, setNewFeed] = useState({ name: '', url: '' });
  
  const addFeedMutation = useMutation({
    mutationFn: async (feedData: { name: string, url: string }) => {
      return apiRequest('POST', '/api/admin/feeds', feedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feeds'] });
      setNewFeed({ name: '', url: '' });
      toast({
        title: "Success",
        description: "Feed source added successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add feed source.",
        variant: "destructive"
      });
    }
  });
  
  // Toggle feed active status
  const toggleFeedMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number, isActive: boolean }) => {
      return apiRequest('PATCH', `/api/admin/feeds/${id}`, { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feeds'] });
      toast({
        title: "Success",
        description: "Feed status updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feed status.",
        variant: "destructive"
      });
    }
  });
  
  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeed.name || !newFeed.url) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }
    addFeedMutation.mutate(newFeed);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <i className="ri-flask-line text-[#1ABC9C] text-2xl"></i>
              <h1 className="text-[#2C3E50] font-heading font-bold text-xl">BioNews Digest</h1>
            </Link>
            <Link href="/news" className="text-[#1DA1F2] hover:underline">View News</Link>
          </div>
        </div>
      </header>
      
      <main className="flex-grow bg-[#ECF0F1] py-12">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h1 className="font-heading font-bold text-2xl text-[#2C3E50]">Admin Dashboard</h1>
              <p className="text-gray-600">Manage users, news feeds, and digests.</p>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'users' ? 'text-[#3498DB] border-b-2 border-[#3498DB]' : 'text-gray-600 hover:text-[#3498DB]'}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="ri-user-line mr-2"></i> Users
              </button>
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'news' ? 'text-[#3498DB] border-b-2 border-[#3498DB]' : 'text-gray-600 hover:text-[#3498DB]'}`}
                onClick={() => setActiveTab('news')}
              >
                <i className="ri-newspaper-line mr-2"></i> News
              </button>
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'feeds' ? 'text-[#3498DB] border-b-2 border-[#3498DB]' : 'text-gray-600 hover:text-[#3498DB]'}`}
                onClick={() => setActiveTab('feeds')}
              >
                <i className="ri-rss-line mr-2"></i> Feeds
              </button>
              <button 
                className={`flex-1 py-4 text-center font-medium ${activeTab === 'digests' ? 'text-[#3498DB] border-b-2 border-[#3498DB]' : 'text-gray-600 hover:text-[#3498DB]'}`}
                onClick={() => setActiveTab('digests')}
              >
                <i className="ri-mail-line mr-2"></i> Digests
              </button>
            </div>
            
            {/* Tab Content */}
            <div className="p-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-semibold text-xl text-[#2C3E50]">Registered Users</h2>
                    <span className="bg-[#3498DB] text-white px-3 py-1 rounded-full text-sm">{users?.length || 0} users</span>
                  </div>
                  
                  {usersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
                    </div>
                  ) : users && users.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {user.isVerified ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Verified
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                    Unverified
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(new Date(user.createdAt))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <i className="ri-user-add-line text-gray-400 text-4xl mb-2"></i>
                        <p className="text-gray-500">No users registered yet</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* News Tab */}
              {activeTab === 'news' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-semibold text-xl text-[#2C3E50]">Recent News Items</h2>
                    <button 
                      className="bg-[#1ABC9C] hover:bg-[#48C9B0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 inline-flex items-center"
                      onClick={() => fetchNewsMutation.mutate()}
                      disabled={fetchNewsMutation.isPending}
                    >
                      {fetchNewsMutation.isPending ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Fetching...
                        </>
                      ) : (
                        <>
                          <i className="ri-refresh-line mr-2"></i> Fetch Latest News
                        </>
                      )}
                    </button>
                  </div>
                  
                  {newsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
                    </div>
                  ) : newsItems && newsItems.length > 0 ? (
                    <div className="space-y-4">
                      {newsItems.map((item) => (
                        <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center mb-2">
                            <span className={`text-xs font-semibold px-2 py-1 rounded mr-2 ${
                              item.category === 'FDA APPROVAL' ? 'bg-[#3498DB]/10 text-[#3498DB]' :
                              item.category === 'CLINICAL TRIAL' ? 'bg-[#1ABC9C]/10 text-[#1ABC9C]' :
                              'bg-[#2C3E50]/10 text-[#2C3E50]'
                            }`}>
                              {item.category}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(new Date(item.publishedAt))}</span>
                          </div>
                          <h3 className="font-heading font-medium text-lg text-[#2C3E50] mb-2">{item.title.replace(/<[^>]*>/g, '')}</h3>
                          <p className="text-gray-600 mb-3">{item.summary}</p>
                          <a href={item.sourceUrl} className="text-[#3498DB] hover:underline inline-flex items-center text-sm font-medium" target="_blank" rel="noopener noreferrer">
                            {new URL(item.sourceUrl).hostname.replace('www.', '')} <i className="ri-external-link-line ml-1"></i>
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <i className="ri-newspaper-line text-gray-400 text-4xl mb-2"></i>
                        <p className="text-gray-500">No news items available</p>
                        <button 
                          className="mt-4 bg-[#3498DB] hover:bg-[#2980B9] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 inline-flex items-center"
                          onClick={() => fetchNewsMutation.mutate()}
                          disabled={fetchNewsMutation.isPending}
                        >
                          <i className="ri-refresh-line mr-2"></i> Fetch News Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Feeds Tab */}
              {activeTab === 'feeds' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-semibold text-xl text-[#2C3E50]">RSS Feed Sources</h2>
                    <span className="bg-[#3498DB] text-white px-3 py-1 rounded-full text-sm">{feedSources?.length || 0} sources</span>
                  </div>
                  
                  <div className="mb-8 bg-[#ECF0F1] p-4 rounded-lg">
                    <h3 className="font-heading font-medium text-lg text-[#2C3E50] mb-4">Add New Feed Source</h3>
                    <form onSubmit={handleAddFeed} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="feedName" className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
                        <input
                          type="text"
                          id="feedName"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3498DB]"
                          placeholder="e.g., BioTech Today"
                          value={newFeed.name}
                          onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="feedUrl" className="block text-sm font-medium text-gray-700 mb-1">RSS URL</label>
                        <input
                          type="url"
                          id="feedUrl"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#3498DB]"
                          placeholder="https://example.com/rss"
                          value={newFeed.url}
                          onChange={(e) => setNewFeed({...newFeed, url: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex items-end">
                        <button 
                          type="submit"
                          className="w-full bg-[#1ABC9C] hover:bg-[#48C9B0] text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 inline-flex items-center justify-center"
                          disabled={addFeedMutation.isPending}
                        >
                          {addFeedMutation.isPending ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Adding...
                            </span>
                          ) : (
                            <>
                              <i className="ri-add-line mr-2"></i> Add Feed
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                  
                  {feedsLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
                    </div>
                  ) : feedSources && feedSources.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {feedSources.map((feed) => (
                            <tr key={feed.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{feed.name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500 truncate max-w-xs">{feed.url}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {feed.isActive ? (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                    Inactive
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button 
                                  className={`font-medium ${feed.isActive ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'} transition-colors duration-300`}
                                  onClick={() => toggleFeedMutation.mutate({ id: feed.id, isActive: !feed.isActive })}
                                  disabled={toggleFeedMutation.isPending}
                                >
                                  {feed.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <i className="ri-rss-line text-gray-400 text-4xl mb-2"></i>
                        <p className="text-gray-500">No feed sources added yet</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Digests Tab */}
              {activeTab === 'digests' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-heading font-semibold text-xl text-[#2C3E50]">Email Digests</h2>
                  </div>
                  
                  <div className="bg-[#ECF0F1] p-6 rounded-lg mb-6">
                    <h3 className="font-heading font-medium text-lg text-[#2C3E50] mb-4">Manual Digest Delivery</h3>
                    <p className="text-gray-600 mb-4">Send a digest immediately to all verified users.</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Note: Scheduled digests are sent automatically every day.</p>
                      </div>
                      <button 
                        className="bg-[#3498DB] hover:bg-[#2980B9] text-white font-medium py-2 px-6 rounded-md transition-colors duration-300 inline-flex items-center"
                        onClick={() => sendDigestMutation.mutate()}
                        disabled={sendDigestMutation.isPending}
                      >
                        {sendDigestMutation.isPending ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <i className="ri-mail-send-line mr-2"></i> Send Digest Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg">
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="font-heading font-medium text-lg text-[#2C3E50]">Scheduled Digests</h3>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                        <div>
                          <h4 className="font-medium text-[#2C3E50]">Daily Digest</h4>
                          <p className="text-sm text-gray-500">Sent every morning at 8:00 AM</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">Active</span>
                      </div>
                      
                      <p className="text-gray-500 text-sm italic">
                        The scheduler is running automatically and sending digests to all verified users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
              <Link href="/news" className="hover:text-[#1DA1F2] mr-4">News</Link>
              <Link href="/admin" className="hover:text-[#1DA1F2] mr-4">Admin</Link>
              <Link href="/" className="hover:text-[#1DA1F2]">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

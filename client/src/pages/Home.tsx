import { BioNewsSignupForm } from '@/components/BioNewsSignupForm';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="pt-6 pb-4 px-5 border-b">
        <div className="flex justify-between items-center max-w-md mx-auto w-full">
          <div className="flex items-center">
            <i className="ri-flask-line text-[#1ABC9C] text-2xl mr-2"></i>
            <h1 className="text-[#2C3E50] font-heading font-bold text-xl">BioNews Digest</h1>
          </div>
          <Link href="/news" className="text-[#1DA1F2] font-medium text-sm">
            View News
          </Link>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2 text-center">Create an account</h2>
            <p className="text-center text-gray-500 text-sm">
              Get personalized biotech news delivered to your inbox daily
            </p>
          </div>
          
          <BioNewsSignupForm />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/signin" className="text-[#1DA1F2] font-medium">Sign in</Link>
            </p>
          </div>
          
          <div className="mt-12 bg-gray-50 rounded-lg p-5">
            <h3 className="font-medium text-base mb-3">Why subscribe to BioNews Digest?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <i className="ri-check-line text-[#1ABC9C] mr-2 mt-0.5"></i>
                <span>Daily curated biotech & pharma industry news</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-[#1ABC9C] mr-2 mt-0.5"></i>
                <span>Focus on FDA approvals, clinical trials, and M&A</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-[#1ABC9C] mr-2 mt-0.5"></i>
                <span>AI-powered summaries of complex industry developments</span>
              </li>
              <li className="flex items-start">
                <i className="ri-check-line text-[#1ABC9C] mr-2 mt-0.5"></i>
                <span>Completely free, no credit card required</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-5">
        <div className="flex items-center justify-center space-x-2 pt-4 border-t">
          <i className="ri-flask-line text-gray-400 text-lg"></i>
          <p className="text-gray-500 text-sm">curated by <span className="font-semibold">BioNews</span></p>
        </div>
      </footer>
    </div>
  );
}

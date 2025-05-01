import { Link } from 'wouter';

export default function Success() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="pt-10 pb-6 px-5">
        <div className="flex justify-center items-center">
          <i className="ri-flask-line text-[#1ABC9C] text-2xl mr-2"></i>
          <h1 className="text-[#2C3E50] font-heading font-bold text-xl">BioNews Digest</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <i className="ri-check-line text-green-500 text-3xl"></i>
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Check your email</h2>
          
          <p className="text-gray-600 mb-8">
            We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
          </p>
          
          <div className="bg-blue-50 rounded-md p-4 mb-8 text-left">
            <h3 className="font-medium text-blue-800 mb-2">What happens next:</h3>
            <ul className="space-y-2 text-blue-700 text-sm">
              <li className="flex">
                <i className="ri-check-line text-blue-500 mr-2 mt-0.5"></i>
                <span>After verification, you'll receive your first news digest</span>
              </li>
              <li className="flex">
                <i className="ri-check-line text-blue-500 mr-2 mt-0.5"></i>
                <span>Daily digests will be delivered every weekday morning</span>
              </li>
            </ul>
          </div>
          
          <Link 
            href="/" 
            className="text-[#1DA1F2] font-medium"
          >
            Return to homepage
          </Link>
        </div>
      </main>
      
      <footer className="py-4 px-5 mt-8">
        <div className="flex items-center justify-center space-x-2 pb-6 border-t pt-6">
          <i className="ri-flask-line text-gray-400 text-lg"></i>
          <p className="text-gray-500 text-sm">curated by <span className="font-semibold">BioNews</span></p>
        </div>
      </footer>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export default function Verify() {
  const [, navigate] = useLocation();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Parse URL params to get token
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  
  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setIsVerifying(false);
        setError('Verification token is missing');
        return;
      }
      
      try {
        await apiRequest('POST', '/api/users/verify', { token });
        setIsVerified(true);
        toast({
          title: "Success!",
          description: "Your email has been verified. You'll start receiving news digests soon.",
        });
      } catch (err) {
        setError('Invalid or expired verification token');
        toast({
          title: "Verification Failed",
          description: "The verification link is invalid or has expired. Please try signing up again.",
          variant: "destructive"
        });
      } finally {
        setIsVerifying(false);
      }
    }
    
    verifyUser();
  }, [token, toast]);
  
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
          {isVerifying ? (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#1DA1F2] mb-4"></div>
              <h2 className="text-xl font-semibold">Verifying your email...</h2>
              <p className="text-gray-500 mt-2">This will only take a moment.</p>
            </div>
          ) : isVerified ? (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                <i className="ri-check-line text-green-500 text-3xl"></i>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Email verified</h2>
              
              <p className="text-gray-600 mb-8">
                Your email has been successfully verified. You'll start receiving biotech news digests according to your preferences.
              </p>
              
              <div className="bg-blue-50 rounded-md p-4 mb-8 text-left">
                <h3 className="font-medium text-blue-800 mb-2">What happens next:</h3>
                <ul className="space-y-2 text-blue-700 text-sm">
                  <li className="flex">
                    <i className="ri-check-line text-blue-500 mr-2 mt-0.5"></i>
                    <span>You'll receive today's news digest shortly</span>
                  </li>
                  <li className="flex">
                    <i className="ri-check-line text-blue-500 mr-2 mt-0.5"></i>
                    <span>Daily digests will be delivered every weekday morning</span>
                  </li>
                </ul>
              </div>
              
              <Link 
                href="/" 
                className="text-center text-white bg-[#1DA1F2] px-4 py-2.5 rounded-md font-medium inline-block"
              >
                Return to homepage
              </Link>
            </>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <i className="ri-error-warning-line text-red-500 text-3xl"></i>
              </div>
              
              <h2 className="text-2xl font-bold mb-4">Verification failed</h2>
              
              <p className="text-gray-600 mb-8">
                {error || 'Something went wrong during the verification process.'}
              </p>
              
              <div className="bg-red-50 rounded-md p-4 mb-8 text-left">
                <p className="text-red-700 text-sm">
                  Please try signing up again with a valid email address.
                </p>
              </div>
              
              <div className="space-x-4">
                <Link 
                  href="/" 
                  className="text-[#1DA1F2] font-medium"
                >
                  Return to homepage
                </Link>
                <Link 
                  href="/" 
                  className="text-center text-white bg-[#1DA1F2] px-4 py-2.5 rounded-md font-medium inline-block"
                >
                  Try again
                </Link>
              </div>
            </>
          )}
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

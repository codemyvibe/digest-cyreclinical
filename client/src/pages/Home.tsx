import { BioNewsSignupForm } from '@/components/BioNewsSignupForm';
import { Link } from 'wouter';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="pt-10 pb-6 px-5">
        <div className="flex justify-center items-center">
          <i className="ri-flask-line text-[#1ABC9C] text-2xl mr-2"></i>
          <h1 className="text-[#2C3E50] font-heading font-bold text-xl">BioNews Digest</h1>
        </div>
      </header>
      
      <main className="flex-grow flex flex-col items-center justify-center px-5">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-8 text-center">Create an account</h2>
          
          <BioNewsSignupForm />
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Already have an account? <Link href="/signin" className="text-[#1DA1F2] font-medium">Sign in</Link>
            </p>
          </div>
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

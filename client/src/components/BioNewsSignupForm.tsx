import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { z } from 'zod';
import { insertUserSchema } from '@shared/schema';
import { useLocation } from 'wouter';

// Extend the schema with client-side validation rules
const signupFormSchema = insertUserSchema.extend({
  termsAccepted: z.boolean().refine(val => val === true, {
    message: 'You must agree to receive the newsletter',
  }),
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

interface ErrorResponse {
  message: string;
}

export function BioNewsSignupForm() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      name: '',
      email: '',
      termsAccepted: false,
    },
  });
  
  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormValues) => {
      return apiRequest('POST', '/api/users/signup', {
        name: data.name,
        email: data.email,
      });
    },
    onSuccess: () => {
      form.reset();
      toast({
        title: "Success!",
        description: "Please check your email for a confirmation link.",
      });
      
      // Navigate to success page
      navigate('/success');
    },
    onError: (error: ErrorResponse) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign up. Please try again.",
        variant: "destructive"
      });
      setIsSubmitting(false);
    }
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    signupMutation.mutate(data);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <input 
            type="text" 
            id="name"
            className={`w-full px-3 py-3 border ${form.formState.errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
            placeholder="Sam Lee"
            {...form.register('name')}
            disabled={isSubmitting}
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
          )}
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Your email
          </label>
          <input 
            type="email" 
            id="email"
            className={`w-full px-3 py-3 border ${form.formState.errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`}
            placeholder="samlee.mobbin@gmail.com"
            {...form.register('email')}
            disabled={isSubmitting}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
        
        <div className="flex items-start space-x-2 mt-4">
          <input
            type="checkbox"
            id="termsAccepted"
            className="rounded border-gray-300 text-blue-500 mt-1"
            {...form.register('termsAccepted')}
            disabled={isSubmitting}
          />
          <label htmlFor="termsAccepted" className="text-sm text-gray-600">
            I agree to receive the BioNews Digest newsletter and accept the <a href="#" className="text-blue-500">Terms of Service</a> and <a href="#" className="text-blue-500">Privacy Policy</a>.
          </label>
        </div>
        {form.formState.errors.termsAccepted && (
          <p className="mt-1 text-xs text-red-500">{form.formState.errors.termsAccepted.message}</p>
        )}
        
        <div className="flex justify-end mt-3">
          <button 
            type="submit"
            className="text-center text-white bg-[#1DA1F2] px-3 py-2.5 rounded-md font-medium w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : 'Sign Up'}
          </button>
        </div>
      </div>
    </form>
  );
}

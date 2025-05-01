import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, requestMagicLinkMutation, verifyMagicLinkMutation, registerMutation, verifyEmailMutation } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("login");
  const [showEmailSent, setShowEmailSent] = useState(false);
  const [location] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const token = searchParams.get("token");
  const verifyToken = searchParams.get("verify");

  // Handle token from URL if present (magic link verification)
  useEffect(() => {
    if (token) {
      verifyMagicLinkMutation.mutate({ token });
    } else if (verifyToken) {
      verifyEmailMutation.mutate({ token: verifyToken });
    }
  }, [token, verifyToken, verifyMagicLinkMutation, verifyEmailMutation]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onLoginSubmit = (values: LoginFormValues) => {
    requestMagicLinkMutation.mutate(values);
    setShowEmailSent(true);
  };

  const onRegisterSubmit = (values: RegisterFormValues) => {
    registerMutation.mutate(values);
    setShowEmailSent(true);
  };

  // Redirect to home if already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">BioNews Digest</CardTitle>
            <CardDescription className="text-center">
              Access your personalized biotech news digest
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showEmailSent && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  {activeTab === "login" 
                    ? "Magic link sent! Please check your email to sign in." 
                    : "Registration successful! Please check your email to verify your account."}
                </AlertDescription>
              </Alert>
            )}

            {(token || verifyToken) && (verifyMagicLinkMutation.isPending || verifyEmailMutation.isPending) && (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                <p className="text-lg font-medium text-gray-700">
                  {verifyToken ? "Verifying your email..." : "Signing you in..."}
                </p>
              </div>
            )}

            {!(showEmailSent || token || verifyToken) && (
              <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue="login">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="pt-4">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="your@email.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={requestMagicLinkMutation.isPending}
                      >
                        {requestMagicLinkMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending login link...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send me a login link
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                <TabsContent value="register" className="pt-4">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Registering...
                          </>
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <p className="text-center text-sm text-gray-500">
              By signing up, you agree to receive personalized biotech news updates.
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Hero Section */}
      <div className="hidden lg:block lg:w-1/2 bg-blue-600 p-12 text-white">
        <div className="h-full flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-6">Stay Ahead in Biotech</h1>
          <p className="text-xl mb-8">
            BioNews Digest delivers personalized, AI-powered summaries of critical developments in the biotech and pharma industries.
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-blue-500 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Curated news from top industry sources</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-blue-500 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>AI-powered summarization and importance scoring</span>
            </li>
            <li className="flex items-start">
              <div className="mr-2 mt-1 bg-blue-500 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Daily email digests tailored to your interests</span>
            </li>
          </ul>
          <p className="italic">
            "BioNews Digest has become an essential part of my daily routine. It helps me stay informed without spending hours reading through news sites."
          </p>
          <p className="mt-2 font-semibold">— Dr. Sarah Chen, Biotech Research Lead</p>
        </div>
      </div>
    </div>
  );
}
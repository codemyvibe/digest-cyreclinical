import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if user is already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to log in",
          variant: "destructive",
        });
      },
    });
  };

  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to register",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* Form Column */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-5">
        <div className="max-w-md w-full">
          <div className="mb-6 text-center">
            <div className="flex justify-center mb-2">
              <i className="ri-flask-line text-[#1ABC9C] text-3xl"></i>
            </div>
            <h2 className="text-2xl font-heading font-bold">{isLogin ? "Sign In" : "Create Account"}</h2>
            <p className="text-gray-600 mt-1">
              {isLogin ? "Access your BioNews Digest account" : "Join BioNews Digest for personalized updates"}
            </p>
          </div>

          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div>
                <label htmlFor="login-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="login-username"
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md"
                  {...loginForm.register("username")}
                />
                {loginForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md"
                  {...loginForm.register("password")}
                />
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1ABC9C] text-white font-medium rounded-md"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  id="register-username"
                  type="text"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md"
                  {...registerForm.register("username")}
                />
                {registerForm.formState.errors.username && (
                  <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="register-password"
                  type="password"
                  className="w-full px-3 py-3 border border-gray-300 rounded-md"
                  {...registerForm.register("password")}
                />
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-500">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#1ABC9C] text-white font-medium rounded-md"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating account..." : "Create Account"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-[#1ABC9C] hover:underline text-sm font-medium"
            >
              {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>

      {/* Hero Column */}
      <div className="hidden md:flex md:w-1/2 bg-[#2C3E50] text-white p-10 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-4">BioNews Digest</h1>
          <p className="text-xl mb-6">Your personalized biotech and pharma news service</p>
          
          <div className="space-y-4 mb-8">
            <div className="flex items-start">
              <i className="ri-check-line text-[#1ABC9C] text-xl mr-2 mt-0.5"></i>
              <div>
                <h3 className="font-medium">AI-Powered Summaries</h3>
                <p className="text-gray-300">Get concise, accurate summaries of complex biotech developments</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-check-line text-[#1ABC9C] text-xl mr-2 mt-0.5"></i>
              <div>
                <h3 className="font-medium">Curated Content</h3>
                <p className="text-gray-300">We filter through thousands of sources to deliver what matters most</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <i className="ri-check-line text-[#1ABC9C] text-xl mr-2 mt-0.5"></i>
              <div>
                <h3 className="font-medium">Personalized Delivery</h3>
                <p className="text-gray-300">Regular digests delivered straight to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
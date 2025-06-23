import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

export function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const { login } = useAuthStore();
  const navigate = useNavigate();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast.success(`${provider} login will be implemented soon!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex">
      {/* Right Column */}
      
      {/* <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 text-6xl text-red-400 transform rotate-12">
            🌹
          </div>
          <div className="absolute top-32 right-20 text-5xl text-orange-400 transform -rotate-45">
            🌺
          </div>
          <div className="absolute top-64 left-32 text-7xl text-pink-400 transform rotate-45">
            🌸
          </div>
          <div className="absolute bottom-40 right-16 text-8xl text-yellow-400 transform -rotate-12">
            🌻
          </div>
          <div className="absolute bottom-20 left-20 text-6xl text-purple-400 transform rotate-30">
            🌷
          </div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-blue-400 transform -rotate-30">
            🌼
          </div>
          <div className="absolute top-1/3 right-1/3 text-5xl text-green-400 transform rotate-60">
            🍃
          </div>
          <div className="absolute bottom-1/3 left-1/2 text-3xl text-indigo-400 transform -rotate-15">
            🌿
          </div>
        </div>

        <div className="absolute inset-0 bg-black/40"></div>

        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-8 z-10">
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Health Hacked
            </h3>
            <p className="text-xl opacity-90 max-w-md leading-relaxed">
              Your journey to better health starts here. Track, monitor, and
              improve your wellness with AI-powered insights.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-white/40 rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-white/60 rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>

        
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/20 to-transparent rounded-full blur-3xl"></div>
      </div> */}
      
      {/* Left Column */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 mt-10">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex justify-center">
                      <Heart className="h-12 w-12 text-purple-600" />
                    </div>
            <h2 className="mt-4 text-3xl font-bold text-white text-center mb-2">
              Login 
            </h2>
            <p className="mt-3 text-white mb-2 text-center">
              Today is a new day. It's your day. You shape it.
            </p>
            <p className="text-white mb-8 text-center">
              Sign in to start managing your health journey.
            </p>
          </div>
          <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 text-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 bg-gray-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                placeholder="Example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleInputChange}
                className="appearance-none block w-full px-3 py-2 bg-gray-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none"
                placeholder="At least 8 characters"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          </Card>
          

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-900 text-white">Or</span>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-white">
            Don't you have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-purple-600 hover:text-purple-700"
            >
              Sign up
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-gray-400">
            © 2025 ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </div>
  );
}

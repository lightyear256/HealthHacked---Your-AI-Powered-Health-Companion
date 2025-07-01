// File: frontend/src/pages/Register.tsx
// REPLACE THE EXISTING FILE COMPLETELY

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

import { Eye, Heart, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export function Register() {
  const [isLoading, setIsLoading] = useState(false);
  const [pass, setPass] = useState(false);
  const [pass2, setPass2] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { register: registerUser } = useAuthStore();
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
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-10">
        <div className="flex justify-center">
          <Heart className="h-12 w-12 text-purple-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-white">
          Create your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 text-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium ">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 bg-gray-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium ">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none block w-full px-3 py-2 bg-gray-800 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium ">
                Password
              </label>
              <div className="mt-1">
                <div className="flex justify-end items-center relative">
                  <input
                    id="password"
                    name="password"
                    type={pass2 ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none bg-gray-800 block w-full px-3 py-2  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Create a password"
                  />
                  {pass2 ? (
                    <Eye
                      className="absolute right-5"
                      onClick={() => {
                        setPass2(!pass2);
                      }}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-5"
                      onClick={() => {
                        setPass2(!pass2);
                      }}
                    />
                  )}
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <div className="flex justify-end items-center relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={pass ? "text" : "password"}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none bg-gray-800 block w-full px-3 py-2  rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500"
                    placeholder="Confirm your password"
                  />
                  {pass ? (
                    <Eye
                      className="absolute right-5"
                      onClick={() => {
                        setPass(!pass);
                      }}
                    />
                  ) : (
                    <EyeOff
                      className="absolute right-5"
                      onClick={() => {
                        setPass(!pass);
                      }}
                    />
                  )}
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                disabled={isLoading}
                variant="primary"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none disabled:opacity-50"
              >
                {isLoading ? "Creating account..." : "Create account"}
              </Button>
            </div>
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
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-purple-600 hover:text-purple-700"
          >
            Login in
          </Link>
        </p>
        <p className="mt-4 text-center text-xs text-gray-400">
          © 2025 ALL RIGHTS RESERVED
        </p>
      </div>
    </div>
  );
}

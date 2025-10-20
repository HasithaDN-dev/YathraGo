"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import Cookies from "js-cookie";

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Send login creadentials
      const response = await fetch("http://localhost:3000/auth-web/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "Login failed. Please try again." });
        setIsLoading(false);
        return;
      }
      if (data.access_token) {
        Cookies.set("access_token", data.access_token, { expires: 7 }); // expires in 7 days
        
        // Decode JWT token to extract user information
        try {
          const payload = data.access_token.split('.')[1];
          const decodedData = JSON.parse(atob(payload));
          
          // Create user object from JWT payload
          const user = {
            id: decodedData.sub,
            email: decodedData.email,
            role: decodedData.role,
            username: formData.email.split('@')[0], // fallback username from email
          };
          
          localStorage.setItem("user", JSON.stringify(user));
        } catch (error) {
          console.error("Failed to decode JWT token:", error);
        }
      }

      console.log(data.access_token);

      if (onSubmit) {
        onSubmit(formData.email, formData.password);
      } else {
        // Default behavior - redirect to website root using Next router
        try {
          router.push('/');
        } catch {
          // fallback to full reload if router fails
          window.location.href = '/';
        }
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-[var(--color-deep-navy)] font-medium">
          Email Address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            className={`pl-10 ${errors.email ? "border-[var(--error-red)]" : ""}`}
            disabled={isLoading}
          />
        </div>
        {errors.email && (
          <p className="text-[var(--error-red)] text-sm">{errors.email}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-[var(--color-deep-navy)] font-medium">
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            className={`pl-10 pr-10 ${errors.password ? "border-[var(--error-red)]" : ""}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] hover:text-[var(--color-deep-navy)]"
            disabled={isLoading}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[var(--error-red)] text-sm">{errors.password}</p>
        )}
      </div>

      {/* Forgot Password */}
      <div className="text-right">
        <Link
          href="/forgot-password"
          className="text-sm text-[var(--bright-orange)] hover:text-[var(--warm-yellow)] transition-colors"
        >
          Forgot your password?
        </Link>
      </div>


      {/* General Error */}
      {errors.general && (
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border border-[var(--error-red)]/20 p-4 animate-in fade-in duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--error-red)]/5 to-transparent"></div>
          <div className="relative flex items-center justify-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[var(--error-red)]" />
              </div>
            </div>
            <p className="text-[var(--error-red)] text-sm font-medium text-center leading-relaxed">
              {errors.general}
            </p>
          </div>
        </div>
      )}


      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-semibold py-3"
        disabled={isLoading}
      >
        {isLoading ? "Signing In..." : "Sign In"}
      </Button>

      {/* Sign Up Link */}
      <div className="text-center text-sm text-[var(--neutral-gray)]">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)] font-medium transition-colors"
        >
          Sign up here
        </Link>
      </div>
    </form>
  );
}

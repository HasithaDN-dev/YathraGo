"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import Link from "next/link";

interface SignupFormProps {
  onSubmit?: (data: {
    name: string;
    email: string;
    //phone: string;
    password: string;
    confirmPassword: string;
  }) => void;
}

export default function SignupForm({ onSubmit }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    //phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Username is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    // if (!formData.phone) {
    //   newErrors.phone = "Phone number is required";
    // } else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) {
    //   newErrors.phone = "Please enter a valid phone number";
    // }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      // Send signup request to backend
      const response = await fetch("http://localhost:3000/auth-web/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        // Backend error (e.g., credentials taken)
        setErrors({ general: data.message || "Signup failed. Please try again." });
        setIsLoading(false);
        return;
      }
      // // Save JWT token to localStorage
      // if (data.access_token) {
      //   localStorage.setItem("access_token", data.access_token);
      // }
      
      // Call onSubmit if provided
      if (onSubmit) {
        onSubmit(formData);
      } else {
        // Redirect to dashboard or login
        window.location.href = "/login";
      }
    } catch (error) {
      setErrors({ general: "Network error. Please try again." });
      console.error("Signup error:", error);
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
      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-[var(--color-deep-navy)] font-medium">
          Username
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
          <Input
            id="name"
            type="text"
            placeholder="Enter your username"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`pl-10 ${errors.name ? "border-[var(--error-red)]" : ""}`}
            disabled={isLoading}
          />
        </div>
        {errors.name && (
          <p className="text-[var(--error-red)] text-sm">{errors.name}</p>
        )}
      </div>

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

      {/* Phone Field */}
      {/* <div className="space-y-2">
        <Label htmlFor="phone" className="text-[var(--color-deep-navy)] font-medium">
          Phone Number
        </Label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
          <Input
            id="phone"
            type="tel"
            placeholder="+91 98765 43210"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            className={`pl-10 ${errors.phone ? "border-[var(--error-red)]" : ""}`}
            disabled={isLoading}
          />
        </div>
        {errors.phone && (
          <p className="text-[var(--error-red)] text-sm">{errors.phone}</p>
        )}
      </div> */}

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
            placeholder="Create a strong password"
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

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-[var(--color-deep-navy)] font-medium">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-4 h-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            className={`pl-10 pr-10 ${errors.confirmPassword ? "border-[var(--error-red)]" : ""}`}
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] hover:text-[var(--color-deep-navy)]"
            disabled={isLoading}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="text-[var(--error-red)] text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      {/* Terms and Conditions */}
      <div className="text-sm text-[var(--neutral-gray)]">
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)]">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)]">
          Privacy Policy
        </Link>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-semibold py-3"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
      {/* Error Message */}
      {errors.general && (
        <div className="text-[var(--error-red)] text-center text-sm mt-2">{errors.general}</div>
      )}

      {/* Login Link */}
      <div className="text-center text-sm text-[var(--neutral-gray)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-[var(--bright-orange)] hover:text-[var(--warm-yellow)] font-medium transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
}

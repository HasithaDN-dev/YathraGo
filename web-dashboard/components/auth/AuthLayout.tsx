import { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  showBackButton = true 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-deep-navy)] to-[var(--light-navy)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        {showBackButton && (
          <div className="mb-6 mt-10">
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 p-2"
              asChild
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* YathraGo Logo */}
          <div className="flex justify-center mb-4">
            <Image src="/Logo.svg" alt="YathraGo Logo" width={120} height={48} className="h-12 w-auto" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--color-deep-navy)] mb-2">
              {title}
            </h2>
            <p className="text-[var(--neutral-gray)]">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/80 text-sm">
          <p>&copy; 2025 YathraGo. Safe travels, every day.</p>
        </div>
      </div>
    </div>
  );
}

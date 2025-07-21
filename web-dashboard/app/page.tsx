import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  Shield,
  Calendar,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin as Location,
  Download,
  School,
  Building,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-[var(--color-deep-navy)] text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Safe & Reliable Transport for{" "}
              <span className="text-[var(--warm-yellow)]">Schools & Offices</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--light-gray)] mb-8 leading-relaxed">
              Connect with verified vehicle owners for safe school and office transport. 
              Monthly plans with GPS tracking and professional drivers.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[var(--neutral-gray)] w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for vehicles, routes, or locations..."
                  className="w-full pl-12 pr-4 py-4 rounded-lg text-[var(--black)] focus:ring-2 focus:ring-[var(--warm-yellow)] focus:border-transparent"
                />
                <Button className="absolute right-2 top-2 bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-semibold">
                  Find a Vehicle
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-semibold px-8 py-3 text-lg">
                Find a Vehicle
              </Button>
              <Button 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)] px-8 py-3 text-lg"
                asChild
              >
                <Link href="/login">Owner Login</Link>
              </Button>
            </div>

            {/* App Download Links */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)]">
                <Download className="w-5 h-5 mr-2" />
                Download on Google Play
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)]">
                <Download className="w-5 h-5 mr-2" />
                Download on App Store
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose YathraGo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--color-deep-navy)] mb-6">
              Why Choose YathraGo Transport?
            </h2>
            <p className="text-xl text-[var(--neutral-gray)] max-w-3xl mx-auto">
              We provide comprehensive transport solutions designed specifically for educational institutions 
              and corporate offices, ensuring safety, reliability, and convenience for all passengers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* School Transport */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[var(--light-gray)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <School className="w-8 h-8 text-[var(--bright-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-3">School Transport</h3>
                <p className="text-[var(--neutral-gray)]">
                  Daily school transport with trained drivers who prioritize child safety and punctuality.
                </p>
              </CardContent>
            </Card>

            {/* Office Transport */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[var(--light-gray)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-[var(--bright-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-3">Office Transport</h3>
                <p className="text-[var(--neutral-gray)]">
                  Comfortable commute solutions for employees with flexible pickup and drop-off points.
                </p>
              </CardContent>
            </Card>

            {/* Monthly Plans */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[var(--light-gray)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-[var(--bright-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-3">Monthly Plans</h3>
                <p className="text-[var(--neutral-gray)]">
                  Affordable monthly packages with flexible scheduling to meet your specific needs.
                </p>
              </CardContent>
            </Card>

            {/* Safety First */}
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-[var(--light-gray)] rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-[var(--bright-orange)]" />
                </div>
                <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-3">Safety First</h3>
                <p className="text-[var(--neutral-gray)]">
                  Verified drivers with background checks and strict safety protocols for peace of mind.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Safety & Trust Section */}
      <section className="py-20 bg-[var(--light-gray)]">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--color-deep-navy)] mb-6">
              Safety & Trust You Can Count On
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--warm-yellow)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[var(--color-deep-navy)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-2">
                    Background Verified Drivers
                  </h3>
                  <p className="text-[var(--neutral-gray)]">
                    All our drivers undergo thorough background checks and verification processes to ensure passenger safety.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--warm-yellow)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[var(--color-deep-navy)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-2">
                    Real-time GPS Tracking
                  </h3>
                  <p className="text-[var(--neutral-gray)]">
                    Track your vehicle in real-time and get live updates on pickup times and route progress.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-[var(--warm-yellow)] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-[var(--color-deep-navy)]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[var(--color-deep-navy)] mb-2">
                    Well-maintained Vehicles
                  </h3>
                  <p className="text-[var(--neutral-gray)]">
                    Regular maintenance checks and safety inspections ensure all vehicles meet high safety standards.
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Card */}
            <Card className="p-8 shadow-lg">
              <CardContent className="text-center">
                <div className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-[var(--bright-orange)] mb-2">10,000+</div>
                    <p className="text-[var(--neutral-gray)]">Happy Students & Professionals</p>
                  </div>
                  
                  <div>
                    <div className="text-4xl font-bold text-[var(--bright-orange)] mb-2">500+</div>
                    <p className="text-[var(--neutral-gray)]">Schools & Offices Served</p>
                  </div>
                  
                  <div>
                    <div className="text-4xl font-bold text-[var(--bright-orange)] mb-2">99.9%</div>
                    <p className="text-[var(--neutral-gray)]">On-time Performance</p>
                  </div>

                  <div className="flex justify-center space-x-1 pt-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-[var(--warm-yellow)] fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--neutral-gray)]">Trusted by thousands of families</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-[var(--color-deep-navy)] text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Transport Journey?
          </h2>
          <p className="text-xl text-[var(--light-gray)] mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust YathraGo for their daily transport needs. 
            Whether you&apos;re looking for a ride or want to become a vehicle owner, we&apos;ve got you covered.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-[var(--bright-orange)] hover:bg-[var(--warm-yellow)] text-[var(--black)] font-semibold px-8 py-3 text-lg">
              Find a Vehicle
            </Button>
            <Button 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)] px-8 py-3 text-lg"
              asChild
            >
              <Link href="/signup">Become an Owner</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-[var(--color-deep-navy)] text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold mb-4">YathraGo</h3>
              <p className="text-[var(--light-gray)] mb-4">
                Safe and reliable transport solutions for schools and offices. 
                Connecting passengers with verified vehicle owners across India.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)]">
                  <Download className="w-4 h-4 mr-2" />
                  Customer App
                </Button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-[var(--light-gray)]">
                <li><Link href="#" className="hover:text-white transition-colors">School Transport</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Office Transport</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Monthly Plans</Link></li>
                <li><Link href="/owner" className="hover:text-white transition-colors">Owner Dashboard</Link></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-[var(--light-gray)]">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@yathrago.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Location className="w-4 h-4" />
                  <span>Bangalore, Karnataka, India</span>
                </div>
              </div>
            </div>

            {/* App Downloads & Legal */}
            <div>
              <h4 className="text-lg font-semibold mb-4">Download Apps</h4>
              <div className="space-y-2 mb-6">
                <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)]">
                  <Download className="w-4 h-4 mr-2" />
                  Driver App - Play Store
                </Button>
                <Button variant="outline" size="sm" className="w-full border-white text-white hover:bg-white hover:text-[var(--color-deep-navy)]">
                  <Download className="w-4 h-4 mr-2" />
                  Driver App - App Store
                </Button>
              </div>

              <h5 className="font-semibold mb-2">Legal</h5>
              <ul className="space-y-1 text-sm text-[var(--light-gray)]">
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Safety Guidelines</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[var(--neutral-gray)] mt-12 pt-8 text-center text-[var(--light-gray)]">
            <p>&copy; 2025 YathraGo. All rights reserved. Safe travels, every day.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

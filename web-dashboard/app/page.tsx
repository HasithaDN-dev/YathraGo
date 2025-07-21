import { Search, MapPin, Users, FileText, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[600px] pt-16 pb-20 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/heropage.svg')"
        }}
      >
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-full">
            {/* Centered Content */}
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <div className="space-y-6">
                <h1 className="font-bold text-white leading-tight drop-shadow-lg">
                  <div className="text-3xl lg:text-4xl xl:text-5xl">Smart Transport Services System</div>
                  <br />
                  <span className="text-orange-400 text-4xl lg:text-5xl xl:text-6xl">YathraGo</span>
                </h1>
                <p className="text-xl lg:text-2xl text-white/90 leading-relaxed max-w-3xl mx-auto drop-shadow-md">
                  Revolutionize your fleet operations with real-time tracking, intelligent driver assignment, and comprehensive digital logistics management.
                </p>
              </div>
              
              {/* Search Bar */}
              <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 flex items-center max-w-2xl mx-auto">
                <Search className="h-6 w-6 text-gray-400 ml-4" />
                <input
                  type="text"
                  placeholder="Search vehicles, routes, or drivers"
                  className="flex-1 px-4 py-3 text-gray-700 placeholder-gray-400 bg-transparent border-none outline-none text-lg"
                />
                <button className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg">
                  Search
                </button>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button className="bg-orange-400 hover:bg-orange-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-colors shadow-lg hover:shadow-xl">
                  Get Started Free
                </button>
                <button className="border-2 border-white/80 text-white hover:bg-white/10 backdrop-blur-sm px-10 py-4 rounded-xl font-bold text-lg transition-colors">
                  Watch Demo
                </button>
              </div>
              
              {/* Trust Indicators */}
              <div className="pt-8">
                <p className="text-white/70 text-sm mb-4">Trusted by 100+ companies worldwide</p>
                <div className="flex justify-center items-center space-x-8 text-white/60">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">1,000+</div>
                    <div className="text-sm">Vehicles Tracked</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">500+</div>
                    <div className="text-sm">Active Drivers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">30%</div>
                    <div className="text-sm">Cost Savings</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Transport
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your fleet efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <MapPin className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Track in Real Time</h3>
              <p className="text-gray-600 mb-6">
                Monitor your entire fleet with live GPS tracking, route optimization, and instant location updates.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Live GPS tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Route optimization
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Geofencing alerts
                </li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Assign Drivers</h3>
              <p className="text-gray-600 mb-6">
                Intelligently match drivers to vehicles and routes based on availability, skills, and location.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Smart matching
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Availability tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Performance metrics
                </li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Digital Logs</h3>
              <p className="text-gray-600 mb-6">
                Maintain comprehensive digital records of all transport activities, maintenance, and compliance.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Automated logging
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Compliance reports
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Data analytics
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">1,000+</div>
              <div className="text-blue-100">Vehicles Tracked</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Active Drivers</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">100+</div>
              <div className="text-blue-100">Companies Trust Us</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-white mb-2">30%</div>
              <div className="text-blue-100">Cost Savings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Transport Operations?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of companies already using TransportHub to optimize their fleet management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-400 hover:bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Start Free Trial
            </button>
            <button className="border border-gray-300 text-gray-700 hover:bg-white px-8 py-3 rounded-lg font-semibold transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center">
        
                <span className="text-2xl font-bold">YathraGo</span>
              </div>
              <p className="text-gray-400 text-sm">
                Professional fleet management solutions for modern businesses.
              </p>
            </div>
            
            {/* About Links */}
            <div>
              <h3 className="font-semibold mb-4">About</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Our Story</a></li>
                <li><a href="#" className="hover:text-white">Team</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Help Links */}
            <div>
              <h3 className="font-semibold mb-4">Help</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
                <li><a href="#" className="hover:text-white">Support</a></li>
                <li><a href="#" className="hover:text-white">Training</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>info@yathrago.com</li>
                <li>+94 767 665 660</li>
                <li>127B Colombo 04</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2024 YathraGo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

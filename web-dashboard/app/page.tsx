import { Search, MapPin, Users, FileText, CheckCircle } from "lucide-react";
import Image from "next/image";
import LatestNotices from './components/LatestNotices';

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

      {/* Latest Notices Section */}
      <section className="py-8 bg-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Latest Notices</h2>
          </div>
          <LatestNotices />
        </div>
      </section>

  {/* Features Section */}
  <section id="features" className="py-8 scroll-mt-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Transport
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Everything you need to manage your fleet efficiently
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Track in Real Time</h3>
              <p className="text-gray-700 mb-6 text-center leading-relaxed">
                Monitor your entire fleet with live GPS tracking, route optimization, and instant location updates.
              </p>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Live GPS tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Route optimization</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Geofencing alerts</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Assign Drivers</h3>
              <p className="text-gray-700 mb-6 text-center leading-relaxed">
                Intelligently match drivers to vehicles and routes based on availability, skills, and location.
              </p>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Smart matching</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Availability tracking</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Performance metrics</span>
                </li>
              </ul>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 hover:border-blue-200 group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Digital Logs</h3>
              <p className="text-gray-700 mb-6 text-center leading-relaxed">
                Maintain comprehensive digital records of all transport activities, maintenance, and compliance.
              </p>
              <ul className="text-sm text-gray-600 space-y-3">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Automated logging</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Compliance reports</span>
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-3 flex-shrink-0" />
                  <span>Data analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

  {/* Stats Section */}
  <section className="py-8 bg-yellow-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-blue-600 mb-2">1,000+</div>
              <div className="text-gray-700 font-medium">Vehicles Tracked</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-green-600 mb-2">500+</div>
              <div className="text-gray-700 font-medium">Active Drivers</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-purple-600 mb-2">100+</div>
              <div className="text-gray-700 font-medium">Companies Trust Us</div>
            </div>
            <div>
              <div className="text-3xl lg:text-4xl font-bold text-orange-600 mb-2">30%</div>
              <div className="text-gray-700 font-medium">Cost Savings</div>
            </div>
          </div>
        </div>
      </section>

  {/* About Us and Testimonials Section */}
  <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Left Side - About Us (3/5 of the space) */}
            <div className="lg:col-span-3">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-6">
                Who We Are
              </h2>
              <div className="space-y-6">
                <p className="text-lg text-gray-700 leading-relaxed">
                  At YathraGo, we simplify daily transport for schools and offices. Designed for vehicle owners and system admins, our platform enables smooth operations through real-time tracking, automated driver assignment, and secure digital records.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We also support parents, staff, and drivers with a seamless experience they can trust—every day. Our mission is to make transport management effortless and reliable for everyone involved.
                </p>
              </div>
            </div>

            {/* Right Side - Testimonials (2/5 of the space) */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-3">
                  What Our Users Say
                </h2>
                <p className="text-gray-700">
                  Real feedback from our trusted community
                </p>
              </div>
              
              <div className="h-72 overflow-y-auto pr-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {/* Testimonial 1 */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">N</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;As a vehicle owner, YathraGo saves me hours each week. Everything is automated.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Nimal Perera</div>
                        <div className="text-xs text-gray-600">Fleet Owner</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 2 */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">S</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;I feel safer sending my child to school knowing I can track the vehicle in real time.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Shanika De Silva</div>
                        <div className="text-xs text-gray-600">Parent</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 3 */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">C</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;Managing staff transport has never been easier. The admin dashboard is brilliant.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Chamika Fernando</div>
                        <div className="text-xs text-gray-600">Office Admin</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial 4 */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">R</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;I like how drivers and routes are managed all in one place. It&apos;s efficient and secure.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Ravindra Jayasuriya</div>
                        <div className="text-xs text-gray-600">Transport Manager</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Testimonials */}
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">A</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;The real-time notifications keep me updated about my child&apos;s journey every day.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Amara Wickramasinghe</div>
                        <div className="text-xs text-gray-600">Parent</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;YathraGo has revolutionized how we manage our company transport. Highly recommended!&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Mahesh Rathnayake</div>
                        <div className="text-xs text-gray-600">HR Manager</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex-shrink-0 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-xs">T</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 mb-2 italic text-sm">
                        &ldquo;Driver assignment is so much easier now. The system handles everything automatically.&rdquo;
                      </p>
                      <div>
                        <div className="font-semibold text-gray-800 text-xs">Tharanga Silva</div>
                        <div className="text-xs text-gray-600">Operations Manager</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 bg-white">
        <div className="max-w-6xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 md:p-8 text-center border border-white/50 hover:shadow-3xl transition-all duration-500">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Transport Operations?
            </h2>
            <p className="text-lg text-gray-700 mb-6 max-w-3xl mx-auto leading-relaxed">
              Join thousands of companies already using YathraGo to optimize their fleet management and streamline operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
                Start Free Trial
              </button>
              <button className="border-2 border-gray-300 text-gray-700 hover:border-orange-400 hover:bg-orange-50 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-md">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer id="contact" className="py-12 scroll-mt-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
                <Image
                  src="/logo.svg"
                  alt="YathraGo Logo"
                  width={40}
                  height={40}
                  className="h-10 w-auto object-contain mr-2"
                  priority
                />
                {/*<span className="text-2xl font-bold text-white">YathraGo</span>*/}
                <p className="text-gray-300 text-sm">
                  Professional fleet management solutions for modern businesses.
                </p>
            </div>
            
            {/* About Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">About</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Our Story</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Team</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            
            {/* Help Links */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Help</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Training</a></li>
              </ul>
            </div>
            
            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-4 text-white">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>info@yathrago.com</li>
                <li>+94 767 665 660</li>
                <li>127B Colombo 04</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-600 mt-12 pt-8 text-center text-sm text-gray-400">
            © 2024 YathraGo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

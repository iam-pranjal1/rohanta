import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building2, Heart, TrendingUp, Users, Award, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import axios from 'axios';
import SuccessStories from '../components/SuccessStories';
import CompanyLeaderboard from '../components/CompanyLeaderboard';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Landing = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    sponsored_students: 0,
    total_companies: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="bg-white border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-marigold" />
              <span className="font-heading text-2xl font-bold text-indigo-950">EduUplift</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" className="text-indigo-950 hover:bg-amber-100 rounded-full">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 via-white to-amber-100 py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-heading text-5xl md:text-6xl font-bold text-indigo-950 mb-6 tracking-tight" data-testid="hero-heading">
                Empowering Dreams Through Education
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect underprivileged students with CSR-driven companies to fund IIT/NEET coaching. Together, we're building a brighter future.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register?type=student">
                  <Button className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 w-full sm:w-auto" data-testid="student-register-btn">
                    <GraduationCap className="mr-2 h-5 w-5" />
                    I'm a Student
                  </Button>
                </Link>
                <Link to="/register?type=company">
                  <Button className="border-2 border-indigo-950 text-indigo-950 hover:bg-indigo-950 hover:text-white font-bold rounded-full px-8 py-4 transition-all w-full sm:w-auto" data-testid="company-register-btn">
                    <Building2 className="mr-2 h-5 w-5" />
                    I'm a Company
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1686624386665-4cd01b96d0f6?w=800"
                alt="Students studying"
                className="rounded-sm shadow-2xl object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-indigo-950 text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div data-testid="stat-students">
              <div className="text-5xl font-heading font-bold text-marigold mb-2">{stats.total_students}</div>
              <div className="text-lg text-amber-100">Registered Students</div>
            </div>
            <div data-testid="stat-sponsored">
              <div className="text-5xl font-heading font-bold text-marigold mb-2">{stats.sponsored_students}</div>
              <div className="text-lg text-amber-100">Dreams Sponsored</div>
            </div>
            <div data-testid="stat-companies">
              <div className="text-5xl font-heading font-bold text-marigold mb-2">{stats.total_companies}</div>
              <div className="text-lg text-amber-100">Partner Companies</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-indigo-950 text-center mb-16" data-testid="how-it-works-heading">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all p-8">
              <div className="bg-marigold text-indigo-950 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="font-heading text-2xl font-bold text-indigo-950 mb-4">Students Register</h3>
              <p className="text-gray-600">
                Students from government schools upload their documents (Income Certificate, 10th Certificate, Aadhar) for verification.
              </p>
            </Card>

            <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all p-8">
              <div className="bg-marigold text-indigo-950 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="font-heading text-2xl font-bold text-indigo-950 mb-4">Companies Sponsor</h3>
              <p className="text-gray-600">
                CSR-driven companies browse verified student profiles and choose students to sponsor for IIT/NEET coaching.
              </p>
            </Card>

            <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-all p-8">
              <div className="bg-marigold text-indigo-950 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="font-heading text-2xl font-bold text-indigo-950 mb-4">Track Progress</h3>
              <p className="text-gray-600">
                Companies receive regular progress reports on test scores, attendance, and overall performance of sponsored students.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-gradient-to-br from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-indigo-950 mb-6">Creating Real Impact</h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Every child deserves access to quality education. With your support, we're breaking barriers and opening doors to India's top institutions.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <Heart className="h-6 w-6 text-marigold mt-1" />
                  <div>
                    <h4 className="font-semibold text-indigo-950 mb-1">Verified Students Only</h4>
                    <p className="text-gray-600">All students go through document verification to ensure authenticity.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <TrendingUp className="h-6 w-6 text-marigold mt-1" />
                  <div>
                    <h4 className="font-semibold text-indigo-950 mb-1">Track Progress</h4>
                    <p className="text-gray-600">Real-time updates on student performance and milestones.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Award className="h-6 w-6 text-marigold mt-1" />
                  <div>
                    <h4 className="font-semibold text-indigo-950 mb-1">IIT/NEET Coaching</h4>
                    <p className="text-gray-600">Focused preparation for India's most competitive exams.</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1698993081947-8a3654303904?w=800"
                alt="Student success"
                className="rounded-sm shadow-2xl object-cover h-[500px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <SuccessStories />

      {/* CTA Section */}
      <section className="py-20 bg-indigo-950 text-white">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-heading text-4xl md:text-5xl font-bold mb-6">Ready to Make a Difference?</h2>
          <p className="text-xl text-amber-100 mb-8">
            Join our platform today and be part of the educational revolution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register?type=student">
              <Button className="bg-marigold text-indigo-950 hover:bg-amber-400 font-bold rounded-full px-8 py-4 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1">
                Register as Student <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/register?type=company">
              <Button className="border-2 border-white text-white hover:bg-white hover:text-indigo-950 font-bold rounded-full px-8 py-4 transition-all">
                Register as Company <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-indigo-950 text-white py-12 border-t border-amber-500/20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <GraduationCap className="h-8 w-8 text-marigold" />
              <span className="font-heading text-2xl font-bold">EduUplift</span>
            </div>
            <div className="text-amber-100 text-center md:text-right">
              <p>Empowering dreams through CSR education funding</p>
              <p className="text-sm mt-2">© 2025 EduUplift. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Users, BarChart3, Zap, ArrowRight, CheckCircle } from 'lucide-react';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: CheckSquare,
      title: 'Kanban Boards',
      description: 'Visualize your workflow with drag-and-drop task management across customizable columns.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description: 'Invite team members, assign tasks, and track progress together in real-time.',
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Monitor project progress with detailed analytics and reporting dashboards.',
    },
    {
      icon: Zap,
      title: 'Agile Workflow',
      description: 'Built for agile teams with sprint planning, story points, and velocity tracking.',
    },
  ];

  const benefits = [
    'Streamline team communication and reduce meetings',
    'Increase productivity with clear task prioritization',
    'Track project progress with real-time dashboards',
    'Integrate with your existing development tools',
    'Scale from small teams to enterprise organizations',
    'Access from anywhere with responsive design',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">DevTasker</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Agile Board for
            <span className="text-blue-600 block">Team Productivity</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your team's workflow with our powerful Kanban boards, task management, 
            and collaboration tools. Built for agile teams who value productivity and transparency.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sign Up to Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/login"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:border-gray-400 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 px-6 py-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white text-sm ml-4">DevTasker Dashboard</span>
              </div>
            </div>
            <div className="h-96 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <div className="text-center">
                <CheckSquare className="w-24 h-24 text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">Beautiful Kanban Boards Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to manage your team
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern agile development teams
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why teams choose DevTasker
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/signup"
                  className="bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors inline-flex items-center space-x-2"
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="font-medium">To Do</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">3</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="font-medium">In Progress</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">2</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="font-medium">Done</span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">8</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to boost your team's productivity?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of teams already using DevTasker to streamline their workflow
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center space-x-2"
          >
            <span>Sign Up to Get Started</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DevTasker</span>
            </div>
            <p className="text-gray-400">
              © 2024 DevTasker. Built for agile teams who value productivity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
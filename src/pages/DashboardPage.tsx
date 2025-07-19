import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../store';
import { CheckSquare, Users, FolderKanban, Clock, TrendingUp, ArrowRight } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const projects = useSelector((state: RootState) => state.projects.projects);
  const tasks = useSelector((state: RootState) => state.tasks.tasks);
  const teams = useSelector((state: RootState) => state.teams.teams);

  const stats = [
    {
      title: 'Total Tasks',
      value: tasks.length,
      icon: CheckSquare,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Active Projects',
      value: projects.filter(p => p.status === 'active').length,
      icon: FolderKanban,
      color: 'bg-teal-500',
      change: '+5%',
    },
    {
      title: 'Team Members',
      value: teams.reduce((total, team) => total + team.members.length, 0),
      icon: Users,
      color: 'bg-orange-500',
      change: '+8%',
    },
    {
      title: 'Tasks This Week',
      value: tasks.filter(t => t.status === 'done').length,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+15%',
    },
  ];

  const recentTasks = tasks.slice(0, 5);
  const recentProjects = projects.slice(0, 3);

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'todo': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-blue-100 mb-6">
          Here's what's happening with your projects today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            to="/kanban"
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center space-x-2"
          >
            <CheckSquare className="w-5 h-5" />
            <span>View Kanban Board</span>
          </Link>
          <Link
            to="/projects"
            className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center space-x-2"
          >
            <FolderKanban className="w-5 h-5" />
            <span>Manage Projects</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last week</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
              <Link
                to="/kanban"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Active Projects</h3>
              <Link
                to="/projects"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center space-x-1"
              >
                <span>View all</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {recentProjects.map((project) => (
                <div key={project.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{project.name}</h4>
                    <span className="text-sm text-gray-500">{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Users className="w-3 h-3" />
                    <span>{project.members.length} members</span>
                    <Clock className="w-3 h-3 ml-2" />
                    <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/kanban"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
          >
            <CheckSquare className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-700">Create Task</p>
          </Link>
          <Link
            to="/projects"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-colors text-center group"
          >
            <FolderKanban className="w-8 h-8 text-gray-400 group-hover:text-teal-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-teal-700">New Project</p>
          </Link>
          <Link
            to="/teams"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center group"
          >
            <Users className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-orange-700">Invite Member</p>
          </Link>
          <Link
            to="/profile"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group"
          >
            <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-700">View Reports</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
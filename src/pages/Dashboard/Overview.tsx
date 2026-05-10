import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  BarChart3,
  TrendingUp,
  Target,
  Shield,
  ArrowRight,
  Folder,
  Users
} from 'lucide-react';
import { taskService, projectService } from '../../services/api';
import { Skeleton } from '../../components/Skeleton';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

const Overview: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{tasks: any[], projects: any[]}>({ tasks: [], projects: [] });
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    projects: 0
  });
  const [chartData, setChartData] = useState({
    bar: [
      { name: 'Mon', tasks: 0 },
      { name: 'Tue', tasks: 0 },
      { name: 'Wed', tasks: 0 },
      { name: 'Thu', tasks: 0 },
      { name: 'Fri', tasks: 0 },
      { name: 'Sat', tasks: 0 },
      { name: 'Sun', tasks: 0 },
    ],
    pie: [
      { name: 'Todo', value: 0, color: '#94a3b8' },
      { name: 'In Progress', value: 0, color: '#3b82f6' },
      { name: 'Completed', value: 0, color: '#10b981' },
    ]
  });

  const [dbConnected, setDbConnected] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const health = await fetch('/api/health').then(r => r.json());
        setDbConnected(health.db === 'connected');

        const [tasksRes, projectsRes] = await Promise.all([
          taskService.getAll(),
          projectService.getAll()
        ]);
        
        const tasks = tasksRes.data.tasks || [];
        const projects = projectsRes.data.projects || [];
        
        setData({ tasks, projects });

        const total = tasks.length;
        const completed = tasks.filter((t: any) => t.status === 'completed').length;
        const inProgress = tasks.filter((t: any) => t.status === 'in-progress').length;
        const todo = tasks.filter((t: any) => t.status === 'todo').length;

        setStats({
          totalTasks: total,
          completedTasks: completed,
          pendingTasks: total - completed,
          overdueTasks: tasks.filter((t: any) => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'completed').length,
          projects: projects.length
        });

        // Calculate Pie Data
        if (total > 0) {
          setChartData(prev => ({
            ...prev,
            pie: [
              { name: 'Todo', value: Math.round((todo / total) * 100), color: '#94a3b8' },
              { name: 'In Progress', value: Math.round((inProgress / total) * 100), color: '#3b82f6' },
              { name: 'Completed', value: Math.round((completed / total) * 100), color: '#10b981' },
            ]
          }));
        }

        // Calculate Bar Data
        const dayTasks = [0, 0, 0, 0, 0, 0, 0];
        tasks.forEach((t: any) => {
          const date = t.createdAt ? new Date(t.createdAt) : new Date();
          const day = date.getDay();
          const index = day === 0 ? 6 : day - 1;
          dayTasks[index]++;
        });

        const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        setChartData(prev => ({
          ...prev,
          bar: weekDays.map((name, i) => ({ name, tasks: dayTasks[i] }))
        }));

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsCards = [
    { label: 'Total Tasks', value: stats.totalTasks, icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5%' },
    { label: 'Completed', value: stats.completedTasks, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+10%' },
    { label: 'Pending', value: stats.pendingTasks, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', trend: '-2%' },
    { label: 'Overdue', value: stats.overdueTasks, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: '0%' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div>
        <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">System Overview</h2>
        <p className="text-slate-500">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm hover:border-brand-primary/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={cn("p-2 sm:p-3 rounded-xl sm:rounded-2xl group-hover:scale-110 transition-transform", card.bg)}>
                <card.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", card.color)} />
              </div>
              <span className={cn(
                "text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                card.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-xl sm:text-3xl font-bold text-slate-900 font-display">{card.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productivity Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-brand-primary" />
              <h3 className="text-lg font-bold text-slate-900">Task Performance</h3>
            </div>
            <select className="bg-slate-50 border-none rounded-lg text-xs font-medium px-3 py-1.5 focus:ring-2 focus:ring-brand-primary/20">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-64 cursor-default w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.bar} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Status Distribution Pie Chart */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-8">
            <Target className="w-5 h-5 text-brand-secondary" />
            <h3 className="text-lg font-bold text-slate-900">Overall Status</h3>
          </div>
          <div className="h-64 relative w-full" style={{ minHeight: '256px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.pie}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.pie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{stats.totalTasks}</span>
              <span className="text-xs text-slate-400">Total</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            {chartData.pie.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm font-medium text-slate-600">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Active Projects & Recent Tasks */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Active Projects</h3>
            <Link to="/projects" className="text-sm font-bold text-brand-primary hover:underline flex items-center gap-1">
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {data.projects.slice(0, 3).map((project, i) => (
              <Link key={project._id || i} to={`/tasks/${project._id || 'default'}`} className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-50">
                    {['🚀', '🎨', '📊', '⚡️', '🌟'][i % 5]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{project.title}</h4>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Project Workspace</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
            {data.projects.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm font-medium">No projects yet</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-5 sm:p-8 rounded-3xl sm:rounded-[40px] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-900">Recent Tasks</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold uppercase tracking-wider">High Priority</button>
            </div>
          </div>
          <div className="space-y-4">
            {data.tasks.slice(0, 3).map((task, i) => (
              <div key={task._id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white transition-all cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    task.status === 'todo' ? "bg-amber-400" : task.status === 'in-progress' ? "bg-indigo-400" : "bg-emerald-400"
                  )} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-brand-primary transition-colors">{task.title}</h4>
                    <p className="text-[10px] font-medium text-slate-400">{task.priority.toUpperCase()} priority</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                  task.status === 'todo' ? "bg-amber-50 text-amber-600" : task.status === 'in-progress' ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {task.status}
                </div>
              </div>
            ))}
            {data.tasks.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm font-medium">No recent tasks</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Overview;

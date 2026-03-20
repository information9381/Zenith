import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  Activity,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Task, Status } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function Dashboard({ tasks, onUpdateTask, onDeleteTask }: DashboardProps) {
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Completed', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: pendingTasks.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'High Priority', value: highPriorityTasks.length, icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const efficiency = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Prepare chart data
  const chartData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#64748b' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#f59e0b' },
    { name: 'Completed', value: completedTasks.length, color: '#10b981' },
  ];

  return (
    <div className="p-8 space-y-8 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-zinc-500 mt-1">Welcome back to your productivity hub.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-4 h-4" />
          <span className="text-sm font-semibold">{efficiency}% Efficiency</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <h3 className="text-4xl font-bold tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Weekly Productivity</h3>
                <p className="text-sm text-zinc-500">Tasks completed vs total assigned</p>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#71717a" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#f4f4f5' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-8 bg-zinc-900 rounded-3xl border border-zinc-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Pending Tasks</h3>
                <p className="text-sm text-zinc-500">Quickly move tasks to the next stage</p>
              </div>
            </div>
            <div className="space-y-4">
              {pendingTasks.length > 0 ? (
                pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 flex items-center justify-between group hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${task.status === 'todo' ? 'bg-zinc-600' : 'bg-amber-500'}`} />
                      <div>
                        <p className="text-sm font-semibold text-zinc-100">{task.title}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{task.status.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          const nextStatus = task.status === 'todo' ? 'in-progress' : 'completed';
                          onUpdateTask(task.id, { status: nextStatus });
                        }}
                        className="p-2 hover:bg-emerald-500/10 text-zinc-500 hover:text-emerald-400 rounded-xl transition-all flex items-center gap-2 group/btn"
                      >
                        <span className="text-[10px] font-bold uppercase opacity-0 group-hover/btn:opacity-100 transition-opacity">Move to {task.status === 'todo' ? 'Progress' : 'Done'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDeleteTask(task.id)}
                        className="p-2 hover:bg-rose-500/10 text-zinc-700 hover:text-rose-500 rounded-xl transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-zinc-600">
                  <p className="text-sm font-medium">All caught up! No pending tasks.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

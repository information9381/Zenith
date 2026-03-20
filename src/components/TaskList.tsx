import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { Task, Priority, Status } from '../types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: () => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskList({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'high': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'todo': return <AlertCircle className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="p-8 space-y-6 bg-zinc-950 min-h-screen text-zinc-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
          <p className="text-zinc-500 mt-1">{tasks.length} tasks in total</p>
        </div>
        <button 
          onClick={onAddTask}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
            className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:border-emerald-500/50 transition-all text-zinc-300"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800 bg-zinc-900/50 text-xs font-bold text-zinc-500 uppercase tracking-widest">
          <div className="col-span-6 md:col-span-7">Task</div>
          <div className="col-span-3 md:col-span-2 text-center">Priority</div>
          <div className="col-span-3 md:col-span-2 text-center">Status</div>
          <div className="hidden md:block md:col-span-1 text-right">Actions</div>
        </div>

        <div className="divide-y divide-zinc-800/50">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="grid grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-zinc-800/30 transition-colors group">
                <div className="col-span-6 md:col-span-7 flex items-center gap-4">
                  <button 
                    onClick={() => onUpdateTask(task.id, { status: task.status === 'completed' ? 'todo' : 'completed' })}
                    className={cn(
                      "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300",
                      task.status === 'completed' 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-zinc-700 hover:border-emerald-500/50 text-transparent"
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <div className="min-w-0">
                    <h4 className={cn(
                      "font-semibold truncate transition-all duration-300",
                      task.status === 'completed' ? "text-zinc-500 line-through" : "text-zinc-100"
                    )}>
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-sm text-zinc-500 truncate mt-0.5">{task.description}</p>
                    )}
                  </div>
                </div>

                <div className="col-span-3 md:col-span-2 flex justify-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    getPriorityColor(task.priority)
                  )}>
                    {task.priority}
                  </span>
                </div>

                <div className="col-span-3 md:col-span-2 flex justify-center items-center gap-2">
                  {getStatusIcon(task.status)}
                  <span className="text-xs font-medium text-zinc-400 capitalize">{task.status.replace('-', ' ')}</span>
                </div>

                <div className="hidden md:flex md:col-span-1 justify-end">
                  <button 
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-800 rounded-3xl flex items-center justify-center mx-auto text-zinc-600">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <p className="text-zinc-400 font-semibold">No tasks found</p>
                <p className="text-sm text-zinc-600">Try adjusting your search or filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

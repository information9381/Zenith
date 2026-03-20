import React, { useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  FirebaseUser,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  orderBy,
  limit,
  handleFirestoreError,
  OperationType
} from './firebase';
import { Task, ViewMode, Theme, Status, Priority } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskList from './components/TaskList';
import Settings from './components/Settings';
import { 
  LayoutDashboard, 
  Plus, 
  X, 
  Menu,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Github
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [theme, setTheme] = useState<Theme>('dark');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<Status>('todo');
  const [selectedDueDate, setSelectedDueDate] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Listeners
  useEffect(() => {
    if (!user) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('uid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task)));
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'tasks'));

    return () => {
      unsubTasks();
    };
  }, [user]);

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isLoggingIn || user) return;
    setIsLoggingIn(true);
    setLoginError(null);
    
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      if (errorCode === 'auth/cancelled-popup-request' || errorCode === 'auth/popup-closed-by-user') {
        console.info('Login popup closed or cancelled.');
      } else if (errorMessage?.includes('INTERNAL ASSERTION FAILED')) {
        setLoginError('Authentication service encountered an internal error. Please try again.');
        console.error('Firebase Auth Internal Error:', error);
      } else {
        setLoginError(errorMessage || 'An unknown error occurred during login.');
        console.error('Login failed:', error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('dashboard');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as Priority;
    const dueDate = selectedDueDate;

    try {
      const taskData = {
        uid: user.uid,
        title,
        description,
        priority,
        status: newTaskStatus,
        dueDate: dueDate || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'tasks'), taskData);
      
      setIsAddingTask(false);
      setSelectedDueDate('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    try {
      const taskRef = doc(db, 'tasks', taskId);
      await updateDoc(taskRef, { ...updates, updatedAt: serverTimestamp() });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'tasks', taskId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    }
  };

  if (loading) {
    return (
      <div className="h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
        <p className="text-zinc-500 font-mono text-sm tracking-widest uppercase">Initializing Zenith...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen bg-zinc-950 flex items-center justify-center p-6 relative">
        <div className="w-full max-w-md space-y-12 text-center">
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20">
                <LayoutDashboard className="text-white w-9 h-9" />
              </div>
              <h1 className="text-4xl font-black tracking-tighter text-white">ZENITH</h1>
            </div>
            <div className="space-y-2">
              <h2 className="text-5xl font-black tracking-tighter text-white leading-tight">
                Reach your <span className="text-emerald-500">peak</span>.
              </h2>
              <p className="text-zinc-400 font-medium leading-relaxed">
                The ultimate workspace for high-performers. Manage tasks, track progress, and master your time.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full px-8 py-5 bg-white text-black font-black text-lg rounded-2xl hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoggingIn ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" />
              )}
              {isLoggingIn ? 'Connecting...' : 'Continue with Google'}
            </button>
            
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>{loginError}</p>
              </motion.div>
            )}
          </div>
        </div>
        <div className="absolute bottom-6 right-6 text-zinc-600 text-xs font-medium">
          created by Fayaz Shaik
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-zinc-950 text-zinc-100 ${theme}`}>
      <Sidebar 
        currentView={view} 
        setView={(v) => { setView(v); setIsSidebarOpen(false); }} 
        user={user} 
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 overflow-y-auto relative flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 border-b border-zinc-900 bg-zinc-950 flex items-center gap-4 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-500"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <LayoutDashboard className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase">Zenith</h1>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {view === 'dashboard' && (
              <Dashboard 
                tasks={tasks} 
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {view === 'list' && (
              <TaskList 
                tasks={tasks} 
                onAddTask={() => { setNewTaskStatus('todo'); setIsAddingTask(true); }} 
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
              />
            )}
            {view === 'settings' && <Settings user={user} theme={theme} setTheme={setTheme} onLogout={handleLogout} />}
          </motion.div>
        </AnimatePresence>

        {/* Add Task Modal */}
        <AnimatePresence>
          {isAddingTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAddingTask(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-lg bg-zinc-900 rounded-[32px] border border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 md:p-8 border-b border-zinc-800 flex items-center justify-between shrink-0">
                  <h3 className="text-xl md:text-2xl font-bold tracking-tight">Create New Task</h3>
                  <button onClick={() => { setIsAddingTask(false); setSelectedDueDate(''); }} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-500 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <form onSubmit={addTask} className="p-6 md:p-8 space-y-6 overflow-y-auto">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Task Title</label>
                    <input 
                      name="title" 
                      required 
                      autoFocus
                      placeholder="What needs to be done?"
                      className="w-full px-4 py-3 md:py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all text-base md:text-lg font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Description</label>
                    <textarea 
                      name="description" 
                      placeholder="Add some details..."
                      rows={3}
                      className="w-full px-4 py-3 md:py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all resize-none text-sm md:text-base"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Priority</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((p) => (
                        <label key={p} className="relative cursor-pointer">
                          <input type="radio" name="priority" value={p} defaultChecked={p === 'medium'} className="peer sr-only" />
                          <div className="px-3 py-2 text-center text-xs font-bold uppercase tracking-wider rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-500 peer-checked:border-emerald-500 peer-checked:text-emerald-500 peer-checked:bg-emerald-500/10 transition-all">
                            {p}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Due Date</label>
                      {selectedDueDate && (
                        <button 
                          type="button" 
                          onClick={() => setSelectedDueDate('')}
                          className="text-[10px] font-bold text-rose-500 uppercase tracking-widest hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {[
                        { label: 'Today', getValue: () => new Date().toISOString().split('T')[0] },
                        { label: 'Tomorrow', getValue: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 1);
                          return d.toISOString().split('T')[0];
                        }},
                        { label: 'Next Week', getValue: () => {
                          const d = new Date();
                          d.setDate(d.getDate() + 7);
                          return d.toISOString().split('T')[0];
                        }}
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setSelectedDueDate(preset.getValue())}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg border transition-all",
                            selectedDueDate === preset.getValue()
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-500"
                              : "bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                          )}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                    <input 
                      type="date" 
                      name="dueDate" 
                      value={selectedDueDate}
                      onChange={(e) => setSelectedDueDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 md:py-4 bg-zinc-950 border border-zinc-800 rounded-2xl focus:outline-none focus:border-emerald-500 transition-all text-sm md:text-base"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 md:py-5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg md:text-xl rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-500/20 active:scale-95 shrink-0"
                  >
                    Create Task
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { taskService } from '../../services/api';
import { useSocket } from '../../hooks/useSocket';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, MoreVertical, Calendar, Tag, Search as SearchIcon, Filter, X } from 'lucide-react';
import { cn, formatDate } from '../../lib/utils';
import toast from 'react-hot-toast';
import TaskModal from '../../components/TaskModal';

interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string;
  assignedTo?: {
    name: string;
    avatar?: string;
  };
}

const ProjectBoard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const projectId = id || 'p1';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const socket = useSocket(projectId);

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;

    socket.on('task-created', (newTask: Task) => {
      setTasks(prev => [...prev, newTask]);
      toast.success('Task added by team member');
    });

    socket.on('task-updated', (updatedTask: Task) => {
      setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
    });

    socket.on('task-deleted', (taskId: string) => {
      setTasks(prev => prev.filter(t => t._id !== taskId));
    });

    return () => {
      socket.off('task-created');
      socket.off('task-updated');
      socket.off('task-deleted');
    };
  }, [socket]);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getAll(projectId);
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    try {
      const newTaskData = {
        title: "New Team Task",
        description: "Click edit to change the description and assignee.",
        status: 'todo',
        priority: 'medium',
        deadline: new Date().toISOString(),
        projectId: projectId,
        assignedTo: { name: 'Unassigned' }
      };

      const res = await taskService.create(newTaskData);
      const createdTask = res.data.task;
      
      setTasks(prev => [createdTask, ...prev]);
      toast.success("Task added to workspace");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create task");
    }
  };

  const columns = [
    { title: 'To Do', id: 'todo', color: 'bg-slate-200' },
    { title: 'In Progress', id: 'in-progress', color: 'bg-blue-500' },
    { title: 'Completed', id: 'completed', color: 'bg-emerald-500' },
  ];

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.update(taskId, updates);
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, ...updates } : t));
      if (selectedTask?._id === taskId) {
        setSelectedTask(current => current ? { ...current, ...updates } : null);
      }
      toast.success("Task updated");
    } catch (err) {
      toast.error("Failed to update task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      setSelectedTask(null);
      toast.success("Task deleted");
    } catch (err) {
      toast.error("Failed to delete task");
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, selectedPriority]);

  const priorityColors = {
    low: "text-blue-600 bg-blue-50 border-blue-100",
    medium: "text-amber-600 bg-amber-50 border-amber-100",
    high: "text-rose-600 bg-rose-50 border-rose-100",
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Project Board</h2>
          <nav className="flex items-center gap-2 text-sm text-slate-500">
            <span>Projects</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Project Portfolio</span>
          </nav>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search tasks in this board..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 focus:ring-2 focus:ring-brand-primary/20 text-slate-600 font-medium cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
      </div>

      <div className="flex-1 flex gap-4 sm:gap-6 overflow-x-auto pb-4 custom-scrollbar min-h-0 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-[85vw] sm:w-80 flex flex-col bg-slate-100/50 rounded-3xl border border-slate-200/60 p-5 snap-center sm:snap-align-none">
            <div className="flex items-center justify-between mb-5 px-1">
              <div className="flex items-center gap-2.5">
                <div className={cn("w-2.5 h-2.5 rounded-full", column.color)}></div>
                <h3 className="font-bold text-slate-800 text-sm">{column.title}</h3>
                <span className="ml-1 text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-0.5 rounded-full shadow-sm">
                  {filteredTasks.filter(t => t.status === column.id).length}
                </span>
              </div>
              <button onClick={handleAddTask} className="p-1.5 hover:bg-white rounded-lg text-slate-400 shadow-sm transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence>
                {filteredTasks.filter(t => t.status === column.id).map((task) => (
                  <motion.div
                    key={task._id}
                    layoutId={task._id}
                    onClick={() => setSelectedTask(task)}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -3, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                    className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm cursor-pointer group hover:border-brand-primary/20 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn(
                        "text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border",
                        priorityColors[task.priority]
                      )}>
                        {task.priority}
                      </span>
                      <div className="w-8 h-8 opacity-0 group-hover:opacity-100 flex items-center justify-center hover:bg-slate-50 rounded-full transition-opacity">
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-slate-900 leading-snug mb-2.5 group-hover:text-brand-primary transition-colors">
                      {task.title}
                    </h4>
                    <p className="text-xs text-slate-500 mb-5 line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold tracking-wide uppercase">{formatDate(task.deadline)}</span>
                      </div>
                      {task.assignedTo && (
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-slate-900 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-1 ring-slate-100">
                            {task.assignedTo.name.charAt(0)}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredTasks.filter(t => t.status === column.id).length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center text-slate-400 animate-pulse">
                  <div className="p-4 bg-white rounded-2xl shadow-sm mb-4 border border-slate-100">
                    <Tag className="w-6 h-6 opacity-30" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Empty Workspace</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskModal 
        isOpen={!!selectedTask}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onUpdate={updateTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default ProjectBoard;

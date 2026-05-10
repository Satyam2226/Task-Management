import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User, Tag, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatDate, cn } from '../lib/utils';

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

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, isOpen, onClose, onUpdate, onDelete }) => {
  if (!task) return null;

  const priorityConfig = {
    low: { color: 'text-blue-600 bg-blue-50', icon: Clock },
    medium: { color: 'text-amber-600 bg-amber-50', icon: AlertCircle },
    high: { color: 'text-rose-600 bg-rose-50', icon: AlertCircle },
  };

  const statusConfig = {
    'todo': { label: 'To Do', color: 'bg-slate-100 text-slate-700' },
    'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
    'completed': { label: 'Completed', color: 'bg-emerald-100 text-emerald-700' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="relative p-8">
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  statusConfig[task.status].color
                )}>
                  {statusConfig[task.status].label}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                  priorityConfig[task.priority].color
                )}>
                  {React.createElement(priorityConfig[task.priority].icon, { className: "w-3 h-3" })}
                  {task.priority} Priority
                </span>
              </div>

              <h2 className="text-2xl font-display font-bold text-slate-900 mb-4 pr-12 leading-tight">
                {task.title}
              </h2>

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Description
                  </h3>
                  <div className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {task.description || "No description provided."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Due Date
                    </h3>
                    <div className="text-slate-900 font-medium text-sm">
                      {formatDate(task.deadline)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Assignee
                    </h3>
                    <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                      <div className="w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center text-[10px] font-bold text-brand-primary">
                        {task.assignedTo?.name.charAt(0) || '?'}
                      </div>
                      {task.assignedTo?.name || 'Unassigned'}
                    </div>
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex gap-2">
                    {task.status !== 'completed' ? (
                      <button 
                        onClick={() => onUpdate(task._id, { status: 'completed' })}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Mark as Done
                      </button>
                    ) : (
                      <button 
                        onClick={() => onUpdate(task._id, { status: 'in-progress' })}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        Move back to progress
                      </button>
                    )}
                  </div>

                  <button 
                    onClick={() => onDelete(task._id)}
                    className="p-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;

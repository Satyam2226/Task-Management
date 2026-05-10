import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Folder, Users, Star, MoreVertical, Calendar, CheckSquare, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';
import { projectService } from '../../services/api';
import toast from 'react-hot-toast';

const ProjectsList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(true);

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await projectService.getAll();
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title) return toast.error("Title is required");
    
    try {
      const res = await projectService.create(newProject);
      const createdProject = res.data.project;
      
      setProjects(prev => [createdProject, ...prev]);
      setIsModalOpen(false);
      setNewProject({ title: '', description: '' });
      toast.success("Project created successfully!");
    } catch (err) {
      toast.error("Failed to create project");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Projects</h2>
          <p className="text-slate-500 text-sm">Manage and organize your team workspaces</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-brand-primary text-white rounded-full text-sm font-bold shadow-xl shadow-brand-primary/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-full lg:max-w-xl">
        <Search className="w-5 h-5 text-slate-400 ml-3" />
        <input 
          type="text" 
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            key={project._id || project.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                <Folder className="w-6 h-6 text-slate-400 group-hover:text-brand-primary transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                {project.favorite && <Star className="w-4 h-4 text-amber-400 fill-amber-400" />}
                <button className="p-1 hover:bg-slate-50 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <Link to={`/tasks/${project._id || project.id}`} className="block group">
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-brand-primary transition-colors">
                {project.title}
              </h3>
              <p className="text-sm text-slate-500 mb-6 line-clamp-2">
                {project.description}
              </p>
            </Link>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex -space-x-2">
                {[...Array(project.team)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  {project.tasks} Tasks
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider border",
                  project.status === 'Active' ? "border-emerald-100 text-emerald-600 bg-emerald-50" : "border-slate-100 text-slate-500 bg-slate-50"
                )}>
                  {project.status}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[90%] max-w-md bg-white rounded-3xl sm:rounded-[40px] shadow-2xl p-6 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-display font-bold text-slate-900">Create Project</h3>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Project Title</label>
                  <input 
                    type="text"
                    required
                    value={newProject.title}
                    onChange={(e) => setNewProject({...newProject, title: e.target.value})}
                    placeholder="e.g., Marketing Q4"
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea 
                    rows={4}
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                    placeholder="Briefly describe the project goals..."
                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-brand-primary/20 resize-none"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Confirm & Create
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsList;

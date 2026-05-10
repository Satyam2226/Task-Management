import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MoreHorizontal, UserPlus, Shield, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

const TeamView: React.FC = () => {
  const members = [
    { id: '1', name: 'Satyam Kumar', role: 'Admin', email: 'satyam@example.com', status: 'Online', avatar: 'S' },
    { id: '2', name: 'Sarah Wilson', role: 'UI Designer', email: 'sarah@example.com', status: 'In Meeting', avatar: 'W' },
    { id: '3', name: 'Mike Ross', role: 'Full Stack Dev', email: 'mike@example.com', status: 'Away', avatar: 'R' },
    { id: '4', name: 'Harvey Specter', role: 'Project Manager', email: 'harvey@example.com', status: 'Offline', avatar: 'H' },
    { id: '5', name: 'Donna Paulsen', role: 'COO', email: 'donna@example.com', status: 'Online', avatar: 'P' },
  ];

  const statusColors = {
    'Online': 'bg-emerald-500',
    'In Meeting': 'bg-rose-500',
    'Away': 'bg-amber-500',
    'Offline': 'bg-slate-300',
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Meet the Team</h2>
          <p className="text-slate-500 text-sm">You have {members.length} team members in this workspace</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full text-sm font-bold shadow-xl shadow-slate-900/10 hover:scale-105 transition-transform">
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative group"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[100px] -mr-10 -mt-10 group-hover:bg-brand-primary/5 transition-colors z-0" />
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/10 flex items-center justify-center text-2xl font-bold text-brand-primary border-2 border-white shadow-sm">
                    {member.avatar}
                  </div>
                  <div className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                    statusColors[member.status as keyof typeof statusColors]
                  )} />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-slate-50 rounded-xl text-slate-400">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-1">{member.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {member.role}
                  </span>
                  {member.role === 'Admin' && <Shield className="w-3 h-3 text-brand-primary" />}
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <ExternalLink className="w-4 h-4" />
                  </div>
                  <span>View Profile</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TeamView;

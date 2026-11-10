import React, { useState, useEffect } from 'react';
import { useBusiness } from '../../context/BusinessContext';
import { ListTodo, ArrowRight } from 'lucide-react';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
  isOpen,
  onClose,
  defaultProjectId,
}) => {
  const { projects, addTask } = useBusiness();
  const [projectId, setProjectId] = useState<string>(defaultProjectId || projects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
  );

  useEffect(() => {
    if (defaultProjectId) {
      setProjectId(defaultProjectId);
    } else if (projects[0] && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [defaultProjectId, projects, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !title.trim()) return;

    addTask(projectId, {
      title: title.trim(),
      priority,
      dueDate: dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    });
    setTitle('');
    setPriority('Medium');
    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-[#0B192C]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200/90 shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Native Drag Pill Handle */}
        <button
          type="button"
          onClick={onClose}
          title="Tap or pull down to dismiss"
          className="shrink-0 w-full pt-3 pb-1 flex justify-center focus:outline-none group bg-white"
        >
          <span className="w-12 h-1.5 rounded-full bg-slate-300 group-hover:bg-slate-400 transition-colors" />
        </button>

        {/* Fixed-in-place Header */}
        <div className="shrink-0 px-6 py-4 bg-white border-b border-slate-200/80 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#0D5EF4] text-white flex items-center justify-center shadow-xs shrink-0">
            <ListTodo className="w-5 h-5 stroke-[2.2]" />
          </div>
          <h2 className="text-base font-extrabold text-[#0B192C]">Add Project Task</h2>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden text-xs">
          <div className="p-6 space-y-4 overflow-y-auto flex-1 min-h-0">
            {!defaultProjectId && (
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Target Project *</label>
                <select
                  required
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="font-bold text-[#0B192C] block mb-1">Task Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Set up Redis caching layer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              <div>
                <label className="font-bold text-[#0B192C] block mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-3 py-2.5 text-[#0B192C] font-mono focus:bg-white focus:outline-none focus:border-[#0D5EF4]"
                />
              </div>
            </div>
          </div>

          {/* Fixed-in-place Split Action Footer */}
          <div className="shrink-0 px-6 py-4 bg-white border-t border-slate-200/80 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Dismiss
            </button>
            <button
              type="submit"
              className="flex-[2] py-2.5 px-5 text-xs font-bold text-white bg-[#0D5EF4] hover:bg-[#0047BA] rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <span>Save Task</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

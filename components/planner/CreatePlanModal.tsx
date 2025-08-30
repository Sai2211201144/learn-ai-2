import React from 'react';
import { CloseIcon, CalendarDaysIcon } from '../common/Icons';
import CreatePlanForm from './CreatePlanForm';

interface CreatePlanModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreatePlanModal: React.FC<CreatePlanModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 animate-modal-bg" onClick={onClose}>
            <div className="bg-[var(--color-card)] rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 border border-[var(--color-border)] animate-modal-content flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-start mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CalendarDaysIcon className="w-7 h-7 text-[var(--color-primary)]" />
                        <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Create New Learning Plan</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="flex-grow">
                    <CreatePlanForm onCancel={onClose} />
                </div>
            </div>
        </div>
    );
};

export default CreatePlanModal;

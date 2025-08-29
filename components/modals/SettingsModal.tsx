import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { allThemes } from '../../styles/themes';
import { CloseIcon, Cog6ToothIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';


interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();

    const handleLogout = () => {
        onClose();
        logout();
    };

    if (!isOpen) return null;

    return (
         <div 
            className="fixed inset-0 bg-[var(--color-background)]/50 backdrop-blur-md flex items-center justify-center z-50 animate-modal-bg" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
             <div
                className="bg-[var(--color-card)] rounded-2xl shadow-2xl p-8 w-full max-w-lg mx-4 border border-[var(--color-border)] flex flex-col max-h-[90vh] animate-modal-content"
                onClick={e => e.stopPropagation()}
            >
                <header className="flex justify-between items-start mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <Cog6ToothIcon className="w-8 h-8 text-[var(--color-primary)]" />
                        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-4">
                    <div className="space-y-8">
                        {/* Theme Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Theme</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {allThemes.map(t => (
                                    <button 
                                        key={t.name}
                                        onClick={() => setTheme(t.name)}
                                        className={`p-3 rounded-lg border-2 transition-all ${theme.name === t.name ? 'border-[var(--color-primary)]' : 'border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`}
                                    >
                                        <div className="w-full h-8 rounded mb-2" style={{ background: t.properties['--gradient-primary-accent'] }}></div>
                                        <p className="text-sm font-semibold text-[var(--color-foreground)]">{t.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Account Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-red-500 mb-3">Account</h3>
                             <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                <button onClick={handleLogout} className="w-full px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                                    Sign Out
                                </button>
                                <p className="text-xs text-center text-red-400 mt-2">You will be logged out of your account.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;

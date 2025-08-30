

import React, { useState, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { allThemes } from '../../styles/themes';
import { CloseIcon, Cog6ToothIcon, ArrowUpOnSquareIcon, FolderArrowDownIcon } from '../common/Icons';
import { useAuth } from '../../context/AuthContext';
import * as storageService from '../../services/storageService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { theme, setTheme } = useTheme();
    const { logout } = useAuth();
    const [dataMessage, setDataMessage] = useState({ type: '', text: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleReset = () => {
        if (window.confirm("Are you sure you want to reset all your data? This will clear all courses, progress, and habits and cannot be undone.")) {
            onClose();
            logout();
        }
    };

    const handleExport = () => {
        try {
            const data = storageService.getAllDataForBackup();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `learnai_backup_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setDataMessage({ type: 'success', text: 'Data exported successfully!' });
        } catch (error) {
            console.error("Export failed:", error);
            setDataMessage({ type: 'error', text: 'Failed to export data.' });
        }
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonString = e.target?.result as string;
                storageService.importData(jsonString);
                setDataMessage({ type: 'success', text: 'Import successful! The app will now reload.' });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                console.error("Import failed:", error);
                const errorMessage = error instanceof Error ? error.message : 'Invalid file format.';
                setDataMessage({ type: 'error', text: `Import failed: ${errorMessage}` });
            }
        };
        reader.onerror = () => {
            setDataMessage({ type: 'error', text: 'Failed to read the file.' });
        };
        reader.readAsText(file);
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

                        {/* Data Management Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-[var(--color-foreground)] mb-3">Data Management</h3>
                            <div className="bg-[var(--color-secondary)]/50 p-4 rounded-lg border border-[var(--color-border)] space-y-3">
                                <p className="text-sm text-[var(--color-muted-foreground)]">Backup your progress to a file or restore from a previous backup.</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)]">
                                        <ArrowUpOnSquareIcon className="w-5 h-5" />
                                        Export Data
                                    </button>
                                    <button onClick={handleImportClick} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-secondary-hover)] text-[var(--color-foreground)] font-semibold rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-border)]">
                                         <FolderArrowDownIcon className="w-5 h-5" />
                                        Import Data
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".json" className="hidden" />
                                </div>
                                {dataMessage.text && (
                                    <p className={`text-center text-xs mt-2 ${dataMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                        {dataMessage.text}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Account Section */}
                        <div>
                            <h3 className="text-xl font-semibold text-red-500 mb-3">Reset Data</h3>
                             <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                                <button onClick={handleReset} className="w-full px-5 py-2.5 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600">
                                    Reset All Guest Data
                                </button>
                                <p className="text-xs text-center text-red-400 mt-2">This will clear all your created courses, progress, and settings.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
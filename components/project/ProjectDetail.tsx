





import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { useAppContext } from '../../context/AppContext';
import ProgressBar from '../common/ProgressBar';
// FIX: Added WrenchScrewdriverIcon and SparklesIcon to imports
import { ChevronLeftIcon, WrenchScrewdriverIcon, CheckIcon, SparklesIcon } from '../common/Icons';

interface ProjectDetailProps {
    project: Project;
    onBackToProjects: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBackToProjects }) => {
    const { handleToggleProjectStepComplete, handleGetProjectFeedback } = useAppContext();
    const progress = project.progress;

    const [activeStepId, setActiveStepId] = useState(project.steps[0]?.id || '');
    const [userCode, setUserCode] = useState('');

    const activeStep = project.steps.find(step => step.id === activeStepId);

    useEffect(() => {
        if (activeStep) {
            // Load the code stub for the current step into the editor
            setUserCode(activeStep.codeStub || '');
        }
    }, [activeStep]);
    
    const projectProgress = project.steps.length > 0 ? (progress.size / project.steps.length) * 100 : 0;

    const handleFeedbackRequest = () => {
        if (activeStep) {
            handleGetProjectFeedback(activeStep, userCode);
        }
    };

    return (
        <div className="w-full h-full max-w-7xl animate-fade-in-up flex flex-col">
            <header className="mb-6 flex-shrink-0">
                 <button
                    onClick={onBackToProjects}
                    className="flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors mb-4"
                    title="Back to Projects"
                >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Back to Projects
                </button>
                <div className="flex items-center mb-2">
                    <WrenchScrewdriverIcon className="h-8 w-8 mr-3 text-green-500 flex-shrink-0" />
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-800">{project.title}</h1>
                        <p className="text-gray-500 text-sm">{project.description}</p>
                    </div>
                </div>
                 <div className="mt-4">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-600">Project Progress</span>
                        <span className="text-sm font-medium text-green-600">{progress.size} / {project.steps.length} Steps Complete</span>
                    </div>
                    <ProgressBar progress={projectProgress} />
                </div>
            </header>

            <div className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
                {/* Steps Column / Instructions */}
                <aside className="lg:col-span-5 h-full overflow-y-auto pr-4 custom-scrollbar">
                     {project.steps.map((step, index) => {
                        const isComplete = progress.has(step.id);
                        return (
                             <div key={step.id} id={`step-${step.id}`} className="mb-6 last:mb-0">
                                 <div className="flex items-center gap-3 mb-2">
                                    <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                        {isComplete ? <CheckIcon className="w-4 h-4" /> : <span className="text-xs font-bold">{index + 1}</span>}
                                    </div>
                                    <h3 className="font-bold text-xl text-slate-800">{step.title}</h3>
                                </div>
                                <div className="pl-9 space-y-3">
                                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                                     <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400">
                                         <h4 className="font-semibold text-yellow-800">Your Challenge</h4>
                                         <p className="text-sm text-yellow-900">{step.challenge}</p>
                                    </div>
                                    <button
                                        onClick={() => handleToggleProjectStepComplete(project.id, step.id)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold rounded-lg transition-colors ${progress.has(step.id) ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${progress.has(step.id) ? 'border-gray-500 bg-gray-500' : 'border-green-600'}`}>
                                            {progress.has(step.id) && <CheckIcon className="w-3 h-3 text-white"/>}
                                        </div>
                                        {progress.has(step.id) ? 'Mark as Incomplete' : 'Mark Step as Complete'}
                                    </button>
                                </div>
                             </div>
                        )
                    })}
                </aside>

                {/* Code Editor Column */}
                <main className="lg:col-span-7 h-full overflow-y-auto bg-gray-900 rounded-xl flex flex-col">
                     <div className="flex-shrink-0 p-3 bg-gray-800 flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-300">Code Editor</span>
                         <button 
                            onClick={handleFeedbackRequest}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white text-xs font-semibold rounded-md shadow-lg hover:bg-indigo-600 transition-colors"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Get Feedback
                        </button>
                    </div>
                    <div className="flex-grow p-1">
                        <textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            spellCheck="false"
                            className="w-full h-full bg-transparent text-gray-300 font-mono text-sm p-4 resize-none focus:outline-none"
                            placeholder="Write your code here..."
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProjectDetail;
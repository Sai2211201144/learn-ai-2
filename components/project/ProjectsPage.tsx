



import React, { useMemo } from 'react';
import { Project, Course } from '../../types';
import { useAppContext } from '../../context/AppContext';
import ProgressBar from '../common/ProgressBar';
// FIX: Added WrenchScrewdriverIcon and TrashIcon to imports
import { WrenchScrewdriverIcon, TrashIcon, ChevronLeftIcon } from '../common/Icons';

// Local implementation of groupBy to remove lodash-es dependency
const groupBy = <T, K extends keyof any>(list: T[], getKey: (item: T) => K): Record<K, T[]> =>
  list.reduce((previous, currentItem) => {
    const group = getKey(currentItem);
    if (!previous[group]) {
      previous[group] = [];
    }
    previous[group].push(currentItem);
    return previous;
  }, {} as Record<K, T[]>);

interface ProjectsPageProps {
    onSelectProject: (projectId: string) => void;
    onBackToDashboard: () => void;
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject, onBackToDashboard }) => {
    const { projects, handleDeleteProject, error } = useAppContext();

    const calculateProgress = (project: Project) => {
        if (project.steps.length === 0) return 0;
        const completedSteps = project.progress.size || 0;
        return (completedSteps / project.steps.length) * 100;
    };
    
    const groupedProjects = useMemo(() => {
        return groupBy(projects, (project) => project.course?.title || 'General Projects');
    }, [projects]);


    return (
        <div className="w-full max-w-6xl animate-fade-in">
             <button
                onClick={onBackToDashboard}
                className="flex items-center text-sm text-gray-500 hover:text-green-600 transition-colors mb-4"
                title="Back to Dashboard"
            >
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back to Dashboard
            </button>
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                    <WrenchScrewdriverIcon className="w-8 h-8 text-green-500" />
                    My Projects
                </h1>
            </header>

            {error && <p className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">{error}</p>}

            {projects.length === 0 ? (
                 <div className="text-center py-20 px-6 bg-white border-2 border-dashed border-gray-300 rounded-xl">
                    <WrenchScrewdriverIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">No Projects Yet</h3>
                    <p className="text-gray-500 mt-2 mb-6">Create guided projects from within a course topic to get started.</p>
                </div>
            ) : (
                <div className="space-y-10">
                    {Object.entries(groupedProjects).map(([courseTitle, courseProjects]) => (
                        <section key={courseTitle}>
                            <h2 className="text-2xl font-bold text-slate-700 border-b border-gray-200 pb-2 mb-4">{courseTitle}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {(courseProjects as Project[]).map(project => {
                                    const progress = calculateProgress(project);
                                    return (
                                        <div key={project.id} className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-xl text-slate-800 mb-2">{project.title}</h3>
                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{project.description}</p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                <div className="mb-4">
                                                    <ProgressBar progress={progress} />
                                                    <p className="text-xs text-gray-500 mt-1 text-right">{Math.round(progress)}% Complete</p>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <button
                                                        onClick={() => onSelectProject(project.id)}
                                                        className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-500 text-sm"
                                                    >
                                                        {progress > 0 && progress < 100 ? 'Continue Project' : 'View Project'}
                                                    </button>
                                                    <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-gray-400 rounded-full hover:bg-red-50 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
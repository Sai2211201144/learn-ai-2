import React, { useMemo } from 'react';
import { LearningPlan, DailyTask, Course } from '../../types';
import { useAppContext } from '../../context/AppContext';
import PlannerTaskCard from './PlannerTaskCard';
import { PlusIcon } from '../common/Icons';

interface WeeklyPlannerProps {
    plan: LearningPlan;
    filteredTasks: DailyTask[];
}

const WeeklyPlanner: React.FC<WeeklyPlannerProps> = ({ plan, filteredTasks }) => {
    const { courses } = useAppContext();
    const courseMap = useMemo(() => new Map(courses.map(c => [c.id, c])), [courses]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => new Date(today.getTime() + i * 24 * 60 * 60 * 1000));
    }, [today.getTime()]);

    const tasksByDate = useMemo(() => {
        const map = new Map<number, DailyTask[]>();
        filteredTasks.forEach(task => {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);
            const dateKey = taskDate.getTime();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(task);
        });
        return map;
    }, [filteredTasks]);

    return (
        <div className="bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-border)]">
             <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4 px-2">This Week</h2>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {weekDates.map((date, index) => {
                    const dateKey = date.getTime();
                    const tasksForDay = tasksByDate.get(dateKey) || [];
                    const isToday = index === 0;

                    return (
                        <div key={dateKey} className={`bg-[var(--color-secondary)] rounded-lg p-2 flex flex-col ${isToday ? 'border-2 border-[var(--color-primary)]' : ''}`}>
                            <div className="flex-shrink-0 text-center mb-3">
                                <p className={`font-bold text-sm ${isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]'}`}>
                                    {isToday ? 'Today' : date.toLocaleDateString(undefined, { weekday: 'short' })}
                                </p>
                                <p className="text-xs text-[var(--color-muted-foreground)]">
                                    {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="flex-grow space-y-2 min-h-[100px]">
                                {tasksForDay.map(task => {
                                    const course = courseMap.get(task.courseId);
                                    if (!course) return null;
                                    return (
                                        <PlannerTaskCard 
                                            key={task.id}
                                            planId={plan.id}
                                            task={task}
                                            course={course}
                                            currentDate={dateKey}
                                        />
                                    );
                                })}
                            </div>
                             <div className="flex-shrink-0 pt-2">
                                <button className="w-full flex items-center justify-center gap-1 text-xs py-1 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] hover:bg-[var(--color-secondary-hover)] rounded-md">
                                    <PlusIcon className="w-3 h-3" />
                                    Add task
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default WeeklyPlanner;
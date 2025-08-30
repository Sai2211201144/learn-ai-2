

import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { achievementsList } from '../../services/achievements';
import AchievementCard from './AchievementCard';
import ProgressBar from '../common/ProgressBar';
// FIX: Added UserCircleIcon to imports
import { UserCircleIcon, AcademicCapIcon } from '../common/Icons';

interface Skill {
    skill: string;
    value: number; // 0 to 1
}

const SkillsRadarChart: React.FC<{ skillsData: Skill[] }> = ({ skillsData }) => {
    const size = 300;
    const center = size / 2;
    const numLevels = 5;
    const radius = center * 0.8;

    if (skillsData.length < 3) {
        return (
            <div className="flex items-center justify-center h-[300px] bg-[var(--color-secondary)] rounded-lg text-center p-4">
                <p className="text-[var(--color-muted-foreground)]">
                    Complete more courses to generate your skills chart. <br /> (Requires at least 3 skills)
                </p>
            </div>
        );
    }
    
    const numSkills = skillsData.length;
    const angleSlice = (Math.PI * 2) / numSkills;

    // Levels (circles)
    const levels = Array.from({ length: numLevels }, (_, i) => (
        <circle
            key={i}
            cx={center}
            cy={center}
            r={(radius * (i + 1)) / numLevels}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="1"
        />
    ));

    // Axis lines and labels
    const axes = skillsData.map((skill, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const x2 = center + radius * Math.cos(angle);
        const y2 = center + radius * Math.sin(angle);
        const labelX = center + (radius + 20) * Math.cos(angle);
        const labelY = center + (radius + 20) * Math.sin(angle);
        
        return (
            <g key={skill.skill}>
                <line x1={center} y1={center} x2={x2} y2={y2} stroke="var(--color-border)" strokeWidth="1" />
                <text
                    x={labelX}
                    y={labelY}
                    dy="0.3em"
                    textAnchor={labelX > center ? "start" : labelX < center ? "end" : "middle"}
                    className="text-xs font-semibold"
                    fill="var(--color-muted-foreground)"
                >
                    {skill.skill}
                </text>
            </g>
        );
    });

    // Data polygon
    const points = skillsData.map((skill, i) => {
        const angle = angleSlice * i - Math.PI / 2;
        const pointRadius = skill.value * radius;
        const x = center + pointRadius * Math.cos(angle);
        const y = center + pointRadius * Math.sin(angle);
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`}>
            {levels}
            {axes}
            <polygon
                points={points}
                fill="rgba(20, 184, 166, 0.4)" // --color-primary with alpha
                stroke="var(--color-primary)"
                strokeWidth="2"
            />
        </svg>
    );
};


const ProfilePage: React.FC = () => {
    const { localUser, courses } = useAppContext();

    const aggregatedSkills = useMemo<Skill[]>(() => {
        if (!localUser || !courses) return [];
        
        const skillCounts: Record<string, number> = {};
        let maxCount = 0;

        courses.forEach(course => {
            const totalLessons = course.topics.reduce((acc, topic) => acc + topic.subtopics.length, 0);
            if (totalLessons > 0 && course.progress.size === totalLessons) {
                course.skills.forEach(skill => {
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                    if (skillCounts[skill] > maxCount) {
                        maxCount = skillCounts[skill];
                    }
                });
            }
        });

        return Object.entries(skillCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .slice(0, 6)
            .map(([skill, count]) => ({
                skill,
                value: maxCount > 0 ? count / maxCount : 0,
            }));
    }, [localUser, courses]);

    if (!localUser) {
        return <div>Loading user profile...</div>;
    }

    const requiredXp = localUser.level * 500;
    const progressPercentage = requiredXp > 0 ? (localUser.xp / requiredXp) * 100 : 0;

    return (
        <div className="w-full max-w-5xl animate-fade-in-up">
            <header className="pb-6 border-b border-[var(--color-border)] mb-8">
                <h1 className="text-4xl font-bold text-[var(--color-foreground)] flex items-center gap-3">
                    <UserCircleIcon className="w-10 h-10 text-[var(--color-primary)]" />
                    Player Profile
                </h1>
            </header>

            <section className="bg-[var(--color-card)] p-8 rounded-2xl border border-[var(--color-border)] shadow-lg mb-10">
                <div className="flex flex-col sm:flex-row items-center gap-8">
                     {localUser.picture && <img src={localUser.picture} alt="User" className="w-24 h-24 rounded-full" />}
                    <div className="flex-grow w-full">
                        <h2 className="text-3xl font-bold text-[var(--color-foreground)]">{localUser.name}</h2>
                        <p className="text-lg text-[var(--color-muted-foreground)] mt-1">Level {localUser.level}</p>
                        <div className="mt-4">
                            <ProgressBar progress={progressPercentage} />
                            <p className="text-sm text-right text-[var(--color-muted-foreground)] mt-1 font-semibold">{localUser.xp} / {requiredXp} XP</p>
                        </div>
                    </div>
                </div>
            </section>
            
             <section className="mb-10">
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6 flex items-center gap-3">
                    <AcademicCapIcon className="w-7 h-7 text-[var(--color-primary)]" />
                    Skills Radar
                </h2>
                <div className="bg-[var(--color-card)] p-4 rounded-2xl border border-[var(--color-border)] shadow-lg">
                    <SkillsRadarChart skillsData={aggregatedSkills} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-6">Achievements</h2>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {achievementsList.map((achievement) => (
                        <AchievementCard
                            key={achievement.id}
                            achievement={achievement}
                            isUnlocked={localUser.achievements.includes(achievement.id)}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
};

export default ProfilePage;
import { Achievement, AchievementId } from '../types';
import { 
    BookOpenIcon, 
    CheckCircleIcon, 
    // FIX: Added WrenchScrewdriverIcon to imports
    WrenchScrewdriverIcon, 
    // FIX: Added TrophyIcon to imports
    TrophyIcon, 
    // FIX: Added SparklesIcon to imports
    SparklesIcon,
    AcademicCapIcon
} from '../components/common/Icons';

export const achievementsList: Achievement[] = [
    {
        id: 'curiousMind',
        title: 'Curious Mind',
        description: 'Create your very first topic.',
        icon: SparklesIcon,
    },
    {
        id: 'firstSteps',
        title: 'First Steps',
        description: 'Complete your first lesson.',
        icon: BookOpenIcon,
    },
    {
        id: 'topicExplorer',
        title: 'Topic Explorer',
        description: 'Generate at least 5 different topics.',
        icon: AcademicCapIcon,
    },
    {
        id: 'dedicatedLearner',
        title: 'Dedicated Learner',
        description: 'Complete all lessons in a topic.',
        icon: CheckCircleIcon,
    },
    {
        id: 'projectStarter',
        title: 'Project Starter',
        description: 'Start your first guided project.',
        icon: WrenchScrewdriverIcon,
    },
    {
        id: 'quizMaster',
        title: 'Quiz Master',
        description: 'Score 80% or higher on a skill assessment.',
        icon: TrophyIcon,
    },
];

export const achievementsMap = new Map<AchievementId, Achievement>(
    achievementsList.map(a => [a.id, a])
);
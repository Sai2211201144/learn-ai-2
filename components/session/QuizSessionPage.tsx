import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
// FIX: Added XCircleIcon to imports
import { ChevronLeftIcon, LoadingSpinnerIcon, BeakerIcon, CheckCircleIcon, XCircleIcon, LightBulbIcon } from '../common/Icons';

interface QuizSessionPageProps {
    onBack: () => void;
}

const QuizSessionPage: React.FC<QuizSessionPageProps> = ({ onBack }) => {
    const { practiceQuizSession, isPracticeQuizLoading } = useAppContext();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);

    if (isPracticeQuizLoading) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 w-full h-full">
                <LoadingSpinnerIcon className="h-12 w-12 text-[var(--color-primary)]" />
                <h2 className="text-2xl font-bold mt-6 text-[var(--color-foreground)]">Generating Your Quiz...</h2>
                <p className="text-lg text-[var(--color-muted-foreground)] mt-2">The AI is crafting questions for you.</p>
            </div>
        );
    }

    if (!practiceQuizSession || practiceQuizSession.questions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 w-full h-full">
                <h2 className="text-2xl font-bold mt-6 text-[var(--color-destructive)]">Error Generating Quiz</h2>
                <p className="text-lg text-[var(--color-muted-foreground)] mt-2">Could not generate a quiz for this topic. Please try again.</p>
                <button onClick={onBack} className="mt-6 px-6 py-2 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)]">
                    Go Back
                </button>
            </div>
        );
    }

    const { questions, topic } = practiceQuizSession;
    const isFinished = currentQuestionIndex >= questions.length;

    const handleSelectOption = (index: number) => {
        if (!isAnswered) {
            setSelectedAnswer(index);
        }
    };

    const handleCheckAnswer = () => {
        if (selectedAnswer !== null) {
            setIsAnswered(true);
            if (selectedAnswer === questions[currentQuestionIndex].answer) {
                setCorrectAnswers(prev => prev + 1);
            }
        }
    };

    const handleNextQuestion = () => {
        setIsAnswered(false);
        setSelectedAnswer(null);
        setCurrentQuestionIndex(prev => prev + 1);
    };

    const getOptionClass = (index: number) => {
        if (!isAnswered) {
            return `cursor-pointer ${selectedAnswer === index ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]' : 'bg-[var(--color-secondary)] border-[var(--color-border)] hover:border-[var(--color-primary)]/50'}`;
        }
        
        const isCorrect = index === questions[currentQuestionIndex].answer;
        const isSelected = index === selectedAnswer;

        if (isCorrect) return 'bg-green-500/10 border-green-500 ring-2 ring-green-500 pointer-events-none';
        if (isSelected) return 'bg-red-500/10 border-red-500 ring-2 ring-red-500 pointer-events-none';
        return 'bg-[var(--color-secondary)] border-[var(--color-border)] opacity-60 pointer-events-none';
    };

    if (isFinished) {
        const score = (correctAnswers / questions.length) * 100;
        return (
            <div className="w-full max-w-2xl text-center animate-fade-in-up">
                <BeakerIcon className="w-16 h-16 text-[var(--color-primary)] mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-[var(--color-foreground)]">Practice Complete!</h2>
                <p className="text-lg text-[var(--color-muted-foreground)] mt-2">Topic: {topic}</p>
                <div className="mt-8 bg-[var(--color-secondary)] p-8 rounded-xl border border-[var(--color-border)]">
                    <p className="text-xl text-[var(--color-muted-foreground)]">Your Score</p>
                    <p className={`text-7xl font-bold my-2 ${score >= 70 ? 'text-green-500' : 'text-yellow-500'}`}>{score.toFixed(0)}%</p>
                    <p className="text-[var(--color-foreground)]">You answered {correctAnswers} out of {questions.length} questions correctly.</p>
                </div>
                <button onClick={onBack} className="mt-8 px-8 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)]">
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="w-full max-w-3xl animate-fade-in-up">
             <button onClick={onBack} className="absolute top-6 left-6 flex items-center text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors" title="Back to Dashboard">
                <ChevronLeftIcon className="h-4 w-4 mr-1" />
                Back to Dashboard
            </button>
            <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Question {currentQuestionIndex + 1} of {questions.length}</span>
                </div>
                <div className="w-full bg-[var(--color-border)] rounded-full h-2">
                   <div className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
            </div>

            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl shadow-xl p-8">
                <p className="font-semibold text-xl text-[var(--color-foreground)] mb-6">{currentQuestion.q}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} onClick={() => handleSelectOption(index)} className={`flex items-center p-4 rounded-lg border-2 transition-all ${getOptionClass(index)}`}>
                             {isAnswered && (
                                <div className="mr-3 w-5 h-5 flex-shrink-0">
                                    {index === currentQuestion.answer && <CheckCircleIcon className="text-green-500" />}
                                    {index !== currentQuestion.answer && index === selectedAnswer && <XCircleIcon className="text-red-500" />}
                                </div>
                            )}
                            <span className="text-[var(--color-foreground)]">{option}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {isAnswered && (
                <div className="mt-4 p-4 bg-yellow-500/10 border-2 border-yellow-500/20 rounded-lg animate-fade-in">
                    <h5 className="font-bold text-yellow-500 flex items-center gap-2 mb-2"><LightBulbIcon className="w-5 h-5"/> Explanation</h5>
                    <p className="text-sm text-yellow-300 leading-relaxed">{currentQuestion.explanation}</p>
                </div>
            )}

            <div className="mt-6 flex justify-end">
                {isAnswered ? (
                    <button onClick={handleNextQuestion} className="px-8 py-3 bg-[var(--color-primary)] text-white font-bold rounded-lg hover:bg-[var(--color-primary-hover)]">Next Question</button>
                ) : (
                    <button onClick={handleCheckAnswer} disabled={selectedAnswer === null} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500 disabled:opacity-50">Check Answer</button>
                )}
            </div>
        </div>
    );
};

export default QuizSessionPage;
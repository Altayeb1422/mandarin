import React, { useState } from 'react';
import ExpressionChecker from './components/ExpressionChecker';
import BreakdownTool from './components/BreakdownTool';
import IntelligentReview from './components/IntelligentReview';
import { useStudyList } from './hooks/useStudyList';
import { Pencil, BookOpen, Brain } from './components/icons/NavIcons';

type Tab = 'checker' | 'breakdown' | 'review';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('checker');
    const { studyList, addStudyItem, removeStudyItem, isExpressionInList, loading } = useStudyList();

    const renderContent = () => {
        switch (activeTab) {
            case 'checker':
                return <ExpressionChecker addStudyItem={addStudyItem} isExpressionInList={isExpressionInList} />;
            case 'breakdown':
                return <BreakdownTool addStudyItem={addStudyItem} isExpressionInList={isExpressionInList} />;
            case 'review':
                return <IntelligentReview studyList={studyList} removeStudyItem={removeStudyItem} />;
            default:
                return null;
        }
    };
    
    const NavButton: React.FC<{tab: Tab, label: string, children: React.ReactNode}> = ({tab, label, children}) => {
        const isActive = activeTab === tab;
        return (
            <button
                onClick={() => setActiveTab(tab)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-28 ${isActive ? 'bg-violet-700 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            >
                {children}
                <span className="text-xs mt-1">{label}</span>
            </button>
        )
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-950 font-sans text-slate-200">
            <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 p-4 sticky top-0 z-10">
                <h1 className="text-3xl font-bold text-center text-slate-100">
                    汉语语境通 AI
                </h1>
            </header>

            <main className="flex-grow overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    {renderContent()}
                </div>
            </main>
            
            <footer className="bg-slate-900/80 backdrop-blur-sm border-t border-slate-700/50 p-2 sticky bottom-0">
                <nav className="flex justify-around max-w-md mx-auto">
                    <NavButton tab="checker" label="表达优化">
                        <Pencil />
                    </NavButton>
                    <NavButton tab="breakdown" label="难句解析">
                        <BookOpen />
                    </NavButton>
                    <NavButton tab="review" label="智能复习">
                        <Brain />
                    </NavButton>
                </nav>
            </footer>
        </div>
    );
};

export default App;
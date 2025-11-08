import React, { useState } from 'react';
import { StudyItem } from '../types';
import { getPronunciationAudio } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import Spinner from './icons/Spinner';
import SpeakerIcon from './icons/SpeakerIcon';


interface IntelligentReviewProps {
    studyList: StudyItem[];
    removeStudyItem: (id: string) => void;
}

const IntelligentReview: React.FC<IntelligentReviewProps> = ({ studyList, removeStudyItem }) => {
    const [isQuizMode, setIsQuizMode] = useState(false);
    const [shuffledList, setShuffledList] = useState<StudyItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [audioLoading, setAudioLoading] = useState(false);
    
    // Fisher-Yates shuffle algorithm
    const shuffleArray = (array: StudyItem[]) => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    };

    const startQuiz = () => {
        if (studyList.length > 0) {
            setShuffledList(shuffleArray(studyList));
            setCurrentIndex(0);
            setIsFlipped(false);
            setIsQuizMode(true);
        }
    };
    
    const endQuiz = () => {
        setIsQuizMode(false);
    };

    const handleNextCard = () => {
        if (currentIndex < shuffledList.length - 1) {
            setCurrentIndex(prev => {
                // Pre-flip the next card back to the front
                setTimeout(() => setIsFlipped(false), 300); // Allow flip back animation to start
                return prev + 1;
            });
        } else {
            // End of quiz
            endQuiz();
            alert("复习完成！");
        }
    };

    const handlePlayAudio = async (text: string) => {
        setAudioLoading(true);
        try {
            const audioData = await getPronunciationAudio(text);
            await playAudio(audioData);
        } catch (error) {
            console.error("播放音频时出错", error);
            alert("未能播放音频。");
        } finally {
            setAudioLoading(false);
        }
    };

    const currentItem = isQuizMode ? shuffledList[currentIndex] : null;

    if (studyList.length === 0) {
        return (
            <div className="p-4 md:p-6 text-center">
                <h2 className="text-2xl font-bold mb-4 text-slate-100">智能复习</h2>
                <p className="text-slate-400">你的生词本是空的。快去添加一些表达或词语来开始复习吧！</p>
            </div>
        );
    }
    
    if (isQuizMode && currentItem) {
        return (
            <div className="p-4 md:p-6 flex flex-col items-center">
                <h2 className="text-2xl font-bold mb-4 text-slate-100">智能复习</h2>
                <div className="w-full max-w-lg mb-4 text-slate-400 text-center">
                    <p>第 {currentIndex + 1} / {shuffledList.length} 张卡片</p>
                </div>

                <div className={`perspective w-full max-w-lg h-64 mb-6 ${isFlipped ? 'card-flipped' : ''}`}>
                    <div className="card-inner">
                        <div className="card-front bg-slate-800 border border-slate-700 rounded-lg shadow-lg">
                            <p className="text-slate-400 mb-2 text-sm">这是什么表达？</p>
                            <p className="text-xl text-slate-200">{currentItem.jieshi}</p>
                        </div>
                        <div className="card-back bg-slate-800 border border-cyan-500/50 rounded-lg shadow-lg">
                             <p className="text-3xl font-bold text-cyan-400 mb-2">{currentItem.biaoda}</p>
                            <button onClick={() => handlePlayAudio(currentItem.biaoda)} disabled={audioLoading} className="text-slate-400 hover:text-cyan-400 mx-auto transition-colors">
                                {audioLoading ? <Spinner /> : <SpeakerIcon />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={endQuiz} className="px-6 py-2 rounded-md bg-slate-600 hover:bg-slate-700 transition-colors">结束复习</button>
                    {!isFlipped ? (
                        <button onClick={() => setIsFlipped(true)} className="px-6 py-2 rounded-md bg-violet-600 hover:bg-violet-700 transition-colors font-semibold">显示答案</button>
                    ) : (
                        <button onClick={handleNextCard} className="px-6 py-2 rounded-md bg-green-600 hover:bg-green-700 transition-colors font-semibold">下一个</button>
                    )}
                </div>
            </div>
        );
    }

    // Default view: List and start quiz button
    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">智能复习</h2>
            <div className="text-center mb-6">
                 <button onClick={startQuiz} className="bg-violet-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-violet-700 transition-transform hover:scale-105">
                    开始复习 ({studyList.length} 个词条)
                </button>
            </div>
            <h3 className="text-xl font-semibold mb-3 text-slate-300">我的生词本</h3>
            <div className="space-y-3">
                {studyList.map((item) => (
                    <div key={item.id} className="bg-slate-800/50 p-4 rounded-lg shadow-md border border-slate-700/50">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-lg font-bold text-cyan-400">{item.biaoda}</h4>
                                <p className="mt-1 text-slate-300 text-sm leading-relaxed">{item.jieshi}</p>
                            </div>
                             <button
                                onClick={() => removeStudyItem(item.id)}
                                className="text-sm text-red-500 hover:text-red-400 font-semibold transition-colors flex-shrink-0 ml-4"
                            >
                                移除
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntelligentReview;
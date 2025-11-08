import React, { useState } from 'react';
import { getBreakdown, getPronunciationAudio } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { BreakdownResult } from '../types';
import Spinner from './icons/Spinner';
import SpeakerIcon from './icons/SpeakerIcon';
import PlusIcon from './icons/PlusIcon';

interface BreakdownToolProps {
    addStudyItem: (biaoda: string, jieshi: string) => void;
    isExpressionInList: (biaoda: string) => boolean;
}

const BreakdownTool: React.FC<BreakdownToolProps> = ({ addStudyItem, isExpressionInList }) => {
    const [input, setInput] = useState('');
    const [analysisResult, setAnalysisResult] = useState<BreakdownResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioLoading, setAudioLoading] = useState<string | null>(null); // ciyu or sentence being loaded

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await getBreakdown(input);
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || '发生未知错误。');
        } finally {
            setLoading(false);
        }
    };
    
    const handlePlayAudio = async (text: string) => {
        setAudioLoading(text);
        try {
            const audioData = await getPronunciationAudio(text);
            await playAudio(audioData);
        } catch (error) {
            console.error("播放音频时出错", error);
            alert("未能播放音频。");
        } finally {
            setAudioLoading(null);
        }
    };

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">难句解析</h2>
            <p className="mb-4 text-slate-400">输入一个复杂的句子，AI会将其分解为核心词汇、拼音、释义和例句。</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="例如：这个问题的解决方案需要我们从长计议。"
                    className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none transition text-slate-200 placeholder:text-slate-500"
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-violet-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner /> : '解析'}
                </button>
            </form>

            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}

            {analysisResult && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Full Sentence Analysis Section */}
                    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="text-xl font-bold mb-4 text-slate-100">整句分析</h3>
                        
                        <div className="mb-4">
                            <h4 className="font-semibold text-slate-400 text-sm">您输入的句子</h4>
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-cyan-400 font-semibold text-lg">"{analysisResult.sentenceAnalysis.yuanju}"</p>
                                <button 
                                    onClick={() => handlePlayAudio(analysisResult.sentenceAnalysis.yuanju)} 
                                    disabled={audioLoading === analysisResult.sentenceAnalysis.yuanju} 
                                    className="text-slate-400 hover:text-cyan-400 transition-colors"
                                    aria-label="播放原句"
                                >
                                    {audioLoading === analysisResult.sentenceAnalysis.yuanju ? <Spinner/> : <SpeakerIcon />}
                                </button>
                            </div>
                            <p className="text-violet-300 text-md font-mono mt-1">{analysisResult.sentenceAnalysis.pinyin}</p>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-slate-400 text-sm">释义</h4>
                                <p className="text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">{analysisResult.sentenceAnalysis.jieshi}</p>
                            </div>
    
                            <div>
                                <h4 className="font-semibold text-slate-400 text-sm">相似例句</h4>
                                <p className="text-slate-400 mt-1 italic">"{analysisResult.sentenceAnalysis.liju}"</p>
                            </div>
    
                            {analysisResult.sentenceAnalysis.buchong && (
                                <div>
                                    <h4 className="font-semibold text-slate-400 text-sm">补充信息</h4>
                                    <p className="text-slate-300 mt-1 whitespace-pre-wrap leading-relaxed">{analysisResult.sentenceAnalysis.buchong}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 pt-4 border-t border-slate-700/50">
                             <button
                                onClick={() => addStudyItem(analysisResult.sentenceAnalysis.yuanju, analysisResult.sentenceAnalysis.jieshi)}
                                disabled={isExpressionInList(analysisResult.sentenceAnalysis.yuanju)}
                                className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors"
                            >
                                <PlusIcon added={isExpressionInList(analysisResult.sentenceAnalysis.yuanju)} />
                                {isExpressionInList(analysisResult.sentenceAnalysis.yuanju) ? '整句已收藏' : '收藏整句'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Word Breakdown Section */}
                    {analysisResult.wordBreakdowns && analysisResult.wordBreakdowns.length > 0 && (
                        <div>
                            <h3 className="text-xl font-bold mb-4 text-slate-100">核心词语解析</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {analysisResult.wordBreakdowns.map((item, index) => (
                                    <div key={index} className="bg-slate-800/50 p-4 rounded-lg shadow-lg border border-slate-700 flex flex-col">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-bold text-cyan-400">{item.ciyu}</h4>
                                                    <button onClick={() => handlePlayAudio(item.ciyu)} disabled={audioLoading === item.ciyu} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                                        {audioLoading === item.ciyu ? <Spinner /> : <SpeakerIcon />}
                                                    </button>
                                                </div>
                                                <p className="text-sm text-violet-300 font-mono">{item.pinyin}</p>
                                            </div>
                                            <button
                                                onClick={() => addStudyItem(item.ciyu, item.jieshi)}
                                                disabled={isExpressionInList(item.ciyu)}
                                                className="flex-shrink-0 flex items-center gap-2 px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                                                aria-label={isExpressionInList(item.ciyu) ? '已收藏' : '收藏'}
                                            >
                                                <PlusIcon added={isExpressionInList(item.ciyu)} />
                                            </button>
                                        </div>

                                        <div className="flex-grow space-y-2">
                                            <p className="text-slate-300 text-sm"><span className="font-semibold text-slate-400">释义：</span> {item.jieshi}</p>
                                            <p className="text-slate-400 text-sm italic"><span className="font-semibold not-italic text-slate-500">例句：</span> "{item.liju}"</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BreakdownTool;
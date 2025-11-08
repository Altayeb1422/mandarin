import React, { useState } from 'react';
import { checkExpression, getPronunciationAudio } from '../services/geminiService';
import { playAudio } from '../utils/audioUtils';
import { ExpressionCheckResult, YuanJuFenXi } from '../types';
import Spinner from './icons/Spinner';
import SpeakerIcon from './icons/SpeakerIcon';
import PlusIcon from './icons/PlusIcon';

interface ExpressionCheckerProps {
    addStudyItem: (biaoda: string, jieshi: string) => void;
    isExpressionInList: (biaoda: string) => boolean;
}

const ExpressionChecker: React.FC<ExpressionCheckerProps> = ({ addStudyItem, isExpressionInList }) => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState<ExpressionCheckResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [audioLoading, setAudioLoading] = useState<string | null>(null); // Store the text being loaded

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const checkResult = await checkExpression(input);
            setResult(checkResult);
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
    
    const AnalysisCategory: React.FC<{title: string, content?: string}> = ({ title, content }) => {
        if (!content) return null;
        return (
            <div>
                <h4 className="font-semibold text-slate-400 text-sm mb-1">{title}</h4>
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{content}</p>
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4 text-slate-100">表达优化</h2>
            <p className="mb-4 text-slate-400">输入您不确定的句子或表达，AI将进行深度分析并提供母语级的优化建议。</p>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="例如：我的爱好是玩电脑游戏。"
                    className="flex-grow p-3 bg-slate-800 border border-slate-700 rounded-md focus:ring-2 focus:ring-violet-500 focus:outline-none transition text-slate-200 placeholder:text-slate-500"
                    rows={2}
                />
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-violet-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {loading ? <Spinner /> : '分析'}
                </button>
            </form>

            {error && <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md mb-4" role="alert">{error}</div>}

            {result && (
                <div className="space-y-8 animate-fadeIn">
                    {/* Original Sentence & Analysis */}
                    <div className="bg-slate-800/50 p-6 rounded-lg shadow-lg border border-slate-700">
                        <h3 className="font-bold text-lg text-slate-100 mb-4">原句诊断报告</h3>
                        <p className="text-slate-300 italic text-lg mb-4 bg-slate-900/50 p-3 rounded-md">"{result.yuanju}"</p>
                        <div className="space-y-4">
                            <AnalysisCategory title="总体评价" content={result.yuanju_fenxi.zongti} />
                            <AnalysisCategory title="语法分析" content={result.yuanju_fenxi.yufa} />
                            <AnalysisCategory title="词汇建议" content={result.yuanju_fenxi.cihui} />
                            <AnalysisCategory title="语体与风格" content={result.yuanju_fenxi.yuti} />
                        </div>
                    </div>

                    {/* Elevated Suggestion */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-lg shadow-lg border border-cyan-500/50">
                        <h3 className="text-xl font-bold text-slate-100 mb-4">核心优化建议</h3>
                        <div className="flex items-center gap-4">
                            <p className="text-cyan-400 font-bold text-2xl tracking-wide">"{result.tishang_biaoda.biaoda}"</p>
                            <button onClick={() => handlePlayAudio(result.tishang_biaoda.biaoda)} disabled={audioLoading === result.tishang_biaoda.biaoda} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                {audioLoading === result.tishang_biaoda.biaoda ? <Spinner/> : <SpeakerIcon />}
                            </button>
                        </div>
                        <p className="text-violet-300 text-md font-mono mt-2">{result.tishang_biaoda.pinyin}</p>
                        
                        <div className="mt-4 pt-4 border-t border-slate-700">
                             <h4 className="font-semibold text-slate-300 text-md mb-2">优化解析</h4>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed mb-6">{result.tishang_biaoda.fenxi}</p>
                            <button 
                                onClick={() => addStudyItem(result.tishang_biaoda.biaoda, result.tishang_biaoda.fenxi)}
                                disabled={isExpressionInList(result.tishang_biaoda.biaoda)}
                                className="flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-green-500 transition-colors"
                            >
                                <PlusIcon added={isExpressionInList(result.tishang_biaoda.biaoda)} />
                                {isExpressionInList(result.tishang_biaoda.biaoda) ? '已收藏' : '收藏该表达'}
                            </button>
                        </div>
                    </div>

                    {/* Alternative Expressions */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-slate-100">更多地道说法</h3>
                        <div className="space-y-4">
                            {result.tihuan_biaoda.map((alt, index) => (
                                <div key={index} className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-3 mb-1">
                                                <p className="text-slate-200 font-semibold text-lg">"{alt.biaoda}"</p>
                                                <button onClick={() => handlePlayAudio(alt.biaoda)} disabled={audioLoading === alt.biaoda} className="text-slate-400 hover:text-cyan-400 transition-colors">
                                                    {audioLoading === alt.biaoda ? <Spinner/> : <SpeakerIcon />}
                                                </button>
                                            </div>
                                            <p className="text-violet-300 text-sm font-mono">{alt.pinyin}</p>
                                        </div>
                                        <button 
                                            onClick={() => addStudyItem(alt.biaoda, alt.shuoming)}
                                            disabled={isExpressionInList(alt.biaoda)}
                                            className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600/80 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
                                            aria-label={isExpressionInList(alt.biaoda) ? '已收藏' : '收藏'}
                                        >
                                            <PlusIcon added={isExpressionInList(alt.biaoda)} />
                                            <span>{isExpressionInList(alt.biaoda) ? '已收藏' : '收藏'}</span>
                                        </button>
                                    </div>
                                    <p className="text-slate-400 mt-2 text-sm leading-relaxed border-t border-slate-700/50 pt-2"><span className="font-semibold">语境说明：</span>{alt.shuoming}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            )}
        </div>
    );
};

export default ExpressionChecker;
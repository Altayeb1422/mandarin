import { GoogleGenAI, Type, GenerateContentResponse, Modality } from "@google/genai";
import { ExpressionCheckResult, BreakdownResult } from '../types';

// Using a function to get a new instance ensures the latest API key is used.
const getAi = () => new GoogleGenAI({apiKey: process.env.API_KEY});

export const checkExpression = async (expression: string): Promise<ExpressionCheckResult> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';

    const prompt = `
      你是一位顶尖的汉语语言学家和教育家，拥有多年对外汉语教学经验，尤其擅长帮助高级学习者突破瓶颈，使其语言表达能力达到准母语水平。

      请对以下用户提供的中文句子进行一次“深度诊断与优化”：
      句子: "${expression}"

      请严格按照以下步骤和JSON格式进行分析，所有解释都必须使用清晰、易懂的中文：

      1.  **原句深度分析 (yuanju_fenxi)**:
          -   对原句进行全面、深入的分析。请将分析清晰地分为以下几个方面：
          -   **zongti (总体评价)**: 对句子的总体评价和核心问题总结。
          -   **yufa (语法)**: (可选) 语法方面的具体分析和建议。
          -   **cihui (词汇)**: (可选) 词汇选择和搭配方面的具体分析和建议。
          -   **yuti (语体与风格)**: (可选) 语体、风格或文化语境方面的具体分析和建议。
          -   即使句子语法完全正确，也要在“总体评价”中探讨其表达是否平淡、生硬，或者听起来像“教科书中文”。如果某个可选方面没有问题，可以省略该字段。

      2.  **核心优化建议 (tishang_biaoda)**:
          -   提供一个核心的“提升版”建议。这个版本应该在用词上更精妙、句式上更地道、表达上更优雅，但同时保持自然、不做作，是高水平母语者在相应情境下会使用的表达。
          -   **biaoda**: 提升后的句子。
          -   **pinyin**: 提升后句子的带声调拼音。
          -   **fenxi**: 详细分析为什么这个版本更好，具体解释它在哪些方面（如词汇、结构、语气）超越了原句。

      3.  **更多地道说法 (tihuan_biaoda)**:
          -   提供一个包含2-3个其他地道表达的列表。这些表达可以适用于不同但相关的语境（例如，更口语化、更正式或带有不同情感色彩的说法）。
          -   对于每一个说法：
              -   **biaoda**: 另一个地道的句子。
              -   **pinyin**: 该句子的拼音。
              -   **shuoming**: 简要说明该表达的特点、适用语境或与核心建议的细微差别。

      请确保你的输出是严格符合以下定义的JSON对象。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            yuanju_fenxi: { 
                type: Type.OBJECT, 
                description: "对用户原始句子的深入、详细的分类语言学分析。",
                properties: {
                  zongti: { type: Type.STRING, description: "对句子的总体评价和核心问题总结。" },
                  yufa: { type: Type.STRING, description: "语法方面的具体分析和建议。" },
                  cihui: { type: Type.STRING, description: "词汇选择和搭配方面的具体分析和建议。" },
                  yuti: { type: Type.STRING, description: "语体、风格或文化语境方面的具体分析和建议。" }
                },
                required: ["zongti"]
            },
            tishang_biaoda: {
                type: Type.OBJECT,
                description: "一个核心的、表达更优雅且地道的优化建议。",
                properties: {
                    biaoda: { type: Type.STRING, description: "提升后的句子。" },
                    pinyin: { type: Type.STRING, description: "提升后句子的带声调拼音。" },
                    fenxi: { type: Type.STRING, description: "详细分析为什么这个提升版更好。" }
                },
                required: ["biaoda", "pinyin", "fenxi"]
            },
            tihuan_biaoda: {
                type: Type.ARRAY,
                description: "一个包含多个其他地道表达方式的列表。",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        biaoda: { type: Type.STRING, description: "另一个地道的表达。" },
                        pinyin: { type: Type.STRING, description: "该表达的拼音。" },
                        shuoming: { type: Type.STRING, description: "关于该表达适用语境或特点的简要说明。" }
                    },
                    required: ["biaoda", "pinyin", "shuoming"]
                }
            }
        },
        required: ["yuanju_fenxi", "tishang_biaoda", "tihuan_biaoda"],
    };

    try {
        const result: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonString = result.text.trim();
        const parsedResult = JSON.parse(jsonString);
        // Add the original sentence back into the result for display purposes
        return { ...parsedResult, yuanju: expression };
    } catch (error) {
        console.error("检查表达时出错:", error);
        throw new Error("无法检查表达，请重试。");
    }
};

export const getBreakdown = async (sentence: string): Promise<BreakdownResult> => {
    const ai = getAi();
    const model = 'gemini-2.5-flash';
    const prompt = `
        你是一位专业的、富有洞察力的汉语教师。请对以下句子进行全面的深度解析。
        句子: "${sentence}"

        你的任务分为两个部分：

        第一部分：对整个句子进行综合分析。
        1.  **拼音 (pinyin)**: 提供整个句子的标准拼音，带声调。
        2.  **释义 (jieshi)**: 用清晰的中文解释整个句子的含义和语境。
        3.  **相似例句 (liju)**: 提供一个结构相似或意思相近的例句，帮助理解用法。
        4.  **补充信息 (buchong)**: （可选）提供关于语法结构、文化背景或表达方式的额外见解。

        第二部分：将句子分解为其核心的词语或短语。
        -   对于每一个核心词语/短语，请提供它的拼音、一个简单的中文解释，以及一个使用该词语/短语的例句。

        请严格按照以下JSON格式返回结果，所有字段都必须使用中文。
    `;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            sentenceAnalysis: {
                type: Type.OBJECT,
                properties: {
                    pinyin: { type: Type.STRING, description: "整个句子的拼音。" },
                    jieshi: { type: Type.STRING, description: "整个句子的中文释义。" },
                    liju: { type: Type.STRING, description: "一个与原句结构或意思相似的例句。" },
                    buchong: { type: Type.STRING, description: "关于句子语法或文化背景的补充信息。" },
                },
                required: ["pinyin", "jieshi", "liju"]
            },
            wordBreakdowns: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        ciyu: { type: Type.STRING, description: "核心词语或短语。" },
                        pinyin: { type: Type.STRING, description: "该词语的拼音。" },
                        jieshi: { type: Type.STRING, description: "对该词语的简单中文解释。" },
                        liju: { type: Type.STRING, description: "一个使用该词语的例句。" },
                    },
                    required: ["ciyu", "pinyin", "jieshi", "liju"]
                }
            }
        },
        required: ["sentenceAnalysis", "wordBreakdowns"]
    };

    try {
        const result: GenerateContentResponse = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });
        const jsonString = result.text.trim();
        const parsedResult = JSON.parse(jsonString) as BreakdownResult;
        // Add the original sentence to the analysis part for easy access
        parsedResult.sentenceAnalysis.yuanju = sentence;
        return parsedResult;
    } catch (error) {
        console.error("解析句子时出错:", error);
        throw new Error("无法解析句子，请重试。");
    }
};

export const getPronunciationAudio = async (text: string): Promise<string> => {
    if (!text || text.trim() === '') {
        throw new Error("Cannot generate audio for empty text.");
    }
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: { parts: [{ text: `朗读: ${text}` }] }, // FIX: Changed from [{ parts... }] to { parts... }
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Zephyr' }, 
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("API未返回音频数据。");
        }
        return base64Audio;
    } catch (error) {
        console.error("生成发音音频时出错:", error);
        throw new Error("未能生成音频。");
    }
};
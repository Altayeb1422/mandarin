// types.ts

export interface WordBreakdown {
    ciyu: string;      // 词语 (Word/Phrase)
    pinyin: string;
    jieshi: string;     // 解释 (Explanation/Definition)
    liju: string;       // 例句 (Example Sentence)
}

export interface SentenceAnalysis {
    yuanju: string;
    pinyin: string;
    jieshi: string;
    liju: string;
    buchong?: string;
}

export interface BreakdownResult {
    sentenceAnalysis: SentenceAnalysis;
    wordBreakdowns: WordBreakdown[];
}

// Represents an alternative way to phrase something
export interface AlternativeExpression {
  biaoda: string;   // 表达 (The expression itself)
  pinyin: string;
  shuoming: string; // 说明 (Explanation of its nuance/context)
}

// Represents the main, elevated suggestion
export interface ElevatedExpression {
  biaoda: string;
  pinyin: string;
  fenxi: string;    // 分析 (Analysis of why it's a better expression)
}

// New: Structured analysis for the original sentence
export interface YuanJuFenXi {
  zongti: string; // 总体评价 (Overall Evaluation)
  yufa?: string;  // 语法 (Grammar)
  cihui?: string; // 词汇 (Vocabulary)
  yuti?: string;  // 语体与风格 (Style & Tone)
}

export interface ExpressionCheckResult {
    yuanju: string;               // 原句 (Original Sentence)
    yuanju_fenxi: YuanJuFenXi;    // 原句分析 (Deep analysis of the original sentence)
    tishang_biaoda: ElevatedExpression; // 提升表达 (The main, elevated suggestion)
    tihuan_biaoda: AlternativeExpression[]; // 替换表达 (Other native alternatives)
}


export interface StudyItem {
    id: string;
    biaoda: string;     // 表达 (Expression)
    jieshi: string;     // 解释 (Explanation)
    createdAt: string;
}
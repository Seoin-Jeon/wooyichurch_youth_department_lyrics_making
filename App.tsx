
import React, { useState, useMemo, useCallback } from 'react';
import { Download, Layout, Type, Palette, FileText, Settings as SettingsIcon, Sparkles, AlignJustify } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { SlideConfig, LyricSlide } from './types';
import { DEFAULT_CONFIG, FONT_OPTIONS } from './constants';
import { generatePPTX } from './services/pptxService';

const App: React.FC = () => {
  const [lyrics, setLyrics] = useState<string>('동해 물과 백두산이 마르고 닳도록\n하느님이 보우하사 우리나라 만세\n\n무궁화 삼천리 화려 강산\n대한 사람 대한으로 길이 보전하세\n\nLyricSlide Pro Automation\nCreate Beautiful Slides Quickly');
  const [config, setConfig] = useState<SlideConfig>(DEFAULT_CONFIG);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);

  // Split lyrics into slides based on double line breaks (paragraphs)
  const slides: LyricSlide[] = useMemo(() => {
    return lyrics
      .split(/\n\s*\n/)
      .filter(p => p.trim().length > 0)
      .map(p => ({
        lines: p.split('\n').map(l => l.trim())
      }));
  }, [lyrics]);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      await generatePPTX(slides, config, 'Song_Lyrics_Slides.pptx');
    } catch (error) {
      console.error('Failed to generate PPTX:', error);
      alert('PPTX 생성을 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const cleanLyricsWithAI = async () => {
    if (!lyrics.trim()) return;
    setIsCleaning(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `아래 가사에서 불필요한 공백, 광고 문구, 타임스탬프를 제거하고 슬라이드 제작에 적합하도록 문단 구분을 깔끔하게 정리해줘.
        규칙: 
        1. 한 구절마다 줄바꿈.
        2. 슬라이드가 바뀔 지점(문단)은 빈 줄 두 개로 구분.
        가사:
        ${lyrics}`,
      });
      if (response.text) {
        setLyrics(response.text.trim());
      }
    } catch (error) {
      console.error('AI cleaning failed:', error);
      alert('AI 가사 정리에 실패했습니다.');
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100">
      {/* Sidebar / Configuration */}
      <div className="w-full md:w-96 bg-white shadow-xl flex flex-col z-10 border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Layout className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">LyricSlide Pro</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Font Settings Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <SettingsIcon className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">글꼴 상세 설정</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">한글 폰트</label>
                <select 
                  value={config.koreanFont}
                  onChange={(e) => setConfig({ ...config, koreanFont: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">영어 폰트</label>
                <select 
                  value={config.englishFont}
                  onChange={(e) => setConfig({ ...config, englishFont: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  {FONT_OPTIONS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">글자 크기 (pt)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range"
                    min="20"
                    max="120"
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) })}
                    className="flex-1 accent-indigo-600"
                  />
                  <input 
                    type="number" 
                    value={config.fontSize}
                    onChange={(e) => setConfig({ ...config, fontSize: parseInt(e.target.value) || 30 })}
                    className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Style Settings Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-slate-500 mb-2">
              <AlignJustify className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">간격 설정</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">행간 (배수)</label>
              <div className="flex items-center gap-3">
                <input 
                  type="range"
                  min="0.8"
                  max="3.0"
                  step="0.1"
                  value={config.lineSpacing}
                  onChange={(e) => setConfig({ ...config, lineSpacing: parseFloat(e.target.value) })}
                  className="flex-1 accent-indigo-600"
                />
                <input 
                  type="number" 
                  step="0.1"
                  value={config.lineSpacing}
                  onChange={(e) => setConfig({ ...config, lineSpacing: parseFloat(e.target.value) || 1.0 })}
                  className="w-16 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-500 mb-2 pt-2">
              <Palette className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">스타일 & 레이아웃</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="group">
                <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">글자색</label>
                <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                  <input 
                    type="color" 
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    className="w-8 h-8 border-none rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{config.textColor}</span>
                </div>
              </div>
              <div className="group">
                <label className="block text-xs font-medium text-slate-500 mb-1 ml-1">배경색</label>
                <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg">
                  <input 
                    type="color" 
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-8 h-8 border-none rounded cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] font-mono text-slate-400 uppercase">{config.backgroundColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">화면 비율</label>
              <div className="flex gap-2">
                {(['16:9', '4:3'] as const).map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setConfig({ ...config, aspectRatio: ratio })}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      config.aspectRatio === ratio 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-4 mt-auto">
            <button
              onClick={handleDownload}
              disabled={isGenerating || slides.length === 0}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-[0.98]"
            >
              <Download className="w-5 h-5" />
              {isGenerating ? 'PPT 생성 중...' : 'PPTX 다운로드'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Lyrics Editor & Live Preview */}
      <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
          
          {/* Editor Area */}
          <div className="flex-1 flex flex-col min-h-0 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 text-slate-700">
                <FileText className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-bold tracking-tight">가사 입력</span>
              </div>
              <button 
                onClick={cleanLyricsWithAI}
                disabled={isCleaning || !lyrics.trim()}
                className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full hover:bg-indigo-100 transition-all font-semibold disabled:opacity-50 border border-indigo-100"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isCleaning ? '정리 중...' : 'AI 가사 자동 정리'}
              </button>
            </div>
            <textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="여기에 가사를 입력하세요.&#10;줄바꿈은 한 슬라이드 내 줄바꿈,&#10;빈 줄 한 칸은 다음 슬라이드로 분리됩니다."
              className="flex-1 w-full p-6 text-slate-700 resize-none focus:outline-none text-base leading-relaxed font-mono bg-white"
            />
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
              <span className="text-xs font-bold text-indigo-600">총 {slides.length}개의 슬라이드</span>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 text-slate-500 mb-3 px-1">
              <Type className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">미리보기</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-6 pr-4 custom-scrollbar">
              {slides.map((slide, index) => (
                <div 
                  key={index}
                  className="relative group"
                >
                  <div className="absolute -left-10 top-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div 
                    className="w-full shadow-2xl rounded-xl flex items-center justify-center p-8 transition-all hover:scale-[1.01] border border-slate-200 overflow-hidden"
                    style={{ 
                      backgroundColor: config.backgroundColor,
                      aspectRatio: config.aspectRatio === '16:9' ? '16/9' : '4/3'
                    }}
                  >
                    <div 
                      className="text-center break-words w-full"
                      style={{ 
                        color: config.textColor,
                        fontSize: `${config.fontSize / 3.2}vw`, // Proportional for preview
                        fontFamily: `${config.englishFont}, ${config.koreanFont}`,
                        fontWeight: 'bold',
                        lineHeight: config.lineSpacing,
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      {slide.lines.map((line, lIdx) => (
                        <div key={lIdx}>{line}</div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              
              {slides.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
                  <Layout className="w-12 h-12 mb-4 opacity-10" />
                  <p className="text-sm font-semibold text-slate-300">가사를 입력하여 슬라이드를<br/>생성하고 미리보세요.</p>
                </div>
              )}
              
              <div className="h-20" /> {/* Spacer */}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default App;

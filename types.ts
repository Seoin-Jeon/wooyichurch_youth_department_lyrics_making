
export interface SlideConfig {
  koreanFont: string;
  englishFont: string;
  fontSize: number;
  lineSpacing: number;
  textColor: string;
  backgroundColor: string;
  aspectRatio: '16:9' | '4:3';
}

export interface LyricSlide {
  lines: string[];
}

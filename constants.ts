
import { SlideConfig } from './types';

export const FONT_OPTIONS = [
  { label: '맑은 고딕 (Malgun Gothic)', value: 'Malgun Gothic' },
  { label: '나눔고딕 (NanumGothic)', value: 'NanumGothic' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Pretendard', value: 'Pretendard' },
  { label: 'System Serif', value: 'serif' },
  { label: 'System Sans-Serif', value: 'sans-serif' }
];

export const DEFAULT_CONFIG: SlideConfig = {
  koreanFont: 'Malgun Gothic',
  englishFont: 'Arial',
  fontSize: 44,
  lineSpacing: 1.2,
  textColor: '#FFFFFF',
  backgroundColor: '#000000',
  aspectRatio: '16:9'
};

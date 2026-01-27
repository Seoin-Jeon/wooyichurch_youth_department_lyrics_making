
import pptxgen from 'pptxgenjs';
import { SlideConfig, LyricSlide } from '../types';

/**
 * Splits a string into segments of Korean and Non-Korean (English/Symbols) text.
 */
const segmentText = (text: string, koreanFont: string, englishFont: string) => {
  const segments: { text: string; options: any }[] = [];
  // Regex to match sequences of Korean characters vs everything else
  // Hangul Syllables: \uAC00-\uD7AF, Hangul Jamo: \u1100-\u11FF, etc.
  const regex = /([\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+)|([^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+)/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      // Korean match
      segments.push({ text: match[1], options: { fontFace: koreanFont } });
    } else if (match[2]) {
      // Non-Korean match
      segments.push({ text: match[2], options: { fontFace: englishFont } });
    }
  }
  return segments;
};

export const generatePPTX = async (slides: LyricSlide[], config: SlideConfig, fileName: string = 'Lyrics.pptx') => {
  const pres = new pptxgen();
  
  if (config.aspectRatio === '16:9') {
    pres.layout = 'LAYOUT_16x9';
  } else {
    pres.layout = 'LAYOUT_4x3';
  }

  slides.forEach((slideData) => {
    const slide = pres.addSlide();
    slide.background = { fill: config.backgroundColor };

    // We process each line and create text chunks for pptxgenjs
    const textObjects: any[] = [];
    
    slideData.lines.forEach((line, index) => {
      const lineSegments = segmentText(line, config.koreanFont, config.englishFont);
      textObjects.push(...lineSegments);
      
      // Add a newline after each line except the last one
      if (index < slideData.lines.length - 1) {
        textObjects.push({ text: '\n', options: { fontFace: config.englishFont } });
      }
    });

    slide.addText(textObjects, {
      x: '10%',
      y: '10%',
      w: '80%',
      h: '80%',
      align: 'center',
      valign: 'middle',
      fontSize: config.fontSize,
      color: config.textColor.replace('#', ''),
      bold: true,
      lineSpacing: config.fontSize * config.lineSpacing,
    });
  });

  return pres.writeFile({ fileName });
};

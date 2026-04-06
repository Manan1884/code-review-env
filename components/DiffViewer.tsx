'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AgentAction } from '@/types';

// Lazy load SyntaxHighlighter with ssr: false
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.Light),
  { ssr: false }
);

interface DiffViewerProps {
  diff: string;
  annotations: AgentAction[];
  language: string;
}

export default function DiffViewer({ diff, annotations, language }: DiffViewerProps) {
  const [hoveredAnnotation, setHoveredAnnotation] = useState<AgentAction | null>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);
  const [style, setStyle] = useState<any>(null);

  const lines = diff.split('\n');

  // Load style on client side
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/hljs').then((mod) => {
      setStyle(mod.atomOneDark);
    });
  }, []);

  const getAnnotationForLine = (lineNum: number): AgentAction | undefined => {
    return annotations.find(a => a.lineNumber === lineNum);
  };

  const getCategoryColor = (category?: string): string => {
    switch (category) {
      case 'style':
        return '#60a5fa';
      case 'logic':
        return '#fbbf24';
      case 'security':
        return '#f87171';
      default:
        return 'transparent';
    }
  };

  const mapLanguage = (lang: string): string => {
    const langMap: Record<string, string> = {
      javascript: 'javascript',
      typescript: 'typescript',
      python: 'python',
      go: 'go',
      java: 'java',
    };
    return langMap[lang] || 'text';
  };

  return (
    <div className="relative rounded-lg overflow-hidden border border-[#1f1f1f] bg-[#0d0d0d]">
      <div className="flex">
        <div className="bg-[#141414] border-r border-[#1f1f1f] select-none">
          {lines.map((_, index) => {
            const lineNum = index + 1;
            const annotation = getAnnotationForLine(lineNum);
            return (
              <div
                key={lineNum}
                className={`px-3 py-0.5 text-sm font-mono text-gray-500 text-right cursor-pointer transition-colors ${
                  annotation ? 'font-bold' : ''
                }`}
                style={{
                  backgroundColor: annotation ? getCategoryColor(annotation.category) + '20' : 'transparent',
                }}
                onMouseEnter={() => {
                  if (annotation) {
                    setHoveredAnnotation(annotation);
                    setHoveredLine(lineNum);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredAnnotation(null);
                  setHoveredLine(null);
                }}
              >
                {lineNum}
              </div>
            );
          })}
        </div>
        <div className="flex-1 overflow-x-auto">
          {style && (
            <SyntaxHighlighter
              language={mapLanguage(language)}
              style={style}
              customStyle={{
                margin: 0,
                padding: 0,
                background: 'transparent',
              }}
              lineProps={(lineNum: number) => {
                const annotation = getAnnotationForLine(lineNum);
                return {
                  style: {
                    backgroundColor: annotation ? getCategoryColor(annotation.category) + '15' : 'transparent',
                    display: 'block',
                    width: '100%',
                  },
                  onMouseEnter: () => {
                    if (annotation) {
                      setHoveredAnnotation(annotation);
                      setHoveredLine(lineNum);
                    }
                  },
                  onMouseLeave: () => {
                    setHoveredAnnotation(null);
                    setHoveredLine(null);
                  },
                };
              }}
              showLineNumbers={false}
              wrapLines={true}
            >
              {diff}
            </SyntaxHighlighter>
          )}
          {!style && (
            <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap">{diff}</pre>
          )}
        </div>
      </div>
      
      {hoveredAnnotation && hoveredLine && (
        <div
          className="absolute z-10 p-3 rounded-lg shadow-xl border max-w-sm"
          style={{
            backgroundColor: 'rgba(20, 20, 20, 0.98)',
            borderColor: getCategoryColor(hoveredAnnotation.category),
            top: `${hoveredLine * 24 + 10}px`,
            left: '60px',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold uppercase"
              style={{
                backgroundColor: getCategoryColor(hoveredAnnotation.category),
                color: hoveredAnnotation.category === 'style' ? '#0d0d0d' : '#fff',
              }}
            >
              {hoveredAnnotation.category}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold uppercase"
              style={{
                backgroundColor: hoveredAnnotation.severity === 'high' ? '#f87171' : hoveredAnnotation.severity === 'medium' ? '#fbbf24' : '#60a5fa',
                color: '#0d0d0d',
              }}
            >
              {hoveredAnnotation.severity}
            </span>
          </div>
          <p className="text-sm text-gray-300">{hoveredAnnotation.comment}</p>
        </div>
      )}
    </div>
  );
}

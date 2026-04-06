declare module 'react-syntax-highlighter' {
  import { FC } from 'react';
  
  interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    customStyle?: React.CSSProperties;
    lineProps?: (lineNumber: number) => any;
    showLineNumbers?: boolean;
    wrapLines?: boolean;
    children: string;
  }
  
  export const Light: FC<SyntaxHighlighterProps>;
  export const Prism: FC<SyntaxHighlighterProps>;
  export default Light;
}

declare module 'react-syntax-highlighter/dist/esm/styles/hljs' {
  export const atomOneDark: any;
  export const atomOneLight: any;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

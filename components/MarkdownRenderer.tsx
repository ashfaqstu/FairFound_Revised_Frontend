import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
    <ReactMarkdown
      components={{
        // Headers
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-4 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mt-3 mb-1">{children}</h3>
        ),
        // Paragraphs
        p: ({ children }) => (
          <p className="text-slate-700 dark:text-slate-300 mb-2 leading-relaxed">{children}</p>
        ),
        // Bold
        strong: ({ children }) => (
          <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>
        ),
        // Italic
        em: ({ children }) => (
          <em className="italic text-slate-600 dark:text-slate-400">{children}</em>
        ),
        // Lists
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="text-slate-700 dark:text-slate-300">{children}</li>
        ),
        // Code
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded text-sm font-mono">
                {children}
              </code>
            );
          }
          return (
            <code className="block p-3 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg text-sm font-mono overflow-x-auto">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="mb-3">{children}</pre>
        ),
        // Blockquote
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-indigo-500 pl-4 py-1 my-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-r-lg">
            {children}
          </blockquote>
        ),
        // Links
        a: ({ href, children }) => (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            {children}
          </a>
        ),
        // Horizontal rule
        hr: () => (
          <hr className="my-4 border-slate-200 dark:border-slate-700" />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

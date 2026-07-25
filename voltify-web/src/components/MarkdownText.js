import React from 'react';

// Hafif markdown render: **kalın**, madde işaretleri (* / -) ve paragraflar.
// Gemini'nin ürettiği e-posta/tavsiye metinlerini düzgün göstermek için (harici bağımlılık yok).

const renderInline = (text) => {
  // **kalın** parçalarını ayır
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-gray-900 dark:text-white">{part.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
};

const MarkdownText = ({ text, className = '' }) => {
  const lines = (text || '').split('\n');
  const blocks = [];
  let listItems = [];

  const flushList = (key) => {
    if (listItems.length) {
      blocks.push(
        <ul key={`ul-${key}`} className="list-disc pl-5 space-y-1 my-2">{listItems}</ul>
      );
      listItems = [];
    }
  };

  lines.forEach((rawLine, i) => {
    const line = rawLine.trim();
    if (/^[*-]\s+/.test(line)) {
      listItems.push(<li key={i}>{renderInline(line.replace(/^[*-]\s+/, ''))}</li>);
    } else if (/^#{1,6}\s+/.test(line)) {
      flushList(i);
      blocks.push(
        <h4 key={i} className="font-bold text-gray-900 dark:text-white mt-2">{renderInline(line.replace(/^#{1,6}\s+/, ''))}</h4>
      );
    } else if (line === '') {
      flushList(i);
    } else {
      flushList(i);
      blocks.push(<p key={i} className="leading-relaxed">{renderInline(line)}</p>);
    }
  });
  flushList('end');

  return <div className={`space-y-2 ${className}`}>{blocks}</div>;
};

export default MarkdownText;

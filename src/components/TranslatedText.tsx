import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslatedTextProps {
  text: string;
  className?: string;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'li';
  dangerouslySetInnerHTML?: boolean;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  text, 
  className = '', 
  as: Component = 'span',
  dangerouslySetInnerHTML = false
}) => {
  const { currentLanguage, translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    const translateText = async () => {
      if (currentLanguage === 'en' || !text) {
        setTranslatedText(text);
        return;
      }

      setIsTranslating(true);
      try {
        const translated = await translate(text);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Translation failed:', error);
        setTranslatedText(text);
      } finally {
        setIsTranslating(false);
      }
    };

    translateText();
  }, [text, currentLanguage, translate]);

  if (isTranslating) {
    return (
      <Component className={`${className} animate-pulse`}>
        <span className="bg-gray-200 rounded px-1">Translating...</span>
      </Component>
    );
  }

  if (dangerouslySetInnerHTML) {
    return (
      <Component 
        className={className}
        dangerouslySetInnerHTML={{ __html: translatedText }}
      />
    );
  }

  return (
    <Component className={className}>
      {translatedText}
    </Component>
  );
};

export default TranslatedText;
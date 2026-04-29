import React, { useState, useEffect, useRef } from 'react';

export default function FlashCard({ wordPair, directionEnRu, onLevelChange }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const lastPlayedRef = useRef({ id: null, isShowingEnglish: null });

  // Auto-play English pronunciation ONLY when English face is shown
  useEffect(() => {
    if (!wordPair) return;

    const isShowingEnglish = directionEnRu ? !isFlipped : isFlipped;

    if (!isShowingEnglish) {
      window.speechSynthesis.cancel();
      lastPlayedRef.current = { id: wordPair.id, isShowingEnglish: false };
      return;
    }

    if (lastPlayedRef.current.id === wordPair.id && lastPlayedRef.current.isShowingEnglish === true) {
      return; // Prevent replay if same word didn't change flip state (e.g. level updated)
    }

    lastPlayedRef.current = { id: wordPair.id, isShowingEnglish: true };
    window.speechSynthesis.cancel();

    const speak = () => {
      const utterance = new SpeechSynthesisUtterance(wordPair.en);
      utterance.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang.startsWith("en"));
      if (voice) utterance.voice = voice;
      window.speechSynthesis.speak(utterance);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      speak();
    } else {
      // Voices not loaded yet — wait for them
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        speak();
      };
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, [wordPair, directionEnRu, isFlipped]);

  if (!wordPair) return null;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePlay = (e, text, lang) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    // Attempt to select an appropriate voice
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }
    window.speechSynthesis.speak(utterance);
  };

  // Determine what shows on front and back based on direction
  const frontText = directionEnRu ? wordPair.en : wordPair.ru;
  const backText = directionEnRu ? wordPair.ru : wordPair.en;

  const frontLang = directionEnRu ? 'en-US' : 'ru-RU';
  const backLang = directionEnRu ? 'ru-RU' : 'en-US';

  const handleLevelClick = (e) => {
    e.stopPropagation();
    if (!onLevelChange) return;
    const currentLevel = wordPair.level || 0;
    const nextLevel = currentLevel >= 4 ? 0 : currentLevel + 1;
    onLevelChange(nextLevel);
  };

  const renderKnowledgeBlocks = () => {
    const level = wordPair.level || 0;
    return (
      <div
        onClick={handleLevelClick}
        style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', gap: 2, cursor: 'pointer', zIndex: 10 }}
        title="Knowledge level (click to increase)"
      >
        {[1, 2, 3, 4].map(idx => {
          let bgColor = '#e0e0e0';
          if (idx <= level) {
            switch (idx) {
                case 1: bgColor = '#ffcccb'; break;
                case 2: bgColor = '#e8cc4c'; break;
                case 3: bgColor = '#c4e353'; break;
                case 4: bgColor = '#51d34b'; break;
            }
          }
          return (
            <div
              key={idx}
              style={{
                width: 8,
                height: 14,
                backgroundColor: bgColor,
                border: '1px solid #ccc',
                borderRadius: 2
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-face">
          {renderKnowledgeBlocks()}
          <button className="play-btn" onClick={(e) => handlePlay(e, frontText, frontLang)} title="Play pronunciation">
            🔊
          </button>
          <span>{frontText}</span>
          <span className="card-hint">Click to flip</span>
        </div>
        <div className="flashcard-face flashcard-back">
          {renderKnowledgeBlocks()}
          <button className="play-btn" onClick={(e) => handlePlay(e, backText, backLang)} title="Play pronunciation">
            🔊
          </button>
          <span>{backText}</span>
          <span className="card-hint">Click to flip back</span>
        </div>
      </div>
    </div>
  );
}

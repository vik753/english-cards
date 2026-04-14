import React, { useState, useEffect } from 'react';

export default function FlashCard({ wordPair, directionEnRu }) {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state if the word changes
  useEffect(() => {
    setIsFlipped(false);
  }, [wordPair, directionEnRu]);

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

  return (
    <div className="flashcard-container" onClick={handleFlip}>
      <div className={`flashcard ${isFlipped ? 'is-flipped' : ''}`}>
        <div className="flashcard-face">
          <button className="play-btn" onClick={(e) => handlePlay(e, frontText, frontLang)} title="Play pronunciation">
            🔊
          </button>
          <span>{frontText}</span>
          <span className="card-hint">Click to flip</span>
        </div>
        <div className="flashcard-face flashcard-back">
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

import React, { useState, useEffect } from 'react';
import FlashCard from './FlashCard';
import WordManager from './WordManager';

export default function App() {
  const [words, setWords] = useState(() => {
    const saved = localStorage.getItem('cards_dictionary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse dictionary", e);
      }
    }
    return [];
  });
  const [view, setView] = useState('learn'); // 'learn' | 'manage'
  const [directionEnRu, setDirectionEnRu] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const learningWords = words.filter(w => !w.learned);

  // Adjust index if out of bounds (React recommends doing this during render)
  if (learningWords.length > 0 && currentWordIndex >= learningWords.length) {
    setCurrentWordIndex(Math.max(0, learningWords.length - 1));
  }

  // Save to localStorage whenever words change
  useEffect(() => {
    localStorage.setItem('cards_dictionary', JSON.stringify(words));
  }, [words]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        const importedArray = Object.entries(json).map(([en, ru], idx) => ({
          id: Date.now() + idx,
          en: en.trim(),
          ru: ru.trim()
        }));
        setWords(prev => [...prev, ...importedArray]);
      } catch (err) {
        console.error(err);
        alert("Invalid JSON format. Please upload a valid JSON file like {\"word\": \"translation\"}.");
      }
    };
    reader.readAsText(file);
    e.target.value = null; // reset input
  };

  const nextWord = () => {
    if (learningWords.length === 0) return;
    setCurrentWordIndex((prev) => (prev + 1) % learningWords.length);
  };

  const prevWord = () => {
    if (learningWords.length === 0) return;
    setCurrentWordIndex((prev) => (prev - 1 + learningWords.length) % learningWords.length);
  };

  const handleMarkLearned = (e) => {
    if (learningWords.length === 0) return;
    const currentId = learningWords[currentWordIndex].id;
    setWords(words.map(w => w.id === currentId ? { ...w, learned: e.target.checked } : w));
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>CARDS</h1>
        <div className="header-controls">
          <div className="file-upload-wrapper btn btn-secondary">
            Load words from .json
            <input type="file" accept=".json" onChange={handleFileUpload} />
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setDirectionEnRu(!directionEnRu)}
          >
            {directionEnRu ? "En-Ru" : "Ru-En"}
          </button>
          <button
            className="btn"
            onClick={() => setView(view === 'learn' ? 'manage' : 'learn')}
          >
            {view === 'learn' ? 'Manage Words' : 'Start Learn'}
          </button>
        </div>
      </header>

      <main className="main-content">
        {view === 'learn' ? (
          learningWords.length > 0 ? (
            <>
              <FlashCard
                key={`${learningWords[currentWordIndex]?.id}-${directionEnRu}`}
                wordPair={learningWords[currentWordIndex]}
                directionEnRu={directionEnRu}
              />

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <input
                    type="checkbox"
                    checked={!!learningWords[currentWordIndex].learned}
                    onChange={handleMarkLearned}
                    style={{ width: '1.2rem', height: '1.2rem' }}
                  />
                  Mark as learned
                </label>
              </div>

              <div className="controls-bar">
                <button className="btn btn-secondary" onClick={prevWord}>Previous</button>
                <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                  {currentWordIndex + 1} / {learningWords.length}
                </div>
                <button className="btn" onClick={nextWord}>Next Step</button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h3>{words.length > 0 ? "You've learned all words!" : "No words loaded!"}</h3>
              <p>{words.length > 0 ? "Go to Manage Words to review them." : "Click \"Load words\" to import a JSON file and start learning."}</p>
            </div>
          )
        ) : (
          <WordManager words={words} setWords={setWords} />
        )}
      </main>
    </div>
  );
}

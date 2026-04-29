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

  const [currentRound, setCurrentRound] = useState(() => {
    const saved = localStorage.getItem('cards_current_round');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [roundQueue, setRoundQueue] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const learningWords = words.filter(w => !w.learned);
  const currentWordId = roundQueue[currentWordIndex];
  const currentWordPair = words.find(w => w.id === currentWordId);

  // Save currentRound to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cards_current_round', currentRound.toString());
  }, [currentRound]);

  // Generate queue for the current round
  useEffect(() => {
    if (learningWords.length === 0) {
      setRoundQueue([]);
      return;
    }

    const available = learningWords.filter(w => (w.nextRound || 1) <= currentRound);

    if (available.length === 0) {
      // Fast-forward to the next round that has words
      const minRound = Math.min(...learningWords.map(w => w.nextRound || 1));
      if (minRound > currentRound) {
        setCurrentRound(minRound);
      }
      return;
    }

    // Shuffle the available words
    const shuffledIds = available.map(w => w.id).sort(() => Math.random() - 0.5);
    setRoundQueue(shuffledIds);
    setCurrentWordIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentRound, words.length]); // Intentionally omitting full words dependency to prevent mid-round reshuffling

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
    if (roundQueue.length === 0) return;

    // Assign nextRound based on skip logic before moving
    if (currentWordPair) {
      let skip = 0;
      const lvl = currentWordPair.level || 0;
      if (lvl === 2) skip = 1;
      else if (lvl === 3) skip = 3;
      else if (lvl === 4) skip = 4;

      const newNextRound = currentRound + 1 + skip;
      setWords(prev => prev.map(w => w.id === currentWordId ? { ...w, nextRound: newNextRound } : w));
    }

    if (currentWordIndex >= roundQueue.length - 1) {
      setCurrentRound(r => r + 1);
    } else {
      setCurrentWordIndex(i => i + 1);
    }
  };

  const prevWord = () => {
    if (roundQueue.length === 0) return;
    if (currentWordIndex > 0) {
      setCurrentWordIndex(i => i - 1);
    }
  };

  const handleMarkLearned = (e) => {
    if (!currentWordId) return;
    setWords(words.map(w => w.id === currentWordId ? { ...w, learned: e.target.checked } : w));
  };

  const handleLevelChange = (newLevel) => {
    if (!currentWordId) return;
    setWords(words.map(w => w.id === currentWordId ? { ...w, level: newLevel } : w));
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  }, [isMenuOpen]);

  return (
    <div className="app-container">
      <header className="header">
        <h1>CARDS</h1>
        <button
          className="btn btn-secondary lang-toggle-btn"
          onClick={() => { setDirectionEnRu(!directionEnRu); setIsMenuOpen(false); }}
        >
          {directionEnRu ? "En-Ru" : "Ru-En"}
        </button>
        <div>
          <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle menu">
            {isMenuOpen ? '✖' : '☰'}
          </button>
          <div className={`header-controls ${isMenuOpen ? 'mobile-open' : ''}`}>
            <div className="file-upload-wrapper btn btn-secondary">
              Load words from .json
              <input type="file" accept=".json" onChange={(e) => { handleFileUpload(e); setIsMenuOpen(false); }} />
            </div>
            <button
              className="btn"
              onClick={() => { setView(view === 'learn' ? 'manage' : 'learn'); setIsMenuOpen(false); }}
            >
              {view === 'learn' ? 'Manage Words' : 'Start Learn'}
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {view === 'learn' ? (
          roundQueue.length > 0 && currentWordPair ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '0.5rem', color: '#666', fontWeight: 'bold' }}>
                Round {currentRound}
              </div>
              <FlashCard
                key={`${currentWordId}-${directionEnRu}`}
                wordPair={currentWordPair}
                directionEnRu={directionEnRu}
                onLevelChange={handleLevelChange}
              />

              <div className="bottom-checkbox-container">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '1.1rem', background: 'rgba(255,255,255,0.7)', padding: '0.5rem 1rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                  <input
                    type="checkbox"
                    checked={!!currentWordPair.learned}
                    onChange={handleMarkLearned}
                    style={{ width: '1.2rem', height: '1.2rem' }}
                  />
                  Mark as learned
                </label>
              </div>

              <div className="controls-bar">
                <button className="btn btn-secondary" onClick={prevWord} disabled={currentWordIndex === 0}>Previous</button>
                <div style={{ alignSelf: 'center', fontWeight: 'bold' }}>
                  {currentWordIndex + 1} / {roundQueue.length}
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

import React, { useState } from 'react';

export default function WordManager({ words, setWords }) {
  const [newEn, setNewEn] = useState('');
  const [newRu, setNewRu] = useState('');

  const handleChange = (id, key, value) => {
    const updated = words.map(w => w.id === id ? { ...w, [key]: value } : w);
    setWords(updated);
  };

  const handleDelete = (id) => {
    setWords(words.filter(w => w.id !== id));
  };

  const handleAdd = () => {
    if (newEn.trim() && newRu.trim()) {
      setWords([...words, { id: Date.now(), en: newEn.trim(), ru: newRu.trim(), learned: false }]);
      setNewEn('');
      setNewRu('');
    }
  };

  // Sort words so learned ones are at the bottom
  const sortedWords = [...words].sort((a, b) => {
    if (a.learned === b.learned) return 0;
    return a.learned ? 1 : -1;
  });

  return (
    <div className="word-manager">
      <h2>Manage Words ({words.length})</h2>

      <div className="add-word-form word-item" style={{ marginBottom: '1.5rem', border: '2px dashed var(--accent-color)' }}>
        <div className="word-inputs">
          <input
            className="word-input"
            type="text"
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            placeholder="New English Word"
          />
          <input
            className="word-input"
            type="text"
            value={newRu}
            onChange={(e) => setNewRu(e.target.value)}
            placeholder="New Russian Word"
          />
        </div>
        <button className="btn" onClick={handleAdd}>
          Add Word
        </button>
      </div>

      <div className="word-list">
        {sortedWords.map((w) => (
          <div key={w.id} className={`word-item ${w.learned ? 'learned-item' : ''}`}>
            <div className="word-inputs" style={{ opacity: w.learned ? 0.6 : 1 }}>
              <input
                className="word-input"
                type="text"
                value={w.en}
                onChange={(e) => handleChange(w.id, 'en', e.target.value)}
                placeholder="English"
              />
              <input
                className="word-input"
                type="text"
                value={w.ru}
                onChange={(e) => handleChange(w.id, 'ru', e.target.value)}
                placeholder="Russian"
              />
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', minWidth: '90px' }}>
                <input
                  type="checkbox"
                  checked={!!w.learned}
                  onChange={(e) => handleChange(w.id, 'learned', e.target.checked)}
                />
                Learned
              </label>
              <div
                style={{ display: 'flex', gap: 2, cursor: 'pointer', alignItems: 'center', marginLeft: '10px' }}
                onClick={() => {
                  const currentLevel = w.level || 0;
                  handleChange(w.id, 'level', currentLevel >= 4 ? 0 : currentLevel + 1);
                }}
                title="Knowledge level (click to change)"
              >
                {[1, 2, 3, 4].map(idx => {
                  let bgColor = '#e0e0e0';
                  const level = w.level || 0;
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
            </div>
            <button className="btn btn-danger" onClick={() => handleDelete(w.id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

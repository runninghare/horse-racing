import { useState, useEffect } from 'react'
import './HorseRacing.css'
import { PARTICIPANTS } from './constants/participants.constant'

interface Horse {
  name: string;
  color: string;
}

interface HorseProps {
  name: string;
  color: string;
  progress: number;
  finished: boolean;
}

const Horse = ({ name, color, progress, finished }: HorseProps) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
      <span style={{ width: '80px', fontWeight: '500' }}>{name}</span>
      <div style={{ 
        flexGrow: 1, 
        height: '32px', 
        backgroundColor: '#e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <div style={{ 
          height: '100%',
          width: `${progress}%`,
          backgroundColor: color,
          borderRadius: '8px',
          transition: 'width 100ms ease-out'
        }} />
      </div>
    </div>
    {finished && (
      <span style={{ 
        fontSize: '0.875rem', 
        color: '#4b5563',
        marginLeft: '80px'
      }}>
        Finished! ({progress.toFixed(1)}%)
      </span>
    )}
  </div>
);

function HorseRacing() {
  const horses: Horse[] = PARTICIPANTS;

  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number[]>(horses.map(() => 0));
  const [finished, setFinished] = useState<number[]>([]);
  const [gameOver, setGameOver] = useState<boolean>(false);

  useEffect(() => {
    if (!isRacing) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev.map((p) => {
          if (p >= 100) return p;
          const speed = Math.random() * 2;
          return Math.min(p + speed, 100);
        });

        // Get newly finished horses, ensuring no duplicates
        const newlyFinished = newProgress
          .map((p, index) => ({ progress: p, index }))
          .filter(({ progress, index }) => 
            progress >= 100 && 
            !finished.includes(index) &&
            !finished.some(finishedIndex => finishedIndex === index)
          )
          .map(({ index }) => index);

        // Update finished state if there are new finishers
        if (newlyFinished.length > 0) {
          setFinished(prev => {
            // Create a Set to remove any potential duplicates
            const uniqueFinished = Array.from(new Set([...prev, ...newlyFinished]));
            return uniqueFinished.slice(0, horses.length);
          });
        }

        // Check if race is complete
        if (newProgress.every(p => p >= 100)) {
          setIsRacing(false);
          setGameOver(true);
          clearInterval(interval);
        }

        return newProgress;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isRacing, finished, horses.length]);

  const startRace = (): void => {
    setIsRacing(true);
    setProgress(horses.map(() => 0));
    setFinished([]);
    setGameOver(false);
  };

  const getRankSuffix = (rank: number): string => {
    if (rank === 1) return 'st';
    if (rank === 2) return 'nd';
    if (rank === 3) return 'rd';
    return 'th';
  };

  return (
    <div style={{ 
      maxWidth: '1280px',
      margin: '2rem auto',
      padding: '1.5rem',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        fontWeight: 'bold',
        marginBottom: '1.5rem'
      }}>
        Horse Racing Game
      </h2>
      
      <div style={{ marginBottom: '1.5rem' }}>
        {horses.map((horse, index) => (
          <Horse
            key={horse.name}
            name={horse.name}
            color={horse.color}
            progress={progress[index]}
            finished={progress[index] >= 100}
          />
        ))}
      </div>

      <button 
        onClick={startRace}
        disabled={isRacing}
        style={{
          width: '100%',
          padding: '0.5rem',
          backgroundColor: isRacing ? '#9CA3AF' : '#3B82F6',
          color: 'white',
          borderRadius: '6px',
          border: 'none',
          cursor: isRacing ? 'not-allowed' : 'pointer',
          marginBottom: '1rem'
        }}
      >
        {isRacing ? 'Race in Progress...' : gameOver ? 'Start Race' : 'Start Race'}
      </button>

      {gameOver && (
        <div style={{ marginTop: '1rem' }}>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            Race Results:
          </h3>
          {finished.map((horseIndex, rank) => (
            <div key={`${horses[horseIndex].name}-${rank}`} style={{ fontSize: '1.125rem' }}>
              {rank + 1}{getRankSuffix(rank + 1)} Place: {horses[horseIndex].name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HorseRacing
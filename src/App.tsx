import { useState } from 'react'
import HorseRacing from './HorseRacing'
import SpinningWheel from './SpinningWheel'

function App() {
  const [currentGame, setCurrentGame] = useState<'horses' | 'wheel' | null>(null)

  return (
    <div style={{
      maxWidth: '1280px',
      margin: '0 auto',
      padding: '2rem',
    }}>
      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        justifyContent: 'center'
      }}>
        <button
          onClick={() => setCurrentGame('horses')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentGame === 'horses' ? '#3B82F6' : '#E5E7EB',
            color: currentGame === 'horses' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Horse Racing
        </button>
        <button
          onClick={() => setCurrentGame('wheel')}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: currentGame === 'wheel' ? '#3B82F6' : '#E5E7EB',
            color: currentGame === 'wheel' ? 'white' : 'black',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Spinning Wheel
        </button>
      </div>

      {/* Game Components */}
      {currentGame === 'horses' && <HorseRacing />}
      {currentGame === 'wheel' && <SpinningWheel />}
      
      {/* Welcome Message */}
      {currentGame === null && (
        <div style={{
          textAlign: 'center',
          marginTop: '4rem',
          color: '#4B5563'
        }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to Game Center</h1>
          <p>Please select a game to begin</p>
        </div>
      )}
    </div>
  )
}

export default App
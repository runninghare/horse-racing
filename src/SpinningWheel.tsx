import { useState, useRef, useEffect } from 'react';
import { Trash2, RotateCcw, Play, Pause } from 'lucide-react';

const Confetti = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;
  
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
            width: '10px',
            height: '10px',
            transform: `rotate(${Math.random() * 360}deg)`,
            animationDelay: `${Math.random() * 0.5}s`, // Reduced delay for quicker start
            animationDuration: `${2 + Math.random()}s` // Faster fall
          }}
        />
      ))}
    </div>
  );
};

const SpinningWheel = () => {
  // ... [Previous state declarations remain the same until showConfetti]
  const [participants, setParticipants] = useState([
    { name: 'Frank', present: true, selected: false },
    { name: 'Ross', present: true, selected: false },
    { name: 'Amy', present: true, selected: false },
    { name: 'Sumit', present: true, selected: false },
    { name: 'Ben', present: true, selected: false },
    { name: 'Vicky', present: true, selected: false }
  ]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [newParticipant, setNewParticipant] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Timer states
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [inputMinutes, setInputMinutes] = useState(5);
  
  const wheelRef = useRef<SVGSVGElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timerRef.current as NodeJS.Timeout);
          setIsRunning(false);
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current as NodeJS.Timeout);
  }, [isRunning, minutes, seconds]);

  // Modified confetti effect duration
  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000); // Reduced to 3 seconds
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const startTimer = () => {
    setIsRunning(true);
  };

  const stopTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setMinutes(inputMinutes);
    setSeconds(0);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setInputMinutes(value);
    if (!isRunning) {
      setMinutes(value);
      setSeconds(0);
    }
  };

  const togglePresence = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].present = !updatedParticipants[index].present;
    setParticipants(updatedParticipants);
  };

  const addParticipant = () => {
    if (newParticipant.trim() !== '') {
      setParticipants([...participants, { name: newParticipant, present: true, selected: false }]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = participants.filter((_, i) => i !== index);
    setParticipants(updatedParticipants);
  };

  const spinWheel = () => {
    const availableParticipants = participants.filter(p => p.present && !p.selected);
    if (availableParticipants.length > 0) {
      setSpinning(true);
      startTimer();
      const randomRotation = Math.floor(Math.random() * 360) + 720;
      const totalRotation = rotation + randomRotation;
      setRotation(totalRotation);
      
      setTimeout(() => {
        setSpinning(false);
        const sliceAngle = 360 / availableParticipants.length;
        const selectedIndex = Math.floor(((360 - (totalRotation % 360)) % 360) / sliceAngle);
        const selected = availableParticipants[selectedIndex].name;
        
        setSelectedParticipant(selected);
        setParticipants(participants.map(p => 
          p.name === selected ? { ...p, selected: true } : p
        ));
        
        // Trigger confetti for every selection
        setShowConfetti(true);
      }, 5000);
    } else {
      alert("All participants have been selected. Please reset the selections to continue.");
    }
  };

  const resetSelections = () => {
    setSelectedParticipant(null);
    setRotation(0);
    setParticipants(participants.map(p => ({ ...p, selected: false })));
  };

  const availableParticipants = participants.filter(p => p.present && !p.selected);
  const sliceAngle = 360 / availableParticipants.length;

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); }
          100% { transform: translateY(100vh) rotate(360deg); }
        }
        
        .animate-confetti {
          animation: confetti-fall 3s linear forwards;
        }
      `}</style>
      
      <Confetti isActive={showConfetti} />

      {/* Rest of the component remains the same */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex items-center space-x-2">
          <input
            type="number"
            min="0"
            value={inputMinutes}
            onChange={handleMinutesChange}
            className="w-16 px-2 py-1 border rounded"
          />
          <span className="text-lg">min</span>
        </div>
        <div className="text-2xl font-bold">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={isRunning ? stopTimer : startTimer}
            className={`p-2 rounded ${isRunning ? 'bg-red-500' : 'bg-green-500'} text-white`}
          >
            {isRunning ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-2 bg-yellow-500 text-white rounded"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div ref={wheelRef as any} className="relative w-64 h-64">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <g transform={`rotate(${rotation} 50 50)`} style={{ transition: 'transform 5s cubic-bezier(0.25, 0.1, 0.25, 1)' }}>
            {availableParticipants.map((participant, index) => (
              <g key={index}>
                <path
                  d={`M50 50 L50 0 A50 50 0 0 1 ${50 + 50 * Math.sin(sliceAngle * Math.PI / 180)} ${50 - 50 * Math.cos(sliceAngle * Math.PI / 180)} Z`}
                  fill={`hsl(${index * (360 / availableParticipants.length)}, 70%, 80%)`}
                  transform={`rotate(${index * sliceAngle} 50 50)`}
                />
                <text
                  x="50"
                  y="15"
                  textAnchor="middle"
                  transform={`rotate(${index * sliceAngle + sliceAngle / 2} 50 50)`}
                  className="text-xs"
                >
                  {participant.name}
                </text>
              </g>
            ))}
          </g>
          <circle cx="50" cy="50" r="5" fill="gray" />
          <path d="M50 50 L50 10" stroke="black" strokeWidth="2" />
        </svg>
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={spinWheel}
          disabled={spinning || availableParticipants.length === 0}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
        >
          {spinning ? 'Spinning...' : 'Spin the Wheel'}
        </button>
        <button
          onClick={resetSelections}
          className="px-4 py-2 bg-yellow-500 text-white rounded flex items-center"
        >
          <RotateCcw size={16} className="mr-1" /> Reset Selections
        </button>
      </div>
      
      {selectedParticipant && (
        <div className="text-xl font-bold mt-4">
          Selected: {selectedParticipant}
        </div>
      )}

      <div className="w-full max-w-md mt-8">
        <h2 className="text-xl font-bold mb-2">Participants</h2>
        {participants.map((participant, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="checkbox"
              checked={participant.present}
              onChange={() => togglePresence(index)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className={participant.selected ? 'line-through' : ''}>
              {participant.name}
            </span>
            <button onClick={() => removeParticipant(index)} className="text-red-500">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        <div className="flex space-x-2 mt-2">
          <input
            type="text"
            value={newParticipant}
            onChange={(e) => setNewParticipant(e.target.value)}
            placeholder="New participant"
            className="form-input px-2 py-1 border rounded"
          />
          <button onClick={addParticipant} className="px-2 py-1 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpinningWheel;

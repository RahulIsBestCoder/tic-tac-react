import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css'; // Optional for styles

const socket = io('https://tic-tac-backend-6.onrender.com');

const App = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [winningLine, setWinningLine] = useState(null);
  const [winnerMessage, setWinnerMessage] = useState('');

  useEffect(() => {
    socket.on('updateBoard', ({ board, isXNext }) => {
      setBoard(board);
      setIsXNext(isXNext);
      const currentWinner = calculateWinner(board);
      if (currentWinner) {
        setWinner(currentWinner);
        setWinnerMessage(`Winner: ${currentWinner}`);
        setWinningLine(getWinningLine(board));
        setTimeout(() => {
          setWinnerMessage('');
          resetGame();
        }, 1000);
      }
    });

    return () => {
      socket.off('updateBoard');
    };
  }, []);

  const handleClick = (index) => {
    if (board[index] || winner) return;
    socket.emit('makeMove', index);
  };

  const resetGame = () => {
    socket.emit('resetGame');
    setWinner(null);
    setWinningLine(null);
  };

  const renderSquare = (index,num) => (
    <button
      key={num}
      className={`square ${winningLine && winningLine.includes(index) ? 'winner' : ''}`}
      onClick={() => handleClick(index)}
    >
      {board[index]}
    </button>
  );

  return (
    <div>
      <div className="status">
        {winnerMessage ? (
          <div className="winner-message">{winnerMessage}</div>
        ) : (
          `Next player: ${isXNext ? 'X' : 'O'}`
        )}
      </div>
      <div className="board">
        {[0, 1, 2].map((row, i) => (
          <div key={i} className="board-row">
            {[0, 1, 2].map((col,ind) => renderSquare(row * 3 + col,ind))}
          </div>
        ))}
      </div>
      <button className="reset" onClick={resetGame}>Reset</button>
    </div>
  );
};

const calculateWinner = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
};

// Helper function to get the winning line
const getWinningLine = (squares) => {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return lines[i];
    }
  }
  return null;
};

export default App;
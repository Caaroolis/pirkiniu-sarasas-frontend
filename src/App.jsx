import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://pirkiniu-sarasas-backend-production.up.railway.app');

function App() {
  const [list, setList] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Gauti sąrašą iš serverio
    socket.on('list_update', (data) => {
      setList(data);
    });
    // Išvalyti eventus atsijungus
    return () => {
      socket.off('list_update');
    };
  }, []);

  const addItem = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    socket.emit('add_item', { name: input, bought: false });
    setInput('');
  };

  const removeItem = (idx) => {
    socket.emit('remove_item', idx);
  };

  const toggleItem = (idx) => {
    socket.emit('toggle_item', idx);
  };

  return (
    <div className="container">
      <h1>Pirkinių sąrašas</h1>
      <form onSubmit={addItem} className="add-form">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nauja prekė..."
        />
        <button type="submit">Pridėti</button>
      </form>
      <ul className="shopping-list">
        {list.map((item, idx) => (
          <li key={idx} className={item.bought ? 'bought' : ''}>
            <span onClick={() => toggleItem(idx)} style={{ cursor: 'pointer' }}>
              {item.name} {item.bought ? '✔️' : ''}
            </span>
            <button onClick={() => removeItem(idx)} className="remove-btn">Šalinti</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;

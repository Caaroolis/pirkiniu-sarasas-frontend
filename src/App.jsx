import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://pirkiniu-sarasas-backend-production.up.railway.app');

function App() {
  const [list, setList] = useState([]);
  const [input, setInput] = useState('');
  const [store, setStore] = useState('Lidl');
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

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
    socket.emit('add_item', {
      name: input,
      bought: false,
      store,
      quantity,
      note
    });
    setInput('');
    setQuantity(1);
    setNote('');
    setStore('Lidl');
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
        <select value={store} onChange={e => setStore(e.target.value)}>
          <option value="Lidl">Lidl</option>
          <option value="Maxima">Maxima</option>
          <option value="Norfa">Norfa</option>
        </select>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nauja prekė..."
        />
        <input
          type="number"
          min="1"
          value={quantity}
          onChange={e => setQuantity(Number(e.target.value))}
          placeholder="Kiekis"
          style={{ width: 60 }}
        />
        <input
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Pastaba"
        />
        <button type="submit">Pridėti</button>
      </form>
      <ul className="shopping-list">
        {list
          .slice()
          .sort((a, b) => {
            const order = { Maxima: 0, Lidl: 1, Norfa: 2 };
            return (order[a.store] ?? 3) - (order[b.store] ?? 3);
          })
          .map((item, idx) => (
            <li key={idx} className={item.bought ? 'bought' : ''}>
              <span onClick={() => toggleItem(idx)} style={{ cursor: 'pointer' }}>
                <b>{item.name}</b> {item.bought ? '✔️' : ''} <br/>
                <small>Parduotuvė: {item.store || '-'} | Kiekis: {item.quantity || 1} {item.note ? `| Pastaba: ${item.note}` : ''}</small>
              </span>
              <button onClick={() => removeItem(idx)} className="remove-btn">Šalinti</button>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;

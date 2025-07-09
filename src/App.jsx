import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './App.css';

const socket = io('https://pirkiniu-sarasas-backend-production.up.railway.app');

const STORES = ['Lidl', 'Maxima', 'Norfa'];

function App() {
  const [list, setList] = useState([]);
  const [input, setInput] = useState('');
  const [selectedStores, setSelectedStores] = useState(['Lidl']);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState('');

  useEffect(() => {
    socket.on('list_update', (data) => {
      setList(data);
    });
    return () => {
      socket.off('list_update');
    };
  }, []);

  const handleStoreChange = (store) => {
    setSelectedStores((prev) =>
      prev.includes(store)
        ? prev.filter(s => s !== store)
        : [...prev, store]
    );
  };

  const addItem = (e) => {
    e.preventDefault();
    if (input.trim() === '' || selectedStores.length === 0) return;
    selectedStores.forEach(store => {
      socket.emit('add_item', {
        name: input,
        bought: false,
        store,
        quantity,
        note
      });
    });
    setInput('');
    setQuantity(1);
    setNote('');
    // selectedStores lieka tokios pačios
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
        <div className="store-checkboxes">
          {STORES.map(store => (
            <label key={store} className="store-checkbox-label">
              <input
                type="checkbox"
                checked={selectedStores.includes(store)}
                onChange={() => handleStoreChange(store)}
              />
              {store}
            </label>
          ))}
        </div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Nauja prekė..."
        />
        <div className="row-fields">
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
            style={{ flex: 1, marginLeft: 8 }}
          />
        </div>
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

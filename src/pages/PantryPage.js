import { useState } from "react";

function Pantry() {
  const [pantry, setPantry] = useState([]);
  const [item, setItem] = useState("");

  const addItem = () => {
    if (item.trim()) {
      setPantry([...pantry, item.trim()]);
      setItem("");
    }
  };

  const removeItem = (name) => {
    setPantry(pantry.filter(i => i !== name));
  };

  return (
    <div className="page-container">
      <h2>My Pantry</h2>
      <div className="input-section">
        <input
          type="text"
          placeholder="Add an item..."
          value={item}
          onChange={(e) => setItem(e.target.value)}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <ul className="item-list">
        {pantry.map((i, index) => (
          <li key={index}>
            {i} <button onClick={() => removeItem(i)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Pantry;

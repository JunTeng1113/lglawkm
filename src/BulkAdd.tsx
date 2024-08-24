// pages/BulkAdd.tsx
import React, { useState } from 'react';

const BulkAdd: React.FC = () => {
  const [items, setItems] = useState([{ content: '' }]);

  const handleInputChange = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index].content = value;
    setItems(newItems);
  };

  const handleAddRow = () => {
    setItems([...items, { content: '' }]);
  };

  const handleSubmit = async () => {
    // Perform the bulk add operation (e.g., send data to the server)
    try {
      await fetch('/api/bulk-add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });
      alert('Items added successfully!');
    } catch (error) {
      console.error('Error adding items:', error);
    }
  };

  return (
    <div>
      <h1>批量新增</h1>
      <form onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}>
        {items.map((item, index) => (
          <div key={index}>
            <label>
              內容 {index + 1}:
              <input
                type="text"
                value={item.content}
                onChange={(e) => handleInputChange(index, e.target.value)}
              />
            </label>
          </div>
        ))}
        <button type="button" onClick={handleAddRow}>
          添加一行
        </button>
        <button type="submit">提交</button>
      </form>
    </div>
  );
};

export default BulkAdd;

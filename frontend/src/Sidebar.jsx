import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{ width: '200px', borderRight: '1px solid #ccc', padding: '15px', minHeight: '100vh' }}>
      <h3>Ghi Chú App</h3>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li style={{ marginBottom: '10px' }}><Link to="/">Trang chủ</Link></li>
        <li style={{ marginBottom: '10px' }}><Link to="/settings">Cài đặt</Link></li>
        <li style={{ marginBottom: '10px' }}><Link to="/private">Vùng kín</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
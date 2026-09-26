import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './Sidebar';
import Settings from './Settings';
import Notes from './Notes';
import PrivateNotes from './PrivateNotes';
import ListNotes from './ListNotes';
import './App.css'

function App() {

  return (
    <BrowserRouter>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: '20px' }}>
          <Routes>
            <Route path="/" element={<ListNotes />} />
            <Route path="/Notes" element={<Notes />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/private" element={<PrivateNotes/>} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App

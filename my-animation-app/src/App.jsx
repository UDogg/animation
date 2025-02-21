import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AnimationThree from './components/AnimationThree';
import AnimationFour from './components/AnimationFour';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: "10px", background: "#eee" }}>
        <Link to="/problems" style={{ marginRight: "20px" }}>Problems Component</Link>
        <Link to="/gsap">GSAP Animation</Link>
      </nav>
      <Routes>
        <Route path="/problems" element={<AnimationThree />} />
        <Route path="/gsap" element={<AnimationFour />} />
        {/* Optionally, add a default route */}
        <Route path="*" element={<AnimationThree />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

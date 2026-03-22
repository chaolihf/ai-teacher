import { useState } from 'react';
import RgbPalette from './components/RgbPalette';
import ImageColorPicker from './components/ImageColorPicker';
import ImageProcessing from './components/ImageProcessing';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('palette');

  const tabs = [
    { id: 'palette', name: 'RGB 调色板', icon: '🎨' },
    { id: 'picker', name: '图片取色器', icon: '🖱️' },
    { id: 'processing', name: '图像处理实验', icon: '🔬' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'palette':
        return <RgbPalette />;
      case 'picker':
        return <ImageColorPicker />;
      case 'processing':
        return <ImageProcessing />;
      default:
        return <RgbPalette />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌈 颜色教学实验室</h1>
        <p>探索 RGB 色彩的奥秘</p>
      </header>

      <nav className="app-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="nav-icon">{tab.icon}</span>
            <span className="nav-text">{tab.name}</span>
          </button>
        ))}
      </nav>

      <main className="app-main">
        {renderContent()}
      </main>

      <footer className="app-footer">
        <p>颜色教学实验室 - 学习 RGB 色彩原理的互动工具</p>
      </footer>
    </div>
  );
}

export default App;

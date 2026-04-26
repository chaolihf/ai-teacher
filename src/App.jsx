import { useState } from 'react';
import RgbPalette from './components/RgbPalette';
import ImageColorPicker from './components/ImageColorPicker';
import ImageProcessing from './components/ImageProcessing';
import EncodingLesson from './components/EncodingLesson';
import FileLesson from './components/FileLesson';
import NetworkLesson from './components/NetworkLesson';
import ComputerArithmeticLesson from './components/ComputerArithmeticLesson';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('palette');

  const tabs = [
    { id: 'palette', name: 'RGB 调色板', icon: '🎨' },
    { id: 'picker', name: '图片取色器', icon: '🖱️' },
    { id: 'processing', name: '图像处理实验', icon: '🔬' },
    { id: 'encoding', name: '字符编码课程', icon: '🔤' },
    { id: 'files', name: '文件系统课程', icon: '📁' },
    { id: 'network', name: '网络课程', icon: '🌐' },
    { id: 'arithmetic', name: 'CPU 运算原理', icon: '💻' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'palette':
        return <RgbPalette />;
      case 'picker':
        return <ImageColorPicker />;
      case 'processing':
        return <ImageProcessing />;
      case 'encoding':
        return <EncodingLesson />;
      case 'files':
        return <FileLesson />;
      case 'network':
        return <NetworkLesson />;
      case 'arithmetic':
        return <ComputerArithmeticLesson />;
      default:
        return <RgbPalette />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>💻 计算机基础实验室</h1>
        <p>探索计算机科学的奥秘</p>
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
        <p>计算机基础实验室 - 学习计算机科学原理的互动工具</p>
      </footer>
    </div>
  );
}

export default App;

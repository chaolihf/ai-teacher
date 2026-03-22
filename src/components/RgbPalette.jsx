import { useState } from 'react';
import './RgbPalette.css';

function RgbPalette() {
  const [rgb, setRgb] = useState({ r: 128, g: 128, b: 128 });

  const handleSliderChange = (channel, value) => {
    setRgb(prev => ({ ...prev, [channel]: parseInt(value) }));
  };

  const backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const textColor = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 186 ? '#000' : '#fff';

  return (
    <div className="rgb-palette">
      <h2>🎨 RGB 调色板</h2>
      <p className="description">
        通过调整下方的滑块，观察不同 RGB 值组合产生的颜色变化。
        RGB 是红 (Red)、绿 (Green)、蓝 (Blue) 三原色的缩写，每种颜色的取值范围是 0-255。
      </p>
      
      <div className="color-display" style={{ backgroundColor, color: textColor }}>
        <div className="color-info">
          <div className="rgb-text">RGB({rgb.r}, {rgb.g}, {rgb.b})</div>
          <div className="hex-text">HEX: #{rgb.r.toString(16).padStart(2, '0')}{rgb.g.toString(16).padStart(2, '0')}{rgb.b.toString(16).padStart(2, '0')}</div>
        </div>
      </div>

      <div className="sliders-container">
        <div className="slider-group">
          <label>
            <span className="channel-label" style={{ color: '#ff4444' }}>R (红色)</span>
            <span className="value">{rgb.r}</span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.r}
            onChange={(e) => handleSliderChange('r', e.target.value)}
            className="slider slider-red"
          />
        </div>

        <div className="slider-group">
          <label>
            <span className="channel-label" style={{ color: '#44ff44' }}>G (绿色)</span>
            <span className="value">{rgb.g}</span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.g}
            onChange={(e) => handleSliderChange('g', e.target.value)}
            className="slider slider-green"
          />
        </div>

        <div className="slider-group">
          <label>
            <span className="channel-label" style={{ color: '#4444ff' }}>B (蓝色)</span>
            <span className="value">{rgb.b}</span>
          </label>
          <input
            type="range"
            min="0"
            max="255"
            value={rgb.b}
            onChange={(e) => handleSliderChange('b', e.target.value)}
            className="slider slider-blue"
          />
        </div>
      </div>

      <div className="tips">
        <h3>💡 小知识</h3>
        <ul>
          <li><strong>RGB(0, 0, 0)</strong> = 黑色（没有光）</li>
          <li><strong>RGB(255, 255, 255)</strong> = 白色（全亮）</li>
          <li><strong>RGB(255, 0, 0)</strong> = 纯红色</li>
          <li><strong>RGB(0, 255, 0)</strong> = 纯绿色</li>
          <li><strong>RGB(0, 0, 255)</strong> = 纯蓝色</li>
          <li><strong>RGB(255, 255, 0)</strong> = 黄色（红 + 绿）</li>
          <li><strong>RGB(255, 0, 255)</strong> = 品红色（红 + 蓝）</li>
          <li><strong>RGB(0, 255, 255)</strong> = 青色（绿 + 蓝）</li>
        </ul>
      </div>
    </div>
  );
}

export default RgbPalette;

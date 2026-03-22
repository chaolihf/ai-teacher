import { useState, useRef, useEffect } from 'react';
import './ImageProcessing.css';

function ImageProcessing() {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [effect, setEffect] = useState('none');
  const [selectedPixel, setSelectedPixel] = useState(null);
  const [originalPixel, setOriginalPixel] = useState(null);
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const demoImages = [
    { name: '🎨 RGB 渐变', src: '/demo-images/rgb-gradient.svg' },
    { name: '🌈 标准色卡', src: '/demo-images/color-chart.svg' },
    { name: '🌅 渐变效果', src: '/demo-images/gradients.svg' },
    { name: '🔷 几何图形', src: '/demo-images/shapes.svg' },
    { name: '⬜ 棋盘格', src: '/demo-images/checkerboard.svg' },
  ];

  const loadDemoImage = (imgSrc) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setProcessedImage(null);
      setEffect('none');
      setSelectedPixel(null);
      setOriginalPixel(null);
    };
    img.src = imgSrc;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage(img);
          setProcessedImage(null);
          setEffect('none');
          setSelectedPixel(null);
          setOriginalPixel(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyEffect = () => {
    if (!image || !originalCanvasRef.current) return;

    const canvas = originalCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    if (effect === 'invert') {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];     // R
        data[i + 1] = 255 - data[i + 1]; // G
        data[i + 2] = 255 - data[i + 2]; // B
      }
    } else if (effect === 'grayscale') {
      for (let i = 0; i < data.length; i += 4) {
        const avg = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
      }
    }

    const newCanvas = document.createElement('canvas');
    newCanvas.width = canvas.width;
    newCanvas.height = canvas.height;
    const newCtx = newCanvas.getContext('2d');
    newCtx.putImageData(imageData, 0, 0);
    setProcessedImage(newCanvas.toDataURL());
  };

  const drawImage = (canvas, img) => {
    const ctx = canvas.getContext('2d');
    const maxWidth = 350;
    const maxHeight = 400;
    let width = img.width;
    let height = img.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(img, 0, 0, width, height);
    return { width, height };
  };

  useEffect(() => {
    if (image && originalCanvasRef.current) {
      drawImage(originalCanvasRef.current, image);
    }
  }, [image]);

  useEffect(() => {
    if (effect !== 'none') {
      applyEffect();
    }
  }, [effect, image]);

  const handleCanvasClick = (e, isOriginal = true) => {
    const canvas = isOriginal ? originalCanvasRef.current : canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    const ctx = canvas.getContext('2d');
    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const imageData = ctx.getImageData(x, y, 1, 1);
      const data = imageData.data;
      
      if (isOriginal) {
        setOriginalPixel({ r: data[0], g: data[1], b: data[2], x, y });
        // Also get processed pixel if effect is applied
        if (processedImage && canvasRef.current) {
          const processedCtx = canvasRef.current.getContext('2d');
          const processedData = processedCtx.getImageData(x, y, 1, 1).data;
          setSelectedPixel({ r: processedData[0], g: processedData[1], b: processedData[2], x, y });
        }
      } else {
        setSelectedPixel({ r: data[0], g: data[1], b: data[2], x, y });
        if (originalCanvasRef.current) {
          const originalCtx = originalCanvasRef.current.getContext('2d');
          const originalData = originalCtx.getImageData(x, y, 1, 1).data;
          setOriginalPixel({ r: originalData[0], g: originalData[1], b: originalData[2], x, y });
        }
      }
    }
  };

  const getEffectName = () => {
    switch (effect) {
      case 'invert': return '图像反转';
      case 'grayscale': return '黑白化';
      default: return '无';
    }
  };

  return (
    <div className="image-processing">
      <h2>🔬 图像处理实验</h2>
      <p className="description">
        上传一张图片，选择<strong>图像反转</strong>或<strong>黑白化</strong>效果，
        观察 RGB 值的变化规律。点击任意像素点对比处理前后的颜色值。
      </p>

      <div className="demo-images-section">
        <span className="demo-label">或选择示例图片：</span>
        <div className="demo-images-list">
          {demoImages.map((img) => (
            <button
              key={img.src}
              className="demo-img-btn"
              onClick={() => loadDemoImage(img.src)}
            >
              {img.name}
            </button>
          ))}
        </div>
      </div>

      <div className="upload-section">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
        <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
          📁 选择图片
        </button>
      </div>

      {image && (
        <>
          <div className="controls">
            <label>选择效果：</label>
            <select value={effect} onChange={(e) => setEffect(e.target.value)}>
              <option value="none">无</option>
              <option value="invert">图像反转（反色）</option>
              <option value="grayscale">黑白化（灰度）</option>
            </select>
            <span className="current-effect">当前：{getEffectName()}</span>
          </div>

          <div className="canvas-compare">
            <div className="canvas-wrapper">
              <h3>原图</h3>
              <canvas
                ref={originalCanvasRef}
                onClick={(e) => handleCanvasClick(e, true)}
              />
            </div>
            <div className="canvas-wrapper">
              <h3>处理后</h3>
              <canvas
                ref={canvasRef}
                onClick={(e) => handleCanvasClick(e, false)}
              />
              {processedImage && (
                <img src={processedImage} alt="processed" style={{ display: 'none' }} onLoad={(e) => {
                  const canvas = canvasRef.current;
                  const ctx = canvas.getContext('2d');
                  canvas.width = e.target.width;
                  canvas.height = e.target.height;
                  ctx.drawImage(e.target, 0, 0);
                }} />
              )}
            </div>
          </div>

          <div className="comparison-result">
            <h3>📊 像素对比</h3>
            <p className="hint">点击任意图片上的点来查看 RGB 值变化</p>
            
            {selectedPixel && originalPixel ? (
              <div className="comparison-table">
                <div className="comparison-header">
                  <div className="cell">属性</div>
                  <div className="cell">原图</div>
                  <div className="cell">处理后</div>
                  <div className="cell">变化</div>
                </div>
                <div className="comparison-row">
                  <div className="cell label">位置</div>
                  <div className="value">({originalPixel.x}, {originalPixel.y})</div>
                  <div className="value">({selectedPixel.x}, {selectedPixel.y})</div>
                  <div className="value">-</div>
                </div>
                <div className="comparison-row">
                  <div className="cell label">R (红)</div>
                  <div className="value" style={{ color: '#ff4444' }}>{originalPixel.r}</div>
                  <div className="value" style={{ color: '#ff4444' }}>{selectedPixel.r}</div>
                  <div className="value change">{selectedPixel.r - originalPixel.r > 0 ? '+' : ''}{selectedPixel.r - originalPixel.r}</div>
                </div>
                <div className="comparison-row">
                  <div className="cell label">G (绿)</div>
                  <div className="value" style={{ color: '#44ff44' }}>{originalPixel.g}</div>
                  <div className="value" style={{ color: '#44ff44' }}>{selectedPixel.g}</div>
                  <div className="value change">{selectedPixel.g - originalPixel.g > 0 ? '+' : ''}{selectedPixel.g - originalPixel.g}</div>
                </div>
                <div className="comparison-row">
                  <div className="cell label">B (蓝)</div>
                  <div className="value" style={{ color: '#4444ff' }}>{originalPixel.b}</div>
                  <div className="value" style={{ color: '#4444ff' }}>{selectedPixel.b}</div>
                  <div className="value change">{selectedPixel.b - originalPixel.b > 0 ? '+' : ''}{selectedPixel.b - originalPixel.b}</div>
                </div>
                <div className="comparison-row highlight">
                  <div className="cell label">RGB</div>
                  <div className="value">rgb({originalPixel.r}, {originalPixel.g}, {originalPixel.b})</div>
                  <div className="value">rgb({selectedPixel.r}, {selectedPixel.g}, {selectedPixel.b})</div>
                  <div className="value">-</div>
                </div>
              </div>
            ) : (
              <div className="no-selection">
                <p>👆 点击图片上的任意点来查看像素对比</p>
              </div>
            )}
          </div>
        </>
      )}

      <div className="tips">
        <h3>💡 小知识</h3>
        <div className="tip-section">
          <h4>🔄 图像反转（反色）</h4>
          <p>将每个像素的 RGB 值取反，公式：<code>新值 = 255 - 原值</code></p>
          <ul>
            <li>黑色 (0,0,0) → 白色 (255,255,255)</li>
            <li>红色 (255,0,0) → 青色 (0,255,255)</li>
            <li>类似于照片的"底片"效果</li>
          </ul>
        </div>
        <div className="tip-section">
          <h4>⚫ 黑白化（灰度）</h4>
          <p>将彩色图片转换为灰度图，公式：<code>灰度值 = 0.299×R + 0.587×G + 0.114×B</code></p>
          <ul>
            <li>三个通道值相等，呈现灰色</li>
            <li>系数考虑了人眼对不同颜色的敏感度</li>
            <li>绿色权重最高，蓝色最低</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ImageProcessing;

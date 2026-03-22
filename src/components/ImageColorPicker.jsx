import { useState, useRef, useEffect } from 'react';
import './ImageColorPicker.css';

function ImageColorPicker() {
  const [image, setImage] = useState(null);
  const [pixelColor, setPixelColor] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
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
      setPixelColor(null);
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
          setPixelColor(null);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCanvasClick = (e) => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(x, y, 1, 1);
    const data = imageData.data;

    setPixelColor({
      r: data[0],
      g: data[1],
      b: data[2],
      a: data[3]
    });

    setPosition({ x: Math.round(x), y: Math.round(y) });
  };

  const handleMouseMove = (e) => {
    if (!image || !canvasRef.current) return;

    e.preventDefault();

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = Math.round((e.clientX - rect.left) * scaleX);
    const y = Math.round((e.clientY - rect.top) * scaleY);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(x, y, 1, 1);
      const data = imageData.data;

      setPixelColor({
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
      });

      setPosition({ x, y });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // 当图片加载完成后绘制到 canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const maxWidth = 700;
    const maxHeight = 500;
    let width = image.width;
    let height = image.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = width * ratio;
      height = height * ratio;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
  }, [image]);

  return (
    <div className="image-color-picker">
      <h2>🖱️ 图片取色器</h2>
      <p className="description">
        上传一张图片，然后将鼠标移动到图片上，即可查看任意位置的像素 RGB 值。
        点击鼠标可以固定当前像素的颜色信息。
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
        <button className="upload-btn" onClick={triggerFileInput}>
          📁 选择图片
        </button>
        <span className="upload-hint">支持 JPG、PNG、GIF 等常见格式</span>
      </div>

      {image && (
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setPixelColor(null)}
          />
        </div>
      )}

      {pixelColor && (
        <div className="color-result">
          <div className="color-preview" style={{ backgroundColor: `rgb(${pixelColor.r}, ${pixelColor.g}, ${pixelColor.b})` }}>
            <span style={{ color: pixelColor.r * 0.299 + pixelColor.g * 0.587 + pixelColor.b * 0.114 > 186 ? '#000' : '#fff' }}>
              预览
            </span>
          </div>
          <div className="color-details">
            <div className="detail-item">
              <span className="label">位置:</span>
              <span className="value">({position.x}, {position.y})</span>
            </div>
            <div className="detail-item">
              <span className="label">RGB:</span>
              <span className="value">rgb({pixelColor.r}, {pixelColor.g}, {pixelColor.b})</span>
            </div>
            <div className="detail-item">
              <span className="label">HEX:</span>
              <span className="value">
                #{pixelColor.r.toString(16).padStart(2, '0')}
                {pixelColor.g.toString(16).padStart(2, '0')}
                {pixelColor.b.toString(16).padStart(2, '0')}
              </span>
            </div>
            <div className="detail-item">
              <span className="label">透明度 (Alpha):</span>
              <span className="value">{pixelColor.a}</span>
            </div>
          </div>
        </div>
      )}

      <div className="tips">
        <h3>💡 小知识</h3>
        <ul>
          <li>数字图片由无数个<strong>像素点</strong>组成，每个像素点都有独立的颜色值</li>
          <li>每个像素的颜色由<strong>RGBA</strong>四个通道表示（红、绿、蓝、透明度）</li>
          <li>移动鼠标可以实时查看像素值，<strong>点击</strong>可以固定显示</li>
          <li>不同区域的像素颜色可能差异很大，试试放大图片观察细节</li>
        </ul>
      </div>
    </div>
  );
}

export default ImageColorPicker;

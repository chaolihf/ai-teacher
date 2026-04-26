import { useState, useEffect, useRef } from 'react';

function WaveAnimation() {
  const canvasRef = useRef(null);
  const [waveType, setWaveType] = useState('sine');
  const [frequency, setFrequency] = useState(1);
  const [amplitude, setAmplitude] = useState(50);
  const [speed, setSpeed] = useState(2);
  const [showDigital, setShowDigital] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let offset = 0;

    const drawWave = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // 绘制中心线
      ctx.strokeStyle = '#ccc';
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();
      ctx.setLineDash([]);

      // 绘制波形
      ctx.strokeStyle = showDigital ? '#4CAF50' : '#2196F3';
      ctx.lineWidth = 3;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        let y;
        const phase = (x + offset) * 0.02 * frequency;

        if (waveType === 'sine') {
          y = centerY + Math.sin(phase) * amplitude;
        } else if (waveType === 'square') {
          y = centerY + (Math.sin(phase) >= 0 ? amplitude : -amplitude);
        } else if (waveType === 'triangle') {
          y = centerY + (2 * Math.asin(Math.sin(phase)) / Math.PI) * amplitude;
        } else if (waveType === 'sawtooth') {
          const normalized = ((phase % (2 * Math.PI)) / (2 * Math.PI)) - 0.5;
          y = centerY + normalized * 2 * amplitude;
        }

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          if (showDigital && waveType !== 'square') {
            // 数字信号显示为阶梯状
            ctx.lineTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
      }

      ctx.stroke();

      // 绘制数字采样点
      if (showDigital) {
        ctx.fillStyle = '#FF5722';
        const sampleInterval = width / 20;
        for (let x = 0; x < width; x += sampleInterval) {
          const phase = (x + offset) * 0.02 * frequency;
          let y;
          if (waveType === 'sine') {
            y = centerY + Math.sin(phase) * amplitude;
          } else if (waveType === 'square') {
            y = centerY + (Math.sin(phase) >= 0 ? amplitude : -amplitude);
          } else if (waveType === 'triangle') {
            y = centerY + (2 * Math.asin(Math.sin(phase)) / Math.PI) * amplitude;
          } else if (waveType === 'sawtooth') {
            const normalized = ((phase % (2 * Math.PI)) / (2 * Math.PI)) - 0.5;
            y = centerY + normalized * 2 * amplitude;
          }

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Math.PI * 2);
          ctx.fill();

          // 显示二进制值
          const binaryValue = y < centerY ? '0' : '1';
          ctx.fillStyle = '#333';
          ctx.font = '12px Arial';
          ctx.fillText(binaryValue, x - 5, y - 10);
          ctx.fillStyle = '#FF5722';
        }
      }

      // 绘制标签
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.fillText('振幅 ↑', 10, 20);
      ctx.fillText(`频率：${frequency}x`, 10, height - 10);
      ctx.fillText(`速度：${speed}`, width - 80, height - 10);

      if (isAnimating) {
        offset += speed;
        animationId = requestAnimationFrame(drawWave);
      }
    };

    drawWave();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [waveType, frequency, amplitude, speed, showDigital, isAnimating]);

  return (
    <div className="wave-animation">
      <div className="wave-controls">
        <div className="control-group">
          <label>波形类型：</label>
          <select value={waveType} onChange={(e) => setWaveType(e.target.value)}>
            <option value="sine">正弦波 (Sine)</option>
            <option value="square">方波 (Square)</option>
            <option value="triangle">三角波 (Triangle)</option>
            <option value="sawtooth">锯齿波 (Sawtooth)</option>
          </select>
        </div>

        <div className="control-group">
          <label>频率：{frequency}x</label>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.5"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>振幅：{amplitude}</label>
          <input
            type="range"
            min="20"
            max="100"
            value={amplitude}
            onChange={(e) => setAmplitude(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>速度：{speed}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={speed}
            onChange={(e) => setSpeed(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>
            <input
              type="checkbox"
              checked={showDigital}
              onChange={(e) => setShowDigital(e.target.checked)}
            />
            显示数字采样
          </label>
        </div>

        <div className="control-group">
          <button onClick={() => setIsAnimating(!isAnimating)}>
            {isAnimating ? '⏸️ 暂停' : '▶️ 继续'}
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="wave-canvas"
      />

      <div className="wave-info">
        <h4>📡 波传输原理</h4>
        <p>
          <strong>模拟信号</strong>：连续变化的波形，如正弦波，可以表示声音、图像等连续数据。
        </p>
        <p>
          <strong>数字信号</strong>：将模拟信号采样后转换为离散的 0 和 1，计算机只能处理数字信号。
        </p>
        <p>
          <strong>频率</strong>：每秒振动的次数，单位是赫兹 (Hz)。频率越高，传输的数据量越大。
        </p>
        <p>
          <strong>振幅</strong>：波的高度，表示信号的强度。振幅越大，信号越强。
        </p>
      </div>
    </div>
  );
}

export default WaveAnimation;

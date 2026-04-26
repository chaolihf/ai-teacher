import { useState, useEffect, useRef } from 'react';
import './NetworkLesson.css';

// 波传输动画组件
function WaveTransmission() {
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

      // 绘制背景网格
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 绘制中心线
      ctx.strokeStyle = '#bbb';
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
          ctx.lineTo(x, y);
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
    <div className="wave-transmission">
      <h3>📡 波传输演示</h3>
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

        <div className="control-group checkbox-group">
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

// 数据包传输动画
function PacketTransmission() {
  const canvasRef = useRef(null);
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [packetCount, setPacketCount] = useState(5);
  const [transmissionSpeed, setTransmissionSpeed] = useState(2);
  const [packets, setPackets] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let packetIndex = 0;

    const drawNetwork = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 绘制发送端和接收端
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(20, height / 2 - 40, 80, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('发送端', 35, height / 2 + 25);

      ctx.fillStyle = '#2196F3';
      ctx.fillRect(width - 100, height / 2 - 40, 80, 80);
      ctx.fillStyle = '#fff';
      ctx.font = '14px Arial';
      ctx.fillText('接收端', width - 85, height / 2 + 25);

      // 绘制传输线路
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 5]);
      ctx.beginPath();
      ctx.moveTo(100, height / 2);
      ctx.lineTo(width - 100, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 更新和绘制数据包
      if (isTransmitting && packetIndex < packetCount) {
        setPackets(prev => [...prev, { 
          x: 100, 
          y: height / 2, 
          id: packetIndex,
          data: `0x${Math.floor(Math.random() * 255).toString(16).padStart(2, '0')}`
        }]);
        packetIndex++;
      }

      packets.forEach((packet, index) => {
        // 更新位置
        packet.x += transmissionSpeed;

        // 绘制数据包
        ctx.fillStyle = '#FF9800';
        ctx.beginPath();
        ctx.roundRect(packet.x - 20, packet.y - 15, 40, 30, 5);
        ctx.fill();
        ctx.strokeStyle = '#F57C00';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 显示数据包内容
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.fillText(packet.data, packet.x - 15, packet.y + 4);

        // 移除已到达的数据包
        if (packet.x > width - 100) {
          setPackets(prev => prev.filter((_, i) => i !== index));
        }
      });

      // 绘制标签
      ctx.fillStyle = '#666';
      ctx.font = '12px Arial';
      ctx.fillText(`已发送：${packets.length}/${packetCount}`, 10, 20);

      if (isTransmitting) {
        animationId = requestAnimationFrame(drawNetwork);
      }
    };

    drawNetwork();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isTransmitting, packetCount, transmissionSpeed, packets]);

  const resetTransmission = () => {
    setPackets([]);
    setIsTransmitting(false);
  };

  return (
    <div className="packet-transmission">
      <h3>📦 数据包传输</h3>
      <div className="packet-controls">
        <div className="control-group">
          <label>数据包数量：</label>
          <select value={packetCount} onChange={(e) => setPacketCount(parseInt(e.target.value))}>
            <option value={3}>3 个</option>
            <option value={5}>5 个</option>
            <option value={10}>10 个</option>
            <option value={20}>20 个</option>
          </select>
        </div>

        <div className="control-group">
          <label>传输速度：{transmissionSpeed}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={transmissionSpeed}
            onChange={(e) => setTransmissionSpeed(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <button onClick={() => {
            setPackets([]);
            setIsTransmitting(true);
          }}>
            🚀 开始传输
          </button>
        </div>

        <div className="control-group">
          <button onClick={resetTransmission}>
            🔄 重置
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="packet-canvas"
      />

      <div className="packet-info">
        <p>
          <strong>数据包</strong>：网络传输的基本单位，包含源地址、目标地址和数据内容。
        </p>
        <p>
          <strong>分组交换</strong>：将数据分成多个小包传输，提高网络利用率和可靠性。
        </p>
        <p>
          <strong>传输协议</strong>：TCP 保证可靠传输，UDP 提供更快但不可靠的传输。
        </p>
      </div>
    </div>
  );
}

// 网络分层模型
function NetworkLayers() {
  const [activeLayer, setActiveLayer] = useState(null);

  const layers = [
    {
      number: 7,
      name: '应用层 (Application)',
      color: '#E91E63',
      protocols: ['HTTP', 'FTP', 'SMTP', 'DNS'],
      description: '直接与用户交互，提供网络服务接口'
    },
    {
      number: 6,
      name: '表示层 (Presentation)',
      color: '#9C27B0',
      protocols: ['JPEG', 'MPEG', 'ASCII'],
      description: '数据格式转换、加密解密、压缩解压'
    },
    {
      number: 5,
      name: '会话层 (Session)',
      color: '#673AB7',
      protocols: ['NetBIOS', 'RPC'],
      description: '建立、管理和终止会话连接'
    },
    {
      number: 4,
      name: '传输层 (Transport)',
      color: '#3F51B5',
      protocols: ['TCP', 'UDP'],
      description: '端到端的数据传输，可靠性保证'
    },
    {
      number: 3,
      name: '网络层 (Network)',
      color: '#2196F3',
      protocols: ['IP', 'ICMP', 'ARP'],
      description: '路由选择、逻辑寻址、分组转发'
    },
    {
      number: 2,
      name: '数据链路层 (Data Link)',
      color: '#00BCD4',
      protocols: ['Ethernet', 'Wi-Fi', 'PPP'],
      description: '物理寻址、错误检测、帧传输'
    },
    {
      number: 1,
      name: '物理层 (Physical)',
      color: '#009688',
      protocols: ['双绞线', '光纤', '无线电'],
      description: '比特流传输，定义物理接口和电气特性'
    }
  ];

  return (
    <div className="network-layers">
      <h3>🏗️ OSI 七层模型</h3>
      <div className="layers-container">
        {layers.map((layer) => (
          <div
            key={layer.number}
            className={`layer ${activeLayer === layer.number ? 'active' : ''}`}
            style={{ backgroundColor: layer.color }}
            onClick={() => setActiveLayer(activeLayer === layer.number ? null : layer.number)}
          >
            <div className="layer-header">
              <span className="layer-number">{layer.number}</span>
              <span className="layer-name">{layer.name}</span>
            </div>
            {activeLayer === layer.number && (
              <div className="layer-details">
                <p><strong>功能：</strong>{layer.description}</p>
                <p><strong>常见协议：</strong>{layer.protocols.join('、')}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="layers-info">
        <p>
          <strong>OSI 模型</strong>：开放系统互连参考模型，将网络通信分为 7 个层次。
        </p>
        <p>
          <strong>数据封装</strong>：数据从上层向下层传输时，每层添加自己的头部信息。
        </p>
        <p>
          <strong>点击图层</strong>查看详细信息。
        </p>
      </div>
    </div>
  );
}

// IP 地址演示
function IPReducation() {
  const [ipOctets, setIpOctets] = useState([192, 168, 1, 1]);
  const [subnetMask, setSubnetMask] = useState([255, 255, 255, 0]);

  const calculateBinary = (decimal) => {
    return decimal.toString(2).padStart(8, '0');
  };

  const calculateNetworkAddress = () => {
    return ipOctets.map((octet, index) => octet & subnetMask[index]);
  };

  const networkAddress = calculateNetworkAddress();

  const updateOctet = (index, value) => {
    const newValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newOctets = [...ipOctets];
    newOctets[index] = newValue;
    setIpOctets(newOctets);
  };

  const updateSubnetOctet = (index, value) => {
    const newValue = Math.max(0, Math.min(255, parseInt(value) || 0));
    const newSubnet = [...subnetMask];
    newSubnet[index] = newValue;
    setSubnetMask(newSubnet);
  };

  return (
    <div className="ip-education">
      <h3>🌐 IP 地址与子网掩码</h3>
      
      <div className="ip-section">
        <h4>IP 地址</h4>
        <div className="ip-inputs">
          {ipOctets.map((octet, index) => (
            <div key={index} className="ip-octet">
              <input
                type="number"
                min="0"
                max="255"
                value={octet}
                onChange={(e) => updateOctet(index, e.target.value)}
              />
              {index < 3 && <span>.</span>}
            </div>
          ))}
        </div>
        <div className="binary-display">
          {ipOctets.map((octet, index) => (
            <div key={index} className="binary-octet">
              <code>{calculateBinary(octet)}</code>
              {index < 3 && <span>.</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="subnet-section">
        <h4>子网掩码</h4>
        <div className="ip-inputs">
          {subnetMask.map((octet, index) => (
            <div key={index} className="ip-octet">
              <input
                type="number"
                min="0"
                max="255"
                value={octet}
                onChange={(e) => updateSubnetOctet(index, e.target.value)}
              />
              {index < 3 && <span>.</span>}
            </div>
          ))}
        </div>
        <div className="binary-display">
          {subnetMask.map((octet, index) => (
            <div key={index} className="binary-octet">
              <code>{calculateBinary(octet)}</code>
              {index < 3 && <span>.</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="network-result">
        <h4>网络地址</h4>
        <div className="network-address">
          {networkAddress.map((octet, index) => (
            <span key={index}>
              {octet}
              {index < 3 && <span>.</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="ip-info">
        <p>
          <strong>IP 地址</strong>：标识网络中的设备，IPv4 地址由 4 个 0-255 的数字组成。
        </p>
        <p>
          <strong>子网掩码</strong>：区分网络地址和主机地址，与 IP 地址进行 AND 运算得到网络地址。
        </p>
        <p>
          <strong>网络地址</strong>：标识一个网络，同一网络内的设备可以直接通信。
        </p>
      </div>
    </div>
  );
}

// 主要组件
function NetworkLesson() {
  const [activeSection, setActiveSection] = useState('wave');

  const sections = [
    { id: 'wave', name: '波传输', icon: '📡' },
    { id: 'packet', name: '数据包', icon: '📦' },
    { id: 'layers', name: '网络分层', icon: '🏗️' },
    { id: 'ip', name: 'IP 地址', icon: '🌐' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'wave':
        return <WaveTransmission />;
      case 'packet':
        return <PacketTransmission />;
      case 'layers':
        return <NetworkLayers />;
      case 'ip':
        return <IPReducation />;
      default:
        return <WaveTransmission />;
    }
  };

  return (
    <div className="network-lesson">
      <div className="lesson-header">
        <h2>计算机网络基础</h2>
        <p>学习数据如何在网络中传输</p>
      </div>

      <div className="section-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`section-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="section-icon">{section.icon}</span>
            <span className="section-text">{section.name}</span>
          </button>
        ))}
      </div>

      <div className="lesson-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default NetworkLesson;

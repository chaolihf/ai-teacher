import { useState, useEffect, useCallback } from 'react';
import './KeyboardAnimation.css';

// 字符点阵数据示例 (5x7 点阵字体)
const FONT_BITMAP = {
  'A': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'B': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
  ],
  'C': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '你': [
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [1,1,1,1,1,0,0,1,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,1,1,1,0,0,0,0,0],
    [0,0,1,0,0,0,1,0,1,0,1,0,0,0,0],
    [0,0,1,0,0,0,1,0,1,0,1,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0,1,0,0,0,0,0,0],
  ],
  '中': [
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [1,1,1,1,1,1,1,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],
    [0,0,0,1,0,0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  ],
};

// 默认点阵（空白）
const EMPTY_BITMAP = [
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
  [0,0,0,0,0],
];

// 阶段定义
const STAGES = [
  { id: 'idle', name: '等待输入', duration: 0 },
  { id: 'keypress', name: '按下按键', duration: 800 },
  { id: 'electrical', name: '产生电信号', duration: 1500 },
  { id: 'digital', name: '转换为数字信号', duration: 1500 },
  { id: 'translate', name: '翻译为字符编码', duration: 1500 },
  { id: 'font', name: '查找字体点阵', duration: 1500 },
  { id: 'render', name: '渲染到屏幕', duration: 1500 },
  { id: 'complete', name: '显示完成', duration: 0 },
];

function KeyboardAnimation() {
  const [currentStage, setCurrentStage] = useState('idle');
  const [inputChar, setInputChar] = useState('A');
  const [animationChar, setAnimationChar] = useState('A');
  const [signalFlow, setSignalFlow] = useState([]);
  const [pixelGrid, setPixelGrid] = useState([]);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1);

  // 获取字符的点阵数据
  const getBitmap = useCallback((char) => {
    return FONT_BITMAP[char] || FONT_BITMAP['A'] || EMPTY_BITMAP;
  }, []);

  // 初始化像素网格
  useEffect(() => {
    const bitmap = getBitmap(inputChar);
    setPixelGrid(bitmap);
  }, [inputChar, getBitmap]);

  // 生成电信号动画数据
  const generateElectricalSignal = () => {
    const signals = [];
    const keyCode = animationChar.charCodeAt(0);
    const binary = keyCode.toString(2).padStart(8, '1');
    
    for (let i = 0; i < binary.length; i++) {
      signals.push({
        bit: binary[i],
        voltage: binary[i] === '1' ? 'high' : 'low',
        delay: i * 150,
      });
    }
    return signals;
  };

  // 执行动画
  const playAnimation = useCallback(async (char) => {
    setAnimationChar(char || inputChar);
    setCurrentStage('keypress');
    setSignalFlow([]);

    // 阶段 1: 按下按键
    await sleep(800);
    setCurrentStage('electrical');

    // 阶段 2: 产生电信号
    const signals = generateElectricalSignal();
    for (let i = 0; i < signals.length; i++) {
      setSignalFlow(prev => [...prev, signals[i]]);
      await sleep(150);
    }
    await sleep(500);

    // 阶段 3: 转换为数字信号
    setCurrentStage('digital');
    await sleep(1500);

    // 阶段 4: 翻译为字符编码
    setCurrentStage('translate');
    await sleep(1500);

    // 阶段 5: 查找字体点阵
    setCurrentStage('font');
    const bitmap = getBitmap(char || inputChar);
    setPixelGrid(bitmap);
    await sleep(1500);

    // 阶段 6: 渲染到屏幕
    setCurrentStage('render');
    await sleep(1500);

    // 完成
    setCurrentStage('complete');
  }, [inputChar, getBitmap]);

  // 自动播放
  useEffect(() => {
    if (isAutoPlaying) {
      const chars = ['A', 'B', 'C', '你', '中'];
      let index = 0;
      
      const playNext = async () => {
        if (!isAutoPlaying) return;
        
        await playAnimation(chars[index]);
        index = (index + 1) % chars.length;
        
        if (isAutoPlaying) {
          setTimeout(playNext, 500 / autoPlaySpeed);
        }
      };
      
      playNext();
    }
  }, [isAutoPlaying, autoPlaySpeed, playAnimation]);

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const handleStageClick = async (stageId) => {
    if (stageId === 'idle') {
      setCurrentStage('idle');
      setSignalFlow([]);
      return;
    }
    
    const stageIndex = STAGES.findIndex(s => s.id === stageId);
    const char = animationChar;
    
    setCurrentStage(stageId);
    
    // 根据阶段设置相应状态
    if (stageId === 'keypress') {
      setSignalFlow([]);
    } else if (stageId === 'electrical') {
      const signals = generateElectricalSignal();
      setSignalFlow(signals);
    } else if (stageId === 'digital' || stageId === 'translate') {
      const signals = generateElectricalSignal();
      setSignalFlow(signals);
    } else if (stageId === 'font' || stageId === 'render' || stageId === 'complete') {
      const signals = generateElectricalSignal();
      setSignalFlow(signals);
      const bitmap = getBitmap(char);
      setPixelGrid(bitmap);
    }
  };

  const stages = [
    { 
      id: 'keypress', 
      name: '1. 按下按键', 
      icon: '👆',
      description: '手指按下键盘上的按键',
      detail: '机械开关被按下，产生物理接触'
    },
    { 
      id: 'electrical', 
      name: '2. 产生电信号', 
      icon: '⚡',
      description: '键盘电路产生电信号',
      detail: '开关闭合产生高电平 (1) 或低电平 (0)'
    },
    { 
      id: 'digital', 
      name: '3. 数字信号', 
      icon: '🔢',
      description: '电信号转换为数字信号',
      detail: '扫描码被转换为二进制数字序列'
    },
    { 
      id: 'translate', 
      name: '4. 翻译编码', 
      icon: '📖',
      description: '数字信号翻译为字符编码',
      detail: '根据键盘布局和编码表确定字符'
    },
    { 
      id: 'font', 
      name: '5. 查找字体', 
      icon: '📐',
      description: '查找字体库中的点阵数据',
      detail: '根据字符编码获取对应的像素定义'
    },
    { 
      id: 'render', 
      name: '6. 渲染显示', 
      icon: '🖥️',
      description: '根据点阵数据渲染到屏幕',
      detail: '每个像素点被点亮或关闭'
    },
  ];

  return (
    <div className="keyboard-animation">
      <div className="animation-header">
        <h3>⌨️ 键盘输入到字符显示完整流程</h3>
        <div className="animation-controls">
          <div className="char-selector">
            <label>选择字符：</label>
            <select 
              value={inputChar} 
              onChange={(e) => {
                setInputChar(e.target.value);
                setAnimationChar(e.target.value);
              }}
              disabled={isAutoPlaying}
            >
              <option value="A">A (英文)</option>
              <option value="B">B (英文)</option>
              <option value="C">C (英文)</option>
              <option value="你">你 (汉字)</option>
              <option value="中">中 (汉字)</option>
            </select>
          </div>
          
          <button 
            className={`play-btn ${isAutoPlaying ? 'playing' : ''}`}
            onClick={() => {
              if (isAutoPlaying) {
                setIsAutoPlaying(false);
              } else {
                setIsAutoPlaying(true);
                playAnimation(inputChar);
              }
            }}
          >
            {isAutoPlaying ? '⏹ 停止' : '▶ 自动播放'}
          </button>
          
          <button 
            className="play-btn single"
            onClick={() => playAnimation(inputChar)}
            disabled={isAutoPlaying}
          >
            ▶ 播放一次
          </button>
          
          <div className="speed-control">
            <label>速度：</label>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.5" 
              value={autoPlaySpeed}
              onChange={(e) => setAutoPlaySpeed(parseFloat(e.target.value))}
            />
            <span>{autoPlaySpeed}x</span>
          </div>
        </div>
      </div>

      {/* 阶段导航 */}
      <div className="stage-nav">
        <button
          className={`stage-btn ${currentStage === 'idle' ? 'active' : ''}`}
          onClick={() => handleStageClick('idle')}
        >
          🏁 重置
        </button>
        {stages.map((stage) => (
          <button
            key={stage.id}
            className={`stage-btn ${currentStage === stage.id ? 'active' : ''} ${stage.id}`}
            onClick={() => handleStageClick(stage.id)}
          >
            {stage.icon} {stage.name}
          </button>
        ))}
      </div>

      {/* 主动画区域 */}
      <div className="animation-main">
        {/* 左侧：流程可视化 */}
        <div className="flow-visualization">
          <div className="flow-stage">
            <h4>📍 当前阶段</h4>
            <div className={`current-stage-display ${currentStage}`}>
              {STAGES.find(s => s.id === currentStage)?.icon || '⏸'}
              <span>{STAGES.find(s => s.id === currentStage)?.name || '等待中'}</span>
            </div>
          </div>

          {/* 键盘 */}
          <div className={`flow-component keyboard ${currentStage === 'keypress' ? 'active' : ''}`}>
            <div className="component-icon">⌨️</div>
            <div className="component-name">键盘</div>
            <div className="key-visual">
              <div className={`physical-key ${currentStage === 'keypress' ? 'pressed' : ''}`}>
                {animationChar}
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'keypress' ? '👆 按键被按下' : '等待按键...'}
            </div>
          </div>

          {/* 电信号 */}
          <div className={`flow-component electrical ${currentStage === 'electrical' ? 'active' : ''}`}>
            <div className="component-icon">⚡</div>
            <div className="component-name">电信号</div>
            <div className="signal-visual">
              <div className="signal-waves">
                {signalFlow.map((signal, index) => (
                  <div 
                    key={index} 
                    className={`signal-wave ${signal.voltage}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {signal.bit}
                  </div>
                ))}
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'electrical' ? 
                `电压：${signalFlow.length > 0 ? signalFlow[signalFlow.length - 1].voltage === 'high' ? '高 (1)' : '低 (0)' : '...'}` : 
                '等待信号...'}
            </div>
          </div>

          {/* 数字信号 */}
          <div className={`flow-component digital ${currentStage === 'digital' ? 'active' : ''}`}>
            <div className="component-icon">🔢</div>
            <div className="component-name">数字信号处理</div>
            <div className="digital-visual">
              <div className="binary-display">
                {currentStage === 'digital' || currentStage === 'translate' || 
                 currentStage === 'font' || currentStage === 'render' || currentStage === 'complete' ? (
                  <>
                    <span className="binary-label">扫描码:</span>
                    <span className="binary-value">
                      {animationChar.charCodeAt(0).toString(2).padStart(8, '1')}
                    </span>
                  </>
                ) : (
                  <span className="placeholder">等待转换...</span>
                )}
              </div>
              <div className="decimal-display">
                {currentStage === 'digital' || currentStage === 'translate' || 
                 currentStage === 'font' || currentStage === 'render' || currentStage === 'complete' ? (
                  <>
                    <span className="decimal-label">十进制:</span>
                    <span className="decimal-value">{animationChar.charCodeAt(0)}</span>
                  </>
                ) : (
                  <span className="placeholder">等待转换...</span>
                )}
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'digital' ? '🔄 正在转换...' : 
               currentStage === 'translate' ? '✅ 转换完成' : '等待处理...'}
            </div>
          </div>

          {/* 字符编码 */}
          <div className={`flow-component encoding ${currentStage === 'translate' ? 'active' : ''}`}>
            <div className="component-icon">📖</div>
            <div className="component-name">字符编码翻译</div>
            <div className="encoding-visual">
              <div className="code-table">
                <div className="table-header">编码对照表</div>
                <div className="table-content">
                  <div className="code-entry">
                    <span className="code-char">A</span>
                    <span className="code-value">65</span>
                  </div>
                  <div className="code-entry">
                    <span className="code-char">B</span>
                    <span className="code-value">66</span>
                  </div>
                  <div className="code-entry highlight">
                    <span className="code-char">{animationChar}</span>
                    <span className="code-value">{animationChar.charCodeAt(0)}</span>
                  </div>
                  <div className="code-entry">
                    <span className="code-char">你</span>
                    <span className="code-value">20320</span>
                  </div>
                  <div className="code-entry">
                    <span className="code-char">中</span>
                    <span className="code-value">20013</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'translate' ? '🔍 查找编码表...' : 
               currentStage === 'font' || currentStage === 'render' || currentStage === 'complete' ? 
               `✅ "${animationChar}" = ${animationChar.charCodeAt(0)}` : '等待翻译...'}
            </div>
          </div>

          {/* 字体点阵 */}
          <div className={`flow-component font ${currentStage === 'font' ? 'active' : ''}`}>
            <div className="component-icon">📐</div>
            <div className="component-name">字体点阵数据</div>
            <div className="font-visual">
              <div className="font-table">
                <div className="table-header">字体库 (点阵定义)</div>
                <div className="bitmap-preview">
                  {pixelGrid.map((row, rowIndex) => (
                    <div key={rowIndex} className="bitmap-row">
                      {row.map((pixel, colIndex) => (
                        <div 
                          key={colIndex} 
                          className={`pixel ${pixel ? 'on' : 'off'} ${currentStage === 'render' || currentStage === 'complete' ? 'render' : ''}`}
                          style={{ 
                            animationDelay: currentStage === 'render' ? `${(rowIndex * pixelGrid[0].length + colIndex) * 30}ms` : '0ms'
                          }}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'font' ? '📖 读取点阵数据...' : 
               currentStage === 'render' ? '🎨 正在渲染...' : 
               currentStage === 'complete' ? '✅ 点阵数据就绪' : '等待读取...'}
            </div>
          </div>

          {/* 屏幕渲染 */}
          <div className={`flow-component screen ${currentStage === 'render' || currentStage === 'complete' ? 'active' : ''}`}>
            <div className="component-icon">🖥️</div>
            <div className="component-name">屏幕显示</div>
            <div className="screen-visual">
              <div className="monitor">
                <div className="screen-frame">
                  <div className="screen-content">
                    {(currentStage === 'render' || currentStage === 'complete') ? (
                      <div className="rendered-char">
                        {pixelGrid.map((row, rowIndex) => (
                          <div key={rowIndex} className="render-row">
                            {row.map((pixel, colIndex) => (
                              <div 
                                key={colIndex} 
                                className={`render-pixel ${pixel ? 'lit' : 'unlit'}`}
                                style={{ 
                                  animationDelay: currentStage === 'render' ? `${(rowIndex * pixelGrid[0].length + colIndex) * 20}ms` : '0ms'
                                }}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="screen-empty">等待渲染...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="component-detail">
              {currentStage === 'render' ? '✨ 逐像素点亮...' : 
               currentStage === 'complete' ? `✅ "${animationChar}" 显示完成！` : '等待显示...'}
            </div>
          </div>
        </div>

        {/* 右侧：详细说明 */}
        <div className="detail-panel">
          <h4>📋 详细说明</h4>
          <div className="detail-content">
            {stages.map((stage) => (
              <div 
                key={stage.id} 
                className={`detail-item ${currentStage === stage.id ? 'active' : ''}`}
              >
                <div className="detail-icon">{stage.icon}</div>
                <div className="detail-text">
                  <div className="detail-title">{stage.name}</div>
                  <div className="detail-desc">{stage.description}</div>
                  <div className="detail-info">{stage.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部：数据流 */}
      <div className="data-flow-bar">
        <h4>📊 数据流转过程</h4>
        <div className="flow-steps">
          <div className={`flow-step ${['keypress', 'electrical', 'digital', 'translate', 'font', 'render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">👆</span>
            <span className="step-label">按键</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className={`flow-step ${['electrical', 'digital', 'translate', 'font', 'render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">⚡</span>
            <span className="step-label">电信号</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className={`flow-step ${['digital', 'translate', 'font', 'render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">🔢</span>
            <span className="step-label">数字</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className={`flow-step ${['translate', 'font', 'render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">📖</span>
            <span className="step-label">编码</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className={`flow-step ${['font', 'render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">📐</span>
            <span className="step-label">点阵</span>
          </div>
          <div className="flow-arrow">→</div>
          <div className={`flow-step ${['render', 'complete'].includes(currentStage) ? 'completed' : ''}`}>
            <span className="step-icon">🖥️</span>
            <span className="step-label">显示</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyboardAnimation;

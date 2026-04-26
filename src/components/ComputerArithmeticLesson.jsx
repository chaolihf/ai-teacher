import { useState, useRef } from 'react';
import './ComputerArithmeticLesson.css';

function ComputerArithmeticLesson() {
  const [activeSection, setActiveSection] = useState('intro');
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showBinary, setShowBinary] = useState(true);
  const [stepByStep, setStepByStep] = useState(true);
  const animationRef = useRef(null);

  // 十进制转二进制（8 位）
  const toBinary = (num, bits = 8) => {
    if (num < 0) {
      return ((1 << bits) + num).toString(2).padStart(bits, '0');
    }
    return num.toString(2).padStart(bits, '0');
  };

  // 计算结果
  const calculate = (op) => {
    switch (op) {
      case 'add':
        return num1 + num2;
      case 'subtract':
        return num1 - num2;
      case 'multiply':
        return num1 * num2;
      case 'divide':
        return num2 !== 0 ? (num1 / num2).toFixed(2) : '错误';
      default:
        return 0;
    }
  };

  // 获取位样式
  const getBitStyle = (value, highlight = false) => {
    return {
      backgroundColor: value === '1' ? '#4CAF50' : '#e0e0e0',
      color: value === '1' ? 'white' : '#666',
      fontWeight: highlight ? 'bold' : 'normal',
    };
  };

  // 生成加法步骤（从右到左，position 7→0）
  const generateAddSteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    const steps = [];
    let carry = 0;

    for (let i = 7; i >= 0; i--) {
      const bit1 = parseInt(binary1[i]);
      const bit2 = parseInt(binary2[i]);
      const carryIn = carry; // 当前位的进位输入是上一位的进位输出
      const sum = bit1 + bit2 + carryIn;
      const resultBit = sum % 2;
      const carryOut = Math.floor(sum / 2);
      carry = carryOut; // 传递给下一位

      steps.push({
        position: i,
        bit1,
        bit2,
        carryIn,
        sum,
        resultBit,
        carryOut,
        explanation: `第${i}位：${bit1} + ${bit2} + 进位${carryIn} = ${sum} → 写${resultBit}${carryOut > 0 ? '，进 1' : ''}`,
      });
    }

    return steps; // 不再 reverse，保持从右到左的顺序
  };

  // 生成减法步骤（使用补码，从右到左，position 7→0）
  const generateSubtractSteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);

    let complement = '';
    for (let i = 0; i < 8; i++) {
      complement += binary2[i] === '0' ? '1' : '0';
    }
    let carry = 1;
    let twosComplement = '';
    for (let i = 7; i >= 0; i--) {
      const sum = parseInt(complement[i]) + carry;
      twosComplement = (sum % 2) + twosComplement;
      carry = Math.floor(sum / 2);
    }

    const steps = [];
    carry = 0;

    for (let i = 7; i >= 0; i--) {
      const bit1 = parseInt(binary1[i]);
      const bit2 = parseInt(twosComplement[i]);
      const carryIn = carry;
      const sum = bit1 + bit2 + carryIn;
      const resultBit = sum % 2;
      const carryOut = Math.floor(sum / 2);
      carry = carryOut;

      steps.push({
        position: i,
        bit1,
        bit2,
        carryIn,
        sum,
        resultBit,
        carryOut,
        explanation: `第${i}位：${bit1} + ${bit2} + 进位${carryIn} = ${sum} → 写${resultBit}${carryOut > 0 ? '，进 1' : ''}`,
      });
    }

    return {
      original: binary2,
      complement,
      twosComplement,
      addSteps: steps, // 不再 reverse
    };
  };

  // 生成乘法步骤（从右到左，先处理低位）
  const generateMultiplySteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    const partialProducts = [];

    for (let i = 7; i >= 0; i--) {
      const bit = parseInt(binary2[i]);
      const shiftAmount = 7 - i;
      if (bit === 1) {
        const shifted = num1 << shiftAmount;
        partialProducts.push({
          position: i,
          bit,
          value: shifted,
          binary: toBinary(shifted),
          originalBinary: binary1,
          shiftAmount,
        });
      }
    }

    const total = num1 * num2;
    return { binary1, binary2, partialProducts, total };
  };

  // 生成除法步骤
  const generateDivideSteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    let dividend = num1;
    let divisor = num2;
    let quotient = 0;
    let stepNum = 0;
    const steps = [];

    while (dividend >= divisor && stepNum < 10) {
      dividend -= divisor;
      quotient++;
      steps.push({
        step: stepNum + 1,
        dividend: dividend + divisor,
        divisor,
        quotient: quotient,
        remainder: dividend,
        binaryDividend: toBinary(dividend + divisor),
        binaryDivisor: toBinary(divisor),
        binaryQuotient: toBinary(quotient),
        binaryRemainder: toBinary(dividend),
        explanation: `${dividend + divisor} - ${divisor} = ${dividend} (商：${quotient})`,
      });
      stepNum++;
    }

    return {
      binary1,
      binary2,
      steps,
      quotient,
      remainder: dividend,
      binaryQuotient: toBinary(quotient),
      binaryRemainder: toBinary(dividend),
    };
  };

  const addSteps = generateAddSteps();
  const subtractSteps = generateSubtractSteps();
  const multiplySteps = generateMultiplySteps();
  const divideSteps = generateDivideSteps();

  const resetSteps = () => {
    setCurrentStep(0);
    setIsAnimating(false);
    if (animationRef.current) {
      clearInterval(animationRef.current);
      animationRef.current = null;
    }
  };


  const startAnimation = (maxSteps) => {
    if (isAnimating) {
      setIsAnimating(false);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    setIsAnimating(true);
    animationRef.current = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= maxSteps) {
          clearInterval(animationRef.current);
          animationRef.current = null;
          setIsAnimating(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const sections = [
    { id: 'intro', name: '课程介绍', icon: '📖' },
    { id: 'binary', name: '二进制基础', icon: '🔢' },
    { id: 'add', name: '加法运算', icon: '➕' },
    { id: 'subtract', name: '减法运算', icon: '➖' },
    { id: 'multiply', name: '乘法运算', icon: '✖️' },
    { id: 'divide', name: '除法运算', icon: '➗' },
    { id: 'cpu', name: 'CPU 工作原理', icon: '🖥️' },
  ];

  // 渲染运算输入区（加减乘除共用）
  const renderCalcInputs = (opSymbol, opType) => (
    <div className="calc-input">
      <div className="input-group">
        <label>数字 1：</label>
        <input
          type="number"
          min="0"
          max="255"
          value={num1}
          onChange={(e) => {
            setNum1(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)));
            resetSteps();
          }}
        />
        {showBinary && <p className="binary-hint">{toBinary(num1)}</p>}
      </div>
      <div className="operator">{opSymbol}</div>
      <div className="input-group">
        <label>数字 2：</label>
        <input
          type="number"
          min="0"
          max="255"
          value={num2}
          onChange={(e) => {
            setNum2(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)));
            resetSteps();
          }}
        />
        {showBinary && <p className="binary-hint">{toBinary(num2)}</p>}
      </div>
      <div className="equals">=</div>
      <div className="input-group result-group">
        <label>结果：</label>
        <span className="result-value">{calculate(opType)}</span>
        {showBinary && <p className="binary-hint">{toBinary(calculate(opType))}</p>}
      </div>
    </div>
  );

  // 渲染步骤控制按钮
  const renderStepControls = (maxSteps) => (
    <div className="step-controls">
      <button
        className="control-btn"
        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        disabled={currentStep === 0}
      >
        ⏮️ 上一步
      </button>
      <span className="step-indicator">
        第 {currentStep} / {maxSteps} 步
      </span>
      <button
        className="control-btn"
        onClick={() => setCurrentStep(Math.min(maxSteps, currentStep + 1))}
        disabled={currentStep >= maxSteps}
      >
        下一步 ⏭️
      </button>
      <button
        className={`control-btn ${isAnimating ? 'playing' : ''}`}
        onClick={() => startAnimation(maxSteps)}
      >
        {isAnimating ? '⏸️ 暂停' : '▶️ 自动播放'}
      </button>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="section-content">
            <h2>📖 CPU 如何进行数学运算</h2>
            <div className="intro-cards">
              <div className="info-card">
                <h3>💡 核心概念</h3>
                <p>
                  计算机中的 CPU（中央处理器）通过简单的二进制运算来完成所有数学计算。
                  无论是加减乘除，最终都转化为最基本的二进制加法操作。
                </p>
              </div>
              <div className="info-card">
                <h3>🔑 关键组件</h3>
                <ul>
                  <li><strong>ALU（算术逻辑单元）</strong>：负责执行加减乘除运算</li>
                  <li><strong>寄存器</strong>：临时存储参与运算的数字</li>
                  <li><strong>内存</strong>：存储程序和数据</li>
                  <li><strong>控制单元</strong>：指挥各个部件协同工作</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>📜 运算原理</h3>
                <ol>
                  <li>数据从内存加载到 CPU 寄存器</li>
                  <li>ALU 执行运算</li>
                  <li>结果存回寄存器或内存</li>
                  <li>整个过程在纳秒级别完成</li>
                </ol>
              </div>
            </div>

            <div className="visualization">
              <h3>🎯 运算流程示意图</h3>
              <div className="flow-diagram">
                <div className="flow-step">
                  <div className="step-box memory">内存</div>
                  <div className="flow-arrow">→</div>
                  <div className="step-box register">寄存器</div>
                  <div className="flow-arrow">→</div>
                  <div className="step-box alu">ALU</div>
                  <div className="flow-arrow">→</div>
                  <div className="step-box result">结果</div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'binary':
        return (
          <div className="section-content">
            <h2>🔢 二进制基础</h2>
            <div className="info-card">
              <h3>为什么用二进制？</h3>
              <p>
                计算机的 CPU 由数十亿个晶体管组成，每个晶体管只有两种状态：
                <strong>开（1）</strong>和<strong>关（0）</strong>。
                因此，计算机使用二进制来表示所有数据。
              </p>
            </div>

            <div className="binary-demo">
              <h3>十进制 ↔ 二进制转换</h3>
              <div className="converter">
                <div className="converter-side">
                  <label>十进制：</label>
                  <input
                    type="number"
                    min="0"
                    max="255"
                    value={num1}
                    onChange={(e) => setNum1(Math.min(255, Math.max(0, parseInt(e.target.value) || 0)))}
                  />
                  <p className="result">二进制：<span className="binary-value">{toBinary(num1)}</span></p>
                </div>
                <div className="converter-side">
                  <label>二进制：</label>
                  <input
                    type="text"
                    maxLength={8}
                    pattern="[01]*"
                    placeholder="00000000"
                    onChange={(e) => {
                      const binary = e.target.value.replace(/[^01]/g, '');
                      if (binary.length <= 8) {
                        setNum1(binary ? parseInt(binary, 2) : 0);
                      }
                    }}
                  />
                  <p className="result">十进制：<span className="decimal-value">{num1}</span></p>
                </div>
              </div>
            </div>

            <div className="binary-table">
              <h3>0-15 的二进制表示</h3>
              <table>
                <thead>
                  <tr>
                    <th>十进制</th>
                    <th>二进制</th>
                    <th>十进制</th>
                    <th>二进制</th>
                  </tr>
                </thead>
                <tbody>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
                    <tr key={num}>
                      <td>{num}</td>
                      <td>{toBinary(num)}</td>
                      <td>{num + 16}</td>
                      <td>{toBinary(num + 16)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'add':
        return (
          <div className="section-content">
            <h2>➕ 加法运算</h2>
            <div className="info-card">
              <h3>二进制加法规则</h3>
              <ul>
                <li>0 + 0 = 0</li>
                <li>0 + 1 = 1</li>
                <li>1 + 0 = 1</li>
                <li>1 + 1 = 10（写 0 进 1）</li>
              </ul>
            </div>

            <div className="calculation-demo">
              <h3>加法计算器</h3>
              {renderCalcInputs('+', 'add')}

              {stepByStep && (
                <div className="step-by-step">
                  <h4>逐步计算过程：</h4>
                  <div className="binary-addition">
                    <div className="binary-row">
                      <span className="label">数字 1:</span>
                      <span className="binary">{toBinary(num1)}</span>
                    </div>
                    <div className="binary-row">
                      <span className="label">数字 2:</span>
                      <span className="binary">{toBinary(num2)}</span>
                    </div>
                    <div className="binary-row separator">
                      <span className="line">────────────────</span>
                    </div>
                    <div className="binary-row">
                      <span className="label">结果:</span>
                      <span className="binary result">{toBinary(calculate())}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 交互式二进制加法模拟器 */}
            <div className="simulation-area">
              <h3>🎮 交互式二进制加法模拟</h3>
              <div className="principle-box">
                <h4>📐 运算原理</h4>
                <p>二进制加法从<strong>最低位（最右边）</strong>开始，逐位相加，处理进位：</p>
                <ol>
                  <li>取两个数的同一位 bit1 和 bit2，加上来自低位的进位 carry</li>
                  <li>计算 sum = bit1 + bit2 + carry</li>
                  <li>结果位 = sum % 2（取余数：0 或 1）</li>
                  <li>向高位的进位 = sum ÷ 2（取整：0 或 1）</li>
                  <li>重复以上步骤直到所有 8 位都处理完毕</li>
                </ol>
                <p className="principle-example">
                  例如：5 + 3 = 00000101 + 00000011
                  <br />
                  第0位：1+1+0=2 → 写0进1；第1位：0+1+1=2 → 写0进1；第2位：1+0+1=2 → 写0进1；第3位：0+0+1=1 → 写1进0
                  <br />
                  结果：00001000 = 8 ✓
                </p>
              </div>
              <div className="addition-grid">
                <div className="carry-row">
                  <span>进位:</span>
                  {toBinary(num1).split('').map((_, pos) => {
                    const stepIdx = 7 - pos;
                    const step = addSteps[stepIdx];
                    return (
                      <div
                        key={pos}
                        className={`carry-bit ${currentStep > stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                      >
                        {currentStep > stepIdx ? step.carryIn : (currentStep === stepIdx ? step.carryIn : '')}
                      </div>
                    );
                  })}
                </div>
                <div className="number-row">
                  <span>数字 1:</span>
                  {toBinary(num1).split('').map((bit, pos) => {
                    const stepIdx = 7 - pos;
                    return (
                      <div
                        key={pos}
                        className={`number-bit ${currentStep >= stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={getBitStyle(bit)}
                      >
                        {bit}
                      </div>
                    );
                  })}
                </div>
                <div className="number-row">
                  <span>数字 2:</span>
                  {toBinary(num2).split('').map((bit, pos) => {
                    const stepIdx = 7 - pos;
                    return (
                      <div
                        key={pos}
                        className={`number-bit ${currentStep >= stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={getBitStyle(bit)}
                      >
                        {bit}
                      </div>
                    );
                  })}
                </div>
                <div className="separator-row">
                  <span></span>
                  {toBinary(num1).split('').map((_, pos) => (
                    <div key={pos} className="separator-bit">─</div>
                  ))}
                </div>
                <div className="result-row">
                  <span>结果:</span>
                  {toBinary(num1).split('').map((_, pos) => {
                    const stepIdx = 7 - pos;
                    const step = addSteps[stepIdx];
                    return (
                      <div
                        key={pos}
                        className={`result-bit ${currentStep > stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={currentStep > stepIdx ? getBitStyle(step.resultBit.toString()) : {}}
                      >
                        {currentStep > stepIdx ? step.resultBit : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {renderStepControls(addSteps.length)}

              <div className="step-explanation">
                <h4>当前步骤:</h4>
                <p>
                  {currentStep > 0 && addSteps[currentStep - 1]
                    ? addSteps[currentStep - 1].explanation
                    : '点击"下一步"开始演示加法过程'}
                </p>
                <div className="bit-operation">
                  {currentStep > 0 && addSteps[currentStep - 1] && (
                    <>
                      <span className="op-bit">第{addSteps[currentStep - 1].position}位:</span>
                      <span className="op-expression">
                        {addSteps[currentStep - 1].bit1} + {addSteps[currentStep - 1].bit2} + 进位{addSteps[currentStep - 1].carryIn} = {addSteps[currentStep - 1].sum}
                      </span>
                      <span className="op-result">
                        → 结果位:{addSteps[currentStep - 1].resultBit}, 进位:{addSteps[currentStep - 1].carryOut}
                      </span>
                    </>
                  )}
                </div>
                {currentStep >= addSteps.length && (
                  <div className="calc-detail" style={{ marginTop: '15px' }}>
                    <div className="calc-detail-line result-line">
                      计算完成：{num1} + {num2} = {num1 + num2}
                      <br />
                      {toBinary(num1)} + {toBinary(num2)} = {toBinary(num1 + num2)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>CPU 如何实现加法</h3>
              <p>
                CPU 使用<strong>加法器</strong>电路来实现二进制加法。
                最基本的加法器是<strong>半加器</strong>和<strong>全加器</strong>。
                多个全加器串联可以构成多位加法器，现代 CPU 的 ALU 可以一次完成 32 位或 64 位加法。
              </p>
            </div>
          </div>
        );

      case 'subtract':
        return (
          <div className="section-content">
            <h2>➖ 减法运算</h2>
            <div className="info-card">
              <h3>减法如何变成加法？</h3>
              <p>
                CPU 不直接做减法，而是使用<strong>补码</strong>将减法转换为加法：
                <br />
                <strong>A - B = A + (-B 的补码)</strong>
              </p>
            </div>

            <div className="calculation-demo">
              <h3>减法计算器</h3>
              {renderCalcInputs('-', 'subtract')}
            </div>

            {/* 交互式二进制减法模拟器 */}
            <div className="simulation-area">
              <h3>🎮 交互式二进制减法模拟（使用补码）</h3>
              <div className="principle-box">
                <h4>📐 运算原理</h4>
                <p>CPU <strong>没有减法器</strong>，减法通过补码转换为加法来完成：</p>
                <ol>
                  <li><strong>求补码</strong>：将减数 B 的每一位取反（0→1，1→0），然后加 1，得到 -B 的补码</li>
                  <li><strong>做加法</strong>：A - B = A + (-B 的补码)，用加法器完成运算</li>
                  <li><strong>取结果</strong>：忽略最高位的溢出进位，剩余 8 位就是最终结果</li>
                </ol>
                <p className="principle-example">
                  例如：5 - 3 = 5 + (-3的补码)
                  <br />
                  3 的二进制 = 00000011 → 取反 = 11111100 → 加1 = 11111101（这就是 -3 的补码）
                  <br />
                  00000101 + 11111101 = 1|00000010 → 忽略溢出 → 00000010 = 2 ✓
                </p>
              </div>

              <div className="complement-explanation">
                <h4>第一步：计算减数的补码</h4>
                <div className="complement-steps">
                  <div className="comp-row">
                    <span className="comp-label">原数 ({num2}):</span>
                    <div className="bits">
                      {subtractSteps.original.split('').map((bit, i) => (
                        <div key={i} className="bit" style={getBitStyle(bit)}>{bit}</div>
                      ))}
                    </div>
                  </div>
                  <div className="comp-row">
                    <span className="comp-label">取反:</span>
                    <div className="bits">
                      {subtractSteps.complement.split('').map((bit, i) => (
                        <div key={i} className="bit" style={getBitStyle(bit)}>{bit}</div>
                      ))}
                    </div>
                  </div>
                  <div className="comp-row">
                    <span className="comp-label">加 1:</span>
                    <div className="bits">
                      {subtractSteps.twosComplement.split('').map((bit, i) => (
                        <div key={i} className="bit" style={getBitStyle(bit)}>{bit}</div>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="comp-note">
                  现在 {num1} - {num2} = {num1} + (-{num2}的补码)
                </p>
              </div>

              <div className="addition-grid">
                <div className="carry-row">
                  <span>进位:</span>
                  {toBinary(num1).split('').map((_, pos) => {
                    const stepIdx = 7 - pos;
                    const step = subtractSteps.addSteps[stepIdx];
                    return (
                      <div
                        key={pos}
                        className={`carry-bit ${currentStep > stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                      >
                        {currentStep > stepIdx ? step.carryIn : (currentStep === stepIdx ? step.carryIn : '')}
                      </div>
                    );
                  })}
                </div>
                <div className="number-row">
                  <span>{num1}:</span>
                  {toBinary(num1).split('').map((bit, pos) => {
                    const stepIdx = 7 - pos;
                    return (
                      <div
                        key={pos}
                        className={`number-bit ${currentStep >= stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={getBitStyle(bit)}
                      >
                        {bit}
                      </div>
                    );
                  })}
                </div>
                <div className="number-row">
                  <span>补码:</span>
                  {subtractSteps.twosComplement.split('').map((bit, pos) => {
                    const stepIdx = 7 - pos;
                    return (
                      <div
                        key={pos}
                        className={`number-bit ${currentStep >= stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={getBitStyle(bit)}
                      >
                        {bit}
                      </div>
                    );
                  })}
                </div>
                <div className="separator-row">
                  <span></span>
                  {toBinary(num1).split('').map((_, pos) => (
                    <div key={pos} className="separator-bit">─</div>
                  ))}
                </div>
                <div className="result-row">
                  <span>结果:</span>
                  {toBinary(num1).split('').map((_, pos) => {
                    const stepIdx = 7 - pos;
                    const step = subtractSteps.addSteps[stepIdx];
                    return (
                      <div
                        key={pos}
                        className={`result-bit ${currentStep > stepIdx ? 'shown' : ''} ${currentStep === stepIdx ? 'active' : ''}`}
                        style={currentStep > stepIdx ? getBitStyle(step.resultBit.toString()) : {}}
                      >
                        {currentStep > stepIdx ? step.resultBit : ''}
                      </div>
                    );
                  })}
                </div>
              </div>

              {renderStepControls(subtractSteps.addSteps.length)}

              <div className="step-explanation">
                <h4>当前步骤:</h4>
                <p>
                  {currentStep > 0 && subtractSteps.addSteps[currentStep - 1]
                    ? subtractSteps.addSteps[currentStep - 1].explanation
                    : '点击"下一步"开始演示减法过程'}
                </p>
                {currentStep >= subtractSteps.addSteps.length && (
                  <div className="calc-detail" style={{ marginTop: '15px' }}>
                    <div className="calc-detail-line">
                      补码转换：{num2} → 取反 → 加1 → {subtractSteps.twosComplement}（即 -{num2} 的补码）
                    </div>
                    <div className="calc-detail-line">
                      加法运算：{toBinary(num1)} + {subtractSteps.twosComplement} = {toBinary(num1 - num2)}
                    </div>
                    <div className="calc-detail-line result-line">
                      计算完成：{num1} - {num2} = {num1 - num2}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>补码原理</h3>
              <p>
                在 8 位二进制中，负数的补码 = 反码 + 1。
                例如：-3 的补码 = 11111101（253 的无符号表示）
              </p>
              <p>
                所以：5 - 3 = 5 + (-3 的补码) = 00000101 + 11111101 = 00000010 = 2
              </p>
            </div>
          </div>
        );

      case 'multiply':
        return (
          <div className="section-content">
            <h2>✖️ 乘法运算</h2>
            <div className="info-card">
              <h3>乘法如何变成加法和移位？</h3>
              <p>
                CPU 使用<strong>移位和加法</strong>来实现乘法：
                <br />
                <strong>A × B = A 左移若干位后相加</strong>
              </p>
            </div>

            <div className="calculation-demo">
              <h3>乘法计算器</h3>
              {renderCalcInputs('×', 'multiply')}

              {stepByStep && (
                <div className="step-by-step">
                  <h4>乘法原理（以 {num1} × {num2} 为例）：</h4>
                  <div className="multiplication-explanation">
                    <p>
                      {num2} 的二进制是 {toBinary(num2)}
                    </p>
                    <p>从右到左检查每一位：</p>
                    <ul>
                      {toBinary(num2).split('').reverse().map((bit, index) => (
                        <li key={index}>
                          第{index}位是{bit}，如果是 1，就将{num1}左移{index}位
                          {bit === '1' ? `：${num1} × 2^${index} = ${num1 * Math.pow(2, index)}` : '（跳过）'}
                        </li>
                      ))}
                    </ul>
                    <p>将所有结果相加：{calculate()}</p>
                  </div>
                </div>
              )}
            </div>

            {/* 交互式二进制乘法模拟器 */}
            <div className="simulation-area">
              <h3>🎮 交互式二进制乘法模拟（移位相加）</h3>
              <div className="principle-box">
                <h4>📐 运算原理</h4>
                <p>二进制乘法通过<strong>移位和加法</strong>实现，类似十进制竖式乘法：</p>
                <ol>
                  <li>从右到左检查乘数 B 的每一位</li>
                  <li>如果该位为 <strong>1</strong>：将被乘数 A 左移相应位数，得到一个<strong>部分积</strong></li>
                  <li>如果该位为 <strong>0</strong>：跳过（部分积为 0）</li>
                  <li>将所有部分积<strong>相加</strong>，得到最终结果</li>
                </ol>
                <p className="principle-example">
                  例如：5 × 3 = 00000101 × 00000011
                  <br />
                  乘数第0位=1 → 5左移0位 = 5 (00000101)
                  <br />
                  乘数第1位=1 → 5左移1位 = 10 (00001010)
                  <br />
                  部分积相加：5 + 10 = 15 (00001111) ✓
                </p>
              </div>

              <div className="multiplication-grid">
                <div className="mult-row">
                  <span className="mult-label">被乘数 ({num1}):</span>
                  <div className="bits">
                    {multiplySteps.binary1.split('').map((bit, i) => (
                      <div key={i} className="bit" style={getBitStyle(bit)}>{bit}</div>
                    ))}
                  </div>
                </div>
                <div className="mult-row">
                  <span className="mult-label">乘数 ({num2}):</span>
                  <div className="bits">
                    {multiplySteps.binary2.split('').map((bit, pos) => {
                      const stepIdx = multiplySteps.partialProducts.findIndex(p => p.position === pos);
                      const isActive = stepIdx !== -1 && currentStep === stepIdx;
                      const isShown = stepIdx === -1 || currentStep > stepIdx;
                      return (
                        <div
                          key={pos}
                          className={`bit ${isShown ? 'shown' : ''} ${isActive ? 'active' : ''}`}
                          style={getBitStyle(bit)}
                        >
                          {bit}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="separator-row">
                  <span></span>
                  <div className="separator-bit">────────────────</div>
                </div>

                {multiplySteps.partialProducts.map((product, idx) => (
                  <div key={idx} className={`partial-product ${currentStep > idx ? 'shown' : ''} ${currentStep === idx ? 'active' : ''}`}>
                    <span className="mult-label">第{product.shiftAmount}位:</span>
                    <div className="bits">
                      {product.binary.split('').map((bit, i) => (
                        <div key={i} className="bit">{bit}</div>
                      ))}
                    </div>
                    <span className="shift-info">(左移{product.shiftAmount}位)</span>
                  </div>
                ))}

                {currentStep >= multiplySteps.partialProducts.length && (
                  <>
                    <div className="separator-row">
                      <span></span>
                      <div className="separator-bit">════════════════</div>
                    </div>
                    <div className="result-row">
                      <span className="mult-label">结果:</span>
                      <div className="bits result-bits">
                        {toBinary(multiplySteps.total).split('').map((bit, i) => (
                          <div key={i} className="bit result-bit">{bit}</div>
                        ))}
                      </div>
                      <span className="result-value">{multiplySteps.total}</span>
                    </div>
                  </>
                )}
              </div>

              {renderStepControls(multiplySteps.partialProducts.length)}

              <div className="explanation-box">
                <h4>当前算式详解:</h4>
                <p>
                  被乘数 {num1} = {multiplySteps.binary1}，乘数 {num2} = {multiplySteps.binary2}
                </p>
                {multiplySteps.partialProducts.length > 0 ? (
                  <div className="calc-detail">
                    {multiplySteps.partialProducts.map((product, idx) => (
                      <div key={idx} className={`calc-detail-line ${currentStep > idx ? 'shown' : ''}`}>
                        乘数第{product.shiftAmount}位=1 → {num1} 左移 {product.shiftAmount} 位 = {product.value} ({product.binary})
                      </div>
                    ))}
                    {currentStep >= multiplySteps.partialProducts.length && (
                      <div className="calc-detail-line result-line">
                        部分积相加：{multiplySteps.partialProducts.map(p => p.value).join(' + ')} = {multiplySteps.total} ({toBinary(multiplySteps.total)})
                      </div>
                    )}
                  </div>
                ) : (
                  <p>乘数为 0，结果为 0</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>CPU 乘法器</h3>
              <p>
                现代 CPU 有专门的<strong>乘法器电路</strong>，可以在一个时钟周期内完成乘法运算。
                基本原理仍然是移位和加法，但通过并行计算大大加快了速度。
              </p>
            </div>
          </div>
        );

      case 'divide':
        return (
          <div className="section-content">
            <h2>➗ 除法运算</h2>
            <div className="info-card">
              <h3>除法如何变成减法和移位？</h3>
              <p>
                CPU 使用<strong>移位和减法</strong>来实现除法：
                <br />
                <strong>A ÷ B = 不断从 A 中减去 B 的移位版本</strong>
              </p>
            </div>

            <div className="calculation-demo">
              <h3>除法计算器</h3>
              {renderCalcInputs('÷', 'divide')}
            </div>

            {/* 交互式二进制除法模拟器 */}
            <div className="simulation-area">
              <h3>🎮 交互式二进制除法模拟（重复减法）</h3>
              <div className="principle-box">
                <h4>📐 运算原理</h4>
                <p>二进制除法通过<strong>重复减法</strong>实现，类似十进制长除法：</p>
                <ol>
                  <li>从被除数 A 中减去除数 B（减法本身用补码转加法完成）</li>
                  <li>每成功减一次，商就加 1</li>
                  <li>重复步骤 1-2，直到余数小于除数为止</li>
                  <li>减法执行的次数就是<strong>商</strong>，最后剩下的就是<strong>余数</strong></li>
                </ol>
                <p className="principle-example">
                  例如：10 ÷ 3
                  <br />
                  第1次：10 - 3 = 7，商=1
                  <br />
                  第2次：7 - 3 = 4，商=2
                  <br />
                  第3次：4 - 3 = 1，商=3
                  <br />
                  1 &lt; 3，停止。结果：商=3，余数=1 ✓
                </p>
              </div>

              {currentStep >= divideSteps.steps.length && (
                <div className="division-info">
                  <p>
                    <strong>{num1} ÷ {num2}</strong> = <strong>{divideSteps.quotient}</strong> 余 <strong>{divideSteps.remainder}</strong>
                  </p>
                  <p>
                    二进制：{divideSteps.binary1} ÷ {divideSteps.binary2} = {divideSteps.binaryQuotient} 余 {divideSteps.binaryRemainder}
                  </p>
                </div>
              )}

              <div className="division-steps">
                {divideSteps.steps.map((step, idx) => (
                  <div key={idx} className={`division-step ${currentStep >= idx ? 'shown' : ''} ${currentStep === idx ? 'active' : ''}`}>
                    <div className="step-header">
                      <span className="step-number">步骤 {step.step}</span>
                    </div>
                    <div className="step-content">
                      <div className="division-expression">
                        <span>{step.dividend}</span>
                        <span className="operator">-</span>
                        <span>{step.divisor}</span>
                        <span className="equals">=</span>
                        <span className="result">{step.remainder}</span>
                      </div>
                      <div className="binary-expression">
                        <span>{step.binaryDividend}</span>
                        <span className="operator">-</span>
                        <span>{step.binaryDivisor}</span>
                        <span className="equals">=</span>
                        <span className="result">{step.binaryRemainder}</span>
                      </div>
                      <div className="step-info">
                        当前商：<strong>{step.binaryQuotient}</strong> ({step.quotient})
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {renderStepControls(divideSteps.steps.length)}

              <div className="explanation-box">
                <h4>当前算式详解:</h4>
                <p>
                  被除数 {num1} = {divideSteps.binary1}，除数 {num2} = {divideSteps.binary2}
                </p>
                {divideSteps.steps.length > 0 ? (
                  <div className="calc-detail">
                    {divideSteps.steps.map((step, idx) => (
                      <div key={idx} className={`calc-detail-line ${currentStep >= idx ? 'shown' : ''}`}>
                        第{step.step}次：{step.dividend} - {step.divisor} = {step.remainder}，商 = {step.quotient}
                      </div>
                    ))}
                    {currentStep >= divideSteps.steps.length && (
                      <div className="calc-detail-line result-line">
                        最终结果：商 = {divideSteps.quotient} ({divideSteps.binaryQuotient})，余数 = {divideSteps.remainder} ({divideSteps.binaryRemainder})
                      </div>
                    )}
                  </div>
                ) : (
                  <p>被除数小于除数，商为 0，余数为 {num1}</p>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>除法原理</h3>
              <p>
                除法是最复杂的运算。CPU 使用<strong>恢复余数法</strong>或<strong>不恢复余数法</strong>来实现。
                基本思路是从高位到低位，不断尝试减去除数的移位版本。
              </p>
              <p>
                例如：10 ÷ 3 = 3 余 1
              </p>
            </div>
          </div>
        );

      case 'cpu':
        return (
          <div className="section-content">
            <h2>🖥️ CPU 工作原理</h2>
            <div className="cpu-architecture">
              <div className="info-card">
                <h3>CPU 的主要部件</h3>
                <div className="cpu-components">
                  <div className="component">
                    <h4>控制单元（CU）</h4>
                    <p>指挥 CPU 的各个部件协同工作，从内存读取指令并解码</p>
                  </div>
                  <div className="component">
                    <h4>算术逻辑单元（ALU）</h4>
                    <p>执行加减乘除和逻辑运算（与、或、非）</p>
                  </div>
                  <div className="component">
                    <h4>寄存器</h4>
                    <p>超高速的临时存储，用于存放参与运算的数据</p>
                  </div>
                  <div className="component">
                    <h4>缓存（Cache）</h4>
                    <p>介于 CPU 和内存之间的高速缓冲存储器</p>
                  </div>
                </div>
              </div>

              <div className="info-card">
                <h3>指令执行周期</h3>
                <ol className="instruction-cycle">
                  <li>
                    <strong>取指（Fetch）</strong>
                    <p>从内存中读取下一条指令到指令寄存器</p>
                  </li>
                  <li>
                    <strong>解码（Decode）</strong>
                    <p>控制单元解析指令，确定需要执行什么操作</p>
                  </li>
                  <li>
                    <strong>执行（Execute）</strong>
                    <p>ALU 执行运算，或从/向内存读写数据</p>
                  </li>
                  <li>
                    <strong>写回（Writeback）</strong>
                    <p>将结果写回寄存器或内存</p>
                  </li>
                </ol>
              </div>

              <div className="info-card">
                <h3>性能指标</h3>
                <ul>
                  <li><strong>时钟频率</strong>：现代 CPU 2-5 GHz，每秒数十亿次运算</li>
                  <li><strong>字长</strong>：32 位或 64 位，决定一次能处理的数据量</li>
                  <li><strong>核心数</strong>：多核 CPU 可以并行执行多个任务</li>
                  <li><strong>缓存大小</strong>：更大的缓存可以减少访问内存的延迟</li>
                </ul>
              </div>
            </div>

            <div className="visualization">
              <h3>一次加法运算的全过程</h3>
              <div className="process-steps">
                <div className="process-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>从内存加载数据</h4>
                    <p>CPU 从内存地址读取两个数字到寄存器</p>
                  </div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>发送指令</h4>
                    <p>控制单元向 ALU 发送"加法"指令</p>
                  </div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>ALU 执行运算</h4>
                    <p>加法器电路执行二进制加法</p>
                  </div>
                </div>
                <div className="process-arrow">→</div>
                <div className="process-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>存储结果</h4>
                    <p>结果存回寄存器或写回内存</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="computer-arithmetic-lesson">
      <div className="lesson-header">
        <h1>💻 CPU 数学运算原理</h1>
        <p>探索计算机如何进行加减乘除 — 交互式二进制运算模拟</p>
      </div>

      <div className="lesson-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => {
              setActiveSection(section.id);
              resetSteps();
            }}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-text">{section.name}</span>
          </button>
        ))}
      </div>

      <div className="lesson-controls">
        <label>
          <input
            type="checkbox"
            checked={showBinary}
            onChange={(e) => setShowBinary(e.target.checked)}
          />
          显示二进制
        </label>
        <label>
          <input
            type="checkbox"
            checked={stepByStep}
            onChange={(e) => setStepByStep(e.target.checked)}
          />
          显示步骤
        </label>
      </div>

      <div className="lesson-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default ComputerArithmeticLesson;

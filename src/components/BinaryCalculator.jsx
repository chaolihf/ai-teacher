import { useState } from 'react';
import './BinaryCalculator.css';

function BinaryCalculator() {
  const [num1, setNum1] = useState(5);
  const [num2, setNum2] = useState(3);
  const [operation, setOperation] = useState('add');
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 十进制转二进制（8 位）
  const toBinary = (num, bits = 8) => {
    if (num < 0) {
      return ((1 << bits) + num).toString(2).padStart(bits, '0');
    }
    return num.toString(2).padStart(bits, '0');
  };

  // 计算结果
  const getBitStyle = (value, highlight = false) => {
    return {
      backgroundColor: value === '1' ? '#4CAF50' : '#e0e0e0',
      color: value === '1' ? 'white' : '#666',
      fontWeight: highlight ? 'bold' : 'normal',
    };
  };

  // 生成加法步骤
  const generateAddSteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    const steps = [];
    let carry = 0;

    for (let i = 7; i >= 0; i--) {
      const bit1 = parseInt(binary1[i]);
      const bit2 = parseInt(binary2[i]);
      const sum = bit1 + bit2 + carry;
      const resultBit = sum % 2;
      carry = Math.floor(sum / 2);

      steps.push({
        position: i,
        bit1,
        bit2,
        carryIn: carry > 0 ? 1 : 0,
        sum,
        resultBit,
        carryOut: carry,
        explanation: `${bit1} + ${bit2} + ${carry > 0 ? 1 : 0} = ${sum} (写${resultBit}${carry > 0 ? '进 1' : ''})`,
      });
    }

    return steps.reverse();
  };

  // 生成减法步骤（使用补码）
  const generateSubtractSteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    
    // 计算 -num2 的补码
    let complement = '';
    for (let i = 0; i < 8; i++) {
      complement += binary2[i] === '0' ? '1' : '0';
    }
    // 加 1 得到补码
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
      const sum = bit1 + bit2 + carry;
      const resultBit = sum % 2;
      carry = Math.floor(sum / 2);

      steps.push({
        position: i,
        bit1,
        bit2,
        carryIn: carry > 0 ? 1 : 0,
        sum,
        resultBit,
        carryOut: carry,
        explanation: `${bit1} + ${bit2} + ${carry > 0 ? 1 : 0} = ${sum} (写${resultBit}${carry > 0 ? '进 1' : ''})`,
      });
    }

    return {
      original: binary2,
      complement,
      twosComplement,
      addSteps: steps.reverse(),
    };
  };

  // 生成乘法步骤
  const generateMultiplySteps = () => {
    const binary1 = toBinary(num1);
    const binary2 = toBinary(num2);
    const steps = [];
    let partialProducts = [];
    let total = 0;

    for (let i = 7; i >= 0; i--) {
      const bit = parseInt(binary2[i]);
      if (bit === 1) {
        const shifted = num1 << (7 - i);
        partialProducts.push({
          position: 7 - i,
          bit,
          value: shifted,
          binary: toBinary(shifted),
          originalBinary: binary1,
          shiftAmount: 7 - i,
        });
        total += shifted;
      }
    }

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
    };
  };

  const addSteps = generateAddSteps();
  const subtractSteps = generateSubtractSteps();
  const multiplySteps = generateMultiplySteps();
  const divideSteps = generateDivideSteps();

  const resetSteps = () => {
    setCurrentStep(0);
    setIsAnimating(false);
  };

  const handleOperationChange = (newOp) => {
    setOperation(newOp);
    resetSteps();
  };

  return (
    <div className="binary-calculator">
      <div className="calculator-header">
        <h2>🔢 二进制运算模拟器</h2>
        <p>直观展示 CPU 如何进行加减乘除运算</p>
      </div>

      <div className="calculator-controls">
        <div className="input-section">
          <div className="input-group">
            <label>数字 1 (十进制):</label>
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
            <div className="binary-display">
              <span className="binary-label">二进制:</span>
              <div className="bits">
                {toBinary(num1).split('').map((bit, i) => (
                  <div key={i} className="bit" style={getBitStyle(bit)}>
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="operator-section">
            <button
              className={`op-btn ${operation === 'add' ? 'active' : ''}`}
              onClick={() => handleOperationChange('add')}
            >
              ➕ 加法
            </button>
            <button
              className={`op-btn ${operation === 'subtract' ? 'active' : ''}`}
              onClick={() => handleOperationChange('subtract')}
            >
              ➖ 减法
            </button>
            <button
              className={`op-btn ${operation === 'multiply' ? 'active' : ''}`}
              onClick={() => handleOperationChange('multiply')}
            >
              ✖️ 乘法
            </button>
            <button
              className={`op-btn ${operation === 'divide' ? 'active' : ''}`}
              onClick={() => handleOperationChange('divide')}
            >
              ➗ 除法
            </button>
          </div>

          <div className="input-group">
            <label>数字 2 (十进制):</label>
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
            <div className="binary-display">
              <span className="binary-label">二进制:</span>
              <div className="bits">
                {toBinary(num2).split('').map((bit, i) => (
                  <div key={i} className="bit" style={getBitStyle(bit)}>
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="result-section">
          <div className="result-box">
            <div className="result-label">
              {operation === 'add' && '+'}
              {operation === 'subtract' && '-'}
              {operation === 'multiply' && '×'}
              {operation === 'divide' && '÷'}
            </div>
            <div className="result-value">
              {operation === 'add' && num1 + num2}
              {operation === 'subtract' && num1 - num2}
              {operation === 'multiply' && num1 * num2}
              {operation === 'divide' && num2 !== 0 ? (num1 / num2).toFixed(2) : '错误'}
            </div>
            <div className="result-binary">
              <span className="binary-label">二进制:</span>
              <div className="bits">
                {toBinary(
                  operation === 'add' ? num1 + num2 :
                  operation === 'subtract' ? num1 - num2 :
                  operation === 'multiply' ? num1 * num2 : 0
                ).split('').map((bit, i) => (
                  <div key={i} className="bit result-bit" style={getBitStyle(bit)}>
                    {bit}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="simulation-area">
        {operation === 'add' && (
          <div className="addition-simulation">
            <h3>➕ 二进制加法详细过程</h3>
            <div className="addition-grid">
              <div className="carry-row">
                <span>进位:</span>
                {addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`carry-bit ${currentStep > i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                  >
                    {step.carryIn}
                  </div>
                ))}
              </div>
              <div className="number-row">
                <span>数字 1:</span>
                {addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`number-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.bit1.toString())}
                  >
                    {step.bit1}
                  </div>
                ))}
              </div>
              <div className="number-row">
                <span>数字 2:</span>
                {addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`number-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.bit2.toString())}
                  >
                    {step.bit2}
                  </div>
                ))}
              </div>
              <div className="separator-row">
                <span></span>
                {addSteps.map((_, i) => (
                  <div key={i} className="separator-bit">─</div>
                ))}
              </div>
              <div className="result-row">
                <span>结果:</span>
                {addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`result-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.resultBit.toString())}
                  >
                    {step.resultBit}
                  </div>
                ))}
              </div>
            </div>

            <div className="step-controls">
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ⏮️ 上一步
              </button>
              <span className="step-indicator">
                第 {currentStep} / {addSteps.length} 步
              </span>
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.min(addSteps.length, currentStep + 1))}
                disabled={currentStep === addSteps.length}
              >
                下一步 ⏭️
              </button>
              <button
                className={`control-btn ${isAnimating ? 'playing' : ''}`}
                onClick={() => {
                  if (isAnimating) {
                    setIsAnimating(false);
                  } else {
                    setIsAnimating(true);
                    const interval = setInterval(() => {
                      setCurrentStep((prev) => {
                        if (prev >= addSteps.length) {
                          clearInterval(interval);
                          setIsAnimating(false);
                          return prev;
                        }
                        return prev + 1;
                      });
                    }, 800);
                  }
                }}
              >
                {isAnimating ? '⏸️ 暂停' : '▶️ 自动播放'}
              </button>
            </div>

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
                    <span className="op-bit">第{7 - (currentStep - 1)}位:</span>
                    <span className="op-expression">
                      {addSteps[currentStep - 1].bit1} + {addSteps[currentStep - 1].bit2} + 进位{addSteps[currentStep - 1].carryIn} = {addSteps[currentStep - 1].sum}
                    </span>
                    <span className="op-result">
                      → 结果位:{addSteps[currentStep - 1].resultBit}, 进位:{addSteps[currentStep - 1].carryOut}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {operation === 'subtract' && (
          <div className="subtraction-simulation">
            <h3>➖ 二进制减法详细过程（使用补码）</h3>
            
            <div className="complement-explanation">
              <h4>第一步：计算减数的补码</h4>
              <div className="complement-steps">
                <div className="comp-row">
                  <span className="comp-label">原数 ({num2}):</span>
                  <div className="bits">
                    {subtractSteps.original.split('').map((bit, i) => (
                      <div key={i} className="bit">{bit}</div>
                    ))}
                  </div>
                </div>
                <div className="comp-row">
                  <span className="comp-label">取反:</span>
                  <div className="bits">
                    {subtractSteps.complement.split('').map((bit, i) => (
                      <div key={i} className="bit">{bit}</div>
                    ))}
                  </div>
                </div>
                <div className="comp-row">
                  <span className="comp-label">加 1:</span>
                  <div className="bits">
                    {subtractSteps.twosComplement.split('').map((bit, i) => (
                      <div key={i} className="bit">{bit}</div>
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
                {subtractSteps.addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`carry-bit ${currentStep > i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                  >
                    {step.carryIn}
                  </div>
                ))}
              </div>
              <div className="number-row">
                <span>{num1}:</span>
                {subtractSteps.addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`number-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.bit1.toString())}
                  >
                    {step.bit1}
                  </div>
                ))}
              </div>
              <div className="number-row">
                <span>补码:</span>
                {subtractSteps.addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`number-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.bit2.toString())}
                  >
                    {step.bit2}
                  </div>
                ))}
              </div>
              <div className="separator-row">
                <span></span>
                {subtractSteps.addSteps.map((_, i) => (
                  <div key={i} className="separator-bit">─</div>
                ))}
              </div>
              <div className="result-row">
                <span>结果:</span>
                {subtractSteps.addSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`result-bit ${currentStep >= i ? 'shown' : ''} ${currentStep === i ? 'active' : ''}`}
                    style={getBitStyle(step.resultBit.toString())}
                  >
                    {step.resultBit}
                  </div>
                ))}
              </div>
            </div>

            <div className="step-controls">
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ⏮️ 上一步
              </button>
              <span className="step-indicator">
                第 {currentStep} / {subtractSteps.addSteps.length} 步
              </span>
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.min(subtractSteps.addSteps.length, currentStep + 1))}
                disabled={currentStep === subtractSteps.addSteps.length}
              >
                下一步 ⏭️
              </button>
              <button
                className={`control-btn ${isAnimating ? 'playing' : ''}`}
                onClick={() => {
                  if (isAnimating) {
                    setIsAnimating(false);
                  } else {
                    setIsAnimating(true);
                    const interval = setInterval(() => {
                      setCurrentStep((prev) => {
                        if (prev >= subtractSteps.addSteps.length) {
                          clearInterval(interval);
                          setIsAnimating(false);
                          return prev;
                        }
                        return prev + 1;
                      });
                    }, 800);
                  }
                }}
              >
                {isAnimating ? '⏸️ 暂停' : '▶️ 自动播放'}
              </button>
            </div>
          </div>
        )}

        {operation === 'multiply' && (
          <div className="multiplication-simulation">
            <h3>✖️ 二进制乘法详细过程（移位相加）</h3>
            
            <div className="multiplication-grid">
              <div className="mult-row">
                <span className="mult-label">被乘数 ({num1}):</span>
                <div className="bits">
                  {multiplySteps.binary1.split('').map((bit, i) => (
                    <div key={i} className="bit">{bit}</div>
                  ))}
                </div>
              </div>
              <div className="mult-row">
                <span className="mult-label">乘数 ({num2}):</span>
                <div className="bits">
                  {multiplySteps.binary2.split('').map((bit, i) => (
                    <div key={i} className="bit">{bit}</div>
                  ))}
                </div>
              </div>
              <div className="separator-row">
                <span></span>
                <div className="separator-bit">────────────────</div>
              </div>
              
              {multiplySteps.partialProducts.map((product, idx) => (
                <div key={idx} className={`partial-product ${currentStep > idx ? 'shown' : ''} ${currentStep === idx ? 'active' : ''}`}>
                  <span className="mult-label">第{7 - parseInt(product.originalBinary.split('').findIndex(b => b === '1'))}位:</span>
                  <div className="bits">
                    {product.binary.split('').map((bit, i) => (
                      <div key={i} className="bit">{bit}</div>
                    ))}
                  </div>
                  <span className="shift-info">(左移{product.shiftAmount}位)</span>
                </div>
              ))}
              
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
            </div>

            <div className="step-controls">
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ⏮️ 上一步
              </button>
              <span className="step-indicator">
                第 {currentStep} / {multiplySteps.partialProducts.length} 步
              </span>
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.min(multiplySteps.partialProducts.length, currentStep + 1))}
                disabled={currentStep === multiplySteps.partialProducts.length}
              >
                下一步 ⏭️
              </button>
            </div>

            <div className="explanation-box">
              <h4>乘法原理:</h4>
              <p>
                乘数 {num2} 的二进制是 {multiplySteps.binary2}。
                从右到左检查每一位，如果是 1，就将被乘数左移相应位数。
                最后将所有部分积相加得到结果。
              </p>
              <p>
                {multiplySteps.partialProducts.length === 0 
                  ? '乘数为 0，结果为 0'
                  : `共有 ${multiplySteps.partialProducts.length} 个部分积需要相加`}
              </p>
            </div>
          </div>
        )}

        {operation === 'divide' && (
          <div className="division-simulation">
            <h3>➗ 二进制除法详细过程（重复减法）</h3>
            
            <div className="division-info">
              <p>
                <strong>{num1} ÷ {num2}</strong> = <strong>{divideSteps.quotient}</strong> 余 <strong>{divideSteps.remainder}</strong>
              </p>
              <p>
                二进制：{divideSteps.binary1} ÷ {divideSteps.binary2} = {divideSteps.binaryQuotient} 余 {divideSteps.binaryRemainder}
              </p>
            </div>

            <div className="division-steps">
              {divideSteps.steps.map((step, idx) => (
                <div key={idx} className={`division-step ${currentStep > idx ? 'shown' : ''} ${currentStep === idx ? 'active' : ''}`}>
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

            <div className="step-controls">
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                ⏮️ 上一步
              </button>
              <span className="step-indicator">
                第 {currentStep} / {divideSteps.steps.length} 步
              </span>
              <button
                className="control-btn"
                onClick={() => setCurrentStep(Math.min(divideSteps.steps.length, currentStep + 1))}
                disabled={currentStep === divideSteps.steps.length}
              >
                下一步 ⏭️
              </button>
            </div>

            <div className="explanation-box">
              <h4>除法原理:</h4>
              <p>
                CPU 使用重复减法来实现除法。从被除数中不断减去除数，
                直到被除数小于除数为止。减法的次数就是商，剩下的就是余数。
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BinaryCalculator;

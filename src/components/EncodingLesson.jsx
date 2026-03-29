import { useState, useEffect } from 'react';
import './EncodingLesson.css';
import KeyboardAnimation from './KeyboardAnimation';

// ASCII 码表（可打印字符）
const ASCII_TABLE = [];
for (let i = 32; i <= 126; i++) {
  ASCII_TABLE.push({ decimal: i, binary: i.toString(2).padStart(7, '0'), char: String.fromCharCode(i) });
}

// 常用汉字及其 Unicode 编码
const COMMON_CHINESE = [
  { char: '我', unicode: 'U+6211', pinyin: 'wǒ' },
  { char: '你', unicode: 'U+4F60', pinyin: 'nǐ' },
  { char: '他', unicode: 'U+4ED6', pinyin: 'tā' },
  { char: '是', unicode: 'U+662F', pinyin: 'shì' },
  { char: '的', unicode: 'U+7684', pinyin: 'de' },
  { char: '不', unicode: 'U+4E0D', pinyin: 'bù' },
  { char: '了', unicode: 'U+4E86', pinyin: 'le' },
  { char: '在', unicode: 'U+5728', pinyin: 'zài' },
  { char: '中', unicode: 'U+4E2D', pinyin: 'zhōng' },
  { char: '国', unicode: 'U+56FD', pinyin: 'guó' },
  { char: '人', unicode: 'U+4EBA', pinyin: 'rén' },
  { char: '民', unicode: 'U+6C11', pinyin: 'mín' },
  { char: '编', unicode: 'U+7F16', pinyin: 'biān' },
  { char: '码', unicode: 'U+7801', pinyin: 'mǎ' },
  { char: '字', unicode: 'U+5B57', pinyin: 'zì' },
  { char: '符', unicode: 'U+7B26', pinyin: 'fú' },
];

// UTF-8 编码规则说明
const UTF8_RULES = [
  { range: 'U+0000 - U+007F', bytes: 1, pattern: '0xxxxxxx', example: 'A' },
  { range: 'U+0080 - U+07FF', bytes: 2, pattern: '110xxxxx 10xxxxxx', example: '¢' },
  { range: 'U+0800 - U+FFFF', bytes: 3, pattern: '1110xxxx 10xxxxxx 10xxxxxx', example: '中' },
  { range: 'U+10000 - U+10FFFF', bytes: 4, pattern: '11110xxx 10xxxxxx 10xxxxxx 10xxxxxx', example: '𠮷' },
];

function EncodingLesson() {
  const [activeSection, setActiveSection] = useState('intro');
  const [inputText, setInputText] = useState('Hello 你好');
  const [encodedBytes, setEncodedBytes] = useState([]);
  const [quizMode, setQuizMode] = useState('char-to-decimal');
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizAnswer, setQuizAnswer] = useState('');
  const [quizResult, setQuizResult] = useState(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [keyboardInput, setKeyboardInput] = useState('');
  const [keyCodes, setKeyCodes] = useState([]);

  // 将文本转换为 UTF-8 字节序列
  const encodeToUTF8 = (text) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return Array.from(bytes).map((byte, index) => {
      const char = text[index] || '';
      return {
        byte,
        binary: byte.toString(2).padStart(8, '0'),
        hex: byte.toString(16).toUpperCase().padStart(2, '0'),
        char,
      };
    });
  };

  // 获取字符的详细信息
  const getCharInfo = (char) => {
    const codePoint = char.codePointAt(0);
    const utf16 = codePoint.toString(16).toUpperCase();
    const encoder = new TextEncoder();
    const bytes = encoder.encode(char);
    return {
      char,
      codePoint,
      unicode: `U+${utf16}`,
      decimal: codePoint,
      binary: codePoint.toString(2).padStart(16, '0'),
      utf8Bytes: Array.from(bytes),
      utf8Length: bytes.length,
    };
  };

  useEffect(() => {
    setEncodedBytes(encodeToUTF8(inputText));
  }, [inputText]);

  // 生成练习题
  const generateQuiz = () => {
    if (quizMode === 'char-to-decimal') {
      const randomChar = COMMON_CHINESE[Math.floor(Math.random() * COMMON_CHINESE.length)];
      setQuizQuestion({
        question: `汉字"${randomChar.char}"的 Unicode 码点十进制值是多少？`,
        answer: parseInt(randomChar.unicode.replace('U+', ''), 16).toString(),
        hint: `提示：${randomChar.pinyin}`,
      });
    } else if (quizMode === 'decimal-to-char') {
      const randomChar = COMMON_CHINESE[Math.floor(Math.random() * COMMON_CHINESE.length)];
      const decimal = parseInt(randomChar.unicode.replace('U+', ''), 16);
      setQuizQuestion({
        question: `十进制值 ${decimal} 对应的汉字是什么？`,
        answer: randomChar.char,
        hint: `提示：拼音是 ${randomChar.pinyin}`,
      });
    } else if (quizMode === 'ascii') {
      const randomASCII = ASCII_TABLE.filter((item) => item.char.trim() !== '');
      const randomItem = randomASCII[Math.floor(Math.random() * randomASCII.length)];
      setQuizQuestion({
        question: `字符"${randomItem.char}"的 ASCII 码十进制值是多少？`,
        answer: randomItem.decimal.toString(),
        hint: `提示：二进制是 ${randomItem.binary}`,
      });
    } else if (quizMode === 'binary-to-char') {
      const randomASCII = ASCII_TABLE.filter((item) => item.char.trim() !== '');
      const randomItem = randomASCII[Math.floor(Math.random() * randomASCII.length)];
      setQuizQuestion({
        question: `二进制 ${randomItem.binary} 对应的字符是什么？`,
        answer: randomItem.char,
        hint: `提示：十进制是 ${randomItem.decimal}`,
      });
    }
    setQuizAnswer('');
    setQuizResult(null);
  };

  // 检查答案
  const checkAnswer = () => {
    const isCorrect = quizAnswer.trim().toLowerCase() === quizQuestion.answer.toLowerCase();
    setQuizResult({
      correct: isCorrect,
      message: isCorrect ? '✅ 正确！' : `❌ 错误，正确答案是：${quizQuestion.answer}`,
    });
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
  };

  // 处理键盘输入
  const handleKeyDown = (e) => {
    const keyCodeInfo = {
      key: e.key,
      keyCode: e.keyCode,
      code: e.code,
      charCode: e.charCode,
      timestamp: new Date().toLocaleTimeString(),
    };
    setKeyCodes((prev) => [keyCodeInfo, ...prev.slice(0, 9)]);
  };

  const sections = [
    { id: 'intro', name: '课程介绍', icon: '📖' },
    { id: 'ascii', name: 'ASCII 编码', icon: '🔤' },
    { id: 'chinese', name: '汉字编码', icon: '🈳' },
    { id: 'utf8', name: 'UTF-8 详解', icon: '🔢' },
    { id: 'keyboard', name: '键盘输入', icon: '⌨️' },
    { id: 'practice', name: '编码练习', icon: '✏️' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="section-content">
            <h2>📖 字符编码基础</h2>
            <div className="intro-cards">
              <div className="info-card">
                <h3>💡 什么是字符编码？</h3>
                <p>
                  计算机只能理解数字（0 和 1）。字符编码就是将我们使用的文字、符号映射到数字的规则。
                  就像是一本"字典"，告诉计算机每个字符对应的数字是什么。
                </p>
              </div>
              <div className="info-card">
                <h3>🔑 为什么需要编码？</h3>
                <ul>
                  <li>让计算机能够存储和显示文字</li>
                  <li>确保不同系统之间文字传输正确</li>
                  <li>支持世界各国的语言文字</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>📜 编码发展史</h3>
                <ol>
                  <li><strong>ASCII</strong> (1963) - 美国信息交换标准代码</li>
                  <li><strong>GB2312/GBK</strong> (1980s) - 中国国家标准汉字编码</li>
                  <li><strong>Unicode</strong> (1991) - 统一码，包含世界所有文字</li>
                  <li><strong>UTF-8</strong> (1993) - Unicode 的变长编码方案</li>
                </ol>
              </div>
            </div>
          </div>
        );

      case 'ascii':
        return (
          <div className="section-content">
            <h2>🔤 ASCII 编码</h2>
            <div className="info-card">
              <h3>ASCII 码简介</h3>
              <p>
                ASCII（American Standard Code for Information Interchange）是最早的字符编码标准，
                使用 7 位二进制数表示 128 个字符（0-127）。
              </p>
              <ul>
                <li><strong>控制字符</strong>：0-31（如换行符、制表符）</li>
                <li><strong>可打印字符</strong>：32-126（字母、数字、标点符号）</li>
                <li><strong>删除字符</strong>：127</li>
              </ul>
            </div>

            <div className="ascii-table-container">
              <h3>ASCII 码表（可打印字符）</h3>
              <table className="ascii-table">
                <thead>
                  <tr>
                    <th>十进制</th>
                    <th>二进制</th>
                    <th>字符</th>
                    <th>十进制</th>
                    <th>二进制</th>
                    <th>字符</th>
                  </tr>
                </thead>
                <tbody>
                  {ASCII_TABLE.slice(0, 48).map((item, index) => (
                    <tr key={item.decimal}>
                      <td>{item.decimal}</td>
                      <td>{item.binary}</td>
                      <td className="char-cell">{item.char === ' ' ? '空格' : item.char}</td>
                      {ASCII_TABLE[index + 48] && (
                        <>
                          <td>{ASCII_TABLE[index + 48].decimal}</td>
                          <td>{ASCII_TABLE[index + 48].binary}</td>
                          <td className="char-cell">{ASCII_TABLE[index + 48].char === ' ' ? '空格' : ASCII_TABLE[index + 48].char}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="conversion-demo">
              <h3>数字 ↔ 字符 转换</h3>
              <div className="converter">
                <div className="converter-side">
                  <label>字符：</label>
                  <input
                    type="text"
                    maxLength={1}
                    placeholder="输入字符"
                    onChange={(e) => {
                      const char = e.target.value;
                      if (char) {
                        const code = char.charCodeAt(0);
                        document.getElementById('char-to-decimal-result').textContent =
                          `十进制：${code} | 二进制：${code.toString(2).padStart(7, '0')}`;
                      }
                    }}
                  />
                  <p id="char-to-decimal-result" className="result"></p>
                </div>
                <div className="converter-side">
                  <label>十进制：</label>
                  <input
                    type="number"
                    min="0"
                    max="127"
                    placeholder="0-127"
                    onChange={(e) => {
                      const code = parseInt(e.target.value);
                      if (code >= 0 && code <= 127) {
                        document.getElementById('decimal-to-char-result').textContent =
                          `字符：${String.fromCharCode(code)}`;
                      }
                    }}
                  />
                  <p id="decimal-to-char-result" className="result"></p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'chinese':
        return (
          <div className="section-content">
            <h2>🈳 汉字编码</h2>
            <div className="info-card">
              <h3>汉字编码的发展</h3>
              <p>
                ASCII 只能表示英文，为了表示汉字，各国制定了自己的编码标准。
              </p>
              <ul>
                <li><strong>GB2312</strong> (1980) - 收录 6763 个常用汉字</li>
                <li><strong>GBK</strong> (1995) - 扩展 GB2312，收录 21003 个汉字</li>
                <li><strong>GB18030</strong> (2000) - 中国国家标准，兼容 Unicode</li>
                <li><strong>Unicode</strong> - 收录超过 14 万个字符，包括所有汉字</li>
              </ul>
            </div>

            <div className="chinese-table-container">
              <h3>常用汉字 Unicode 编码表</h3>
              <table className="chinese-table">
                <thead>
                  <tr>
                    <th>汉字</th>
                    <th>Unicode</th>
                    <th>十进制</th>
                    <th>拼音</th>
                    <th>UTF-8 字节</th>
                  </tr>
                </thead>
                <tbody>
                  {COMMON_CHINESE.map((item) => {
                    const decimal = parseInt(item.unicode.replace('U+', ''), 16);
                    const encoder = new TextEncoder();
                    const bytes = Array.from(encoder.encode(item.char));
                    return (
                      <tr key={item.char}>
                        <td className="chinese-char">{item.char}</td>
                        <td>{item.unicode}</td>
                        <td>{decimal}</td>
                        <td>{item.pinyin}</td>
                        <td>{bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="info-card">
              <h3>💡 汉字编码小知识</h3>
              <p>
                在 Unicode 中，常用汉字主要分布在 <code>U+4E00 - U+9FFF</code> 范围内（中日韩统一表意文字）。
                每个汉字都有一个唯一的码点（Code Point），就像它的"身份证号"。
              </p>
            </div>
          </div>
        );

      case 'utf8':
        return (
          <div className="section-content">
            <h2>🔢 UTF-8 编码详解</h2>
            <div className="info-card">
              <h3>什么是 UTF-8？</h3>
              <p>
                UTF-8（8-bit Unicode Transformation Format）是 Unicode 的一种变长编码方案。
                它使用 1-4 个字节来表示一个字符，是互联网上使用最广泛的编码。
              </p>
              <ul>
                <li>✅ 兼容 ASCII：英文字符只用 1 字节</li>
                <li>✅ 节省空间：常用字符编码较短</li>
                <li>✅ 无字节序问题：网络传输友好</li>
              </ul>
            </div>

            <div className="utf8-rules">
              <h3>UTF-8 编码规则</h3>
              <table className="utf8-table">
                <thead>
                  <tr>
                    <th>Unicode 范围</th>
                    <th>字节数</th>
                    <th>编码格式</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  {UTF8_RULES.map((rule, index) => (
                    <tr key={index}>
                      <td>{rule.range}</td>
                      <td>{rule.bytes}</td>
                      <td><code>{rule.pattern}</code></td>
                      <td className="example-char">{rule.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="utf8-demo">
              <h3>UTF-8 编码演示</h3>
              <p className="demo-desc">输入文字，查看每个字符的 UTF-8 编码</p>
              <input
                type="text"
                className="utf8-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="输入中英文..."
              />
              <div className="encoded-display">
                {encodedBytes.map((item, index) => (
                  <div key={index} className="byte-card">
                    <span className="byte-char">{item.char || ' '}</span>
                    <span className="byte-value">
                      <span className="byte-decimal">{item.byte}</span>
                      <span className="byte-binary">{item.binary}</span>
                      <span className="byte-hex">0x{item.hex}</span>
                    </span>
                  </div>
                ))}
              </div>
              {encodedBytes.length > 0 && (
                <div className="encoding-summary">
                  <p>
                    总共 <strong>{encodedBytes.length}</strong> 字节 |
                    平均每个字符 <strong>{(encodedBytes.length / inputText.length).toFixed(2)}</strong> 字节
                  </p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>🔍 编码格式对比</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>文字</th>
                    <th>UTF-8</th>
                    <th>GBK</th>
                    <th>Unicode</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>A</td>
                    <td>41 (1 字节)</td>
                    <td>41 (1 字节)</td>
                    <td>0041 (2 字节)</td>
                  </tr>
                  <tr>
                    <td>中</td>
                    <td>E4 B8 AD (3 字节)</td>
                    <td>D6 D0 (2 字节)</td>
                    <td>4E2D (2 字节)</td>
                  </tr>
                  <tr>
                    <td>你好</td>
                    <td>E4 BD A0 E5 A5 BD (6 字节)</td>
                    <td>C4 E3 BA C3 (4 字节)</td>
                    <td>4F60 597D (4 字节)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'keyboard':
        return (
          <div className="section-content">
            <h2>⌨️ 键盘输入与编码</h2>
            
            {/* 动画演示 */}
            <KeyboardAnimation />
            
            <div className="info-card">
              <h3>键盘输入原理</h3>
              <p>
                当你按下键盘上的一个键时，计算机会收到一个<strong>扫描码</strong>（Scan Code），
                然后操作系统将其转换为对应的<strong>虚拟键码</strong>（Virtual Key Code），
                最终根据当前键盘布局转换为<strong>字符码</strong>（Character Code）。
              </p>
            </div>

            <div className="keyboard-demo">
              <h3>键盘输入实验</h3>
              <p className="demo-desc">在下方输入框中按键，查看每个按键的编码信息</p>
              <input
                type="text"
                className="keyboard-input"
                value={keyboardInput}
                onChange={(e) => setKeyboardInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="在这里按键..."
                autoFocus
              />
              <button className="clear-btn" onClick={() => { setKeyCodes([]); setKeyboardInput(''); }}>
                清空
              </button>

              <div className="key-codes-display">
                <h4>按键记录（最近 10 次）</h4>
                {keyCodes.length === 0 ? (
                  <p className="empty-hint">开始按键查看编码信息...</p>
                ) : (
                  <table className="key-codes-table">
                    <thead>
                      <tr>
                        <th>时间</th>
                        <th>按键</th>
                        <th>keyCode</th>
                        <th>code</th>
                        <th>charCode</th>
                      </tr>
                    </thead>
                    <tbody>
                      {keyCodes.map((item, index) => (
                        <tr key={index}>
                          <td>{item.timestamp}</td>
                          <td className="key-display">{item.key === ' ' ? '空格' : item.key}</td>
                          <td>{item.keyCode}</td>
                          <td><code>{item.code}</code></td>
                          <td>{item.charCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="info-card">
              <h3>💡 常见键码值</h3>
              <div className="key-codes-grid">
                <div className="key-code-item">
                  <span className="key-name">Enter</span>
                  <span className="key-value">keyCode: 13</span>
                </div>
                <div className="key-code-item">
                  <span className="key-name">Space</span>
                  <span className="key-value">keyCode: 32</span>
                </div>
                <div className="key-code-item">
                  <span className="key-name">A-Z</span>
                  <span className="key-value">keyCode: 65-90</span>
                </div>
                <div className="key-code-item">
                  <span className="key-name">0-9</span>
                  <span className="key-value">keyCode: 48-57</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'practice':
        return (
          <div className="section-content">
            <h2>✏️ 编码练习</h2>
            <div className="quiz-container">
              <div className="quiz-header">
                <h3>📝 选择题练习</h3>
                <div className="score-display">
                  得分：<span className="score">{score.correct}</span> / {score.total}
                  <span className="accuracy">
                    {score.total > 0 ? `(${((score.correct / score.total) * 100).toFixed(0)}%)` : ''}
                  </span>
                </div>
              </div>

              <div className="quiz-mode-selector">
                <button
                  className={`mode-btn ${quizMode === 'char-to-decimal' ? 'active' : ''}`}
                  onClick={() => { setQuizMode('char-to-decimal'); generateQuiz(); }}
                >
                  汉字→十进制
                </button>
                <button
                  className={`mode-btn ${quizMode === 'decimal-to-char' ? 'active' : ''}`}
                  onClick={() => { setQuizMode('decimal-to-char'); generateQuiz(); }}
                >
                  十进制→汉字
                </button>
                <button
                  className={`mode-btn ${quizMode === 'ascii' ? 'active' : ''}`}
                  onClick={() => { setQuizMode('ascii'); generateQuiz(); }}
                >
                  ASCII 字符→十进制
                </button>
                <button
                  className={`mode-btn ${quizMode === 'binary-to-char' ? 'active' : ''}`}
                  onClick={() => { setQuizMode('binary-to-char'); generateQuiz(); }}
                >
                  二进制→字符
                </button>
              </div>

              {quizQuestion && (
                <div className="quiz-question">
                  <p className="question-text">{quizQuestion.question}</p>
                  <p className="question-hint">{quizQuestion.hint}</p>
                  <div className="answer-input-group">
                    <input
                      type="text"
                      className="answer-input"
                      value={quizAnswer}
                      onChange={(e) => setQuizAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                      placeholder="输入你的答案"
                    />
                    <button className="check-btn" onClick={checkAnswer}>
                      提交答案
                    </button>
                  </div>
                  {quizResult && (
                    <div className={`quiz-result ${quizResult.correct ? 'correct' : 'incorrect'}`}>
                      {quizResult.message}
                    </div>
                  )}
                  <button className="next-btn" onClick={generateQuiz}>
                    下一题 →
                  </button>
                </div>
              )}
            </div>

            <div className="practice-tools">
              <h3>🛠️ 编码转换工具</h3>
              <div className="converter-grid">
                <div className="converter-card">
                  <h4>字符 → 多种编码</h4>
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="输入字符"
                    onChange={(e) => {
                      const char = e.target.value;
                      if (char) {
                        const info = getCharInfo(char);
                        document.getElementById('char-info-result').innerHTML = `
                          <p>Unicode: <strong>${info.unicode}</strong></p>
                          <p>十进制：<strong>${info.decimal}</strong></p>
                          <p>二进制：<strong>${info.binary}</strong></p>
                          <p>UTF-8: <strong>${info.utf8Bytes.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}</strong> (${info.utf8Length} 字节)</p>
                        `;
                      }
                    }}
                  />
                  <div id="char-info-result" className="converter-result"></div>
                </div>

                <div className="converter-card">
                  <h4>十进制 → 字符</h4>
                  <input
                    type="number"
                    placeholder="输入十进制值"
                    onChange={(e) => {
                      const code = parseInt(e.target.value);
                      if (code > 0) {
                        try {
                          const char = String.fromCodePoint(code);
                          document.getElementById('decimal-info-result').innerHTML = `
                            <p>字符：<strong>${char}</strong></p>
                            <p>Unicode: <strong>U+${code.toString(16).toUpperCase()}</strong></p>
                          `;
                        } catch {
                          document.getElementById('decimal-info-result').innerHTML = '<p class="error">无效的码点</p>';
                        }
                      }
                    }}
                  />
                  <div id="decimal-info-result" className="converter-result"></div>
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
    <div className="encoding-lesson">
      <nav className="encoding-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-text">{section.name}</span>
          </button>
        ))}
      </nav>

      <main className="encoding-main">
        {renderContent()}
      </main>
    </div>
  );
}

export default EncodingLesson;

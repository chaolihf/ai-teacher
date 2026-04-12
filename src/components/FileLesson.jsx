import { useState, useEffect } from 'react';
import './FileLesson.css';

// 文件系统示例数据
const FILE_SYSTEM_EXAMPLE = {
  name: 'C:\\Users\\Student',
  type: 'folder',
  children: [
    {
      name: 'Documents',
      type: 'folder',
      children: [
        { name: 'report.docx', type: 'file', size: '245 KB', modified: '2026-04-01' },
        { name: 'notes.txt', type: 'file', size: '12 KB', modified: '2026-04-08' },
        { name: 'presentation.pptx', type: 'file', size: '2.5 MB', modified: '2026-03-28' },
      ],
    },
    {
      name: 'Pictures',
      type: 'folder',
      children: [
        { name: 'photo.jpg', type: 'file', size: '3.2 MB', modified: '2026-04-05', format: 'JPEG' },
        { name: 'logo.png', type: 'file', size: '156 KB', modified: '2026-03-15', format: 'PNG' },
        { name: 'icon.svg', type: 'file', size: '8 KB', modified: '2026-03-20', format: 'SVG' },
      ],
    },
    {
      name: 'Videos',
      type: 'folder',
      children: [
        { name: 'tutorial.mp4', type: 'file', size: '125 MB', modified: '2026-04-02', format: 'MP4' },
        { name: 'clip.avi', type: 'file', size: '45 MB', modified: '2026-03-10', format: 'AVI' },
      ],
    },
    { name: 'readme.md', type: 'file', size: '4 KB', modified: '2026-04-09' },
    { name: 'data.json', type: 'file', size: '18 KB', modified: '2026-04-07' },
  ],
};

// 文件扩展名与类型映射
const FILE_EXTENSIONS = {
  // 文本文件
  txt: { type: '文本文件', icon: '📄', description: '纯文本文件，不包含格式' },
  md: { type: 'Markdown 文件', icon: '📝', description: '使用 Markdown 标记语言的文本文件' },
  json: { type: 'JSON 文件', icon: '📋', description: 'JavaScript 对象表示法，用于数据交换' },
  xml: { type: 'XML 文件', icon: '📋', description: '可扩展标记语言，用于数据交换' },
  csv: { type: 'CSV 文件', icon: '📊', description: '逗号分隔值，常用于表格数据' },
  
  // 文档文件
  doc: { type: 'Word 文档', icon: '📃', description: 'Microsoft Word 97-2003 文档' },
  docx: { type: 'Word 文档', icon: '📃', description: 'Microsoft Word 文档（XML 格式）' },
  pdf: { type: 'PDF 文档', icon: '📕', description: '便携式文档格式，保持格式不变' },
  pptx: { type: 'PowerPoint 演示文稿', icon: '📊', description: 'Microsoft PowerPoint 演示文稿' },
  xlsx: { type: 'Excel 表格', icon: '📈', description: 'Microsoft Excel 电子表格' },
  
  // 图片文件（复习前面学过的内容）
  jpg: { type: 'JPEG 图片', icon: '🖼️', description: '有损压缩图片格式，适合照片' },
  jpeg: { type: 'JPEG 图片', icon: '🖼️', description: '有损压缩图片格式，适合照片' },
  png: { type: 'PNG 图片', icon: '🖼️', description: '无损压缩图片格式，支持透明' },
  gif: { type: 'GIF 图片', icon: '🎞️', description: '支持动画的图片格式' },
  svg: { type: 'SVG 矢量图', icon: '🎨', description: '可缩放矢量图形，无限放大不失真' },
  bmp: { type: 'BMP 位图', icon: '🖼️', description: '未压缩的位图图像' },
  webp: { type: 'WebP 图片', icon: '🖼️', description: 'Google 开发的现代图片格式' },
  
  // 视频文件（复习前面学过的内容）
  mp4: { type: 'MP4 视频', icon: '🎬', description: '常用的视频格式，兼容性好' },
  avi: { type: 'AVI 视频', icon: '🎬', description: 'Audio Video Interleave，微软开发' },
  mov: { type: 'MOV 视频', icon: '🎬', description: 'QuickTime 视频格式' },
  mkv: { type: 'MKV 视频', icon: '🎬', description: 'Matroska 视频格式，支持多音轨' },
  webm: { type: 'WebM 视频', icon: '🎬', description: 'HTML5 视频格式，开放标准' },
  
  // 音频文件
  mp3: { type: 'MP3 音频', icon: '🎵', description: '有损压缩音频格式' },
  wav: { type: 'WAV 音频', icon: '🎵', description: '未压缩音频格式，音质好' },
  flac: { type: 'FLAC 音频', icon: '🎵', description: '无损压缩音频格式' },
  aac: { type: 'AAC 音频', icon: '🎵', description: '高级音频编码，效率高于 MP3' },
  
  // 压缩文件
  zip: { type: 'ZIP 压缩包', icon: '📦', description: '常用的压缩文件格式' },
  rar: { type: 'RAR 压缩包', icon: '📦', description: '高压缩率的压缩文件格式' },
  '7z': { type: '7z 压缩包', icon: '📦', description: '7-Zip 压缩格式，开源高效' },
  
  // 可执行文件
  exe: { type: '可执行文件', icon: '⚙️', description: 'Windows 可执行程序' },
  msi: { type: '安装程序', icon: '📥', description: 'Windows 安装程序包' },
  app: { type: '应用程序', icon: '⚙️', description: 'macOS 应用程序' },
  
  // 编程文件
  js: { type: 'JavaScript 文件', icon: '💻', description: 'JavaScript 源代码文件' },
  jsx: { type: 'React JSX 文件', icon: '⚛️', description: 'React 组件源代码文件' },
  py: { type: 'Python 文件', icon: '🐍', description: 'Python 源代码文件' },
  html: { type: 'HTML 文件', icon: '🌐', description: '网页超文本标记语言' },
  css: { type: 'CSS 文件', icon: '🎨', description: '层叠样式表，用于网页样式' },
};

// 常用命令行命令
const CLI_COMMANDS = [
  {
    command: 'dir (Windows) / ls (Linux/Mac)',
    description: '列出当前目录中的文件和文件夹',
    example: 'dir 或 ls -l',
    icon: '📋',
  },
  {
    command: 'cd <目录名>',
    description: '切换当前工作目录',
    example: 'cd Documents',
    icon: '📂',
  },
  {
    command: 'mkdir <目录名>',
    description: '创建新目录（文件夹）',
    example: 'mkdir MyFolder',
    icon: '➕',
  },
  {
    command: 'type <文件名> (Win) / cat <文件名> (Linux/Mac)',
    description: '查看文件内容',
    example: 'type readme.txt 或 cat readme.txt',
    icon: '👁️',
  },
  {
    command: 'copy <源> <目标> (Win) / cp <源> <目标> (Linux/Mac)',
    description: '复制文件',
    example: 'copy file.txt backup.txt',
    icon: '📋',
  },
  {
    command: 'move <源> <目标> (Win) / mv <源> <目标> (Linux/Mac)',
    description: '移动或重命名文件/文件夹',
    example: 'move old.txt new.txt',
    icon: '🔄',
  },
  {
    command: 'del <文件名> (Win) / rm <文件名> (Linux/Mac)',
    description: '删除文件',
    example: 'del temp.txt',
    icon: '🗑️',
  },
  {
    command: 'rmdir <目录名> (Win) / rm -r <目录名> (Linux/Mac)',
    description: '删除文件夹',
    example: 'rmdir OldFolder',
    icon: '🗑️',
  },
  {
    command: 'ren <旧名> <新名> (Win) / mv <旧名> <新名> (Linux/Mac)',
    description: '重命名文件或文件夹',
    example: 'ren file.txt document.txt',
    icon: '✏️',
  },
  {
    command: 'find (Linux/Mac) / dir /s (Win)',
    description: '搜索文件',
    example: 'find . -name "*.txt" 或 dir /s *.txt',
    icon: '🔍',
  },
  {
    command: 'tree',
    description: '以树状图显示目录结构',
    example: 'tree',
    icon: '🌳',
  },
  {
    command: 'pwd (Linux/Mac)',
    description: '显示当前工作目录路径',
    example: 'pwd',
    icon: '📍',
  },
];

// 文件大小单位换算
const SIZE_UNITS = [
  { unit: 'B (字节)', bytes: 1, example: '一个英文字符' },
  { unit: 'KB (千字节)', bytes: 1024, example: '一篇短文' },
  { unit: 'MB (兆字节)', bytes: 1024 * 1024, example: '一张照片' },
  { unit: 'GB (千兆字节)', bytes: 1024 * 1024 * 1024, example: '一部电影' },
  { unit: 'TB (太字节)', bytes: 1024 * 1024 * 1024 * 1024, example: '整个硬盘备份' },
];

function FileLesson() {
  const [activeSection, setActiveSection] = useState('intro');
  const [currentPath, setCurrentPath] = useState(FILE_SYSTEM_EXAMPLE);
  const [pathHistory, setPathHistory] = useState([FILE_SYSTEM_EXAMPLE]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextPosition, setContextPosition] = useState({ x: 0, y: 0 });
  const [newFileName, setNewFileName] = useState('');
  const [showNewFileInput, setShowNewFileInput] = useState(false);
  const [renamingFile, setRenamingFile] = useState(null);
  const [newName, setNewName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [cliInput, setCliInput] = useState('');
  const [cliHistory, setCliHistory] = useState([
    { type: 'info', content: 'Microsoft Windows [版本 10.0.19045.4046]' },
    { type: 'info', content: '(c) Microsoft Corporation。保留所有权利。' },
    { type: 'info', content: '' },
    { type: 'command', content: 'C:\\Users\\Student>dir' },
    { type: 'output', content: ' 驱动器 C 中的卷没有标签。\n 卷的序列号是 1234-5678\n\n C:\\Users\\Student 的目录\n\n2026-04-09  10:00    <DIR>          Documents\n2026-04-09  10:00    <DIR>          Pictures\n2026-04-09  10:00    <DIR>          Videos\n2026-04-09  10:00             4,096 readme.md\n2026-04-09  10:00            18,432 data.json\n               2 个文件         22,528 字节\n               3 个目录  100,000,000,000 可用字节' },
  ]);

  // 导航到文件夹
  const navigateToFolder = (folder) => {
    setPathHistory([...pathHistory, folder]);
    setCurrentPath(folder);
  };

  // 返回上级目录
  const goBack = () => {
    if (pathHistory.length > 1) {
      const newHistory = pathHistory.slice(0, -1);
      setPathHistory(newHistory);
      setCurrentPath(newHistory[newHistory.length - 1]);
    }
  };

  // 获取文件扩展名
  const getFileExtension = (filename) => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  };

  // 获取文件图标
  const getFileIcon = (item) => {
    if (item.type === 'folder') return '📁';
    const ext = getFileExtension(item.name);
    return FILE_EXTENSIONS[ext]?.icon || '📄';
  };

  // 右键菜单处理
  const handleContextMenu = (e, item) => {
    e.preventDefault();
    setSelectedFile(item);
    setContextPosition({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };

  // 关闭右键菜单
  useEffect(() => {
    const handleClick = () => setShowContextMenu(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // 搜索文件
  const searchFiles = (query) => {
    const results = [];
    const searchInFolder = (folder, path) => {
      if (folder.children) {
        folder.children.forEach((item) => {
          const fullPath = `${path}\\${item.name}`;
          if (item.name.toLowerCase().includes(query.toLowerCase())) {
            results.push({ ...item, path: fullPath });
          }
          if (item.type === 'folder') {
            searchInFolder(item, fullPath);
          }
        });
      }
    };
    searchInFolder(FILE_SYSTEM_EXAMPLE, FILE_SYSTEM_EXAMPLE.name);
    setSearchResults(results);
  };

  // 命令行模拟
  const executeCommand = (cmd) => {
    const trimmed = cmd.trim().toLowerCase();
    const newHistory = [...cliHistory, { type: 'command', content: `C:\\Users\\Student>${cmd}` }];

    if (trimmed === 'dir' || trimmed === 'ls') {
      const output = currentPath.children
        ? currentPath.children
            .map((item) => {
              const date = item.modified || '2026-04-09';
              const size = item.type === 'folder' ? '<DIR>' : item.size.padStart(15);
              return `${date}    ${size}  ${item.name}`;
            })
            .join('\n')
        : '目录为空';
      newHistory.push({ type: 'output', content: output });
    } else if (trimmed.startsWith('cd ')) {
      const folderName = cmd.slice(3).trim();
      const folder = currentPath.children?.find((item) => item.type === 'folder' && item.name.toLowerCase() === folderName.toLowerCase());
      if (folder) {
        newHistory.push({ type: 'output', content: `已切换到目录: ${folder.name}` });
      } else {
        newHistory.push({ type: 'error', content: `找不到目录: ${folderName}` });
      }
    } else if (trimmed.startsWith('mkdir ')) {
      const folderName = cmd.slice(6).trim();
      newHistory.push({ type: 'output', content: `已创建文件夹: ${folderName}` });
    } else if (trimmed.startsWith('type ') || trimmed.startsWith('cat ')) {
      const fileName = cmd.slice(trimmed.startsWith('type') ? 5 : 4).trim();
      const file = currentPath.children?.find((item) => item.type === 'file' && item.name.toLowerCase() === fileName.toLowerCase());
      if (file) {
        newHistory.push({ type: 'output', content: `文件内容: ${file.name} (${file.size})` });
      } else {
        newHistory.push({ type: 'error', content: `找不到文件: ${fileName}` });
      }
    } else if (trimmed.startsWith('ren ') || trimmed.startsWith('mv ')) {
      newHistory.push({ type: 'output', content: '文件已重命名' });
    } else if (trimmed.startsWith('del ') || trimmed.startsWith('rm ')) {
      newHistory.push({ type: 'output', content: '文件已删除' });
    } else if (trimmed === 'help') {
      newHistory.push({
        type: 'output',
        content: '可用命令: dir/ls, cd, mkdir, type/cat, ren/mv, del/rm, tree, help',
      });
    } else if (trimmed === 'tree') {
      newHistory.push({
        type: 'output',
        content: `${currentPath.name}\n${currentPath.children
          ?.map((item) => `├── ${item.name}${item.type === 'folder' ? '\\\\' : ''}`)
          .join('\n')}`,
      });
    } else if (trimmed !== '') {
      newHistory.push({ type: 'error', content: `'${trimmed}' 不是内部或外部命令，也不是可运行的程序。输入 'help' 查看可用命令。` });
    }

    setCliHistory(newHistory);
    setCliInput('');
  };

  const sections = [
    { id: 'intro', name: '文件基础', icon: '📁' },
    { id: 'explorer', name: '文件管理器', icon: '🗂️' },
    { id: 'extensions', name: '文件类型', icon: '📎' },
    { id: 'operations', name: '文件操作', icon: '⚙️' },
    { id: 'cli', name: '命令行', icon: '💻' },
    { id: 'search', name: '文件搜索', icon: '🔍' },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'intro':
        return (
          <div className="section-content">
            <h2>📁 文件与文件夹基础</h2>
            <div className="intro-cards">
              <div className="info-card">
                <h3>💡 什么是文件？</h3>
                <p>
                  文件是计算机存储信息的基本单位。就像现实世界中的文件夹里的纸张一样，
                  计算机文件可以包含文本、图片、音乐、视频等任何数字内容。
                </p>
                <ul>
                  <li><strong>文件名</strong>：文件的标识符，如 report.docx</li>
                  <li><strong>扩展名</strong>：表示文件类型，如 .docx、.jpg</li>
                  <li><strong>大小</strong>：文件占用的存储空间</li>
                  <li><strong>路径</strong>：文件在磁盘上的位置</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>📂 什么是文件夹？</h3>
                <p>
                  文件夹（目录）用于组织和分类文件。就像办公室的文件柜一样，
                  文件夹可以包含文件和其他文件夹，形成树状结构。
                </p>
                <ul>
                  <li><strong>层级结构</strong>：文件夹可以嵌套</li>
                  <li><strong>路径表示</strong>：C:\Users\Student\Documents</li>
                  <li><strong>特殊文件夹</strong>：桌面、文档、图片等</li>
                </ul>
              </div>
              <div className="info-card">
                <h3>🌳 文件系统树</h3>
                <p>文件系统采用树状结构，从根目录开始分支：</p>
                <div className="tree-diagram">
                  <div className="tree-node root">C:\\</div>
                  <div className="tree-children">
                    <div className="tree-node">Users\\</div>
                    <div className="tree-children">
                      <div className="tree-node">Student\\</div>
                      <div className="tree-children">
                        <div className="tree-node">📄 Documents\\</div>
                        <div className="tree-node">📄 Pictures\\</div>
                        <div className="tree-node">📄 Videos\\</div>
                        <div className="tree-node">📄 readme.md</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>🔗 与之前课程的联系</h3>
              <p>文件本质上都是<strong>二进制数据</strong>！还记得我们学过的内容吗？</p>
              <ul>
                <li>
                  <strong>文本文件</strong>：存储的是字符的编码（UTF-8/GBK），就像我们学过的字符编码课程
                </li>
                <li>
                  <strong>图片文件</strong>：存储像素信息和颜色数据，RGB 值就是二进制数字
                </li>
                <li>
                  <strong>视频文件</strong>：包含一系列图片帧和音频数据，经过压缩编码
                </li>
                <li>
                  <strong>所有文件</strong>：在硬盘上都是以 0 和 1 的形式存储的！
                </li>
              </ul>
            </div>

            <div className="size-units">
              <h3>💾 文件大小单位</h3>
              <table className="units-table">
                <thead>
                  <tr>
                    <th>单位</th>
                    <th>字节数</th>
                    <th>实际大小</th>
                    <th>示例</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_UNITS.map((item, index) => (
                    <tr key={index}>
                      <td><strong>{item.unit}</strong></td>
                      <td>{item.bytes.toLocaleString()} 字节</td>
                      <td>{item.bytes >= 1024 * 1024 ? (item.bytes / (1024 * 1024)).toFixed(0) + ' MB' : item.bytes >= 1024 ? (item.bytes / 1024) + ' KB' : '1 B'}</td>
                      <td>{item.example}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'explorer':
        return (
          <div className="section-content">
            <h2>🗂️ 文件管理器模拟</h2>
            <div className="info-card">
              <h3>💡 文件管理器</h3>
              <p>
                文件管理器是操作系统提供的工具，用于浏览、管理文件和文件夹。
                Windows 中叫"文件资源管理器"，macOS 中叫"访达（Finder）"。
              </p>
            </div>

            <div className="file-explorer">
              <div className="explorer-toolbar">
                <button
                  className="toolbar-btn"
                  onClick={goBack}
                  disabled={pathHistory.length <= 1}
                >
                  ⬅️ 返回
                </button>
                <div className="address-bar">
                  <span className="path-icon">📍</span>
                  <span className="path-text">{currentPath.name}</span>
                </div>
                <div className="view-toggle">
                  <button
                    className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    ⬜ 网格
                  </button>
                  <button
                    className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    📋 列表
                  </button>
                </div>
              </div>

              <div className="file-view">
                {viewMode === 'grid' ? (
                  <div className="grid-view">
                    {currentPath.children?.map((item, index) => (
                      <div
                        key={index}
                        className={`file-item ${selectedFile?.name === item.name ? 'selected' : ''}`}
                        onClick={() => setSelectedFile(item)}
                        onDoubleClick={() => item.type === 'folder' && navigateToFolder(item)}
                        onContextMenu={(e) => handleContextMenu(e, item)}
                      >
                        <div className="file-icon">{getFileIcon(item)}</div>
                        <div className="file-name">{item.name}</div>
                        {item.type === 'file' && <div className="file-size">{item.size}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="list-view">
                    <table className="file-table">
                      <thead>
                        <tr>
                          <th>名称</th>
                          <th>类型</th>
                          <th>大小</th>
                          <th>修改日期</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentPath.children?.map((item, index) => (
                          <tr
                            key={index}
                            className={`file-row ${selectedFile?.name === item.name ? 'selected' : ''}`}
                            onClick={() => setSelectedFile(item)}
                            onDoubleClick={() => item.type === 'folder' && navigateToFolder(item)}
                            onContextMenu={(e) => handleContextMenu(e, item)}
                          >
                            <td>
                              <span className="row-icon">{getFileIcon(item)}</span>
                              {item.name}
                            </td>
                            <td>{item.type === 'folder' ? '文件夹' : getFileExtension(item.name).toUpperCase() + ' 文件'}</td>
                            <td>{item.size || '-'}</td>
                            <td>{item.modified || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="file-details">
                  <h4>📋 文件详情</h4>
                  <div className="details-grid">
                    <div className="detail-item">
                      <span className="detail-label">名称：</span>
                      <span className="detail-value">{selectedFile.name}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">类型：</span>
                      <span className="detail-value">
                        {selectedFile.type === 'folder' ? '文件夹' : (FILE_EXTENSIONS[getFileExtension(selectedFile.name)]?.type || '文件')}
                      </span>
                    </div>
                    {selectedFile.size && (
                      <div className="detail-item">
                        <span className="detail-label">大小：</span>
                        <span className="detail-value">{selectedFile.size}</span>
                      </div>
                    )}
                    {selectedFile.modified && (
                      <div className="detail-item">
                        <span className="detail-label">修改时间：</span>
                        <span className="detail-value">{selectedFile.modified}</span>
                      </div>
                    )}
                    {selectedFile.format && (
                      <div className="detail-item">
                        <span className="detail-label">格式：</span>
                        <span className="detail-value">{selectedFile.format}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 右键菜单 */}
            {showContextMenu && (
              <div
                className="context-menu"
                style={{ left: contextPosition.x, top: contextPosition.y }}
              >
                <div className="menu-item" onClick={() => { /* 打开 */ }}>
                  📂 打开
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setRenamingFile(selectedFile);
                    setNewName(selectedFile.name);
                  }}
                >
                  ✏️ 重命名
                </div>
                <div className="menu-item" onClick={() => { /* 复制 */ }}>
                  📋 复制
                </div>
                <div className="menu-item" onClick={() => { /* 删除 */ }}>
                  🗑️ 删除
                </div>
                <div className="menu-divider" />
                <div
                  className="menu-item"
                  onClick={() => {
                    setShowNewFileInput(true);
                    setNewFileName('');
                  }}
                >
                  📄 新建文件
                </div>
                <div
                  className="menu-item"
                  onClick={() => {
                    setShowNewFileInput(true);
                    setNewFileName('');
                  }}
                >
                  📁 新建文件夹
                </div>
              </div>
            )}
          </div>
        );

      case 'extensions':
        return (
          <div className="section-content">
            <h2>📎 文件类型与扩展名</h2>
            <div className="info-card">
              <h3>💡 文件扩展名的作用</h3>
              <p>
                文件扩展名是文件名中最后一个点（.）后面的部分，它告诉操作系统和用户这个文件的类型。
                例如：document.<strong>docx</strong>、photo.<strong>jpg</strong>、song.<strong>mp3</strong>
              </p>
              <ul>
                <li><strong>识别文件类型</strong>：系统根据扩展名选择打开方式</li>
                <li><strong>关联应用程序</strong>：双击时自动启动对应程序</li>
                <li><strong>组织分类</strong>：便于管理和筛选文件</li>
              </ul>
            </div>

            <div className="extensions-tabs">
              {Object.keys(FILE_EXTENSIONS).reduce((acc, ext, index) => {
                const category = FILE_EXTENSIONS[ext].type.split(' ')[0];
                if (!acc.find((c) => c.name === category)) {
                  acc.push({ name: category, icon: FILE_EXTENSIONS[ext].icon });
                }
                return acc;
              }, []).map((category) => (
                <button
                  key={category.name}
                  className="ext-category-btn"
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            <div className="extensions-grid">
              {Object.entries(FILE_EXTENSIONS).map(([ext, info]) => (
                <div key={ext} className="extension-card">
                  <div className="ext-header">
                    <span className="ext-icon">{info.icon}</span>
                    <span className="ext-name">.{ext}</span>
                    <span className="ext-type">{info.type}</span>
                  </div>
                  <p className="ext-description">{info.description}</p>
                </div>
              ))}
            </div>

            <div className="info-card">
              <h3>🔍 复习：图片格式对比</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>格式</th>
                    <th>压缩类型</th>
                    <th>透明度</th>
                    <th>动画</th>
                    <th>适用场景</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>JPEG</strong></td>
                    <td>有损</td>
                    <td>❌</td>
                    <td>❌</td>
                    <td>照片、复杂图像</td>
                  </tr>
                  <tr>
                    <td><strong>PNG</strong></td>
                    <td>无损</td>
                    <td>✅</td>
                    <td>❌</td>
                    <td>图标、logo、需要透明的图像</td>
                  </tr>
                  <tr>
                    <td><strong>GIF</strong></td>
                    <td>无损（256 色）</td>
                    <td>✅（单色）</td>
                    <td>✅</td>
                    <td>简单动画、表情包</td>
                  </tr>
                  <tr>
                    <td><strong>SVG</strong></td>
                    <td>矢量（非位图）</td>
                    <td>✅</td>
                    <td>✅（CSS）</td>
                    <td>图标、logo、需要缩放的图形</td>
                  </tr>
                  <tr>
                    <td><strong>WebP</strong></td>
                    <td>有损/无损</td>
                    <td>✅</td>
                    <td>✅</td>
                    <td>网页图片（现代格式）</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-card">
              <h3>🎬 复习：视频格式对比</h3>
              <table className="comparison-table">
                <thead>
                  <tr>
                    <th>格式</th>
                    <th>开发公司</th>
                    <th>压缩标准</th>
                    <th>兼容性</th>
                    <th>特点</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>MP4</strong></td>
                    <td>MPEG</td>
                    <td>H.264/H.265</td>
                    <td>⭐⭐⭐⭐⭐</td>
                    <td>最常用，兼容性好</td>
                  </tr>
                  <tr>
                    <td><strong>AVI</strong></td>
                    <td>Microsoft</td>
                    <td>多种</td>
                    <td>⭐⭐⭐⭐</td>
                    <td>老格式，文件较大</td>
                  </tr>
                  <tr>
                    <td><strong>MOV</strong></td>
                    <td>Apple</td>
                    <td>H.264/H.265</td>
                    <td>⭐⭐⭐⭐</td>
                    <td>Apple 生态常用</td>
                  </tr>
                  <tr>
                    <td><strong>WebM</strong></td>
                    <td>Google</td>
                    <td>VP8/VP9</td>
                    <td>⭐⭐⭐⭐</td>
                    <td>HTML5 视频，开放标准</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'operations':
        return (
          <div className="section-content">
            <h2>⚙️ 文件基本操作</h2>
            <div className="info-card">
              <h3>📝 文件操作大全</h3>
              <p>文件和文件夹有多种操作方式，可以通过界面或命令行完成。</p>
            </div>

            <div className="operations-grid">
              <div className="operation-card">
                <div className="op-icon">📄</div>
                <h3>创建文件</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>右键 → 新建 → 文本文件</li>
                  <li>在应用程序中"另存为"</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>type nul &gt; file.txt</code>
                <p><strong>快捷键：</strong></p>
                <code>Ctrl + N</code>（在新窗口中）
              </div>

              <div className="operation-card">
                <div className="op-icon">📁</div>
                <h3>创建文件夹</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>右键 → 新建 → 文件夹</li>
                  <li>工具栏"新建文件夹"按钮</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>mkdir FolderName</code>
                <p><strong>快捷键：</strong></p>
                <code>Ctrl + Shift + N</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">✏️</div>
                <h3>重命名</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>右键 → 重命名</li>
                  <li>选中后按 F2</li>
                  <li>慢速双击（停顿）</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>ren old.txt new.txt</code>
                <p><strong>快捷键：</strong></p>
                <code>F2</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">📋</div>
                <h3>复制文件</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>Ctrl + C → Ctrl + V</li>
                  <li>右键 → 复制 → 粘贴</li>
                  <li>拖拽时按住 Ctrl</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>copy file.txt dest\</code>
                <p><strong>快捷键：</strong></p>
                <code>Ctrl + C / Ctrl + V</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">🔄</div>
                <h3>移动/剪切</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>Ctrl + X → Ctrl + V</li>
                  <li>右键 → 剪切 → 粘贴</li>
                  <li>直接拖拽</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>move file.txt dest\</code>
                <p><strong>快捷键：</strong></p>
                <code>Ctrl + X / Ctrl + V</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">🗑️</div>
                <h3>删除文件</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>按 Delete 键（回收站）</li>
                  <li>右键 → 删除</li>
                  <li>Shift + Delete（永久删除）</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>del file.txt</code>
                <p><strong>快捷键：</strong></p>
                <code>Delete</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">🔍</div>
                <h3>搜索文件</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>资源管理器右上角搜索框</li>
                  <li>使用通配符：*.txt</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>dir /s *.txt</code>
                <p><strong>快捷键：</strong></p>
                <code>Ctrl + F</code>
              </div>

              <div className="operation-card">
                <div className="op-icon">👁️</div>
                <h3>查看文件</h3>
                <p><strong>界面方式：</strong></p>
                <ul>
                  <li>双击打开</li>
                  <li>右键 → 打开方式</li>
                  <li>预览窗格</li>
                </ul>
                <p><strong>命令行：</strong></p>
                <code>type file.txt</code>
                <p><strong>快捷键：</strong></p>
                <code>Enter</code>
              </div>
            </div>

            <div className="info-card">
              <h3>⚠️ 文件操作注意事项</h3>
              <ul>
                <li><strong>删除文件前</strong>：确认文件不再需要，重要文件先备份</li>
                <li><strong>重命名</strong>：不要随意更改文件扩展名，可能导致无法打开</li>
                <li><strong>移动系统文件</strong>：不要移动不认识的系统文件，可能导致程序出错</li>
                <li><strong>文件名规范</strong>：避免使用特殊字符（如 \ / : * ? " &lt; &gt; |）</li>
                <li><strong>回收站</strong>：删除的文件可以在回收站找回（Shift+Delete 除外）</li>
              </ul>
            </div>
          </div>
        );

      case 'cli':
        return (
          <div className="section-content">
            <h2>💻 命令行操作</h2>
            <div className="info-card">
              <h3>💡 什么是命令行？</h3>
              <p>
                命令行（CLI - Command Line Interface）是通过输入文本命令来操作计算机的方式。
                相比图形界面（GUI），命令行更高效、强大，是程序员和系统管理员的必备技能。
              </p>
              <ul>
                <li><strong>Windows</strong>：命令提示符（cmd）、PowerShell</li>
                <li><strong>macOS/Linux</strong>：终端（Terminal）</li>
              </ul>
            </div>

            <div className="commands-reference">
              <h3>📚 常用命令速查表</h3>
              <div className="commands-grid">
                {CLI_COMMANDS.map((cmd, index) => (
                  <div key={index} className="command-card">
                    <div className="cmd-header">
                      <span className="cmd-icon">{cmd.icon}</span>
                      <code className="cmd-name">{cmd.command}</code>
                    </div>
                    <p className="cmd-desc">{cmd.description}</p>
                    <code className="cmd-example">{cmd.example}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="terminal-emulator">
              <h3>🖥️ 命令行模拟器</h3>
              <p className="terminal-desc">在下方输入命令，体验命令行操作</p>
              <div className="terminal-window">
                <div className="terminal-header">
                  <span className="terminal-dot red"></span>
                  <span className="terminal-dot yellow"></span>
                  <span className="terminal-dot green"></span>
                  <span className="terminal-title">命令提示符</span>
                </div>
                <div className="terminal-body">
                  {cliHistory.map((item, index) => (
                    <div key={index} className={`terminal-line terminal-${item.type}`}>
                      {item.content.split('\n').map((line, i) => (
                        <div key={i}>{line || '\u00A0'}</div>
                      ))}
                    </div>
                  ))}
                  <div className="terminal-input-line">
                    <span className="prompt">C:\Users\Student&gt;</span>
                    <input
                      type="text"
                      className="terminal-input"
                      value={cliInput}
                      onChange={(e) => setCliInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && executeCommand(cliInput)}
                      placeholder="输入命令..."
                      autoFocus
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="info-card">
              <h3>🎯 练习任务</h3>
              <ol className="task-list">
                <li>在模拟器中输入 <code>dir</code> 查看文件列表</li>
                <li>输入 <code>help</code> 查看所有可用命令</li>
                <li>尝试输入 <code>tree</code> 查看目录树</li>
                <li>输入一个不存在的命令，观察错误提示</li>
              </ol>
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="section-content">
            <h2>🔍 文件搜索</h2>
            <div className="info-card">
              <h3>💡 为什么需要搜索？</h3>
              <p>
                当文件越来越多时，快速找到需要的文件变得非常重要。
                操作系统提供了多种搜索方式，可以帮助你定位任何文件。
              </p>
            </div>

            <div className="search-demo">
              <h3>🔎 搜索模拟器</h3>
              <div className="search-input-group">
                <input
                  type="text"
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value) {
                      searchFiles(e.target.value);
                    } else {
                      setSearchResults([]);
                    }
                  }}
                  placeholder="输入文件名进行搜索..."
                />
                <button className="search-btn" onClick={() => searchQuery && searchFiles(searchQuery)}>
                  🔍 搜索
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="search-results">
                  <h4>搜索结果（{searchResults.length} 个文件）</h4>
                  <div className="results-list">
                    {searchResults.map((result, index) => (
                      <div key={index} className="result-item">
                        <span className="result-icon">{getFileIcon(result)}</span>
                        <div className="result-info">
                          <div className="result-name">{result.name}</div>
                          <div className="result-path">{result.path}</div>
                        </div>
                        {result.size && <div className="result-size">{result.size}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="no-results">
                  <p>🔍 未找到匹配的文件</p>
                </div>
              )}
            </div>

            <div className="info-card">
              <h3>📊 搜索技巧总结</h3>
              <table className="search-tips-table">
                <thead>
                  <tr>
                    <th>方式</th>
                    <th>方法</th>
                    <th>示例</th>
                    <th>说明</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>精确搜索</strong></td>
                    <td>输入完整文件名</td>
                    <td>readme.md</td>
                    <td>找到完全匹配的文件</td>
                  </tr>
                  <tr>
                    <td><strong>模糊搜索</strong></td>
                    <td>输入部分文件名</td>
                    <td>read</td>
                    <td>找到包含"read"的所有文件</td>
                  </tr>
                  <tr>
                    <td><strong>通配符搜索</strong></td>
                    <td>使用 * 和 ?</td>
                    <td>*.txt</td>
                    <td>找到所有 .txt 文件</td>
                  </tr>
                  <tr>
                    <td><strong>命令行搜索</strong></td>
                    <td>dir /s</td>
                    <td>dir /s *.jpg</td>
                    <td>递归搜索所有子目录</td>
                  </tr>
                  <tr>
                    <td><strong>高级搜索</strong></td>
                    <td>按大小、日期筛选</td>
                    <td>大小 &gt; 1MB</td>
                    <td>筛选特定条件的文件</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="info-card">
              <h3>🎯 搜索练习</h3>
              <ol className="task-list">
                <li>在搜索框中输入 "jpg"，查看所有图片文件</li>
                <li>输入 "data"，查找数据文件</li>
                <li>思考：如果要查找所有大于 1MB 的文件，该怎么做？</li>
                <li>在命令行中尝试 <code>dir /s *.txt</code> 命令</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="file-lesson">
      <nav className="lesson-nav">
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
      </nav>

      <main className="lesson-content">
        {renderContent()}
      </main>

      <footer className="lesson-footer">
        <p>💾 文件系统课程 - 探索文件和文件夹的奥秘</p>
      </footer>
    </div>
  );
}

export default FileLesson;

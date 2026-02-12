// ==UserScript==
// @name         Force PDF.js Toolbar
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  强制显示 PDF.js 工具栏按钮
// @match        *://*/*
// @grant        none

// ==/UserScript==
// 强制显示所有工具栏按钮
const style = document.createElement('style');
style.textContent = `
  .toolbar, .findbar, .download, .print {
    display: block !important;
    visibility: visible !important;
  }
`;
document.head.appendChild(style);

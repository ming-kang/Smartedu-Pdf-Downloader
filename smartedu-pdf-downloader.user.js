// ==UserScript==
// @name         国家智慧教育公共服务平台PDF下载按钮
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  拦截PDF.js加载的PDF数据并提供下载按钮
// @match        *://basic.smartedu.cn/pdfjs/*
// @grant        none
// @license      MIT
// ==/UserScript==

/**
 * 功能说明：
 * - 仅在国家中小学智慧教育平台网站生效
 * - 拦截PDF.js加载PDF时的网络请求
 * - 保存PDF blob数据，提供下载按钮
 * - 适用于数学教材等PDF.js下载功能被禁用的情况
 */

(function() {
    'use strict';

    console.log('PDF下载脚本启动...');

    // ============================================================
    // 配置
    // ============================================================
    const CONFIG = {
        BUTTON_ID: 'smartedu-pdf-download',
        BUTTON_ICON: '⬇',
        BUTTON_TEXT: '下载PDF',
        BUTTON_SUCCESS: '✓ 已下载',
        BUTTON_WAITING: '等待中...',
        SUCCESS_DURATION: 3000,
        WAITING_DURATION: 2000,
        MAX_BLOB_SIZE: 1 * 1024 * 1024 * 1024 // 1GB max
    };

    // ============================================================
    // 变量：存储拦截到的PDF blob和URL
    // ============================================================
    let pdfBlob = null;
    let pdfUrl = null;
    let downloadCount = 0;

    // ============================================================
    // 工具函数：从URL提取文件名
    // ============================================================
    function extractFilename(url) {
        try {
            // 尝试从URL路径中提取文件名
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const filename = pathname.split('/').pop();

            // 如果有文件名且以.pdf结尾，使用它
            if (filename && filename.toLowerCase().endsWith('.pdf')) {
                return decodeURIComponent(filename);
            }

            // 尝试从query参数中获取
            const params = urlObj.searchParams;
            if (params.has('filename')) {
                return decodeURIComponent(params.get('filename'));
            }

            // 默认文件名
            return `教材_${Date.now()}.pdf`;
        } catch (e) {
            return `教材_${Date.now()}.pdf`;
        }
    }

    // ============================================================
    // 工具函数：生成唯一ID
    // ============================================================
    function generateId() {
        return `pdf_${Date.now()}_${++downloadCount}`;
    }

    // ============================================================
    // 拦截fetch请求
    // ============================================================
    function interceptFetch() {
        const originalFetch = window.fetch;
        window.fetch = async function(...args) {
            const url = typeof args[0] === 'string' ? args[0] : args[0].url;

            // 更精确的PDF检测
            const isPdfRequest = /\.(pdf|pkg)(\?|$)/i.test(url) ||
                                  url.includes('pdf') && url.includes('content');

            if (isPdfRequest) {
                console.log('[拦截] 检测到PDF请求:', url);

                try {
                    const response = await originalFetch.apply(this, args);

                    // 检查响应状态
                    if (!response.ok) {
                        console.log('[警告] PDF请求响应异常:', response.status);
                        return response;
                    }

                    // 克隆响应并提取blob
                    try {
                        const blob = await response.clone().blob();

                        // 验证是否是PDF文件
                        if (blob.type === 'application/pdf' ||
                            blob.type === 'application/octet-stream') {

                            // 检查文件大小是否合理
                            if (blob.size > 0 && blob.size < CONFIG.MAX_BLOB_SIZE) {
                                console.log('[成功] 获取PDF blob, 大小:', formatSize(blob.size));
                                pdfBlob = blob;
                                pdfUrl = url;

                                // 更新按钮状态
                                updateButtonState('ready');
                            } else {
                                console.log('[警告] PDF文件大小异常:', blob.size);
                            }
                        }
                    } catch (e) {
                        console.log('[错误] 提取blob失败:', e.message);
                    }

                    return response;
                } catch (e) {
                    console.log('[错误] PDF请求失败:', e.message);
                    throw e;
                }
            }

            return originalFetch.apply(this, args);
        };
    }

    // ============================================================
    // 拦截XMLHttpRequest请求
    // ============================================================
    function interceptXHR() {
        const OriginalXHR = window.XMLHttpRequest;

        window.XMLHttpRequest = function() {
            const xhr = new OriginalXHR();
            const originalOpen = xhr.open;
            let targetUrl = '';

            // 重写open方法以捕获URL
            xhr.open = function(method, url, ...args) {
                targetUrl = url;
                return originalOpen.apply(this, [method, url, ...args]);
            };

            // 监听加载完成
            xhr.addEventListener('load', function() {
                // 检查是否是PDF请求且响应成功
                if (targetUrl && /\.(pdf|pkg)(\?|$)/i.test(targetUrl)) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        const responseType = xhr.getResponseHeader('Content-Type') || '';

                        if (xhr.response instanceof Blob) {
                            const blob = xhr.response;

                            if (responseType.includes('pdf') ||
                                blob.type === 'application/pdf' ||
                                blob.type === 'application/octet-stream') {

                                if (blob.size > 0 && blob.size < CONFIG.MAX_BLOB_SIZE) {
                                    console.log('[XHR成功] 获取PDF blob, 大小:', formatSize(blob.size));
                                    pdfBlob = blob;
                                    pdfUrl = targetUrl;
                                    updateButtonState('ready');
                                }
                            }
                        }
                    }
                }
            });

            // 监听错误
            xhr.addEventListener('error', function() {
                console.log('[XHR错误] PDF请求失败:', targetUrl);
            });

            return xhr;
        };
    }

    // ============================================================
    // 工具函数：格式化文件大小
    // ============================================================
    function formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
        return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    }

    // ============================================================
    // 创建下载按钮
    // ============================================================
    function createDownloadButton() {
        // 避免重复创建
        const existingBtn = document.getElementById(CONFIG.BUTTON_ID);
        if (existingBtn) {
            return existingBtn;
        }

        const btn = document.createElement('button');
        btn.id = CONFIG.BUTTON_ID;
        btn.innerHTML = `${CONFIG.BUTTON_ICON} ${CONFIG.BUTTON_TEXT}`;

        // 优化的样式
        btn.style.cssText = `
            position: fixed;
            top: 20px;
            left: 220px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            border: none;
            padding: 10px 18px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            cursor: pointer;
            z-index: 2147483647;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            transition: all 0.2s ease;
            user-select: none;
        `;

        // 悬停效果
        btn.onmouseenter = function() {
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 16px rgba(0,0,0,0.3)';
        };
        btn.onmouseleave = function() {
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
        };

        // 点击事件处理
        btn.onclick = function() {
            if (pdfBlob) {
                downloadPDF(btn);
            } else {
                // 还没有拦截到PDF
                btn.innerHTML = CONFIG.BUTTON_WAITING;
                setTimeout(() => {
                    btn.innerHTML = `${CONFIG.BUTTON_ICON} ${CONFIG.BUTTON_TEXT}`;
                }, CONFIG.WAITING_DURATION);
            }
        };

        // 添加到页面
        document.body.appendChild(btn);
        console.log('[按钮] 下载按钮已创建');

        return btn;
    }

    // ============================================================
    // 下载PDF
    // ============================================================
    function downloadPDF(btn) {
        try {
            // 从URL提取文件名
            const filename = pdfUrl ? extractFilename(pdfUrl) : `教材_${Date.now()}.pdf`;

            // 创建Blob URL
            const blobUrl = URL.createObjectURL(pdfBlob);

            // 创建下载链接
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();

            // 延迟清理
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(blobUrl); // 释放内存
                console.log('[清理] Blob URL已释放');
            }, 100);

            // 按钮反馈
            btn.innerHTML = CONFIG.BUTTON_SUCCESS;
            console.log('[成功] PDF下载开始:', filename);

            setTimeout(() => {
                btn.innerHTML = `${CONFIG.BUTTON_ICON} ${CONFIG.BUTTON_TEXT}`;
            }, CONFIG.SUCCESS_DURATION);

        } catch (e) {
            console.log('[错误] 下载失败:', e.message);
            btn.innerHTML = '✗ 下载失败';
            setTimeout(() => {
                btn.innerHTML = `${CONFIG.BUTTON_ICON} ${CONFIG.BUTTON_TEXT}`;
            }, CONFIG.WAITING_DURATION);
        }
    }

    // ============================================================
    // 更新按钮状态
    // ============================================================
    function updateButtonState(state) {
        const btn = document.getElementById(CONFIG.BUTTON_ID);
        if (!btn) return;

        switch (state) {
            case 'ready':
                btn.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                btn.title = '点击下载PDF';
                break;
            case 'downloading':
                btn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                btn.innerHTML = '下载中...';
                break;
        }
    }

    // ============================================================
    // 使用MutationObserver监听页面变化
    // ============================================================
    function setupObserver() {
        // 观察body变化，确保按钮被添加到页面
        const observer = new MutationObserver((mutations) => {
            const btn = document.getElementById(CONFIG.BUTTON_ID);
            if (!btn && document.body) {
                // 检测到页面有实质性变化，尝试创建按钮
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length > 0) {
                        createDownloadButton();
                    }
                });
            }
        });

        // 开始观察
        if (document.body) {
            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        } else {
            // 如果body还不存在，等待DOMContentLoaded
            document.addEventListener('DOMContentLoaded', () => {
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            });
        }
    }

    // ============================================================
    // 初始化
    // ============================================================
    function init() {
        console.log('[初始化] 开始初始化...');

        // 拦截网络请求
        interceptFetch();
        interceptXHR();

        // 立即尝试创建按钮
        createDownloadButton();

        // 设置MutationObserver监听动态内容
        setupObserver();

        // 备用方案：使用setTimeout作为降级
        const fallbackTimeouts = [1000, 2500, 5000, 10000];
        fallbackTimeouts.forEach((delay) => {
            setTimeout(() => {
                createDownloadButton();
            }, delay);
        });

        console.log('[初始化] 初始化完成');
    }

    // ============================================================
    // 启动
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

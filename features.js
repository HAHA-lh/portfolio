/* ===================================================
   FEATURES — 主题切换 / 多语言 / 分享 / 联系表单
   =================================================== */
(() => {
'use strict';

/* ==============================
   1. 主题切换（深色/浅色）
   ============================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

const themeIcons = {
    dark: '<path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/>',
    light: '<circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>'
};

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) themeIcon.innerHTML = themeIcons[theme];
}

// 初始化主题
const savedTheme = localStorage.getItem('theme') || 'dark';
setTheme(savedTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') || 'dark';
        setTheme(current === 'dark' ? 'light' : 'dark');
    });
}

/* ==============================
   2. 多语言支持（中/英）
   ============================== */
const i18n = {
    zh: {
        scroll: 'SCROLL',
        shareTitle: '分享作品集',
        copyLink: '复制链接',
        contactTitle: '联系方式',
        emailLabel: '邮箱',
        phoneLabel: '电话',
        addressLabel: '地址',
        addressValue: '北京市朝阳区',
        nameLabel: '姓名',
        emailField: '邮箱',
        messageLabel: '留言',
        namePlaceholder: '请输入您的姓名',
        emailPlaceholder: '请输入您的邮箱',
        messagePlaceholder: '请输入留言内容...',
        sendBtn: '发送消息',
        sendSuccess: '消息已发送，感谢您的联系！',
        sendError: '发送失败，请稍后再试或直接发邮件联系。',
        copiedText: '已复制！',
        exploreWorks: '探索作品',
        rotateHint: '滚轮旋转 · 移动鼠标倾斜',
        heroLabel: 'CREATIVE DESIGNER',
        heroLine1: '视觉创造者',
        heroLine2: '作品集',
        heroDesc: '3D / 2D / 影视 / AI — 全方位设计体验',
        navHome: '首页',
        navWorks: '作品',
        navAbout: '关于',
        navContact: '联系',
        aboutLine1: '关于',
        aboutLine2: '设计师',
        aboutDesc: '创意视觉设计师，专注于3D建模、2D设计、影视制作和AI辅助设计。致力于通过多维度视觉语言，为客户和品牌创造令人难忘的数字体验。',
        viewProject: '查看项目 →',
        detailSearchPlaceholder: '搜索作品标题或描述...',
        filterAll: '全部',
        filterImage: '图片',
        filterVideo: '视频',
        noResults: '没有找到匹配的作品',
    },
    en: {
        scroll: 'SCROLL',
        shareTitle: 'Share Portfolio',
        copyLink: 'Copy Link',
        contactTitle: 'Contact',
        emailLabel: 'Email',
        phoneLabel: 'Phone',
        addressLabel: 'Location',
        addressValue: 'Chaoyang, Beijing',
        nameLabel: 'Name',
        emailField: 'Email',
        messageLabel: 'Message',
        namePlaceholder: 'Enter your name',
        emailPlaceholder: 'Enter your email',
        messagePlaceholder: 'Enter your message...',
        sendBtn: 'Send Message',
        sendSuccess: 'Message sent! Thank you for reaching out.',
        sendError: 'Failed to send. Please try again or email directly.',
        copiedText: 'Copied!',
        exploreWorks: 'Explore Works',
        rotateHint: 'Scroll to rotate · Move mouse to tilt',
        heroLabel: 'CREATIVE DESIGNER',
        heroLine1: 'Visual',
        heroLine2: 'Portfolio',
        heroDesc: '3D / 2D / Film / AI — Full-spectrum design experience',
        navHome: 'Home',
        navWorks: 'Works',
        navAbout: 'About',
        navContact: 'Contact',
        aboutLine1: 'About',
        aboutLine2: 'Designer',
        aboutDesc: 'Creative visual designer specializing in 3D modeling, 2D design, film production, and AI-assisted design. Dedicated to creating memorable digital experiences through multidimensional visual language.',
        viewProject: 'View Project →',
        detailSearchPlaceholder: 'Search by title or description...',
        filterAll: 'All',
        filterImage: 'Image',
        filterVideo: 'Video',
        noResults: 'No matching works found',
    }
};

let currentLang = localStorage.getItem('lang') || 'zh';

function setLang(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    const dict = i18n[lang];
    if (!dict) return;

    // 更新所有 data-i18n 元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (dict[key]) {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                // skip, use placeholder
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // 更新 placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (dict[key]) el.placeholder = dict[key];
    });

    // 更新语言按钮高亮
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.dataset.lang === lang);
    });

    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
}

// 初始化语言
setLang(currentLang);

// 语言切换
const langToggle = document.getElementById('langToggle');
const langDropdown = document.getElementById('langDropdown');

if (langToggle && langDropdown) {
    langToggle.addEventListener('click', e => {
        e.stopPropagation();
        langDropdown.classList.toggle('open');
    });
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.addEventListener('click', () => {
            setLang(opt.dataset.lang);
            langDropdown.classList.remove('open');
        });
    });
    document.addEventListener('click', () => {
        langDropdown.classList.remove('open');
    });
}

/* ==============================
   3. 分享功能
   ============================== */
const shareBtn = document.getElementById('shareBtn');
const shareModal = document.getElementById('shareModal');
const shareClose = document.getElementById('shareClose');
const shareUrlInput = document.getElementById('shareUrlInput');
const shareCopyBtn = document.getElementById('shareCopyBtn');

function openShareModal() {
    if (shareUrlInput) {
        shareUrlInput.value = window.location.href;
    }
    if (shareModal) shareModal.classList.add('active');
}

function closeShareModal() {
    if (shareModal) shareModal.classList.remove('active');
}

if (shareBtn) shareBtn.addEventListener('click', openShareModal);
if (shareClose) shareClose.addEventListener('click', closeShareModal);
if (shareModal) {
    shareModal.addEventListener('click', e => {
        if (e.target === shareModal) closeShareModal();
    });
}

if (shareCopyBtn && shareUrlInput) {
    shareCopyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(shareUrlInput.value);
            shareCopyBtn.textContent = i18n[currentLang].copiedText;
            setTimeout(() => {
                shareCopyBtn.textContent = i18n[currentLang].copyLink;
            }, 2000);
        } catch {
            shareUrlInput.select();
            document.execCommand('copy');
        }
    });
}

// 社交平台分享
window.openShare = function(platform) {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    const text = encodeURIComponent('Check out this amazing design portfolio!');
    let shareUrl = '';

    switch (platform) {
        case 'wechat':
            // 微信无法直接跳转，提示用户复制链接
            if (shareCopyBtn && shareUrlInput) {
                navigator.clipboard.writeText(window.location.href).catch(() => {});
                shareCopyBtn.textContent = '✓ 已复制到剪贴板';
                setTimeout(() => {
                    shareCopyBtn.textContent = i18n[currentLang].copyLink;
                }, 2000);
            }
            return;
        case 'weibo':
            shareUrl = `https://service.weibo.com/share/share.php?url=${url}&title=${text}`;
            break;
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
            break;
    }
    if (shareUrl) window.open(shareUrl, '_blank', 'width=600,height=400');
};

/* ==============================
   4. 联系表单
   ============================== */
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();
        const submitBtn = contactForm.querySelector('.form-submit');
        submitBtn.disabled = true;
        submitBtn.textContent = '...';

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        try {
            // 使用 Formspree 免费服务（需要用户替换为自己的 endpoint）
            // 替换 https://formspree.io/f/YOUR_FORM_ID 为你自己的 Formspree 表单 ID
            const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                if (formMessage) {
                    formMessage.textContent = i18n[currentLang].sendSuccess;
                    formMessage.className = 'form-message success';
                }
                contactForm.reset();
            } else {
                throw new Error('Failed');
            }
        } catch {
            if (formMessage) {
                formMessage.textContent = i18n[currentLang].sendError;
                formMessage.className = 'form-message error';
            }
        }

        submitBtn.disabled = false;
        submitBtn.textContent = i18n[currentLang].sendBtn;
    });
}

/* ==============================
   5. 详情页 — 搜索和筛选
   ============================== */
// 只在 detail.html 页面执行
if (document.getElementById('galleryGrid')) {
    const grid = document.getElementById('galleryGrid');
    const allItems = grid.querySelectorAll('.gallery-item');
    const searchInput = document.querySelector('.detail-search-input');

    // 筛选按钮
    let activeFilter = 'all';
    document.querySelectorAll('.filter-tag').forEach(tag => {
        tag.addEventListener('click', () => {
            document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
            tag.classList.add('active');
            activeFilter = tag.dataset.filter;
            applyFilters();
        });
    });

    function applyFilters() {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
        let visibleCount = 0;

        allItems.forEach(item => {
            const title = (item.querySelector('.gallery-item-title') || {}).textContent || '';
            const desc = (item.querySelector('.gallery-item-desc') || {}).textContent || '';
            const type = item.dataset.type || '';
            const matchesSearch = !query || title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
            const matchesFilter = activeFilter === 'all' || type === activeFilter;

            if (matchesSearch && matchesFilter) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });

        // 显示/隐藏 "无结果" 提示
        let noResults = grid.querySelector('.gallery-no-results');
        if (visibleCount === 0) {
            if (!noResults) {
                noResults = document.createElement('div');
                noResults.className = 'gallery-no-results';
                grid.appendChild(noResults);
            }
            noResults.textContent = i18n[currentLang].noResults;
            noResults.style.display = '';
        } else if (noResults) {
            noResults.style.display = 'none';
        }
    }

    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
}

// ESC 关闭弹窗
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeShareModal();
        if (langDropdown) langDropdown.classList.remove('open');
    }
});

})();

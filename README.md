# 3D设计师作品集网站

一个专业、极简的3D设计师个人作品集网站，采用现代前端技术栈打造。

## 项目特点

✨ **极简设计风格** - 干净的视觉设计，突出内容本身
🎨 **响应式布局** - 完美适配桌面、平板和移动设备
⚡ **流畅动效** - 使用GSAP实现专业的页面动画
🚀 **高性能** - 优化的加载速度和用户体验

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代样式和布局
- **JavaScript** - 交互功能
- **GSAP** - 专业动效库

## 项目结构

```
├── index.html          # 主页面
├── detail.html         # 作品详情页
├── style.css          # 样式文件
├── script.js          # 交互脚本
└── README.md          # 项目说明
```

## 功能特性

### 导航功能
- 固定顶部导航栏
- 平滑滚动到各区域
- 移动端汉堡菜单
- 滚动时导航栏自动隐藏/显示

### 作品展示
- 网格布局展示作品
- 悬停缩放效果
- 点击查看详情
- 图片懒加载优化

### 动画效果
- 页面加载动画
- 滚动触发的进入动画
- 视差滚动效果
- 平滑的过渡效果

### 响应式设计
- 桌面端（1200px+）
- 平板端（768px - 1199px）
- 移动端（< 768px）

## 使用方法

### 本地运行

1. 克隆或下载项目文件
2. 直接在浏览器中打开 `index.html`

```bash
# 使用 Live Server（推荐）
# 安装 VSCode 扩展 "Live Server"
# 右键点击 index.html，选择 "Open with Live Server"
```

### 在线部署

项目可以部署到任何静态网站托管服务：

- GitHub Pages
- Netlify
- Vercel
- 阿里云OSS
- 腾讯云COS

## 自定义配置

### 修改主题颜色

在 `style.css` 文件中找到 `:root` 变量：

```css
:root {
    --primary-color: #2d2d2d;      /* 主色调 */
    --secondary-color: #666666;    /* 次要色 */
    --accent-color: #4a90e2;        /* 强调色 */
    /* ... 其他颜色变量 */
}
```

### 添加/修改作品

编辑 `index.html` 中的作品卡片部分：

```html
<div class="work-card" data-work-id="1">
    <div class="work-image">
        <img src="your-image-url.jpg" alt="作品标题" loading="lazy">
        <div class="work-overlay">
            <span class="work-category">作品分类</span>
        </div>
    </div>
    <div class="work-info">
        <h3 class="work-title">作品标题</h3>
        <p class="work-desc">作品描述</p>
        <a href="detail.html?id=1" class="work-link">查看详情 →</a>
    </div>
</div>
```

然后在 `detail.html` 的 `worksData` 对象中添加对应数据。

### 修改个人信息

在 `index.html` 中找到对应区域修改：

- **Hero区域**：修改标题、副标题和描述
- **工作经验**：修改 `experience` 区域的时间线内容
- **联系方式**：修改 `contact` 区域的联系信息

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 性能优化

- ✅ 图片懒加载
- ✅ CSS动画优先使用transform
- ✅ 节流滚动事件
- ✅ 使用CDN加载GSAP库
- ✅ 优化重排和重绘

## 注意事项

1. **图片资源**：示例使用的是Unsplash的占位图片，请替换为你的实际作品图片
2. **GSAP依赖**：确保网络可以访问CDN资源
3. **本地图片**：如果使用本地图片，请确保路径正确

## 扩展建议

可以考虑添加以下功能：

- [ ] 作品搜索和筛选功能
- [ ] 深色模式切换
- [ ] 多语言支持
- [ ] 作品评论系统
- [ ] 联系表单
- [ ] 社交媒体集成
- [ ] 作品分享功能

## 更新日志

### v1.0.0 (2024-04-08)
- ✨ 初始版本发布
- 🎨 完整的响应式设计
- ⚡ GSAP动画集成
- 📱 移动端适配

## 许可证

MIT License

## 作者

3D设计师

## 致谢

- [GSAP](https://greensock.com/gsap/) - 强大的动画库
- [Unsplash](https://unsplash.com/) - 高质量图片资源
- [Google Fonts](https://fonts.google.com/) - Inter字体

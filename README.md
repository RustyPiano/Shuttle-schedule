# 线路8 班车时刻表

一个现代化的班车时刻表查询应用，使用 React + TypeScript + Vite + Tailwind CSS 构建。

## 功能特性

- 📅 **快速日期切换**：今天、明天、本周六、本周日
- 🚌 **双线路支持**：三号院 ↔ 一号院
- ⏰ **实时倒计时**：显示下一班车的剩余时间
- 📱 **移动端优化**：响应式设计，完美适配手机
- 🎨 **现代化 UI**：简洁美观的界面设计
- ⚡ **极速加载**：优化的构建配置，毫秒级加载

## 技术栈

- **框架**: React 19 + TypeScript
- **构建工具**: Vite (Rolldown)
- **样式**: Tailwind CSS v4
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

访问 `http://localhost:5173/`

### 构建

```bash
npm run build
```

构建产物在 `dist/` 目录。

### 预览构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # React 组件
│   ├── Header.tsx
│   ├── DateChips.tsx
│   ├── RouteTabs.tsx
│   ├── NextBusCard.tsx
│   └── ScheduleList.tsx
├── data.ts          # 班车时刻数据
├── App.tsx          # 主应用组件
├── main.tsx         # 入口文件
└── index.css        # 全局样式
```

## License

MIT

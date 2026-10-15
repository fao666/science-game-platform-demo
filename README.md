# 科学能量站

## 恢复后的本地试玩（2026-10-15）

本目录从 https://github.com/fao666/science-game-platform-demo 恢复，基于提交 `fd14023`。最新版是 **小獭科学工坊：游园会亮灯计划**，位于 `web-classroom-game`；医院电路原型位于 `web-game-prototype`。

安装了 Node.js 的电脑可双击 `start-preview.cmd`，然后在浏览器打开 **http://127.0.0.1:4188/**。它会重新生成网页发布包，并提供首页、课堂游戏和教师工具。关闭预览窗口即停止服务。

也可运行 `node scripts/serve-preview.mjs`。验证规则：`node --test web-classroom-game/tests/*.test.js`。生成可部署文件：`node scripts/build-preview.mjs`，输出至 `public-preview`。

本次修复了旧进度字段缺失/异常内容导致启动失败，以及改动多个部位后报告错误归因的问题。异常进度原文会备份到浏览器本地键 `otter-classroom-v1-recovery`。本地恢复文件不包含原聊天正文、未上传材料或其他浏览器里的学生记录。

按本轮导师讨论反馈，新版增加持续下一步指引、场景路线箭头、门口范围自动进入、三种作品的实物图片、可见电池/灯座/导线组成的自制检测器，制作台支持点击与拖拽两种接线。完整说明见 `docs/design-decisions.md` 和 `docs/recovery-and-qa.md`。

最新整合版已加入头部比例收小的男女学生角色、实物器材与长导线；检测器首次显眼说明、一次自检后持续使用、取消拖开关入托盘等调整见 `docs/revision-v4.md`。

以下为仓库原有的早期阶段说明，最新版范围详见 `web-classroom-game/README.md`。

面向小学科学课堂的教育游戏平台。目前包含四年级教材课程目录、《城市停电修复》四关交互原型、固定分层提示和教师数据看板演示。

## 当前结构

- `web-demo`：无需安装即可本地预览的交互原型。
- `docs/science-game-mvp-product-design.md`：产品设计文档。
- `docs/technical-architecture.md`：前后端技术架构与开发路线。

## 当前阶段

当前版本用于确认教材内容、游戏机制、页面流程和研究数据字段。下一阶段将迁移到 Next.js、SQLite/PostgreSQL 和 Docker 的正式开发结构。


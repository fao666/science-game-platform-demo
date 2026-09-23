# GitHub 开源项目调研：四年级科学“医院电路抢修”游戏扩展方案

> 调研目标：在不改变“小学四年级简单电路”教学范围的前提下，把现有几分钟样关扩展为 10–15 分钟、有探索、有判断、有结果反馈的完整网页游戏关卡。资料仅采用官方 GitHub 仓库或官方文档。

## 一、结论先行

最合适的路线不是整体换引擎，也不是嵌入一款现成电路模拟器，而是继续使用 **Phaser + TypeScript**，把当前单场景升级为以下组合：

1. 用 Tiled/Phaser Tilemap 重做医院地图，加入房间、墙体、门、停电区域和碰撞；
2. 用“任务状态机”而非线性箭头控制剧情，让学生在多个线索中自主选择调查顺序；
3. 把接线板从唯一挑战改成“观察症状—排查线路—选择元件—验证假设”的核心诊断循环；
4. 用光照、粒子、环境音、NPC 动作和医院状态变化呈现操作后果；
5. 用 React–Phaser EventBus 把“返回课程大厅”和过程日志接回现有网站。

Phaser 本身已经提供场景、相机、Tilemap、动画、物理、粒子、补间和声音等能力；官方仓库也提供 2000 多个示例，因此没有必要再叠加另一套重型游戏引擎。[Phaser 官方仓库](https://github.com/phaserjs/phaser) [Phaser 官方示例库](https://github.com/phaserjs/examples)

## 二、值得借鉴的开源项目和机制

### 1. Phaser 官方引擎与示例：地图、碰撞、光效和场景分层

- 项目：[phaserjs/phaser](https://github.com/phaserjs/phaser)
- 示例：[phaserjs/examples](https://github.com/phaserjs/examples)
- 许可证：Phaser 引擎为 MIT；官方示例代码为 MIT，但示例库明确说明其中部分素材并不可自由用于商业或广告项目，所以只能复用代码思路，不能整包搬素材。[Phaser License](https://github.com/phaserjs/phaser/blob/master/LICENSE.md) [Examples README](https://github.com/phaserjs/examples)
- 可借鉴机制：
  - Tiled 地图中给墙、设备、柜台设置 `collides: true`，通过 `setCollisionByProperty` 生成阻挡区；官方 Tilemap API 支持按图块属性启用碰撞。[Tilemap API](https://docs.phaser.io/api-documentation/class/tilemaps-tilemap)
  - 地图层分为地板、墙体、家具、交互物和前景遮挡，角色可在床、柜台、门洞之间自然穿行。
  - 场景拆分为 `HospitalScene`、`CircuitBoardScene`、`UIScene`、`ResultScene`；UI 可与游戏场景同时运行，并通过场景事件通信。Phaser 官方场景说明中提供了并行 UI 场景和事件监听的方式。[Scenes 官方说明](https://github.com/phaserjs/phaser/blob/master/skills/scenes/SKILL.md)
  - 粒子系统适合制作短路火花、导线电流光点、设备启动蒸汽和成功彩屑；官方粒子文档支持颜色、透明度、大小随生命周期变化，以及沿路径边缘发射。[Particles 官方说明](https://github.com/phaserjs/phaser/blob/master/skills/particles/SKILL.md)
  - Phaser 4 的滤镜支持 Glow、Blur、ColorMatrix、Vignette，可用全屏暗色滤镜表现停电，用局部 Glow 表现恢复供电；但滤镜依赖 WebGL，应保留普通颜色/透明度降级方案。[Filters 官方说明](https://github.com/phaserjs/phaser/blob/master/skills/filters-and-postfx/SKILL.md)
- 集成方式：现有 Phaser 项目原位增强，无需换栈。

### 2. Phaser React 官方模板：返回主页面与平台数据桥

- 项目：[phaserjs/template-react](https://github.com/phaserjs/template-react)
- 许可证：MIT（模板仓库）。
- 可借鉴机制：官方模板提供 React 与 Phaser 之间的 `EventBus`，并通过 `PhaserGame` 组件暴露当前游戏实例和活动场景。[官方模板 README](https://github.com/phaserjs/template-react)
- 当前项目中的用法：
  - 游戏左上角始终显示“返回课程大厅”按钮；点击后先发送 `session_pause` / `scene_exit` 日志，再由 React/Next 路由回到四年级课程页；
  - 离开页面时销毁或暂停 Phaser 实例，避免返回主页面后键盘监听和声音继续运行；
  - React 把学生编号、班级、实验批次、关卡 ID 传给 Phaser；Phaser 把操作事件传回后台。
- 判断：这是“试玩页不能返回主页面”的直接解决方案，优先级最高。

### 3. EasyStar.js：NPC 带路和点击移动，但不替学生解题

- 项目：[prettymuchbryce/easystarjs](https://github.com/prettymuchbryce/easystarjs)
- 许可证：MIT。
- 能力：轻量异步 A* 寻路，支持网格、不可通行图块、不同地形代价、斜向移动和 TypeScript。[官方 README](https://github.com/prettymuchbryce/easystarjs)
- 可借鉴机制：
  - 点击地面后角色自动绕过病床和柜台；键盘移动仍保留；
  - NPC 在报警后自己跑向故障房间，形成“医院正在运转”的感觉；
  - 当学生主动请求提示时，护士只走到“线索所在区域”，不直接把学生带到答案或元件旁。
- 集成方式：读取与 Tilemap 相同的可通行网格，在 Phaser 更新循环中分段执行寻路结果。

### 4. Rex Phaser 插件：分支对话和任务变量

- 项目：[rexrainbow/phaser3-rex-notes](https://github.com/rexrainbow/phaser3-rex-notes)
- 许可证：MIT（NPM 包也标注 MIT）。
- 可借鉴机制：`DialogQuest` 支持问题、选项、分支、数据读写和完成事件；`TextPlayer` 支持逐字文本、点击继续、音效和背景音乐控制。[Dialog Quest 文档](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/dialog-quest/) [TextPlayer 源码文档](https://github.com/rexrainbow/phaser3-rex-notes/blob/master/docs/docs/textplayer.md)
- 推荐用法：
  - 护士提供“设备现象”，保安提供“停电前发生了什么”，维修记录提供“上次换过哪个元件”；学生可以自由决定问谁；
  - 对话选项体现调查策略，例如“先看灯泡”“先检查开关”“先检查电池”，选择本身不判对错，只改变后续线索与日志；
  - 任务数据保存为 `talkedToNurse`、`inspectedLamp`、`testedBattery`、`hypothesis` 等，而不是按固定步骤锁死所有交互。
- 集成建议：第一版可以借鉴其数据结构而不必立即引入整套 UI 插件，避免包体和界面风格失控；若后续对话大量增加，再引入对应模板。

### 5. Kirchhoff Arcade：让科学规律成为游戏机制

- 项目：[fisicagames/kirchhoff-arcade](https://github.com/fisicagames/kirchhoff-arcade)
- 许可证：MIT。
- 特点：它把俄罗斯方块式落子与真实电路求解结合，使用 TypeScript、Canvas 2D 和自定义 MVC，说明“电路状态”可以持续改变游戏结果，而不只是提交一次答案。[官方仓库](https://github.com/fisicagames/kirchhoff-arcade)
- 可借鉴而不照搬的机制：
  - 每次接线或切换开关后立即重新计算线路状态；
  - 灯泡亮度、短路火花、报警器和医院设备状态即时变化；
  - 允许学生先通电试验、观察失败现象，再撤销并调整；
  - 不把复杂的欧姆定律和基尔霍夫计算带入四年级，只保留闭路、断路、短路、开关、导体/绝缘体等年级适切规则。
- 风险：项目较新、社区验证少，只适合作为设计和代码结构参考，不建议直接作为依赖。

### 6. ADL xAPI：过程日志的数据语义参考

- 规范：[adlnet/xAPI-Spec](https://github.com/adlnet/xAPI-Spec)
- JavaScript 封装：[adlnet/xAPIWrapper](https://github.com/adlnet/xAPIWrapper)
- 许可证：Apache-2.0。
- 可借鉴机制：xAPI 使用“学习者—动作—对象—结果/情境”的事件形式；官方 JS Wrapper 可向 LRS 发送和查询 statements。[xAPIWrapper README](https://github.com/adlnet/xAPIWrapper/blob/master/README.md)
- 当前项目中的适度做法：MVP 不必立刻部署 LRS，但内部事件字段应预留兼容思路：
  - `actorId`、`verb`、`objectId`、`timestamp`、`result`、`context`；
  - 重点事件：进入房间、检查设备、与 NPC 交谈、提出假设、选择检测工具、接线、通电、发生短路、请求提示、撤销、成功修复、退出关卡；
  - 不要逐帧上传移动坐标；按“进入区域”和关键决策采样，减少噪声并保护学生数据。

### 7. SkyOffice 与 Phaser RPG：完整顶视角项目的工程参考

- 项目：[kevinshen56714/SkyOffice](https://github.com/kevinshen56714/SkyOffice)
- 项目：[remarkablegames/phaser-rpg](https://github.com/remarkablegames/phaser-rpg)
- 许可证：二者均为 MIT；但 SkyOffice 的第三方美术仍应逐项核验，不直接复制其素材。
- 可借鉴机制：SkyOffice 使用 Phaser、React、Redux 和 TypeScript 组织顶视角房间、键盘移动、距离触发、上下文互动及对话气泡，与“医院大厅—病房—工具间—配电室”的空间互动相近；phaser-rpg 则适合参考 Phaser + TypeScript + Vite 的场景拆分和网页打包结构。
- 集成方式：不整体移植项目，只参考 `Boot / Lobby / Hospital / Circuit / Result` 的场景边界、输入管理和交互热点组织；当前代码继续沿用自身数据模型。

### 8. Repath：线路分层绘制与实时反馈参考

- 项目：[Agustin-Delgado/repath](https://github.com/Agustin-Delgado/repath)
- 许可证：MIT。
- 可借鉴机制：分离底图、线路、实时覆盖和工具反馈层，并按需重绘；这种结构适合导线命中检测、电流沿线运动、错误点局部火花与撤销预览。
- 集成方式：无需引入其 Rust/WASM 模拟器，只借鉴多层渲染和交互命中思路，在 Phaser 内使用独立 Graphics/Particle 层实现。

### 9. AND_GAME：只能借鉴关卡节奏，暂不复制代码

- 项目：[MaozEpstein/AND_GAME](https://github.com/MaozEpstein/AND_GAME)
- 许可证：调研时未在仓库入口确认清晰许可证，因此在许可证明确前，不复制其代码或素材。
- 可借鉴机制：大量手工关卡、即时信号传播、渐进式教程、非剧透提示、撤销/重做、计时和沙盒。这些说明电路游戏的时长不应来自长对白，而应来自难度递进和允许反复试验。
- 当前关卡用法：开局只教学一次；调查、假设、检测、接线逐层增加认知要求；接线板必须提供撤销/重做和即时状态反馈。

## 三、建议的一关完整任务链（10–15 分钟）

这条任务链强调“先自由调查，后基于证据修复”。时间是首次体验的估计，不作为强制倒计时。

| 阶段 | 预计时间 | 学生活动 | 游戏反馈 | 研究数据 |
|---|---:|---|---|---|
| 1. 紧急开场 | 0.5–1 分钟 | 学会移动、E 互动，看到急诊区停电 | 红色应急灯、远处报警声、护士挥手 | 开局理解时长、首次有效互动 |
| 2. 自由调查 | 2–3 分钟 | 在护士、保安、病房设备和维修记录中任选至少两处调查 | 不同线索互相补充，不显示答案箭头 | 调查顺序、遗漏线索、提示请求 |
| 3. 提出故障假设 | 1 分钟 | 从“电池没电、灯泡坏、开关/导线断路、短路”中选一个暂定判断 | 系统记录假设但不公布正误 | 初始概念和证据使用 |
| 4. 工具检测小游戏 | 2–3 分钟 | 用测试灯/替换元件检查两个位置；工具使用次数有限但可恢复 | 元件测试时给出明暗、声音或仪表变化 | 工具选择、测试路径、无效操作 |
| 5. 配电板修复 | 2–3 分钟 | 在多个可用元件和接线点中形成闭合回路，允许撤销和试通电 | 电流光点、灯亮度、短路火花、开关状态即时变化 | 接线序列、错误类型、尝试次数 |
| 6. 二次突发 | 1–2 分钟 | 第一处恢复后，医用设备仍未启动；学生需发现总开关未闭合或备用线仍断开 | NPC 行为和环境状态变化，避免重复原题 | 是否迁移刚学到的闭路概念 |
| 7. 复盘与返航 | 1 分钟 | 在三张证据卡中选择“哪条证据最关键”，查看维修报告后返回大厅 | 医院整体亮起、医生恢复工作、成绩以过程徽章呈现 | 自我解释、总时长、退出方式 |

总时长约 10–14 分钟。若学生熟练，随机化故障位置、元件状态和线索组合可以让二次游玩仍有判断空间。

## 四、避免“喂答案”和“无从下手”的平衡

建议采用三级帮助，而不是全程路线箭头：

1. **开局操作教学**：只教移动、互动、打开任务本和返回大厅；
2. **环境引导**：声音、闪烁的应急灯、NPC 视线与房间标识引导注意力，但不指向正确元件；
3. **按需线索**：学生停滞约 45–60 秒或主动点击提示，先提示“还缺哪类证据”，第二次才提示区域，第三次才高亮具体可交互物。

所有提示等级均记录到过程日志，后续可以比较“独立完成”和“借助支架完成”，而不是简单把提示使用当成失败。

## 五、视觉、声音和体验提升清单

- 地图：至少包含急诊大厅、病房、工具间、配电室四个视觉不同的区域，并通过门牌和地板颜色建立空间记忆；
- 环境：停电时压暗非应急区域，设备指示灯熄灭；复电后逐区点亮，而不是一次弹窗结束；
- 角色：护士挥手/焦急、病人等待、医生复电后返回设备，形成场景因果；
- 动画：角色四方向行走、拾取、检查、接线和成功动作；
- 声音：低音量医院环境声、报警声方向提示、脚步、拾取、开关、短路和通电音效；
- 电路反馈：导线上的光点循环移动；错误连接时只在故障点冒火花；灯泡亮度和设备动画与线路状态同步；
- UI：顶部只保留任务概览、工具栏和固定“返回课程大厅”；详细记录放进可展开任务本，避免遮挡地图。

## 六、实施优先级

### 第一批：先解决“简陋”和“不能返回”

1. 接入 React–Phaser EventBus，并完成返回课程大厅、暂停/保存与恢复；
2. 用 Tilemap 重画医院，加入墙体、房间、遮挡和碰撞；
3. 加入环境光暗、局部灯光、电流粒子和基础音效；
4. 将单一线性步骤改成“调查两条线索即可进入诊断”的任务状态机。

### 第二批：把关卡拉长到 10–15 分钟

1. 增加可选调查点和故障假设；
2. 增加工具检测小游戏；
3. 接线成功后追加一个迁移性小故障；
4. 增加结尾证据复盘和维修报告。

### 第三批：为课堂实验准备

1. 故障和线索组合随机化；
2. 完整记录过程事件并支持导出；
3. 增加低性能设备降级、声音开关、键盘/触屏双操作；
4. 开展 3–5 名学生认知走查，再决定难度与提示阈值。

## 七、不建议直接采用的方式

- 不直接嵌入复杂电路模拟器作为主关卡：会割裂医院情境，也不利于统一过程数据；
- 不通过增加长对话硬凑时长：有效时长应来自观察、比较、假设、试验和修正；
- 不直接复制 Phaser 示例素材：官方示例仓库明确提醒部分资产许可不允许商业或广告用途；
- 不做强制逐步箭头：只在开局教学和多次求助后提供明确高亮；
- 不用倒计时制造主要难度：小学科学实验更需要安全试错和解释证据。

## 最终建议

当前项目应升级为“一张可探索医院地图 + 多线索故障诊断 + 动态电路实验 + 场景状态恢复 + 过程复盘”的完整样关。技术上只需在 Phaser 项目中增加地图层、任务状态机、诊断模型、视听反馈和 EventBus，不需要推倒现有架构。关卡的核心体验应从“按步骤把东西接好”转为“我看见了什么、我怀疑哪里坏了、我怎样验证、修复后环境发生了什么变化”。

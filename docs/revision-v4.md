# 2026-10-15：人物、器材与检测器说明整合版

## 用户确认后的修改

- 采用普通男女小学生作为可选主角。按最终反馈在卡通第二稿基础上将头部相对缩小约18—20%，保留柔和卡通画风；动物摊主与其他NPC保留。开场选择性别角色，不要求姓名或编号。
- 玩家脚下有青绿色识别圈，头顶有“你”的标记。与游园会NPC互动时走到人物侧前方，避免直接站到NPC身上。
- 三件作品仍以对应图像显示在任务卡、背包和角色手边。
- 将电池盒、小灯泡灯座和开关改为用户核对过的现实器材方向。电池图按实物接线柱旋转对齐；开关底座与铜片分开绘制，开合状态与电路状态一致。
- 备用长导线在材料栏可见，拿取时显示完整长线；已接线身有弯曲余量，红蓝检测线随检测头拖动伸展。

## 检测器的教学说明

- 首次进入工具台显示显眼的“为什么要做电路检测器？”图示，标明教材印刷第30页定义，解释正常工具、两个检测头和检测器自身灯泡的意义。
- 上方持续显示“为什么这样做”，随制作与使用阶段变化；可通过“认识检测器”重新打开说明。
- 参考电路亮起后，点击语义清楚的“取下开关，留下两个检测头”。取消拖入收纳托盘的要求，保留原有接线，不需要重做。
- **本试玩只要求首次自检成功。** 后续检测、维修、换场景、换作品和刷新都保留工具可用状态；可自愿再次互碰检测头。每次测量不会重新锁住工具。
- 教材提醒每次检测前自检，本轮按用户与导师讨论后的决定把它改为首次使用检查和可选复查。说明游戏中的处理与教材提醒不同，不修改教材内容。
- 取下待查模型的电池再测、修复后供电复验仍保留。检测顺序自由，跳过某个观察或改动猜想不会清空调查记录。

## 验证

- 25项规则测试通过。
- Chromium自动完成三个任务；只有一次首次自检，后续两件作品及刷新后继续检测，修复与交还全部通过。
- 验证两种接线方式、角色选择、自动进出门口、首次说明与重复查看入口、存档兼容、教师工具、资源加载与390px首页布局；无页面错误或缺失资源响应。
- 已查看实际游园会、制作台、实验桌与说明弹窗截图，并调整开关底座朝向和材料栏图像。

人物目前用静态素材加位移/轻微摆动表达移动，尚未制作完整朝向和逐帧走路动画。尚未进行学生试教或手机触摸全流程实测。此版本在本机预览与工作分支中保存，未自动合并发布。

## 新素材

- `web-classroom-game/assets/students-v3.png`：内置image_gen编辑第二版卡通男女生，头部缩小约18—20%，目标约3.5—3.8头身，服装与发型保留，参考现有NPC的柔和材质与光照。
- `web-classroom-game/assets/circuit-parts-v4.png`：核对稿的真实结构器材图集，提示词见 `asset-review-2026-10-15/README.md`。
- `web-classroom-game/assets/long-leads-v4.png`：核对稿的红蓝长导线图集，提示词见同上。实时检测线使用动态线身，避免固定图像限制操作距离。

人物最终提示词：Edit the two human students, preserve their faces, teal/cream jackets, navy shorts/trousers and yellow crossbody pouches. Reduce both heads approximately 18–20 percent relative to their bodies, aiming at moderate stylized 3.5–3.8 head-height proportions, retaining warm rounded storybook 3D shading compatible with existing animal NPCs. Full bodies, visible hands and feet, equal baseline, separate halves, no text, scenery or UI. Request a transparent background. Actual game sprite crops and placement are defined in `art.js`.

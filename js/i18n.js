/* ResearchTrace · i18n.js
 * Translation registry and DOM applicator.
 *
 * Usage in static HTML:
 *   <h1 data-i18n="hero.title">默认中文</h1>            // textContent replaced
 *   <p  data-i18n-html="hero.lede">默认中文（含 <em>）</p> // innerHTML replaced
 *   <input data-i18n-attr="placeholder:composer.placeholder" />
 *
 * Usage in JS template literals:
 *   ${t('section.why.title')}
 *
 * After mutating DOM with new content that contains data-i18n marks,
 * call RTI18n.apply() to re-translate.
 */
(function () {
  const DICT = {
    /* ---------- shared shell ---------- */
    "shell.search":           { zh: "在您的全部知识中提问…",      en: "Ask anything across your knowledge…" },
    "shell.userName":         { zh: "郁文",                         en: "Yuwen" },
    "shell.vault":            { zh: "资料库",                        en: "VAULT" },
    "shell.briefs":           { zh: "简报",                          en: "BRIEFS" },
    "shell.plan":             { zh: "套餐",                          en: "PLAN" },
    "shell.vault.value":      { zh: "2,438 项",                      en: "2,438 ITEMS" },
    "shell.briefs.value":     { zh: "36 期已归档",                   en: "36 ARCHIVED" },
    "shell.plan.value":       { zh: "RESEARCH PRO",                  en: "RESEARCH PRO" },
    "shell.section.workspace":{ zh: "工作区",                        en: "WORKSPACE" },
    "shell.section.pinned":   { zh: "钉选主题",                      en: "PINNED TOPICS" },
    "shell.section.account":  { zh: "账户",                          en: "ACCOUNT" },

    "nav.today":     { zh: "今日",         en: "Today" },
    "nav.topics":    { zh: "主题",         en: "Topics" },
    "nav.ask":       { zh: "提问",         en: "Ask" },
    "nav.briefs":    { zh: "简报",         en: "Briefs" },
    "nav.inbox":     { zh: "收件箱",       en: "Inbox" },
    "nav.settings":  { zh: "设置",         en: "Settings" },
    "nav.pricing":   { zh: "定价",         en: "Pricing" },
    "nav.landing":   { zh: "落地页",       en: "Landing Page" },
    "nav.topic.llm":   { zh: "LLM 长上下文",   en: "LLM Long Context" },
    "nav.topic.agent": { zh: "智能体工作流",  en: "Agentic Workflows" },
    "nav.topic.eval":  { zh: "AI 评测",       en: "AI Evaluation" },
    "nav.topic.rag":   { zh: "RAG 与记忆",    en: "RAG & Memory" },
    "nav.topic.pm":    { zh: "AI 产品策略",   en: "AI Product Strategy" },

    "switcher.lang.label":  { zh: "EN",      en: "中文" },
    "switcher.lang.title":  { zh: "Switch to English", en: "切换到中文" },
    "switcher.theme.title.toDark":  { zh: "切换到暗黑模式",  en: "Switch to dark mode" },
    "switcher.theme.title.toLight": { zh: "切换到亮色模式",  en: "Switch to light mode" },

    /* ---------- landing (index.html) ---------- */
    "landing.title":     { zh: "研迹 ResearchTrace · A Paper for One Reader. You.",
                            en: "ResearchTrace · A Paper for One Reader. You." },
    "landing.nav.why":      { zh: "为什么",     en: "Why" },
    "landing.nav.how":      { zh: "如何工作",   en: "How it works" },
    "landing.nav.agents":   { zh: "五个 Agent", en: "The Five Agents" },
    "landing.nav.pricing":  { zh: "定价",       en: "Pricing" },
    "landing.nav.briefs":   { zh: "简报样例",   en: "Sample Briefs" },
    "landing.nav.signin":   { zh: "登录",       en: "Sign in" },
    "landing.cta.trial":    { zh: "开始 14 天免费试用 →", en: "Start 14-day free trial →" },
    "landing.cta.trial.short": { zh: "开始免费试用 →", en: "Start free trial →" },
    "landing.cta.demo":     { zh: "查看示例工作台 →", en: "View sample workspace →" },
    "landing.cta.compare":  { zh: "比较方案",        en: "Compare plans" },

    "landing.masthead.vol":     { zh: "VOL. III · ISSUE 001 · LAUNCH EDITION", en: "VOL. III · ISSUE 001 · LAUNCH EDITION" },
    "landing.masthead.est":     { zh: "EST. 2026 · BEIJING / SAN FRANCISCO",   en: "EST. 2026 · BEIJING / SAN FRANCISCO" },
    "landing.masthead.price":   { zh: "PRICE · TIME ONLY",                     en: "PRICE · TIME ONLY" },

    "landing.hero.kicker":  { zh: "A NEW KIND OF READING", en: "A NEW KIND OF READING" },
    "landing.hero.title.html": { zh: "一份只为<br/>一位读者<br/>编辑的报。<br/><span style=\"color:var(--accent-red);\">您。</span>",
                                  en: "A paper<br/>for one<br/>reader.<br/><span style=\"color:var(--accent-red);\">You.</span>" },
    "landing.hero.lede.html": { zh: "研迹是一份<em>主动写作</em>的研究报 —— 它持续读您所读，追踪您所追，每天清晨在您打开它之前，把「<strong>本周您该知道的</strong>」已经编辑成一份真正可读的报刊。证据齐备，引用可点。",
                                en: "ResearchTrace is an <em>actively written</em> research paper — it reads what you read, tracks what you track, and every morning, before you open it, has already edited «<strong>what you ought to know this week</strong>» into a genuinely readable issue. Evidence in place. Citations clickable." },

    "landing.hero.fig":      { zh: "图 · 由您的资料库自动生成的个人知识图谱（示意）",
                                en: "Fig. · Personal knowledge graph auto-generated from your library (illustrative)" },
    "landing.hero.users":    { zh: "使用者来自 ·", en: "USED BY READERS FROM ·" },

    "landing.stats.evidence":    { zh: "证据可点击",  en: "Clickable evidence" },
    "landing.stats.evidence.n":  { zh: "100%",        en: "100%" },
    "landing.stats.trace":       { zh: "AI 调用追溯", en: "AI call traceability" },
    "landing.stats.trace.n":     { zh: "完整",        en: "Full" },
    "landing.stats.data":        { zh: "数据归您",    en: "Data is yours" },
    "landing.stats.data.n":      { zh: "E2EE",        en: "E2EE" },
    "landing.stats.train":       { zh: "训练免疫",    en: "Training-immune" },
    "landing.stats.train.n":     { zh: "✓",           en: "✓" },

    "landing.why.kicker":   { zh: "§ I · 为什么需要研迹",     en: "§ I · WHY RESEARCHTRACE" },
    "landing.why.headline": { zh: "您每天保存 23 条链接，只读了 3 条。", en: "You save 23 links a day. You read three." },
    "landing.why.sub":      { zh: "这不是您的错。是工具的错。",   en: "That's not on you. That's on the tools." },
    "landing.why.01.title": { zh: "被动收集 → 主动遗忘",        en: "Passive collection → active forgetting" },
    "landing.why.01.body.html": { zh: "现有笔记工具像仓库 —— 资料堆积越多，您离它越远。研迹反过来：它<strong>主动读您的库</strong>，并把要紧的事情<em>送到您面前</em>。",
                                  en: "Note-taking apps work like warehouses — the more you store, the further you drift. ResearchTrace inverts that: it <strong>actively reads your library</strong> and <em>delivers what matters</em>." },
    "landing.why.02.title": { zh: "答案 ≠ 研究",                en: "An answer is not research" },
    "landing.why.02.body.html": { zh: "ChatGPT 给您「看似正确的句子」。研迹给您 <strong>有出处的论断</strong>。每一句结论后都有可点击的 ① ② ③，3 秒内回到原文。",
                                  en: "ChatGPT gives you a sentence that <em>looks</em> right. ResearchTrace gives you a <strong>cited claim</strong>. Every conclusion is followed by ① ② ③ — three seconds back to the source." },
    "landing.why.03.title": { zh: "周期，而非问答",              en: "Cycles, not queries" },
    "landing.why.03.body.html": { zh: "研究是周期性活动。研迹按「每天 / 每周 / 每月」节奏交付，让您「<strong>不思考</strong>」也跟得上 —— 真正的省力。",
                                  en: "Research happens in cycles, not chats. ResearchTrace delivers daily / weekly / monthly so you keep up without <strong>having to think about it</strong> — the only kind of leverage that scales." },
    "landing.why.04.title": { zh: "您的库，不是模型的库",        en: "Your library, not the model's" },
    "landing.why.04.body.html": { zh: "研迹只回答与<em>您资料库</em>相关的问题。它的根基是您手中的那 2,000 篇。这是它与所有通用 AI 的根本不同。",
                                  en: "ResearchTrace answers only against <em>your library</em>. Its foundation is the 2,000 documents you hold. That is the bright line between it and every general-purpose AI." },

    "landing.how.kicker":   { zh: "§ II · 它如何工作 · 一日时间线", en: "§ II · HOW IT WORKS · ONE DAY" },
    "landing.how.headline": { zh: "从您按下保存到收到简报，发生了什么。",
                              en: "From the moment you save to the brief at your door — what happens." },
    "landing.how.t1.title": { zh: "您在 Twitter 上保存了一条关于 RMT v3 的链接", en: "You save a Twitter link about RMT v3" },
    "landing.how.t1.body":  { zh: "通过 Chrome 扩展、邮件转发或一键「分享到研迹」完成", en: "Via Chrome extension, email-forward, or one-tap «Share to ResearchTrace»" },
    "landing.how.t2.title": { zh: "自动抓取并解析",            en: "Auto-fetch and parse" },
    "landing.how.t2.body":  { zh: "识别：这是一个 arXiv 链接 → 抓取 PDF → 切分章节 → 提取图表",
                              en: "Recognize: this is an arXiv link → fetch PDF → segment sections → extract figures" },
    "landing.how.t3.title": { zh: "抽取关键论断与证据",        en: "Extract key claims and evidence" },
    "landing.how.t3.body":  { zh: "从 24 页中识别 8 项 claim，每项附 1-3 处证据。归类到「LLM Long Context」主题",
                              en: "8 claims pulled from 24 pages, each with 1–3 pieces of evidence. Filed under «LLM Long Context»" },
    "landing.how.t4.title": { zh: "对齐到您的现有图谱",        en: "Align to your existing graph" },
    "landing.how.t4.body":  { zh: "发现该论文与 4月17日 LongMem (#142)、4月22日 GraphRAG (#156) 形成显性对话",
                              en: "The paper opens an explicit dialogue with LongMem (#142, Apr 17) and GraphRAG (#156, Apr 22)" },
    "landing.how.t5.title": { zh: "夜间例行扫描",              en: "Overnight routine scan" },
    "landing.how.t5.body":  { zh: "检测到该工作引用激增 +23 → 触发 HIGH 告警，推迟到次晨简报",
                              en: "Citations spike +23 on this work → HIGH alert, deferred to tomorrow's brief" },
    "landing.how.t6.title": { zh: "为您撰写当日简报",          en: "Drafts your daily brief" },
    "landing.how.t6.body":  { zh: "综合 8 项 claim + 您过往笔记 #2204 → 生成 11 分钟阅读时长的 Today Digest",
                              en: "8 claims + your earlier note #2204 → an 11-minute Today Digest" },
    "landing.how.t7.title": { zh: "打开 ResearchTrace · 看到一份只为您写的报",
                              en: "You open ResearchTrace · a paper written for you alone" },
    "landing.how.t7.body":  { zh: "含可点击引用、HEAT 热度、行动按钮 (FIND SIMILAR / DIAGRAM IT / REPRODUCE)",
                              en: "With clickable citations, HEAT meters, action pills (FIND SIMILAR / DIAGRAM IT / REPRODUCE)" },
    "landing.how.t.next":   { zh: "次晨 06:30",                 en: "06:30 next" },

    "landing.agents.kicker":   { zh: "§ III · 为您工作的五个 AGENT", en: "§ III · FIVE AGENTS WORKING FOR YOU" },
    "landing.agents.headline": { zh: "不是一个 ChatGPT。是一支研究小组。", en: "Not a chatbot. A research desk." },
    "landing.agents.lede":     { zh: "每个 Agent 各司其职，您能看到它们做了什么、读了什么、调用了哪个模型。完全可审计。",
                                  en: "Every agent has a single mandate. You see what each one read, did, and which model it called. Fully auditable." },
    "landing.agents.cta":      { zh: "查看 Agent 行为日志 →",     en: "View agent activity log →" },
    "landing.agents.01.role":  { zh: "摄取", en: "ingestion" },
    "landing.agents.01.body":  { zh: "读 PDF / URL / 视频，做切分与索引", en: "Reads PDFs, URLs, video; segments and indexes" },
    "landing.agents.02.role":  { zh: "策展", en: "curation" },
    "landing.agents.02.body":  { zh: "抽 claim、对齐图谱、归并矛盾",      en: "Extracts claims, aligns the graph, reconciles contradictions" },
    "landing.agents.03.role":  { zh: "检索", en: "retrieval" },
    "landing.agents.03.body":  { zh: "BM25 + 向量混检 + Rerank",          en: "BM25 + vectors + rerank" },
    "landing.agents.04.role":  { zh: "雷达", en: "radar" },
    "landing.agents.04.body":  { zh: "监测信源、触发热度告警",            en: "Monitors sources, fires heat alerts" },
    "landing.agents.05.role":  { zh: "撰稿", en: "reporting" },
    "landing.agents.05.body":  { zh: "周报 / 月报 / Deep Dive",           en: "Weekly · monthly · deep-dive briefs" },

    "landing.sample.kicker":   { zh: "§ IV · 看一份真正的简报", en: "§ IV · A REAL BRIEF, FOR ONE READER" },
    "landing.sample.headline": { zh: "以下是研迹为一位用户写的本周简报。", en: "Below: this week's brief, written for a single reader." },
    "landing.sample.body.html":{ zh: "编辑摘要、本周三大头条、Curator 综述、与您过往工作的对话、反方意见、下周雷达 —— 完整 6 个章节，11 分钟阅读时长。每一处<a class=\"cite\" style=\"display:inline-flex\">12</a>都可点击。",
                                  en: "Editor's brief, three headlines, Curator's review, dialogue with your earlier work, opposing voices, next week's radar — six sections, eleven minutes. Every <a class=\"cite\" style=\"display:inline-flex\">12</a> is live." },
    "landing.sample.cta":      { zh: "阅读样例简报 No. 127 →", en: "Read sample brief No. 127 →" },

    "landing.cta.last":        { zh: "最后一件事",                  en: "One last thing" },
    "landing.cta.title.html":  { zh: "您不缺信息。<br/>您缺一份只为您写的报。",
                                  en: "You don't need more information.<br/>You need a paper written for you." },
    "landing.cta.body":        { zh: "14 天免费试用，无需信用卡。导入您现有的 Notion / Pocket / Readwise，明早 8 点您会收到第一份简报。",
                                  en: "Fourteen days free, no card required. Import your Notion / Pocket / Readwise tonight; your first brief lands at 08:00 tomorrow." },

    "landing.footer.tagline":  { zh: "「Find what matters before you ask for it.」 一份只为一位读者编辑的研究报。",
                                  en: "«Find what matters before you ask for it.» A research paper edited for one reader." },
    "landing.footer.col1":     { zh: "产品",     en: "Product" },
    "landing.footer.col2":     { zh: "工作流",   en: "Workflow" },
    "landing.footer.col3":     { zh: "商业",     en: "Business" },
    "landing.footer.col4":     { zh: "公司",     en: "Company" },
    "landing.footer.edu":      { zh: "教育折扣", en: "Edu discount" },
    "landing.footer.team":     { zh: "Team",     en: "Team" },
    "landing.footer.about":    { zh: "关于",     en: "About" },
    "landing.footer.blog":     { zh: "Blog",     en: "Blog" },
    "landing.footer.privacy":  { zh: "隐私",     en: "Privacy" },
    "landing.footer.terms":    { zh: "条款",     en: "Terms" },

    /* ---------- today.html ---------- */
    "today.title":             { zh: "Today — 研迹 ResearchTrace", en: "Today — ResearchTrace" },
    "today.crumb":             { zh: "RESEARCHTRACE / TODAY · 2026年5月9日 周六", en: "RESEARCHTRACE / TODAY · SAT 9 MAY 2026" },
    "today.kicker":            { zh: "VOL. III · ISSUE 127 · YOUR DAILY DIGEST", en: "VOL. III · ISSUE 127 · YOUR DAILY DIGEST" },
    "today.headline":          { zh: "今日简报", en: "Today's Digest" },
    "today.lede.html":         { zh: "5月9日，周六上午 09:14。本期为您甄选 <span style=\"color:var(--accent-red);font-weight:600;\">7 条</span> 重要进展，覆盖您追踪的 <span style=\"color:var(--accent-red);font-weight:600;\">5 个领域</span>。预计阅读 <span class=\"font-mono\" style=\"font-style:normal;\">11 分钟</span>。",
                                  en: "Saturday May 9, 09:14. This issue picks <span style=\"color:var(--accent-red);font-weight:600;\">7 developments</span> across <span style=\"color:var(--accent-red);font-weight:600;\">5 topics</span> you follow. Estimated read <span class=\"font-mono\" style=\"font-style:normal;\">11 min</span>." },
    "today.btn.markRead":      { zh: "全部已读",            en: "Mark all read" },
    "today.btn.archive":       { zh: "归档至简报库",        en: "Archive to briefs" },
    "today.btn.weekly":        { zh: "生成本周回顾",        en: "Build weekly review" },
    "today.delivered":         { zh: "DELIVERED · TODAY 08:00 · BY RADAR + REPORTER", en: "DELIVERED · TODAY 08:00 · BY RADAR + REPORTER" },
    "today.fromEditor":        { zh: "FROM THE EDITOR",     en: "FROM THE EDITOR" },
    "today.editorHead":        { zh: "本期主旨",            en: "Issue Focus" },
    "today.editor.meta":       { zh: "REPORTER AGENT · 0.7B SUMMARY", en: "REPORTER AGENT · 0.7B SUMMARY" },
    "today.editor.label":      { zh: "Editor's Brief",      en: "Editor's Brief" },
    "today.editor.body.html":  { zh: "本周 LLM 长上下文领域有两项重要突破：DeepMind 发布 <em>「Recurrent Memory Transformer v3」</em> 在 2M token 上保持线性复杂度<a href=\"ask.html?cite=1\" class=\"cite\">1</a>；Anthropic 同期公开 Claude 3.5 在 200K 长度上的 needle-in-haystack 评测，准确率 99.4%<a href=\"ask.html?cite=2\" class=\"cite\">2</a>。两项工作背后的核心分歧是：<strong>「显式记忆压缩 vs 端到端注意力扩展」</strong> —— 您 4 月 17 日收藏的 LongMem 论文<a href=\"ask.html?cite=3\" class=\"cite\">3</a> 正属于前一阵营，建议优先阅读 §1。",
                                  en: "Two breakthroughs landed in long-context LLM this week: DeepMind released <em>«Recurrent Memory Transformer v3»</em> with linear complexity at 2M tokens<a href=\"ask.html?cite=1\" class=\"cite\">1</a>; Anthropic published Claude 3.5's needle-in-haystack at 200K with 99.4% accuracy<a href=\"ask.html?cite=2\" class=\"cite\">2</a>. The split: <strong>«explicit memory compression vs end-to-end attention scaling»</strong> — the LongMem paper you saved on Apr 17<a href=\"ask.html?cite=3\" class=\"cite\">3</a> sits in the former camp. Read §1 first." },
    "today.editor.deepDive":   { zh: "DEEP DIVE →",         en: "DEEP DIVE →" },
    "today.editor.readLater":  { zh: "READ LATER",          en: "READ LATER" },
    "today.editor.saveCard":   { zh: "SAVE AS CARD",        en: "SAVE AS CARD" },
    "today.section1":          { zh: "§ I · TOP STORIES · 头条研究", en: "§ I · TOP STORIES" },
    "today.section2":          { zh: "§ II · RADAR PULSE · 雷达脉搏", en: "§ II · RADAR PULSE" },
    "today.section3":          { zh: "§ III · FROM YOUR VAULT · 来自您的资料库", en: "§ III · FROM YOUR VAULT" },
    "today.section4":          { zh: "§ IV · ASK YOUR RESEARCH",      en: "§ IV · ASK YOUR RESEARCH" },
    "today.story1.title":      { zh: "Recurrent Memory Transformer v3 在 2M Token 上保持线性复杂度",
                                  en: "Recurrent Memory Transformer v3 holds linear cost at 2M tokens" },
    "today.story1.body.html":  { zh: "DeepMind 团队提出新的循环压缩机制，在 2,097,152 token 长度上推理成本仅为标准注意力的 <span style=\"color:var(--accent-red);font-weight:600;\">3.7%</span>，且在 LongBench-v2 上得分超出 GPT-4-128K 约 <span style=\"color:var(--accent-red);font-weight:600;\">11.2 分</span>…",
                                  en: "DeepMind proposes a new recurrent compression layer; inference cost at 2,097,152 tokens is just <span style=\"color:var(--accent-red);font-weight:600;\">3.7%</span> of standard attention and outscores GPT-4-128K on LongBench-v2 by <span style=\"color:var(--accent-red);font-weight:600;\">11.2 pts</span>…" },
    "today.story1.heatNote":   { zh: "5/5 · TRENDING IN YOUR CIRCLE", en: "5/5 · TRENDING IN YOUR CIRCLE" },
    "today.action.findSimilar":{ zh: "FIND SIMILAR",        en: "FIND SIMILAR" },
    "today.action.seeEvidence":{ zh: "SEE EVIDENCE",        en: "SEE EVIDENCE" },
    "today.action.reproduce":  { zh: "REPRODUCE",           en: "REPRODUCE" },
    "today.action.diagram":    { zh: "DIAGRAM",             en: "DIAGRAM" },
    "today.story2.title":      { zh: "Claude 3.5 在 200K 上下文上达成 99.4% 检索准确率",
                                  en: "Claude 3.5 hits 99.4% retrieval at 200K context" },
    "today.story2.body":       { zh: "Anthropic 公布完整测试报告，跨 12 类 needle 配置全部通过；但在 needle-多跳推理子集上准确率降至 73%…",
                                  en: "Anthropic publishes a full report — passes 12 needle configurations; multi-hop subset drops to 73%…" },
    "today.story3.title":      { zh: "OpenAI Codex CLI 在 SWE-Bench Verified 突破 71.8%",
                                  en: "OpenAI Codex CLI breaks 71.8% on SWE-Bench Verified" },
    "today.story3.body":       { zh: "较 3 月前的 SOTA 提升 9.3 个百分点。关键改进来自「自我对弈式 patch refinement」训练范式…",
                                  en: "+9.3 pts over the SOTA from three months ago. Driver: a «self-play patch refinement» training regime…" },
    "today.radar.col1":        { zh: "TRENDING IN YOUR FOLLOWED TOPICS", en: "TRENDING IN YOUR FOLLOWED TOPICS" },
    "today.radar.col2":        { zh: "CITED BY YOU MOST · LAST 30 DAYS", en: "CITED BY YOU MOST · LAST 30 DAYS" },
    "today.radar.s1.t":        { zh: "本周新增信源",        en: "New sources this week" },
    "today.radar.s1.s":        { zh: "vs. 上周 +12%",       en: "vs. last week +12%" },
    "today.radar.s2.t":        { zh: "个主题需要回顾",      en: "topics need a revisit" },
    "today.radar.s2.s":        { zh: "已 7 天未更新",       en: "untouched for 7 days" },
    "today.radar.s3.t":        { zh: "条新证据已抓取",      en: "new evidence ingested" },
    "today.radar.s3.s":        { zh: "自上次登录",           en: "since your last visit" },
    "today.radar.s4.t":        { zh: "个新观点冲突",        en: "new contradictions" },
    "today.radar.s4.s":        { zh: "待您仲裁",             en: "awaiting your call" },
    "today.radar.r1":          { zh: "长上下文 vs 检索：综述论文激增 +38 篇",
                                  en: "Long-context vs retrieval: surveys spike +38" },
    "today.radar.r2":          { zh: "自反思 Agent 框架：CRITIC、Reflexion 引用激增",
                                  en: "Self-reflective agents: CRITIC and Reflexion citations surge" },
    "today.radar.r3":          { zh: "Holistic Eval 重新定义「helpfulness」维度",
                                  en: "Holistic Eval redefines the «helpfulness» axis" },
    "today.radar.r4":          { zh: "Mem0 v2 引入 episodic memory 抽取层",
                                  en: "Mem0 v2 adds an episodic-memory extraction layer" },
    "today.radar.r5":          { zh: "a16z 报告：Top 50 AI 应用 47% 已转 vertical",
                                  en: "a16z report: 47% of Top-50 AI apps now vertical" },
    "today.vault.lede.html":   { zh: "您 4 月 17 日收藏的论文 <em>LongMem</em> 与本期头条主题高度相关 —— Curator Agent 已重新整理时间线，并发现 3 处与新工作的隐性对话。",
                                  en: "Your <em>LongMem</em> paper saved on Apr 17 is highly relevant to today's lead — Curator has re-threaded the timeline and surfaced 3 implicit dialogues with new work." },
    "today.vault.action.viewCard": { zh: "VIEW CARD", en: "VIEW CARD" },
    "today.vault.action.askAgent": { zh: "ASK AGENT", en: "ASK AGENT" },
    "today.vault.saved":       { zh: "SAVED · ",           en: "SAVED · " },
    "today.ask.headline":      { zh: "提问，并见到每一处证据。", en: "Ask. See every piece of evidence." },
    "today.ask.body.html":     { zh: "每一个回答都来自您自己的资料库。每一句结论后都跟着可点击的引用气泡<a class=\"cite\" style=\"display:inline-flex\">12</a>，让您在 3 秒内回到原文。无幻觉，可追溯。",
                                  en: "Every answer is grounded in your own library. Every conclusion is followed by a clickable citation bubble<a class=\"cite\" style=\"display:inline-flex\">12</a> — three seconds back to the source. No hallucinations. Traceable." },
    "today.ask.cta":           { zh: "OPEN ASK ↗",         en: "OPEN ASK ↗" },
    "today.ask.suggested":     { zh: "SUGGESTED QUESTIONS", en: "SUGGESTED QUESTIONS" },
    "today.ask.q1":            { zh: "RMT v3 与 MemGPT 的核心区别？为什么我应该关心？",
                                  en: "RMT v3 vs MemGPT — what's the core difference, and why should I care?" },
    "today.ask.q2":            { zh: "我收藏的 LongMem 与今天的头条有矛盾吗？",
                                  en: "Does my saved LongMem paper contradict today's headline?" },
    "today.ask.q3":            { zh: "agent 自反思框架综述：CRITIC vs Reflexion 谁先？",
                                  en: "Self-reflective agents: who came first, CRITIC or Reflexion?" },
    "today.ask.q4":            { zh: "把过去 3 个月长上下文领域整理成一张时间线",
                                  en: "Build a timeline of long-context work from the past three months" },
    "today.foot.tagline":      { zh: "「Find what matters before you ask for it.」", en: "«Find what matters before you ask for it.»" },
    "today.foot.product":      { zh: "PRODUCT",            en: "PRODUCT" },
    "today.foot.vault":        { zh: "VAULT",              en: "VAULT" },
    "today.foot.account":      { zh: "ACCOUNT",            en: "ACCOUNT" },
    "today.foot.next":         { zh: "NEXT BRIEF",         en: "NEXT BRIEF" },
    "today.foot.weekly":       { zh: "WEEKLY DIGEST",      en: "WEEKLY DIGEST" },

    /* ---------- topics ---------- */
    "topics.crumb":            { zh: "RESEARCHTRACE / TOPICS · 12 主题在追踪中", en: "RESEARCHTRACE / TOPICS · 12 TOPICS TRACKED" },
    "topics.kicker":           { zh: "VOL. III · CHAPTER 02 · KNOWLEDGE TOPICS", en: "VOL. III · CHAPTER 02 · KNOWLEDGE TOPICS" },
    "topics.title":            { zh: "Topics",             en: "Topics" },
    "topics.lede.html":        { zh: "您正在追踪 <span style=\"color:var(--accent-red);font-weight:600;\">12 个主题</span>，共积累 <span style=\"color:var(--accent-red);font-weight:600;\">2,438 项</span>知识、<span style=\"color:var(--accent-red);font-weight:600;\">412 处</span>证据。每一条结论都有来源，每一条来源都可点。",
                                  en: "You track <span style=\"color:var(--accent-red);font-weight:600;\">12 topics</span>, totalling <span style=\"color:var(--accent-red);font-weight:600;\">2,438 items</span> and <span style=\"color:var(--accent-red);font-weight:600;\">412 pieces of evidence</span>. Every conclusion has a source. Every source is live." },
    "topics.filter":           { zh: "FILTER ·",           en: "FILTER ·" },
    "topics.f.all":            { zh: "全部 · 12",          en: "ALL · 12" },
    "topics.f.active":         { zh: "ACTIVE · 7",         en: "ACTIVE · 7" },
    "topics.f.watching":       { zh: "WATCHING · 4",       en: "WATCHING · 4" },
    "topics.f.paused":         { zh: "PAUSED · 1",         en: "PAUSED · 1" },
    "topics.f.pinned":         { zh: "PINNED · 5",         en: "PINNED · 5" },
    "topics.sort":             { zh: "SORT BY HEAT",       en: "SORT BY HEAT" },
    "topics.new":              { zh: "+ NEW TOPIC",        en: "+ NEW TOPIC" },
    "topics.lastBrief":        { zh: "LAST BRIEF · ",      en: "LAST BRIEF · " },
    "topics.open":             { zh: "OPEN →",             en: "OPEN →" },
    "topics.statusActive":     { zh: "TOPIC · ACTIVE",     en: "TOPIC · ACTIVE" },
    "topics.statusWatching":   { zh: "TOPIC · WATCHING",   en: "TOPIC · WATCHING" },
    "topics.statusPaused":     { zh: "TOPIC · PAUSED",     en: "TOPIC · PAUSED" },

    /* ---------- ask ---------- */
    "ask.crumb":               { zh: "RESEARCHTRACE / ASK · 提问 · 答案附引用",   en: "RESEARCHTRACE / ASK · Q&A WITH CITATIONS" },
    "ask.history":             { zh: "ASK · HISTORY",     en: "ASK · HISTORY" },
    "ask.newQuestion":         { zh: "+ 新问题",          en: "+ NEW QUESTION" },
    "ask.meta":                { zh: "已问 · 09:14 · 6 SOURCES · 2.4s", en: "ASKED · 09:14 · 6 SOURCES · 2.4s" },
    "ask.confidence":          { zh: "ANSWER CONFIDENCE",  en: "ANSWER CONFIDENCE" },
    "ask.retrieval":           { zh: "RETRIEVAL · HYBRID", en: "RETRIEVAL · HYBRID" },
    "ask.model":               { zh: "MODEL",              en: "MODEL" },
    "ask.showTrace":           { zh: "SHOW TRACE",         en: "SHOW TRACE" },
    "ask.followup":            { zh: "FOLLOW-UP ·",        en: "FOLLOW-UP ·" },
    "ask.diagramIt":           { zh: "DIAGRAM IT",         en: "DIAGRAM IT" },
    "ask.contradictions":      { zh: "FIND CONTRADICTIONS",en: "FIND CONTRADICTIONS" },
    "ask.reproduce":           { zh: "REPRODUCE",          en: "REPRODUCE" },
    "ask.missing":             { zh: "WHAT'S MISSING",     en: "WHAT'S MISSING" },
    "ask.saveCard":            { zh: "SAVE AS CARD",       en: "SAVE AS CARD" },
    "ask.share":               { zh: "SHARE",              en: "SHARE" },
    "ask.followBox":           { zh: "FOLLOW-UP QUESTION", en: "FOLLOW-UP QUESTION" },
    "ask.composer":            { zh: "继续追问，或换一个问题…", en: "Ask a follow-up, or a new question…" },
    "ask.send":                { zh: "提问 ↵",             en: "ASK ↵" },
    "ask.scope":               { zh: "SCOPE ·",            en: "SCOPE ·" },
    "ask.allTopics":           { zh: "ALL TOPICS",         en: "ALL TOPICS" },
    "ask.thisTopic":           { zh: "LLM LONG CONTEXT ONLY", en: "LLM LONG CONTEXT ONLY" },
    "ask.savedItems":          { zh: "SAVED ITEMS",        en: "SAVED ITEMS" },
    "ask.narrow":              { zh: "+ 精细",             en: "+ NARROW" },
    "ask.related":             { zh: "RELATED IN YOUR VAULT", en: "RELATED IN YOUR VAULT" },
    "ask.sources":             { zh: "SOURCES · ",         en: "SOURCES · " },
    "ask.sources.lede":        { zh: "每一处引用都来自您的资料库或您订阅的信源。点击数字 ① ② ③ ④ 跳转。",
                                  en: "Every citation comes from your library or your subscribed sources. Click the numerals ① ② ③ ④ to jump." },
    "ask.q.display":           { zh: "RMT v3 与 MemGPT 的核心区别？为什么我应该关心？",
                                  en: "RMT v3 vs MemGPT — what's the core difference, and why should I care?" },

    /* ---------- pricing ---------- */
    "pricing.crumb":           { zh: "RESEARCHTRACE / PRICING · 订阅方案", en: "RESEARCHTRACE / PRICING · PLANS" },
    "pricing.kicker":          { zh: "VOL. III · PRICING", en: "VOL. III · PRICING" },
    "pricing.title":           { zh: "为认真做研究的人而生。", en: "Built for the people who actually do research." },
    "pricing.lede":            { zh: "不是另一个 ChatGPT 包装层。是一份只为您一人编辑的研究报。下方四档，覆盖从尝试到团队协作。",
                                  en: "Not another ChatGPT wrapper. A research paper edited for you alone. Four tiers, from try-it-out to team." },
    "pricing.monthly":         { zh: "月付",               en: "Monthly" },
    "pricing.yearly":          { zh: "年付 · 省 17%",      en: "Yearly · save 17%" },
    "pricing.faq":             { zh: "FREQUENTLY ASKED",   en: "FREQUENTLY ASKED" },
    "pricing.eduTitle":        { zh: "EDU / NON-PROFIT · 教育与公益折扣", en: "EDU / NON-PROFIT" },
    "pricing.eduBody":         { zh: "学生、教师、研究机构、公益组织 · 50% off", en: "Students, teachers, research institutions, non-profits · 50% off" },
    "pricing.eduSub":          { zh: "使用 .edu / 机构邮箱注册自动获得 · 不限方案档位", en: "Auto-applied with .edu / institutional email · any tier" },
    "pricing.eduCta":          { zh: "APPLY NOW →",        en: "APPLY NOW →" },

    /* ---------- inbox/briefs/brief/onboarding/settings/topic crumbs (titles only — body crawls remain CN baseline) ---------- */
    "inbox.crumb":             { zh: "RESEARCHTRACE / INBOX · 收件箱",    en: "RESEARCHTRACE / INBOX" },
    "briefs.crumb":            { zh: "RESEARCHTRACE / BRIEFS · 简报库",    en: "RESEARCHTRACE / BRIEFS" },
    "brief.crumb":             { zh: "RESEARCHTRACE / BRIEF · 阅读视图",   en: "RESEARCHTRACE / BRIEF · READER" },
    "onboarding.crumb":        { zh: "RESEARCHTRACE / ONBOARDING · 入门",  en: "RESEARCHTRACE / ONBOARDING" },
    "settings.crumb":          { zh: "RESEARCHTRACE / SETTINGS · 设置",    en: "RESEARCHTRACE / SETTINGS" },
    "topic.crumb":             { zh: "RESEARCHTRACE / TOPIC · 主题详情",   en: "RESEARCHTRACE / TOPIC · DETAIL" },
  };

  function t(key, fallback) {
    const lang = (window.RTPrefs && window.RTPrefs.getLang()) || "zh";
    const entry = DICT[key];
    if (!entry) return (fallback != null ? fallback : key);
    return entry[lang] != null ? entry[lang] : (entry.zh != null ? entry.zh : key);
  }

  function applyAll(root) {
    const scope = root || document;

    scope.querySelectorAll("[data-i18n]").forEach((el) => {
      const k = el.getAttribute("data-i18n");
      if (!k) return;
      el.textContent = t(k, el.textContent);
    });

    scope.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const k = el.getAttribute("data-i18n-html");
      if (!k) return;
      el.innerHTML = t(k, el.innerHTML);
    });

    scope.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.split(";").map(s => s.trim()).filter(Boolean).forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        if (!attr || !key) return;
        el.setAttribute(attr, t(key, el.getAttribute(attr) || ""));
      });
    });

    scope.querySelectorAll("[data-i18n-title]").forEach((el) => {
      const k = el.getAttribute("data-i18n-title");
      if (!k) return;
      const fb = el.getAttribute("title") || "";
      el.setAttribute("title", t(k, fb));
    });

    if (scope === document) {
      const titleEl = document.querySelector("title[data-i18n]");
      if (titleEl) {
        const k = titleEl.getAttribute("data-i18n");
        document.title = t(k, document.title);
      }
    }
  }

  window.RTI18n = { t, apply: applyAll, DICT };
})();

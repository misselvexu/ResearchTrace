/**
 * Mock fixture seeds — realistic in-memory data covering all 12 domains.
 *
 * Curated to mirror the legacy v0.3 prototype (5 papers, ~6 topics, etc.)
 * so frontend visual parity stays trivially testable.
 */

import type {
  Agent,
  AgentRun,
  AgentTemplate,
  AskMessage,
  AskSession,
  AskSuggestion,
  Brief,
  Claim,
  Evidence,
  InboxItem,
  InboxItemId,
  Invoice,
  Notification,
  PaymentMethod,
  Plan,
  Source,
  Subscription,
  Topic,
  TopicFeedItem,
  UserPlan,
  UserPreferences,
  UserProfile,
  VaultCollection,
  VaultItem,
  asId,
} from "@/types/api";
import { isoMinusDays, isoMinusHours, FIXTURE_NOW } from "./_shared";

// ============================================================================
// User
// ============================================================================

export const SEED_USER: UserProfile = {
  id: "u_demo_001" as ReturnType<typeof asId<"u_demo_001">>,
  email: "demo@researchtrace.com",
  displayName: "Lin Wei",
  avatarUrl: null,
  bio: { zh: "一位关注前沿 AI 研究的工程师", en: "An engineer following frontier AI research" },
  role: "user",
  status: "active",
  emailVerified: true,
  lastLoginAt: isoMinusHours(2),
  createdAt: isoMinusDays(120),
  updatedAt: isoMinusDays(1),
} as UserProfile;

export const SEED_PREFERENCES: UserPreferences = {
  locale: "zh",
  theme: "system",
  digestFrequency: "daily",
  topicsSortDefault: "recent",
  inboxFilterDefault: "unread",
  pushNewBrief: true,
  pushAgentDone: false,
  timezone: "Asia/Shanghai",
};

export const SEED_USER_PLAN: UserPlan = {
  tier: "pro",
  label: { zh: "专业版", en: "Pro" },
  expiresAt: isoMinusDays(-23),
  quotas: {
    topics: { used: 6, limit: 50 },
    sources: { used: 12, limit: 100 },
    vaultBytes: { used: 38_400_000, limit: 5_000_000_000 },
    briefsPerMonth: { used: 14, limit: 200 },
    askPerDay: { used: 7, limit: 200 },
  },
  upgradeAvailable: true,
};

// ============================================================================
// Topics — 6 topics matching legacy prototype
// ============================================================================

const T = (n: number) => `t_${String(n).padStart(3, "0")}` as Topic["id"];

export const SEED_TOPICS: Topic[] = [
  {
    id: T(1),
    ownerId: SEED_USER.id,
    name: { zh: "大语言模型", en: "Large Language Models" },
    summary: { zh: "LLM 架构、训练与对齐", en: "LLM architecture, training, alignment" },
    keywords: ["LLM", "transformer", "alignment"],
    sourceIds: [],
    color: "indigo",
    status: "active",
    pinned: true,
    muted: false,
    heat: 87,
    recentItemCount: 42,
    lastActivityAt: isoMinusHours(3),
    lastBrief: {
      briefId: "b_001",
      publishedAt: isoMinusHours(8),
      headline: { zh: "本周 LLM 焦点", en: "This week in LLMs" },
    },
    createdAt: isoMinusDays(60),
    updatedAt: isoMinusHours(3),
  },
  {
    id: T(2),
    ownerId: SEED_USER.id,
    name: { zh: "检索增强生成", en: "Retrieval-Augmented Generation" },
    summary: { zh: "RAG 系统设计", en: "RAG system design" },
    keywords: ["RAG", "retrieval", "vector-db"],
    sourceIds: [],
    color: "teal",
    status: "active",
    pinned: true,
    muted: false,
    heat: 72,
    recentItemCount: 28,
    lastActivityAt: isoMinusHours(6),
    lastBrief: null,
    createdAt: isoMinusDays(50),
    updatedAt: isoMinusHours(6),
  },
  {
    id: T(3),
    ownerId: SEED_USER.id,
    name: { zh: "智能体系统", en: "Agentic Systems" },
    summary: { zh: "多智能体协作与工具使用", en: "Multi-agent orchestration and tool use" },
    keywords: ["agent", "tool-use", "planning"],
    sourceIds: [],
    color: "purple",
    status: "active",
    pinned: false,
    muted: false,
    heat: 91,
    recentItemCount: 51,
    lastActivityAt: isoMinusHours(1),
    lastBrief: null,
    createdAt: isoMinusDays(40),
    updatedAt: isoMinusHours(1),
  },
  {
    id: T(4),
    ownerId: SEED_USER.id,
    name: { zh: "长上下文", en: "Long Context" },
    summary: null,
    keywords: ["long-context", "needle-in-haystack"],
    sourceIds: [],
    color: "blue",
    status: "active",
    pinned: false,
    muted: false,
    heat: 64,
    recentItemCount: 18,
    lastActivityAt: isoMinusDays(1),
    lastBrief: null,
    createdAt: isoMinusDays(30),
    updatedAt: isoMinusDays(1),
  },
  {
    id: T(5),
    ownerId: SEED_USER.id,
    name: { zh: "对齐与安全", en: "Alignment & Safety" },
    summary: null,
    keywords: ["RLHF", "alignment", "safety"],
    sourceIds: [],
    color: "red",
    status: "active",
    pinned: false,
    muted: false,
    heat: 55,
    recentItemCount: 12,
    lastActivityAt: isoMinusDays(2),
    lastBrief: null,
    createdAt: isoMinusDays(25),
    updatedAt: isoMinusDays(2),
  },
  {
    id: T(6),
    ownerId: SEED_USER.id,
    name: { zh: "评测基准", en: "Benchmarks" },
    summary: null,
    keywords: ["eval", "benchmark"],
    sourceIds: [],
    color: "orange",
    status: "active",
    pinned: false,
    muted: false,
    heat: 41,
    recentItemCount: 9,
    lastActivityAt: isoMinusDays(3),
    lastBrief: null,
    createdAt: isoMinusDays(20),
    updatedAt: isoMinusDays(3),
  },
];

// ============================================================================
// Sources — 5 connected sources
// ============================================================================

const S = (n: number) => `s_${String(n).padStart(3, "0")}` as Source["id"];

export const SEED_SOURCES: Source[] = [
  {
    id: S(1),
    ownerId: SEED_USER.id,
    kind: "arxiv",
    name: { zh: "arXiv · cs.CL", en: "arXiv · cs.CL" },
    config: { kind: "arxiv", categories: ["cs.CL", "cs.LG"] },
    status: "connected",
    lastSyncedAt: isoMinusHours(1),
    recentItemCount: 38,
    lastError: null,
    enabled: true,
    createdAt: isoMinusDays(90),
    updatedAt: isoMinusHours(1),
  },
  {
    id: S(2),
    ownerId: SEED_USER.id,
    kind: "openreview",
    name: { zh: "OpenReview · NeurIPS", en: "OpenReview · NeurIPS" },
    config: { kind: "openreview", venueId: "NeurIPS.cc/2024" },
    status: "connected",
    lastSyncedAt: isoMinusHours(4),
    recentItemCount: 14,
    lastError: null,
    enabled: true,
    createdAt: isoMinusDays(85),
    updatedAt: isoMinusHours(4),
  },
  {
    id: S(3),
    ownerId: SEED_USER.id,
    kind: "github",
    name: { zh: "GitHub · 跟踪仓库", en: "GitHub · Watched Repos" },
    config: { kind: "github", repo: "openai/whisper", events: ["releases"] },
    status: "connected",
    lastSyncedAt: isoMinusHours(2),
    recentItemCount: 5,
    lastError: null,
    enabled: true,
    createdAt: isoMinusDays(80),
    updatedAt: isoMinusHours(2),
  },
  {
    id: S(4),
    ownerId: SEED_USER.id,
    kind: "hackernews",
    name: { zh: "Hacker News", en: "Hacker News" },
    config: { kind: "hackernews", minScore: 100 },
    status: "rate_limited",
    lastSyncedAt: isoMinusHours(8),
    recentItemCount: 22,
    lastError: { zh: "API 调用频次受限", en: "Rate limit reached" },
    enabled: true,
    createdAt: isoMinusDays(60),
    updatedAt: isoMinusHours(8),
  },
  {
    id: S(5),
    ownerId: SEED_USER.id,
    kind: "rss",
    name: { zh: "Distill 博客", en: "Distill Blog" },
    config: { kind: "rss", feedUrl: "https://distill.pub/rss.xml" },
    status: "connected",
    lastSyncedAt: isoMinusHours(12),
    recentItemCount: 1,
    lastError: null,
    enabled: true,
    createdAt: isoMinusDays(45),
    updatedAt: isoMinusHours(12),
  },
];

// ============================================================================
// Inbox items
// ============================================================================

const II = (n: number) => `i_${String(n).padStart(3, "0")}` as InboxItemId;

export const SEED_INBOX: InboxItem[] = [
  {
    id: II(1),
    ownerId: SEED_USER.id,
    kind: "paper",
    sourceId: SEED_SOURCES[0].id,
    topicIds: [SEED_TOPICS[0].id, SEED_TOPICS[3].id],
    receivedAt: isoMinusHours(1),
    read: false,
    starred: true,
    dismissed: false,
    savedToVault: false,
    headline: {
      zh: "百万级上下文检索的极限",
      en: "The Limits of Million-Token Retrieval",
    },
    preview: {
      zh: "新论文显示在 1M 上下文窗口中针尖检索准确度仍可保持 96%。",
      en: "New paper shows 96% needle accuracy at 1M-token context windows.",
    },
    document: {
      url: "https://arxiv.org/abs/2501.12345",
      title: { zh: "The Limits of Million-Token Retrieval", en: "The Limits of Million-Token Retrieval" },
      arxivId: "2501.12345",
      venue: "arXiv",
      authors: ["A. Researcher", "B. Coauthor"],
      publishedAt: isoMinusHours(2),
      language: "en",
    },
    tldr: {
      zh: "提出新的位置编码方案,使长上下文 needle-in-haystack 准确度逼近 100%。",
      en: "New positional encoding pushes long-context needle-in-haystack near 100%.",
    },
  },
  {
    id: II(2),
    ownerId: SEED_USER.id,
    kind: "discussion",
    sourceId: SEED_SOURCES[3].id,
    topicIds: [SEED_TOPICS[2].id],
    receivedAt: isoMinusHours(3),
    read: false,
    starred: false,
    dismissed: false,
    savedToVault: false,
    headline: { zh: "智能体编排框架对比", en: "Agent Orchestration Frameworks Compared" },
    preview: {
      zh: "HN 高赞讨论:LangGraph、AutoGen 与 CrewAI 的实战对比。",
      en: "HN top thread: LangGraph vs AutoGen vs CrewAI in practice.",
    },
    url: "https://news.ycombinator.com/item?id=12345678",
    metrics: { replies: 142, upvotes: 386 },
  },
  {
    id: II(3),
    ownerId: SEED_USER.id,
    kind: "release",
    sourceId: SEED_SOURCES[2].id,
    topicIds: [SEED_TOPICS[0].id],
    receivedAt: isoMinusHours(6),
    read: true,
    starred: false,
    dismissed: false,
    savedToVault: true,
    headline: { zh: "Whisper v4 发布", en: "Whisper v4 Released" },
    preview: { zh: "支持 200+ 语言,延迟降低 3 倍。", en: "200+ languages, 3× lower latency." },
    ref: "openai/whisper@v4.0.0",
    url: "https://github.com/openai/whisper/releases/tag/v4.0.0",
    excerpt: {
      zh: "OpenAI 开源新一代语音识别模型。",
      en: "OpenAI open-sources next-gen speech recognition.",
    },
  },
  {
    id: II(4),
    ownerId: SEED_USER.id,
    kind: "alert",
    sourceId: null,
    topicIds: [],
    receivedAt: isoMinusDays(1),
    read: true,
    starred: false,
    dismissed: false,
    savedToVault: false,
    headline: { zh: "本周配额预警", en: "Weekly Quota Notice" },
    preview: { zh: "Ask 已使用 7/200,本周还剩 193 次。", en: "Ask used 7/200; 193 remaining this week." },
    severity: "info",
    actionUrl: "/settings#billing",
    actionLabel: { zh: "查看用量", en: "View usage" },
  },
];

// ============================================================================
// Vault
// ============================================================================

export const SEED_VAULT_COLLECTIONS: VaultCollection[] = [
  {
    id: "c_001",
    ownerId: SEED_USER.id,
    name: { zh: "长上下文论文", en: "Long-Context Papers" },
    description: null,
    itemCount: 8,
    color: "blue",
    position: 0,
    createdAt: isoMinusDays(40),
    updatedAt: isoMinusDays(2),
  },
  {
    id: "c_002",
    ownerId: SEED_USER.id,
    name: { zh: "周报草稿", en: "Weekly Drafts" },
    description: { zh: "下周一发布的内容", en: "Content for next Monday" },
    itemCount: 3,
    color: "orange",
    position: 1,
    createdAt: isoMinusDays(20),
    updatedAt: isoMinusDays(1),
  },
];

export const SEED_VAULT_ITEMS: VaultItem[] = [
  {
    id: "v_001" as VaultItem["id"],
    ownerId: SEED_USER.id,
    kind: "paper",
    title: { zh: "RAG 在生产环境的可靠性", en: "RAG Reliability in Production" },
    note: { zh: "对照实验设计值得借鉴", en: "Worth borrowing the ablation design" },
    tags: ["rag", "production"],
    collectionIds: ["c_001"],
    trashed: false,
    trashedAt: null,
    starred: true,
    document: {
      url: "https://arxiv.org/abs/2412.99999",
      title: { zh: "RAG Reliability", en: "RAG Reliability" },
      arxivId: "2412.99999",
      authors: ["C. Author"],
      publishedAt: isoMinusDays(15),
      language: "en",
    },
    pdfStored: true,
    createdAt: isoMinusDays(15),
    updatedAt: isoMinusDays(2),
  },
  {
    id: "v_002" as VaultItem["id"],
    ownerId: SEED_USER.id,
    kind: "note",
    title: { zh: "关于 needle-in-haystack 的思考", en: "Notes on Needle-in-Haystack" },
    note: null,
    tags: ["long-context"],
    collectionIds: ["c_001"],
    trashed: false,
    trashedAt: null,
    starred: false,
    body: {
      zh: "## 观察\n- 现有评测难以反映真实长文档检索能力\n- 需要更多 multi-hop 任务",
      en: "## Observations\n- Existing benchmarks miss real long-doc retrieval\n- Need more multi-hop tasks",
    },
    wordCount: 38,
    createdAt: isoMinusDays(10),
    updatedAt: isoMinusDays(3),
  },
];

// ============================================================================
// Briefs
// ============================================================================

export const SEED_BRIEFS: Brief[] = [
  {
    id: "b_001" as Brief["id"],
    ownerId: SEED_USER.id,
    topicId: SEED_TOPICS[0].id,
    status: "ready",
    cadence: "weekly",
    windowStart: isoMinusDays(7),
    windowEnd: FIXTURE_NOW,
    headline: { zh: "本周 LLM 焦点:推理与压缩", en: "This Week in LLMs: Reasoning & Compression" },
    deck: {
      zh: "三篇论文重新定义了推理时间扩展的成本曲线,同时社区对量化压缩的共识正在形成。",
      en: "Three papers redrew the cost curve of test-time scaling; meanwhile a quantization consensus is forming.",
    },
    sections: [
      {
        kind: "summary",
        title: { zh: "速览", en: "TL;DR" },
        bullets: [
          { zh: "Test-time scaling 在小模型上效果显著", en: "Test-time scaling shines on small models" },
          { zh: "INT4 量化已逼近无损", en: "INT4 quantization nears lossless" },
          { zh: "三家厂商发布 1M 上下文模型", en: "Three labs ship 1M-token context models" },
        ],
      },
      {
        kind: "claims",
        title: { zh: "关键论断", en: "Key Claims" },
        claimIds: ["cl_001" as Claim["id"], "cl_002" as Claim["id"]],
      },
    ],
    highlightClaimIds: ["cl_001" as Claim["id"]],
    wordCount: 1240,
    readingTimeMin: 6,
    generationStats: {
      startedAt: isoMinusHours(9),
      finishedAt: isoMinusHours(8),
      durationMs: 47_000,
      model: "rt-brief-v2",
      inputTokens: 38_000,
      outputTokens: 1_400,
    },
    feedback: { upvotes: 4, downvotes: 0, myVote: null },
    savedToVault: false,
    shareToken: null,
    createdAt: isoMinusHours(8),
    updatedAt: isoMinusHours(8),
  },
];

// ============================================================================
// Claims & Evidence
// ============================================================================

export const SEED_CLAIMS: Claim[] = [
  {
    id: "cl_001" as Claim["id"],
    topicId: SEED_TOPICS[0].id,
    statement: {
      zh: "长上下文模型在 128K 范围内仍能保持 95% 以上的 needle-in-haystack 准确率",
      en: "Long-context models retain >95% needle-in-haystack accuracy at 128K",
    },
    qualifier: {
      zh: "适用于 2024 后训练的开源模型",
      en: "Applies to post-2024 open-source models",
    },
    strength: "strong",
    evidenceCount: 4,
    stanceBreakdown: { supports: 3, refutes: 1, neutral: 0 },
    confidence: 78,
    myDispute: null,
    firstSeenAt: isoMinusDays(14),
    createdAt: isoMinusDays(14),
    updatedAt: isoMinusDays(2),
  },
  {
    id: "cl_002" as Claim["id"],
    topicId: SEED_TOPICS[0].id,
    statement: {
      zh: "INT4 权重量化在主流 7B 模型上准确度损失 <1%",
      en: "INT4 weight quantization loses <1% accuracy on mainstream 7B models",
    },
    qualifier: null,
    strength: "moderate",
    evidenceCount: 2,
    stanceBreakdown: { supports: 2, refutes: 0, neutral: 0 },
    confidence: 65,
    myDispute: null,
    firstSeenAt: isoMinusDays(10),
    createdAt: isoMinusDays(10),
    updatedAt: isoMinusDays(3),
  },
];

export const SEED_EVIDENCE: Evidence[] = [
  {
    id: "ev_001" as Evidence["id"],
    claimId: SEED_CLAIMS[0].id,
    kind: "paper",
    stance: "supports",
    excerpt: {
      zh: "在 128K 长度下,我们的模型在六个 benchmark 平均准确率为 97.2%。",
      en: "At 128K, our model averages 97.2% accuracy across six benchmarks.",
    },
    document: {
      url: "https://arxiv.org/abs/2501.12345",
      title: { zh: "Long-Context Frontiers", en: "Long-Context Frontiers" },
      arxivId: "2501.12345",
      language: "en",
    },
    locator: "Table 3, p.7",
    weight: 85,
    createdAt: isoMinusDays(13),
    updatedAt: isoMinusDays(13),
  },
];

// ============================================================================
// Ask
// ============================================================================

export const SEED_ASK_SESSIONS: AskSession[] = [
  {
    id: "as_001" as AskSession["id"],
    ownerId: SEED_USER.id,
    title: { zh: "RAG 评测设计", en: "RAG eval design" },
    defaultScope: { kind: "mixed", topicIds: [SEED_TOPICS[1].id], includeWeb: true },
    messageCount: 6,
    lastMessageAt: isoMinusHours(5),
    archived: false,
    pinned: true,
    createdAt: isoMinusDays(3),
    updatedAt: isoMinusHours(5),
  },
];

export const SEED_ASK_MESSAGES: AskMessage[] = [
  {
    id: "am_001" as AskMessage["id"],
    sessionId: SEED_ASK_SESSIONS[0].id,
    role: "user",
    status: "complete",
    content: "如何为 RAG 系统设计一个能捕捉幻觉的评测?",
    scope: { kind: "mixed", topicIds: [SEED_TOPICS[1].id], includeWeb: true },
    citations: [],
    followUps: [],
    stats: null,
    error: null,
    feedback: null,
    createdAt: isoMinusHours(5),
    updatedAt: isoMinusHours(5),
  },
  {
    id: "am_002" as AskMessage["id"],
    sessionId: SEED_ASK_SESSIONS[0].id,
    role: "assistant",
    status: "complete",
    content:
      "评测 RAG 幻觉的常见做法是构造 closed-book vs open-book 的对照集 [cite:1],并用 attribution-aware 指标如 ALCE [cite:2] 替代单纯的 ROUGE。",
    scope: { kind: "mixed", topicIds: [SEED_TOPICS[1].id], includeWeb: true },
    citations: [
      {
        kind: "evidence",
        index: 1,
        evidenceId: SEED_EVIDENCE[0].id,
        claimId: SEED_CLAIMS[0].id,
        title: { zh: "RAG Reliability", en: "RAG Reliability" },
        url: "https://arxiv.org/abs/2412.99999",
        excerpt: {
          zh: "对照实验显示...",
          en: "Ablation shows...",
        },
      },
      {
        kind: "web",
        index: 2,
        title: { zh: "ALCE 评测说明", en: "ALCE Eval Spec" },
        url: "https://example.com/alce",
        excerpt: { zh: "ALCE 由斯坦福提出", en: "ALCE introduced at Stanford" },
      },
    ],
    followUps: [
      { zh: "ALCE 的具体计算方式?", en: "How is ALCE computed?" },
      { zh: "有哪些开源实现可以参考?", en: "Which open-source impls exist?" },
    ],
    stats: {
      startedAt: isoMinusHours(5),
      finishedAt: isoMinusHours(5),
      ttftMs: 380,
      durationMs: 4200,
      inputTokens: 320,
      outputTokens: 240,
      model: "rt-ask-v3",
    },
    error: null,
    feedback: { vote: "up", comment: null },
    createdAt: isoMinusHours(5),
    updatedAt: isoMinusHours(5),
  },
];

export const SEED_ASK_SUGGESTIONS: AskSuggestion[] = [
  {
    id: "sug_001",
    label: { zh: "本周 LLM 进展", en: "This week in LLMs" },
    prompt: "总结本周大语言模型领域的关键进展",
  },
  {
    id: "sug_002",
    label: { zh: "对比 RAG 框架", en: "Compare RAG frameworks" },
    prompt: "对比当前主流的 RAG 框架在生产环境的优缺点",
  },
  {
    id: "sug_003",
    label: { zh: "智能体设计模式", en: "Agent design patterns" },
    prompt: "归纳近期智能体研究中常见的设计模式",
  },
];

// ============================================================================
// Agents
// ============================================================================

export const SEED_AGENTS: Agent[] = [
  {
    id: "ag_001" as Agent["id"],
    ownerId: SEED_USER.id,
    kind: "brief_generator",
    name: { zh: "每周 LLM 简报", en: "Weekly LLM Brief" },
    description: { zh: "每周一上午 9 点生成", en: "Every Monday 9am" },
    status: "enabled",
    trigger: { kind: "schedule", cron: "0 9 * * 1", timezone: "Asia/Shanghai" },
    config: {
      kind: "brief_generator",
      topicIds: [SEED_TOPICS[0].id],
      cadence: "weekly",
      sections: ["summary", "claims", "papers"],
    },
    lastRunAt: isoMinusHours(8),
    lastRunStatus: "succeeded",
    runCount: 12,
    lastError: null,
    createdAt: isoMinusDays(80),
    updatedAt: isoMinusHours(8),
  },
];

export const SEED_AGENT_RUNS: AgentRun[] = [
  {
    id: "ar_001" as AgentRun["id"],
    agentId: SEED_AGENTS[0].id,
    status: "succeeded",
    startedAt: isoMinusHours(9),
    finishedAt: isoMinusHours(8),
    durationMs: 47_000,
    triggerReason: "scheduled",
    steps: [
      {
        index: 0,
        name: { zh: "拉取本周条目", en: "Fetch weekly items" },
        status: "succeeded",
        startedAt: isoMinusHours(9),
        finishedAt: isoMinusHours(9),
        message: { zh: "已拉取 42 条", en: "Fetched 42 items" },
      },
      {
        index: 1,
        name: { zh: "生成简报", en: "Generate brief" },
        status: "succeeded",
        startedAt: isoMinusHours(9),
        finishedAt: isoMinusHours(8),
        message: { zh: "完成", en: "Done" },
      },
    ],
    summary: { zh: "成功生成本周简报 b_001", en: "Generated weekly brief b_001" },
    error: null,
    outputs: [{ kind: "brief", briefId: "b_001" }],
  },
];

export const SEED_AGENT_TEMPLATES: AgentTemplate[] = [
  {
    id: "tpl_001",
    kind: "brief_generator",
    name: { zh: "每日话题简报", en: "Daily Topic Brief" },
    description: {
      zh: "每天为指定话题生成一份简报",
      en: "Generate a daily brief for a chosen topic",
    },
    iconUrl: "/icons/brief.svg",
    popular: true,
    defaultConfig: {
      kind: "brief_generator",
      topicIds: [],
      cadence: "daily",
      sections: ["summary", "claims"],
    },
    defaultTrigger: { kind: "schedule", cron: "0 8 * * *", timezone: "Asia/Shanghai" },
  },
  {
    id: "tpl_002",
    kind: "topic_watcher",
    name: { zh: "热度峰值告警", en: "Heat Spike Alert" },
    description: {
      zh: "当话题热度突破阈值时通知",
      en: "Notify when topic heat exceeds threshold",
    },
    iconUrl: "/icons/watch.svg",
    popular: true,
    defaultConfig: {
      kind: "topic_watcher",
      topicId: "" as Topic["id"],
      condition: { kind: "heat_above", threshold: 80 },
      action: { kind: "notify" },
    },
    defaultTrigger: { kind: "event", event: "topic_heat_spike" },
  },
];

// ============================================================================
// Notifications
// ============================================================================

export const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "n_001" as Notification["id"],
    ownerId: SEED_USER.id,
    kind: "brief_ready",
    severity: "success",
    title: { zh: "本周简报已就绪", en: "Your weekly brief is ready" },
    body: {
      zh: "话题《大语言模型》本周简报已生成,点击查看。",
      en: "Weekly brief for 'Large Language Models' is ready.",
    },
    read: false,
    actionUrl: "/briefs/b_001",
    actionLabel: { zh: "查看简报", en: "View brief" },
    topicId: SEED_TOPICS[0].id,
    metadata: { briefId: "b_001" },
    createdAt: isoMinusHours(8),
    updatedAt: isoMinusHours(8),
  },
  {
    id: "n_002" as Notification["id"],
    ownerId: SEED_USER.id,
    kind: "topic_heat_spike",
    severity: "info",
    title: { zh: "智能体系统话题热度飙升", en: "Agentic Systems heat spiked" },
    body: { zh: "热度已达 91。", en: "Heat reached 91." },
    read: false,
    actionUrl: "/topics/t_003",
    actionLabel: { zh: "去看看", en: "Take a look" },
    topicId: SEED_TOPICS[2].id,
    metadata: { heat: 91 },
    createdAt: isoMinusHours(2),
    updatedAt: isoMinusHours(2),
  },
];

// ============================================================================
// Billing
// ============================================================================

export const SEED_PLANS: Plan[] = [
  {
    tier: "free",
    name: { zh: "免费版", en: "Free" },
    tagline: { zh: "开始你的研究", en: "Start your research" },
    prices: {
      monthly: { amountMinor: 0, currency: "USD" },
      yearly: { amountMinor: 0, currency: "USD" },
    },
    features: [
      { key: "topics", label: { zh: "话题", en: "Topics" }, included: true, quantity: { zh: "5 个", en: "5" } },
      { key: "ask", label: { zh: "Ask 提问", en: "Ask queries" }, included: true, quantity: { zh: "每天 10 次", en: "10/day" } },
      { key: "briefs", label: { zh: "AI 简报", en: "AI Briefs" }, included: false },
    ],
    highlighted: false,
    popular: false,
    quotas: { topics: 5, sources: 10, vaultBytes: 100_000_000, briefsPerMonth: 0, askPerDay: 10 },
  },
  {
    tier: "pro",
    name: { zh: "专业版", en: "Pro" },
    tagline: { zh: "深度知识工作", en: "Deep knowledge work" },
    prices: {
      monthly: { amountMinor: 1900, currency: "USD" },
      yearly: { amountMinor: 19_000, currency: "USD" },
    },
    features: [
      { key: "topics", label: { zh: "话题", en: "Topics" }, included: true, quantity: { zh: "50 个", en: "50" } },
      { key: "ask", label: { zh: "Ask 提问", en: "Ask queries" }, included: true, quantity: { zh: "每天 200 次", en: "200/day" } },
      { key: "briefs", label: { zh: "AI 简报", en: "AI Briefs" }, included: true, quantity: { zh: "每月 200 份", en: "200/mo" } },
    ],
    highlighted: true,
    popular: true,
    quotas: { topics: 50, sources: 100, vaultBytes: 5_000_000_000, briefsPerMonth: 200, askPerDay: 200 },
  },
  {
    tier: "team",
    name: { zh: "团队版", en: "Team" },
    tagline: { zh: "为研究团队而生", en: "For research teams" },
    prices: {
      monthly: { amountMinor: 4900, currency: "USD" },
      yearly: { amountMinor: 49_000, currency: "USD" },
    },
    features: [
      { key: "everything_pro", label: { zh: "包含 Pro 所有功能", en: "Everything in Pro" }, included: true },
      { key: "shared_vault", label: { zh: "共享资料库", en: "Shared Vault" }, included: true },
      { key: "seats", label: { zh: "团队席位", en: "Seats" }, included: true, quantity: { zh: "5 席", en: "5 seats" } },
    ],
    highlighted: false,
    popular: false,
    quotas: { topics: 200, sources: 500, vaultBytes: 50_000_000_000, briefsPerMonth: 1000, askPerDay: 1000 },
  },
];

export const SEED_SUBSCRIPTION: Subscription = {
  id: "sub_001" as Subscription["id"],
  userId: SEED_USER.id,
  planTier: "pro",
  interval: "yearly",
  status: "active",
  currentPeriodStart: isoMinusDays(40),
  currentPeriodEnd: isoMinusDays(-325),
  cancelAtPeriodEnd: false,
  trialEnd: null,
  paymentMethodId: "pm_001",
  createdAt: isoMinusDays(40),
  updatedAt: isoMinusDays(40),
};

export const SEED_INVOICES: Invoice[] = [
  {
    id: "inv_001" as Invoice["id"],
    userId: SEED_USER.id,
    subscriptionId: SEED_SUBSCRIPTION.id,
    number: "RT-2026-0042",
    status: "paid",
    currency: "USD",
    subtotalMinor: 19_000,
    taxMinor: 0,
    totalMinor: 19_000,
    paidAt: isoMinusDays(40),
    dueAt: null,
    lineItems: [
      {
        description: { zh: "Pro 年付", en: "Pro Yearly" },
        amountMinor: 19_000,
        quantity: 1,
        periodStart: isoMinusDays(40),
        periodEnd: isoMinusDays(-325),
      },
    ],
    hostedUrl: "https://invoice.researchtrace.com/RT-2026-0042",
    createdAt: isoMinusDays(40),
    updatedAt: isoMinusDays(40),
  },
];

export const SEED_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "pm_001",
    userId: SEED_USER.id,
    type: "card",
    card: { brand: "visa", last4: "4242", expMonth: 12, expYear: 2028 },
    isDefault: true,
    createdAt: isoMinusDays(120),
    updatedAt: isoMinusDays(120),
  },
];

// ============================================================================
// Topic feed (used by /topics/{id}/feed)
// ============================================================================

export const SEED_TOPIC_FEED: Record<string, TopicFeedItem[]> = {
  [SEED_TOPICS[0].id]: [
    {
      id: "tf_001",
      topicId: SEED_TOPICS[0].id,
      heat: 88,
      ingestedAt: isoMinusHours(1),
      read: false,
      saved: false,
      kind: "paper",
      document: {
        url: "https://arxiv.org/abs/2501.12345",
        title: { zh: "Million-Token Retrieval", en: "Million-Token Retrieval" },
        arxivId: "2501.12345",
        language: "en",
      },
      tldr: {
        zh: "1M 上下文针尖检索准确度 96%",
        en: "96% needle accuracy at 1M context",
      },
    },
  ],
};

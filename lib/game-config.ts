export interface Scenario {
  id: string
  slug: string
  title: string
  description: string
  initialPrompt: string // The core situation for the boss
}

export const scenarios: Scenario[] = [
  {
    id: "1",
    slug: "late-meeting",
    title: "开会迟到",
    description: "你今天约客户在公司开会，但是你迟到了两小时，老板很生气。",
    initialPrompt: "我让你约的客户已经在会议室等了你两个小时了，你人呢？！现在项目出了问题你担待得起吗？",
  },
  {
    id: "2",
    slug: "no-daily-reports",
    title: "周报失踪",
    description: "你连续一周没有发日报了，老板似乎有所察觉。",
    initialPrompt: "这都一周了，你的日报呢？团队其他人每天都准时发，就你特殊？最近工作不饱和是吧？",
  },
  {
    id: "3",
    slug: "missed-urgent-call",
    title: "漏接急电",
    description: "老板昨晚有急事通过微信找你，你没及时回复，今天老板脸色不太好。",
    initialPrompt: "昨晚十万火急的事情找你，微信消息半天不回，电话也不接，你是不是觉得下班了就万事大吉了？",
  },
  {
    id: "4",
    slug: "ai-low-efficiency",
    title: "AI摸鱼",
    description: "老板认为AI工具能提效1000%，而你用AI只提升了10%。",
    initialPrompt: "公司花大价钱引入的AI工具，别人用起来效率提升几倍，到你这儿就提升10%？你是不是根本没用心学怎么用？",
  },
]

export const MAX_TURNS = 10
export const TARGET_SCORE = 100

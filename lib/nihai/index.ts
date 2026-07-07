/**
 * 倪海厦 天纪 / 地纪 / 人纪 — 统一导出
 *
 * 倪海厦（1954-2012），美国汉唐中医学院创办人，
 * 当代少见的「命、相、卜、山、医」五术兼备之旷世奇人。
 *
 * 三纪体系：
 *   天纪 —— 上知天文（紫微斗数、易经、堪舆、推命、面相、测字）
 *   地纪 —— 下知地理（国家地理志、风水与国运）
 *   人纪 —— 中知人事（针灸、黄帝内经、神农本草经、伤寒论、金匮要略）
 */

export * from './types';
export { TIANJI_MODULES, HEXAGRAMS, FENGSHUI_ENTRIES, TIANJI_EPISODES, TIANJI_QUOTES, TIANJI_STATS } from './tianji';
export { RENJI_MODULES, ACU_EXPERIENCES, TRANS_NEEDLING, HANTANG_FORMULAS, CLASSIC_FORMULAS, RENJI_STATS } from './renji';
export { DIJI_MODULES, DIJI_STATS } from './diji';

/** 倪海厦完整传记 */
export const NI_HAIXIA_BIO = {
  name: '倪海厦',
  nameVariant: '倪海夏',
  alias: '梵宇龙',
  birth: '1954年1月1日',
  death: '2012年1月31日',
  birthPlace: '台北市',
  ancestry: '浙江瑞安',
  family: '七个兄弟姊妹，排行第五',
  education: '东吴大学政治系',
  title: '美国汉唐中医学院创办人',
  titles: [
    '命、相、卜、山、医 五术兼备之旷世奇人',
    '美国汉唐中医学院院长',
    '美国加州中医药大学博士指导教授',
    '佛罗里达州卫生署中医委员会最高委员（2000-2003）',
    '佛州针灸委员会委员及副主席',
    '经方派现代继承者',
    '天纪、人纪教学体系创立者',
    '海外优秀华人奖获得者',
  ],
  /** 师承关系 */
  teachers: [
    { name: '周左宇', background: '北京四代家传名医，1949年后移居台湾', subject: '针灸', period: '1977-1981' },
    { name: '徐济民', background: '江苏籍上海名医', subject: '针灸', period: '1970s' },
    { name: '姜佐景传承', background: '师承曹颖甫的经方家', subject: '经方', period: '基隆中药行学徒期间' },
  ],
  /** 核心理念 */
  corePhilosophy: [
    '大道至简——飞星飞来飞去太复杂，不搞这个',
    '命宫为本，三方为用',
    '人事努力+地理调整 > 先天命运（2/3 > 1/3）',
    '中医是物理医学，从物理角度分析人体',
    '辨证不辨病——中医看的是证型而非病名',
    '经方一剂知，二剂已',
    '不希望中华文化失传，所以教了许多学生',
    '算命就是一个讨论果的哲学',
    '文字只是船，真理才是彼岸',
  ],
  /** 人生大事记 */
  timeline: [
    { year: '1954', event: '出生于台北市，祖籍浙江瑞安' },
    { year: '1970s', event: '高中时以《医宗金鉴》治愈二姐月经痛，立志习医' },
    { year: '1977-1981', event: '向周左宇医师学习针灸' },
    { year: '1978', event: '军旅服役马祖军医部，获"马祖神医"称号，时年24岁' },
    { year: '1979', event: '退伍后以化名"梵宇龙"开始算命看相事业' },
    { year: '1980', event: '移民美国' },
    { year: '1988', event: '在台北金山南路开办"天文地理班"，传授紫微斗数和阳宅风水' },
    { year: '1991', event: '成为美国佛罗里达州注册针灸师' },
    { year: '1993', event: '在佛州Merritt Island选定汉唐中医学院地产' },
    { year: '1994', event: '完成《天纪》系列著作录制，共24集' },
    { year: '1995', event: '创办汉唐中医学院' },
    { year: '2000-2003', event: '任佛州卫生署中医委员会最高委员' },
    { year: '2004', event: '在台北开设《人纪》中医教学班' },
    { year: '2005', event: '《人纪》系列教学DVD出版' },
    { year: '2007', event: '开始撰写《地纪》' },
    { year: '2010', event: '成立台北汉唐经方中医诊所；受邀第三届扶阳论坛整天演讲' },
    { year: '2011', event: '成立深圳汉唐经方中医馆' },
    { year: '2012', event: '1月31日因心肺衰竭在台北辞世，享年59岁' },
  ],
  /** 著作体系 */
  publications: {
    originalBooks8: ['黄帝内经素问', '黄帝内经', '神农本草经', '针灸', '伤寒论', '金匮', '人间道', '天机道·地脉道'],
    totalBooks: '26-44册（含注解版教材、医案全集、穴位精解等）',
    hantangFormulas: '汉唐100方',
    classicFormulas: '259个经典配方',
    medicalCases: '医案全集7本',
    totalVideoHours: '200+小时',
  },
  /** 三纪体系 */
  sanJi: {
    tianji: {
      name: '天纪',
      meaning: '上知天文',
      content: '紫微斗数、易经64卦、堪舆学、推命学、面相学、测字术',
      recordYear: 1994,
      episodes: 24,
      hdEpisodes: 83,
      hoursPerEpisode: 2,
      totalHours: 48,
      books: ['天机道', '人间道', '地脉道', '64卦易图'],
      schools: ['三合派（紫微斗数）', '象数派（易经）', '九星派（堪舆）', '河洛数理派（推命）'],
      structure: '前一小时讲命学，后一小时讲易经',
    },
    renji: {
      name: '人纪',
      meaning: '中知人事',
      content: '针灸大成(44集)、黄帝内经(20集)、神农本草经(46集)、伤寒论、金匮要略(20集)',
      completionYear: '2004-2005',
      totalLessons: '150+集',
      learningOrder: '针灸→黄帝内经→神农本草经→伤寒论→金匮要略',
      acuExperience: 215,
      transNeedling: 31,
      hantangFormulas: 100,
    },
    diji: {
      name: '地纪',
      meaning: '下知地理',
      content: '国家地理志（未完成）',
      status: '倪师未竟之业',
      note: '原计划60岁后著述，2012年辞世',
      startYear: 2007,
      existingContent: '天纪课程中堪舆学部分 + 后人整理遗稿',
    },
  },
  /** 人格特征 */
  personality: {
    算命风格: '铁口直断不留余地',
    音乐爱好: '最喜老鹰乐队《加州旅馆》',
    生活技能: '做饭洗衣样样精通，一手面点功夫人人喊赞',
    工作态度: '床头经年放纸笔，遭遇疑难杂症时向先师祝祷',
    睡眠: '多年夜间睡眠不足三小时',
    患者评价: '常被美国病患称为"最后的希望（The last hope）"',
  },
  /** 传人选拔标准 */
  discipleStandards: [
    '心性好',
    '个性强',
    '主见强',
    '敏锐观察力',
    '勇于批判错误理论',
  ],
};

/** 三纪导航 */
export const SANJI_CATEGORIES = [
  { key: 'tianji' as const, name: '天纪', nameEn: 'Tian Ji', icon: '⊙', meaning: '上知天文', color: '#d4a843', href: '/tianji' },
  { key: 'diji' as const, name: '地纪', nameEn: 'Di Ji', icon: '⊞', meaning: '下知地理', color: '#6b8a5e', href: '/diji' },
  { key: 'renji' as const, name: '人纪', nameEn: 'Ren Ji', icon: '⊕', meaning: '中知人事', color: '#8b6b9e', href: '/renji' },
] as const;

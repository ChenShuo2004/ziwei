import { ALL_BOOKS, getBookBySlug, getChapter } from '@/lib/classics';
import type { Book, Chapter } from '@/lib/classics';
import { ALL_STARS, ALL_TOPICS, getKnowledge, SLUG_TO_STAR, STAR_BRIEF_SEO, STAR_TO_SLUG } from '@/lib/seo/knowledge';
import type { TopicKey } from '@/lib/ziwei/db-analysis';

export type MysteryType = 'knowledge' | 'classics';
export type MysteryCategory =
  | 'basics'
  | 'stars'
  | 'palaces'
  | 'sihua'
  | 'patterns'
  | 'classic-text'
  | 'classic-notes'
  | 'cases';

export interface MysteryItem {
  id: string;
  type: MysteryType;
  category: MysteryCategory;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  source: string;
  hrefParams: Record<string, string>;
}

export interface MysteryReader {
  book: Book;
  chapter: Chapter | null;
  chapterIdx: number | null;
}

export interface KnowledgeReader {
  item: MysteryItem;
}

export const MYSTERY_TYPES: Array<{ value: 'all' | MysteryType; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'knowledge', label: '知识讲解' },
  { value: 'classics', label: '古籍原文' },
];

export const MYSTERY_CATEGORIES: Array<{ value: 'all' | MysteryCategory; label: string }> = [
  { value: 'all', label: '全部分类' },
  { value: 'basics', label: '命盘基础' },
  { value: 'stars', label: '星曜体系' },
  { value: 'palaces', label: '宫位解读' },
  { value: 'sihua', label: '四化体系' },
  { value: 'patterns', label: '格局研究' },
  { value: 'classic-text', label: '古籍原文' },
  { value: 'classic-notes', label: '古籍注解' },
  { value: 'cases', label: '实战案例' },
];

const TOPIC_CATEGORY: Record<TopicKey, MysteryCategory> = {
  overview: 'basics',
  personality: 'stars',
  love: 'palaces',
  career: 'palaces',
  wealth: 'palaces',
  health: 'palaces',
  family: 'palaces',
  children: 'palaces',
  move: 'palaces',
  friends: 'palaces',
  home: 'palaces',
  spirit: 'palaces',
  parents: 'palaces',
};

export function getMysteryItems(): MysteryItem[] {
  const knowledgeItems = buildKnowledgeItems();
  const classicItems = buildClassicItems();
  return [...knowledgeItems, ...classicItems];
}

export function getMysteryReader(bookSlug?: string, chapterValue?: string): MysteryReader | null {
  if (!bookSlug) return null;
  const book = getBookBySlug(bookSlug);
  if (!book) return null;
  if (chapterValue === undefined) {
    return { book, chapter: null, chapterIdx: null };
  }
  const chapterIdx = Number.parseInt(chapterValue, 10);
  if (!Number.isInteger(chapterIdx)) return { book, chapter: null, chapterIdx: null };
  const result = getChapter(bookSlug, chapterIdx);
  if (!result) return { book, chapter: null, chapterIdx: null };
  return { book: result.book, chapter: result.chapter, chapterIdx: result.chapterIdx };
}

export function getMysteryKnowledgeReader(starSlug?: string, topic?: string): KnowledgeReader | null {
  if (!starSlug || !topic) return null;
  const star = SLUG_TO_STAR[starSlug];
  if (!star || !ALL_TOPICS.includes(topic as TopicKey)) return null;
  const data = getKnowledge(star, topic as TopicKey);
  if (!data.exists) return null;
  const item = knowledgeItemFromData(star, topic as TopicKey);
  return item ? { item } : null;
}

function knowledgeItemFromData(star: string, topic: TopicKey): MysteryItem | null {
  const data = getKnowledge(star, topic);
  if (!data.exists) return null;
  const body = [
    data.parsed.dingdiao,
    data.parsed.lundian,
    data.parsed.yiju,
    data.parsed.advice,
    data.parsed.risk,
    data.parsed.chuchu,
  ].filter(Boolean).join('\n\n');
  return {
    id: `knowledge-${STAR_TO_SLUG[star]}-${topic}`,
    type: 'knowledge',
    category: TOPIC_CATEGORY[topic],
    title: `${star} · ${data.topicLabel}`,
    summary: data.parsed.dingdiao || data.entry?.summary || STAR_BRIEF_SEO[star] || `${star} 的${data.topicLabel}知识条目。`,
    body,
    tags: [star, data.topicLabel, data.palaceName, '知识'],
    source: '知识讲解',
    hrefParams: { type: 'knowledge', star: STAR_TO_SLUG[star], topic },
  };
}

function buildKnowledgeItems(): MysteryItem[] {
  const detailed = ALL_STARS.flatMap(star => {
    const starItems: Array<MysteryItem | null> = ALL_TOPICS.map(topic => {
      return knowledgeItemFromData(star, topic);
    });
    return starItems.filter((item): item is MysteryItem => item !== null);
  });

  if (detailed.length > 0) return detailed;

  return ALL_STARS.map((star, index) => ({
    id: `knowledge-${STAR_TO_SLUG[star]}`,
    type: 'knowledge',
    category: index < 2 ? 'basics' : 'stars',
    title: star,
    summary: STAR_BRIEF_SEO[star] || `${star}主星基础知识。`,
    body: STAR_BRIEF_SEO[star] || '',
    tags: [star, '星曜体系', '命盘基础', '知识'],
    source: '14 主星',
    hrefParams: { type: 'knowledge', star: STAR_TO_SLUG[star] },
  }));
}

function buildClassicItems(): MysteryItem[] {
  return ALL_BOOKS.flatMap(book => {
    const bookItem: MysteryItem = {
      id: `classic-${book.slug}`,
      type: 'classics',
      category: 'classic-text',
      title: `《${book.title}》`,
      summary: book.intro,
      body: [
        book.title,
        book.dynasty,
        book.author,
        book.intro,
        ...book.chapters.map(chapter => [
          chapter.title,
          chapter.subtitle,
          ...chapter.paragraphs.map(paragraph => paragraph.text),
        ].filter(Boolean).join('\n')),
      ].join('\n'),
      tags: [book.title, book.dynasty, book.author, '古籍原文'],
      source: book.author,
      hrefParams: { type: 'classics', book: book.slug },
    };

    const chapterItems: MysteryItem[] = book.chapters.map((chapter, chapterIdx) => ({
      id: `classic-${book.slug}-${chapterIdx}`,
      type: 'classics',
      category: 'classic-text',
      title: `${book.title} · ${chapter.title}`,
      summary: chapter.subtitle || book.intro,
      body: chapter.paragraphs.map(paragraph => [
        paragraph.text,
        paragraph.translation,
        paragraph.niNote,
      ].filter(Boolean).join('\n')).join('\n'),
      tags: [book.title, chapter.title, book.dynasty, '古籍原文'],
      source: `《${book.title}》`,
      hrefParams: { type: 'classics', book: book.slug, chapter: String(chapterIdx) },
    }));

    return [bookItem, ...chapterItems];
  });
}

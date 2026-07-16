'use client';

import { MouseEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import type { KnowledgeReader, MysteryItem, MysteryReader, MysteryType } from '@/lib/ziwei-mysteries';
import { MYSTERY_CATEGORIES } from '@/lib/ziwei-mysteries';

interface ZiweiMysteriesClientProps {
  items: MysteryItem[];
  reader: MysteryReader | null;
  knowledgeReader: KnowledgeReader | null;
}

const entryCards: Array<{
  type: MysteryType;
  title: string;
  eyebrow: string;
  description: string;
  meta: string;
}> = [
  {
    type: 'knowledge',
    title: '知识讲解',
    eyebrow: 'Knowledge',
    description: '从十四主星、宫位体系到四化格局，按现代阅读方式整理紫微斗数基础知识。',
    meta: '星曜 · 宫位 · 四化 · 格局',
  },
  {
    type: 'classics',
    title: '古籍原文',
    eyebrow: 'Classics',
    description: '汇集古籍原文、章节与注解，保留典籍脉络，也方便进入具体篇章阅读。',
    meta: '典籍 · 章节 · 原文 · 注解',
  },
];

function getType(value: string | null): MysteryType | 'all' {
  return value === 'knowledge' || value === 'classics' ? value : 'all';
}

export default function ZiweiMysteriesClient({ items, reader, knowledgeReader }: ZiweiMysteriesClientProps) {
  const searchParams = useSearchParams();
  const queryKey = searchParams.toString();
  const pointerScrollY = useRef(0);
  const [activeType, setActiveType] = useState<MysteryType | 'all'>(() => getType(searchParams.get('type')));
  const [showReader, setShowReader] = useState(() => Boolean(reader || knowledgeReader));
  const visibleItems = activeType === 'all' ? [] : items.filter(item => item.type === activeType);
  const knowledgeCount = items.filter(item => item.type === 'knowledge').length;
  const classicsCount = items.filter(item => item.type === 'classics').length;
  const categoryLabel = (value: MysteryItem['category']) => (
    MYSTERY_CATEGORIES.find(category => category.value === value)?.label ?? value
  );

  const hrefFor = (item: MysteryItem) => {
    const params = new URLSearchParams();
    params.set('type', item.type);
    Object.entries(item.hrefParams).forEach(([key, value]) => params.set(key, value));
    return `/ziwei-mysteries?${params.toString()}`;
  };

  useEffect(() => {
    setActiveType(getType(searchParams.get('type')));
    setShowReader(Boolean(reader || knowledgeReader));
  }, [queryKey, reader, knowledgeReader, searchParams]);

  useEffect(() => {
    const restoreFromHistory = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveType(getType(params.get('type')));
      setShowReader(Boolean(params.get('book') || (params.get('star') && params.get('topic'))));
    };
    window.addEventListener('popstate', restoreFromHistory);
    return () => window.removeEventListener('popstate', restoreFromHistory);
  }, []);

  const switchEntry = (event: MouseEvent<HTMLButtonElement>, href: string) => {
    event.preventDefault();
    const scrollY = pointerScrollY.current;
    const restoreScroll = () => {
      window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    };
    const nextUrl = new URL(href, window.location.origin);
    setActiveType(getType(nextUrl.searchParams.get('type')));
    setShowReader(false);
    window.history.pushState(null, '', href);
    requestAnimationFrame(restoreScroll);
    window.setTimeout(restoreScroll, 60);
    window.setTimeout(restoreScroll, 180);
  };

  return (
    <section className="mysteries-workbench mysteries-workbench--entries" aria-label="紫薇秘术入口">
      <div className="mysteries-entry-grid">
        {entryCards.map(card => {
          const count = card.type === 'knowledge' ? knowledgeCount : classicsCount;
          const isActive = activeType === card.type;
          const href = `/ziwei-mysteries?type=${card.type}`;

          return (
            <button
              key={card.type}
              type="button"
              onMouseDown={event => {
                pointerScrollY.current = window.scrollY;
                event.preventDefault();
              }}
              onClick={event => switchEntry(event, href)}
              className={`mysteries-entry-card interactive-ring ${isActive ? 'is-active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="mysteries-entry-card__eyebrow">{card.eyebrow}</span>
              <h2>{card.title}</h2>
              <p>{card.description}</p>
              <div className="mysteries-entry-card__meta">
                <span>{card.meta}</span>
                <strong>{count} 条内容</strong>
              </div>
              <span className="mysteries-entry-card__arrow" aria-hidden="true">→</span>
            </button>
          );
        })}
      </div>

      {knowledgeReader && showReader && (
        <article className="mysteries-reader">
          <div className="mysteries-reader__heading">
            <span>{knowledgeReader.item.tags.slice(0, 3).join(' · ')}</span>
            <h2>{knowledgeReader.item.title}</h2>
            <p>{knowledgeReader.item.summary}</p>
          </div>
          <div className="mysteries-reader__body">
            {knowledgeReader.item.body.split('\n\n').filter(Boolean).map((paragraph, index) => {
              const [maybeTitle, ...bodyLines] = paragraph.split('\n');
              const titleMatch = maybeTitle.match(/^\*\*【(.+)】\*\*$/);
              return (
                <section key={`${knowledgeReader.item.id}-${index}`} className="mysteries-reader__paragraph">
                  <strong>{String(index + 1).padStart(2, '0')}</strong>
                  {titleMatch ? (
                    <>
                      <p>{titleMatch[1]}</p>
                      {bodyLines.join('\n').trim() && <em>{bodyLines.join('\n').trim()}</em>}
                    </>
                  ) : (
                    <p>{paragraph}</p>
                  )}
                </section>
              );
            })}
          </div>
        </article>
      )}

      {reader && showReader && !knowledgeReader && (
        <article className="mysteries-reader">
          <div className="mysteries-reader__heading">
            <span>{reader.book.dynasty} · {reader.book.author}</span>
            <h2>《{reader.book.title}》{reader.chapter ? ` · ${reader.chapter.title}` : ''}</h2>
            <p>{reader.chapter?.subtitle || reader.book.intro}</p>
          </div>
          {reader.chapter ? (
            <div className="mysteries-reader__body">
              {reader.chapter.paragraphs.map(paragraph => (
                <section key={paragraph.id} id={paragraph.id} className="mysteries-reader__paragraph">
                  <strong>{String(paragraph.idx).padStart(2, '0')}</strong>
                  <p>{paragraph.text}</p>
                  {paragraph.translation && <em>白话：{paragraph.translation}</em>}
                  {paragraph.niNote && <em>倪师注：{paragraph.niNote}</em>}
                </section>
              ))}
            </div>
          ) : (
            <div className="mysteries-chapter-list">
              {reader.book.chapters.map((chapter, index) => (
                <Link
                  key={chapter.title}
                  className="chapter-row interactive-ring"
                  href={`/ziwei-mysteries?type=classics&book=${reader.book.slug}&chapter=${index}`}
                >
                  <span className="chapter-row__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="chapter-row__body">
                    <strong>{chapter.title}</strong>
                    {chapter.subtitle && <em>{chapter.subtitle}</em>}
                  </span>
                  <span className="chapter-row__count">{chapter.paragraphs.length} 段</span>
                  <span className="chapter-row__arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          )}
        </article>
      )}

      {activeType !== 'all' && !reader && !knowledgeReader && (
        <div className="mysteries-section-list">
          <div className="mysteries-section-list__head">
            <span>{activeType === 'knowledge' ? 'Knowledge' : 'Classics'}</span>
            <h2>{activeType === 'knowledge' ? '知识讲解' : '古籍原文'}</h2>
            <p>{activeType === 'knowledge' ? '选择一张知识卡片进入对应主题。' : '选择一本古籍，进入章节和原文阅读。'}</p>
          </div>
          <div className="mysteries-grid">
            {visibleItems.map(item => (
              <Link key={item.id} href={hrefFor(item)} className="mystery-card interactive-ring">
                <div className="mystery-card__top">
                  <span>{item.type === 'knowledge' ? '知识' : '古籍'}</span>
                  <span>{categoryLabel(item.category)}</span>
                </div>
                <h2>{item.title}</h2>
                <p>{item.summary}</p>
                <div className="mystery-card__tags">
                  {item.tags.slice(0, 4).map(itemTag => (
                    <span key={itemTag}>{itemTag}</span>
                  ))}
                </div>
                <div className="mystery-card__foot">
                  <span>{item.source}</span>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

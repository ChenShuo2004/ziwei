'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

export interface HomeModule {
  no: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

interface HomeScrollStageProps {
  modules: HomeModule[];
}

interface FrameRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const FRAME_OUTSET = 16;

export default function HomeScrollStage({ modules }: HomeScrollStageProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [frameRect, setFrameRect] = useState<FrameRect | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const activeIndexRef = useRef(0);
  const tickingRef = useRef(false);

  const measureFrame = useCallback((index = activeIndexRef.current) => {
    const card = cardRefs.current[index];
    const list = listRef.current;
    if (!card || !list) return;

    setFrameRect({
      top: card.offsetTop - FRAME_OUTSET,
      left: card.offsetLeft - FRAME_OUTSET,
      width: card.offsetWidth + FRAME_OUTSET * 2,
      height: card.offsetHeight + FRAME_OUTSET * 2,
    });
  }, []);

  const updateActiveFromViewport = useCallback(() => {
    tickingRef.current = false;
    if (!cardRefs.current.length) return;

    const targetY = window.innerHeight * 0.5;
    let nextIndex = activeIndexRef.current;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distance = Math.abs(center - targetY);
      if (distance < closestDistance) {
        closestDistance = distance;
        nextIndex = index;
      }
    });

    if (nextIndex !== activeIndexRef.current) {
      activeIndexRef.current = nextIndex;
      setActiveIndex(nextIndex);
    }
    measureFrame(nextIndex);
  }, [measureFrame]);

  const requestActiveUpdate = useCallback(() => {
    if (tickingRef.current) return;
    tickingRef.current = true;
    window.requestAnimationFrame(updateActiveFromViewport);
  }, [updateActiveFromViewport]);

  useEffect(() => {
    requestActiveUpdate();

    window.addEventListener('scroll', requestActiveUpdate, { passive: true });
    window.addEventListener('resize', requestActiveUpdate);
    window.addEventListener('load', requestActiveUpdate);

    const observer = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(requestActiveUpdate);

    if (observer) {
      if (listRef.current) observer.observe(listRef.current);
      cardRefs.current.forEach((card) => {
        if (card) observer.observe(card);
      });
    }

    return () => {
      window.removeEventListener('scroll', requestActiveUpdate);
      window.removeEventListener('resize', requestActiveUpdate);
      window.removeEventListener('load', requestActiveUpdate);
      observer?.disconnect();
    };
  }, [requestActiveUpdate]);

  const scrollToCard = useCallback((index: number) => {
    const card = cardRefs.current[index];
    if (!card) return;

    activeIndexRef.current = index;
    setActiveIndex(index);
    measureFrame(index);

    const rect = card.getBoundingClientRect();
    const targetTop = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
  }, [measureFrame]);

  const frameStyle = useMemo(() => {
    if (!frameRect) return undefined;
    return {
      width: frameRect.width,
      height: frameRect.height,
      transform: `translate3d(${frameRect.left}px, ${frameRect.top}px, 0)`,
    } satisfies CSSProperties;
  }, [frameRect]);

  return (
    <section id="main-content" className="desktop-stage" aria-label="Metis 功能入口">
      <aside className="desktop-rail" aria-label="功能目录">
        {modules.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <a
              href={item.href}
              key={item.href}
              className={isActive ? 'is-active' : ''}
              aria-current={isActive ? 'step' : undefined}
              onClick={(event) => {
                event.preventDefault();
                scrollToCard(index);
              }}
            >
              <span>{item.no}</span>
              <strong>{item.title}</strong>
            </a>
          );
        })}
      </aside>

      <span className="desktop-kicker">易经 · 倪师体系</span>
      <span className="desktop-meta">AI Interpretation <em>{modules[activeIndex]?.no ?? '01'}</em></span>

      <div className="module-list" ref={listRef}>
        <span className="module-selection-frame" style={frameStyle} aria-hidden="true">
          <span>{modules[activeIndex]?.no ?? '01'}</span>
        </span>

        {modules.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <a
              id={`module-${item.no}`}
              className={`module-card${isActive ? ' is-active' : ''}`}
              href={item.href}
              key={item.href}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-module-index={item.no}
            >
              <img src={item.image} alt={item.title} loading={item.no === '01' ? 'eager' : 'lazy'} />
              <span className="shade" aria-hidden="true" />
              <span className="copy">
                <span className="eyebrow">{item.no} / {item.eyebrow}</span>
                <strong>{item.title}</strong>
                <span className="description">{item.description}</span>
                <span className="module-cta">进入功能 <span aria-hidden="true">→</span></span>
              </span>
            </a>
          );
        })}
      </div>
    </section>
  );
}

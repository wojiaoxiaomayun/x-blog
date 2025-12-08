import './back-to-top.css';
import { useEffect, useRef } from 'react';

export default function BackToTop() {
  const backToTopRef = useRef<HTMLDivElement | null>(null);

  // 滚动动画
  const scrollToTop = (duration = 600) => {
    const start = window.scrollY;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      window.scrollTo(0, start * (1 - progress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  // 监听滚动
  useEffect(() => {
    const onScroll = () => {
      const scroHei = window.scrollY;
      const el = backToTopRef.current;
      if (!el) return;

      if (scroHei > 500) {
        el.style.top = '-200px';
      } else {
        el.style.top = '-999px';
      }
    };

    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div ref={backToTopRef} className="cat-back-to-top cd-top faa-float animated cd-is-visible" onClick={() => scrollToTop(600)}></div>
  );
}

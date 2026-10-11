import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export type ToastItem = {
  id: number;
  message: string;
};

type ToastStackProps = {
  items: ToastItem[];
  onDismiss: (id: number) => void;
  stackRef: RefObject<HTMLDivElement>;
};

const AUTO_HIDE_MS = 3000;
const LEAVE_MS = 560;
const SWIPE_THRESHOLD_PX = 56;

type Phase = 'enter' | 'idle' | 'leave';

function ToastCard({
  id,
  message,
  onDismiss,
}: {
  id: number;
  message: string;
  onDismiss: (id: number) => void;
}) {
  const [phase, setPhase] = useState<Phase>('enter');
  const [dragging, setDragging] = useState(false);
  /* 每次拖拽结束（未划出）自增：作为进度条的 key 让它重新挂载、从头播放，
     与松手后重新计满 3s 的消失计时保持同步 */
  const [dragCount, setDragCount] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: number; startX: number } | null>(null);
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setPhase('idle'));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'idle' || dragging) {
      return;
    }
    const timer = window.setTimeout(() => setPhase('leave'), AUTO_HIDE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, dragging]);

  useEffect(() => {
    if (phase !== 'leave') {
      return;
    }
    const timer = window.setTimeout(() => dismissRef.current(id), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [phase, id]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== 'idle') {
      return;
    }
    dragRef.current = { id: e.pointerId, startX: e.clientX };
    setDragging(true);
    const el = cardRef.current;
    if (el) {
      el.style.transition = 'none';
      el.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const el = cardRef.current;
    if (!drag || drag.id !== e.pointerId || !el) {
      return;
    }
    el.style.transform = `translateX(${Math.max(0, e.clientX - drag.startX)}px)`;
  };

  const onPointerEnd = (e: React.PointerEvent<HTMLDivElement>, decide: boolean) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) {
      return;
    }
    dragRef.current = null;
    setDragging(false);
    const dx = e.clientX - drag.startX;
    const dismiss = decide && dx > SWIPE_THRESHOLD_PX;
    const el = cardRef.current;
    if (el) {
      el.style.transition = '';
      el.style.transform = dismiss ? `translateX(${el.offsetWidth}px)` : '';
    }
    if (dismiss) {
      setPhase('leave');
    } else {
      setDragCount((c) => c + 1);
    }
  };

  const stateClass =
    phase === 'enter'
      ? ' toast-in'
      : phase === 'leave'
        ? ' toast-out'
        : dragging
          ? ' is-live is-dragging'
          : ' is-live';

  return (
    <div
      className={`toast-card${stateClass}`}
      ref={cardRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => onPointerEnd(e, true)}
      onPointerCancel={(e) => onPointerEnd(e, false)}
    >
      {message}
      <span key={dragCount} className="toast-progress" aria-hidden="true" />
    </div>
  );
}

export function ToastStack({ items, onDismiss, stackRef }: ToastStackProps) {
  const prevTopsRef = useRef(new Map<number, number>());

  useLayoutEffect(() => {
    const stack = stackRef.current;
    if (!stack) {
      return;
    }
    const slots = Array.from(stack.children) as HTMLElement[];
    const nextTops = new Map<number, number>();
    slots.forEach((slot) => {
      const id = Number(slot.dataset.toastId);
      const top = slot.offsetTop;
      const prevTop = prevTopsRef.current.get(id);
      nextTops.set(id, top);
      if (prevTop !== undefined && prevTop !== top) {
        const styles = getComputedStyle(slot);
        slot.animate(
          [{ transform: `translateY(${prevTop - top}px)` }, { transform: 'translateY(0)' }],
          {
            duration: parseFloat(styles.transitionDuration) * 1000 || 400,
            easing: styles.transitionTimingFunction,
          }
        );
      }
    });
    prevTopsRef.current = nextTops;
  });

  return (
    <div className="toast-stack" role="status" aria-live="polite" ref={stackRef}>
      {items.map((item) => (
        <div className="toast-slot" key={item.id} data-toast-id={item.id}>
          <ToastCard id={item.id} message={item.message} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
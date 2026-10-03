"use client";

import { m } from "motion/react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  // Identical initial SSR/client markup. MotionConfig handles reduced motion after hydration.
  // Content is never hidden while JavaScript loads or if JavaScript is unavailable.
  return (
    <m.div
      className={className}
      initial={false}
      whileInView={{ y: [12, 0], opacity: [0.85, 1] }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {children}
    </m.div>
  );
}

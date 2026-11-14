'use client';

import { LazyMotion, MotionConfig } from 'framer-motion';
import type { ReactNode } from 'react';

const loadFeatures = () => import('./motion-features').then(module => module.default);

export default function MotionFeatures({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={loadFeatures} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}

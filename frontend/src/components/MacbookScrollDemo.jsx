"use client";

import { MacbookScroll } from "@/components/ui/macbook-scroll";

export function MacbookScrollDemo() {
  return (
    <div className="w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <MacbookScroll
        title={
          <span className="flex flex-col items-center gap-3">
            <span className="text-3xl font-extrabold tracking-tight md:text-5xl text-neutral-900 dark:text-white">
              Your Personalized AI Learning Platform
            </span>
            <span className="text-base font-medium text-neutral-500 md:text-xl dark:text-neutral-400">
              Learn smarter. Practice adaptively. Master every concept.
            </span>
          </span>
        }
        src="/smartlearn-dashboard.svg"
        showGradient={false}
      />
    </div>
  );
}

export default MacbookScrollDemo;

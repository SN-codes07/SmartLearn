"use client";

import { MacbookScroll } from "@/components/ui/macbook-scroll";

export function MacbookScrollDemo() {
  return (
    <div className="w-full max-w-full overflow-hidden bg-white dark:bg-[#0B0B0F]">
      <MacbookScroll
        src="/smartlearn-dashboard.svg"
        showGradient={false}
      />
    </div>
  );
}

export default MacbookScrollDemo;

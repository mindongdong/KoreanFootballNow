import * as React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 px-3 py-2 bg-black/90 text-white text-[13px] font-medium leading-snug rounded-lg whitespace-nowrap z-[1000] pointer-events-none shadow-lg animate-[tooltipFadeIn_0.15s_ease]">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-black/90" />
        </div>
      )}
    </div>
  );
}

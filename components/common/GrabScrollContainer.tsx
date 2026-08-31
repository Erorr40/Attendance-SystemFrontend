import React, { useRef, useState, useCallback } from 'react';

interface GrabScrollContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const GrabScrollContainer: React.FC<GrabScrollContainerProps> = ({
  children,
  className = '',
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Avoid hijacking events on text inputs, selects, textareas, or elements with explicit interaction
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'SELECT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'BUTTON' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('select') ||
      target.closest('a')
    ) {
      return;
    }

    if (!containerRef.current) return;
    setIsMouseDown(true);
    isDraggingRef.current = false;
    startXRef.current = e.pageX - containerRef.current.offsetLeft;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5; // Smooth panning speed
    if (Math.abs(walk) > 5) {
      isDraggingRef.current = true;
    }
    containerRef.current.scrollLeft = scrollLeftRef.current - walk;
  }, [isMouseDown]);

  const handleMouseUpOrLeave = useCallback(() => {
    setIsMouseDown(false);
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  }, []);

  const handleClickCapture = useCallback((e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpOrLeave}
      onMouseLeave={handleMouseUpOrLeave}
      onClickCapture={handleClickCapture}
      className={`overflow-x-auto select-none ${
        isMouseDown ? 'cursor-grabbing' : 'cursor-grab'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

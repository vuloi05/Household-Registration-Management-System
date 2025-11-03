import { useState, useEffect, useRef } from 'react';

interface Position {
  x: number;
  y: number;
}

export function useChatbotDrag(
  buttonRef:
    | React.RefObject<HTMLDivElement>
    | React.MutableRefObject<HTMLDivElement | null>
) {
  const [position, setPosition] = useState<Position>(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem('chatbotPosition');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.x !== undefined && parsed.y !== undefined) {
          return { x: parsed.x, y: parsed.y };
        }
      } catch {
        // Invalid JSON, fall through to default
      }
    }
    // Default bottom-right position - will be set properly on mount
    return { x: -1, y: -1 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);
  const hasDraggedRef = useRef(false);
  const positionRef = useRef(position);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Initialize position on mount if not set
  useEffect(() => {
    const saved = localStorage.getItem('chatbotPosition');
    if (!saved && (position.x === -1 || position.y === -1)) {
      // Calculate default bottom-right position
      const defaultX = window.innerWidth - 92; // Approximate button width + margin
      const defaultY = window.innerHeight - 92; // Approximate button height + margin
      setPosition({ x: defaultX, y: defaultY });
    }
  }, [position]);

  // Handle window resize - constrain button position if needed
  useEffect(() => {
    const handleResize = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const buttonWidth = rect.width;
        const buttonHeight = rect.height;
        const maxX = window.innerWidth - buttonWidth;
        const maxY = window.innerHeight - buttonHeight;

        if (position.x > maxX || position.y > maxY) {
          const constrainedX = Math.max(0, Math.min(position.x, maxX));
          const constrainedY = Math.max(0, Math.min(position.y, maxY));
          setPosition({ x: constrainedX, y: constrainedY });
          localStorage.setItem('chatbotPosition', JSON.stringify({ x: constrainedX, y: constrainedY }));
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position, buttonRef]);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Always allow dragging from the button container
    setHasDragged(false);
    hasDraggedRef.current = false;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      // Calculate offset from mouse to button's current position
      setDragStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
      setIsDragging(true);
    }
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isDragging) return;

    const buttonRect = buttonRef.current?.getBoundingClientRect();
    if (!buttonRect) return;

    const startX = buttonRect.left;
    const startY = buttonRect.top;
    const initialMouseX = startX + dragStart.x;
    const initialMouseY = startY + dragStart.y;

    const handleMouseMove = (e: MouseEvent) => {
      const moveX = Math.abs(e.clientX - initialMouseX);
      const moveY = Math.abs(e.clientY - initialMouseY);

      // Consider it a drag if moved more than 5px
      if (moveX > 5 || moveY > 5) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setHasDragged(true);
        }

        // Calculate new position based on mouse position minus the drag offset
        const newX = e.clientX - dragStart.x;
        const newY = e.clientY - dragStart.y;

        // Constrain to viewport bounds
        const currentRect = buttonRef.current?.getBoundingClientRect();
        const buttonWidth = currentRect?.width || 72;
        const buttonHeight = currentRect?.height || 72;
        const maxX = window.innerWidth - buttonWidth;
        const maxY = window.innerHeight - buttonHeight;

        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));

        const newPosition = {
          x: constrainedX,
          y: constrainedY,
        };

        setPosition(newPosition);
        positionRef.current = newPosition;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (hasDraggedRef.current) {
        // Save position to localStorage only if we actually dragged
        localStorage.setItem('chatbotPosition', JSON.stringify(positionRef.current));
      }
      // Reset hasDragged after a short delay to allow click handler to check it
      setTimeout(() => {
        setHasDragged(false);
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart, buttonRef]);

  return {
    position,
    isDragging,
    hasDragged,
    hasDraggedRef,
    handleMouseDown,
  };
}



"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

// This component applies styles and event listeners to prevent content copying.
// It is conditionally rendered based on the current route.
export default function ContentProtector() {
  const pathname = usePathname();
  const isProtected = !pathname.startsWith('/admin');

  useEffect(() => {
    if (!isProtected) return;

    const handleContextmenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleDragStart = (e: DragEvent) => e.preventDefault();

    // Apply event listeners to the document
    document.addEventListener('contextmenu', handleContextmenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('dragstart', handleDragStart);

    // Add a class to the body for CSS-based protection
    document.body.classList.add('content-protected');

    // Cleanup function to remove listeners and class when the component unmounts
    // or when the route changes to an unprotected one.
    return () => {
      document.removeEventListener('contextmenu', handleContextmenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('dragstart', handleDragStart);
      document.body.classList.remove('content-protected');
    };
  }, [isProtected]); // Re-run the effect if the `isProtected` status changes

  // This component does not render anything itself, it just applies effects.
  return null;
}

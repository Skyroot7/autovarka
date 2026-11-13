'use client';

/** Keep the existing image interaction protection in a small client boundary. */
export default function ImageProtection() {
  return (
    <div
      className="absolute inset-0 pointer-events-auto"
      onDragStart={event => event.preventDefault()}
      onContextMenu={event => event.preventDefault()}
    />
  );
}

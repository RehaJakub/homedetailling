"use client";
import { useState } from "react";

function ArrowsIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">
      <path d="M3 12h18M7 8l-4 4 4 4M17 8l4 4-4 4" />
    </svg>
  );
}

export type BeforeAfterSliderProps = {
  title: string;
  /** Short result line, e.g. "Fleky a zašlá látka → Hloubkově vyčištěno". */
  description: string;
  /** Index label in front of the title, e.g. "01". */
  number?: string;
  /** Image URLs. Without them the card paints the brand's placeholder gradients. */
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Initial divider position in percent (5–95). */
  initialPosition?: number;
};

/**
 * Dark before/after comparison card with a draggable divider.
 */
export function BeforeAfterSlider({
  title,
  description,
  number,
  beforeImage,
  afterImage,
  beforeLabel = "PŘED",
  afterLabel = "PO",
  initialPosition = 50,
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(initialPosition);

  return (
    <article className="hd-compare">
      <div className="hd-compare__image">
        <div className="hd-compare__after" style={afterImage ? { backgroundImage: `url(${afterImage})` } : undefined}>
          <span className="hd-compare__tag">{afterLabel}</span>
        </div>

        <div
          className="hd-compare__before"
          style={{
            clipPath: `inset(0 ${100 - position}% 0 0)`,
            ...(beforeImage ? { backgroundImage: `url(${beforeImage})` } : {}),
          }}
        >
          <span className="hd-compare__tag">{beforeLabel}</span>
        </div>

        <div className="hd-compare__line" style={{ left: `${position}%` }}>
          <span className="hd-compare__handle">
            <ArrowsIcon />
          </span>
        </div>

        <input
          className="hd-compare__range"
          type="range"
          min="5"
          max="95"
          value={position}
          aria-label={`Porovnání před a po – ${title}`}
          onChange={(event) => setPosition(Number(event.target.value))}
        />
      </div>

      <div className="hd-compare__text">
        <h3 className="hd-compare__title">
          {number && <span>{number}</span>}
          {title}
        </h3>
        <p className="hd-compare__description">{description}</p>
      </div>
    </article>
  );
}

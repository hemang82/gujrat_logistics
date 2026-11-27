'use client';

import { Fragment } from 'react';

interface WordFillTextProps {
  id?: string;
  text: string;
  baseColor?: string;
  className?: string;
  as?: 'p' | 'h2' | 'h3';
  wordAttr?: string;
}

/**
 * Renders ONE accessible text node (`sr-only select-none`) for screen readers & SEO
 * plus a single non-duplicated `aria-hidden` layer of word spans separated by
 * non-breaking spaces (`\u00A0` + `<wbr />`). Animating only CSS `color` avoids
 * duplicate word tokens in DOM and prevents concatenated text when copying.
 */
export function WordFillText({
  id,
  text,
  baseColor = '#B3C1C3',
  className = '',
  as: Tag = 'p',
  wordAttr = 'data-word-fill',
}: WordFillTextProps) {
  const words = text.split(' ').filter(Boolean);

  return (
    <Tag id={id} className={className}>
      <span className="sr-only select-none">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <span
              {...{ [wordAttr]: 'true' }}
              style={{ color: baseColor }}
              className="word-fill-token"
            >
              {word}
            </span>
            {index < words.length - 1 ? (
              <>
                {'\u00A0'}
                <wbr />
              </>
            ) : null}
          </Fragment>
        ))}
      </span>
    </Tag>
  );
}

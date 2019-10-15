const { html } = require('common-tags');
const webvtt = require('node-webvtt');
const fs = require('fs');
const path = require('path');

/**
 * Parse a subtitleFile of webvtt format, and generate HTML markup for it
 * @see https://github.com/osk/node-webvtt#parsing
 * @todo show a full-text version
 * @todo give a "hide timestamp" option
 */
module.exports = function({ subtitleFile }) {
  const file = fs.readFileSync(
    path.resolve('src', 'posts', subtitleFile),
    'utf8'
  );
  const parsed = webvtt.parse(file);

  /* Split to sentences, assuming English and punctuation marks */
  const asSentences = parsed.cues
    .reduce(
      (sentences, cue) => {
        console.log({ sentences, cue });
        // Trim spaces on the sides
        const segment = cue.text.trim();

        // Special case: a segment only with parenthesis.
        // Treat it as its own sentence
        const isStandaloneParenthetical =
          segment.startsWith('(') && segment.endsWith(')');

        if (isStandaloneParenthetical) {
          if (sentences[sentences.length - 1].length === 0) {
            // If at the start of the sentences, push as own segment, but do not waste a line
            sentences[sentences.length - 1].push(segment);
          } else {
            // Push as own segment
            sentences.push([segment]);
          }
          // Start a new sentence
          sentences.push([]);
          return sentences;
        }

        // Check if the last character is a full stop, exclamation mark, or question mark
        // This is silly btw and we could do something different
        const hasPuncutationMark =
          segment.endsWith('.') ||
          segment.endsWith('?') ||
          segment.endsWith('!');

        // Push the segment to the latest sentence
        sentences[sentences.length - 1].push(segment);

        // If the segment ends a sentence, then start a new sentence on the stack
        if (hasPuncutationMark) {
          sentences.push([]);
        }

        return sentences;
      },
      [[]]
    )
    // Finally, join with spaces
    // This also assumes English / languages where spaces are the separators.
    .map(sentenceSegments => sentenceSegments.join(' '));

  console.log({ asSentences });

  if (!parsed.valid) {
    throw Error(`Invalid webvtt file: ${subtitleFile}`);
  }

  return html`
    <div>
      <div
        class="pa3 vs3 bg-dark-gray br2 f4 nested-link nested-copy-line-height nested-copy-separator measure-prose "
      >
        ${
          asSentences.map(
            sentence =>
              html`
                <p class="mv0">${sentence}</p>
              `
          )
        }
      </div>
    </div>
  `;
};

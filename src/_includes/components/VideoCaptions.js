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
      <dl class="pa3 vs3 bg-dark-gray br2 lh-copy">
        ${
          parsed.cues.map(
            cue =>
              html`
                <div class="vs2">
                  <dt>
                    ${secondsToHoursMinutesSeconds(cue.start)} -
                    ${secondsToHoursMinutesSeconds(cue.end)}
                  </dt>
                  <dd class="ml0">${cue.text}</dd>
                </div>
              `
          )
        }
      </dl>
      <div class="pa3 vs3 bg-dark-gray br2 lh-copy">
        ${
          asSentences.map(
            sentence =>
              html`
                <p class="measure">${sentence}</p>
              `
          )
        }
      </div>
    </div>
  `;
};

/**
 * Format seconds like hours:minutes:seconds
 */
function secondsToHoursMinutesSeconds(seconds) {
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var seconds_ = Math.floor((seconds % 3600) % 60);

  return `${formatWithLeftzero(hours)}:${formatWithLeftzero(
    minutes
  )}:${formatWithLeftzero(seconds_)}`;
}

function formatWithLeftzero(number) {
  if (number < 10) {
    return `0${number}`;
  }
  return number;
}

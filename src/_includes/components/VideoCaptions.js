const { html } = require('common-tags');
const fs = require('fs');
const path = require('path');

/**
 * Parse a line-separated text file, and generate HTML markup for it
 * @todo: Consider timestamps
 */
module.exports = function({ transcriptFile }) {
  const file = fs.readFileSync(
    path.resolve('src', 'posts', transcriptFile),
    'utf8'
  );

  /* Split the lines in the file, and separate the speaker */
  const speakerAndSegmentList = file.split('\n').map(line => {
    // Yup, this is real :)
    const [speaker, segment] = line.split(':              ');
    return { speaker, segment };
  });

  return html`
    <div>
      <dl
        class="pa3 vs4 bg-dark-gray br2"
      >
        ${speakerAndSegmentList.map(
          ({ speaker, segment }) =>
            html`
              <div class="vs2 f4 lh-copy measure-prose">
                <dt>${speaker}</dt>
                <dd class="ml0">${segment}</dd>
              </div>
            `
        )}
      </div>
    </div>
  `;
};

import YTPlayer from 'yt-player';

// Selectors
const ID_DATA_ATTRIBUTE = 'data-youtube-video-id';
const BUTTON_CLASS = 'youtube-video-button';

// Visual states
// JS has not come in, not interactive!
const PLAYER_INACTIVE_CLS = 'youtube-video--inactive';
const BUTTON_INACTIVE_CLS = 'youtube-video-button--inactive';

// JS is in, interactive
const PLAYER_ACTIVE_CLS = 'youtube-video--active';
const BUTTON_ACTIVE_CLS = 'youtube-video-button--active';

/**
 * Component that looks for "placeholder" Youtube players on the page.
 * On click, loads the complete iframe player for the videoId specified.
 * Using yt-player allows us to deduplicate the script requests, and make
 * this process simpler from a development perspective.
 *
 * See the youtubePlayer.njk file for more reasons why we do this :)
 *
 * The structure for the selectors:
 *   <div data-youtube-video-id="">
 *     <button class="youtube-video-button">Play</button>
 *   </div>
 */
export function init() {
  const elements = document.querySelectorAll(`[${ID_DATA_ATTRIBUTE}]`);

  // Nothing to do without elements
  if (!elements) {
    return;
  }

  // Attach handlers to each element
  elements.forEach(playerEl => {
    const videoId = playerEl.getAttribute(ID_DATA_ATTRIBUTE);
    const videoButton = playerEl.getElementsByClassName(BUTTON_CLASS)[0];

    // Some basic validations
    if (!videoId) {
      console.error('Video does not have an id.');
      return;
    }
    if (!videoButton) {
      console.error(`Video with videoId ${videoId} does not have a button.`);
      return;
    }

    // If ok, add click handler to button and div
    // The div onClick is there to expan target, but the button
    // is also important for accessibility.
    const handler = getOnClickHandler(videoId, playerEl);
    playerEl.addEventListener('click', handler);

    // Enable the button and add affordances now that we are set up
    playerEl.classList.remove(PLAYER_INACTIVE_CLS);
    playerEl.classList.add(PLAYER_ACTIVE_CLS);

    videoButton.toggleAttribute('disabled');
    videoButton.classList.remove(BUTTON_INACTIVE_CLS);
    videoButton.classList.add(BUTTON_ACTIVE_CLS);
  });
}

/** On click, loads the complete iframe player for the videoId specified. */
function getOnClickHandler(videoId, playerEl) {
  // TODO: Show loading spinner, and communicate progress to AT
  return function(ev) {
    console.log('CALLED');
    // Create player and load video
    const player = new YTPlayer(playerEl, {
      width: '100%',
      height: '100%',
    });

    // Hanlde errors more gracefully
    player.on('error', err => {
      // On error, remove "playable" affordance, and show help text
      playerEl.classList.remove(PLAYER_ACTIVE_CLS, 'youtube-video');
      playerEl.classList.add('bg-near-black');
      playerEl.innerHTML = errorBox(videoId);
      console.error('Error encountered in player: ', err);
    });

    player.load(videoId);
    player.play();
  };
}

function errorBox(videoId) {
  return `
    <div class="vs3 pa3">
      <p class="mv0 f4 f3-ns fw6 lh-title">Oh no!</p>
      <p class="mv0 f5 f4-ns lh-copy measure-prose nested">
        There was an error with the player, sorry about that. Try refreshing the page, or
          <a href="https://youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer">
            watch this video directly on Youtube.
          </a>
      </p>
    </div>
  `;
}

const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const inquirer = require('inquirer');
const chalk = require('chalk');
const datepicker = require('inquirer-datepicker-prompt');

inquirer.registerPrompt('datetime', datepicker);

/**
 * Utility script that helps scaffold a post.
 * Asks about:
 *  - title
 *  - slug
 *  - datetime
 *  - Conditional
 *      - videoId
 *      - clipTimeSeconds
 *  - TODO: tags
 */
async function main() {
  // videoType: None | Full VideoId | Partial VideoId TimeMs
  let video;
  const { videoType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'videoType',
      message: 'Does the presentation have a video?',
      choices: [
        { name: 'No/Not yet', value: 'None' },
        { name: 'A segment of a video', value: 'Partial' },
        { name: 'Yes, a dedicated one', value: 'Full' },
      ],
    },
  ]);

  if (videoType === 'Partial' || videoType === 'Full') {
    const { videoUrl } = await inquirer.prompt([
      {
        type: 'input',
        message: `What is the video URL?\n${chalk.gray(
          '(e.g. https://www.youtube.com/watch?v={{s9IfY7BBh6k}})'
        )}\nYou can look them up on our Youtube channel: https://www.youtube.com/channel/UCYsID6sp60d9tgMCvnDu7Jg/videos\n>`,
        name: 'videoUrl',
        validate: input => {
          const res = getVideoIdFromUrl(input);
          if (!res.ok) {
            return res.data;
          }
          return true;
        },
      },
    ]);

    // we know videoId is ok here
    const videoId = getVideoIdFromUrl(videoUrl).data;

    if (videoType === 'Partial') {
      const { clipTime } = await inquirer.prompt([
        {
          type: 'input',
          message: `At what time does the clip start?\n${chalk.gray(
            '(The value of the slider, e.g. 22:05)'
          )}\n>`,
          name: 'clipTime',
          validate: input =>
            !!input ||
            'Clip time is required. If there is no video, select "No/Not Yet" instead.',
        },
      ]);

      const clipTimeSeconds = clipTimeToSeconds(clipTime);

      video = { id: videoId, clipTimeSeconds };
    } else {
      video = { id: videoId };
    }
  } else {
    video = {};
  }

  const { title, slug, datetime, videoId } = await inquirer.prompt([
    {
      type: 'input',
      message: `What is the title of the presentation?\n${chalk.gray(
        '(e.g. CSS Grid in production)\n>'
      )}`,
      name: 'title',
      validate: input =>
        !!input ||
        'Title is required. If in doubt, use the one from the video or check with the speaker.',
    },
    {
      type: 'input',
      message: `What is the slug for the URL?\n${chalk.gray(
        '(e.g. css-grid-in-production)\n>'
      )}`,
      name: 'slug',
      validate: input => !!input || 'Slug is required.',
    },
    {
      type: 'datetime',
      name: 'datetime',
      message: 'When was/is the presentation?',
      format: ['yyyy', '-', 'mm', '-', 'dd', ' ', 'HH', ':', 'MM'],
      validate: input =>
        !!input ||
        'Datetime is required. If in doubt about the time, just the date will do; it is not displayed atm.',
    },
  ]);

  // Make the post
  console.log(chalk.gray`Bootstrapping your blogpost...`);

  const finalDate = new Date(datetime).toISOString();

  const postContent = `---
title: '${title}'
slug: '${slug}'
date: ${finalDate}
tags:
  - post
layout: layouts/post.njk
${video.id ? `videoId: ${video.id}` : ''}
${video.clipTimeSeconds ? `clipTimeSeconds: ${video.clipTimeSeconds}` : ''}
---

<!--- You can insert a short description here -->
`;
  const postRelativePath = path.join('src', 'posts', `${slug}.md`);
  const postPath = path.resolve(process.cwd(), postRelativePath);
  fs.writeFileSync(postPath, postContent);

  console.log(
    `Done! You can edit ${chalk.cyan(
      postRelativePath
    )} to double-check or add a description.`
  );
}

main();

//
// UTIL

/** Convert clip time to seconds
 * @example clipTimeToMs('22:00') -> 1320
 */
function clipTimeToSeconds(time) {
  /**
   * Segments:
   *  - 0/Seconds: 1
   *  - 1/Minutes: 60 * 1
   *  - 2/Hours: 60 * 60 * 1
   */
  const toSeconds = {
    0: 1,
    1: 60 * 1,
    2: 60 * 60 * 1,
  };

  /**
   * Split and normalise the time by reverting the array, then sum
   */
  const seconds = time
    .split(':')
    .reverse()
    .map(i => parseInt(i))
    .map((val, i) => val * toSeconds[i])
    .reduce((acc, curr) => acc + curr, 0);

  return seconds;
}

/**
 * Pluck the videoId from a Youtube URL
 */
function getVideoIdFromUrl(urlStr) {
  try {
    const videoId = new URL(urlStr).searchParams.get('v');

    if (!videoId) {
      return { ok: false, data: 'Could not find the ?v search parameter.' };
    }

    return { ok: true, data: videoId };
  } catch (err) {
    return { ok: false, data: 'Invalid URL' };
  }
}

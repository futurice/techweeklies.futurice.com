import Perfume from "perfume.js";
import * as analytics from "./analytics";

/* The main entry point of the application */

const init = () => {
  // Load custom tracking code
  // NOTE: Could be done lazily with import(), but
  // Rollup needs some setup to get that to work.
  // It is interesting, but the code size is really
  // small atm, and the extra complications are not
  // needed :)
  analytics.init();

  // Initialise performance tracking
  const perfume = new Perfume({
    firstPaint: true,
    firstContentfulPaint: true,
    firstInputDelay: true,
    analyticsTracker: (metricName, duration) => {
      analytics.sendPerformanceMetric(metricName, duration);
    },
    debugging: true,
    warning: true
  });
};

// Start the application
init();

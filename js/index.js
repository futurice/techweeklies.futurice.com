import Perfume from "perfume.js";

/* The main entry point of the application */

const init = () => {
  // Load custom tracking code lazily, so it's non-blocking.
  import("./analytics.js").then(analytics => analytics.init());

  // Initialise performance tracking
  const perfume = new Perfume({
    firstPaint: true,
    firstContentfulPaint: true,
    firstInputDelay: true
  });
};

// Start the application
init();

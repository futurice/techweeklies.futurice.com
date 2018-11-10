import Perfume from "perfume.js";

function init() {
  const perfume = new Perfume({
    firstPaint: true,
    firstContentfulPaint: true,
    firstInputDelay: true
  });
}

init();

// Visual button states
const BUTTON_INACTIVE_CLS = "o-50";
const BUTTON_ACTIVE_UNPRESSED_CLS = "bg-accent";
const BUTTON_ACTIVE_PRESSED_CLS = "bg-light-pink";

/**
 * Button pseudo-component that will attach an onClick to a button,
 * and the `.animate-me` class to the specified targets.
 *
 * See the .logo-animation class for ways to use this.
 */
export function init(element, targets, animateMeCls) {
  // Nothing to do without an element
  if (!element || !element instanceof HTMLElement) {
    return;
  }
  console.log({ element });

  // Event listener
  const handleOnClick = ({ target: btn }) => {
    // Communicate the toggled state to assisstive technologies
    // Check to see if the button is pressed
    const isPressed = btn.getAttribute("aria-pressed") === "true";

    // Change aria-pressed to the opposite state
    btn.setAttribute("aria-pressed", !isPressed);

    // Communicate the toggled state visually
    btn.classList.toggle(BUTTON_ACTIVE_UNPRESSED_CLS);
    btn.classList.toggle(BUTTON_ACTIVE_PRESSED_CLS);

    // Change visual state to the opposite state
    const stateLabel = btn.getElementsByClassName("animate-me-button-state")[0];
    if (stateLabel) {
      stateLabel.innerText = !isPressed ? "On" : "Off";
    }

    // Set the animateMe class to each animatable element
    targets.forEach(target => {
      console.log({ target });
      target.classList.toggle(animateMeCls);
    });
  };

  // Add event listener
  element.addEventListener("click", handleOnClick);

  // Enable the button now that we are set up
  element.toggleAttribute("disabled");
  element.classList.toggle(BUTTON_INACTIVE_CLS);
}

module.exports = function(
  content,
  { href, isExternal = false, className = '' } = {}
) {
  const externalAttrs = isExternal
    ? `rel="noopener noreferrer" target="_blank"`
    : '';

  return `
    <a href="${href}" class="fg-accent-lighter focus-outline-accent-lighter hover-fg-accent-2 transition-fg focus-tdn ${className}" ${externalAttrs}>
        ${content}
    </a>`;
};

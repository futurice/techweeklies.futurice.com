module.exports = function(
  content,
  { href, isExternal = false, className = '' } = {}
) {
  const externalAttrs = isExternal
    ? `rel="noopener noreferrer" target="_blank"`
    : '';

  return `
    <a href="${href}" class="fg-accent focus-outline-accent ${className}" ${externalAttrs}>
        ${content}
    </a>`;
};

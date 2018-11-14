module.exports = function(content, { className = '' } = {}) {
  return `
    <p class="mv0 f4 lh-title ${className}">
        ${content}
    </p>`;
};

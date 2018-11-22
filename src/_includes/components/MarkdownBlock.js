module.exports = function(content, { className = '' } = {}) {
  return `
    <div class="f4 nested-link nested-copy-line-height nested-headline-line-height nested-copy-separator nested-img measure-prose ${className}">
        ${content}
    </div>`;
};

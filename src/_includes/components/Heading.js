module.exports = function(content, { level = 2, className = '' } = {}) {
  const hx = 'h' + Math.min(level, 6);
  return `
    <${hx} class="mv0 f2 f1-ns fw6 lh-title ${className}">
        ${content}
    </${hx}>`;
};

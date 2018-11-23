module.exports = function(content, { level = 2, className = '' } = {}) {
  const hx = 'h' + Math.min(level, 6);
  return `
    <${hx} class="mv0 f3 f2-ns fw6 lh-title ${className}">
        ${content}
    </${hx}>`;
};

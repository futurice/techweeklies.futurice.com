module.exports = function(content, { level = 2, className = '' } = {}) {
  const hx = `h${Math.min(6, Math.min(level, 2))}`;
  return `
    <${hx} class="mv0 f2 f1-ns fw6 lh-title ${className}">
        ${content}
    </${hx}>`;
};

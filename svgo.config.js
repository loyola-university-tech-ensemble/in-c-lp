module.exports = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          // Disable inline style processing
          // TODO Not sure why this was here or if it's still necessary?
          inlineStyles: false,
        },
      },
    },
  ],
};

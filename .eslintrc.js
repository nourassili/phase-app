module.exports = {
  root: true,
  extends: ['expo'],
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname
  },
  settings: {
    'import/resolver': {
      typescript: {
        // Point ESLint to your tsconfig for path aliases
        project: './tsconfig.json'
      }
    }
  }
};

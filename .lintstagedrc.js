module.exports = {
  // Run type-check on changes to TypeScript files
  '**/*.ts?(x)': () => 'yarn type-check',
  // Lint & Prettify TS and JS files
  '**/*.(ts|tsx|js|jsx)': (filenames) => [
    `yarn lint . ${filenames.join(' ')}`,
    `yarn prettier --write ${filenames.join(' ')}`,
    ...(filenames.some(
      (filename) =>
        filename.endsWith('.test.ts') ||
        filename.endsWith('.spec.ts') ||
        filename.endsWith('.test.js') ||
        filename.endsWith('.spec.js') ||
        filename.endsWith('.test.jsx') ||
        filename.endsWith('.test.tsx') ||
        filename.endsWith('.spec.jsx') ||
        filename.endsWith('.spec.tsx')
    )
      ? ['yarn test']
      : []),
    ...(filenames.some(
      (filename) =>
        filename.endsWith('.cy.js') ||
        filename.endsWith('.spec.ts') ||
        filename.endsWith('.cy.ts') ||
        filename.endsWith('.spec.js')
    )
      ? ['yarn e2e:headless']
      : []),
  ],
};

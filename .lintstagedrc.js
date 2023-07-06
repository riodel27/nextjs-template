const path = require('path');

module.exports = {
  // Run type-check on changes to TypeScript files
  '**/*.ts?(x)': () => 'yarn type-check',
  // Lint & Prettify TS and JS files
  '**/*.@(ts|tsx|js|jsx)!(|(d).ts)': (filenames) => {
    const filteredFilenames = filenames.filter(
      (filename) => !filename.endsWith('.json')
    );

    if (filteredFilenames.length === 0) {
      return [];
    }

    return [
      /**
        If you would like to use next lint with lint-staged to run the linter on 
        staged git files, you'll have to add the following to the 
        .lintstagedrc.js file in the root of your project in order 
        to specify usage of the --file flag.
      */
      `next lint --fix --file ${filenames
        .filter((filename) => !filename.endsWith('.json'))
        .map((f) => path.relative(process.cwd(), f))
        .join(' --file ')}`,
      `yarn prettier --write ${filenames
        .filter((filename) => !filename.endsWith('.json'))
        .join(' ')}`,
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
    ];
  },
};

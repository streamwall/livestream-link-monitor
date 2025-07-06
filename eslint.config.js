const jestPlugin = require('eslint-plugin-jest');

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'logs/**',
      'documents/**',
      '*.log',
      '.env*',
      'credentials*.json'
    ]
  },

  // Base configuration for all JavaScript files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        fetch: 'readonly',
        URL: 'readonly'
      }
    },
    rules: {
      // ES6+ and Modern JavaScript
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
      'prefer-template': 'error',
      'template-curly-spacing': ['error', 'never'],
      'object-shorthand': ['error', 'always'],
      'prefer-destructuring': ['error', {
        VariableDeclarator: {
          array: false,
          object: true
        },
        AssignmentExpression: {
          array: false,
          object: false
        }
      }],

      // Code Style
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'only-multiline'],
      'comma-spacing': ['error', { before: false, after: true }],
      'comma-style': ['error', 'last'],
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      'space-in-parens': ['error', 'never'],
      'space-before-blocks': 'error',
      'space-infix-ops': 'error',
      'space-unary-ops': ['error', { words: true, nonwords: false }],
      'keyword-spacing': 'error',
      'arrow-spacing': 'error',
      'block-spacing': 'error',
      'func-call-spacing': ['error', 'never'],
      'key-spacing': ['error', { beforeColon: false, afterColon: true }],
      'no-trailing-spaces': 'error',
      'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
      'eol-last': ['error', 'always'],
      'max-len': ['error', {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true
      }],

      // Brace Style
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'curly': ['error', 'all'],

      // Variables and Functions
      'no-unused-vars': ['error', {
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_'
      }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      'no-shadow': 'error',
      'camelcase': ['error', { properties: 'always' }],
      'new-cap': ['error', { newIsCap: true, capIsNew: false }],

      // Best Practices
      'eqeqeq': ['error', 'always'],
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-alert': 'error',
      'no-caller': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-invalid-this': 'error',
      'no-lone-blocks': 'error',
      'no-loop-func': 'error',
      'no-multi-spaces': ['error', { ignoreEOLComments: true }],
      'no-new-wrappers': 'error',
      'no-return-assign': ['error', 'except-parens'],
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-throw-literal': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
      'no-useless-call': 'error',
      'no-useless-concat': 'error',
      'wrap-iife': ['error', 'outside'],
      'yoda': 'error',

      // Error Prevention
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-duplicate-case': 'error',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-parens': ['error', 'all', { ignoreJSX: 'all' }],
      'no-extra-semi': 'error',
      'no-func-assign': 'error',
      'no-inner-declarations': 'error',
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-obj-calls': 'error',
      'no-sparse-arrays': 'error',
      'no-unreachable': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',

      // Node.js best practices (manual rules)
      'no-process-exit': 'warn',
      'no-sync': 'warn'
    }
  },

  // Test files configuration
  {
    files: ['**/*.test.js', '**/test-*.js', 'tests/**/*.js', 'test-helpers/**/*.js'],
    plugins: {
      jest: jestPlugin
    },
    languageOptions: {
      globals: {
        ...jestPlugin.environments.globals.globals,
        global: 'readonly',
        jest: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      // Relax some rules for tests
      'no-console': 'off',
      'max-len': ['error', { code: 120 }],
      'prefer-arrow-callback': 'off',

      // Jest specific rules (using safe, commonly available rules)
      'jest/no-disabled-tests': 'warn',
      'jest/no-focused-tests': 'error',
      'jest/no-identical-title': 'error',
      'jest/valid-expect': 'error',
      'jest/expect-expect': 'error',
      'jest/no-done-callback': 'error',
      'jest/no-standalone-expect': 'error'
    }
  },

  // Configuration files
  {
    files: ['*.config.js', 'config.js', 'jest.config.js', 'eslint.config.js'],
    rules: {
      'no-console': 'off'
    }
  },

  // Test and utility files
  {
    files: ['test-*.js', 'index.js'],
    rules: {
      'no-process-exit': 'off'
    }
  }
];

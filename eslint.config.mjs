import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'src/**/*', 'firestore.rules.test.ts', 'vite.config.ts'],
  },
  firebaseRulesPlugin.configs['flat/recommended'],
];

import nx from '@nx/eslint-plugin';
import baseConfig from '../../eslint.config.mjs';

export default [
	...baseConfig,
	...nx.configs['flat/react'],
	{
		ignores: ['@mf-types/**'],
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {},
	},
	{
		files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.test.ts', '**/*.test.tsx'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
];

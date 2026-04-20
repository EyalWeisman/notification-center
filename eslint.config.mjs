import nx from '@nx/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import { fixupPluginRules } from '@eslint/compat';
import jsxControlStatements from 'eslint-plugin-jsx-control-statements';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default [
	...nx.configs['flat/base'],
	...nx.configs['flat/typescript'],
	...nx.configs['flat/javascript'],
	{
		ignores: ['**/dist', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*', '**/public'],
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
		rules: {
			'@nx/enforce-module-boundaries': [
				'error',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*'],
						},
					],
				},
			],
		},
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
		// Override or add rules here
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
		},
	},
	{
		files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
		rules: {
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
	// Studio app specific configuration - relaxed rules to match webapp
	{
		files: [
			'apps/studio/**/*.ts',
			'apps/studio/**/*.tsx',
			'apps/studio/**/*.js',
			'apps/studio/**/*.jsx',
			'apps/studio/**/*.cts',
			'apps/studio/**/*.mts',
		],
		ignores: ['apps/studio/**/node_modules/**', 'apps/studio/**/*.min.js'],
		plugins: {
			'react-hooks': reactHooks,
			import: importPlugin,
			'jsx-control-statements': fixupPluginRules(jsxControlStatements),
			'jsx-a11y': jsxA11y,
		},
		rules: {
			// Core rules aligned with webapp
			'no-unused-vars': 'off',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					ignoreRestSiblings: true,
				},
			],
			'no-console': ['warn', { allow: ['error', 'warn'] }],
			'react-hooks/exhaustive-deps': 'warn',
			'import/no-unresolved': 'off',
			'no-irregular-whitespace': 'warn',
			'jsx-a11y/anchor-is-valid': 'warn',
			'no-unsafe-optional-chaining': 'warn',
			'no-ex-assign': 'warn',
			'@typescript-eslint/no-this-alias': 'warn',
			'@typescript-eslint/triple-slash-reference': 'warn',
			'@nx/enforce-module-boundaries': [
				'warn',
				{
					enforceBuildableLibDependency: true,
					allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$'],
					depConstraints: [
						{
							sourceTag: '*',
							onlyDependOnLibsWithTags: ['*'],
						},
					],
				},
			],

			// Additional rules that show up as errors - set to warn
			'@typescript-eslint/ban-ts-comment': [
				'warn',
				{
					'ts-expect-error': 'allow-with-description',
					'ts-ignore': true,
					'ts-nocheck': true,
					'ts-check': false,
					minimumDescriptionLength: 3,
				},
			],

			'@typescript-eslint/switch-exhaustiveness-check': 'off',
			'@typescript-eslint/no-non-null-assertion': 'warn',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-expressions': 'warn',
			'@typescript-eslint/no-empty-function': 'warn',
			'@typescript-eslint/no-empty-object-type': 'warn',
			'@typescript-eslint/no-empty-interface': 'warn',
			'@typescript-eslint/no-inferrable-types': 'off',
			'@typescript-eslint/no-unsafe-function-type': 'warn',
			'@typescript-eslint/no-unnecessary-type-constraint': 'warn',
			'@typescript-eslint/prefer-as-const': 'warn',
			'@typescript-eslint/no-unsafe-declaration-merging': 'warn',
			'@typescript-eslint/no-duplicate-enum-values': 'warn',
			'@typescript-eslint/no-wrapper-object-types': 'warn',
			'@typescript-eslint/no-namespace': 'warn',
			'@typescript-eslint/ban-ts-comment': 'warn',

			'prefer-const': 'warn',
			'no-var': 'warn',
			'no-extra-boolean-cast': 'warn',
			'no-prototype-builtins': 'warn',
			'no-case-declarations': 'warn',
			'prefer-rest-params': 'warn',
			'no-async-promise-executor': 'warn',
			'no-unused-private-class-members': 'warn',
			'no-empty': 'warn',
			'no-constant-binary-expression': 'warn',
			'valid-typeof': 'warn',
			'no-self-assign': 'warn',
			'no-useless-catch': 'warn',
			'no-useless-escape': 'warn',
			'no-redeclare': 'warn',
			eqeqeq: 'warn',
			'default-case': 'warn',
			'no-throw-literal': 'warn',
		},
	},
	{
		files: ['**/rsbuild.config.ts', '**/rslib.config.ts'],
		rules: {
			'@nx/enforce-module-boundaries': 'off',
		},
	},
];

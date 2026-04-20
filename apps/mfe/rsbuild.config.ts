import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { getRemoteSharedPackages } from '@riversidefm/rsbuild-shared-config';

// Run with STANDALONE=true for local development without Shell
const isStandalone = process.env.STANDALONE === 'true';

export default defineConfig({
	html: {
		template: './src/index.html',
	},
	plugins: [
		pluginReact(),
		pluginModuleFederation(
			{
				name: 'mfe',
				// to prevent memory leak in dev mode on each hot reload
				dts: process.env.NODE_ENV !== 'development',
				exposes: {
					'./App': './src/app/app.tsx',
					'./Widget': './src/widget/widget.tsx',
				},
				shared: getRemoteSharedPackages({ standalone: isStandalone }),
			},
			{}
		),
	],

	source: {
		entry: {
			index: './src/main.tsx',
		},
		tsconfigPath: './tsconfig.app.json',
	},
	server: {
		port: 4300,
	},
	output: {
		copy: [{ from: './src/favicon.ico' }, { from: './src/assets' }, { from: './micro-frontend.json' }],
		// CRITICAL: Must be 'auto' for Module Federation to work correctly
		assetPrefix: 'auto',
		// Enable asset filename hashing for better caching
		filenameHash: true,
		target: 'web',
		// Source maps configuration
		sourceMap: {
			js: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',
			css: false,
		},
		distPath: {
			root: 'dist',
		},
	},
});

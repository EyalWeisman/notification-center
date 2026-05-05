import { pluginReact } from '@rsbuild/plugin-react';
import { pluginModuleFederation } from '@module-federation/rsbuild-plugin';
import { defineConfig } from '@rsbuild/core';
import { getRemoteSharedPackages } from '@riversidefm/rsbuild-shared-config';

const isStandalone = process.env.STANDALONE === 'true';

export default defineConfig({
	html: {
		template: './src/index.html',
	},
	plugins: [
		pluginReact(),
		pluginModuleFederation(
			{
				name: 'notification_center',
				dts: process.env.NODE_ENV !== 'development',
				exposes: {
					'./NotificationBell': './src/components/NotificationBell/index.ts',
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
		port: 4007,
	},
	output: {
		copy: [{ from: './micro-frontend.json' }],
		assetPrefix: 'auto',
		filenameHash: true,
		target: 'web',
		sourceMap: {
			js: process.env.NODE_ENV === 'production' ? 'source-map' : 'cheap-module-source-map',
			css: false,
		},
		distPath: {
			root: 'dist',
		},
	},
});

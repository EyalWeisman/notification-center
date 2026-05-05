const EnvVarPrefix = 'REACT_APP_';

function getEnvVar(key: string, fallback = ''): string {
	return import.meta.env[key] ?? import.meta.env[`VITE_${key}`] ?? fallback;
}

const Config = {
	supergraph: {
		url: getEnvVar(`${EnvVarPrefix}SUPERGRAPH_URL`, 'https://dev.riverside.fm/graphql'),
	},
};

export default Config;

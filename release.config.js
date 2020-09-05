module.exports = {
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/git",
			{
				assets: ["dist/**/*.{js}", "package.json"],
				message:
					"chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
			}
		],
		[
			"@semantic-release/github",
			{
				assets: ["dist/**/*.{js}", "package.json"]
			}
		],
		"@semantic-release/npm"
	]
};

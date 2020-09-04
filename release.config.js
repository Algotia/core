module.exports = {
	plugins: [
		"@semantic-release/commit-analyzer",
		"@semantic-release/release-notes-generator",
		[
			"@semantic-release/git",
			{
				assets: ["dist/**/*.{js,css}", "docs", "package.json"],
				message:
					"chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
			}
		],
		[
			"@semantic-release/github",
			{
				assets: [
					{ path: "dist/asset.min.css", label: "CSS distribution" },
					{ path: "dist/asset.min.js", label: "JS distribution" }
				]
			}
		]
	]
};

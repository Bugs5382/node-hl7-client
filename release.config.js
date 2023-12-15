module.exports = {
    "branches": [
        "main",
        { name: 'develop', prerelease: 'beta' }
    ],
    "verifyConditions": ['@semantic-release/changelog', '@semantic-release/npm', '@semantic-release/git'],
    "plugins": [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        [
            '@semantic-release/changelog',
            {
                "changelogFile": "CHANGELOG.md"
            }
        ], [
            "@semantic-release/git",
            {
                "assets": ["package.json", "CHANGELOG.md"],
                "message": "chore(release): ${nextRelease.version} [ci skip]\n\n${nextRelease.notes}"
            }
        ],
        "@semantic-release/github",
        "@semantic-release/npm"
    ]
}

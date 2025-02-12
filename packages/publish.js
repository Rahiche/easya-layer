#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(query) {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
}

async function main() {
    try {
        // Get package name and version from command line arguments
        const packageName = process.argv[2];
        const newVersion = process.argv[3];

        if (!packageName || !newVersion) {
            console.error('Usage: node publish.js <package-name> <version>');
            process.exit(1);
        }

        // Validate package exists
        const packagePath = path.join(process.cwd(), packageName, 'package.json');
        if (!fs.existsSync(packagePath)) {
            console.error(`Package ${packageName} not found`);
            process.exit(1);
        }

        // Read and parse package.json
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

        // Validate version format (simple semver check)
        const semverRegex = /^\d+\.\d+\.\d+$/;
        if (!semverRegex.test(newVersion)) {
            console.error('Invalid version format. Please use semver (e.g., 1.0.0)');
            process.exit(1);
        }

        // Update package.json version
        packageJson.version = newVersion;
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

        // Check for uncommitted changes
        const status = execSync('git status --porcelain').toString();
        if (status) {
            const answer = await question('There are uncommitted changes. Do you want to commit them? (y/n): ');
            if (answer.toLowerCase() === 'y') {
                execSync('git add .');
                const commitMessage = `chore: bump ${packageName} to version ${newVersion}`;
                execSync(`git commit -m "${commitMessage}"`);
                console.log(`Committed changes with message: ${commitMessage}`);
            } else {
                console.log('Please commit your changes before creating a tag');
                process.exit(1);
            }
        }

        // Push commits to remote
        try {
            console.log('Pushing commits to remote...');
            execSync('git push');
        } catch (error) {
            console.error('Failed to push commits to remote:', error.message);
            process.exit(1);
        }

        // Create git tag
        const tagName = `${packageName}@${newVersion}`;

        try {
            // Check if tag exists
            execSync(`git tag -l ${tagName}`, { stdio: 'pipe' });
            const tagExists = execSync(`git tag -l ${tagName}`).toString().trim() === tagName;

            if (tagExists) {
                const answer = await question(`Tag ${tagName} already exists. Do you want to remove it? (y/n): `);

                if (answer.toLowerCase() === 'y') {
                    // Remove local tag
                    execSync(`git tag -d ${tagName}`);
                    // Remove remote tag
                    execSync(`git push origin :refs/tags/${tagName}`);
                    console.log(`Removed existing tag ${tagName}`);
                } else {
                    console.log('Operation cancelled');
                    process.exit(0);
                }
            }

            // Create and push new tag
            execSync(`git tag ${tagName}`);
            execSync(`git push origin ${tagName}`);
            console.log(`Successfully created and pushed tag ${tagName}`);

        } catch (error) {
            console.error('Error handling git tags:', error.message);
            process.exit(1);
        }

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    } finally {
        rl.close();
    }
}

main();
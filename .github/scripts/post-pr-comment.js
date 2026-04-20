#!/usr/bin/env node

const fs = require('fs');

/**
 * Generates a PR comment with deployment information
 * @param {Object} deployments - Map of MFE name to deployment info
 * @param {number} prNumber - PR number
 * @returns {string} - Markdown comment content
 */
function generateComment(deployments, prNumber) {
  const mfeList = Object.entries(deployments);

  if (mfeList.length === 0) {
    return '## 📦 No MFE changes detected\n\nThis PR does not affect any microfrontends.';
  }

  let comment = '## 🚀 Preview Deployment Ready!\n\n';
  comment += 'Your changes have been deployed to the preview environment.\n\n';

  // List deployed MFEs
  comment += '**Deployed MFEs:**\n';
  mfeList.forEach(([mfe, info]) => {
    comment += `- **${mfe}**: \`pr-${prNumber}\`\n`;
  });

  // Testing instructions
  comment += '\n**To test your changes:**\n';
  comment += '1. Open the browser console\n';
  comment += '2. Run the following command:\n';
  comment += '```javascript\n';
  comment += "localStorage.setItem('mfe-version-override', JSON.stringify({\n";

  mfeList.forEach(([mfe], index) => {
    comment += `  ${mfe}: 'pr-${prNumber}'${
      index < mfeList.length - 1 ? ',' : ''
    }\n`;
  });

  comment += '}));\n';
  comment += '```\n';
  comment += '3. Refresh the page\n\n';

  // Direct URLs
  comment +=
    '**Direct access:**\n // TODO: complete direct URLs with applied overrides\n';
  // const cdnDomain = process.env.S3_BUCKET_NAME || 'app.riverside.fm';
  // mfeList.forEach(([mfe]) => {
  //   const url = `https://${cdnDomain}/mfe/${mfe}/pr-${prNumber}/remoteEntry.js`;
  //   comment += `- ${mfe}: ${url}\n`;
  // });

  comment += '\n---\n';
  comment += '*🤖 Posted by Riverside Quantum CI/CD*\n';

  return comment;
}

/**
 * Formats deployment data for the comment
 * @param {string} deploymentData - JSON string of deployment results
 * @returns {Object} - Formatted deployment map
 */
function parseDeployments(deploymentData) {
  try {
    const data = JSON.parse(deploymentData);
    const deployments = {};

    // Handle both single deployment and array of deployments
    const deploymentArray = Array.isArray(data) ? data : [data];

    deploymentArray.forEach((deployment) => {
      if (deployment.mfeName) {
        deployments[deployment.mfeName] = {
          version: deployment.version,
          url: deployment.url,
          s3Path: deployment.s3Path,
        };
      }
    });

    return deployments;
  } catch (error) {
    console.error('Failed to parse deployment data:', error);
    return {};
  }
}

// CLI usage
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('Usage: post-pr-comment.js <prNumber> <deploymentData>');
    process.exit(1);
  }

  const prNumber = args[0];
  const deploymentData = args[1];

  const deployments = parseDeployments(deploymentData);
  const comment = generateComment(deployments, prNumber);

  // Output the comment for GitHub Actions to use
  if (process.env.GITHUB_OUTPUT) {
    // Write to output file (GitHub Actions will read this)
    fs.appendFileSync(
      process.env.GITHUB_OUTPUT,
      `comment<<EOF\n${comment}\nEOF\n`
    );
  } else {
    // For local testing
    console.log(comment);
  }
}

module.exports = { generateComment, parseDeployments };

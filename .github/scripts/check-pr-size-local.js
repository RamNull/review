// Local test version of check-pr-size.js
// Usage: node .github/scripts/check-pr-size-local.js [additions] [deletions]
// Example: node .github/scripts/check-pr-size-local.js 150 50

const core = require('@actions/core');

// Get command line arguments or use default test values
const args = process.argv.slice(2);
const additions = parseInt(args[0]) || 100; // Default test value
const deletions = parseInt(args[1]) || 50;  // Default test value

console.log(`Testing PR size check with:`);
console.log(`Additions: ${additions}`);
console.log(`Deletions: ${deletions}`);
console.log('---');

const totalChanges = additions + deletions;

let sizeLabel = '';
let sizeComment = '';

if (totalChanges < 50) {
  sizeLabel = 'size/XS';
  sizeComment = '✅ This is a very small PR. Great for quick reviews!';
} else if (totalChanges < 200) {
  sizeLabel = 'size/S';
  sizeComment = '✅ This is a small PR. Should be easy to review.';
} else if (totalChanges < 500) {
  sizeLabel = 'size/M';
  sizeComment = '⚠️ This is a medium-sized PR. Consider breaking it into smaller PRs.';
} else if (totalChanges < 1000) {
  sizeLabel = 'size/L';
  sizeComment = '⚠️ This is a large PR. Please consider breaking it into smaller, focused PRs.';
} else {
  sizeLabel = 'size/XL';
  sizeComment = '🚨 This is a very large PR. Please break it into smaller PRs.';
}

console.log(`Total changes: ${totalChanges}`);
console.log(`Size label: ${sizeLabel}`);
console.log(`Size comment: ${sizeComment}`);

// In a real GitHub Actions environment, these would set workflow outputs
// For local testing, we'll just log what would be set
console.log('---');
console.log('Would set GitHub Actions outputs:');
console.log(`size_label: ${sizeLabel}`);
console.log(`size_comment: ${sizeComment}`);

// Uncomment these lines if you want to test the actual core.setOutput functionality
// core.setOutput('size_label', sizeLabel);
// core.setOutput('size_comment', sizeComment);
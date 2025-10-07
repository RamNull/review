const additions = parseInt('${{ steps.pr-details.outputs.additions }}');
const deletions = parseInt('${{ steps.pr-details.outputs.deletions }}');
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

core.setOutput('size_label', sizeLabel);
core.setOutput('size_comment', sizeComment);

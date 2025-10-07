(async () => {
  const sizeLabel = '${{ steps.check-size.outputs.size_label }}';
  
  await github.rest.issues.addLabels({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: context.issue.number,
    labels: [sizeLabel]
  });
})();
const filesCount = parseInt('${{ steps.pr-details.outputs.files_count }}');
const additions = parseInt('${{ steps.pr-details.outputs.additions }}');
const deletions = parseInt('${{ steps.pr-details.outputs.deletions }}');
const sizeComment = '${{ steps.check-size.outputs.size_comment }}';

const reviewComment = `## 🤖 Automated PR Review

### PR Statistics
- **Files changed:** ${filesCount}
- **Lines added:** +${additions}
- **Lines deleted:** -${deletions}
- **Total changes:** ${additions + deletions}

### Size Assessment
${sizeComment}

### Checklist
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation updated (if needed)
- [ ] All CI checks pass
- [ ] PR reviewed by a team member

---
*This is an automated review. Please reach out to maintainers if you have questions.*`;

await github.rest.issues.createComment({
  owner: context.repo.owner,
  repo: context.repo.repo,
  issue_number: context.issue.number,
  body: reviewComment
});

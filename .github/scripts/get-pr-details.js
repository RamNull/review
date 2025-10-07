const { data: pr } = await github.rest.pulls.get({
  owner: context.repo.owner,
  repo: context.repo.repo,
  pull_number: context.issue.number
});

const { data: files } = await github.rest.pulls.listFiles({
  owner: context.repo.owner,
  repo: context.repo.repo,
  pull_number: context.issue.number
});

core.setOutput('title', pr.title);
core.setOutput('body', pr.body || '');
core.setOutput('files_count', files.length);
core.setOutput('additions', pr.additions);
core.setOutput('deletions', pr.deletions);

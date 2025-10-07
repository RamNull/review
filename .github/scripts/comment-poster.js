/**
 * Posts review comments to GitHub pull requests.
 * Handles the formatting and submission of code review feedback.
 */

export async function postReviewComments(octokit, owner, repo, prNumber, commitSha, comments) {
  if (comments.length === 0) {
    return;
  }

  try {
    // Create a review with all comments
    const reviewComments = comments.map(comment => ({
      path: comment.path,
      position: comment.position,
      body: comment.body,
    }));

    await octokit.rest.pulls.createReview({
      owner,
      repo,
      pull_number: prNumber,
      commit_id: commitSha,
      event: 'COMMENT',
      comments: reviewComments,
    });

    console.log(`Successfully posted ${comments.length} review comments`);
  } catch (error) {
    console.error('Error posting review comments:', error.message);
    
    // Fallback: Try to post as individual comments if batch fails
    console.log('Attempting to post comments individually...');
    
    for (const comment of comments) {
      try {
        await octokit.rest.pulls.createReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          commit_id: commitSha,
          path: comment.path,
          position: comment.position,
          body: comment.body,
        });
      } catch (individualError) {
        console.error(`Failed to post comment for ${comment.path}:`, individualError.message);
      }
    }
  }
}

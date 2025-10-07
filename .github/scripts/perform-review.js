import * as core from '@actions/core';
import * as github from '@actions/github';
import { analyzeCode } from './review-analyzer.js';
import { postReviewComments } from './comment-poster.js';

async function performReview() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const prNumber = parseInt(process.env.PR_NUMBER);
    const [owner, repo] = process.env.REPOSITORY.split('/');

    if (!token || !prNumber || !owner || !repo) {
      throw new Error('Missing required environment variables');
    }

    const octokit = github.getOctokit(token);

    console.log(`Starting review for PR #${prNumber} in ${owner}/${repo}`);

    // Get PR details and files changed
    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner,
      repo,
      pull_number: prNumber,
    });

    const { data: files } = await octokit.rest.pulls.listFiles({
      owner,
      repo,
      pull_number: prNumber,
    });

    console.log(`Found ${files.length} files changed in this PR`);

    // Analyze each file for potential issues
    const reviewComments = [];
    
    for (const file of files) {
      if (file.status === 'removed') {
        continue;
      }

      console.log(`Analyzing file: ${file.filename}`);
      
      const fileReviewComments = await analyzeCode(
        file.filename,
        file.patch,
        file.blob_url
      );

      reviewComments.push(...fileReviewComments);
    }

    // Post review comments
    if (reviewComments.length > 0) {
      console.log(`Posting ${reviewComments.length} review comments`);
      await postReviewComments(
        octokit,
        owner,
        repo,
        prNumber,
        pullRequest.head.sha,
        reviewComments
      );
      console.log('Review comments posted successfully');
    } else {
      console.log('No issues found - code looks good!');
      
      // Post a positive review comment
      await octokit.rest.issues.createComment({
        owner,
        repo,
        issue_number: prNumber,
        body: '✅ Automated review complete - no issues found. Code looks good!',
      });
    }

    console.log('Review completed successfully');
  } catch (error) {
    core.setFailed(`Review failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

performReview();

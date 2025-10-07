import * as core from '@actions/core';
import * as github from '@actions/github';
import { analyzeResponse, shouldResolveComment } from './response-analyzer.js';

async function handleResponse() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const commentId = parseInt(process.env.COMMENT_ID);
    const commentBody = process.env.COMMENT_BODY;
    const prNumber = parseInt(process.env.PR_NUMBER);
    const [owner, repo] = process.env.REPOSITORY.split('/');
    const commentUser = process.env.COMMENT_USER;

    if (!token || !commentId || !commentBody || !prNumber || !owner || !repo) {
      throw new Error('Missing required environment variables');
    }

    const octokit = github.getOctokit(token);

    console.log(`Analyzing response from ${commentUser} on PR #${prNumber}`);

    // Get the comment thread to understand context
    let reviewComment;
    try {
      const { data } = await octokit.rest.pulls.getReviewComment({
        owner,
        repo,
        comment_id: commentId,
      });
      reviewComment = data;
    } catch (error) {
      console.log('Not a review comment, checking issue comments...');
      // It might be a regular issue comment
      const { data } = await octokit.rest.issues.getComment({
        owner,
        repo,
        comment_id: commentId,
      });
      reviewComment = data;
    }

    // Analyze the response
    const analysis = analyzeResponse(commentBody, reviewComment);

    console.log(`Response type: ${analysis.type}`);
    console.log(`Sentiment: ${analysis.sentiment}`);

    let responseBody = '';

    if (analysis.type === 'question') {
      // Committer is asking a question
      responseBody = generateQuestionResponse(commentBody, analysis);
      
      await octokit.rest.pulls.createReplyForReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        comment_id: reviewComment.id,
        body: responseBody,
      });
      
      console.log('Posted answer to committer question');
    } else if (analysis.type === 'defense') {
      // Committer is defending their change
      const shouldResolve = shouldResolveComment(commentBody, analysis);
      
      if (shouldResolve) {
        responseBody = generateResolutionResponse(commentBody, analysis);
        
        await octokit.rest.pulls.createReplyForReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          comment_id: reviewComment.id,
          body: responseBody,
        });

        // Try to resolve the conversation if possible
        try {
          await octokit.rest.pulls.updateReviewComment({
            owner,
            repo,
            comment_id: reviewComment.id,
            body: reviewComment.body + '\n\n✅ **Resolved**: The committer\'s explanation is valid.',
          });
        } catch (resolveError) {
          console.log('Could not update comment, but response was posted');
        }
        
        console.log('Resolved comment based on valid defense');
      } else {
        responseBody = generateCounterResponse(commentBody, analysis);
        
        await octokit.rest.pulls.createReplyForReviewComment({
          owner,
          repo,
          pull_number: prNumber,
          comment_id: reviewComment.id,
          body: responseBody,
        });
        
        console.log('Posted counter-response to defense');
      }
    } else if (analysis.type === 'acknowledgment') {
      // Committer acknowledged the feedback
      console.log('Committer acknowledged the review feedback');
      
      responseBody = '👍 Thank you for addressing this feedback!';
      
      await octokit.rest.pulls.createReplyForReviewComment({
        owner,
        repo,
        pull_number: prNumber,
        comment_id: reviewComment.id,
        body: responseBody,
      });
    }

    console.log('Response handling completed successfully');
  } catch (error) {
    core.setFailed(`Failed to handle response: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

function generateQuestionResponse(commentBody, analysis) {
  const lowerComment = commentBody.toLowerCase();
  
  if (lowerComment.includes('why') || lowerComment.includes('reason')) {
    return `This suggestion is made to improve code quality, maintainability, or security. The specific concern is highlighted in the original review comment. If you need more clarification on any particular point, please let me know!`;
  } else if (lowerComment.includes('how')) {
    return `Here's how you can address this:\n\n1. Review the suggested change in the comment above\n2. Apply the recommended pattern or approach\n3. Test the change to ensure it works as expected\n\nIf you need specific code examples or further guidance, please ask!`;
  } else if (lowerComment.includes('alternative') || lowerComment.includes('better way')) {
    return `The approach suggested in the review comment is considered a best practice. However, if you have a specific alternative in mind that addresses the same concerns, please share it and I'll be happy to review it!`;
  } else {
    return `Good question! ${analysis.keyPoints.length > 0 ? 'The main concern here is: ' + analysis.keyPoints[0] : 'Please refer to the review comment above for details.'} Feel free to ask for more specific guidance if needed.`;
  }
}

function generateResolutionResponse(commentBody, analysis) {
  return `✅ Thank you for the explanation! Your reasoning is valid:\n\n${analysis.keyPoints.map(point => `• ${point}`).join('\n')}\n\nThis addresses the concern raised in the review. Marking this as resolved.`;
}

function generateCounterResponse(commentBody, analysis) {
  return `I understand your perspective, but I'd like to clarify:\n\n${analysis.concerns.map(concern => `• ${concern}`).join('\n')}\n\nThe original suggestion still stands as it addresses important concerns about code quality, security, or maintainability. If you have additional context that I'm missing, please share it!`;
}

handleResponse();

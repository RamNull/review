# Copilot Code Review Workflow

This directory contains the automated code review system using GitHub Copilot/Actions.

## Overview

The workflow automatically reviews pull requests and intelligently handles committer responses to review comments.

## Architecture

The system follows a **separation of concerns** design pattern:

### Workflow Files
- `copilot-review.yml` - Main workflow orchestration (minimal logic)

### Scripts (Business Logic)
1. **perform-review.js** - Entry point for code review process
2. **review-analyzer.js** - Core review logic and code analysis
3. **comment-poster.js** - Handles posting review comments to GitHub
4. **handle-response.js** - Entry point for handling committer responses
5. **response-analyzer.js** - Analyzes committer responses (questions, defenses, acknowledgments)

## Features

### 1. Automated Code Review
- Analyzes code changes in pull requests
- Checks for:
  - Security vulnerabilities (hardcoded credentials, SQL injection, etc.)
  - Code quality issues (empty catch blocks, console.log statements, etc.)
  - Best practices (logging frameworks, strict equality, etc.)
  - Code style (line length, complexity, etc.)

### 2. Intelligent Response Handling

#### When Committer Asks a Question
- Detects questions in responses (using '?', 'why', 'how', etc.)
- Provides helpful answers based on the context
- Offers guidance on how to address the issue

#### When Committer Defends Their Change
- Analyzes the defense for validity
- Checks for:
  - Technical justifications (performance, compatibility, etc.)
  - Code examples or references
  - Sufficient detail and reasoning
- **Resolves the comment** if the defense is valid and well-reasoned
- Provides counter-response if the defense is insufficient

#### When Committer Acknowledges
- Recognizes acknowledgment keywords ('thanks', 'will fix', etc.)
- Posts a positive confirmation response

## Workflow Triggers

### Code Review
- Triggered on: `pull_request` (opened, synchronize)
- Reviews all changed files in the PR

### Response Handling
- Triggered on: `pull_request_review_comment` (created)
- Triggered on: `issue_comment` (created, only for PR comments)
- Only processes comments from non-bot users

## Configuration

### Required Secrets
- `GITHUB_TOKEN` - Automatically provided by GitHub Actions

### Environment Variables
The workflow automatically sets:
- `PR_NUMBER` - Pull request number
- `REPOSITORY` - Repository name (owner/repo)
- `COMMENT_ID` - Comment ID for responses
- `COMMENT_BODY` - Content of the comment
- `COMMENT_USER` - User who made the comment

## How It Works

### Review Flow
```
PR Created/Updated
    ↓
Checkout Code
    ↓
Install Dependencies
    ↓
Analyze Changed Files
    ↓
Detect Issues
    ↓
Post Review Comments
```

### Response Flow
```
Committer Responds to Review
    ↓
Analyze Response Type
    ↓
┌─────────────┬─────────────┬──────────────┐
│  Question   │   Defense   │Acknowledgment│
└─────────────┴─────────────┴──────────────┘
      ↓             ↓              ↓
  Answer      Validate      Confirm
              Defense      Receipt
                 ↓
           Valid? Yes → Resolve
                  No  → Counter
```

## Separation of Concerns

### Why Separate Scripts?

1. **Maintainability** - Each script has a single, clear responsibility
2. **Testability** - Individual modules can be tested in isolation
3. **Reusability** - Logic can be reused across different workflows
4. **Readability** - Workflow YAML remains clean and declarative
5. **Extensibility** - Easy to add new features or modify existing logic

### Script Responsibilities

| Script | Responsibility |
|--------|---------------|
| `perform-review.js` | Orchestrates the review process |
| `review-analyzer.js` | Contains all code analysis rules |
| `comment-poster.js` | Handles GitHub API for posting comments |
| `handle-response.js` | Orchestrates response handling |
| `response-analyzer.js` | Contains all response analysis logic |

## Extending the System

### Adding New Review Rules

Edit `review-analyzer.js` and add checks in the `checkForIssues()` function:

```javascript
// Example: Add a new check
if (someCondition) {
  issues.push({
    severity: 'medium',
    message: '📝 Your custom message here',
  });
}
```

### Adding New Response Types

Edit `response-analyzer.js` and add detection logic in the `analyzeResponse()` function:

```javascript
// Example: Add a new response type
const customIndicators = ['keyword1', 'keyword2'];
if (customIndicators.some(indicator => lowerBody.includes(indicator))) {
  type = 'custom_type';
}
```

## Best Practices

1. **Keep workflow YAML minimal** - Only orchestration logic
2. **Put business logic in scripts** - Easier to maintain and test
3. **Use meaningful variable names** - Make code self-documenting
4. **Add comments for complex logic** - Help future maintainers
5. **Handle errors gracefully** - Provide useful error messages

## Testing

To test the workflow:

1. Create a pull request with code changes
2. Wait for the automated review
3. Respond to a review comment with:
   - A question: "Why is this needed?"
   - A defense: "This is necessary because..."
   - An acknowledgment: "Thanks, will fix!"
4. Observe the automated responses

## Troubleshooting

### Review not triggering
- Check workflow file syntax
- Verify GitHub Actions is enabled for the repository
- Check workflow permissions

### Comments not posting
- Verify `GITHUB_TOKEN` has write permissions
- Check API rate limits
- Review error logs in Actions tab

### Response handler not working
- Ensure comment is on a pull request
- Verify the comment is not from a bot
- Check event payload in Actions logs

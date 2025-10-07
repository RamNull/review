# System Architecture and Workflow Diagram

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GitHub Actions Workflow                       │
│                   (copilot-review.yml)                          │
└─────────────────────────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌─────────────────────┐
        │   Review Job      │     │  Response Handler   │
        │                   │     │       Job           │
        └───────────────────┘     └─────────────────────┘
                    │                         │
                    ▼                         ▼
        ┌───────────────────┐     ┌─────────────────────┐
        │ perform-review.js │     │  handle-response.js │
        └───────────────────┘     └─────────────────────┘
                    │                         │
        ┌───────────┴───────────┐ ┌──────────┴──────────┐
        │                       │ │                     │
        ▼                       ▼ ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────────┐
│review-       │      │comment-      │      │response-         │
│analyzer.js   │      │poster.js     │      │analyzer.js       │
└──────────────┘      └──────────────┘      └──────────────────┘
```

## Workflow Execution Flow

### 1. Code Review Flow (On PR Create/Update)

```
┌─────────────────┐
│ PR Opened/      │
│ Updated         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Trigger: pull_request event         │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Job: review-code                    │
│ 1. Checkout repository              │
│ 2. Setup Node.js                    │
│ 3. Install dependencies             │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Script: perform-review.js           │
│ • Get PR details via GitHub API     │
│ • Fetch changed files               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Script: review-analyzer.js          │
│ • Parse file patches                │
│ • Check for security issues         │
│ • Check for code quality problems   │
│ • Check for best practice violations│
│ • Generate review comments          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Script: comment-poster.js           │
│ • Format review comments            │
│ • Post as PR review via GitHub API  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ Review Comments │
│ Posted on PR    │
└─────────────────┘
```

### 2. Response Handling Flow (On Comment Reply)

```
┌─────────────────┐
│ Developer       │
│ Comments on     │
│ Review          │
└────────┬────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Trigger: pull_request_review_comment   │
│    OR   issue_comment (on PR)          │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Filter: Only non-bot users             │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Job: handle-review-response            │
│ 1. Checkout repository                 │
│ 2. Setup Node.js                       │
│ 3. Install dependencies                │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Script: handle-response.js             │
│ • Get comment details                  │
│ • Retrieve comment thread context      │
└────────┬───────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────┐
│ Script: response-analyzer.js           │
│ • Detect response type:                │
│   - Question                           │
│   - Defense                            │
│   - Acknowledgment                     │
│ • Analyze sentiment                    │
│ • Extract key points                   │
│ • Calculate validity score             │
└────────┬───────────────────────────────┘
         │
    ┌────┴────┬──────────────┬──────────┐
    │         │              │          │
    ▼         ▼              ▼          ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐
│Question│ │Defense │ │Defense   │ │Acknow-  │
│        │ │(Valid) │ │(Invalid) │ │ledgment │
└───┬────┘ └───┬────┘ └────┬─────┘ └────┬────┘
    │          │            │            │
    ▼          ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌──────────┐ ┌─────────┐
│Answer  │ │Resolve │ │Counter   │ │Positive │
│Question│ │Comment │ │Response  │ │Confirm  │
└───┬────┘ └───┬────┘ └────┬─────┘ └────┬────┘
    │          │            │            │
    └──────────┴────────────┴────────────┘
                     │
                     ▼
            ┌────────────────┐
            │ Reply Posted   │
            │ via GitHub API │
            └────────────────┘
```

## Module Responsibilities

### 1. Workflow Orchestration (`copilot-review.yml`)
- **Purpose**: Define when and how jobs run
- **Responsibilities**:
  - Listen to GitHub events (PR, comments)
  - Setup execution environment
  - Pass context to scripts
  - No business logic

### 2. Review Orchestration (`perform-review.js`)
- **Purpose**: Coordinate the review process
- **Responsibilities**:
  - Fetch PR and file data
  - Coordinate analysis
  - Handle errors
  - Delegate to specialized modules

### 3. Code Analysis (`review-analyzer.js`)
- **Purpose**: Analyze code for issues
- **Responsibilities**:
  - Parse diff patches
  - Apply review rules
  - Generate issue descriptions
  - Pure logic, no GitHub API calls

### 4. Comment Posting (`comment-poster.js`)
- **Purpose**: Post comments to GitHub
- **Responsibilities**:
  - Format comments for GitHub API
  - Handle batch posting
  - Fallback to individual comments
  - All GitHub write operations

### 5. Response Orchestration (`handle-response.js`)
- **Purpose**: Coordinate response handling
- **Responsibilities**:
  - Fetch comment context
  - Generate appropriate responses
  - Delegate analysis
  - Handle different response types

### 6. Response Analysis (`response-analyzer.js`)
- **Purpose**: Understand developer responses
- **Responsibilities**:
  - Classify response type
  - Analyze sentiment
  - Extract key points
  - Calculate validity scores
  - Determine resolution criteria

## Data Flow

```
GitHub Event
    │
    ▼
Environment Variables
(GITHUB_TOKEN, PR_NUMBER, etc.)
    │
    ▼
Entry Script
(perform-review.js or handle-response.js)
    │
    ▼
GitHub API Call
(fetch PR data, comments, etc.)
    │
    ▼
Analysis Module
(review-analyzer.js or response-analyzer.js)
    │
    ▼
Decision Logic
(what to post, resolve, etc.)
    │
    ▼
GitHub API Call
(post comments, update status)
    │
    ▼
GitHub Updates
(comments appear, status changes)
```

## Separation of Concerns Benefits

### ✅ Testability
Each module can be tested independently:
```javascript
// Test review analyzer without GitHub
const result = await analyzeCode(filename, patch);

// Test response analyzer without API
const analysis = analyzeResponse(commentBody);
```

### ✅ Maintainability
Change one concern without affecting others:
- Update review rules → Edit `review-analyzer.js` only
- Change GitHub API → Edit `comment-poster.js` only
- Modify workflow triggers → Edit `copilot-review.yml` only

### ✅ Reusability
Modules can be used in different contexts:
- Use `review-analyzer.js` in CLI tool
- Use `response-analyzer.js` in different workflow
- Share logic across multiple workflows

### ✅ Clarity
Each file has a clear, single purpose:
- Workflow = When to run
- Orchestration = What to do
- Business Logic = How to do it
- API Layer = Where to send results

## Extension Points

### Add New Review Rule
```javascript
// In review-analyzer.js → checkForIssues()
if (newCondition) {
  issues.push({ severity: 'high', message: 'New check' });
}
```

### Add New Response Type
```javascript
// In response-analyzer.js → analyzeResponse()
if (newPattern) {
  type = 'new_type';
}
```

### Add New Workflow Trigger
```yaml
# In copilot-review.yml
on:
  new_event_type:
    types: [action]
```

### Add New Integration
```javascript
// Create new script: slack-notifier.js
export async function notifySlack(message) {
  // Integration logic
}
```

## Summary

This architecture demonstrates professional separation of concerns:

1. **Workflow layer** - Declarative, minimal logic
2. **Orchestration layer** - Coordinates operations
3. **Business logic layer** - Pure functions, testable
4. **Integration layer** - External API interactions

Each layer has clear boundaries and responsibilities, making the system maintainable, testable, and extensible.

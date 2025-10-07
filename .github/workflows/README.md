# PR Review Agent

This repository includes an automated PR review agent that runs on every pull request.

## Features

The automated PR review agent provides the following features:

### 1. **Automatic Review Comments**
When a pull request is opened or updated, the agent automatically posts a review comment with:
- Number of files changed
- Lines added and deleted
- Total change count
- PR size assessment
- A review checklist

### 2. **Size-based Labeling**
The agent automatically labels PRs based on their size:

| Label | Total Changes | Assessment |
|-------|--------------|------------|
| `size/XS` | < 50 lines | Very small PR - Great for quick reviews! |
| `size/S` | 50-199 lines | Small PR - Easy to review |
| `size/M` | 200-499 lines | Medium PR - Consider breaking up if possible |
| `size/L` | 500-999 lines | Large PR - Should be broken into smaller PRs |
| `size/XL` | ≥ 1000 lines | Very large PR - Difficult to review, please split |

### 3. **Review Checklist**
Each PR receives an automated checklist to ensure quality:
- Code follows the project's coding standards
- Tests have been added/updated
- Documentation has been updated (if needed)
- All CI checks pass
- PR has been reviewed by at least one team member

## How It Works

The workflow is triggered on the following events:
- When a PR is opened (`opened`)
- When new commits are pushed to an existing PR (`synchronize`)
- When a closed PR is reopened (`reopened`)

# Automated PR Review Responsibilities

This section outlines the responsibilities and checks performed by the automated PR review agent for our repository.  
It ensures code quality, security, maintainability, and adherence to best practices.

---

## 1. Fetch & Analyze PR
- Retrieve PR details, changed files, and commit history.  
- Identify added, modified, or deleted code.  
- Track author, branch, and file type for tailored checks.

---

## 2. Code Quality Checks

### Error Handling & Logging
- Detect empty or overly broad catch blocks.  
- Flag usage of `System.out.println` or `printStackTrace()` instead of logging frameworks.  
- Ensure exceptions are properly propagated or handled.  
- Ensure Global Exception handling is done properly.  

### Code Structure & Design
- Check adherence to **SOLID principles** and design patterns.  
- Detect violations of DRY (Don’t Repeat Yourself) principle.  
- Flag God classes or methods that are too large or have too many responsibilities.  
- Suggest refactoring opportunities for long methods or deeply nested code.  

### Code Style & Conventions
- Enforce consistent naming conventions for variables, classes, and methods. prefer camelCasing   
- Ensure constants are used instead of magic numbers.

### Language-Specific Best Practices
- Detect improper usage of generics, raw types, or unsafe casts.  
- Flag use of deprecated APIs or outdated libraries.  
- Identify potential null pointer issues and missing null checks.  
- Detect overuse of static methods or mutable static variables.  
- Highlight potential null pointer dereferences and missing null checks.  
- Detect overuse of static fields or mutable statics.  
- Enforce proper Java 8+ idioms (streams, lambdas, Optionals, var).

### Parallel & Concurrent Programming
- Verify proper usage of threads, executors, and parallel streams.  
- Check for safe use of **virtual threads** (JEP 425) if applicable.  
- Detect potential race conditions, deadlocks, or improper synchronization.  
- Highlight blocking calls inside reactive or non-blocking code.  
- Suggest efficient use of thread pools and concurrency utilities.  

### Performance & Maintainability
- Flag methods or classes with high cyclomatic complexity.  
- Detect deeply nested loops or conditionals.  
- Identify duplicate or redundant code blocks.  
- Highlight unnecessary object creation, repeated DB queries, or inefficient collections.  

### Testability & Coverage
- Detect code that is hard to unit test (tight coupling, hard dependencies).  
- Identify missing interfaces or abstractions for dependency injection.  
- Flag untested critical paths in business logic.  
- Highlight missing or inadequate unit and integration tests.  

### Documentation & Comments
- Detect missing or outdated Javadoc / inline comments for public methods.  
- Flag TODO/FIXME comments without proper issue tracking.  
- Ensure comments are meaningful and up-to-date.
- Comments to the new class or methods is mandatory to understand the context properly 

### Security & Safety
- Detect hardcoded secrets, passwords, or API keys.  
- Identify unsafe SQL, shell, or system command usage.  
- Flag weak cryptography, insecure random number generators, or unsafe data handling.  

---

## 3. Best Coding Practices
- Write **modular, reusable, and readable code**.  
- Follow consistent **naming conventions and formatting**.  
- Prefer immutability where applicable.  
- Keep methods **small and focused on a single responsibility**.  
- Avoid deep nesting and long method chains.  
- Use **interfaces and abstractions** for flexibility and testability.  
- Ensure **proper resource management** (try-with-resources, closing streams).  
- Optimize for **performance and scalability**, but maintain readability.  

---

## 4. Documentation & Compliance
- Ensure updates to README, API docs, and inline comments.  
- Verify adherence to internal coding standards and style guides.  
- Check configuration files for secrets or misconfigurations.  
- Track and review license or compliance notices in code.  

---

## 5. Reporting & Feedback
- Post actionable PR comments with severity levels: Critical / Warning / Suggestion.  
- Provide summary of issues, test coverage, and recommendations.  
- Link to best practices or documentation for flagged issues.  

---

## 6. Optional Advanced Checks
- Verify adherence to **functional programming principles** where applicable.  
- Detect **immutable data structures** misuse in concurrent code.  
- Identify potential memory leaks or large object retention.  
- Suggest **refactoring to streams, lambdas, or reactive programming constructs**.  
- Security the code must be secure the logging should be masking critical information if there is any and check for injection issues if any 

---

## 7. Continuous Improvement
- Learn from historical PRs to suggest better patterns.  
- Track recurring violations and generate team-level metrics.  
- Encourage automated fixes for trivial issues (formatting, imports, logging).  


### Workflow Steps

1. **Checkout Code**: Fetches the repository code with full history
2. **Get PR Details**: Retrieves information about the PR including files changed and line counts
3. **Check PR Size**: Calculates the total changes and assigns an appropriate size label
4. **Post Review Comment**: Creates a detailed comment on the PR with statistics and checklist
5. **Add Size Label**: Applies the size label to the PR (creates the label if it doesn't exist)

## Permissions

The workflow requires the following permissions:
- `contents: read` - To checkout the repository
- `pull-requests: write` - To comment on PRs
- `issues: write` - To add labels (PRs are treated as issues for labeling)

## Customization

You can customize the workflow by editing `.github/workflows/pr-review.yml`:

### Adjust Size Thresholds
Modify the size calculations in the "Check PR size" step:
```yaml
if (totalChanges < 50) {
  sizeLabel = 'size/XS';
} else if (totalChanges < 200) {
  sizeLabel = 'size/S';
}
# ... etc
```

### Change Label Colors
Update the color mapping in the "Add size label" step:
```yaml
const colors = {
  'size/XS': '00ff00',  // Green
  'size/S': '90EE90',   // Light green
  'size/M': 'FFD700',   // Gold
  'size/L': 'FFA500',   // Orange
  'size/XL': 'FF0000'   // Red
};
```

### Modify Review Checklist
Edit the `reviewComment` template in the "Post review comment" step to add or remove checklist items.

## Example Output

When a PR is opened, the agent will post a comment like this:

```markdown
## 🤖 Automated PR Review

### PR Statistics
- **Files changed:** 5
- **Lines added:** +127
- **Lines deleted:** -43
- **Total changes:** 170

### Size Assessment
✅ This is a small PR. Should be easy to review.

### Checklist
Please ensure the following before merging:
- [ ] Code follows the project's coding standards
- [ ] Tests have been added/updated
- [ ] Documentation has been updated (if needed)
- [ ] All CI checks pass
- [ ] PR has been reviewed by at least one team member

---
*This is an automated review. Please reach out to maintainers if you have questions.*
```

## Disabling the Workflow

If you need to temporarily disable the workflow, you can:

1. Comment out or remove the workflow file
2. Or add a condition to skip certain PRs:
   ```yaml
   jobs:
     review:
       if: "!contains(github.event.pull_request.labels.*.name, 'skip-review')"
   ```

## Troubleshooting

### Labels Not Being Created
If the size labels aren't being created automatically:
1. Check that the workflow has `issues: write` permission
2. Manually create the labels in the repository settings
3. Verify the GitHub Actions token has sufficient permissions

### Comments Not Appearing
If review comments aren't being posted:
1. Ensure `pull-requests: write` permission is granted
2. Check the workflow run logs in the Actions tab
3. Verify the PR is from the same repository (not a fork with restricted permissions)

## Contributing

To improve this workflow:
1. Fork the repository
2. Make your changes to `.github/workflows/pr-review.yml`
3. Test the workflow in your fork
4. Submit a PR with your improvements

## License

This workflow is part of the reactor project. See the repository license for details.
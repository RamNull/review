# GitHub Copilot Code Review - Example Usage

This document demonstrates how the automated code review workflow works with real examples.

## Example 1: Security Issue Detection

### Pull Request Changes
```java
public class DatabaseConfig {
    private String dbPassword = "admin123";  // ❌ Will be flagged
    private String apiKey = "sk-prod-xyz";   // ❌ Will be flagged
}
```

### Automated Review Comment
> 🔒 **Security Issue**: Possible hardcoded credentials detected. Please use environment variables or a secure vault for sensitive data.

### Committer Responses

#### Response 1: Question
**Committer writes:**
> Why is this a problem? It's just for testing.

**Bot responds:**
> Good question! The main concern here is: Hardcoded credentials can be accidentally committed to version control and exposed. Even for testing, credentials should be stored in environment variables or configuration files that are not committed to the repository. This prevents security breaches and follows security best practices.

#### Response 2: Valid Defense
**Committer writes:**
> This is a test file that's never deployed to production. It's used only in our local development environment for unit tests. The credentials are documented in our test data setup guide at https://docs.internal/test-setup. This is intentional and by design.

**Bot responds:**
> ✅ Thank you for the explanation! Your reasoning is valid:
> 
> • This is a test file that's never deployed to production
> • The credentials are documented in our test data setup guide at https://docs.internal/test-setup
> • This is intentional and by design
> 
> This addresses the concern raised in the review. Marking this as resolved.

#### Response 3: Invalid Defense
**Committer writes:**
> It works fine, no problem.

**Bot responds:**
> I understand your perspective, but I'd like to clarify:
> 
> • "It works" is not sufficient justification. Code should also be maintainable, secure, and follow best practices.
> 
> The original suggestion still stands as it addresses important concerns about code quality, security, or maintainability. If you have additional context that I'm missing, please share it!

---

## Example 2: Code Quality Issue

### Pull Request Changes
```java
public void processData(String input) {
    try {
        // Process the input
        doSomething(input);
    } catch (Exception e) {
        // Empty catch block - will be flagged
    }
}
```

### Automated Review Comment
> ⚠️ **Code Quality**: Empty catch block detected. Either handle the exception or log it appropriately.

### Committer Response: Acknowledgment
**Committer writes:**
> Good catch! Thanks, will fix this by adding proper logging.

**Bot responds:**
> 👍 Thank you for addressing this feedback!

---

## Example 3: Best Practice Suggestion

### Pull Request Changes
```java
public void logMessage(String msg) {
    System.out.println("Log: " + msg);  // ❌ Will be flagged
}
```

### Automated Review Comment
> 📝 **Best Practice**: Consider using a proper logging framework (e.g., SLF4J) instead of `System.out.println`.

### Committer Response: Question with Details
**Committer writes:**
> How should I implement this? What's the recommended approach for our Spring Boot application?

**Bot responds:**
> Here's how you can address this:
> 
> 1. Review the suggested change in the comment above
> 2. Apply the recommended pattern or approach
> 3. Test the change to ensure it works as expected
> 
> If you need specific code examples or further guidance, please ask!
> 
> For Spring Boot, you can use SLF4J with Logback (included by default):
> ```java
> import org.slf4j.Logger;
> import org.slf4j.LoggerFactory;
> 
> public class MyClass {
>     private static final Logger logger = LoggerFactory.getLogger(MyClass.class);
>     
>     public void logMessage(String msg) {
>         logger.info("Log: {}", msg);
>     }
> }
> ```

---

## Workflow Behavior Summary

| Response Type | Bot Action | Result |
|--------------|------------|--------|
| **Question** | Provides helpful answer with context | Continues discussion |
| **Valid Defense** | Acknowledges reasoning, resolves comment | Comment resolved ✅ |
| **Invalid Defense** | Provides counter-arguments | Continues discussion |
| **Acknowledgment** | Confirms and thanks | Completes interaction |

## Comment Resolution Criteria

A comment is **automatically resolved** when:
1. Response type is a defense (not a question)
2. Contains valid technical justification:
   - Performance or optimization reasons
   - Backward compatibility requirements
   - Framework/library requirements
   - Design pattern justification
   - Test/mock data explanation
3. Has sufficient detail (>20 words OR code examples OR references)
4. Achieves validity score ≥ 0.7

## Testing the Workflow

1. **Create a PR** with intentional code issues (see examples above)
2. **Wait for review** - Bot will analyze and comment
3. **Respond to comments** with different types:
   - Ask a question
   - Defend with reasoning
   - Acknowledge the feedback
4. **Observe bot responses** - See how it handles each type

## Benefits

✅ **Automated Quality Checks** - Catches common issues early  
✅ **Intelligent Responses** - Understands context and intent  
✅ **Educational** - Helps developers learn best practices  
✅ **Time Saving** - Reduces manual review burden  
✅ **Consistent** - Applies same standards across all PRs  
✅ **Flexible** - Resolves valid defenses automatically

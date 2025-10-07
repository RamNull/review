/**
 * Analyzes code for potential issues, bugs, and improvements.
 * This module contains the core review logic separated from the workflow.
 */

export async function analyzeCode(filename, patch, blobUrl) {
  const reviewComments = [];

  if (!patch) {
    return reviewComments;
  }

  const lines = patch.split('\n');
  let currentLine = 0;
  let position = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    position = i + 1;

    // Track line numbers from diff
    if (line.startsWith('@@')) {
      const match = line.match(/\+(\d+)/);
      if (match) {
        currentLine = parseInt(match[1]) - 1;
      }
      continue;
    }

    if (line.startsWith('-')) {
      continue;
    }

    if (line.startsWith('+')) {
      currentLine++;
      const codeContent = line.substring(1);

      // Check for common issues
      const issues = checkForIssues(codeContent, filename);
      
      for (const issue of issues) {
        reviewComments.push({
          path: filename,
          position: position,
          body: issue.message,
          line: currentLine,
        });
      }
    } else if (!line.startsWith('\\')) {
      currentLine++;
    }
  }

  return reviewComments;
}

/**
 * Checks for common code issues and returns suggestions.
 */
function checkForIssues(code, filename) {
  const issues = [];

  // Security: Check for hardcoded credentials
  if (/password\s*=\s*["'][^"']+["']/i.test(code) || 
      /api[_-]?key\s*=\s*["'][^"']+["']/i.test(code) ||
      /secret\s*=\s*["'][^"']+["']/i.test(code)) {
    issues.push({
      severity: 'high',
      message: '🔒 **Security Issue**: Possible hardcoded credentials detected. Please use environment variables or a secure vault for sensitive data.',
    });
  }

  // Java specific checks
  if (filename.endsWith('.java')) {
    // Check for System.out.println (should use logger)
    if (/System\.out\.print/.test(code)) {
      issues.push({
        severity: 'medium',
        message: '📝 **Best Practice**: Consider using a proper logging framework (e.g., SLF4J) instead of `System.out.println`.',
      });
    }

    // Check for empty catch blocks
    if (/catch\s*\([^)]+\)\s*\{\s*\}/.test(code)) {
      issues.push({
        severity: 'high',
        message: '⚠️ **Code Quality**: Empty catch block detected. Either handle the exception or log it appropriately.',
      });
    }

    // Check for potential SQL injection
    if (/executeQuery\s*\(\s*["'].*\+/.test(code) || /prepareStatement\s*\(\s*["'].*\+/.test(code)) {
      issues.push({
        severity: 'high',
        message: '🔒 **Security Issue**: Potential SQL injection vulnerability. Use parameterized queries or prepared statements.',
      });
    }
  }

  // JavaScript/TypeScript specific checks
  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    // Check for console.log in production code (not in test files)
    if (/console\.log/.test(code) && !filename.includes('test') && !filename.includes('spec')) {
      issues.push({
        severity: 'low',
        message: '📝 **Code Quality**: `console.log` statement found. Consider using a proper logging library or remove before production.',
      });
    }

    // Check for == instead of ===
    if (/[^=!]==[^=]/.test(code)) {
      issues.push({
        severity: 'medium',
        message: '📝 **Best Practice**: Use strict equality (`===`) instead of loose equality (`==`) to avoid type coercion issues.',
      });
    }

    // Check for var usage
    if (/\bvar\s+\w+/.test(code)) {
      issues.push({
        severity: 'low',
        message: '📝 **Best Practice**: Use `let` or `const` instead of `var` for better scoping.',
      });
    }
  }

  // General checks for all languages

  // Check for TODO comments
  if (/\/\/\s*TODO/i.test(code) || /\/\*\s*TODO/i.test(code) || /#\s*TODO/i.test(code)) {
    issues.push({
      severity: 'low',
      message: '📌 **Note**: TODO comment found. Consider creating a tracked issue for this work.',
    });
  }

  // Check for very long lines (>120 characters)
  if (code.trim().length > 120) {
    issues.push({
      severity: 'low',
      message: '📏 **Code Style**: Line is very long (>120 characters). Consider breaking it up for better readability.',
    });
  }

  // Check for multiple nested if statements (complexity)
  const nestingLevel = (code.match(/\bif\s*\(/g) || []).length;
  if (nestingLevel >= 3) {
    issues.push({
      severity: 'medium',
      message: '🔄 **Complexity**: High nesting level detected. Consider refactoring to reduce complexity.',
    });
  }

  return issues;
}

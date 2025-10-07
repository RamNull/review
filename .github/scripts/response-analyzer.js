/**
 * Analyzes committer responses to review comments.
 * Determines if the response is a question, defense, or acknowledgment.
 */

export function analyzeResponse(commentBody, originalComment) {
  const lowerBody = commentBody.toLowerCase();
  
  // Determine response type
  let type = 'acknowledgment';
  
  // Check for questions (highest priority - check first)
  const questionIndicators = [
    'why',
    'how',
    'what',
    'when',
    'where',
    'could you',
    'can you',
    'would you',
    'should i',
    'is there',
    'are there',
  ];
  
  const hasQuestionMark = commentBody.includes('?');
  const hasQuestionWord = questionIndicators.some(indicator => lowerBody.includes(indicator));
  
  if (hasQuestionMark || hasQuestionWord) {
    type = 'question';
  }
  
  // Check for defensive responses (only if not already a question)
  const defenseIndicators = [
    'but',
    'however',
    'actually',
    'because',
    'the reason',
    'this is',
    'i disagree',
    'i think',
    'in my opinion',
    'i believe',
    'necessary',
    'required',
    'needed',
    'intentional',
    'on purpose',
  ];
  
  if (type !== 'question' &&
      defenseIndicators.some(indicator => lowerBody.includes(indicator)) && 
      !lowerBody.includes('you\'re right') && 
      !lowerBody.includes('good point')) {
    type = 'defense';
  }
  
  // Check for acknowledgment
  const ackIndicators = [
    'thanks',
    'thank you',
    'will fix',
    'will change',
    'good point',
    'you\'re right',
    'agreed',
    'makes sense',
    'fixed',
    'done',
    'updated',
  ];
  
  if (ackIndicators.some(indicator => lowerBody.includes(indicator))) {
    type = 'acknowledgment';
  }
  
  // Determine sentiment
  const sentiment = analyzeSentiment(commentBody);
  
  // Extract key points from the response
  const keyPoints = extractKeyPoints(commentBody);
  
  // Identify concerns if it's a defense
  const concerns = type === 'defense' ? identifyConcerns(commentBody) : [];
  
  return {
    type,
    sentiment,
    keyPoints,
    concerns,
    originalComment,
  };
}

export function shouldResolveComment(commentBody, analysis) {
  if (analysis.type !== 'defense') {
    return false;
  }
  
  const lowerBody = commentBody.toLowerCase();
  
  // Valid reasons to resolve
  const validReasons = [
    // Technical justifications
    {
      pattern: /(performance|optimization|faster|efficient)/i,
      weight: 0.8,
    },
    {
      pattern: /(backward compatibility|legacy|existing)/i,
      weight: 0.9,
    },
    {
      pattern: /(framework|library) (requirement|convention|standard)/i,
      weight: 0.9,
    },
    {
      pattern: /(design pattern|architecture|by design)/i,
      weight: 0.8,
    },
    {
      pattern: /(test|mock|stub) (data|code|setup)/i,
      weight: 0.7,
    },
    {
      pattern: /temporary|placeholder|will be replaced/i,
      weight: 0.5,
    },
  ];
  
  // Check if response includes code examples or references
  const hasCodeExample = /```/.test(commentBody) || /`[^`]+`/.test(commentBody);
  const hasReference = /http|link|documentation|docs|spec/i.test(commentBody);
  
  let score = 0;
  
  for (const reason of validReasons) {
    if (reason.pattern.test(commentBody)) {
      score += reason.weight;
    }
  }
  
  if (hasCodeExample) score += 0.3;
  if (hasReference) score += 0.2;
  
  // Check for invalid dismissals
  const invalidDismissals = [
    /it works/i,
    /no problem/i,
    /don't worry/i,
    /it's fine/i,
  ];
  
  const hasInvalidDismissal = invalidDismissals.some(pattern => pattern.test(commentBody));
  
  if (hasInvalidDismissal && score < 0.5) {
    return false;
  }
  
  // Require substantial reasoning (length and detail)
  const wordCount = commentBody.split(/\s+/).length;
  const hasSufficientDetail = wordCount > 20 || hasCodeExample || hasReference;
  
  // Resolve if score is high enough and has sufficient detail
  return score >= 0.7 && hasSufficientDetail;
}

function analyzeSentiment(text) {
  const lowerText = text.toLowerCase();
  
  const positiveWords = [
    'thanks', 'thank', 'appreciate', 'good', 'great', 'excellent',
    'helpful', 'agree', 'right', 'correct', 'perfect',
  ];
  
  const negativeWords = [
    'disagree', 'wrong', 'incorrect', 'bad', 'unnecessary',
    'don\'t', 'won\'t', 'can\'t', 'shouldn\'t',
  ];
  
  const neutralWords = [
    'however', 'but', 'although', 'because', 'actually',
  ];
  
  let sentiment = 'neutral';
  
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  if (positiveCount > negativeCount) {
    sentiment = 'positive';
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
  }
  
  return sentiment;
}

function extractKeyPoints(text) {
  const points = [];
  
  // Split by sentences
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  // Take important sentences (containing keywords)
  const importantKeywords = [
    'because', 'reason', 'since', 'due to', 'therefore',
    'this is', 'this allows', 'this ensures', 'this prevents',
    'required', 'necessary', 'needed', 'must',
  ];
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (importantKeywords.some(keyword => trimmed.toLowerCase().includes(keyword))) {
      points.push(trimmed);
    }
  }
  
  // If no key points found, take first 2 substantial sentences
  if (points.length === 0) {
    const substantial = sentences.filter(s => s.trim().split(/\s+/).length > 5);
    points.push(...substantial.slice(0, 2).map(s => s.trim()));
  }
  
  return points.slice(0, 3); // Limit to top 3 points
}

function identifyConcerns(text) {
  const concerns = [];
  
  const lowerText = text.toLowerCase();
  
  // Common patterns of invalid defenses
  if (lowerText.includes('it works') || lowerText.includes('it\'s working')) {
    concerns.push('"It works" is not sufficient justification. Code should also be maintainable, secure, and follow best practices.');
  }
  
  if (lowerText.includes('always done') || lowerText.includes('we always')) {
    concerns.push('Past practices should be evaluated against current best practices and standards.');
  }
  
  if (lowerText.includes('don\'t have time') || lowerText.includes('quick fix')) {
    concerns.push('Technical debt should be minimized. Quick fixes often lead to long-term maintenance issues.');
  }
  
  if (lowerText.includes('no one will notice') || lowerText.includes('doesn\'t matter')) {
    concerns.push('Code quality matters regardless of visibility. This affects maintainability and team standards.');
  }
  
  return concerns;
}

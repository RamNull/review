import { analyzeCode } from './review-analyzer.js';
import { analyzeResponse, shouldResolveComment } from './response-analyzer.js';

console.log('🧪 Testing Review Analyzer\n');

// Test 1: Security issue detection
console.log('Test 1: Hardcoded password detection');
const patch1 = `@@ -1,3 +1,4 @@
 public class Config {
-    // TODO: Add config
+    private String password = "admin123";
+    private String apiKey = "sk-1234567890";
 }`;

const result1 = await analyzeCode('Config.java', patch1, 'https://example.com');
console.log(`Found ${result1.length} issues:`);
result1.forEach((issue, i) => {
  console.log(`  ${i + 1}. ${issue.body}`);
});

// Test 2: System.out.println detection
console.log('\nTest 2: System.out.println detection');
const patch2 = `@@ -1,3 +1,4 @@
 public class Service {
     public void process() {
+        System.out.println("Processing data");
     }
 }`;

const result2 = await analyzeCode('Service.java', patch2, 'https://example.com');
console.log(`Found ${result2.length} issues:`);
result2.forEach((issue, i) => {
  console.log(`  ${i + 1}. ${issue.body}`);
});

// Test 3: JavaScript console.log detection
console.log('\nTest 3: JavaScript console.log detection');
const patch3 = `@@ -1,3 +1,4 @@
 function processData() {
+    console.log("Debug info");
     return data;
 }`;

const result3 = await analyzeCode('app.js', patch3, 'https://example.com');
console.log(`Found ${result3.length} issues:`);
result3.forEach((issue, i) => {
  console.log(`  ${i + 1}. ${issue.body}`);
});

console.log('\n🧪 Testing Response Analyzer\n');

// Test 4: Question detection
console.log('Test 4: Question detection');
const question = "Why is this change needed? Can you explain?";
const analysis1 = analyzeResponse(question, {});
console.log(`Type: ${analysis1.type}, Sentiment: ${analysis1.sentiment}`);

// Test 5: Defense detection
console.log('\nTest 5: Defense with valid reasoning');
const defense = `This is necessary because of backward compatibility requirements. 
The legacy system requires this specific format. We have documentation here: 
https://docs.example.com/legacy-api`;
const analysis2 = analyzeResponse(defense, {});
const shouldResolve = shouldResolveComment(defense, analysis2);
console.log(`Type: ${analysis2.type}, Sentiment: ${analysis2.sentiment}`);
console.log(`Should resolve: ${shouldResolve}`);

// Test 6: Invalid defense detection
console.log('\nTest 6: Invalid defense');
const invalidDefense = "It works fine, no problem.";
const analysis3 = analyzeResponse(invalidDefense, {});
const shouldResolve2 = shouldResolveComment(invalidDefense, analysis3);
console.log(`Type: ${analysis3.type}, Sentiment: ${analysis3.sentiment}`);
console.log(`Should resolve: ${shouldResolve2}`);

// Test 7: Acknowledgment detection
console.log('\nTest 7: Acknowledgment detection');
const ack = "Thanks for the feedback! Will fix this.";
const analysis4 = analyzeResponse(ack, {});
console.log(`Type: ${analysis4.type}, Sentiment: ${analysis4.sentiment}`);

console.log('\n✅ All tests completed successfully!');

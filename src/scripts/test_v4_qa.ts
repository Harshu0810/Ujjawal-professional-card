import { parseKnowledgeDocument, retrieveRelevantChunks } from '../lib/rag';
import { buildSystemPrompt } from '../lib/chatbot/prompt';
import { generateChatResponse, getLastProviderDiagnostic } from '../lib/chatbot/claude';

async function runTests() {
  console.log('--- Test 1: RAG Leakage Bug Verification ---');

  // Test off-topic query: "Tell me a one-line fun fact about the ocean"
  const oceanChunks = retrieveRelevantChunks('Tell me a one-line fun fact about the ocean', 3);
  console.log('Ocean chunks retrieved count:', oceanChunks.length);
  if (oceanChunks.length !== 0) {
    console.error('FAIL: Off-topic query should retrieve 0 business chunks, got:', oceanChunks.length);
    process.exit(1);
  }
  console.log('PASS: Off-topic query retrieved 0 business chunks (no irrelevant scaffolding attached).');

  // Test prompt building for off-topic query
  const prompt = buildSystemPrompt({
    ownerName: 'Ujjawal',
    contactMethod: 'WhatsApp (+91 98765 43210)',
    retrievedBusinessFacts: '',
    exchangesUsed: 0,
    maxExchanges: 3
  });

  if (prompt.includes('BUSINESS INFORMATION') || prompt.includes('DRAFT') || prompt.includes('PLACEHOLDER') || prompt.includes('Appendix')) {
    console.error('FAIL: Prompt leaked internal scaffolding or business header for empty context!');
    process.exit(1);
  }
  console.log('PASS: Prompt for general query has zero document scaffolding, no placeholder text, and no leaked headers.');

  // Test business query: "What marketing funnels do you build?"
  const businessChunks = retrieveRelevantChunks('What marketing funnels do you build?', 3);
  console.log('Business chunks retrieved count:', businessChunks.length);
  if (businessChunks.length === 0) {
    console.error('FAIL: Business query should retrieve relevant chunks!');
    process.exit(1);
  }

  for (const chunk of businessChunks) {
    if (/\[(?:DRAFT|DUMMY|PLACEHOLDER|TODO)/i.test(chunk.content) || /Status:/i.test(chunk.content)) {
      console.error('FAIL: Retrieved chunk contains draft/status leakage:', chunk);
      process.exit(1);
    }
  }
  console.log('PASS: Business query retrieved chunks are clean and free of draft/placeholder markers.');

  console.log('\n--- Test 2: Chat Engine & Fallback Verification ---');
  const chatRes = await generateChatResponse(
    [{ role: 'user', content: 'What marketing services do you offer?' }],
    'What marketing services do you offer?'
  );

  console.log('Provider used:', chatRes.providerUsed);
  console.log('Model used:', chatRes.modelUsed);
  console.log('Reply preview:', chatRes.reply.slice(0, 120) + '...');

  const diag = getLastProviderDiagnostic();
  console.log('Diagnostic recorded:', diag);

  if (!chatRes.reply || chatRes.reply.includes('DRAFT') || chatRes.reply.includes('PLACEHOLDER')) {
    console.error('FAIL: Chat reply contains placeholder text or is empty!');
    process.exit(1);
  }
  console.log('PASS: Chat response generated cleanly without any placeholder leakage.');

  console.log('\n--- ALL VERIFICATION TESTS PASSED ---');
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});

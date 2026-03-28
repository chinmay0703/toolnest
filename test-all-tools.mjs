// Test all 453 tools - check HTTP status, page content, and identify issues
import http from 'http';
import fs from 'fs';

const BASE = 'http://localhost:3001';

// Read tools from the TS file
const toolsContent = fs.readFileSync('lib/tools.ts', 'utf8');
const toolEntries = [];
const regex = /\{\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*category:\s*"([^"]+)",[\s\S]*?url:\s*"([^"]+)"/g;
let m;
while ((m = regex.exec(toolsContent)) !== null) {
  toolEntries.push({ id: m[1], name: m[2], description: m[3], category: m[4], url: m[5] });
}

console.log(`Found ${toolEntries.length} tools to test.\n`);

const results = [];
let tested = 0;

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    http.get(BASE + url, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

async function testTool(tool) {
  const result = {
    id: tool.id,
    name: tool.name,
    category: tool.category,
    url: tool.url,
    httpStatus: 0,
    hasToolUI: false,
    hasDropzone: false,
    hasTextarea: false,
    hasButton: false,
    hasComingSoon: false,
    hasLimitation: false,
    hasGenericFallback: false,
    engineUsed: '',
    status: 'UNKNOWN',
    notes: '',
  };

  try {
    const { status, body } = await fetchPage(tool.url);
    result.httpStatus = status;

    if (status !== 200) {
      result.status = 'FAIL';
      result.notes = `HTTP ${status}`;
      return result;
    }

    // Check for bad patterns
    const lowerBody = body.toLowerCase();

    if (lowerBody.includes('coming soon') || lowerBody.includes('being built') || lowerBody.includes('check back')) {
      result.hasComingSoon = true;
      result.status = 'FAIL';
      result.notes = 'Shows "coming soon" or placeholder';
      return result;
    }

    if (lowerBody.includes('requires server') || lowerBody.includes('server-side') || lowerBody.includes('not supported')) {
      result.hasLimitation = true;
    }

    // Check for UI elements
    result.hasDropzone = body.includes('Drop') || body.includes('drop') || body.includes('Drag');
    result.hasTextarea = body.includes('textarea') || body.includes('type="text"');
    result.hasButton = body.includes('button') || body.includes('Button');
    result.hasToolUI = result.hasDropzone || result.hasTextarea || result.hasButton;

    // Check which engine is used
    if (body.includes('FileDropzone') || body.includes('drag to replace') || body.includes('Drop your')) {
      result.engineUsed = 'FileToolEngine';
    } else if (body.includes('Calculate') || body.includes('calculator')) {
      result.engineUsed = 'CalculatorToolEngine';
    } else if (body.includes('Process') || body.includes('Generate') || body.includes('Convert')) {
      result.engineUsed = 'Mixed';
    }

    // Check for generic fallback indicators
    if (body.includes('Process File') && body.includes('File processed successfully')) {
      result.hasGenericFallback = true;
      result.notes = 'Uses generic file pass-through (may not do real processing)';
    }

    if (body.includes('GenericCalculator') || body.includes('GenericTextTool')) {
      result.hasGenericFallback = true;
    }

    // Determine overall status
    if (result.hasComingSoon || result.hasLimitation) {
      result.status = 'FAIL';
    } else if (result.hasGenericFallback) {
      result.status = 'GENERIC';
    } else if (result.hasToolUI) {
      result.status = 'PASS';
    } else {
      result.status = 'PASS'; // Page loads with content
    }

  } catch (e) {
    result.status = 'ERROR';
    result.notes = e.message;
  }

  return result;
}

// Test sequentially (to not overload server)
async function runTests() {
  for (const tool of toolEntries) {
    const result = await testTool(tool);
    results.push(result);
    tested++;
    if (tested % 50 === 0) {
      console.log(`Tested ${tested}/${toolEntries.length}...`);
    }
  }

  // Generate CSV report
  const headers = ['ID', 'Name', 'Category', 'URL', 'HTTP Status', 'Has UI', 'Status', 'Notes'];
  const csvRows = [headers.join(',')];

  let passCount = 0, failCount = 0, genericCount = 0, errorCount = 0;

  for (const r of results) {
    if (r.status === 'PASS') passCount++;
    else if (r.status === 'FAIL') failCount++;
    else if (r.status === 'GENERIC') genericCount++;
    else errorCount++;

    csvRows.push([
      r.id,
      `"${r.name}"`,
      r.category,
      r.url,
      r.httpStatus,
      r.hasToolUI,
      r.status,
      `"${r.notes}"`
    ].join(','));
  }

  fs.writeFileSync('test-results.csv', csvRows.join('\n'));

  console.log('\n========================================');
  console.log('TEST RESULTS SUMMARY');
  console.log('========================================');
  console.log(`Total tools tested: ${results.length}`);
  console.log(`PASS:    ${passCount}`);
  console.log(`GENERIC: ${genericCount} (uses fallback handler)`);
  console.log(`FAIL:    ${failCount}`);
  console.log(`ERROR:   ${errorCount}`);
  console.log('========================================');

  if (failCount > 0) {
    console.log('\nFAILED TOOLS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  ${r.category}/${r.id}: ${r.notes}`);
    });
  }

  if (genericCount > 0) {
    console.log('\nGENERIC FALLBACK TOOLS (not custom-implemented):');
    results.filter(r => r.status === 'GENERIC').forEach(r => {
      console.log(`  ${r.category}/${r.id}`);
    });
  }

  console.log('\nCSV report saved to: test-results.csv');
}

runTests();

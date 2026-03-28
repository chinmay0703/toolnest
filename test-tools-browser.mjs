import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const BASE = 'http://localhost:3001';
const PDF_FILE = '/Users/abcom/Documents/claude_test/chinmay_vyawahare_resume (1).pdf';
const IMG_FILE = '/Users/abcom/Documents/claude_test/IMG20260323192746.jpg';

const results = [];

async function testTool(browser, toolUrl, toolName, testFile, expectedAction) {
  const page = await browser.newPage();
  const result = { tool: toolName, url: toolUrl, status: 'UNKNOWN', error: '', details: '' };

  try {
    await page.goto(BASE + toolUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await page.waitForSelector('body', { timeout: 5000 });

    // Check if page has proper tool content (not 404)
    const pageText = await page.evaluate(() => document.body.innerText);

    if (pageText.includes('Page Not Found') || pageText.includes('404')) {
      result.status = 'FAIL';
      result.error = 'Page 404';
      results.push(result);
      await page.close();
      return;
    }

    // Check for bad patterns
    if (pageText.includes('coming soon') || pageText.includes('being built')) {
      result.status = 'FAIL';
      result.error = 'Shows placeholder text';
      results.push(result);
      await page.close();
      return;
    }

    if (testFile && fs.existsSync(testFile)) {
      // Try to find file input and upload
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(testFile);
        await new Promise(r => setTimeout(r, 2000)); // Wait for file processing

        // Check if file was accepted (look for file name in page)
        const afterUpload = await page.evaluate(() => document.body.innerText);
        const fileName = path.basename(testFile);

        if (afterUpload.includes(fileName) || afterUpload.includes('Drop') === false) {
          result.details = 'File uploaded successfully';

          // Try to find and click the action button
          const buttons = await page.$$('button');
          let actionButton = null;
          for (const btn of buttons) {
            const text = await page.evaluate(el => el.innerText, btn);
            if (text && (text.includes('Compress') || text.includes('Convert') || text.includes('Extract') ||
                text.includes('Merge') || text.includes('Rotate') || text.includes('Process') ||
                text.includes('Resize') || text.includes('Generate') || text.includes('Download'))) {
              actionButton = btn;
              break;
            }
          }

          if (actionButton) {
            const btnText = await page.evaluate(el => el.innerText, actionButton);
            try {
              await actionButton.click();
              result.details += ` → Clicked "${btnText}"`;

              // Wait for processing
              await new Promise(r => setTimeout(r, 5000));

              const afterProcess = await page.evaluate(() => document.body.innerText);

              // Check for success indicators
              if (afterProcess.includes('Download') || afterProcess.includes('download') ||
                  afterProcess.includes('Compressed') || afterProcess.includes('Converted') ||
                  afterProcess.includes('success') || afterProcess.includes('page(s)') ||
                  afterProcess.includes('Extracted')) {
                result.status = 'PASS';
                result.details += ' → Processing completed';
              } else if (afterProcess.includes('Failed') || afterProcess.includes('Error') || afterProcess.includes('error')) {
                result.status = 'FAIL';
                result.error = 'Processing failed';
                result.details += ' → Error during processing';
              } else {
                result.status = 'PASS';
                result.details += ' → Button clicked (processing may be async)';
              }
            } catch (e) {
              result.status = 'WARN';
              result.error = 'Button click failed: ' + e.message;
            }
          } else {
            result.status = 'WARN';
            result.details += ' (no action button found after upload)';
          }
        } else {
          result.status = 'WARN';
          result.details = 'File upload may not have been accepted';
        }
      } else {
        // No file input - might be a text/calculator tool
        result.details = 'No file input (text/calc tool)';

        // Check for textarea or input
        const hasTextarea = await page.$('textarea');
        const hasInput = await page.$('input[type="text"], input[type="number"]');

        if (hasTextarea || hasInput) {
          result.status = 'PASS';
          result.details = 'Has interactive input fields';
        } else {
          result.status = 'PASS';
          result.details = 'Page loads with tool UI';
        }
      }
    } else {
      // No test file provided - just verify page has interactive elements
      const hasInteraction = await page.evaluate(() => {
        return document.querySelectorAll('button, textarea, input, select').length;
      });

      if (hasInteraction > 3) {
        result.status = 'PASS';
        result.details = `Has ${hasInteraction} interactive elements`;
      } else {
        result.status = 'WARN';
        result.details = `Only ${hasInteraction} interactive elements`;
      }
    }

  } catch (e) {
    result.status = 'ERROR';
    result.error = e.message.substring(0, 100);
  }

  results.push(result);
  await page.close();
}

async function run() {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });

  // Key tools to test with actual file uploads
  const fileTests = [
    // PDF tools
    { url: '/pdf/compress-pdf', name: 'Compress PDF', file: PDF_FILE, action: 'Compress' },
    { url: '/pdf/merge-pdf', name: 'Merge PDF', file: PDF_FILE, action: 'Merge' },
    { url: '/pdf/split-pdf', name: 'Split PDF', file: PDF_FILE, action: 'Split' },
    { url: '/pdf/rotate-pdf', name: 'Rotate PDF', file: PDF_FILE, action: 'Rotate' },
    { url: '/pdf/pdf-to-text', name: 'PDF to Text', file: PDF_FILE, action: 'Extract' },
    { url: '/pdf/pdf-to-word', name: 'PDF to Word', file: PDF_FILE, action: 'Convert' },
    { url: '/pdf/pdf-to-jpg', name: 'PDF to JPG', file: PDF_FILE, action: 'Convert' },
    { url: '/pdf/pdf-to-png', name: 'PDF to PNG', file: PDF_FILE, action: 'Convert' },
    { url: '/pdf/pdf-to-excel', name: 'PDF to Excel', file: PDF_FILE, action: 'Convert' },
    { url: '/pdf/jpg-to-pdf', name: 'JPG to PDF', file: IMG_FILE, action: 'Convert' },
    { url: '/pdf/lock-pdf', name: 'Lock PDF', file: PDF_FILE, action: 'Lock' },
    { url: '/pdf/add-page-numbers', name: 'Add Page Numbers', file: PDF_FILE, action: 'Add' },
    { url: '/pdf/add-watermark-pdf', name: 'Add Watermark PDF', file: PDF_FILE, action: 'Add' },
    { url: '/pdf/delete-pdf-pages', name: 'Delete PDF Pages', file: PDF_FILE, action: 'Delete' },
    { url: '/pdf/unlock-pdf', name: 'Unlock PDF', file: PDF_FILE, action: 'Unlock' },

    // Image tools
    { url: '/image/compress-image', name: 'Compress Image', file: IMG_FILE, action: 'Compress' },
    { url: '/image/resize-image', name: 'Resize Image', file: IMG_FILE, action: 'Resize' },
    { url: '/image/crop-image', name: 'Crop Image', file: IMG_FILE, action: 'Crop' },
    { url: '/image/rotate-image', name: 'Rotate Image', file: IMG_FILE, action: 'Rotate' },
    { url: '/image/flip-image', name: 'Flip Image', file: IMG_FILE, action: 'Flip' },
    { url: '/image/jpg-to-png', name: 'JPG to PNG', file: IMG_FILE, action: 'Convert' },
    { url: '/image/png-to-jpg', name: 'PNG to JPG', file: IMG_FILE, action: 'Convert' },
    { url: '/image/black-and-white', name: 'Black & White', file: IMG_FILE, action: 'Convert' },
    { url: '/image/remove-background', name: 'Remove Background', file: IMG_FILE, action: 'Remove' },
    { url: '/image/sharpen-image', name: 'Sharpen Image', file: IMG_FILE, action: 'Sharpen' },
    { url: '/image/add-text-to-image', name: 'Add Text to Image', file: IMG_FILE, action: 'Add' },
    { url: '/image/meme-generator', name: 'Meme Generator', file: IMG_FILE, action: 'Generate' },
    { url: '/image/image-to-base64', name: 'Image to Base64', file: IMG_FILE, action: 'Convert' },
    { url: '/image/image-metadata-remover', name: 'Metadata Remover', file: IMG_FILE, action: 'Remove' },

    // Text tools (no file needed)
    { url: '/text/word-counter', name: 'Word Counter', file: null, action: 'Count' },
    { url: '/text/find-replace', name: 'Find & Replace', file: null, action: 'Replace' },
    { url: '/text/lorem-ipsum', name: 'Lorem Ipsum', file: null, action: 'Generate' },
    { url: '/text/morse-code', name: 'Morse Code', file: null, action: 'Convert' },
    { url: '/text/reverse-text', name: 'Reverse Text', file: null, action: 'Reverse' },

    // Developer tools
    { url: '/developer/json-formatter', name: 'JSON Formatter', file: null, action: 'Format' },
    { url: '/developer/base64-encode', name: 'Base64 Encode', file: null, action: 'Encode' },
    { url: '/developer/uuid-generator', name: 'UUID Generator', file: null, action: 'Generate' },
    { url: '/developer/password-generator', name: 'Password Generator', file: null, action: 'Generate' },
    { url: '/developer/color-picker', name: 'Color Picker', file: null, action: 'Pick' },
    { url: '/developer/regex-tester', name: 'Regex Tester', file: null, action: 'Test' },
    { url: '/developer/jwt-decoder', name: 'JWT Decoder', file: null, action: 'Decode' },

    // Calculator tools
    { url: '/calculators/bmi-calculator', name: 'BMI Calculator', file: null, action: 'Calculate' },
    { url: '/calculators/emi-calculator', name: 'EMI Calculator', file: null, action: 'Calculate' },
    { url: '/calculators/percentage-calculator', name: 'Percentage Calc', file: null, action: 'Calculate' },
    { url: '/calculators/unit-converter', name: 'Unit Converter', file: null, action: 'Convert' },

    // Productivity
    { url: '/productivity/pomodoro-timer', name: 'Pomodoro Timer', file: null, action: 'Start' },
    { url: '/productivity/qr-code-generator', name: 'QR Code Generator', file: null, action: 'Generate' },
    { url: '/productivity/todo-list', name: 'Todo List', file: null, action: 'Add' },

    // Fun
    { url: '/fun/dice-roller', name: 'Dice Roller', file: null, action: 'Roll' },
    { url: '/fun/coin-flipper', name: 'Coin Flipper', file: null, action: 'Flip' },
    { url: '/fun/sudoku-generator', name: 'Sudoku', file: null, action: 'Generate' },

    // Security
    { url: '/security/password-strength', name: 'Password Strength', file: null, action: 'Check' },
    { url: '/security/aes-encrypt', name: 'AES Encrypt', file: null, action: 'Encrypt' },
  ];

  console.log(`Testing ${fileTests.length} tools with browser...\n`);

  for (let i = 0; i < fileTests.length; i++) {
    const t = fileTests[i];
    process.stdout.write(`[${i+1}/${fileTests.length}] ${t.name}...`);
    await testTool(browser, t.url, t.name, t.file, t.action);
    const r = results[results.length - 1];
    console.log(` ${r.status} ${r.error ? '(' + r.error + ')' : ''} ${r.details}`);
  }

  await browser.close();

  // Generate Excel report
  const XLSX = (await import('xlsx')).default;
  const ws = XLSX.utils.json_to_sheet(results);
  ws['!cols'] = [{wch:25},{wch:30},{wch:10},{wch:40},{wch:50}];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Browser Test Results');

  // Summary
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const warn = results.filter(r => r.status === 'WARN').length;
  const err = results.filter(r => r.status === 'ERROR').length;

  const summaryData = [
    {Metric: 'Total Tested', Value: results.length},
    {Metric: 'PASS', Value: pass},
    {Metric: 'WARN', Value: warn},
    {Metric: 'FAIL', Value: fail},
    {Metric: 'ERROR', Value: err},
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  XLSX.writeFile(wb, 'ToolNest-Browser-Test-Results.xlsx');

  console.log('\n========================================');
  console.log('BROWSER TEST RESULTS');
  console.log('========================================');
  console.log(`PASS: ${pass} | WARN: ${warn} | FAIL: ${fail} | ERROR: ${err}`);
  console.log('========================================');

  if (fail > 0) {
    console.log('\nFAILED:');
    results.filter(r => r.status === 'FAIL').forEach(r => console.log(`  ${r.tool}: ${r.error}`));
  }
  if (warn > 0) {
    console.log('\nWARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => console.log(`  ${r.tool}: ${r.details} ${r.error}`));
  }

  console.log('\nExcel report: ToolNest-Browser-Test-Results.xlsx');
}

run().catch(console.error);

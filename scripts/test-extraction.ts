
import mongoose from 'mongoose';
import { extractCompleteWebsite, extractCSSFromWebsite } from '../src/services/websiteProxy.js';
import { extractSectionsFromHTML } from '../src/services/websiteAnalyzer.js';

// Mock Mongoose to avoid connection errors if models are imported
mongoose.set('strictQuery', false);

async function testExtraction(url: string) {
  console.log(`\n🔍 Testing extraction for: ${url}`);
  console.log('----------------------------------------');

  try {
    // 1. Fetch and Extract Complete Website
    console.log('1️⃣  Fetching website content...');
    const startTime = Date.now();
    const extracted = await extractCompleteWebsite(url);
    const duration = Date.now() - startTime;
    
    console.log(`   ✅ Fetch complete in ${duration}ms`);
    console.log(`   📄 HTML Size: ${(extracted.html.length / 1024).toFixed(2)} KB`);
    console.log(`   🎨 CSS Size: ${(extracted.css.length / 1024).toFixed(2)} KB`);

    // 2. Analyze CSS
    console.log('\n2️⃣  Analyzing CSS...');
    const cssAnalysis = extractCSSFromWebsite(extracted.html);
    console.log(`   🎨 Global Background: ${cssAnalysis.globalStyles.backgroundColor}`);
    console.log(`   📝 Global Text Color: ${cssAnalysis.globalStyles.color}`);
    console.log(`   🔤 Global Font: ${cssAnalysis.globalStyles.fontFamily}`);
    console.log(`   📊 Selectors Found: ${cssAnalysis.selectors.length}`);

    // 3. Extract Sections
    console.log('\n3️⃣  Extracting Sections...');
    const sections = extractSectionsFromHTML(extracted.html, extracted.css, url);
    
    console.log(`   🧩 Found ${sections.length} sections:`);
    sections.forEach((section, i) => {
      console.log(`      ${i + 1}. [${section.type.toUpperCase()}] ${section.name} (Selector: ${section.selector})`);
      console.log(`         HTML Length: ${section.html.length} chars`);
      console.log(`         CSS Length: ${section.css.length} chars`);
    });

    if (sections.length === 0) {
      console.warn('\n⚠️  WARNING: No sections were detected! Check the extraction logic.');
    } else {
      console.log('\n✅ Extraction looks healthy!');
    }

  } catch (error: any) {
    console.error('\n❌ Extraction Failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Headers:', error.response.headers);
    }
  }
}

// Get URL from command line args
const url = process.argv[2];
if (!url) {
  console.error('Please provide a URL: npx tsx scripts/test-extraction.ts <url>');
  process.exit(1);
}

testExtraction(url);

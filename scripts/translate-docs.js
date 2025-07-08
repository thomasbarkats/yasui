#!/usr/bin/env node

/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * VitePress Translation Utility
 * Automatically translates content from /en to target languages using Claude SDK
 */

const fs = require('fs').promises;
const path = require('path');

// Load environment variables from .env file
function loadEnv() {
  try {
    const envPath = path.join(__dirname, '.env');
    const envContent = require('fs').readFileSync(envPath, 'utf8');

    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const [key, ...valueParts] = trimmedLine.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      }
    });
    console.log('Loaded environment variables from .env');
  } catch {
    console.warn('No .env file found in scripts directory');
  }
}

// Load environment variables
loadEnv();

// Import Anthropic SDK
const Anthropic = require('@anthropic-ai/sdk');

const CONFIG = {
  sourceDir: './docs/en',
  configDir: './docs/.vitepress/config',
  docsDir: './docs',
  supportedLanguages: {
    'fr': 'French',
    'es': 'Spanish',
    'zh': 'Chinese (Simplified)'
  }
};

const args = process.argv.slice(2);
const forceTranslation = args.includes('--force');

if (!process.env.CLAUDE_API_KEY) {
  console.error('Error: CLAUDE_API_KEY environment variable is required');
  process.exit(1);
}

console.log('API Key loaded:', process.env.CLAUDE_API_KEY ? '✓' : '✗');
console.log('Supported languages:', Object.keys(CONFIG.supportedLanguages).length);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Function to estimate token count (rough approximation)
function estimateTokens(text) {
  // Rough estimation: 1 token ≈ 4 characters for most languages
  return Math.ceil(text.length / 4);
}

async function callClaudeAPI(
  content,
  targetLanguageName,
  fileType = 'markdown',
  targetLangCode = ''
) {
  const basePrompts = {
    markdown: `Translate this VitePress markdown content to ${targetLanguageName}. 

CRITICAL: Your response must contain ONLY the translated content. Do not add any notes, explanations, or offers to continue.

Rules:
- Keep frontmatter (---) unchanged
- Keep markdown syntax unchanged  
- Keep code blocks unchanged
- Translate only readable text
- Output the complete translation
- Stop when translation is complete

Content:
${content}`,

    typescript: `You are a professional technical translator. Translate this TypeScript VitePress configuration to ${targetLanguageName}.

STRICT REQUIREMENTS:
1. Keep ALL TypeScript syntax and structure exactly as is
2. Translate ONLY text values in strings (titles, labels, nav items, etc.)
3. Keep ALL property names, imports, and code structure unchanged
4. Translate comments that contain TODO
5. Update link paths to include /${targetLangCode}/ prefix where appropriate
6. Return ONLY the complete TypeScript code
7. Do not add any explanatory notes or commentary

CONTENT TO TRANSLATE:
${content}`
  };

  try {
    console.log(`Making API request using Anthropic SDK (${fileType})`);
    console.log(`Estimated tokens: ${estimateTokens(content)}`);

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL,
      // eslint-disable-next-line camelcase
      max_tokens: 8000,
      temperature: 0.1,
      messages: [{
        role: 'user',
        content: basePrompts[fileType]
      }]
    });

    console.log('Response received successfully');

    if (!message.content || !message.content[0] || !message.content[0].text) {
      console.error('Unexpected API response structure:', JSON.stringify(message, null, 2));
      throw new Error('Invalid response structure from API');
    }

    let translatedContent = message.content[0].text.trim();

    return translatedContent;
  } catch (error) {
    console.error('API request failed:', error.message);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);
    if (error.status) { console.error('HTTP Status:', error.status); }
    if (error.error) { console.error('API Error:', JSON.stringify(error.error, null, 2)); }
    if (error.code) { console.error('Error Code:', error.code); }
    if (error.cause) { console.error('Error Cause:', error.cause); }
    throw error;
  }
}

async function getAllFiles(dir, extensions = ['.md']) {
  const files = [];

  async function scanDir(currentDir) {
    const items = await fs.readdir(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        await scanDir(fullPath);
      } else if (extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  await scanDir(dir);
  return files;
}

async function translateFile(sourcePath, targetPath, targetLang) {
  try {
    let skipTranslation = false;
    
    if (!forceTranslation) {
      try {
        await fs.access(targetPath);
        console.log(`File exists, skipping translation but updating links: ${path.relative(process.cwd(), targetPath)}`);
        skipTranslation = true;
      } catch {
        // File doesn't exist, continue with full translation
      }
    }

    const targetDir = path.dirname(targetPath);
    await fs.mkdir(targetDir, { recursive: true });

    let finalContent;

    if (skipTranslation) {
      // File exists, just read it and update links
      finalContent = await fs.readFile(targetPath, 'utf8');
      console.log(`Reading existing file: ${path.relative(process.cwd(), targetPath)}`);
    } else {
      // File doesn't exist or force translation, do full translation
      const content = await fs.readFile(sourcePath, 'utf8');
      const fileType = sourcePath.endsWith('.ts') ? 'typescript' : 'markdown';

      console.log(`Translating: ${path.relative(process.cwd(), sourcePath)}`);
      console.log(`Content length: ${content.length} characters`);
      console.log(`Estimated tokens: ${estimateTokens(content)}`);

      const translatedContent = await callClaudeAPI(
        content,
        CONFIG.supportedLanguages[targetLang],
        fileType,
        targetLang
      );

      // For TypeScript config files, update the export name
      finalContent = translatedContent;
      if (fileType === 'typescript') {
        finalContent = translatedContent.replace(/export const \w+Config/, `export const ${targetLang}Config`);
      }

      // Rate limiting between files (only for actual translation)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Always update links for markdown files (whether translated or existing)
    const fileType = sourcePath.endsWith('.ts') ? 'typescript' : 'markdown';
    if (fileType === 'markdown') {
      const contentWithUpdatedLinks = replaceLinksWithLanguagePrefix(finalContent, targetLang);
      
      // Only write if links were actually updated
      if (contentWithUpdatedLinks !== finalContent) {
        finalContent = contentWithUpdatedLinks;
        console.log(`Updated links in: ${path.relative(process.cwd(), targetPath)}`);
      }
    }

    await fs.writeFile(targetPath, finalContent, 'utf8');
    
    if (!skipTranslation) {
      console.log(`Completed translation: ${path.relative(process.cwd(), targetPath)}`);
      console.log(`Output length: ${finalContent.length} characters`);
    } else {
      console.log(`Updated links: ${path.relative(process.cwd(), targetPath)}`);
    }

  } catch (error) {
    console.error(`Failed to process ${sourcePath}: ${error.message}`);
    throw error;
  }
}

// Function to replace internal links with language prefix
function replaceLinksWithLanguagePrefix(content, targetLang) {
  let updatedContent = content;

  // 1. Markdown links: [text](/anything) -> [text](/lang/anything)
  updatedContent = updatedContent.replace(
    /\[([^\]]+)\]\(\/([^)]+)\)/g,
    `[$1](/${targetLang}/$2)`
  );

  // 2. HTML href links: href="/anything" -> href="/lang/anything"  
  updatedContent = updatedContent.replace(
    /href="\/([^"]+)"/g,
    `href="/${targetLang}/$1"`
  );

  // 3. YAML frontmatter links: link: /anything -> link: /lang/anything
  updatedContent = updatedContent.replace(
    /(link:\s+)\/([^\s\n]+)/g,
    `$1/${targetLang}/$2`
  );

  // 4. Clean up: remove language from external URLs and fix double prefixes
  updatedContent = updatedContent
    .replace(new RegExp(`(https?://[^"\\)\\s]+)/${targetLang}/`, 'g'), '$1/')
    .replace(new RegExp(`/${targetLang}/${targetLang}/`, 'g'), `/${targetLang}/`);

  return updatedContent;
}

async function main() {
  const languages = Object.keys(CONFIG.supportedLanguages);
  console.log(`Starting translation to all languages: ${languages.join(', ')}`);
  console.log(`Source: ${CONFIG.sourceDir}`);

  try {
    // Check source directory exists
    await fs.access(CONFIG.sourceDir);

    // Get all markdown files once
    const markdownFiles = await getAllFiles(CONFIG.sourceDir, ['.md']);
    console.log(`Found ${markdownFiles.length} markdown files`);

    // Process each language
    for (const targetLang of languages) {
      console.log(`\nProcessing language: ${CONFIG.supportedLanguages[targetLang]} (${targetLang})`);

      // Translate markdown files
      for (const file of markdownFiles) {
        const relativePath = path.relative(CONFIG.sourceDir, file);
        const targetPath = path.join(CONFIG.docsDir, targetLang, relativePath);
        await translateFile(file, targetPath, targetLang);
      }

      // Translate config file
      const sourceConfigPath = path.join(CONFIG.configDir, 'en.ts');
      const targetConfigPath = path.join(CONFIG.configDir, `${targetLang}.ts`);

      try {
        await fs.access(sourceConfigPath);
        await translateFile(sourceConfigPath, targetConfigPath, targetLang);
      } catch {
        console.warn(`Config file not found: ${sourceConfigPath}`);
      }

      console.log(`Completed ${targetLang}`);
    }

    console.log('\nAll translations completed successfully');
    console.log(`Translated to: ${languages.join(', ')}`);
    console.log('Remember to update your config.mts to include all new locales');

  } catch (error) {
    console.error('Translation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

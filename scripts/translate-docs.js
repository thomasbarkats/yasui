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

async function callClaudeAPI(content, targetLanguageName, fileType = 'markdown', targetLangCode = '') {
  const prompts = {
    markdown: `Translate this VitePress markdown content to ${targetLanguageName}.

Rules:
- Keep ALL frontmatter (between ---) exactly as is
- Preserve markdown syntax, links, code blocks, HTML tags
- Translate only readable text content
- Keep technical terms and code unchanged
- Maintain structure and formatting
- Return only the translated content

Content:
${content}`,

    typescript: `Translate this TypeScript VitePress configuration to ${targetLanguageName}.

Rules:
- Keep all TypeScript syntax and structure
- Translate only text values in strings (titles, labels, nav items, etc.)
- Keep all property names, imports, and code structure unchanged
- Translate comments that contain TODO
- Update link paths to include /${targetLangCode}/ prefix where appropriate
- Return only the TypeScript code without any markdown formatting or code blocks

Content:
${content}`
  };

  try {
    console.log('Making API request using Anthropic SDK');
    console.log(`Using model: ${process.env.CLAUDE_MODEL}`);

    const message = await anthropic.messages.create({
      model: process.env.CLAUDE_MODEL,
      // eslint-disable-next-line camelcase
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompts[fileType]
      }]
    });

    console.log('Response received successfully');

    if (!message.content || !message.content[0] || !message.content[0].text) {
      console.error('Unexpected API response structure:', JSON.stringify(message, null, 2));
      throw new Error('Invalid response structure from API');
    }

    return message.content[0].text;
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
    if (!forceTranslation) {
      try {
        await fs.access(targetPath);
        console.log(`Skipping existing file: ${path.relative(process.cwd(), targetPath)}`);
        return;
      } catch {
        // File doesn't exist, continue translation
      }
    }

    const content = await fs.readFile(sourcePath, 'utf8');
    const fileType = sourcePath.endsWith('.ts') ? 'typescript' : 'markdown';

    console.log(`Translating: ${path.relative(process.cwd(), sourcePath)}`);

    const targetDir = path.dirname(targetPath);
    await fs.mkdir(targetDir, { recursive: true });

    const translatedContent = await callClaudeAPI(content, CONFIG.supportedLanguages[targetLang], fileType, targetLang);

    // For TypeScript config files, update the export name
    let finalContent = translatedContent;
    if (fileType === 'typescript') {
      finalContent = translatedContent.replace(/export const \w+Config/, `export const ${targetLang}Config`);
    }

    await fs.writeFile(targetPath, finalContent, 'utf8');
    console.log(`Completed: ${path.relative(process.cwd(), targetPath)}`);

    // Rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

  } catch (error) {
    console.error(`Failed to translate ${sourcePath}: ${error.message}`);
    throw error;
  }
}

async function updateGitignore(targetLang) {
  const gitignorePath = '.gitignore';
  const ignorePattern = `docs/${targetLang}/`;

  try {
    let content = '';
    try {
      content = await fs.readFile(gitignorePath, 'utf8');
    } catch {
      // File doesn't exist
    }

    if (!content.includes(ignorePattern)) {
      content += `\n# Auto-translated files\n${ignorePattern}\n`;
      await fs.writeFile(gitignorePath, content, 'utf8');
      console.log(`Updated .gitignore: ${ignorePattern}`);
    }
  } catch (error) {
    console.warn(`Could not update .gitignore: ${error.message}`);
  }
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

      // Update .gitignore
      await updateGitignore(targetLang);

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

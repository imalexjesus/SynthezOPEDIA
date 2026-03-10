// Utility script to find photos on Wikimedia Commons
// Usage: node photoFinder.js "search term"

const https = require('https');

/**
 * @param {string} query
 * @returns {Promise<Array<{ title: string }>>}
 */
async function searchWikimedia(query) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=5`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.query.search);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * @param {string} title
 * @returns {Promise<string | null>}
 */
async function getImageUrl(title) {
  return new Promise((resolve, reject) => {
    const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(title)}&prop=imageinfo&iiprop=url|dimensions&format=json`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query.pages;
          const pageId = Object.keys(pages)[0];
          if (pages[pageId].imageinfo) {
            resolve(pages[pageId].imageinfo[0].url);
          } else {
            resolve(null);
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

/**
 * @param {string} modelName
 * @param {string} brand
 * @returns {Promise<void>}
 */
async function findPhotos(modelName, brand) {
  console.log(`Searching for: ${brand} ${modelName}`);
  
  const searchTerms = [
    `${brand} ${modelName}`,
    `${modelName} ${brand}`,
    `${brand} ${modelName} synthesizer`,
    `${modelName} keyboard`
  ];
  
  for (const term of searchTerms) {
    try {
      const results = await searchWikimedia(term);
      if (results.length > 0) {
        console.log(`\nFound ${results.length} results for "${term}":`);
        for (const result of results.slice(0, 3)) {
          console.log(`  - ${result.title}`);
          const imageUrl = await getImageUrl(result.title);
          if (imageUrl) {
            console.log(`    Image: ${imageUrl}`);
          }
        }
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      console.log(`Error searching for "${term}": ${message}`);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node photoFinder.js "model name" [brand]');
    process.exit(1);
  }
  
  const modelName = args[0];
  const brand = args[1] || '';
  
  findPhotos(modelName, brand).catch(console.error);
}

module.exports = { searchWikimedia: searchWikimedia, getImageUrl, findPhotos };

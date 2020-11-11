const  { google }  = require('googleapis');
const customSearch = google.customsearch('v1');


const googleSearchCredentials = require('../credentials/google-search.json');


const state = require('./state');

async function robot() {
  console.log('> [image-robot] Starting...');
  const content = state.load();

  await fetchImagesOfAllSentences(content);
  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (const sentence of content.sentences){
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);

      sentence.googleSearchQuery = query;
    }
  }
  const imagesArray = await fetchGoogleAndReturnImagesLinks('albert einstein');

  async function fetchGoogleAndReturnImagesLinks(query) {
    const response = await customSearch.cse.list({
      auth: googleSearchCredentials.apikey,
      cx: googleSearchCredentials.searchEngineId,
      q: query,
      searchType: 'image',
      num: 2
    });

    if(!response){
      console.log('Response is empty');
    }

    const imageUrl =  response.data.items.map((item) => {
     return item.link
    });

    console.log(imageUrl);

     return imageUrl;
  }

}

module.exports = robot;
const  { google }  = require('googleapis');
const customSearch = google.customsearch('v1');

const imageDownloader = require('image-downloader');

const googleSearchCredentials = require('../credentials/google-search.json');


const state = require('./state');

async function robot() {
  console.log('> [image-robot] Starting...');
  const content = state.load();

  await fetchImagesOfAllSentences(content);
  await downloadAllImages(content);
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

    //Evito que algumas buscas retorne com undefined
    try{
    const imagesUrl = response.data.items.map((item) => {
      return item.link
      });
      return imagesUrl;
    }catch(error){
      return new Error(error);
    }
   
  }

  async function downloadAllImages(content) {
    content.downloadAllImages = [];

    for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++ ){
      const images = content.sentences[sentenceIndex].images;

      for(let imageIndex = 0; imageIndex < images.length; imageIndex ++){
        const imageUrl = images[imageIndex];

        try {
          if(content.downloadAllImages.includes(imageUrl)){
            throw new Error('Imagem já foi baixada');
          }
          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`);
          console.log('> Baixou images ' + imageUrl);
          break;
        } catch (error) {
          console.log(`Erro ao baixar (${imageUrl}) : Erro: ${error}`);
        }
      }
    }
  }

  async function downloadAndSave(url, fileName) {
    return imageDownloader.image({
      url, url,
      dest: `./content/${fileName}`
    })
  }

}

module.exports = robot;
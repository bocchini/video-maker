const fs = require('fs');

const gm = require('gm').subClass({imageMagick: true});
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
  await convertAllImages(content)
  await createAllSentenceImages(content);
  await createYouTubeThumbnail();
  
  state.save(content);

  async function fetchImagesOfAllSentences(content) {
    for (let sentence of content.sentences){
      const query = `${content.searchTerm} ${sentence.keywords[0]}`;
      sentence.images = await fetchGoogleAndReturnImagesLinks(query);

      sentence.googleSearchQuery = query;
    }
  }

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
      const imagesUrl = response.data.items.map((item) => item.link);
      console.log("images");
      console.log(imagesUrl);
      return imagesUrl;
    }catch(error){
      return new Error(error);
    }
   
  }

  async function downloadAllImages(content) {
    console.log('*** Download images ***');
    content.downloadedImages = []

    for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
      const images = content.sentences[sentenceIndex].images

      for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
        const imageUrl = images[imageIndex]

        try {
          if (content.downloadedImages.includes(imageUrl)) {
            throw new Error('Image already downloaded')
          }

          await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
          content.downloadedImages.push(imageUrl)
          console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`)
          break
        } catch(error) {
          console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)
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

  async function convertAllImages(content) {

      for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
        await convertImage(sentenceIndex);
      }
   
  }

  async function convertImage(sentenceIndex){
    console.log('*** Convert images ***');
  
    return new Promise((resolve, reject) => {    
      const inputFile = (`./content/${sentenceIndex}-original.png[0]`);
      const outputFile = (`./content/${sentenceIndex}-converted.png`);
      const width = 1920;
      const height = 1080;

      gm()
        .in(inputFile)
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-blur', '0x9')
          .out('-resize', `${width}x${height}^`)
        .out(')')
        .out('(')
          .out('-clone')
          .out('0')
          .out('-background', 'white')
          .out('-resize', `${width}x${height}`)
        .out(')')
        .out('-delete', '0')
        .out('-gravity', 'center')
        .out('-compose', 'over')
        .out('-composite')
        .out('-extent', `${width}x${height}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error)
          }

          console.log(`> [video-robot] Image converted: ${outputFile}`);
          resolve();
        })

    })
  }

  async function createAllSentenceImages(content) {
    for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
      await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text);
    }
  }

  async function createSentenceImage(sentenceIndex, sentenceText) {
    return new Promise((resolve, reject) => {
      const outputFile = `./content/${sentenceIndex}-sentence.png`;

      const templateSettings = {
        0: {
          size: '1920x400',
          gravity: 'center'
        },
        1: {
          size: '1920x1080',
          gravity: 'center'
        },
        2: {
          size: '800x1080',
          gravity: 'west'
        },
        3: {
          size: '1920x400',
          gravity: 'center'
        },
        4: {
          size: '1920x1080',
          gravity: 'center'
        },
        5: {
          size: '800x1080',
          gravity: 'west'
        },
        6: {
          size: '1920x400',
          gravity: 'center'
        }

      }

      gm()
        .out('-size', templateSettings[sentenceIndex].size)
        .out('-gravity', templateSettings[sentenceIndex].gravity)
        .out('-background', 'transparent')
        .out('-fill', 'white')
        .out('-kerning', '-1')
        .out(`caption:${sentenceText}`)
        .write(outputFile, (error) => {
          if (error) {
            return reject(error);
          }

          console.log(`> [video-robot] Sentence created: ${outputFile}`);
          resolve();
        });
  
    });
  }

  async function createYouTubeThumbnail() {
    return new Promise((resolve, reject) => {
      gm()
      .in('./content/0-converted.png')
      .write('./content/youtube-thumbnail.jpg', (error) => {
        if (error) {
          return reject(error);
        }

        console.log('> [video-robot] YouTube thumbnail created');
        resolve();
      })
    });
  }

}

module.exports = robot;
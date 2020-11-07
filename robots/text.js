const algorithmia = require('algorithmia');
const apiKey = require('../credentials/credential.json').apiKey;

const sentenceBoundaryDetection = require('sbd');

async function robot(content) {
  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
 // breakContentIntoSetence(content);

  async function fetchContentFromWikipedia(content) {
    const algorithmiaAuthenticated = algorithmia(apiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
    const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponde.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content){
    const withoutMarkDownAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal);
    const withoutDatesInParentheses = removeDatesInParentheses(withoutMarkDownAndMarkDown);

    content.sourceContentSanitized= withoutDatesInParentheses;

      function removeBlankLinesAndMarkDown(text){
        const allLines = text.split('\n');
        
        const withoutBlankLinesAndMarkDown = allLines.filter((line) => {
          if(line.trim().length === 0 || line.trim().startsWith('=')){
            return false;
          }
          return true;
        })

        return withoutBlankLinesAndMarkDown.join(' ');
      } 
    }

    function withoutDatesInParentheses(text){
      return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/ /g,' ');
    }

    function breackContentIntoSentences(content) {
      content.sentences = [];

      const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
      
      sentences.forEach((sentence) => {
        content.sentences.push({
          text: sentence,
          keywords:  [],
          images: [],
        })
      })

    }
    
}



module.exports = robot
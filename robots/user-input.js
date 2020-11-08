const readline = require('readline-sync');
const state = require('./state');

async function robot(){
  const content = {
    maximimSentences: 7,
  };

  content.searchTerm = askAndReturnSerachTerm();
  content.prefix = askAndReturnSerachPrefix();
  state.save(content);

  function askAndReturnSerachTerm(){
    return readline.question('Type a Wikipedia search team: ');
  }

  function askAndReturnSerachPrefix(){
    const prefixes = ['Who is', 'What is','The history of'];
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ');
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }
  
}

module.exports = robot;
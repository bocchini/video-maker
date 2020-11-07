const readline = require('readline-sync');

const robots = {
 // userInput: require('./robots/user-input'),
  text: require('./robots/text'),
}

async function start() {
  const content = {};

  content.searchTerm = askAndReturnSerachTerm();
  content.prefix = askAndReturnSerachPrefix();

  await robots.text(content);


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

start();
const readline = require('readline-sync');

function start() {
  const content = {};

  content.searchTerm = askAndReturnSerachTerm();
  content.prefix = askAndReturnSerachPrefix();


  function askAndReturnSerachTerm(){
    return readline.question('Type a Wikipedia search team: ');
  }

  function askAndReturnSerachPrefix(){
    const prefixes = ['Who is', 'What is','The history of'];
    const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ');
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }

  console.log(content);
}

start();
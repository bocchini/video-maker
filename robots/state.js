const fs = require('fs');
const contentFilePath = './content.json';

function  save(content) {
  console.log('*** Saving... ***')
  const contentString = JSON.stringify(content);
  return fs.writeFileSync(contentFilePath, contentString);

}

function load() {
  console.log('*** Loading... ***')
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8');
  const contentJson = JSON.parse(fileBuffer);
  return contentJson;
}


module.exports = {
  save,
  load,
}


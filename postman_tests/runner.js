'use strict';
const fs = require('fs');
const path = require('path');

const newman = require('newman');
const environmentFile = require('./RQP - Review.postman_environment.json');

describe('Postman: ', () => {
  let envData = null;
  const branch = process.env.BRANCH || process.env.npm_config_branch;
  if (branch && branch !== 'master') {
    envData = setEnvData(branch);
  }
  let collections = findAllCollectionsAndData();

  for (let i = 0; i < collections.length; i++) {
    let collection = collections[i];
    const maxTimeout = 50000;
    const data = collection.dataFile ? require(collection.dataFile) : [];
    const timeout = collection.dataFile ? data.length * maxTimeout : maxTimeout;
    const iterations = data.length;
    const postmanCollection = require(collection.collection);

    it(`Api Tests Collection - ${collection.name}`, done => {
      runTest(collection.name, postmanCollection, collection.dataFile, envData || environmentFile, iterations, done)
    }).timeout(timeout);
  };
});


function setEnvData(branch) {
  const envData = environmentFile;
  const envKey = envData.values.filter(val => val.key === 'env')[0];
  envKey.value = `-${branch}`;
  envData.values = envKey;
  return envData;
}

function findAllCollectionsAndData() {
  let directories = fs.readdirSync(__dirname).filter(file => fs.statSync(path.join(__dirname, file)).isDirectory())
  return directories.map(dir => {
    let dataFilePath = path.join(__dirname, dir, 'data.json');
    let result = {
      name: dir, collection: `./${dir}/collection.json`,
      dataFile: fs.existsSync(dataFilePath) ? dataFilePath : undefined
    }
    console.log(dir, result);
    return result;
  })
}

function runTest(name, collection, dataFile, environment, iterations, done) {
  newman.run({
    environment: environment,
    collection: collection,
    reporters: 'cli',
    insecure: true,
    iterationData: dataFile, 
    iterationCount: iterations,
  })
    .on('start', () => {
      console.log('Starting newman test collection: ', name);
    })
    .on('done', (err, summary) => {
      if (err || summary.run.failures.length > 0) {
        outputTestFailures(summary.run.failures);
        process.exit(1);
        done(new Error(`\n ${name} collection run encountered failures`));
      } else {
        console.log(`\n  ${name} collection run completed. :partyparrot:`);
        done();
      }
    });
}


function outputTestFailures(failures) {
  failures.forEach(item => {
    console.log(`Test: ${item.source.name} failed - ${item.error.stack}`);
  });
}
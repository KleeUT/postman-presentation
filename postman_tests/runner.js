"use strict";
const fs = require("fs");
const path = require("path");

const newman = require("newman");
const environmentFile = require("./postman_environment.json");

describe("Postman: ", () => {
  // Override some of the environment with branch information
  let envData = null;
  const branch = process.env.BRANCH || process.env.npm_config_branch;
  if (branch && branch !== "master") {
    envData = setEnvData(branch);
  }
  
  // Bring in collections and data.
  let collections = findAllCollectionsAndData();

  for (let i = 0; i < collections.length; i++) {
    let collection = collections[i];
    const maxTimeout = 50000;

    // Require data as object[]
    const data = collection.dataFile ? require(collection.dataFile) : [];
    // require collection as json object
    const postmanCollection = require(collection.collection);
    
    const timeout = collection.dataFile ? data.length * maxTimeout : maxTimeout;
    const iterations = data.length;


    // Use the name of the directory as the name of the Mocha test
    it(`Api Tests Collection - ${collection.name}`, done => {
      runTest(
        collection.name,
        postmanCollection,
        collection.dataFile,
        envData || environmentFile,
        iterations,
        done
      );
    }).timeout(timeout);
  }
});

function setEnvData(branch) {
  const envData = environmentFile;
  const envKey = envData.values.filter(val => val.key === "env")[0];
  envKey.value = `-${branch}`;
  envData.values = envKey;
  return envData;
}

function findAllCollectionsAndData() {
  let collectionsDir = path.join(__dirname, "collections");
  let directories = fs
    .readdirSync(collectionsDir)
    .filter(file => fs.statSync(path.join(collectionsDir, file)).isDirectory());
    // Build up collections and data files based on the directory convention
  return directories.map(dir => {
    let dataFilePath = path.join(collectionsDir, dir, "data.json");
    let result = {
      name: dir,
      collection: `./collections/${dir}/collection.json`,
      dataFile: fs.existsSync(dataFilePath) ? dataFilePath : undefined
    };
    return result;
  });
}

function runTest(name, collection, dataFile, environment, iterations, done) {
  newman
    .run({
      environment: environment,
      collection: collection,
      reporters: "cli",
      insecure: true,
      iterationData: dataFile,
      iterationCount: iterations
    })
    .on("start", () => {
      console.log("Starting newman test collection: ", name);
    })
    .on("done", (err, summary) => {
      if (err || summary.run.failures.length > 0) {
        outputTestFailures(summary.run.failures);
        done(new Error(`\n ${name} collection run encountered failures`));
      } else {
        // obligatory party parrot
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

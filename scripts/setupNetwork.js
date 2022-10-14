const fs = require("fs");
const networks = require("../networks.json");

const YAML = require("yaml");

/**
 * setupNetwork.js
 * 
 * sync the manifest with the desired network from networks.json
 * 
 * call `yarn network <network name>` or `npm run <network name>`
 * network name defaults to localhost
 * 
 */

// grab address based on param given
function findNetwork() {
    let networkName = "localhost";
    let index = process.argv.findIndex((item) => item === ":") + 1;

    // check within range
    if (index > 0 && index < process.argv.length) {
        networkName = process.argv[index];
    }
    return networkName;
}

function getAddresses(desiredChain) {
    if (!networks[desiredChain]) {
        throw Error("Requested network does not exist in networks.json");
    }
    return networks[desiredChain];
}

function changeNetworkForSources(array, networkName) {
    if (array) {
        array.forEach(item => {
            item.network = networkName;
        })
    }
}

function setupNetwork() {
    let networkName = findNetwork();

    console.log("Setting network:", networkName);

    const addresses = getAddresses(networkName);

    // now replace each thing with what we want

    const manifestFile = fs.readFileSync("subgraph.yaml", "utf8");
    let subgraphManifest = YAML.parse(manifestFile);

    // loop through data sources of the manifest and replace all of their addresses
    let dataSource;
    for (var i = 0; i < subgraphManifest.dataSources.length; i++) {
        dataSource = subgraphManifest.dataSources[i];
        if (!addresses[dataSource.name] || !addresses[dataSource.name].address) {
            throw new Error(`Data source from Manifest: ${dataSource.name} does not have an address in networks.json for the network: ${networkName}`);
        } else {
            // dataSource exists, set address
            let newAddress = addresses[dataSource.name].address;
            let newStartBlock = addresses[dataSource.name].startBlock || 0;
            subgraphManifest.dataSources[i].source.address = newAddress;
            subgraphManifest.dataSources[i].source.startBlock = newStartBlock;
        }
    }

    // rename data sources for each data source
    let changeToNetwork = (networkName === 'localhost') ? 'mainnet' : networkName;
    changeNetworkForSources(subgraphManifest.dataSources, changeToNetwork);
    changeNetworkForSources(subgraphManifest.templates, changeToNetwork);

    // overwrite the manifest file with the changes
    fs.writeFileSync("subgraph.yaml", YAML.stringify(subgraphManifest));
}
setupNetwork();

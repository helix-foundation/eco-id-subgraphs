- [Development](#development)
- [Manifest](#manifest)
- [Entities](#entities)
- [Mappings](#mappings)
- [Production](#production)
- [Contributing](#contributing)
- [License](#license)

## Development

Running the subgraph in development is a task on it's own, in order to run the subgraph in conjunction with the [local ganache chain](https://github.com/helix-foundation/currency), you must first start the blockchain, then deploy and fetch the following addresses:

- [EcoID](https://github.com/helix-foundation/eco-id)
- [EcoClaim](https://github.com/helix-foundation/eco-claim)

Once you have the addresses, paste them into [networks.json](./networks.json) under 'localhost', then run `yarn network` to sync the `subgraph.yaml` file.

Start up the graph node from the submodule by running the command `yarn graph-node` (if you haven't added the submodule yet, run `git submodule update --init`)

Once you start up the graph-node, run `yarn create-local` once to create your subgraph on the local node. Then to deploy (or redeploy after making changes), run `yarn deploy-local`.

If you make changes to entities in `schema.graphql` or add templates or data sources to `subgraph.yaml`, run `yarn codegen` to generate AssemblyScript code before working on mappings.

Once you have successfully deployed the subgraph locally you can test queries [here](http://localhost:8000/subgraphs/name/ecographs/eco-id-subgraphs)


## Manifest

The manifest is the [subgraph.yaml](./subgraph.yaml) file in the root directory.

This file outlines the contracts that take part in the subgraphs, referred to as **data sources** for static contracts, or **data source templates** for dynamic contracts. Each data source has **eventHandlers**, which define what mapping functions will be called when the on-chain event is emitted. see [mappings](#mappings).

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#the-subgraph-manifest)

## Entities

The entities are defined in the [schema.graphql](./schema.graphql) file. Entities are graphql objects that are created by your mapping functions, and similair to sql tables, they can be used to make queries using the graphql protocol.

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#defining-entities)

## Mappings

Mappings are the AssemblyScript functions that fire when the graph node detects an event pre-defined in the manifest for a data source or template. You can use them to create/update/delete entities or add new contract templates.

[See more](https://thegraph.com/docs/en/developer/create-subgraph-hosted/#writing-mappings)

[AssemblyScript API](https://thegraph.com/docs/en/developer/assemblyscript-api/)


## Production

In order to deploy the subgraph to the hosted service, put new contract addresses in the object in `networks.json` with the key `"mainnet"`, use the exact same structure as the goerli and localhost objects, where each contract has `address` and `startBlock` attributes.

copy the `startBlock` from the EcoID contract to the EcoClaim startBlock. Do not use a a startBlock of 0 as the subgraph will try to listen for events from the very beginning of the network.

Once the `networks.json` file has the mainnet configuration, run `yarn network mainnet` and `graph deploy --product hosted-service <your account>/<your subgraph project>` to deploy the subgraph to the hosted service.

## Contributing
Contributions are welcome. Please submit any issues as issues on GitHub, and open a pull request with any contributions.

## License
[MIT (c) Helix Foundation](./LICENSE)
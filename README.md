# ens-updater

> Manage ENS names from the commandline

ens-updater enables automated update of e.g. contentHash records in the Ethereum Name System. 

## Table of Contents

- [Overview](#overview)
- [Security](#security)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Overview
### Design goals:
 - provide an all-purpose cli for managing ENS names
 - integrate well in deployment scripts and CI environments

### Notable features:
- Get/set ENS name records
- For each operation verifies that the resolver contract of an ENS-name implements the required interface 
via EIP165 "supportsInterface"
- Show interfaces a resolver implements (command "listInterfaces")
- Bash completion support (try command "completion" to set it up)  
- Can read input from stdin to support piping with other tools
- Options can be set via json configfile (see [config file support](#config-file-support))

## Security
In order to perform an update of an ENS record, `ens-update` needs the private key of the
Ethereum account controlling the ENS name. The private key needs to be provided through the file
`.env` in the working directory.

- **NEVER share .env file with anybody**
- **NEVER check .env into version control**
- **NEVER publish .env in any other way**


The private key can be provided either directly or through a mnemonic
#### Provide the mnemonic
Example contents of `.env`:
```bash
MNEMONIC=<mnemonic phrase here>
```
By default the first account will be used. If you need to use another account provide the option --accountindex.

Remember - The mnemonic gives full control to all accounts of the according wallet!
#### Provide the private key
Example contents of `.env`:
```bash
PRIVATE_KEY=<private key here, without leading 0x>
```

## Background
For information on the Ethereum Name System see the [ENS documentation](https://docs.ens.domains/).

## Install

```
npm install -g @triplespeeder/ens-updater
```

## Usage
The following commands are implemented:
 - get/set contenthash
 - get/set Ethereum address
 - get list of interfaces resolver supports
 - setup bash completion

PRs to extend functionality are welcome :)

```
> ens-updater --help
Usage: ens-updater <command> [options]

Commands:
  ens-updater setContenthash <ensname> <contenttype>        Set the contenthash for an ENS name
  <contenthash>
  ens-updater getContenthash <ensname>                      Get the contenthash for an ENS name
  ens-updater setAddress <ensname> <address>                Set the address for an ENS name
  ens-updater getAddress <ensname>                          Get the address for an ENS name
  ens-updater listInterfaces <ensname>                      Get list of interfaces resolver supports
  ens-updater completion                                    generate completion script

Options:
  --version           Show version number                                                              [boolean]
  --verbose, -v       Verbose output                                                  [boolean] [default: false]
  --web3              Web3 connection string                                                 [string] [required]
  --dry-run           Do not perform any real transactions                            [boolean] [default: false]
  --accountindex, -i  Account index. Defaults to 0                                         [number] [default: 0]
  --registryaddress   Optional contract address of the ENS Registry.                                    [string]
  --help, -h          Show help                                                                        [boolean]

contact: michael@m-bauer.org
github: https://github.com/TripleSpeeder/ens-updater
```

#### Example
On Ropsten network, set the contentHash of the name `ens-updater.eth` to the IPFS CID `QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU`:
```
> ens-updater setContenthash ens-updater.eth --contenttype ipfs-ns --contenthash QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU --web3 http://ropsten.dappnode:8545 --verbose
Setting up web3 & HDWallet provider...
        Running on chain ID 3
Verifying ensName owner
Verifying content hash...
Updating contenthash...
        Successfully stored new contentHash. Transaction hash: 0x0b8cdb75ff3b514c974ccd0bdef7cc3557bfab934b39caba30c38b88d375d705.
Exiting...
> 
```

#### Reading values from stdin
Setting the value "stdin" for option `contenthash` or `address` reads the contenthash from stdin. This is useful
to build a chain of commands in a deploy script. 

For example you can use [ipfs-deploy](https://www.npmjs.com/package/ipfs-deploy) to publish a website to IPFS
and directly pipe the CID returned by ipfs-deploy into ens-updater:

```
> ipfs-deploy -d dappnode | ens-updater setContenthash ens-updater.eth --contenttype ipfs-ns --contenthash stdin --web3 http://ropsten.dappnode:8545 --verbose
Getting contenthash from stdin...
         Got contenthash: QmY7Yh4UquoXHLPFo2XbhXkhBvFoPwmQUSa92pxnxjQuPU.
Setting up web3 & HDWallet provider...
...
```

#### Config file support
All options can be provided through a json config file. The config file can be set with
`--config <configfile.json>` option.

Example config file that sets web3 connection string and custom registry address:
```json
{
  "web3": "http://127.0.0.1:9545"
  "registryaddress": "0x112234455c3a32fd11230c42e7bccd4a84e02010",
}
```
Usage:
```
> ens-updater listInterfaces example.domain.eth --config myconfig.json
```
 
## Maintainers

[@TripleSpeeder](https://github.com/TripleSpeeder)

## Contributing

PRs are welcome! Have a look at the [open issues](https://github.com/TripleSpeeder/ens-updater/issues) or create a new 
issue if you are missing functionality.

## License

MIT 

© 2019 Michael Bauer

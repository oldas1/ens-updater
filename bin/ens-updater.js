#!/usr/bin/env node
require('dotenv').config()
const fs = require('fs');
const yargs = require('yargs')
const Web3 = require('web3')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Updater = require('../lib/index')


const main = async () => {
    try {
        const argv = yargs
        .scriptName('ens-updater')
        .usage('Usage: $0 <command> [options]')
        .command('setContenthash', 'Set the contenthash for an ENS name',
            (yargs) => {
                return yargs.options({
                    'contenttype': {
                        alias: 'type',
                        description: 'Type of content hash to set (e.g ipfs-ns, swarm-ns, ...)',
                        type: 'string',
                        demandOption: true,
                    },
                    'contenthash': {
                        alias: 'hash',
                        description: 'Content hash to set or \'stdin\' to read from stdin',
                        type: 'string',
                        demandOption: true,
                    }
                })
            }
        )
        .demandCommand(1)
        .options({
            'web3': {
                description: 'Web3 connection string',
                type: 'string',
                demandOption: true,
            },
            'accountindex': {
                alias: 'i',
                description: 'Account index. Defaults to 0',
                default: 0,
                type: 'number',
            },
            'ensname': {
                alias: 'ens',
                description: 'ENS Name to update',
                type: 'string',
                demandOption: true,
            },
            'dry-run': {
                description: 'Do not perform any real transactions',
                type: 'boolean',
                default: false,
                demandOption: false,
            },
            'quiet': {
                description: 'Suppress console output. Set this when running from a script/CI environment',
                alias: 'q',
                type: 'boolean',
                default: false,
                demandOption: false,
            },
            'registryaddress': {
                description: 'Optional contract address of the ENS Registry.',
                type: 'string',
                demandOption: false,
            }
        })
        .help()
        .alias('help', 'h')
        .strict()
        .epilog('contact: michael@m-bauer.org')
        .epilog('github: https://github.com/TripleSpeeder/ens-updater')
        .argv

        // get commandline options
        const command = argv._[0]
        const connectionString = argv.web3
        const accountIndex = argv.accountindex
        const dryrun = argv.dryRun //yes, yargs magic converts dry-run to dryRun
        const ensName = argv.ensname
        const contentType = argv.contenttype
        const verbose = !argv.quiet
        const registryAddress = argv.registryaddress
        let contentHash = argv.contenthash

        // get env options
        const mnemonic = process.env.MNEMONIC

        if (contentHash === 'stdin') {
            verbose && console.log('Getting contenthash from stdin...')
            contentHash = fs.readFileSync(0).toString();
            verbose && console.log(`\t Got contenthash: ${contentHash}.`)
        }

        verbose && console.log('Setting up web3 & HDWallet provider...')
        try {
            provider = new HDWalletProvider(mnemonic, connectionString, accountIndex)
        } catch (error) {
            throw Error(`\tCould not initialize HDWalletProvider ${error}`)
        }
        try {
            web3 = new Web3(provider)
            chainId = await web3.eth.getChainId()
            verbose && console.log('\tRunning on chain ID ' + chainId)
        } catch (error) {
            throw Error(`\tFailed to initialize web3 at ${connectionString}` )
        }

        const setupOptions = {
            web3: web3,
            ensName: ensName,
            accountIndex: accountIndex,
            verbose: verbose,
            registryAddress: registryAddress
        }

        const updater = new Updater()
        await updater.setup(setupOptions)
        await updater.setContenthash({
            dryrun: dryrun,
            contentType: contentType,
            contentHash: contentHash,
        })
        verbose && console.log("Exiting...")
        provider.engine.stop()
    } catch(error) {
        console.error(`Error occured: ${error}. Aborting`)
        process.exit(1)
    }
}

main()

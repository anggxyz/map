const Web3 = require('web3')
const network = require('./mainnet.json')
const Matic = network.Matic
const Main = network.Main

const GovernanceAbi = require('./artifacts/Governance.json').abi
const GovernanceAddress = Main.Contracts.GovernanceProxy

const RegistryAbi = require('./artifacts/Registry.json').abi
const RegistryAddress = Main.Contracts.Registry

const ChildChainAbi = require('./artifacts/ChildChain.json').abi
const ChildChainAddress = Matic.Contracts.ChildChain

const StateSenderAbi = require('./artifacts/StateSender.json').abi
const StateSenderAddress = Main.Contracts.StateSender

const web3 = new Web3()
const web3Matic = new Web3(Matic.RPC)
const web3Main = new Web3(Main.RPC)

const walletMatic = web3Matic.eth.accounts.wallet
const walletMain = web3Main.eth.accounts.wallet

const Governance = new web3Main.eth.Contract(GovernanceAbi, GovernanceAddress)
const Registry = new web3Main.eth.Contract(RegistryAbi, RegistryAddress)
const ChildChain = new web3Matic.eth.Contract(ChildChainAbi, ChildChainAddress)
const StateSender = new web3Main.eth.Contract (StateSenderAbi, StateSenderAddress)

module.exports = {
  governance: Governance, 
  registry: Registry, 
  childchain: ChildChain,
  walletMatic: walletMatic,
  walletMain: walletMain,
  stateSender: StateSender,
  web3: web3,
  owner: '0xA2D9846c352cA61dCb20D6AaD40Cec1d1b228a78'
}

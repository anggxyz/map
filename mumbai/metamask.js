const { governance, registry, childchain, owner, web3} = require('./map')
let alertArea = document.getElementById('alertArea')
let awaitingOn = document.getElementById('awaitingOn')
let msg = document.getElementById('msg')

let elements = ['loading', 'tokenDetails', 'confirmToken', 'confirmOnRoot', 'newMapping']
function changeVisibility (elements, bool) {
  if (bool) {
    visibility = 'block' 
  } else {
    visibility = 'none'
  }
  for (el in elements) {
    document.getElementById(elements[el]).style.display = visibility
  }
}
changeVisibility(elements, false)
changeVisibility(['alertArea'], true)

let accounts, mappedAddress
let token_owner, root, name, symbol, decimals, isNFT
async function init () {
  accounts = await ethereum.request({
    method: 'eth_requestAccounts',
    params: []
  })
  if (accounts[0] == owner) {
    changeVisibility(['tokenDetails'], true)
    changeVisibility(['connect'], false)
  } else {
    alertArea.innerHTML = 'Switch to owner account'
  }
  web3.setProvider(ethereum)
}

async function getDetails() {
  let token = document.tokenDetails
  
  token_owner = token.owner.value.trim()
  root = token.roottoken.value.trim()
  name  = token.name.value.trim()
  symbol = token.symbol.value.trim()
  decimals = token.decimals.value.trim()
  isNFT = token.isnft.checked
  if (isNFT) decimals = '0'

  // validations
  // check is token_owner is valid address
  if (!web3.utils.isAddress(token_owner)) {
    alertArea.innerHTML = 'Error: Token owner not valid address'
    return;
  }
  // check if root is valid address
  if (!web3.utils.isAddress(root)) {
    alertArea.innerHTML = 'Error: Root token is not valid address'
    return;
  }
  // check if decimals is number
  if (!Number.isInteger(parseInt(decimals))) {
    alertArea.innerHTML = 'Error: Decimals is not a number'
    return;
  }

  changeVisibility(['tokenDetails'], false)
  changeVisibility(['confirmToken', 'confirmTokenDetails'], true)

  let details = 
  'owner: ' + token_owner + 
  '<br>' + 
  'root: ' + root + 
  '<br>' + 
  'name: ' + name + 
  '<br>' + 
  'symbol: ' + symbol + 
  '<br>' + 
  'decimals: ' + decimals + 
  '<br>' + 
  'isNft: ' + isNFT + 
  '<br>'

  document.getElementById('confirmTokenDetails').innerHTML = `<div>` + details + `</div>`
}

async function map () {
  // changeVisibility(['confirmToken'], false)
  changeVisibility(['confirmOnRoot', 'loading'], true)
  changeVisibility(['buttonToConfirmOnRoot'], false)

  // get chain id 
  let chainId = await ethereum.chainId
  if (parseInt(chainId) != '80001') {
    msg.innerHTML = 'Switch to Child Chain, and click again'
    changeVisibility(['loading'], false)
    return;
  } else if (parseInt(chainId) == '80001') {
    msg.innerHTML = 'Sending transaction on Child'
    await childchain.setProvider(ethereum)
    await childchain.methods.addToken(
      token_owner, root, name, symbol, decimals, isNFT
    )
    .send({
      from: accounts[0]
    }).then ((res) => {
      msg.innerHTML = 'tx hash on child: ' + res.transactionHash
      // msg = 'Wait for transaction to confirm before confirming on Root.'
      document.getElementById('mappedAddressOnChild').innerHTML = 'Mapped Address on Child Chain: ' + res.events.NewToken.returnValues.token
      mappedAddress = res.events.NewToken.returnValues.token
      changeVisibility(['loading'], false)
      changeVisibility(['buttonToConfirmOnRoot'], true)

    }).catch((err) => {
      changeVisibility(['loading'], false)
      alertArea.innerHTML = 'Error; check console'
      console.log(err)
    })
  }
}

async function confirmOnRoot() {
  let chainId = await ethereum.chainId 
  changeVisibility (['loading'], true)

  if (parseInt (chainId) != 5) {
    msg.innerHTML = 'Switch to Main chain before confirming on Root. And click again'
    changeVisibility (['loading'], false)
    return;
  }

  changeVisibility (['loading'], true)
  msg.innerHTML = 'Sending tx on root'
  registry.setProvider(ethereum)
  governance.setProvider(ethereum)

  let r = await registry.methods.mapToken(
    root, mappedAddress, isNFT
  ).encodeABI()

  await governance.methods.update(
    registry.options.address, r
  ).send({
    from: accounts[0]
  }).then((res) => {
    msg.innerHTML = 'Confirmed on root: ' + res.transactionHash 
    changeVisibility(['loading'], false)
    changeVisibility(['newMapping'], true)
  }).catch((err) => {
    changeVisibility(['loading'], false)
    changeVisibility(['newMapping'], true)
    alertArea.innerHTML = 'Error; check console'
    console.log(err)
  })
}

module.exports = {
  init, getDetails, map, confirmOnRoot
}

const { ChainId, Token, WETH, Fetcher, Route } = require('@uniswap/sdk')

//function gets array with two elements which contains addresses
const getTokensPrice = async (tokens) => {
  const [firstAddress, secondAddress] = tokens
  //console.log('before start'); //test

  const secondCoin = await Fetcher.fetchTokenData(ChainId.MAINNET, firstAddress);
  const firstCoin = await Fetcher.fetchTokenData(ChainId.MAINNET, secondAddress);

  const firstCoinWETHPair = await Fetcher.fetchPairData(WETH[firstCoin.chainId], firstCoin)
  const secondCoinWETHPair = await Fetcher.fetchPairData(secondCoin, WETH[secondCoin.chainId])

  const route = new Route([firstCoinWETHPair, secondCoinWETHPair], firstCoin)

  // console.log(route.midPrice.invert().toSignificant(6))

  return route.midPrice.invert().toSignificant(6);

  //console.log('after start'); //test
};

module.exports = getTokensPrice

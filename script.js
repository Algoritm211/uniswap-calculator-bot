const { ChainId, Token, WETH, Fetcher, Route } = require('@uniswap/sdk')
var a = '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892';

const init = async() => {
  //console.log('before start'); //test
  
  const USDT = await Fetcher.fetchTokenData(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7');
  const Coin = await Fetcher.fetchTokenData(ChainId.MAINNET, a);
	
  const USDTWETHPair = await Fetcher.fetchPairData(WETH[USDT.chainId], USDT)
  const CoinWETHPair = await Fetcher.fetchPairData(Coin, WETH[Coin.chainId])

  const route = new Route([USDTWETHPair, CoinWETHPair], USDT)

  console.log(route.midPrice.invert().toSignificant(6))   
  
  //console.log('after start'); //test
};

init();

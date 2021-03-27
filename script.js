const { ChainId, Token, WETH, Fetcher, Trade, Route, TokenAmount, TradeType } = require('@uniswap/sdk')
const dai = new Token(ChainId.MAINNET, '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', 18)
const tether = new Token(ChainId.MAINNET, '0xdAC17F958D2ee523a2206206994597C13D831ec7', 6)


const init = async() => {
  //console.log('before start'); //test

  const pair = await Fetcher.fetchPairData(dai, tether);
  const route = new Route([pair], tether);
  const trade = new Trade(route, new TokenAmount(tether, '1000000'), TradeType.EXACT_INPUT);
  console.log(trade.executionPrice.invert().toSignificant(6))
  console.log(trade.nextMidPrice.invert().toSignificant(6))
  
  //console.log('after start'); //test
};

init();

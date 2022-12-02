const API_KEY = '2955fcc44909fa51f543b96a0c18e7e4ed76a0387fb1e0c08150cff1a100010c'

const tickersHandlers = new Map()
const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
const AGGREGATE_INDEX = '5'

socket.addEventListener('message', e => {
  const { TYPE: type, FROMSYMBOL: currency, PRICE: newPrice } = JSON.parse(e.data)

  if (type !== AGGREGATE_INDEX) {
    return
  }

  const handlers = tickersHandlers.get(currency) ?? []
  handlers.forEach(fn => fn(newPrice))
})

function sendToWebSocket(message) {
  const stringifiedMessage = JSON.stringify(message)

  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMessage)
    return
  }

  socket.addEventListener(
    'open',
    () => {
      socket.send(stringifiedMessage)
    },
    { once: true }
  )
}

function subscribeToTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubAdd',
    subs: [`5~CCCAGG~${ticker}~USD`],
  })
}

function unsubscribeFromTickerOnWs(ticker) {
  sendToWebSocket({
    action: 'SubRemove',
    subs: [`5~CCCAGG~${ticker}~USD`],
  })
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])

  subscribeToTickerOnWs(ticker)
}

export const unsubcribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
  unsubscribeFromTickerOnWs(ticker)
}

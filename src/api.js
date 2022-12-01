const API_KEY = '8ac1a9b152921f57064b0b7971bde839094191260cf725ab24e26d3fc052aef3'

const tickersHandlers = new Map()

const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return
  }

  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${[...tickersHandlers.keys()].join(
      ','
    )}&tsyms=USD&api_key=${API_KEY}`
  )
    .then(r => r.json())
    .then(rawData => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      )

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? []
        handlers.forEach(fn => fn(newPrice))
      })
    })
}
//
export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || []
  tickersHandlers.set(ticker, [...subscribers, cb])
}

export const unsubcribeFromTicker = ticker => {
  tickersHandlers.delete(ticker)
}

setInterval(loadTickers, 5000)

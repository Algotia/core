

const useOnData = (exchange) => ({
    onData: (cb: Function) => {
        cb(exchange);
    }
})

const createStrategy = (config, exchange) => {
    let strategy = {};
    strategy[`${config.exchangeId}`] = exchange;
    
    let userExchange = strategy[`${config.exchangeId}`];

    return Object.assign(
        strategy,
        useOnData(userExchange)
    )

}

export default createStrategy;
const useOnData = (exchange) => ({
	onData: (cb: Function) => {
		cb(exchange);
	},
});



const createStrategy = (config, exchange) => {
	let strategy = {
		exchange,
	};

	return Object.assign(strategy, useOnData(exchange));
};

export default createStrategy;

import { Balances } from "ccxt";
import { InitialBalance } from "../../types";

const createInitialBalance = (initialBalance: InitialBalance): Balances => {
	let balance: Balances;

	const keys = Object.keys(initialBalance);

	for (const currency of keys) {
		balance = Object.assign({}, balance, {
			[currency]: {
				free: initialBalance[currency],
				used: 0,
				total: initialBalance[currency],
			},
		});
	}

	balance.info = { ...balance };

	return balance;
};

export default createInitialBalance;

export class ExchangeError extends Error {
	exchangeId: string;
	constructor(message: string, exchangeId: string) {
		super(message);
		this.exchangeId = exchangeId;
	}
}

export class InsufficentBalanceError extends ExchangeError {}

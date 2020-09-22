export class BackfillInputError extends Error {
	badInput?: any;
	goodInput?: any;
	constructor(
		message: string,
		badInput?: { [key: string]: any },
		goodInput?: { [key: string]: any }
	) {
		super(message);
		this.badInput = badInput;
		this.goodInput = goodInput;
	}
}

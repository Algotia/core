interface BackfillOptions {
	sinceInput: string | number;
	untilInput?: string | number;
	pair: string;
	period?: string;
	recordLimit?: number;
	verbose?: boolean;
	logger?: Function;
	errFn: Function;
}

export { BackfillOptions };

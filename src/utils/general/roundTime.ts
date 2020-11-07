const roundTime = (
	date: Date,
	intervalMs: number,
	method: "ceil" | "floor"
) => {
	const dateMs = date.getTime();
	return new Date(Math[method](+dateMs / +intervalMs) * +intervalMs);
};

export default roundTime;

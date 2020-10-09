const isSingle = <T>(obj: any): obj is T => {
	return (typeof obj === "object" && obj.type === "single") || undefined;
};

export default isSingle;

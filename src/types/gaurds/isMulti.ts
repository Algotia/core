const isMulti = <T>(obj: any): obj is T => {
	return obj.type === "multi";
};

export default isMulti;

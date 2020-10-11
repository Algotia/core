const isSingle = <T>(obj: any): obj is T => {
	/* return (typeof obj === "object" && obj.type === "single") || undefined; */
	if (typeof obj === "object") {
		if (!obj.type) return true;
		if (obj.type === "single") return true;
	} else {
		return false;
	}
};

export default isSingle;

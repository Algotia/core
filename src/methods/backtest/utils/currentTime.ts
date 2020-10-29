import { AnyAlgotia } from "../../../types";

const currentTimePath = "current-time";

const getCurrentTime = async (algotia: AnyAlgotia): Promise<number> => {
	try {
		const timeStr = await algotia.redis.get(currentTimePath);
		return parseInt(timeStr);
	} catch (err) {
		throw err;
	}
};

const setCurrentTime = async (
	algotia: AnyAlgotia,
	time: number
): Promise<void> => {
	try {
		await algotia.redis.set(currentTimePath, time);
	} catch (err) {
		throw err;
	}
};

export { getCurrentTime, setCurrentTime };

const isCloseTo = (num1: number, num2: number, tolerance = 0.0005) => {
	return Math.abs(num1 - num2) < tolerance;
};

export default isCloseTo

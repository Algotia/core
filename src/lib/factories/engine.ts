const engine = (() => {
	let hooks = [];
	let currentHook = 0;
	return {
		useState(initialValue: any): [any, Function] {
			hooks[currentHook] = hooks[currentHook] || initialValue;
			const setStateHookIndex = currentHook;
			const setState = (newState: any): void => (hooks[setStateHookIndex] = newState);
			return [hooks[currentHook++], setState];
		},
		useEffect(callback: Function, depArray?: any[]): void {
			const hasNoDeps = !depArray;
			const deps = hooks[currentHook]; // type: array | undefined
			const hasChangedDeps = deps ? !depArray.every((el, i) => el === deps[i]) : true;
			if (hasNoDeps || hasChangedDeps) {
				callback();
				hooks[currentHook] = depArray;
			}
			currentHook++; // done with this hook
		},
		execute(strategy, data) {
			const strategyWithEffects = strategy(data);
			strategyWithEffects();
			currentHook = 0;
		}
	};
})();

export { engine };

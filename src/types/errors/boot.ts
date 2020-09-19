export class ConfigError extends Error {}

export class ExchangeConfigError extends ConfigError {
	key: string;
	value: any;
	constructor(message: string, key: string, value: any) {
		super(message);
		this.key = key;
		this.value = value;
	}
}

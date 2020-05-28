/* In order to convert this interface into a JSON schema (https://json-schema.org/), we use typescript-json-schema
(https://github.com/YousefED/typescript-json-schema). This is currently ran as a npm script but we probably want to include that
in the build process (gulp/grunt task?)
*/

export interface Config {
    exchange: Exchange
}

interface Exchange {
    exchangeId: string,
    apiKey: string,
    apiSecret: string,
    timeout: number,
}
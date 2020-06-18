# Algotia

- [What is Algotia?](#what-is-algotia)
- [Roadmap to V1](#roadmap-to-v1)
- [Quick start guide](#quick-start-guide)
- [Configuration](#configuration)

### What is Algotia?
At it's core, Algotia is a platform for executing automated cryptocurrency trading strategies written in Javascript. Inspired by projects like [Gekko](https://github.com/askmike/gekko) and [Zenbot](https://github.com/DeviaVir/zenbot), Algotia seeks to iterate on the ideas of exisiting projects while focusing on performance, strategy authoribility, and providing an inituitive API for modern algorithmic trading.

### Roadmap to V1

**Import/back-fill historical data**

- [x] Started

Issue #18

**Backtest strategies against historical data**

- [ ] Started

No issue :(

**Live/paper trading with supported exchanges**

- [ ] Started

No issue :(

---
### Quick start guide

- **Clone the project**
    - ```git clone https://github.com/Algotia/Algotia.git```
- **Create configuration file** 
    - In order for the bot to work, you must create a configuration file named `config.yaml`. As of now the file can be placed in an arbitrary location inside the project. I recommend creating a `config`folder and placing `config.yaml` inside.
    - Must follow [configuration shape](#Configuration). See example config at `config.example.yaml`.
    - ``` mkdir config && touch config.yaml```

- **Install dependencies**
    - ```npm install```

- **Build**
    - The build process is defined in the `./gulpfile.js` directory. You can run any of the exported functions from `./gulpfile.js/index.js` individually by running `npx gulp COMMAND` e.g. `npx gulp clean`.
    - ```npm run build```

- **Start** 
    - ```node dist/algotia.js [COMMAND] [...OPTIONS]```


---

### Configuration

The `config.yaml` file must have the following shape.

```
exchange: 
    exchangeId: EXCHANGE ID (string)            // Exchange ID, from cxxt (https://github.com/ccxt/ccxt)
    apiKey: API KEY (string)                    // API Key from exchange. Note: Only use 1 API Key / Secret per bot instance.
    apiSecret: API SECRET (sting)               // API Secret from exchange. 
    timeout: TIMEOUT (number)                   // Timeout between API calls. Number is in milliseconds.

```

Find the list of ccxt Exchange IDs here:
[Exchange Markets · ccxt/ccxt Wiki](https://github.com/ccxt/ccxt/wiki/Exchange-Markets)


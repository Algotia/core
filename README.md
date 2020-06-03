# Algotia

- [Usage](#Usage)
- [Configuration](#Configuration)

---

### Usage

- **Clone the project**
    - ```git clone https://github.com/Algotia/Algotia.git```
- **Create configuration file** 
    - In order for the bot to work, you must create a configuration file named `config.yaml`. As of now the file can be placed in an arbitrary location inside the project. I recommend creating a `config`folder and placing `config.yaml` inside.
    - Must follow [configuration shape](#Configuration).
    - ``` mkdir config && touch config.yaml```

- **Install dependencies**
    - ```npm install```

- **Build**
    - The build process is defined in the `./gulpfile.js` directory. You can run any of the exported functions from `./gulpfile.js/index.js` individually by running `npx gulp COMMAND` e.g. `npx gulp clean`.
    - ```npm run build```

- **Start** 
    - ```npm start```

---

### Configuration

The `config.yaml` file must have the following shape.

```
exchange: 
    exchangeId: EXCHANGE ID (string)            // Exchange ID, from cxxt (https://github.com/ccxt/ccxt)
    apiKey: API KEY (string)                    // API Key from exchange. Note: Only use 1 API Key / Secret per bot instance.
    apiSecret: API SECRET (sting)               // API Secret from exchange. 
    timeout: TIMEOUT (number)                   // Timeout between API calls. 

```

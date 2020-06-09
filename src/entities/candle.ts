import { EntitySchema } from "typeorm";

export default new EntitySchema({
    name: "candle",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true
        },
        timestamp: {
            type: Date,
        },
        open: {
            type: Number
        },
        high: {
            type: Number
        },
        low: {
            type: Number
        },
        close: {
            type: Number
        },
        volume: {
            type: Number
        }
    }
})
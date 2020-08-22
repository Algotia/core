import { MongoClient, Collection } from "mongodb";
import { BacktestInput } from "../../types";

const validateInput = async (
	backtestCollection: Collection,
	options: BacktestInput
) => {};

const initializeBacktest = async (
	client: MongoClient,
	options: BacktestInput
) => {};

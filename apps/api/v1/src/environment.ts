import "dotenv/config";
import { parseApiEnv } from "@plantingwise/config/api-env";

/** Load and validate the API environment after dotenv has populated process.env. */
export function getApiEnv() {
	return parseApiEnv(process.env);
}

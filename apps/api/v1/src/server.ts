import app from "./app.ts";
import { getApiEnv } from "./environment.ts";

const { PORT } = getApiEnv();
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Plantingwise API listening on http://localhost:${PORT}`);
});

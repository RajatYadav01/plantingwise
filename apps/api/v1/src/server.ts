import app from "./app";
import { getApiEnv } from "./environment";

const { PORT } = getApiEnv();
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Plantingwise API listening on http://localhost:${PORT}`);
});

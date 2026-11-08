import type { AnalysisResult } from "@plantingwise/schemas";
import type { CareTask, Plant } from "@plantingwise/types";

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

export const samplePlants: Plant[] = [
	{
		id: "demo-monstera",
		displayName: "Milo",
		commonName: "Monstera deliciosa",
		scientificName: "Monstera deliciosa",
		imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=900&q=85",
		confidence: "high",
		summary: "A tropical climber that enjoys bright, indirect light and a little room to grow.",
		care: {
			light: "Bright, indirect light. Avoid harsh midday sun.",
			watering: "Check the top 2–5 cm of soil; water when it feels dry, then let excess drain.",
			humidity: "Average home humidity is often workable; higher humidity can support larger leaves.",
			soil: "A chunky, well-draining mix with bark and perlite.",
		},
		createdAt: new Date(now - 18 * day).toISOString(),
		isDemo: true,
	},
	{
		id: "demo-snake",
		displayName: "Sage",
		commonName: "Snake plant",
		scientificName: "Dracaena trifasciata",
		imageUrl: "https://images.unsplash.com/photo-1593482892290-f54927ae2b8f?auto=format&fit=crop&w=900&q=85",
		confidence: "high",
		summary: "A resilient, upright plant that prefers drying out between waterings.",
		care: {
			light: "Tolerates low light, but grows best in indirect light.",
			watering: "Let most of the potting mix dry before watering; avoid standing water.",
			humidity: "Typical indoor humidity is usually fine.",
			soil: "A free-draining cactus or succulent mix.",
		},
		createdAt: new Date(now - 35 * day).toISOString(),
		isDemo: true,
	},
	{
		id: "demo-pothos",
		displayName: "Ivy",
		commonName: "Golden pothos",
		scientificName: "Epipremnum aureum",
		imageUrl: "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=900&q=85",
		confidence: "medium",
		summary: "A trailing vine that adapts well to indoor life and appreciates a consistent routine.",
		care: {
			light: "Medium to bright indirect light; lower light is tolerated.",
			watering: "Water when the top layer of mix dries and empty the saucer afterwards.",
			humidity: "Average indoor humidity is generally acceptable.",
			soil: "A standard indoor potting mix with good drainage.",
		},
		createdAt: new Date(now - 7 * day).toISOString(),
		isDemo: true,
	},
];

export const sampleTasks: CareTask[] = [
	{
		id: "demo-task-monstera-water",
		plantId: "demo-monstera",
		type: "water",
		title: "Check soil moisture",
		dueAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
		intervalDays: 7,
		completedAt: null,
		createdAt: new Date(now - 10 * day).toISOString(),
		plantName: "Milo",
		isDemo: true,
	},
	{
		id: "demo-task-snake-water",
		plantId: "demo-snake",
		type: "water",
		title: "Check if soil is dry",
		dueAt: new Date(now + 1 * day).toISOString(),
		intervalDays: 14,
		completedAt: null,
		createdAt: new Date(now - 20 * day).toISOString(),
		plantName: "Sage",
		isDemo: true,
	},
	{
		id: "demo-task-pothos-feed",
		plantId: "demo-pothos",
		type: "fertilise",
		title: "Review feeding schedule",
		dueAt: new Date(now + 3 * day).toISOString(),
		intervalDays: 30,
		completedAt: null,
		createdAt: new Date(now - 4 * day).toISOString(),
		plantName: "Ivy",
		isDemo: true,
	},
];

export const sampleIdentification: AnalysisResult = {
	mode: "identify",
	commonName: "Monstera deliciosa",
	scientificName: "Monstera deliciosa",
	confidence: "medium",
	summary:
		"The leaf shape and fenestrations are consistent with a Monstera deliciosa. A clearer photo of the whole plant and stem would improve confidence.",
	observations: ["Broad, glossy green leaf with natural splits.", "The visible leaf surface appears mostly green in this example image."],
	care: {
		light: "Bright, indirect light; avoid strong midday sun through glass.",
		watering: "Check the top few centimetres of soil and water only when they feel dry.",
		humidity: "Average home humidity can work; moderate humidity may encourage larger leaves.",
		soil: "Use a chunky, well-draining indoor plant mix.",
	},
	caveats: [
		"This is an illustrative sample, not an analysis of your photo.",
		"Plant identification from a single image can be uncertain.",
	],
};

export const sampleHealthResult: AnalysisResult = {
	mode: "health",
	commonName: "Monstera deliciosa",
	confidence: "low",
	summary: "Yellowing can have several causes. Review soil moisture, drainage, and recent changes before changing the care routine.",
	observations: ["The example report is based on a generic yellow-leaf scenario, not an inspection of your plant."],
	possibleCauses: [
		{
			label: "Soil staying wet for too long",
			reasoning: "Yellowing can occur when roots remain in poorly aerated, saturated soil.",
			safeNextStep: "Check soil moisture and drainage first. Let the mix dry appropriately for the plant before watering again.",
		},
		{
			label: "Normal older-leaf turnover",
			reasoning: "An occasional older leaf may yellow as a plant grows.",
			safeNextStep: "Check whether the issue affects one old leaf or several new leaves, and monitor changes over a few days.",
		},
	],
	caveats: [
		"Possible causes are not a definitive diagnosis.",
		"This is an illustrative sample, not an analysis of your photo.",
		"For persistent or rapidly worsening problems, consult a knowledgeable local nursery or plant-care professional.",
	],
};

import { discoverAgents, getAgent } from "/Users/Viachaslau_Kudzinau/Projects/pstack-port/refs/omp-src/packages/coding-agent/src/task/discovery.ts";

const repo = "/Users/Viachaslau_Kudzinau/Projects/pstack-port/pstack-omp";
const cwd = "/tmp/phaseb-probe";
const home = "/Users/Viachaslau_Kudzinau";

const { agents, projectAgentsDir } = await discoverAgents(cwd, home, {
	explicit: [repo],
	mode: "merge",
	configured: [],
});
console.log("projectAgentsDir:", projectAgentsDir);
console.log("discovered:", agents.map(a => a.name).join(", "));
const poteto = getAgent(agents, "poteto-agent");
console.log("poteto-agent found via extension root:", poteto !== undefined);
if (poteto) {
	console.log("systemPrompt first line:", poteto.systemPrompt.split("\n")[0]);
	console.log("systemPrompt mentions is_background:", poteto.systemPrompt.includes("is_background"));
}

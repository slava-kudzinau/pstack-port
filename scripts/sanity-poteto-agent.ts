import { discoverAgents, getAgent } from "/Users/Viachaslau_Kudzinau/Projects/pstack-port/refs/omp-src/packages/coding-agent/src/task/discovery.ts";

const cwd = "/Users/Viachaslau_Kudzinau/Projects/pstack-port/pstack-omp";
const { agents, projectAgentsDir } = await discoverAgents(cwd, "/Users/Viachaslau_Kudzinau");
console.log("projectAgentsDir:", projectAgentsDir);
console.log("discovered:", agents.map(a => a.name).join(", "));
const poteto = getAgent(agents, "poteto-agent");
console.log("poteto-agent found:", poteto !== undefined);
if (poteto) {
  console.log("model:", JSON.stringify(poteto.model));
  console.log("spawns:", JSON.stringify(poteto.spawns));
  console.log("thinkingLevel:", String(poteto.thinkingLevel));
  console.log("systemPrompt first line:", poteto.systemPrompt.split("\n")[0]);
}

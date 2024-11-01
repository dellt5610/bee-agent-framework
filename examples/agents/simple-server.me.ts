import "dotenv/config.js";
import { BeeAgent } from "bee-agent-framework/agents/bee/agent";
import { TokenMemory } from "bee-agent-framework/memory/tokenMemory";
import { DuckDuckGoSearchTool } from "bee-agent-framework/tools/search/duckDuckGoSearch";
import { OllamaChatLLM } from "bee-agent-framework/adapters/ollama/chat";
import { OpenMeteoTool } from "bee-agent-framework/tools/weather/openMeteo";
import express, { Request, Response } from 'express';


const llm = new OllamaChatLLM({
  modelId: "llama3.2:1b", // llama3.1:70b for better performance
});
const agent = new BeeAgent({
  llm,
  memory: new TokenMemory({ llm }),
  tools: [new DuckDuckGoSearchTool(), new OpenMeteoTool()],
});
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Simple GET route
app.get('/api', (req: Request, res: Response) => {
  res.send('Hello from Bee Agent Framework server');
});

// Simple POST route
app.post('/api/data', async (req: Request, res: Response) => {
  const { prompt } = req.body;
  

  const response = await agent
  //.run({ prompt: "What's the current weather in Las Vegas?" })
  .run( { prompt })
  .observe((emitter) => {
    emitter.on("update", async ({ data, update, meta }) => {
      console.log(`Agent Update (${update.key}) 🤖 : `, update.value);
    });
  });
  console.log(`Agent 🤖 : `, response.result.text);

  res.json({
    mesage: `Answer from Bee Agent: ${response.result.text}`
  })
});

app.listen(port, () => {
  console.log(`Bee Agent Framework server is running at port=${port}`);
});

import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import type { ChatPromptTemplate } from '@langchain/core/prompts';
import type { StructuredTool } from '@langchain/core/tools';
import { AgentExecutor, createToolCallingAgent } from 'langchain/agents';
import { agentInstructions } from './format-agent-instructions';
import { AxonAgentToolBuilder } from './tools';

class AxonAgentBuilder {
  _model?: BaseChatModel;
  _tools?: Array<StructuredTool | AxonAgentToolBuilder<any>>;
  _prompt?: ChatPromptTemplate | string;

  model(model: BaseChatModel) {
    this._model = model;

    return this;
  }

  tools(tools: Array<StructuredTool | AxonAgentToolBuilder<any>>) {
    this._tools = tools;

    return this;
  }

  prompt(prompt: ChatPromptTemplate | string) {
    this._prompt = prompt;

    return this;
  }

  build(): AgentExecutor {
    if (!this._model || !this._tools || !this._prompt) {
      throw new Error('Model, Tools, and Prompt are required');
    }
    const tools: Array<StructuredTool> = [];

    for (const t of this._tools) {
      if (t instanceof AxonAgentToolBuilder) {
        tools.push(t.build());
        continue;
      }

      tools.push(t);
    }

    const prompt =
      typeof this._prompt === 'string'
        ? agentInstructions(this._prompt)
        : this._prompt;

    const agent = createToolCallingAgent({
      llm: this._model,
      prompt,
      tools,
    });

    return new AgentExecutor({ agent, tools });
  }
}

export function createAgent() {
  return new AxonAgentBuilder();
}

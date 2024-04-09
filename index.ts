#!/usr/bin/env node

import { GenerateTask, Plugin, Assistant, Kernel } from "@stencila/plugin";
import { CodeBlock, Heading, Text, softwareApplication } from "@stencila/types";

/**
 * An echoing kernel which just echos back the supplied code as a string output
 */
class EchoKernel extends Kernel {
  async info() {
    return softwareApplication("echo-node");
  }

  async execute(code: string) {
    return {
      outputs: [code],
      messages: [],
    };
  }
}

/**
 * An echoing assistant which just echos back the task as a JSON code block
 * and the rendered system prompt as a Markdown code block
 */
class EchoAssistant extends Assistant {
  async systemPrompt() {
    return `
You are an assistant that echos back the task given to you.

This system prompt is a template which is rendered against the
task itself. Here are some of the parts of the task rendered into
the system prompt:

Instruction:

{{ instruction | to_yaml }}

Instruction text:

{{ instruction_text }}

Instruction content formatted:

{{ content_formatted if content_formatted else "none" }}

Document context:

{{ context | to_yaml }}
`;
  }

  async performTask(task: GenerateTask) {
    return {
      nodes: [
        new Heading(1, [new Text("Task")]),
        new CodeBlock(JSON.stringify(task, null, " "), {
          programmingLanguage: "json",
        }),
        new Heading(1, [new Text("System prompt")]),
        new CodeBlock(task.system_prompt ?? "", {
          programmingLanguage: "markdown",
        }),
      ],
    };
  }
}

/**
 * An example Stencila plugin 
 */
class EchoPlugin extends Plugin {
  constructor() {
    super();

    this.kernels = {
      "echo-node": EchoKernel,
    };

    this.assistants = {
      "stencila/echo-node": new EchoAssistant(),
    };
  }
}

if (require.main === module) {
  new EchoPlugin().run().catch(console.error);
}

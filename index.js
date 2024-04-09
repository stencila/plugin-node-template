#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = require("@stencila/plugin");
const types_1 = require("@stencila/types");
/**
 * An echoing kernel which just echos back the supplied code as a string output
 */
class EchoKernel extends plugin_1.Kernel {
    info() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, types_1.softwareApplication)("echo-node");
        });
    }
    execute(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                outputs: [code],
                messages: [],
            };
        });
    }
}
/**
 * An echoing assistant which just echos back the task as a JSON code block
 * and the rendered system prompt as a Markdown code block
 */
class EchoAssistant extends plugin_1.Assistant {
    systemPrompt() {
        return __awaiter(this, void 0, void 0, function* () {
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
        });
    }
    performTask(task) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            return {
                nodes: [
                    new types_1.Heading(1, [new types_1.Text("Task")]),
                    new types_1.CodeBlock(JSON.stringify(task, null, " "), {
                        programmingLanguage: "json",
                    }),
                    new types_1.Heading(1, [new types_1.Text("System prompt")]),
                    new types_1.CodeBlock((_a = task.system_prompt) !== null && _a !== void 0 ? _a : "", {
                        programmingLanguage: "markdown",
                    }),
                ],
            };
        });
    }
}
/**
 * An example Stencila plugin
 */
class EchoPlugin extends plugin_1.Plugin {
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

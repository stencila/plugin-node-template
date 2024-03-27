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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const http_1 = __importDefault(require("http"));
const readline_1 = __importDefault(require("readline"));
const types_1 = require("@stencila/types");
/**
 * A base plugin class for Stencila plugins built with Node.js
 *
 * Plugin developers can extend this class and override the `protected`
 * methods for their use case.
 *
 * It is intended that this class will live in its own package, or
 * in the `@stencila/node` package. But for now, while we are developing
 * and testing the API, this is the most convenient place for it to live.
 */
class Plugin {
    /**
     * Get the health of the plugin
     *
     * At present this method is only used to check communication with
     * the plugin. In the future, the expected response object may be used
     * for more detailed statistics about resource usage etc by the plugin.
     */
    health() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                timestamp: Math.floor(Date.now() / 1000),
                status: "OK",
            };
        });
    }
    /**
     * Start an instance of a kernel
     *
     * This method is called by Stencila when a kernel instance is
     * started. Because Stencila starts a new plugin instance for each
     * kernel instance, this method only needs to be implemented for plugins
     * that provide more than one kernel or that need to instantiate some state
     * for a kernel instance (i.e. a kernel that is capable
     * of storing variables).
     *
     * This default implementation simply returns the same name as
     * supplied (i.e. the kernel instance will have the same
     * name as the kernel).
     *
     * @param kernel The name of the kernel to start an instance for
     *
     * @returns {Object}
     * @property instance The name of the kernel instance that was started
     */
    kernelStart(kernel) {
        return __awaiter(this, void 0, void 0, function* () {
            return { instance: kernel };
        });
    }
    /**
     * JSON-RPC interface for `kernelStart`
     *
     * @param {Object}
     * @property kernel The name of the kernel to start an instance for
     *
     * @returns {Object}
     * @property instance The name of the kernel instance that was started
     */
    kernel_start({ kernel }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelStart(kernel);
        });
    }
    /**
     * Stop a kernel instance
     *
     * This method is called by Stencila when a kernel instance is
     * stopped because it is no longer needed. Because Stencila will also
     * stop the plugin instance at that time, this method only needs to be
     * implemented for plugins that host more than one kernel instance at a time,
     * or that need to perform clean up for a stopped kernel instance.
     *
     * This default implementation does nothing.
     *
     * @param instance The name of the kernel instance to stop
     */
    kernelStop(instance) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * JSON-RPC interface for `kernelStop`
     *
     * @param {Object}
     * @property instance The name of the kernel instance to stop
     */
    kernel_stop({ instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelStop(instance);
        });
    }
    /**
     * Get information about a kernel instance
     *
     * This method is called by Stencila to obtain information about a
     * kernel instance while it is running. It must be implemented by
     * all plugins that provide one or more kernels.
     *
     * This default implementation throws an error to indicate that
     * it has not been overridden.
     *
     * @param instance The name of the kernel instance to get information for
     */
    kernelInfo(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            throw Error("Method `kernelInfo` must be overridden by plugins that provide one or more kernels");
        });
    }
    /**
     * JSON-RPC interface for `kernelInfo`
     *
     * @param {Object}
     * @property instance The name of the kernel instance to get information for
     */
    kernel_info({ instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelInfo(instance);
        });
    }
    /**
     * Get a list of packages available in a kernel instance
     *
     * This method is called by Stencila to obtain a list of packages
     * available in a kernel instance. This is used for improving
     * assistant code generation (reducing hallucination of packages)
     * and other purposes. This method should be implemented by plugins
     * that provide kernels which have the concept of installable packages.
     *
     * This default implementation returns an empty list.
     *
     * @param instance The name of the kernel instance to list packages for
     */
    kernelPackages(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    /**
     * JSON-RPC interface for `kernelPackages`
     *
     * @param {Object}
     * @property instance The name of the kernel instance to list packages for
     */
    kernel_packages({ instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelPackages(instance);
        });
    }
    /**
     * Execute code in a kernel instance
     *
     * This method is called by Stencila when executing `CodeChunk`s.
     * It should be implemented for most kernels. If the plugin provides
     * more than one kernel, this method will need to branch based on the
     * type of the kernel instance.
     *
     * This default implementation returns no outputs or messages.
     *
     * @param code The code to execute
     * @param instance The name of the kernel instance to execute the code in
     *
     * @return {Object}
     * @property outputs The outputs from executing the code
     * @property messages The messages associated with executing the code
     */
    kernelExecute(code, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                outputs: [],
                messages: [],
            };
        });
    }
    /**
     * JSON-RPC interface for `kernelExecute`
     *
     * @param {Object}
     * @property code The code to execute
     * @property instance The name of the kernel instance to execute the code in
     *
     * @return {Object}
     * @property outputs The outputs from executing the code
     * @property messages The messages associated with executing the code
     */
    kernel_execute({ code, instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelExecute(code, instance);
        });
    }
    /**
     * Evaluate code in a kernel instance
     *
     * This method is called by Stencila when evaluating code expressions
     * in `CodeExpression`, `ForBlock` and other node types.
     * It should be implemented for most kernels. If the plugin provides
     * more than one kernel, this method will need to branch based on the
     * type of the kernel instance.
     *
     * This default implementation returns no output or messages.
     *
     * @param code The code to evaluate
     * @param instance The name of the kernel instance to evaluate the code in
     *
     * @return {Object}
     * @property output The output from evaluating the code
     * @property messages The messages associated with evaluating the code
     */
    kernelEvaluate(code, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                output: [],
                messages: [],
            };
        });
    }
    /**
     * JSON-RPC interface for `kernelEvaluate`
     *
     * @param {Object}
     * @property code The code to evaluate
     * @property instance The name of the kernel instance to evaluate the code in
     *
     * @return {Object}
     * @property output The output from evaluating the code
     * @property messages The messages associated with evaluating the code
     */
    kernel_evaluate({ code, instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelEvaluate(code, instance);
        });
    }
    /**
     * Get a list of variables available in a kernel instance
     *
     * This method is called by Stencila to obtain a list of variables
     * available in a kernel instance. This is used for improving
     * assistant code generation (reducing hallucination of variables)
     * and other purposes. This method should be implemented by plugins
     * that provide kernels which maintain variables as part of the kernel
     * state.
     *
     * This default implementation returns an empty list.
     *
     * @param instance The name of the kernel instance to list variables for
     */
    kernelList(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            return [];
        });
    }
    /**
     * JSON-RPC interface for `kernelList`
     *
     * @param {Object}
     * @property instance The name of the kernel instance to list variables for
     */
    kernel_list({ instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelList(instance);
        });
    }
    /**
     * Get a variable from a kernel instance
     *
     * This method is called by Stencila to obtain a variables so it
     * can be displayed or "mirrored" to another kernel. This method should
     * be implemented by plugins that provide kernels which maintain variables
     * as part of the kernel state.
     *
     * This default implementation returns `null` (the return value when a
     * variable does not exist).
     *
     * @param name The name of the variable
     * @param instance The name of the kernel instance get the variable from
     */
    kernelGet(name, instance) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    /**
     * JSON-RPC interface for `kernelGet`
     *
     * @param {Object}
     * @property name The name of the variable
     * @property instance The name of the kernel instance get the variable from
     */
    kernel_get({ name, instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelGet(name, instance);
        });
    }
    /**
     * Set a variable in a kernel instance
     *
     * This method is called by Stencila to set `Parameter` values or
     * to "mirror" variable from another kernel. This method should
     * be implemented by plugins that provide kernels which maintain variables
     * as part of the kernel state.
     *
     * This default implementation does nothing.
     *
     * @param name The name of the variable
     * @param value The value of the node
     * @param instance The name of the kernel instance to set the variable in
     */
    kernelSet(name, value, instance) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * JSON-RPC interface for `kernelSet`
     *
     * @param {Object}
     * @property name The name of the variable
     * @property value The value of the node
     * @property instance The name of the kernel instance to list variables for
     */
    kernel_set({ name, value, instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelSet(name, value, instance);
        });
    }
    /**
     * Remove a variable from a kernel instance
     *
     * This method is called by Stencila to keep the variables in a kernel
     * instance in sync with the variables defined in the code in a document.
     * For example, if a `CodeChunk` that declares a variable is removed from
     * from the document, then the variable should be removed from the kernel
     * (so that it is not accidentally reused later).
     *
     * This default implementation does nothing.
     *
     * @param name The name of the variable
     * @param instance The name of the kernel instance to remove the variable from
     */
    kernelRemove(name, instance) {
        return __awaiter(this, void 0, void 0, function* () { });
    }
    /**
     * JSON-RPC interface for `kernelRemove`
     *
     * @param {Object}
     * @property name The name of the variable
     * @property instance The name of the kernel instance to remove the variable from
     */
    kernel_remove({ name, instance, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.kernelRemove(name, instance);
        });
    }
    /**
     * Execute an instruction using an assistant
     *
     * This method is called by Stencila before executing an
     * `InstructionBlock` or `InstructionInline` node so that the
     * assistant can provide a system prompt template to delegates.
     *
     * It receives a `GenerateTask` and `GenerateOptions` and should
     * return a `string`. This default implementation returns an
     * empty string.
     *
     * @param task The task to create a system prompt template for
     * @param options Options for generation
     * @param assistant The id of the assistant that should create the system prompt
     *
     * @return string
     */
    assistantSystemPrompt(task, options, assistant) {
        return __awaiter(this, void 0, void 0, function* () {
            return "";
        });
    }
    /**
     * JSON-RPC interface for `assistantSystemPrompt`
     *
     * @param {Object}
     * @param task The task to create a system prompt template for
     * @param options Options for generation
     * @param assistant The id of the assistant that should create the system prompt
     *
     * @return string
     */
    assistant_system_prompt({ task, options, assistant, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assistantSystemPrompt(task, options, assistant);
        });
    }
    /**
     * Execute an instruction using an assistant
     *
     * This method is called by Stencila when executing `InstructionBlock` and
     * `InstructionInline` nodes.
     *
     * It receives a `GenerateTask` and `GenerateOptions` and should return
     * a `GenerateOutput`. This default implementation raises an error.
     *
     * @param task The task to execute
     * @param options Options for generation
     * @param assistant The id of the assistant that should execute the task
     *
     * @return GenerateOutput
     */
    assistantPerformTask(task, options, assistant) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method `assistantPerformTask` must be implemented by plugins that provide an assistant");
        });
    }
    /**
     * JSON-RPC interface for `assistantPerformTask`
     *
     * @param {Object}
     * @param task The task to perform
     * @param options Options for generation
     * @param assistant The id of the assistant that should perform the task
     *
     * @return GenerateOutput
     */
    assistant_perform_task({ task, options, assistant, }) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.assistantPerformTask(task, options, assistant);
        });
    }
    /**
     * Handle a JSON-RPC request and return a JSON-RPC response
     */
    handleRequest(requestJson) {
        return __awaiter(this, void 0, void 0, function* () {
            let request;
            try {
                request = JSON.parse(requestJson);
            }
            catch (error) {
                // Generate parsing error
                return errorResponse(null, -32700, "Parse error");
            }
            const { id, method, params } = request;
            // Check if the method exists and is callable
            // @ts-expect-error because indexing this by string
            const func = this[method];
            if (typeof func === "function") {
                try {
                    const result = yield func.call(this, params);
                    return successResponse(id, result);
                }
                catch (error) {
                    return errorResponse(id, -32603, `Internal error: ${error}`);
                }
            }
            else {
                return errorResponse(id, -32601, `Method \`${method}\` not found`);
            }
            function successResponse(id, result) {
                // Result must always be defined (i.e. not `undefined`) for success responses
                return JSON.stringify({ jsonrpc: "2.0", id, result: result !== null && result !== void 0 ? result : null });
            }
            function errorResponse(id, code, message) {
                return JSON.stringify({ jsonrpc: "2.0", id, error: { code, message } });
            }
        });
    }
    /**
     * Listen for JSON-RPC requests on standard input and send responses on standard output
     */
    listenStdio() {
        return __awaiter(this, void 0, void 0, function* () {
            const rl = readline_1.default.createInterface({
                input: process.stdin,
                output: process.stdout,
                terminal: false,
            });
            rl.on("line", (requestJson) => __awaiter(this, void 0, void 0, function* () {
                const responseJson = yield this.handleRequest(requestJson);
                console.log(responseJson);
            }));
        });
    }
    /**
     * Listen for JSON-RPC requests on HTTP
     */
    listenHttp(port, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const server = http_1.default.createServer((req, res) => __awaiter(this, void 0, void 0, function* () {
                // Check the request is from localhost
                if (req.socket.remoteAddress === "127.0.0.1" ||
                    req.socket.remoteAddress === "::1") {
                    res.writeHead(403);
                    res.end("Access denied");
                    return;
                }
                // Check for the bearer token in the Authorization header
                const authHeader = req.headers["authorization"];
                const receivedToken = authHeader && authHeader.split(" ")[0] === "Bearer"
                    ? authHeader.split(" ")[1]
                    : null;
                if (!receivedToken || receivedToken !== token) {
                    res.writeHead(401);
                    res.end("Invalid or missing token");
                    return;
                }
                if (req.method === "POST" &&
                    req.headers["content-type"] === "application/json") {
                    // Handle the request
                    let body = "";
                    req.on("data", (chunk) => {
                        body += chunk.toString();
                    });
                    req.on("end", () => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const responseJson = yield this.handleRequest(body);
                            res.setHeader("Content-Type", "application/json");
                            res.writeHead(200);
                            res.end(responseJson);
                        }
                        catch (error) {
                            // Handle any errors not handled in `handleRequest`
                            res.writeHead(500);
                            res.end(JSON.stringify({
                                jsonrpc: "2.0",
                                error: { code: -32603, message: "Internal error" },
                                id: null,
                            }));
                        }
                    }));
                }
                else {
                    // Respond with 405 Method Not Allowed if not a POST request and JSON payload
                    res.writeHead(405);
                    res.end();
                }
            }));
            server.listen(port);
        });
    }
    /**
     * Run the plugin based on environment variables
     */
    run() {
        return __awaiter(this, void 0, void 0, function* () {
            const protocol = process.env.STENCILA_TRANSPORT;
            if (protocol == "stdio") {
                this.listenStdio();
            }
            else if (protocol == "http") {
                this.listenHttp(parseInt(process.env.STENCILA_PORT), process.env.STENCILA_TOKEN);
            }
            else {
                throw Error(`Unknown protocol: ${protocol}`);
            }
        });
    }
}
exports.Plugin = Plugin;
/**
 * An example Stencila plugin written in Node.js
 */
class ExamplePlugin extends Plugin {
    // An echoing kernel which echos back the supplied code as a string output
    kernelInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            return (0, types_1.softwareApplication)("echo");
        });
    }
    kernelExecute(code) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                outputs: [code],
                messages: [],
            };
        });
    }
    // An echoing assistant which echos back the task as a JSON code block
    // and the rendered system prompt as a Markdown code block
    assistantSystemPrompt() {
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
    assistantPerformTask(task) {
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
if (require.main === module) {
    new ExamplePlugin().run().catch(console.error);
}

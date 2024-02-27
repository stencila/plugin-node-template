#!/usr/bin/env node

import http from "http";
import readline from "readline";

import {
  ExecutionMessage,
  Node,
  SoftwareApplication,
  SoftwareSourceCode,
  Variable,
  softwareApplication,
} from "@stencila/types";

type KernelName = string;
type KernelInstanceName = string;

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
export class Plugin {
  /**
   * Get the health of the plugin
   *
   * At present this method is only used to check communication with
   * the plugin. In the future, the expected response object may be used
   * for more detailed statistics about resource usage etc by the plugin.
   */
  protected async health() {
    return {
      timestamp: Math.floor(Date.now() / 1000),
      status: "OK",
    };
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
  protected async kernelStart(kernel: KernelName): Promise<{
    instance: KernelInstanceName;
  }> {
    return { instance: kernel };
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
  private async kernel_start({ kernel }: { kernel: KernelName }): Promise<{
    instance: KernelInstanceName;
  }> {
    return await this.kernelStart(kernel);
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
  protected async kernelStop(instance?: KernelInstanceName): Promise<void> {}

  /**
   * JSON-RPC interface for `kernelStop`
   *
   * @param {Object}
   * @property instance The name of the kernel instance to stop
   */
  private async kernel_stop({
    instance,
  }: {
    instance: KernelInstanceName;
  }): Promise<void> {
    return await this.kernelStop(instance);
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
  protected async kernelInfo(
    instance?: KernelInstanceName
  ): Promise<SoftwareApplication> {
    throw Error(
      "Method `kernelInfo` must be overridden by plugins that provide one or more kernels"
    );
  }

  /**
   * JSON-RPC interface for `kernelInfo`
   *
   * @param {Object}
   * @property instance The name of the kernel instance to get information for
   */
  private async kernel_info({
    instance,
  }: {
    instance: KernelInstanceName;
  }): Promise<SoftwareApplication> {
    return await this.kernelInfo(instance);
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
  protected async kernelPackages(
    instance?: KernelInstanceName
  ): Promise<SoftwareSourceCode[]> {
    return [];
  }

  /**
   * JSON-RPC interface for `kernelPackages`
   *
   * @param {Object}
   * @property instance The name of the kernel instance to list packages for
   */
  private async kernel_packages({
    instance,
  }: {
    instance: KernelInstanceName;
  }): Promise<SoftwareSourceCode[]> {
    return await this.kernelPackages(instance);
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
  protected async kernelExecute(
    code: string,
    instance?: KernelInstanceName
  ): Promise<{
    outputs: Node[];
    messages: ExecutionMessage[];
  }> {
    return {
      outputs: [],
      messages: [],
    };
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
  protected async kernel_execute({
    code,
    instance,
  }: {
    code: string;
    instance: KernelInstanceName;
  }): Promise<{
    outputs: Node[];
    messages: ExecutionMessage[];
  }> {
    return await this.kernelExecute(code, instance);
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
  protected async kernelEvaluate(
    code: string,
    instance: KernelInstanceName
  ): Promise<{
    output: Node;
    messages: ExecutionMessage[];
  }> {
    return {
      output: [],
      messages: [],
    };
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
  protected async kernel_evaluate({
    code,
    instance,
  }: {
    code: string;
    instance: KernelInstanceName;
  }): Promise<{
    output: Node;
    messages: ExecutionMessage[];
  }> {
    return await this.kernelEvaluate(code, instance);
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
  protected async kernelList(
    instance?: KernelInstanceName
  ): Promise<Variable[]> {
    return [];
  }

  /**
   * JSON-RPC interface for `kernelList`
   *
   * @param {Object}
   * @property instance The name of the kernel instance to list variables for
   */
  private async kernel_list({
    instance,
  }: {
    instance: KernelInstanceName;
  }): Promise<Variable[]> {
    return await this.kernelList(instance);
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
  protected async kernelGet(
    name: string,
    instance?: KernelInstanceName
  ): Promise<Variable | null> {
    return null;
  }

  /**
   * JSON-RPC interface for `kernelGet`
   *
   * @param {Object}
   * @property name The name of the variable
   * @property instance The name of the kernel instance get the variable from
   */
  private async kernel_get({
    name,
    instance,
  }: {
    name: string;
    instance: KernelInstanceName;
  }): Promise<Variable | null> {
    return await this.kernelGet(name, instance);
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
  protected async kernelSet(
    name: string,
    value: Node,
    instance?: KernelInstanceName
  ): Promise<void> {}

  /**
   * JSON-RPC interface for `kernelSet`
   *
   * @param {Object}
   * @property name The name of the variable
   * @property value The value of the node
   * @property instance The name of the kernel instance to list variables for
   */
  private async kernel_set({
    name,
    value,
    instance,
  }: {
    name: string;
    value: Node;
    instance: KernelInstanceName;
  }): Promise<void> {
    return await this.kernelSet(name, value, instance);
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
  protected async kernelRemove(
    name: string,
    instance?: KernelInstanceName
  ): Promise<void> {}

  /**
   * JSON-RPC interface for `kernelRemove`
   *
   * @param {Object}
   * @property name The name of the variable
   * @property instance The name of the kernel instance to remove the variable from
   */
  private async kernel_remove({
    name,
    instance,
  }: {
    name: string;
    instance: KernelInstanceName;
  }): Promise<void> {
    return await this.kernelRemove(name, instance);
  }

  /**
   * Handle a JSON-RPC request and return a JSON-RPC response
   */
  private async handleRequest(requestJson: string): Promise<string> {
    let request;
    try {
      request = JSON.parse(requestJson);
    } catch (error) {
      // Generate parsing error
      return errorResponse(null, -32700, "Parse error");
    }

    const { id, method, params } = request;

    // Check if the method exists and is callable
    // @ts-expect-error because indexing this by string
    const func = this[method];
    if (typeof func === "function") {
      try {
        const result = await func.call(this, params);
        return successResponse(id, result);
      } catch (error) {
        return errorResponse(id, -32603, `Internal error: ${error}`);
      }
    } else {
      return errorResponse(id, -32601, `Method \`${method}\` not found`);
    }

    function successResponse(id: string, result: unknown): string {
      // Result must always be defined (i.e. not `undefined`) for success responses
      return JSON.stringify({ id, result: result ?? null });
    }

    function errorResponse(
      id: string | null,
      code: number,
      message: string
    ): string {
      return JSON.stringify({ id, error: { code, message } });
    }
  }

  /**
   * Listen for JSON-RPC requests on standard input and send responses on standard output
   */
  private async listenStdio(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false,
    });

    rl.on("line", async (requestJson) => {
      const responseJson = await this.handleRequest(requestJson);
      console.log(responseJson);
    });
  }

  /**
   * Listen for JSON-RPC requests on HTTP
   */
  private async listenHttp(port: number, token: string): Promise<void> {
    const server = http.createServer(async (req, res) => {
      // Check the request is from localhost
      if (
        req.socket.remoteAddress === "127.0.0.1" ||
        req.socket.remoteAddress === "::1"
      ) {
        res.writeHead(403);
        res.end("Access denied");
        return;
      }

      // Check for the bearer token in the Authorization header
      const authHeader = req.headers["authorization"];
      const receivedToken =
        authHeader && authHeader.split(" ")[0] === "Bearer"
          ? authHeader.split(" ")[1]
          : null;
      if (!receivedToken || receivedToken !== token) {
        res.writeHead(401);
        res.end("Invalid or missing token");
        return;
      }

      if (
        req.method === "POST" &&
        req.headers["content-type"] === "application/json"
      ) {
        // Handle the request
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          try {
            const responseJson = await this.handleRequest(body);
            res.setHeader("Content-Type", "application/json");
            res.writeHead(200);
            res.end(responseJson);
          } catch (error) {
            // Handle any errors not handled in `handleRequest`
            res.writeHead(500);
            res.end(
              JSON.stringify({
                jsonrpc: "2.0",
                error: { code: -32603, message: "Internal error" },
                id: null,
              })
            );
          }
        });
      } else {
        // Respond with 405 Method Not Allowed if not a POST request and JSON payload
        res.writeHead(405);
        res.end();
      }
    });

    server.listen(port);
  }

  /**
   * Run the plugin based on environment variables
   */
  public async run(): Promise<void> {
    const protocol = process.env.STENCILA_TRANSPORT;
    if (protocol == "stdio") {
      this.listenStdio();
    } else if (protocol == "http") {
      this.listenHttp(
        parseInt(process.env.STENCILA_PORT!),
        process.env.STENCILA_TOKEN!
      );
    } else {
      throw Error(`Unknown protocol: ${protocol}`);
    }
  }
}

/**
 * An example Stencila plugin written in Node.js
 */
class ExamplePlugin extends Plugin {
  async kernelInfo() {
    return softwareApplication("allcaps");
  }

  async kernelExecute(code: string) {
    return {
      outputs: [code.toUpperCase()],
      messages: [],
    };
  }

  async kernelEvaluate(code: string) {
    return {
      output: code.toUpperCase(),
      messages: [],
    };
  }
}

if (require.main === module) {
  new ExamplePlugin().run().catch(console.error);
}

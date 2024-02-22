#!/usr/bin/env node

import http from "http";
import readline from "readline";

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
        const result = await func(params);
        return successResponse(id, result);
      } catch (error) {
        return errorResponse(id, -32603, "Internal error");
      }
    } else {
      return errorResponse(id, -32601, "Method not found");
    }

    function successResponse(id: string, result: unknown): string {
      return JSON.stringify({ id, result });
    }

    function errorResponse(
      id: string | null,
      code: number,
      message: string
    ): string {
      return JSON.stringify({ id, code, message });
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
   * Run the plugin based on arguments passed to the script
   */
  public async run(): Promise<void> {
    const args = process.argv.slice(2);
    const protocol = args[0];
    if (protocol == "stdio") {
      this.listenStdio();
    } else if (protocol == "http") {
      this.listenHttp(parseInt(args[1]), args[2]);
    } else {
      throw Error(`Unknown protocol: ${protocol}`);
    }
  }
}

/**
 * An example Stencila plugin written in Node.js
 */
class ExamplePlugin extends Plugin {}

if (require.main === module) {
  new ExamplePlugin().run().catch(console.error);
}

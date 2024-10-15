import Bun from "bun";
import type { ServerWebSocket } from "bun";

console.log("Server started!")


Bun.serve({
	port: 3000,
	fetch(req, server) {
		// upgrade the request to a WebSocket
		if (server.upgrade(req)) {
			return; // do not return a Response
		}
		return new Response("Upgrade failed", { status: 500 });
	},
	websocket: {
		message(ws: ServerWebSocket, message: any) {
			ws.send(message);
		},
		open(ws) {

		},
		error(ws, error: Error) {
			console.log(error);
		},
		close(ws, code, message) {},
	},
});

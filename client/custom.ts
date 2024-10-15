import Websocket from "ws";
const numberOfMessages: number = 100000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
const encoder = new TextEncoder();
const decoder = new TextDecoder();

function binary(event: number, message: string) {
	const buffer = new ArrayBuffer(1 + message.length * 2);
	const view = new DataView(buffer);

	const messageBytes = encoder.encode(message);

	view.setUint8(0, event);

	const byteArray = new Uint8Array(buffer);
	byteArray.set(messageBytes, 1);

	return buffer;

}
ws.on("open", () => {
	startTime = Date.now();
	for (let i = 0; i < numberOfMessages; i++) {
		ws.send(binary(1, "Hello World!"));
	}
})

ws.on("message", (message: any) => {
	endTime = Date.now();
	messagesRecieved++;
	if (messagesRecieved % 10000 === 0) {
		const buffer: ArrayBuffer = message.buffer;
		const view = new DataView(buffer);
		const eventType = view.getUint8(0);
		if (eventType === 1) {
			const textLength = buffer.byteLength - 1
			const textBytes = new Uint8Array(buffer, 1, textLength);
			const text = decoder.decode(textBytes);
			console.log(`Received message: ${text}`);
		}
	}

	if (messagesRecieved >= numberOfMessages) {
		console.log(`${endTime - startTime} ms`);

		ws.close();

		process.exit();
	}
});

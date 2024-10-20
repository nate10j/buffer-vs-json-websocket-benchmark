import Websocket from "ws";
const numberOfMessages: number = 10000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let startSerializeTime: number = 0;
let totalSerializeTime: number = 0;
let startDeserializeTime: number = 0;
let totalDeserializeTime: number = 0;

function binary(text: string, text2: string, num: number, decimal: number) {
	const buffer = new ArrayBuffer(2 + 4 + 1 + text.length + text2.length);
	const view = new DataView(buffer);

	const messageBytes = encoder.encode(text);

	view.setUint16(0, num);
	view.setFloat32(2, decimal);
	view.setUint8(6, text.length);

	const byteArray = new Uint8Array(buffer);
	byteArray.set(messageBytes, 7);

	return buffer;

}

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startSerializeTime = performance.now();
		const msg = binary("Hello World!", "Lorem ipsum dolor sit amet, consectetur adipiscing.", 12345, 3.1415926);
		totalSerializeTime += performance.now() - startSerializeTime;
		ws.send(msg);
	}
})

ws.on("message", (message: any) => {
	messagesRecieved++;
	startDeserializeTime = performance.now();
	const buffer: ArrayBuffer = message.buffer;
	const view = new DataView(buffer);
	const num = view.getUint8(0);
	const textLength = buffer.byteLength - 1
	const textBytes = new Uint8Array(buffer, 1, textLength);
	const text = decoder.decode(textBytes);
	totalDeserializeTime += performance.now() - startDeserializeTime;

	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`Serialization time: ${Math.round(totalSerializeTime * 10) / 10} ms`);
		console.log(`Deserialization time: ${Math.round(totalDeserializeTime * 10) / 10} ms`);
		console.log(`Total time: ${Math.round((endTime - startTime) * 10) / 10} ms`);
		console.log(`${text} ${num}`);
		console.log(`${new Uint8Array(buffer)}`);
		console.log(`${buffer.byteLength} bytes`);
		ws.close();

		process.exit();
	}
});

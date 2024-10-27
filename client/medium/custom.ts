import Websocket from "ws";
const numberOfMessages: number = 100000;
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

	const messageBytes = encoder.encode(text + text2);

	view.setUint16(0, num);
	view.setFloat32(2, decimal);
	view.setUint8(6, text.length);

	const textByteArray = new Uint8Array(buffer);
	textByteArray.set(messageBytes, 7);

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
	const num = view.getUint16(0);
	const decimal = view.getFloat32(2);
	const textLength = view.getUint8(6);
	const textBytes = new Uint8Array(buffer, 7, textLength);
	const text = decoder.decode(textBytes);
	const text2Bytes = new Uint8Array(buffer, 7 + textLength);
	const text2 = decoder.decode(text2Bytes);
	totalDeserializeTime += performance.now() - startDeserializeTime;

	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`Serialization time: ${Math.round(totalSerializeTime * 10) / 10} ms`);
		console.log(`Deserialization time: ${Math.round(totalDeserializeTime * 10) / 10} ms`);
		console.log(`Total time: ${Math.round((endTime - startTime) * 10) / 10} ms`);
		console.log(`${text} ${text2} ${num} ${decimal}`);
		console.log(`${new Uint8Array(buffer)}`);
		console.log(`${buffer.byteLength} bytes`);
		ws.close();

		process.exit();
	}
});

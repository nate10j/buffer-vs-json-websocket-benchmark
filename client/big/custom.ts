import Websocket from "ws";
const numberOfMessages: number = 1000000;
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

function binary(text: string, text2: string, text3: string, text4: string, num: number, decimal: number, num2: number, decimal2: number) {
	const textBytes = encoder.encode(text);
	const text2Bytes = encoder.encode(text2);
	const text3Bytes = encoder.encode(text3);
	const text4Bytes = encoder.encode(text4);

	// 4 (num uint32) + 8 (decimal float64) + 4 (num int32) + 8 (decimal float64) + 3 (text length 1 + 1 + 1) = 27
	const buffer = new ArrayBuffer(27 + textBytes.length + text2Bytes.length + text3Bytes.length + text4Bytes.length);
	const byteArray = new Uint8Array(buffer);
	const view = new DataView(buffer);

	let offset = 0;


	view.setUint32(offset, num);
	offset += 4;
	view.setInt32(offset, num2);
	offset += 4;
	view.setFloat64(offset, decimal);
	offset += 8;
	view.setFloat64(offset, decimal2);
	offset += 8;
	view.setUint8(offset, textBytes.length);
	offset += 1;
	byteArray.set(textBytes, offset);
	offset += textBytes.length;
	view.setUint8(offset, text2Bytes.length);
	offset += 1;
	byteArray.set(text2Bytes, offset);
	offset += text2Bytes.length;
	view.setUint8(offset, text3Bytes.length);
	offset += 1;
	byteArray.set(text3Bytes, offset);
	offset += text3Bytes.length;

	byteArray.set(text4Bytes, offset);

	return buffer;

}

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startSerializeTime = performance.now();
		const msg =
		binary("Hello World!",
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rutrum odio dolor, a egestas dui bibendum at.",
		"ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"The quick brown fox jumps over the lazy dog.",
		123456789, 3.141592653589793, -123456789, -3.141592653589793);
		totalSerializeTime += performance.now() - startSerializeTime;
		ws.send(msg);
	}
})

ws.on("message", (message: any) => {
	messagesRecieved++;
	startDeserializeTime = performance.now();
	const buffer: ArrayBuffer = message.buffer;
	const view = new DataView(buffer);
	let offset = 0;
	const num = view.getUint32(offset);
	offset += 4;
	const num2 = view.getInt32(offset);
	offset += 4;
	const decimal = view.getFloat64(offset);
	offset += 8;
	const decimal2 = view.getFloat64(offset);
	offset += 8;
	const textLength = view.getUint8(offset);
	offset += 1;
	const textBytes = new Uint8Array(buffer, offset, textLength);
	offset += textLength
	const text2Length = view.getUint8(offset);
	offset += 1;
	const text2Bytes = new Uint8Array(buffer, offset, text2Length);
	offset += text2Length;
	const text3Length = view.getUint8(offset);
	offset += 1;
	const text3Bytes = new Uint8Array(buffer, offset, text3Length);
	offset += text3Length;
	const text4Bytes = new Uint8Array(buffer, offset);

	const text = decoder.decode(textBytes);
	const text2 = decoder.decode(text2Bytes);
	const text3 = decoder.decode(text3Bytes);
	const text4 = decoder.decode(text4Bytes);

	totalDeserializeTime += performance.now() - startDeserializeTime;

	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`Serialization time: ${Math.round(totalSerializeTime * 10) / 10} ms`);
		console.log(`Deserialization time: ${Math.round(totalDeserializeTime * 10) / 10} ms`);
		console.log(`Total time: ${Math.round((endTime - startTime) * 10) / 10} ms`);
		console.log(`${text} ${text2} ${text3} ${text4} ${num} ${num2} ${decimal} ${decimal2}`);
		console.log(`${new Uint8Array(buffer)}`);
		console.log(`${buffer.byteLength} bytes`);
		ws.close();

		process.exit();
	}
});


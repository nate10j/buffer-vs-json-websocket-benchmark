import Websocket from "ws";
import { encode, decode } from "@msgpack/msgpack";

type TestMessage = {
	text: string,
	num: number
}

const data: TestMessage = {text: "Hello World! Lorem ipsum dolor sit amet, consectetur adipiscing.", num: 12345}

const numberOfMessages: number = 10000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
ws.binaryType = "arraybuffer"

let startEncodeTime: number = 0;
let totalEncodeTime: number = 0;
let startDecodeTime: number = 0;
let totalDecodeTime: number = 0;

console.log(encode(data).byteLength)

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startEncodeTime = performance.now();
		ws.send(encode(data));
		totalEncodeTime += performance.now() - startEncodeTime;
	}
	console.log(`Encode time: ${Math.round(totalEncodeTime)} ms`)
})

ws.on("message", (message: any) => {
	messagesRecieved++;

	startDecodeTime = performance.now();
	const decoded: TestMessage = decode(message) as TestMessage;
	totalDecodeTime += performance.now() - startDecodeTime;

	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`decode time: ${Math.round(totalDecodeTime)} ms`)
		console.log(`${decoded.text} ${decoded.num}`);
		console.log(`${Math.round(endTime - startTime)} ms`);

		ws.close();

		process.exit();
	}
})

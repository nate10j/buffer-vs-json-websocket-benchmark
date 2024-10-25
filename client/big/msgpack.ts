import Websocket from "ws";
import { encode, decode } from "@msgpack/msgpack";

type TestMessage = { // not required but used to make easier for intellisense and typescript stuff
	text: string,
	text2: string,
	text3: string,
	text4: string,
	num: number,
	num2: number,
	decimal: number,
	decimal2: number
}
// no effect on runtime performance as types are compiled and do not hinder performance during runtime

const data: TestMessage = {
	text: "Hello World!",
	text2: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas rutrum odio dolor, a egestas dui bibendum at.",
	text3: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
	text4: "The quick brown fox jumps over the lazy dog.",
	num: 123456789,
	decimal: 3.141592653589793,
	num2: -123456789,
	decimal2: -3.141592653589793
}

const numberOfMessages: number = 1000000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
ws.binaryType = "arraybuffer"

let startSerializeTime: number = 0;
let totalSerializeTime: number = 0;
let startDeserializeTime: number = 0;
let totalDeserializeTime: number = 0;

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startSerializeTime = performance.now();
		const msg = encode(data);
		totalSerializeTime += performance.now() - startSerializeTime;
		ws.send(msg);
	}
})

ws.on("message", (msg: any) => {
	messagesRecieved++;

	startDeserializeTime = performance.now();
	const message: TestMessage = decode(msg) as TestMessage;
	totalDeserializeTime += performance.now() - startDeserializeTime;

	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`Serialize time: ${Math.round(totalSerializeTime * 10) / 10} ms`)
		console.log(`Deserialize time: ${Math.round(totalDeserializeTime * 10) / 10} ms`)
		console.log(`Total time: ${Math.round((endTime - startTime) * 10) / 10} ms`);
		console.log(message);
		console.log(`${msg.byteLength} bytes`);

		ws.close();

		process.exit();
	}
})

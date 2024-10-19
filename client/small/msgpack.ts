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

let startSerializeTime: number = 0;
let totalSerializeTime: number = 0;
let startDeserializeTime: number = 0;
let totalDeserializeTime: number = 0;

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startSerializeTime = performance.now();
		ws.send(encode(data));
		totalSerializeTime += performance.now() - startSerializeTime;
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

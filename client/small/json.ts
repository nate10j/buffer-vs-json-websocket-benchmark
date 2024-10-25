import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000");

const numberOfMessages: number = 1000000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

let startSerializeTime: number = 0;
let totalSerializeTime: number = 0;
let startDeserializeTime: number = 0;
let totalDeserializeTime: number = 0;

const data = {
	text: "Hello World!",
	num: 123
}

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startSerializeTime = performance.now();
		const msg = JSON.stringify(data);
		totalSerializeTime += performance.now() - startSerializeTime;
		ws.send(msg);
	}
})

ws.on("message", (msg: string) => {
	messagesRecieved++;
	startDeserializeTime = performance.now()
	const data = JSON.parse(msg);
	totalDeserializeTime += performance.now() - startDeserializeTime;
	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`Serialize time: ${Math.round(totalSerializeTime * 10) / 10} ms`)
		console.log(`Deserialization time: ${Math.round(totalDeserializeTime * 10) / 10} ms`)
		console.log(`total: ${Math.round((endTime - startTime) * 10) / 10} ms`);
		console.log(data)
		console.log(`byte size: ${new Blob([msg]).size} bytes`)

		ws.close();

		process.exit();
	}
})

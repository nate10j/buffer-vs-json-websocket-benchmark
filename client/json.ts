import WebSocket from "ws";

const ws = new WebSocket("ws://localhost:3000");

const numberOfMessages: number = 10000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

let startEncodeTime: number = 0;
let totalEncodeTime: number = 0;
let startDecodeTime: number = 0;
let totalDecodeTime: number = 0;

const data = {text: "Hello World! Lorem ipsum dolor sit amet, consectetur adipiscing.", num: 12345}

console.log(new Blob([JSON.stringify(data)]).size)

ws.on("open", () => {
	startTime = performance.now();
	for (let i = 0; i < numberOfMessages; i++) {
		startEncodeTime = performance.now();
		ws.send(JSON.stringify(data));
		totalEncodeTime += performance.now() - startEncodeTime;
	}
	console.log(`Encode time: ${Math.round(totalEncodeTime)} ms`)
})

ws.on("message", (msg: any) => {
	messagesRecieved++;
	startDecodeTime = performance.now()
	const message = JSON.parse(msg);
	totalDecodeTime += performance.now() - startDecodeTime;
	if (messagesRecieved >= numberOfMessages) {
		endTime = performance.now();
		console.log(`decode time: ${Math.round(totalDecodeTime)} ms`)
		console.log(`${message.text} ${message.num}`)
		console.log(`total: ${Math.round(endTime - startTime)} ms`);

		ws.close();

		process.exit();
	}
})

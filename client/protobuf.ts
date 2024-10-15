import Websocket from "ws"
import protobuf from "protobufjs";

const numberOfMessages: number = 10000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
ws.binaryType = "arraybuffer";

const data = {text: "Hello World! Lorem ipsum dolor sit amet, consectetur adipiscing.", num: 12345}

let startEncodeTime: number = 0;
let totalEncodeTime: number = 0;
let startDecodeTime: number = 0;
let totalDecodeTime: number = 0;

protobuf.load("client/testmessage.proto", function (err, root) {
	if (err)
		throw err;

	if (root === undefined) return;

	const TestMessage = root.lookupType("TestMessage")

	const message = TestMessage.create(data);
	const buffer = TestMessage.encode(message).finish();
	console.log(buffer.byteLength);

	ws.on("open", () => {
		startTime = performance.now();
		for (let i = 0; i < numberOfMessages; i++) {
			startEncodeTime = performance.now();
			const message = TestMessage.create(data);
			const buffer = TestMessage.encode(message).finish();
			ws.send(buffer);
			totalEncodeTime += performance.now() - startEncodeTime;
		}
		console.log(`Encode time: ${Math.round(totalEncodeTime)} ms`)
	});

	ws.on("message", (msg: any) => {
		messagesRecieved++;

		startDecodeTime = performance.now();
		const buffer: Uint8Array = new Uint8Array(msg);
		const message: any = TestMessage.decode(buffer);
		totalDecodeTime += performance.now() - startDecodeTime;

		if (messagesRecieved >= numberOfMessages) {
			endTime = performance.now();
			console.log(`decode time: ${Math.round(totalDecodeTime)} ms`)
			console.log(`${message.text} ${message.num}`);
			console.log(`${Math.round(endTime - startTime)} ms`);

			ws.close();

			process.exit();
		}
	});
})

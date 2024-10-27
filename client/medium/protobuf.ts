import Websocket from "ws"
import protobuf from "protobufjs";

const numberOfMessages: number = 100000;
let messagesRecieved: number = 0;
let startTime: number;
let endTime: number;

const ws = new Websocket("ws://localhost:3000");
ws.binaryType = "arraybuffer";

const input = {
	text: "Hello World!",
	text2: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
	num: 12345,
	decimal: 3.1415926
}

let startSerializeTime: number = 0;
let totalSerializeTime: number = 0;
let startDeserializeTime: number = 0;
let totalDeserializeTime: number = 0;

protobuf.load("client/medium/testmessage.proto", function (err, root) {
	if (err)
		throw err;

	if (root === undefined) return;

	const TestMessage = root.lookupType("TestMessage")

	ws.on("open", () => {
		startTime = performance.now();
		for (let i = 0; i < numberOfMessages; i++) {
			startSerializeTime = performance.now();
			const message = TestMessage.create(input);
			const buffer = TestMessage.encode(message).finish();
			totalSerializeTime += performance.now() - startSerializeTime;
			ws.send(buffer);
		}
	});

	ws.on("message", (msg: any) => {
		messagesRecieved++;

		startDeserializeTime = performance.now();
		const buffer: Uint8Array = new Uint8Array(msg);
		const data: any = TestMessage.decode(buffer);
		totalDeserializeTime += performance.now() - startDeserializeTime;

		if (messagesRecieved >= numberOfMessages) {
			endTime = performance.now();
			console.log(`Serialize time: ${Math.round(totalSerializeTime * 10) / 10} ms`)
			console.log(`Deserialize time: ${Math.round(totalDeserializeTime * 10) / 10} ms`)
			console.log(`Total time: ${Math.round((endTime - startTime) * 10) / 10} ms`);
			console.log(data);
			console.log(`${msg.byteLength}`);

			ws.close();

			process.exit();
		}
	});
})

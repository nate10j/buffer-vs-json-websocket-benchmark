
import crypto from "node:crypto"

function generateRandomString(size) {
	return crypto.randomBytes(size).toString("hex");
}

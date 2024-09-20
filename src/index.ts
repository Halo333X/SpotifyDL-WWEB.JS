import { Client, LocalAuth, Message } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { SpotifyDL } from "./SpotifyDL";

const client = new Client({
  authStrategy: new LocalAuth(),
});

client.on("ready", () => {
  console.log("[+] SpotifyDL");
});

client.on("message_create", (message: Message) => {
  new SpotifyDL(message.body, message).selectAction();
});

client.on("qr", (qr: string) => {
  qrcode.generate(qr, { small: true });
});

client.initialize();
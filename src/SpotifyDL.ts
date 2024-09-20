import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
const { downloadTrack } = require("@nechlophomeriaa/spotifydl");
const lyrics = require('azlyricsman');

export class SpotifyDL {
  private cmd: string;
  private urls: string[];
  private client: Message;

  constructor(cmd: string, client: Message) {
    this.cmd = cmd.split(" ")[0];
    this.urls = cmd.split(" ").slice(1);
    this.client = client;
  }

  selectAction() {
    switch (this.cmd) {
      case "/track": {
        this.downloadTrackWithRetry(this.urls[0]);
        break;
      }
      case "/tracks": {
        console.log(JSON.stringify(this.urls));
        this.downloadMultipleTracks(this.urls);
        break;
      }
      case "/help": {
        this.client.react("💼");
        this.client.reply(
          "🎧 *SpotifyDL*\n\n*/track URL*\n*/tracks URLS[]*\n\nMade by: https://github.com/Halo333X\nSource Code: "
        );
      }
    }
  }

  async downloadMultipleTracks(urls: string[]) {
    for (const url of urls) {
      await this.downloadTrackWithRetry(url);
    }
  }

  async downloadTrackWithRetry(url: string, retries: number = 2) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.client.react("⌛");
        const downTrack = await downloadTrack(url);
        const audioBuffer = downTrack.audioBuffer;

        if (audioBuffer && audioBuffer.length > 0) {
          const fileName = `${downTrack.title.replace(/[^a-zA-Z0-9]/g, "_")}.mp3`;
          const media = new MessageMedia(
            "audio/mp3",
            audioBuffer.toString("base64"),
            fileName
          );
          const info = await this.client.reply(
            `🎵 *SpotifyDL*

💭 *Title: ${downTrack?.title}*
🎤 *Artist: ${downTrack?.artists}* 
⌛ *Duration: ${downTrack?.duration}*
⚠️ *Explicit: ${downTrack?.explicit}*
💽 *Album: ${downTrack?.album?.name}*`
          );
          info.reply(media);
          this.client.react("🎵");
          break;
        } else {
          console.error("El buffer de audio es inválido o está vacío.");
          this.client.react("⛔");
        }
      } catch (error) {
        console.error(`Intento ${attempt} fallido para ${url}:`, error);
        this.client.react("⛔");
        if (attempt === retries) {
          console.error(
            `No se pudo descargar ${url} después de ${retries} intentos.`
          );
        }
      }
    }
  }
}

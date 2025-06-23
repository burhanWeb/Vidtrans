import dotenv from "dotenv";
dotenv.config();

import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from "@aws-sdk/client-sqs";

import path from "path";
import { fileURLToPath } from "url";
import { mkdir } from "fs/promises";

// Import worker functions (adjust relative path)
import { downloadFileFromS3, transcodeVideo } from "../worker/worker.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerVideosDir = path.resolve(__dirname, "../videos");

const client = new SQSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Helper to ensure directory exists
async function ensureDirExists(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch (err) {
    console.error("Error creating directory", err);
    throw err;
  }
}

export const pollMessages = async () => {
  console.log("Polling SQS for messages...");
  try {
    const receiveCommand = new ReceiveMessageCommand({
      QueueUrl:
        "https://sqs.ap-south-1.amazonaws.com/107346957471/VidTransQueue",
      MaxNumberOfMessages: 1,
      WaitTimeSeconds: 20,
    });

    const { Messages } = await client.send(receiveCommand);

    if (!Messages || Messages.length === 0) {
      console.log("No messages in the queue");
      return;
    } else {
      console.log(`Received ${Messages.length} message(s)`);
    }

    for (const message of Messages) {
      console.log("Processing message:", message.MessageId || "no message id");

      const { ReceiptHandle, Body } = message;

      let event;
      try {
        event = JSON.parse(Body);
      } catch (parseErr) {
        console.error("Failed to parse message body:", parseErr);
        continue;
      }

      if ("Service" in event && "Event" in event) {
        if (event.Event === "s3:TestEvent") {
          console.log("Skipping s3:TestEvent notification");
          continue;
        }
      }

      for (const record of event.Records) {
        const { s3 } = record;
        const {
          bucket,
          object: { key },
        } = s3;
        const decodedKey = decodeURIComponent(key.replace(/\+/g, " "));

        console.log(
          `Downloading file from S3 bucket: ${bucket.name}, key: ${decodedKey}`
        );

        try {
          // Ensure folder exists before downloading
          await ensureDirExists(workerVideosDir);

          console.log("Transcoding completed for:", file);
        } catch (err) {
          console.error("Failed to download/transcode:", err);
          continue;
        }

        // Delete the processed message from queue
        const deleteCommand = new DeleteMessageCommand({
          QueueUrl:
            "https://sqs.ap-south-1.amazonaws.com/107346957471/VidTransQueue",
          ReceiptHandle,
        });

        await client.send(deleteCommand);
        console.log("Message deleted successfully from the queue");
      }
    }
  } catch (error) {
    console.error("Error polling SQS:", error);
  }
};

setInterval(() => {
  console.log("Triggering pollMessages...");
  pollMessages();
}, 5000);

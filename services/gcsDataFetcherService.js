import { Storage } from "@google-cloud/storage";

const getJsonFromGCS = async (gcsLink) => {
  try {
    // Extract bucket and file name from the GCS link
    const regex = /^gs:\/\/([^/]+)\/(.+)$/;
    const match = gcsLink.match(regex);

    if (!match) {
      throw new Error("Invalid GCS URL format");
    }

    const bucketName = match[1];
    const fileName = match[2];

    // Initialize the Google Cloud Storage client
    const storage = new Storage();
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(fileName);

    // Download the file from GCS
    const [fileData] = await file.download();

    // Parse and return the JSON content
    return JSON.parse(fileData.toString("utf-8"));
  } catch (err) {
    console.error("Error retrieving JSON from GCS:", err);
    throw new Error("Error retrieving JSON from GCS");
  }
};

export default getJsonFromGCS;

import uploadFileToGCS from "../services/gcsUploadService.js";
import performOcrOnGcsPdf from "../services/gcsOcrService.js";
import getJsonFromGCS from "../services/gcsDataFetcherService.js";
import extractInsightsFromText from "../services/textProcessingService.js";

// This function is responsible for sending data using SSE
export const processMultipleDocuments = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    // Set up the SSE response header
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Emit the results as files are processed
    for (const file of req.files) {
      const gcsFileUrl = await uploadFileToGCS(file);
      file.buffer = null;

      const ocrOutputGcsUri = await performOcrOnGcsPdf(gcsFileUrl);
      const ocrJsonResponse = await getJsonFromGCS(ocrOutputGcsUri);
      const fullText = ocrJsonResponse?.responses?.[0]?.fullTextAnnotation?.text;

      let responseData = { fileName: file.originalname };

      if (!fullText) {
        responseData.error = "OCR text not found";
      } else {
        const structuredData = await extractInsightsFromText(fullText);
        responseData.processedData = structuredData;
      }

      // Send the data to the client (each file processed)
      res.write(`data: ${JSON.stringify(responseData)}\n\n`);

  
    }

    // Close the connection after all files are processed
    res.write('data: {"message": "Processing complete"}\n\n');
    res.end();

  } catch (err) {
    console.error("Multi-file processing error:", err);
    res.status(500).json({ message: "Error processing files." });
  }
};

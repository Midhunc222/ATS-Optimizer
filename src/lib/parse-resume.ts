// Use legacy build for Node.js compatibility without canvas/worker issues
const pdfjs = require("pdfjs-dist/legacy/build/pdf.js");

export async function parseResume(file: Buffer): Promise<string> {
    try {
        // Convert Buffer to Uint8Array as expected by PDF.js
        const data = new Uint8Array(file);

        // Load the PDF document
        const loadingTask = pdfjs.getDocument({ data });
        const pdfDocument = await loadingTask.promise;

        let fullText = "";

        // Iterate through each page to extract text
        for (let i = 1; i <= pdfDocument.numPages; i++) {
            const page = await pdfDocument.getPage(i);
            const textContent = await page.getTextContent();

            // Extract text items and join them
            const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");

            fullText += pageText + "\n";
        }

        return fullText;

    } catch (error) {
        console.error("Error parsing PDF with pdfjs-dist:", error);
        throw error;
    }
}

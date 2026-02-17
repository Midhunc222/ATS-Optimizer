// Polyfill DOMMatrix for Node.js environment as pdf-parse dependency (pdf.js) requires it
if (typeof DOMMatrix === "undefined") {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix {
        a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
        constructor() { }
        multiply() { return this; }
        translate() { return this; }
        scale() { return this; }
    };
}

const pdfParse = require("pdf-parse");

// Debug logging to inspect what pdf-parse exports
// Debug logging to inspect what pdf-parse exports
// const fs = require('fs');
// try {
//     fs.appendFileSync('debug.log', `[DEBUG] pdfParse imported type: ${typeof pdfParse}\n`);
//     if (typeof pdfParse === 'object') {
//         fs.appendFileSync('debug.log', `[DEBUG] pdfParse keys: ${Object.keys(pdfParse)}\n`);
//     }
// } catch (e) {
//     console.error("Failed to write to debug.log", e);
// }

export async function parseResume(file: Buffer): Promise<string> {
    try {
        // Handle both v1 (function) and v2 (class) styles, and default export
        let text = "";

        // Check if it's a function (v1 style or default export)
        if (typeof pdfParse === "function") {
            const data = await pdfParse(file);
            text = data.text;
        }
        // Check if .default is the function
        else if (pdfParse.default && typeof pdfParse.default === "function") {
            const data = await pdfParse.default(file);
            text = data.text;
        }
        // Check if PDFParse class exists (v2 style)
        else if (pdfParse.PDFParse) {
            const parser = new pdfParse.PDFParse({ data: file });
            const data = await parser.getText();
            await parser.destroy();
            text = data.text;
        }
        else {
            throw new Error(`Unknown pdf-parse export: ${typeof pdfParse}`);
        }

        return text;
    } catch (error) {
        console.error("Error parsing PDF:", error);
        throw error;
    }
}

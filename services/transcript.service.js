// services/transcript.service.js

class TranscriptService {

    // ============================================
    // Clean Zoom Transcript (.vtt)
    // ============================================

    cleanTranscript(transcript) {

        if (!transcript) {

            return "";

        }

        let cleaned = transcript;

        // Remove WEBVTT header
        cleaned = cleaned.replace(/^WEBVTT\s*/i, "");

        // Remove timestamps
        cleaned = cleaned.replace(
            /\d{2}:\d{2}:\d{2}\.\d{3}\s-->\s\d{2}:\d{2}:\d{2}\.\d{3}/g,
            ""
        );

        // Remove numbering
        cleaned = cleaned.replace(/^\d+$/gm, "");

        // Remove NOTE blocks (if Zoom includes them)
        cleaned = cleaned.replace(/NOTE[\s\S]*?(?=\n\n|\n$)/g, "");

        // Remove empty lines
        cleaned = cleaned.replace(/^\s*[\r\n]/gm, "");

        // Remove multiple blank lines
        cleaned = cleaned.replace(/\n{2,}/g, "\n");

        // Trim
        cleaned = cleaned.trim();

        return cleaned;

    }

}

module.exports = new TranscriptService();
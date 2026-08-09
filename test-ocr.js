require('dotenv').config();
const ocrService =
    require("./services/ocr.service");


async function testOCR() {

    try {

        const text =
            await ocrService.extractText(

                "./uploads/answers/1786286667027-ChatGPT Image Aug 9, 2026, 08_13_21 PM.png",

                "image/png"

            );


        console.log(
            "\n========== FINAL OCR TEXT ==========\n"
        );

        console.log(text);

    }
    catch (error) {

        console.error(
            "\nOCR failed:",
            error
        );

    }

}


testOCR();
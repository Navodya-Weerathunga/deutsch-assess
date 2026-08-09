// middleware/uploadAnswer.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({

    destination(req, file, cb) {

        const uploadPath =
            path.join(
                __dirname,
                "../uploads/answers"
            );

        // Create folder if it doesn't exist
        if (!fs.existsSync(uploadPath)) {

            fs.mkdirSync(
                uploadPath,
                {
                    recursive: true
                }
            );

        }

        cb(
            null,
            uploadPath
        );

    },

    filename(req, file, cb) {

        const uniqueName =
            Date.now() +
            "-" +
            file.originalname;

        cb(
            null,
            uniqueName
        );

    }

});


const fileFilter = (req, file, cb) => {

    const ext =
        path.extname(
            file.originalname
        ).toLowerCase();


    const allowedExtensions = [

        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"

    ];


    if (
        !allowedExtensions.includes(ext)
    ) {

        return cb(
            new Error(
                "Only PDF, JPG, JPEG, and PNG files are allowed."
            )
        );

    }


    cb(null, true);

};


module.exports = multer({

    storage,

    fileFilter,

    limits: {

        fileSize:
            10 * 1024 * 1024

    }

});
const express = require('express');
const fs = require('fs')
var multer = require('multer');
const path = require('path');
const { exec } = require('child_process');

const app = express();

app.use(express.static(path.join(__dirname, 'build')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Creating dynamic upload folder
const folderName = 'public/uploads';

try {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
} catch (err) {
    console.log(err);
}

//Uploading an Image file
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    }
});

var fileFilter = function (req, file, cb) {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
        return cb("Only .png, .jpg and .jpeg format allowed!");
    }

}

var upload = multer({ storage: storage, fileFilter: fileFilter }).array('files');
var list = '';
const outputFilePath = Date.now() + "output.pdf";

app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            res.send(err);
        } else {
            console.log("Succesfully Uploaded");

            fs.readdir(folderName, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    req.files.forEach((file) => {
                        list += `${file.path}`;
                        list += ' ';
                        console.log(file);
                    });
                    console.log(list);
                }
            })
        }
    });
});

app.post('/pdf', function (req, res, next) {
    exec(`magick convert ${list} ${outputFilePath}`, function (err, stdrr, stdout) {
        if (err) {
            console.log(err);
        } else {
            // res.send(`<a href=${outputFilePath} download>Download</a>`);
            console.log("Successfully Converted");
            res.download(outputFilePath, (err) => {
                console.log(err);
            });
        }
    });
});

//Server listining at PORT
app.listen(5000, function () {
    console.log("Server is running at 5000");
});
const express = require('express');
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream');
const zlib = require('zlib'); //inbuilt in node JS
const app = express();

const PORT = 8000;

//Stream read (Sample.txt) -->Zipper --> fs.writeStream

fs.createReadStream('./sample.txt').pipe(
    zlib.createGzip().pipe(
        fs.createWriteStream('./sample.zip')
    )
);

//memory efficient node.js streams not need to load whole file in our memory
app.get('/', (req, res) => {
    const stream = fs.createReadStream('./sample.txt', 'utf-8');
    stream.on('data', (chunk) => { //reading it in chunks small pieces of data?
        res.write(chunk);
    });
    stream.on('end', () => {
        res.end();
    })
})

//showing vedio over the network in UI
app.get('/vedio', (req, res) => {
    const vedioPath = path.join(__dirname, 'bigvedio.mp4');

    //getting the size of the size of the file using fs.stat gives the meta data of file
    const videoSize = fs.statSync(videoPath).size;
    // Get "Range" header from request
    const range = req.headers.range;

    // Let clients know we support ranges
    res.setHeader('Accept-Ranges', 'bytes');

    // If no Range header, you can send the whole file (200) — many players still work.
    if (!range) {
        res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': fileSize,
        });
        return pipeline(fs.createReadStream(videoPath), res, (e) => { //cleaner way to use pipe in nodeJs stream, handles any errors
            if (e) console.error('Pipeline error:', e);
        });
    }

    // Parse Range header: bytes=start-end (end optional)
    const match = range.match(/bytes=(\d*)-(\d*)/);

    if (!match) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.sendStatus(416); // Range Not Satisfiable
    }


    const stream = fs.createReadStream(vedioPath);
    res.writeHead(200, {
        "Content-Type": "video/mp4"
    });
    // Pipe data to browser chunk by chunk
    stream.pipe(res);

})

app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
})


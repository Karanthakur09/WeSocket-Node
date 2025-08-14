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
    fs.stat(vedioPath, (err, stat) => {

        if (err) {
            if (err.code === 'ENOENT') return res.sendStatus(404); // file not found
            return res.status(500).send('File error');
        }
        // Get "Range" header from request
        const fileSize = stat.size;
        const range = req.headers.range;

        // Let clients know we support ranges
        res.setHeader('Accept-Ranges', 'bytes');

        // If no Range header, you can send the whole file (200) — many players still work.
        if (!range) {
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': fileSize,
            });
            return pipeline(fs.createReadStream(vedioPath), res, (e) => { //cleaner way to use pipe in nodeJs stream, handles any errors
                if (e) console.error('Pipeline error:', e);
            });
        }

        // Parse Range header: bytes=start-end (end optional)
        const match = range.match(/bytes=(\d*)-(\d*)/);

        if (!match) {
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            return res.sendStatus(416); // Range Not Satisfiable
        }
        let start = match[1] ? parseInt(match[1], 10) : 0;
        let end = match[2] ? parseInt(match[2], 10) : fileSize - 1;

        // Validate range
        if (isNaN(start) || isNaN(end) || start > end || start >= fileSize) {
            res.setHeader('Content-Range', `bytes */${fileSize}`);
            return res.sendStatus(416);
        }

        const chunkSize = end - start + 1;

        // Send partial content headers
        res.writeHead(206, {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Content-Length': chunkSize,
            'Accept-Ranges': 'bytes',
            // optional caching:
            // 'Cache-Control': 'public, max-age=0, must-revalidate',
        });

        // Stream only the requested slice
        const fileStream = fs.createReadStream(vedioPath, { start, end });
        pipeline(fileStream, res, (e) => {
            if (e) console.error('Stream error:', e);
        });
    });

})

app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
})


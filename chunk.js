const express=require('express');
const fs=require('fs');
const zlib=require('zlib'); //inbuilt in node JS
const app=express();

const PORT=8000;

//Stream read (Sample.txt) -->Zipper --> fs.writeStream

fs.createReadStream('./sammple.txt').pipe(
    zlib.createGzip().pipe(
        fs.createWriteStream('./sample.zip')
    )
);

//memory efficient node.js streams not need to load whole file in our memory
app.get('/',(req,res)=>{
    const stream=fs.createReadStream('./sample.txt','utf-8');
    stream.on('data',(chunk)=>{ //reading it in chunks small pieces of data?
        res.write(chunk);
    });
    stream.on('end',()=>{
        res.end();
    })
})

app.listen(PORT,()=>{
    console.log(`Server started at port: ${PORT}`);
})

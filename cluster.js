const cluster = require('node:cluster');
const os=require('os');
const express=require('express');

const totalCPU=os.cpus().length;
console.log(totalCPU);
if(cluster.isPrimary){
    for(let i=0;i<totalCPU;i++){
        cluster.fork();
    }

}else{ //our own express server working on child processes
    const app=express();
    const PORT=8000;

    app.get("/",(req,res)=>{
        return res.json({
            message:`Hello from express Server ${process.pid}`
        })
    });

    app.listen(PORT,()=>{
        console.log('Server listening on PORT 8000');
    })
}
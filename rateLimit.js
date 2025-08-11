import express from 'express';
import rateLimit from 'express-rate-limit';


const app = express();

//create a rate-limit

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, //limit each IP to 1000 requests per windowMS
    message: 'to Many request from this IP',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
})

app.use(limiter);

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.listen(3000, () => console.log('Server running on port 3000'));

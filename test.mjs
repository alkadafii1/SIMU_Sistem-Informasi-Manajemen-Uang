// test.mjs
import express from 'express';

const app = express();
const port = 3001;

app.get('/test', (req, res) => {
    res.json({ message: 'Success!' });
});

app.listen(port, () => {
    console.log(`✅ Test server running at http://localhost:${port}`);
});
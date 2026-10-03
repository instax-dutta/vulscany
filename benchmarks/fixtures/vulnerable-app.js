const express = require('express');
const app = express();
const AWS_KEY = "AKIAIOSFODNN7EXAMPLE";

app.get('/user', (req, res) => {
    const html = "<div>" + req.query.name + "</div>";
    res.send(html);
});

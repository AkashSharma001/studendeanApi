const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');

const app = express();
app.use(express.json());

mongoose.connect('url', {useNewUrlParser: true, useUnifiedTopology: true});

app.use('/users', userRoutes);
app.use('/sessions', sessionRoutes);

app.listen(3000, () => console.log('Server started'));

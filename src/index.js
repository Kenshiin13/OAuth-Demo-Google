require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '/public')));

app.listen(process.env.PORT, () =>
{
    console.log(`Server listening on port ${process.env.PORT}`);
});

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");

app.use("/auth", authRouter);
app.use("/profile", profileRouter);
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import route from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use(route);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

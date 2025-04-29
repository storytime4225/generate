import OpenAI from "openai"
import express from "express"
import bodyParser from "body-parser"
import fs from "fs"
import http from "http"

const app = express()
const port = process.env.PORT || 5050
const client = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY']
});
const prompt = process.env['PROMPT']

app.use(express.static("public"))
app.use(bodyParser.json({limit: '50mb', extended: true}))

app.get("/", function(req,res) {
    res.type('html').send("<html><body><h1>Hey there</h1></body></html>")
})

app.get("/health", function(req,res) {
    res.writeHead(200, {"Content-Type":"text/html"})
    res.end()
})

app.post("/data", (req, res) => {
    processImage().then(response => {
        res.writeHead(200, {"Content-Type":"application/json"})
        res.end("{ \"content\": \"" + response + "\" }")
    })
})

async function processImage() {
    try {
        const response = await client.responses.create({
            model: "o4-mini-2025-04-16",
            input: "You are a parent that has to make up a nice bedtime story for your child. Generate a story that is about 500 words longs, in a format that is easy to read, like a fairy tale book with a beginning, middle and an end."
        });
        return response.output_text
    } catch (error) {
        console.error("ERROR:", error)
        throw error
    }
}

app.listen(port)
import OpenAI from "openai"
import express from "express"
import bodyParser from "body-parser"
import fs from "fs"
import http from "http"

const app = express()
const port = process.env.PORT || 5050
const openai = new OpenAI({
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
    processText().then(response => {
        let cleaned = response.replace(/\n/g, " ").replace(/"/g, "\\\"")
        let output = "{ \"content\": \"" + cleaned + "\" }"
        res.writeHead(200, {"Content-Type":"application/json"})
        res.end(output)
    })
})

async function processText() {
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{
                role: "user",
                content: [{
                    type: "text", text: prompt
                }],
            }]
        })
        return completion.choices[0].message.content
    } catch (error) {
        console.error("ERROR:", error)
        throw error
    }
}

app.listen(port)
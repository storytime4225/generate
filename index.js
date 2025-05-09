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

app.get("/privacy", function(req,res) {
    res.type('html').send("<html><body><h1>Privacy Policy</h1><p>Information for Henry Heleine Privacy 2025 to follow soon. Contact me by emailing henryheleine86@gmail.com for further information.</p></body></html>")
})

app.get("/support", function(req,res) {
    res.type('html').send("<html><body><h1>Support</h1><p>Information for Henry Heleine support to follow soon. Contact me by emailing henryheleine86@gmail.com for further information.</p></body></html>")
})

app.post("/story", (req, res) => {
    processBatch().then(response => {
        let cleaned = response.replace(/\n/g, " ").replace(/"/g, "\\\"")
        let output = "{ \"content\": \"" + cleaned + "\" }"
        res.writeHead(200, {"Content-Type":"application/json"})
        res.end(output)
    })
})

app.post("/stream", (req, res) => {
    processStream(res)
})

async function processBatch() {
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

async function processStream(res) {
    const stream = await openai.responses.create({
        model: "gpt-4o-mini",
        input: [{
            role: "user",
            content: prompt
        }],
        stream: true
    })
    res.writeHead(200, { "Content-Type": "text/plain", "Transfer-Encoding": "chunked"})
    for await (const event of stream) {
        if (event.type === "response.output_text.delta") {
            res.write(event.delta)
        }
        if (event.type === "response.output_text.done") { // response.content_part.done, esponse.output_item.done, response.completed
            console.log("finished streaming request")
            res.end()
        }
    }
}

app.listen(port)
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser"

const port = 3000;
const app = express()

let posts = []

app.use(express.static("public"))

app.use(bodyParser.urlencoded({extended : true}))

function formatText(req, res, next) {
    if (req.body["content"]) {
        req.body.formattedContent = req.body["content"].replace(/\n/g, '<br>');
    }
    next();
}

function findPost(req, res, next) {
    const postId = parseInt(req.params.id);
    const postIndex = posts.findIndex(p => p.id === postId);


    if (postIndex === -1) {
        return res.status(404).send('Post not found');
    }
    // Attach the found post to the request object so it can be accessed in the next middleware/route handler
    req.post = posts[postIndex];
    req.postIndex = postIndex;
    next();
}

app.get("/", (req, res) => {
    res.render("index.ejs", {posts : posts});
})

app.get("/new", (req, res) => {
    res.render("new.ejs")
})


app.post("/new", formatText, (req, res) => {
    
    const post = {
        id : Date.now(),
        title : req.body["title"],
        content : req.body.formattedContent,
        datePosted : new Date()
    }
    posts.push(post)
    res.redirect(`/post/${post.id}`)

})

app.get("/post/:id", findPost, (req, res) => {
    res.render('post.ejs', { post: req.post });
})
    

app.post("/post/:id", findPost, (req, res) => {
    posts.splice(req.postIndex, 1)
    res.redirect("/")
})

app.get("/edit-post/:id", findPost, (req, res) => {
    if (req.post) {
        res.render("new.ejs", {post : req.post})
    }else {
        res.status(404).send("Post not found")
    }
})

app.post("/edit-post/:id", findPost, (req, res) => {
    if (req.post) {
        req.post.title = req.body.title;
        req.post.content = req.body.content;
        
        res.redirect(`/post/${req.post.id}`)
    }else {
        res.status(404).send("Post not found")
    }
})


app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})
const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const keys = require("./process/keys");


const port = process.env.PORT || 3003;
const fetch = require("node-fetch");
const movieItem = require("./models/movieItem");
const genres = require("./models/movieItem")

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
console.log('key', process.env.API_KEY);
const dbUri =
  "mongodb+srv://supercode:supercode@cluster0.dvmfb.mongodb.net/superDatabase?retryWrites=true&w=majority";
mongoose
  .connect(dbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then((result) => {
    console.log("connected to db");
    app.listen(port, () => {
      console.log("listening at 3003");
    });
  })
  .catch((err) => console.log(err));

app.get("/", (req, res) => {
  fetch(
    `https://api.themoviedb.org/3/trending/all/day?api_key=${process.env.API_KEY}`
  )
    .then((response) => response.json())
    .then((json) => {

      // console.log(json);
      res.status(200).render("index", { movieItem: json.results });
    });
});
app.get("/item/:id", (req, res) => {
  console.log(req.params.id);
  fetch(
    `https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.API_KEY}`
  )
    .then((response) => response.json())
    .then((json) => {
      // console.log(json);
      res.status(200).render("item", { movieItem: json });
    });

});

app.get("/favourites", (req, res) => {
  movieItem.find()
    .then((result) => {
      console.log(result);
      res.status(200).render('favourites', { movieItem: result })
    })

})

app.get("/item/:id/favourites", (req, res) => {
  console.log(req.params.id);
  fetch(`https://api.themoviedb.org/3/movie/${req.params.id}?api_key=${process.env.API_KEY}`)
    .then((response) => response.json())
    .then((json) => {

      movieItem.find({ id: req.params.id })
        .then((result) => {
          console.log('Myresult', { movieItem: result })
          if (result.length > 0) {
            res.redirect('/favourites')
          } else {
            new movieItem({
              id: json.id,
              name: json.title,
              backdrop_path: json.backdrop_path,
              poster_path: json.poster_path,
              vote_average: json.vote_average,
              vote_count: json.vote_count,
              release_date: json.release_date,
              genres: json.genres,
              overview: json.overview,
            }).save().then(result => {
              console.log('Mycreated' + result)
              res.redirect('/favourites', { movieItem: result })
            })
          }


        })
        .catch(err => console.log(err))
    });
})


app.get("/favouriteItem/:id", (req, res) => {
  console.log(req.params.id)

  movieItem.find({ id: req.params.id })
    .then((result) => {
      console.log(result);

      res.status(200).render('favouriteItem', { movieItem: result })
    })
    .catch(err => console.log(err))

})


app.get('/favouriteItem/:id/delete', (req, res) => {
  movieItem.find({ id: req.params.id })
    .then((result) => {
      console.log("I am deleted")

      let index = result.findIndex(elt => elt.id == req.params.id)
      console.log("myIndex" + index);

      res.status(201).redirect('/favourites')
    })
    .catch(err => console.log(err))
})

app.post('/search', (req, res) => {
  fetch(`https://api.themoviedb.org/3/search/multi?api_key=${process.env.API_KEY}&language=en-US&query=${req.body.search}&page=1&include_adult=false`)
    .then(response => response.json())
    .then((json) => {

      res.status(200).render('index', { movieItem: json.results })
    })
})

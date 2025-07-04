const express = require('express')
const app = express()
const userRoutes = require('./routes/user')
const adminRoutes = require('./routes/admin')
const path = require('path')
const connectDB = require('./db/connectDB')
const session = require('express-session');
const nocache = require('nocache');
port = 5000

app.use(nocache());
app.use(session({
    secret:'mysecretvalue',
    resave:false,
    saveUninitialized:true,
    cookie:{
        maxAge:1000*60*60*24
    }
}))

app.set("views",path.join(__dirname,'views'));
app.set('view engine','hbs');


app.use(express.static('public'));
app.use(express.urlencoded({extended:true}));
app.use(express.json());


app.use('/user',userRoutes);
app.use('/admin',adminRoutes);



app.use((req, res, next) => {
    res.status(404).render('error', {status:404, message: 'Page not found' });
});




connectDB();

app.listen((port),()=>{
    console.log(`http://localhost:${port}`)
})
const userSchema = require('../model/usermodel');
const bcrypt = require('bcrypt');
const saltround = 10;


const registerUser = async(req,res)=>{
    try{
        const {email,password,cpassword} = req.body;

        if (!email || !password || !cpassword) {
            return res.render('user/register', { message: 'All fields are required' });
        }

        if (password !== cpassword) {
            return res.render('user/register', { message: 'Passwords do not match' });
        }

        const user = await userSchema.findOne({email})

        if(user) return res.render('user/register',{message:'User already exists'})

        const hashedPassword = await bcrypt.hash(password, saltround);



        const newUser = new userSchema({
            email,
            password:hashedPassword
        })

        await newUser.save();
        res.render('user/login',{message:'Registration succesfull'})

    }catch(error){
        console.log(error);
        res.render('user/register',{message:'Something went wrong'})
        
    }
}


const login = async(req,res)=>{
    try{
        const {email,password} = req.body
        const user = await userSchema.findOne({email})
        if(!user) return res.render('user/login',{message:'User does not exist'})
            
        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch) return res.render('user/login',{message:'Incorrect password'})
        req.session.user = true;
        res.render('user/userHome',{message:'Login successfull'})

    }catch(error){
        res.render('user/login', { message: 'Something went wrong' });
    }
}

const loadRegister = (req,res)=>{
    res.render('user/register')
}

const loadLogin = (req,res)=>{
    res.render('user/login')
}


const loadHome = (req,res)=>{
    res.render('user/userHome')
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect('/user/login');
    });
}


module.exports = {
    registerUser,
    loadLogin,
    loadRegister,
    login,
    loadHome,
    logout

}


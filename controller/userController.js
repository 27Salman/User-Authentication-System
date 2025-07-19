const usermodel = require('../model/usermodel');
const bcrypt = require('bcrypt');
const saltround = 10;

const registerUser = async (req, res) => {
    try {
        const { email, password, cpassword } = req.body;

        if (!email || !password || !cpassword) {
            return res.render('user/register', { message: 'All fields are required' });
        }

        if (password !== cpassword) {
            return res.render('user/register', { message: 'Passwords do not match' });
        }

        const existingUser = await usermodel.findOne({ email });
        if (existingUser) {
            return res.render('user/register', { message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, saltround);

        const newUser = new usermodel({
            email,
            password: hashedPassword
        });

        await newUser.save();
        req.session.success = 'Registration successful';
        res.redirect('/user/login');

    } catch (error) {
        console.log(error);
        res.render('user/register', { message: 'Something went wrong' });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await usermodel.findOne({ email });

        if (!user) {
            return res.render('user/login', { message: 'User does not exist' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('user/login', { message: 'Incorrect password' });
        }

        req.session.user = user._id;
        res.redirect('/user/userHome'); 

    } catch (error) {
        console.log(error);
        res.render('user/login', { message: 'Something went wrong' });
    }
};


const loadRegister = (req, res) => {
    res.render('user/register');
};

const loadLogin = (req, res) => {
    const message = req.session.success;
    req.session.success = null;
    res.render('user/login', { message });
};


const loadHome = async (req, res) => {
    try {
        const userId = req.session.user;
        const user = await usermodel.findById(userId);

        if (!user) {
            req.session.destroy((err) => {
                if (err) {
                    console.log(err);
                    return res.send("Error logging out");
                }
                return res.redirect('/user/login');
            });
        } else {
            res.render('user/userHome');
        }
    } catch (error) {
        console.log(error);
        res.status(500).render('error', { status: 500, message: 'Internal Server Error' });
    }
};

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.send("Error logging out");
        }
        res.redirect('/user/login');
    });
};

module.exports = {
    registerUser,
    loadLogin,
    loadRegister,
    login,
    loadHome,
    logout
};

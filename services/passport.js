var passport = require('passport');
var { User } = require('../models');

// CREATE LOCAL STRANTEGY
const LocalStrategy = require('passport-local')
const userSignIn = new LocalStrategy({ usernameField: "Email", passwordField: "Password" }, (email, password, done) => {
    User.findOne({ where: { email } }).then(data => {
        // มี Email ในระบบหรือไม่
        if (!data) {
            return done(null, false) // ไม่ผ่าน False
        }
        //เช็ค password ตรงกับในระบบหรือไม่
        if (data.Password != password) {
            return done(null, false) // ไม่ผ่าน False
        }
        data.Password = undefined; // ไม่ต้องการให้แสดงข้อมูล password
        return done(null, data); // ส่ง Data ที่ล็อกอินผ่านกลับไปแสดงผล
    })
});

//CREATE JWT STRATEGY

const jwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const jwtOptoins = { jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), secretOrKey: "api-development" }
const jwtSignIn = new jwtStrategy(jwtOptoins, (payload, done) => {
    User.findByPk(payload.id).then(data => {
        if (data) {
            data.Password = undefined;
            return done(null, data);
        } else {
            return done(null, false);
        }
    })
})

//user-local สามารถกำหนดชื่อเองได้
passport.use('user-local', userSignIn);
passport.use(jwtSignIn);
module.exports = passport;

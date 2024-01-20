const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({ _id }, jwtkey, { expiresIn: "3d" });
};

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json("Missing  parameters ....");

        if (!validator.isEmail(email))
            return res.status(400).json("Incorrect email format");

        let user = await userModel.findOne({ email });
        if (!!user)
            return res
                .status(400)
                .json("User with the given email already exits ...");

        const salt = await bcrypt.genSalt(10);

        let passwordHASH = await bcrypt.hash(password, salt);

        let userCreated = new userModel({
            name,
            email,
            password: passwordHASH,
        });
        await userCreated.save();
        const token = createToken(userCreated._id);
        res.status(200).json({ _id: userCreated._id, name, email, token });
    } catch (error) {
        console.log(error);
        return res.status(400).json("something went wrong ...");
    }
};

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await userModel.findOne({ email });

        if (!user)
            return res
                .status(400)
                .json("No user with this email was found ... ");

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword)
            return res.status(400).json("incorrect password ... ");

        const token = await createToken(user._id);

        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token,
        });
    } catch (error) {
        console.log("Error in login :", error);
        return res.status(400).json("something went wrong ...");
    }
};

exports.getUser = async (req, res) => {
    const { id } = req.params;
    try {
        // find by id
        if (id) {
            let user = await userModel.findOne({ _id: id }).select("-password");
            if (!user) return res.status(400).json("Not found any user ... ");
            return res.status(200).json(user);
        }

        // find all
        let users = await userModel.find().select("-password");
        if (!users || users.length === 0)
            return res.status(400).json("Not found any user ... ");
        return res.status(200).json(users);
    } catch (error) {
        console.log("Error in get user :", error);
        return res.status(400).json("something went wrong ...");
    }
};

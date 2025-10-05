const Jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema, acceptFPCodeSchema } = require("../middlewares/validator");
const User = require('../models/usersModel');
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");

exports.signup = async (req,res) =>{
    const {email,password} = req.body;
    try {
        const {error, value} = signupSchema.validate({email,password});
        
        if(error){
            return res.status(400).json({
                success:false, message: error.details[0].message
            })
        }
        const existingUser = await User.findOne({
            email
        })
        if(existingUser){
            return res.status(400).json({
                success:false,
                message:"User already exist"
            })
        }
    const hashPassword = await doHash(password, 12);
    const newUser = new User({
        email,
        password:hashPassword,
    })
    const result = await newUser.save();
    result.password = undefined;
    res.status(201).json({
        success:true,
        message:'Your account has been created',
        result
    })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong',
            error
        })
    }
}

exports.signin = async (req,res) =>{
     const {email, password} = req.body;
try {
    const {error, value} = signinSchema.validate({email,password})
    if(error){
        return res.status(401).json({
            success:false, message: error.details[0].message
        })
    }
    const exisitingUser = await User.findOne({email}).select('+password')
    console.log(exisitingUser)
    if(!exisitingUser){
        return res.status(401).json({
            success:false,
            message:"User don't exist"
        })
    }
    const result = await doHashValidation(password, exisitingUser.password)
    if(!result){
        return res.status(401).json({
            success:false,
            message:"Invalide crediatials"
        })
    }
    const token = Jwt.sign({
        userId: exisitingUser._id,
        email: exisitingUser.email,
        verified: exisitingUser.verified,
    }, process.env.JWT_TOKEN,{
       expiresIn: '8h',
    }
    )

    res.cookie('Authorization','Bearer ' + token,
        {expires: new Date(Date.now() + 8*3600000),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    }).json({
        success: true,
        token,
        message: 'logged in successfully'
    });

} catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong',
        error
    })
}

}

exports.logout = async (req, res) => {
    try {
      res.clearCookie('Authorization', {
        httpOnly: true,
        sameSite: 'Lax',
        secure: true,
        path: '/',
      }).status(200).json({
        success: true,
        message: "You have been logged out successfully"
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Something went wrong',
        error
      });
    }
  };

exports.sendVerificationCode = async (req,res)=>{
    const {email} = req.body;
    try {
        const exisitingUser = await User.findOne({email})
        if(!exisitingUser){
            return res.status(404).json({
                success:false,
                message:"User don't exist"
            })
        }
        if(exisitingUser.verified){
            return res.status(400).json({
                success:false,
                message:"You are already verified"
            })
        }

        const codeValue = Math.floor(Math.random()*1000000).toString()
        let info = await transport.sendMail({
            from:process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
            to: exisitingUser.email,
            subject:"Verifiction code",
            html: '<h1>' + codeValue + '</h1>'
        })

        if(info.accepted[0] === exisitingUser.email){
            const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFIACTION_CODE_SECRECT)
            exisitingUser.verificationCode = hashedCodeValue
            exisitingUser.verificationCodeValidation = Date.now()
            await exisitingUser.save()
            return res.status(200).json({
                success:true,
                message: 'Code sent!'
            })
        }
        res.status(400).json({
            success:false,
            message: 'Code sent failed!'
        })

    } catch (error) {
        console.log(error)
    }
};

exports.verifyVericationCode = async (req,res)=>{
    const {email, providedCode} = req.body;
    try {
        const {error, value} = acceptCodeSchema.validate({email,providedCode})
        if(error){
            return res.status(401).json({
                success:false, message: error.details[0].message
            })
        }

        const codeValue = providedCode.toString();
        const exisitingUser = await User.findOne({email}).select('+verificationCodeValidation +verificationCode')
        if(!exisitingUser){
            return res.status(404).json({
                success:false,
                message:"User don't exist"
            })
        }
        if(exisitingUser.verified){
            return res.status(400).json({
                success:false,
                message:"You are already verified"
            })
        }
        if(!exisitingUser.verificationCode || !exisitingUser.verificationCodeValidation){
            return res.status(400)
                      .json({
                        success: false, message:"something is wrong with code !"
                      })
        }

        if(Date.now() -exisitingUser.verificationCodeValidation > 5*60*1000){
        return res.status(400).json({
            success:true,
            message:"code has been expired!!"
        });   
    }
    const hashedCodeValue = hmacProcess(codeValue, process.env.HMAC_VERIFIACTION_CODE_SECRECT)
    if(hashedCodeValue === exisitingUser.verificationCode){
        exisitingUser.verified = true;
        exisitingUser.verificationCode = undefined;
        exisitingUser.verificationCodeValidation = undefined;
        await exisitingUser.save()
        return res.status(200).json({
            success:true,
            message: 'You are verified now !'
        })
    }
    return res.status(400).json({
        success:false,
        message: 'unexpected occured !!'
    })
    } catch (error) {
        console.log(error)
    }
}

exports.changePassword = async (req, res) => {
	const { userId, verified } = req.user;
	const { oldPassword, newPassword } = req.body;
	try {
		const { error, value } = changePasswordSchema.validate({
			oldPassword,
			newPassword,
		});
		if (error) {
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}
		if (!verified) {
			return res
				.status(401)
				.json({ success: false, message: 'You are not verified user!' });
		}
		const existingUser = await User.findOne({ _id: userId }).select(
			'+password'
		);
		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}
		const result = await doHashValidation(oldPassword, existingUser.password);
		if (!result) {
			return res
				.status(401)
				.json({ success: false, message: 'Invalid credentials!' });
		}
		const hashedPassword = await doHash(newPassword, 12);
		existingUser.password = hashedPassword;
		await existingUser.save();
		return res
			.status(200)
			.json({ success: true, message: 'Password updated!!' });
	} catch (error) {
		console.log(error);
	}
};

exports.sendForgotPasswordCode = async (req, res) => {
	const { email } = req.body;
	try {
		const existingUser = await User.findOne({ email });
		if (!existingUser) {
			return res
				.status(404)
				.json({ success: false, message: 'User does not exists!' });
		}

		const codeValue = Math.floor(Math.random() * 1000000).toString();
		let info = await transport.sendMail({
			from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
			to: existingUser.email,
			subject: 'Forgot password code',
			html: '<h1>' + codeValue + '</h1>',
		});

		if (info.accepted[0] === existingUser.email) {
			const hashedCodeValue = hmacProcess(
				codeValue,
				process.env.HMAC_VERIFIACTION_CODE_SECRECT
			);
			existingUser.forgotPasswordCode = hashedCodeValue;
			existingUser.forgotPasswordCodeValidation = Date.now();
			await existingUser.save();
			return res.status(200).json({ success: true, message: 'Code sent!' });
		}
		res.status(400).json({ success: false, message: 'Code sent failed!' });
	} catch (error) {
		console.log(error);
	}
};

exports.verifyForgotPasswordCode = async (req, res) => {
	const { email, providedCode, newPassword } = req.body;
	try {
		const { error, value } = acceptFPCodeSchema.validate({
			email,
			providedCode,
			newPassword,
		});
		if (error) { 
			return res
				.status(401)
				.json({ success: false, message: error.details[0].message });
		}

		const codeValue = providedCode.toString();
		const existingUser = await User.findOne({ email }).select(
			'+forgotPasswordCode +forgotPasswordCodeValidation'
		);

		if (!existingUser) {
			return res
				.status(401)
				.json({ success: false, message: 'User does not exists!' });
		}

		if (
			!existingUser.forgotPasswordCode ||
			!existingUser.forgotPasswordCodeValidation
		) {
			return res
				.status(400)
				.json({ success: false, message: 'something is wrong with the code!' });
		}

		if (
			Date.now() - existingUser.forgotPasswordCodeValidation >
			5 * 60 * 1000
		) {
			return res
				.status(400)
				.json({ success: false, message: 'code has been expired!' });
		}

		const hashedCodeValue = hmacProcess(
			codeValue,
			process.env.HMAC_VERIFIACTION_CODE_SECRECT
		);

		if (hashedCodeValue === existingUser.forgotPasswordCode) {
			const hashedPassword = await doHash(newPassword, 12);
			existingUser.password = hashedPassword;
			existingUser.forgotPasswordCode = undefined;
			existingUser.forgotPasswordCodeValidation = undefined;
			await existingUser.save();
			return res
				.status(200)
				.json({ success: true, message: 'Password updated!!' });
		}
		return res
			.status(400)
			.json({ success: false, message: 'unexpected occured!!' });
	} catch (error) {
		console.log(error);
	}
};
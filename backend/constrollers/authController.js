const Jwt = require("jsonwebtoken");
const { signupSchema, signinSchema, acceptCodeSchema, changePasswordSchema, acceptFPCodeSchema } = require("../middlewares/validator");
const User = require('../models/usersModel');
const { doHash, doHashValidation, hmacProcess } = require("../utils/hashing");
const transport = require("../middlewares/sendMail");
const accountModule = require("../models/accountModule");

exports.signup = async (req,res) =>{
    const {accountname,email,password,fullName,phone} = req.body;
    try {
        const {error, value} = signupSchema.validate({accountname,email,password,fullName,phone});

        if(error){
            return res.status(400).json({
                success:false, message: error.details[0].message
            })
        }
        
const existingUser = await User.findOne({
  $or: [{ email }, { phone }]
});

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: "Account with this email or phone already exists"
  });
}
    const hashPassword = await doHash(password, 12);
    const newAccount = new accountModule({
        accountName:accountname,
        email:email,
        phone:phone
    })
    const accountResult = await newAccount.save();
    
    const newUser = new User({
        email,
        password:hashPassword,
        fullName:fullName,
        phone:phone,
        accountID:accountResult._id,
        role:"superadmin"
    })
    
    const result = await newUser.save();
    const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome! Your Account <strong>${accountname}</strong> Has Been Created</h2>
            <p>Hello ${fullName},</p>
            <p>Your account has been successfully created. Here are your login credentials:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Role:</strong> superadmin</p>
            </div>
            <p>Please keep these credentials secure and consider changing your password after your first login.</p>
            <p>Best regards,<br>Your Team</p>
        </div>
    `;
    
    let info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: email,
        subject: "New Account Created - Login Credentials",
        html: emailContent
    });

    // Check if email was sent successfully
    if(info.accepted && info.accepted.length > 0 && info.accepted[0] === email){
        console.log("Email sent successfully to:", email);
    } else {
        console.log("Email sending failed or partially failed");
    }
    result.password = undefined;
    res.status(201).json({
        success:true,
        message:`Your account has been created`,
        result,
        resultAdmin
    })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong',
            error
        })
    }
}
//create admin accounts
exports.createAdminaccount = async (req, res) => {
    const { email, password, fullName, phone, role,districtmanagerID,generalmanagerID,ownerID,restaurantID,superadminsID} = req.body;
    try {
        const { error } = signupSchema.validate({ email, password, fullName, phone, role });
        const userId = req.accountID;
        const userRole = req.userRole;
        console.log(userId,userRole)
        if(!userId & !userRole){
            return res.status(400).json({
            success: false,
            message: "account don't exist",
        });
        }
        if (['districtmanager', 'generalmanager'].includes(userRole.toLowerCase())) {
        return res.status(400).json({
        success: false,
        message: `${userRole} are not allowed to create an account`,
           });
          }
        if(userRole == 'owner'){
            if(role == 'superadmin'){
                return res.status(400).json({
                success: false,
                message: "you are not allowed to create an superadmin account",
            }) 
            }
            const existingUser = await User.findOne({
             $or: [{ email }, { phone }]
                  });

              if (existingUser) {
               return res.status(400).json({
               success: false,
               message: "role with this email or phone already exists"
              });
              }
             const hashPassword = await doHash(password, 12);    
              const newUser = new User({
                  email,
                  password:hashPassword,
                  fullName:fullName,
                  phone:phone,
                  accountID:userId,
                  role:role
              })
    
        const result = await newUser.save();
        const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome! Your Account Has Been Created</h2>
            <p>Hello ${fullName},</p>
            <p>Your account has been successfully created. Here are your login credentials:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${role}</p>
            </div>
            <p>Please keep these credentials secure and consider changing your password after your first login.</p>
            <p>Best regards,<br>Your Team</p>
        </div>
    `;
    
    let info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: email,
        subject: "New Account Created - Login Credentials",
        html: emailContent
    });

    // Check if email was sent successfully
    if(info.accepted && info.accepted.length > 0 && info.accepted[0] === email){
        console.log("Email sent successfully to:", email);
    } else {
        console.log("Email sending failed or partially failed");
    }
        result.password = undefined;
        res.status(201).json({
                success:true,
                message:`Your ${role} account has been created`,
                result
        })
        }
              const existingUser = await User.findOne({
              $or: [{ email }, { phone }]
              });

              if (existingUser) {
               return res.status(400).json({
               success: false,
               message: "role with this email or phone already exists"
              });
              }
             const hashPassword = await doHash(password, 12);    
              const newUser = new User({
                  email,
                  password:hashPassword,
                  fullName:fullName,
                  phone:phone,
                  accountID:userId,
                  role:role,
                  districtmanagerID,   // <-- save arrays
                  generalmanagerID,
                  ownerID,
                  restaurantID:restaurantID,
                  superadminsID
              })
    
            const result = await newUser.save();
            const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome! Your Account Has Been Created</h2>
            <p>Hello ${fullName},</p>
            <p>Your account has been successfully created. Here are your login credentials:</p>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Password:</strong> ${password}</p>
                <p><strong>Role:</strong> ${role}</p>
            </div>
            <p>Please keep these credentials secure and consider changing your password after your first login.</p>
            <p>Best regards,<br>Your Team</p>
        </div>
    `;
    
    let info = await transport.sendMail({
        from: process.env.NODE_CODE_SENDING_EMAIL_ADDRESS,
        to: email,
        subject: "New Account Created - Login Credentials",
        html: emailContent
    });

    // Check if email was sent successfully
    if(info.accepted && info.accepted.length > 0 && info.accepted[0] === email){
        console.log("Email sent successfully to:", email);
    } else {
        console.log("Email sending failed or partially failed");
    }
            result.password = undefined;
            res.status(201).json({
                success:true,
                message:`Your ${role} account has been created`,
                result
            })
        

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

exports.updateAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      phone,
      role,
      superadminsID,
      ownerID,
      districtmanagerID,
      generalmanagerID,
      restaurantID, // array of restaurant IDs (frontend)
    } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, message: 'User id is required' });
    }

    const update = {};
    if (fullName !== undefined) update.fullName = fullName;
    if (email !== undefined) update.email = email;
    if (phone !== undefined) update.phone = phone;
    if (role !== undefined) update.role = role;
    if (Array.isArray(superadminsID)) update.superadminsID = superadminsID;
    if (Array.isArray(ownerID)) update.ownerID = ownerID;
    if (Array.isArray(districtmanagerID)) update.districtmanagerID = districtmanagerID;
    if (Array.isArray(generalmanagerID)) update.generalmanagerID = generalmanagerID;
    // Schema uses restaurantIdID (typo). Map incoming restaurant array if present.
    if (Array.isArray(restaurantID)) update.restaurantID = restaurantID;

    const updated = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'Admin updated', user: updated });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Update failed', error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, message: 'User id is required' });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, message: 'Admin deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, message: 'Delete failed', error: error.message });
  }
};

exports.fetchadmin =async (req,res)=>{
const userId = req.accountID
  try {
   const admins = await User.find({ accountID: userId });


return res.status(200).json({
  admins
});
  } catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong in while fetch data',
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
        accountID: exisitingUser.accountID,
        role:exisitingUser.role

    }, process.env.JWT_TOKEN,{
       expiresIn: '8h',
    }
    )

    res.cookie('Authorization','Bearer ' + token,
        {expires: new Date(Date.now() + 8*3600000),
        httpOnly: process.env.NODE_ENV === 'production',
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
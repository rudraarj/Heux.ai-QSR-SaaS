const {addrestaurantSchema,addrecipientSchema, addsectionSchema, addquestionSchema, updaterecipientSchema } = require("../middlewares/validator")
const employeesModule = require("../models/employeesModule")
const inspectionsModule = require("../models/inspectionsModule")
const notificationModule = require("../models/notificationModule")
const restaurantModule = require("../models/restaurantModule")
const sectionModule = require("../models/sectionModule")


exports.fetchdata = async(req,res)=>{
const userId = req.userId
  try {
   const inspection = await inspectionsModule.find({userId:userId})
   const employees = await employeesModule.find({userId:userId})
   const restaurant = await restaurantModule.find({userId:userId})
   const section = await sectionModule.find({userId:userId})
   return res.status(200).send({
    inspection,
    employees,
    restaurant,
    section
  });
  } catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong in while fetch data',
        error
    })
  }
}

exports.inspectionRec = async(req,res) =>{
    try {
        const data = req.body
        const userId = req.userId
        const checkboxKey = Object.keys(data).find(key => key.startsWith("section"));
        const optionsArray = data[checkboxKey];
        const chat_id = data.chat_id

        const employees = await employeesModule.findOne({whatsappNumber: chat_id});
        if(!employees){
            return res.status(401).json({
                success:false,
                message: "this employee don't exist"
            })
        }
        const section = await sectionModule.findOne({id: checkboxKey})
        if(!section){
            return res.status(401).json({
                success:false,
                message: "this section don't exist"
            })
        }
            if (!employees.sectionIds.includes(checkboxKey)) {
                return res.status(401).json({
                    success: false,
                    message: "This employee doesn't fall into this section"
                });
            }
        const allOptions = section.questions
        const responses = allOptions.map(option => ({
        questionId: option.id,
        passed: optionsArray.includes(option.id)
        }));
        const allPassed = responses.every(responses => responses.passed)
        const inspData = new inspectionsModule({
                 id:`inspection-${Date.now()}`,
                 userId:userId,
                 sectionId:checkboxKey,
                 employeeId:employees.id,
                 date:Date.now(),
                 status: allPassed ?'passed':'attention',
                 responses
              })
              await inspData.save();
              const result = inspectionsModule.find({userId:userId,})
              return res.status(201).json({
                  success:true,
                  message:'Your inspection has been created',
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

exports.addRestaurant = async (req, res) => {
  try {
    const { id, name, location } = req.body;
    const userId = req.userId;
    
    // Use uploaded file path
    const image = req.file?.path;
    console.log(image)

    const { value, error } = addrestaurantSchema.validate({ id, name, location, image });
    if (error) {
      return res.status(401).json({
        success: false,
        message: error.details[0].message
      });
    }

    const existingUser = await restaurantModule.findOne({ id });
    if (existingUser) {
      return res.status(201).json({
        success: false,
        message: "Restaurant already exists"
      });
    }

    const newUser = new restaurantModule({
      id,
      userId,
      name,
      location,
      image, // saved path like "uploads/1682392932.jpg"
    });

    await newUser.save();

    const allRestaurant = await restaurantModule.find({ userId });
    return res.status(201).json({
      success: true,
      message: 'Your restaurant has been created',
      allRestaurant
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: 'Something went wrong',
      error
    });
  }
};

exports.addSection = async(req,res)=>{

   try {
    const userId = req.userId
    const { value, error } = addsectionSchema.validate(req.body);
            if(error){ 
                return res.status(401).json({
                       success:false, message: error.details[0].message
                })
            }
            const Id = value.id
            const existingUser = await sectionModule.findOne({Id})
     
            if(existingUser){
                return res.status(201).json({
                   success:false,
                   message:"section already exist"
                })
            }
             const newUser = new sectionModule({
                id: value.id,
                name: value.name,
                userId:userId,
                restaurantId: value.restaurantId,
                frequency: value.frequency,
                questions: value.questions || []
              })
             await newUser.save();
             const allSection = await sectionModule.find({userId:userId,})
                 return res.status(201).json({
                     success:true,
                     message:'Your sections has been created',
                     allSection
                 })

   } catch (error) {
    return res.status(400).json({
        success:false,
        message:'some thing went wrong',
        error
    })
   }

}

exports.addrecipient = async(req,res)=>{
  const {id,name,whatsappNumber,employeeId,restaurantId,sectionIds,image} = req.body;
      try {
        const userId = req.userId
          const {error, value} = addrecipientSchema.validate({id,name,whatsappNumber,employeeId,restaurantId,sectionIds,image});
           
          if(error){
              return res.status(401).json({
                  success:false, message: error.details[0].message
              })
          }
          const existingUser = await employeesModule.findOne({
              whatsappNumber
          })

          if(existingUser){
              return res.status(201).json({
                  success:false,
                  message:"User already exist"
              })
          }
        
        const newUser = new employeesModule({
          id,
          userId:userId,
          name,
          whatsappNumber,
          employeeId,
          restaurantId,
          sectionIds,
          image,
            })
            await newUser.save();
            const allemployee = await employeesModule.find({userId:userId,})
            return res.status(200).json({
                success:true,
                message:'Your recipient has been created',
                allemployee
            })
        }catch(error){
            return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }
}

exports.addquestions = async(req,res)=>{
    try {
        const { id, text, sectionId } = req.body;
        const {value,error} = addquestionSchema.validate({id,text,sectionId});
        if(error){ 
           return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }
        await sectionModule.findOneAndUpdate(
            { id: sectionId },
            { $push: { questions: { id, text, sectionId } } },
            { new: true }
        )
        const section = await sectionModule.findOne({id:sectionId})
        const questions = section.questions
        return res.status(200).json({
                success:true,
                message: 'Question added',
                questions
        })
    } catch (error) {
       return res.status(400).json({
            success:false,
            message:'some thing went wrong',
            error
        })
    }
}

exports.newNotification = async (req,res)=>{
    try {
        const {frequency,id,isActive,restaurantId,sectionId,time} = req.body;
        const userId = req.userId
        const exisitingNotification = await notificationModule.findOne({id})
        if(exisitingNotification){
            return res.status(400).json({
                success:false,
                message:'some thing went wrong',
                error
            })
        }

        const newNotification = new notificationModule({
            frequency,id,userId:userId,isActive,restaurantId,sectionId,time
              })
        await newNotification.save();
        const allNotification = await notificationModule.find({userId:userId,})
              return res.status(201).json({
                  success:true,
                  message:'Your notificatoin has been created',
                  allNotification
              })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })
    }
}

exports.getnotification = async (req,res)=>{
    try {
        const userId = req.userId
        const allNotification = await notificationModule.find({userId:userId,});
        return res.status(201).json({
            success:true,
            allNotification
        })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })
    }
}

exports.updateEmployee = async(req,res)=>{
    try {
    const {id,name,whatsappNumber,restaurantId,sectionIds} = req.body;
          const {error, value} = updaterecipientSchema.validate({id,name,whatsappNumber,restaurantId,sectionIds});
           
          if(error){
              return res.status(401).json({
                  success:false, message: error.details[0].message
              })
          }
    const user = await employeesModule.findOneAndUpdate({id:id},
    {
        name,
        whatsappNumber,
        restaurantId,
        sectionIds,
    })
    return res.status(201).json({
        success:true,
        message:'Your employee has been updated',
        user
    })
    } catch (error) {
        return res.status(400).json({
            success:false,
            message:'some thing went wrong in notification',
            error
        })  
    }
}
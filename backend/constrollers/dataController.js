const {addrestaurantSchema,addrecipientSchema, addsectionSchema, addquestionSchema, updaterecipientSchema, updateQuestionSchema } = require("../middlewares/validator")
const employeesModule = require("../models/employeesModule")
const inspectionsModule = require("../models/inspectionsModule")
const notificationModule = require("../models/notificationModule")
const restaurantModule = require("../models/restaurantModule")
const sectionModule = require("../models/sectionModule")
const usersModel = require("../models/usersModel")
// const notificationScheduler = require("../utils/NotificationScheduler")
const { scheduler: notificationScheduler } = require('../utils/NotificationScheduler');
const dotenv = require('dotenv')
dotenv.config()


const axios = require('axios'); 

exports.getWebhook = (req,res)=>{
    const mode = req.query['hub.mode']
    const challenge = req.query['hub.challenge']
    const token = req.query['hub.verify_token']
  
    if (mode && token === process.env.WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge)
    } else {
      res.sendStatus(403)
    }
}

exports.fetchdata = async(req,res)=>{
const userId = req.userId

  try {
   const userDetails = await usersModel.findOne({_id:userId});

   const inspection = await inspectionsModule.find({restaurantId: { $in: userDetails.restaurantID }})
   const employees = await employeesModule.find({restaurantId: { $in: userDetails.restaurantID }})
   const restaurant = await restaurantModule.find({id: { $in: userDetails.restaurantID }});
   const section = await sectionModule.find({restaurantId: { $in: userDetails.restaurantID }})
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
        console.log(data)
        const userId = '682b867fc4ef1e39fd5acf9c' //accoutID
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
            // if (!employees.sectionIds.includes(checkboxKey)) {
            //     return res.status(401).json({
            //         success: false,
            //         message: "This employee doesn't fall into this section"
            //     });
            // }
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
                 restaurantId:section.restaurantId,
                 employeeId:employees.id,
                 date:Date.now(),
                 status: allPassed ?'passed':'attention',
                 responses
              })
              await inspData.save();
              const result = await inspectionsModule.find({userId:userId,})
              console.log(result)
              return res.status(201).json({
                  success:true,
                  message:'Your inspection has been created',
                  result
              })

    } catch (error) {
        return res.status(400).json({
            success:false,
            message:"some thing want wrong",
            error
        })
    }
  }

exports.addInspectionImage = async(req, res) => {
    try {
        const { chat_id, user_input_data } = req.body;

        // Validate required fields
        if (!chat_id || !user_input_data || !Array.isArray(user_input_data)) {
            return res.status(400).json({
                success: false,
                message: "chat_id and user_input_data array are required"
            });
        }

        // Find the employee by whatsapp number
        const employee = await employeesModule.findOne({ whatsappNumber: chat_id });
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Find the last inspection for this employee
        const lastInspection = await inspectionsModule
            .findOne({ employeeId: employee.id })
            .sort({ date: -1 }); // Sort by date descending to get the most recent

        if (!lastInspection) {
            return res.status(404).json({
                success: false,
                message: "No inspection found for this employee"
            });
        }

        // Extract image URLs from user_input_data
        const imageUrls = user_input_data
            .map(item => item.answer)
            .filter(answer => answer && answer.trim() !== ''); // Filter out empty answers
        // Initialize images array if it doesn't exist
        if (!lastInspection.images) {
            lastInspection.images = [];
        }
console.log(imageUrls)
        // Add new images to the inspection
        lastInspection.images.push(...imageUrls);

        // Save the updated inspection
        const dataimage = await lastInspection.save();
       console.log(dataimage)
        return res.status(200).json({
            success: true,
            message: "Images added to inspection successfully",
            data: {
                inspectionId: lastInspection.id,
                totalImages: lastInspection.images.length,
                addedImages: imageUrls.length
            }
        });

    } catch (error) {
        console.error("Error in addInspectionImage:", error);
        return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: error.message
        });
    }
};

  //updated -acs
exports.addRestaurant = async (req, res) => {
  try {
    const { id, name, location } = req.body;
    const userId = req.accountID;
    const user = req.userId
    const role = req.userRole;
    
     if (['districtmanager', 'generalmanager'].includes(role.toLowerCase())) {
        return res.status(400).json({
        success: false,
        message: `${role} are not allowed to create an restaurant`,
           });
    }
    // Use uploaded file path
    const image = req.file?.path;
    console.log(userId)

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

    const result = await usersModel.updateMany(
      { accountID: userId, role: "superadmin" }, // condition
      { $addToSet: { restaurantID: id } }, // update
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No superadmins found for this accountID",
      });
    }
    const result2 = await usersModel.findOneAndUpdate(
      { _id: user}, // condition
      { $addToSet: { restaurantID: id } }, // update
    );

    if (result2.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "No account find found for this userid",
      });
    }

    const userDetails = await usersModel.findOne({_id:user})
    // const updateSuperadminRestList
    const allRestaurant = await restaurantModule.find({id: { $in: userDetails.restaurantID }});
    return res.status(201).json({
      success: true,
      message: 'Your restaurant has been created',
      allRestaurant,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
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
    const userId = req.accountID;
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
            const userDetails = await usersModel.findOne({accountID:userId})
             const allSection = await sectionModule.find({restaurantId: { $in: userDetails.restaurantID }})
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

exports.deleteSection = async (req,res)=>{

     try {
        const { id } = req.body;
        const userId = req.accountID;

        // Verify the notification belongs to the user
        const section = await sectionModule.findOne({id});
        if (!section) {
            return res.status(404).json({
                success: false,
                message: 'section not found'
            });
        }
        await sectionModule.findOneAndDelete({ id: id});

        // Get remaining notifications
        const userDetails = await usersModel.findOne({accountID:userId})
        const allSection = await sectionModule.find({restaurantId: { $in: userDetails.restaurantID }});

        return res.status(200).json({
            success: true,
            message: 'section deleted successfully',
            allSection: allSection
        });

    } catch (error) {
        console.error('Error deleting section:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting section',
            error: error.message
        });
    }

}

exports.addrecipient = async(req,res)=>{
  const {id,name,whatsappNumber,employeeId,restaurantId,sectionIds,image} = req.body;
      try {
        const userId = req.accountID;
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
              const userDetails = await usersModel.findOne({accountID:userId})
            const allemployee = await employeesModule.find({restaurantId: { $in: userDetails.restaurantID }})
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

exports.assignEmployeesToRestaurant = async(req,res)=>{
    try {
        const { employeeIds, restaurantId } = req.body;
        const userId = req.accountID;
        
        // Validate input
        if (!employeeIds || !Array.isArray(employeeIds) || employeeIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Employee IDs array is required and must not be empty'
            });
        }
        
        if (!restaurantId) {
            return res.status(400).json({
                success: false,
                message: 'Restaurant ID is required'
            });
        }
        
        // Verify all employees exist and belong to the user
        const employees = await employeesModule.find({ 
            id: { $in: employeeIds },
            userId: userId 
        });
        
        if (employees.length !== employeeIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some employees not found or do not belong to you'
            });
        }
        
        // Update all employees with the new restaurant ID
        const updateResult = await employeesModule.updateMany(
            { id: { $in: employeeIds } },
            { $set: { restaurantId: restaurantId } }
        );
        
        // Get updated employees for response
        const updatedEmployees = await employeesModule.find({ 
            id: { $in: employeeIds },
            userId: userId 
        });
        
        return res.status(200).json({
            success: true,
            message: `${updateResult.modifiedCount} employee(s) assigned to restaurant successfully`,
            updatedEmployees: updatedEmployees,
            modifiedCount: updateResult.modifiedCount
        });
        
    } catch (error) {
        console.error('Error assigning employees to restaurant:', error);
        return res.status(500).json({
            success: false,
            message: 'Error assigning employees to restaurant',
            error: error.message
        });
    }
}

exports.deleteEmployee = async (req,res)=>{

    try {
        const { id } = req.body;
       const userId = req.accountID;

        // Verify the notification belongs to the user
        const employee = await employeesModule.findOne({id});
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: 'employee not found'
            });
        }
        await employeesModule.findOneAndDelete({ id: id});

        // Get remaining notifications
        const userDetails = await usersModel.findOne({accountID:userId})
        const allEmployee = await employeesModule.find({restaurantId: { $in: userDetails.restaurantID }});

        return res.status(200).json({
            success: true,
            message: 'employee deleted successfully',
            allEmployee: allEmployee
        });

    } catch (error) {
        console.error('Error deleting employee:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting employee',
            error: error.message
        });
    }

}

exports.updatequestion = async (req, res) => {
     try {
        const { id, text, sectionId } = req.body;
        
        // Validate the input (assuming you have an updateQuestionSchema)
        const { value, error } = updateQuestionSchema.validate({ id, text, sectionId });
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Something went wrong',
                error
            });
        }

        // Update the specific question in the questions array
        const updatedSection = await sectionModule.findOneAndUpdate(
            { 
                id: sectionId,
                "questions.id": id  // Find the section and the specific question
            },
            { 
                $set: { 
                    "questions.$.text": text  // Update only the text field of the matched question
                }
            },
            { new: true }
        );

        // Check if the section was found and updated
        if (!updatedSection) {
            return res.status(404).json({
                success: false,
                message: 'Section or question not found'
            });
        }

        const questions = updatedSection.questions;
        
        return res.status(200).json({
            success: true,
            message: 'Question updated successfully',
            questions
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong',
            error
        });
    }
};

exports.deleteQuestion = async (req,res)=>{
const { sectionId, questionId } = req.body.data;
const userId = req.accountID;


  if (!userId) {
    return res.status(400).json({ success: false, message: 'Section ID and Question ID are required' });
  }
  if (!sectionId || !questionId) {
    return res.status(400).json({ success: false, message: 'Section ID and Question ID are required' });
  }

  try {
    const updatedSection = await sectionModule.findOneAndUpdate(
      { id: sectionId },
      { $pull: { questions: { id: questionId } } },
      { new: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ success: false, message: 'Section not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      allquestion: updatedSection,
    });
  } catch (err) {
    console.error('Error deleting question:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

exports.createNotification = async (req, res) => {
    try {
        const { restaurantId, sectionId, frequency, time, timeZone } = req.body;
        const userId = req.accountID;

        // Validate required fields
        if (!restaurantId || !sectionId || !frequency || !time || !timeZone) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Create notification data
        const notificationData = {
            id: `notification-${Date.now()}`,
            userId,
            restaurantId,
            sectionId,
            frequency,
            time,
            timeZone,
            isActive: true,
            createdAt: new Date()
        };

        // Add notification using scheduler (this will save to DB and schedule)
        const notification = await notificationScheduler.addNotification(notificationData);

        // Get all notifications for response
         const userDetails = await usersModel.findOne({accountID:userId})
        const allNotifications = await notificationModule.find({restaurantId: { $in: userDetails.restaurantID }});

        return res.status(201).json({
            success: true,
            message: 'Notification created and scheduled successfully',
            notification,
            allNotification: allNotifications
        });

    } catch (error) {
        console.error('Error creating notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error creating notification',
            error: error.message
        });
    }
};

// Get all notifications
exports.getNotifications = async (req, res) => {
    try {
        const userId = req.userId;
        const userDetails = await usersModel.findOne({_id:userId});
        const notifications = await notificationModule.find({restaurantId: { $in: userDetails.restaurantID }});

        return res.status(200).json({
            success: true,
            allNotification: notifications
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching notifications',
            error: error.message
        });
    }
};

// Delete notification endpoint
exports.deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.accountID;

        // Verify the notification belongs to the user
        const notification = await notificationModule.findOne({ id, userId });
        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        // Delete notification using scheduler (this will cancel schedule and remove from DB)
        await notificationScheduler.deleteNotification(id);

        // Get remaining notifications
      // Get all notifications for response
         const userDetails = await usersModel.findOne({accountID:userId})
        const allNotifications = await notificationModule.find({restaurantId: { $in: userDetails.restaurantID }});

        return res.status(200).json({
            success: true,
            message: 'Notification deleted successfully',
            allNotification: allNotifications
        });

    } catch (error) {
        console.error('Error deleting notification:', error);
        return res.status(500).json({
            success: false,
            message: 'Error deleting notification',
            error: error.message
        });
    }
};


// Your existing triggerNotification function remains the same
exports.triggerNotification = async (req, res) => {
    try {
        const { sectionId } = req.body;
    //    const userId = req.accountID;

        // Validate required fields
        if (!sectionId) {
            return res.status(400).json({
                success: false,
                message: 'Section ID is required'
            });
        }

        // Find all employees assigned to this section
        const employees = await employeesModule.find({
            sectionIds: { $in: [sectionId] }
        }).select('whatsappNumber name');

        // Format phone number function
        const formatPhoneNumber = (phoneNumber) => {
            let cleaned = phoneNumber.replace(/\D/g, '');
            
            if (cleaned.startsWith('0')) {
                cleaned = '91' + cleaned.substring(1);
            } else if (cleaned.length === 10) {
                cleaned = '91' + cleaned;
            }
            
            return cleaned;
        };

        // Extract and validate employee data
        const employeeData = employees
            .filter(employee => employee.whatsappNumber && employee.name)
            .map(employee => ({
                phoneNumber: formatPhoneNumber(employee.whatsappNumber), // Format the number
                name: employee.name,
                originalNumber: employee.whatsappNumber // Keep original for reference
            }));

        if (employeeData.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No employees assigned to this section',
                employees: []
            });
        }

        const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL_notification;
        console.log(process.env.WHATSAPP_WEBHOOK_URL_notification)
        const webhookResults = [];
        
        for (const employee of employeeData) {
            try {
                const webhookPayload = {
                    name: employee.name,
                    phonenumber: employee.phoneNumber, // Using formatted number
                };

                console.log(`Sending WhatsApp message to: ${employee.phoneNumber} (original: ${employee.originalNumber})`);
                console.log('Payload:', JSON.stringify(webhookPayload, null, 2));

                const response = await axios({
                    url: webhookUrl,
                    method: 'post',
                    data: webhookPayload,
                    timeout: 1000 // 30 second timeout
                });

                // Log the full response for debugging
                console.log(`WhatsApp API Response for ${employee.name}:`, {
                    status: response.status,
                    statusText: response.statusText,
                    data: response.data,
                    headers: response.headers
                });

                webhookResults.push({
                    phoneNumber: employee.phoneNumber,
                    originalNumber: employee.originalNumber,
                    name: employee.name,
                    status: 'success',
                    response: response.status,
                    messageId: response.data?.messages?.[0]?.id,
                    whatsappResponse: response.data
                });

                console.log(`Webhook triggered successfully for ${employee.name} (${employee.phoneNumber})`);
                
                // Add delay between requests
                await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2 seconds
                
            } catch (error) {
                console.error(`Failed to trigger webhook for ${employee.name} (${employee.phoneNumber}):`, {
                    message: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    statusText: error.response?.statusText
                });
                
                webhookResults.push({
                    phoneNumber: employee.phoneNumber,
                    originalNumber: employee.originalNumber,
                    name: employee.name,
                    status: 'failed',
                    error: error.message,
                    errorDetails: error.response?.data,
                    errorStatus: error.response?.status
                });
            }
        }

        const successful = webhookResults.filter(result => result.status === 'success').length;
        const failed = webhookResults.filter(result => result.status === 'failed').length;

        return res.status(200).json({
            success: true,
            message: `Notifications processed for ${employeeData.length} employee(s)`,
            summary: {
                total: employeeData.length,
                successful: successful,
                failed: failed
            },
            employees: employeeData,
            webhookResults: webhookResults,
            debug: {
                accessToken: process.env.WHATSAPP_ACCESS_TOKEN ? 'Present' : 'Missing',
                webhookUrl: webhookUrl
            }
        });

    } catch (error) {
        console.error('Error in triggerNotification:', error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong in notification',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

exports.csvNotification = async (req, res) => {
    try {
        console.log('Manual CSV generation triggered via controller');
        
        // Check if notificationScheduler is initialized
        if (!notificationScheduler.initialized) {
            return res.status(500).json({
                success: false,
                message: 'Scheduler not initialized yet. Please try again in a moment.',
                error: 'SCHEDULER_NOT_READY'
            });
        }

        // Safe body parsing - handle both undefined body and missing properties
        const requestBody = req.body || {};
        const triggerWebhook = requestBody.triggerWebhook !== false; // Default to true

        console.log(`Manual trigger - Webhook enabled: ${triggerWebhook}`);
        console.log('Request body:', requestBody);

        // Generate CSV and get result with URL
        const result = await notificationScheduler.generateInspectionCsv();
        
        if (result.success) {
            let webhookResult = null;
            
            // If webhook should be triggered, send it
            if (triggerWebhook) {
                try {
                    console.log('Sending CSV to webhook...');
                    
                    // Read the CSV file content
                    const fs = require('fs').promises;
                    let csvContent = '';
                    
                    // Check if filePath exists in result
                    if (result.filePath) {
                        csvContent = await fs.readFile(result.filePath, 'utf8');
                    } else if (result.csvContent) {
                        csvContent = result.csvContent;
                    } else {
                        throw new Error('No CSV content available');
                    }
                    
                    // Send to webhook
                    const axios = require('axios');
                    const webhookUrl = 'https://hook.eu2.make.com/u942iqdzwmsy2ihgzc4rfx88xv9f16ak';
                    
                    const webhookPayload = {
                        csvFile: csvContent,
                        filename: result.filename,
                        csvUrl: result.csvUrl,
                        generatedAt: result.generatedAt,
                        recordCount: result.recordCount,
                        type: 'inspection_report',
                        trigger: 'manual'
                    };

                    console.log('Webhook payload info:', {
                        filename: webhookPayload.filename,
                        csvUrl: webhookPayload.csvUrl,
                        recordCount: webhookPayload.recordCount,
                        csvContentLength: csvContent.length,
                        hasContent: csvContent.length > 0
                    });

                    const webhookResponse = await axios({
                        url: webhookUrl,
                        method: 'post',
                        data: webhookPayload,
                        timeout: 30000
                    });

                    webhookResult = {
                        success: true,
                        status: webhookResponse.status,
                        statusText: webhookResponse.statusText,
                        data: webhookResponse.data
                    };

                    console.log('✅ Webhook sent successfully:', {
                        status: webhookResponse.status,
                        statusText: webhookResponse.statusText,
                        responseData: webhookResponse.data
                    });

                } catch (webhookError) {
                    console.error('❌ Webhook failed:', {
                        message: webhookError.message,
                        status: webhookError.response?.status,
                        data: webhookError.response?.data,
                        stack: webhookError.stack
                    }); 

                    webhookResult = {
                        success: false,
                        error: webhookError.message,
                        status: webhookError.response?.status,
                        data: webhookError.response?.data
                    };
                }
            }

            res.status(200).json({
                success: true,
                message: 'CSV generated successfully',
                csvUrl: result.csvUrl,
                filename: result.filename,
                recordCount: result.recordCount,
                generatedAt: result.generatedAt,
                webhook: triggerWebhook ? {
                    triggered: true,
                    result: webhookResult
                } : {
                    triggered: false,
                    reason: 'Disabled by request parameter'
                },
                data: {
                    downloadUrl: result.csvUrl,
                    fileInfo: {
                        name: result.filename,
                        records: result.recordCount,
                        created: result.generatedAt
                    }
                }
            });
        } else {
            res.status(200).json({
                success: false,
                message: result.message || 'No inspection data found',
                csvUrl: null,
                recordCount: result.recordCount || 0,
                webhook: {
                    triggered: false,
                    reason: 'No CSV generated'
                }
            });
        }

    } catch (error) {
        console.error('Error in csvNotification controller:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error triggering CSV generation',
            error: error.message,
            csvUrl: null,
            webhook: {
                triggered: false,
                reason: 'Error occurred'
            },
            timestamp: new Date().toISOString()
        });
    }
};
// GET method - Download CSV file directly
exports.downloadCsv = async (req, res) => {
    try {
        const filename = req.params.filename;
        console.log(`CSV download requested for: ${filename}`);
        
        // More flexible filename validation to match your generated files
        if (!filename.endsWith('.csv') || !filename.startsWith('inspection_report_')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid filename format'
            });
        }
        
        const path = require('path');
        const fs = require('fs');
        
        // Updated path - from controllers folder to inspections folder
        const filePath = path.join(__dirname, '../inspections', filename);
        
        console.log('Looking for file at:', filePath);
        
        // Check if file exists (synchronous check first)
        if (!fs.existsSync(filePath)) {
            console.log('File not found at:', filePath);
            
            // Try to list files in inspections folder for debugging
            const inspectionsFolder = path.join(__dirname, '../inspections');
            try {
                const files = fs.readdirSync(inspectionsFolder);
                console.log('Available files in inspections folder:', files);
            } catch (dirError) {
                console.log('Could not read inspections folder:', dirError.message);
            }
            
            return res.status(404).json({
                success: false,
                message: 'CSV file not found',
                requestedFile: filename,
                searchPath: filePath
            });
        }
        
        console.log('File found! Preparing download...');
        
        // Set headers for automatic CSV download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Cache-Control', 'no-cache');
        
        // Create read stream and pipe to response
        const fileStream = fs.createReadStream(filePath);
        
        fileStream.on('error', (error) => {
            console.error('Error reading file:', error);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: 'Error reading CSV file',
                    error: error.message
                });
            }
        });
        
        fileStream.on('open', () => {
            console.log('File stream opened, starting download...');
        });
        
        fileStream.on('end', () => {
            console.log('File download completed successfully');
        });
        
        // Pipe the file to response
        fileStream.pipe(res);
        
    } catch (error) {
        console.error('Error in downloadCsv controller:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: 'Error downloading CSV file',
                error: error.message
            });
        }
    }
};
// GET method - CSV service status
exports.getCsvStatus = (req, res) => {
    try {
        console.log('CSV status requested via controller');
        
        // Get scheduler status
        const status = notificationScheduler.getScheduledJobs();
        
        res.status(200).json({
            success: true,
            message: 'CSV service status retrieved successfully',
            data: {
                timestamp: new Date().toISOString(),
                status: status,
                serviceInfo: {
                    initialized: notificationScheduler.initialized,
                    schedulerActive: status.csvService.jobScheduled,
                    downloadUrl: `${process.env.BASE_URL || 'http://localhost:8080'}/api/csv/download/`,
                    lastCheck: new Date().toISOString()
                }
            }
        });

    } catch (error) {
        console.error('Error getting CSV status:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving CSV status',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// GET method - List all available CSV files
exports.listCsvFiles = async (req, res) => {
    try {
        console.log('CSV file list requested');
        
        const path = require('path');
        const fs = require('fs').promises;
        
        const inspectionsFolder = path.join(__dirname, '../inspections');
        const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
        
        // Check if folder exists
        try {
            await fs.access(inspectionsFolder);
        } catch (error) {
            return res.status(200).json({
                success: true,
                message: 'No CSV files found - inspections folder does not exist yet',
                files: [],
                count: 0
            });
        }
        
        // Read directory contents
        const files = await fs.readdir(inspectionsFolder);
        
        // Filter and process CSV files
        const csvFiles = [];
        for (const file of files) {
            if (file.endsWith('.csv') && file.startsWith('inspection_report_')) {
                const filePath = path.join(inspectionsFolder, file);
                const stats = await fs.stat(filePath);
                
                csvFiles.push({
                    filename: file,
                    url: `${baseUrl}/api/csv/download/${file}`,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime
                });
            }
        }
        
        // Sort by creation date (newest first)
        csvFiles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.status(200).json({
            success: true,
            message: `Found ${csvFiles.length} CSV files`,
            files: csvFiles,
            count: csvFiles.length,
            downloadBaseUrl: `${baseUrl}/api/csv/download/`
        });
        
    } catch (error) {
        console.error('Error listing CSV files:', error);
        res.status(500).json({
            success: false,
            message: 'Error listing CSV files',
            error: error.message
        });
    }
};
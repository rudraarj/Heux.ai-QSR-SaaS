const mongoose = require('mongoose')

const employeesSchema = mongoose.Schema({
    id:{
      type: String,
      unique: true,
      required:true
    },
    userId: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required:[true, 'Name is required!']
    },
    whatsappNumber:{
        type: String,
        required: true,
        unique: true,
        sparse: true
    },
    employeeId:{
        type: String,
        unique:true,
        required:[true, 'Id is required!'],
    },
    restaurantId:{
        type: String,
        required:[true, 'res Id is required!'],
    },
    sectionIds:{
        type: [String],
        default:[]
    },
    image:{
        type:String,
        default:'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
},{
    timestamps:true
});

module.exports = mongoose.model('employees',employeesSchema)
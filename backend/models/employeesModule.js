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
        default:'https://img.freepik.com/premium-vector/avatar-guest-vector-icon-illustration_1304166-97.jpg?semt=ais_hybrid&w=740'
    }
},{
    timestamps:true
});

module.exports = mongoose.model('employees',employeesSchema)
const mongoose = require('mongoose')

const restaurantSchema = mongoose.Schema({
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
    location:{
        type: String,
        required:[true, 'location is required!']
    }, 
    status:{
       type: String,
       required: true,
       enum: ['process', 'passed'],
       default: 'process'
    },
    image:{
        type:String,
        default:'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    }
},{
    timestamps:true
});

module.exports = mongoose.model('restaurant',restaurantSchema)
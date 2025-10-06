const mongoose=require('mongoose');
const URI=process.env.MONGODB_URI;
const connectDB=async()=>{
try {
  
  const response=  await mongoose.connect(URI);
 
    if(response){
        console.log("MongoDB is Connected");
    }
    else{
        console.log("error while connecting" );
    }
    
} catch (error) {
    console.log("error while connecting MongoDB", error);
    process.exit(1);
}
}
module.exports=connectDB;
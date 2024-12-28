var express = require("express");
var app = express();
var cors = require("cors");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
var routers = express.Router();
var Complaint = require('../models/complaints.model')
var Zonal = require('../models/zonal.model')
var jwt = require("jsonwebtoken")
var mcurl = 'mongodb+srv://jvdimvp:Pradeep903@cluster0.d2cwd.mongodb.net/Bhashyam?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mcurl)
.then(()=>{
    console.log("Connected to MongoDB")
})
.catch((err)=>{
    console.log(err)
})

// routers.get("/complaintsbybranch",(req,res)=>{
//     Complaint.find()
//     .then((data)=>{
//         console.log(data);
//         res.json(data);
//     })
//     .catch((err)=>{
//         console.log(err)
//     })
// })
routers.get("/zonalscomplaints", async (req, res) => {
    var token = req.headers.authorization;
    console.log("token", token);
    if (!token) {
      res.json({ msg: "token missing" });
    }
    var zonal = jwt.verify(token, "secretkey");
    console.log("pdata", zonal);
  
    Complaint.find({ branch: { $in: zonal?._doc?.branches } })
      .then((complaints) => {
        console.log("comp", complaints);
        res.status(200).json(complaints);
      })
      .catch((error) => {
        res
          .status(500)
          .json({ error: "Failed to fetch complaints", details: error.message });
      });
  });



routers.post("/zonallogin", (req, res) => {
    console.log(req.body);
    var zonal = Zonal.findOne({ mobile: req.body.mobile })
      .then((zonal) => {
        var token = jwt.sign({ ...zonal }, "secretkey");
         console.log(token);
        
        res.json({ msg: "zonal login success", token,zonalname:zonal.zonalname });
      })
      .catch((err) => {
        console.log(err);
        res.json({ msg: "zonal login failed" });
      });
  });

routers.post('/addzonal',(req,res)=>{
    var newBranch = new Zonal(req.body);
    newBranch.save()
    .then((zonalofficer)=>{
        console.log(zonalofficer);
        res.json({msg:'Zonal Added'})
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({ msg: "zonal add failed", error: err.message });
    })
})

module.exports = routers;
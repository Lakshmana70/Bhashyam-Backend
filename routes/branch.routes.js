var express = require("express");
var app = express();
var cors = require("cors");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
var jwt = require("jsonwebtoken");
var router = express.Router();
var Branch = require('../models/branch.model')
// var Zonal = require('../models/zonal.model');
var Complaint = require('../models/complaints.model')
var mcurl = 'mongodb+srv://jvdimvp:Pradeep903@cluster0.d2cwd.mongodb.net/Bhashyam?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mcurl)
.then(()=>{
    console.log("Connected to MongoDB")
})
.catch((err)=>{
    console.log(err)
})

router.get('/',(req,res)=>{
    Branch.find()
    .then((data)=>{
        console.log(data);
        res.json(data);
    })
    .catch((err)=>{
        console.log(err);
    })
})

router.post('/login',(req,res)=>{
    console.log(req.body);
    var principal = Branch.findOne({principalname:req.body.principalname,branchname:req.body.branchname})
    
    .then((principal)=>{
        // console.log(principal)

         console.log(res);
        var token = jwt.sign({...principal},"secretkey");
         console.log(token);
        res.json({ msg:"login success",token,principalname:principal.principalname});
    })
    .catch((err)=>{
        console.log(err);
        res.json({msg:'login failed'});
    })
})

router.get('/principalcomplaints',(req,res)=>{
    console.log('pheaders',req.headers.authorization);
    var token = req.headers.authorization;
    if(!token){
        res.json({msg:'token missing'});
    }
    var principal = jwt.verify(token,'secretkey');
    console.log('pdata',principal);
    
    Complaint.find({branch:principal._doc.branchname})
    .then((data)=>{
        console.log("comp",data)
        res.json(data);
    })
    .catch((err)=>{
        console.log(err);
        res.json({msg:'error'})
    })
    

})

router.post('/addbranch',(req,res)=>{
    var newBranch = new Branch(req.body);
    newBranch.save()
    .then((branch)=>{
        console.log(branch);
        res.json({msg:'Branch Added'})
    })
    .catch((err)=>{
        console.log(err);
        res.status(500).json({ msg: "branch add failed", error: err.message });
    })
})


router.delete('/deletebranch/:id',(req,res)=>{
    var branchId = req.params.id;
    Branch.findByIdAndDelete(branchId)
    .then((result)=>{
        if(!result){
            res.json({msg:"Branch not found"})
        }
        res.json({msg:'Branch Deleted Successfully'})
    })
    .catch((err)=>{
        console.log(err);
        res.json({ msg: 'Error deleting branch', error: err.message });
    })
})

router.put('/updatebranch/:id',(req,res)=>{
    var branchId = req.params.id;
    var branchData = req.body;
    Branch.findByIdAndUpdate(branchId,branchData,{new :true})
    .then((updbranch)=>{
        if(!updbranch){
            return res.json({msg:'Branch not found'})
        }
        res.json({msg:'Branch updated Successfully',updbranch})
    })
    .catch((err)=>{
        console.log(err);
        res.json({msg:'Error in Updating branch'})
    })
})
// router.put('/updatebranch/:id', (req, res) => {
//     const branchId = req.params.id;
//     const branchData = req.body; 

//     Branch.findByIdAndUpdate(branchId, branchData, { new: true })
//     .then((updbranch) => {
//         if (!updbranch) {
//             return res.status(404).json({ msg: 'Branch not found' });
//         }
//         res.json({ msg: 'Branch updated successfully', branch: updbranch });
//     })
//     .catch((err) => {
//      console.error(err);
//      res.status(500).json({ msg: 'Error in updating branch', error: err.message });
//     });
// });


module.exports = router;
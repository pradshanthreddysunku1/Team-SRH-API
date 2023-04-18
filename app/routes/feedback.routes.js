const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const feedback = require('../models/feedback.model');
const history = require('../models/history.model');
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '50mb', extended: true }))
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
router.use(bodyParser.raw({ type: 'image/jpg', limit: '50mb' }));

router.use(cors());

router.post("/feedback", async (req,res)=> {
    try {
        // console.log(req.body);
        const result = await feedback.create(req.body);
        // console.log(`A document was inserted with the _id: ${result.insertedId}`);
        res.json({
            "success": true
        })
      } catch(err){
        res.json({
            "success" : false
        });
      }
})

router.get("/feedback/:userId", async (req,res)=> {
    try {
        // console.log(req.body);
        const result = await feedback.find( { "user.id": req.params.userId } );
        res.json(result)
      } catch(err){
        res.json(err);
      }
})

router.post("/feedback/:id", async (req,res)=>{
    try {
       const result = await feedback.findOneAndDelete( { "_id" : req.params.id } );
       if(result["_id"]){
        const resultHistory = await history.findOneAndDelete( { "inputText" : req.body.inputText, "outputText" : req.body.outputText } );
        if(resultHistory["_id"]){
          res.json({"success" : true})
        } 
       }else{
        res.json({
            "success" : false
        })
       }       
     } catch (err) {
        res.json({
            "success" : false
        })
     }
 });

 router.put("/feedback/:id", async (req,res)=> {
    let obj = {
        
        "fromLanguage": req.body.fromLanguage,
        "inputText": req.body.inputText,
        "toLanguage": req.body.toLanguage,
        "outputText": req.body.outputText,
        "feedbackText": req.body.feedbackText,
        "user": 
          {
            "id": req.body.user.id
          }
      }
    
    feedback.findByIdAndUpdate(req.params.id,obj,function(err,result){
      if(err){
        res.json(err)
      }else{
        res.json(result)
    }
})
});

module.exports = router;

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const history = require('../models/history.model');
const feedback = require('../models/feedback.model');
const router = express.Router();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json({ limit: '50mb', extended: true }))
router.use(bodyParser.urlencoded({ limit: '50mb', extended: true }))
router.use(bodyParser.raw({ type: 'image/jpg', limit: '50mb' }));

router.use(cors());

router.post("/history", async (req,res)=> {
    try {
        // console.log(req.body);
        const result = await history.create(req.body);
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

router.get("/history/:userId", async (req,res)=> {
    try {
        // console.log(req.body);
        const result = await history.find( { "user.id": req.params.userId } );
        res.json(result)
      } catch(err){
        res.json(err);
      }
})

router.post("/history/:id", async (req,res)=>{
    try {
       const result = await history.findOneAndDelete( { "_id" : req.params.id } );
       if(result["_id"]){
       await feedback.findOneAndDelete( { "inputText" : req.body.inputText, "outputText" : req.body.outputText } );
        res.json({"success" : true})
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


module.exports = router;

const util = require('util');
const fs = require('fs');
const express = require('express');
var router = express.Router();

const readDistances = () => {
    const fileToRead = 'distances/distance.json';
    const file  =  fs.readFileSync(fileToRead);
    return JSON.parse(file);
}

/* enable log */
const SHOW_DEBUG_LOG = true;
/* Show log  */
const log = (text) => SHOW_DEBUG_LOG && console.log('Log => ', text);
/* Function to inspect a variable */
const inspectVar = (t, v) => SHOW_DEBUG_LOG && console.log(`${t}:\n`, util.inspect(v, false, null, true));
const cleanRouteObject = ({ distance, duration }) => {
    const newObj = {
      distance, duration,
    };
    return newObj;
  };
const calculateCharges = (routeLength) => {
    /* Distance in miles */
    const dist = parseFloat((routeLength / 1610).toFixed(2));
    
    let deliveryCharges = 7.0;
    
  
    deliveryCharges = parseFloat(
      (dist + 1).toFixed(2),
    );
    if (dist < 2.5) {
      deliveryCharges = 1.0;
    } else if (dist > 2.49 && dist < 5) {
      deliveryCharges = 2.0;
    } else if (dist > 4.99 && dist < 7) {
      deliveryCharges = 3.0;
    }else if(dist<10.01){
        deliveryCharges = 5;
    }else{
        deliveryCharges = 10
    }
    
    return deliveryCharges;
  };
const data =  readDistances();
const {origin_addresses:originAddresses,
         destination_addresses:destinationAddresses,
         rows:distances,
         customers
      } = data;
const maxRouteLength = 8046 + (8046 * 0.3);
const calculations = {
  customersRemaining: destinationAddresses.length,
};
var sdis, stext, prev, prevc, nindex ;
var cindex = 0;
var totalDistance = 0 ;
var finalSol = [];


router.get('/viewPaths', function(req, res){
  var obj = {
    totalLength: Number,
    route:[]
  }
  while(calculations.customersRemaining > 0){
    prev = cindex;
    sdis = data.rows[cindex].elements[0].distance.value;
    for (var i=0 ; i<data.rows[cindex].elements.length-1 ; i++){
      if(data.rows[cindex].elements[i].distance.value>=data.rows[cindex].elements[i+1].distance.value && i+1 != cindex-1){
          sdis = data.rows[cindex].elements[i+1].distance.value;
          stext = data.rows[cindex].elements[i+1].distance.text;
          nindex = i+1+1;
      }else if (i+1 == cindex-1){
        if(sdis>data.rows[cindex].elements[i].distance.value){
          sdis = data.rows[cindex].elements[i].distance.value
          stext = data.rows[cindex].elements[i].distance.text
          nindex = i+1;
        }
      }else if (i== cindex-1){
        if(sdis>data.rows[cindex].elements[i+1].distance.value){
          sdis = data.rows[cindex].elements[i+1].distance.value
          stext = data.rows[cindex].elements[i+1].distance.text
          
          nindex = i+1+1;
        }
      }else{
          sdis = data.rows[cindex].elements[i].distance.value
          stext = data.rows[cindex].elements[i].distance.text 
          nindex = i+1;
      }
    }
   totalDistance = totalDistance + sdis;
    cindex=nindex;
    var innerObj = {
    customer: String,
    deliveryCharges: Number,
    path: String
   }
    calculations.customersRemaining--;
   if (totalDistance<= maxRouteLength){
      
      if (cindex==1){
        innerObj.customer="customerA";
      }
      if (cindex==2){
        innerObj.customer="customerB";
      }
      if (cindex==3){
        innerObj.customer="customerC";
      }
      if (cindex==4){
        innerObj.customer="customerD";
      }
      if (prev==0){
        prevc="store";
      }
      if (prev==1){
        prevc="customerA";
      }
      if (prev==2){
        prevc="customerB";
      }
      if (prev==3){
        prevc="customerC";
      }
      if (prev==4){
        prevc="customerD";
     }       
      innerObj.deliveryCharges=calculateCharges(sdis);
      innerObj.path=stext+" from "+prevc+" to "+innerObj.customer;
      obj.route.push(innerObj);
    }else{
      totalDistance = totalDistance - sdis;
      totalDistance = totalDistance * 0.000621;
      totalDistance = totalDistance.toFixed(1)
      obj.totalLength = totalDistance+" miles from Store"
      finalSol.push(obj);
      sdis = data.rows[0].elements[cindex-1].distance.value
      stext = data.rows[0].elements[cindex-1].distance.text
      if (cindex==1){
        innerObj.customer="customerA";
      }
      if (cindex==2){
        innerObj.customer="customerB";
      }
      if (cindex==3){
        innerObj.customer="customerC";
      }
      if (cindex==4){
        innerObj.customer="customerD";
      }
      var obj = {
        totalLength: Number,
        route:[]
      }
      innerObj.deliveryCharges=calculateCharges(sdis);
      innerObj.path=stext+" from  store to "+innerObj.customer;
      obj.totalLength = stext+" miles from Store"
      obj.route.push(innerObj);
      finalSol.push(obj);
      totalDistance=stext;
      calculations.customersRemaining--;
      totalDistance=0;
      continue; 
    }
  } 
  res.send(finalSol)
})

module.exports = router;
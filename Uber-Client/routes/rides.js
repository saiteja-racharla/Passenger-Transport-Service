var mq_client = require('../rpc/client');

module.exports = function (app)	{
	app.put('/createRide', createRide);
	app.get('/getCustomerRidesHistory/:count', searchBill);
	app.get('/getPendingReview', getPendingReview);
	app.post('/updateCustomerRide',updateCustomerRide);
	app.post('/deleteCustomerRide',deleteCustomerRide);
        app.get('/getriderequest',getriderequest);
        app.post('/createBill',createBill);
	app.post('/rideinprogress',rideinprogress);
	app.post('/reviewcustomer',reviewcustomer);
	app.get('/getDriverRidesHistory/:count',searchBill); 
	app.get('/driverincompletereview',driverincompletereview);
	app.post('/updatedriverreview',updatedriverreview);
	app.post('/searchBill',searchBill);
};
function getriderequest(req,res){
	console.log('Inside get ride requests module');
	var msg_payload={id:req.session.driverId,'reqType':'driverriderequest' };
	 mq_client.make_request('driver_service_req_q',msg_payload,function(results){
			if(results){
				if(results.code=="401"){
					res.send({"status":"fail" , 'msg': results.value});
				}
				else{
					res.send({"status":"success" , 'msg': results});
				}
			}
			else{
				res.send({"status":"fail" , 'msg': 'error'});
			}
		});	
		
		
	}
function createRide(req, res){
	console.log("Request Body "+JSON.stringify(req.body));
	req.body.rideData.customer_id = req.session.customerId;
	rideData = req.body.rideData;
	locations = req.body.locations;
	console.log(JSON.stringify(rideData));
	console.log(JSON.stringify(locations));
	  var message={"rideData" : rideData, "locations" : req.body.locations, reqType:"createRide"};
	  mq_client.make_request('rides_service_req_q',message,function(results){
	  
	         res.send(results);     
	});	  
}
function deleteCustomerRide(req,res){
	var rideId=req.param("rideId");
	console.log("ride id is"+rideId+"Sending the message to server");
	var message={"rideId" : rideId, reqType:"deleteCustomerRide"};
	mq_client.make_request('rides_service_req_q',message,function(results){
		console.log(results);
        res.send(results);     
	});	
}
function updatedriverreview(req,res){
console.log('inside updating driver review client side ');
var msg_payload={ride_id:req.body,'reqType':'updatedriverreview' };
mq_client.make_request('rides_service_req_q',msg_payload,function(results){
	
});
	
}
function driverincompletereview(req,res)
{
console.log('Inside trying to fetch incomplete reviews of driver at client side before making request ');
var msg_payload={id:req.session.driverId,'reqType':'incompletereview' };
mq_client.make_request('rides_service_req_q',msg_payload,function(results)
		{
	console.log('results obtained for incomplet review check is');
	console.log(results);
	         if(results.statusCode==200)
	        	 res.send({"status":"true"});
	         else
	        	 res.send(results);
	
		});
}
function reviewcustomer(req,res)
{
	console.log('Inside review Customer module in client side at node js');
	 
	var msg_payload={driver_id:req.session.driverId,message:req.body,'reqType':'reviewcustomer'};
	mq_client.make_request('rides_service_req_q',msg_payload,function(results)
			{
		         if(results.statusCode==200)
		        	 res.send({"status":"success"});
		         else
		        	 res.send({"status":"failure"});
		
			});
			
}
function createBill(req,res)
{
console.log('Inside bill genereation modules');	
var msg_payload={message:req.body,'reqType':'createBill'};
mq_client.make_request('rides_service_req_q',msg_payload,function(results){
	console.log('at client side getting bill amount');
	console.log(results);
	if(results){
		if(results.code=="401"){
			res.send({"status":"fail" , 'msg': results.value});
		}
		else{
			console.log('here I am with bill amount');
			
			res.send({"status":"success" , 'msg': results});
		}
	}
	else{
		res.send({"status":"fail" , 'msg': results.message});
	}
});	
}

function getPendingReview(req, res){
	
	customerId = req.session.customerId;
	
	message = {Id : customerId, reqType : "getPendingReview"};
	mq_client.make_request('rides_service_req_q',message,function(results){
		  
        res.send(results);     
});	
	
}

function updateCustomerRide(req,res){
	console.log("in Update customer ride client");
	var ssn=req.session.customerId;
	rideData = req.body.rideData;
	locations = req.body.locations;
	rideId = req.body.rideId;
	console.log(JSON.stringify(rideData));
	console.log(JSON.stringify(locations));
	var msg_payload = {"ssn":ssn, "rideData" : rideData, "locations" : req.body.locations, "rideId" : rideId, "reqType":"updateCustomerRide"};
	console.log("MESSAGE PAYLOAD IS "+JSON.stringify(msg_payload));
	mq_client.make_request('rides_service_req_q',msg_payload, function(results){

			res.send(results);
	});
}
function rideinprogress(req,res){
	console.log('In ride in progress module at node  client ');	
	var message={ride_id:req.body.ride_id,reqType:"inprogress"};
	mq_client.make_request('rides_service_req_q',message,function(results){
	console.log(results)
	if(results.statuscode=="200")
		{
		res.send({"status":"success"});
		}
	else
		res.send({"status":"failure"});;
	});
	}
function searchBill(req,res){
		var searchBill_msg;
	  if(req.session.customerId){ // for currently logged in customer's ride history
	    searchBill_msg={id : req.session.customerId, count : Number(req.params.count), reqType:"searchBill_customerId"};
	  }else if(req.session.driverId){ // for currently logged in driver's ride history
	    searchBill_msg={id:req.session.driverId, count : Number(req.params.count), reqType:"searchBill_driverId"}  ;
	  }else if(req.body.idType=="Customer ID"){    //below statements are for post request
	    searchBill_msg={id:req.body.id,count : 0,reqType:"searchBill_customerId"};
	  }else if(req.body.idType=="Driver ID"){
	    searchBill_msg={id:req.body.id,count : 0,reqType:"searchBill_driverId"};
	  }else if(req.body.idType=="Bill ID"){
	    searchBill_msg={id:req.body.id,count : 0,reqType:"searchBill_billid"};
	  } else{
	    res.send({statusCode:401,message:"ID is undefined"});
	  }
	  mq_client.make_request('rides_service_req_q',searchBill_msg,function(results){
	    res.send(results);
	    });
}

function updateCustomerRide(req,res){
	console.log("in Update customer ride client");
	var ssn=req.session.customerId;
	rideData = req.body.rideData;
	locations = req.body.locations;
	rideId = req.body.rideId;
	console.log(JSON.stringify(rideData));
	console.log(JSON.stringify(locations));
	var msg_payload = {"ssn":ssn, "rideData" : rideData, "locations" : req.body.locations, "rideId" : rideId, "reqType":"updateCustomerRide"};
	console.log("MESSAGE PAYLOAD IS "+JSON.stringify(msg_payload));
	mq_client.make_request('rides_service_req_q',msg_payload, function(results){

			res.send(results);
	});
}
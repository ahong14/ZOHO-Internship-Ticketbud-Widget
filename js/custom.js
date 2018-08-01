function initializeWidget()
{
	/*
	 * initialize widget
	 */
	ZOHO.embeddedApp.init()

}


function updateSync(){
	var eventShow = document.getElementById("events_update");
	var contactsShow = document.getElementById("contacts_update");
	
	eventShow.style.visibility = "visible";
	contactsShow.style.visibility = "visible";	



	var empty_map = {};
	ZOHO.CRM.CONNECTOR.invokeAPI("testconnector0.zohoticketbud.getallevents",empty_map)
		.then(function(data){
			
			var eventsResponse = data.response;
			var eventsList = JSON.parse(eventsResponse);

			//array of events from ticketbud account
			events = eventsList.events;

			//map to get records
			var records_map = new Object();
			records_map["Entity"] = "testconnector0__Ticketbud_Events";
		

			//get all events from current zoho crm user
			ZOHO.CRM.API.getAllRecords(records_map)
				.then(function(data2){
					var currentRecords = data2.data;
					var foundRecord = false;
					var newEvent = "";
					var newRecord; 	
					
					//for each event name in event list, check to see if name already exists as a ZOHO record
					//if name is not found, create new record
					for(let i = 0; i< events.length; i++){
						newEvent = events[i].title.trim();
						newRecord = events[i];
//						console.log(newRecord);
						for(var j=0; j<currentRecords.length; j++){
									
							if(newEvent == currentRecords[j].Name.trim()){
						
								foundRecord = true;
								break;
							}
								
						}
		
						//current record not found, create new record
						if(foundRecord == false){
							
							console.log("creating new record");							
							//TO DO create new record in zoho
							var locationInfo = newRecord.event_location;
							var isSoldOut = "";


							if(newRecord.sold_out == false){
								isSoldOut = "No";
				
							}


							else{

								isSoldOut = "Yes";
							
							}

							
							//create APIData map object
							var recordData = new Object();
							recordData["testconnector0__Event_ID"] = String(newRecord.id);
							recordData["testconnector0__CustomModule1_Name"] = newRecord.title;
							recordData["testconnector0__Event_Start_Time"] = String(newRecord.event_start);
							recordData["testconnector0__Event_End_Time"] = String(newRecord.event_end);
							recordData["testconnector0__Tickets_Available"] = newRecord.tickets_available;
							recordData["testconnector0__Tickets_Sold_Out"] = isSoldOut;
							recordData["testconnector0__Time_Zone"] = newRecord.time_zone;
							recordData["testconnector0__Address"] = locationInfo.address;
							recordData["testconnector0__City"] = locationInfo.city;
							recordData["testconnector0__State"] = locationInfo.state;
							recordData["testconnector0__Zip"] = locationInfo.zip;
							recordData["testconnector0__Country"] = locationInfo.country;


						//	console.log(recordData);

							
							//map to create record
							var createMap = [];
							createMap["Entity"] = "testconnector0__Ticketbud_Events";
							createMap["APIData"] = recordData;
							console.log(createMap);
						

							//call ZOHO API to insert record	
							ZOHO.CRM.API.insertRecord(createMap)
								.then(function(data3){
									console.log("checking to see if insert record worked");
									console.log(data3);
							})
					
						}

						else{
							foundRecord = false;
						}
					
					}//end of for loop
					
					
			})//end of get records for events	
	
	//update ticket attendees for each event
	
	console.log("getting ticket information");
	for(let i = 0; i<events.length; i++){
		var currentId = events[i].id;
		var newMap = {};
		newMap["event_id"] = currentId;

//		console.log(newMap);
		console.log("getting contacts");
		var contactRecords;  

		ZOHO.CRM.API.getAllRecords({Entity: "Contacts"})
			.then(function(data){
				contactRecords = data;
			})
		
		console.log(contactRecords);


		ZOHO.CRM.CONNECTOR.invokeAPI("testconnector0.zohoticketbud.getticketinformation", newMap)
			.then(function(ticketData){
				

		})
	}


				
	})//end of get all events from invoke connector	

alert("Events and Contacts Updated");

}


document.onreadystatechange = initializeWidget;

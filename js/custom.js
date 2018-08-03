function initializeWidget()
{
	/*
	 * initialize widget
	 */
	ZOHO.embeddedApp.init()

}


function updateSync(){
	

	//clear events and contacts from previous update
	var clearEvents = document.getElementById("new_events");
	var clearContacts = document.getElementById("new_contacts");


	clearEvents.innerHTML = "";
	clearContacts.innerHTML = "";

	//display fields
	var eventShow = document.getElementById("events_update");
	var contactsShow = document.getElementById("contacts_update");
	
	eventShow.style.visibility = "visible";
	contactsShow.style.visibility = "visible";	

	/*	
	var newEvents = document.createElement("p");
	newEvents.textContent = "New Events Added: ";
	var newContacts = document.createElement("p");
	newContacts.textContent = "New Contacts Added: ";

	eventShow.appendChild(newEvents);
	contactsShow.appendChild(newContacts);
	*/
	

	//invoke connector to get all events 
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
					
					//if current records is empty, don't check for existing records add new
					if(currentRecords == undefined){
						for(let i =0; i<events.length; i++){

							newRecord = events[i];
							
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

							var event_field = document.getElementById("new_events");
							var newEvent = document.createElement("p");
							newEvent.textContent = newRecord.title;
							event_field.appendChild(newEvent);

						}//end of for loop going through events

					}//end of if statement

					//check for existing records
					else{

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


								var event_field = document.getElementById("new_events");
								var newEvent = document.createElement("p");
								newEvent.textContent = newRecord.title;
								event_field.appendChild(newEvent);
							}

							else{
								foundRecord = false;
							}

					}//end of for loop

				}					
					
			})//end of get records for events	
	
			//update ticket attendees for each event
			console.log("getting ticket information");
			for(let i = 0; i<events.length; i++){
				
				console.log("getting contacts");
				var contactRecords;  

				ZOHO.CRM.API.getAllRecords({Entity: "Contacts"})
					.then(function(contactData){
						contactRecords = contactData.data;
		//				console.log(contactRecords);
						console.log(contactRecords);
						var currentId = events[i].id;
						var newMap = {};
						newMap["event_id"] = currentId;


						//get tickets information for current event
						ZOHO.CRM.CONNECTOR.invokeAPI("testconnector0.zohoticketbud.getticketinformation", newMap)
							.then(function(ticketData){
		//						console.log("getting tickets info");
		//						console.log(newMap);
								var ticketResponse = ticketData.response;
								var ticketsJSON = JSON.parse(ticketResponse);
								var ticketList = ticketsJSON.tickets;
								console.log(ticketList);
				
								var foundContact = false;
				
								
								//create and add new records 

								if(contactRecords == undefined){

									for(let m = 0; m< ticketList.length; m++){
										var newContactRecord = ticketList[m];
										var checkedIn = "";
										var purchaser = newContactRecord.purchaser;	
										var quantity = purchaser.total_quantity;

										if (newContactRecord.checked_in == false) {
											checkedIn = "No";

										}		

										else{
											checkedIn = "Yes";
										}


										var contactMap = {};

										contactMap["First_Name"] = newContactRecord.first_name;
										contactMap["Last_Name"] = newContactRecord.last_name;
										contactMap["Full_Name"] = newContactRecord.name_on_ticket;
										contactMap["Email"] = newContactRecord.email;
										contactMap["testconnector0__Event_Title"] = events[i].title; 
										contactMap["testconnector0__Name_On_Ticket"] = newContactRecord.name_on_ticket;
										contactMap["testconnector0__Tickets_Purchased"] = String(quantity);
										contactMap["testconnector0__Checked_In"] =  checkedIn;



										ZOHO.CRM.API.insertRecord({Entity: "Contacts", APIData: contactMap})
											.then(function(dataResponse){
			
												console.log(dataResponse);
												
											})

										var contactField = document.getElementById("new_contacts");
										var newContact = document.createElement("p");
										newContact.textContent = newContactRecord.name_on_ticket;
										contactField.appendChild(newContact);


									}//end of for loop

								}//end of if statement

								//check exisiting records, add new ones

								else{

								
								for(let j = 0; j <ticketList.length; j++){
									var newContact = ticketList[j].name_on_ticket;
									var newContactRecord = ticketList[j];
									for(let k = 0; k < contactRecords.length; k++){

										if(newContact == contactRecords[k].Full_Name){

											foundContact = true;
											break;

										}
										
									}

									if(foundContact == false){
										//CREATE NEW CONTACT

										console.log("new contact found");
										console.log(newContact);
										//to do, create new contact record		

										var checkedIn = "";
										var purchaser = newContactRecord.purchaser;	
										var quantity = purchaser.total_quantity;

										if (newContactRecord.checked_in == false) {
											checkedIn = "No";

										}		


										else{
											checkedIn = "Yes";
										}


										var contactMap = {};

										contactMap["First_Name"] = newContactRecord.first_name;
										contactMap["Last_Name"] = newContactRecord.last_name;
										contactMap["Full_Name"] = newContactRecord.name_on_ticket;
										contactMap["Email"] = newContactRecord.email;
										contactMap["testconnector0__Event_Title"] = events[i].title; 
										contactMap["testconnector0__Name_On_Ticket"] = newContactRecord.name_on_ticket;
										contactMap["testconnector0__Tickets_Purchased"] = String(quantity);
										contactMap["testconnector0__Checked_In"] =  checkedIn;



										ZOHO.CRM.API.insertRecord({Entity: "Contacts", APIData: contactMap})
											.then(function(dataResponse){
			
												console.log(dataResponse);
												
											})

										var contactField = document.getElementById("new_contacts");
										var newContact = document.createElement("p");
										newContact.textContent = newContactRecord.name_on_ticket;
										contactField.appendChild(newContact);
			
									}
									foundContact = false;
								}//end of for loop to check current contacts 
			
								}			
							})

					})
				
				}//end for for loop for event info

	})//end of get all events from invoke connector	

	//end of update
	alert("Events and Contacts Updated");

}


document.onreadystatechange = initializeWidget;

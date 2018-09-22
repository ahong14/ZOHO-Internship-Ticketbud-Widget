function initializeWidget()
{
	/*
	 * initialize widget
	 */
	ZOHO.embeddedApp.init()

}


function updateSync(){
	
	var overlay = document.getElementById("overlay");
	overlay.style.visibility = "visible";

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
	ZOHO.CRM.CONNECTOR.invokeAPI("ticketbud.zohoticketbud.getallevents",empty_map)
		.then(function(data){
			
			var eventsResponse = data.response;
			var eventsList = JSON.parse(eventsResponse);

			console.log("Events List: ");
			console.log(eventsList);

			//array of events from ticketbud account
			events = eventsList.events;

			//map to get records
			var records_map = new Object();
			// records_map["Entity"] = "ticketbud__Ticketbud_Events";
			records_map["Entity"] = "Campaigns";

		
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
							recordData["ticketbud__Event_ID"] = String(newRecord.id);
							// recordData["CustomModule1_Name"] = newRecord.title;
							recordData["Campaign_Name"] = newRecord.title;
							recordData["ticketbud__Event_Start_Time"] = String(newRecord.event_start);
							recordData["ticketbud__Event_End_Time"] = String(newRecord.event_end);
							recordData["ticketbud__Tickets_Available"] = newRecord.tickets_available;
							recordData["ticketbud__Tickets_Sold_Out"] = isSoldOut;
							recordData["ticketbud__Time_Zone"] = newRecord.time_zone;
							recordData["ticketbud__Address"] = locationInfo.address;
							recordData["ticketbud__City"] = locationInfo.city;
							recordData["ticketbud__State"] = locationInfo.state;
							recordData["ticketbud__Zip"] = locationInfo.zip;
							recordData["ticketbud__Country"] = locationInfo.country;
							
							
							//map to create record
							var createMap = [];
							// createMap["Entity"] = "ticketbud__Ticketbud_Events";
							createMap["Entity"] = "Campaigns";
							createMap["APIData"] = recordData;
							console.log(createMap);
						
							//call ZOHO API to insert record	
							ZOHO.CRM.API.insertRecord(createMap)
								.then(function(data3){
									console.log("inserting new event");
									console.log("checking to see if insert record worked");
									console.log(data3);
								
							})

							//display new event added
							var event_field = document.getElementById("new_events");
							var newEvent = document.createElement("div");
							newEvent.textContent = newRecord.title;
							newEvent.classList.add("new_update");
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
								recordData["ticketbud__Event_ID"] = String(newRecord.id);
								recordData["Campaign_Name"] = newRecord.title;
								recordData["ticketbud__Event_Start_Time"] = String(newRecord.event_start);
								recordData["ticketbud__Event_End_Time"] = String(newRecord.event_end);
								recordData["ticketbud__Tickets_Available"] = newRecord.tickets_available;
								recordData["ticketbud__Tickets_Sold_Out"] = isSoldOut;
								recordData["ticketbud__Time_Zone"] = newRecord.time_zone;
								recordData["ticketbud__Address"] = locationInfo.address;
								recordData["ticketbud__City"] = locationInfo.city;
								recordData["ticketbud__State"] = locationInfo.state;
								recordData["ticketbud__Zip"] = locationInfo.zip;
								recordData["ticketbud__Country"] = locationInfo.country;
	
								//map to create record
								var createMap = [];
								createMap["Entity"] = "Campaigns";
								createMap["APIData"] = recordData;
								console.log(createMap);
						
								//call ZOHO API to insert record	
								ZOHO.CRM.API.insertRecord(createMap)
									.then(function(data3){
										console.log("checking to see if insert record worked");
										console.log(data3);
								})

								//display new update
								var event_field = document.getElementById("new_events");
								var newEvent = document.createElement("div");
								newEvent.textContent = newRecord.title;
								newEvent.classList.add("new_update");
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


				//get all contacts
				ZOHO.CRM.API.getAllRecords({Entity: "Contacts"})
					.then(function(contactData){
						contactRecords = contactData.data;
		//				console.log(contactRecords);
						console.log(contactRecords);
						var currentId = events[i].id;
						var newMap = {};
						newMap["event_id"] = currentId;

						//get tickets information for current event
						ZOHO.CRM.CONNECTOR.invokeAPI("ticketbud.zohoticketbud.getticketinformation", newMap)
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
										contactMap["ticketbud__Event_Title"] = events[i].title; 
										contactMap["ticketbud__Name_On_Ticket"] = newContactRecord.name_on_ticket;
										contactMap["ticketbud__Tickets_Purchased"] = String(quantity);
										contactMap["ticketbud__Checked_In"] =  checkedIn;
										contactMap["ticketbud__Event_ID"] = String(newContactRecord.event_id);
										contactMap["ticketbud__Ticket_ID"] = String(newContactRecord.id);
										
		
										ZOHO.CRM.API.insertRecord({Entity: "Contacts", APIData: contactMap})
											.then(function(dataResponse){
												console.log("inserting contacts");
												console.log(dataResponse);
												
											})

										var contactField = document.getElementById("new_contacts");
										var newContact = document.createElement("div");
										newContact.textContent = newContactRecord.name_on_ticket;
										newContact.classList.add("new_update");
										contactField.appendChild(newContact);


									}//end of for loop

								}//end of if statement

								//check exisiting records, add new ones

								else{

								
								for(let j = 0; j <ticketList.length; j++){
									var newContact = ticketList[j].name_on_ticket;
									var newContactEventId =  ticketList[j].event_id;
									var newContactRecord = ticketList[j];
									for(let k = 0; k < contactRecords.length; k++){
										console.log(newContactEventId);
										console.log(contactRecords[k].ticketbud__Event_ID);
										if(newContact == contactRecords[k].Full_Name && newContactEventId == contactRecords[k].ticketbud__Event_ID){
											console.log("same name and event id");
											foundContact = true;
											//if record is found, check to see if it is checked in or not

											if(newContactRecord.checked_in == true && contactRecords[k].ticketbud__Checked_In == "No"){
												var recordMap = {};
												recordMap["id"] = contactRecords[k].id;
												recordMap["ticketbud__Checked_In"] = "Yes";
												ZOHO.CRM.API.updateRecord({Entity:"Contacts", APIData: recordMap})
													.then(function(dataUpdate){
														console.log("checking update data");
														console.log(dataUpdate);
    													var contactField = document.getElementById("new_contacts");
														var newContact = document.createElement("div");
														newContact.textContent = contactRecords[k].Full_Name + " has checked in";
														newContact.classList.add("new_update");
														contactField.appendChild(newContact);
			
													})

											}
											else if(newContactRecord.checked_in == false && contactRecords[k].ticketbud__Checked_In == "Yes"){
												var recordMap = {};
												recordMap["id"] = contactRecords[k].id;
												recordMap["ticketbud__Checked_In"] = "No";
												ZOHO.CRM.API.updateRecord({Entity:"Contacts", APIData: recordMap})
													.then(function(dataUpdate){
														// console.log("checking update data");
														// console.log(dataUpdate);
    													// var contactField = document.getElementById("new_contacts");
														// var newContact = document.createElement("div");
														// newContact.textContent = contactRecords[k].Full_Name + " has checked in";
														// newContact.classList.add("new_update");
														// contactField.appendChild(newContact);
		
													})

											}
			
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
										contactMap["ticketbud__Event_Title"] = events[i].title; 
										contactMap["ticketbud__Name_On_Ticket"] = newContactRecord.name_on_ticket;
										contactMap["ticketbud__Tickets_Purchased"] = String(quantity);
										contactMap["ticketbud__Checked_In"] =  checkedIn;
										contactMap["ticketbud__Ticket_ID"] = String(newContactRecord.id);
										contactMap["ticketbud__Event_ID"] = String(newContactRecord.event_id);

										ZOHO.CRM.API.insertRecord({Entity: "Contacts", APIData: contactMap})
											.then(function(dataResponse){
												consle.log("inserting contact");
												console.log(dataResponse);
												
											})
										
										
										var contactField = document.getElementById("new_contacts");
										var newContact = document.createElement("div");
										newContact.textContent = newContactRecord.name_on_ticket;
										newContact.classList.add("new_update");
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

}


function toggleOverlay(){

	var overlay = document.getElementById("overlay");
	var sync_value = document.getElementById('sync_value');
	
	if(overlay.style.visibility == "hidden"){
		overlay.style.visibility = "visible";
	}

	else{
		overlay.style.visibility = "hidden";
	}

	sync_value.textContent = "Synced";

}


document.onreadystatechange = initializeWidget;

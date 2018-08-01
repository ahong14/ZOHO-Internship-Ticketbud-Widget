function initializeWidget()
{
	/*
	 * initialize widget
	 */
	ZOHO.embeddedApp.init()

}


function updateSync(){

	var empty_map = [];
	ZOHO.CRM.CONNECTOR.invokeAPI("testconnector0.zohoticketbud.getallevents",empty_map)
		.then(function(data){
			
//			console.log(data);
//			var jsonResponse = JSON.parse(data);
			var eventsResponse = data.response;
//			console.log(eventsResponse);			


			var eventsList = JSON.parse(eventsResponse);			
			console.log(eventsList);


			
		/*
			for(let i = 0; i<eventsList.length; i++){
				console.log(eventsList[i].title);

			}
		*/

	})	


}


document.onreadystatechange = initializeWidget;

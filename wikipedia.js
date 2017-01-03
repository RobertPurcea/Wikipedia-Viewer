/*jshint esversion: 6 */
window.onload = function(){
	var begin = true;

	//User text field input =>> Valid URL =>> Retrieve wiki JSON info =>> call useData() with it
	function getData(input){

		if(input !== ""){

			//Prepare URL
			var url = "http://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search=" + input + "&namespace=0&limit=10";

			//Get Data
			var req = new XMLHttpRequest();
			req.onreadystatechange = function(){
				
				if(req.readyState == 4 && req.status == 200){

					var input = req.responseText;
					var parsedInput = JSON.parse(input);
					useData(parsedInput);
				}

			};

			req.open("GET",url,true);
			req.send();
		}
		else{
			cleanSuggestions();
		}

	}
	
	//Displays suggestions, adds click event for each one of them  <<>> calls onClick(currentParagraph)
	function useData(data){

		//Clear all previous suggestions
		var allSuggestions = document.getElementById("suggestions");
		cleanSuggestions();

		//Display all the current suggestions
		var info = [data[1],data[2]]; // ==> An Array with data[1] = title and data[2] = wikipedia info for that title
		
		//If the current wiki title has a valid description, display it
		for(let i = 0, len = info[0].length; i < len; i++){

			//description check
			var reg = new RegExp("may refer to:");

			if(info[1][i] !== "" && !reg.test(info[1][i])){

				//Create new paragraph for the title
				var newP = document.createElement('p');
				var text = document.createTextNode(info[0][i]);
				newP.appendChild(text);
				newP.className = "par";

				//Click event <<>> Pass to onclick(current suggestion, current description for that specific suggestion)
				(function(currentInfo){
					currentInfo[0].addEventListener("click",function(){
						onClick(currentInfo);
					});
				}([newP, info[1][i]]));
				

				//Add it to "suggestions" div
				allSuggestions.appendChild(newP);
			}
			
		}
	}

	//On suggestion click modify text field value, clear suggestions and call getImage(suggestion,suggestion description)
	function onClick(current){
		document.getElementsByTagName("input")[0].value = current[0].innerHTML;
		cleanSuggestions();
		getImage(current);
	}

	//Displays the wiki information and adds image
	function display(currentInfo){

		/*
			CurrentInfo[0] = [HTML Paragraph Element for the current suggestion, It's description from Wikipedia]
			CurrentInfo[1] = Url for the image requested from the wikipedia
		*/
		
		$("#info").fadeOut(200);
		setTimeout(function(){
			clearDescription();
			setTimeout(function(){
				//Fetch HTML elements 
				var div = document.getElementById("info");
				var text = document.getElementById("text");
				
				//Create title tag
				var link = document.createElement("a");
				link.appendChild(document.createTextNode(currentInfo[0][0].innerHTML));
				link.href = "https://en.wikipedia.org/wiki/" + currentInfo[0][0].innerHTML;
				link.target = "_ablank";

				//Create p tag for the description
				var desc = document.createElement("p");
				desc.appendChild(document.createTextNode(currentInfo[0][1]));

				//Create img tag
				var image = document.createElement("img");
				if(currentInfo[1] !== "none"){
					image.src = currentInfo[1];
				}
				else{
					image.src = "http://vignette4.wikia.nocookie.net/okami/images/7/75/No_image_available.png/revision/latest?cb=20130831191945";
				}

				//Add all a and p tags to #text
				text.appendChild(desc);
				text.appendChild(link);

				//Add img tag directly to #info
				info.appendChild(image);
				setTimeout(function(){
					$("#info").fadeIn();
				},200);
			},200);
		},200);
	}

	//Gets image URL and calls display(info,imgUrl)		
	//If no image is available, calls display(info,"none")
	function getImage(info){

		var imageName = info[0].innerHTML;

		var req = new XMLHttpRequest();

		req.onreadystatechange = function(){

			if(req.status == 200 & req.readyState == 4){
				var parsed = JSON.parse(req.responseText);
				var obj = parsed.query.pages;
				var imgUrl = "";
				if(obj[Object.keys(obj)[0]].thumbnail === undefined){
					imgUrl = "none";
				}
				else{
					imgUrl = obj[Object.keys(obj)[0]].thumbnail.source;
				}
				display([info,imgUrl]);
			}
		};

		req.open("GET", "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&titles=" + imageName + "&piprop=thumbnail%7Cname&pithumbsize=200",true);
		req.send();
	}

	//Clear all suggestions
	function cleanSuggestions(){
		var allSuggestions = document.getElementById("suggestions");
		while(allSuggestions.hasChildNodes()){
			allSuggestions.removeChild(allSuggestions.lastChild);
		}
	}
				
	//Clear the wiki entry description
	function clearDescription(){
		var desc = document.getElementById("info");
		var text = document.getElementById("text");
		
		while(text.hasChildNodes()){
			text.removeChild(text.lastChild);
		}

		desc.removeChild(desc.lastChild);
		
	}

	//Fetch data on keyup
	document.getElementsByTagName('input')[0].onkeyup = function(){
		getData(this.value);
	};

};



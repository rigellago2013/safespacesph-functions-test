const functions = require('firebase-functions');
const admin = require('firebase-admin');
const geolib = require('geolib');
const arraySort = require('array-sort');
const slice = require('array-slice');

admin.initializeApp(functions.config().firebase);


exports.calculateNearest = functions.https.onRequest( ( req, res ) => {

	// Get Request Values 
	const lat = req.query.lat // latitude
	const lng = req.query.lng // longitude

	if( !lat || !lng  ) {
		console.log(lat,lng);
		return res.json({user:{latitude:lat,longitude:lng},safespaces:[]});
	}

	const locations = admin.database();

	locations.ref("safeSpaces").once("value", function(snapshot) {

	  	const loc = snapshot.val()
	  	let ftenKM = []
	  	let result = []
	  	let arrayloc = []

	  	Object.keys(loc).map( data => {
	  		const coords =  loc[data].address.mapAddress
	  		const fslat =  coords.latitude
	  		const fslng = coords.longitude

	  		// Distance form user location to safespace location in meters
			const distance =  geolib.getDistance({latitude:lat, longitude:lng},{latitude:fslat, longitude:fslng})

			// response
			const response = {
				id:loc[data].id,
				address:loc[data].address,
				rating:loc[data].overAllRating,
				distance: distance
			}

			if( distance <= 15000 ){
				ftenKM.push(response)
			}
		})
		// sort by distance limit 5
		return res.json({user:{latitude:lat,longitude:lng},safespaces:slice(result= arraySort(ftenKM,'distance'),0,5)});
	  	})	  	
})

exports.ratingListener = functions.database.ref('/ratings/{locId}/{ratingId}').onWrite((event) => {

	  const rating = event.data.val();
	  const ratingId = event.params.ratingId;
	  const locId = event.params.locId;
	  const db = admin.database();
	  const tallyref =  db.ref(`ratingTally/${locId}`)
		
	  tallyref.once("value", function(snapshot) {

		let tally = snapshot.val();
		let tally2 = Object.keys(tally);


		switch (rating.rate) {
			case 1:
				tally[1]++
				break;
			case 2:
				tally[2]++
				break;
			case 3:
				tally[3]++
				break;
			case 4:
				tally[4]++
				break;
			case 5:
				tally[5]++
				break;
			default:
				console.log("Err: Tally not found.")
				break;
		}

		let restally = {
			1:tally[1],
			2:tally[2],
			3:tally[3],
			4:tally[4],
			5:tally[5],
		}
		return tallyref.set(restally)

	})



});
		// firebase deploy --only functions:calculateNearest
		//git add --all
		//git commit -m "commit message"
		//git push	


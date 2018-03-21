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

	const locations = admin.database();
	const ref = locations.ref("safeSpaces");

	ref.once("value", function(snapshot) {

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

			// Create response
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
		// firebase deploy --only functions:calculateNearest
		//git add --all
		//git commit -m "commit message"
		//git push	


var pg = require('./');

console.log(pg);

pg.connect("postgres://postgres:hidden@localhost:5433/sampledb");

// wait 2 seconds to confirm the connection and initilize the object.
setTimeout(function () {
	if (pg.isReady()){
  	pg.create('person', {name: 'Kalidia Millette', position: 'Cow Mechanic', rank: '...'}, function (err, result){
      console.log(err, result); 
      // var recent = result.insertedIds[0];
      pg.retrieve('person', {name: 'Kalidia Millette'}, function (err, result) {
        console.log(err, result);
        pg.update('person', {rank: 'Novice'} ,function (err, result){
          console.log(err, result);
          pg.retrieve('person', {name: 'Kalidia Millette'}, function (err, result) {
            console.log(err, result);
            pg.delete('person', {name: 'Bob'}, function (err, result) {
              console.log(err, result);
              pg.retrieve('person', {name: 'Kalidia Millette'}, function (err, result) {
                console.log(err, result);
              });
            })
          });
        })
      });
  	});
	}
	else {
		console.log('Database not ready');
	}
}, 2000);

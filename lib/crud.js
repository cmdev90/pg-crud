var pg = require('pg')
  , builder = require('mongo-sql');

var PG = PG || {};
var connectionString = null;

var _create = PG.create = function (table, object, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
  callback = typeof args[args.length - 1] == 'function' ? args.pop() : null;
  object = typeof object === 'function' ? null : object;
  table = typeof table === 'string' ? table : null;
  
  var query = builder.sql({
      type: 'insert',
      table: table,
      values: object
    });
	
	// Appending return to query to ensure the last insert is returned.
	execute(query.toString() + ' RETURNING *', query.values, function (err, result){
		return call(callback, err, result ? result.rows : []);		
	});
};

var _retrieve = PG.retrieve = function (table, criteria, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
  callback = typeof args[args.length - 1] == 'function' ? args.pop() : null;
  where = typeof criteria === 'function' ? null : criteria;
  table = typeof table === 'string' ? table : null;

  var query = builder.sql({
      type: 'select',
      table: table,
      where: where
    });

  return execute(query.toString(), query.values, function (err, result){
    call(callback, err, (result && result.rows) ? result.rows : []);
  });
};

var _update = PG.update = function (table, values, criteria, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
  callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  where = typeof criteria === 'function' ? {} : criteria;
  values = typeof values === 'function' ? {} : values;
  table = typeof table === 'string' ? table : null;

  var query = builder.sql({
      type: 'update',
      table: table,
      updates: values,
      where: where
    });

  return execute(query.toString(), query.values, callback);
};

var _delete = PG.delete = function (table,  criteria, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
  callback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
  where = typeof criteria === 'function' ? {} : criteria;
  table = typeof table === 'string' ? table : null;

  var query = builder.sql({
      type: 'delete',
      table: table,
      where: where
    });

  return execute(query.toString(), query.values, callback);
};

var execute = function (query, values, callback) {
  var args = Array.prototype.slice.call(arguments, 1);
	calback = typeof args[args.length - 1] === 'function' ? args.pop() : null;
	query = typeof query === 'string' ? query : null;
	values = Array.isArray(values) ? values : [];

	if (!query)
		return call(callback, new Error('No query passed to execute.'));

  var client = new pg.Client(connectionString);
  client.connect(function(err) {
    // report errors to callback function.
    if (err)
      return call(callback, err);

		console.log(query, values);

    client.query(query, values, function(err, result) {
      client.end();
      return call(callback, err, result);
    })
  });
}

var connect = PG.connect = function (url, callback) {
  // Test the connection
  var client = new pg.Client(url);
  client.connect(function(err) {
    // report errors to callback function.
    if (err) {
      return call(callback, err);
    }

    // else initilize the pg-crud object.
    connectionString = url;
    client.end(); // close the connection once done.
    return call(callback);
  });
};

var call = function (callback, err, param1, param2, param3) {
  if (typeof callback === 'function')
    return callback(err, param1, param2, param3);
  
  if (err)
    throw err;
};

PG.isReady = function (){
	return connectionString === null ? false : true;
}

module.exports = PG;

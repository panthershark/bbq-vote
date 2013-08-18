var cradle = require('cradle');

var VotesPlugin = function() {}

VotesPlugin.prototype.attach = function(options) {
  var app = options.app,
      connection = new(cradle.Connection)('https://' + options.host, 443, {
        cache: false,
        raw: false,
        auth: options.auth
      }),
      db = connection.database(options.database);

  this.votes = {
      
    // assign the couch providers to the api object.
    db: db,
    connection: connection,

    // get by id.
    get: function(id, callback) {
      db.get(id, function(err, doc) {
        if (err) {
          logger.error("Database error: " + err);
          callback(err, null);
          return;
        }
        
        callback(null, doc);
      });
    },

    all: function(callback) {

      db.view('bbq-votes/_all_docs', callback);

      //  function (err, res) {
      //   res.forEach(function (row) {
      //     console.log("%s is on the %s side of the force.", row.name, row.force);
      //   });
      // });

    },

    /** Use this to update seats sold. **/
    update: function(id, fields, callback) {
      db.get(id, function(err, doc) {
        _.extend(fields || {}, { _rev: doc._rev });
        db.merge(id, fields, callback);
      });
    }
  };
};

module.exports = VotesPlugin;
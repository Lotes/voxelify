const fs = require('fs')

module.exports = function(THREE) {
  THREE.XHRLoader = function ( manager ) {
  	this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;
  };
  Object.assign( THREE.XHRLoader.prototype, {
  	load: function ( url, onLoad, onProgress, onError ) {
      if ( this.path !== undefined ) url = this.path + url;
  		var scope = this;
      fs.readFile(url, 'utf8', function(err, data) {
        if(err) return onError(err)
        onLoad(data)
      })
  	},
  	setPath: function ( value ) {
  		this.path = value;
  		return this;
  	},
  	setResponseType: function ( value ) {
  		this.responseType = value;
  		return this;
  	},
  	setWithCredentials: function ( value ) {
  		this.withCredentials = value;
  		return this;
  	}
  } );
};

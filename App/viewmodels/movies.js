define(['plugins/http', 'durandal/app', 'knockout'], function (http, app, ko) {
	function sumArray(arr1, arr2) {
		var aux = [];
		for (i = 0; i < arr1.length; i++) {aux.push(arr1[i])}
		for (i = 0; i < arr2.length; i++) {aux.push(arr2[i])}
		return aux;
	}
	
	
	var ViewModel = function () {
		
		var self = this;
		var searchMoviesUri = 'http://192.168.160.39/api/Movies/Search/';
		var moviesUri = 'http://192.168.160.39/api/Movies';
		var moviesCountUri = 'http://192.168.160.39/api/Movies/Count';
		var genresUri = 'http://192.168.160.39/api/Genres';
		var genresCountUri = 'http://192.168.160.39/api/Genres/Count';
		var genreList = [];		
		
		self.searchText = ko.observable("");
		self.movies = ko.observableArray();
		self.genres = ko.observableArray();
		self.genresCount = ko.observable(null);
		self.moviesCount = ko.observable(null);
		self.aux = ko.observableArray();
		self.error = ko.observable();
		
		function ajaxHelper(uri, method, data) {
			self.error(''); // Clear error message
			return $.ajax({
				type: method,
				url: uri,
				dataType: 'json',
				contentType: 'application/json',
				data: data ? JSON.stringify(data) : null,
				error: function (jqXHR, textStatus, errorThrown) {
					console.log("AJAX Call[" + uri + "] Fail...");
					self.error(errorThrown);
				}
			});
		}
		
		resetStatus = function() {}
		
		self.searchTextGood = ko.computed(function () {
			return (self.searchText().length < 3)
		}, self);

		autocomplete = function() {
			console.log("CALL: searchAuto");
			if (self.searchText().length >= 3) {
				ajaxHelper(searchMoviesUri + self.searchText(), 'GET').done(function (data) {
					self.movies(data);
				});
			} else getAllMovies();
		};

		getAllMovies = function () {
			console.log('CALL: getAllDirectors...')
			ajaxHelper(moviesCountUri, 'GET').done(function (data) {
				self.moviesCount(data);
			});
			ajaxHelper(moviesUri, 'GET').done(function (data) {
				self.movies(data);
			});
			ajaxHelper(genresCountUri, 'GET').done(function (data) {
				self.genresCount("Genres[" + data.toString() + "]:");
			});
			ajaxHelper(genresUri, 'GET').done(function (data) {
				self.genres(data);
			});
		};

		clearMovies = function () {
			getAllMovies();
			self.searchText("");
		};

		searchMovies = function () {
			console.log('CALL: searchDirectors...')
			ajaxHelper(searchMoviesUri + self.searchText(), 'GET').done(function (data) {
				self.movies(data);
			});
		}

		var lastLength = 0;
		setInterval(function() {
			var obj = $("input[type='checkbox']:checked");
			if (obj.length != lastLength) {
				if (obj.length == 0) getAllMovies()
				else {
					for (i = 0; i < obj.length; i++) {
						if (i == 0) self.movies([]);
						ajaxHelper(genresUri + '/' + (obj[i]).value.toString()).done(function(data) {
							var mv = data[0]["movies"];
							self.movies(sumArray(self.movies(), mv));
						});
					}
				}
				lastLength = obj.length;
			}
		}, 100);
		
		getAllMovies();
	};

	return ViewModel;
});

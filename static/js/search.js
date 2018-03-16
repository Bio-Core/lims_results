var app = angular.module("searchApp", []);
var app2 = angular.module("navApp", []);
var app3 = angular.module("footerApp", []);
var selected_fields = [], selected_tables = [], selected_conditions = [];
var tables = [];
var tFields = [], fields = [], tableScope = [], type = [];
var fieldsToScope = [], sqlToScope = [], tableToScope = [];
var table, id;
var operators = [
	"Equal to",
	"Not equal to",
	"Greater than",
	"Less than",
	"Greater or equal to",
	"Less or equal to",
	"Begins with",
	"Not begins with",
	"Ends with",
	"Not ends with",
	"Contains",
	"Not contains"];
var ids = {"patients" : "patients.mrn",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.sample_id",
	"results" : "results.uid",
	"resultdetails" : "resultdetails.uid"};
var operator = operators[0];
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";
var pageSizes = [25, 50, 100, 500];
var tableOrder = ["Patients","Samples","Experiments","Results","Result Details"];

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

app2.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

app3.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

app.directive('loading', ['$http', function($http) {
	return {
		restrict: 'A',
		link: function(scope, elm, attrs) {
			scope.isLoading = function() {
				return $http.pendingRequests.length > 0;
			};
			scope.$watch(scope.isLoading, function(v) {
				if (v) {
					elm.show();
				} else {
					elm.hide();
				}
			});
		}
	}
}]);

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
function capwords(str) {
	if (str == "resultdetails") str = "result details";
	return str.toLowerCase().split(' ').map(x=>x[0].toUpperCase()+x.slice(1)).join(' ');
}
function sqlToDisplay(input) {
	var str = input;
	str = str.split('_').join(' ');
	str = capwords(str);
	str = str.replace("P Nomenclature", "P.nomenclature");
	str = str.replace("C Nomenclature", "C.nomenclature");
	str = str.replace("Mrn", "MRN");
	str = str.replace("Dob", "DOB");
	str = str.replace("Id", "ID");
	str = str.replace("IDe", "Ide");
	str = str.replace("Dna ", "DNA ");
	str = str.replace("Pcr", "PCR");
	str = str.replace("Mlpa", "MLPA");
	str = str.replace("Se ", "SE ");
	str = str.replace("Rna ", "RNA ");
	str = str.replace("On", "ON");
	str = str.replace("Hcn", "HCN");
	str = str.replace("Vaf", "VAF");
	str = str.replace("Panel Assay", "Panel/Assay");
	str = str.replace("Wbc", "WBC");
	str = str.replace("Pb Bm", "PB/BM");
	str = str.replace("Cf", "cf");
	str = str.replace("Uhn", "UHN");

	return str;
}

function getNumberAsArray(num) {
	return new Array(num);
}

app.controller("searchCtrl", function($scope, $http, $location) {
	var url = $location.absUrl();
	var str = url.split('/');
	id = str[str.length-1];
	$scope.id = angular.copy(id);
	$scope.ids = angular.copy(ids);

	$scope.currentPage = 0; 
	$scope.pageSize = 50;
	$scope.pages = pageSizes;

	$scope.pTables = [];
	$scope.cols = [];

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}

	$http.get(colUrl)
	.then(function(data) {
		var input = data.data;
		for (let i = 0; i < input.length; i++) {
			var str = input[i][0].split(".");
			tFields.push(str[0]);
			tableScope.push(capwords(str[0]));
			fields.push(sqlToDisplay(str[1]));
			type.push(input[i][1]);
			tables.push(input[i][0]);
		}

		$scope.tables = tableOrder;
		$scope.fields = angular.copy(fields);
		$scope.tFields = angular.copy(tFields);
		$scope.sqlAll = angular.copy(tables);

		function getTableFields(table) {
			for (let i = 0; i < tables.length; i++) {
				if (tFields[i] == table) {
					selected_fields.push(tables[i]);
					fieldsToScope.push(fields[i]);
					sqlToScope.push(tables[i]);
					tableToScope.push(tFields[i]);
				}
			}
		}
		function resetTables() {
			selected_fields = [];
			fieldsToScope = [];
			sqlToScope = [];
			tableToScope = [];
		}

		getTableFields("patients");
		// patient fields/tables added to scope
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);

		// patient conditions
		var c = [];
		for (let i = 0; i < tables.length; i++) {
			if (tFields[i] == "patients") {
				c.push(["OR", tables[i], operator, id]);
			}
		}
		c[0][0] = "AND";

		$scope.rows = [];

		// POST patient info
		$http({
			method : "POST",
			url : queryUrl, 
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["patients"]),selected_conditions:c}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var queryResults = data.data;
			$scope.rows = $scope.rows.concat(queryResults);
			
			resetTables();
			getTableFields("samples");
			// sample fields/tables added to scope
			$scope.pTables = $scope.pTables.concat(tableToScope);
			$scope.cols = $scope.cols.concat(sqlToScope);

			// sample conditions
			var c = [];
			for (let i = 0; i < tables.length; i++) {
				if (tFields[i] == "samples") {
					c.push(["OR", tables[i], operator, id]);
				}
			}
			c[0][0] = "AND";
			queryResults = [];

			// POST sample info
			$http({
				method : "POST",
				url : queryUrl, 
				data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["samples"]),selected_conditions:c}),
				headers : {'Content-Type': 'application/json'}
			}).then(function(data1) {
				queryResults = data1.data;
				$scope.rows = $scope.rows.concat(queryResults);

				resetTables();
				getTableFields("experiments");
				// test fields/tables added to scope
				$scope.pTables = $scope.pTables.concat(tableToScope);
				$scope.cols = $scope.cols.concat(sqlToScope);

				// test conditions
				var c = [];
				for (let i = 0; i < tables.length; i++) {
					if (tFields[i] == "experiments") {
						c.push(["OR", tables[i], operator, id]);
					}
				}
				c[0][0] = "AND";
				queryResults = [];

				// POST test info 
				$http({
					method : "POST",
					url : queryUrl, 
					data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["experiments"]),selected_conditions:c}),
					headers : {'Content-Type': 'application/json'}
				}).then(function(data2) {
					queryResults = data2.data;
					$scope.rows = $scope.rows.concat(queryResults);

					resetTables();
					getTableFields("results");
					// result fields/tables added to scope
					$scope.pTables = $scope.pTables.concat(tableToScope);
					$scope.cols = $scope.cols.concat(sqlToScope);

					// result conditions
					var c = [];
					for (let i = 0; i < tables.length; i++) {
						if (tFields[i] == "results") {
							c.push(["OR", tables[i], operator, id]);
						}
					}
					c[0][0] = "AND";
					queryResults = [];

					// POST result info 
					$http({
						method : "POST",
						url : queryUrl, 
						data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["results"]),selected_conditions:c}),
						headers : {'Content-Type': 'application/json'}
					}).then(function(data3) {
						queryResults = data3.data;
						$scope.rows = $scope.rows.concat(queryResults);

						resetTables();
						getTableFields("resultdetails");
						// result details fields/tables added to scope
						$scope.pTables = $scope.pTables.concat(tableToScope);
						$scope.cols = $scope.cols.concat(sqlToScope);

						// Results conditions
						var c = [];
						for (let i = 0; i < tables.length; i++) {
							if (tFields[i] == "resultdetails") {
								c.push(["OR", tables[i], operator, id]);
							}
						}
						c[0][0] = "AND";
						queryResults = [];

						// POST details 
						$http({
							method : "POST",
							url : queryUrl, 
							data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["resultdetails"]),selected_conditions:c}),
							headers : {'Content-Type': 'application/json'}
						}).then(function(data4) {
							queryResults = data4.data;
							$scope.rows = $scope.rows.concat(queryResults);
							
						}, function(data4) {
							window.alert(data.statusText);
						})
					}, function(data3) {
						window.alert(data.statusText);
					});

				}, function(data2) {
					window.alert(data.statusText);
				});

			}, function(data1) {
				window.alert(data.statusText);
			});	

		}, function(data) {
			window.alert(data.statusText);
		});
	});
});

app2.controller("navCtrl", function($scope, $window) {

	$scope.search = function() {
		if ($scope.searchValue != "") {
			var landingUrl = "http://" + $window.location.host + "/search/" + $scope.searchValue;
			$window.open(landingUrl, '_self');
		}
	}

});

app3.controller("footerCtrl", function($scope, $window) {


});

$(document).ready(function() {
	angular.bootstrap(document.getElementById("app2"), ['searchApp']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
})

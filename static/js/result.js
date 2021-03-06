var app = angular.module("resultApp", []);
var app2 = angular.module("navApp", []);
var app3 = angular.module("footerApp", []);
var selected_fields = [], selected_tables = [], selected_conditions = [];
var tables = [];
var tFields = [], fields = [], tableScope = [], type = [];
var fieldsToScope = [], sqlToScope = [], tableToScope = [];
var samples = [], tests = [], results = [], details = [];
var previewTables = [];
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
var ids = {"patients" : "patients.patient_id",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.experiment_id",
	"results" : "results.results_id",
	"resultdetails" : "resultdetails.results_details_id"};
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";
var patientUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/patient";
var sampleUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/sample";
var testUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/experiment";
var resultUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/result";
var resultdUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/resultdetails";
var searchableUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/searchable";
var uneditableUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/uneditable";
var patientID = "patients.patient_id";
var sample2patient = "samples.patient_id";
var sampleID = "samples.sample_id";
var test2sample = "experiments.sample_id";
var testID = "experiments.experiment_id";
var result2test = "results.experiment_id";
var resultID = "results.results_id";
var result2resultd = "resultdetails.results_id";

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

app.controller("resultCtrl", function($scope, $http, $location, $window) {
	var url = $location.absUrl();
	$scope.ids = ids;
	$scope.edited = {"patients" : [], "samples" : [], "experiments" : [], "results" : []};
	$scope.editRecord = false;
	$scope.hidePatient = true;
	$scope.hideSample = true;
	$scope.hideTest = true;
	$scope.hideMore = true;

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}
	$scope.notId = function(sql) {
		if (sql)
			return ((!sql.includes("patient_id")) && (!sql.includes("sample_id")) && (!sql.includes("experiment_id")) && (!sql.includes("results_id")) && (!sql.includes("results_details_id")))
	}
	
	var str = url.split('/');
	var id = str[str.length-1];
	$scope.patients = [];
	$scope.sql = [];
	$scope.tests = [];
	$scope.test = [];

	$scope.cancel = function() {
		$scope.editRecord = false;
		$scope.addRecord = false;
	}

	$scope.cancelMore = function() {
		$scope.addMore = false;
	}
	
	$http.get(searchableUrl)
	.then(function(data) {
		$scope.searchable = data.data;
	}, function(data) {
		window.alert(data.statusText);
	});

	$http.get(uneditableUrl)
	.then(function(data) {
		$scope.uneditable = data.data;
	}, function(data) {
		window.alert(data.statusText);
	});

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

		$scope.tables = ["Result Details"];
		$scope.fields = angular.copy(fields);
		$scope.tFields = angular.copy(tFields);
		$scope.sqlAll = angular.copy(tables);

		$scope.inputType = function(sql) {
			if (type[tables.indexOf(sql)].includes("string") || type[tables.indexOf(sql)].includes("bool")) {
				return "text";
			} else if (type[tables.indexOf(sql)].includes("time")) {
				return "text";
			} else {
				return "number";
			} 
		}

		function stdDate(obj) {
			var keys = Object.keys(obj);
			for (let i = 0; i < keys.length; i++) {
				if (type[tables.indexOf(keys[i])].includes("time")) {
					if (obj[keys[i]] != "" && obj[keys[i]] != null) {
						var d = new Date(obj[keys[i]]);
						obj[keys[i]] = d.toISOString();
					} else {
						var d = new Date("1000-01-01");
						obj[keys[i]] = d.toISOString();
					}
				}
			}
		}

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
		function hideId() {
			for (let i = 0; i < fieldsToScope.length; i++) {
				if (sqlToScope[i].includes("patient_id") ||
					sqlToScope[i].includes("sample_id") ||
					sqlToScope[i].includes("experiment_id") ||
					sqlToScope[i].includes("results_id") ||
					sqlToScope[i].includes("results_details_id")) {
					fieldsToScope.splice(i, 1);
					sqlToScope.splice(i, 1);
					tableToScope.splice(i, 1);
					i--;
				}
			}
		}

		function empty(obj) {
			var ans = true;
			var keys = Object.keys(obj);
			for (let i = 0; i < keys.length; i++) {
				if (obj[keys[i]] != "" && obj[keys[i]] != null) ans = false;
			}
			return ans; 
		}

		$scope.rows = [];
		$scope.pTables = [];
		$scope.cols = [];

		getTableFields("resultdetails");
		hideId();
		// results fields/tables added to scope
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);

		resetTables();
		getTableFields("patients");
		hideId();
		$scope.patients = angular.copy(fieldsToScope);
		$scope.sql = angular.copy(sqlToScope);

		resetTables();
		getTableFields("samples");
		hideId();
		$scope.samples = angular.copy(fieldsToScope);
		$scope.sqlSample = angular.copy(sqlToScope);
		
		resetTables();
		getTableFields("experiments");
		hideId();
		$scope.tests = angular.copy(fieldsToScope);
		$scope.sqlTest = angular.copy(sqlToScope);

		resetTables();
		getTableFields("results");
		hideId();
		$scope.results = angular.copy(fieldsToScope);
		$scope.sqlResult = angular.copy(sqlToScope);
		
		$scope.id = angular.copy(id);
		var query_condition = ["AND", resultID, operators[0], angular.copy(id)]; // results.results_id = id
		selected_conditions = [angular.copy(query_condition)];

		// POST result info
		$http({
			method : "POST",
			url : queryUrl, 
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["results"]),selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var queryResults = data.data[0];
			$scope.result = angular.copy(queryResults);
			$scope.resultRow = getNumberAsArray(Math.ceil($scope.results.length/2));
			
			id = $scope.result[result2test]; // results.experiment_id

			resetTables();
			getTableFields("experiments");

			query_condition = ["AND", testID, operators[0], angular.copy(id)];
			selected_conditions = [angular.copy(query_condition)];
			queryResults = [];

			$scope.edit = function() {
				// Verify user privilege

				$scope.edited.results = angular.copy($scope.result);
				$scope.editRecord = true;

			}

			$scope.confirm = function() {
				if (confirm("Confirm record change?")) {
					// update database

					$http({
						method : "POST",
						url : resultUrl,
						data : JSON.stringify(angular.copy($scope.edited.results)),
						headers : {'Content-Type': 'application/json'}
					}).then(function(putResponse) {
						$window.open(url, '_self');
					}, function(putResponse) {
						window.alert(putResponse.statusText);
					});
				}
			}
			/*
			$scope.deleteRecord = function() {
				if (confirm("Confirm deleting record?")) {
					// update database
					var deleted = [{"results" : $scope.result[resultID]}];
					
					for (let i = 0; i < $scope.rows.length; i++) {
						var pushed = {[$scope.pTables[i]] : $scope.rows[i][ids[pTables[i]]]};
						deleted.push(pushed);
					}
					var returnUrl = "http://" + $window.location.host + "/results";
					$http.put(deleteUrl, JSON.stringify(deleted))
					.then(function(putResponse) {
						$window.open(returnUrl, '_self');
					}, function(putResponse) {
						window.alert(putResponse.statusText);
					});
				}
			}
			*/
			$scope.add = function() {
				$scope.added = angular.copy($scope.result);
				for (let i = 0; i < $scope.sqlResult.length; i++) {
					$scope.added[$scope.sqlResult[i]] = null;
				}
				$scope.added[resultID] = null;
				$scope.addRecord = true;
			}

			$scope.confirmAdd = function() {
				if (confirm("Confirm adding record?")) {
					if (!empty($scope.added)) {
						stdDate($scope.added);
						$scope.added[result2test] = $scope.test[testID];
						$http({
							method : "POST",
							url : resultUrl,
							data : JSON.stringify($scope.added),
							headers : {'Content-Type': 'application/json'}
						}).then(function(response) {
							var newKey = response.data;
							var returnUrl = "http://" + $window.location.host + "/results/" + newKey;
							$window.open(returnUrl, '_self');
						}, function(response) {
							window.alert(response.statusText);
						});
					} else {
						$scope.addRecord = false;
					}
				}
					
			}

			$scope.addM = function() {
				$scope.more = {"Result Details" : {}};
				for (let i = 0; i < $scope.cols.length; i++) {
					if ($scope.cols[i].includes("resultdetails.")) {
						$scope.more["Result Details"][$scope.cols[i]] = null;
					}
				}
				
				$scope.addMore = true;
			}

			$scope.confirmMore = function() {
				if (confirm("Confirm adding record?")) {
					
					if (!empty("Result Details")) {
						$scope.more["Result Details"][result2resultd] = $scope.result[resultID];
						$http({
							method : "POST",
							url : resultdUrl,
							data : JSON.stringify(angular.copy($scope.more["Result Details"])),
							headers : {'Content-Type': 'application/json'}
						}).then(function(response) {
							$window.open(url, '_self');
							
						}, function(response) {
							window.alert(response.statusText);
						});
					} else {
						$scope.addMore = false;
					}
				}
			}

			// POST sample info
			$http({
				method : "POST",
				url : queryUrl, 
				data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["experiments"]),selected_conditions:selected_conditions}),
				headers : {'Content-Type': 'application/json'}
			}).then(function(data1) {
				queryResults = data1.data[0];
				$scope.test = angular.copy(queryResults);
				$scope.testRow = getNumberAsArray(Math.ceil($scope.tests.length/2));

				id = $scope.test[test2sample]; // experiments.sample_id

				resetTables();
				getTableFields("samples");

				// sample added / find patient
				query_condition = ["AND", sampleID, operators[0], angular.copy(id)]; // samples.sample_id = experiments.sample_id
				selected_conditions = [angular.copy(query_condition)];
				queryResults = [];

				// POST patient for test
				$http({
					method : "POST",
					url : queryUrl, 
					data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["samples"]),selected_conditions:selected_conditions}),
					headers : {'Content-Type': 'application/json'}
				}).then(function(data2) {
					queryResults = data2.data[0];
					$scope.sample = angular.copy(queryResults);
					$scope.sampleRow = getNumberAsArray(Math.ceil($scope.samples.length/2));

					id = $scope.sample[sample2patient]; // samples.patient_id

					resetTables();
					getTableFields("patients");

					// Tests added / find results
					query_condition = ["AND", patientID, operators[0], angular.copy(id)]; // patients.patient_id = samples.patient_id
					selected_conditions = [angular.copy(query_condition)];
					queryResults = [];

					// POST result info
					$http({
						method : "POST",
						url : queryUrl, 
						data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["patients"]),selected_conditions:selected_conditions}),
						headers : {'Content-Type': 'application/json'}
					}).then(function(data3) {
						queryResults = data3.data[0];
						$scope.patient = angular.copy(queryResults);
						$scope.patientRow = getNumberAsArray(Math.ceil($scope.patients.length/2));

						id = $scope.result[resultID]; // results.reuslts_id

						resetTables();
						getTableFields("resultdetails");
						selected_conditions = [];

						// Results added / find details
						query_condition = ["AND", result2resultd, operators[0], angular.copy(id)]; // resultdetails.results_id = results.results_id
						selected_conditions = [angular.copy(query_condition)];
						queryResults = [];

						// POST details for results[c]
						$http({
							method : "POST",
							url : queryUrl, 
							data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["resultdetails"]),selected_conditions:selected_conditions}),
							headers : {'Content-Type': 'application/json'}
						}).then(function(data4) {
							queryResults = data4.data;
							$scope.rows = $scope.rows.concat(queryResults);
							
						}, function(data4) {
							window.alert(data4.statusText);
						})
					}, function(data3) {
						window.alert(data3.statusText);
					});

				}, function(data2) {
					window.alert(data2.statusText);
				});

			}, function(data1) {
				window.alert(data1.statusText);
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
	angular.bootstrap(document.getElementById("app2"), ['resultApp']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
});

var app = angular.module("patientApp", []);
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
var ids = {"patients" : "patients.mrn",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.sample_id",  // experiments.experiment_id
	"results" : "results.sample_id",  // results.results_id
	"resultdetails" : "resultdetails.sample_id"};  // resultdetails.results_details_id
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";
var patientID = "patients.mrn";
var patient2sample = "samples.sample_id"; // samples.mrn
var sampleID = "samples.sample_id";
var sample2test = "experiments.sample_id"; // experiments.sample_id
var testID = "experiments.sample_id"; // experiments.experiment_id
var test2result = "results.sample_id"; // results.experiment_id
var resultID = "results.sample_id"; // results.results_id
var result2resultd = "resultdetails.sample_id"; // resultdetails.results_id


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

app.controller("patientCtrl", function($scope, $http, $location) {
	var url = $location.absUrl();
	$scope.ids = ids;
	$scope.edited = {"patients" : []};
	$scope.editRecord = false;

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}
	
	var str = url.split('/');
	var id = str[str.length-1];
	$scope.patients = [];
	$scope.sql = [];
	
	$scope.cancel = function() {
		$scope.editRecord = false;
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

		$scope.tables = ["Samples","Experiments","Results","Result Details"];
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
		$scope.patients = angular.copy(fieldsToScope);
		$scope.sql = angular.copy(sqlToScope);
		
		$scope.id = angular.copy(id);
		var query_condition = ["AND", patientID, operators[0], angular.copy(id)]; // patients.mrn
		selected_conditions = [angular.copy(query_condition)];
		$scope.rows = [];
		$scope.pTables = [];
		$scope.cols = [];

		// POST patient info
		$http({
			method : "POST",
			url : queryUrl, 
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["patients"]),selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var queryResults = data.data[0];
			$scope.patient = angular.copy(queryResults);
			$scope.patientRow = getNumberAsArray(Math.ceil(selected_fields.length/2));
			
			id = $scope.patient[angular.copy("patients.sample_id")]; // patients.mrn
			
			resetTables();
			getTableFields("samples");
			// sample fields/tables added to scope
			$scope.pTables = $scope.pTables.concat(tableToScope);
			$scope.cols = $scope.cols.concat(sqlToScope);

			query_condition = ["AND",patient2sample, operators[0], angular.copy(id)]; // sample.mrn = patients.mrn
			selected_conditions = [angular.copy(query_condition)];
			queryResults = [];

			// POST sample info
			$http({
				method : "POST",
				url : queryUrl, 
				data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["samples"]),selected_conditions:selected_conditions}),
				headers : {'Content-Type': 'application/json'}
			}).then(function(data1) {
				queryResults = data1.data;
				$scope.rows = $scope.rows.concat(queryResults);

				for (let a = 0; a < queryResults.length; a++) {
					samples = samples.concat(queryResults[a][sampleID]);
				}

				resetTables();
				getTableFields("experiments");
				// test fields/tables added to scope
				$scope.pTables = $scope.pTables.concat(tableToScope);
				$scope.cols = $scope.cols.concat(sqlToScope);

				// Samples added / find tests
				for (let a = 0; a < samples.length; a++) {
					query_condition = ["AND", sample2test, operators[0], angular.copy(samples[a])]; // experiments.sample_id = samples.sample_id
					selected_conditions = [angular.copy(query_condition)];
					queryResults = [];

					// POST test info for sample[a]
					$http({
						method : "POST",
						url : queryUrl, 
						data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["experiments"]),selected_conditions:selected_conditions}),
						headers : {'Content-Type': 'application/json'}
					}).then(function(data2) {
						queryResults = data2.data;
						$scope.rows = $scope.rows.concat(queryResults);

						for (let b = 0; b < queryResults.length; b++) {
							tests = tests.concat(queryResults[b][testID]); // experiments.experiment_id
						}

						resetTables();
						getTableFields("results");
						// test fields/tables added to scope
						$scope.pTables = $scope.pTables.concat(tableToScope);
						$scope.cols = $scope.cols.concat(sqlToScope);

						// Tests added / find results
						for (let b = 0; b < tests.length; b++) {
							query_condition = ["AND", test2result, operators[0], angular.copy(tests[b])]; // results.experiment_id
							selected_conditions = [angular.copy(query_condition)];
							queryResults = [];

							// POST result info for tests[b]
							$http({
								method : "POST",
								url : queryUrl, 
								data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["results"]),selected_conditions:selected_conditions}),
								headers : {'Content-Type': 'application/json'}
							}).then(function(data3) {
								queryResults = data3.data;
								$scope.rows = $scope.rows.concat(queryResults);

								for (let c = 0; c < queryResults.length; c++) {
									results = results.concat(queryResults[c][resultID]); // results.results_id
								}

								resetTables();
								getTableFields("resultdetails");
								// results fields/tables added to scope
								$scope.pTables = $scope.pTables.concat(tableToScope);
								$scope.cols = $scope.cols.concat(sqlToScope);

								// Results added / find details
								for (let c = 0; c < results.length; c++) {
									query_condition = ["AND", result2resultd, operators[0], angular.copy(results[c])]; // resultdetails.results_id = results.results_id
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

										$scope.edit = function() {
											// Verify user privilege

											$scope.edited.patients = angular.copy($scope.patient);
											$scope.editRecord = true;

										}

										$scope.confirm = function() {
											if (confirm("Confirm record change?")) {
												// update database

												$scope.editRecord = false;
											}
										}
										
									}, function(data4) {
										window.alert(data.statusText);
									})
								}
							}, function(data3) {
								window.alert(data.statusText);
							});
						}

					}, function(data2) {
						window.alert(data.statusText);
					});
				}

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
	angular.bootstrap(document.getElementById("app2"), ['patientApp']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
});

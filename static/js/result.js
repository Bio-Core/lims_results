var app = angular.module("resultApp", []);
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

app.config(['$interpolateProvider', function($interpolateProvider) {
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

app.controller("resultCtrl", function($scope, $http, $location) {
	var url = $location.absUrl();

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}
	
	var str = url.split('/');
	var id = str[str.length-1];
	$scope.patients = [];
	$scope.sql = [];
	$scope.tests = [];
	$scope.test = [];

	$http.get("http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns")
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
		
		getTableFields("results");
		$scope.results = angular.copy(fieldsToScope);
		$scope.sqlResult = angular.copy(sqlToScope);
		
		$scope.id = angular.copy(id);
		var query_condition = ["AND", "results.uid", operators[0], angular.copy(id)]; // results.uid
		selected_conditions = [angular.copy(query_condition)];
		$scope.rows = [];
		$scope.pTables = [];
		$scope.cols = [];

		// POST result info
		$http({
			method : "POST",
			url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["results"]),selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var queryResults = data.data[0];
			$scope.result = angular.copy(queryResults);
			$scope.resultRow = getNumberAsArray(Math.ceil($scope.results.length/2));
			
			id = $scope.result["results.sample_id"];

			resetTables();
			getTableFields("experiments");
			$scope.tests = angular.copy(fieldsToScope);
			$scope.sqlTest = angular.copy(sqlToScope);

			query_condition = ["AND", "experiments.sample_id", operators[0], angular.copy(id)];
			selected_conditions = [angular.copy(query_condition)];
			queryResults = [];

			// POST sample info
			$http({
				method : "POST",
				url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
				data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["experiments"]),selected_conditions:selected_conditions}),
				headers : {'Content-Type': 'application/json'}
			}).then(function(data1) {
				queryResults = data1.data[0];
				$scope.test = angular.copy(queryResults);
				$scope.testRow = getNumberAsArray(Math.ceil($scope.tests.length/2));

				id = $scope.test["experiments.sample_id"]; // samples.sample_id

				resetTables();
				getTableFields("samples");
				$scope.samples = angular.copy(fieldsToScope);
				$scope.sqlSample = angular.copy(sqlToScope);

				// sample added / find patient
				query_condition = ["AND", "samples.sample_id", operators[0], angular.copy(id)];
				selected_conditions = [angular.copy(query_condition)];
				queryResults = [];

				// POST patient for test
				$http({
					method : "POST",
					url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
					data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["samples"]),selected_conditions:selected_conditions}),
					headers : {'Content-Type': 'application/json'}
				}).then(function(data2) {
					queryResults = data2.data[0];
					$scope.sample = angular.copy(queryResults);
					$scope.sampleRow = getNumberAsArray(Math.ceil($scope.samples.length/2));

					id = $scope.sample["samples.sample_id"]; // samples.sample_id

					resetTables();
					getTableFields("patients");
					$scope.patients = angular.copy(fieldsToScope);
					$scope.sql = angular.copy(sqlToScope);

					// Tests added / find results
					query_condition = ["AND", "patients.sample_id", operators[0], angular.copy(id)];
					selected_conditions = [angular.copy(query_condition)];
					queryResults = [];

					// POST result info
					$http({
						method : "POST",
						url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
						data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["patients"]),selected_conditions:selected_conditions}),
						headers : {'Content-Type': 'application/json'}
					}).then(function(data3) {
						queryResults = data3.data[0];
						$scope.patient = angular.copy(queryResults);
						$scope.patientRow = getNumberAsArray(Math.ceil($scope.patients.length/2));

						id = $scope.result["results.sample_id"];

						resetTables();
						getTableFields("resultdetails");
						// results fields/tables added to scope
						$scope.pTables = $scope.pTables.concat(tableToScope);
						$scope.cols = $scope.cols.concat(sqlToScope);

						// Results added / find details
						query_condition = ["AND", "resultdetails.sample_id", operators[0], angular.copy(id)];
						selected_conditions = [angular.copy(query_condition)];
						queryResults = [];

						// POST details for results[c]
						$http({
							method : "POST",
							url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
							data : JSON.stringify({selected_fields:selected_fields,selected_tables:angular.copy(["resultdetails"]),selected_conditions:selected_conditions}),
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

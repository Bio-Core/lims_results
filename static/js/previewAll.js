var app = angular.module("previewMain", []);
var selected_fields = [], selected_tables = [], selected_conditions = [];
var tables = [];
var tFields = [], fields = [], tableScope = [], type = [];
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
var id = {"patients" : "patients.mrn",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.sample_id",
	"results" : "results.uid",
	"resultdetails" : "resultdetails.uid"};

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

app.controller("mainCtrl", function($scope, $http) {
	$scope.previewSize = 25;
	$scope.id = angular.copy(id);
	$scope.searchResult = false;
	$scope.searchValue = "";

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}

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

		var response = [tables, tFields, fields];
		$scope.tFields = angular.copy(tFields);
		$scope.tables = angular.copy(tableScope.filter(onlyUnique));
		$scope.cols = angular.copy(fields);
		$scope.sql = angular.copy(tables);
		var init_condition1 = ["AND", "samples.date_collected", operators[4], "1980-01-01"];
		var init_condition2 = ["AND", "samples.date_collected", operators[5], "2018-03-06"];
		selected_conditions = [angular.copy(init_condition1), angular.copy(init_condition2)];

		$http({
			method : "POST",
			url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
			data : JSON.stringify({selected_fields:tables,selected_tables:tFields.filter(onlyUnique),selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var ans = data.data;
			$scope.results = angular.copy(ans);

		}, function(data) {
			window.alert(data.statusText);
		});
		/*
		$scope.search = function() {
			if ($scope.searchValue == "") window.alert("Empty search");

			$scope.searchResult = [];
			for (let j = 0; j < $scope.tables.length; j++) {
				var table = $scope.tables[j], c = [], t = [];
				for (let i = 0; i < tables.length; i++) {
					if (tFields[i] == table.toLowerCase().split(' ').join('')) {
						t.push(tables[i]);
						c.push(["OR", table, operators[10], $scope.searchValue]);
					}
				}

				$http({
					method : "POST",
					url : "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query", 
					data : JSON.stringify({selected_fields:t,selected_tables:table,selected_conditions:c}),
					headers : {'Content-Type': 'application/json'}
				}).then(function(data) {
					$scope.searchResult.concat(angular.copy(data.data));

				}, function(data) {
					window.alert(data.statusText);
				});
			}

				
		}

		$scope.serachChange = function(table) {
			if ($scope.searchValue.length > 3) {
				search(table);
			}
		}
		*/
	}, function(data) {
		window.alert("GET error");
	});


});

$(document).ready(function() {
	if ($('#table_preview').outerWidth() < $('div.previewWindow').outerWidth()) $('#table_preview').css("width", "100%");
})


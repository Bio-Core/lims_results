var app = angular.module("previewMain", []);
var app2 = angular.module("navApp", []);
var app3 = angular.module("footerApp", []);
var selected_fields = [], selected_tables = [], selected_conditions = [];
var tables = [];
var tFields = [], fields = [], tableScope = [], type = [];
var sqlToScope = [], tableToScope = [];
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
var id = {"patients" : "patients.patient_id",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.experiment_id",
	"results" : "results.results_id",
	"resultdetails" : "resultdetails.results_details_id"};
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";
var searchableUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/searchable";
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

app.controller("mainCtrl", function($scope, $http) {
	$scope.previewSize = 25;
	$scope.id = angular.copy(id);
	$scope.hide = [true, true, true, true, true];

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}
	$scope.notId = function(sql) {
		return (!sql.includes("patient_id") && 
				!sql.includes("sample_id") && 
				!sql.includes("experiment_id") && 
				!sql.includes("results_id") && 
				!sql.includes("results_details_id"))
	}

	$http.get(searchableUrl)
	.then(function(data) {
		$scope.searchable = data.data;
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

		var response = [tables, tFields, fields];
		$scope.tFields = angular.copy(tFields);
		$scope.tables = tableOrder;
		$scope.fields = angular.copy(fields);
		$scope.sql = angular.copy(tables);

		$scope.pTables = [];
		$scope.cols = [];

		function getTableFields(table) {
			for (let i = 0; i < tables.length; i++) {
				if (tFields[i] == table) {
					selected_fields.push(tables[i]);
					sqlToScope.push(tables[i]);
					tableToScope.push(tFields[i]);
				}
			}
		}
		function resetTables() {
			selected_fields = [];
			sqlToScope = [];
			tableToScope = [];
		}

		/*
		var d = new Date();
		var dd = (d.getDate() < 10 ? '0'+d.getDate() : d.getDate());
		var mm = (d.getMonth() < 9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1));
		var mm1 = (d.getMonth()-1 < 1 ? '12' : (d.getMonth()-1 < 9 ? '0'+d.getMonth() : d.getMonth()));
		var yy = d.getFullYear();
		var today = yy + "-" + mm + "-" + dd;
		var lastMonth = yy + "-" + mm1 + "-" + dd;

		var init_condition1 = ["AND", "samples.date_collected", operators[4], lastMonth];
		var init_condition2 = ["AND", "samples.date_collected", operators[5], today];
		*/

		selected_conditions = [["AND", "patients.patient_id", operators[1], "a"]];

		$scope.results = {"Patients" : [], "Samples" : [], "Experiments" : [], "Results" : [], "Result Details" : []};
		getTableFields("patients");
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);

		$http({
			method : "POST",
			url : queryUrl, 
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:["patients"],selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data1) {
			var ans = data1.data;
			$scope.results["Patients"] = angular.copy(ans);

		}, function(data1) {
			window.alert(data1.statusText);
		});

		resetTables();
		getTableFields("samples");
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);
		selected_conditions = [["AND", "samples.sample_id", operators[1], "a"]];

		$http({
			method : "POST",
			url : queryUrl,
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:["samples"],selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data2) {
			var ans = data2.data;
			$scope.results["Samples"] = angular.copy(ans);

		}, function(data2) {
			window.alert(data2.statusText);
		});

		resetTables();
		getTableFields("experiments");
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);
		selected_conditions = [["AND", "experiments.experiment_id", operators[1], "a"]];

		$http({
			method : "POST",
			url : queryUrl,
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:["experiments"],selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data3) {
			var ans = data3.data;
			$scope.results["Experiments"] = angular.copy(ans);

		
		}, function(data3) {
			window.alert(data3.statusText);
		});

		resetTables();
		getTableFields("results");
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);
		selected_conditions = [["AND", "results.results_id", operators[1], "a"]];

		$http({
			method : "POST",
			url : queryUrl,
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:["results"],selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data4) {
			var ans = data4.data;
			$scope.results["Results"] = angular.copy(ans);

		}, function(data4) {
			window.alert(data4.statusText);
		});

		resetTables();
		getTableFields("resultdetails");
		$scope.pTables = $scope.pTables.concat(tableToScope);
		$scope.cols = $scope.cols.concat(sqlToScope);
		selected_conditions = [["AND", "resultdetails.results_details_id", operators[1], "a"]];

		$http({
			method : "POST",
			url : queryUrl,
			data : JSON.stringify({selected_fields:selected_fields,selected_tables:["resultdetails"],selected_conditions:selected_conditions}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data5) {
			var ans = data5.data;
			$scope.results["Result Details"] = angular.copy(ans);

		}, function(data5) {
			window.alert(data5.statusText);
		});

	}, function(data) {
		window.alert("GET error");
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
	if ($('#table_preview').outerWidth() < $('div.previewWindow').outerWidth()) $('#table_preview').css("width", "100%");

	//angular.bootstrap(document.getElementById("app1"), ['navApp']);
	angular.bootstrap(document.getElementById("app2"), ['previewMain']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
})

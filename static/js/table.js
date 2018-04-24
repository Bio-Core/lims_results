var app = angular.module("tableApp", []);
var app2 = angular.module("navApp", []);
var app3 = angular.module("footerApp", []);
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
var id = {"patients" : "patients.patient_id",
	"samples" : "samples.sample_id",
	"experiments" : "experiments.experiment_id",
	"results" : "results.results_id",
	"resultdetails" : "resultdetails.results_details_id"};
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";
var searchableUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/searchable";

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

app.controller("tableCtrl", function($scope, $http, $location) {
	$scope.previewSize = 25;
	$scope.id = angular.copy(id);
	var url = $location.absUrl();
	var str = url.split('/');
	$scope.title  = str[str.length-1];
	$scope.currentPage = 0; 
	$scope.pageSize = 50;
	$scope.pages = [25, 50, 100, 500];
	$scope.fields = [];
	$scope.cols = [];

	$scope.setCurrentPage = function(currentPage) {
	    $scope.currentPage = currentPage;
	}
	$scope.getNumberAsArray = function (num) {
	    return new Array(num);
	};
	$scope.prev = function() {
		if ($scope.currentPage > 0) $scope.currentPage--;
	}
	$scope.next = function() {	
		if ($scope.currentPage < $scope.numberOfPages() - 1) $scope.currentPage++;
	}
	$scope.front = function() {
		if ($scope.currentPage > 0) $scope.currentPage = 0;
	}
	$scope.end = function() {	
		if ($scope.currentPage < $scope.numberOfPages() - 1) $scope.currentPage = $scope.numberOfPages() - 1;
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

			if (tFields[i] == angular.copy($scope.title)) {
				$scope.fields.push(fields[i]);
				$scope.cols.push(tables[i]);
			}
		}

		$scope.notId = function(sql) {
			return (!sql.includes("patient_id") && 
					!sql.includes("sample_id") && 
					!sql.includes("experiment_id") && 
					!sql.includes("results_id") && 
					!sql.includes("results_details_id"))
		}

		selected_conditions = ["AND", id[$scope.title], operators[10], ""];

		$http({
			method : "POST",
			url : queryUrl, 
			data : JSON.stringify({selected_fields:angular.copy($scope.cols),selected_tables:[angular.copy($scope.title)],selected_conditions:[selected_conditions]}),
			headers : {'Content-Type': 'application/json'}
		}).then(function(data) {
			var ans = data.data;
			$scope.rows = angular.copy(ans);

			$scope.numberOfPages = function() {
				return Math.ceil($scope.rows.length / $scope.pageSize);
			};

		}, function(data) {
			window.alert(data.statusText);
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
	angular.bootstrap(document.getElementById("app2"), ['tableApp']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
})

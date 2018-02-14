var response = '[{ "patients.dob": "2018-02-05","patients.first_name": "Mitchell2","patients.gender": "male","patients.initials": "PE","patients.mrn": "test","patients.patient_id": "1","patients.sample_id": "1","samples.facility": "test","samples.sample_id": "1","samples.se_num": "1","samples.volume_of_blood_marrow": 12.3},{"patients.dob": "2018-02-05","patients.first_name": "Jane","patients.gender": "f","patients.initials": "A","patients.last_name": "Doe","patients.patient_id": "2","patients.sample_id": "2","samples.facility": "test","samples.sample_id": "2","samples.se_num": "34","samples.tumor_site": "tumor","samples.volume_of_blood_marrow": 1554.9},{"patients.dob": "2018-02-05","patients.first_name": "Jane","patients.gender": "f","patients.initials": "A","patients.last_name": "Doe","patients.patient_id": "2","patients.sample_id": "2","samples.sample_id": "2","samples.se_num": "s"}]';

var app = angular.module("previewApp", []);

app.config(['$interpolateProvider', function($interpolateProvider) {
	$interpolateProvider.startSymbol('{a');
	$interpolateProvider.endSymbol('a}');
}]);

app.controller('previewCtrl', function($scope) {
	$scope.fields = fields;
	content = JSON.parse(response);
	$scope.rows = [];
	for (let j = 0; j < content.length; j++) {
		var row = [];
		for (let i = 0; i < $scope.fields.length; i++) {
			var name = document.title.toLowerCase() + "." + $scope.fields[i].toLowerCase().replace(/ /g, '\_').replace('\.', '\_').replace('\/', '\_');
			row[name] = content[j][name];
		}
		$scope.rows.push(row);
	}

	$scope.cols = Object.keys($scope.rows[0]);

});

$(document).ready(function() {
	if ($('#table_preview').outerWidth() < $('div.previewWindow').outerWidth()) $('#table_preview').css("width", "100%");
});

var app = angular.module("queryApp", []);
var app2 = angular.module("navApp", []);
var app3 = angular.module("footerApp", []);
var sql_col = [], table_names = [], col_names = [], orderedTables = ["Patients","Samples","Experiments","Results","Result Details"];
var selected_fields = [], selected_tables = [], selected_conditions = [];
var tables = [];
var tFields = [], fields = [], tableScope = [], type = [];
const MIN_WIDTH = 30, MIN_WIDTH_PX = '30px';
var doc, thElm, startOffset = 0;
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
var operators1 = [
	"Equal to",
	"Not equal to",
	"Begins with",
	"Not begins with",
	"Ends with",
	"Not ends with",
	"Contains",
	"Not contains"];

var d = new Date();
var dd = (d.getDate() < 10 ? '0'+d.getDate() : d.getDate());
var mm = (d.getMonth() < 9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1));
var mm1 = (d.getMonth()-1 < 1 ? '12' : (d.getMonth()-1 < 9 ? '0'+d.getMonth() : d.getMonth()));
var yy = d.getFullYear();
var today = yy + "-" + mm + "-" + dd;
var lastMonth = yy + "-" + mm1 + "-" + dd;

var commonQuery = [
	{"fields" : ["experiments.study_id","experiments.test_date","experiments.priority","patients.first_name","patients.last_name","resultdetails.pcr","resultdetails.result","results.mlpa_pcr","samples.sample_type","samples.surgical_num","samples.tumor_site","samples.study_id","samples.sample_name","samples.copath_num","samples.other_identifier"],
	"conditions" : [{conn:"AND", field:"samples.sample_id", operator:operators[1], content:"a"}]},
	{"fields" : ["experiments.test_date","experiments.pcr","experiments.project_name","experiments.opened_date","experiments.project_id","patients.first_name","patients.last_name","patients.initials","patients.patient_type","patients.surgical_date","resultdetails.coverage","resultdetails.exon","resultdetails.gene","resultdetails.p_nomenclature","results.mean_depth_of_coveage","results.mlpa_pcr","results.verification_pcr","samples.material_received_num","samples.material_received_other","samples.volume_of_blood_marrow","samples.container_type","samples.container_name","samples.container_id","samples.other_identifier","samples.has_sample_files","samples.rna_quality","samples.rna_extraction_date"],
	"conditions" : [{conn:"AND", field:"samples.date_collected", operator:operators[4], content:lastMonth}, {conn:"AND", field:"samples.date_collected", operator:operators[5], content:today}]},
	{"fields" : ["experiments.experiment_id","experiments.study_id","experiments.test_date","experiments.chip_cartridge_barcode","experiments.project_name","experiments.opened_date","experiments.has_project_files","patients.first_name","patients.last_name","patients.patient_type","patients.date_received","patients.referring_physican","patients.date_reported","resultdetails.VAF","resultdetails.coverage","resultdetails.gene","resultdetails.pcr","resultdetails.result","results.failed_regions","results.mutation","results.overall_hotspots_threshold","samples.facility","samples.test_requested","samples.se_num","samples.date_collected","samples.tumor_site","samples.historical_diagnosis","samples.tumor_percnt_of_total","samples.reviewed_by","samples.non_uhn_id","samples.dna_volume","samples.dna_location","samples.rna_volume","samples.plasma_location","samples.sample_size","samples.study_id","samples.sample_name","samples.container_well","samples.copath_num","samples.delta_ct_value","samples.rna_quality","samples.rna_extraction_date"],
	"conditions" : [{conn:"AND", field:"samples.date_collected", operator:operators[4], content:lastMonth}, {conn:"AND", field:"samples.date_collected", operator:operators[5], content:today}]},
	{"Common Query 4 Test" : ["experiments.experiment_id","experiments.study_id","experiments.panel_assay_screened","experiments.test_date","experiments.chip_cartridge_barcode","experiments.complete_date","experiments.pcr","experiments.project_name","experiments.priority","experiments.opened_date","experiments.project_id","experiments.has_project_files","experiments.procedure_order_datetime"],
	"conditions" : [{conn:"AND", field:"", operator:operators[0], content:""}]},
	{"fields" : ["patients.first_name","patients.last_name","patients.initials","patients.patient_type","patients.se_num","patients.date_received","patients.referring_physican","patients.date_reported","patients.surgical_date"],
	"conditions" : [{conn:"AND", field:"", operator:operators[0], content:""}]},
	{"fields" : ["samples.facility","samples.test_requested","samples.se_num","samples.date_collected","samples.date_received","samples.sample_type","samples.material_received","samples.material_received_num","samples.material_received_other","samples.volume_of_blood_marrow","samples.surgical_num","samples.tumor_site","samples.historical_diagnosis","samples.tumor_percnt_of_total","samples.tumor_percnt_of_circled","samples.reviewed_by","samples.h_e_slide_location","samples.non_uhn_id","samples.name_of_requestor","samples.dna_concentration","samples.dna_volume","samples.dna_location","samples.rna_concentration","samples.rna_volume","samples.rna_location","samples.wbc_location","samples.plasma_location","samples.cf_plasma_location","samples.pb_bm_location","samples.rna_lysate_location","samples.sample_size","samples.study_id","samples.sample_name","samples.date_submitted","samples.container_type","samples.container_name","samples.container_id","samples.container_well","samples.copath_num","samples.other_identifier","samples.has_sample_files","samples.dna_sample_barcode","samples.dna_extraction_date","samples.dna_quality","samples.ffpe_qc_date","samples.delta_ct_value","samples.comments","samples.rnase_p_date","samples.dna_quality_by_rnase_p","samples.rna_quality","samples.rna_extraction_date"],
	"conditions" : [{conn:"AND", field:"", operator:operators[0], content:""}]},
	{"fields" : ["results.failed_regions","results.mean_depth_of_coveage","results.mlpa_pcr","results.mutation","results.overall_hotspots_threshold","results.overall_quality_threshold","results.verification_pcr"],
	"conditions" : [{conn:"AND", field:"", operator:operators[0], content:""}]},
	{"fields" : ["resultdetails.VAF","resultdetails.c_nomenclature","resultdetails.coverage","resultdetails.exon","resultdetails.gene","resultdetails.p_nomenclature","resultdetails.pcr","resultdetails.quality_score","resultdetails.result","resultdetails.risk_score",],
	"conditions" : [{conn:"AND", field:"", operator:operators[0], content:""}]}
];
var commonQueryName = [
	"Common Query 1",
	"Common Query 2",
	"Common Query 3",
	"Common Query 4 Test",
	"Common Query 5 Patient",
	"Common Query 6 Sample",
	"Common Query 7 Results",
	"Common Query 8 Result Detail"];
var queryUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query";
var colUrl = "http://172.27.164.207:8000/Jtree/metadata/0.1.0/columns";

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

app.filter('orderObjectBy', function() {
	return function(items, field, reverse) {
		var filtered = [];
		angular.forEach(items, function(item) {
			filtered.push(item);
		});
		filtered.sort(function (a, b) {
			return (a[field] > b[field] ? 1 : -1);
		});
		if (reverse) {
			filtered.reverse();
		}
		return filtered;
	};
});

app.directive('tableStyle', function() {
	return function(scope, element, attrs) {
		if (scope.$index == (scope.currentPage+1)*scope.pageSize) {
			//window.alert("last row");
			$('table').css('width', function() {
				var ths = document.querySelectorAll('table th');
				var sum = 0;
				for (let i = 0; i < ths.length; i++) {
					ths[i].style.width = ths[i].clientWidth + 'px';
					sum += ths[i].clientWidth;
				}
				return sum;
			});
		}
	}
});

app.directive("datepicker", function () {
	return {
		restrict: "A",
		//require: "ngModel",
		link: function (scope, elem, attrs, ngModelCtrl) {
			var updateModel = function (dateText) {
				scope.$apply(function () {
					ngModelCtrl.$setViewValue(dateText);
					ngModelCtrl.$processModelValue();
				});
			};
			var options = {
				dateFormat: "yy-mm-dd",
				onSelect: function (dateText) {
					updateModel(dateText);
				}
			};
			elem.datepicker(options);
		}
	}
});

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

function downloadCSV(csv, filename) {
	var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: "text/csv"});
    downloadLink = document.createElement("a");
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = "none";
    document.body.appendChild(downloadLink);
    downloadLink.click();
}

app.controller("queryCtrl", function($scope, $http) {
	var thElm;
	$scope.reverseSort = false;
	selected_fields = [];
	selected_tables = [];
	$scope.selected_fields = [];
	$scope.currentPage = 0; 
	$scope.pageSize = 50;
	$scope.pages = [25, 50, 100, 500];
	$scope.headerWidth = 'auto';
	var default_condition = {conn:"AND", field:"", operator:operators[0], content:""};
	var init_condition1 = {conn:"AND", field:"samples.date_collected", operator:operators[4], content:""};
	var init_condition2 = {conn:"AND", field:"samples.date_collected", operator:operators[5], content:""};
	//$scope.selected_conditions = [angular.copy(init_condition1), angular.copy(init_condition2)];
	$scope.selected_conditions = [angular.copy(default_condition)];
	$scope.commonQuery = commonQuery;
	$scope.commonQueryName = commonQueryName;

	$scope.hasDate = function(str) {
		return (str.indexOf('date')!=-1 || str.indexOf('dob')!=-1);
	}

	$scope.sameTable = function(ft, t) {
		return (ft == t.toLowerCase().split(' ').join(''))
	}

	// ng-init=load()  ===   window.onload 
	$scope.load = function() {
		
		// draggable table
	    var e;
	    (function (e) {
		    var JsDragTable = (function () {
		        function JsDragTable(target) {
		            this.offsetX = 10;
		            this.offsetY = 10;
		            this.container = target;
		            this.rebind();
		        }
		        JsDragTable.prototype.rebind = function () {
		            var _this = this;
		            $(this.container).find("th").each(function (headerIndex, header) {
		                $(header).off("mousedown touchstart");
		                $(header).off("mouseup touchend");
		                $(header).on("mousedown touchstart", function (event) {
		                    if (!event.target.classList.contains('grip')) _this.selectColumn($(header), event);
		                });
		                $(header).on("mouseup touchend", function (event) {
		                    if (!event.target.classList.contains('grip')) _this.dropColumn($(header), event);
		                });
		                $(header).on("mouseup", function (event) {
		                    _this.cancelColumn();
		                });
		            });
		            $(this.container).on("mouseup touchend", function () {
		                _this.cancelColumn();
		            });
		        };

		        JsDragTable.prototype.selectColumn = function (header, event) {
		            var _this = this;
		            event.preventDefault();
		            var userEvent = new UserEvent(event);
		            this.selectedHeader = header;
		            var sourceIndex = this.selectedHeader.index() + 1;
		            var cells = [];
		            $('#table_header th').removeClass('hovered after before');
		            $('#table_header th').each(function(index, th) {
		            	if (index < sourceIndex - 1) {
		            		$('#table_header th').get(index).classList.add("before");
		            	}
		            	else if (index > sourceIndex - 1) {
		            		$('#table_header th').get(index).classList.add("after");
		            	}
		            })

		            $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each(function (cellIndex, cell) {
		                cells[cells.length] = cell;
		            });

		            this.draggableContainer = $("<div/>");
		            this.draggableContainer.addClass("jsdragtable-contents");
		            this.draggableContainer.css({ position: "absolute", left: userEvent.event.pageX + this.offsetX, top: userEvent.event.pageY + this.offsetY });


		            var dragtable = this.createDraggableTable(header);

		            $(cells).each(function (cellIndex, cell) {
		                var tr = $("<tr/>");
		                var td = $("<td/>");
		                if ($(cells[cellIndex]).html() == "") {
		                	$(td).html("&nbsp");
		                } else {
		                	$(td).html($(cells[cellIndex]).html());
		                }
		                $(tr).append(td);
		                $(dragtable).find("tbody").append(tr);
		            });
					
		            this.draggableContainer.append(dragtable);
		            if (!$(event.target).is('div.grip')) {
		            	setTimeout(function() {
							$("body").append(_this.draggableContainer);
		            	}, 300);
		            }
		            
		            $(this.container).on("mousemove touchmove", function (event) {
		                _this.moveColumn($(header), event);
		            });
		            $(".jsdragtable-contents").on("mouseup touchend", function () {
		                _this.cancelColumn();
		            });
		        };

		        JsDragTable.prototype.moveColumn = function (header, event) {
		            event.preventDefault();
		            if (this.selectedHeader !== null) {
		                var userEvent = new UserEvent(event);
		                this.draggableContainer.css({ left: userEvent.event.pageX + this.offsetX, top: userEvent.event.pageY + this.offsetY });
		                $('#table_header th').removeClass('hovered');
		                $(event.target).addClass("hovered");
		            }
		        };

		        JsDragTable.prototype.dropColumn = function (header, event) {
		        	if (this.selectedHeader != null) {
		        		var _this = this;
			            event.preventDefault();
			            
			            var sourceIndex = this.selectedHeader.index() + 1;
			            var targetIndex = $(event.target).index() + 1;
			            if (event.target.classList.contains('grip')) targetIndex = $(event.target).parent().index() + 1;
			            var tableColumns = $(this.container).find("th").length;

			            var userEvent = new UserEvent(event);
			            if (userEvent.isTouchEvent) {
			                header = $(document.elementFromPoint(userEvent.event.clientX, userEvent.event.clientY));
			                targetIndex = $(header).prevAll().length + 1;
			            }
			            
			            if (sourceIndex !== targetIndex) {
			                var cells = [];
			                $(this.container).find("tr td:nth-child(" + sourceIndex + ")").each(function (cellIndex, cell) {
			                    cells[cells.length] = cell;
			                    $(cell).remove();
			                    $(_this.selectedHeader).remove();
			                });

			                if (targetIndex >= tableColumns) {
			                    targetIndex = tableColumns - 1;
			                    this.insertCells(cells, targetIndex, function (cell, element) {
			                        $(cell).after(element);
			                    });
			                } else {
			                    this.insertCells(cells, targetIndex, function (cell, element) {
			                        $(cell).before(element);
			                    });
			                }
			                selected_fields.splice(targetIndex-1, 0, selected_fields.splice(sourceIndex-1, 1)[0]);
			                $scope.selected_fields.splice(targetIndex-1, 0, $scope.selected_fields.splice(sourceIndex-1, 1)[0]);

			                $(this.container).off("mousemove touchmove");
			                $(".jsdragtable-contents").remove();
			                $('#table_header th').removeClass('hovered after before');

			                this.draggableContainer = null;
			                this.selectedHeader = null;
			                this.rebind();

			                $scope.sortBy = function(e, str) {
								if (!e.target.classList.contains('grip')) {
									//window.alert(e.currentTarget);
									if ($scope.orderByField == str) {
										$scope.reverseSort = !$scope.reverseSort;
									}
									$scope.orderByField = str;
								}
									
							}
							$scope.down = function(e) {
								thElm = e.currentTarget.parentElement;
								startOffset = thElm.offsetWidth - e.pageX;

							}
			            }

		        	}
		        };

		        JsDragTable.prototype.cancelColumn = function () {
		            $(this.container).off("mousemove touchmove");
		            $(".jsdragtable-contents").remove();
		            $('#table_header th').removeClass('hovered after before');
		            this.draggableContainer = null;
		            this.selectedHeader = null;
		        };

		        JsDragTable.prototype.createDraggableTable = function (header) {
		            $(".jsdragtable-contents").remove();
		            var table = $("<table/>");
		            var thead = $("<thead/>");
		            var tbody = $("<tbody/>");
		            var tr = $("<tr/>");
		            var th = $("<th/>");
		            $(table).addClass($(this.container).attr("class"));
		            $(table).width($(header).width());
		            $(th).html($(header).html());
		            $(tr).append(th);
		            $(thead).append(tr);
		            $(table).append(thead);
		            $(table).append(tbody);
		            return table;
		        };

		        JsDragTable.prototype.insertCells = function (cells, columnIndex, callback) {
		            var _this = this;
		            $(this.container).find("tr td:nth-child(" + columnIndex + ")").each(function (cellIndex, cell) {
		                callback(cell, $(cells[cellIndex]));
		            });
		            $(this.container).find("th:nth-child(" + columnIndex + ")").each(function (cellIndex, cell) {
		                callback(cell, $(_this.selectedHeader));
		            });
		        };
		        return JsDragTable;
		    })();
		    e.JsDragTable = JsDragTable;

		    var UserEvent = (function () {
		        function UserEvent(event) {
		            this.event = event;
		            if (event.originalEvent && event.originalEvent.touches && event.originalEvent.changedTouches) {
		                this.event = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];
		                this.isTouchEvent = true;
		            }
		        }
		        return UserEvent;
		    })();
		})(e || (e = {}));
		jQuery.fn.extend({
		    jsdragtable: function () {
		        return new e.JsDragTable(this);
		    }
		});

		document.addEventListener('mousemove', function(e) {
			if (thElm) {
				thElm.style.width = startOffset + e.pageX + 'px';
				if (thElm.offsetWidth < MIN_WIDTH)
					thElm.style.width = MIN_WIDTH_PX;
			}
		});

		document.addEventListener('mouseup', function() {
			thElm = undefined;
			
		});

	}

	$http.get(colUrl)
	.then(function(data) {
		var input = data.data;
		for (let i = 0; i < input.length; i++) {
			var str = input[i][0].split(".");
			if (str[1] != "patient_id" && 
				str[1] != "sample_id" && 
				str[1] != "experiment_id" && 
				str[1] != "results_id" && 
				str[1] != "resultdetails_id") {
				tFields.push(str[0]);
				tableScope.push(capwords(str[0]));
				fields.push(sqlToDisplay(str[1]));
				type.push(input[i][1]);
				tables.push(input[i][0]);
			}
		}

		$scope.orderByField = tables[0];
		var response = [tables, tFields, fields];
		$scope.tFields = angular.copy(tFields);
		$scope.tables = angular.copy(tableScope.filter(onlyUnique));
		$scope.cols = angular.copy(fields);
		$scope.type = angular.copy(type);
		
		$scope.collapse = function(e) {
			e.currentTarget.classList.toggle("collapse");
		}
		$scope.selected = function(e, index) {
			e.currentTarget.classList.toggle("selected");
			var i = index;
			if (selected_fields.indexOf(response[0][i]) == -1) {
				selected_fields.push(response[0][i]);
				$scope.selected_fields.push({tf:response[0][i], table:response[1][i], field:response[2][i]});
				if (selected_tables.indexOf(response[1][i]) == -1)
					selected_tables.push(response[1][i]);
					
			} else {
				var j = selected_fields.indexOf(response[0][i]);
				selected_fields.splice(j, 1);
				$scope.selected_fields.splice(j, 1);
				if (!selected_fields.some(s => s.startsWith(response[1][i])))
					selected_tables.splice(selected_tables.indexOf(response[1][i]),1);
			}

		}

		$scope.options = angular.copy(tables);
		$scope.operators = angular.copy(operators);
		$scope.operators1 = angular.copy(operators1);
		$scope.results = [];

		$scope.makeToday = function(i) {
			var d = new Date();
			var dd = (d.getDate() < 10 ? '0'+d.getDate() : d.getDate());
			var mm = (d.getMonth() < 9 ? '0'+(d.getMonth()+1) : (d.getMonth()+1));
			var yy = d.getFullYear();
			var str = yy + "-" + mm + "-" + dd;
			$scope.selected_conditions[i].content = angular.copy(str);
		}
		$scope.csv = function() {
			// prepare for csv download
			var csv = [selected_fields.join(",")];
			var rows = $scope.results;

			for (var i = 0; i < rows.length; i++) {
			    var row = [], col = rows[i];
			    
			    for (var j = 0; j < selected_fields.length; j++) 
			        row.push(col[selected_fields[j]]);
			    
			    csv.push(row.join(","));        
			}

			// Download CSV file
			downloadCSV(csv.join("\n"), "results.csv");
		}
		$scope.all = function() {
			var c = document.getElementsByClassName("cols");
			for (let i = 0; i < c.length; i++) {
				if (!c[i].classList.contains('selected')) {
					c[i].classList.toggle("selected");
					selected_fields.push(response[0][i]);
					$scope.selected_fields.push({tf:response[0][i], table:response[1][i], field:response[2][i]});
				}
			}
			$scope.orderByField = selected_fields[0];

			selected_tables = tFields.filter(onlyUnique);
			$scope.orderByField = selected_fields[0];
			//btn_query.click();
		}
		$scope.clear = function() {
			var c = document.getElementsByClassName("cols");
			for (i = 0; i < c.length; i++) {
				if (c[i].classList.contains('selected')) {
					c[i].classList.toggle("selected");
				}
			}
			queryResults = [];
			selected_fields = [];
			selected_tables = [];
			$scope.selected_fields = [];
			$scope.results = [];
			$('table').css('width', 'auto');
		}
		$scope.add = function() {
			$scope.selected_conditions.push(angular.copy(default_condition));
		}
		$scope.delete = function(i) {
			if ($scope.selected_conditions.length > 1) {
				$scope.selected_conditions.splice(i, 1);
				$scope.selected_conditions[0].conn = "AND";
			} else {
				$scope.selected_conditions = [default_condition];
			}
		}
		$scope.preset = function() {
			var prefill = commonQuery[commonQueryName.indexOf(angular.copy($scope.presetQuery))];

			selected_fields = prefill.fields;

			var c = document.getElementsByClassName("cols");
			
			for (i = 0; i < c.length; i++) {
				if (c[i].classList.contains('selected')) {
					c[i].classList.toggle("selected");
				}
			}
			queryResults = [];
			selected_tables = [];
			$scope.selected_fields = [];
			$scope.results = [];

			$scope.selected_conditions = prefill.conditions;

			for (let i = 0; i < selected_fields.length; i++) {
				var str = selected_fields[i].split('.');
				selected_tables.push(str[0]);
				var index = response[0].indexOf(selected_fields[i]);

				$scope.selected_fields.push({tf:response[0][index], table:response[1][index], field:response[2][index]});
				c[index].classList.add("selected");
			}
			selected_tables = selected_tables.filter(onlyUnique);

		}
		$scope.query = function() {
			selected_conditions = [];
			var queryResults = []
			if ($scope.selected_conditions.length == 1 && $scope.selected_conditions[0].field.value == "") window.alert( "Need Conditions!");
			for (let i = 0; i < $scope.selected_conditions.length; i++) {
				selected_conditions.push([$scope.selected_conditions[i].conn, $scope.selected_conditions[i].field, $scope.selected_conditions[i].operator, $scope.selected_conditions[i].content]);
				for (let j = 0; j < selected_tables.length; j++) {
					if (!selected_conditions[i][1].startsWith(selected_tables[j])) {
						selected_tables.push(selected_conditions[i][1].split(".")[0]);
					}
				}
			}

			$scope.orderByField = selected_fields[0];
			$scope.results = [];
			selected_tables = selected_tables.filter(onlyUnique);

			$http({
				method : "POST",
				url : queryUrl, 
				data : JSON.stringify({selected_fields:selected_fields,selected_tables:selected_tables,selected_conditions:selected_conditions}),
				headers : {'Content-Type': 'application/json'}
			}).then(function(data) {
				queryResults = data.data;
				$scope.results = angular.copy(queryResults);
				
				$scope.numberOfPages = function() {
					return Math.ceil($scope.results.length / $scope.pageSize);
				};
				
				// resizeable table column with min with
				

				$('table#table_results').jsdragtable();
				$('#table_results').css('width', 'auto');
				if ($('#table_results').innerWidth() > $('.results').innerWidth()) {
					
					$('#table_results').css('width', $('#table_results').innerWidth()*2);
				} else {
					$('#table_results').css('width', $('#table_results').innerWidth());
				}

			}, function(data) {
				window.alert(data.statusText);
			});

			
		}

	}, function(data) {
		window.alert("GET error");
	});
	$scope.setCurrentPage = function(currentPage) {
	    $scope.currentPage = currentPage;
	}
	$scope.getNumberAsArray = function (num) {
	    return new Array(num);
	};
	$scope.sortBy = function(e, str) {
		if (!e.target.classList.contains('grip')) {
			//window.alert(e.currentTarget);
			if ($scope.orderByField == str) {
				$scope.reverseSort = !$scope.reverseSort;
			}
			$scope.orderByField = str;
		}
			
	}
	$scope.down = function(e) {
		thElm = e.currentTarget.parentElement;
		startOffset = thElm.offsetWidth - e.pageX;

	}
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
	angular.bootstrap(document.getElementById("app2"), ['queryApp']);
	angular.bootstrap(document.getElementById("app3"), ['footerApp']);
})

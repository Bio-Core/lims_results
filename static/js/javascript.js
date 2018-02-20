window.onload = function() {
	var tables = document.getElementsByClassName("tables");
	var cols = document.getElementsByClassName("cols");
	var output = document.getElementById("output");
	var btn_clear = document.getElementById("btn-clear");
	var btn_all = document.getElementById("btn-all");
	var btn_csv = document.getElementById("btn-csv");
	var resultsList = document.getElementById("results-datalist");
	var operatorList = document.getElementById("operator-option");
	var btn_query = document.getElementById("btn-output");
	var btn_save = document.getElementById("btn-save");
	var result_table = document.getElementById("table_results");
	var result_header;
	var result_content = document.getElementsByClassName("table_content");
	// var sql_col = [], table_names = [], col_names = [];
	var selected_fields = [], selected_tables = [], selected_conditions = [];
	var queryResults = [], response = '[{ "patients.dob": "2018-02-05","patients.first_name": "Mitchell2","patients.gender": "male","patients.initials": "PE","patients.mrn": "test","patients.patient_id": "1","patients.sample_id": "1","samples.facility": "test","samples.sample_id": "1","samples.se_num": "1","samples.volume_of_blood_marrow": 12.3},{"patients.dob": "2018-02-05","patients.first_name": "Jane","patients.gender": "f","patients.initials": "A","patients.last_name": "Doe","patients.patient_id": "2","patients.sample_id": "2","samples.facility": "test","samples.sample_id": "2","samples.se_num": "34","samples.tumor_site": "tumor","samples.volume_of_blood_marrow": 1554.9},{"patients.dob": "2018-02-05","patients.first_name": "Jane","patients.gender": "f","patients.initials": "A","patients.last_name": "Doe","patients.patient_id": "2","patients.sample_id": "2","samples.sample_id": "2","samples.se_num": "s"}]';
	var controls, inputs, selects;
	var queryOutput;
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
	var i, j;
	var thElm;
    var startOffset;
    const MIN_WIDTH = 30, MIN_WIDTH_PX = '30px';

    function sortTable(n) {}

	j = 0;
	if (operatorList) {
		for (i = 0; i < operators.length; i++) {
			var option = document.createElement('option');
			option.innerHTML = operators[i];
			operatorList.appendChild(option);
		}
	}

	// Print comma seperated selected fields
	function printFields() {
		var str = "";
		for (i = 0; i < selected_fields.length; i++) {
			str += selected_fields[i] + ", ";
		}
		str = str.substr(0, str.length - 2);
		return str;
	}

	function printTables() {
		var str = "";
		for (i = 0; i < selected_tables.length; i++) {
			str += selected_tables[i] + ", ";
		}
		str = str.substr(0, str.length - 2);
		return str;
	}

	function printConditions() {
		var str = "";
		if (selected_conditions.length == 1 && selected_conditions[0][1] == "") return "Need Conditions!";
		for (i = 0; i < selected_conditions.length; i++) {
			str += selected_conditions[i][0] + " " + selected_conditions[i][1] + selected_conditions[i][2] + "\"" + selected_conditions[i][3] + "\" ";
		}

		str = str.substr(4, str.length - 1);
		return str;
	}

	function sortTable(n) {
		var rows, switching, x, y, shouldSwitch, dir, switchcount = 0;
		switching = true;
		dir = "asc"; 
		while (switching) {
			switching = false;
			if (!result_table) break;
			rows = result_table.getElementsByTagName("TR");

			for (i = 1; i < (rows.length - 1); i++) {
				shouldSwitch = false;
				x = rows[i].getElementsByTagName("TD")[n].innerHTML;
				y = rows[i + 1].getElementsByTagName("TD")[n].innerHTML;
				if (dir == "asc") {
					var ths = document.getElementById("table_results").getElementsByTagName('th');
					for (let j = 0; j < ths.length; j++) {
						ths[j].classList.remove("asc", "desc");
					}
					ths[n].classList.add("asc");
					if (!isNaN(x) && !isNaN(y)) {
						if (Number(x) > Number(y)) {
							shouldSwitch = true;
							break;
						}
					} else {
						if (x.toLowerCase() > y.toLowerCase()) {
							shouldSwitch = true;
							break;
						}
					}
				} else if (dir == "desc") {
					var ths = document.getElementById("table_results").getElementsByTagName('th');
					for (let j = 0; j < ths.length; j++) {
						ths[j].classList.remove("asc", "desc");
					}
					ths[n].classList.add("desc");
					if (!isNaN(x) && !isNaN(y)) {
						if (Number(x) < Number(y)) {
							shouldSwitch = true;
							break;
						}
					} else {
						if (x.toLowerCase() < y.toLowerCase()) {
							shouldSwitch = true;
							break;
						}
					}
				}
			}
			if (shouldSwitch) {
				rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
				switching = true;
				switchcount ++; 
			} else {
				if (switchcount == 0 && dir == "asc") {
					dir = "desc";
					switching = true;
				}
			}
		}
	}

	function initSort() {
		result_header = document.querySelectorAll("table th");
		for (let i = 0; i < result_header.length; i++) {
			result_header[i].onclick = function(event) {
				if (!event.target.classList.contains('grip')) sortTable(i);
			};
		}
	}

	function initGutter() {
		Array.prototype.forEach.call(document.querySelectorAll("table th"), function(th) {
    		th.style.position = 'relative';

	        var grip = document.createElement('div');
	        grip.innerHTML = "";
	        grip.classList.add("grip");
	        grip.style.top = 0;
	        grip.style.right = 0;
	        grip.style.bottom = 0;
	        grip.style.width = '8px';
	        grip.style.right = '0px'
	        grip.style.padding = ' 0 0 0 5px';
	        grip.style.position = 'absolute';
	        grip.style.cursor = 'col-resize';
	        grip.addEventListener('mousedown', function (e) {
	            thElm = th;
	            startOffset = th.offsetWidth - e.pageX;
        	});

        	th.appendChild(grip);	        	
	    });
	}

	function previewResults() {
		for (i = 0; i < selected_fields.length; i++) {
			var th = document.createElement('th');
			result_header = document.getElementById("table_header");
			th.innerHTML = col_names[sql_col.indexOf(selected_fields[i])]; // or selected_fields[i]
			th.style.width = 'auto';
			result_header.appendChild(th);
		}

		// temp. data
		queryResults = queryOutput; // response
		
		for (let j = 0; j < queryResults.length; j++) {
			var tr = document.createElement('tr');
			tr.setAttribute("class", "table_content");
			for (let i = 0; i < selected_fields.length; i++) {
				var td = document.createElement('td');			
				//td.innerHTML = Math.floor(Math.random() * 100); //selected_fields[i]
				if (queryResults[j][selected_fields[i]]) 
					td.innerHTML = queryResults[j][selected_fields[i]];
				tr.appendChild(td);
			}
			result_table.appendChild(tr);
		}
		
		result_table.style.width = result_table.offsetWidth + "px";
		
		//enable sortable table by column
		initSort();
		
		// setup resizing gutter
		initGutter();

	    var ths = document.querySelectorAll("table th");
        for (let i = 0; i < ths.length; i++) {
        	ths[i].style.width = ths[i].offsetWidth + 'px';
        	ths[i].style.minWidth = MIN_WIDTH_PX;
        }

        $(document).ready(function() {
			$('table').jsdragtable();
		})
	}

	function resetResults() {
		result_table.innerHTML = "";
		var header = document.createElement('tr');
		result_header = document.getElementById("table_header");
		header.setAttribute("id", "table_header");
		result_table.appendChild(header);
		result_table.style.width = 'auto';
		queryResults = [];
	}

    // enable download as csv
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

    function exportTableToCSV(filename) {
	    var csv = [];
	    var rows = document.querySelectorAll("table tr");
	    
	    for (var i = 0; i < rows.length; i++) {
	        var row = [], col = rows[i].querySelectorAll("td, th");
	        
	        for (var j = 0; j < col.length; j++) 
	            row.push(col[j].innerText);
	        
	        csv.push(row.join(","));        
	    }

	    // Download CSV file
	    downloadCSV(csv.join("\n"), filename);
	}

	// assign action to add buttons
	$(document).on('click','.btn-add', function() {
		var lastRepeatingGroup = $('.control-condition').last();
	    lastRepeatingGroup.clone().insertAfter(lastRepeatingGroup);
	    
	});

	// assign action to delete buttons
	$(document).on('click', '.btn-delete', function() {
		var conditions = document.getElementsByClassName("control-condition");
		if (conditions.length > 1)
			$(this).parent('.control-condition').remove();
	});

	// Collapse columns at table level
	for (i = 0; i < tables.length; i++) {
		tables[i].addEventListener("click", function() {
			this.classList.toggle("collapse");
		});
	}

	// Toggle selected cols
	for (i = 0; i < cols.length; i++) {
		cols[i].addEventListener("click",function() {
			this.classList.toggle("selected");
			var str = this.parentElement.id + "." + this.innerHTML.toLowerCase().replace(/ /g, '\_').replace('\.', '\_').replace('\/', '\_');
			if (this.classList.contains('selected')) {
				selected_fields.push(str);
				if (selected_tables.indexOf(this.parentElement.id) == -1) selected_tables.push(this.parentElement.id);
			} else {
				if (selected_fields.indexOf(str) > -1)
					selected_fields.splice(selected_fields.indexOf(str), 1);
				for (j = 0; j < selected_tables.length; j++) {
					if (!selected_fields.some(str => str.startsWith(selected_tables[j])))
						selected_tables.splice(j,1);
				}
			}
			output.innerHTML = "SELECT " + printFields() + " FROM " + printTables() + " WHERE (" + printConditions() + ")";
		});
	}

	// Clear selected cols
	if (btn_clear) {
		btn_clear.addEventListener("click",function() {
			for (i = 0; i < cols.length; i++) {
				if (cols[i].classList.contains('selected')) {
					cols[i].classList.toggle("selected");
				}
			}
			selected_fields = [];
			selected_tables = [];
			resetResults();
			output.innerHTML = "SELECT " + printFields() + " FROM " + printTables() + " WHERE (" + printConditions() + ")";
		});
	}

	// generate query and results table
	function postQuery() {
		var proxy = 'https://cors-anywhere.herokuapp.com/';
		$.ajax({
			url: "http://172.27.164.207:8000/Jtree/metadata/0.1.0/query",
			headers: {
				"Access-Control-Allow-Origin":"*"
			},
			type: "POST",
			dataType: 'json',
			data: JSON.stringify({selected_fields:selected_fields,selected_tables:selected_tables,selected_conditions:selected_conditions}),
			contentType: 'application/json',
			success: function(resp) {
				//window.alert("POST array successful");
				queryOutput = resp;
				
				output.innerHTML = "SELECT " + printFields() + " FROM " + printTables() + " WHERE (" + printConditions() + ")";
				resetResults();
				previewResults();
			},
			error: function(jqXhr, textStatus, errorThrown) {
				window.alert(errorThrown);
			}
		});
	}

	if (btn_query) {
		btn_query.addEventListener("click",function() {
			selected_conditions = [], selected_fields = [], selected_tables = [];
			controls = document.getElementsByClassName("control-condition");
			inputs = document.querySelectorAll('input');
			selects = document.querySelectorAll('select');
			// no condition error check
			if (controls.length == 1 && inputs[0].value == "") window.alert( "Need Conditions!");
			for (i = 0; i < controls.length; i++) {
				var a = 2*i, b = a+1;
				selected_conditions.push([selects[a].value, inputs[a].value, selects[b].value, inputs[b].value]);
				switch (selected_conditions[i][2]) {
					case "Equal to":
						selected_conditions[i][2] = "=";
						break;
					case "Not equal to":
						selected_conditions[i][2] = "<>";
						break;
					case "Greater than":
						selected_conditions[i][2] = ">";
						break;
					case "Less than":
						selected_conditions[i][2] = "<";
						break;
					case "Greater or equal to":
						selected_conditions[i][2] = ">=";
						break;
					case "Less or equal to":
						selected_conditions[i][2] = "<=";
						break;
					case "Begins with":
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] += "\%";
						break;
					case "Not begins with":
						selected_conditions[i][0] += " NOT"
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] += "\%";
						break;
					case "Ends with":
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] = "\%" + selected_conditions[i][3];
						break;
					case "Not ends with":
						selected_conditions[i][0] += " NOT"
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] = "\%" + selected_conditions[i][3];
						break;
					case "Contains":
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] = "\%" + selected_conditions[i][3] + "\%";
						break;
					case "Not contains":
						selected_conditions[i][0] += " NOT"
						selected_conditions[i][2] = " LIKE ";
						selected_conditions[i][3] = "\%" + selected_conditions[i][3] + "\%";
						break;
				}
			}
			$.each($(".selected"), function(ind, val) {
				var str = this.parentElement.id + "." + this.innerHTML.toLowerCase().replace(/ /g, '\_').replace('\.', '\_').replace('\/', '\_');
				if (this.classList.contains('selected')) {
					selected_fields.push(str);
					if (selected_tables.indexOf(this.parentElement.id) == -1) selected_tables.push(this.parentElement.id);
				} else {
					if (selected_fields.indexOf(str) > -1)
						selected_fields.splice(selected_fields.indexOf(str), 1);
					for (j = 0; j < selected_tables.length; j++) {
						if (!selected_fields.some(str => str.startsWith(selected_tables[j])))
							selected_tables.splice(j,1);
					}
				}
			});
			postQuery();
		});
	}

	// select all fields
	if (btn_all) {
		btn_all.addEventListener("click",function() {
			selected_fields = sql_col;
			selected_tables = table_names;
			for (i = 0; i < cols.length; i++) {
				if (!cols[i].classList.contains('selected')) {
					cols[i].classList.toggle("selected");
				}
			}
			btn_query.click();
		});
	}

	if (btn_csv) {
		btn_csv.addEventListener("click",function() {
			exportTableToCSV("results.csv");
		});
	}

	// need to come back
	if (btn_save) {
		btn_save.addEventListener("click", function() {
			event.preventDefault();
			if (selected_fields.length == 0 || selected_tables.length == 0 || selected_conditions[0][1] == "") {
				window.alert("Query conditions not met");
			} else {
				$.ajax({
					url: "query-profile",
					type: "POST",
					dataType: 'JSON',
					data: JSON.stringify({selected_fields:selected_fields,selected_tables:selected_tables,selected_conditions:selected_conditions}),
					contentType: 'application/json',
					success: function(resp) {
						window.alert("resp");
					},
					error: function(jqXhr, textStatus, errorThrown) {
						window.alert(errorThrown);
					}
				});
			}
		});
	}

	// resizeable table column with min with
    document.addEventListener('mousemove', function(e) {
		if (thElm) {
			thElm.style.width = startOffset + e.pageX + 'px';
			if (thElm.offsetWidth < MIN_WIDTH)
				thElm.style.width = MIN_WIDTH_PX;
			if (e.target.classList.contains("before")) {
				$('#table_results th:after').hide();
			}
			var ths = document.querySelectorAll("table#table_results th"), w = 0;
	        for (let i = 0; i < ths.length; i++) {
	        	w += ths[i].offsetWidth;
	        }
	        result_table.style.width = w + 'px';
		}
    });

    document.addEventListener('mouseup', function() {
        thElm = undefined;
    });

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

		                $(this.container).off("mousemove touchmove");
		                $(".jsdragtable-contents").remove();
		                $('#table_header th').removeClass('hovered after before');
		                this.draggableContainer = null;
		                this.selectedHeader = null;
		                this.rebind();
		            }
		            initSort();
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

	$(document).ready(function() {
		$('table').jsdragtable();
	})

}

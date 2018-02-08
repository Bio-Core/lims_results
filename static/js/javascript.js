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
	var result_table = document.getElementById("table_results");
	var result_header;
	var result_content = document.getElementsByClassName("table_content");
	var sql_col = [], table_names = [], col_names = [];
	var selected_fields = [], selected_tables = [], selected_conditions = [];
	var controls, inputs, selects;
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
    const MIN_WIDTH = 15, MIN_WIDTH_PX = '15px';

    function sortTable(n) {}

	j = 0;
	for (i = 0; i < tables.length; i++) {
		table_names.push(tables[i].childNodes[0].innerHTML);
		table_names[i] = table_names[i].substr(0, table_names[i].length - 7).replace(/ /g, '\_').toLowerCase();
		tables[i].setAttribute("id", table_names[i]);
		$("#" + table_names[i]).next().children().attr("id", table_names[i]);
	}

	// Autocomplete with existing cols
	for (i = 0; i < cols.length; i++) {
		col_names.push(cols[i].innerHTML);
		var option = document.createElement('option');
		sql_col[i] = cols[i].parentElement.id + "." + col_names[i].toLowerCase().replace(/ /g, '\_').replace('\.', '\_').replace('\/', '\_');
		option.value = sql_col[i];
		resultsList.appendChild(option);
	}

	// Autocomplete query operators
	for (i = 0; i < operators.length; i++) {
		var option = document.createElement('option');
		option.innerHTML = operators[i];
		operatorList.appendChild(option);
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

	function previewResults() {
		for (i = 0; i < selected_fields.length; i++) {
			var th = document.createElement('th');
			result_header = document.getElementById("table_header");
			th.innerHTML = col_names[sql_col.indexOf(selected_fields[i])]; // or selected_fields[i]
			th.style.width = 'auto';
			result_header.appendChild(th);
		}
		
		// temp. data
		for (j = 0; j < 3; j++) {
			var tr = document.createElement('tr');
			tr.setAttribute("class", "table_content");
			for (i = 0; i < selected_fields.length; i++) {
				var td = document.createElement('td');			
				td.innerHTML = Math.floor(Math.random() * 100); //selected_fields[i]
				tr.appendChild(td);
			}
			result_table.appendChild(tr);
		}
		
		result_table.style.width = result_table.offsetWidth + "px";
		//enable sortable table by column
		function sortTable(n) {
			var rows, switching, x, y, shouldSwitch, dir, switchcount = 0;
			switching = true;
			dir = "asc"; 
			while (switching) {
				switching = false;
				rows = result_table.getElementsByTagName("TR");

				for (i = 1; i < (rows.length - 1); i++) {
					shouldSwitch = false;
					x = rows[i].getElementsByTagName("TD")[n].innerHTML;
					y = rows[i + 1].getElementsByTagName("TD")[n].innerHTML;
					if (dir == "asc") {
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

		result_header = document.querySelectorAll("table th");
		for (let i = 0; i < result_header.length; i++) {
			result_header[i].addEventListener("click", function() {
				sortTable(i);
			});
		}
		
		// setup resizing gutter
		Array.prototype.forEach.call(document.querySelectorAll("table th"), function(th) {
    		th.style.position = 'relative';

	        var grip = document.createElement('div');
	        grip.innerHTML = "";
	        grip.style.top = 0;
	        grip.style.right = 0;
	        grip.style.bottom = 0;
	        grip.style.width = '8px';
	        grip.style.right='-3px'
	        grip.style.position = 'absolute';
	        grip.style.cursor = 'col-resize';
	        grip.addEventListener('mousedown', function (e) {
	            thElm = th;
	            startOffset = th.offsetWidth - e.pageX;
        	});

        	th.appendChild(grip);
	    });

	}

	function resetResults() {
		result_table.innerHTML = "";
		var header = document.createElement('tr');
		result_header = document.getElementById("table_header");
		header.setAttribute("id", "table_header");
		result_table.appendChild(header);
		result_table.style.width = 'auto';
	}

    // enable download as csv
    function downloadCSV(csv, filename) {
    	var csvFile;
	    var downloadLink;

	    // CSV file
	    csvFile = new Blob([csv], {type: "text/csv"});

	    // Download link
	    downloadLink = document.createElement("a");

	    // File name
	    downloadLink.download = filename;

	    // Create a link to the file
	    downloadLink.href = window.URL.createObjectURL(csvFile);

	    // Hide download link
	    downloadLink.style.display = "none";

	    // Add the link to DOM
	    document.body.appendChild(downloadLink);

	    // Click download link
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
	if (btn_query) {
		btn_query.addEventListener("click",function() {
			selected_conditions = [];
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

			output.innerHTML = "SELECT " + printFields() + " FROM " + printTables() + " WHERE (" + printConditions() + ")";
			resetResults();
			previewResults();
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

	// resizeable table column with min with
    document.addEventListener('mousemove', function(e) {
		if (thElm) {
			thElm.style.width = startOffset + e.pageX + 'px';
			if (thElm.offsetWidth < MIN_WIDTH) thElm.style.width = MIN_WIDTH_PX;
			if ((thElm.style.width + MIN_WIDTH) >= result_table.style.width) 
				result_table.style.width = (2*thElm.offsetWidth - result_table.offsetWidth + MIN_WIDTH) + 'px';
		}
    });

    document.addEventListener('mouseup', function() {
        if (thElm && (result_table.style.width <= (thElm.style.width + MIN_WIDTH))) 
        	result_table.style.width = (2*thElm.offsetWidth - result_table.offsetWidth + MIN_WIDTH) + 'px';
        thElm = undefined;
    });

}

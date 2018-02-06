<!DOCTYPE html>
<html>
<head>
	<title>Query Builder</title>
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" type="text/css" href="/static/css/style.css">
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js"></script>
  	<script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>
	<script type="text/javascript" src="/static/js/javascript.js"></script>
</head>
<body>
	<h1 style="width: 30vw;position: fixed;top: 0;"><?php echo "Query Builder" ?></h1>
	<p id="output" style="width:fit-content;max-width:75vw;position:relative;left:20vw;height:5vh;">Output: </p>
	<button id="btn-all" style="position: relative;">All Fields</button>
	<button id="btn-output" style="position: relative;">Query</button>
	<button id="btn-clear" style="position: relative;">Clear</button>
	<button id="btn-csv" style="position: relative;">Download as .csv</button>

	<section class="query-container">
		<section class="fields">
			<li class="tables"><a>Patients Fields</a></li>
			<ul>
				<li><a class="cols">First Name</a></li>
				<li><a class="cols">Last Name</a></li>
				<li><a class="cols">Sequenom</a></li>
				<li><a class="cols">Patient ID</a></li>
				<li><a class="cols">Gender</a></li>
				<li><a class="cols">MRN</a></li>
			</ul>
			<li class="tables"><a>Samples Fields</a></li>
			<ul>
				<li><a class="cols">Sample ID</a></li>
				<li><a class="cols">Sequenom</a></li>
				<li><a class="cols">Sample Type</a></li>
				<li><a class="cols">DNA Sample Barcode</a></li>
				<li><a class="cols">DNA Extraction Date</a></li>
				<li><a class="cols">DNA Concentration</a></li>
				<li><a class="cols">DNA Quality</a></li>
			</ul>
			<li class="tables"><a>Tests Fields</a></li>
			<ul>
				<li><a class="cols">Test ID</a></li>
				<li><a class="cols">Panel/Assay Screened</a></li>
				<li><a class="cols">Test Date</a></li>
				<li><a class="cols">PCR</a></li>
				<li><a class="cols">Sample ID</a></li>
			</ul>
			<li class="tables"><a>Results Fields</a></li>
			<ul>
				<li><a class="cols">Results ID</a></li>
				<li><a class="cols">PCR</a></li>
				<li><a class="cols">Sample ID</a></li>
				<li><a class="cols">Failed Regions</a></li>
				<li><a class="cols">Variant</a></li>
				<li><a class="cols">Verification PCR</a></li>
				<li><a class="cols">MLPA PCR</a></li>
			</ul>
			<li class="tables"><a>Result Details Fields</a></li>
			<ul>
				<li><a class="cols">Results ID</a></li>
				<li><a class="cols">PCR</a></li>
				<li><a class="cols">Sample ID</a></li>
				<li><a class="cols">Gene</a></li>
				<li><a class="cols">Exon</a></li>
				<li><a class="cols">P.nomenclature</a></li>
				<li><a class="cols">C.nomenclature</a></li>
				<li><a class="cols">Risk Score</a></li>
			</ul>
			

		</section>
		<section class="controls">
			<article class="control-condition" id="control-0">
				<label>Field: </label>
				<select id="control-logic">
					<option>AND</option>
					<option>OR</option>
				</select>
				<input id="control-field" list="results-datalist">
				<datalist id="results-datalist"></datalist>
				<select id="operator-option"></select>
				<input id="control-input">
				<button class="btn-add">Add</button>
				<button class="btn-delete">Delete</button>
			</article>
			
		</section>
		<div class="results">
			<table id="table_results">
				<tr id="table_header"></tr>
			</table>

		</div>
	</section>

</body>
</html>

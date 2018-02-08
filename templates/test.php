<html>
<head>
	<title>PHP Test</title>
</head>
<body>
	<h1>PHP Test</h1>
	<p>
	<?php 
		$fields = $_POST["selected_fields"];
		$tables = $_POST["selected_tables"];
		$conditions = $_POST["selected_conditions"];
		echo sizeof($fields) . " " . sizeof($tables) . " " . sizeof($conditions);
	?>
	</p>
</body>
	
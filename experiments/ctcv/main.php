<?php

	//Create a database connection
	//$connection = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g","vXq37JTQc4J22R9uIITd");
	$connection = mysql_connect("data.gureckislab.org","gureckislab_turk","cpa-rq3-Wmc-UdT");
	
	if (!$connection)
	{
		die("Database connection failed: " . mysql_error());
	}

	// Select a database to use
	$db_select = mysql_select_db("gureckislab_psiturk_data", $connection);
	
	if (!$db_select)
	{
		die("Database connection failed: " . mysql_error());
	}

	
	// Get values passed from JAVASCRIPT
	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	$x_data = $_POST['x_data'];
	$y_data = $_POST['x_data'];
	$z_data = $_POST['x_data'];


	$query = "INSERT INTO ctcv_demo (ip, date, events, beliefs, trials, extras, feedback) VALUES ('{$ip}', '{$date}', '{$x_data}', '{$y_data}', '{$z_data}')";
	mysql_query($query, $connection);


	// Close connection
	mysql_close($connection);

?>
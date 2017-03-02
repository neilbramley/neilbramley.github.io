<?php

	// Create a database connection


	$connection = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g","vXq37JTQc4J22R9uIITd");//1Ammooi9


	
	if (!$connection)

	{

		die("Database connection failed: " . mysql_error());

	}

	// Select a database to use
	$db_select = mysql_select_db("ucjtw3g", $connection);

	
	if (!$db_select)

	{

		die("Database connection failed: " . mysql_error());

	}

	
	// Get values passed from Flash
	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	$data = $_POST['main'];
	$extra = $_POST['extra'];
	$feedback = $_POST['feedback'];

	$query = "INSERT INTO neil_acl3_third_run (ip, date, data, extra, feedback) VALUES ('{$ip}', '{$date}', '{$data}', '{$extra}', '{$feedback}')";
	mysql_query($query, $connection);


	// Close connection
	mysql_close($connection);

?>





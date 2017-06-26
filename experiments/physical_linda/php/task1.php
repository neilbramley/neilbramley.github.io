<?php

	// Create a database connection
	$connection = mysql_connect("warehouse.cims.nyu.edu","bramley","qmg7rdj5");//
	
	if (!$connection)

	{
		die("Database connection failed: " . mysql_error());
	}

	// Select a database to use
	$db_select = mysql_select_db("bramley_neil", $connection);

	
	if (!$db_select)

	{
		die("Database connection failed: " . mysql_error());
	}

	
	// Get values passed from Flash
	$ip = $_SERVER['REMOTE_ADDR'];
	$date = date('Y-m-d');
	$upi = $_POST['upi'];
	$trial = $_POST['trial'];

	$query = "INSERT INTO p_linda1 (ip, date, upi, trial) VALUES ('{$ip}', '{$date}', '{$upi}', '{$trial}')";
	mysql_query($query, $connection);


	// Close connection
	mysql_close($connection);

?>
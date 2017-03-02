<?php
	// Create a database connection
	$connection = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g","1Ammooi9");
	
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
	$groupID = $_POST['groupID'];
	$data = $_POST['answers'];
	$extra = $_POST['extra'];
	$feedback = $_POST['feedback'];
	$participantID = $_POST['participantID'];
	
	//transforms string into integer 
	$participantID = (int) $participantID;
	
	// Add to subjects list
	$query = "UPDATE cati_1 SET ip = '{$ip}', date = '{$date}', groupID = '{$groupID}', data = '{$data}', extra = '{$extra}', feedback = '{$feedback}'  WHERE id = $participantID";

	mysql_query($query, $connection);	 

	// Close connection
	mysql_close($connection);

?>



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
		
	$result = mysql_query("SELECT groupID FROM cati_1");
	$storeArray = Array();
	while ($row = mysql_fetch_array($result, MYSQL_BOTH)) { 
		$storeArray[] =  $row['groupID'];
	}
	//print($storeArray);
	
	$number_per_group = Array();
	$number_per_group = array_count_values($storeArray);

	$n_group1 = $number_per_group['1'];
	$n_group2 = $number_per_group['2'];
	$n_group3 = $number_per_group['3'];
	$n_group4 = $number_per_group['4'];
	$n_group5 = $number_per_group['5'];
	
	$n_min = min($n_group1, $n_group2, $n_group3, $n_group4, $n_group5)+1;

	if($n_group1 < $n_min){
		$group_id = 1;		
	}
	elseif($n_group2 < $n_min){
		$group_id = 2;
	}
	elseif($n_group3 < $n_min){
		$group_id = 3;
	}
	elseif($n_group4 < $n_min){
		$group_id = 4;
	}
	elseif($n_group5 < $n_min){
		$group_id = 5;
	}
	
	//inserts group ID into the table 
	$query = "INSERT INTO cati_1 (groupID) VALUES ('{$group_id}')";	
	mysql_query($query, $connection);
	
	//gets the row index 
	$participant_id = mysql_insert_id();
	
	//passes both the group ID as well as the row index to flash 
	echo "group_id" . "=" . urlencode($group_id) . "&" . "participant_id" . "=" . urlencode($participant_id);	
	
	mysql_close($connection);

?>



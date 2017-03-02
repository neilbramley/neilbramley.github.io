<?php

//Connection with the data base 
$link = mysql_connect("mysql-server.ucl.ac.uk","ucjtw3g","1Ammooi9");
mysql_select_db("ucjtw3g", $link);

$ip_address = gethostbyname($_SERVER['REMOTE_ADDR']);
// $ip_address = "18.111.62.18";

//slashes added for escaping
$ip_address = addslashes($ip_address);


$query = "(SELECT 'ip' FROM cati_1 WHERE cati_1.ip ='$ip_address') 
UNION (SELECT 'ip' FROM cati_2 WHERE cati_2.ip ='$ip_address')
UNION (SELECT 'ip' FROM cati_3 WHERE cati_3.ip ='$ip_address')
UNION (SELECT 'ip' FROM cati_4 WHERE cati_4.ip ='$ip_address')
UNION (SELECT 'ip' FROM cati_4a WHERE cati_4a.ip ='$ip_address')
UNION (SELECT 'ip' FROM cati_5 WHERE cati_5.ip ='$ip_address')
";


$result = mysql_query($query, $link) or die ("Something went wrong!");

$num_result = mysql_num_rows($result);

if ($num_result > 0){
	// echo("You've done this before") ;
	echo(1);
}
else{
	// echo("you can do it!");
	echo(0);
}

?>


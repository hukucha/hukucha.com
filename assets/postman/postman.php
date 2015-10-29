<?php

function readfile_chunked($filename,$type='array') {
	$chunk_array=array();
	$chunksize = 1*(1024*1024); // How many bytes per chunk
	$buffer = '';
	$handle = fopen($filename, 'rb');
	if ($handle === false)
	{
		return false;
	}
	while (!feof($handle))
	{
		switch($type)
		{
		case'array':
			// Returns Lines Array like file()
			$lines[] = fgets($handle, $chunksize);
		break;
			case'string':
			// Returns Lines String like file_get_contents()
			$lines = fread($handle, $chunksize);
		break;
		}
	}
	fclose($handle);
	return $lines;
} 
	
function getTemplateContent($template) {
	$message = readfile_chunked("templates/$template","string")."\r\n";
	foreach ($_POST as $var => $value)
	{
		$message = str_replace("{".$var."}",$value,$message);
	} 
	$today = date("d.m.Y");
	$message = str_replace("{date}",$today,$message);
	return $message;
}
	
function getTemplateContentWithReplace($template) {
	// Define the body of the message.
	$message="";

	// HTML text
	$message.=readfile_chunked("templates/$template","string")."\r\n";
		
	foreach ($_POST as $var => $value)
	{
		$message = str_replace("{".$var."}",$value,$message);
	} 
	$today = date("d.m.Y");
	$message = str_replace("{date}",$today,$message);
	$toWrite = "";
	// Replace items
	if (isset($_COOKIE["email"]))
	{
	$tempTable = $_COOKIE["email"];
	$tempTable = explode("!%!",$tempTable);
	}	

	return $message;
}
	
function sendMail($to,$from_email,$subject,$template) {
	// Define the headers we want passed. Note that they are separated with \n ONLY
	$headers = 'MIME-Version: 1.0' . "\n";
	$headers .= 'Content-type: text/html; charset=utf-8' . "\n";
	$headers .= "From: $from_email\nReply-To: $from_email\n";

	// Define the body of the message.
	$message="";

	// HTML text
	$message.=readfile_chunked("templates/$template","string")."\r\n";
		
	foreach ($_POST as $var => $value)
	{
		$message = str_replace("{".$var."}",$value,$message);
	} 
	$today = date("d.m.Y");
	$message = str_replace("{date}",$today,$message);
	$toWrite = "";
	// Replace items
	if (isset($_COOKIE["email"]))
	{
	$tempTable = $_COOKIE["email"];
	$tempTable = explode("!%!",$tempTable);
	}	
	
	ini_set("sendmail_from","$from_email");
	$mail_sent = mail( $to, $subject, $message, $headers );
}
	
function createFile($name) {
	$File = "emails/$name.html";
	$Handle = fopen($File, 'w');
	$Data = getTemplateContentWithReplace("hukucha.html");
	fwrite($Handle, $Data);
	fclose($Handle); 
}
	
// 1 - Write email in folder /emails for backup; don't forget to chmod 777 emails
	$today = date("Y_m_d_His"); 
	$writefile = $today;
	createFile($writefile);

// 2 - Send email to customer using fields: to, from, subject, template
//	sendMail($_POST["email"],"j@hukucha.com",$_POST["subject"],"template.html");

// 3 - Send email to hukucha using fields: to, from, subject, template
	sendMail("j@hukucha.com",$_POST["email"],"Message du site web","hukucha.html");

// 4 - Display this page once email is sent
    header("Location: ".$_SERVER['HTTP_REFERER']."#contact");
?>
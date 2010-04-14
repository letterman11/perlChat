#!/usr/bin/perl -wT


use strict;
use lib "/home/abrooks/www/chatterBox/script_src";
use GenStatus;
use Error;
use GenError;
use Util;
use DbConfig;
use CGI qw /:standard/;
use CGI::Carp;
use DBI;
require '/home/abrooks/www/chatterBox/cgi-bin/config.pl';

$CGI::POST_MAX=1024 * 10;  # max 10K posts
$CGI::DISABLE_UPLOADS = 1;  # no uploads
 
my $query = new CGI;
my $callObj =  Util::formValidation($query);

if (ref $callObj eq 'Error') {

	print $query->header(-status=>'451 Invalid Form Submission'
				);
	
} else {

	my $sqlHash = $callObj;

	my $dbconf = DbConfig->new();

	my $insert_sql_str = "INSERT INTO user VALUES ('$sqlHash->{userName}','$sqlHash->{userName}','$sqlHash->{password}'," 
					. "'$sqlHash->{firstName}','$sqlHash->{lastName}','$sqlHash->{address1}','$sqlHash->{address2}',"
					. "'$sqlHash->{zipcode}','$sqlHash->{phone}','$sqlHash->{email}','$sqlHash->{state}','$sqlHash->{city}')";


	carp ("$insert_sql_str");

	my $dbh = DBI->connect( "dbi:mysql:"
	                . $dbconf->dbName() . ":"
	                . $dbconf->dbHost(),
	                  $dbconf->dbUser(),
	                  $dbconf->dbPass(), $::attr )
			  or GenError->new(Error->new(102))->display();
               
	eval {
	
		my $sth = $dbh->prepare($insert_sql_str);
	
		$sth->execute();

		$dbh->disconnect();

	};

	if ($@) 
	{
		print $query->header(-status=>'452 Application Error'
						);
	}
	else
	{
		print $query->header(-status=>'200 Registration Successful'
					);
	}

}

exit;





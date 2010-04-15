#!/usr/bin/perl -wT

use strict;
use lib "/home/abrooks/www/chatterBox/script_src";
use Util;
use DbConfig;
use CGI qw /:standard/;
use CGI::Cookie;
use CGI::Carp;
use CGI::Carp qw(fatalsToBrowser);
use DBI;
require '/home/abrooks/www/chatterBox/cgi-bin/config.pl';

$CGI::POST_MAX=1024 * 10;  # max 10K posts
$CGI::DISABLE_UPLOADS = 1;  # no uploads

my $query = new CGI;
my $initSessionObject = Util::validateSession();


if (ref $initSessionObject eq 'SessionObject')  
{
	#TO DO: Restructure handling of db login failure
	my $dbconf = DbConfig->new();
	my $dbh = DBI->connect( "dbi:mysql:"  
			. $dbconf->dbName() . ":"
			. $dbconf->dbHost(), 
			$dbconf->dbUser(), 
			$dbconf->dbPass(), $::attr )
	        	or die "Cannot Connect to Database $DBI::errstr\n";
	
	my $sqlstr = ();
	my $sth = ();	
	my $room_array = ();
	my $row_count = ();

	if($query->param('req') eq 'roomIDs')
	{
		$sqlstr = "select room_id from chat_room";
		
		eval {		

			my $sth = $dbh->prepare($sqlstr);

			$sth->execute();

			$room_array = $sth->fetchall_arrayref;	
			

			$sth->finish();
			
			$dbh->disconnect();

		};	

		if($@) 
		{
			print $query->header(-status=>'452 Application Error'
						);	
		}	
		else
		{
			#JSON creation of room IDs

			my $js_room_array = " [ ";
			my $i = ();

			for($i=0; $i < scalar(@{$room_array})-1; $i++) 
			{
				$js_room_array .=  "'" . @{$room_array}[$i]->[0] ."', ";
			}

			$js_room_array .=  "'" . @{$room_array}[$i]->[0] . "' ]; ";
			
			print $query->header(-status=>200,
					     -Content_Type=>'text/javascript'
						);
			print $js_room_array;

		}
		
	}
	elsif($query->param('req') eq 'roomLogin')
	{
		my $userID = $query->param('userID');
		my $roomID = $query->param('roomID');
		
		$sqlstr = "insert into user_cr values ( '$userID', '$roomID', NOW(), '$roomID')";

		carp("INSERT $sqlstr");

			eval {
				my $sth = $dbh->prepare($sqlstr);
				
				$sth->execute();

				$sth->finish();

				$dbh->disconnect();

			};
		
			if($@) 
			{
				print $query->header(-status=>'452 Application Error'
							);	
			}
			else
			{
				
				print $query->header(-status=>'200 OK'
							);
				print "Room Login Successful";

			}

	}
	elsif($query->param('req') eq 'roomLogout')
	{

		my $userID = $query->param('userID');
		my $roomID = $query->param('roomID');

		$sqlstr = "delete from user_cr where user_id = '$userID'";

		carp("DELETE $sqlstr");

		eval {
			my $sth = $dbh->prepare($sqlstr);
			
			$sth->execute();

			$sth->finish();

			$dbh->disconnect();
		};
	
		if($@) 
		{
			print $query->header(-status=>'452 Application Error'
						);	
		}
		else
		{
			print $query->header(-status=>'200 OK'
						);
			print "Room Logout Successful";
		}

	}
	
} 
else
{
	print $query->header(-status=>'453 Invalid Session',
				);
}

exit;

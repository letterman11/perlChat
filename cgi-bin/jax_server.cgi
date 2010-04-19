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
	my $sqlstr2 = ();
	my $sth = ();	
	my $room_array = ();
	my $row_count = ();
	my $msg_user_array = ();

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
			my $i = 0;
			$js_room_array .= "'" . @{$room_array}[$i]->[0] . "'";
			
			for(++$i; $i < scalar(@{$room_array}); $i++) 
			{
				$js_room_array .=  ", '" . @{$room_array}[$i]->[0] ."'";
			}

			$js_room_array .=  " ]; ";
			
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

			};
		
			if($@) 
			{
				print $query->header(-status=>'452 Application Error'
							);	
			}
			else
			{

				$sqlstr2 = "select user_id from user_cr where room_id = '$roomID'";		

				carp("SELECT $sqlstr2");
		
					eval {
						$sth = $dbh->prepare($sqlstr2);
						
						$sth->execute();
		
						$msg_user_array = $sth->fetchall_arrayref;	

						$sth->finish();
		
						$dbh->disconnect();
		
					};
				
					if($@) 
					{
						print $query->header(-status=>'452 Application Error2'
							);	
					}
					else
					{	

						if (scalar(@{$msg_user_array}) > 1) 
						{

							my $js_msg_user_array = " [ ";
							my $i = 0;

							$js_msg_user_array .= "'" . @{$msg_user_array}[$i]->[0] . "'"; 
				
							for(++$i; $i < scalar(@{$msg_user_array}); $i++) 
							{
								$js_msg_user_array .=  ", '" . @{$msg_user_array}[$i]->[0] ."'";
							}
		
							 $js_msg_user_array .= " ]; ";
	
							print $query->header(-status=>'200 OK',
						     				-Content_Type=>'text/javascript'
								);
							
							print $js_msg_user_array;
	
						}
						else
						{
							print $query->header(-status=>'200 OK'
										);
						}

					}
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
	elsif($query->param('req') eq 'sendMsg')
	{
		my $userID = $query->param('userID');
		my $roomID = $query->param('roomID');
		my $msgText = $query->param('msgText');	
		my @error_queue = ();

		$sqlstr = "select user_id from user_cr where room_id = '$roomID'";		

		carp("SELECT $sqlstr");

		eval {
			$sth = $dbh->prepare($sqlstr);
				
			$sth->execute();
		
			$msg_user_array = $sth->fetchall_arrayref;	

			$sth->finish();
		
		};

		if($@) 
		{
			print $query->header(-status=>'452 Application Error'
						);	
		}
		else
		{

			for my $msg_user_id (@{$msg_user_array})
			{

				eval {

					$sqlstr2 = "insert into chat_room_queue (user_id, room_id, insert_ts, chat_text, msg_user_id) "
						 . "values ( '$userID', '$roomID', NOW(), " . $dbh->quote($msgText) . ","
						 . "'" . $msg_user_id->[0] . "' )";
  
					$sth = $dbh->prepare($sqlstr2);
				
					$sth->execute();
		
					$sth->finish();

				};

				if($@) 
				{
	
					push @error_queue, $msg_user_id->[0];	
				}
				
				carp("INSERT $sqlstr2");
				carp("DB ERROR: $@\n") if ($@);
			}

			$dbh->disconnect();

			if(scalar(@error_queue) == scalar(@{$msg_user_array}))
			{
				print $query->header(-status=>'452 Application Error: All MSG Failed'
							);
			}
			elsif(scalar(@error_queue) == 0)
			{
				print $query->header(-status=>'200 OK'
					);
			}
			else
			{
				print $query->header(-status=>'200 OK'
					);

				print "MSG Failed for \n";

				for my $user_id (@error_queue)
				{
					print "$user_id \n";
				}
			}
		}

	}
	
} 
else
{
	print $query->header(-status=>'453 Invalid Session',
				);
}

exit;

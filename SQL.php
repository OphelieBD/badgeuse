<?php

include_once "config.php"; //on inclue le fichier contenant les paramètres de connexion

	global $BDD_host;     //défini dans config.php
	global $BDD_base;     //défini dans config.php
	global $BDD_user;     //défini dans config.php
	global $BDD_password; //défini dans config.php
	$bdd = new PDO("mysql:host=".$BDD_host.";dbname=".$BDD_base, $BDD_user, $BDD_password);//construction de la requete
	
function getBdd()
{
	return $bdd;
}

function SQLEdit($sql)//SQLUpdate   ;   SDLDelete   -> ne renvoit rien
{
	try
	{
		global $bdd;
		$bdd->exec($sql);//exécution de la requete
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}
}

function SQLEditWithParams($sql, $params)//SQLUpdate   ;   SDLDelete   -> ne renvoit rien
{
	try
	{
		global $bdd;
		$requete = $bdd->prepare($sql);//exécution de la requete
		$requete->execute($params);
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}
}

function SQLSelect($sql)//renvoit un tableau associatif des réponses
{	
	try
	{
		global $bdd;
		$reponse = $bdd->query($sql);//exécution de la requete

		if($reponse != NULL){
			while ($ligne = $reponse->fetch(PDO::FETCH_ASSOC)) //construction du tableau des réponses
				$tab[]= $ligne;
			$reponse->closeCursor();//termine le requete
		}
		else
			$tab=[];
		
		if(isset($tab))
			return $tab; //renvoit un tableau associatif des réponses
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
		return false;
	}
}

function SQLSelectWithParams($sql, $params)//renvoit un tableau associatif des réponses
{	
	try
	{
		global $bdd;
		$requete = $bdd->prepare($sql);//exécution de la requete
		$requete->execute($params);

		if($requete != NULL){
			while ($ligne = $requete->fetch()) //construction du tableau des réponses
				$tab[]= $ligne;
			$requete->closeCursor();//termine le requete
		}
		else
			$tab=[];
		
		if(isset($tab))
			return $tab; //renvoit un tableau associatif des réponses
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
		return false;
	}
}

function SQLInsert($sql)// renvoit l'id de l'élément que l'on vient d'insérer
{
	try
	{
		global $bdd;

		$bdd->exec($sql);//exécution de la requete
		return $bdd->lastInsertId(); // renvoit l'id de l'élément que l'on vient d'insérer
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}
}

function SQLInsertWithParams($sql, $params)// renvoit l'id de l'élément que l'on vient d'insérer
{
	try
	{
		global $bdd;
		$requete = $bdd->prepare($sql);//exécution de la requete
		$requete->execute($params);
		
		return $bdd->lastInsertId(); // renvoit l'id de l'élément que l'on vient d'insérer
	}
	catch (Exception $e)
	{
		die('Erreur : ' . $e->getMessage());
	}
}

function dateSQL($date)
{
	if( strstr($date, '-'))
	{
		return $date;
	}
	else
	{
		$elements = explode('/', $date);
		$formatSQL = $elements[2]."-".$elements[0]."-".$elements[1];
		return $formatSQL;
	}
}

function dateAndroidversSQL($date)
{
	if( strstr($date, '-'))
	{
		return $date;
	}
	else
	{
		$elements = explode('/', $date);
		$formatSQL = $elements[2]."-".$elements[1]."-".$elements[0];
		return $formatSQL;
	}
}

function dateHTML($date)
{
	if( strstr($date, '/'))
	{
		return $date;
	}
	else
	{
		$elements = explode('-', $date);
		$formatSQL = $elements[2]."/".$elements[1]."/".$elements[0];
		return $formatSQL;
	}
}

?>

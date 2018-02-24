<?php 

	include_once('SQL.php');

	if (isset($_GET['action'])) //Si utilisation de $_GET
	{
		switch ($_GET['action']) 
		{
			case 'planning':
				affichagePlanning();
			break;
		}
	}
	
	if (isset($_POST['action'])) //Si utilisation de $_POST
	{
		switch ($_POST['action']) 
		{
			case 'insertionHoraires': 
				if (isset($_POST['heureDebut']) && isset($_POST['heureFin'])) 
				{
					insertionHoraires($_POST['heureDebut'], $_POST['heureFin'], $_POST['jourClique']);
				}
			break;

			case 'ajouterAuto': 
				if (isset($_POST['dateJour']) && isset($_POST['heureDebut'])) 
				{
					insertionAuto($_POST['dateJour'], $_POST['heureDebut']);
				}
			break;

			case 'ajouterFinAuto': 
				if (isset($_POST['heureFin'])) 
				{
					insertionFinAuto($_POST['heureFin']);
				}
			break;
		}
	}

	function affichagePlanning() //Renvoie la liste des évènements présents en BDD
	{
		$resultatHoraires = SQLSelect("SELECT * FROM badge");
		echo json_encode($resultatHoraires);	
	}

	//insertion des heures en BDD avec les paramètres rentrés dans le form, le jour cliqué + le total d'h
	function insertionHoraires($heuredebut, $heurefin, $jour)
	{ 
		$envoiHoraires = SQLInsertWithParams(
		"INSERT INTO badge(date, heureDebut, heureFin) VALUES (:date, :heureDebut, :heureFin)", 
		array("date"=>$jour, "heureDebut"=>"$heuredebut", "heureFin"=>$heurefin)
		);
		echo json_encode($envoiHoraires);
	}

	//insertion de l'heure de début quand on clique sur le bouton "commencer"
	function insertionAuto($jour, $heuredebut)
	{
		$envoiAutoHorairesDebut = SQLInsertWithParams(
		"INSERT INTO badge(date, heureDebut) VALUES (:date, :heureDebut)", 
		array("date"=>$jour, "heureDebut"=>$heuredebut)
		);
		echo json_encode($envoiAutoHorairesDebut);
	}

	//insertion de l'heure de fin quand on clique sur le bouton "finir"
	function insertionFinAuto($heurefin)
	{
		$envoiAutoHorairesFin = SQLEditWithParams(
		"UPDATE
			badge 
		SET 
			heureFin = :heureFin
		WHERE
			heureFin IS NULL",
		array("heureFin"=>$heurefin)
		);
		echo json_encode($envoiAutoHorairesFin);
	}	
?>
